import { useCallback, useEffect, useRef, useState } from "react";
import useFetch from "../hooks/useFetch";
import Select, { SingleValue } from "react-select";
import "react-tooltip/dist/react-tooltip.css";
import Geo from "./Geo";
import chroma from "chroma-js";
import HorizontalBar from "./graphs/HorizontalBar";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
// import countriesJson from "../../public/features.json";
import countriesJson from "../../public/features.json";
import BarChartRace from "./graphs/BarChartRace";

const Home = () => {
  const { indicators, getDataIndicator, dataIndicator } = useFetch();

  const [currentYearFrom, setCurrentYearFrom] = useState(
    new Date().getFullYear()
  );
  const [currentYearTo, setCurrentYearTo] = useState(new Date().getFullYear());
  const [currentIndicator, setCurrentIndicator] = useState<
    SingleValue<{
      label: string;
      value: string;
    }>
  >({
    // label: "",
    // value: "",
    label: "Población, hombres  (SP.POP.TOTL.MA.IN)",
    value: "SP.POP.TOTL.MA.IN",
  });
  const [minValueIndicator, setMinValueIndicator] = useState(0);
  const [maxValueIndicator, setMaxValueIndicator] = useState(0);
  const [selectedView, setSelectedView] = useState<
    "MAP" | "GRAPH1" | "BAR_CHART_RACE"
  >("MAP");
  const [listCountries, setListCountries] = useState<
    { id: string; name: string }[]
  >([]);
  const colorScaleRef = useRef<chroma.Scale<chroma.Color> | null>(null);

  useEffect(() => {
    setListCountries(
      // @ts-ignore
      countriesJson.objects.world.geometries.map((item) => ({
        id: item.id,
        name: item.properties.name,
      }))
    );
  }, []);

  useEffect(() => {
    if (minValueIndicator !== undefined && maxValueIndicator !== undefined) {
      colorScaleRef.current = chroma
        .scale(chroma.brewer.OrRd)
        .domain([Math.log10(minValueIndicator), Math.log10(maxValueIndicator)])
        .mode("lch");
    }
  }, [minValueIndicator, maxValueIndicator]);

  useEffect(() => {
    // console.log({ currentIndicator });
    if (currentIndicator?.value && currentYearFrom && currentYearTo) {
      getDataIndicator({
        indicator: currentIndicator.value,
        currentYearFrom,
        currentYearTo,
      });
    }
  }, [currentIndicator?.value, currentYearTo, currentYearFrom]);

  useEffect(() => {
    console.log({ dataIndicator });
    if (dataIndicator?.length > 0) {
      // console.log({ dataIndicator });
      setMinValueIndicator(
        Math.min(...dataIndicator.map((item) => item.value))
      );
      setMaxValueIndicator(
        Math.max(...dataIndicator.map((item) => item.value))
      );
    } else {
      setMinValueIndicator(0);
      setMaxValueIndicator(0);
    }
  }, [dataIndicator]);

  const generateColorByValue = useCallback(
    (value) => {
      if (!colorScaleRef.current || typeof colorScaleRef.current !== "function")
        return "#ccc"; // Valor por defecto
      const colorCountry = colorScaleRef
        .current(Math.log10(value as number))
        .hex();
      return colorCountry;
    },
    [colorScaleRef]
  );

  return (
    <div className="flex flex-col justify-center items-center mt-10 w-full">
      <h2>Indicadores</h2>

      <div className="w-full flex flex-col justify-center items-center mt-10 mb-10">
        <Select
          className="w-8/12"
          options={indicators.map((indicador) => ({
            value: indicador.id,
            label: `${indicador.name}  (${indicador.id})`,
          }))}
          maxMenuHeight={200}
          placeholder="Selecciona un indicador"
          value={currentIndicator}
          onChange={(data) => setCurrentIndicator(data)}
        />
      </div>

      {currentIndicator?.value && (
        <div className="text-center">
          <h2>Indicador</h2>
          <h5 className="font-bold">{currentIndicator.label}</h5>
        </div>
      )}

      <div className="flex flex-row justify-end items-end w-10/12">
        <div className="flex flex-col text-center justify-center">
          <p>Intervalo de tiempo</p>

          <div>
            <span>Desde</span>
            <select
              className="text-center"
              value={currentYearFrom}
              onChange={(e) => setCurrentYearFrom(parseInt(e.target.value))}
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>
          <div>
            <span>Hasta</span>
            <select
              className="text-center"
              value={currentYearTo}
              onChange={(e) => setCurrentYearTo(parseInt(e.target.value))}
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="map" className="text-center">
        <TabsList>
          <TabsTrigger
            className="w-64"
            value="map"
            onClick={() => setSelectedView("MAP")}
          >
            Mapa
          </TabsTrigger>
          <TabsTrigger
            className="w-64"
            value="graph1"
            onClick={() => setSelectedView("GRAPH1")}
          >
            Gráfico de barras
          </TabsTrigger>
          <TabsTrigger
            className="w-64"
            value="BAR_CHART_RACE"
            onClick={() => setSelectedView("BAR_CHART_RACE")}
          >
            Gráfico de barras animado
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {/* <div className="w-8/12"> */}
      {selectedView === "MAP" && (
        <Geo
          dataIndicator={dataIndicator}
          generateColorByValue={generateColorByValue}
        />
      )}
      {selectedView === "GRAPH1" && (
        <HorizontalBar
          data={dataIndicator
            .filter((item) => {
              return (
                (listCountries.find((elem) => elem.id === item.countryiso3code)
                  ?.name ||
                  listCountries.find((elem) => elem.id === item.country.id)
                    ?.name) &&
                item.value > 0
              );
            })
            .map((item) => {
              const name =
                listCountries.find((elem) => elem.id === item.countryiso3code)
                  ?.name ||
                listCountries.find((elem) => elem.id === item.country.id)
                  ?.name ||
                "";

              // const name = item.countryiso3code;

              const value = item.value || 0;

              return {
                country: name,
                value,
              };
            })}
          // data={[
          //   { country: "A", value: 30 },
          //   { country: "B", value: 80 },
          //   { country: "C", value: 45 },
          //   { country: "D", value: 60 },
          //   { country: "E", value: 20 },
          //   { country: "F", value: 90 },
          //   { country: "G", value: 55 },
          // ]}
        />
      )}
      {selectedView === "BAR_CHART_RACE" && (
        <BarChartRace
          data={[
            {
              year: 1960,
              values: [
                { name: "Argentina", value: 22229411765 },
                { name: "Brasil", value: 151812883235 },
                { name: "México", value: 13926941176 },
              ],
            },
            {
              year: 1970,
              values: [
                { name: "Brasil", value: 200000000000 },
                { name: "Argentina", value: 25000000000 },
                { name: "México", value: 18000000000 },
              ],
            },
            {
              year: 1971,
              values: [
                { name: "Brasil", value: 300000000000 },
                { name: "Argentina", value: 35000000000 },
                { name: "México", value: 28000000000 },
              ],
            },
            {
              year: 1972,
              values: [
                { name: "Brasil", value: 400000000000 },
                { name: "Argentina", value: 55000000000 },
                { name: "México", value: 68000000000 },
              ],
            },
          ]}
        />
      )}
      {/* </div> */}
    </div>
  );
};

export default Home;
