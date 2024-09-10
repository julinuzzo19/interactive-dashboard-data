export const removeTildesString = (string: string) => {
  try {
    if (!string) {
      return string;
    }
    return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  } catch (error) {
    console.log({ errremoveTildesString: error });
    return string;
  }
};

export const compareStringsSinTildesNiCaseSensitive = (
  stringA: string,
  stringB: string
) => {
  try {
    return (
      removeTildesString(stringA?.toLowerCase()?.trim()) ===
      removeTildesString(stringB?.toLowerCase()?.trim())
    );
  } catch (error) {
    // console.log({ errcompareStringsSinTildesNiCaseSensitive: error });
    return false;
  }
};
