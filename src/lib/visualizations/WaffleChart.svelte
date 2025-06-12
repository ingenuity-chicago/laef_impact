<script lang="ts">
    import * as d3 from 'd3';
	import { onMount } from 'svelte';
    import { enrollmentData } from "../../../static/assets/data/overview_stats"

    const total = 659;
    let runningTotal = 0;
    let school_year = "";
    //enrollmentData.forEach( (d: Enrollment) => runningTotal += d.num_students )

    // let { total, partial } = $props();

    let waffle: d3.Selection<d3.BaseType, unknown, HTMLElement, any> | undefined = undefined;
    const numbers = d3.range(total); //65875


    onMount(() => {
        waffle = d3.select('.waffle,.raw');

        // add the blocks but transparent
        waffle
            .selectAll('.block')
            .data(numbers)
            .enter()
            .append('div')
            .attr('class', 'small-block')
            .style('background-color', 'transparent');
            
        let counter = 0;
        let prev = 0;
        let percentage = 0;
        waffle.on('click', (event: KeyboardEvent) => {
            switch (counter) {
                case 0:
                    d3.select(".label").style("visibility", "visible");
                    addBlocks(counter, prev);
                    break;
                case 1:
                    addBlocks(counter, prev);
                    break;
                case 2:
                    addBlocks(counter, prev);
                    break;
                case 3:
                    addBlocks(counter, prev);
                    break;
                case 4: 
                    percentage = 0.47;
                    d3.select(".label").html(`
                        <span class="stats">${percentage * 100}%</span> of whom identify as Black 
                        `);
                    showPercentage(percentage);
                    break;
                case 5:
                    percentage = 0.41;
                    d3.select(".label").html(`and <span style="color: ">${percentage * 100}%</span> of whom identify as Latine`);
                    showPercentage(percentage);
                    break;
            } 
            counter ++ ;
        });
    });

    let addBlocks = (counter: number, prev: number) => {                    
        prev = runningTotal;
        runningTotal += Math.round(enrollmentData[counter].num_students / 100);
        console.log(runningTotal);
        showStudents(runningTotal, prev)
        school_year = enrollmentData[counter].school_year;
    }

    let showPercentage = (percentage: number) => {
        d3.selectAll(".small-block")
            .transition()
            .duration(1000)
            .style('background-color', (d,i) => (i < (percentage * total) ? 'orange' : '#CCCCCC'));
    }

    // $effect(() => {
    //     showStudents()
    // })

    function showStudents(partial: number = 0, prev: number = 0) {
        if (!waffle) { return; }
        
        d3.selectAll(".small-block")
            .transition()
            .delay((d, i) => i < prev ? 0 : (i - prev) * 2 ) 
            .style('background-color', (d,i) => (i < partial ? '#CCCCCC' : 'transparent'));
    }

    function showWafflePercentage() {
        // if (!waffle) { return; }
        let waffleP = d3.select('.waffle,.percentage');

        waffleP
            .selectAll('.block')
            .data(d3.range(100))
            .enter()
            .append('div')
            .attr('class', 'reg-block')
            .attr("opacity", 0)
            .transition()
            .delay((d, i) => i * 20 )
            .attr("opacity", 1)
            .style('background-color', d => (d < 47 ? 'orange' : '#CCCCCC'));
    }
    
</script>

<main>
    <!-- <figure class="waffle percentage"></figure> -->
     <div class="label-container"><h4 class="label">As of <span class="stats">{school_year}</span>, schools that receieved LAEF grants served <span class="stats">{runningTotal * 100}</span> students</h4></div>
    <figure class="waffle raw"></figure>
</main>

<style>
    .waffle {
        display: flex;
        flex-wrap: wrap;

        &.percentage {
            height: 280px;
            width: 250px;
        }

        &.raw {
            /* TODO update these */
            height: 280px; 
            max-width: 80vw;
        }
        
    }

    :global(.reg-block) {
        width: 23px;
        height: 23px;
        margin: 2px;
    }

    :global(.small-block) {
        width: 12px;
        height: 12px;
        margin: 2px;
    }

    .label {
        color: white;
        visibility: hidden;
    }

    .label-container {
        display: flex;
        justify-content: center;
    }

    .stats {
        color: magenta;
    }
    
</style>

