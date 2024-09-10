export interface CoordenadasType {
  lat: number;
  lng: number;
}

export const getDistanciaCoords = ({ coords1, coords2 }: { coords1: CoordenadasType; coords2: CoordenadasType }) => {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = deg2rad(coords2.lat - coords1.lat);
  const dLon = deg2rad(coords2.lng - coords1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coords1.lat)) * Math.cos(deg2rad(coords2.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distancia en kilómetros
  return distance;
};

function deg2rad(deg: any) {
  return deg * (Math.PI / 180);
}
