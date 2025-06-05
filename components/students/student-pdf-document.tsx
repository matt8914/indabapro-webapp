"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Data types (ensure these match what you pass from the page)
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
  // Academic ages
  chronologicalAge?: string;
  mathsAge?: { academicAge: string | null; difference: string | null; isDeficit: boolean; lastAssessmentDate?: string | null };
  spellingAge?: { academicAge: string | null; difference: string | null; isDeficit: boolean; lastAssessmentDate?: string | null };
  readingAge?: { academicAge: string | null; difference: string | null; isDeficit: boolean; lastAssessmentDate?: string | null };
  // Special Needs & Health - simplified for PDF
  occupationalTherapy?: string;
  speechTherapy?: string;
  medication?: string;
  counselling?: string;
  eyesight?: string;
  speech?: string;
  hearing?: string;
  asbTestDate?: string | null;
}

interface StudentPdfDocumentProps {
  studentData: StudentDetailsForPdf;
  asbProfileChartImage: string | null; // Base64 image string
  cognitiveReadinessScore?: string | null; // Cognitive readiness score for PDF text
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    width: '100%',
    marginBottom: 20, 
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5568', // A slightly softer black
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 5,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridItem: {
    width: '48%', // Two columns
    marginBottom: 10,
    backgroundColor: '#F9FAFB', // Light gray background for items
    padding: 8,
    borderRadius: 4,
  },
  gridItemFull: { // For single column items like ASB chart title
    width: '100%',
    marginBottom: 5,
    padding: 0, // No padding if it's just a title for a section
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 10,
    color: '#718096', // Gray for labels
    marginBottom: 2,
  },
  value: {
    fontSize: 12,
    color: '#2D3748',
  },
  assessmentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  assessmentCard: {
    width: '48%', // Two cards for academic assessments, adjust if more needed
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  assessmentCardTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#555555',
    marginBottom: 3,
  },
  assessmentValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assessmentValue: {
    fontSize: 12,
    color: '#333333',
    marginRight: 5,
  },
  assessmentDate: {
    fontSize: 8,
    color: '#718096',
    marginTop: 3,
  },
  chipContainer: { // Reusing from class PDF for consistency
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 6,
    fontSize: 8,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  chipDeficit: { backgroundColor: '#FEE2E2', color: '#B91C1C' },
  chipAdvanced: { backgroundColor: '#D1FAE5', color: '#065F46' },
  chipNormal: { backgroundColor: '#E5E7EB', color: '#4B5563' },
  asbChartImage: {
    width: '100%',
    height: 'auto',
    maxHeight: 300, // Max height for the chart image
    marginTop: 10,
    alignSelf: 'center',
  },
  asbTestDateText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'right',
    marginBottom: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
  },
  footerLogo: {
    width: 80,
    height: 'auto',
    marginBottom: 5,
    alignSelf: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#6B7280',
  },
});

// Helper to render age and chip (can be moved to a shared util if used elsewhere often)
const renderAgeWithChip = (ageData?: { academicAge: string | null; difference: string | null; isDeficit: boolean; }) => {
  if (!ageData || !ageData.academicAge) return <Text style={styles.value}>N/A</Text>;
  const { academicAge, difference, isDeficit } = ageData;
  let chipStyle = styles.chipNormal;
  let chipText = difference;

  if (difference) {
    const diffNum = parseInt(difference.replace(/[^\d-]/g, '')); // Get numeric value
    if (isDeficit && diffNum !== 0) {
      chipStyle = styles.chipDeficit;
    } else if (!isDeficit && diffNum > 0) {
      chipStyle = styles.chipAdvanced;
    } else if (diffNum === 0) {
      chipText = '0';
    }
  }

  return (
    <View style={styles.assessmentValueContainer}>
      <Text style={styles.assessmentValue}>{academicAge || 'N/A'}</Text>
      {chipText && (
        <View style={[styles.chip, chipStyle]}><Text>{chipText}</Text></View>
      )}
    </View>
  );
};

const StudentPdfDocument: React.FC<StudentPdfDocumentProps> = ({ studentData, asbProfileChartImage, cognitiveReadinessScore }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Student Profile & Assessment Report</Text>

        {/* Student Information Section */}
        <Text style={styles.sectionTitle}>Student Information</Text>
        <View style={styles.gridContainer}>
          <View style={styles.gridItem}><Text style={styles.label}>Full Name</Text><Text style={styles.value}>{studentData.fullName}</Text></View>
          <View style={styles.gridItem}><Text style={styles.label}>Date of Birth</Text><Text style={styles.value}>{studentData.dateOfBirth || 'N/A'}</Text></View>
          <View style={styles.gridItem}><Text style={styles.label}>Gender</Text><Text style={styles.value}>{studentData.gender || 'N/A'}</Text></View>
          <View style={styles.gridItem}><Text style={styles.label}>Home Language</Text><Text style={styles.value}>{studentData.homeLanguage || 'N/A'}</Text></View>
          <View style={styles.gridItem}><Text style={styles.label}>Class</Text><Text style={styles.value}>{studentData.className || 'N/A'}</Text></View>
          <View style={styles.gridItem}><Text style={styles.label}>{studentData.teacherLabel || 'Teacher'}</Text><Text style={styles.value}>{studentData.teacher || 'N/A'}</Text></View>
          <View style={styles.gridItem}><Text style={styles.label}>School</Text><Text style={styles.value}>{studentData.school || 'N/A'}</Text></View>
          <View style={styles.gridItem}><Text style={styles.label}>Place</Text><Text style={styles.value}>{studentData.location || 'N/A'}</Text></View>
        </View>

        {/* Academic Assessment Results */}
        <Text style={styles.sectionTitle}>Academic Assessment Results</Text>
        <View style={styles.assessmentContainer}>
          <View style={styles.assessmentCard}>
            <Text style={styles.assessmentCardTitle}>Chronological Age</Text>
            <Text style={styles.value}>{studentData.chronologicalAge || 'N/A'}</Text>
            {studentData.mathsAge?.lastAssessmentDate && <Text style={styles.assessmentDate}>Current</Text>}
          </View>
          <View style={styles.assessmentCard}>
            <Text style={styles.assessmentCardTitle}>Maths Age</Text>
            {renderAgeWithChip(studentData.mathsAge)}
            {studentData.mathsAge?.lastAssessmentDate && <Text style={styles.assessmentDate}>Last Assessed: {new Date(studentData.mathsAge.lastAssessmentDate).toLocaleDateString()}</Text>}
          </View>
          <View style={styles.assessmentCard}>
            <Text style={styles.assessmentCardTitle}>Spelling Age</Text>
            {renderAgeWithChip(studentData.spellingAge)}
            {studentData.spellingAge?.lastAssessmentDate && <Text style={styles.assessmentDate}>Last Assessed: {new Date(studentData.spellingAge.lastAssessmentDate).toLocaleDateString()}</Text>}
          </View>
          <View style={styles.assessmentCard}>
            <Text style={styles.assessmentCardTitle}>Reading Age</Text>
            {renderAgeWithChip(studentData.readingAge)}
            {studentData.readingAge?.lastAssessmentDate && <Text style={styles.assessmentDate}>Last Assessed: {new Date(studentData.readingAge.lastAssessmentDate).toLocaleDateString()}</Text>}
          </View>
        </View>

        {/* Special Needs & Health Information (Optional - keep it brief) */}
        <Text style={styles.sectionTitle}>Additional Information</Text>
        <View style={styles.gridContainer}>
            <View style={styles.gridItem}><Text style={styles.label}>Occupational Therapy</Text><Text style={styles.value}>{studentData.occupationalTherapy || 'N/A'}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Speech Therapy</Text><Text style={styles.value}>{studentData.speechTherapy || 'N/A'}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Medication</Text><Text style={styles.value}>{studentData.medication || 'N/A'}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Counselling</Text><Text style={styles.value}>{studentData.counselling || 'N/A'}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Eyesight</Text><Text style={styles.value}>{studentData.eyesight || 'N/A'}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Speech (Concern)</Text><Text style={styles.value}>{studentData.speech || 'N/A'}</Text></View>
            <View style={styles.gridItem}><Text style={styles.label}>Hearing (Concern)</Text><Text style={styles.value}>{studentData.hearing || 'N/A'}</Text></View>
        </View>
        
        {/* ASB Test Profile Section */}
        <Text style={styles.sectionTitle}>ASB Test Profile</Text>
        {studentData.asbTestDate && 
            <Text style={styles.asbTestDateText}>Assessment Date: {new Date(studentData.asbTestDate).toLocaleDateString()}</Text>
        }
        {asbProfileChartImage ? (
          <>
            <Image style={styles.asbChartImage} src={asbProfileChartImage} />
            {/* Add cognitive readiness score as text below the chart */}
            {cognitiveReadinessScore && (
              <View style={{ marginTop: 15, padding: 10, backgroundColor: '#F9FAFB', borderRadius: 5, alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: '#4B5563', marginBottom: 5, textAlign: 'center' }}>
                  Level of Cognitive Readiness in Language of Assessment
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#374151', marginRight: 5 }}>
                    {cognitiveReadinessScore}
                  </Text>
                  <Text style={{ fontSize: 10, color: '#6B7280' }}>
                    (out of 5)
                  </Text>
                </View>
                <Text style={{ fontSize: 9, color: '#6B7280', marginTop: 3, textAlign: 'center' }}>
                  Based on Reasoning, Numerical, and Gestalt scores
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.gridItemFull}><Text style={styles.value}>ASB Profile Chart not available.</Text></View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Image style={styles.footerLogo} src="/images/indabapro logo.png" />
          <Text style={styles.footerText}>
            Generated on {new Date().toLocaleDateString()} | Powered by: IndabaPro
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default StudentPdfDocument; 