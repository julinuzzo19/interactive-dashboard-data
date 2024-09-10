export const formatPrecio = (valor: any) => {
  try {
    let valorFormat = new Intl.NumberFormat("es-BO").format(valor);

    if (valorFormat.split(",")[1]) {
      if (valorFormat.split(",")[1].length == 1) {
        valorFormat += 0;
      } else if (valorFormat.split(",")[1].length > 2) {
        const decimals = valorFormat.split(",")[1];
        valorFormat = valorFormat.split(",")[0];
        valorFormat += `,${decimals.slice(0, 2)}`;
      }
    }

    if (!isNaN(parseFloat(valorFormat))) {
      return valorFormat;
    }
  } catch (error) {
    console.log({ errorFormatPrecio: error });
    return valor;
  }
};
