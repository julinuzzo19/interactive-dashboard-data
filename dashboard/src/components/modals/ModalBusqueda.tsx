import { Dispatch, SetStateAction } from "react";
import Modal from "./ModalContainer";
import { cn } from "@/utils/mergeStyles";

const ModalBusqueda = ({
  show,
  setShow,
  setBusquedaRealizada,
  filtrosSelected,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  setBusquedaRealizada: Dispatch<SetStateAction<boolean>>;
  filtrosSelected: { PAISES: boolean; INDICADOR: boolean; TIEMPO: boolean };
}) => {
  return (
    <Modal isOpen={show} onClose={() => setShow(false)}>
      <div>
        <h2 className="text-xl text-center font-semibold mb-4">
          Seleccione los filtros correspondientes para realizar la búsqueda
        </h2>

        <div className="flex flex-col gap-2 py-4 min-w-max px-4 justify-center border-gray-600">
          <article className="flex gap-2 justify-center items-center">
            <input
              type="checkbox"
              disabled
              checked={filtrosSelected.INDICADOR}
              name="indicadorCheck"
            />
            <label htmlFor="indicadorCheck">Indicador seleccionado</label>
          </article>
          <article className="flex gap-2 justify-center items-center">
            <input
              type="checkbox"
              disabled
              checked={filtrosSelected.PAISES}
              name="countriesCheck"
            />
            <label htmlFor="countriesCheck">Países seleccionados</label>
          </article>

          <article className="flex gap-2 justify-center items-center">
            <input
              type="checkbox"
              disabled
              checked={filtrosSelected.TIEMPO}
              name="tiempoCheck"
            />
            <label htmlFor="tiempoCheck">
              Intervalo de tiempo seleccionado
            </label>
          </article>
        </div>

        <div className="text-end">
          <button
            onClick={() => {
              setBusquedaRealizada(true);
              setShow(false);
            }}
            className={cn(
              "px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            )}
          >
            Aplicar búsqueda
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalBusqueda;
