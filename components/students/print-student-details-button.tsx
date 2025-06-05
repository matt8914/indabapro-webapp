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
  teacherLabel?: string;
  dateOfBirth?: string | null;
  gender?: string;
  homeLanguage?: string;
  school?: string;
  location?: string;
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

// Simple direct capture function that matches the working ASB chart logic
async function captureASBChart(chartElementId: string): Promise<string | null> {
  console.log("[DEBUG] Starting chart capture for ID:", chartElementId);
  
  const chartElement = document.getElementById(chartElementId);
  if (!chartElement) {
    console.warn(`[DEBUG] ASB Chart element with ID '${chartElementId}' not found.`);
    return null;
  }

  console.log("[DEBUG] Found chart element:", chartElement);
  console.log("[DEBUG] Chart element dimensions:", {
    width: chartElement.offsetWidth,
    height: chartElement.offsetHeight,
    clientWidth: chartElement.clientWidth,
    clientHeight: chartElement.clientHeight
  });

  try {
    // Use the exact same capture logic as the working ASB chart print button
    const canvas = await html2canvas(chartElement, {
      backgroundColor: "#ffffff",
      useCORS: true,
      scale: 2,
      width: chartElement.offsetWidth,
      height: chartElement.offsetHeight,
    });

    const chartImage = canvas.toDataURL("image/png");
    console.log("[DEBUG] Successfully captured chart image, length:", chartImage.length);
    
    return chartImage;
  } catch (error) {
    console.error("[DEBUG] Error capturing chart:", error);
    return null;
  }
}

export function PrintStudentDetailsButton({ studentData, asbChartElementId }: PrintStudentDetailsButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handlePrintStudentDetails = async () => {
    try {
      setIsGenerating(true);

      // Use the clone-and-capture method to get the chart image
      const asbChartImage = await captureASBChart(asbChartElementId);
      
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
      alert('Could not generate PDF. Please try again.');
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