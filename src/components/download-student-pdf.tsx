
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { fetchStudentData, generateStudentPDF } from '@/lib/pdf-generator';
import { FileDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface DownloadStudentPdfProps {
  className?: string;
}

export type ReportSection = {
  id: string;
  name: string;
  description: string;
  selected: boolean;
};

export function DownloadStudentPdf({ className }: DownloadStudentPdfProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [reportSections, setReportSections] = useState<ReportSection[]>([
    { 
      id: 'profile', 
      name: 'Student Profile', 
      description: 'Personal information and enrolled courses',
      selected: true
    },
    { 
      id: 'performance', 
      name: 'Performance Overview', 
      description: 'Strong topics and areas needing improvement',
      selected: true
    },
    { 
      id: 'tasks', 
      name: 'Student Tasks', 
      description: 'Assigned tasks and their status',
      selected: true
    },
    { 
      id: 'byTopic', 
      name: 'Performance by Semester', 
      description: 'Detailed breakdown of grades by semester',
      selected: true
    }
  ]);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSectionToggle = (sectionId: string) => {
    setReportSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, selected: !section.selected } 
          : section
      )
    );
  };

  const handleOpenDialog = () => {
    // Check if user is authenticated first
    if (!user) {
      toast({
        title: "Not authenticated",
        description: "Please log in to download your report.",
        variant: "destructive"
      });
      return;
    }

    setShowDialog(true);
  };

  const handleDownload = async () => {
    try {
      // Check if at least one section is selected
      const hasSelectedSections = reportSections.some(section => section.selected);
      
      if (!hasSelectedSections) {
        setShowErrorDialog(true);
        return;
      }
      
      setShowDialog(false);
      setIsLoading(true);
      
      // Determine which student ID to use
      let studentId = user.id;
      
      // If the user is an admin and is viewing a specific student page, use that student's ID
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
      
      // Generate PDF with selected sections
      const selectedSections = reportSections
        .filter(section => section.selected)
        .map(section => section.id);
        
      await generateStudentPDF(studentData, selectedSections);
      
      toast({
        title: "PDF Generated",
        description: "Your student report has been downloaded.",
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
    <>
      <Button 
        variant="outline" 
        className={cn("w-full justify-start gap-2", className)}
        onClick={handleOpenDialog}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        Download Report
      </Button>
      
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Student Report</DialogTitle>
            <DialogDescription>
              Select which sections you would like to include in your report.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {reportSections.map((section) => (
              <div key={section.id} className="flex items-start space-x-3 space-y-0">
                <Checkbox 
                  id={section.id} 
                  checked={section.selected}
                  onCheckedChange={() => handleSectionToggle(section.id)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor={section.id} className="text-sm font-medium">
                    {section.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleDownload} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Download
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No sections selected</AlertDialogTitle>
            <AlertDialogDescription>
              Please select at least one section to include in your report.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
