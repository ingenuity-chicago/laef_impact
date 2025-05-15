<script lang="ts">
    import scrollama from "scrollama";
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    import { base } from '$app/paths';
    import type { GeoJsonObject , FeatureCollection } from "geojson";
    import * as topojsonC from "topojson-client";
    import * as topojsonS from "topojson-server";

    let vis: HTMLElement;
    let width = 400;
    let height = 1.3*width;

    onMount(() => {
        init();
    });

    function init(): void {
        d3.json<FeatureCollection>(`${base}/data/comm_areas_chi.geojson`) 
            .then(renderFeatureCollection)
            .catch((err) => {
                console.log(err); // TODO: Handle error
            });
    }

    function renderFeatureCollection(geodata?: FeatureCollection) {
        if (geodata === undefined) {
            return;
        }
        console.log(geodata);

        const chiTopo = topojsonS.topology({"community_areas": geodata});    
        console.log(chiTopo);
        const community_areas_geo = topojsonC.feature(chiTopo, chiTopo.objects.community_areas);
        console.log(community_areas_geo);

        let geoGenerator = d3.geoPath().projection(d3.geoMercator().fitSize([width, height], community_areas_geo))
        
        //TODO Separate the data loading and the rendering into different functions
        // Create the SVG container.
        const svg = d3.select(vis).append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto;");
    
        svg.append('g')
            .selectAll("path")
            .data((community_areas_geo as FeatureCollection).features)
            .join("path")
                .attr("fill", 'lightblue') // eventually a function that retrieves cloropleth values d => color(valuemap.get(d.id))
                .attr("stroke", '#fff')
                .attr("d", geoGenerator)
            .append("title")
        
        return community_areas_geo;               
        // .text(d => `${d.properties.name}, ${statemap.get(d.id.slice(0, 2)).properties.name}\n${valuemap.get(d.id)}%`); 
    }

    function renderMap() {
        
    }
    
    function renderOutline() {}

    function renderCloropleth() {}

    function renderPoints() {}

    
</script>

<main>
    <div id="vis" bind:this={vis}></div>
</main>

<style></style>