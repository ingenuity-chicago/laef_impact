<script lang="ts">
    import BarChart from "$lib/visualizations/BarChart.svelte";
    import { disciplineData } from "../../../static/assets/data/overview_stats.ts" // maybe this should be json
</script>

<main>
    <h3>The arts landscape before and after LAEF</h3>
    <section class="part-1">
        <div class="blog-text">    
            <p>The majority of LAEF grants support partnerships between arts organizations and schools. Through the 2024-25 school year, 41 arts organizations have partnered with LAEF grantee schools – bringing a broad spectrum of artistic disciplines and perspectives into classrooms. These partnerships deepen student engagement, complement classroom instruction, and foster creativity. 
            </p>
        </div>
    </section>

    <section class="part-2">
        <div class="blog-text">  
            <p>With the support of LAEF, schools are making significant strides in expanding access to dance. Dance emerged as the most requested artistic discipline in 2024-25 Creative Schools Fund Partnerships grant applications, accounting for 28% of all applications. From the 2021-22 to 2023-24 school years, the number of dance courses offered in LAEF schools more than tripled– from 106 to 357 – and the number of schools offering dance coursework increased by 109%, from 11 to 23 schools.  This growth goes beyond the numbers – it reflects a shift within schools, where vibrant dance programs are taking root, shaped by student interests. </p>
        </div>
    </section>
    <BarChart title="Number of courses offered by discipline" data={disciplineData} x="school_year" y="course_count" fx="discipline" fill="school_year"></BarChart>
    <BarChart title="Number of schools offering at least one course in discipline" data={disciplineData} x="school_year" y="num_schools_offering" fx="discipline" fill="school_year"></BarChart>
</main>

<style>
    main {
        background-color: rebeccapurple;

        display: flex;
        flex-direction: column;
        color: white;
        align-items: center;
    }

    section {
        padding: 1rem;
    }
    
</style>