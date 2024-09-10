export const addDays = (fecha: string, dias: number) => {
  const newDate = new Date(fecha);

  const result = new Date(newDate.setDate(newDate.getDate() + dias));

  return result;
};
