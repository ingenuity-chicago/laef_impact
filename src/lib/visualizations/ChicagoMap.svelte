<script lang="ts">
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
    let schoolsEl: d3.Selection<SVGCircleElement, Feature, HTMLElement, any>;
    let community_areas_geo: FeatureCollection;
    let schools: School[] = [];
    let projection: d3.GeoProjection;
    let ready = false;
    let path: d3.GeoPath<any, d3.GeoPermissibleObjects>;
    let drawingInProgress: boolean = false;

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
        loadData().then((d) => {
            setIntroText();
            loadImage(`${base}/assets/images/HauganDanceStudio.jpg`);
        }).then(() => ready = true);
    }

    async function loadData() {
        // loading data
        await d3.json<FeatureCollection>(`${base}/assets/data/comm_areas_amt_granted.geojson`) 
            .then((d) => {
                console.log("map data loaded");
                let projection = setupMap(d);
                path = renderBaseMap(community_areas_geo, projection);
                loadSchoolPoints(projection);   
                return d;
            })              
            .catch((err) => {
                console.log(err); // TODO: Handle error
            });
    }

    function updateVis(stepFromHash?: number) {
        // how can i wait for init to happen before any of these steps
        // if (!ready) { console.log("not ready"); return; } else { console.log ("ready!")}
        switch (step.index) {
            case 0:
                //drawBaseMap(path)
                renderVisState({
                    showSchools: false,
                    showImage: false,
                    zoom: false,
                    showIntroText: true,
                    showCloropleth: false
                }, undefined, true)
                // setNormalAspectRaio();
                // showIntroText();
                break;
            case 1: 
                renderVisState({
                    showSchools: false,
                    showImage: false,
                    zoom: false,
                    showIntroText: false,
                    showCloropleth: false
                });
                // hideIntroText();
                // hideSchools();
                break;
            case 2:
                renderVisState({
                    showSchools: true,
                    showImage: false,
                    zoom: false,
                    showIntroText: false,
                    showCloropleth: false
                }, "HAUGAN");

                // showSchools();
                showHaugan();
                // if (step.direction === "up") {
                //     svg.transition().duration(1000).attr("viewBox", '0, 0, 300, 390');
                //     hideImage();
                // }
                break;
            case 3: 
                renderVisState({
                    showSchools: true,
                    showImage: false,
                    zoom: true,
                    showIntroText: false,
                    showCloropleth: false
                }, "HAUGAN");
                // setZoomAspectRaio();
                break;
            case 4:   
                renderVisState({
                    showSchools: true,
                    showImage: true,
                    zoom: true,
                    showIntroText: false,
                    showCloropleth: false
                }, "HAUGAN");
                //showImage();
                break;
            case 5:
                renderVisState({
                    showSchools: true,
                    showImage: false,
                    zoom: false,
                    showIntroText: false,
                    showCloropleth: false
                }, "HAUGAN");
                // hideImage();
                // setNormalAspectRaio();
                // if (step.direction === "up") {
                //     showHaugan();
                // }
                break;
            case 6:
                renderVisState({
                    showSchools: true,
                    showImage: false,
                    zoom: false,
                    showIntroText: false,
                    showCloropleth: false
                }, "ALL");
                // showAllSchools();
                break;
            case 7:
                renderVisState({
                    showSchools: true,
                    showImage: false,
                    zoom: false,
                    showIntroText: false,
                    showCloropleth: false
                }, "LAEF");
                //showLaefSchools();
                break;
            case 8:
                renderVisState({
                    showSchools: true,
                    showImage: false,
                    zoom: false,
                    showIntroText: false,
                    showCloropleth: false
                }, "TYPE");
                // showSchoolType();
                break;
            case 9: 
                renderVisState({
                    showSchools: true,
                    showImage: false,
                    zoom: false,
                    showIntroText: false,
                    showCloropleth: false
                }, "CERTIFICATION");
                // hideCloropleth();
                // showSchools();
                // showSchoolCert();
                break;
            case 10:
                renderVisState({
                    showSchools: false,
                    showImage: false,
                    zoom: false,
                    showIntroText: false,
                    showCloropleth: true
                });
                // hideSchools();
                // showCloropleth();
                break;
        } 
    }

    $effect(updateVis);

    /* HANDLING VIZ UPDATES */

    interface VisState {
        showSchools: Boolean;
        showImage: Boolean;
        zoom: Boolean;
        showIntroText: Boolean;
        showCloropleth: Boolean;
    }   
    
    type SchoolState = "HAUGAN" | "ALL" | "LAEF" | "CERTIFICATION" | "TYPE";

    function renderVisState(state: VisState, schoolState?: SchoolState, first: boolean = false) {
        console.log("render viz state");
        if (state.showCloropleth) { showCloropleth(); } 
            else { first ? drawBaseMap(path) : showMap(); }
        state.showImage ? showImage() : hideImage();
        state.zoom ? setZoomAspectRaio() : setNormalAspectRaio();
        state.showIntroText ? showIntroText() : hideIntroText();


        if (schoolState) {
            switch(schoolState) {
                case("HAUGAN"):
                    showHaugan();
                    break;
                case("ALL"):
                    showAllSchools();
                    break;
                case("LAEF"):
                    showLaefSchools();
                    break;
                case("CERTIFICATION"):
                    showSchoolCert();
                    break;
                case("TYPE"):
                    showSchoolType();
                    break;
            }
        }

        state.showSchools ? showSchools() : hideSchools();
        
    }

    /* LOADING AND RENDERING GEOJSON DATA */

    function setupMap(geodata?: FeatureCollection): d3.GeoProjection {
        if (geodata === undefined) { console.log("geodata undefined"); return d3.geoMercator(); }
        
        community_areas_geo = loadFeatureCollection(geodata) as FeatureCollection;
        const chi_projection = d3.geoMercator().fitSize([width, height], community_areas_geo);
        projection = chi_projection;
        return chi_projection;
    }

    function loadFeatureCollection(geodata: FeatureCollection) {
        const chiTopo = topojsonS.topology({"community_areas": geodata});    
        return topojsonC.feature(chiTopo, chiTopo.objects.community_areas) as FeatureCollection;       
        // .text(d => `${d.properties.name}, ${statemap.get(d.id.slice(0, 2)).properties.name}\n${valuemap.get(d.id)}%`); 
    }

    function renderBaseMap(community_areas_geo: FeatureCollection, projection: d3.GeoProjection): d3.GeoPath<any, d3.GeoPermissibleObjects> {
        if (community_areas_geo == undefined) {
            console.warn("Data not loaded yet"); // a problem if you refresh the page while on this section
            return d3.geoPath();
        }

        let geoGenerator = d3.geoPath().projection(projection)
        
        console.log("adding map to canvas");
        svg.append('g')
            .selectAll("path") 
            .data(community_areas_geo.features)
            .join("path")
                .attr("class", "comm_area")  
                .attr('fill-opacity', 0)
                .attr("stroke", '#fff') // make it the same color as the background to create gap effect
                .attr("stroke-width", 0.8)
                .attr("d", geoGenerator)
                .attr("visibility", "hidden");
        
        return geoGenerator;
    }

    function drawBaseMap(geoGenerator: d3.GeoPath<any, d3.GeoPermissibleObjects>) {
        drawingInProgress = true;
        d3.selectAll<SVGPathElement, Feature>(".comm_area")
                .attr("visibility", "visible")
                .attr("stroke-dasharray", d => geoGenerator.measure(d) + " " + geoGenerator.measure(d))
                .attr("stroke-dashoffset", d => geoGenerator.measure(d))
                .transition()
                .ease(d3.easeLinear)
                .attr("stroke-dashoffset", 0)
                .duration(2500).on("end", () => drawingInProgress = false);
    }

    function loadSchoolPoints(chi_projection: d3.GeoProjection) {
        d3.json<FeatureCollection>(`${base}/assets/data/all_schools.geojson`) 
            .then(d => processSchoolData(chi_projection, d))
            .then(plotSchoolPoints)
            .catch((err) => {
                console.log(err); // TODO: Handle error
            });
    }

    function processSchoolData(chi_projection: d3.GeoProjection, geodata?: FeatureCollection) {
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
                coordinates: chi_projection((d.geometry as GeoJSON.Point).coordinates as [number, number])!
            }
            schools.push(school);
        });
        console.log("school data loaded");
    }

    function plotSchoolPoints() {
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
        
        console.log("school data plotted");
        schoolsEl = d3.selectAll<SVGCircleElement, Feature>(".school");
    }

/* Viz manipulation */

    function showHaugan() {
        schoolsEl
            .transition()
            .duration(1500)
            .attr("r", 4)
            .attr("fill", function(d) {
                return d.properties?.school_name == "Helge A Haugan Elementary School" ? "red" : "transparent"} )
    }

    function showAllSchools() {
        schoolsEl
            .transition()
            .duration(1000)
            .attr("r", 1.5)
            .attr("fill", "grey");
    }

    function showLaefSchools() {
        schoolsEl
            .transition()
            .duration(1000)
            .attr("r", 3)
            .attr("fill", function(d) {
                return d.properties?.laef ? colorMap["laef"] : "transparent"} )
    }

    function showSchoolType() {
        schoolsEl
            .transition()
            .duration(1000)
            .attr("r", 3)
            .attr("fill", function(d) {         
                return  d.properties?.laef ? colorMap[d.properties?.category] :  "transparent"} )
    }

    function showSchoolCert() {
        schoolsEl
            .transition()
            .duration(1000)
            .attr("r", 3)
            .attr("fill", function(d) {        
                return  d.properties?.laef ? colorMap[d.properties?.certification] :  "transparent"} )
    }

    function showSchools() {
        schoolsEl
            .attr("opacity", 1);
            // .transition()
            // .duration(1000)
            //.attr("visibility", "visible");
    }
    function hideSchools() {
        if (!schoolsEl) { return; }
        schoolsEl
            .transition()
            .duration(1000)
            .attr("opacity", 0)
            //.attr("visibility", "hidden"); // i think the transition duration doesn't work on this as much as transparency
    }

    function showMap() {
        if (drawingInProgress) {
            return;
        }

        d3.selectAll<SVGPathElement, Feature>(".comm_area")
            .attr("visibility", "visible")
            // .attr("stroke-opacity", 0)
            .transition()
            .duration(2500)
            // .attr("stroke-opacity", 1)
            .attr("stroke-dashoffset", 0)
            .attr("stroke-dasharray", "unset")
            .attr("fill-opacity", 0)
            .attr("fill", "transparent")
            .attr("stroke", '#fff') // make it the same color as the background to create gap effect
            .attr("stroke-width", 0.8)
        console.log("show map");
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

    function showCloropleth() {
        d3.selectAll<SVGPathElement, Feature>(".comm_area")
            .transition()
            .duration(1000)
            // .attr("stroke", 'plum')
            .attr("fill-opacity", 1)
            .attr("fill", function(d) {
                return colorMap[(d.properties?.plt_bck)]} )
    }

    function setIntroText() {
        svg.append("text")
            .attr('y', height/2) 
            .attr('font-size', "1rem")
            .attr("font-weight", "500")
            .attr("text-anchor", "middle")
            .attr("opacity", 0)
            .append("tspan")
                .text("Every student should have access")
                .attr("dy", "1rem")
                .attr('x', width/2)
            .append("tspan")
                .text("to the transformative power of the arts.")
                .attr("dy", "1.4rem")
                .attr('x', width/2)
        console.log("adding text to canvas");

    }

    function showIntroText() {
        svg.selectAll("text").transition().duration(2000).attr("opacity", 1);
        console.log("showing text to canvas");
        // d3.selectAll(".pixel")
        //     .attr("opacitiy", 0);
    }

    function hideIntroText() {
        svg.selectAll("text").transition().duration(1500).attr("opacity", 0);
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
    
    function hideImage() {
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

:global(.canvas) {
    margin-top: 10vh;
 }
 
</style>