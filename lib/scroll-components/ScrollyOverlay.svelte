<script lang="ts">
    import scrollama from "scrollama";
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
	import ChicagoMap from "$lib/visualizations/ChicagoMap.svelte";

    // initialize the scrollama
    const scroller = scrollama();
    let step = $state(-1);

    function updateChart(index: number, stepSel: Element, container: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
            step = index;
            // const sel = container.select(`[data-index='${index}']`);
            // const width = sel.attr('data-width');
            // container.select('.bar-inner').style('width', width);
        }
    
    //OOOHHHH i should have step exited cases in certain direction to handle removing things? guess i could do the same for entering with a direction

    onMount(() => {
        init();
    });

    function init(): void { // runs once on load
        const container = d3.select('#scrolly-overlay'); // using d3 for convenience, and storing a selected elements
        const stepSel = container.selectAll('.step');
        // i want to call functions in chicago map. 

        scroller.setup({
			step: '.scroll_text .step', // the step elements
			offset: 1, // set the trigger to be 90% way down screen
			debug: false, // display the trigger offset for testing
            progress: true
		})
		.onStepEnter(response => {
            console.log("step entered: " + response.index);
            response.element.classList.add('active');
			updateChart(response.index, response.element, container);
		})
        .onStepExit(response => {
            console.log("step exited: " + response.element);
            response.element.classList.remove('active');
			updateChart(response.index, response.element, container);
		})
        // .onStepProgress(response => {
        //     console.log("progress: " + response.progress);
		// });
    }

</script>

<main>
    <section id='scrolly-overlay'>
        <!--  graphic container  -->
        <figure class='sticky_graphic_container'>
            <!--   actual graphic/chart   -->
            <div class='chart'>
                <ChicagoMap {step}></ChicagoMap>
            </div>
        </figure>


        <article class='scroll_text'>
            <div class="wrapper">
                <div class="step hidden" data-step="a">
                    <p>This will be hidden </p>
                </div>
            </div>

            <div class="wrapper">
                <div class="step" data-step="b">
                    <!-- <p>STEP 1</p> -->
                    <p>Something to introduce Chicago</p>
                </div>
            </div>

            <div class="wrapper">
                <div class="step" data-step="c">
                    <p>
                        In the 2020-21 school year, Helge A Haugan Elementary School did not offer any dance courses to its students. What began as a vision–to cultivate a vibrant dance program at the school–has become reality. Through support from the Lollapalooza Arts Education Fund, Haugan Elementary was awarded more than $36,000 in grants during the 2021-22 and 2022-23 school years. 
                    </p>
                </div>
            </div>

            <div class="wrapper">
                <div class="step" data-step="d"> 
                    <!-- <p>STEP 3, instead of hiding, i can use step progress</p> --> 
                     <p>With this funding, the school transformed a 110-year old classroom into a functional and inspiring dance studio– complete with a new sprung dance floor to support movement, creativity, and expression. By the 2023-24 and 2024-25 school year, Haugan had hired two full-time dance instructors and offered over 40 dance courses across all grades, K-8.  These investments, as originally visioned, ensured that dance was an integral part of the school community.  </p>
                </div>
            </div>

            <div class="wrapper">
                <div class="step" data-step="e">
                    <!-- <p>STEP 4</p> -->
                    <p>IMAGE of sprung floors will appear in this next step</p>
                </div>
            </div>

            <div class="wrapper">
                <div class="step" data-step="f">
                    <p>This example is just one of how the Lollapalooza Arts Education Fund (LAEF)  is expanding access to high-quality arts programming in Chicago Public Schools (CPS). This initiative represents a  $2.2 million investment over five years in CPS arts education through the Creative Schools Fund, which is managed by Ingenuity. 
                    </p>
                </div>
            </div>

            <div class="wrapper">
                <div class="step" data-step="g">
                    <p>In a historic milestone, 99% of all CPS schools – 640 out of 649 – submitted arts education data in fall 2024. Collected from Ingenuity’s artlook® platform, this data fuels both sector-wide analyses in the State of the Arts  and school-level ratings through the Creative Schools Certification. Together, these insights inform strategic funding decisions for the Creative Schools Fund and the Lollapalooza Arts Education Fund.  </p>
                </div>
            </div>
            <div class="wrapper">
                <div class="step" data-step="h">
                    <p>$1,782,770 for 182 grants awarded to 99 CPS schools</p>
                </div>
            </div>
            <div class="wrapper">
                <div class="step" data-step="i">
                    <p>Including 82 elementary schools and 17 high schools</p>
                </div>
            </div>
            <div class="wrapper">
                <div class="step" data-step="j">
                    <p>55% of LAEF schools were rated as Developing or Emerging in 2021-22 on the Creative Schools Certification, compared to 28% of all CPS schools. The fund prioritizes schools with the least systemic access to arts education – identified through data collected and analyzed by Ingenuity. Developing or Emerging schools are those that occasionally or rarely meet the goals and priorities outlined in the CPS Arts Education Plan, indicating that students have less access to high-quality arts education. These schools earned 79 or fewer points out of 100 on the Creative Schools Certification. 
                    </p>
                </div>
            </div>
            <div class="wrapper">
                <div class="step" data-step="k">
                    <p>LAEF investments have reached 52 out of 77 Chicago community areas, with a strong concentration on the south and west sides of the city. This focus reflects the fund’s commitment to prioritizing schools with less access to high-quality arts education.</p>
                </div>
            </div>
        </article>
    </section>
</main>

<style>

main {
    background-color: plum;
}

#scrolly-overlay {
	max-width: 60rem;
	margin: 3rem auto;
	background-color: plum;
	padding: 1rem;
}

article {
    position: relative;
    /* top: -50vh; */
    padding: 0;
    max-width: 30rem;
    margin: 0 auto;
    background-color: none;
    opacity: 0.7;
    /* margin-top: 20vh; */
}

.wrapper {
    min-height: 95vh;
}
.wrapper:first-of-type {
    min-height: unset;
    height: 15vh;
}

.step {			
    display: flex;
    align-items: center;
    min-height: 25vh;
	margin-bottom: 1rem;
    border: 0.5rem solid white;
    background-color: darkcyan;

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
        border-color: lightblue;
    }

    &:global(.hidden) {
        visibility: hidden;
        min-height: unset;
        height: 10vh;
    }
}

/* .step:first-of-type {
    margin-top: 90vh;
}*/

.step:last-of-type {
    margin-bottom: 0;
}

.sticky_graphic_container {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    min-height: 50vh;
}

.chart {
    /* padding-top: 10vh; */
    text-align: center;
    /* background-color: lightblue; */
}

</style>