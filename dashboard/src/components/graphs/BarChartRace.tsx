import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { formatPrecio } from "@/utils/formatPrecio";

export type PropsBarChartRace = {
  year: number;
  values: { name: string; value: number }[];
}[];

export const LIMIT_COUNTRIES_RACE = 10;

const BarChartRace = ({
  data,
  offset = 0,
}: {
  data: PropsBarChartRace;
  offset: number;
}) => {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 1050;
    const height = 500;
    const margin = { top: 50, right: 120, bottom: 20, left: 150 };

    svg.attr("width", width).attr("height", height);

    const xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
    const yScale = d3
      .scaleBand()
      .range([margin.top, height - margin.bottom])
      .padding(data[0]?.values.length > 3 ? 0.5 : 0.7);
    console.log({ bool: data[0]?.values.length > 3,data });

    const xAxis = d3.axisTop(xScale).ticks(5).tickSize(-height);
    const yAxis = d3.axisLeft(yScale).tickSize(5).tickPadding(4);

    const colorScale = d3
      .scaleOrdinal(d3.schemePaired)
      .domain(data.flatMap((d) => d.values.map((v) => v.name)));

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${margin.top})`);
    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left}, 0)`);

    const yearText = svg
      .append("text")
      .attr("class", "year-text")
      .attr("x", width - 100)
      .attr("y", margin.top - 20)
      .attr("text-anchor", "end")
      .attr("font-size", "24px")
      .attr("font-weight", "bold")
      .text("");

    let yearIndex = 0;

    const updateChart = () => {
      const yearData = data[yearIndex];
      const sortedData = yearData.values
        .sort((a, b) => b.value - a.value)
        ?.slice(0, LIMIT_COUNTRIES_RACE + offset);

      xScale.domain([0, d3.max(sortedData, (d) => d.value)] as any);
      yScale
        .domain(sortedData.map((d) => d.name))
        .rangeRound([margin.top, height - margin.bottom]);

      yearText.text(yearData.year);
      svg.select(".x-axis").call(xAxis as any);
      svg.select(".y-axis").call(yAxis as any);

      const bars = svg.selectAll(".bar").data(sortedData, (d: any) => d.name);
      const barHeight = 30;

      const getYPosition = (d): any => {
        if (sortedData.length === 1) {
          return height / 2 - barHeight / 2;
        }
        return yScale(d.name);
      };

      bars
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", xScale(0))
        .attr("y", getYPosition)
        .attr("height", barHeight)
        .attr("fill", (d) => colorScale(d.name))
        .attr("width", 0)
        .transition()
        .duration(800)
        .attr("width", (d) => xScale(d.value) - xScale(0));

      bars
        .transition()
        .duration(800)
        .attr("y", getYPosition)
        .attr("width", (d) => xScale(d.value) - xScale(0));

      bars.exit().transition().duration(500).attr("width", 0).remove();

      const labels = svg
        .selectAll(".label")
        .data(sortedData, (d: any) => d.name);

      const getLabelYPosition = (d) => {
        if (sortedData.length === 1) {
          return height / 2 + barHeight / 4;
        }
        return (yScale(d.name) as any) + barHeight / 2 + 5;
      };

      // label al final de la barra
      labels
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", (d) => xScale(d.value) + 5)
        .attr("y", getLabelYPosition)
        .attr("fill", "black")
        .attr("font-size", "12px")
        .text((d) => `${d.name} ${formatPrecio(d.value)}`);

      //
      labels
        .transition()
        .duration(800)
        .attr("x", (d) => xScale(d.value) + 5)
        .attr("y", getLabelYPosition)
        .text((d) => `${d.name} ${formatPrecio(d.value)}`);

      labels.exit().remove();

      yearIndex = (yearIndex + 1) % data.length;
    };

    const interval = setInterval(updateChart, 2000);

    return () => clearInterval(interval);
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default BarChartRace;
