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