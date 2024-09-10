export const gmsToDecimal = (gms: string) => {
  // Separar la cadena de coordenadas en latitud y longitud
  const parts = gms.split(" ");
  const latPart = parts[0];
  const lonPart = parts[1];

  // Función para convertir una sola coordenada GMS a decimal
  function convertToDecimal(coordinate: any) {
    const degrees = parseFloat(coordinate.split("°")[0]);
    const minutes = parseFloat(coordinate.split("°")[1].split("'")[0]);
    const seconds = parseFloat(coordinate.split("'")[1].split('"')[0]);
    const direction = coordinate.slice(-1);

    let decimal = degrees + minutes / 60 + seconds / 3600;
    if (direction === "S" || direction === "W") {
      decimal = decimal * -1;
    }
    return decimal;
  }

  const latDecimal = convertToDecimal(latPart);
  const lonDecimal = convertToDecimal(lonPart);

  return {
    lat: latDecimal,
    lng: lonDecimal,
  };
};
