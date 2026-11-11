export const REPO_URL = "https://github.com/mkcodev/prometeo-ia";
export const PLAN_URL = `${REPO_URL}/blob/main/docs/PLAN.md`;

/**
 * Secciones que aún no existen y el issue de GitHub en el que se construyen.
 * Cada entrada desaparece de aquí cuando su entrega se fusiona.
 */
export const SECCIONES_PENDIENTES = {
  hoy: 3,
  repaso: 4,
  plan: 4,
  apuntes: 5,
  ajustes: 5,
  proyectos: 12,
  diagnostico: 12,
  retos: 12,
  glosario: 12,
} as const;

export type SeccionPendiente = keyof typeof SECCIONES_PENDIENTES;

export function urlIssue(numero: number): string {
  return `${REPO_URL}/issues/${numero}`;
}
