// Función para generar un color HSL aleatorio pero agradable visualmente
export function generateRandomColor(): string {
  // Usamos HSL para mejor control sobre los colores
  const hue = Math.floor(Math.random() * 360); // Tono aleatorio (0-360)
  const saturation = Math.floor(Math.random() * 20) + 60; // Saturación entre 60-80%
  const lightness = Math.floor(Math.random() * 15) + 35; // Luminosidad entre 35-50%

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Función para asignar colores aleatorios a los tópicos
export function assignRandomColors<T extends { id: string; name: string }>(
  topics: T[]
): (T & { color: string })[] {
  return topics.map((topic) => ({
    ...topic,
    color: generateRandomColor(),
  }));
}
