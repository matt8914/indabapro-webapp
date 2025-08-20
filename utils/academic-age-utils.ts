/**
 * Utility functions for converting raw assessment scores to academic ages
 */

/**
 * Converts a raw YOUNG Maths Assessment score to a mathematics age
 * @param rawScore The raw score from the assessment (0-56+)
 * @returns The mathematics age in years and tenths format (e.g., 5.5, 7.3)
 */
export function convertToMathsAge(rawScore: number): string {
  // Define the conversion table based on the YOUNG Maths Assessment
  const mathsAgeTable: { [key: number]: string } = {
    0: "< 5.5", // Less than 5.5
    1: "< 5.5",
    2: "< 5.5",
    3: "< 5.5",
    4: "< 5.5",
    5: "< 5.5", 
    6: "5.5",
    7: "5.6",
    8: "5.6",
    9: "5.7",
    10: "5.8",
    11: "5.8",
    12: "5.9",
    13: "5.9",
    14: "6.0",
    15: "6.1",
    16: "6.1",
    17: "6.2",
    18: "6.3",
    19: "6.4",
    20: "6.4",
    21: "6.5",
    22: "6.6",
    23: "6.7",
    24: "6.7",
    25: "6.8",
    26: "6.9",
    27: "7.0",
    28: "7.1",
    29: "7.1",
    30: "7.2",
    31: "7.3",
    32: "7.4",
    33: "7.5",
    34: "7.5",
    35: "7.6",
    36: "7.7",
    37: "7.8",
    38: "7.9",
    39: "7.9",
    40: "8.0",
    41: "8.1",
    42: "8.2",
    43: "8.3",
    44: "8.3",
    45: "8.4",
    46: "8.5",
    47: "8.6",
    48: "8.7",
    49: "8.8",
    50: "8.9",
    51: "9.0",
    52: "9.1",
    53: "9.3",
    54: "9.5",
    55: "9.7",
    56: "10.1"
  };

  // If score is higher than 56, return "> 10.1"
  if (rawScore > 56) {
    return "> 10.1";
  }

  return mathsAgeTable[rawScore] || "Invalid score";
}

/**
 * Converts a raw SPAR Reading Assessment score to a reading age
 * @param rawScore The raw score from the assessment (0-42)
 * @returns The reading age in years and tenths format (e.g., 5.9) and years.months format (e.g., 5.11)
 */
export function convertToReadingAge(rawScore: number): string {
  // Define the conversion table based on the SPAR Reading Assessment
  const readingAgeTable: { [key: number]: string } = {
    5: "< 5.9",
    6: "5.9",
    7: "6.1",
    8: "6.2",
    9: "6.3",
    10: "6.4",
    11: "6.6",
    12: "6.7",
    13: "6.8",
    14: "6.9",
    15: "7.0",
    16: "7.1",
    17: "7.2",
    18: "7.3",
    19: "7.4",
    20: "7.5",
    21: "7.6",
    22: "7.7",
    23: "7.7",
    24: "7.8",
    25: "7.9",
    26: "8.0",
    27: "8.1",
    28: "8.2",
    29: "8.3",
    30: "8.4",
    31: "8.5",
    32: "8.6",
    33: "8.7",
    34: "8.8",
    35: "8.9",
    36: "9.1",
    37: "9.3",
    38: "9.5",
    39: "9.7",
    40: "10.0",
    41: "10.4",
    42: "10.8"
  };

  // If score is less than 5, return "< 5.9"
  if (rawScore < 5) {
    return "< 5.9";
  }
  
  // If score is higher than 42, return "> 10.8"
  if (rawScore > 42) {
    return "> 10.8";
  }

  return readingAgeTable[rawScore] || "Invalid score";
}

/**
 * Converts a raw SPAR Reading Assessment score to a reading age in years.months format
 * @param rawScore The raw score from the assessment (0-42)
 * @returns The reading age in years.months format (e.g., 5.11)
 */
export function convertToReadingAgeMonths(rawScore: number): string {
  // Define the conversion table based on the SPAR Reading Test
  const readingAgeMonthsTable: { [key: number]: string } = {
    5: "< 5.11",
    6: "5.11",
    7: "6.1",
    8: "6.2",
    9: "6.4",
    10: "6.5",
    11: "6.7",
    12: "6.8",
    13: "6.10",
    14: "6.11",
    15: "7.0",
    16: "7.1",
    17: "7.2",
    18: "7.4",
    19: "7.5",
    20: "7.6",
    21: "7.7",
    22: "7.8",
    23: "7.8",
    24: "7.10",
    25: "7.11",
    26: "8.0",
    27: "8.1",
    28: "8.2",
    29: "8.4",
    30: "8.5",
    31: "8.6",
    32: "8.7",
    33: "8.8",
    34: "8.10",
    35: "8.11",
    36: "9.1",
    37: "9.3",
    38: "9.6",
    39: "9.8",
    40: "10.0",
    41: "10.5",
    42: "10.10"
  };

  // If score is less than 5, return "< 5.11"
  if (rawScore < 5) {
    return "< 5.11";
  }
  
  // If score is higher than 42, return "> 10.10"
  if (rawScore > 42) {
    return "> 10.10";
  }

  return readingAgeMonthsTable[rawScore] || "Invalid score";
}

/**
 * Converts a raw Schonell Spelling A Assessment score to a spelling age
 * @param rawScore The raw score from the assessment (0-80)
 * @returns The spelling age in years and months format (e.g., 6.0, 11.11)
 */
export function convertToSpellingAge(rawScore: number): string {
  // Define the conversion table based on the Schonell Spelling A Assessment
  const spellingAgeTable: { [key: number]: string } = {
    3: "6.0",
    4: "6.1",
    5: "6.1",
    6: "6.2",
    7: "6.2",
    8: "6.3",
    9: "6.4",
    10: "6.5",
    11: "6.6",
    12: "6.6",
    13: "6.7",
    14: "6.7",
    15: "6.8",
    16: "6.9",
    17: "6.10",
    18: "6.10",
    19: "6.11",
    20: "7.0",
    21: "7.1",
    22: "7.2",
    23: "7.3",
    24: "7.4",
    25: "7.5",
    26: "7.6",
    27: "7.7",
    28: "7.8",
    29: "7.9",
    30: "7.10",
    31: "7.11",
    32: "8.0",
    33: "8.1",
    34: "8.2",
    35: "8.3",
    36: "8.4",
    37: "8.5",
    38: "8.6",
    39: "8.7",
    40: "8.8",
    41: "8.9",
    42: "8.10",
    43: "8.11",
    44: "9.0",
    45: "9.1",
    46: "9.2",
    47: "9.3",
    48: "9.4",
    49: "9.5",
    50: "9.10",
    51: "9.11",
    52: "10.0",
    53: "10.1",
    54: "10.2",
    55: "10.3",
    56: "10.4",
    57: "10.5",
    58: "10.6",
    59: "10.7",
    60: "10.8",
    61: "10.9",
    62: "10.10",
    63: "10.11",
    64: "11.0",
    65: "11.1",
    66: "11.3",
    67: "11.5",
    68: "11.7",
    69: "11.9",
    70: "11.11",
    71: "12.1",
    72: "12.3",
    73: "12.5",
    74: "12.7",
    75: "12.9",
    76: "12.11",
    77: "13.1",
    78: "13.3",
    79: "13.5",
    80: "13.7"
  };

  // If score is less than 3, return "< 6.0"
  if (rawScore < 3) {
    return "< 6.0";
  }
  
  // If score is higher than 80, return "> 13.7"
  if (rawScore > 80) {
    return "> 13.7";
  }

  return spellingAgeTable[rawScore] || "Invalid score";
}

/**
 * Converts a raw Basic Number Screening Test (BNST) 5th Edition score to a number age
 * @param rawScore The raw score from the assessment (0-50)
 * @returns The number age in years and months format (e.g., 6.0, 8.9)
 */
export function convertToBNSTAge(rawScore: number): string {
  // Define the conversion table based on the BNST 5th Edition Table D
  const bnstAgeTable: { [key: number]: string } = {
    1: "6.0",
    2: "6.1",
    3: "6.2",
    4: "6.3",
    5: "6.5",
    6: "6.6",
    7: "6.7",
    8: "6.8",
    9: "6.10",
    10: "6.11",
    11: "7.0",
    12: "7.1",
    13: "7.2",
    14: "7.4",
    15: "7.5",
    16: "7.7",
    17: "7.8",
    18: "7.9",
    19: "7.10",
    20: "8.0",
    21: "8.1",
    22: "8.2",
    23: "8.4",
    24: "8.5",
    25: "8.7",
    26: "8.9",
    27: "8.11",
    28: "9.0",
    29: "9.2",
    30: "9.3",
    31: "9.5",
    32: "9.7",
    33: "9.9",
    34: "10.1",
    35: "10.2",
    36: "10.4",
    37: "10.6",
    38: "10.8",
    39: "10.10",
    40: "11.0",
    41: "11.4",
    42: "11.8",
    43: "12.0",
    44: "12.3",
    45: "12.9",
    46: "13.3",
    47: "14.0",
    48: "14.8",
    49: ">14.8",
    50: ">14.8"
  };

  // If score is less than 1, return "< 6.0"
  if (rawScore < 1) {
    return "< 6.0";
  }
  
  // If score is higher than 50, return "> 14.8"
  if (rawScore > 50) {
    return "> 14.8";
  }

  return bnstAgeTable[rawScore] || "Invalid score";
}

/**
 * Converts a raw Burt Word Reading Test score to a reading level
 * @param rawScore The raw score from the assessment (2-110)
 * @returns The reading level in years and months format (e.g., 5.3, 8.9)
 */
export function convertToBurtReadingLevel(rawScore: number): string {
  // Define the conversion table based on the Burt Word Reading Test
  const burtReadingTable: { [key: number]: string } = {
    2: "5.3",
    3: "5.3",
    4: "5.4",
    5: "5.5",
    6: "5.5",
    7: "5.6",
    8: "5.6",
    9: "5.7",
    10: "5.7",
    11: "5.8",
    12: "5.9",
    13: "5.9",
    14: "5.10",
    15: "5.11",
    16: "5.11",
    17: "6.0",
    18: "6.1",
    19: "6.1",
    20: "6.2",
    21: "6.2",
    22: "6.3",
    23: "6.4",
    24: "6.5",
    25: "6.5",
    26: "6.6",
    27: "6.7",
    28: "6.8",
    29: "6.9",
    30: "6.9",
    31: "6.9",
    32: "6.10",
    33: "6.11",
    34: "7.0",
    35: "7.1",
    36: "7.2",
    37: "7.3",
    38: "7.4",
    39: "7.5",
    40: "7.5",
    41: "7.6",
    42: "7.7",
    43: "7.8",
    44: "7.9",
    45: "7.10",
    46: "7.11",
    47: "8.0",
    48: "8.1",
    49: "8.2",
    50: "8.3",
    51: "8.4",
    52: "8.5",
    53: "8.6",
    54: "8.7",
    55: "8.8",
    56: "8.9",
    57: "8.10",
    58: "9.0",
    59: "9.1",
    60: "9.2",
    61: "9.3",
    62: "9.4",
    63: "9.6",
    64: "9.7",
    65: "9.8",
    66: "9.9",
    67: "9.10",
    68: "10.0",
    69: "10.1",
    70: "10.2",
    71: "10.3",
    72: "10.4",
    73: "10.6",
    74: "10.7",
    75: "10.9",
    76: "10.10",
    77: "10.11",
    78: "11.0",
    79: "11.1",
    80: "11.3",
    81: "11.4",
    82: "11.5",
    83: "11.6",
    84: "11.7",
    85: "11.9",
    86: "11.10",
    87: "11.11",
    88: "12.0",
    89: "12.1",
    90: "12.3",
    91: "12.4",
    92: "12.5",
    93: "12.6",
    94: "12.7",
    95: "12.9",
    96: "12.10",
    97: "12.11",
    98: "13.0",
    99: "13.1",
    100: "13.3",
    101: "13.4",
    102: "13.6",
    103: "13.6",
    104: "13.7",
    105: "13.9",
    106: "13.10",
    107: "13.11",
    108: "14.0",
    109: "14.1",
    110: "14.3"
  };

  // If score is less than 2, return "< 5.3"
  if (rawScore < 2) {
    return "< 5.3";
  }
  
  // If score is higher than 110, return "> 14.3"
  if (rawScore > 110) {
    return "> 14.3";
  }

  return burtReadingTable[rawScore] || "Invalid score";
}

/**
 * Converts a raw Daniels & Daick Graded Test of Reading Experience score to a reading experience age
 * @param rawScore The raw score from the assessment (0-50+)
 * @returns The reading experience age in years.months format (e.g., 7.5, 11.2)
 */
export function convertToDanielsAndDaickAge(rawScore: number): string {
  // Define the conversion table based on the Daniels & Daick Graded Test of Reading Experience
  const danielsAndDaickTable: { [key: number]: string } = {
    // Scores 0-9: No conversion (dashes in original table)
    0: "No conversion available",
    1: "No conversion available", 
    2: "No conversion available",
    3: "No conversion available",
    4: "No conversion available",
    5: "No conversion available",
    6: "No conversion available",
    7: "No conversion available",
    8: "No conversion available",
    9: "No conversion available",
    
    // Scores 10-19 (Row 10): 6.0 to 6.9
    10: "6.0",
    11: "6.1",
    12: "6.2", 
    13: "6.3",
    14: "6.4",
    15: "6.5",
    16: "6.6",
    17: "6.7",
    18: "6.8",
    19: "6.9",
    
    // Scores 20-29 (Row 20): 7.0 to 8.0
    20: "7.0",
    21: "7.1",
    22: "7.2",
    23: "7.4",
    24: "7.5",
    25: "7.6",
    26: "7.7",
    27: "7.8",
    28: "7.9",
    29: "8.0",
    
    // Scores 30-39 (Row 30): 8.2 to 9.3
    30: "8.2",
    31: "8.3",
    32: "8.4",
    33: "8.6",
    34: "8.7",
    35: "8.8",
    36: "9.0",
    37: "9.1",
    38: "9.2",
    39: "9.3",
    
    // Scores 40-49 (Row 40): 9.7 to 13.7
    40: "9.7",
    41: "10.0",
    42: "10.3",
    43: "10.7",
    44: "11.2",
    45: "11.6",
    46: "12.1",
    47: "12.6",
    48: "13.1",
    49: "13.7"
  };

  // If score is less than 10, no conversion available
  if (rawScore < 10) {
    return "No conversion available";
  }
  
  // If score is 50 or higher, return "14.0+"
  if (rawScore >= 50) {
    return "14.0+";
  }

  return danielsAndDaickTable[rawScore] || "Invalid score";
}

/**
 * Converts a raw Daniels & Daick Graded Spelling Test score to a spelling age
 * @param rawScore The raw score from the assessment (0-40)
 * @returns The spelling age in years.months format (e.g., 7.5, 11.2)
 */
export function convertToDanielsAndDaickSpellingAge(rawScore: number): string {
  // Define the conversion table based on the Daniels & Daick Graded Spelling Test
  const danielsAndDaickSpellingTable: { [key: number]: string } = {
    0: "5.0",
    1: "5.2",
    2: "5.3",
    3: "5.4",
    4: "5.5",
    5: "5.6",
    6: "5.7",
    7: "5.8",
    8: "5.9",
    9: "6.0",
    10: "6.1",
    11: "6.2",
    12: "6.3",
    13: "6.4",
    14: "6.5",
    15: "6.6",
    16: "6.7",
    17: "6.8",
    18: "7.0",
    19: "7.1",
    20: "7.2",
    21: "7.3",
    22: "7.5",
    23: "7.6",
    24: "7.7",
    25: "7.8",
    26: "7.9",
    27: "8.1",
    28: "8.2",
    29: "8.3",
    30: "8.5",
    31: "8.7",
    32: "9.0",
    33: "9.2",
    34: "9.5",
    35: "9.8",
    36: "10.2",
    37: "10.5",
    38: "11.0",
    39: "11.6",
    40: "12.3"
  };

  // If score is higher than 40, return "> 12.3"
  if (rawScore > 40) {
    return "> 12.3";
  }
  
  // If score is negative, return "Invalid score"
  if (rawScore < 0) {
    return "Invalid score";
  }

  return danielsAndDaickSpellingTable[rawScore] || "Invalid score";
}

/**
 * Converts a raw Vernon Graded Arithmetic Mathematics Test score to a mathematics age
 * @param rawScore The raw score from the assessment (3-53)
 * @returns The mathematics age in years.months format (e.g., 7.2, 11.4)
 */
export function convertToVernonMathsAge(rawScore: number): string {
  // Define the conversion table based on the Vernon Graded Arithmetic Mathematics Test (Canadian norms)
  const vernonMathsTable: { [key: number]: string } = {
    3: "6.0",
    4: "6.1",
    5: "6.3",
    6: "6.5",
    7: "6.7",
    8: "6.10",
    9: "7.0",
    10: "7.2",
    11: "7.4",
    12: "7.6",
    13: "7.8",
    14: "7.10",
    15: "8.0",
    16: "8.2",
    17: "8.3",
    18: "8.5",
    19: "8.6",
    20: "8.8",
    21: "8.10",
    22: "8.11",
    23: "9.1",
    24: "9.2",
    25: "9.4",
    26: "9.5",
    27: "9.6",
    28: "9.8",
    29: "9.9",
    30: "9.11",
    31: "10.0",
    32: "10.2",
    33: "10.3",
    34: "10.5",
    35: "10.6",
    36: "10.8",
    37: "10.9",
    38: "10.11",
    39: "11.0",
    40: "11.2",
    41: "11.4",
    42: "11.5",
    43: "11.5",
    44: "11.6",
    45: "11.9",
    46: "11.10",
    47: "12.0",
    48: "12.2",
    49: "12.4",
    50: "12.5",
    51: "12.7",
    52: "12.8",
    53: "13.0"
  };

  // If score is less than 3, return "< 6.0"
  if (rawScore < 3) {
    return "< 6.0";
  }
  
  // If score is higher than 53, return "> 13.0"
  if (rawScore > 53) {
    return "> 13.0";
  }

  return vernonMathsTable[rawScore] || "Invalid score";
}

/**
 * Converts a raw Schonell Reading Test score to a reading age
 * @param rawScore The raw score from the assessment (0-99)
 * @returns The reading age in years.months format (e.g., 7.06, 11.08)
 */
export function convertToSchonellReadingAge(rawScore: number): string {
  // If score is negative, return "Invalid score"
  if (rawScore < 0) {
    return "Invalid score";
  }
  
  // If score is higher than 99, return "> 14.11"
  if (rawScore > 99) {
    return "> 14.11";
  }
  
  // Define the scoring matrix based on the Schonell Reading Test
  const schonellMatrix: { [key: number]: string[] } = {
    0: ["< 5.00", "5.01", "5.02", "5.04", "5.05", "5.06", "5.07", "5.08", "5.10", "5.11"],
    10: ["6.00", "6.01", "6.02", "6.04", "6.05", "6.06", "6.07", "6.08", "6.10", "6.11"],
    20: ["7.00", "7.01", "7.02", "7.04", "7.05", "7.06", "7.07", "7.08", "7.10", "7.11"],
    30: ["8.00", "8.01", "8.02", "8.04", "8.05", "8.06", "8.07", "8.08", "8.10", "8.11"],
    40: ["9.00", "9.01", "9.02", "9.04", "9.05", "9.06", "9.07", "9.08", "9.10", "9.11"],
    50: ["10.00", "10.01", "10.02", "10.04", "10.05", "10.06", "10.07", "10.08", "10.10", "10.11"],
    60: ["11.00", "11.01", "11.02", "11.04", "11.05", "11.06", "11.07", "11.08", "11.10", "11.11"],
    70: ["12.00", "12.01", "12.02", "12.04", "12.05", "12.06", "12.07", "12.08", "12.10", "12.11"],
    80: ["13.00", "13.01", "13.02", "13.04", "13.05", "13.06", "13.07", "13.08", "13.10", "13.11"],
    90: ["14.00", "14.01", "14.02", "14.04", "14.05", "14.06", "14.07", "14.08", "14.10", "14.11"]
  };
  
  // Find the appropriate row (base score)
  const baseScore = Math.floor(rawScore / 10) * 10;
  
  // Find the column (remainder)
  const remainder = rawScore % 10;
  
  // Get the matrix value
  const row = schonellMatrix[baseScore];
  if (row && row[remainder] !== undefined) {
    return row[remainder];
  }
  
  return "Invalid score";
}

/**
 * Converts a raw One-Minute Reading Test score to a reading age
 * @param rawScore The raw score from the assessment (31-120)
 * @returns The reading age in years.months format (e.g., 7.4, 11.8)
 */
export function convertToOneMinuteReadingAge(rawScore: number): string {
  // Define the conversion table based on the One-Minute Reading Test
  const oneMinuteReadingTable: { [key: number]: string } = {
    31: "6.6", 32: "6.7", 33: "6.9", 34: "6.11", 35: "7.0", 36: "7.2", 37: "7.4", 38: "7.5", 39: "7.6",
    40: "7.6", 41: "7.7", 42: "7.7", 43: "7.8", 44: "7.8", 45: "7.9", 46: "7.10", 47: "7.10", 48: "7.11", 49: "7.11",
    50: "8.0", 51: "8.1", 52: "8.1", 53: "8.2", 54: "8.2", 55: "8.3", 56: "8.4", 57: "8.4", 58: "8.5", 59: "8.5",
    60: "8.6", 61: "8.7", 62: "8.7", 63: "8.8", 64: "8.8", 65: "8.9", 66: "8.10", 67: "8.10", 68: "8.11", 69: "8.11",
    70: "9.0", 71: "9.1", 72: "9.2", 73: "9.4", 74: "9.5", 75: "9.6", 76: "9.7", 77: "9.8", 78: "9.10", 79: "9.11",
    80: "10.1", 81: "10.1", 82: "10.2", 83: "10.3", 84: "10.4", 85: "10.5", 86: "10.6", 87: "10.7", 88: "10.8", 89: "10.9",
    90: "10.10", 91: "10.11", 92: "11.0", 93: "11.1", 94: "11.2", 95: "11.4", 96: "11.5", 97: "11.6", 98: "11.7", 99: "11.8",
    100: "11.10", 101: "11.11", 102: "12.0", 103: "12.1", 104: "12.2", 105: "12.3", 106: "12.4", 107: "12.5", 108: "12.6", 109: "12.7",
    110: "12.8", 111: "12.8", 112: "12.9", 113: "12.10", 114: "12.11", 115: "13.0", 116: "13.2", 117: "13.4", 118: "13.6", 119: "13.8",
    120: "13.10"
  };

  // If score is less than 31, return "< 6.6"
  if (rawScore < 31) {
    return "< 6.6";
  }
  
  // If score is higher than 120, return "> 13.10"
  if (rawScore > 120) {
    return "> 13.10";
  }

  return oneMinuteReadingTable[rawScore] || "Invalid score";
}

/**
 * Converts a raw Young's Group Reading Test score to a reading age
 * @param rawScore The raw score from the assessment (5-44)
 * @returns The reading age in years.months format (e.g., 5.6, 7.3, 13.4)
 */
export function convertToYoungsGroupReadingAge(rawScore: number): string {
  // Define the conversion table based on Young's Group Reading Test
  const youngsGroupReadingTable: { [key: number]: string } = {
    5: "5.6",
    6: "5.8",
    7: "5.10",
    8: "6.0",
    9: "6.2",
    10: "6.4",
    11: "6.6",
    12: "6.8",
    13: "6.10",
    14: "7.0",
    15: "7.2",
    16: "7.4",
    17: "7.6",
    18: "7.8",
    19: "7.10",
    20: "8.0",
    21: "8.2",
    22: "8.4",
    23: "8.6",
    24: "8.8",
    25: "8.10",
    26: "9.0",
    27: "9.2",
    28: "9.4",
    29: "9.6",
    30: "9.8",
    31: "9.10",
    32: "10.0",
    33: "10.2",
    34: "10.4",
    35: "10.6",
    36: "10.8",
    37: "10.10",
    38: "11.0",
    39: "11.2",
    40: "11.4",
    41: "11.6",
    42: "11.8",
    43: "11.10",
    44: "12.0"
  };

  // If score is less than 5, return "< 5.6"
  if (rawScore < 5) {
    return "< 5.6";
  }
  
  // If score is higher than 44, return "> 12.0"
  if (rawScore > 44) {
    return "> 12.0";
  }

  return youngsGroupReadingTable[rawScore] || "Invalid score";
}

/**
 * Converts academic age in tenths format to years and months format
 * @param ageInTenths The age in years and tenths format (e.g., 7.5)
 * @returns The age in years and months format (e.g., "7 years 6 months")
 */
export function convertTenthsToYearsMonths(ageInTenths: string): string {
  // Handle special cases
  if (ageInTenths.startsWith("<") || ageInTenths.startsWith(">")) {
    const numericPart = ageInTenths.substring(1).trim();
    return ageInTenths.charAt(0) + " " + convertTenthsToYearsMonths(numericPart);
  }

  // Handle invalid input
  if (ageInTenths === "Invalid score") {
    return ageInTenths;
  }

  // Convert to number
  const age = parseFloat(ageInTenths);
  
  // Extract years (integer part)
  const years = Math.floor(age);
  
  // Extract tenths (decimal part)
  const tenths = Math.round((age - years) * 10);

  // Convert tenths to months
  const monthsMap: { [key: number]: number } = {
    0: 0,   // 0 tenths = 0 months
    1: 1,   // 0.1 = 1 month
    2: 2,   // 0.2 = 2 months
    3: 4,   // 0.3 = 4 months
    4: 5,   // 0.4 = 5 months
    5: 6,   // 0.5 = 6 months
    6: 7,   // 0.6 = 7 months 
    7: 8,   // 0.7 = 8 months
    8: 10,  // 0.8 = 10 months
    9: 11   // 0.9 = 11 months
  };
  
  const months = monthsMap[tenths] || 0;
  
  // Format the result (always show months)
  return `${years} years ${months} months`;
}

/**
 * Converts a spelling age in years.months format to a more readable years and months format
 * @param spellingAge The spelling age in years.months format (e.g., "7.3" meaning 7 years 3 months)
 * @returns The spelling age in years and months format (e.g., "7 years 3 months")
 */
export function convertSpellingAgeToYearsMonths(spellingAge: string): string {
  // Handle special cases
  if (spellingAge.startsWith("<") || spellingAge.startsWith(">")) {
    const numericPart = spellingAge.substring(1).trim();
    return spellingAge.charAt(0) + " " + convertSpellingAgeToYearsMonths(numericPart);
  }

  // Handle invalid input
  if (spellingAge === "Invalid score") {
    return spellingAge;
  }

  // Split the age by decimal point
  const parts = spellingAge.split('.');
  if (parts.length !== 2) {
    return spellingAge; // Return as is if not in the expected format
  }

  const years = parseInt(parts[0], 10);
  const months = parseInt(parts[1], 10);

  // Format the result (always show months)
  return `${years} years ${months} months`;
}

/**
 * Calculates age difference between academic age and chronological age
 * @param academicAge Academic age in years.tenths format (e.g., "7.5") or years.months format (e.g., "7.3")
 * @param chronologicalAge Chronological age in years.tenths format (e.g., "8.2")
 * @returns The difference in years.tenths format, with sign indicating deficit/gain
 */
export function calculateAgeDifference(academicAge: string, chronologicalAge: string): string {
  // Handle special cases
  if (academicAge.startsWith("<") || academicAge.startsWith(">") || 
      chronologicalAge.startsWith("<") || chronologicalAge.startsWith(">") ||
      academicAge === "Invalid score" || chronologicalAge === "Invalid score") {
    return "Cannot calculate";
  }

  // Check if academic age is in years.months format (spelling/reading) by looking at month part > 9
  // or by checking if the decimal part has two digits (e.g., 7.10)
  const academicAgeParts = academicAge.split('.');
  const hasMonthsFormat = academicAgeParts.length === 2 && 
                          (academicAgeParts[1].length === 2 || parseInt(academicAgeParts[1], 10) > 9);

  let academicAgeValue: number;
  
  if (hasMonthsFormat) {
    // Convert years.months to years.tenths for calculation
    const years = parseInt(academicAgeParts[0], 10);
    const months = parseInt(academicAgeParts[1], 10);
    
    // Convert months to tenths of a year (approximation)
    let tenths: number;
    if (months === 1) tenths = 1;
    else if (months === 2) tenths = 2;
    else if (months === 3 || months === 4) tenths = 3;
    else if (months === 5) tenths = 4;
    else if (months === 6) tenths = 5;
    else if (months === 7) tenths = 6;
    else if (months === 8) tenths = 7;
    else if (months === 9 || months === 10) tenths = 8;
    else if (months === 11 || months === 12) tenths = 9;
    else tenths = 0;
    
    academicAgeValue = years + (tenths / 10);
  } else {
    // Normal years.tenths format
    academicAgeValue = parseFloat(academicAge);
  }

  const chronologicalAgeValue = parseFloat(chronologicalAge);
  
  // Calculate the difference
  const difference = academicAgeValue - chronologicalAgeValue;
  
  // Format to 1 decimal place and include sign
  return difference.toFixed(1);
}

/**
 * Determines if there is a deficit based on academic and chronological ages
 * @param academicAge Academic age in years.tenths format or years.months format
 * @param chronologicalAge Chronological age in years.tenths format
 * @returns True if academic age is less than chronological age (deficit), false otherwise
 */
export function isDeficit(academicAge: string, chronologicalAge: string): boolean {
  // Handle special cases
  if (academicAge.startsWith("<") || academicAge.startsWith(">") || 
      chronologicalAge.startsWith("<") || chronologicalAge.startsWith(">") ||
      academicAge === "Invalid score" || chronologicalAge === "Invalid score") {
    return false; // Can't determine
  }

  // Check if academic age is in years.months format (spelling/reading) by looking at month part > 9
  // or by checking if the decimal part has two digits (e.g., 7.10)
  const academicAgeParts = academicAge.split('.');
  const hasMonthsFormat = academicAgeParts.length === 2 && 
                          (academicAgeParts[1].length === 2 || parseInt(academicAgeParts[1], 10) > 9);

  let academicAgeValue: number;
  
  if (hasMonthsFormat) {
    // Convert years.months to years.tenths for calculation
    const years = parseInt(academicAgeParts[0], 10);
    const months = parseInt(academicAgeParts[1], 10);
    
    // Convert months to tenths of a year (approximation)
    let tenths: number;
    if (months === 1) tenths = 1;
    else if (months === 2) tenths = 2;
    else if (months === 3 || months === 4) tenths = 3;
    else if (months === 5) tenths = 4;
    else if (months === 6) tenths = 5;
    else if (months === 7) tenths = 6;
    else if (months === 8) tenths = 7;
    else if (months === 9 || months === 10) tenths = 8;
    else if (months === 11 || months === 12) tenths = 9;
    else tenths = 0;
    
    academicAgeValue = years + (tenths / 10);
  } else {
    // Normal years.tenths format
    academicAgeValue = parseFloat(academicAge);
  }

  const chronologicalAgeValue = parseFloat(chronologicalAge);
  return academicAgeValue < chronologicalAgeValue;
}

/**
 * Converts a student's date of birth to chronological age at test date
 * @param dateOfBirth Date of birth as string in "YYYY-MM-DD" format
 * @param testDate Test date as string in "YYYY-MM-DD" format
 * @param format Format to return the age in: 'tenths' for years.tenths or 'months' for years.months
 * @returns Chronological age in specified format
 */
export function calculateChronologicalAge(dateOfBirth: string, testDate: string, format: 'tenths' | 'months' = 'tenths'): string {
  const dob = new Date(dateOfBirth);
  const test = new Date(testDate);
  
  // Calculate age more accurately by working with actual dates
  let years = test.getFullYear() - dob.getFullYear();
  let months = test.getMonth() - dob.getMonth();
  
  // Adjust for cases where the birthday hasn't occurred yet this year
  if (months < 0 || (months === 0 && test.getDate() < dob.getDate())) {
    years--;
    months += 12;
  }
  
  // Adjust for cases where we're in the same month but before the birthday
  if (months === 0 && test.getDate() < dob.getDate()) {
    months = 11;
  } else if (test.getDate() < dob.getDate()) {
    months--;
    if (months < 0) {
      months = 11;
      years--;
    }
  }
  
  // Ensure months is between 0-11
  if (months >= 12) {
    years += Math.floor(months / 12);
    months = months % 12;
  }
  
  if (format === 'months') {
    // Return in years.months format (e.g., 7.03 for 7 years 3 months)
    return `${years}.${months < 10 ? '0' + months : months}`;
  } else {
    // Return in years.tenths format (approximate)
    let tenths = 0;
    if (months === 1) tenths = 1;
    else if (months === 2) tenths = 2;
    else if (months === 3 || months === 4) tenths = 3;
    else if (months === 5) tenths = 4;
    else if (months === 6) tenths = 5;
    else if (months === 7) tenths = 6;
    else if (months === 8) tenths = 7;
    else if (months === 9) tenths = 8;
    else if (months === 10 || months === 11) tenths = 9;
    
    // Format the result
    return `${years}.${tenths}`;
  }
}

/**
 * Calculates age difference between academic age and chronological age in years and months format
 * @param academicAge Academic age in either years.tenths or years.months format
 * @param chronologicalAge Chronological age in either years.tenths or years.months format
 * @returns The difference in years and months format (e.g., "1.03" for 1 year and 3 months)
 */
export function calculateAgeDifferenceInMonths(academicAge: string, chronologicalAge: string): string {
  // Handle special cases
  if (academicAge.startsWith("<") || academicAge.startsWith(">") || 
      chronologicalAge.startsWith("<") || chronologicalAge.startsWith(">") ||
      academicAge === "Invalid score" || chronologicalAge === "Invalid score") {
    return "Cannot calculate";
  }

  // Convert both ages to months for accurate calculation
  const academicAgeMonths = convertAgeToTotalMonths(academicAge);
  const chronologicalAgeMonths = convertAgeToTotalMonths(chronologicalAge);
  
  if (academicAgeMonths === null || chronologicalAgeMonths === null) {
    return "Cannot calculate";
  }
  
  // Calculate difference in months
  const diffMonths = academicAgeMonths - chronologicalAgeMonths;
  
  // Convert back to years and months
  const diffYears = Math.floor(Math.abs(diffMonths) / 12);
  const remainingMonths = Math.abs(diffMonths) % 12;
  
  // Format with sign
  const sign = diffMonths < 0 ? "-" : "";
  return `${sign}${diffYears}.${remainingMonths < 10 ? '0' + remainingMonths : remainingMonths}`;
}

/**
 * Helper function to convert an age in either years.tenths or years.months format to total months
 * @param age Age in either years.tenths or years.months format
 * @returns Total months or null if conversion fails
 */
function convertAgeToTotalMonths(age: string): number | null {
  // Split the age by decimal point
  const parts = age.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const years = parseInt(parts[0], 10);
  if (isNaN(years)) {
    return null;
  }
  
  const secondPart = parts[1];
  let months: number;
  
  // Check if this is months format (e.g., 7.03 for 7 years 3 months)
  // or tenths format (e.g., 7.5 for 7 years 6 months)
  if (secondPart.length === 2 && secondPart[0] === '0') {
    // This is in years.months format with leading zero (e.g., 7.03)
    months = parseInt(secondPart, 10);
  } else if (secondPart.length === 2) {
    // This is in years.months format (e.g., 7.10 for 7 years 10 months)
    months = parseInt(secondPart, 10);
  } else {
    // This is in tenths format, convert to months
    const tenths = parseInt(secondPart, 10);
    if (isNaN(tenths)) {
      return null;
    }
    
    // Convert tenths to months
    const monthsMap: { [key: number]: number } = {
      0: 0,   // 0 tenths = 0 months
      1: 1,   // 0.1 = 1 month
      2: 2,   // 0.2 = 2 months
      3: 4,   // 0.3 = 4 months
      4: 5,   // 0.4 = 5 months
      5: 6,   // 0.5 = 6 months
      6: 7,   // 0.6 = 7 months 
      7: 8,   // 0.7 = 8 months
      8: 10,  // 0.8 = 10 months
      9: 11   // 0.9 = 11 months
    };
    
    months = monthsMap[tenths] || 0;
  }
  
  return years * 12 + months;
}

/**
 * Converts a reading age in years.tenths/years.months format to a more readable years and months format
 * @param readingAge The reading age in years.tenths format (e.g., "7.5") or years.months format (e.g., "7.10")
 * @returns The reading age in years and months format (e.g., "7 years 6 months" or "7 years 10 months")
 */
export function convertReadingAgeToYearsMonths(readingAge: string): string {
  // Handle special cases
  if (readingAge.startsWith("<") || readingAge.startsWith(">")) {
    const numericPart = readingAge.substring(1).trim();
    return readingAge.charAt(0) + " " + convertReadingAgeToYearsMonths(numericPart);
  }

  // Handle invalid input
  if (readingAge === "Invalid score") {
    return readingAge;
  }

  // Split the age by decimal point
  const parts = readingAge.split('.');
  if (parts.length !== 2) {
    return readingAge; // Return as is if not in the expected format
  }

  const years = parseInt(parts[0], 10);
  const secondPart = parts[1];

  // Check if this is months format (e.g., 7.10 for 7 years 10 months)
  // or tenths format (e.g., 7.5 for 7 years 6 months)
  if (secondPart.length === 2 || parseInt(secondPart, 10) > 9) {
    // This is in months format (e.g., 7.10 for 7 years 10 months)
    const months = parseInt(secondPart, 10);
    
    // Always show months
    return `${years} years ${months} months`;
  } else {
    // This is in tenths format, use the existing conversion
    return convertTenthsToYearsMonths(readingAge);
  }
}

/**
 * Formats a chronological age in years.months format to a readable string
 * @param age Age in years.months format (e.g., "8.05" for 8 years 5 months)
 * @returns Formatted age string (e.g., "8.5")
 */
export function formatChronologicalAge(age: string): string {
  if (!age || age === 'N/A') return age;
  
  const parts = age.split('.');
  if (parts.length !== 2) return age;
  
  const years = parseInt(parts[0], 10);
  const months = parseInt(parts[1], 10);
  
  return `${years}.${months < 10 && parts[1][0] === '0' ? parts[1][1] : months}`;
}

/**
 * Formats an age difference in years.months format for display
 * @param difference Age difference in years.months format (e.g., "1.03" for 1 year 3 months)
 * @returns Formatted age difference with appropriate sign
 */
export function formatAgeDifferenceInMonths(difference: string): string {
  if (!difference || difference === "Cannot calculate") return difference;
  
  const isNegative = difference.startsWith('-');
  const cleanValue = isNegative ? difference.substring(1) : difference;
  
  const parts = cleanValue.split('.');
  if (parts.length !== 2) return difference;
  
  const years = parseInt(parts[0], 10);
  const months = parseInt(parts[1], 10);
  
  if (years === 0 && months === 0) return "0";
  
  let result = "";
  if (years > 0) {
    result += `${years}y`;
  }
  
  if (months > 0) {
    if (result) result += ' ';
    result += `${months}m`;
  }
  
  return isNegative ? `-${result}` : `+${result}`;
} 