# Decisiones

Registro de decisiones del proyecto con su motivo y la alternativa descartada. Se añade una entrada cada vez que se decide algo que afecta a más de una PR. Las entradas no se reescriben: si una decisión cambia, se añade otra que la sustituye y se enlaza.

Quién decide: **autor** es el dueño del proyecto; **Claude** son decisiones tomadas durante la planificación y aprobadas por el autor con el plan.

## 2026-11-10 — planificación

### D-001 · Nombre e identidad: Prometeo (autor)
Repo y carpeta `prometeo-ia`. Tagline provisional: "El fuego de la IA, para quien construye". El mito se expresa en el color y las metáforas (acento ámbar sobre fondo oscuro, la racha es una llama, dominar un concepto enciende su nodo), nunca en imágenes mitológicas ni tipografía griega.
**Descartado:** Temperatura Cero, Token a Token, De Prompt a Producción.

### D-002 · SDK de los ejemplos de código (autor)
Bloques 1-2: pestañas Anthropic y OpenAI con SDK oficiales; Gemini solo en la tabla de equivalencias. Tool calling y streaming llevan además un ejemplo con `fetch` sin SDK. Bloques 3 en adelante: Vercel AI SDK con tabla de equivalencias. La pestaña elegida se recuerda en toda la app.
**Motivo:** en los fundamentos hay que ver el formato real de los mensajes; después pesa más la portabilidad. Una tercera pestaña triplicaría la verificación.
**Descartado:** solo SDK oficiales en todos los bloques; solo Vercel AI SDK.

### D-003 · Ningún snippet vive solo como texto (autor)
Cada ejemplo es un archivo real en el workspace `snippets/`, con typecheck en CI. Las versiones de los SDK se fijan en un único `package.json`. Cada ejemplo se verifica contra la documentación actual antes de darlo por bueno.
**Motivo:** el código de un curso que no compila destruye la confianza, y este campo cambia cada pocos meses.

### D-004 · Embeddings: precalculados más modelo local opcional (autor)
Mismo modelo para ambos (`Xenova/multilingual-e5-small`, cuantizado a 8 bits, 118 MB). Proyección con PCA y componentes guardados en el JSON para proyectar frases nuevas de forma determinista. Dataset bilingüe con trampas a propósito. Vecinos con similitud coseno real y nota de que el 2D pierde información. El modelo corre en un Web Worker, avisa del tamaño antes de descargar y no se ofrece si el navegador indica ahorro de datos.
**Descartado:** solo precalculado (sin texto libre); modelo siempre cargado (penaliza móvil); t-SNE o UMAP (no proyectan puntos nuevos de forma determinista sin reentrenar).

### D-005 · Repo público desde el primer commit (autor)
CI desde la primera PR, `main` protegida, Conventional Commits, plantillas de issue y PR, un milestone por bloque. Aviso de "en construcción" en el README y en la app. Sin capturas ni demo en el README hasta aprobar el bloque 1.
**Descartado:** privado hasta revisar el bloque 1; solo local.

### D-006 · React Router 8 en modo framework con `ssr: false` y `prerender` (Claude)
Única desviación del stack pedido; sigue siendo Vite + React + TypeScript y 100 % estático.
**Motivo:** una guía pública tiene que poder encontrarse en buscadores y tener vista previa al compartir un enlace; una SPA pura entrega HTML vacío.
**Coste:** disciplina de hidratación; el estado del usuario se lee tras montar.
**Salida:** si en la porción 1.1 la hidratación da problemas que no se resuelven en esa PR, se para y se consulta. Alternativa preparada: modo SPA (`ssr: false` sin `prerender`), con el prerender reintentado después en una PR aislada.

### D-007 · Evals sube al bloque 3, antes de RAG y agentes (Claude)
**Motivo:** sin evals no se puede saber si un cambio en un RAG o en un agente mejora algo; así los proyectos de los bloques 4 a 7 ya incluyen evaluación.
**Reversible:** el orden es un dato del bloque, no código.

### D-008 · Estado del usuario en localStorage (Claude)
Una clave por apunte y un slice por dominio, todo validado al leer, con versión y migraciones, detrás de una interfaz `StorageAdapter`.
**Motivo:** los apuntes de unos 110 conceptos caben de sobra y la API síncrona simplifica la hidratación y la exportación.
**Descartado por ahora:** IndexedDB; el adaptador permite cambiar sin tocar las vistas.

### D-009 · Contenido en MDX, un archivo por concepto, con frontmatter validado (Claude)
Las partes estructuradas (definición, errores típicos, preguntas, fuentes, tarjetas, prerrequisitos) van en el frontmatter con esquema Zod; el cuerpo es solo la explicación. La plantilla de página impone la anatomía fija.
**Motivo:** un contribuyente no necesita saber React y no puede saltarse una sección: el esquema falla en CI.

### D-010 · Grafo de habilidades propio en SVG (Claude)
Posiciones calculadas en el build con un layout por capas determinista.
**Motivo:** control del lenguaje visual, bundle pequeño y semántica accesible.
**Descartado:** una librería de grafos genérica.

### D-011 · Datos reales en las visualizaciones siempre que se pueda (Claude)
Tokenizador real (`gpt-tokenizer`, solo `o200k_base`, carga diferida), distribuciones de muestreo con logits precalculados de un modelo abierto, embeddings reales. Lo que sea simulación se etiqueta como tal en la propia visualización: determinismo, alucinaciones y las tasas de fallo de salidas estructuradas son ilustrativas.

### D-012 · Sin peticiones a terceros (Claude)
Fuentes tipográficas autoalojadas, sin analítica. La única excepción es la descarga opcional del modelo de embeddings desde Hugging Face, que se avisa antes de hacerla.

### D-013 · Fase 1 con dos paradas intermedias (autor)
Tras el esqueleto y la primera pantalla se termina un único concepto de principio a fin ("Tokens") y se para para validar la plantilla. Solo después se construye el resto. Las funciones de estudio se reparten en tres PR.
**Motivo:** validar el patrón con un caso antes de replicarlo doce veces.

### D-014 · Test de nivel parcial hasta que existan los bloques (autor)
En la fase 1 solo tiene preguntas del bloque 1. Cada bloque aporta las suyas al escribirse. La app dice que el diagnóstico es parcial y qué bloques cubre, calculado desde el contenido.
**Motivo:** no escribir preguntas de bloques cuyo contenido aún no está verificado.

### D-015 · "Revisado" exige verificación independiente y lectura del autor (autor)
Antes de proponer un concepto como revisado, un subagente sin contexto previo contrasta cada afirmación con las fuentes citadas y devuelve las discrepancias. `revisado` significa que pasó esa verificación y que el autor lo ha leído; hasta entonces es `borrador`. Solo el autor cambia el estado.

### D-016 · Una PR por sesión, con `docs/PLAN.md` y `docs/DECISIONES.md` como memoria (autor)
Al empezar cada sesión se leen ambos archivos; al terminar se actualiza el estado dentro de la misma PR.

## Pendiente de decidir

- Presupuesto de peso para el tokenizador, una vez medido el bundle real de `gpt-tokenizer` con una sola codificación.
- Qué API de generación de OpenAI se usa en los ejemplos, tras revisar su documentación actual.
- Cómo se sirve el fallback de rutas en GitHub Pages con React Router 8 (no está documentado; hay que probarlo).
