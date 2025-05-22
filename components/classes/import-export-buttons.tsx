"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { FeatureNoticeDialog } from "@/components/ui/feature-notice-dialog";
import { PrintResultsButton } from "./print-results-button";

interface StudentForPdf {
  id: string;
  name: string;
  gender: string;
  chronologicalAge: string;
  mathsAge: { academicAge: string | null; difference: string | null; isDeficit: boolean; };
  spellingAge: { academicAge: string | null; difference: string | null; isDeficit: boolean; };
  readingAge: { academicAge: string | null; difference: string | null; isDeficit: boolean; };
}

interface ClassForPdf {
  id: string;
  className: string;
  gradeLevel: string;
  academicYear: string;
  teacher: string;
  isTherapistClass?: boolean;
}

interface ImportExportButtonsProps {
  classId: string;
  classData?: ClassForPdf;
  studentsData?: StudentForPdf[];
}

export function ImportExportButtons({ 
  classId, 
  classData, 
  studentsData 
}: ImportExportButtonsProps) {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  return (
    <>
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={() => setIsImportDialogOpen(true)}
        >
          <Upload className="h-4 w-4" />
          Import List
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={() => setIsExportDialogOpen(true)}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
        
        {/* Only show Print Results button if we have class and student data */}
        {classData && studentsData && (
          <PrintResultsButton 
            classData={classData} 
            studentsData={studentsData} 
          />
        )}
      </div>

      <FeatureNoticeDialog
        featureName="Import Student List"
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
      />

      <FeatureNoticeDialog
        featureName="Export Student Data"
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
      />
    </>
  );
} 