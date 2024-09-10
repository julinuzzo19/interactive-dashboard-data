export function sumarDuraciones(duraciones: string[]) {
  let totalMinutos = 0;

  duraciones.forEach((duracion) => {
    let [numero, unidad]: any = duracion.split(" ");
    numero = parseFloat(numero); // Convertir a número decimal si es necesario

    if (unidad === "hs") {
      // Soportar "hr" y "hs"
      totalMinutos += numero * 60;
    } else if (unidad === "min") {
      totalMinutos += numero;
    }
  });

  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;

  return `${horas} hr ${minutos} min`;
}
