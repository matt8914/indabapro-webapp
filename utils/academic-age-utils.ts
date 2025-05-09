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
  
  // Format the result
  if (months === 0) {
    return `${years} years`;
  } else {
    return `${years} years ${months} months`;
  }
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

  // Format the result
  if (months === 0) {
    return `${years} years`;
  } else {
    return `${years} years ${months} months`;
  }
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
  
  // Calculate difference in milliseconds
  const diffMs = test.getTime() - dob.getTime();
  
  // Convert to years
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  
  // Get whole years
  const years = Math.floor(diffYears);
  
  // Get remaining months
  const months = Math.floor((diffYears - years) * 12);
  
  if (format === 'months') {
    // Return in years.months format (e.g., 7.3 for 7 years 3 months)
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
    
    if (months === 0) {
      return `${years} years`;
    } else {
      return `${years} years ${months} months`;
    }
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