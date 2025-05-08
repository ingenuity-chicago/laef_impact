<script lang="ts">
    import scrollama from "scrollama";
    import * as d3 from 'd3';
    import { onMount } from 'svelte';

    // initialize the scrollama
    const scroller = scrollama();

    function updateChart(index: number, stepSel: Element, container: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
            // const sel = container.select(`[data-index='${index}']`);
            // const width = sel.attr('data-width');
            // container.select('.bar-inner').style('width', width);
        }

    onMount(() => {
        init();
    });

    function init(): void { // runs once on load
        const container = d3.select('#scrolly-overlay'); // using d3 for convenience, and storing a selected elements
        const stepSel = container.selectAll('.step');

        scroller.setup({
			step: '.scroll_text .step', // the step elements
			offset: 0.5, // set the trigger to be 1/2 way down screen
			debug: false, // display the trigger offset for testing
		})
		.onStepEnter(response => {
            console.log("step entered: " + response.index);
            response.element.classList.add('active');
			updateChart(response.index, response.element, container);
		})
        .onStepExit(response => {
            console.log("step exited: " + response.index);
            response.element.classList.remove('active');
			updateChart(response.index, response.element, container);
		});
    }

</script>

<main>
Scrolly Overlay
    <section id='scrolly-overlay'>
        <!--  graphic container  -->
        <figure class='sticky_graphic_container'>
            <!--   actual graphic/chart   -->
            <div class='chart'>
                my first data viz!
            </div>
        </figure>


        <article class='scroll_text'>
            <div class="wrapper">
                <div class="step" data-step="a">
                    <p>STEP 1</p>
                </div>
            </div>

            <div class="wrapper">
                <div class="step" data-step="b">
                    <p>STEP 2</p>
                </div>
            </div>

            <div class="wrapper">
                <div class="step" data-step="c">
                    <p>STEP 3</p>
                </div>
            </div>

            <div class="wrapper">
                <div class="step" data-step="d">
                    <p>STEP 4</p>
                </div>
            </div>
        </article>
    </section>
</main>

<style>

#scrolly-overlay {
	max-width: 60rem;
	margin: 3rem auto;
	background-color: plum;
	padding: 1rem;
}

article {
    position: relative;
    padding: 0;
    max-width: 30rem;
    margin: 0 auto;
    background-color: none;
    opacity: 0.7;
}

.wrapper {
    min-height: 100vh;
}

.step {			
    min-height: 25vh;
	margin-bottom: 1rem;
    border: 0.5rem solid purple;
    background-color: lightgrey;

    p {
        margin: 0;
        padding: 1rem;
        text-align: center;
        font-weight: 400;
        background-color: darkcyan;
        transition: background-color 250ms ease-in-out;
        color: cornsilk;
    }

    &:global(.active){
        background-color: coral;
    }
}
.step:first-of-type {
    margin-top: 90vh;
}

.step:last-of-type {
    margin-bottom: 0;
}

.sticky_graphic_container {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
}

.chart {
    padding-top: 50vh;
    text-align: center;
    background-color: rgb(115, 202, 69);
    height: 10rem;
}

</style>