export const formatearDateToDDMMYY = (fecha?: Date | string) => {
  if (!fecha) {
    fecha = new Date(getCurrentFechaLocal());
  }

  if (typeof fecha === "string") {
    fecha = new Date(fecha);
  }

  let day = String(fecha.getUTCDate()).padStart(2, "0");
  let month = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  let year = (fecha.getUTCFullYear() + "").split("20")[1];

  return `${day}/${month}/${year}`;
};

export const formatToDateFromFechaISO = (fecha: string) => {
  if (fecha) {
    const dateParts: string[] = fecha.split("/");

    const dateObject = new Date(+dateParts[2], parseInt(dateParts[1]) - 1, +dateParts[0]);

    return dateObject;
  }
};

export const convertFechaToDate = (fecha: any): Date => {
  let fechaSplit: any = fecha.split("/");

  if (fechaSplit[2]?.length === 2) {
    fechaSplit[2] = "20" + fechaSplit[2];
  }

  const fechaDate = new Date(+fechaSplit[2], fechaSplit[1] - 1, +fechaSplit[0]);

  return fechaDate;
};

export const formatYYYYMMDD = (fecha: string): string => {
  return new Date(fecha).toISOString().split("T")[0];
};

export const getCurrentFechaLocal = (): string => {
  const fechaCurrentLocal = new Date().toLocaleDateString("es", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const [day, month, year] = fechaCurrentLocal.split("/");
  // console.log({ day, month, year });

  return `${year}-${month}-${day}`;
};
