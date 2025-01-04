import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { formatPrecio } from "@/utils/formatPrecio";

interface PropsBarChartRace {
  data: { year: number; values: { name: string; value: number }[] }[];
}

const BarChartRace = ({ data }: PropsBarChartRace) => {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 400;
    const margin = { top: 50, right: 20, bottom: 20, left: 100 };

    svg.attr("width", width).attr("height", height);

    // Set up the scales
    const xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
    const yScale = d3
      .scaleBand()
      .range([margin.top, height - margin.bottom])
      .padding(0.1);

    // Set up the axes
    const xAxis = d3.axisTop(xScale).ticks(5).tickSize(-height);
    const yAxis = d3.axisLeft(yScale).tickSize(0);

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${margin.top})`);
    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left}, 0)`);

    // Add a text element for the year
    const yearText = svg
      .append("text")
      .attr("class", "year-text")
      .attr("x", width - 100)
      .attr("y", margin.top - 20)
      .attr("text-anchor", "end")
      .attr("padding-bottom", "10px")
      .attr("font-size", "24px")
      .attr("font-weight", "bold")
      .text("");

    // Animation
    let yearIndex = 0;

    const updateChart = () => {
      const yearData = data[yearIndex];
      const sortedData = yearData.values
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      xScale.domain([0, d3.max(sortedData, (d) => d.value)]);
      yScale.domain(sortedData.map((d) => d.name));

      // Update year text
      yearText.text(yearData.year);

      // Update axes
      svg.select(".x-axis").call(xAxis);
      svg.select(".y-axis").call(yAxis);

      // Bind data
      const bars = svg.selectAll(".bar").data(sortedData, (d) => d.name);

      // Enter
      bars
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", xScale(0))
        .attr("y", (d) => yScale(d.name))
        .attr("height", yScale.bandwidth())
        .attr("fill", "steelblue")
        .attr("width", 0)
        .transition()
        .duration(1000)
        .attr("width", (d) => xScale(d.value) - xScale(0));

      // Update
      bars
        .transition()
        .duration(1000)
        .attr("y", (d) => yScale(d.name))
        .attr("width", (d) => xScale(d.value) - xScale(0));

      // Exit
      bars.exit().transition().duration(500).attr("width", 0).remove();

      // Agregar etiquetas de texto (nombre y valor)
      const labels = svg.selectAll(".label").data(sortedData, (d) => d.name);

      // Enter para las etiquetas
      labels
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", (d) => xScale(d.value) + 5) // Posición al final de la barra
        .attr("y", (d) => yScale(d.name) + yScale.bandwidth() / 2 + 5) // Centrado vertical
        .attr("fill", "black")
        .attr("font-size", "12px")
        .text((d) => `${d.name} ${d.value}`);

      // Update para las etiquetas
      labels
        .transition()
        .duration(1000)
        .attr("x", (d) => xScale(d.value) + 5)
        .attr("y", (d) => yScale(d.name) + yScale.bandwidth() / 2 + 5)
        .text((d) => `${d.name} ${formatPrecio(d.value)}`);

      // Exit para las etiquetas
      labels.exit().remove();

      yearIndex = (yearIndex + 1) % data.length;
    };

    const interval = setInterval(updateChart, 2000);

    return () => clearInterval(interval); // Clean up
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default BarChartRace;
