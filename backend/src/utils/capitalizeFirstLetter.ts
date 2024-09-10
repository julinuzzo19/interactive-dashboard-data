export function capitalizeFirstLetter(text: string) {
  if (!text) {
    return;
  }
  if (text === "NIT" || text === "CI") {
    return text;
  }

  const words = text.split(" ");
  const capitalizedWords = words.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  return capitalizedWords.join(" ");
}
