<script lang="ts">
    import scrollama from "scrollama";
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    import { base } from '$app/paths';
    import type { GeoJsonObject , FeatureCollection, Feature } from "geojson";
    import * as topojsonC from "topojson-client";
    import * as topojsonS from "topojson-server";

    let vis: HTMLElement;
    let width = 300;
    let height = 1.3*width;
    let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;

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

    function init(): void {
        // Create the SVG container.
        svg = d3.select(vis).append("svg")
            .attr("width", "95%")
            .attr("height", "95%")
            .attr("viewBox", [0, 0, width, height]) //[-width/2, -height/2, width*2, height*2]
            .attr("style", "max-height: 80vh;");
        // decide if want to center map

        // loading data
        d3.json<FeatureCollection>(`${base}/data/comm_areas_amt_granted.geojson`) 
            .then(setupMap)
            .catch((err) => {
                console.log(err); // TODO: Handle error
            });
    }

    $effect(() => {
        switch (step) {
            case 0: 
                hideSchools();
                break;
            case 1:
                showSchools();
                showHaugan();
                break;
            case 2:
                showAllSchools();
                break;
            case 3:
                showLaefSchools();
                break;
            case 4:
                showSchoolType();
                break;
            case 5: 
                removeCloropleth();
                showSchools();
                showSchoolCert();
                break;
            case 6:
                hideSchools();
                renderCloropleth();
                break;
        } 
    });

    function getSchoolPoints(chi_projection: d3.GeoProjection) {
        d3.json<FeatureCollection>(`${base}/data/all_schools.geojson`) 
            .then(d => plotSchoolPoints(chi_projection, d))
            .catch((err) => {
                console.log(err); // TODO: Handle error
            });
    }
    function plotSchoolPoints(projection: d3.GeoProjection, points?: FeatureCollection) {
        if (points === undefined) { return; }
        const schools_topo = topojsonS.topology({"schools": points});    
        const schools_geo = topojsonC.feature(schools_topo, schools_topo.objects.schools) as FeatureCollection;

        let schools: School[] = [];
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

        console.log(schools);

        svg.append('g').selectAll("school")
            .data(schools)
            .enter()
            .append("circle")
            .attr("class", "school")  
            .classed("laef", (d) => d.properties?.laef)
            .attr("r", 3)
            .attr("cx", d => d.coordinates[0])
            .attr("cy", d => d.coordinates[1])
            .attr("fill", "transparent");

        return schools_geo;
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
            .attr("r", 2)
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

    function setupMap(geodata?: FeatureCollection) {
        if (geodata === undefined) { return; }
        
        const community_areas_geo = loadFeatureCollection(geodata) as FeatureCollection;
        renderBaseMap(community_areas_geo);
    }

    function loadFeatureCollection(geodata: FeatureCollection) {
        const chiTopo = topojsonS.topology({"community_areas": geodata});    
        const community_areas_geo = topojsonC.feature(chiTopo, chiTopo.objects.community_areas) as FeatureCollection;
        return community_areas_geo;               
        // .text(d => `${d.properties.name}, ${statemap.get(d.id.slice(0, 2)).properties.name}\n${valuemap.get(d.id)}%`); 
    }

    function renderBaseMap(community_areas_geo: FeatureCollection) {
        const chi_projection = d3.geoMercator().fitSize([width, height], community_areas_geo);
        let zoomed = chi_projection.fitExtent([[-1400,-400], [width*3.5, height*3.5]], community_areas_geo)
        let unzoomed = chi_projection.fitSize([width, height], community_areas_geo);
        let geoGenerator = d3.geoPath().projection(chi_projection)
    
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
                .duration(4000)

        // put these somewhere else
        getSchoolPoints(chi_projection);
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
    
</script>

<main>
    <div id="vis" bind:this={vis}></div>
</main>

<style>

/* :global(.inactive){
    visibility: visible;
} */

</style>