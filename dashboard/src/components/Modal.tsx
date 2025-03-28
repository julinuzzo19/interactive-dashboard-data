const Modal = ({ isOpen, onClose, children, width = "60vw" }) => {
  if (!isOpen) return null;

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose(); // Cerrar el modal si se hace clic fuera de él
    }
  };

  return (
    <div
      className="w-full fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackgroundClick}
    >
      <div
        style={{ width }}
        className={`bg-white rounded-lg shadow-lg p-6 relative`}
      >
        {/* Botón de cierre */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        >
          ✕
        </button>
        {/* Contenido del modal */}
        {children}
      </div>
    </div>
  );
};

export default Modal;
