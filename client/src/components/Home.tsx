import { useEffect } from "react";
import useFetch from "../hooks/useFetch";
import Select from "react-select";
// import Map from "react-map-gl/maplibre";
// import maplibregl from "maplibre-gl";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const Home = () => {
  const { indicadores } = useFetch();

  useEffect(() => {
    console.log({ indicadores });
  }, [indicadores]);

  return (
    <div className="flex flex-col justify-center items-center mt-10 w-full">
      <h2>Indicadores</h2>

      <div className="w-full flex flex-col justify-center items-center mt-10">
        <Select
          className="w-8/12"
          options={indicadores.map((indicador) => ({
            value: indicador.id,
            label: indicador.name,
          }))}
          maxMenuHeight={200}
          placeholder="Selecciona un indicador"
        />
      </div>

      <div className="w-8/12">
        <ComposableMap>
          <Geographies geography="../../public/features.json">
            {({ geographies }) => {
              console.log({ geographies });
              return geographies.map((geo) => {
                console.log({ geo });
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="grey"
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#F53", outline: "none" },
                      pressed: { fill: "#E42", outline: "none" },
                    }}
                  />
                );
              });
            }}
          </Geographies>
        </ComposableMap>
      </div>
    </div>
  );
};

export default Home;
