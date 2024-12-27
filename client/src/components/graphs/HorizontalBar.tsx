// @ts-nocheck
import { useRef, useEffect } from "react";
import * as d3 from "d3";

const HorizontalBar = ({ data, width = 1000, height = 1800 }) => {
  const svgRef = useRef();

  useEffect(() => {
    const sortedData = data.sort((a, b) => b.value - a.value);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Limpiar contenido previo

    const margin = { top: 20, right: 30, bottom: 40, left: 150 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(sortedData, (d) => d.value)])
      .range([0, chartWidth]);

    const y = d3
      .scaleBand()
      .domain(sortedData.map((d) => d.country))
      .range([0, chartHeight])
      .padding(0.2);

    const chart = svg
      .attr("width", width)
      .attr("height", height)
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

    chart
      .selectAll(".bar")
      .data(sortedData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", (d) => y(d.country))
      .attr("x", 0)
      .attr("width", (d) => x(d.value))
      .attr("height", y.bandwidth())
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

    yAxis
      .attr("font-size", "11px")
      // .attr("font-weight", "bold")
      .attr("dy", "0.35em")
      .attr("dx", "-120");

    yAxis
      .selectAll(".tick text")
      .on("mouseover", (event, d) => {
        const countryData = sortedData.find((country) => country.country === d);
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

  // function zoom(svg) {
  //   const margin = { top: 20, right: 20, bottom: 20, left: 100 };

  //   const extent = [
  //     [margin.left, margin.top],
  //     [width - margin.right, height - margin.top],
  //   ];

  //   svg.call(
  //     d3
  //       .zoom()
  //       .scaleExtent([1, 8])
  //       .translateExtent(extent)
  //       .extent(extent)
  //       .on("zoom", zoomed)
  //   );

  //   function zoomed(event) {
  //     x.range(
  //       [margin.left, width - margin.right].map((d) =>
  //         event.transform.applyX(d)
  //       )
  //     );
  //     svg
  //       .selectAll(".bars rect")
  //       .attr("x", (d) => x(d.letter))
  //       .attr("width", x.bandwidth());
  //     svg.selectAll(".x-axis").call(xAxis);
  //   }
  // }

  return <svg ref={svgRef}></svg>;
};

export default HorizontalBar;
