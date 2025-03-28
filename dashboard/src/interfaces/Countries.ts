export interface IRegion {
  id: string;
  code: string;
  iso2code: string;
  name: string;
}

export interface ICountry {
  id: string;
  iso2Code: string;
  name: string;
  region: Region;
  adminregion: Adminregion;
  incomeLevel: IncomeLevel;
  lendingType: LendingType;
  capitalCity: string;
  longitude: string;
  latitude: string;
}

export interface Region {
  id: string;
  iso2code: string;
  value: string; //name
}

export interface Adminregion {
  id: string;
  iso2code: string;
  value: string;
}

export interface IncomeLevel {
  id: string;
  iso2code: string;
  value: string;
}

export interface LendingType {
  id: string;
  iso2code: string;
  value: string;
}
