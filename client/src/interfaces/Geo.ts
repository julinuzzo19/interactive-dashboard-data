export interface GeoCountry {
  type: string;
  id: string;
  properties: Properties;
  date?: string;
}
export interface GeoCountryColor extends GeoCountry {
  value: number;
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
