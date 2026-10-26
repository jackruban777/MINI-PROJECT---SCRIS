import { describe, it, expect } from 'vitest';
import { AcademicRiskEngine, GRADE_POINT_MAP } from './riskEngine';

describe('AcademicRiskEngine - SGPA and CGPA Calculations', () => {
  it('calculates SGPA accurately based on 10-point scale', () => {
    const results = [
      { grade: 'O', credits: 4 },   // 10 * 4 = 40
      { grade: 'A+', credits: 4 },  // 9 * 4 = 36
      { grade: 'A', credits: 3 },   // 8 * 3 = 24
      { grade: 'B+', credits: 3 },  // 7 * 3 = 21
      { grade: 'RA', credits: 4 },  // 0 * 4 = 0 (Fail)
    ];
    // Total points: 40 + 36 + 24 + 21 + 0 = 121
    // Total credits: 4 + 4 + 3 + 3 + 4 = 18
    // SGPA = 121 / 18 = 6.7222... -> 6.72

    const { sgpa, totalCredits } = AcademicRiskEngine.calculateSGPA(results);
    expect(totalCredits).toBe(18);
    expect(sgpa).toBe(6.72);
  });

  it('handles empty results without division by zero', () => {
    const { sgpa, totalCredits } = AcademicRiskEngine.calculateSGPA([]);
    expect(sgpa).toBe(0);
    expect(totalCredits).toBe(0);
  });

  it('calculates CGPA and earned credits accurately', () => {
    const results = [
      { grade: 'O', credits: 4, status: 'PASS' },   // 40
      { grade: 'A', credits: 4, status: 'PASS' },   // 32
      { grade: 'RA', credits: 3, status: 'FAIL' },  // 0
    ];
    // Total points = 72, Attempted = 11, Earned = 8
    // CGPA = 72 / 11 = 6.55

    const { cgpa, totalEarnedCredits, totalAttemptedCredits } = AcademicRiskEngine.calculateCGPA(results);
    expect(totalAttemptedCredits).toBe(11);
    expect(totalEarnedCredits).toBe(8);
    expect(cgpa).toBe(6.55);
  });

  it('verifies standard grade point values', () => {
    expect(GRADE_POINT_MAP['O']).toBe(10);
    expect(GRADE_POINT_MAP['A+']).toBe(9);
    expect(GRADE_POINT_MAP['A']).toBe(8);
    expect(GRADE_POINT_MAP['B+']).toBe(7);
    expect(GRADE_POINT_MAP['B']).toBe(6);
    expect(GRADE_POINT_MAP['C']).toBe(5);
    expect(GRADE_POINT_MAP['RA']).toBe(0);
  });
});
