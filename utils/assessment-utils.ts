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

/**
 * Calculates the Level of Cognitive Readiness in Language of Assessment score
 * based on the sum of standardized scores from Reasoning, Numerical, and Gestalt components
 * 
 * @param reasoningStandardScore The standardized score for Reasoning (1-5)
 * @param numericalStandardScore The standardized score for Numerical (1-5)
 * @param gestaltStandardScore The standardized score for Gestalt (1-5)
 * @returns The Level of Cognitive Readiness score (1-5) or 0 if any required score is missing
 */
export function calculateCognitiveReadinessScore(
  reasoningStandardScore: number,
  numericalStandardScore: number,
  gestaltStandardScore: number
): number {
  // Check if all required scores are valid (1-5)
  if (
    reasoningStandardScore < 1 || reasoningStandardScore > 5 ||
    numericalStandardScore < 1 || numericalStandardScore > 5 ||
    gestaltStandardScore < 1 || gestaltStandardScore > 5
  ) {
    return 0; // Return 0 if any score is invalid or missing
  }

  // Calculate total score by summing the three standardized scores
  const totalScore = reasoningStandardScore + numericalStandardScore + gestaltStandardScore;

  // Convert total score to cognitive readiness score using Table 9.2 mapping
  if (totalScore >= 3 && totalScore <= 5) {
    return 1;
  } else if (totalScore >= 6 && totalScore <= 7) {
    return 2;
  } else if (totalScore >= 8 && totalScore <= 10) {
    return 3;
  } else if (totalScore >= 11 && totalScore <= 12) {
    return 4;
  } else if (totalScore >= 13 && totalScore <= 15) {
    return 5;
  }

  // Should not reach here with valid inputs, but return 0 as fallback
  return 0;
}

/**
 * Helper function to calculate cognitive readiness from raw scores
 * 
 * @param reasoningRawScore Raw score for Reasoning
 * @param numericalRawScore Raw score for Numerical  
 * @param gestaltRawScore Raw score for Gestalt
 * @returns The Level of Cognitive Readiness score (1-5) or 0 if any score is invalid
 */
export function calculateCognitiveReadinessFromRawScores(
  reasoningRawScore: number,
  numericalRawScore: number,
  gestaltRawScore: number
): number {
  // Convert raw scores to standardized scores first
  const reasoningStandardized = convertToStandardizedScore("Reasoning", reasoningRawScore);
  const numericalStandardized = convertToStandardizedScore("Numerical", numericalRawScore);
  const gestaltStandardized = convertToStandardizedScore("Gestalt", gestaltRawScore);

  // Calculate cognitive readiness score
  return calculateCognitiveReadinessScore(
    reasoningStandardized,
    numericalStandardized,
    gestaltStandardized
  );
} 