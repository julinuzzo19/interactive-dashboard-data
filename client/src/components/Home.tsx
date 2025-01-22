import { useCallback, useEffect, useRef, useState } from "react";
import useFetch from "../hooks/useFetch";
import "../App.css";
import Select, { SingleValue } from "react-select";
import "react-tooltip/dist/react-tooltip.css";
import Geo from "./Geo";
import chroma from "chroma-js";
import HorizontalBar from "./graphs/HorizontalBar";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import countriesJson from "../../public/features.json";
import BarChartRace, { PropsBarChartRace } from "./graphs/BarChartRace";
import { TopicSelector } from "./Topics";
import { FaInfoCircle } from "react-icons/fa";
import ModalMetadata from "./ModalMetadata";
import { IndicatorValue } from "@/interfaces/Indicador";

const LIMIT_COUNTRIES_GRAPH = 25;

const Home = () => {
  const {
    indicators,
    getDataIndicator,
    dataIndicator,
    getYearsRangeIndicator,
    rangeYearsIndicator,
    metadataIndicator,
  } = useFetch();

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
  const [dataBarChartRace, setDataBarChartRace] = useState<PropsBarChartRace>(
    []
  );
  const [listCountries, setListCountries] = useState<
    { id: string; name: string }[]
  >([]);
  const colorScaleRef = useRef<chroma.Scale<chroma.Color> | null>(null);
  const [dataGraph, setDataGraph] = useState<any[]>([]);
  const [seeMore, setSeeMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [allTopics, setAllTopics] = useState<{ id: string; value: string }[]>(
    []
  );
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [showModalMetadata, setShowModalMetadata] = useState(false);

  const [dataValues, setDataValues] = useState<IndicatorValue[]>([]);
  // Funciones
  const [funcionSelected, setFuncionSelected] = useState("");
  const [listFunciones] = useState<string[]>(["%", "/", "*"]);

  useEffect(() => {
    console.log({ rangeYearsIndicator });
    if (rangeYearsIndicator?.length > 0) {
      setCurrentYearFrom(rangeYearsIndicator[0] || new Date().getFullYear());
      setCurrentYearTo(rangeYearsIndicator[0] || new Date().getFullYear());
    }
  }, [rangeYearsIndicator]);

  useEffect(() => {
    if (funcionSelected) {
      handleFunctionData();
    }
  }, [funcionSelected]);

  useEffect(() => {
    console.log({ dataValues });
  }, [dataValues]);

  useEffect(() => {
    console.log({ currentYearFrom, currentYearTo });
    if (dataIndicator?.length > 0 && currentYearTo !== currentYearFrom) {
      console.log({ currentYearFrom, currentYearTo, dataIndicator });
    }
  }, [currentYearFrom, currentYearTo, dataIndicator]);

  useEffect(() => {
    setOffset(0);
  }, [selectedView]);

  useEffect(() => {
    if (seeMore) {
      setOffset((prevState) => prevState + LIMIT_COUNTRIES_GRAPH);
      setSeeMore(false);
    }
  }, [seeMore]);

  useEffect(() => {
    handleDataGraph();
  }, [offset]);

  useEffect(() => {
    if (currentIndicator?.value) {
      getYearsRangeIndicator(currentIndicator.value);
    }
  }, [currentIndicator?.value]);

  useEffect(() => {
    setListCountries(
      countriesJson.objects.world.geometries.map((item) => ({
        id: item.id,
        name: item.properties.name,
      }))
    );
  }, []);

  useEffect(() => {
    getTopicsAllIndicators();
  }, [indicators]);

  useEffect(() => {
    console.log({ dataIndicator });
    if (selectedView === "BAR_CHART_RACE") {
      handleDataBarChartRace();
    }
  }, [selectedView, dataIndicator]);

  // useEffect(() => {
  //   console.log({ dataBarChartRace });
  // }, [dataBarChartRace]);

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

  const handleDataBarChartRace = () => {
    const dataBarChart: PropsBarChartRace = [];

    dataIndicator.forEach((value) => {
      const indexListYear = dataBarChart.findIndex(
        (item) => item.year === parseInt(value.date)
      );

      const nameCountry = (listCountries.find(
        (elem) => elem.id === value.countryiso3code
      )?.name ||
        listCountries.find((elem) => elem.id === value.country.id)
          ?.name) as string;

      if (!nameCountry) {
        return;
      }

      if (indexListYear > -1) {
        dataBarChart[indexListYear].values.push({
          name: nameCountry,
          value: value.value,
        });
      } else {
        dataBarChart.push({
          year: parseInt(value.date),
          values: [
            {
              name: nameCountry,
              value: value.value,
            },
          ],
        });
      }
    });

    setDataBarChartRace(dataBarChart.sort((a, b) => a.year - b.year));
  };

  const handleDataGraph = () => {
    const data = dataIndicator
      .filter((item) => {
        return (
          (listCountries.find((elem) => elem.id === item.countryiso3code)
            ?.name ||
            listCountries.find((elem) => elem.id === item.country.id)?.name) &&
          item.value > 0
        );
      })
      .map((item) => {
        const name =
          listCountries.find((elem) => elem.id === item.countryiso3code)
            ?.name ||
          listCountries.find((elem) => elem.id === item.country.id)?.name ||
          "";

        const value = item.value || 0;

        return {
          country: name,
          value,
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, offset + LIMIT_COUNTRIES_GRAPH);

    setDataGraph(data);
  };

  const getTopicsAllIndicators = () => {
    const topics: { id: string; value: string }[] = [];

    indicators.forEach((indicator) =>
      indicator.topics.forEach((topic) => {
        if (!topics.some((item) => item.id === topic.id)) {
          topics.push(topic);
        }
      })
    );
    setAllTopics(topics);
  };

  const handleFunctionData = () => {
    console.log({ dataIndicator });

    let objectValuesCountries: { [key in string]: IndicatorValue[] } = {};

    dataIndicator.forEach((indicatorValue) => {
      if (!objectValuesCountries[indicatorValue.countryiso3code]) {
        objectValuesCountries[indicatorValue.countryiso3code] = [
          indicatorValue,
        ];
      } else {
        objectValuesCountries[indicatorValue.countryiso3code].push(
          indicatorValue
        );
      }
    });

    console.log({ objectValuesCountries });

    const dataFinal: IndicatorValue[] = [];

    Object.values(objectValuesCountries).forEach((value) => {
      console.log({ value });

      const itemData = value[0];

      const valueFinal = value.reduce((acc, curr) => {
        // usar funcion
        return acc + curr.value;
      }, 0);

      dataFinal.push({ ...itemData, value: valueFinal });
    });

    setDataValues(dataFinal);
  };

  return (
    <div className="flex flex-col justify-center items-center mt-10 w-full">
      <h2>Indicadores</h2>

      <div className="w-full flex flex-col justify-center items-center mt-10 mb-10">
        <TopicSelector
          topics={allTopics}
          setSelectedTopic={setSelectedTopic}
          selectedTopic={selectedTopic}
        />

        <Select
          className="w-8/12"
          options={indicators
            .filter((item) => {
              if (!selectedTopic) return true;
              else {
                return item.topics.some((elem) => elem.id === selectedTopic);
              }
            })
            .map((indicador) => ({
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
          <h2>Indicador seleccionado</h2>
          <div className="flex flex-row gap-2 justify-center items-center">
            <h5 className="font-bold">{currentIndicator.label}</h5>
            <FaInfoCircle
              role="button"
              onClick={() => setShowModalMetadata(true)}
            />
          </div>
        </div>
      )}

      {/* FECHAS */}
      <div className="flex flex-row justify-end items-end w-10/12 mb-5">
        <div className="flex flex-col text-center justify-center">
          <b>Intervalo de tiempo</b>

          <div>
            <span>Desde</span>
            <select
              className="text-center"
              value={currentYearFrom}
              onChange={(e) => setCurrentYearFrom(parseInt(e.target.value))}
            >
              {rangeYearsIndicator.map((year) => {
                return (
                  <option value={year} key={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <span>Hasta</span>
            <select
              className="text-center"
              value={currentYearTo}
              onChange={(e) => setCurrentYearTo(parseInt(e.target.value))}
            >
              {rangeYearsIndicator.map((year) => {
                return (
                  <option value={year} key={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>
      {/* FIN FECHAS */}

      {/* FUNCION */}
      <div className="flex flex-row justify-end items-end w-10/12">
        <div className="flex flex-col text-center justify-center">
          <b>Función a utilizar</b>

          <div>
            <select
              className="text-center"
              value={funcionSelected}
              onChange={(e) => setFuncionSelected(e.target.value)}
            >
              {listFunciones.map((func) => {
                return (
                  <option value={func} key={func}>
                    {func}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>
      {/* FIN FUNCION */}

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
            onClick={() => {
              handleDataGraph();
              setSelectedView("GRAPH1");
            }}
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
      {selectedView === "MAP" && (
        <Geo
          dataIndicator={dataIndicator}
          generateColorByValue={generateColorByValue}
        />
      )}
      {selectedView === "GRAPH1" && (
        <>
          <HorizontalBar data={dataGraph} />

          {dataGraph.length <= dataIndicator.length ? (
            <button
              onClick={() => {
                setSeeMore(true);
              }}
            >
              Mostrar más paises
            </button>
          ) : (
            ""
          )}
        </>
      )}
      {selectedView === "BAR_CHART_RACE" && (
        <BarChartRace data={dataBarChartRace} />
      )}

      {showModalMetadata && (
        <ModalMetadata
          show={showModalMetadata}
          setShow={setShowModalMetadata}
          metadata={metadataIndicator}
        />
      )}
    </div>
  );
};

export default Home;

// BAR CHART RACE TEST DATA
// [
//             {
//               year: 1960,
//               values: [
//                 { name: "Argentina", value: 22229411765 },
//                 { name: "Brasil", value: 151812883235 },
//                 { name: "México", value: 13926941176 },
//               ],
//             },
//             {
//               year: 1970,
//               values: [
//                 { name: "Brasil", value: 200000000000 },
//                 { name: "Argentina", value: 25000000000 },
//                 { name: "México", value: 18000000000 },
//               ],
//             },
//             {
//               year: 1971,
//               values: [
//                 { name: "Brasil", value: 300000000000 },
//                 { name: "Argentina", value: 35000000000 },
//                 { name: "México", value: 28000000000 },
//               ],
//             },
//             {
//               year: 1972,
//               values: [
//                 { name: "Brasil", value: 400000000000 },
//                 { name: "Argentina", value: 55000000000 },
//                 { name: "México", value: 68000000000 },
//               ],
//             },
//           ]
