
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '@/integrations/supabase/client';

export interface StudentData {
  id: string;
  name: string;
  email: string;
  studentId: string;
  avatar?: string;
  courses?: any[];
  grades?: any[];
  attendance?: any[];
  messages?: any[];
  topics?: {
    bySemester: Record<string, any[]>;
    strong: any[];
    needsWork: any[];
  };
  attendanceSummary?: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };
}

// Fetch all student data needed for the PDF
export async function fetchStudentData(studentId: string): Promise<StudentData | null> {
  try {
    // Fetch student profile
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();
    
    if (studentError) throw studentError;
    if (!student) return null;
    
    // Fetch enrollments and courses
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('*, course:courses(*)')
      .eq('student_id', studentId);
      
    if (enrollmentsError) throw enrollmentsError;
    
    // Fetch grades with more details including comments
    const { data: grades, error: gradesError } = await supabase
      .from('grades')
      .select(`
        id, 
        score, 
        comment,
        graded_by,
        graded_at,
        topic_id,
        topics:topic_id(id, name, semester_id, semesters:semester_id(id, name)),
        course:course_id(id, name)
      `)
      .eq('student_id', studentId);
      
    if (gradesError) throw gradesError;
    
    // Fetch attendance
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .select('*, course:courses(name)')
      .eq('student_id', studentId);
      
    if (attendanceError) throw attendanceError;
    
    // Fetch messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
      
    if (messagesError) throw messagesError;
    
    // Process topics by semester and performance level
    const topicsBySemester: Record<string, any[]> = {};
    const strongTopics: any[] = [];
    const needsWorkTopics: any[] = [];
    
    grades?.forEach(grade => {
      const score = Number(grade.score);
      const semesterName = grade.topics?.semesters?.name || 'Unsorted';
      const semesterId = grade.topics?.semesters?.id || 'none';
      
      // Use a formatted key for proper display in the PDF
      // Format: semesterId-properSemesterName
      const key = `${semesterId}-${semesterName}`;
      
      if (!topicsBySemester[key]) {
        topicsBySemester[key] = [];
      }
      
      const topicWithGrade = {
        ...grade,
        score,
      };
      
      topicsBySemester[key].push(topicWithGrade);
      
      // Categorize by performance
      if (score >= 8) {
        strongTopics.push(topicWithGrade);
      } else if (score <= 7) {
        needsWorkTopics.push(topicWithGrade);
      }
    });
    
    // Calculate attendance summary
    const attendanceSummary = {
      present: attendance?.filter(a => a.status === 'present').length || 0,
      absent: attendance?.filter(a => a.status === 'absent').length || 0,
      late: attendance?.filter(a => a.status === 'late').length || 0,
      total: attendance?.length || 0
    };
    
    return {
      id: student.id,
      name: student.name,
      email: student.email,
      studentId: student.student_id,
      avatar: student.avatar_url,
      courses: enrollments?.map(e => e.course) || [],
      grades: grades || [],
      attendance: attendance || [],
      messages: messages || [],
      topics: {
        bySemester: topicsBySemester,
        strong: strongTopics,
        needsWork: needsWorkTopics
      },
      attendanceSummary
    };
  } catch (error) {
    console.error('Error fetching student data:', error);
    return null;
  }
}

// Generate PDF from HTML template
export async function generateStudentPDF(studentData: StudentData): Promise<void> {
  try {
    // Create a container for PDF content
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '750px'; // Further reduced width to ensure better fit
    container.style.padding = '10px'; // Add padding to prevent content being cut off at edges
    container.className = 'bg-background text-foreground';
    
    container.innerHTML = createPDFTemplate(studentData);
    document.body.appendChild(container);
    
    // Generate PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      hotfixes: ['px_scaling'],
      compress: true // Enable compression to improve quality
    });
    
    const canvasOptions = {
      scale: 1.2, // Adjusted for better quality without being too large
      useCORS: true,
      logging: false,
      backgroundColor: getComputedStyle(document.body).backgroundColor,
      allowTaint: true, // Allow processing of cross-origin images
      letterRendering: true // Improves text quality
    };
    
    // Capture the HTML as canvas
    const canvas = await html2canvas(container, canvasOptions);
    const imgData = canvas.toDataURL('image/png', 1.0); // Use highest quality
    
    // Add to PDF - adjust dimensions to fill the page width with appropriate margins
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Add small margins to prevent content from touching edges
    const margin = 20; // 20pt margin
    const contentWidth = pdfWidth - (margin * 2);
    
    // Calculate the aspect ratio to maintain proportions
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Use the width minus margins and scale height proportionally
    const scaledWidth = contentWidth;
    const scaledHeight = (imgHeight * scaledWidth) / imgWidth;
    
    // Add the image to the PDF, centered with margins
    pdf.addImage(imgData, 'PNG', margin, margin, scaledWidth, scaledHeight);
    
    // If content is longer than one page, add more pages
    let heightLeft = scaledHeight + (margin * 2) - pdfHeight;
    let position = margin - pdfHeight + margin;
    
    while (heightLeft > 0) {
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, scaledWidth, scaledHeight);
      heightLeft -= (pdfHeight - (margin * 2));
      position -= (pdfHeight - (margin * 2));
    }
    
    // Save PDF
    pdf.save(`${studentData.name}_profile.pdf`);
    
    // Clean up
    document.body.removeChild(container);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// Create HTML template for the PDF
function createPDFTemplate(data: StudentData): string {
  return `
    <div class="p-6 bg-background text-foreground" style="font-family: Arial, sans-serif; max-width: 100%;">
      <div class="text-center mb-6">
        <h1 class="text-2xl font-bold text-primary mb-1">J-Studios</h1>
        <h2 class="text-xl font-semibold mb-4">Student Profile Report</h2>
        
        <div class="flex justify-center items-center gap-4 mb-6">
          <div class="flex flex-col items-center">
            ${data.avatar 
              ? `<img src="${data.avatar}" alt="${data.name}" class="w-20 h-20 rounded-full border-4 border-primary mb-2" />`
              : `<div class="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-bold text-primary">${data.name?.charAt(0) || 'S'}</div>`
            }
            <h3 class="text-lg font-bold">${data.name}</h3>
            <p class="text-sm text-muted-foreground">${data.studentId}</p>
            <p class="text-sm text-muted-foreground">${data.email}</p>
          </div>
        </div>
      </div>

      <!-- Performance Overview Cards -->
      <div class="grid grid-cols-2 gap-3 mb-6">
        <!-- Strong Topics Card -->
        <div class="p-3 bg-card rounded-lg border border-border">
          <h3 class="text-md font-bold mb-2 flex items-center">
            <span class="inline-block w-4 h-4 mr-2 rounded-full bg-yellow-500"></span>
            Strong Topics (8-10)
          </h3>
          <div class="space-y-2">
            ${data.topics?.strong && data.topics.strong.length > 0 
              ? data.topics.strong.slice(0, 3).map(topic => `
                <div class="flex flex-col border-b pb-1">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-sm">${topic.topics?.name || 'Unnamed Topic'}</p>
                      <p class="text-xs text-muted-foreground">${topic.course?.name || 'Unknown Course'}</p>
                    </div>
                    <div class="flex items-center gap-1">
                      <span class="text-md font-bold text-green-600">${topic.score.toFixed(1)}</span>
                      <span class="text-xs bg-green-100 text-green-800 px-1 rounded-full">Strong</span>
                    </div>
                  </div>
                </div>
              `).join('') 
              : '<p class="text-xs text-muted-foreground">No strong topics found yet.</p>'
            }
            ${data.topics?.strong && data.topics.strong.length > 3 ? 
              `<p class="text-xs text-muted-foreground text-right">+${data.topics.strong.length - 3} more strong topics</p>` : ''}
          </div>
        </div>

        <!-- Needs Work Topics Card -->
        <div class="p-3 bg-card rounded-lg border border-border">
          <h3 class="text-md font-bold mb-2 flex items-center">
            <span class="inline-block w-4 h-4 mr-2 rounded-full bg-orange-500"></span>
            Needs Work (1-7)
          </h3>
          <div class="space-y-2">
            ${data.topics?.needsWork && data.topics.needsWork.length > 0 
              ? data.topics.needsWork.slice(0, 3).map(topic => `
                <div class="flex flex-col border-b pb-1">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-sm">${topic.topics?.name || 'Unnamed Topic'}</p>
                      <p class="text-xs text-muted-foreground">${topic.course?.name || 'Unknown Course'}</p>
                    </div>
                    <div class="flex items-center gap-1">
                      <span class="text-md font-bold text-orange-600">${topic.score.toFixed(1)}</span>
                      <span class="text-xs bg-orange-100 text-orange-800 px-1 rounded-full">Needs Work</span>
                    </div>
                  </div>
                </div>
              `).join('') 
              : '<p class="text-xs text-muted-foreground">No struggling topics identified.</p>'
            }
            ${data.topics?.needsWork && data.topics.needsWork.length > 3 ? 
              `<p class="text-xs text-muted-foreground text-right">+${data.topics.needsWork.length - 3} more topics</p>` : ''}
          </div>
        </div>
      </div>

      <!-- Courses Section -->
      <div class="mb-6">
        <h3 class="text-lg font-bold border-b border-border pb-1 mb-3">Enrolled Courses</h3>
        <div class="grid grid-cols-2 gap-3">
          ${data.courses?.slice(0, 4).map(course => `
            <div class="p-3 bg-card rounded-lg">
              <h4 class="font-bold text-md">${course.name}</h4>
              <p class="text-xs text-muted-foreground">Code: ${course.code}</p>
              <p class="text-xs">Instructor: ${course.instructor}</p>
              <p class="text-xs">${course.start_date} - ${course.end_date}</p>
            </div>
          `).join('') || '<p class="text-sm">No courses enrolled</p>'}
        </div>
        ${data.courses && data.courses.length > 4 ? 
          `<p class="text-xs text-muted-foreground text-right mt-1">+${data.courses.length - 4} more courses</p>` : ''}
      </div>

      <!-- Attendance Summary Section -->
      <div class="mb-6">
        <h3 class="text-lg font-bold border-b border-border pb-1 mb-3">Attendance Summary</h3>
        <div class="grid grid-cols-3 gap-3">
          <div class="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
            <h4 class="font-bold text-xs text-green-700">Present</h4>
            <p class="text-2xl font-bold text-green-600">${data.attendanceSummary?.present || 0}</p>
            <p class="text-xs text-green-600">of ${data.attendanceSummary?.total || 0}</p>
          </div>
          
          <div class="p-3 bg-red-50 rounded-lg border border-red-200 text-center">
            <h4 class="font-bold text-xs text-red-700">Absent</h4>
            <p class="text-2xl font-bold text-red-600">${data.attendanceSummary?.absent || 0}</p>
            <p class="text-xs text-red-600">of ${data.attendanceSummary?.total || 0}</p>
          </div>
          
          <div class="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
            <h4 class="font-bold text-xs text-yellow-700">Late</h4>
            <p class="text-2xl font-bold text-yellow-600">${data.attendanceSummary?.late || 0}</p>
            <p class="text-xs text-yellow-600">of ${data.attendanceSummary?.total || 0}</p>
          </div>
        </div>
      </div>

      <!-- Topic Scores by Semester Section -->
      <div class="mb-6">
        <h3 class="text-lg font-bold border-b border-border pb-1 mb-3">Topics Performance by Semester</h3>
        
        ${Object.entries(data.topics?.bySemester || {}).map(([semesterKey, topics]) => {
          // Extract semester name from the key, properly formatted
          const [semesterId, semesterName] = semesterKey.split('-');
          
          // Format the semester name to show "Semester X" instead of showing IDs
          const displayName = semesterName.toLowerCase().includes('semester') 
            ? semesterName  // Already has "Semester" in the name
            : `Semester ${semesterName}`; // Add "Semester" prefix
          
          return `
            <div class="mb-4">
              <h4 class="font-bold text-md mb-2">${displayName}</h4>
              <div class="overflow-hidden rounded-lg border border-border">
                <table class="w-full text-xs">
                  <thead class="bg-muted">
                    <tr>
                      <th class="p-1 text-left">Topic</th>
                      <th class="p-1 text-left">Course</th>
                      <th class="p-1 text-left">Score</th>
                      <th class="p-1 text-left">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${topics.slice(0, 4).map((topic, i) => `
                      <tr class="${i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}">
                        <td class="p-1 font-medium">${topic.topics?.name || 'Unnamed Topic'}</td>
                        <td class="p-1">${topic.course?.name || 'Unknown Course'}</td>
                        <td class="p-1">
                          <span class="px-1 py-0.5 rounded text-xs font-medium 
                            ${topic.score >= 8 ? 'bg-green-500/20 text-green-800' : 
                              topic.score <= 4 ? 'bg-red-500/20 text-red-800' : 
                              'bg-yellow-500/20 text-yellow-800'}">
                            ${topic.score.toFixed(1)}
                          </span>
                        </td>
                        <td class="p-1">
                          ${topic.comment ? 
                            `<p class="text-xs italic line-clamp-1">"${topic.comment}"</p>
                             <p class="text-xs text-muted-foreground">${topic.graded_by || 'Instructor'}</p>` 
                            : 'No comments'}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                ${topics.length > 4 ? 
                  `<p class="text-xs text-muted-foreground text-right p-1">+${topics.length - 4} more topics</p>` : ''}
              </div>
            </div>
          `;
        }).join('') || '<p class="text-center">No topic scores available</p>'}
      </div>

      <div class="text-center mt-8 pt-3 border-t border-border">
        <p class="text-xs text-muted-foreground">This report was generated on ${new Date().toLocaleString()} from J-Studios Academic Portal</p>
      </div>
    </div>
  `;
}
