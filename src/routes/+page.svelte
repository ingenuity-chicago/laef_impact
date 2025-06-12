<script lang="ts">
    import ScrollyOverlay from "$lib/scroll-components/ScrollyOverlay.svelte";
    import Intro from "$lib/sections/Intro.svelte";
	import BarChart from "$lib/visualizations/BarChart.svelte";
    import { disciplineData } from "../../static/assets/data/discipline-info"
</script>

<main>
    <Intro></Intro>

    <ScrollyOverlay></ScrollyOverlay>

    <section id="overview">
        <BarChart title="Number of courses offered by discipline" data={disciplineData} x="school_year" y="course_count" fx="discipline" fill="school_year"></BarChart>
        <BarChart title="Number of schools offering at least one course in discipline" data={disciplineData} x="school_year" y="num_schools_offering" fx="discipline" fill="school_year"></BarChart>
    </section>
</main>

<style>
    main {
        background-color: black;
        margin: 0;
        font-family: Avenir;
    }

    #overview {
        background-color: rebeccapurple;
    }
</style>