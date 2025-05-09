import { Dispatch, SetStateAction } from "react";
import Modal from "./ModalContainer";
import { IndicatorMetadata } from "@/interfaces/Indicador";

const ModalMetadata = ({
  show,
  setShow,
  metadata,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  metadata: Partial<IndicatorMetadata>;
}) => {
  return (
    <Modal isOpen={show} onClose={() => setShow(false)}>
      <div>
        <h2 className="text-xl text-center font-bold mb-2 p-0">
          Metadata del indicador
        </h2>

        <div className="flex flex-col gap-3 mb-5">
          <span>
            <b>Id del indicador:</b> {metadata.id}
          </span>
          <span>
            <b>Nombre del indicador:</b> {metadata.name}
          </span>
          <span>
            <b>Definición del indicador:</b> {metadata.sourceNote}
          </span>
          <span>
            <b>Nota del indicador:</b> {metadata.sourceOrganization}
          </span>
          <span>
            <b>Fuente:</b> {metadata.source?.value}
          </span>
          <span>
            <b>Tópicos:</b>{" "}
            {metadata.topics?.map((topic) => topic.value).join(" - ")}
          </span>
        </div>

        <div className="text-end ">
        <button
          onClick={() => setShow(false)}
          className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 mr-auto"
        >
          Cerrar
        </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalMetadata;
