"use client";

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import StudentPdfDocument from './student-pdf-document'; // Make sure path is correct
import { openPdfInNewTab } from '@/utils/pdf-generation';
import html2canvas from 'html2canvas';

// Reuse or define types for student data passed to this button
interface StudentDetailsForPdf {
  fullName: string;
  className?: string;
  teacher?: string;
  dateOfBirth?: string | null;
  gender?: string;
  homeLanguage?: string;
  school?: string;
  place?: string;
  chronologicalAge?: string;
  mathsAge?: { academicAge: string | null; difference: string | null; isDeficit: boolean; lastAssessmentDate?: string | null };
  spellingAge?: { academicAge: string | null; difference: string | null; isDeficit: boolean; lastAssessmentDate?: string | null };
  readingAge?: { academicAge: string | null; difference: string | null; isDeficit: boolean; lastAssessmentDate?: string | null };
  occupationalTherapy?: string;
  speechTherapy?: string;
  medication?: string;
  counselling?: string;
  eyesight?: string;
  speech?: string;
  hearing?: string;
  asbTestDate?: string | null;
}

interface PrintStudentDetailsButtonProps {
  studentData: StudentDetailsForPdf;
  // ASB Chart is part of the page, so we need a way to reference its DOM element
  // We'll pass a ref or an ID selector for the chart container
  asbChartElementId: string; 
}

export function PrintStudentDetailsButton({ studentData, asbChartElementId }: PrintStudentDetailsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handlePrintStudentDetails = async () => {
    try {
      setIsGenerating(true);

      let asbChartImage: string | null = null;
      const chartElement = document.getElementById(asbChartElementId);

      if (chartElement) {
        // Temporarily make chart visible if it's in an inactive tab to capture it
        // This might need adjustment based on how tabs hide content (e.g., display: none vs visibility: hidden)
        // For simplicity, we assume it's capturable or the tab needs to be active.
        // A more robust solution might involve ensuring the tab is active or temporarily altering styles.

        // Add a small delay to ensure chart is rendered if tab was just switched
        await new Promise(resolve => setTimeout(resolve, 100)); 

        const canvas = await html2canvas(chartElement, {
          scale: 2, // Increase scale for better resolution
          useCORS: true, // If chart uses external images/fonts
          backgroundColor: '#ffffff', // Ensure background is white for PDF
        });
        asbChartImage = canvas.toDataURL('image/png');
      } else {
        console.warn(`ASB Chart element with ID '${asbChartElementId}' not found.`);
      }
      
      await openPdfInNewTab(
        <StudentPdfDocument 
          studentData={studentData} 
          asbProfileChartImage={asbChartImage}
        />
      );
      
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating student PDF:', error);
      setIsGenerating(false);
      alert('Could not generate PDF. Please ensure the ASB Test Profile tab has been viewed at least once if the chart is missing.');
    }
  };

  return (
    <Button 
      variant="outline" 
      className="flex items-center gap-2 text-purple-600 border-purple-600 hover:bg-purple-50"
      onClick={handlePrintStudentDetails}
      disabled={isGenerating}
    >
      <Printer className="h-4 w-4" />
      {isGenerating ? 'Generating PDF...' : 'Print Student Details'}
    </Button>
  );
} 