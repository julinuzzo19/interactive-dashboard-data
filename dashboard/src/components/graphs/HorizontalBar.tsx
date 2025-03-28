// @ts-nocheck
import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { tecnicaUtilizada } from "@/hooks/predictions/predictions.interface";

const HorizontalBar = ({
  data,
  width = 1000,
  height = 1000,
}: {
  data: {
    country: string;
    value: string;
    tecnicaUtilizada?: tecnicaUtilizada;
  }[];
  width?: number;
  height?: number;
}) => {
  const svgRef = useRef();

  useEffect(() => {
    console.log({ data });

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Limpiar contenido previo

    const margin = { top: 20, right: 30, bottom: 20, left: 150 };
    const dynamicHeight = data.length * 35 + margin.top + margin.bottom; // Aumentamos el factor a 50 para más espacio
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = dynamicHeight - margin.top - margin.bottom;

    console.log({ dynamicHeight });

    svg.attr("width", width).attr("height", dynamicHeight);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => parseFloat(d.value))]) // Asegurarse de que value sea numérico
      .range([0, chartWidth]);

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.country))
      .range([0, chartHeight])
      .padding(0.2); // Ajustar el padding para un gap razonable

    const chart = svg
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
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", (d) => y(d.country)) // Usar directamente la posición de y
      .attr("x", 0)
      .attr("width", (d) => x(parseFloat(d.value))) // Asegurarse de que value sea numérico
      .attr("height", y.bandwidth()) // Usar bandwidth para el alto
      .attr("fill", "steelblue")
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .text(
            `${d.country}: ${parseFloat(d.value).toLocaleString()}${
              d?.tecnicaUtilizada ? ` (Predicción: ${d.tecnicaUtilizada})` : ""
            }`
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

    const yAxis = chart.append("g").call(d3.axisLeft(y)); // Países como etiquetas en el eje Y

    yAxis.attr("font-size", "11px").attr("dy", "0.35em").attr("dx", "-120");

    yAxis
      .selectAll(".tick text")
      .on("mouseover", (event, d) => {
        const countryData = data.find((country) => country.country === d);
        tooltip
          .style("visibility", "visible")
          .text(
            `${countryData.country}: ${parseFloat(
              countryData.value
            ).toLocaleString()}${
              countryData?.tecnicaUtilizada
                ? ` (Predicción: ${countryData.tecnicaUtilizada})`
                : ""
            }`
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

    return () => {
      tooltip.remove(); // Limpiar el tooltip al desmontar
    };
  }, [data, width]);

  return <svg ref={svgRef}></svg>;
};

export default HorizontalBar;
