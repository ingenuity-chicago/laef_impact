<script lang="ts">
	import BeforeAfterLaef from "$lib/sections/BeforeAfterLaef.svelte";
    import Intro from "$lib/sections/Intro.svelte";
	import Overview from "$lib/sections/Overview.svelte";
	import WaffleSection from "$lib/sections/WaffleSection.svelte";
	import WaffleChart from "$lib/visualizations/WaffleChart.svelte";
</script>

<main>
    <Intro></Intro>

    <Overview></Overview>

    <BeforeAfterLaef></BeforeAfterLaef>

    <WaffleSection></WaffleSection>

</main>

<style>
    main {
        background-color: black;
        margin: 0;
        font-family: Avenir;
    }
</style>