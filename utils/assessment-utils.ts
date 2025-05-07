/**
 * Utility functions for assessments
 */

/**
 * Converts a raw score to a standardized score based on the ASB norm table
 * 
 * @param componentName The name of the assessment component (e.g., "Visual Perception", "Spatial", etc.)
 * @param rawScore The raw score to convert
 * @returns The standardized score (1-5)
 */
export function convertToStandardizedScore(componentName: string, rawScore: number): number {
  // Define the conversion ranges for each component based on the ASB norm table
  const conversionTable: Record<string, Array<{ min: number; max: number; standardScore: number }>> = {
    "Visual Perception": [
      { min: 0, max: 5, standardScore: 1 },
      { min: 6, max: 7, standardScore: 2 },
      { min: 8, max: 8, standardScore: 3 },
      { min: 9, max: 9, standardScore: 4 },
      { min: 10, max: 10, standardScore: 5 },
    ],
    "Spatial": [
      { min: 0, max: 1, standardScore: 1 },
      { min: 2, max: 3, standardScore: 2 },
      { min: 4, max: 6, standardScore: 3 },
      { min: 7, max: 9, standardScore: 4 },
      { min: 10, max: 10, standardScore: 5 },
    ],
    "Reasoning": [
      { min: 0, max: 2, standardScore: 1 },
      { min: 3, max: 6, standardScore: 2 },
      { min: 7, max: 8, standardScore: 3 },
      { min: 9, max: 9, standardScore: 4 },
      { min: 10, max: 10, standardScore: 5 },
    ],
    "Numerical": [
      { min: 0, max: 2, standardScore: 1 },
      { min: 3, max: 4, standardScore: 2 },
      { min: 5, max: 7, standardScore: 3 },
      { min: 8, max: 9, standardScore: 4 },
      { min: 10, max: 10, standardScore: 5 },
    ],
    "Gestalt": [
      { min: 0, max: 35, standardScore: 1 },
      { min: 36, max: 62, standardScore: 2 },
      { min: 63, max: 86, standardScore: 3 },
      { min: 87, max: 98, standardScore: 4 },
      { min: 99, max: 100, standardScore: 5 },
    ],
    "Co-ordination": [
      { min: 0, max: 8, standardScore: 1 },
      { min: 9, max: 17, standardScore: 2 },
      { min: 18, max: 24, standardScore: 3 },
      { min: 25, max: 28, standardScore: 4 },
      { min: 29, max: 30, standardScore: 5 },
    ],
    "Memory": [
      { min: 0, max: 1, standardScore: 1 },
      { min: 2, max: 7, standardScore: 2 },
      { min: 8, max: 8, standardScore: 3 },
      { min: 9, max: 9, standardScore: 4 },
      { min: 10, max: 10, standardScore: 5 },
    ],
    "Verbal Comprehension": [
      { min: 0, max: 7, standardScore: 1 },
      { min: 8, max: 11, standardScore: 2 },
      { min: 12, max: 14, standardScore: 3 },
      { min: 15, max: 17, standardScore: 4 },
      { min: 18, max: 20, standardScore: 5 },
    ],
  };

  // Get conversion ranges for the component
  const ranges = conversionTable[componentName];
  
  if (!ranges) {
    throw new Error(`No conversion table defined for component: ${componentName}`);
  }

  // Find the range that includes the raw score
  const range = ranges.find(range => rawScore >= range.min && rawScore <= range.max);
  
  // Return the standardized score or default to 0 if not found
  return range ? range.standardScore : 0;
} 