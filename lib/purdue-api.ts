import { publicEnv, serverEnv } from './env';

export interface PurdueCourse {
  subject: string;
  number: string;
  title: string;
}

export interface PurdueSection {
  crn: string;
  section_code: string;
  meeting_days: string;
  meeting_time: string;
  instructor: string;
  term: string;
}

export interface CourseWithSections extends PurdueCourse {
  id: string;
  sections: PurdueSection[];
}

// Load seed data
const seedCourses = require('../seed/purdue-courses.json') as PurdueCourse[];
const seedSections = require('../seed/purdue-sections.json') as PurdueSection[];

export async function searchCourses(subject: string, number: string): Promise<CourseWithSections | null> {
  // If using seed fallback or Purdue API is not available
  if (serverEnv.PURDUE_USE_SEED_FALLBACK) {
    return searchCoursesFromSeed(subject, number);
  }

  try {
    // Try to fetch from Purdue.io API
    const response = await fetch(
      `${publicEnv.NEXT_PUBLIC_PURDUE_OData_BASE}/Course?$filter=Subject eq '${subject}' and Number eq '${number}'`
    );

    if (!response.ok) {
      throw new Error(`Purdue API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.value || data.value.length === 0) {
      return null;
    }

    const course = data.value[0];
    
    // Fetch sections for this course
    const sectionsResponse = await fetch(
      `${publicEnv.NEXT_PUBLIC_PURDUE_OData_BASE}/Section?$filter=Subject eq '${subject}' and Number eq '${number}'`
    );

    let sections: PurdueSection[] = [];
    if (sectionsResponse.ok) {
      const sectionsData = await sectionsResponse.json();
      sections = sectionsData.value || [];
    }

    return {
      id: `${course.Subject}-${course.Number}`,
      subject: course.Subject,
      number: course.Number,
      title: course.Title,
      sections: sections.map(s => ({
        crn: s.crn,
        section_code: s.section_code,
        meeting_days: s.meeting_days || '',
        meeting_time: s.meeting_time || '',
        instructor: s.instructor || '',
        term: s.term || 'Fall 2024'
      }))
    };
  } catch (error) {
    console.warn('Purdue API failed, falling back to seed data:', error);
    return searchCoursesFromSeed(subject, number);
  }
}

export async function searchCoursesFromSeed(subject: string, number: string): Promise<CourseWithSections | null> {
  const course = seedCourses.find(
    c => c.subject.toLowerCase() === subject.toLowerCase() && 
         c.number === number
  );

  if (!course) {
    return null;
  }

  // Get sections for this course (distribute sections across courses)
  const courseIndex = seedCourses.findIndex(c => c === course);
  const sections = seedSections.slice(courseIndex * 2, (courseIndex + 1) * 2);

  return {
    id: `${course.subject}-${course.number}`,
    subject: course.subject,
    number: course.number,
    title: course.title,
    sections
  };
}

export async function getAllCourses(): Promise<PurdueCourse[]> {
  if (serverEnv.PURDUE_USE_SEED_FALLBACK) {
    return seedCourses;
  }

  try {
    const response = await fetch(`${publicEnv.NEXT_PUBLIC_PURDUE_OData_BASE}/Course`);
    
    if (!response.ok) {
      throw new Error(`Purdue API error: ${response.status}`);
    }

    const data = await response.json();
    return (data.value || []).map((course: any) => ({
      subject: course.Subject,
      number: course.Number,
      title: course.Title
    }));
  } catch (error) {
    console.warn('Purdue API failed, falling back to seed data:', error);
    return seedCourses;
  }
}

export function parseCourseInput(input: string): { subject: string; number: string } | null {
  const match = input.trim().match(/^([A-Za-z]+)\s+(\d+)$/);
  if (!match) {
    return null;
  }
  
  return {
    subject: match[1].toUpperCase(),
    number: match[2]
  };
}
