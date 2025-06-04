<script lang="ts">
    import scrollama from "scrollama";
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    import { base } from '$app/paths';
    import type { FeatureCollection, Feature } from "geojson";
    import * as topojsonC from "topojson-client";
    import * as topojsonS from "topojson-server";

    let vis: HTMLElement;
    let width = 300;
    let height = 1.3*width;
    let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    let community_areas_geo: FeatureCollection;
    let schools: School[] = [];
    let projection: d3.GeoProjection;

    let { step } = $props();

    // # 5 = Incomplete Data
    // # 4 = Emerging
    // # 3 = Developing
    // # 2 = Strong
    // # 1 = Excelling
    const colorMap: Record<string, string> = {
        "$0": "#fff",
        "$1 - $20,000": "#cde6cd",
        "$20,001 - $40,000": "#a9cfa3",
        "$40,001 - $70,000": "#5f9e66",
        "$70,001 - $110,000": "#27663b",
        "laef": "purple",
        "5": "transparent", // incomplete_data
        "4": "yellow", // emerging
        "3": "green", // developing
        "2": "transparent", // strong
        "1": "transparent", // excelling
        "high_school": "orange",
        "elementary_school": "blue",
        "combination": "pink",
        "middle_school": "pink"
    }

    onMount(() => {
        init();
        // on refresh, keep track of step (This isn't working properly)
        // window.location.hash = `#step-${step}`;
        // const stepFromHash = parseInt(window.location.hash.replace("#step-", ""));
        // if (!isNaN(stepFromHash)) {
        //     updateVis(stepFromHash);
        // }
    });

    interface School {
        coordinates: [number,number];
        properties: {
            school_name: string;
            community_area: string;
            category: string;
            certification: number;
            count_partnerships: number;
            laef: boolean;
        };
    }

    function init() {
        // Create the SVG container.
        svg = d3.select(vis).append("svg")
            .attr("class", "canvas")
            .attr("width", "95%")
            .attr("height", "95%")
            .attr("viewBox", [0, 0, width, height]) //[-width/2, -height/2, width*2, height*2]
            .attr("style", "max-height: 80vh;"); //position: absolute; width: 80vh; left:0;
        // decide if want to center map

        setIntroText();

        // loading data
        d3.json<FeatureCollection>(`${base}/assets/data/comm_areas_amt_granted.geojson`) 
            .then((d) => {
                let projection = setupMap(d);
                getSchoolPoints(projection);   
            })              
            .catch((err) => {
                console.log(err); // TODO: Handle error
            });

    }

    function updateVis(stepFromHash?: number) {
        // if (stepFromHash !== undefined) {
        //     step = stepFromHash
        // }
        console.log("step entered: " + step);
        switch (step) {
            case -1: // load maps and points but hide them
                // hideSchools();
                // removeMap();
                break;
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

    $effect(updateVis);

    function getSchoolPoints(chi_projection: d3.GeoProjection) {
        d3.json<FeatureCollection>(`${base}/assets/data/all_schools.geojson`) 
            .then(d => loadSchoolData(chi_projection, d))
            .catch((err) => {
                console.log(err); // TODO: Handle error
            });
    }

    function loadSchoolData(chi_projection: d3.GeoProjection, geodata?: FeatureCollection) {
        if (geodata === undefined) { return; }
        const schools_topo = topojsonS.topology({"schools": geodata});    
        const schools_geo = topojsonC.feature(schools_topo, schools_topo.objects.schools) as FeatureCollection;

        schools_geo.features.forEach(function(d) {
            let school: School = {                
                properties: {
                    school_name: d.properties?.school_name,
                    community_area: d.properties?.community_area,
                    category: d.properties?.category,
                    certification: +d.properties?.final_score, // check which ones are which again
                    count_partnerships: +d.properties?.count_partnerships,
                    laef: d.properties?.laef == "TRUE",
                },
                coordinates: projection((d.geometry as GeoJSON.Point).coordinates as [number, number])!
            }
            schools.push(school);
        });
    }

    function plotSchoolPoints() {
        svg.append('g').selectAll("school")
            .data(schools)
            .enter()
            .append("circle")
            .raise()
            .attr("class", "school")  
            .classed("laef", (d) => d.properties?.laef)
            .attr("r", 3)
            .attr("cx", d => d.coordinates[0])
            .attr("cy", d => d.coordinates[1])
            .attr("fill", "transparent");
    }

    function showHaugan() {
        d3.selectAll<SVGCircleElement, Feature>(".school")
            .transition()
            .duration(1500)
            .attr("r", 4)
            .attr("fill", function(d) {
                return d.properties?.school_name == "Helge A Haugan Elementary School" ? "red" : "transparent"} )
    }

    function showAllSchools() {
        d3.selectAll<SVGCircleElement, Feature>(".school")
            .transition()
            .duration(1000)
            .attr("r", 1.5)
            .attr("fill", "grey");
    }

    function showLaefSchools() {
        d3.selectAll<SVGCircleElement, Feature>(".school") // could change this to just access .laef
            .transition()
            .duration(1000)
            .attr("r", 3)
            .attr("fill", function(d) {
                return d.properties?.laef ? colorMap["laef"] : "transparent"} )
    }

    function showSchoolType() {
        d3.selectAll<SVGCircleElement, Feature>(".laef")
            .transition()
            .duration(1000)
            .attr("fill", function(d) {         
                return  colorMap[d.properties?.category] } )
    }

    function showSchoolCert() {
        d3.selectAll<SVGCircleElement, Feature>(".laef")
            .transition()
            .duration(1000)
            .attr("fill", function(d) {        
                return  colorMap[d.properties?.certification] } )
    }

    function showSchools() {
        d3.selectAll<SVGCircleElement, Feature>(".school")
            .transition()
            .duration(1000)
            .attr("visibility", "visible");
    }
    function hideSchools() {
        d3.selectAll<SVGCircleElement, Feature>(".school")
            .transition()
            .duration(2000)
            .attr("visibility", "hidden"); // i think the transition duration doesn't work on this as much as transparency
    }

    function setupMap(geodata?: FeatureCollection): d3.GeoProjection {
        if (geodata === undefined) { console.log("geodata undefined"); return d3.geoMercator(); }
        
        community_areas_geo = loadFeatureCollection(geodata) as FeatureCollection;
        const chi_projection = d3.geoMercator().fitSize([width, height], community_areas_geo);
        projection = chi_projection;
        return chi_projection;
        //renderBaseMap(community_areas_geo);
    }

    function loadFeatureCollection(geodata: FeatureCollection) {
        const chiTopo = topojsonS.topology({"community_areas": geodata});    
        return topojsonC.feature(chiTopo, chiTopo.objects.community_areas) as FeatureCollection;       
        // .text(d => `${d.properties.name}, ${statemap.get(d.id.slice(0, 2)).properties.name}\n${valuemap.get(d.id)}%`); 
    }

    function renderBaseMap(community_areas_geo: FeatureCollection, projection: d3.GeoProjection) {
        if (community_areas_geo == undefined) {
            console.warn("Data not loaded yet"); // a problem if you refresh the page while on this section
            return;
        }

        let geoGenerator = d3.geoPath().projection(projection)
    
        const path = svg.append('g')
            .selectAll("path") 
            .data(community_areas_geo.features)
            .join("path")
                .attr("class", "comm_area")  
                .attr('fill-opacity', 0)
                .attr("stroke", '#fff') // make it the same color as the background to create gap effect
                .attr("stroke-width", 0.8)
                .attr("d", geoGenerator)
                .attr("stroke-dasharray", d => geoGenerator.measure(d) + " " + geoGenerator.measure(d))
                .attr("stroke-dashoffset", d => geoGenerator.measure(d))
                .transition()
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0)
                .duration(3000)
    }

    function setZoomAspectRaio() {
        svg
            .transition()
            .duration(1500)
            .attr("viewBox", '100, 40, 100, 130');
    }
    function setNormalAspectRaio() {
        svg
            .transition()
            .duration(1500)
            .attr("viewBox", '0, 0, 300, 390');
    }

    function removeMap() {
        d3.selectAll<SVGPathElement, Feature>(".comm_area")
            .transition()
            .duration(1000)
            .attr("fill-opacity", 0)
            .remove(); // animations don't wait for removing
    }

    function renderCloropleth() {
        d3.selectAll<SVGPathElement, Feature>(".comm_area")
            .transition()
            .duration(1000)
            .attr("fill-opacity", 1)
            .attr("fill", function(d) {
                return colorMap[(d.properties?.plt_bck)]} )
    }

    function removeCloropleth() {
        d3.selectAll<SVGPathElement, Feature>(".comm_area")
            .transition()
            .duration(1000)
            .attr("fill-opacity", 1)
            .attr("fill", "transparent");
    }

    function setIntroText() {
        svg.append("text")
            .attr('y', height/2) 
            .attr('font-size', "1rem")
            .attr("font-weight", "500")
            .attr("text-anchor", "middle")
            .append("tspan")
                .text("Every student should have access")
                .attr("dy", "1rem")
                .attr('x', width/2)
            .append("tspan")
                .text("to the transformative power of the arts.")
                .attr("dy", "1.4rem")
                .attr('x', width/2)

    }

    function showIntroText() {
        svg.selectAll("text").attr("opacity", 1);
        // d3.selectAll(".pixel")
        //     .attr("opacitiy", 0);
    }

    function hideIntroText() {
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
        svg.selectAll("text").transition().duration(1500).attr("opacity", 0)
    }
    
    function loadImage(path: string) {
        // const image = await d3.image(path);
        // const imgContainer = d3.select(vis).append('div')
        //     .attr("class", "image-container")
        //     .attr('style', "position: absolute; height:100vh; width: 100vh; background: green")
        
        // imgContainer.append("image")
        //     .attr("xlink:href", path)
        //     .attr('style', "height: 100%; width: 100%;")
        
        svg.append('g').append("svg:image")
            .attr('class','img')
            .attr("xlink:href", path)
            .attr('x', width/3)
            .attr('y', height/6)
            .attr('width', 100)
            .attr('height', 100)
            .attr('opacity', 0);
    }

    function showImage() {
        svg.selectAll(".img")
            .transition()
            .duration(500)
            .attr("opacity", 1);
    }
    
    function removeImage() {
        svg.selectAll(".img")
            .transition()
            .duration(500)
            .attr("opacity", 0);
    }
</script>

<main>
    <div class="canvas"></div>
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

:global(.canvas) {
    margin-top: 10vh;
 }
</style>