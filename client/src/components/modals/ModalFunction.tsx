import { Dispatch, SetStateAction } from "react";
import Modal from "../Modal";
import {
  DEFAULT_VALUE_FUNCTION,
  FUNCTIONS_LIST,
  FunctionType,
  FunctionValue,
} from "@/hooks/useFunctions";
import { cn } from "@/lib/utils";

const ModalFunction = ({
  show,
  setShow,
  setFunctionSelected,
  functionSelected,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  setFunctionSelected: Dispatch<SetStateAction<FunctionValue>>;
  functionSelected: FunctionValue;
}) => {
  return (
    <Modal isOpen={show} onClose={() => setShow(false)}>
      <div>
        <h2 className="text-xl text-center font-semibold mb-4">
          Debe elegir una función a utilizar en el indicador debido al tener
          valores de diferentes años del país
        </h2>

        <div className="flex gap-2 py-4 min-w-max px-4 justify-center border-gray-600">
          {FUNCTIONS_LIST.map((func) => (
            <button
              value={func.value}
              key={func.value}
              onClick={(e) => {
                // @ts-ignore
                const value = e.target.value as FunctionType;

                console.log({ value });
                if (func.value !== functionSelected.value) {
                  setFunctionSelected(
                    FUNCTIONS_LIST.find(
                      (item) => value === item.value
                    ) as FunctionValue
                  );
                } else {
                  setFunctionSelected(DEFAULT_VALUE_FUNCTION);
                }
              }}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                functionSelected.value === func.value && "bg-blue-400"
              )}
            >
              {func.label}
            </button>
          ))}
        </div>

        {functionSelected && (
          <div>
            <p className="text-xl font-bold mb-3">{functionSelected.label}</p>
            {functionSelected.value === "AVERAGE" && (
              <div className="font-serif">
                <p className="font-bold">Descripción:</p>
                <p className="indent-4 mb-2">
                  Calcula el promedio de los valores del indicador durante el
                  rango de años.
                </p>
                <p className="font-bold">Sentido de uso:</p>
                <p className="indent-4 mb-2">
                  Representa una medida central que suaviza fluctuaciones y
                  muestra un comportamiento general.
                </p>
                <p className="font-bold">Fórmula:</p>
                <p className="indent-4 mb-2">
                  Promedio: total / cantidad de valores
                </p>
              </div>
            )}
            {functionSelected.value === "MAX" && (
              <div className="font-serif">
                <p className="font-bold">Descripción:</p>
                <p className="indent-4 mb-2">
                  Encuentra el valor más alto registrado dentro del rango de
                  años.
                </p>
                <p className="font-bold">Sentido de uso:</p>
                <p className="indent-4 mb-2">
                  Resalta el punto de mayor desempeño o el pico del indicador.
                </p>
                <p className="font-bold">Fórmula:</p>
                <p className="indent-4 mb-2">
                  Máximo: Compara todos los valores y selecciona el más alto.
                </p>
              </div>
            )}
            {functionSelected.value === "MIN" && (
              <div className="font-serif">
                <p className="font-bold">Descripción:</p>
                <p className="indent-4 mb-2">
                  Encuentra el valor más bajo registrado dentro del rango de
                  años.
                </p>
                <p className="font-bold">Sentido de uso:</p>
                <p className="indent-4 mb-2">
                  Identifica el peor desempeño o el mínimo histórico del
                  indicador.
                </p>
                <p className="font-bold">Fórmula:</p>
                <p className="indent-4 mb-2">
                  Mínimo: Compara todos los valores y selecciona el más bajo.
                </p>
              </div>
            )}
            {functionSelected.value === "TASA_CAMBIO" && (
              <div className="font-serif">
                <p className="font-bold">Descripción:</p>
                <p className="indent-4 mb-2">
                  Calcula el porcentaje de cambio entre el valor inicial y el
                  final.
                </p>
                <p className="font-bold">Sentido de uso:</p>
                <p className="indent-4 mb-2">
                  Muestra cómo evolucionó el indicador a lo largo del tiempo.
                </p>
                <p className="font-bold">Fórmula:</p>
                <p className="indent-4 mb-2">
                  Tasa de cambio: (Valor final - Valor inicial) / Valor inicial
                  x 100
                </p>
              </div>
            )}
          </div>
        )}

        <div className="text-end">
          <button
            onClick={() => setShow(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalFunction;
