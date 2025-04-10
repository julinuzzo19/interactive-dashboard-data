import { useCallback, useContext, useEffect, useRef, useState } from "react";
import useFetch, { USE_MOCK } from "../hooks/useFetch";
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
import { AppContext } from "@/store/Context";
import ModalCountriesSelect from "./modals/ModalCountriesSelect";
import { errNotif } from "./ui/Notifications";
import { TecnicaPredictiva } from "@/hooks/predictions/predictions.interface";
import { cn } from "@/lib/utils";
import ModalBusqueda from "./modals/ModalBusqueda";

const LIMIT_COUNTRIES_GRAPH = 25;
const LIMIT_COUNTRIES_RACE = 10;
const DEFAULT_MAP_COLOR = "#ccc";
const DEFAULT_FUNCTION: FunctionValue = {
  label: "Más reciente",
  value: "RECIENTE",
};

const Home = () => {
  const { dispatch } = useContext(AppContext);
  const {
    indicators,
    getDataIndicator,
    setDataIndicator,
    dataIndicator,
    getYearsRangeIndicator,
    rangeYearsIndicator,
    metadataIndicator,
    regions,
    countries,
    getRegionsCountriesAPI,
  } = useFetch();
  const { getValueFunction } = useFunctions();
  const [currentYearFrom, setCurrentYearFrom] = useState(0);
  const [currentYearTo, setCurrentYearTo] = useState(0);
  const [currentIndicator, setCurrentIndicator] = useState<
    SingleValue<{
      label: string;
      value: string;
    }>
  >({
    ...(USE_MOCK
      ? {
          label: "Población, hombres  (SP.POP.TOTL.MA.IN)",
          value: "SP.POP.TOTL.MA.IN",
        }
      : { label: "Buscar...", value: "" }),
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
  const [dataGraph1, setDataGraph1] = useState<
    {
      country: string;
      value: string;
      tecnicaUtilizada?: TecnicaPredictiva;
      year: string;
    }[]
  >([]);
  // Funciones
  const [functionSelected, setFunctionSelected] = useState<FunctionValue>({
    label: "",
    value: "",
  });
  const [showModalFunction, setShowModalFunction] = useState(false);
  const [showModalCountries, setShowModalCountries] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    USE_MOCK ? ["ARG", "BRA"] : []
  );
  //
  const [filtrosSelected, setFiltrosSelected] = useState<{
    PAISES: boolean;
    INDICADOR: boolean;
    TIEMPO: boolean;
  }>({
    PAISES: false,
    INDICADOR: false,
    TIEMPO: false,
  });
  const [busquedaRealizada, setBusquedaRealizada] = useState<boolean>(false);

  // useEffect(() => {
  //   console.log({ dataValues, dataBarChartRace, dataGraph1, dataIndicator });
  // }, [dataValues, dataBarChartRace, dataGraph1, dataIndicator]);

  // useEffect(() => {
  //   console.log({ dataValues, dataGraph1, dataIndicator, selectedCountries });
  // }, [dataValues, dataGraph1, dataIndicator, selectedCountries]);

  // Carga inicial
  useEffect(() => {
    getRegionsCountriesAPI();
  }, []);

  useEffect(() => {
    console.log({ selectedCountries });
    setFiltrosSelected((prevState) => ({
      ...prevState,
      PAISES: selectedCountries.length > 0,
    }));
  }, [selectedCountries]);

  useEffect(() => {
    console.log({ currentIndicator });
    if (currentIndicator?.value) {
      setFiltrosSelected((prevState) => ({ ...prevState, INDICADOR: true }));
    }
  }, [currentIndicator]);

  useEffect(() => {
    console.log({ currentIndicator });
    if (currentIndicator?.value) {
      setFiltrosSelected((prevState) => ({ ...prevState, INDICADOR: true }));
    }
  }, [currentIndicator]);

  useEffect(() => {
    console.log({ currentYearFrom, currentYearTo });

    setFiltrosSelected((prevState) => ({
      ...prevState,
      TIEMPO: Boolean(currentYearFrom && currentYearTo),
    }));
  }, [currentYearFrom, currentYearTo]);

  useEffect(() => {
    console.log({ rangeYearsIndicator });
    if (rangeYearsIndicator?.length > 0) {
      if (USE_MOCK) {
        setCurrentYearFrom(2020);
        setCurrentYearTo(2022);
      } else {
        // setCurrentYearFrom(rangeYearsIndicator[0]);
        // setCurrentYearTo(rangeYearsIndicator[0]);
      }
    }
  }, [rangeYearsIndicator]);

  useEffect(() => {
    if (functionSelected) {
      handleFunctionData();

      dispatch({
        type: "setHasYearFunction",
        payload: ["MAX", "MIN", "RECIENTE", "ANTIGUO"].includes(
          functionSelected.value
        ),
      });
    }
  }, [functionSelected, dataIndicator, selectedCountries]);

  useEffect(() => {
    if (
      busquedaRealizada &&
      selectedCountries.length > 0 &&
      currentYearTo &&
      currentYearFrom &&
      currentYearTo !== currentYearFrom &&
      !functionSelected?.value &&
      selectedView !== "BAR_CHART_RACE"
    ) {
      setShowModalFunction(true);
    }
  }, [currentYearFrom, currentYearTo, selectedCountries, busquedaRealizada]);

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
  }, [offset, selectedCountries, dataValues, dataIndicator]);

  useEffect(() => {
    if (currentIndicator?.value) {
      getYearsRangeIndicator(currentIndicator.value, selectedCountries);
    }
  }, [currentIndicator?.value, selectedCountries]);

  useEffect(() => {
    if (
      selectedCountries.some((item) =>
        dataIndicator.some((elem) => elem.countryiso3code === item)
      )
    ) {
      getDataIndicadorAPI();
    }
  }, [selectedCountries]);

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

  useEffect(() => {
    if (
      currentIndicator?.value &&
      currentYearFrom &&
      currentYearTo &&
      busquedaRealizada
    ) {
      getDataIndicadorAPI();
    }
  }, [currentIndicator?.value, currentYearTo, currentYearFrom]);

  useEffect(() => {
    if (busquedaRealizada) {
      getDataIndicadorAPI();
    }
  }, [busquedaRealizada]);

  useEffect(() => {
    if (dataValues?.length > 0) {
      const minValue = Math.min(...dataValues.map((item) => item.value));
      const maxValue = Math.max(...dataValues.map((item) => item.value));
      setMinValueIndicator(minValue > 0 ? minValue : Math.sqrt(minValue) || 0);
      setMaxValueIndicator(maxValue > 0 ? maxValue : Math.sqrt(maxValue) || 0);
    } else {
      setMinValueIndicator(0);
      setMaxValueIndicator(0);
    }
  }, [dataValues]);

  const getDataIndicadorAPI = async () => {
    try {
      await getDataIndicator({
        indicator: currentIndicator?.value as string,
        currentYearFrom,
        currentYearTo,
        selectedCountries: selectedCountries,
      });
    } catch (error) {
      console.log({ error });
      errNotif("No hay datos para el indicador seleccionado");
      setDataIndicator([]);
      // console.log("No hay datos para el indicador seleccionado");
    }
  };

  const generateColorByValue = useCallback(
    (value: number) => {
      try {
        if (
          value == undefined ||
          value == null ||
          (minValueIndicator == undefined && maxValueIndicator == undefined) ||
          minValueIndicator === maxValueIndicator
        ) {
          return DEFAULT_MAP_COLOR;
        }

        if (!colorScaleRef.current) {
          colorScaleRef.current = chroma
            .scale(chroma.brewer.OrRd)
            .domain([
              minValueIndicator > 1
                ? Math.log10(minValueIndicator)
                : Math.sqrt(minValueIndicator),
              maxValueIndicator > 1
                ? Math.log10(maxValueIndicator)
                : Math.sqrt(maxValueIndicator),
            ])
            .mode("lch");
        }

        const valueFinal = value > 1 ? Math.log10(value) : Math.sqrt(value);

        const colorCountry = colorScaleRef.current(valueFinal).hex();

        return colorCountry;
      } catch (error) {
        console.log({ errorgenerateColorByValue: error });
      }
    },
    [colorScaleRef, minValueIndicator, maxValueIndicator]
  );

  const handleDataBarChartRace = () => {
    const dataBarChart: PropsBarChartRace = [];

    const dataIndicatorFiltered =
      selectedCountries?.length > 0
        ? dataIndicator.filter((item) =>
            selectedCountries.includes(item.countryiso3code)
          )
        : dataIndicator;

    dataIndicatorFiltered.forEach((value) => {
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
    const dataValuesFiltered =
      selectedCountries?.length > 0
        ? dataValues.filter((item) =>
            selectedCountries.includes(item.countryiso3code)
          )
        : dataValues;

    console.log({ dataValuesFiltered, countries });
    const data = dataValuesFiltered
      .filter(
        (item) =>
          countries.find((elem) => elem.id == item.countryiso3code)?.name
      )
      .map((item) => {
        const countryFound = countries
          // .filter((elem) => elem.region.value !== "Agregados")
          .find((elem) => elem.id == item.countryiso3code);

        const value = item?.value || 0;

        return {
          country: countryFound?.name as string,
          value,
          tecnicaUtilizada: item?.tecnicaUtilizada,
          year: item.date,
        };
      })
      .sort((a, b) => b?.value - a?.value)
      ?.slice(0, offset + LIMIT_COUNTRIES_GRAPH);

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
    let objectValuesCountries: { [key in string]: IndicatorValue[] } = {};

    const dataIndicatorFiltered =
      selectedCountries?.length > 0
        ? dataIndicator.filter((item) =>
            selectedCountries.includes(item.countryiso3code)
          )
        : dataIndicator;

    dataIndicatorFiltered.forEach((indicatorValue) => {
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
      let valueFunction;

      let valueFinal;
      let yearFinal;

      if (functionSelected?.value) {
        valueFunction = getValueFunction({
          func: functionSelected.value,
          indicatorValues: value,
        });

        valueFinal = valueFunction.value;
        yearFinal = valueFunction.date;
      } else {
        valueFinal = value[0].value;
        yearFinal = value[0].date;
      }

      const itemData = { ...valueFunction, value: valueFinal, date: yearFinal };

      dataFinal.push(itemData);
    });

    setDataValues(dataFinal);
  };

  return (
    <div className="flex flex-col  justify-center items-center mt-10 w-full">
      <h2 className="mb-4 text-2xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-4xl dark:text-white">
        Dashboard de Indicadores de salud global
      </h2>

      <div className="w-full flex flex-col justify-center items-center mt-5 mb-5">
        <TopicSelector
          topics={allTopics}
          setSelectedTopic={setSelectedTopic}
          selectedTopic={selectedTopic}
        />
      </div>

      <div className="grid grid-cols-[15%_68%_11%] gap-4 w-full">
        <div className="flex flex-col w-full bg-gray-100 border rounded-xl p-4 mt-5 text-center">
          <span className="text-2xl font-semibold leading-none tracking-tight text-center">
            Filtros:
          </span>
          {/* FECHAS */}
          <div className="flex flex-row w-full justify-center items-center">
            <div
              className={`flex flex-col text-center justify-center ${
                !currentIndicator?.value && "invisiblevisible"
              } }`}
            >
              <span className="text-lg font-bold leading-none tracking-tight m-2 text-center">
                Intervalo de tiempo
              </span>
              <div>
                <span>Desde</span>
                <select
                  disabled={!Boolean(currentIndicator?.value)}
                  className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-center"
                  value={currentYearFrom}
                  onChange={(e) => setCurrentYearFrom(parseInt(e.target.value))}
                >
                  <option value={0}>Seleccione</option>
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
                  disabled={!Boolean(currentIndicator?.value)}
                  className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-center"
                  value={currentYearTo}
                  onChange={(e) => setCurrentYearTo(parseInt(e.target.value))}
                >
                  <option value={0}>Seleccione</option>
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
          <div
            className={cn(
              "flex flex-col text-center justify-center w-full mt-5"
            )}
          >
            <div className="flex flex-row gap-2 justify-center items-center">
              <span
                className={cn(
                  "text-lg font-bold leading-none tracking-tight m-2 text-center",
                  !(
                    dataValues?.length > 0 &&
                    currentYearTo !== currentYearFrom &&
                    selectedView !== "BAR_CHART_RACE"
                  ) && "text-gray-500"
                )}
              >
                Función a utilizar
              </span>
              <FaInfoCircle
                role="button"
                onClick={() => setShowModalFunction(true)}
              />
            </div>
            <div>
              <select
                disabled={
                  !(
                    dataValues?.length > 0 &&
                    currentYearTo !== currentYearFrom &&
                    selectedView !== "BAR_CHART_RACE"
                  )
                }
                className="appearance-none w-10/12 bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 text-center"
                value={functionSelected.value}
                onChange={(e) =>
                  setFunctionSelected(
                    (FUNCTIONS_LIST.find(
                      (item) => e.target.value === item.value
                    ) || DEFAULT_VALUE_FUNCTION) as FunctionValue
                  )
                }
              >
                <option value="">Seleccione</option>
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
          {/* FIN FUNCION */}
          {/* Selector de paises */}
          <div className="flex flex-row justify-center items-center w-full mt-5">
            <div className="flex flex-col text-center justify-center">
              <div className="flex flex-row gap-2 justify-center items-center">
                <span className="text-lg font-bold leading-none tracking-tight m-2 text-center">
                  Países seleccionados
                </span>
                <FaInfoCircle
                  role="button"
                  onClick={() => setShowModalCountries(true)}
                />
              </div>
              <div>
                {selectedCountries?.length > 0
                  ? countries.length === selectedCountries?.length
                    ? "TODOS"
                    : selectedCountries.length
                  : "-"}
              </div>
            </div>
          </div>
          {/* FIN Selector de paises */}
        </div>

        <div className="w-full">
          {/* Selector de indicadores */}
          <div className="flex flex-col justify-center items-center w-full">
            <span className="font-semibold leading-none tracking-tight mb-2">
              Seleccione el indicador:
            </span>
            <Select
              className="w-6/12"
              options={indicators
                .filter((item) => {
                  if (!selectedTopic) return true;
                  else {
                    return item.topics.some(
                      (elem) => elem.id === selectedTopic
                    );
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
          {/* Fin selector */}

          {currentIndicator?.value && (
            <div className="text-center">
              <h2 className="font-semibold leading-none tracking-tight mb-2 mt-4">
                Indicador seleccionado
              </h2>
              <div className="flex flex-row gap-2 justify-center items-center">
                <h5 className="font-bold">{currentIndicator.label}</h5>
                <FaInfoCircle
                  role="button"
                  onClick={() => setShowModalMetadata(true)}
                />
              </div>
            </div>
          )}

          <div className="text-center">
            <h2 className="text-xl font-semibold leading-none tracking-tight mb-5 mt-5">
              Seleccione la vista
            </h2>
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
          </div>

          <section>
            {busquedaRealizada ? (
              <>
                {selectedView === "MAP" && (
                  <Geo
                    data={dataValues}
                    generateColorByValue={generateColorByValue}
                  />
                )}
                {selectedView === "GRAPH1" && dataGraph1?.length > 0 && (
                  <div className="flex flex-col ">
                    <HorizontalBar data={dataGraph1} />

                    {dataGraph1.length < dataIndicator.length &&
                    (selectedCountries.length === 0 ||
                      selectedCountries?.length > LIMIT_COUNTRIES_GRAPH) ? (
                      <button
                        className="text-center"
                        onClick={() => {
                          setSeeMore(true);
                        }}
                      >
                        Mostrar más paises
                      </button>
                    ) : (
                      ""
                    )}
                  </div>
                )}
                {selectedView === "BAR_CHART_RACE" &&
                  dataBarChartRace?.length > 0 && (
                    <div className="h-full w-full flex flex-col text-center justify-start items-center">
                      <BarChartRace data={dataBarChartRace} offset={offset} />
                      {dataBarChartRace[0]?.values.length >
                      LIMIT_COUNTRIES_RACE ? (
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
                    </div>
                  )}
              </>
            ) : (
              <div className="mt-10">
                <h2 className="text-xl text-center font-semibold mb-4">
                  Seleccione los filtros correspondientes para realizar la
                  búsqueda
                </h2>

                <div className="grid grid-rows-[1fr_1fr_1fr] items-center justify-center">
                  <article className="flex gap-2 justify-start items-center">
                    <input
                      type="checkbox"
                      disabled
                      checked={filtrosSelected.INDICADOR}
                    />
                    <label htmlFor="">Indicador seleccionado</label>
                  </article>
                  <article className="flex gap-2 justify-start items-start">
                    <input
                      type="checkbox"
                      disabled
                      checked={filtrosSelected.PAISES}
                    />
                    <label htmlFor="">Países seleccionados</label>
                  </article>

                  <article className="flex gap-2 justify-start items-start">
                    <input
                      type="checkbox"
                      disabled
                      checked={filtrosSelected.TIEMPO}
                    />
                    <label htmlFor="">Intervalo de tiempo seleccionado</label>
                  </article>
                </div>

                <div className="text-center mt-5">
                  <button
                    onClick={() => {
                      if (!filtrosSelected.INDICADOR) {
                        errNotif("Seleccione el indicador a mostrar");
                        return;
                      }
                      if (!filtrosSelected.PAISES) {
                        errNotif("Seleccione los países a mostrar");
                        return;
                      }
                      if (!filtrosSelected.TIEMPO) {
                        errNotif("Seleccione el intervalo de tiempo");
                        return;
                      }

                      setBusquedaRealizada(true);
                    }}
                    className={
                      "px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    }
                  >
                    Aplicar búsqueda
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

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
          disabled={
            !(
              dataValues?.length > 0 &&
              currentYearTo !== currentYearFrom &&
              selectedView !== "BAR_CHART_RACE"
            )
          }
        />
      )}

      <ModalCountriesSelect
        show={showModalCountries}
        setShow={setShowModalCountries}
        setSelectedCountries={setSelectedCountries}
        countries={countries}
        regions={regions}
      />

      {/* <ModalBusqueda
        show={showModalBusqueda}
        setShow={setShowModalBusqueda}
        filtrosSelected={filtrosSelected}
        setBusquedaRealizada={setBusquedaRealizada}
      /> */}
    </div>
  );
};

export default Home;
