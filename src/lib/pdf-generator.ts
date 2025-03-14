
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
    
    // Fetch grades
    const { data: grades, error: gradesError } = await supabase
      .from('grades')
      .select('*, course:courses(name)')
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
    
    return {
      id: student.id,
      name: student.name,
      email: student.email,
      studentId: student.student_id,
      avatar: student.avatar_url,
      courses: enrollments?.map(e => e.course) || [],
      grades: grades || [],
      attendance: attendance || [],
      messages: messages || []
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

      <!-- Grades Section -->
      <div class="mb-8">
        <h3 class="text-xl font-bold border-b border-border pb-2 mb-4">Academic Performance</h3>
        <div class="overflow-hidden rounded-lg border border-border">
          <table class="w-full text-sm">
            <thead class="bg-muted">
              <tr>
                <th class="p-2 text-left">Course</th>
                <th class="p-2 text-left">Score</th>
                <th class="p-2 text-left">Graded By</th>
                <th class="p-2 text-left">Graded At</th>
              </tr>
            </thead>
            <tbody>
              ${data.grades?.map((grade, i) => `
                <tr class="${i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}">
                  <td class="p-2">${grade.course?.name || 'Unknown course'}</td>
                  <td class="p-2 font-medium">${grade.score}</td>
                  <td class="p-2">${grade.graded_by || 'N/A'}</td>
                  <td class="p-2">${new Date(grade.graded_at).toLocaleDateString()}</td>
                </tr>
              `).join('') || '<tr><td colspan="4" class="p-2 text-center">No grades recorded</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Attendance Section -->
      <div class="mb-8">
        <h3 class="text-xl font-bold border-b border-border pb-2 mb-4">Attendance Record</h3>
        <div class="overflow-hidden rounded-lg border border-border">
          <table class="w-full text-sm">
            <thead class="bg-muted">
              <tr>
                <th class="p-2 text-left">Date</th>
                <th class="p-2 text-left">Course</th>
                <th class="p-2 text-left">Status</th>
                <th class="p-2 text-left">Recorded By</th>
              </tr>
            </thead>
            <tbody>
              ${data.attendance?.map((record, i) => `
                <tr class="${i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}">
                  <td class="p-2">${new Date(record.date).toLocaleDateString()}</td>
                  <td class="p-2">${record.course?.name || 'Unknown course'}</td>
                  <td class="p-2">
                    <span class="px-2 py-1 rounded text-xs font-medium 
                      ${record.status === 'present' ? 'bg-green-500/20 text-green-500' : 
                        record.status === 'absent' ? 'bg-red-500/20 text-red-500' : 
                        'bg-yellow-500/20 text-yellow-500'}">
                      ${record.status}
                    </span>
                  </td>
                  <td class="p-2">${record.recorded_by || 'N/A'}</td>
                </tr>
              `).join('') || '<tr><td colspan="4" class="p-2 text-center">No attendance records</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Messages Section -->
      <div class="mb-8">
        <h3 class="text-xl font-bold border-b border-border pb-2 mb-4">Recent Communications</h3>
        <div class="space-y-3">
          ${data.messages?.slice(0, 5).map(message => `
            <div class="p-3 bg-card rounded-lg">
              <div class="flex justify-between mb-1">
                <span class="font-medium">${message.from_name} (${message.sender_role})</span>
                <span class="text-xs text-muted-foreground">${new Date(message.created_at).toLocaleString()}</span>
              </div>
              <p class="text-sm">${message.content}</p>
            </div>
          `).join('') || '<p class="text-center">No messages</p>'}
        </div>
      </div>

      <div class="text-center mt-12 pt-6 border-t border-border">
        <p class="text-sm text-muted-foreground">This report was generated on ${new Date().toLocaleString()} from J-Studios Academic Portal</p>
      </div>
    </div>
  `;
}
