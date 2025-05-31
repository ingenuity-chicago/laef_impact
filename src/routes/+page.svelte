<script lang="ts">
    import ScrollyOverlay from "$lib/scroll-components/ScrollyOverlay.svelte";
    import Intro from "$lib/sections/Intro.svelte";
</script>

<main>
    <Intro></Intro>

    <ScrollyOverlay></ScrollyOverlay>

    <section id="overview">

    </section>
</main>

<style>
    main {
        background-color: black;
        margin: 0;
        font-family: Avenir;
    }

    #overview {
        height: 100vh;
        background-color: rebeccapurple;
    }
</style>