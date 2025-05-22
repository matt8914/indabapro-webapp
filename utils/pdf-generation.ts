// This utility file helps with PDF generation
// It ensures the @react-pdf/renderer package works properly in Next.js

import { renderToBuffer, pdf } from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import { Document } from '@react-pdf/renderer';

// Helper function to generate a PDF buffer from a PDF document
export async function generatePdfBuffer(document: ReactElement<any, typeof Document>): Promise<Buffer> {
  return await renderToBuffer(document);
}

// Helper function to generate a PDF blob from a PDF document
export async function generatePdfBlob(document: ReactElement<any, typeof Document>): Promise<Blob> {
  return await pdf(document).toBlob();
}

// Helper function to generate a valid filename for PDF download
export function generatePdfFilename(className: string): string {
  // Replace spaces with underscores and add date
  const sanitizedName = className.replace(/\s+/g, '_');
  const date = new Date().toISOString().split('T')[0];
  return `${sanitizedName}_Results_${date}.pdf`;
}

// Helper function to open PDF in a new tab without triggering print dialog
export async function openPdfInNewTab(document: ReactElement<any, typeof Document>): Promise<void> {
  try {
    // Generate the PDF blob
    const blob = await generatePdfBlob(document);
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Open a new window with the PDF
    const newWindow = window.open(url, '_blank');
    
    if (newWindow) {
      // If the window is closed, revoke the blob URL to free up memory
      newWindow.addEventListener('beforeunload', () => {
        URL.revokeObjectURL(url);
      });
    }
  } catch (error) {
    console.error('Error opening PDF in new tab:', error);
    throw error;
  }
} 