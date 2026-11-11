import { z } from "zod";

const identificador = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "usa minúsculas, números y guiones");

const nota = z.number().int().min(1).max(10);

export const esquemaBloque = z.strictObject({
  id: identificador,
  orden: z.number().int().min(1),
  titulo: z.string().min(3),
  /** Nombre corto para el mapa de habilidades. */
  tituloCorto: z.string().min(2).max(18),
  resumen: z.string().min(20).max(220),
  /** Bloques que conviene dominar antes. El bloqueo es blando. */
  requiere: z.array(identificador).default([]),
  puntuacion: z.strictObject({
    prioridad: nota,
    /** `null` cuando no aplica (el bloque de carrera no es una habilidad técnica). */
    demanda: nota.nullable(),
    dificultad: nota,
    retornoEmpleo: nota,
  }),
  horas: z.strictObject({
    conceptos: z.number().int().positive(),
    proyecto: z.number().int().positive(),
  }),
  opcional: z.boolean().default(false),
  /** Se estudia a la vez que el resto, no después. */
  enParalelo: z.boolean().default(false),
});

export type Bloque = z.infer<typeof esquemaBloque>;

export type EstadoRevision = "pendiente" | "borrador" | "revisado";
