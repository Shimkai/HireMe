import ExcelJS from 'exceljs';
import { PassThrough } from 'stream';

interface ApplicationExportData {
  registrationId: string | null;
  name: string;
  email: string;
  branch: string;
  college: string;
  graduationYear: number | null;
  cgpa: number | null;
  tenthPercentage: number | null;
  twelfthPercentage: number | null;
  recommendationPercentage: number;
  applicationStatus: string;
  appliedAt: Date;
  recruiterNotes: string | null;
}

export const generateApplicationsExcel = async (
  applications: ApplicationExportData[],
  jobTitle: string,
  companyName: string
): Promise<PassThrough> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HireMe Platform';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.title = `${jobTitle} Applicants - ${companyName}`;
  workbook.subject = 'Recruiter Export';

  const worksheet = workbook.addWorksheet('Applications');

  // Set column headers
  worksheet.columns = [
    { header: 'ID', key: 'registrationId', width: 18 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Branch', key: 'branch', width: 20 },
    { header: 'College', key: 'college', width: 30 },
    { header: 'Graduation Year', key: 'graduationYear', width: 18 },
    { header: 'CGPA', key: 'cgpa', width: 12 },
    { header: '10th Percentage', key: 'tenthPercentage', width: 18 },
    { header: '12th Percentage', key: 'twelfthPercentage', width: 18 },
    { header: 'Recommendation %', key: 'recommendationPercentage', width: 20 },
    { header: 'Application Status', key: 'applicationStatus', width: 20 },
    { header: 'Applied At', key: 'appliedAt', width: 20 },
    { header: 'Recruiter Notes', key: 'recruiterNotes', width: 40 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true, size: 12 };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  worksheet.getRow(1).font = { ...worksheet.getRow(1).font, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 25;

  // Add data rows
  applications.forEach((app) => {
    const row = worksheet.addRow({
      registrationId: app.registrationId || 'N/A',
      name: app.name || 'N/A',
      email: app.email || 'N/A',
      branch: app.branch || 'N/A',
      college: app.college || 'N/A',
      graduationYear: app.graduationYear || 'N/A',
      cgpa: app.cgpa !== null && app.cgpa !== undefined ? app.cgpa : 'N/A',
      tenthPercentage: app.tenthPercentage !== null && app.tenthPercentage !== undefined ? app.tenthPercentage : 'N/A',
      twelfthPercentage: app.twelfthPercentage !== null && app.twelfthPercentage !== undefined ? app.twelfthPercentage : 'N/A',
      recommendationPercentage: app.recommendationPercentage || 0,
      applicationStatus: app.applicationStatus || 'N/A',
      appliedAt: app.appliedAt ? new Date(app.appliedAt).toLocaleString() : 'N/A',
      recruiterNotes: app.recruiterNotes || 'N/A',
    });

    // Style data rows
    row.alignment = { vertical: 'middle', horizontal: 'left' };
    row.height = 20;
  });

  // Format date columns
  worksheet.getColumn('appliedAt').numFmt = 'dd/mm/yyyy hh:mm:ss';

  // Format percentage columns (as numbers with 2 decimal places)
  worksheet.getColumn('recommendationPercentage').numFmt = '0.00';
  worksheet.getColumn('tenthPercentage').numFmt = '0.00';
  worksheet.getColumn('twelfthPercentage').numFmt = '0.00';

  // Freeze header row
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  // Create a stream and write workbook to it
  const stream = new PassThrough();
  workbook.xlsx.write(stream).catch((error: Error) => {
    stream.destroy(error);
  });

  return stream;
};

interface StudentExportRow {
  id: string;
  name: string;
  email: string;
  branch: string;
  college: string;
  verificationStatus: string;
  placementStatus: string;
  companyName?: string;
  graduationYear?: number | null;
  cgpa?: number | null;
  tenthPercentage?: number | null;
  twelfthPercentage?: number | null;
  applicationStatusWithCompany?: string;
  skills?: string;
}

export const generateStudentsExcel = async (
  rows: StudentExportRow[],
  options?: { includeAcademic?: boolean; includeSkills?: boolean }
): Promise<PassThrough> => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'HireMe Platform';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.title = 'Student Records';
  workbook.subject = 'TnP Export';

  const worksheet = workbook.addWorksheet('Student Records');

  const includeAcademic = options?.includeAcademic;
  const includeSkills = options?.includeSkills;

  const baseColumns: Partial<ExcelJS.Column>[] = [
    { header: 'ID', key: 'id', width: 18 },
    { header: 'Name', key: 'name', width: 22 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Branch', key: 'branch', width: 22 },
    { header: 'College', key: 'college', width: 32 },
    { header: 'Verification Status', key: 'verificationStatus', width: 16 },
    { header: 'Placement Status', key: 'placementStatus', width: 16 },
    { header: 'Company Name', key: 'companyName', width: 24 },
  ];

  const academicColumns: Partial<ExcelJS.Column>[] = [
    { header: 'Graduation Year', key: 'graduationYear', width: 16 },
    { header: 'CGPA', key: 'cgpa', width: 10 },
    { header: '10th Percentage', key: 'tenthPercentage', width: 16 },
    { header: '12th Percentage', key: 'twelfthPercentage', width: 16 },
  ];

  const skillsColumns: Partial<ExcelJS.Column>[] = [
    { header: 'Skills', key: 'skills', width: 36 },
  ];

  worksheet.columns = [
    ...baseColumns,
    ...(includeAcademic ? academicColumns : []),
    ...(includeSkills ? skillsColumns : []),
  ];

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1F4E79' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  headerRow.height = 22;

  rows.forEach((rowData) => {
    const row = worksheet.addRow(rowData);
    row.alignment = { vertical: 'middle' };
  });

  // Center numeric columns by looking up their index from the configured columns
  const centerKeys = ['cgpa', 'tenthPercentage', 'twelfthPercentage', 'graduationYear'];
  centerKeys.forEach((key) => {
    const colIndex = worksheet.columns.findIndex((c) => c && c.key === key);
    if (colIndex !== -1) {
      const col = worksheet.getColumn(colIndex + 1);
      col.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  });

  // Basic number formats for numeric columns
  const cgpaIndex = worksheet.columns.findIndex((c) => c && c.key === 'cgpa');
  if (cgpaIndex !== -1) {
    const cgpaCol = worksheet.getColumn(cgpaIndex + 1);
    cgpaCol.numFmt = '0.0';
  }

  const tenthIndex = worksheet.columns.findIndex((c) => c && c.key === 'tenthPercentage');
  if (tenthIndex !== -1) {
    const tenthCol = worksheet.getColumn(tenthIndex + 1);
    tenthCol.numFmt = '0.00';
  }

  const twelfthIndex = worksheet.columns.findIndex((c) => c && c.key === 'twelfthPercentage');
  if (twelfthIndex !== -1) {
    const twelfthCol = worksheet.getColumn(twelfthIndex + 1);
    twelfthCol.numFmt = '0.00';
  }

  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  const stream = new PassThrough();
  workbook.xlsx.write(stream).catch((error: Error) => {
    stream.destroy(error);
  });

  return stream;
};

