interface DisciplineInfo {
    discipline: string;
    school_year: string;
    course_count: number;
    num_schools_offering: number;
}

export const disciplineData: DisciplineInfo[] = [
    {
        discipline: "Music",
        school_year: "2021-2022",
        course_count: 791,
        num_schools_offering: 43
    },
    {
        discipline: "Music",
        school_year: "2023-2024",
        course_count: 815,
        num_schools_offering: 49
    },
    {
        discipline: "Dance",
        school_year: "2021-2022",
        course_count: 106,
        num_schools_offering: 11,
    },
    {
        discipline: "Dance",
        school_year: "2023-2024",
        course_count: 357,
        num_schools_offering: 23,
    },
]

export interface Enrollment {
    school_year: string,
    num_students: number
}

export const enrollmentData: Enrollment[] = [
    {
        school_year: "2022",
        num_students: 22352
    },
    {
        school_year: "2023",
        num_students: 18666
    },
    {
        school_year: "2024",
        num_students: 12140
    },
    {
        school_year: "2025",
        num_students: 12717
    },

]