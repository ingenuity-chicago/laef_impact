<script lang="ts">
    import scrollama from "scrollama";
    import * as d3 from 'd3';
    import { onMount } from 'svelte';
    import { base } from '$app/paths';
    import type { GeoJsonObject , FeatureCollection, Feature } from "geojson";
    import * as topojsonC from "topojson-client";
    import * as topojsonS from "topojson-server";

    let vis: HTMLElement;
    let width = 400;
    let height = 1.3*width;
    let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;

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
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto;");

        // loading data
        d3.json<FeatureCollection>(`${base}/data/comm_areas_amt_granted.geojson`) 
            .then(setupMap)
            .catch((err) => {
                console.log(err); // TODO: Handle error
            });
        
        let counter = 0;

        svg.on('click', (event: KeyboardEvent) => {
            console.log(counter);
            switch (counter) {
                case 0:
                    showHaugan();
                    break;
                case 1:
                    showAllSchools();
                    break;
                case 2:
                    showLaefSchools();
                    break;
                case 3:
                    showSchoolType();
                    break;
                case 4: 
                    showSchoolCert();
                    break;
                case 5:
                    removeSchools();
                    renderCloropleth();
                    break;
            } 
            counter ++ ;
        });

    }

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
            .duration(2000)
            .attr("r", 2)
            .attr("fill", "grey" )
    }

    function showLaefSchools() {
        d3.selectAll<SVGCircleElement, Feature>(".school")
            .classed("laef", (d) => d.properties?.laef)
            .transition()
            .duration(1500)
            .attr("r", 3)
            .attr("fill", function(d) {
                return d.properties?.laef ? colorMap["laef"] : "transparent"} )
    }

    function showSchoolType() {
        console.log("Show school type")
        d3.selectAll<SVGCircleElement, Feature>(".laef")
            .transition()
            .duration(1500)
            .attr("fill", function(d) {          
                return  colorMap[d.properties?.category] } )
    }

    function showSchoolCert() {
        d3.selectAll<SVGCircleElement, Feature>(".laef")
            .transition()
            .duration(1500)
            .attr("fill", function(d) {          
                return  colorMap[d.properties?.certification] } )
    }

    function removeSchools() {
        d3.selectAll<SVGCircleElement, Feature>(".laef")
            .transition()
            .duration(2000)
            .attr("fill", "transparent")
            .remove();
    }

    function setupMap(geodata?: FeatureCollection) {
        if (geodata === undefined) { return; }
        
        const community_areas_geo = loadFeatureCollection(geodata) as FeatureCollection;
        renderBlankMap(community_areas_geo);
    }

    function loadFeatureCollection(geodata: FeatureCollection) {
        const chiTopo = topojsonS.topology({"community_areas": geodata});    
        const community_areas_geo = topojsonC.feature(chiTopo, chiTopo.objects.community_areas) as FeatureCollection;
        return community_areas_geo;               
        // .text(d => `${d.properties.name}, ${statemap.get(d.id.slice(0, 2)).properties.name}\n${valuemap.get(d.id)}%`); 
    }

    function renderBlankMap(community_areas_geo: FeatureCollection) {
        const chi_projection = d3.geoMercator().fitSize([width, height], community_areas_geo);
        let geoGenerator = d3.geoPath().projection(chi_projection)
    
        svg.append('g')
            .selectAll("path") 
            .data(community_areas_geo.features)
            .join("path")
                .attr("class", "comm_area")  
                .attr('fill-opacity', 0)
                .attr("stroke", '#fff') // make it the same color as the background to create gap effect
                .attr("stroke-width", 0.5)
                .attr("d", geoGenerator)
            .append("title")

        // put these somewhere else
        getSchoolPoints(chi_projection);
    }

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

// # 5 = Incomplete Data
// # 4 = Emerging
// # 3 = Developing
// # 2 = Strong
// # 1 = Excelling

    function renderCloropleth() {
        d3.selectAll<SVGPathElement, Feature>(".comm_area")
            .transition()
            .duration(2500)
            .attr("fill-opacity", 1)
            .attr("fill", function(d) {
                return colorMap[(d.properties?.plt_bck)]} )
    }
    
</script>

<main>
    <div id="vis" bind:this={vis}></div>
</main>

<style></style>