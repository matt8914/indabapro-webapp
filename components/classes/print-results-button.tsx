"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import ClassPdfDocument from './class-pdf-document';
import { openPdfInNewTab } from '@/utils/pdf-generation';

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

interface PrintResultsButtonProps {
  classData: ClassForPdf;
  studentsData: StudentForPdf[];
}

export function PrintResultsButton({ classData, studentsData }: PrintResultsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleViewPdf = async () => {
    try {
      setIsGenerating(true);
      
      // Use the utility function to generate and open the PDF in a new tab
      await openPdfInNewTab(
        <ClassPdfDocument 
          classData={classData} 
          studentsData={studentsData} 
        />
      );
      
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      className="flex items-center gap-1"
      onClick={handleViewPdf}
      disabled={isGenerating}
    >
      <Printer className="h-4 w-4" />
      {isGenerating ? 'Generating PDF...' : 'Print Results'}
    </Button>
  );
} 