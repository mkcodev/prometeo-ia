# Flujo de trabajo

Una unidad de trabajo = un issue = una rama = una PR. Una PR por sesión de trabajo.

1. **Issue.** Cada porción del plan, bug o corrección de contenido tiene su issue (plantillas en `.github/ISSUE_TEMPLATE`), asignado al milestone de su bloque.
2. **Rama.** Desde `main`, con el número del issue: `feat/12-mapa-habilidades`, `fix/23-racha-medianoche`, `content/31-tokens`.
3. **Commits pequeños** con [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/): `feat:`, `fix:`, `docs:`, `content:`, `test:`, `ci:`, `chore:`, `refactor:`. El mensaje explica el porqué.
4. **PR** hacia `main` con la plantilla; el título sigue Conventional Commits (será el commit final) y el cuerpo lleva `Closes #N`.
5. **CI** (`.github/workflows/ci.yml`): typecheck de la app y de los snippets, lint, validación del esquema de contenido, comprobación de enlaces, tests y build. La PR no se fusiona en rojo.
6. **Fusión** con "Squash and merge": `main` conserva un commit por PR. La rama se borra al fusionar.
7. **Estado.** Dentro de la misma PR se actualiza la tabla de estado de `docs/PLAN.md` y, si se ha decidido algo, `docs/DECISIONES.md`.

`main` está protegida: no admite push directo, solo PR con el CI en verde.

## Sesiones

Al empezar una sesión se leen `docs/PLAN.md` y `docs/DECISIONES.md`. Al terminar se actualiza el estado. Así cualquier sesión arranca con el contexto completo sin depender de la anterior.

## Contenido: de borrador a revisado

Un concepto nace con `estado: borrador`. Pasa a `revisado` solo cuando:

1. Un verificador independiente, sin contexto previo, ha contrastado cada afirmación con las fuentes citadas y no queda ninguna discrepancia abierta. El resumen de esa verificación va en la PR.
2. El autor del proyecto lo ha leído y lo aprueba.

## Deploy

Vercel: cada PR genera un deploy de preview y cada fusión a `main` despliega a producción. El sitio es estático; no hay backend.
