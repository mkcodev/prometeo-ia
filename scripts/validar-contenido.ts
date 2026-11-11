import { cargarContenido, ErrorDeContenido } from "./contenido/cargar.ts";

try {
  const { bloques } = cargarContenido();
  console.log(`Contenido válido: ${bloques.length} bloques.`);
} catch (error) {
  if (error instanceof ErrorDeContenido) {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
}
