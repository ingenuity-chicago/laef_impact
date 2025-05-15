<script lang="ts">
    import scrollama from "scrollama";
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    import { base } from '$app/paths';
    import type { GeoJSON } from "geojson";

    let vis: HTMLElement;
    let width = 400;
    let height = 400;

    interface Data { // FeatureCollection (doesn't inherently have a projection, but you can assume that the features inside share the same projection, so u can just take one)
        type: string;
        features: GeoJSON[];
    }

    onMount(() => {
        init();
    });

    // (d) => {
    //         let output: Data = {
    //             type: d.type,
    //             features: d.features
    //         };
    //         return output
    //     }

    function init(): void {
        d3.json<Data>(`${base}/data/chicago-community-areas.geojson`)
            .then(
                function(bb) {
                    if (bb === undefined) {
                        return;
                    }
                    console.log(bb);
                    
                    // Create the SVG container.
                    const svg = d3.select(vis).append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        // .attr("viewBox", [0, 0, width, height])
                        // .attr("style", "max-width: 100%; height: auto; overflow: visible;");
                    const grp = svg.append('g');

                    // bb.features.forEach((feature) => {

                    //     let projection = d3.geoEqualEarth() // these are both funtions, not values
                    //         .angle(180)
                    //         .fitExtent([[20,20],[10, 10]], bb.features[35]);
                    //         //.fitHeight(100, feature);
                    //     let geoGenerator = d3.geoPath() // these are both funtions, not values
                    //         .projection(projection);

                    //     grp.append('path')
                    //         .attr('d', geoGenerator(feature))
                    //         .attr('fill-opacity', 0)
                    //         .attr('stroke', '#000')
                    //         .attr('x', 0)
                    //         .attr('y', 0);
                    // });

                    // actually getting same results with both. using the specific projection for each feature makes them all overlap at the same spot. need to use same projection for all, but each once changes where center is
                    let projection = d3.geoEqualEarth() // these are both funtions, not values
                        // .angle(180)
                        //.fitExtent([[20,20],[10,10]], bb.features[0]); // changing the numbers behaves VERY weird
                        .fitHeight(20, bb.features[0]); // why does it look slanted
                    let geoGenerator = d3.geoPath() // these are both funtions, not values
                        .projection(projection);

                    console.log(projection);
                    console.log(geoGenerator);

                    svg.append('g').selectAll('path')
                        .data(bb.features)
                        .join('path')
                        .attr('d', geoGenerator)
                        .attr('fill-opacity', 0)
                        .attr('stroke', '#000')
                        .attr("transform", `translate(${width/2+30},${height/2})`)

                })
            .catch((err) => {
                // Handle err
                console.log(err);
            });
        
    }
</script>

<main>
    <div id="vis" bind:this={vis}></div>
</main>

<style></style>