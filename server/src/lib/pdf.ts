import PDFDocument from 'pdfkit';
import { RiskAssessmentResult } from '../services/riskEngine';

export class PDFReportService {
  /**
   * Generates a formal Student Academic Progress Report as a PDF buffer
   */
  public static async generateStudentReport(
    student: {
      name: string;
      registerNumber: string;
      degree: string;
      department: string;
      currentSemester: number;
      section: string;
    },
    riskData: RiskAssessmentResult,
    results: any[],
    attendance: any[]
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header Banner
      doc.rect(40, 40, 515, 60).fill('#1E3A5F');
      doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text('SCRIS ACADEMIC PROGRESS REPORT', 55, 52);
      doc.fontSize(9).font('Helvetica').text('Student Course Completion Risk and Intervention System', 55, 74);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}`, 400, 74, { align: 'right' });

      doc.moveDown(3);

      // Student Metadata Grid
      const metaTop = 115;
      doc.rect(40, metaTop, 515, 65).fill('#F8FAFC').stroke('#E2E8F0');
      doc.fillColor('#0F172A').fontSize(10).font('Helvetica-Bold');

      doc.text(`Student Name:`, 55, metaTop + 10);
      doc.font('Helvetica').text(student.name, 140, metaTop + 10);

      doc.font('Helvetica-Bold').text(`Register No:`, 320, metaTop + 10);
      doc.font('Helvetica').text(student.registerNumber, 400, metaTop + 10);

      doc.font('Helvetica-Bold').text(`Department:`, 55, metaTop + 28);
      doc.font('Helvetica').text(student.department, 140, metaTop + 28);

      doc.font('Helvetica-Bold').text(`Current Sem:`, 320, metaTop + 28);
      doc.font('Helvetica').text(`Semester ${student.currentSemester} (Sec ${student.section})`, 400, metaTop + 28);

      doc.font('Helvetica-Bold').text(`Degree Program:`, 55, metaTop + 46);
      doc.font('Helvetica').text(student.degree, 140, metaTop + 46);

      // Key Metrics Card Row
      const cardTop = 195;
      const cardWidth = 120;
      const cardGap = 11;

      const cards = [
        { label: 'Cumulative GPA', value: `${riskData.cgpa.toFixed(2)} / 10.0` },
        { label: 'Credits Earned', value: `${riskData.totalCreditsEarned}` },
        { label: 'Pending Arrears', value: `${riskData.pendingArrearsCount}` },
        { label: 'Risk Category', value: `${riskData.category} (${riskData.score}/100)` },
      ];

      cards.forEach((c, i) => {
        const x = 40 + i * (cardWidth + cardGap);
        doc.rect(x, cardTop, cardWidth, 48).fill('#FFFFFF').stroke('#E2E8F0');
        doc.fillColor('#64748B').fontSize(7.5).font('Helvetica-Bold').text(c.label.toUpperCase(), x + 8, cardTop + 8);
        doc.fillColor('#1E3A5F').fontSize(11).font('Helvetica-Bold').text(c.value, x + 8, cardTop + 24);
      });

      // Risk Analysis Section
      let currentY = 260;
      doc.fillColor('#1E3A5F').fontSize(12).font('Helvetica-Bold').text('Academic Risk Assessment & Explanation', 40, currentY);
      currentY += 18;

      doc.rect(40, currentY, 515, 45).fill('#EFF6FF').stroke('#BFDBFE');
      doc.fillColor('#1E40AF').fontSize(9).font('Helvetica').text(riskData.explanation, 50, currentY + 10, { width: 495, lineGap: 3 });
      currentY += 55;

      // Subject Performance Table
      doc.fillColor('#1E3A5F').fontSize(12).font('Helvetica-Bold').text('Current Course Focus & Recommendations', 40, currentY);
      currentY += 18;

      // Table Header
      doc.rect(40, currentY, 515, 20).fill('#1E3A5F');
      doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
      doc.text('CODE', 48, currentY + 6);
      doc.text('SUBJECT NAME', 105, currentY + 6);
      doc.text('CREDITS', 270, currentY + 6);
      doc.text('INTERNAL', 320, currentY + 6);
      doc.text('ATTENDANCE', 380, currentY + 6);
      doc.text('RISK LEVEL', 460, currentY + 6);
      currentY += 20;

      riskData.subjectFocus.forEach((sub, index) => {
        const rowBg = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
        doc.rect(40, currentY, 515, 22).fill(rowBg).stroke('#E2E8F0');

        doc.fillColor('#0F172A').fontSize(8).font('Helvetica');
        doc.text(sub.code, 48, currentY + 7);
        doc.text(sub.name.length > 32 ? sub.name.substring(0, 30) + '...' : sub.name, 105, currentY + 7);
        doc.text(`${sub.credits}`, 280, currentY + 7);
        doc.text(sub.internalAverage !== null ? `${sub.internalAverage}%` : 'N/A', 330, currentY + 7);
        doc.text(sub.attendancePercentage !== null ? `${sub.attendancePercentage}%` : 'N/A', 395, currentY + 7);

        const riskColor = sub.riskLevel === 'HIGH' ? '#DC2626' : sub.riskLevel === 'MEDIUM' ? '#D97706' : '#059669';
        doc.fillColor(riskColor).font('Helvetica-Bold').text(sub.riskLevel, 465, currentY + 7);

        currentY += 22;
      });

      // Recommendations list
      currentY += 15;
      doc.fillColor('#1E3A5F').fontSize(11).font('Helvetica-Bold').text('Recommended Academic Actions', 40, currentY);
      currentY += 16;

      riskData.recommendations.forEach((rec) => {
        doc.fillColor('#2563EB').fontSize(8).font('Helvetica-Bold').text('•', 45, currentY);
        doc.fillColor('#334155').fontSize(8.5).font('Helvetica').text(rec, 55, currentY, { width: 500 });
        currentY += 16;
      });

      // Institutional Footer
      doc.fontSize(7.5).fillColor('#94A3B8').text(
        'This is a read-only computer-generated academic audit report from SCRIS. Grades and marks are verified via institutional database integration.',
        40,
        780,
        { align: 'center', width: 515 }
      );

      doc.end();
    });
  }
}
