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
import ModalMetadata from "./modals/ModalMetadata";
import { IndicatorValue } from "@/interfaces/Indicador";
import useFunctions, {
  DEFAULT_VALUE_FUNCTION,
  FUNCTIONS_LIST,
  FunctionValue,
} from "@/hooks/useFunctions";
import ModalFunction from "./modals/ModalFunction";

const LIMIT_COUNTRIES_GRAPH = 25;
const LIMIT_COUNTRIES_RACE = 10;

const Home = () => {
  const {
    indicators,
    getDataIndicator,
    dataIndicator,
    getYearsRangeIndicator,
    rangeYearsIndicator,
    metadataIndicator,
  } = useFetch();
  const { getValueFunction } = useFunctions();
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
  const [seeMore, setSeeMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [allTopics, setAllTopics] = useState<{ id: string; value: string }[]>(
    []
  );
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [showModalMetadata, setShowModalMetadata] = useState(false);
  const [dataValues, setDataValues] = useState<IndicatorValue[]>([]);
  const [dataGraph1, setDataGraph1] = useState<any[]>([]);
  // Funciones
  const [functionSelected, setFunctionSelected] = useState<FunctionValue>(
    DEFAULT_VALUE_FUNCTION
  );
  const [showModalFunction, setShowModalFunction] = useState(false);

  useEffect(() => {
    console.log({ dataBarChartRace });
  }, [dataBarChartRace]);

  useEffect(() => {
    console.log({ dataIndicator });
  }, [dataIndicator]);

  useEffect(() => {
    console.log({ dataValues });
  }, [dataValues]);

  useEffect(() => {
    if (rangeYearsIndicator?.length > 0) {
      setCurrentYearFrom(rangeYearsIndicator[0] || new Date().getFullYear());
      setCurrentYearTo(rangeYearsIndicator[0] || new Date().getFullYear());
    }
  }, [rangeYearsIndicator]);

  useEffect(() => {
    console.log({ functionSelected, dataIndicator });
    if (functionSelected) {
      handleFunctionData();
    }
  }, [functionSelected, dataIndicator]);

  useEffect(() => {
    console.log({ currentYearFrom, currentYearTo, dataValues });
    if (currentYearTo !== currentYearFrom) {
      setShowModalFunction(true);
    }
  }, [currentYearFrom, currentYearTo]);

  useEffect(() => {
    setOffset(0);
  }, [selectedView]);

  useEffect(() => {
    if (seeMore) {
      if (selectedView === "GRAPH1") {
        setOffset((prevState) => prevState + LIMIT_COUNTRIES_GRAPH);
      } else if (selectedView === "BAR_CHART_RACE") {
        setOffset((prevState) => prevState + LIMIT_COUNTRIES_RACE);
      }
      setSeeMore(false);
    }
  }, [seeMore]);

  useEffect(() => {
    if (selectedView === "GRAPH1") {
      handleDataGraph();
    } else if (selectedView === "BAR_CHART_RACE") {
      handleDataBarChartRace();
    }
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
    if (selectedView === "GRAPH1") {
      handleDataGraph();
    } else if (selectedView === "BAR_CHART_RACE") {
      handleDataBarChartRace();
    }
  }, [selectedView]);

  useEffect(() => {
    if (selectedView === "BAR_CHART_RACE") {
      handleDataBarChartRace();
    }
  }, [dataIndicator]);

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
    if (dataValues?.length > 0) {
      // console.log({ dataValues });
      setMinValueIndicator(Math.min(...dataValues.map((item) => item.value)));
      setMaxValueIndicator(Math.max(...dataValues.map((item) => item.value)));
    } else {
      setMinValueIndicator(0);
      setMaxValueIndicator(0);
    }
  }, [dataValues]);

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

    console.log({ dataBarChart });

    setDataBarChartRace(dataBarChart.sort((a, b) => a.year - b.year));
  };

  const handleDataGraph = () => {
    const data = dataValues
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

    setDataGraph1(data);
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

    const dataFinal: IndicatorValue[] = [];

    Object.values(objectValuesCountries).forEach((value) => {
      const itemData = value[0];

      let valueFinal;
      if (functionSelected?.value) {
        const valueFunction = getValueFunction({
          func: functionSelected.value,
          indicatorValues: value,
        });

        valueFinal = valueFunction.value;
      } else {
        valueFinal = value[0].value;
      }

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
      {dataValues?.length > 0 &&
        currentYearTo !== currentYearFrom &&
        selectedView !== "BAR_CHART_RACE" && (
          <div className="flex flex-row justify-end items-end w-10/12">
            <div className="flex flex-col text-center justify-center">
              <div className="flex flex-row gap-2 justify-center items-center">
                <b>Función a utilizar</b>
                <FaInfoCircle
                  role="button"
                  onClick={() => setShowModalFunction(true)}
                />
              </div>
              <div>
                <select
                  className="text-center"
                  value={functionSelected.value}
                  onChange={(e) =>
                    setFunctionSelected(
                      (FUNCTIONS_LIST.find(
                        (item) => e.target.value === item.value
                      ) || DEFAULT_VALUE_FUNCTION) as FunctionValue
                    )
                  }
                >
                  {FUNCTIONS_LIST.map((func) => {
                    return (
                      <option value={func.value} key={func.value}>
                        {func.label}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        )}
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
          dataIndicator={dataValues}
          generateColorByValue={generateColorByValue}
        />
      )}
      {selectedView === "GRAPH1" && (
        <>
          <HorizontalBar data={dataGraph1} />

          {dataValues.length <= dataIndicator.length ? (
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
        <>
          <BarChartRace data={dataBarChartRace} offset={offset} />
          {dataValues.length <= dataIndicator.length ? (
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

      {showModalMetadata && (
        <ModalMetadata
          show={showModalMetadata}
          setShow={setShowModalMetadata}
          metadata={metadataIndicator}
        />
      )}
      {showModalFunction && (
        <ModalFunction
          show={showModalFunction}
          setShow={setShowModalFunction}
          setFunctionSelected={setFunctionSelected}
          functionSelected={functionSelected}
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
