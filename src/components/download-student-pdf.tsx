
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { fetchStudentData, generateStudentPDF } from '@/lib/pdf-generator';
import { FileDown, Loader2 } from 'lucide-react';

export function DownloadStudentPdf() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDownload = async () => {
    try {
      if (!user) {
        toast({
          title: "Not authenticated",
          description: "Please log in to download your report.",
          variant: "destructive"
        });
        return;
      }

      setIsLoading(true);
      
      // Determine which student ID to use
      let studentId = user.id;
      
      // If the user is an admin and is viewing a specific student page, use that student's ID
      // This is a placeholder, replace with actual logic to get the current student ID if admin
      if (user.role === 'admin') {
        // Check if on a specific student page and get that student's ID
        const urlParams = new URLSearchParams(window.location.search);
        const currentStudentId = urlParams.get('id');
        
        if (currentStudentId) {
          studentId = currentStudentId;
        } else {
          toast({
            title: "No student selected",
            description: "Please navigate to a specific student page to download their report.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      }
      
      // Fetch student data
      const studentData = await fetchStudentData(studentId);
      
      if (!studentData) {
        throw new Error("Could not fetch student data");
      }
      
      // Generate PDF
      await generateStudentPDF(studentData);
      
      toast({
        title: "PDF Generated",
        description: "Your student profile report has been downloaded.",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Download Failed",
        description: "There was a problem generating the PDF report.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      className="w-full justify-start gap-2" 
      onClick={handleDownload}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      Download Report
    </Button>
  );
}
