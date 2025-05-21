"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { FeatureNoticeDialog } from "@/components/ui/feature-notice-dialog";

interface ImportExportButtonsProps {
  classId: string;
}

export function ImportExportButtons({ classId }: ImportExportButtonsProps) {
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