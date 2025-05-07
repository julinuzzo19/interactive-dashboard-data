import { Bounce, toast } from "react-toastify";

export const sucNotif = (mensaje: string, duration = 3000) =>
  toast.success(mensaje, {
    autoClose: duration,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    transition: Bounce,
  });

export const errNotif = (mensaje, duration = 5000) => {
  toast.error(mensaje, {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    transition: Bounce,
  });
};
