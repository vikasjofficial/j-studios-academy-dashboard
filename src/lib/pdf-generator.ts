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

export async function fetchStudentData(studentId: string): Promise<StudentData | null> {
  try {
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();
    
    if (studentError) throw studentError;
    if (!student) return null;
    
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('*, course:courses(*)')
      .eq('student_id', studentId);
      
    if (enrollmentsError) throw enrollmentsError;
    
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
    
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .select('*, course:courses(name)')
      .eq('student_id', studentId);
      
    if (attendanceError) throw attendanceError;
    
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
      
    if (messagesError) throw messagesError;
    
    const { data: student_data, error: studentDataError } = await supabase
      .from("students")
      .select("id")
      .eq("id", studentId)
      .single();
      
    if (studentDataError) throw studentDataError;
    
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
      
      if (score >= 8) {
        strongTopics.push(topicWithGrade);
      } else if (score <= 7) {
        needsWorkTopics.push(topicWithGrade);
      }
    });
    
    const attendanceSummary = {
      present: attendance?.filter(a => a.status === 'present').length || 0,
      absent: attendance?.filter(a => a.status === 'absent').length || 0,
      late: attendance?.filter(a => a.status === 'late').length || 0,
      total: attendance?.length || 0
    };
    
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

export async function generateStudentPDF(
  studentData: StudentData, 
  selectedSections: string[] = ['profile', 'performance', 'tasks', 'byTopic']
): Promise<void> {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      compress: true 
    });
    
    const sectionTemplates: Record<string, (data: StudentData) => string> = {
      'profile': createProfileTemplate,
      'performance': createPerformanceTemplate,
      'tasks': createTasksTemplate,
      'byTopic': createTopicsBySemesterTemplate
    };
    
    let combinedHTML = `
      <div id="pdf-content" class="bg-[#1A1C23] text-white" style="font-family: Arial, sans-serif; max-width: 100%;">
        <!-- Header Section -->
        <div class="pdf-section text-center mb-3">
          <h1 class="text-xl font-bold text-blue-400 mb-1">J-Studios</h1>
          <h2 class="text-lg font-semibold mb-1">Student Profile Report</h2>
          <p class="text-xs text-gray-400 mb-2">Student: ${studentData.name} (${studentData.studentId})</p>
        </div>
    `;
    
    for (const sectionId of selectedSections) {
      if (sectionTemplates[sectionId]) {
        combinedHTML += sectionTemplates[sectionId](studentData);
      }
    }
    
    combinedHTML += `
        <div class="text-center mt-4 pt-2 border-t border-gray-700">
          <p class="text-xs text-gray-400">J-Studios Academic Portal</p>
          <p class="text-xs text-gray-400">Generated on ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;
    
    await addContentToPdf(pdf, combinedHTML);
    
    pdf.save(`${studentData.name}_profile.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

async function addContentToPdf(pdf: jsPDF, html: string): Promise<void> {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '790px';
  container.style.backgroundColor = '#1A1C23';
  container.style.color = 'white';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.padding = '0';
  container.style.margin = '0';
  container.style.border = 'none';
  container.innerHTML = html;
  document.body.appendChild(container);
  
  const canvasOptions = {
    scale: 1.5,
    useCORS: true,
    backgroundColor: '#1A1C23',
    allowTaint: true,
    letterRendering: true,
    onclone: (clonedDoc: Document) => {
      const styleElement = clonedDoc.createElement('style');
      styleElement.textContent = `
        * {
          font-family: Arial, sans-serif !important;
          box-sizing: border-box !important;
          font-size: 90% !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
        }
        .pdf-section {
          padding: 0 !important;
          margin: 0 !important;
          margin-bottom: 8px !important;
        }
        .text-2xl { font-size: 1.3rem !important; }
        .text-xl { font-size: 1.2rem !important; }
        .text-lg { font-size: 1.1rem !important; }
        .text-base { font-size: 0.9rem !important; }
        .text-sm { font-size: 0.8rem !important; }
        .text-xs { font-size: 0.7rem !important; }
        
        p, div {
          margin-bottom: 2px !important;
          margin-top: 2px !important;
        }
        td, th {
          padding: 2px 3px !important;
          font-size: 0.7rem !important;
        }
        table { 
          border-collapse: collapse !important;
        }
        .pdf-table-container {
          overflow: visible !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        
        #pdf-content {
          padding: 0 !important;
          margin: 0 !important;
          border: none !important;
        }
        
        h1, h2, h3, h4, h5, h6 {
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .bg-[#22242D], .bg-[#1D1F26], .bg-[#2A2D3A] {
          padding: 2px !important;
        }
      `;
      clonedDoc.head.appendChild(styleElement);
    }
  };
  
  const canvas = await html2canvas(container, canvasOptions);
  const imgData = canvas.toDataURL('image/png', 0.9);
  
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  const contentWidth = pdfWidth;
  const contentHeight = (canvas.height * contentWidth) / canvas.width;
  
  const maxContentHeight = pdfHeight;
  
  if (contentHeight <= maxContentHeight) {
    pdf.addImage(
      imgData,
      'PNG',
      0,
      0,
      contentWidth,
      contentHeight,
      undefined,
      'FAST'
    );
  } else {
    let heightLeft = contentHeight;
    let position = 0;
    
    pdf.addImage(
      imgData,
      'PNG',
      0,
      position,
      contentWidth,
      contentHeight,
      undefined,
      'FAST'
    );
    
    heightLeft -= maxContentHeight;
    position = -maxContentHeight;
    
    while (heightLeft > 0) {
      pdf.addPage();
      
      pdf.addImage(
        imgData,
        'PNG',
        0,
        position,
        contentWidth,
        contentHeight,
        undefined,
        'FAST'
      );
      
      heightLeft -= maxContentHeight;
      position -= maxContentHeight;
    }
  }
  
  document.body.removeChild(container);
}

function createProfileTemplate(data: StudentData): string {
  return `
    <div class="pdf-section mb-4 pdf-no-break">
      <div class="flex justify-center items-center mb-3">
        <div class="flex flex-col items-center p-2 bg-[#22242D] rounded-lg border border-gray-700 w-2/3">
          ${data.avatar 
            ? `<img src="${data.avatar}" alt="${data.name}" class="w-16 h-16 rounded-full border-2 border-blue-400 mb-2" />`
            : `<div class="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-xl font-bold text-white">${data.name?.charAt(0) || 'S'}</div>`
          }
          <h3 class="text-base font-bold mt-1">${data.name}</h3>
          <p class="text-xs text-gray-300">Student ID: ${data.studentId}</p>
          <p class="text-xs text-gray-300">Email: ${data.email}</p>
        </div>
      </div>

      <h3 class="text-sm font-bold border-b border-gray-700 pb-1 mb-2">Enrolled Courses</h3>
      <div class="grid grid-cols-2 gap-2">
        ${data.courses?.map(course => `
          <div class="p-2 bg-[#22242D] rounded-lg border border-gray-700">
            <h4 class="font-bold text-xs">${course.name}</h4>
            <p class="text-xs text-gray-400">Code: ${course.code}</p>
            <p class="text-xs">Instructor: ${course.instructor}</p>
            <p class="text-xs">${course.start_date} - ${course.end_date}</p>
          </div>
        `).join('') || '<p class="text-xs">No courses enrolled</p>'}
      </div>

      <h3 class="text-sm font-bold border-b border-gray-700 pb-1 mt-3 mb-2">Attendance Summary</h3>
      <div class="grid grid-cols-3 gap-2">
        <div class="p-2 bg-green-900/30 rounded-lg border border-green-800 text-center">
          <h4 class="font-bold text-xs text-green-400">Present</h4>
          <p class="text-base font-bold text-green-300">${data.attendanceSummary?.present || 0}</p>
          <p class="text-xs text-green-400">of ${data.attendanceSummary?.total || 0}</p>
        </div>
        
        <div class="p-2 bg-red-900/30 rounded-lg border border-red-800 text-center">
          <h4 class="font-bold text-xs text-red-400">Absent</h4>
          <p class="text-base font-bold text-red-300">${data.attendanceSummary?.absent || 0}</p>
          <p class="text-xs text-red-400">of ${data.attendanceSummary?.total || 0}</p>
        </div>
        
        <div class="p-2 bg-yellow-900/30 rounded-lg border border-yellow-800 text-center">
          <h4 class="font-bold text-xs text-yellow-400">Late</h4>
          <p class="text-base font-bold text-yellow-300">${data.attendanceSummary?.late || 0}</p>
          <p class="text-xs text-yellow-400">of ${data.attendanceSummary?.total || 0}</p>
        </div>
      </div>
    </div>
  `;
}

function createPerformanceTemplate(data: StudentData): string {
  return `
    <div class="pdf-section mb-4">
      <h3 class="text-sm font-bold border-b border-gray-700 pb-1 mb-2">Strong Topics (8-10)</h3>
      <div class="pdf-table-container overflow-hidden rounded-lg border border-gray-700">
        <table class="w-full text-xs" style="border-collapse: collapse;">
          <thead class="bg-[#2A2D3A]">
            <tr>
              <th class="p-1 text-left">Topic</th>
              <th class="p-1 text-left">Course</th>
              <th class="p-1 text-left">Score</th>
              <th class="p-1 text-left">Comments</th>
            </tr>
          </thead>
          <tbody>
            ${data.topics?.strong && data.topics.strong.length > 0 
              ? data.topics.strong.map((topic, i) => `
                <tr class="${i % 2 === 0 ? 'bg-[#22242D]' : 'bg-[#1D1F26]'}">
                  <td class="p-1 font-medium">${topic.topics?.name || 'Unnamed Topic'}</td>
                  <td class="p-1">${topic.course?.name || 'Unknown Course'}</td>
                  <td class="p-1">
                    <span class="px-1.5 py-0.5 rounded text-xs font-medium bg-green-900 text-green-300">
                      ${topic.score.toFixed(1)}
                    </span>
                  </td>
                  <td class="p-1">
                    ${topic.comment ? 
                      `<p class="text-xs italic">"${topic.comment.substring(0, 30)}${topic.comment.length > 30 ? '...' : ''}"</p>
                       <p class="text-xs text-gray-400">${topic.graded_by || 'Instructor'}</p>` 
                      : '<span class="text-xs text-gray-500">No comments</span>'}
                  </td>
                </tr>
              `).join('') 
              : '<tr><td colspan="4" class="p-1 text-center text-gray-400">No strong topics found yet.</td></tr>'
            }
          </tbody>
        </table>
      </div>

      <h3 class="text-sm font-bold border-b border-gray-700 pb-1 mt-3 mb-2">Needs Work Topics (1-7)</h3>
      <div class="pdf-table-container overflow-hidden rounded-lg border border-gray-700">
        <table class="w-full text-xs" style="border-collapse: collapse;">
          <thead class="bg-[#2A2D3A]">
            <tr>
              <th class="p-1 text-left">Topic</th>
              <th class="p-1 text-left">Course</th>
              <th class="p-1 text-left">Score</th>
              <th class="p-1 text-left">Comments</th>
            </tr>
          </thead>
          <tbody>
            ${data.topics?.needsWork && data.topics.needsWork.length > 0 
              ? data.topics.needsWork.map((topic, i) => `
                <tr class="${i % 2 === 0 ? 'bg-[#22242D]' : 'bg-[#1D1F26]'}">
                  <td class="p-1 font-medium">${topic.topics?.name || 'Unnamed Topic'}</td>
                  <td class="p-1">${topic.course?.name || 'Unknown Course'}</td>
                  <td class="p-1">
                    <span class="px-1.5 py-0.5 rounded text-xs font-medium 
                      ${topic.score <= 4 ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}">
                      ${topic.score.toFixed(1)}
                    </span>
                  </td>
                  <td class="p-1">
                    ${topic.comment ? 
                      `<p class="text-xs italic">"${topic.comment.substring(0, 30)}${topic.comment.length > 30 ? '...' : ''}"</p>
                       <p class="text-xs text-gray-400">${topic.graded_by || 'Instructor'}</p>` 
                      : '<span class="text-xs text-gray-500">No comments</span>'}
                  </td>
                </tr>
              `).join('') 
              : '<tr><td colspan="4" class="p-1 text-center text-gray-400">No struggling topics identified.</td></tr>'
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function createTasksTemplate(data: StudentData): string {
  return `
    <div class="pdf-section mb-4">
      <h3 class="text-sm font-bold border-b border-gray-700 pb-1 mb-2">Student Tasks</h3>
      <div class="pdf-table-container overflow-hidden rounded-lg border border-gray-700">
        <table class="w-full text-xs" style="border-collapse: collapse;">
          <thead class="bg-[#2A2D3A]">
            <tr>
              <th class="p-1 text-left" style="width: 30%;">Task</th>
              <th class="p-1 text-left" style="width: 15%;">Due Date</th>
              <th class="p-1 text-left" style="width: 35%;">Description</th>
              <th class="p-1 text-left" style="width: 20%;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.tasks && data.tasks.length > 0 
              ? data.tasks.map((task, i) => `
                <tr class="${i % 2 === 0 ? 'bg-[#22242D]' : 'bg-[#1D1F26]'}">
                  <td class="p-1 font-medium">${task.title}</td>
                  <td class="p-1">${task.due_date}</td>
                  <td class="p-1 text-xs">${task.description || 'No description'}</td>
                  <td class="p-1">
                    <span class="px-1.5 py-0.5 rounded text-xs font-medium 
                      ${task.status === 'completed' ? 'bg-green-900 text-green-300' : 
                        task.status === 'overdue' ? 'bg-red-900 text-red-300' : 
                        'bg-yellow-900 text-yellow-300'}">
                      ${task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </td>
                </tr>
              `).join('') 
              : '<tr><td colspan="4" class="p-1 text-center text-gray-400">No tasks assigned</td></tr>'
            }
          </tbody>
        </table>
      </div>

      <h3 class="text-sm font-bold border-b border-gray-700 pb-1 mt-3 mb-2">Task Status Overview</h3>
      <div class="grid grid-cols-3 gap-2">
        ${(() => {
          const completed = data.tasks?.filter(t => t.status === 'completed').length || 0;
          const pending = data.tasks?.filter(t => t.status === 'pending').length || 0;
          const overdue = data.tasks?.filter(t => t.status === 'overdue').length || 0;
          const total = data.tasks?.length || 0;
          
          return `
            <div class="p-2 bg-green-900/30 rounded-lg border border-green-800 text-center">
              <h4 class="font-bold text-xs text-green-400">Completed</h4>
              <p class="text-base font-bold text-green-300">${completed}</p>
              <p class="text-xs text-green-400">of ${total}</p>
            </div>
            
            <div class="p-2 bg-yellow-900/30 rounded-lg border border-yellow-800 text-center">
              <h4 class="font-bold text-xs text-yellow-400">Pending</h4>
              <p class="text-base font-bold text-yellow-300">${pending}</p>
              <p class="text-xs text-yellow-400">of ${total}</p>
            </div>
            
            <div class="p-2 bg-red-900/30 rounded-lg border border-red-800 text-center">
              <h4 class="font-bold text-xs text-red-400">Overdue</h4>
              <p class="text-base font-bold text-red-300">${overdue}</p>
              <p class="text-xs text-red-400">of ${total}</p>
            </div>
          `;
        })()}
      </div>
    </div>
  `;
}

function createTopicsBySemesterTemplate(data: StudentData): string {
  const semesterEntries = Object.entries(data.topics?.bySemester || {});
  
  if (semesterEntries.length === 0) {
    return `
      <div class="pdf-section mb-4">
        <h3 class="text-sm font-bold border-b border-gray-700 pb-1 mb-2">Topics Performance by Semester</h3>
        <p class="p-2 text-center text-gray-400">No semester data available for this student.</p>
      </div>
    `;
  }
  
  let semestersHtml = '';
  
  semesterEntries.forEach(([semesterKey, topics], index) => {
    const [semesterId, semesterName] = semesterKey.split('-');
    
    const displayName = semesterName.toLowerCase().includes('semester') 
      ? semesterName 
      : `Semester ${semesterName}`;
    
    semestersHtml += `
      <div class="mb-3">
        <h4 class="text-xs font-bold border-b border-gray-700 pb-1 mb-1">${displayName}</h4>
        <div class="pdf-table-container overflow-hidden rounded-lg border border-gray-700">
          <table class="w-full text-xs" style="border-collapse: collapse;">
            <thead class="bg-[#2A2D3A]">
              <tr>
                <th class="p-1 text-left" style="width: 30%;">Topic</th>
                <th class="p-1 text-left" style="width: 30%;">Course</th>
                <th class="p-1 text-left" style="width: 10%;">Score</th>
                <th class="p-1 text-left" style="width: 30%;">Comments</th>
              </tr>
            </thead>
            <tbody>
              ${topics.map((topic, i) => `
                <tr class="${i % 2 === 0 ? 'bg-[#22242D]' : 'bg-[#1D1F26]'}">
                  <td class="p-1 font-medium">${topic.topics?.name || 'Unnamed Topic'}</td>
                  <td class="p-1">${topic.course?.name || 'Unknown Course'}</td>
                  <td class="p-1">
                    <span class="px-1.5 py-0.5 rounded text-xs font-medium 
                      ${topic.score >= 8 ? 'bg-green-900 text-green-300' : 
                        topic.score <= 4 ? 'bg-red-900 text-red-300' : 
                        'bg-yellow-900 text-yellow-300'}">
                      ${topic.score.toFixed(1)}
                    </span>
                  </td>
                  <td class="p-1">
                    ${topic.comment ? 
                      `<p class="text-xs italic">"${topic.comment.substring(0, 30)}${topic.comment.length > 30 ? '...' : ''}"</p>
                       <p class="text-xs text-gray-400">${topic.graded_by || 'Instructor'}</p>` 
                      : '<span class="text-xs text-gray-500">No comments</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  });
  
  return `
    <div class="pdf-section mb-4">
      <h3 class="text-sm font-bold border-b border-gray-700 pb-1 mb-2">Topics Performance by Semester</h3>
      ${semestersHtml}
    </div>
  `;
}
