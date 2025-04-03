
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
export async function generateStudentPDF(
  studentData: StudentData, 
  selectedSections: string[] = ['profile', 'performance', 'tasks', 'byTopic']
): Promise<void> {
  try {
    // Initialize PDF document with compression for smaller file size
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      compress: true 
    });
    
    // Map section IDs to template functions
    const sectionTemplates: Record<string, (data: StudentData) => string> = {
      'profile': createPage1Template,
      'performance': createPage2Template,
      'tasks': createPage3Template,
      'byTopic': createPage4Template
    };
    
    // Create page templates for selected sections only
    const pages: string[] = [];
    
    // Always include profile as the first page if selected
    if (selectedSections.includes('profile')) {
      pages.push(createPage1Template(studentData));
    }
    
    // Add other selected sections in order
    for (const sectionId of ['performance', 'tasks', 'byTopic']) {
      if (selectedSections.includes(sectionId)) {
        pages.push(sectionTemplates[sectionId](studentData));
      }
    }
    
    // Process each page
    for (let i = 0; i < pages.length; i++) {
      // Add a new page if not the first page
      if (i > 0) {
        pdf.addPage();
      }
      
      await addPageContentToPdf(pdf, pages[i], i);
    }
    
    // Save PDF
    pdf.save(`${studentData.name}_profile.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// Improved function to add page content to PDF with better pagination
async function addPageContentToPdf(pdf: jsPDF, pageHtml: string, pageIndex: number): Promise<void> {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '800px'; // Fixed width for consistent rendering
  container.style.backgroundColor = '#1A1C23';
  container.style.color = 'white';
  container.style.fontFamily = 'Arial, sans-serif';
  container.innerHTML = pageHtml;
  document.body.appendChild(container);
  
  // Enhanced canvas options for better rendering
  const canvasOptions = {
    scale: 1.5, // Higher scale for better quality
    useCORS: true,
    backgroundColor: '#1A1C23',
    allowTaint: true,
    letterRendering: true,
    onclone: (clonedDoc: Document) => {
      // Apply additional styles to the cloned document for better pagination
      const styleElement = clonedDoc.createElement('style');
      styleElement.textContent = `
        * {
          font-family: Arial, sans-serif !important;
          box-sizing: border-box !important;
        }
        table { 
          page-break-inside: avoid; 
          break-inside: avoid;
        }
        .pdf-section { 
          margin-bottom: 15px; 
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .pdf-table-container {
          overflow: visible !important;
        }
        .pdf-no-break {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        p, div {
          margin-bottom: 2px;
          margin-top: 2px;
        }
        td, th {
          padding: 2px 4px;
        }
      `;
      clonedDoc.head.appendChild(styleElement);
    }
  };
  
  // Capture the HTML as canvas
  const canvas = await html2canvas(container, canvasOptions);
  const imgData = canvas.toDataURL('image/png', 1.0);
  
  // Calculate dimensions for the PDF
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 40;
  
  // Scale the image to fit the page width with margins
  const contentWidth = pdfWidth - (margin * 2);
  const contentHeight = (canvas.height * contentWidth) / canvas.width;
  
  // If content is taller than page, we need to split it across multiple pages
  const maxContentHeight = pdfHeight - (margin * 2);
  
  if (contentHeight <= maxContentHeight) {
    // Content fits in a single page
    pdf.addImage(
      imgData,
      'PNG',
      margin,
      margin,
      contentWidth,
      contentHeight,
      undefined,
      'FAST'
    );
  } else {
    // Content needs to be split across multiple pages
    let heightLeft = contentHeight;
    let position = 0;
    let isFirstPage = true;
    
    // Add image to the first page
    pdf.addImage(
      imgData,
      'PNG',
      margin,
      isFirstPage ? margin : 0,
      contentWidth,
      contentHeight,
      undefined,
      'FAST'
    );
    
    heightLeft -= maxContentHeight;
    position = -maxContentHeight;
    
    // Add additional pages for overflowing content
    while (heightLeft > 0) {
      position -= maxContentHeight;
      pdf.addPage();
      pdf.addImage(
        imgData,
        'PNG',
        margin,
        position + (isFirstPage ? margin : 0),
        contentWidth,
        contentHeight,
        undefined,
        'FAST'
      );
      heightLeft -= maxContentHeight;
    }
  }
  
  // Clean up
  document.body.removeChild(container);
}

// Page 1: Title, Profile & Basic Info
function createPage1Template(data: StudentData): string {
  return `
    <div id="pdf-content" class="bg-[#1A1C23] text-white pdf-no-break" style="font-family: Arial, sans-serif; max-width: 100%;">
      <!-- Header Section -->
      <div class="pdf-section text-center mb-6 pt-4">
        <h1 class="text-2xl font-bold text-blue-400 mb-2">J-Studios</h1>
        <h2 class="text-xl font-semibold mb-3">Student Profile Report</h2>
        
        <div class="flex justify-center items-center mb-6 pdf-no-break">
          <div class="flex flex-col items-center p-4 bg-[#22242D] rounded-lg border border-gray-700 w-2/3">
            ${data.avatar 
              ? `<img src="${data.avatar}" alt="${data.name}" class="w-20 h-20 rounded-full border-2 border-blue-400 mb-2" />`
              : `<div class="w-20 h-20 rounded-full bg-blue-700 flex items-center justify-center text-2xl font-bold text-white">${data.name?.charAt(0) || 'S'}</div>`
            }
            <h3 class="text-lg font-bold mt-2">${data.name}</h3>
            <p class="text-sm text-gray-300">Student ID: ${data.studentId}</p>
            <p class="text-sm text-gray-300">Email: ${data.email}</p>
          </div>
        </div>
      </div>

      <!-- Courses Section -->
      <div class="pdf-section mb-6 pdf-no-break">
        <h3 class="text-base font-bold border-b border-gray-700 pb-1 mb-3">Enrolled Courses</h3>
        <div class="grid grid-cols-2 gap-3">
          ${data.courses?.map(course => `
            <div class="p-3 bg-[#22242D] rounded-lg border border-gray-700">
              <h4 class="font-bold text-sm">${course.name}</h4>
              <p class="text-xs text-gray-400">Code: ${course.code}</p>
              <p class="text-xs">Instructor: ${course.instructor}</p>
              <p class="text-xs">${course.start_date} - ${course.end_date}</p>
            </div>
          `).join('') || '<p class="text-sm">No courses enrolled</p>'}
        </div>
      </div>

      <!-- Attendance Summary Section -->
      <div class="pdf-section mb-4 pdf-no-break">
        <h3 class="text-base font-bold border-b border-gray-700 pb-1 mb-3">Attendance Summary</h3>
        <div class="grid grid-cols-3 gap-3">
          <div class="p-3 bg-green-900/30 rounded-lg border border-green-800 text-center">
            <h4 class="font-bold text-sm text-green-400">Present</h4>
            <p class="text-xl font-bold text-green-300">${data.attendanceSummary?.present || 0}</p>
            <p class="text-xs text-green-400">of ${data.attendanceSummary?.total || 0}</p>
          </div>
          
          <div class="p-3 bg-red-900/30 rounded-lg border border-red-800 text-center">
            <h4 class="font-bold text-sm text-red-400">Absent</h4>
            <p class="text-xl font-bold text-red-300">${data.attendanceSummary?.absent || 0}</p>
            <p class="text-xs text-red-400">of ${data.attendanceSummary?.total || 0}</p>
          </div>
          
          <div class="p-3 bg-yellow-900/30 rounded-lg border border-yellow-800 text-center">
            <h4 class="font-bold text-sm text-yellow-400">Late</h4>
            <p class="text-xl font-bold text-yellow-300">${data.attendanceSummary?.late || 0}</p>
            <p class="text-xs text-yellow-400">of ${data.attendanceSummary?.total || 0}</p>
          </div>
        </div>
      </div>

      <div class="text-center mt-6 pt-2 border-t border-gray-700">
        <p class="text-xs text-gray-400">J-Studios Academic Portal - Page 1 of 4+</p>
        <p class="text-xs text-gray-400">Generated on ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;
}

// Page 2: Strong Topics and Needs Work Topics
function createPage2Template(data: StudentData): string {
  return `
    <div id="pdf-content" class="bg-[#1A1C23] text-white" style="font-family: Arial, sans-serif; max-width: 100%;">
      <!-- Page Header -->
      <div class="pdf-section text-center mb-4 pt-2">
        <h2 class="text-xl font-semibold mb-1">Performance Overview</h2>
        <p class="text-sm text-gray-400 mb-2">Student: ${data.name} (${data.studentId})</p>
      </div>

      <!-- Strong Topics Section -->
      <div class="pdf-section mb-5 pdf-no-break">
        <h3 class="text-base font-bold mb-2 flex items-center">
          <span class="inline-block w-3 h-3 mr-2 rounded-full bg-green-500"></span>
          Strong Topics (8-10)
        </h3>
        <div class="pdf-table-container overflow-hidden rounded-lg border border-gray-700">
          <table class="w-full text-xs" style="border-collapse: collapse;">
            <thead class="bg-[#2A2D3A]">
              <tr>
                <th class="p-2 text-left">Topic</th>
                <th class="p-2 text-left">Course</th>
                <th class="p-2 text-left">Score</th>
                <th class="p-2 text-left">Comments</th>
              </tr>
            </thead>
            <tbody>
              ${data.topics?.strong && data.topics.strong.length > 0 
                ? data.topics.strong.map((topic, i) => `
                  <tr class="${i % 2 === 0 ? 'bg-[#22242D]' : 'bg-[#1D1F26]'}">
                    <td class="p-2 font-medium">${topic.topics?.name || 'Unnamed Topic'}</td>
                    <td class="p-2">${topic.course?.name || 'Unknown Course'}</td>
                    <td class="p-2">
                      <span class="px-2 py-1 rounded text-xs font-medium bg-green-900 text-green-300">
                        ${topic.score.toFixed(1)}
                      </span>
                    </td>
                    <td class="p-2">
                      ${topic.comment ? 
                        `<p class="text-xs italic">"${topic.comment.substring(0, 40)}${topic.comment.length > 40 ? '...' : ''}"</p>
                         <p class="text-xs text-gray-400">${topic.graded_by || 'Instructor'}</p>` 
                        : '<span class="text-xs text-gray-500">No comments</span>'}
                    </td>
                  </tr>
                `).join('') 
                : '<tr><td colspan="4" class="p-2 text-center text-gray-400">No strong topics found yet.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Needs Work Topics Section -->
      <div class="pdf-section mb-4 pdf-no-break">
        <h3 class="text-base font-bold mb-2 flex items-center">
          <span class="inline-block w-3 h-3 mr-2 rounded-full bg-orange-500"></span>
          Needs Work Topics (1-7)
        </h3>
        <div class="pdf-table-container overflow-hidden rounded-lg border border-gray-700">
          <table class="w-full text-xs" style="border-collapse: collapse;">
            <thead class="bg-[#2A2D3A]">
              <tr>
                <th class="p-2 text-left">Topic</th>
                <th class="p-2 text-left">Course</th>
                <th class="p-2 text-left">Score</th>
                <th class="p-2 text-left">Comments</th>
              </tr>
            </thead>
            <tbody>
              ${data.topics?.needsWork && data.topics.needsWork.length > 0 
                ? data.topics.needsWork.map((topic, i) => `
                  <tr class="${i % 2 === 0 ? 'bg-[#22242D]' : 'bg-[#1D1F26]'}">
                    <td class="p-2 font-medium">${topic.topics?.name || 'Unnamed Topic'}</td>
                    <td class="p-2">${topic.course?.name || 'Unknown Course'}</td>
                    <td class="p-2">
                      <span class="px-2 py-1 rounded text-xs font-medium 
                        ${topic.score <= 4 ? 'bg-red-900 text-red-300' : 'bg-yellow-900 text-yellow-300'}">
                        ${topic.score.toFixed(1)}
                      </span>
                    </td>
                    <td class="p-2">
                      ${topic.comment ? 
                        `<p class="text-xs italic">"${topic.comment.substring(0, 40)}${topic.comment.length > 40 ? '...' : ''}"</p>
                         <p class="text-xs text-gray-400">${topic.graded_by || 'Instructor'}</p>` 
                        : '<span class="text-xs text-gray-500">No comments</span>'}
                    </td>
                  </tr>
                `).join('') 
                : '<tr><td colspan="4" class="p-2 text-center text-gray-400">No struggling topics identified.</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="text-center mt-6 pt-2 border-t border-gray-700">
        <p class="text-xs text-gray-400">J-Studios Academic Portal - Page 2 of 4+</p>
        <p class="text-xs text-gray-400">Generated on ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;
}

// Page 3: Student Tasks
function createPage3Template(data: StudentData): string {
  return `
    <div id="pdf-content" class="bg-[#1A1C23] text-white" style="font-family: Arial, sans-serif; max-width: 100%;">
      <!-- Page Header -->
      <div class="pdf-section text-center mb-4 pt-2">
        <h2 class="text-xl font-semibold mb-1">Student Tasks</h2>
        <p class="text-sm text-gray-400 mb-2">Student: ${data.name} (${data.studentId})</p>
      </div>

      <!-- Student Tasks Section -->
      <div class="pdf-section mb-5 pdf-no-break">
        <div class="pdf-table-container overflow-hidden rounded-lg border border-gray-700">
          <table class="w-full text-xs" style="border-collapse: collapse;">
            <thead class="bg-[#2A2D3A]">
              <tr>
                <th class="p-2 text-left" style="width: 30%;">Task</th>
                <th class="p-2 text-left" style="width: 15%;">Due Date</th>
                <th class="p-2 text-left" style="width: 35%;">Description</th>
                <th class="p-2 text-left" style="width: 20%;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.tasks && data.tasks.length > 0 
                ? data.tasks.map((task, i) => `
                  <tr class="${i % 2 === 0 ? 'bg-[#22242D]' : 'bg-[#1D1F26]'}">
                    <td class="p-2 font-medium">${task.title}</td>
                    <td class="p-2">${task.due_date}</td>
                    <td class="p-2 text-xs">${task.description || 'No description'}</td>
                    <td class="p-2">
                      <span class="px-2 py-1 rounded text-xs font-medium 
                        ${task.status === 'completed' ? 'bg-green-900 text-green-300' : 
                          task.status === 'overdue' ? 'bg-red-900 text-red-300' : 
                          'bg-yellow-900 text-yellow-300'}">
                        ${task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                `).join('') 
                : '<tr><td colspan="4" class="p-2 text-center text-gray-400">No tasks assigned</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Task Status Summary -->
      <div class="pdf-section mb-4 pdf-no-break">
        <h3 class="text-base font-bold border-b border-gray-700 pb-1 mb-3">Task Status Overview</h3>
        <div class="grid grid-cols-3 gap-3">
          ${(() => {
            const completed = data.tasks?.filter(t => t.status === 'completed').length || 0;
            const pending = data.tasks?.filter(t => t.status === 'pending').length || 0;
            const overdue = data.tasks?.filter(t => t.status === 'overdue').length || 0;
            const total = data.tasks?.length || 0;
            
            return `
              <div class="p-3 bg-green-900/30 rounded-lg border border-green-800 text-center">
                <h4 class="font-bold text-sm text-green-400">Completed</h4>
                <p class="text-xl font-bold text-green-300">${completed}</p>
                <p class="text-xs text-green-400">of ${total}</p>
              </div>
              
              <div class="p-3 bg-yellow-900/30 rounded-lg border border-yellow-800 text-center">
                <h4 class="font-bold text-sm text-yellow-400">Pending</h4>
                <p class="text-xl font-bold text-yellow-300">${pending}</p>
                <p class="text-xs text-yellow-400">of ${total}</p>
              </div>
              
              <div class="p-3 bg-red-900/30 rounded-lg border border-red-800 text-center">
                <h4 class="font-bold text-sm text-red-400">Overdue</h4>
                <p class="text-xl font-bold text-red-300">${overdue}</p>
                <p class="text-xs text-red-400">of ${total}</p>
              </div>
            `;
          })()}
        </div>
      </div>

      <div class="text-center mt-6 pt-2 border-t border-gray-700">
        <p class="text-xs text-gray-400">J-Studios Academic Portal - Page 3 of 4+</p>
        <p class="text-xs text-gray-400">Generated on ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;
}

// Page 4+: Topics Performance by Semester
function createPage4Template(data: StudentData): string {
  // Process semesters to be shown across pages
  const semesterEntries = Object.entries(data.topics?.bySemester || {});
  
  if (semesterEntries.length === 0) {
    return `
      <div id="pdf-content" class="bg-[#1A1C23] text-white" style="font-family: Arial, sans-serif; max-width: 100%;">
        <div class="pdf-section text-center mb-6 pt-2">
          <h2 class="text-xl font-semibold mb-1">Topics Performance by Semester</h2>
          <p class="text-sm text-gray-400 mb-3">Student: ${data.name} (${data.studentId})</p>
          <p class="p-6 text-center">No semester data available for this student.</p>
        </div>
      </div>
    `;
  }
  
  // Generate HTML for semesters - each semester will be in its own section that can break to next page if needed
  let semestersHtml = '';
  
  semesterEntries.forEach(([semesterKey, topics], index) => {
    // Extract semester name from the key
    const [semesterId, semesterName] = semesterKey.split('-');
    
    // Format the semester name
    const displayName = semesterName.toLowerCase().includes('semester') 
      ? semesterName 
      : `Semester ${semesterName}`;
    
    semestersHtml += `
      <div class="pdf-section mb-5 pdf-no-break">
        <h3 class="text-base font-bold border-b border-gray-700 pb-1 mb-2">${displayName}</h3>
        <div class="pdf-table-container overflow-hidden rounded-lg border border-gray-700">
          <table class="w-full text-xs" style="border-collapse: collapse;">
            <thead class="bg-[#2A2D3A]">
              <tr>
                <th class="p-2 text-left" style="width: 30%;">Topic</th>
                <th class="p-2 text-left" style="width: 30%;">Course</th>
                <th class="p-2 text-left" style="width: 10%;">Score</th>
                <th class="p-2 text-left" style="width: 30%;">Comments</th>
              </tr>
            </thead>
            <tbody>
              ${topics.map((topic, i) => `
                <tr class="${i % 2 === 0 ? 'bg-[#22242D]' : 'bg-[#1D1F26]'}">
                  <td class="p-2 font-medium">${topic.topics?.name || 'Unnamed Topic'}</td>
                  <td class="p-2">${topic.course?.name || 'Unknown Course'}</td>
                  <td class="p-2">
                    <span class="px-2 py-1 rounded text-xs font-medium 
                      ${topic.score >= 8 ? 'bg-green-900 text-green-300' : 
                        topic.score <= 4 ? 'bg-red-900 text-red-300' : 
                        'bg-yellow-900 text-yellow-300'}">
                      ${topic.score.toFixed(1)}
                    </span>
                  </td>
                  <td class="p-2">
                    ${topic.comment ? 
                      `<p class="text-xs italic">"${topic.comment.substring(0, 40)}${topic.comment.length > 40 ? '...' : ''}"</p>
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
    <div id="pdf-content" class="bg-[#1A1C23] text-white" style="font-family: Arial, sans-serif; max-width: 100%;">
      <!-- Page Header -->
      <div class="pdf-section text-center mb-4 pt-2">
        <h2 class="text-xl font-semibold mb-1">Topics Performance by Semester</h2>
        <p class="text-sm text-gray-400 mb-2">Student: ${data.name} (${data.studentId})</p>
      </div>

      ${semestersHtml}

      <div class="text-center mt-6 pt-2 border-t border-gray-700">
        <p class="text-xs text-gray-400">J-Studios Academic Portal - Page 4 of 4+</p>
        <p class="text-xs text-gray-400">Generated on ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;
}
