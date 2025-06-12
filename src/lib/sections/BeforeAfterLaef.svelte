<script lang="ts">
    import BarChart from "$lib/visualizations/BarChart.svelte";
    import { disciplineData } from "../../../static/assets/data/overview_stats.ts" // maybe this should be json
</script>

<main>
    <BarChart title="Number of courses offered by discipline" data={disciplineData} x="school_year" y="course_count" fx="discipline" fill="school_year"></BarChart>
    <BarChart title="Number of schools offering at least one course in discipline" data={disciplineData} x="school_year" y="num_schools_offering" fx="discipline" fill="school_year"></BarChart>
</main>

<style>
    main {
        background-color: rebeccapurple;
    }
    
</style>