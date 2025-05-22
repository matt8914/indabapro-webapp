"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Define types for student data
interface StudentAssessmentData {
  id: string;
  name: string;
  gender: string;
  chronologicalAge: string;
  mathsAge: { academicAge: string | null; difference: string | null; isDeficit: boolean; };
  spellingAge: { academicAge: string | null; difference: string | null; isDeficit: boolean; };
  readingAge: { academicAge: string | null; difference: string | null; isDeficit: boolean; };
}

// Define types for class data
interface ClassData {
  id: string;
  className: string;
  gradeLevel: string;
  academicYear: string;
  teacher: string;
  isTherapistClass?: boolean;
}

interface ClassPdfDocumentProps {
  classData: ClassData;
  studentsData: StudentAssessmentData[];
}

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    width: '100%',
    marginBottom: 10,
  },
  footerLogo: {
    width: 80,
    height: 'auto',
    marginBottom: 5,
    alignSelf: 'center',
  },
  classDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    flexWrap: 'wrap',
  },
  classDetailCard: {
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 5,
    minWidth: '48%',
    marginBottom: 10,
  },
  classDetailCardTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#555555',
    marginBottom: 3,
  },
  classDetailCardText: {
    fontSize: 12,
    color: '#333333',
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
    minHeight: 30,
  },
  tableHeader: {
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 2,
    borderBottomColor: '#D1D5DB',
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingVertical: 8,
    paddingHorizontal: 6,
    color: '#4B5563',
    textAlign: 'left',
  },
  tableCell: {
    fontSize: 9,
    paddingVertical: 6,
    paddingHorizontal: 6,
    textAlign: 'left',
  },
  colStudentName: { width: '25%' },
  colGender: { width: '10%' },
  colAge: { width: '10%' },
  colMaths: { width: '18.33%' },
  colSpelling: { width: '18.33%' },
  colReading: { width: '18.33%' },
  chipContainer: {
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
  chipDeficit: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
  },
  chipAdvanced: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  chipNormal: {
    backgroundColor: '#E5E7EB',
    color: '#4B5563',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    fontSize: 9,
    textAlign: 'center',
    color: '#6B7280',
  },
});

const renderAgeWithChip = (ageData: { academicAge: string | null; difference: string | null; isDeficit: boolean; }) => {
  const { academicAge, difference, isDeficit } = ageData;
  let chipStyle = styles.chipNormal;
  let chipText = difference;

  if (difference) {
    const diffNum = parseInt(difference);
    if (isDeficit && diffNum !== 0) {
      chipStyle = styles.chipDeficit;
    } else if (!isDeficit && diffNum > 0) {
      chipStyle = styles.chipAdvanced;
    } else if (diffNum === 0) {
      chipText = '0';
    }
  }

  return (
    <View style={styles.chipContainer}>
      <Text>{academicAge || 'N/A'}</Text>
      {chipText && (
        <Text style={[styles.chip, chipStyle]}>{chipText}</Text>
      )}
    </View>
  );
};

const ClassPdfDocument: React.FC<ClassPdfDocumentProps> = ({ classData, studentsData }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Class Assessment Results</Text>
        </View>

        <View style={styles.classDetailsContainer}>
          <View style={styles.classDetailCard}>
            <Text style={styles.classDetailCardTitle}>Class Name</Text>
            <Text style={styles.classDetailCardText}>{classData.className}</Text>
          </View>
          <View style={styles.classDetailCard}>
            <Text style={styles.classDetailCardTitle}>Grade Level</Text>
            <Text style={styles.classDetailCardText}>{classData.gradeLevel}</Text>
          </View>
          <View style={styles.classDetailCard}>
            <Text style={styles.classDetailCardTitle}>Academic Year</Text>
            <Text style={styles.classDetailCardText}>{classData.academicYear}</Text>
          </View>
          <View style={styles.classDetailCard}>
            <Text style={styles.classDetailCardTitle}>{classData.isTherapistClass ? 'Therapist' : 'Teacher'}</Text>
            <Text style={styles.classDetailCardText}>{classData.teacher}</Text>
          </View>
        </View>
        
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableHeaderCell, styles.colStudentName]}>Student Name</Text>
            <Text style={[styles.tableHeaderCell, styles.colGender]}>Gender</Text>
            <Text style={[styles.tableHeaderCell, styles.colAge]}>Age</Text>
            <Text style={[styles.tableHeaderCell, styles.colMaths]}>Maths Age</Text>
            <Text style={[styles.tableHeaderCell, styles.colSpelling]}>Spelling Age</Text>
            <Text style={[styles.tableHeaderCell, styles.colReading]}>Reading Age</Text>
          </View>
          
          {studentsData.map((student) => (
            <View key={student.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colStudentName]}>{student.name}</Text>
              <Text style={[styles.tableCell, styles.colGender]}>{student.gender}</Text>
              <Text style={[styles.tableCell, styles.colAge]}>{student.chronologicalAge}</Text>
              <Text style={[styles.tableCell, styles.colMaths]}>{renderAgeWithChip(student.mathsAge)}</Text>
              <Text style={[styles.tableCell, styles.colSpelling]}>{renderAgeWithChip(student.spellingAge)}</Text>
              <Text style={[styles.tableCell, styles.colReading]}>{renderAgeWithChip(student.readingAge)}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.footer}>
          <Image style={styles.footerLogo} src="/images/indabapro logo.png" />
          <Text>
            Generated on {new Date().toLocaleDateString()} | Powered by: IndabaPro
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ClassPdfDocument; 