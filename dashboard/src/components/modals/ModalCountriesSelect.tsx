import { Dispatch, SetStateAction, useState } from "react";
import Modal from "../Modal";
import { ICountry, IRegion } from "@/interfaces/Countries";

const ModalCountriesSelect = ({
  show,
  setShow,
  setSelectedCountries,
  regions,
  countries,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  setSelectedCountries: Dispatch<SetStateAction<string[]>>;
  regions: IRegion[];
  countries: ICountry[];
}) => {
  const [currentCountries, setCurrentCountries] = useState<string[]>([]);

  // useEffect(() => {
  //   console.log({ regions, countries });
  // }, [regions, countries]);

  // useEffect(() => {
  //   console.log({ currentCountries });
  // }, [currentCountries]);

  const handleConfirmCountries = () => {
    setSelectedCountries(currentCountries);
    setShow(false);
  };

  return (
    <Modal isOpen={show} onClose={() => setShow(false)}>
      <div className="overflow-y-auto" style={{ maxHeight: "90vh" }}>
        <h2 className="text-xl text-center font-semibold mb-4">
          Seleccionar países
        </h2>

        <div className="grid grid-cols-4 gap-2 h-4/5 ">
          {regions
            .filter((item) => item?.name)
            .map((region) => {
              const countriesRegion = countries.filter(
                (country) =>
                  country.region.iso2code === region.iso2code && country?.name
              );

              if (countriesRegion.length === 0 || !region?.name) {
                return null;
              }

              return (
                <div key={region.id} className="border rounded-lg">
                  <h3
                    className="text-lg font-semibold cursor-pointer"
                    onClick={() => {
                      const newCountries: string[] = [];

                      countriesRegion.forEach((country) => {
                        if (!currentCountries.includes(country.id)) {
                          newCountries.push(country.id);
                        }
                      });

                      setCurrentCountries((prevState) => [
                        ...prevState,
                        ...newCountries,
                      ]);
                    }}
                  >
                    {region.name}
                  </h3>

                  <ul className="overflow-y-auto h-80">
                    {countriesRegion.map((country) => {
                      return (
                        <li
                          key={country.id}
                          className="flex items-center gap-1"
                        >
                          <input
                            type="checkbox"
                            name={country.id}
                            value={country.id}
                            checked={currentCountries.includes(country.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCurrentCountries([
                                  ...currentCountries,
                                  country.id,
                                ]);
                              } else {
                                setCurrentCountries(
                                  currentCountries.filter(
                                    (item) => item !== country.id
                                  )
                                );
                              }
                            }}
                          />
                          <label
                            className="text-sm text-gray-500 items-center"
                            htmlFor={country.id}
                          >
                            {country.name}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
        </div>
      </div>
      <div className="flex justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCurrentCountries([]);
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Desseleccionar todos
          </button>
          <button
            onClick={() => {
              setCurrentCountries(countries.map((country) => country.id));
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Seleccionar todos
          </button>
        </div>
        <button
          onClick={handleConfirmCountries}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          Confirmar
        </button>
      </div>
    </Modal>
  );
};

export default ModalCountriesSelect;
