// @ts-nocheck
import { useRef, useEffect } from "react";
import * as d3 from "d3";

const HorizontalBar = ({ data, width = 1000, height = 1000 }) => {
  const svgRef = useRef();

  useEffect(() => {
    // const sortedData = data.sort((a, b) => b.value - a.value);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Limpiar contenido previo

    const margin = { top: 20, right: 30, bottom: 40, left: 150 };
    // const chartWidth = width - margin.left - margin.right;
    // const chartHeight = height - margin.top - margin.bottom;

    const dynamicHeight = data.length * 30 + margin.top + margin.bottom;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = dynamicHeight - margin.top - margin.bottom;

    svg.attr("width", width).attr("height", chartHeight);

    console.log({data})
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .range([0, chartWidth]);

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.country))
      .range([0, chartHeight + 10])
      .padding(1.5);

    const chart = svg
      .attr("width", width)
      .attr("height", chartHeight + 15)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Crear el tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("padding", "8px")
      .style("box-shadow", "0 2px 4px rgba(0, 0, 0, 0.2)")
      .style("visibility", "hidden")
      .style("font-size", "14px");

    const heightBar = 25;

    chart
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      // .attr("y", (d) => y(d.country))
      .attr("y", (d) => y(d.country) + (y.bandwidth() - heightBar) / 2)
      .attr("x", 0)
      .attr("width", (d) => x(d.value))
      // .attr("height", y.bandwidth())
      .attr("height", heightBar)
      .attr("fill", "steelblue")
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .text(`${d.country}: ${d.value.toLocaleString()}`);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    const yAxis = chart.append("g").call(d3.axisLeft(y)); // Países como etiquetas en el eje Y

    yAxis.attr("font-size", "11px").attr("dy", "0.35em").attr("dx", "-120");

    yAxis
      .selectAll(".tick text")
      .on("mouseover", (event, d) => {
        const countryData = data.find((country) => country.country === d);
        tooltip
          .style("visibility", "visible")
          .text(
            `${countryData.country}: ${countryData.value.toLocaleString()}`
          );
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", `${event.pageY - 10}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("visibility", "hidden");
      });

    chart
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x)); // Valores de población en el eje X
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default HorizontalBar;
