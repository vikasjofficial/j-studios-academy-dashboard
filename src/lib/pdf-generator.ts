
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
    container.style.width = '1100px'; // A4 width at 150 DPI
    container.className = 'bg-background text-foreground';
    
    container.innerHTML = createPDFTemplate(studentData);
    document.body.appendChild(container);
    
    // Generate PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4',
      hotfixes: ['px_scaling']
    });
    
    const canvasOptions = {
      scale: 1.5, // Better quality
      useCORS: true,
      logging: false,
      backgroundColor: getComputedStyle(document.body).backgroundColor
    };
    
    // Capture the HTML as canvas
    const canvas = await html2canvas(container, canvasOptions);
    const imgData = canvas.toDataURL('image/png');
    
    // Add to PDF (A4 dimensions at 150 DPI)
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    // Add the image to the PDF
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * ratio, imgHeight * ratio);
    
    // If content is longer than one page, add more pages
    let heightLeft = imgHeight * ratio - pdfHeight;
    let position = -pdfHeight;
    
    while (heightLeft >= 0) {
      position = position - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth * ratio, imgHeight * ratio);
      heightLeft -= pdfHeight;
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
    <div class="p-8 bg-background text-foreground" style="font-family: Arial, sans-serif;">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary mb-2">J-Studios</h1>
        <h2 class="text-2xl font-semibold mb-6">Student Profile Report</h2>
        
        <div class="flex justify-center items-center gap-6 mb-8">
          <div class="flex flex-col items-center">
            ${data.avatar 
              ? `<img src="${data.avatar}" alt="${data.name}" class="w-24 h-24 rounded-full border-4 border-primary mb-2" />`
              : `<div class="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-4xl font-bold text-primary">${data.name?.charAt(0) || 'S'}</div>`
            }
            <h3 class="text-xl font-bold">${data.name}</h3>
            <p class="text-muted-foreground">${data.studentId}</p>
            <p class="text-muted-foreground">${data.email}</p>
          </div>
        </div>
      </div>

      <!-- Performance Overview Cards -->
      <div class="grid grid-cols-2 gap-4 mb-8">
        <!-- Strong Topics Card -->
        <div class="p-4 bg-card rounded-lg border border-border">
          <h3 class="text-lg font-bold mb-3 flex items-center">
            <span class="inline-block w-5 h-5 mr-2 rounded-full bg-yellow-500"></span>
            My Strong Topics (Score 8-10)
          </h3>
          <div class="space-y-3">
            ${data.topics?.strong && data.topics.strong.length > 0 
              ? data.topics.strong.map(topic => `
                <div class="flex flex-col border-b pb-2">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium">${topic.topics?.name || 'Unnamed Topic'}</p>
                      <p class="text-xs text-muted-foreground">${topic.course?.name || 'Unknown Course'}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-lg font-bold text-green-600">${topic.score.toFixed(1)}</span>
                      <span class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Strong</span>
                    </div>
                  </div>
                </div>
              `).join('') 
              : '<p class="text-muted-foreground">No strong topics found yet.</p>'
            }
          </div>
        </div>

        <!-- Needs Work Topics Card -->
        <div class="p-4 bg-card rounded-lg border border-border">
          <h3 class="text-lg font-bold mb-3 flex items-center">
            <span class="inline-block w-5 h-5 mr-2 rounded-full bg-orange-500"></span>
            Topics I Need to Work On (Score 1-7)
          </h3>
          <div class="space-y-3">
            ${data.topics?.needsWork && data.topics.needsWork.length > 0 
              ? data.topics.needsWork.map(topic => `
                <div class="flex flex-col border-b pb-2">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium">${topic.topics?.name || 'Unnamed Topic'}</p>
                      <p class="text-xs text-muted-foreground">${topic.course?.name || 'Unknown Course'}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-lg font-bold text-orange-600">${topic.score.toFixed(1)}</span>
                      <span class="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">Needs Work</span>
                    </div>
                  </div>
                </div>
              `).join('') 
              : '<p class="text-muted-foreground">No struggling topics identified.</p>'
            }
          </div>
        </div>
      </div>

      <!-- Courses Section -->
      <div class="mb-8">
        <h3 class="text-xl font-bold border-b border-border pb-2 mb-4">Enrolled Courses</h3>
        <div class="grid grid-cols-2 gap-4">
          ${data.courses?.map(course => `
            <div class="p-4 bg-card rounded-lg">
              <h4 class="font-bold text-lg">${course.name}</h4>
              <p class="text-sm text-muted-foreground">Code: ${course.code}</p>
              <p class="text-sm">Instructor: ${course.instructor}</p>
              <p class="text-sm">${course.start_date} - ${course.end_date}</p>
            </div>
          `).join('') || 'No courses enrolled'}
        </div>
      </div>

      <!-- Attendance Summary Section -->
      <div class="mb-8">
        <h3 class="text-xl font-bold border-b border-border pb-2 mb-4">Attendance Summary</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
            <h4 class="font-bold text-green-700">Present</h4>
            <p class="text-3xl font-bold text-green-600">${data.attendanceSummary?.present || 0}</p>
            <p class="text-sm text-green-600">out of ${data.attendanceSummary?.total || 0} classes</p>
          </div>
          
          <div class="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
            <h4 class="font-bold text-red-700">Absent</h4>
            <p class="text-3xl font-bold text-red-600">${data.attendanceSummary?.absent || 0}</p>
            <p class="text-sm text-red-600">out of ${data.attendanceSummary?.total || 0} classes</p>
          </div>
          
          <div class="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
            <h4 class="font-bold text-yellow-700">Late</h4>
            <p class="text-3xl font-bold text-yellow-600">${data.attendanceSummary?.late || 0}</p>
            <p class="text-sm text-yellow-600">out of ${data.attendanceSummary?.total || 0} classes</p>
          </div>
        </div>
      </div>

      <!-- Topic Scores by Semester Section -->
      <div class="mb-8">
        <h3 class="text-xl font-bold border-b border-border pb-2 mb-4">Topics Performance by Semester</h3>
        
        ${Object.entries(data.topics?.bySemester || {}).map(([semesterKey, topics]) => {
          const [, semesterName] = semesterKey.split('-');
          return `
            <div class="mb-6">
              <h4 class="font-bold text-lg mb-3">${semesterName}</h4>
              <div class="overflow-hidden rounded-lg border border-border">
                <table class="w-full text-sm">
                  <thead class="bg-muted">
                    <tr>
                      <th class="p-2 text-left">Topic</th>
                      <th class="p-2 text-left">Course</th>
                      <th class="p-2 text-left">Score</th>
                      <th class="p-2 text-left">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${topics.map((topic, i) => `
                      <tr class="${i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}">
                        <td class="p-2 font-medium">${topic.topics?.name || 'Unnamed Topic'}</td>
                        <td class="p-2">${topic.course?.name || 'Unknown Course'}</td>
                        <td class="p-2">
                          <span class="px-2 py-1 rounded text-xs font-medium 
                            ${topic.score >= 8 ? 'bg-green-500/20 text-green-800' : 
                              topic.score <= 4 ? 'bg-red-500/20 text-red-800' : 
                              'bg-yellow-500/20 text-yellow-800'}">
                            ${topic.score.toFixed(1)}
                          </span>
                        </td>
                        <td class="p-2">
                          ${topic.comment ? 
                            `<p class="text-xs italic">"${topic.comment}"</p>
                             <p class="text-xs text-muted-foreground mt-1">— ${topic.graded_by || 'Instructor'}</p>` 
                            : 'No comments'}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `;
        }).join('') || '<p class="text-center">No topic scores available</p>'}
      </div>

      <div class="text-center mt-12 pt-6 border-t border-border">
        <p class="text-sm text-muted-foreground">This report was generated on ${new Date().toLocaleString()} from J-Studios Academic Portal</p>
      </div>
    </div>
  `;
}
