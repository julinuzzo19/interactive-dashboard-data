export function getKeyFromValueObject(obj: { [key in any]: any }, valorBuscado: any) {
  for (let clave in obj) {
    if (obj[clave].toUpperCase() === valorBuscado.toUpperCase()) {
      return clave;
    }
  }
  return null; // Devuelve null si no se encuentra la clave
}
