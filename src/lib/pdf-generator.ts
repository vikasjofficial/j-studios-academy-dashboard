
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
  tasks?: any[];
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
    
    // Fetch student tasks
    const { data: student_data, error: studentDataError } = await supabase
      .from("students")
      .select("id")
      .eq("id", studentId)
      .single();
      
    if (studentDataError) throw studentDataError;
    
    // Use type assertion to handle tables that might not be in the schema type definitions
    const { data: tasks, error: tasksError } = await supabase
      .from("student_tasks" as any)
      .select(`
        id,
        tasks:task_id(id, title, description),
        due_date,
        status
      `)
      .eq("student_id", student_data.id)
      .order("due_date", { ascending: true });
      
    if (tasksError) throw tasksError;
    
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
    
    // Format tasks for display
    const formattedTasks = tasks ? (tasks as any[]).map(item => ({
      id: item.id,
      title: item.tasks.title,
      description: item.tasks.description,
      due_date: new Date(item.due_date).toLocaleDateString(),
      status: item.status
    })) : [];
    
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
      tasks: formattedTasks || [],
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
    // Create a container for PDF content with improved sizing for better pagination
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '800px'; // Increased width for better content flow
    container.style.padding = '30px'; // Increased padding
    container.className = 'bg-background text-foreground pdf-container';
    
    container.innerHTML = createPDFTemplate(studentData);
    document.body.appendChild(container);
    
    // Generate PDF with improved settings
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      hotfixes: ['px_scaling'],
      compress: true 
    });
    
    const canvasOptions = {
      scale: 1.2, // Decreased scale slightly to prevent overflow
      useCORS: true,
      logging: false,
      backgroundColor: '#1A1C23', // Explicit background color
      allowTaint: true,
      letterRendering: true,
      onclone: (clonedDoc: Document) => {
        // Apply any additional styles to the cloned document
        const styleElement = clonedDoc.createElement('style');
        styleElement.textContent = `
          .pdf-container * {
            font-family: Arial, sans-serif !important;
            box-sizing: border-box !important;
          }
          table { page-break-inside: avoid; }
          .pdf-section { page-break-inside: avoid; margin-bottom: 15px; }
          .pdf-page-break { page-break-after: always; }
          .pdf-card { margin-bottom: 10px; }
        `;
        clonedDoc.head.appendChild(styleElement);
        
        const elem = clonedDoc.querySelector('#pdf-content');
        if (elem) {
          elem.classList.add('rendered');
        }
      }
    };
    
    // Capture the HTML as canvas
    const canvas = await html2canvas(container, canvasOptions);
    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Calculate dimensions and pagination
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 30; // Increased margin
    const contentWidth = pdfWidth - (margin * 2);
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Calculate the height ratio
    const heightRatio = pdfHeight / pdfWidth;
    const contentHeight = imgWidth * heightRatio;
    
    // Determine how many pages we need
    const pageCount = Math.ceil(imgHeight / contentHeight);
    
    // Generate multiple pages with proper content
    for (let i = 0; i < pageCount; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      
      // Calculate source position and height for this slice
      const sourceY = i * contentHeight;
      const sliceHeight = Math.min(contentHeight, imgHeight - sourceY);
      
      // Add image slice for this page
      pdf.addImage(
        imgData,
        'PNG',
        margin,
        margin,
        contentWidth,
        (sliceHeight * contentWidth) / imgWidth,
        '',
        'FAST',
        0
      );
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
    <div id="pdf-content" class="bg-[#1A1C23] text-white" style="font-family: Arial, sans-serif; max-width: 100%;">
      <!-- Header Section -->
      <div class="pdf-section text-center mb-4 pt-4">
        <h1 class="text-xl font-bold text-blue-400 mb-1">J-Studios</h1>
        <h2 class="text-lg font-semibold mb-2">Student Profile Report</h2>
        
        <div class="flex justify-center items-center gap-4 mb-2">
          <div class="flex flex-col items-center">
            ${data.avatar 
              ? `<img src="${data.avatar}" alt="${data.name}" class="w-12 h-12 rounded-full border-2 border-blue-400 mb-1" />`
              : `<div class="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-lg font-bold text-white">${data.name?.charAt(0) || 'S'}</div>`
            }
            <h3 class="text-base font-bold">${data.name}</h3>
            <p class="text-xs text-gray-400">${data.studentId}</p>
            <p class="text-xs text-gray-400">${data.email}</p>
          </div>
        </div>
      </div>

      <!-- Performance Overview Cards -->
      <div class="pdf-section grid grid-cols-2 gap-2 mb-3">
        <!-- Strong Topics Card -->
        <div class="pdf-card p-2 bg-[#22242D] rounded-lg border border-gray-700">
          <h3 class="text-xs font-bold mb-1 flex items-center">
            <span class="inline-block w-2 h-2 mr-1 rounded-full bg-yellow-500"></span>
            Strong Topics (8-10)
          </h3>
          <div class="space-y-1">
            ${data.topics?.strong && data.topics.strong.length > 0 
              ? data.topics.strong.slice(0, 5).map(topic => `
                <div class="flex flex-col border-b border-gray-700 pb-1">
                  <div class="flex items-center justify-between">
                    <div class="max-w-[65%]">
                      <p class="font-medium text-xs truncate">${topic.topics?.name || 'Unnamed Topic'}</p>
                      <p class="text-[9px] text-gray-400 truncate">${topic.course?.name || 'Unknown Course'}</p>
                    </div>
                    <div class="flex items-center gap-1">
                      <span class="text-xs font-bold text-green-400">${topic.score.toFixed(1)}</span>
                      <span class="text-[8px] bg-green-900 text-green-300 px-1 rounded-full">Strong</span>
                    </div>
                  </div>
                </div>
              `).join('') 
              : '<p class="text-xs text-gray-400">No strong topics found yet.</p>'
            }
          </div>
        </div>

        <!-- Needs Work Topics Card -->
        <div class="pdf-card p-2 bg-[#22242D] rounded-lg border border-gray-700">
          <h3 class="text-xs font-bold mb-1 flex items-center">
            <span class="inline-block w-2 h-2 mr-1 rounded-full bg-orange-500"></span>
            Needs Work (1-7)
          </h3>
          <div class="space-y-1">
            ${data.topics?.needsWork && data.topics.needsWork.length > 0 
              ? data.topics.needsWork.slice(0, 5).map(topic => `
                <div class="flex flex-col border-b border-gray-700 pb-1">
                  <div class="flex items-center justify-between">
                    <div class="max-w-[65%]">
                      <p class="font-medium text-xs truncate">${topic.topics?.name || 'Unnamed Topic'}</p>
                      <p class="text-[9px] text-gray-400 truncate">${topic.course?.name || 'Unknown Course'}</p>
                    </div>
                    <div class="flex items-center gap-1">
                      <span class="text-xs font-bold text-orange-400">${topic.score.toFixed(1)}</span>
                      <span class="text-[8px] bg-orange-900 text-orange-300 px-1 rounded-full">Needs Work</span>
                    </div>
                  </div>
                </div>
              `).join('') 
              : '<p class="text-xs text-gray-400">No struggling topics identified.</p>'
            }
          </div>
        </div>
      </div>

      <!-- Courses Section -->
      <div class="pdf-section mb-3">
        <h3 class="text-sm font-bold border-b border-gray-700 pb-1 mb-1">Enrolled Courses</h3>
        <div class="grid grid-cols-2 gap-2">
          ${data.courses?.map(course => `
            <div class="p-1 bg-[#22242D] rounded-lg border border-gray-700">
              <h4 class="font-bold text-xs">${course.name}</h4>
              <p class="text-[9px] text-gray-400">Code: ${course.code}</p>
              <p class="text-[9px]">Instructor: ${course.instructor}</p>
              <p class="text-[9px]">${course.start_date} - ${course.end_date}</p>
            </div>
          `).join('') || '<p class="text-xs">No courses enrolled</p>'}
        </div>
      </div>

      <!-- Student Tasks Section -->
      <div class="pdf-section mb-3">
        <h3 class="text-sm font-bold border-b border-gray-700 pb-1 mb-1">Student Tasks</h3>
        <div class="overflow-hidden rounded-lg border border-gray-700">
          <table class="w-full text-xs" style="border-collapse: collapse;">
            <thead class="bg-[#2A2D3A]">
              <tr>
                <th class="p-1 text-left" style="width: 40%;">Task</th>
                <th class="p-1 text-left" style="width: 30%;">Due Date</th>
                <th class="p-1 text-left" style="width: 30%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.tasks && data.tasks.length > 0 
                ? data.tasks.map((task, i) => `
                  <tr class="${i % 2 === 0 ? 'bg-[#22242D]' : 'bg-[#1D1F26]'}">
                    <td class="p-1 font-medium text-[9px]">${task.title}</td>
                    <td class="p-1 text-[9px]">${task.due_date}</td>
                    <td class="p-1">
                      <span class="px-1 py-0.5 rounded text-[8px] font-medium 
                        ${task.status === 'completed' ? 'bg-green-900 text-green-300' : 
                          task.status === 'overdue' ? 'bg-red-900 text-red-300' : 
                          'bg-yellow-900 text-yellow-300'}">
                        ${task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                `).join('') 
                : '<tr><td colspan="3" class="p-1 text-center text-gray-400">No tasks assigned</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Attendance Summary Section -->
      <div class="pdf-section mb-3">
        <h3 class="text-sm font-bold border-b border-gray-700 pb-1 mb-1">Attendance Summary</h3>
        <div class="grid grid-cols-3 gap-2">
          <div class="p-1 bg-green-900/30 rounded-lg border border-green-800 text-center">
            <h4 class="font-bold text-xs text-green-400">Present</h4>
            <p class="text-lg font-bold text-green-300">${data.attendanceSummary?.present || 0}</p>
            <p class="text-[9px] text-green-400">of ${data.attendanceSummary?.total || 0}</p>
          </div>
          
          <div class="p-1 bg-red-900/30 rounded-lg border border-red-800 text-center">
            <h4 class="font-bold text-xs text-red-400">Absent</h4>
            <p class="text-lg font-bold text-red-300">${data.attendanceSummary?.absent || 0}</p>
            <p class="text-[9px] text-red-400">of ${data.attendanceSummary?.total || 0}</p>
          </div>
          
          <div class="p-1 bg-yellow-900/30 rounded-lg border border-yellow-800 text-center">
            <h4 class="font-bold text-xs text-yellow-400">Late</h4>
            <p class="text-lg font-bold text-yellow-300">${data.attendanceSummary?.late || 0}</p>
            <p class="text-[9px] text-yellow-400">of ${data.attendanceSummary?.total || 0}</p>
          </div>
        </div>
      </div>

      <div class="pdf-page-break"></div>

      <!-- Topic Scores by Semester Section - This will start on a new page -->
      <div class="pdf-section mb-3">
        <h3 class="text-sm font-bold border-b border-gray-700 pb-1 mb-1">Topics Performance by Semester</h3>
        
        ${Object.entries(data.topics?.bySemester || {}).map(([semesterKey, topics], semIndex) => {
          // Extract semester name from the key
          const [semesterId, semesterName] = semesterKey.split('-');
          
          // Format the semester name
          const displayName = semesterName.toLowerCase().includes('semester') 
            ? semesterName 
            : `Semester ${semesterName}`;
          
          // Add a page break after every 2 semesters (except for the first page)
          const addPageBreak = semIndex > 0 && semIndex % 2 === 0 ? 'pdf-page-break' : '';
          
          return `
            <div class="mb-2 ${addPageBreak}">
              <h4 class="font-bold text-xs mb-1">${displayName}</h4>
              <div class="overflow-hidden rounded-lg border border-gray-700">
                <table class="w-full text-[9px]" style="border-collapse: collapse;">
                  <thead class="bg-[#2A2D3A]">
                    <tr>
                      <th class="p-1 text-left" style="width: 25%;">Topic</th>
                      <th class="p-1 text-left" style="width: 25%;">Course</th>
                      <th class="p-1 text-left" style="width: 10%;">Score</th>
                      <th class="p-1 text-left" style="width: 40%;">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${topics.map((topic, i) => `
                      <tr class="${i % 2 === 0 ? 'bg-[#22242D]' : 'bg-[#1D1F26]'}">
                        <td class="p-1 font-medium text-[8px]">${topic.topics?.name || 'Unnamed Topic'}</td>
                        <td class="p-1 text-[8px]">${topic.course?.name || 'Unknown Course'}</td>
                        <td class="p-1">
                          <span class="px-1 py-0 rounded text-[8px] font-medium 
                            ${topic.score >= 8 ? 'bg-green-900 text-green-300' : 
                              topic.score <= 4 ? 'bg-red-900 text-red-300' : 
                              'bg-yellow-900 text-yellow-300'}">
                            ${topic.score.toFixed(1)}
                          </span>
                        </td>
                        <td class="p-1">
                          ${topic.comment ? 
                            `<p class="text-[8px] italic line-clamp-1">"${topic.comment.substring(0, 40)}${topic.comment.length > 40 ? '...' : ''}"</p>
                             <p class="text-[7px] text-gray-400">${topic.graded_by || 'Instructor'}</p>` 
                            : '<span class="text-[8px] text-gray-500">No comments</span>'}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `;
        }).join('') || '<p class="text-center text-xs">No topic scores available</p>'}
      </div>

      <div class="text-center mt-3 pt-2 border-t border-gray-700">
        <p class="text-[8px] text-gray-400">This report was generated on ${new Date().toLocaleString()} from J-Studios Academic Portal</p>
      </div>
    </div>
  `;
}
