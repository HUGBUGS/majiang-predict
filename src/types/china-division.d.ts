declare module 'china-division/dist/provinces.json' {
  const provinces: Array<{
    code: string;
    name: string;
  }>;
  export default provinces;
}

declare module 'china-division/dist/cities.json' {
  const cities: Array<{
    code: string;
    name: string;
    provinceCode: string;
  }>;
  export default cities;
}

declare module 'china-division/dist/areas.json' {
  const areas: Array<{
    code: string;
    name: string;
    cityCode: string;
  }>;
  export default areas;
} 