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
  notes?: string;
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

  // Wait for React to complete all rendering cycles
  console.log("[DEBUG] Waiting for React rendering to complete...");
  await new Promise(resolve => {
    // Use multiple RAF calls to ensure all updates are complete
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve(void 0);
        });
      });
    });
  });

  // Additional short delay to ensure everything is settled
  await new Promise(resolve => setTimeout(resolve, 100));

  // Log the cognitive readiness score element to check if it exists and has content
  const cognitiveReadinessSection = chartElement.querySelector('[data-testid="cognitive-readiness-section"]');
  console.log("[DEBUG] Cognitive readiness section:", cognitiveReadinessSection);
  
  const cognitiveReadinessElement = chartElement.querySelector('[data-testid="cognitive-readiness-score"]');
  console.log("[DEBUG] Cognitive readiness element:", cognitiveReadinessElement);
  
  if (cognitiveReadinessElement) {
    console.log("[DEBUG] Cognitive readiness element content:", cognitiveReadinessElement.textContent);
    console.log("[DEBUG] Cognitive readiness element innerHTML:", cognitiveReadinessElement.innerHTML);
    console.log("[DEBUG] Cognitive readiness element data-score:", cognitiveReadinessElement.getAttribute('data-score'));
    console.log("[DEBUG] Cognitive readiness element styles:", window.getComputedStyle(cognitiveReadinessElement));
  } else {
    console.warn("[DEBUG] Cognitive readiness element not found! Looking for all elements with data-testid...");
    const allTestIdElements = chartElement.querySelectorAll('[data-testid]');
    console.log("[DEBUG] All data-testid elements:", Array.from(allTestIdElements).map(el => ({
      element: el,
      testId: el.getAttribute('data-testid'),
      content: el.textContent
    })));
    
    console.warn("[DEBUG] Also looking for all text elements...");
    const allTextElements = chartElement.querySelectorAll('span, div, p');
    console.log("[DEBUG] All text elements in chart:", Array.from(allTextElements).map(el => ({
      element: el,
      content: el.textContent,
      classes: el.className
    })));
  }

  // Log all child elements to see the full structure
  console.log("[DEBUG] Chart element full HTML structure:");
  console.log(chartElement.innerHTML);

  try {
    console.log("[DEBUG] Starting html2canvas capture...");
    
    // Use the exact same capture logic as the working ASB chart print button
    const canvas = await html2canvas(chartElement, {
      backgroundColor: "#ffffff",
      useCORS: true,
      scale: 2,
      width: chartElement.offsetWidth,
      height: chartElement.offsetHeight,
      logging: true, // Enable html2canvas logging
      onclone: (clonedDoc) => {
        console.log("[DEBUG] html2canvas cloned document:", clonedDoc);
        const clonedElement = clonedDoc.getElementById(chartElementId);
        if (clonedElement) {
          console.log("[DEBUG] Cloned element found");
          
          // Remove the cognitive readiness section from the cloned document for PDF capture
          const clonedCognitiveSection = clonedElement.querySelector('[data-testid="cognitive-readiness-section"]');
          if (clonedCognitiveSection) {
            console.log("[DEBUG] Removing cognitive readiness section from PDF capture");
            clonedCognitiveSection.remove();
          }
        }
      }
    });

    const chartImage = canvas.toDataURL("image/png");
    console.log("[DEBUG] Successfully captured chart image, length:", chartImage.length);
    
    // Log some details about the captured image
    console.log("[DEBUG] Canvas dimensions:", {
      width: canvas.width,
      height: canvas.height
    });
    
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
      console.log("[PDF_GEN] Starting PDF generation process...");
      setIsGenerating(true);

      console.log("[PDF_GEN] Student data:", studentData);
      console.log("[PDF_GEN] ASB chart element ID:", asbChartElementId);

      // Check if the ASB chart element exists before capture
      const chartElement = document.getElementById(asbChartElementId);
      console.log("[PDF_GEN] Chart element found:", !!chartElement);
      
      if (chartElement) {
        // Check if cognitive readiness is visible in the DOM
        const cognitiveSection = chartElement.querySelector('[data-testid="cognitive-readiness-section"]');
        const cognitiveScore = chartElement.querySelector('[data-testid="cognitive-readiness-score"]');
        console.log("[PDF_GEN] Cognitive readiness section visible:", !!cognitiveSection);
        console.log("[PDF_GEN] Cognitive readiness score element visible:", !!cognitiveScore);
        if (cognitiveScore) {
          console.log("[PDF_GEN] Cognitive readiness score value:", cognitiveScore.textContent);
          console.log("[PDF_GEN] Cognitive readiness score data-score:", cognitiveScore.getAttribute('data-score'));
        }
      }

      // Use the clone-and-capture method to get the chart image
      console.log("[PDF_GEN] Starting chart capture...");
      const asbChartImage = await captureASBChart(asbChartElementId);
      console.log("[PDF_GEN] Chart capture completed, image available:", !!asbChartImage);
      
      console.log("[PDF_GEN] Generating PDF document...");
      
      // Extract cognitive readiness score from the DOM element if available
      let cognitiveReadinessScore = null;
      if (chartElement) {
        const cognitiveScoreElement = chartElement.querySelector('[data-testid="cognitive-readiness-score"]');
        if (cognitiveScoreElement) {
          cognitiveReadinessScore = cognitiveScoreElement.getAttribute('data-score') || cognitiveScoreElement.textContent;
        }
      }
      console.log("[PDF_GEN] Cognitive readiness score for PDF:", cognitiveReadinessScore);
      
      await openPdfInNewTab(
        <StudentPdfDocument 
          studentData={studentData} 
          asbProfileChartImage={asbChartImage}
          cognitiveReadinessScore={cognitiveReadinessScore}
        />
      );
      
      console.log("[PDF_GEN] PDF generation completed successfully");
      setIsGenerating(false);
    } catch (error) {
      console.error('[PDF_GEN] Error generating student PDF:', error);
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