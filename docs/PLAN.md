# Prometeo — plan de construcción

Plan aprobado el 2026-11-10. Se lee al empezar cada sesión, junto con [`DECISIONES.md`](DECISIONES.md), y su tabla de estado se actualiza al terminar.

## Estado

Última actualización: 2026-11-10.

| Porción | Issue | PR | Estado |
|---|---|---|---|
| 0. Repo y flujo | n/a | n/a | en curso |
| 1.1 Esqueleto, tokens de diseño, shell, primera pantalla y CI | | | pendiente |
| 1.2 Concepto "Tokens" de principio a fin | | | pendiente |
| 1.3a Estado, mapa, prerrequisitos y Hoy | | | pendiente |
| 1.3b Repaso SM-2, test de bloque, rachas, niveles y plan | | | pendiente |
| 1.3c Apuntes, paleta de comandos, exportar/importar y tarjeta | | | pendiente |
| 1.4 Kit de visualización y 11 visualizaciones (3-4 PR) | | | pendiente |
| 1.5 Contenido del bloque 1, test, Rayos X, test de nivel, retos | | | pendiente |
| 1.6 Calidad y open source | | | pendiente |

Paradas obligatorias: tras 1.1 (aprobar la primera pantalla), tras 1.2 (validar la plantilla de concepto) y tras 1.6 (revisar el bloque 1 completo).

## Contexto

Guía de referencia open source, en español, para que un desarrollador web pase de "uso ChatGPT" a AI Engineer que lleva productos con LLMs a producción. Tres cosas a la vez: mapa de habilidades con prerrequisitos, libro de texto interactivo (cada concepto se entiende manipulándolo) y cuaderno de estudio personal (progreso, rachas, apuntes, repaso espaciado). Dos públicos: el autor, que la usa a diario, y cualquier desarrollador hispanohablante que llegue desde GitHub o un buscador.

Proyecto nuevo, sin código previo. Carpeta `X:\projects\personal\prometeo-ia`, repo público `prometeo-ia`. Tagline provisional: "El fuego de la IA, para quien construye".

Tres frentes con el mismo peso: rigor del contenido, calidad de las visualizaciones y acabado de la interfaz. La primera fase es un corte vertical (app completa + bloque 1 al 100 %) y se para ahí para revisión.

## Decisiones ya cerradas (respuestas del usuario)

- **Nombre:** Prometeo. El mito se nota en el color y las metáforas (brasa, llama de racha, nodos que se encienden), nunca en imágenes mitológicas ni tipografía griega.
- **SDK de ejemplos:** bloques 1-2 con pestañas Anthropic y OpenAI (SDK oficiales); Gemini solo en la tabla de equivalencias. Tool calling y streaming llevan además ejemplo con `fetch` sin SDK. Bloques 3+ con Vercel AI SDK y tabla de equivalencias. Cada snippet es un archivo real con typecheck en CI; versiones de SDK fijadas en un único sitio; cada ejemplo verificado contra la documentación actual; la pestaña elegida se recuerda en toda la app.
- **Embeddings:** precalculados + modelo local opcional, ambos con el mismo modelo; PCA con componentes guardados; dataset bilingüe con trampas ("banco"); vecinos con coseno real y nota de pérdida del 2D; modelo en Web Worker, aviso de tamaño, no se ofrece con ahorro de datos.
- **Repo:** público desde el inicio, confirmación previa a crearlo, CI desde el primer PR, `main` protegida, commits convencionales, plantillas, un milestone por bloque, aviso "en construcción" en README y en la app, sin capturas ni demo hasta aprobar el bloque 1.

## Decisiones que tomo yo

1. **Una desviación del stack: React Router 8 en modo framework con `ssr: false` + `prerender`.** Sigue siendo Vite + React + TypeScript y 100 % estático, pero genera un HTML por concepto en el build. Razón de peso: una guía pública tiene que poder encontrarse en buscadores y tener vista previa al compartir un enlace; una SPA pura entrega HTML vacío. Coste: disciplina de hidratación (el estado del usuario se lee tras montar, vía `useSyncExternalStore` con snapshot de servidor neutro). Verificado en la documentación de React Router 8.5.1: se generan `[ruta].html` + `__spa-fallback.html`. Lo que la documentación no cubre es GitHub Pages; lo pruebo en la fase 1 (copia del fallback a `404.html` + `basename`). Vercel es el despliegue principal.
2. **Evals sube al puesto 3** (antes de RAG y agentes). Sin evals no se puede saber si un cambio en un RAG o un agente mejora algo; así los proyectos de los bloques 4-7 ya incluyen evaluación. El orden es un dato (`orden` en el bloque), reversible sin tocar código.
3. **Estado en localStorage, no IndexedDB.** Los apuntes de ~110 conceptos caben de sobra; la API síncrona simplifica hidratación y exportación. Una clave por apunte para escrituras pequeñas. Queda detrás de una interfaz `StorageAdapter` para cambiar a IndexedDB sin tocar las vistas.
4. **Contenido en MDX, un archivo por concepto**, con las partes estructuradas (definición, errores típicos, preguntas, fuentes, tarjetas, prerrequisitos) en el frontmatter validado con Zod y solo la explicación en el cuerpo. La plantilla de página impone la anatomía fija; un contribuyente no puede saltarse una sección porque el esquema falla en CI.
5. **Grafo propio en SVG**, sin librería de grafos: control total del lenguaje visual, bundle pequeño y semántica accesible (los nodos son enlaces de una lista). Las posiciones se calculan en el build con un layout por capas determinista; nadie coloca nodos a mano.
6. **Tokenizador real**, no simulado: `gpt-tokenizer` cargando solo `o200k_base`, con carga diferida. La visualización dice de qué tokenizador se trata y que cada proveedor trocea distinto.
7. **Distribuciones de muestreo reales**: logits precalculados offline con un modelo abierto para unos pocos prompts fijos; el deslizador de temperatura deforma datos reales, y el "generar 10 veces" usa un PRNG con semilla visible.
8. **Sin `html2canvas`** para la tarjeta de progreso: se dibuja en Canvas 2D.
9. **Fuentes autoalojadas** (Fontsource), coherente con "sin rastreo": ninguna petición a terceros salvo la descarga opcional del modelo de embeddings desde Hugging Face, que se avisa antes.

## Arquitectura

```
prometeo-ia/
├─ app/                       # React Router 8 (framework mode, ssr:false, prerender)
│  ├─ routes/                 # mapa, hoy, bloque, concepto, repaso, test, diagnostico,
│  │                          # proyectos, retos, apuntes, glosario, plan, progreso, ajustes, acerca
│  ├─ components/             # shell, primitivas de UI, plantilla de concepto
│  ├─ viz/                    # kit compartido + una carpeta por visualización (lazy)
│  ├─ study/                  # lógica pura: sm2, rachas, plan, niveles, dominio (con tests)
│  ├─ store/                  # slices de estado, StorageAdapter, migraciones, export/import
│  ├─ i18n/                   # es.json con claves tipadas; ningún texto en componentes
│  ├─ llm/                    # interfaz LlmRuntime + SimulatedRuntime (hueco para "tu API key")
│  └─ styles/tokens.css       # tokens de diseño (Tailwind v4 @theme)
├─ content/es/
│  ├─ bloques/01-fundamentos/{bloque.yaml, tokens.mdx, ...}   # un archivo por concepto
│  ├─ proyectos/*.mdx   retos/*.mdx   glosario.yaml   diagnostico.yaml
├─ data/
│  ├─ modelos.json            # nombres, precios, límites, fecha y URL de verificación
│  ├─ equivalencias.json      # cómo se llama cada concepto en cada proveedor
│  └─ embeddings/, muestreo/  # datos precalculados de las visualizaciones
├─ snippets/                  # workspace npm propio: package.json fija versiones de SDK
│  └─ 01-fundamentos/tool-calling/{anthropic.ts, openai.ts, fetch.ts}
├─ scripts/                   # validar-contenido, comprobar-enlaces, generar-embeddings, layout-grafo
├─ tests/                     # Vitest (unidad) + Playwright (humo, móvil, consola, axe)
├─ docs/{FLUJO.md, PLAN.md, DECISIONES.md}
├─ CONTRIBUTING.md  README.md  LICENSE (MIT)  LICENSE-CONTENT (CC BY 4.0)
└─ .github/{ISSUE_TEMPLATE, pull_request_template.md, workflows/ci.yml, workflows/enlaces.yml}
```

- **Rutas en español**, sin prefijo de idioma para `es`; la estructura admite `/en/...` más adelante. Carga diferida por ruta y por visualización; cada visualización reserva su altura para no provocar saltos de maquetación.
- **Snippets:** se importan como texto (`?raw`), se resaltan en el build con Shiki (sin resaltador en runtime) y se recortan con marcas `// #region`. `tsc --noEmit` sobre `snippets/` en CI.
- **Glosario:** plugin de remark que enlaza la primera aparición de cada término por sección a un popover.
- **Paleta de comandos:** índice generado en el build (conceptos, proyectos, glosario) más los apuntes del usuario en runtime, con MiniSearch.
- **Modo "tu propia API key":** solo queda la frontera `LlmRuntime`; no se construye.
- **Flujo y CI:** plantilla del repo Nextuss (`Nextuss/.github/`, `Nextuss/docs/FLUJO.md`) adaptada: commits convencionales en vez de prefijos `Fase N:`, y el CI añade typecheck de snippets, validación de contenido y enlaces. Los enlaces se comprueban en cada PR (los que cambian) y enteros en un cron semanal.

## Modelo de datos

**Contenido (validado con Zod en build y CI)**

```ts
Bloque   { id, orden, titulo, resumen, puntuacion: { prioridad, demanda, dificultad, retornoEmpleo },
           horas: { conceptos, proyecto }, opcional }   // estado del bloque: derivado de sus conceptos
Concepto { id, bloque, orden, titulo, enUnaFrase, prerrequisitos: id[], minutos, ultimaRevision: fecha,
           estado: 'borrador' | 'revisado',
           viz: idViz, snippets: { anthropic?, openai?, fetch?, aiSdk? },
           erroresTipicos: md[], compruebalo: Pregunta[2..3], tarjetas: Tarjeta[],
           fuentes: { titulo, url, idioma: 'ES' | 'EN', oficial: boolean }[] }   // cuerpo MDX = explicación
Pregunta { enunciado, opciones[], correcta, explicacion }
Proyecto { id, bloque, queEs, porQueImpresiona, demuestra: id[], prerrequisitos: id[],
           niveles: { basico, completo, espectacular } con criterios[] marcables,
           stack, horas, plantillaReadme, guionVideo60s }
Reto     { id, titulo, minutos: 30..60, conceptos: id[], enunciado, criterios[] }
Termino  { id, termino, alias[], definicion, concepto? }
Modelo   { id, proveedor, nombre, precioEntrada, precioSalida, precioCache?, contexto, verificadoEl, fuente }
```

"Qué desbloquea" no se escribe: se deriva invirtiendo `prerrequisitos`. Con un segundo idioma, los campos estructurales se leen del español y la traducción solo aporta texto; el validador lo comprueba.

**Estado del usuario** (`prometeo:v1:*`, cada slice validado al leer, con versión y migraciones)

```ts
progreso   { [conceptoId]: { estado: 'en-curso' | 'dominado' | 'convalidado', aciertos, fechas } }
bloques    { [bloqueId]: { testAprobado, nota, intentos, fecha } }
repaso     { [tarjetaId]: { facilidad, intervalo, repeticiones, vence, fallos } }   // SM-2
actividad  { [aaaa-mm-dd]: minutosOEventos }                                        // racha y mapa de calor
apunte:<conceptoId>  markdown                                                       // una clave por apunte
proyectos  { [id]: { nivel, criteriosMarcados[], repoUrl, demoUrl } }
plan       { horasSemana, inicio }
ajustes    { tema, pestañaSdk, movimiento, preciosEditados }
```

- Estados del nodo: bloqueado, disponible, en curso, dominado. El bloqueo es blando: aviso "necesitas X para seguir" con enlace y opción de continuar.
- **Convalidado** es un estado aparte para lo que marca el test de nivel: el nodo se enciende con otra marca y sus tarjetas entran antes en el repaso, para que nadie se salte lo que cree dominar.
- Bloque dominado = test de bloque aprobado (80 %). El proyecto es una insignia independiente.
- Exportar/importar: un JSON `{ app, version, exportadoEl, datos }`, validado al importar, con elección entre fusionar y reemplazar. Sincronización entre pestañas con el evento `storage`.

## Sistema de diseño

**Dirección visual.** Fuego en la noche: una interfaz fría y callada donde lo único caliente es lo que el usuario ha aprendido. El fondo es un pizarra azulado oscuro, no un negro teñido; sobre él, un solo acento ámbar que funciona como escala de temperatura y codifica el dominio: ceniza para lo bloqueado, contorno para lo disponible, rescoldo para lo que está en curso y brasa plena para lo dominado. El resplandor existe solo en nodos dominados, así que siempre significa algo. El mapa crece de abajo arriba, como sube el fuego: los fundamentos en la base y cada bloque dominado propaga la brasa por las aristas hacia los siguientes. La lectura larga va en una serif pensada para pantalla y la interfaz en una grotesca con eje de anchura que da carácter a los títulos sin segunda familia de exhibición. Todo lo demás es contenido: sin tarjetas idénticas en rejilla, sin etiquetas en mayúsculas espaciadas, sin degradados.

**Tokens**

| Token | Oscuro | Claro | Uso |
|---|---|---|---|
| `noche` / `papel` | `#14171C` | `#EEF0F2` | fondo |
| `hollin` / `niebla` | `#1D2128` | `#E2E5E9` | superficies |
| `ceniza` | `#8A8F98` | `#5B616B` | texto secundario, nodos bloqueados |
| `hueso` / `tinta` | `#E9E6DF` | `#171A1F` | texto |
| `brasa` | `#F2A03D` | `#A8550A` | acento único |
| `rescoldo` | `#7A4A16` | `#E9C9A0` | mismo tono, baja intensidad (en curso) |

Rojo de error y verde de acierto solo dentro de tests y diffs, nunca como decoración. Contraste AA comprobado con herramienta en la fase 1 (los pares de arriba son propuesta, no medición).

**Tipografía** (variables, autoalojadas; disponibilidad en Fontsource por confirmar al instalar)
- Literata: cuerpo de lectura, 18-19 px, interlineado 1.65, medida de 68 caracteres.
- Archivo: interfaz en anchura normal; títulos en anchura expandida y peso alto.
- Martian Mono: solo código y tokens.

**Movimiento.** Un único momento orquestado al cargar el mapa (las aristas se dibujan desde la base, una vez). El resto responde a acciones: dominar un concepto propaga la brasa por la arista a los nodos que desbloquea; cerrar un bloque enciende su racimo en secuencia, sin confeti. Con `prefers-reduced-motion`, cambios de estado instantáneos con fundido.

**Lenguaje común de las visualizaciones (`VizFrame`).** Mismo marco para todas: escenario, controles, lectura numérica, "qué observar", reinicio. Primitivas compartidas: deslizador, reproductor por pasos (reproducir, pausa, paso, atrás), ficha de token, barra, depósito, visor de JSON con diferencias resaltadas, panel de traza. Todas operables con teclado, con resumen en `aria-live` y datos deterministas.

**Primera pantalla (visita nueva, escritorio)**

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ Prometeo       Hoy   Mapa   Repaso   Proyectos   Apuntes          Ctrl K   ◐   │
├──────────────────────────────┬─────────────────────────────────────────────────┤
│                              │                  ○ Especialización              │
│  El fuego de la IA,          │          ○ Producción                           │
│  para quien construye.       │              │     ╲                            │
│                              │          ○ Seguridad  ○ Teoría (opcional)       │
│  De "uso ChatGPT" a llevar   │              │                                  │
│  productos con LLMs a        │          ○ Agentes ──── ○ RAG                   │
│  producción. 10 bloques,     │                 ╲      ╱                        │
│  cada concepto se aprende    │                ○ Evals                          │
│  manipulándolo.              │                   │                             │
│                              │                ○ Prompt y contexto              │
│  [ Hacer el test de nivel ]  │                   │                             │
│    15 minutos                │                ◉ Fundamentos                    │
│  Empezar por el bloque 1     │                  (único nodo con brasa)         │
│                              │                                                 │
│  Tus datos no salen de este  │   ○ Carrera (en paralelo, desde la semana 1)    │
│  navegador. En construcción: │                                                 │
│  bloque 1 revisado.          │                                                 │
└──────────────────────────────┴─────────────────────────────────────────────────┘
```

Con progreso, el panel izquierdo pasa a ser el resumen de "Hoy": siguiente concepto, repasos pendientes y la llama de la racha. Al entrar en un bloque, el mapa hace zoom a sus conceptos. En móvil el grafo se convierte en una lista vertical por bloque con un raíl de temperatura a la izquierda, y la navegación baja a una barra inferior (Hoy, Mapa, Repaso, Apuntes, Más).

El primer entregable de la fase 1 es esta pantalla funcionando, con captura en oscuro, claro y móvil, antes de construir nada más. El aviso de la primera pantalla dice qué bloques están revisados, calculado desde el estado de los conceptos.

## Temario

Puntuaciones de 1 a 10 y horas: son criterio mío, no datos verificables. Horas = conceptos + proyecto.

| # | Bloque | Prioridad | Demanda | Dificultad | Retorno empleo | Horas |
|---|---|---|---|---|---|---|
| 1 | Fundamentos de LLMs y APIs | 10 | 9 | 4 | 8 | 18 + 12 |
| 2 | Prompt y context engineering | 10 | 9 | 5 | 8 | 14 + 10 |
| 3 | Evals y observabilidad | 9 | 8 | 6 | 9 | 16 + 14 |
| 4 | RAG | 9 | 10 | 6 | 10 | 20 + 20 |
| 5 | Patrones agénticos | 9 | 10 | 8 | 10 | 28 + 25 |
| 6 | Control y seguridad | 8 | 7 | 6 | 8 | 14 + 12 |
| 7 | Producción | 8 | 9 | 7 | 9 | 16 + 15 |
| 8 | Especialización (elegir 1-2 ramas) | 5 | 6 | 8 | 5 | 14 + 16 |
| 9 | Base teórica (opcional) | 4 | 3 | 7 | 4 | 12 + 6 |
| 10 | Carrera (en paralelo) | 8 | n/a | 2 | 10 | 10 + 8 |

Total aproximado: 300 horas. (+) marca lo que añado.

1. **Fundamentos (12).** (+) Anatomía de una llamada: mensajes, roles, sin memoria, motivo de parada · tokens y tokenizadores · ventana de contexto · probabilidades y muestreo (temperatura, top-p, top-k) · determinismo y reproducibilidad · embeddings · alucinaciones · streaming · salidas estructuradas · tool calling · caché de prompts · elección de modelo por coste y latencia.
2. **Prompt y context engineering (10).** System prompts y roles · zero-shot y few-shot · estructura con XML y delimitadores · razonamiento extendido y cuándo pagarlo · prefill y control del formato · qué meter y qué dejar fuera · (+) orden y posición en contextos largos · compactación · prompts como código versionado · (+) depurar un prompt con método.
3. **Evals y observabilidad (10).** (+) Análisis de errores antes que métricas · datasets de prueba (golden, sintéticos, de producción) · métricas por código y por rúbrica · LLM-as-judge y (+) su calibración contra etiquetas humanas · regresiones en CI · (+) comparar prompts y modelos con varianza y tamaño de muestra · trazas y spans · (+) evals online frente a offline · (+) evaluar agentes por trayectoria y resultado · (+) guías de anotación humana.
4. **RAG (12).** Cuándo sí y cuándo no (frente a contexto largo, caché y fine-tuning) · (+) ingesta y parsing de documentos · chunking · embeddings para recuperación · bases vectoriales e índices ANN · búsqueda léxica e híbrida · (+) filtros por metadatos y permisos · (+) transformación de consultas · reranking · citas y grounding · RAG agéntico · evaluación de la recuperación y de la respuesta.
5. **Patrones agénticos (18).** (+) Workflows frente a agentes y cuándo no usar un agente · (+) el bucle de agente desde cero · (+) diseño de herramientas · Prompt Chaining · Router & Specialist · Parallelization · Reflection · ReAct · Planning y Plan and Execute · Orchestrator & Worker · CodeAct · memoria de agentes · (+) gestión de contexto en tareas largas · multiagente y cuándo no · MCP · skills y subagentes · (+) computer use y agentes de navegador · (+) ejecución duradera y panorama de SDKs de agentes.
6. **Control y seguridad (11).** (+) Modelo de amenazas de una app con LLM · prompt injection directa e indirecta · (+) jailbreak frente a injection · OWASP Top 10 para LLMs · guardrails de entrada y salida · human in the loop y approval gates · mínimo privilegio · sandboxing · circuit breaker, presupuestos y terminación · (+) privacidad y datos personales · (+) manejo inseguro de la salida del modelo.
7. **Producción (11).** Costes: medir y atribuir · latencia: TTFT y p95 · caché de prompt, de respuesta y semántica · reintentos, timeouts y backoff · fallbacks y (+) enrutado con gateway · rate limits y concurrencia · colas y trabajos en segundo plano · (+) batch · UX de streaming · (+) desplegar prompts y migrar de modelo · (+) monitorización y alertas.
8. **Especialización (8).** Cuándo hacer fine-tuning · fine-tuning práctico · (+) destilación · modelos locales y cuantización · (+) modelos en el navegador · multimodal: visión y documentos · (+) generación de imagen, lo justo · voz: STT, TTS y agentes en tiempo real.
9. **Base teórica (7).** Matemáticas mínimas · redes neuronales, lo justo · de tokens a vectores · atención por dentro · el bloque transformer · entrenamiento y ajuste · (+) inferencia: logits, caché KV y por qué se paga por token.
10. **Carrera (8).** Desarrollo asistido por IA como habilidad (recomendado desde la semana 1) · presentar proyectos de IA · (+) escribir un caso de estudio con métricas · preguntas de entrevista · (+) diseño de sistemas con LLMs en entrevista · marco legal: AI Act y (+) RGPD, lo justo · (+) roles y qué piden las ofertas · (+) mantenerse al día con criterio.

**Por qué los añadidos:** la anatomía de una llamada es el prerrequisito real de todo el bloque 1 y casi nadie la explica; ingesta, filtros y transformación de consultas son donde fallan los RAG reales; el bucle desde cero y el diseño de herramientas pesan más que cualquier framework; la calibración del juez y el análisis de errores separan unas evals útiles de unas decorativas; batch, gateway y migración de modelo son trabajo diario en producción.

### Bloque 1 en detalle (fase 1)

| Concepto | Visualización |
|---|---|
| Anatomía de una llamada | Constructor de petición: editas la conversación y ves el JSON de ida y vuelta; quitas el historial y la respuesta pierde el hilo; bajas `max_tokens` y cambia el motivo de parada |
| Tokens | Tokenizador real, español e inglés lado a lado, tokens por palabra, coste, casos trampa (números, emojis, código) |
| Ventana de contexto | Depósito con system, herramientas, documentos, historial y reserva de salida; simulador de turnos hasta desbordar; truncar frente a compactar |
| Muestreo | Distribución real del siguiente token deformada por temperatura, corte de top-p y top-k, generar 10 veces con semilla |
| Determinismo | Rejilla de ejecuciones a temperatura 0 y árbol de divergencia: un token distinto cambia toda la continuación (simulación, etiquetada como tal) |
| Embeddings | Mapa 2D con PCA, vecinos con coseno real, frase nueva con modelo local opcional |
| Alucinaciones | Dos fases: el modelo continúa con la misma fluidez sepa o no la respuesta (simulación etiquetada); después marcas qué afirmaciones de una respuesta no están respaldadas por la fuente |
| Streaming | Línea de tiempo de eventos SSE, TTFT frente a tiempo total, deslizador de tokens por segundo, eventos crudos por proveedor, cancelar a mitad |
| Salidas estructuradas | Editor de esquema y tres modos (pedirlo en el prompt, modo JSON, esquema estricto): 20 muestras, tasa y tipo de fallo; vista de tokens inválidos enmascarados. Las tasas de fallo son ilustrativas (simulación, etiquetada como tal) |
| Tool calling | Bucle por pasos en tres carriles (usuario, modelo, tu código) con el JSON de cada mensaje, formato por proveedor, llamadas en paralelo, rama de error |
| Caché de prompts | Prefijo fijo y cola variable; editas una palabra y se invalida desde ahí; coste antes y después; caducidad |
| Elección de modelo | Calculadora: tokens, volumen y modelo frente a coste mensual y latencia; precios editables desde `data/modelos.json`; caché y batch como interruptores |

Embeddings: `Xenova/multilingual-e5-small` cuantizado a 8 bits (118 MB, comprobado en Hugging Face), 384 dimensiones. `scripts/generar-embeddings.ts` usa el mismo modelo y la misma cuantización en Node. El JSON guarda vectores, media, dos componentes principales y varianza explicada, que se muestra en la nota sobre lo que pierde el 2D. El aviso de descarga dice el tamaño y que la petición va a Hugging Face; el texto que escribe el usuario no sale del navegador.

## Proyectos

| Bloque | Proyecto | Por qué destaca |
|---|---|---|
| 1 | **Rayos X**: banco de pruebas que muestra qué ocurre en una llamada (tokens, coste, TTFT, aciertos de caché, bucle de herramientas) en dos proveedores lado a lado | Demuestra dominio del nivel de protocolo y de medir, no de "llamar a una API" |
| 2 | **Triaje**: convierte correos o incidencias desordenadas en datos estructurados, con prompts versionados y un changelog público de precisión por versión | Enseña método, no inspiración |
| 3 | **Banco de evals**: panel que compara prompts y modelos, con juez calibrado contra etiquetas humanas y puerta de regresión en CI | Lo que más falta en los equipos |
| 4 | **Buscador semántico** sobre un dominio real en español, con citas y evaluación pública de la recuperación | Calidad medida y publicada |
| 5 | **Agente con herramientas y trazas visibles**, más un servidor MCP propio y útil | Agente inspeccionable, no caja negra |
| 6 | **Equipo rojo**: endurecer el agente del bloque 5 y publicar la batería de ataques con resultados antes y después | Seguridad demostrada con números |
| 7 | **A producción**: gateway con fallbacks, caché y límites, panel de costes e informe de prueba de carga | Madurez operativa |
| 8 | Comparativa modelo pequeño ajustado frente a modelo grande con prompt, o agente de voz | Criterio de coste y calidad |
| 9 | Atención visualizada desde cero en TypeScript (opcional) | Comprensión de fondo |
| 10 | Caso de estudio y página de portfolio | Convierte el trabajo en entrevistas |
| Final | Producto vertical que integra RAG, agente, evals, guardrails, observabilidad e informe de costes, desplegado | La pieza central del portfolio |

Cada proyecto lleva la ficha completa pedida (tres niveles, criterios marcables, stack, horas, plantilla de README, guion de vídeo de 60 segundos, campos de repo y demo). En la fase 1 solo se escribe entera la de Rayos X; las demás aparecen como fichas pendientes.

## Fases

**Fase 0 — repo y flujo.** Carpeta, `git init`, repo público (con confirmación previa), licencias, `.github/` y `docs/FLUJO.md` adaptados de Nextuss, `docs/PLAN.md` y `docs/DECISIONES.md`, protección de `main` (PR obligatoria y checks en verde, sin aprobaciones requeridas al ser un solo autor), milestones por bloque, issues de la fase 1.

**Fase 1 — corte vertical**, un issue y una PR por porción, una PR por sesión:
1. Esqueleto, tokens de diseño, shell y primera pantalla, con el CI completo desde esta PR (typecheck, lint, validación de contenido y enlaces, aunque el contenido esté vacío). **Parada: captura para aprobación.** Si el prerender da problemas de hidratación que no se resuelven dentro de esta misma PR, se para y se consulta antes de seguir. Alternativa preparada: modo SPA de React Router (`ssr: false` sin `prerender`), que mantiene rutas y código intactos y solo pierde el HTML por concepto; el prerender se reintentaría después como PR aislada.
2. **Un concepto de principio a fin: "Tokens".** Plantilla de página con la anatomía completa, esquema Zod y canal MDX mínimo, visualización del tokenizador sobre `VizFrame`, workspace de snippets con las pestañas Anthropic y OpenAI, preguntas, tarjetas, fuentes verificadas y editor de apuntes con autoguardado. **Parada: validación de la plantilla.** Nada más se escribe hasta aprobarla.
3. Funciones de estudio, en tres PR:
   - (a) estado y migraciones, mapa de habilidades, prerrequisitos y Hoy;
   - (b) repaso SM-2, test de bloque, rachas y mapa de calor, niveles y plan;
   - (c) vista global de apuntes, paleta de comandos, exportar e importar y tarjeta de progreso.
4. Resto del kit de visualización y las 11 visualizaciones restantes, repartidas en PR de 3 o 4.
5. Contenido de los 11 conceptos restantes (datos y enlaces verificados en la web, snippets contra la documentación), glosario, test del bloque, proyecto Rayos X, test de nivel del bloque 1 y 2 retos.
6. Calidad y open source: pruebas, accesibilidad, móvil, README sin capturas, CONTRIBUTING, aviso "en construcción".

**Parada para revisión.**

**Fases 2 a 10** — un bloque por sesión, replicando el patrón. **Fase 11** — proyecto final, capturas y demo en el README, GitHub Pages.

**Test de nivel parcial.** En la fase 1 solo tiene preguntas del bloque 1. Cada bloque aporta las suyas cuando se escribe. Mientras falten bloques, la pantalla del diagnóstico y su resultado dicen que es parcial y qué bloques cubre; la cobertura se calcula a partir del contenido, no se escribe a mano. Los retos que mezclan varios bloques también llegan con cada bloque.

## Método de trabajo

- **Una PR por sesión.** Al empezar cada sesión se leen `docs/PLAN.md` y `docs/DECISIONES.md`; al terminar se actualiza el estado en `docs/PLAN.md` dentro de la misma PR.
- **`docs/PLAN.md`** es este plan, con una tabla de estado por porción (pendiente, en curso, fusionada, con número de PR). **`docs/DECISIONES.md`** registra cada decisión con fecha, motivo y alternativa descartada; arranca con las de este documento.
- En la fase 0 se guarda además una memoria de proyecto que apunta a ambos archivos, para que una sesión nueva los encuentre.

## Qué significa "revisado"

Un concepto nace como `borrador` y solo pasa a `revisado` cuando se cumplen las dos condiciones:

1. **Verificación independiente.** Un subagente sin contexto previo recibe el concepto y sus fuentes citadas, contrasta cada afirmación con ellas y devuelve las discrepancias (afirmación, fuente, qué dice realmente). Se corrigen y se repite hasta que no quede ninguna abierta. El resultado se resume en la PR.
2. **Lectura del autor.** El usuario lo ha leído y lo aprueba.

El estado es un campo del concepto (`estado: 'borrador' | 'revisado'`), visible en la página junto a la fecha de última revisión, y es lo que alimenta el aviso "en construcción" de la app y del README. Solo el usuario cambia un concepto a `revisado`.

## Rigor del contenido

- Cada dato que pueda haber cambiado y cada URL se comprueban en la web al escribir el concepto; lo que no pueda comprobar no se incluye. Mi conocimiento llega a junio de 2026 y hoy es noviembre de 2026, así que nombres de modelos, precios, límites y firmas de SDK se tratan como desconocidos hasta verificarlos.
- Nombres, precios y límites solo en `data/modelos.json`, con fecha y fuente; el texto los referencia.
- Cada concepto muestra su fecha de última revisión; cada fuente lleva su idioma (ES o EN).
- Para los snippets de Anthropic se carga la skill `claude-api` antes de escribirlos; los de OpenAI se verifican contra su documentación, incluida la elección entre sus dos APIs de generación.

## Lo que no sé todavía

- Peso real de `gpt-tokenizer` con una sola codificación: las cifras que encontré se contradicen. Se mide en la fase 1 con un presupuesto de carga.
- Fallback de React Router 8 en GitHub Pages: no documentado, hay que probarlo.
- Si Anthropic y Google publican tokenizador local para sus modelos actuales; se verifica antes de afirmar nada en la visualización.
- Estado actual de prefill por proveedor y edición vigente del OWASP Top 10 para LLMs.
- Fechas de aplicación del AI Act: se citan solo desde fuente oficial; no es asesoría legal y el concepto lo dirá.

## Verificación tras cada fase

1. `npm run typecheck` (app y snippets), `npm run lint`, `npm run validar` (contenido), `npm run enlaces`, `npm run test` (Vitest: SM-2, rachas, plan, migraciones, esquemas).
2. `npm run build` y `npm run preview`; Playwright recorre todas las rutas en escritorio y en 390 px, falla ante cualquier error de consola y pasa axe-core.
3. Navegación manual propia de los flujos principales: test de nivel, concepto completo con su visualización, repaso, test de bloque, exportar e importar, paleta de comandos, tema claro, teclado y `prefers-reduced-motion`.
4. Informe al usuario separando lo verificado de lo no verificado.
