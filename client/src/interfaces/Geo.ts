export interface GeoCountry {
  type: string;
  id: string;
  properties: Properties;
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
