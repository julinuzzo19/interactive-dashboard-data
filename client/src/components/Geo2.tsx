// import React, { memo, useCallback } from "react";
// import { ComposableMap, Geographies, Geography } from "react-simple-maps";

// // Memoizamos Geography para evitar re-renders innecesarios
// export const MemoizedGeography =
//   (({ geo, colorCountry, onMouseEnter, onMouseLeave }: any) => (
//     <Geography
//       key={geo.id}
//       geography={geo}
//       fill={colorCountry}
//       style={{
//         default: { outline: "none" },
//         pressed: { fill: "#E42", outline: "none" },
//       }}
//       onMouseEnter={onMouseEnter}
//       onMouseLeave={onMouseLeave}
//     />
//   )

// // Memoizamos la lógica de Geographies
// export const MemoizedGeographies = ({
//   geographies,
//   dataIndicator,
//   // generateColorByValue,
//   setTooltipContent,
//   colorData,
// }: any) => {
//   const handleMouseEnter = useCallback(
//     (geo) => {
//       setTooltipContent(geo);
//     },
//     [setTooltipContent]
//   );

//   const handleMouseLeave = useCallback(() => {
//     setTooltipContent({});
//   }, [setTooltipContent]);

//   return geographies.map((geo) => {
//     const valueCountry = dataIndicator.find(
//       (item) => item.countryiso3code === geo.id
//     );

//     // const colorCountry = generateColorByValue(valueCountry?.value) || "grey";

//     geo.value = valueCountry?.value || 0;

//     // console.log({ colorCountry });
//     return (
//       <MemoizedGeography
//         key={geo.id}
//         geo={geo}
//         colorCountry={colorData?.(geo.value).hex()}
//         onMouseEnter={() => handleMouseEnter(geo)}
//         onMouseLeave={handleMouseLeave}
//       />
//     );
//   });
// };
