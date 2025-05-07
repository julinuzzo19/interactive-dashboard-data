import { TecnicaPredictiva } from "@/interfaces/predictions";

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
  tecnicaUtilizada?: TecnicaPredictiva;
}

export interface IndicatorMetadata {
  id: string;
  name: string;
  unit: string;
  source: { id: string; value: string };
  sourceNote: string;
  sourceOrganization: string;
  topics: { id: string; value: string }[];
}
