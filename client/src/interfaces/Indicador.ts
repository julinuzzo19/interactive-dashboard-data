export type Item = { id: string; value: string };

export interface Indicador {
  id: string;
  name: string;
  description: string;
  source: Item;
  sourceNote: string;
  sourceOrganization: Item;
  unit: string;
  topics: Item[];
}

export interface IndicatorValue {
  country: { id: string; value: string };
  countryiso3code: string;
  date: string;
  value: any;
  unit: string;
  obs_status: string;
  decimal: number;
}
