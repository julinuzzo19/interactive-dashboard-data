export interface GeoCountry {
  type: string;
  id: string;
  properties: Properties;
  date?: string;
}
export interface GeoCountryColor extends GeoCountry {
  value: number;
  tecnicaUtilizada?: string;
}

export interface Properties {
  name: string;
  continent:
    | "Europa"
    | "América del Norte"
    | "América Central"
    | "América del Sur"
    | "Asia"
    | "Oceanía"
    | "Europa/Asia";
}
