export interface AnnaUniversitySubject {
  code: string;
  name: string;
  credits: number;
  semester: number;
  department: string;
  regulation?: string;
  category?: string;
}

export const ANNA_UNIVERSITY_DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Artificial Intelligence and Data Science',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
] as const;

export type AnnaUniversityDepartment = typeof ANNA_UNIVERSITY_DEPARTMENTS[number];

/**
 * Official Anna University Curriculum — Regulation 2021 (R-2021)
 * All 8 Semesters across Engineering Departments
 */
export const ANNA_UNIVERSITY_CURRICULUM: AnnaUniversitySubject[] = [
  // ==========================================
  // 1. COMPUTER SCIENCE AND ENGINEERING (CSE)
  // ==========================================
  // Semester 1
  { code: 'HS3152', name: 'Professional English - I', credits: 3, semester: 1, department: 'Computer Science and Engineering', category: 'HSMC' },
  { code: 'MA3151', name: 'Matrices and Calculus', credits: 4, semester: 1, department: 'Computer Science and Engineering', category: 'BSC' },
  { code: 'PH3151', name: 'Engineering Physics', credits: 3, semester: 1, department: 'Computer Science and Engineering', category: 'BSC' },
  { code: 'CY3151', name: 'Engineering Chemistry', credits: 3, semester: 1, department: 'Computer Science and Engineering', category: 'BSC' },
  { code: 'GE3151', name: 'Problem Solving and Python Programming', credits: 3, semester: 1, department: 'Computer Science and Engineering', category: 'ESC' },
  { code: 'GE3152', name: 'Heritage of Tamils / Tamil Marabu', credits: 1, semester: 1, department: 'Computer Science and Engineering', category: 'HSMC' },
  { code: 'GE3171', name: 'Python Programming Laboratory', credits: 2, semester: 1, department: 'Computer Science and Engineering', category: 'ESC' },
  { code: 'BS3171', name: 'Physics and Chemistry Laboratory', credits: 2, semester: 1, department: 'Computer Science and Engineering', category: 'BSC' },
  { code: 'GE3172', name: 'English Laboratory', credits: 1, semester: 1, department: 'Computer Science and Engineering', category: 'HSMC' },

  // Semester 2
  { code: 'HS3252', name: 'Professional English - II', credits: 2, semester: 2, department: 'Computer Science and Engineering', category: 'HSMC' },
  { code: 'MA3251', name: 'Statistics and Numerical Methods', credits: 4, semester: 2, department: 'Computer Science and Engineering', category: 'BSC' },
  { code: 'PH3256', name: 'Physics for Information Science', credits: 3, semester: 2, department: 'Computer Science and Engineering', category: 'BSC' },
  { code: 'BE3251', name: 'Basic Electrical and Electronics Engineering', credits: 3, semester: 2, department: 'Computer Science and Engineering', category: 'ESC' },
  { code: 'GE3251', name: 'Engineering Graphics', credits: 4, semester: 2, department: 'Computer Science and Engineering', category: 'ESC' },
  { code: 'CS3251', name: 'Programming in C', credits: 3, semester: 2, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'GE3252', name: 'Tamils and Technology', credits: 1, semester: 2, department: 'Computer Science and Engineering', category: 'HSMC' },
  { code: 'CS3271', name: 'Programming in C Laboratory', credits: 2, semester: 2, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'GE3271', name: 'Engineering Practices Laboratory', credits: 2, semester: 2, department: 'Computer Science and Engineering', category: 'ESC' },

  // Semester 3
  { code: 'MA3354', name: 'Discrete Mathematics', credits: 4, semester: 3, department: 'Computer Science and Engineering', category: 'BSC' },
  { code: 'CS3351', name: 'Digital Principles and Computer Organization', credits: 4, semester: 3, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'CS3352', name: 'Foundations of Data Science', credits: 3, semester: 3, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'CS3301', name: 'Data Structures', credits: 3, semester: 3, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'CS3391', name: 'Object Oriented Programming', credits: 3, semester: 3, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'CS3311', name: 'Data Structures Laboratory', credits: 2, semester: 3, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'CS3381', name: 'Object Oriented Programming Laboratory', credits: 2, semester: 3, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'CS3361', name: 'Data Science Laboratory', credits: 2, semester: 3, department: 'Computer Science and Engineering', category: 'PCC' },

  // Semester 4
  { code: 'CS3452', name: 'Theory of Computation', credits: 3, semester: 4, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'CS3491', name: 'Artificial Intelligence and Machine Learning', credits: 4, semester: 4, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'CS3492', name: 'Database Management Systems', credits: 3, semester: 4, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'CS3401', name: 'Algorithms', credits: 4, semester: 4, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'CS3451', name: 'Introduction to Operating Systems', credits: 3, semester: 4, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'GE3451', name: 'Environmental Sciences and Sustainability', credits: 2, semester: 4, department: 'Computer Science and Engineering', category: 'BSC' },
  { code: 'CS3461', name: 'Operating Systems Laboratory', credits: 2, semester: 4, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'CS3481', name: 'Database Management Systems Laboratory', credits: 2, semester: 4, department: 'Computer Science and Engineering', category: 'PCC' },

  // Semester 5
  { code: 'CS3591', name: 'Computer Networks', credits: 4, semester: 5, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'CS3501', name: 'Compiler Design', credits: 4, semester: 5, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'CB3491', name: 'Cryptography and Cyber Security', credits: 3, semester: 5, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'CS3551', name: 'Distributed Computing', credits: 3, semester: 5, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'CCS335', name: 'Cloud Computing Architecture', credits: 3, semester: 5, department: 'Computer Science and Engineering', category: 'PEC' },
  { code: 'CS3561', name: 'Compiler Design Laboratory', credits: 2, semester: 5, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'CS3571', name: 'Security Laboratory', credits: 2, semester: 5, department: 'Computer Science and Engineering', category: 'PCC' },

  // Semester 6
  { code: 'CS3691', name: 'Embedded Systems and IoT', credits: 4, semester: 6, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'CCS341', name: 'Data Warehousing and Data Mining', credits: 3, semester: 6, department: 'Computer Science and Engineering', category: 'PEC' },
  { code: 'CCS356', name: 'Object Oriented Software Engineering', credits: 3, semester: 6, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'CS3601', name: 'Big Data Analytics', credits: 3, semester: 6, department: 'Computer Science and Engineering', category: 'PEC' },
  { code: 'CS3681', name: 'Embedded Systems and IoT Laboratory', credits: 2, semester: 6, department: 'Computer Science and Engineering', category: 'PCC' },
  { code: 'CS3682', name: 'Mobile Application Development Laboratory', credits: 2, semester: 6, department: 'Computer Science and Engineering', category: 'PCC' },

  // Semester 7
  { code: 'GE3791', name: 'Human Values and Ethics', credits: 2, semester: 7, department: 'Computer Science and Engineering', category: 'HSMC' },
  { code: 'CCS334', name: 'Deep Learning Techniques', credits: 3, semester: 7, department: 'Computer Science and Engineering', category: 'PEC' },
  { code: 'CCS332', name: 'Blockchain Technologies', credits: 3, semester: 7, department: 'Computer Science and Engineering', category: 'PEC' },
  { code: 'CS3701', name: 'Full Stack Web Development', credits: 3, semester: 7, department: 'Computer Science and Engineering', category: 'PEC' },
  { code: 'CS3711', name: 'Summer Internship / Industrial Training', credits: 2, semester: 7, department: 'Computer Science and Engineering', category: 'EEC' },

  // Semester 8
  { code: 'CS3811', name: 'Project Work / Inter-Disciplinary Capstone Project', credits: 10, semester: 8, department: 'Computer Science and Engineering', category: 'EEC' },

  // ==========================================
  // 2. INFORMATION TECHNOLOGY (IT)
  // ==========================================
  // Semester 1
  { code: 'HS3152', name: 'Professional English - I', credits: 3, semester: 1, department: 'Information Technology', category: 'HSMC' },
  { code: 'MA3151', name: 'Matrices and Calculus', credits: 4, semester: 1, department: 'Information Technology', category: 'BSC' },
  { code: 'PH3151', name: 'Engineering Physics', credits: 3, semester: 1, department: 'Information Technology', category: 'BSC' },
  { code: 'CY3151', name: 'Engineering Chemistry', credits: 3, semester: 1, department: 'Information Technology', category: 'BSC' },
  { code: 'GE3151', name: 'Problem Solving and Python Programming', credits: 3, semester: 1, department: 'Information Technology', category: 'ESC' },
  { code: 'GE3152', name: 'Heritage of Tamils / Tamil Marabu', credits: 1, semester: 1, department: 'Information Technology', category: 'HSMC' },
  { code: 'GE3171', name: 'Python Programming Laboratory', credits: 2, semester: 1, department: 'Information Technology', category: 'ESC' },
  { code: 'BS3171', name: 'Physics and Chemistry Laboratory', credits: 2, semester: 1, department: 'Information Technology', category: 'BSC' },

  // Semester 2
  { code: 'HS3252', name: 'Professional English - II', credits: 2, semester: 2, department: 'Information Technology', category: 'HSMC' },
  { code: 'MA3251', name: 'Statistics and Numerical Methods', credits: 4, semester: 2, department: 'Information Technology', category: 'BSC' },
  { code: 'PH3256', name: 'Physics for Information Science', credits: 3, semester: 2, department: 'Information Technology', category: 'BSC' },
  { code: 'BE3251', name: 'Basic Electrical and Electronics Engineering', credits: 3, semester: 2, department: 'Information Technology', category: 'ESC' },
  { code: 'GE3251', name: 'Engineering Graphics', credits: 4, semester: 2, department: 'Information Technology', category: 'ESC' },
  { code: 'CS3251', name: 'Programming in C', credits: 3, semester: 2, department: 'Information Technology', category: 'PCC' },
  { code: 'CS3271', name: 'Programming in C Laboratory', credits: 2, semester: 2, department: 'Information Technology', category: 'PCC' },
  { code: 'GE3271', name: 'Engineering Practices Laboratory', credits: 2, semester: 2, department: 'Information Technology', category: 'ESC' },

  // Semester 3
  { code: 'MA3354', name: 'Discrete Mathematics', credits: 4, semester: 3, department: 'Information Technology', category: 'BSC' },
  { code: 'CS3351', name: 'Digital Principles and Computer Organization', credits: 4, semester: 3, department: 'Information Technology', category: 'PCC' },
  { code: 'CS3352', name: 'Foundations of Data Science', credits: 3, semester: 3, department: 'Information Technology', category: 'PCC' },
  { code: 'IT3301', name: 'Data Structures and Algorithms', credits: 3, semester: 3, department: 'Information Technology', category: 'PCC' },
  { code: 'IT3351', name: 'Object Oriented Programming and Java', credits: 3, semester: 3, department: 'Information Technology', category: 'PCC' },
  { code: 'IT3311', name: 'Data Structures Laboratory', credits: 2, semester: 3, department: 'Information Technology', category: 'PCC' },
  { code: 'IT3361', name: 'Java Programming Laboratory', credits: 2, semester: 3, department: 'Information Technology', category: 'PCC' },

  // Semester 4
  { code: 'CS3491', name: 'Artificial Intelligence and Machine Learning', credits: 4, semester: 4, department: 'Information Technology', category: 'PCC' },
  { code: 'CS3492', name: 'Database Management Systems', credits: 3, semester: 4, department: 'Information Technology', category: 'PCC' },
  { code: 'IT3401', name: 'Web Essentials', credits: 3, semester: 4, department: 'Information Technology', category: 'PCC' },
  { code: 'CS3451', name: 'Introduction to Operating Systems', credits: 3, semester: 4, department: 'Information Technology', category: 'PCC' },
  { code: 'GE3451', name: 'Environmental Sciences and Sustainability', credits: 2, semester: 4, department: 'Information Technology', category: 'BSC' },
  { code: 'IT3411', name: 'Web Essentials Laboratory', credits: 2, semester: 4, department: 'Information Technology', category: 'PCC' },
  { code: 'CS3461', name: 'Operating Systems Laboratory', credits: 2, semester: 4, department: 'Information Technology', category: 'PCC' },
  { code: 'CS3481', name: 'Database Management Systems Laboratory', credits: 2, semester: 4, department: 'Information Technology', category: 'PCC' },

  // Semester 5
  { code: 'CS3591', name: 'Computer Networks', credits: 4, semester: 5, department: 'Information Technology', category: 'PCC' },
  { code: 'IT3501', name: 'Full Stack Web Development', credits: 4, semester: 5, department: 'Information Technology', category: 'PCC' },
  { code: 'IT3502', name: 'Design and Analysis of Algorithms', credits: 3, semester: 5, department: 'Information Technology', category: 'PCC' },
  { code: 'CB3491', name: 'Cryptography and Cyber Security', credits: 3, semester: 5, department: 'Information Technology', category: 'PCC' },
  { code: 'CCS335', name: 'Cloud Services and Virtualization', credits: 3, semester: 5, department: 'Information Technology', category: 'PEC' },
  { code: 'IT3511', name: 'Full Stack Web Development Laboratory', credits: 2, semester: 5, department: 'Information Technology', category: 'PCC' },
  { code: 'CS3571', name: 'Security Laboratory', credits: 2, semester: 5, department: 'Information Technology', category: 'PCC' },

  // Semester 6
  { code: 'IT3601', name: 'Computational Intelligence', credits: 3, semester: 6, department: 'Information Technology', category: 'PCC' },
  { code: 'CS3691', name: 'Embedded Systems and IoT', credits: 4, semester: 6, department: 'Information Technology', category: 'PCC' },
  { code: 'IT3602', name: 'Mobile Computing', credits: 3, semester: 6, department: 'Information Technology', category: 'PEC' },
  { code: 'CCS366', name: 'Software Testing and Quality Assurance', credits: 3, semester: 6, department: 'Information Technology', category: 'PEC' },
  { code: 'IT3611', name: 'Computational Intelligence Laboratory', credits: 2, semester: 6, department: 'Information Technology', category: 'PCC' },
  { code: 'CS3681', name: 'Embedded Systems and IoT Laboratory', credits: 2, semester: 6, department: 'Information Technology', category: 'PCC' },

  // Semester 7
  { code: 'GE3791', name: 'Human Values and Ethics', credits: 2, semester: 7, department: 'Information Technology', category: 'HSMC' },
  { code: 'IT3701', name: 'Information Storage and Management', credits: 3, semester: 7, department: 'Information Technology', category: 'PCC' },
  { code: 'CCS370', name: 'DevOps and Microservices', credits: 3, semester: 7, department: 'Information Technology', category: 'PEC' },
  { code: 'CCS338', name: 'Cyber Forensics and Incident Response', credits: 3, semester: 7, department: 'Information Technology', category: 'PEC' },
  { code: 'IT3711', name: 'Summer Internship / Industrial Training', credits: 2, semester: 7, department: 'Information Technology', category: 'EEC' },

  // Semester 8
  { code: 'IT3811', name: 'Project Work', credits: 10, semester: 8, department: 'Information Technology', category: 'EEC' },

  // =======================================================
  // 3. ARTIFICIAL INTELLIGENCE AND DATA SCIENCE (AI & DS)
  // =======================================================
  // Semester 1
  { code: 'HS3152', name: 'Professional English - I', credits: 3, semester: 1, department: 'Artificial Intelligence and Data Science', category: 'HSMC' },
  { code: 'MA3151', name: 'Matrices and Calculus', credits: 4, semester: 1, department: 'Artificial Intelligence and Data Science', category: 'BSC' },
  { code: 'PH3151', name: 'Engineering Physics', credits: 3, semester: 1, department: 'Artificial Intelligence and Data Science', category: 'BSC' },
  { code: 'CY3151', name: 'Engineering Chemistry', credits: 3, semester: 1, department: 'Artificial Intelligence and Data Science', category: 'BSC' },
  { code: 'GE3151', name: 'Problem Solving and Python Programming', credits: 3, semester: 1, department: 'Artificial Intelligence and Data Science', category: 'ESC' },
  { code: 'GE3171', name: 'Python Programming Laboratory', credits: 2, semester: 1, department: 'Artificial Intelligence and Data Science', category: 'ESC' },

  // Semester 2
  { code: 'HS3252', name: 'Professional English - II', credits: 2, semester: 2, department: 'Artificial Intelligence and Data Science', category: 'HSMC' },
  { code: 'MA3251', name: 'Statistics and Numerical Methods', credits: 4, semester: 2, department: 'Artificial Intelligence and Data Science', category: 'BSC' },
  { code: 'PH3256', name: 'Physics for Information Science', credits: 3, semester: 2, department: 'Artificial Intelligence and Data Science', category: 'BSC' },
  { code: 'BE3251', name: 'Basic Electrical and Electronics Engineering', credits: 3, semester: 2, department: 'Artificial Intelligence and Data Science', category: 'ESC' },
  { code: 'CS3251', name: 'Programming in C', credits: 3, semester: 2, department: 'Artificial Intelligence and Data Science', category: 'PCC' },
  { code: 'CS3271', name: 'Programming in C Laboratory', credits: 2, semester: 2, department: 'Artificial Intelligence and Data Science', category: 'PCC' },

  // Semester 3
  { code: 'MA3354', name: 'Discrete Mathematics', credits: 4, semester: 3, department: 'Artificial Intelligence and Data Science', category: 'BSC' },
  { code: 'AD3301', name: 'Data Design and Analysis of Algorithms', credits: 3, semester: 3, department: 'Artificial Intelligence and Data Science', category: 'PCC' },
  { code: 'AD3351', name: 'Design and Analysis of Machine Learning', credits: 3, semester: 3, department: 'Artificial Intelligence and Data Science', category: 'PCC' },
  { code: 'CS3352', name: 'Foundations of Data Science', credits: 3, semester: 3, department: 'Artificial Intelligence and Data Science', category: 'PCC' },
  { code: 'AD3391', name: 'Database Design and Management', credits: 3, semester: 3, department: 'Artificial Intelligence and Data Science', category: 'PCC' },
  { code: 'AD3311', name: 'Artificial Intelligence Laboratory', credits: 2, semester: 3, department: 'Artificial Intelligence and Data Science', category: 'PCC' },

  // Semester 4
  { code: 'MA3391', name: 'Probability and Statistics', credits: 4, semester: 4, department: 'Artificial Intelligence and Data Science', category: 'BSC' },
  { code: 'AL3452', name: 'Operating Systems and System Software', credits: 3, semester: 4, department: 'Artificial Intelligence and Data Science', category: 'PCC' },
  { code: 'AD3491', name: 'Fundamentals of Data Science and Analytics', credits: 3, semester: 4, department: 'Artificial Intelligence and Data Science', category: 'PCC' },
  { code: 'AD3401', name: 'Introduction to Deep Learning', credits: 3, semester: 4, department: 'Artificial Intelligence and Data Science', category: 'PCC' },
  { code: 'GE3451', name: 'Environmental Sciences and Sustainability', credits: 2, semester: 4, department: 'Artificial Intelligence and Data Science', category: 'BSC' },
  { code: 'AD3411', name: 'Data Analytics Laboratory', credits: 2, semester: 4, department: 'Artificial Intelligence and Data Science', category: 'PCC' },

  // Semester 5
  { code: 'CW3551', name: 'Data and Information Security', credits: 3, semester: 5, department: 'Artificial Intelligence and Data Science', category: 'PCC' },
  { code: 'CS3591', name: 'Computer Networks', credits: 4, semester: 5, department: 'Artificial Intelligence and Data Science', category: 'PCC' },
  { code: 'AD3501', name: 'Deep Learning Techniques', credits: 3, semester: 5, department: 'Artificial Intelligence and Data Science', category: 'PCC' },
  { code: 'AD3551', name: 'Natural Language Processing', credits: 3, semester: 5, department: 'Artificial Intelligence and Data Science', category: 'PCC' },
  { code: 'CCS335', name: 'Cloud Computing Architecture', credits: 3, semester: 5, department: 'Artificial Intelligence and Data Science', category: 'PEC' },
  { code: 'AD3511', name: 'Deep Learning Laboratory', credits: 2, semester: 5, department: 'Artificial Intelligence and Data Science', category: 'PCC' },

  // Semester 6
  { code: 'AD3601', name: 'Computer Vision', credits: 3, semester: 6, department: 'Artificial Intelligence and Data Science', category: 'PCC' },
  { code: 'CS3691', name: 'Embedded Systems and IoT', credits: 4, semester: 6, department: 'Artificial Intelligence and Data Science', category: 'PCC' },
  { code: 'AD3602', name: 'Big Data Technologies', credits: 3, semester: 6, department: 'Artificial Intelligence and Data Science', category: 'PEC' },
  { code: 'AD3611', name: 'Computer Vision Laboratory', credits: 2, semester: 6, department: 'Artificial Intelligence and Data Science', category: 'PCC' },

  // Semester 7
  { code: 'GE3791', name: 'Human Values and Ethics', credits: 2, semester: 7, department: 'Artificial Intelligence and Data Science', category: 'HSMC' },
  { code: 'AD3701', name: 'Reinforcement Learning', credits: 3, semester: 7, department: 'Artificial Intelligence and Data Science', category: 'PEC' },
  { code: 'AD3702', name: 'Generative AI and Large Language Models', credits: 3, semester: 7, department: 'Artificial Intelligence and Data Science', category: 'PEC' },
  { code: 'AD3711', name: 'Summer Internship', credits: 2, semester: 7, department: 'Artificial Intelligence and Data Science', category: 'EEC' },

  // Semester 8
  { code: 'AD3811', name: 'Project Work', credits: 10, semester: 8, department: 'Artificial Intelligence and Data Science', category: 'EEC' },

  // ========================================================
  // 4. ELECTRONICS AND COMMUNICATION ENGINEERING (ECE)
  // ========================================================
  // Semester 1
  { code: 'HS3152', name: 'Professional English - I', credits: 3, semester: 1, department: 'Electronics and Communication Engineering', category: 'HSMC' },
  { code: 'MA3151', name: 'Matrices and Calculus', credits: 4, semester: 1, department: 'Electronics and Communication Engineering', category: 'BSC' },
  { code: 'PH3151', name: 'Engineering Physics', credits: 3, semester: 1, department: 'Electronics and Communication Engineering', category: 'BSC' },
  { code: 'CY3151', name: 'Engineering Chemistry', credits: 3, semester: 1, department: 'Electronics and Communication Engineering', category: 'BSC' },
  { code: 'GE3151', name: 'Problem Solving and Python Programming', credits: 3, semester: 1, department: 'Electronics and Communication Engineering', category: 'ESC' },
  { code: 'GE3171', name: 'Python Programming Laboratory', credits: 2, semester: 1, department: 'Electronics and Communication Engineering', category: 'ESC' },

  // Semester 2
  { code: 'HS3252', name: 'Professional English - II', credits: 2, semester: 2, department: 'Electronics and Communication Engineering', category: 'HSMC' },
  { code: 'MA3251', name: 'Statistics and Numerical Methods', credits: 4, semester: 2, department: 'Electronics and Communication Engineering', category: 'BSC' },
  { code: 'PH3254', name: 'Physics for Electronics Engineering', credits: 3, semester: 2, department: 'Electronics and Communication Engineering', category: 'BSC' },
  { code: 'BE3254', name: 'Electrical and Instrumentation Engineering', credits: 3, semester: 2, department: 'Electronics and Communication Engineering', category: 'ESC' },
  { code: 'GE3251', name: 'Engineering Graphics', credits: 4, semester: 2, department: 'Electronics and Communication Engineering', category: 'ESC' },
  { code: 'EC3251', name: 'Circuit Analysis', credits: 4, semester: 2, department: 'Electronics and Communication Engineering', category: 'PCC' },
  { code: 'EC3271', name: 'Circuits and Devices Laboratory', credits: 2, semester: 2, department: 'Electronics and Communication Engineering', category: 'PCC' },

  // Semester 3
  { code: 'MA3355', name: 'Random Processes and Linear Algebra', credits: 4, semester: 3, department: 'Electronics and Communication Engineering', category: 'BSC' },
  { code: 'EC3354', name: 'Signals and Systems', credits: 4, semester: 3, department: 'Electronics and Communication Engineering', category: 'PCC' },
  { code: 'EC3351', name: 'Electronic Devices and Circuits', credits: 3, semester: 3, department: 'Electronics and Communication Engineering', category: 'PCC' },
  { code: 'EC3352', name: 'Digital System Design', credits: 4, semester: 3, department: 'Electronics and Communication Engineering', category: 'PCC' },
  { code: 'CS3353', name: 'C Programming and Data Structures', credits: 3, semester: 3, department: 'Electronics and Communication Engineering', category: 'ESC' },
  { code: 'EC3361', name: 'Electronic Devices and Circuits Laboratory', credits: 2, semester: 3, department: 'Electronics and Communication Engineering', category: 'PCC' },

  // Semester 4
  { code: 'EC3452', name: 'Electromagnetic Fields', credits: 3, semester: 4, department: 'Electronics and Communication Engineering', category: 'PCC' },
  { code: 'EC3401', name: 'Networks and Security', credits: 4, semester: 4, department: 'Electronics and Communication Engineering', category: 'PCC' },
  { code: 'EC3451', name: 'Linear Integrated Circuits', credits: 3, semester: 4, department: 'Electronics and Communication Engineering', category: 'PCC' },
  { code: 'EC3492', name: 'Digital Signal Processing', credits: 4, semester: 4, department: 'Electronics and Communication Engineering', category: 'PCC' },
  { code: 'EC3491', name: 'Communication Theory', credits: 3, semester: 4, department: 'Electronics and Communication Engineering', category: 'PCC' },
  { code: 'GE3451', name: 'Environmental Sciences and Sustainability', credits: 2, semester: 4, department: 'Electronics and Communication Engineering', category: 'BSC' },
  { code: 'EC3461', name: 'Communication Systems Laboratory', credits: 2, semester: 4, department: 'Electronics and Communication Engineering', category: 'PCC' },

  // Semester 5
  { code: 'EC3501', name: 'Wireless Communication', credits: 4, semester: 5, department: 'Electronics and Communication Engineering', category: 'PCC' },
  { code: 'EC3552', name: 'VLSI and Chip Design', credits: 3, semester: 5, department: 'Electronics and Communication Engineering', category: 'PCC' },
  { code: 'EC3551', name: 'Transmission Lines and RF Systems', credits: 3, semester: 5, department: 'Electronics and Communication Engineering', category: 'PCC' },
  { code: 'CS3592', name: 'Computer Architecture and Organization', credits: 3, semester: 5, department: 'Electronics and Communication Engineering', category: 'ESC' },
  { code: 'EC3561', name: 'VLSI Laboratory', credits: 2, semester: 5, department: 'Electronics and Communication Engineering', category: 'PCC' },

  // Semester 6
  { code: 'ET3491', name: 'Embedded Systems and IoT Design', credits: 4, semester: 6, department: 'Electronics and Communication Engineering', category: 'PCC' },
  { code: 'EC3651', name: 'Antennas and Microwave Engineering', credits: 3, semester: 6, department: 'Electronics and Communication Engineering', category: 'PCC' },
  { code: 'EC3652', name: 'Optical Communication', credits: 3, semester: 6, department: 'Electronics and Communication Engineering', category: 'PCC' },
  { code: 'EC3661', name: 'Microwave and Optical Laboratory', credits: 2, semester: 6, department: 'Electronics and Communication Engineering', category: 'PCC' },

  // Semester 7
  { code: 'GE3791', name: 'Human Values and Ethics', credits: 2, semester: 7, department: 'Electronics and Communication Engineering', category: 'HSMC' },
  { code: 'EC3701', name: 'Advanced Wireless Networks & 5G', credits: 3, semester: 7, department: 'Electronics and Communication Engineering', category: 'PEC' },
  { code: 'EC3702', name: 'Satellite Communication and Radar', credits: 3, semester: 7, department: 'Electronics and Communication Engineering', category: 'PEC' },
  { code: 'EC3711', name: 'Summer Internship', credits: 2, semester: 7, department: 'Electronics and Communication Engineering', category: 'EEC' },

  // Semester 8
  { code: 'EC3811', name: 'Project Work', credits: 10, semester: 8, department: 'Electronics and Communication Engineering', category: 'EEC' },

  // ========================================================
  // 5. ELECTRICAL AND ELECTRONICS ENGINEERING (EEE)
  // ========================================================
  // Semester 1 & 2
  { code: 'HS3152', name: 'Professional English - I', credits: 3, semester: 1, department: 'Electrical and Electronics Engineering', category: 'HSMC' },
  { code: 'MA3151', name: 'Matrices and Calculus', credits: 4, semester: 1, department: 'Electrical and Electronics Engineering', category: 'BSC' },
  { code: 'PH3151', name: 'Engineering Physics', credits: 3, semester: 1, department: 'Electrical and Electronics Engineering', category: 'BSC' },
  { code: 'CY3151', name: 'Engineering Chemistry', credits: 3, semester: 1, department: 'Electrical and Electronics Engineering', category: 'BSC' },
  { code: 'GE3151', name: 'Problem Solving and Python Programming', credits: 3, semester: 1, department: 'Electrical and Electronics Engineering', category: 'ESC' },
  { code: 'HS3252', name: 'Professional English - II', credits: 2, semester: 2, department: 'Electrical and Electronics Engineering', category: 'HSMC' },
  { code: 'MA3251', name: 'Statistics and Numerical Methods', credits: 4, semester: 2, department: 'Electrical and Electronics Engineering', category: 'BSC' },
  { code: 'EE3251', name: 'Electric Circuit Analysis', credits: 4, semester: 2, department: 'Electrical and Electronics Engineering', category: 'PCC' },
  { code: 'GE3251', name: 'Engineering Graphics', credits: 4, semester: 2, department: 'Electrical and Electronics Engineering', category: 'ESC' },

  // Semester 3
  { code: 'MA3353', name: 'Transforms and Partial Differential Equations', credits: 4, semester: 3, department: 'Electrical and Electronics Engineering', category: 'BSC' },
  { code: 'EE3301', name: 'Electromagnetic Fields', credits: 3, semester: 3, department: 'Electrical and Electronics Engineering', category: 'PCC' },
  { code: 'EE3302', name: 'Digital Logic Circuits', credits: 3, semester: 3, department: 'Electrical and Electronics Engineering', category: 'PCC' },
  { code: 'EE3303', name: 'Electron Devices and Circuits', credits: 3, semester: 3, department: 'Electrical and Electronics Engineering', category: 'PCC' },
  { code: 'EE3311', name: 'Electrical Machines Laboratory - I', credits: 2, semester: 3, department: 'Electrical and Electronics Engineering', category: 'PCC' },

  // Semester 4
  { code: 'EE3401', name: 'Transmission and Distribution', credits: 3, semester: 4, department: 'Electrical and Electronics Engineering', category: 'PCC' },
  { code: 'EE3402', name: 'Linear Integrated Circuits', credits: 3, semester: 4, department: 'Electrical and Electronics Engineering', category: 'PCC' },
  { code: 'EE3403', name: 'Measurements and Instrumentation', credits: 3, semester: 4, department: 'Electrical and Electronics Engineering', category: 'PCC' },
  { code: 'EE3404', name: 'Microprocessor and Microcontroller', credits: 3, semester: 4, department: 'Electrical and Electronics Engineering', category: 'PCC' },
  { code: 'GE3451', name: 'Environmental Sciences and Sustainability', credits: 2, semester: 4, department: 'Electrical and Electronics Engineering', category: 'BSC' },
  { code: 'EE3411', name: 'Linear and Digital Integrated Circuits Laboratory', credits: 2, semester: 4, department: 'Electrical and Electronics Engineering', category: 'PCC' },

  // Semester 5
  { code: 'EE3501', name: 'Power System Analysis', credits: 4, semester: 5, department: 'Electrical and Electronics Engineering', category: 'PCC' },
  { code: 'EE3502', name: 'Control Systems', credits: 4, semester: 5, department: 'Electrical and Electronics Engineering', category: 'PCC' },
  { code: 'EE3503', name: 'Power Electronics', credits: 3, semester: 5, department: 'Electrical and Electronics Engineering', category: 'PCC' },
  { code: 'EE3511', name: 'Control and Instrumentation Laboratory', credits: 2, semester: 5, department: 'Electrical and Electronics Engineering', category: 'PCC' },

  // Semester 6
  { code: 'EE3601', name: 'Protection and Switchgear', credits: 3, semester: 6, department: 'Electrical and Electronics Engineering', category: 'PCC' },
  { code: 'EE3602', name: 'Power System Operation and Control', credits: 3, semester: 6, department: 'Electrical and Electronics Engineering', category: 'PCC' },
  { code: 'EE3603', name: 'Electric Drives and Control', credits: 3, semester: 6, department: 'Electrical and Electronics Engineering', category: 'PCC' },
  { code: 'EE3611', name: 'Power Electronics and Drives Laboratory', credits: 2, semester: 6, department: 'Electrical and Electronics Engineering', category: 'PCC' },

  // Semester 7
  { code: 'GE3791', name: 'Human Values and Ethics', credits: 2, semester: 7, department: 'Electrical and Electronics Engineering', category: 'HSMC' },
  { code: 'EE3701', name: 'Renewable Energy Systems & Smart Grid', credits: 3, semester: 7, department: 'Electrical and Electronics Engineering', category: 'PCC' },
  { code: 'EE3702', name: 'High Voltage Engineering', credits: 3, semester: 7, department: 'Electrical and Electronics Engineering', category: 'PEC' },
  { code: 'EE3711', name: 'Summer Internship', credits: 2, semester: 7, department: 'Electrical and Electronics Engineering', category: 'EEC' },

  // Semester 8
  { code: 'EE3811', name: 'Project Work', credits: 10, semester: 8, department: 'Electrical and Electronics Engineering', category: 'EEC' },

  // ========================================================
  // 6. MECHANICAL ENGINEERING (MECH)
  // ========================================================
  // Semester 1 & 2
  { code: 'HS3152', name: 'Professional English - I', credits: 3, semester: 1, department: 'Mechanical Engineering', category: 'HSMC' },
  { code: 'MA3151', name: 'Matrices and Calculus', credits: 4, semester: 1, department: 'Mechanical Engineering', category: 'BSC' },
  { code: 'PH3151', name: 'Engineering Physics', credits: 3, semester: 1, department: 'Mechanical Engineering', category: 'BSC' },
  { code: 'CY3151', name: 'Engineering Chemistry', credits: 3, semester: 1, department: 'Mechanical Engineering', category: 'BSC' },
  { code: 'GE3151', name: 'Problem Solving and Python Programming', credits: 3, semester: 1, department: 'Mechanical Engineering', category: 'ESC' },
  { code: 'HS3252', name: 'Professional English - II', credits: 2, semester: 2, department: 'Mechanical Engineering', category: 'HSMC' },
  { code: 'MA3251', name: 'Statistics and Numerical Methods', credits: 4, semester: 2, department: 'Mechanical Engineering', category: 'BSC' },
  { code: 'ME3251', name: 'Manufacturing Processes', credits: 3, semester: 2, department: 'Mechanical Engineering', category: 'PCC' },
  { code: 'GE3251', name: 'Engineering Graphics', credits: 4, semester: 2, department: 'Mechanical Engineering', category: 'ESC' },

  // Semester 3
  { code: 'MA3351', name: 'Transforms and Partial Differential Equations', credits: 4, semester: 3, department: 'Mechanical Engineering', category: 'BSC' },
  { code: 'ME3351', name: 'Engineering Mechanics', credits: 3, semester: 3, department: 'Mechanical Engineering', category: 'ESC' },
  { code: 'ME3391', name: 'Engineering Thermodynamics', credits: 4, semester: 3, department: 'Mechanical Engineering', category: 'PCC' },
  { code: 'ME3392', name: 'Fluid Mechanics and Machinery', credits: 4, semester: 3, department: 'Mechanical Engineering', category: 'PCC' },
  { code: 'ME3381', name: 'Manufacturing Technology Laboratory', credits: 2, semester: 3, department: 'Mechanical Engineering', category: 'PCC' },

  // Semester 4
  { code: 'ME3451', name: 'Thermal Engineering', credits: 4, semester: 4, department: 'Mechanical Engineering', category: 'PCC' },
  { code: 'ME3491', name: 'Theory of Machines', credits: 3, semester: 4, department: 'Mechanical Engineering', category: 'PCC' },
  { code: 'ME3492', name: 'Hydraulics and Pneumatics', credits: 3, semester: 4, department: 'Mechanical Engineering', category: 'PCC' },
  { code: 'ME3493', name: 'Strength of Materials', credits: 3, semester: 4, department: 'Mechanical Engineering', category: 'PCC' },
  { code: 'GE3451', name: 'Environmental Sciences and Sustainability', credits: 2, semester: 4, department: 'Mechanical Engineering', category: 'BSC' },
  { code: 'ME3461', name: 'Thermal Engineering Laboratory', credits: 2, semester: 4, department: 'Mechanical Engineering', category: 'PCC' },

  // Semester 5
  { code: 'ME3591', name: 'Design of Machine Elements', credits: 4, semester: 5, department: 'Mechanical Engineering', category: 'PCC' },
  { code: 'ME3592', name: 'Metrology and Measurements', credits: 3, semester: 5, department: 'Mechanical Engineering', category: 'PCC' },
  { code: 'ME3593', name: 'Operations Research', credits: 3, semester: 5, department: 'Mechanical Engineering', category: 'PCC' },
  { code: 'ME3511', name: 'Metrology and Dynamics Laboratory', credits: 2, semester: 5, department: 'Mechanical Engineering', category: 'PCC' },

  // Semester 6
  { code: 'ME3691', name: 'Heat and Mass Transfer', credits: 4, semester: 6, department: 'Mechanical Engineering', category: 'PCC' },
  { code: 'ME3692', name: 'Computer Aided Design and Manufacturing', credits: 3, semester: 6, department: 'Mechanical Engineering', category: 'PCC' },
  { code: 'ME3693', name: 'Design of Transmission Systems', credits: 3, semester: 6, department: 'Mechanical Engineering', category: 'PCC' },
  { code: 'ME3611', name: 'Heat Transfer Laboratory', credits: 2, semester: 6, department: 'Mechanical Engineering', category: 'PCC' },

  // Semester 7
  { code: 'GE3791', name: 'Human Values and Ethics', credits: 2, semester: 7, department: 'Mechanical Engineering', category: 'HSMC' },
  { code: 'ME3791', name: 'Mechatronics and Robotics', credits: 3, semester: 7, department: 'Mechanical Engineering', category: 'PCC' },
  { code: 'ME3792', name: 'Power Plant Engineering', credits: 3, semester: 7, department: 'Mechanical Engineering', category: 'PEC' },
  { code: 'ME3711', name: 'Summer Internship', credits: 2, semester: 7, department: 'Mechanical Engineering', category: 'EEC' },

  // Semester 8
  { code: 'ME3811', name: 'Project Work', credits: 10, semester: 8, department: 'Mechanical Engineering', category: 'EEC' },
];

/**
 * Helper to get subjects by department and semester
 */
export function getAnnaUniversitySubjects(department: string, semester?: number): AnnaUniversitySubject[] {
  return ANNA_UNIVERSITY_CURRICULUM.filter((s) => {
    const matchDept = s.department.toLowerCase() === department.toLowerCase();
    const matchSem = semester !== undefined ? s.semester === semester : true;
    return matchDept && matchSem;
  });
}
