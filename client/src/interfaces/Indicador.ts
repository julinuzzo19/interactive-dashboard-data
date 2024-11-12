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
