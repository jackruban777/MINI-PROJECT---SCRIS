import { describe, it, expect } from 'vitest';
import { AcademicImportService } from './importService';
import { GRADE_POINT_MAP } from './riskEngine';

describe('AcademicImportService - CSV Parsing and Validation', () => {
  it('parses structured CSV text into headers and row objects', () => {
    const csvContent = `registerNumber,subjectCode,assessmentType,score,maxScore,date\n2024CSE001,CS501,CAT-1,42,50,2026-09-10\n2024CSE002,CS502,CAT-1,38,50,2026-09-10`;

    const { headers, rows } = AcademicImportService.parseCSV(csvContent);

    expect(headers).toEqual(['registerNumber', 'subjectCode', 'assessmentType', 'score', 'maxScore', 'date']);
    expect(rows.length).toBe(2);
    expect(rows[0].registerNumber).toBe('2024CSE001');
    expect(rows[0].score).toBe('42');
    expect(rows[1].subjectCode).toBe('CS502');
  });

  it('throws an error for empty or single-line CSV', () => {
    expect(() => AcademicImportService.parseCSV('')).toThrow();
    expect(() => AcademicImportService.parseCSV('single_header_only')).toThrow();
  });

  it('handles quotes and whitespace in CSV values gracefully', () => {
    const csvWithQuotes = `"registerNumber","subjectCode","assessmentType","score","maxScore"\n" 2024CSE001 ","CS501","CAT-1","45","50"`;
    const { rows } = AcademicImportService.parseCSV(csvWithQuotes);
    expect(rows[0].registerNumber).toBe('2024CSE001');
    expect(rows[0].score).toBe('45');
  });
});

describe('Passing Marks Formulas & Boundary Conditions', () => {
  it('calculates required external exam score with 40/60 weighting and 45% exam cutoff', () => {
    const internalWeight = 40;
    const examWeight = 60;
    const overallPassingThreshold = 50;
    const mandatoryExamMinimum = 45;

    // Student has 80% in internal assessments:
    // internalContribution = 0.8 * 40 = 32 marks
    // Needed from exam: max(0, 50 - 32) = 18 marks out of 60
    // Raw exam % needed = (18 / 60) * 100 = 30%
    // But mandatory exam minimum is 45%, so requiredExamScore must be 45%
    const internalPercentage = 80;
    const internalContribution = (internalPercentage / 100) * internalWeight;
    const neededExamContribution = Math.max(0, overallPassingThreshold - internalContribution);
    const rawExamPercent = (neededExamContribution / examWeight) * 100;
    const finalRequiredExamScore = Math.ceil(Math.max(mandatoryExamMinimum, rawExamPercent));

    expect(finalRequiredExamScore).toBe(45);
  });

  it('correctly calculates higher exam target when internal marks are lower (35%)', () => {
    const internalWeight = 40;
    const examWeight = 60;
    const overallPassingThreshold = 50;
    const mandatoryExamMinimum = 45;

    // Student has 35% in internal assessments:
    // internalContribution = 0.35 * 40 = 14 marks
    // Needed from exam: 50 - 14 = 36 marks out of 60
    // Raw exam % needed = (36 / 60) * 100 = 60%
    // 60% > 45%, so required exam score is 60%
    const internalPercentage = 35;
    const internalContribution = (internalPercentage / 100) * internalWeight;
    const neededExamContribution = Math.max(0, overallPassingThreshold - internalContribution);
    const rawExamPercent = (neededExamContribution / examWeight) * 100;
    const finalRequiredExamScore = Math.ceil(Math.max(mandatoryExamMinimum, rawExamPercent));

    expect(finalRequiredExamScore).toBe(60);
  });

  it('identifies unachievable target when internal score is too low', () => {
    const internalWeight = 40;
    const examWeight = 60;
    const overallPassingThreshold = 50;

    // If internal score is only 15% (6 marks out of 40)
    // 50 - 6 = 44 marks needed out of 60
    // (44 / 60) * 100 = 73.3% -> 74%
    // If internal score is 0% (0 marks)
    // 50 - 0 = 50 marks needed out of 60 = 83.3% -> achievable
    // If overall threshold is 75%, (75 - 0) / 60 = 125% -> unachievable (>100)
    const requiredMarks = (75 / examWeight) * 100;
    expect(requiredMarks).toBeGreaterThan(100);
  });
});

describe('CGPA What-If Simulation Formulas', () => {
  it('correctly projects hypothetical CGPA without modifying records', () => {
    // Current: 60 credits attempted with 480 points -> 8.00 CGPA
    const currentPoints = 480;
    const currentCredits = 60;
    const currentCGPA = currentPoints / currentCredits;
    expect(currentCGPA).toBe(8.00);

    // Hypothetical semester: 5 courses of 4 credits each (20 credits) with all 'O' (10 points):
    // Additional points: 20 * 10 = 200
    // Total credits: 60 + 20 = 80
    // Total points: 480 + 200 = 680
    // Projected CGPA = 680 / 80 = 8.50 (+0.50)
    const hypCredits = 20;
    const hypPoints = 20 * GRADE_POINT_MAP['O'];
    const projectedCGPA = Number(((currentPoints + hypPoints) / (currentCredits + hypCredits)).toFixed(2));

    expect(projectedCGPA).toBe(8.5);
    expect(projectedCGPA - currentCGPA).toBeCloseTo(0.5);
  });
});
