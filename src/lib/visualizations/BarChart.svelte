<script lang="ts">
    import { onMount } from 'svelte';
    import * as Plot from "@observablehq/plot";

    let { title, data, x, y, fx, fill } = $props();

    let div: HTMLElement | undefined = $state();

    onMount(() => {
        
    }); // add the new chart

    function drawChart() { // this couldn't be a variable bc the code would try to run before document loaded
        let chart = Plot.plot({
        margin: 50,
        x: {axis: null},
        y: {axis: null},
        //y: {tickFormat: "s", grid: true},
        color: {scheme: "accent", legend: false},
        marks: [
            Plot.barY(data, {
                x: x,
                y: y,
                fill: fill,
                fx: fx,
                sort: {x: null, color: null, fx: {value: "y", reduce: "sum"}},
            }),
            // Plot.ruleY([0]),
            Plot.axisX({fontSize: 12, label: ""}), //label: "School Year", labelOffset: 50
            Plot.axisFx({anchor: "top", fontSize: 16, fontWeight: 600, label: "", dy: -20}),
            Plot.axisY({fontSize: 12, labelArrow: null, label: ""}),
            Plot.text(data, {x: x, y: y, fx: fx,
                 text: y, textAnchor: "middle", dy: 15, fontWeight: 600, fontSize: 14})
        ]
        });
        return chart;
    } 

    $effect(() => {
        console.log(data);
        div?.firstChild?.remove(); // remove old chart, if any
        div?.append(drawChart())
    });

</script>

<main>
    <div class="canvas">
        <h3 class="title">{title}</h3>
        <div class="bar-chart" bind:this={div} role="img"></div>
    </div>
    
</main>

<style>
    .canvas {
        display: flex;
        flex-direction: column;
        color: white;
        align-items: center;
    }

    .bar-chart {
        max-width: 70%;
    }
</style>