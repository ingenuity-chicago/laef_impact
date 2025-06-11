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

        // loading in school points as csv with lat/long

        // d3.csv(`${base}/data/all_schools.csv`, (d) => {
        //     let point: School = {
        //         school_name: d.school_name,
        //         community_area: d.community_area,
        //         category: d.category_simple,
        //         certification: +d.final_score, // check which ones are which again
        //         count_partnerships: +d.count_partnerships,
        //         laef: d.laef == "TRUE",
        //         longitude: parseFloat(d.longitude),
        //         latitude: parseFloat(d.latitude),
        //     };
        //     return point
        // }).then(function(data) {
        //     console.log(data);
        //     plotSchoolPoints(data);
        // });

        //let projectedPoints: [number,number][] = [];
        //projectedPoints.push(projection((d.geometry as GeoJSON.Point).coordinates as [number, number])!)
        
        // trigger changes on click

        // let counter = 0;
        // svg.on('click', (event: KeyboardEvent) => {
        //     switch (counter) {
        //         case 0:
        //             showHaugan();
        //             break;
        //         case 1:
        //             showAllSchools();
        //             break;
        //         case 2:
        //             showLaefSchools();
        //             break;
        //         case 3:
        //             showSchoolType();
        //             break;
        //         case 4: 
        //             showSchoolCert();
        //             break;
        //         case 5:
        //             removeSchools();
        //             renderCloropleth();
        //             break;
        //     } 
        //     counter ++ ;
        // });

        // function renderMap(community_areas_geo: FeatureCollection, projection: d3.GeoProjection) {
        //     let geoGenerator = d3.geoPath().projection(projection);

        //     const path = svg.append('g')
        //         .attr("class", "chi_map") 
        //         .selectAll("path") 
        //         .data(community_areas_geo.features)
        //         .join("path")
        //             .attr("class", "comm_area")  
        //             .attr('fill-opacity', 0)
        //             .attr("stroke", '#fff') // make it the same color as the background to create gap effect
        //             .attr("stroke-width", 0.8)
        //             .attr("d", geoGenerator)
        //             .attr("stroke-dasharray", d => geoGenerator.measure(d) + " " + geoGenerator.measure(d))
        //             .attr("stroke-dashoffset", d => geoGenerator.measure(d))
        //             .transition()
        //             .ease(d3.easeLinear)
        //             .attr("stroke-dashoffset", 0)
        //             .duration(4000)
        // }

        // function setProjection(community_areas_geo: FeatureCollection, zoom: boolean) {
        //     if (zoom) {
        //         return d3.geoMercator().fitExtent([[-1400,-400], [width*3.5, height*3.5]], community_areas_geo)
        //     }
        //     return d3.geoMercator().fitSize([width, height], community_areas_geo);
        // }

        function updateVis(stepFromHash?: number) {
            // if (stepFromHash !== undefined) {
            //     step = stepFromHash
            // }
            //console.log("step var: " + step);
            switch (step.index) {
                case 0:
                    hideSchools();
                    removeMap();
                    showIntroText();
                    break;
                case 1: 
                    hideIntroText();
                    setNormalAspectRaio();
                    renderBaseMap(community_areas_geo, projection);
                    plotSchoolPoints();
                    break;
                case 2:
                    svg.attr("viewBox", '0, 0, 300, 390');
                    showSchools();
                    showHaugan();
                    break;
                case 3: 
                    setZoomAspectRaio();
                    break;
                case 4:
                    // insert image of floors
                    loadImage(`${base}/assets/images/HauganDanceStudio.jpg`);
                    showImage();
                    break;
                case 5:
                    removeImage();
                    setNormalAspectRaio();
                    break;
                case 6:
                    showAllSchools();
                    break;
                case 7:
                    showLaefSchools();
                    break;
                case 8:
                    showSchoolType();
                    break;
                case 9: 
                    removeCloropleth();
                    showSchools();
                    showSchoolCert();
                    break;
                case 10:
                    hideSchools();
                    renderCloropleth();
                    break;
            } 
        }

            // function removeMap() {
    //     d3.selectAll<SVGPathElement, Feature>(".comm_area")
    //         .transition()
    //         .duration(1000)
    //         .attr("fill-opacity", 0)
    //         .remove(); // animations don't wait for removing
    // }

        // function hideCloropleth() {
    //     d3.selectAll<SVGPathElement, Feature>(".comm_area")
    //         .transition()
    //         .duration(500)
    //         .attr("fill-opacity", 0)
            // .attr("fill", "transparent");
    //}

    //hide intro text
            // Add pixelated overlay (COMPUTATIONALLY EXPENSIVE)
        // const pixelSize = 2;

        // const pixels = [];
        // for (let x = 0; x < width; x += pixelSize-1) {
        //     for (let y = 0; y < height/9; y += pixelSize-1) {
        //         pixels.push({ x, y });
        //     }
        // }

        // svg.selectAll("rect")
        //     .data(pixels)
        //     .enter()
        //     .append("rect")
        //     .attr("class", "pixel")
        //     .attr("x", d => d.x)
        //     .attr("y", d => height/2 + d.y)
        //     .attr("width", pixelSize)
        //     .attr("height", pixelSize)
        //     .attr("fill", "plum")
        //     .attr("opacity", 0)
        //     .transition()
        //     .delay(() => Math.random() * 1000)
        //     .duration(500)
        //     .attr("opacity", 1);
        // 
    }
</script>

<main>
    <div id="vis" bind:this={vis}></div>
</main>

<style>
    /* :global(.inactive){
    visibility: visible;
} */

/* :global(.pixel-blur) {
  filter: blur(2px);
} */
 /* #vis {
    position: relative;
 } */
</style>