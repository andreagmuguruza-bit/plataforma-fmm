export interface ProjectQualitativeMetadata {
  estadoImplementacion: string[];
  productosDestacados: string[];
  probabilidadObjetivos: string[];
  accionesSugeridas: string[];
  fechaEvaluacionIntermedia: string;
  fechaTalleresArranque?: string;
  temasCriticosSimulador: string;
  verificadorContenidos: string;
}

export const QUALITATIVE_METADATA_MAP: Record<string, ProjectQualitativeMetadata> = {
  'EC-L1253': {
    estadoImplementacion: ['Saldrá en Alerta. Dos procesos importantes de licitacion del SRI que se cayeron impidieron tener el nivel de ejecución financiera esperada. Aduanas está empezando a levantar'],
    productosDestacados: ['Modernización y digitalización del Sistema de Administración Tributaria.'],
    probabilidadObjetivos: [],
    accionesSugeridas: ['Corregir las unidades de medida para reflejar avances a lo largo de los años.'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado 15%, DI en Problema.\nNo tenía MF\nMF$ Pa por US$8.4MM, se requiere @80% del Pa, @US$6.0MM de ejecución en 2025, claves 1.2 y P1.3. Al IIS reporta ejecución MF$ de US$125K, @1.5% del Pa del año.\nEstá en Alerta SI:2.2\n\nCiclo 2026;\nDesembolso previsto por US$4.9MM, acumulado 21%, DI estaría en Problema, mínimo para Alerta es 28% acumulado.\nMF Pa en P1.1, P1.2, P1.3, P2.2, P2.4 y P2.5\nMF$ Pa por US$8.92MM, al menos 80%, US$7.14MM, claves P1.2, P1.3, P2.2\nSi cumple desembolsos, MF y MF$ estaría Satisfactorio",
    fechaEvaluacionIntermedia: "Final de 2026",
    fechaTalleresArranque: "Noviembre 2024",
    verificadorContenidos: "En el VC:\n2 Alertas por temas relacionados a la matriz de riesgos, activos y medidas se mantienen por 4 o más ciclos."
  },
  'PR-L1192': {
    estadoImplementacion: ['Tener listo el start up plan para el 15 de mayo'],
    productosDestacados: [],
    probabilidadObjetivos: [],
    accionesSugeridas: [],
    temasCriticosSimulador: "Pendiente carga de MdR en CVG y Taller de Arranque",
    fechaEvaluacionIntermedia: "",
    fechaTalleresArranque: "Pendiente (Junio 2026)",
    verificadorContenidos: ""
  },
  'UR-L1164': {
    estadoImplementacion: [],
    productosDestacados: ['Módulo SIFI de endeudamiento'],
    probabilidadObjetivos: [],
    accionesSugeridas: ['Coordinar la extensión. Tomará unos días más la validación'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado @7.7%, DI en Problema\nMF previstas en P4, P5, P7, P10 - P13, P17 y P2.1, al IIS reporta ejecución MF en P1.4, P1.10, P1.12, P1.13 y P1.17, P2.1\nMF$ US$10MM en Pa, al IIS reporta ejecución MF$ por US$1.9MM, @19% del Pa previsto del año.\nEstá en Problema\n\nCiclo 2026:\nDesembolso previsto US$9MM, 17% acumulado, DI estaría en Problema.\nMF Pa en P1.1, P1.2, P1.5 - P1.8, P1.11, P1.16 - P1.18, P2.1 - P2.3 y P2.6 requiere las MF unitarias y al menos 75% MF no unitarias.\nMF$ Pa por US$17.3MM, requiere @70-80%, @US$13.8MM, clave P2.3\nSi cumple desembolsos, MF y MF$ podría estar Satisfactorio.",
    fechaEvaluacionIntermedia: "2027",
    verificadorContenidos: "En VC:\nHay 5 advertencias\nUna por error en suma de costos\n4 Alertas, relacionadas a datos en el módulo de segumiento y de riesgos y acciones activas por 4 o más ciclos, y por metas de indicadores de SDO."
  },
  'AR-L1248': {
    estadoImplementacion: ['Realizando PCR con desafíos metodológicos por complejidad de la matriz de resultados. Se retrasará el CO hasta tener dicha matriz actualizada.'],
    productosDestacados: [],
    probabilidadObjetivos: [],
    accionesSugeridas: [],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado 78%, DI Satisfactorio.\nMF programada en P15 Pa, al IIS reporta ejecución en P1.3 y P2.2\nMF$ a cumplir US$4.8MM, al IIS reporta ejecución MF$ por US$3.2MM, un 66.7% del Pa del año.\nEstá Satisfactorio\nTiene saldo pero no está programado\n\nCiclo 2026:\nNo tiene Desembolsos programados\nTiene MF programada en P1.3 y P2.2\nNo tiene MF$ programada para estos productos\nProyecto en Cierre\nTiene saldo pero no está programado\nSi no ejecutara nada igual estaría Satisfactorio, aunque si alcanzara CO antes del cierre del año no contaría para el ciclo 2026.",
    fechaEvaluacionIntermedia: "",
    verificadorContenidos: "En VC:\nHay 4 advertencias de error por suma de costos, riesgos, metodología en indicadores.\nNo limitan el inicio del flujo."
  },
  'AR-L1285': {
    estadoImplementacion: ['Objetivo: mantener ejecución en menos de 30% para no hacer PCR y cancelar y cerrar antes de fin de año para no seguir acumulando PMR negativo. Propuesta de extender un año más la planificación físico/financiera para reducir el riesgo de que se extienda y nos quede en alerta/problema el año que viene.'],
    productosDestacados: [],
    probabilidadObjetivos: [],
    accionesSugeridas: [],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado 25%, DI en Problema.\nMF en P1.1, P1.3, P4.1, P4.2 y P5.3, al IIS reporta MF en P1.1 y P4.1\nMF$ Pa @US$11MM, al IIS reporta ejecución MF$ por US$3MM, @27.3% del Pa del año.\nEstá en Problema\n\nCiclo 2026:\nDesembolsos no estan registrados\nMF Pa en P1.1, P4.2, P5.1,P5.2 y P5.3\nMF$ Pa por US$5.2MM en productos. Dado que es el último año, 100% ejecución, aunque con 80% estaría bien, @US$4.2MM, claves P1.1, P5.1 y P5.2.\nEstaría en Satisfactorio si cumple MF y MF$, aún sin desembolsos, revisar la proyección de desembolsos.\n\nSi no ejecuta, estaría en Problema y sería conveniente CO antes de finalizar el año, por otro lado, si ejecuta, estaría Satisfactorio y contribuiría positivamente a la cartera, no conviene CO este año. Complicado.",
    fechaEvaluacionIntermedia: "",
    verificadorContenidos: "En el VC:\n4 notificaciones por errores en metodología de evaluación en indicadores de SDO, suma de costos, desagregación de indicadores y campos vacíos en la matriz de riesgos y 1 Alertas por temas relacionados a la matriz de riesgos activos por 4 o más ciclos."
  },
  'AR-L1405': {
    estadoImplementacion: [],
    productosDestacados: [],
    probabilidadObjetivos: [],
    accionesSugeridas: [],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolsos acumulado %, DI Satisfactorio.\nMF en P2.8 Pa, al IIS reporta ejecución MF en P2.8 cumplida.\nMF$ US$1.65MM, clave P3.2 para completar ejecución\nAl IIS reporta ejecución MF$ por US$1.47MM, @90%\nEstá en Satisfactorio\n\nCiclo 2026:\nDesembolso previsto por US$10.7MM, acumulado 18% DI estaría Satisfactorio.\nEn MF Pa tiene P1.2 - P1.5, P2.1, P3.2, P3.3, requiere las MF unitarias y al menos el 80% de las no unitarias\nEn MF$ Pa tiene US$8.4MM en productos, al menos 80%, @5MM, claves P1.2 y P2.5 \nSi cumple desembolsos, MF y MF$, continuaría Satisfactorio.",
    fechaEvaluacionIntermedia: "",
    verificadorContenidos: "En el VC:\nPresenta dos bloqueos críticos, uno relacionado a metas fisicas planeadas y no reportadas en hitos y la otroa, similar para productos.\nUna alerta Alerta por indicador de SDO que tiene metas planeadas y no se reporta progreso."
  },
  'BL-L1031': {
    estadoImplementacion: ['Proyecto avanza en tiempo y forma para cerrar en noviembre 2026.'],
    productosDestacados: ['Sistema integrado de tributación'],
    probabilidadObjetivos: ['Alta, pero importante definir situación de uno de los cinco indicadores que sería insatisfactorio.'],
    accionesSugeridas: ['Actualizar bien la MR y posponer el CO hasta tenerla lista.'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolsos acumulado 95%, DI Satisfactorio.\nSegún el simulador ya está en Cierre.\nMF en P2.8 Pa, al IIS reporta ejecución MF en P2.8 cumplida.\nMF$ US$1.65MM, clave P3.2 para completar ejecución\nAl IIS reporta ejecución MF$ por US$1.47MM, @90% Pa del año.\nEstá Satisfactorio\n\nCiclo 2026:\nDesembolso previsto US$738K para 100% acumulado, DI estaría Satisfactorio.\nMF Pa en P2.7 y P2.9\nMF$ Pa por US$690K, dado que es último año sería 100% ejecución.\nSi cumple desembolsos, MF y MF$ estaría Satisfactorio.",
    fechaEvaluacionIntermedia: "2025",
    verificadorContenidos: "En el VC:\n2 Alertas por temas relacionados a la matriz de riesgos, activos y medidas se mantienen por 4 o más ciclos."
  },
  'BL-L1038': {
    estadoImplementacion: ['Proyecto logra cambiar a satisfactorio. Habrá cancelación parcial de recursos por productos que se repriorizaron'],
    productosDestacados: ['Datawarehouse para el Ministerio de Finanzas'],
    probabilidadObjetivos: ['A raíz de los productos cancelados no se alcanzará el indicador de procurement. Importante identificar alternativa para mejorar probabilidad de PCR satisfactorio.'],
    accionesSugeridas: ['Monitorear cuándo sería la cancelación parcial por productos no ejecutados (en lo posible este año). Mantener actualizada la MR de cara al PCR'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado 42% para DI en Problema.\nMF Pa en P1.1.1, P1.4.1, P1.4.2 y P1.4.3, al IIS reporta ejecución MF en P4.1, P4.2 y P4.3\nMF$ Pa US$1.56MM, al IIS reporta ejecución por @US$1MM, @64% del Pa del año\nEstá en Satisfactorio\n\nCiclo 2026:\nDesembolso previsto US$1.2MM, 57% acumulado, DI estaría en Problema, mínimo para Alerta > 67% acumulado.\nMF en Pa P4.3 y P4.4\nMF$ en Pa por @US$614K, al menos 80%, US$492K, claves P4.3 y P4.4\nSi cumple desembolsos, MF y MF$ podría continuar Satisfactorio.",
    fechaEvaluacionIntermedia: "Abril 2026",
    verificadorContenidos: "En VC:\nHay dos Alertas, una relacionada a valores actuales en indicadores de SDO y otra de acciones de respuesta a riesgos que se mantienen activas por 4 o más ciclos."
  },
  'BR-L1377': {
    estadoImplementacion: ['En cierre.'],
    productosDestacados: [],
    probabilidadObjetivos: [],
    accionesSugeridas: ['No dar CO hasta no haber actualizado indicadores finales de resultados'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso 100%, DI Satisfactorio.\nEn Pa solo tenía MF en P1.3, al IIS reporta MF en P1.3, P1.4, P1.5 y P2.1\nMF$ tenía US$700K, al IIS reporta MF$ por US$255K\nEstá Satisfactorio.\nProyecto en Cierre y previsto cierre operacional para el 28.03.2026, no contaría como proyecto para el desempeño en ciclo 2026.",
    fechaEvaluacionIntermedia: "",
    verificadorContenidos: "En VC:\nHay dos notificaciones, una por error en suma de costos y otra, una Alerta, a que no se han agregado riesgos por 4 o más ciclos."
  },
  'BR-L1501': {
    estadoImplementacion: ['Cierra a fin de año. Hay dificultades con la UE para coordinar el cierre del proyecto. Crítico el plan de acción para el cierre. Empezando preparación PROFISCO III por $92 millones'],
    productosDestacados: ['Sistema de nóminas/Datamining/Sistema de cooperative compliance/Sistema de fiscalización de mercancía en tránsito'],
    probabilidadObjetivos: [],
    accionesSugeridas: ['Por decidir si entra en primer o segundo batch de PCRs en función de CO final'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado de 89% DI en Satisfactorio.\nMF Pa prevista en P1.1, P1.2, P1.3, P2.1, P2.2, P2.3, P2.4, P2.5, P2.6, P3.1, P3.2, P3.3, P3.4 y P3.5 (Casi todos y metas unitarias)\nAl IIS reporta MF en P1.1, P1.2, P1.3, P2.1, P2.2, P2.4, P2.6, P3.1, P3.2, P3.3 y P3.4\nMF$ Pa era US$8.08MM, claves P1.3, P2.2, P2.5, P3.1 y P3.3. Al IIS reporta MF$ por US$4.2MM.\nEstá Satisfactorio\n\nCiclo 2026\nDesembolsos 100%, DI Satisfactorio.\nEn MF Pa tiene P1.1, P1.2, P1.3, P2.2, P2.4, P2.5, P3.1, P3.3 y P3.5\nEn MF$ Pa tiene @US$8.4MM, requiere 80%, aunque por ser último año, sería 100%. Claves P1.3, P2.2, P2.4, P2.5, P3.1 y P3.3.\nSi cumple desembolsos, MF y MF$ se mantendría Satisfactorio",
    fechaEvaluacionIntermedia: "2024",
    verificadorContenidos: "En el VC:\n2 Alertas por temas relacionados a la matriz de riesgos, activos y medidas se mantienen por 4 o más ciclos."
  },
  'BR-L1511': {
    estadoImplementacion: ['El taller de cierre se realizará el 31 de marzo de 2026, luego de un buen desempeño histórico de ejecución.'],
    productosDestacados: ['Sistema de inspección de mercadería en tránsito, muy destacado, reconocido por el propio Gobernador'],
    probabilidadObjetivos: ['Indicadores de resultados se estarían alcanzando.'],
    accionesSugeridas: ['Comenzar a preparar PROFISCO III'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado @84%, previsto @100% para DI Satisfactorio en 2025.\nEn IS 2025, tiene 100% desembolsado acumulado, DI en Satisfactorio. El desembolso se hizo en Mayo 2025.\nMF prevista en P1 - P4, P6 - P13, P15 y P16 en Pa, al IIS, reportan MF cumplida en P1.1, P1.2, P1.3, P1.4, P1.6, P2.1, P2.3 - P2.6, P31.1 y P3.3\nEn MF$ Pa tenía US$15.6MM, claves P1 y P9. En IIS reportan ejecución @MF$ US$17.45MM, @111.9% del Pa del año.\nEstá en Satisfactorio ciclo 2025.\nEl proyecto está en Etapa III, en Cierre en 2025, con el último desembolso realizado.\n\nCiclo 2026:\nProyecto cerrado con CO al 13.03.2026, no contará para ciclo 2026.",
    fechaEvaluacionIntermedia: "2024",
    verificadorContenidos: "En el VC:\nHay dos Alertas, una de que todas la acciones de respuesta deben tener una explicación en cada ciclo y otra que no se ha agregado un riesgo en 4 o más ciclos.\nUna advertencia de error porque hay acciones de respuestas en riesgos, con campos vacíos."
  },
  'BR-L1513': {
    estadoImplementacion: ['Retrasos iniciales en el componente 3 por falta de definición de estrategia para su implementación (SIAF). Se resolvió y está definido el camino a seguir, esperando mejorar ejecución en 2026.'],
    productosDestacados: ['Excelente sistema de cuenta corriente tributaria con cruce de información e información detallada para cada contribuyente / Buena gobernanza de desarrollo de TI'],
    probabilidadObjetivos: [],
    accionesSugeridas: [],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado @19%, DI Satisfactorio.\nTenía MF Pa prevista en P2.2 y P2.6. Al IIS 2025 reporta MF cumplidas P2.2 y P2.6\nEn MF$ tenía Pa de US$9.8MM, en especial para P1.1, P1.3, P2.3, P2.4, P2.5, P2.6 y P3.4. Al IIS, reporta ejecución MF$ por US$6.92MM, @70.6% del Pa del año\nEstá en Satisfactorio.\n\nCiclo 2026:\nDesembolso previsto @US$8.4MM, acumulado de\nMF Pa en P2.2.\nEn MF$ Pa tiene US$9.6MM, requiere @80%, unos US$7.7MM de ejecución, en especial en P1.1, P1.3, P2.3 - P2.6, P3.4, P3.6.\nSi cumple desembolsos y MF$, estaría Satisfactorio.",
    fechaEvaluacionIntermedia: "2027",
    verificadorContenidos: "En el VC:\nUna Alerta por riesgo activo por 4 o más ciclos."
  },
  'BR-L1516': {
    estadoImplementacion: ['Finalizando este año, aunque CO se dará en 2027. Posible pedido de reembolso por compras ya realizadas (decisiones pendientes del Secretario). Empezando PROFISCO III por $136'],
    productosDestacados: ['Sistema de costos / Aplicación de Inteligencia Artificial en la administración tributaria (SMART SEFAZ) / Sistema contencioso tributario / Nuevo SIAF, renovado tecnológicamente, integrado y con reportes gerenciales'],
    probabilidadObjetivos: [],
    accionesSugeridas: ['Sugerimos abrir 2027 para el primer trimestre de ejecución (distribuir costos 2026). Entraría en segundo batch de PCRs'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado 79% con DI Satisfactorio\nTenía MF en P5, P12, P14, P16, P18 y P19 en Pa. Al IS 2025 reporta MF en P1.5, P2.1, P2.8, P2.9.\nEn MF$ tiene US$19MM en Pa, claves P2, P5, P7 y P16. Al IIS reporta ejecución MF$ por US$10.1MM.\nEstá Satisfactorio\n\nCiclo 2026:\nDesembolso previsto US$12.487MM, para acumulado 93%, DI Satisfactorio.\nEn MF Pa programado P1.1 - P1.6, P2.1, P2.4, P2.7 - P2.9, P3.1 - P3.4.\nEn MF$ Pa tiene @US$17.8MM en productos, claves P1.2, P1.5, P1.6, P2.1, P3.1. Al menos un 70% Pa, @US$12.46MM.\nSi cumple desembolsos, MF y MF$, estaría Satisfactorio. Con el cumplimiento de MF, podría requerir menos MF$.\nNota: Monitorear cuando el % de desembolso alcance el 95% de desembolso",
    fechaEvaluacionIntermedia: "2024",
    verificadorContenidos: "En el VC:\n2 Alertas por riesgos activos y que no se han agregado riesgos por 4 o más ciclos."
  },
  'BR-L1517': {
    estadoImplementacion: ['Proyecto viene muy bien desde mediados de 2025: avanzó 20% de ejecución en un semestre. Tuvieron disputa con Logos pero finalmente hicieron una contratación directa con ellos vía CAP por $6 millones: el contrato viene ejecutando muy bien. Cambio en la UE ayudó a dinamizar todo. Vence a fin de año pero se prorrogará un año o 18 meses más. En paralelo se preparará el PROFISCO III.'],
    productosDestacados: ['Programa de ciencia de datos para la administración tributaria / Atención al contribuyente / Gestión de personas / compras públicas / MFMP'],
    probabilidadObjetivos: [],
    accionesSugeridas: ['Abrir 2027 para mejorar probabilidad de ejecución satisfactoria en 2026, considerando que se extenderá'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado de @64% DI Satisfactorio.\nTenía MF Pa en P3.5 y se reporta cumplida en IIS.\nEn MF$ para 2025 tiene Pa de US$9.54MM, en especial para P1.3, P1.4, P2.2 y P3.3. En IIS reportan ejecución MF$ por US$8.7MM, @92% del monto previsto.\nEstá en Satisfactorio.\n\nCiclo 2026:\nDesembolsos previsto US$6.6MM, para acumulado 81%, DI en Satisfactorio.\nMF Pa en P1.1, P1.5 e P2.2, requiere además el cumplimiento de MF en P1.2 o P1.3 o 30% de P2.5\nEn MF$ Pa tiene @US$7.65MM, requiere @80%, US$6.12MM en especial en P1.1 - P1.5\nSi cumple desembolsos, MF y adicionales y MF$ podría continuar en Satisfactorio sino estaría en Alerta.",
    fechaEvaluacionIntermedia: "2025",
    verificadorContenidos: "En VC:\nUna Alerta por acción de respuesta a riesgos, activa por 4 o más ciclos."
  },
  'BR-L1525': {
    estadoImplementacion: ['No había PROFISCO previo pero igualmente está ejecutando mejor de lo previsto. La mayor parte son contrataciones de tecnología. Proyecto más adelantado de lo previsto.'],
    productosDestacados: ['Modelo de gestión de instrumentos tecnológicos para la gestión de datos / Modelo de recuperación de crédito tributario / Modelo de gestión de la calidad del gasto público'],
    probabilidadObjetivos: [],
    accionesSugeridas: [],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado @24% para DI Satisfactorio.\nAl IS desembolso acumulado 3.52%, DI Alerta.\nNo tiene tiene MF prevista para 2025 en Pa.\nAl IS no reporta MF.\nTodo el desempeño depende de MF$ \nEn MF$ para 2025 tiene Pa de US$3.7MM, se requiere al menos @80%, @US$2.6MM de ejecución en 2025, en especial para P1.1, P1.3, P2.2 y P2.4\nAl IS reporta ejecución MF$ por US$1.67, @45% del Pa del año\nEstá en Satisfactorio\n\nCiclo 2026:\nDesembolso previsto US$5MM, 90% acumulado para DI Satisfactorio.\nEn Pa MF tiene P1.3, P2.2, P3.2 y P3.6\nEn Pa MF$ tiene US$7.7MM, requiere al menos 80% , @US$6.2MM, claves P1.1, P1.3, P2.2, P2.3, P3.2 y P3.5\nSi cumple desembolsos, MF y MF$, continuaría Satisfactorio.",
    fechaEvaluacionIntermedia: "2027",
    verificadorContenidos: "En VC:\nUna advertencia de error por suma de costos."
  },
  'BR-L1527': {
    estadoImplementacion: ['Tramo final de ejecución. Marcha muy bien. Cierra en setiembre 2027.'],
    productosDestacados: ['Sistemas de gestión y de fiscalización / Paraná Confía: nuevo modelo de conformidad fisco-contribuyente / SIAF ya implantado, con PPR'],
    probabilidadObjetivos: [],
    accionesSugeridas: [],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado 73% para DI Satisfactorio\nMF en P1.1, P1.2, P1.3, P1.4, P2.1, P2.2, P2.4, P2.5, P2.6, P2.7, P2.8, P2.10, P211, P3.1, P3.5. Al IIS reporta MF en P1.1, P1.2, P1.3, P1.4 e P2.1 - P2.8, P2.10 y P2.11\nMF$ prevista de US$9.26MM, claves P1.1, P1.2, P2.2, P2.4, P2.6, P2.11, \nAl IIS 2025, ejecución MF$ por US$5.5MM\nEstá en Satisfactorio\n\nCiclo 2026:\nDesembolso previsto US$5MM, acumulado @90%, DI estaría Satisfactorio.\nMF Pa en P1.2, P1.3, P1.4, P2.1, P2.2, P2.4, P2.5, P2.7, P2.8, P2.10, P2.11, P3.1 y P3.5\nEn MF$ Pa tiene @US$8.6MM, al menos 70-80%, unos US$6.9MM de ejecución, especial en P1.2, P1.3, P2.2, P2.4, P2.7, P2.9, P2.11 y P3.2\nSi cumple desembolsos, MF y MF$ continuaría Satisfactorio.",
    fechaEvaluacionIntermedia: "2024",
    verificadorContenidos: "En VC:\nLimpio, sin ninguna advertencia!"
  },
  'BR-L1533': {
    estadoImplementacion: ['Se extendería por un año más, pero con buen desempeño de ejecución: solo para terminar productos pendientes.'],
    productosDestacados: ['Flujo de caja automatizado y conciliación bancaria (parte del SIAF). Evaluación de impacto de Simples (prellenada), como parte de inteligencia tributaria.'],
    probabilidadObjetivos: [],
    accionesSugeridas: [],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado 54%, para DI Satisfactorio.\nNo tenía MF programada, aunque con hitos para seguimiento.\nTenía MF$ Pa de US$7.8MM 2025, claves P2, P3, P4, P8, P9, P11, P13 y P16\nAl IIS reporta ejecución MF$ por US$9.02MM, un 115% ejecución del Pa.\nEstá en Satisfactorio en 2025.\n\nCiclo 2026:\nDesembolso previsto US$9.5MM, para un acumulado del 78%, DI estaría Satisfactorio.\nTiene MF Pa en P2.2\nEn MF$ Pa tiene @US$11.4MM, requiere al menos 70-80%, @US$9.12MM de ejecución, con énfasis en P1.2, P1.3, P2.1, P2.5, P2.6, P3.1 y P3.4.\nSi cumple desembolsos, MF y MF$, se mantendría Satisfactorio, aunque con el avance, alta probabilidad de mantenerse.",
    fechaEvaluacionIntermedia: "2025",
    verificadorContenidos: "En VC:\nUna advertencia de error por suma de costos para revisar.\n3 advertencias de alerta por riesgos activos y acciones de respuesta por 4 o más ciclos y una relacionada a valores reales de las metas de los indicadres de SDO."
  },
  'BR-L1534': {
    estadoImplementacion: ['Cerró a fin de 2025 sin prórrogas. Finalizando QRR PROFISCO III'],
    productosDestacados: ['Consorcio de desarrollo de soluciones innovadoras / Análisis de datos vía FE / Receita orientada a datos, que modernizará toda la administración tributaria / IA generativa para atención al contribuyente.'],
    probabilidadObjetivos: [],
    accionesSugeridas: ['Entra a primer batch. Revisar bien indicadores de resultados con la contraparte antes de cerrar.'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado 100% con DI Satisfactorio.\nTiene MF en P1.1, P1.2, P1.3, P1.4, P1.5, P2.1, P2.2, P2.3, P2.4, P2.5, P2.6, P2.7, P3.1, P3.2, P3.4, P3.5, P3.6 y P3.7. Al IIS reportan la ejecución del 100% MF previstas.\nMF$ de US$17.4MM, al IIS reportan ejecución MF$ por US$19.2MM, @110% de lo previsto.\nEstá en Satisfactorio,\n\nCiclo 2026:\nNo cuenta para ciclo 2026.\nCO del 23.02.2026.",
    fechaEvaluacionIntermedia: "",
    verificadorContenidos: "En VC:\nUna Alerta por valores reales de las metas de los indicadres de SDO."
  },
  'BR-L1535': {
    estadoImplementacion: ['Fuerte avance de ejecución el último semestre aunque se prorrogaría un año/18 meses más. A pesar de alta burocracia interna levantó el ritmo de ejecución. Dificultades con PROFISCO III por techo federal'],
    productosDestacados: ['Modelo de gestión estratégica / Fiscalización inteligente / Sistema de compras públicas / Sistema de fiscalización de mercancías en tránsito'],
    probabilidadObjetivos: [],
    accionesSugeridas: ['Se extendería 12 a 18 meses: abrir ejecución 2027. Empezando a preparar PROFISCO III'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado @57%, DI en Satisfactorio.\nTenía MF Pa en P1.1 - P1.5, P2.1, P2.3 - P2.5, P3.1-P3.4, y P3.6 y en IIS reporta ejecución MF en P1.2, P1.3, P1.4, P2.2 y P2.3, P3.1, P3.2, P3.4, P3.6\nEn MF$ tenía Pa de US$11.84MM. Al IIS, reporta ejecución MF$ por US$7.7MM, un 65% del Pa del año.\nEstá en Satisfactorio.\n\nCiclo 2026:\nDesembolso previsto de US$7MM para un acumulado @75%, DI Satisfactorio.\nTiene MF Pa en P1.1 - P1.5, P2.1 - P2.6, P3.1 - P3.6 (Casi todos los productos) Requiere al menos MF unitarias y el 70% de MF no unitarias.\nEn MF$, tiene Pa de US$16.7MM, requiere ejecución @80%, unos US$13.4MM, especial en P1.1 - P1.5, P2.3 - P2.5 y P3.4 \nContinuaría Satisfactorio si cumple desembolsos, MF y MF$ aunque podría requerir extensión.",
    fechaEvaluacionIntermedia: "2025",
    verificadorContenidos: "En VC:\nLimpio, ninguna advertencia!"
  },
  'BR-L1539': {
    estadoImplementacion: ['Se contrató por CD la empresa de Matto Groso para implementar el SIAF (producto 3.2). Se está repriorizando cuáles de los 14 proyectos originales del SIAF se concretarán. Preocupa la interoperabilidad entre los módulos y la implicancia de cancelación de los módulos. Productos tributarios fueron afectados/retrasados por la reforma tributaria.'],
    productosDestacados: ['Administración tributaria muy sólida: primero de los estados con metodología de beneficios fiscales. Impulsando IA al máximo en el Estado.'],
    probabilidadObjetivos: [],
    accionesSugeridas: ['Reducir marginalmente la proyección de ejecución para 2026 (actualmente 19.5 millones / bajar a 16)'],
    temasCriticosSimulador: "Ciclo 2025\nSe requería al menos @24% acumulado para DI Satisfactorio, en IIS, desembolso acumulado @23% para DI en Alerta.\nTenía MF Pa prevista en P2.2., al IIS no reporta ejecución MF en 2.2.\nEn MF$ tenía Pa de US$9.8MM, se requería @75-80%, unos US$7.83MM de ejecución en 2025, en especial para P1.3, P2.2 y P3.7\nAl IIS 2025, reporta ejecución MF$ por US$12.83MM, @125% de la meta Pa del año.\nEstá en Satisfactorio ciclo 2025.\n\nCiclo 2026\nDesembolso previsto US$5MM, un @32% acumulado y DI en Alerta, se requiere al menos @42% acumulado para DI Satisfactorio en 2026.\nNo tiene MF prevista en Pa. Desempeño depende de ejecución MF$.\nEn MF$ Pa tiene US$14.76MM, se requiere al menos @75-80%, @US$11.8MM de ejecución, en especial para P1.2, P1.3, P2.1, P2.2, P2.4 y P3.2\nSi cumple Desembolsos y MF$, estaría en Satisfactorio ciclo 2026.",
    fechaEvaluacionIntermedia: "Estará lista primer semestre 2026",
    verificadorContenidos: "En VC:\nHay 2 alertas por ningún riesgo agregado en los últimos 4 ciclos y un indicador de SDO que tiene metas pero no tiene progreso reportado."
  },
  'BR-L1540': {
    estadoImplementacion: ['Principales gastos en tecnología están ya contratados. Sistema tributario: gran cambio de estrategia en mayo 2025. Iban a hacer contratación directa de CIAT, pero hay alta probabilidad de incumplimiento, con lo cual cambiaron la estrategia mediante una solución ya existente en Piauí; en segundo semestre 2025 hicieron los convenios de cooperación y recibieron el sistema listo. CIAT solo para adaptaciones del sistema; con lo cual hay un poco de retraso en el sistema pero se espera una ejecución rápida ahora que ya se definió la estrategia.'],
    productosDestacados: ['Nuevo sistema tributario y flujo de caja'],
    probabilidadObjetivos: [],
    accionesSugeridas: [],
    temasCriticosSimulador: "Ciclo 2025:\nSe requiere @12.5% acumulado para DI Satisfactorio, al IS reporta desembolso acumulado @12% para DI Alerta.\nTenía MF Pa prevista en P2.2 y P3.2, al IIS reportan ejecución de MF en P1.1.1, P2.1, P2.6, P3.1, P3.5. \nEn MF$ tenía Pa de US$8.5MM, se requiere al menos @80%, @US$6.8MM de ejecución en 2025, en especial para P1.3, P2.1, P2.3 y P3.2\nAl IIS 2025, reporta ejecución MF$ por US$12.3MM, @144% de la meta Pa del año.\nEstá en Satisfactorio ciclo 2025.\n\nCiclo 2026:\nDesembolso previsto US$6.2MM para acumulado 27% para DI Satisfactorio.\nMF Pa en P1.1, P1.2, P1.3, P2.1 e P3.5.\nEn MF$ Pa tiene US$9.6MM, requiere ejecución @80%, @US$7.7MM, en especial para P1.1 - 1.4, P2.1, P2.4, P3.1 y P3.4.\nSi cumple desembolsos, MF y MF$, continuaría en Satisfactorio.",
    fechaEvaluacionIntermedia: "Final de 2026",
    verificadorContenidos: "En VC:\nHay 4 advertencias de error por suma de costos, riesgos y campos vacíos en identificador de productos en la matriz de planificación."
  },
  'BR-L1550': {
    estadoImplementacion: ['Culminará en tiempo y forma la ejecución.'],
    productosDestacados: ['Modelo de fiscalización tributaria / Plataforma de Big Data'],
    probabilidadObjetivos: [],
    accionesSugeridas: ['Empezar a preparar PROFISCO III'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado 65% para DI Satisfactorio\nMF Pa programada en P1.1., P1.3, P2.1 y P31. Al IIS, reporta ejecución MF en P1.1, P1.3, P2.1y P3.1 cumplidas (100% de productos previstos en Pa 2025)\nMF$ Pa por US$7.58MM, claves P1.2, P1.3, P1.8, P2.1 y P2.4.\nAl IIS reporta ejecución MF$ por @US$5.5MM, @72.5% ejecución del Pa.\nEstá en Satisfactorio.\n\nCiclo 2026:\nDesembolso previsto US$12MM, acumulado 95%, DI estaría Satisfactorio.\nMF en Pa tiene P1.4 - P1.10, P2.2 - P2.6, P3.1, P3.2, P3.3, P3.4, P4.1 y P4.2.\nEn MF$ Pa tiene US$15MM en productos, al menos 80%, @12MM, claves P1.1 - P1.3 y P3.2\nSi cumple desembolsos, MF y MF$ continuaría Satisfactorio.",
    fechaEvaluacionIntermedia: "Primer trimestre de 2026",
    verificadorContenidos: "En VC:\nTiene 3 advertencias por suma de costos y a que no tiene progresp reportado para los indicadores de SDO."
  },
  'BR-L1592': {
    estadoImplementacion: ['Elegible desde mayo 2025. Excelente JEP desde la UCP. Particularidad de ser estado y municipio por ser capital. Proyecto viene muy bien'],
    productosDestacados: ['Sistema informatizado de nómina / Mercancías en tránsito'],
    probabilidadObjetivos: [],
    accionesSugeridas: [],
    temasCriticosSimulador: "Ciclo 2025:\nSe requiere desembolso acumulado @3.5% para DI Satisfactorio, al IS reporta desembolso acumulado @3.4% para DI en Alerta.\nTenía MF Pa prevista en hitos de productos 1.1, 1.3, 1.5, 1.8, 1.10, 1.12, 1.14 en IIS reporta MF en hitos cumplida.\nMF$ para 2025 tiene Pa US$5.6MM, se requiere al menos @75-80% para US$4.5MM de ejecución, en especial para P1.3, P2.2, P2.4 y P3.1\nEn IIS 2025, reporta ejecución MF$ por US$6.23MM, @111% de la meta Pa del año.\nEstá Satisfactorio ciclo 2025.\n\nCiclo 2026:\nDesembolso previsto para US$10MM alcanzando un acumulado de @30% DI en Satisfactorio.\nMF Pa hito para P1.1, P1.3, P1.5, P1.6, P1.10, P1.12, P1.14.\nMF$ Pa tiene @US$10.2MM, requiere @80% @US$8.16MM claves en especial P1.1, P1.3, P2.2, P3.2 y P3.3.\nSi cumple desembolsos y MF$, estaría en Satisfactorio ciclo 2026.",
    fechaEvaluacionIntermedia: "2027",
    verificadorContenidos: "En VC:\nLimpio, no tiene ninguna advertencia!"
  },
  'BR-L1599': {
    estadoImplementacion: ['Finalizará segundo semestre. Problema con la auditoría de verificación de desembolsos, pero está encaminado a resolverse, se sustituirán pagos elegibles'],
    productosDestacados: [],
    probabilidadObjetivos: [],
    accionesSugeridas: [],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolsos acumulado 78.5% con DI Satisfactorio\nMF Pa en P1.1. Al IIS, reporta MF en P1.1 cumplida (100% de productos previstos en Pa 2025)\nMF$ US$21.4MM en Pa, claves P1.2 y P2.1.\nAl IIS reporta ejecución MF$ por @US$5.5MM, @25% ejecución del Pa.\nEstá en Problema\n\nCiclo 2026:\nDesembolso previsto US$12MM, acumulado 95%, DI estaría Satisfactorio.\nMF en Pa tiene P1.4 - P1.10, P2.2 - P2.6, P3.1, P3.2, P3.3, P3.4, P4.1 y P4.2.\nEn MF$ Pa tiene US$15MM en productos, al menos 80%, @12MM, claves P1.1 - P1.3 y P3.2\nSi cumple desembolsos, MF y MF$ continuaría Satisfactorio.",
    fechaEvaluacionIntermedia: "Octubre 2025",
    verificadorContenidos: "En VC:\nUna alerta por indicador SDO que tiene metas y no reporta progreso."
  },
  'BR-L1614': {
    estadoImplementacion: ['Se acaba de dar elegibilidad. Se reembolsará alrededor de 10% por gasto ya ejecutado. Hay sistemas que ya están desarrollados. Cierto riesgo político: el último gobernador fue preso por corrupción, con lo cual hay que tener cuidado con reconocimiento de gastos de 2025. PROFISCO I presentó dificultades, con lo cual requiere más acompañamiento y supervisión.'],
    productosDestacados: [],
    probabilidadObjetivos: [],
    accionesSugeridas: [],
    temasCriticosSimulador: "2026:\nElegibilidad Feb 2026.\nRequiere actualizar datos en CVG para simulador.",
    fechaEvaluacionIntermedia: "",
    verificadorContenidos: ""
  },
  'BR-L1629': {
    estadoImplementacion: ['Difícil conseguir firmar este año'],
    productosDestacados: [],
    probabilidadObjetivos: [],
    accionesSugeridas: [],
    temasCriticosSimulador: "NA",
    fechaEvaluacionIntermedia: "",
    verificadorContenidos: ""
  },
  'BR-L1643': {
    estadoImplementacion: ['Firmado el 30 de diciembre de 2025 y ya lleva 23% de desembolso: excelente comienzo de ejecución, incluso antes de haber realizado el taller de arranque.'],
    productosDestacados: ['Modelo integrado de gestión de información / Modelo de servicios al contribuyente (sirve de referencia para el resto del país) / Uso de datos para auditorías'],
    probabilidadObjetivos: [],
    accionesSugeridas: ['Completar el taller de arranque en lo posible en el primer semestre 2026.'],
    temasCriticosSimulador: "Ciclo 2026:\nElegibilidad 04-02-2026\nPendiente completar MdR para simulador.",
    fechaEvaluacionIntermedia: "",
    verificadorContenidos: ""
  },
  'BR-L1658': {
    estadoImplementacion: ['Firmará este semestre'],
    productosDestacados: [],
    probabilidadObjetivos: [],
    accionesSugeridas: [],
    temasCriticosSimulador: "NA",
    fechaEvaluacionIntermedia: "",
    verificadorContenidos: ""
  },
  'CH-L1178': {
    estadoImplementacion: ['Buen desempeño de ejecución gracias a excelente contraparte (Chile Compras). Es probable que haya cambios con el nuevo gobierno, más aún por las políticas de austeridad. Monitorear indicadores de resultados. Ajustes presupuestarios durante 2025 generaron un replanteamiento parcial de ciertos productos, sin afectar el alcance'],
    productosDestacados: ['Nueva plataforma de Chile Compras con sistema modular hace más eficientes las compras.'],
    probabilidadObjetivos: [],
    accionesSugeridas: ['Rever producto 2.3 que tiene presupuesto elevado. Actualizar matriz de resultados manteniendo indicadores de línea de base.'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado de 31% para DI Satisfactorio.\nMF prevista en P1.1.2., P1.3.1., P2.1, P2.3., P2.4., P2.5., P2.6. Al IIS, reporta ejecución de MF en P1.1, P1.3, P2.3, P2.5 y P2.6 (No unitarias, por lo tanto hito no cumple hito)\nEn MF$ Pa tenía US$1.52MM, claves P1, P2.3, P2.4, P2.5 y P2.6. En IIS reportan ejecución MF$ por US$1.01MM, @66.4% de la meta Pa del año.\nEstaría en Problema.\n\nCiclo 2026\nDesembolso previsto para un acumulado de @45%, para DI Satisfactorio.\nMF Pa en P1.1, P1.2, P1.3, P2.1, P2.4, P2.5, P2.7.\nEn MF$ Pa de US$2.5MM, requiere ejecución @80%, @US$2.0MM, claves P1.2, P1.3, P2.4 y P2.5\nSi cumple desembolsos, MF y MF$ se mantendría Satisfactorio.",
    fechaEvaluacionIntermedia: "",
    verificadorContenidos: "En VC:\nUna Alerta sobre el modulo de seguimiento a evaluaciones."
  },
  'CO-L1164': {
    estadoImplementacion: ['Pudo mejorar a satisfactorio gracias a una buena ejecución de una planificación realista de 2025. Recomendación de abrir la ejecución a 2027 para cubrirnos si hay prórroga/no se llega a ejecutar todo en 2026.'],
    productosDestacados: ['Levantamiento catastral.'],
    probabilidadObjetivos: [],
    accionesSugeridas: [],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado de 66% DI en Satisfactorio.\nEn MF Pa prevista en P1 - P4, P6 - P13, P15 y P16. Al IIS reporta ejecución MF en P1.1, P1.2, P1.3, P1.4, P1.6, P2.1, P2.3, P2.4, P2.5, P2.6, P3.1 y P3.3\nEn MF$ Pa era US$15.6MM, claves P1 y P9. Al IIS reporta ejecución por MF$ US$17.45MM, @111.9% del Pa del año.\nEstá en Satisfactorio\n\nCiclo 2026\nDesembolso previsto para un acumulado de @85%, DI Satisfactorio.\nMF prevista en P1 - P4, P6 - P13, P15 y P16 en Pa.\nEn MF$ Pa tenía US$15.6MM, se requiere al menos @US$12.5MM, claves P1 y P9.\nSi cumple desembolsos, MF y MF$ se mantendría Satisfactorio",
    fechaEvaluacionIntermedia: "2022",
    verificadorContenidos: "En VC:\nHay 5 advertencias por riesgos, productos con campos pendientes, metodología de indicadores de SDO y errores de suma de costos."
  },
  'CO-L1245': {
    estadoImplementacion: ['2025 tuvo una ejecución financiera superior a lo planificado, lo que contribuyó al desempeño satisfactorio. 2026 también tiene una planificación financiera prudente.'],
    productosDestacados: [],
    probabilidadObjetivos: [],
    accionesSugeridas: [],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado de 34% para DI Satisfactorio.\nMF prevista en P1.1.2 - P1.3.1., P2.1, P2.3 - P2.6. Al IIS reporta ejecución MF en P1.1, P1.2, P1.3, P2.2, P2.5 y P2.6 (No unitarias, por lo tanto hito no cumple hito)\nEn MF$ Pa era US$1.52MM, claves P1, P2.3, P2.4, P2.5 y P2.6. Al IIS reporta ejecución MF$ por US$1.01MM, @66.4% de la meta Pa del año.\nEstaría en Problema.\n\nCiclo 2026\nDesembolso previsto para un acumulado de @54%, para DI Satisfactorio.\nMF prevista en P1.1, P1.2, P1.3, P1.5, P2.1, P2.3 y P2.4 en Pa.\nEn MF$ Pa tenía US$12.5MM, se requiere al menos @US$10.0MM, claves P1.2, P1.3, P2.3 y P2.4.\nSi cumple desembolsos, MF y MF$ se mantendría Satisfactorio.",
    fechaEvaluacionIntermedia: "Tentativa segundo semestre 2026",
    verificadorContenidos: "En VC:\nHay 3 Alertas por riesgos y acciones de respuesta activas por 4 o más ciclos."
  },
  'EC-L1230': {
    estadoImplementacion: ['Proyecto en alerta y próximo a cerrar. Se evaluará la probabilidad de generar un producto asociado al desembolso de fin de 2025. Cancelación pendiente de $20.4 millones. Cerrarlo este año'],
    productosDestacados: [],
    probabilidadObjetivos: [],
    accionesSugeridas: ['Contratar el PCR y cerrar ASAP, sabiendo que es improbable que el PCR sea satisfactorio.'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado 72% con DI en Alert.\nMF en P1.1., P1.3, P2.1 y P31 en Pa. Al IIS, reporta ejecución MF en P1.1, P1.3, P2.1 y P3.1(100% de productos previstos en Pa 2025)\nMF$ Pa por US$7.58MM, claves P1.2, P1.3, P1.8, P2.1 y P2.4.\nAl IIS reporta ejecución MF$ por US$1.52MM, @20% ejecución del Pa.\nEstá en Problema.\n\nCiclo 2026:\nDesembolso acumulado 100%, DI Satisfactorio.\nMF en Pa tiene P1.4 - P1.10, P2.2 - P2.6, P3.1, P3.2, P3.3, P3.4, P4.1 y P4.2.\nEn MF$ Pa tiene US$15MM en productos, al menos 80%, @12MM, claves P1.1 - P1.3 y P3.2\nSi cumple desembolsos, MF y MF$ continuaría Satisfactorio - Proyecto en Cierre.",
    fechaEvaluacionIntermedia: "",
    verificadorContenidos: "En VC:\nTiene 3 advertencias por suma de costos, metodología de indicadores de SDO y riesgos activos por 4 o más ciclos."
  },
  'EC-L1251': {
    estadoImplementacion: ['Pendiente devolución final para cerrar. No requiere PCR'],
    productosDestacados: [],
    probabilidadObjetivos: [],
    accionesSugeridas: [],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado de @89% DI en Satisfactorio.\nEn MF Pa prevista en P1 - P4, P6 - P13, P15 y P16. Al IIS reporta ejecución MF en P1.1, P1.2, P1.3, P1.4, P1.6, P2.1, P2.3, P2.4, P2.5, P2.6, P3.1 y P3.3\nEn MF$ Pa era US$15.6MM, claves P1 y P9. Al IIS reporta ejecución por MF$ US$17.45MM, @111.9% del Pa del año.\nEstá en Satisfactorio\n\nCiclo 2026\nProyecto en Cierre.",
    fechaEvaluacionIntermedia: "",
    verificadorContenidos: "En VC:\nTiene 5 advertencias por riesgos activos, productos con campos pendientes y metodología de indicadores."
  },
  'ME-L1309': {
    estadoImplementacion: ['Al gobierno le interesa mucho firmar pero están definiendo ejecutor (hay 2 agencias interesadas, lo cual es muestra de interés). Que pidan prórroga es una buena noticia. Gobierno pidió 6 meses más para la firma. México no quiere firmar hasta tener todo listo para el primer desembolso.'],
    productosDestacados: [],
    probabilidadObjetivos: [],
    accionesSugeridas: [],
    temasCriticosSimulador: "Pendiente de Firma",
    fechaEvaluacionIntermedia: "",
    verificadorContenidos: ""
  },
  'PE-L1231': {
    estadoImplementacion: ['Invierte termina el 31 de mayo; OSCE a fin de año.'],
    productosDestacados: ['Guías actualizadas de preinversión / Capacitación a nivel subnacional / (falta sistema informático de inversión pública) / (buscamos implementar el nuevo sistema de compras)'],
    probabilidadObjetivos: ['Utilizar informes previos para actualizar matrices de productos y resultados, de cara a la preparación del PCR en 2027.'],
    accionesSugeridas: ['Posible extensión del préstamo Invierte hasta fin de año. No dar CO hasta asegurar completitud de la MR.'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado 48% con DI Satisfactorio.\nMF en P1.1.2., P1.3.1., P2.1, P2.3., P2.4., P2.5., P2.6. Al IIS reporta ejecución de MF en P1.1, P1.2, P1.3, P2.3, P2.5 y P2.6 (No unitarias, por lo tanto hito no cumple hito)\nMF$ Pa por US$12.44MM, claves P1, P2.3, P2.4, P2.5 y P2.6. Al IIS reporta ejecución MF$ por US$6.52MM, @52.4% del Pa del año.\nEstá en Satisfactorio\n\nCiclo 2026:\nDesembolso acumulado 100%, DI Satisfactorio.\nMF en Pa tiene P1.4 - P1.10, P2.2 - P2.6, P3.1, P3.2, P3.3, P3.4, P4.1 y P4.2.\nEn MF$ Pa tiene US$15MM en productos, al menos 80%, @12MM, claves P1.1 - P1.3 y P3.2\nSi cumple desembolsos, MF y MF$ continuaría Satisfactorio - Proyecto en Cierre.",
    fechaEvaluacionIntermedia: "",
    verificadorContenidos: "En VC:\nUn error por suma de costos y una alerta por riesgos activos por 4 o más ciclos."
  },
  'PE-L1239': {
    estadoImplementacion: ['Cierra en diciembre 2026. Interés de formular nuevo proyecto por parte de la UEP y sobre todo las unidades de negocio.'],
    productosDestacados: ['Sistemas no intrusivos aduaneros / Base tecnológica modernizada (sirve para toda la institución) / Avances incipientes en IA'],
    probabilidadObjetivos: ['Utilizar informes previos para actualizar matrices de productos y resultados, de cara a la preparación del PCR en 2027.'],
    accionesSugeridas: ['No dar CO hasta asegurar completitud de la MR.'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado 65% con DI Satisfactorio.\nMF en P1.1.2., P1.3.1., P2.1, P2.3., P2.4., P2.5., P2.6. Al IIS reporta ejecución de MF en P1.1, P1.2, P1.3, P2.3, P2.5 y P2.6 (No unitarias, por lo tanto hito no cumple hito)\nMF$ Pa por US$12.44MM, claves P1, P2.3, P2.4, P2.5 y P2.6. Al IIS reporta ejecución MF$ por US$6.52MM, @52.4% del Pa del año.\nEstá en Satisfactorio\n\nCiclo 2026:\nDesembolso acumulado 100%, DI Satisfactorio.\nMF en Pa tiene P1.4 - P1.10, P2.2 - P2.6, P3.1, P3.2, P3.3, P3.4, P4.1 y P4.2.\nEn MF$ Pa tiene US$15MM en productos, al menos 80%, @12MM, claves P1.1 - P1.3 y P3.2\nSi cumple desembolsos, MF y MF$ continuaría Satisfactorio - Proyecto en Cierre.",
    fechaEvaluacionIntermedia: "",
    verificadorContenidos: "En VC:\nUn error por suma de costos y una advertencia de alerta por riesgos activos por 4 o más ciclos."
  },
  'PE-L1266': {
    estadoImplementacion: ['Pudo mejorar a satisfactorio gracias al logro de dos productos físicos a fin de 2025. Aún falta un claro champion político que impulse el programa'],
    productosDestacados: ['Será el propio SIAF una vez implementado'],
    probabilidadObjetivos: ['Dependerá del empuje de un champion que impulse el tramo final de ejecución'],
    accionesSugeridas: ['Buscar dinamizar la estrategia de ejecución de cara al cambio de gobierno.'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado de 75% DI Satisfactorio.\nMF Pa en P1.1, al IIS reportas ejecución de hito de P1.1 cumplida.\nMF$ para 2025 tiene Pa US$5.6MM, se requiere al menos @75-80% para US$4.5MM de ejecución, en especial para P1.3, P2.2, P2.4 y P3.1\nEn IIS 2025, reporta ejecución MF$ por US$6.23MM, @111% de la meta Pa del año.\nEstá en Satisfactorio.\n\nCiclo 2026:\nDesembolso previsto para un acumulado de @88%, para DI Satisfactorio.\nMF Pa en P1.1, P1.2, P1.3, P1.5, P2.1, P2.3 y P2.4.\nEn MF$ Pa tiene US$12.5MM, requiere ejecución @80%, @US$10.0MM, claves P1.2, P1.3, P2.3 y P2.4.\nSi cumple desembolsos, MF y MF$ se mantendría Satisfactorio.",
    fechaEvaluacionIntermedia: "",
    verificadorContenidos: "En VC:\nUna advertencia por error en la suma de costos"
  },
  'PE-L1278': {
    estadoImplementacion: ['A punto de obtener elegibilidad, habiendo cumplido condiciones previas.'],
    productosDestacados: [],
    probabilidadObjetivos: [],
    accionesSugeridas: ['Actualizar el taller de arranque y su correspondiente planificación (start up plan) de cara al ciclo setiembre 2026'],
    temasCriticosSimulador: "Pendiente de completar carga de datos en CVG para simulador.",
    fechaEvaluacionIntermedia: "",
    verificadorContenidos: ""
  },
  'PN-L1161': {
    estadoImplementacion: ['La ejecución empezó a despegar en 2025, en parte gracias a los avances de gestión del proyecto. Hay compromisos por $2 millones adicionales a lo ya ejecutado, y numerosos otros procesos en curso.'],
    productosDestacados: ['Sistema digital de gestión tributaria modernizado. Implementación de FE con uso de IA.'],
    probabilidadObjetivos: ['Monitorear y actualizar matriz de resultados con metas realistas para 2026.'],
    accionesSugeridas: ['Solicitar reclasificación. Reducir un poco la meta de ejecución financiera.'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado de 31% para DI Satisfactorio.\nMF prevista en P1.1.2., P1.3.1., P2.1, P2.3., P2.4., P2.5., P2.6. Al IIS reporta ejecución hito de P1.1, P1.2, P1.3, P2.2, P2.5 y P2.6 (No unitarias, por lo tanto hito no cumple hito)\nEn MF$ Pa tenía US$1.52MM, claves P1, P2.3, P2.4, P2.5 y P2.6. Al IIS reporta ejecución MF$ por US$1.01MM, @66.4% de la meta Pa del año.\nEstá en Satisfactorio.\n\nCiclo 2026\nDesembolso previsto para un acumulado de @54%, para DI Satisfactorio.\nMF prevista en P1.1, P1.2, P1.3, P1.5, P2.1, P2.3 y P2.4 en Pa.\nEn MF$ Pa tiene US$12.5MM, requiere ejecución @80%, @US$10.0MM, claves P1.2, P1.3, P2.3 y P2.4.\nSi cumple desembolsos, MF y MF$ se mantendría Satisfactorio.",
    fechaEvaluacionIntermedia: "Segundo semestre 2025",
    verificadorContenidos: "En VC:\nUna advertencia de alerta por riesgos activos por 4 o más ciclos."
  },
  'PN-L1172': {
    estadoImplementacion: ['Error de comenzar la ejecución con un piloto, que hizo perder tiempo inicialmente. Ahora mediante una firma consultora se está avanzando en la ejecución. La Vice de Economía es la nueva champion que está apoyando, mediante el coordinador Luis Stoute.'],
    productosDestacados: ['Data lake house: información interoperable de 9 entidades. Laboratorio de científicos de datos que harán análisis para hacer data based policy'],
    probabilidadObjetivos: [],
    accionesSugeridas: ['Abrir la ejecución para 2027 de manera de pasar metas físicas y financieras a dicho año. Monitorear compromisos para autorizar, eventualmente, la primera prórroga en agosto de 2026; y eventualmente considerar si el proyecto va a poder ejecutar más allá de los US$6 millones requeridos para no hacer PCR.'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado de @24% DI Satisfactorio.\nMF Pa prevista en P1 - P4, P6 - P13, P15 y P16. Al IIS reporta ejecución MF en P1.1, P1.2, P1.3, P1.4, P1.6, P2.1, P2.3, P2.4, P2.5, P2.6, P3.1 y P3.3\nEn MF$ Pa US$1.52MM, claves P1 y P9. Al IIS reporta ejecución MF$ por US$1.01MM, @66.4% de la meta Pa del año.\nEstá en Satisfactorio.\n\nCiclo 2026\nDesembolso previsto para un acumulado de @45%, para DI Satisfactorio.\nMF Pa en P2.2.\nEn MF$ Pa tiene US$9.6MM, requiere @80%, unos US$7.7MM de ejecución, en especial en P1.1, P1.3, P2.3 - P2.6, P3.4, P3.6.\nSi cumple desembolsos y MF$, estaría en Satisfactorio.",
    fechaEvaluacionIntermedia: "Segundo semestre 2026",
    verificadorContenidos: "En VC:\nLimpio, no tiene ninguna advertencia."
  },
  'PR-L1150': {
    estadoImplementacion: ['Avances con administración tributaria, compras y SIARE. Falta avanzar con el SIARE Municipal.'],
    productosDestacados: [],
    probabilidadObjetivos: ['Actualizar la MR durante el año.'],
    accionesSugeridas: ['Pasar los productos de 2026 a 2027.'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado de @24% para DI Satisfactorio, al IS reporta desembolso acumulado @23% para DI Alerta.\nTenía MF Pa prevista en P1 - P4, P6 - P13, P15 y P16. Al IIS reporta ejecución MF en P1.1, P1.2, P1.3, P1.4, P1.6, P2.1, P2.3, P2.4, P2.5, P2.6, P3.1 y P3.3\nEn MF$ Pa US$1.52MM, claves P1 y P9. Al IIS reporta ejecución MF$ por US$1.01MM, @66.4% de la meta Pa del año.\nEstá en Satisfactorio.\n\nCiclo 2026\nDesembolso previsto para un acumulado de @45% para DI Satisfactorio.\nMF prevista en P1 - P4, P6 - P13, P15 y P16 en Pa.\nEn MF$ Pa tenía US$15.6MM, se requiere al menos @US$12.5MM, claves P1 y P9.\nSi cumple desembolsos, MF y MF$ se mantendría Satisfactorio.",
    fechaEvaluacionIntermedia: "",
    verificadorContenidos: "En VC:\nUna alerta por acción de respuesta a riesgos activa por 4 o más ciclos."
  },
  'SU-L1060': {
    estadoImplementacion: ['Proyecto pudo mantenerse en satisfactorio pero gracias a una estrategia conservadora de planificación de 2025.'],
    productosDestacados: ['Implementación de la semi-autónoma / Sistema de inversión pública / SIAF actualizado'],
    probabilidadObjetivos: [],
    accionesSugeridas: ['Recortar un poco la planificación 2026.'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado de @24% para DI Satisfactorio, al IS reporta desembolso acumulado @23% para DI Alerta.\nTenía MF Pa prevista en P1 - P4, P6 - P13, P15 y P16. Al IIS reporta ejecución MF en P1.1, P1.2, P1.3, P1.4, P1.6, P2.1, P2.3, P2.4, P2.5, P2.6, P3.1 y P3.3\nEn MF$ Pa US$1.52MM, claves P1 y P9. Al IIS reporta ejecución MF$ por US$1.01MM, @66.4% de la meta Pa del año.\nEstá en Satisfactorio.\n\nCiclo 2026\nDesembolso previsto para un acumulado de @45% para DI Satisfactorio.\nMF prevista en P1 - P4, P6 - P13, P15 y P16 en Pa.\nEn MF$ Pa tenía US$15.6MM, se requiere al menos @US$12.5MM, claves P1 y P9.\nSi cumple desembolsos, MF y MF$ se mantendría Satisfactorio.",
    fechaEvaluacionIntermedia: "Se tratará de hacer este año",
    verificadorContenidos: "En VC:\nHay 3 alertas por riesgos activos por 4 o más ciclos."
  },
  'UR-L1111': {
    estadoImplementacion: ['Comenzando PCR. Cierre esperado junio 2026.'],
    productosDestacados: ['SIIF, Ampliacion Bases Normativas Departamentales Digitales (BNDD) y de la unificacion del Registro Único Nacional de Alimentos, Empresas y Vehículos (RUNAEV), que incluye la inscripción, el registro y la habilitación de alimentos y de empresas y vehículos vinculados a la producción y comercialización de alimentos. Además, diversas iniciativas de renovacion urbana y obras de infraestructra (Fondo Concursables) que son consideradas las principales intervenciones realizadas por los gobiernos departamentales en UY.'],
    probabilidadObjetivos: [],
    accionesSugeridas: ['Completar PMR con estado de implementación / Lecciones aprendidas'],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso 100%, DI Satisfactorio.\nMF prevista en hito 1.3 de hito de Pa. Al IIS, reporta MF en hitos de P1.3, P1.4, P1.5 y P2.1 cumplidas (100% de productos previstos en Pa 2025)\nMF$ Pa por US$7.58MM, claves P1.2, P1.3, P1.8, P2.1 y P2.4.\nAl IIS reporta ejecución MF$ por @US$5.5MM, @72.5% ejecución del Pa.\nEstá en Satisfactorio.\n\nCiclo 2026:\nNo entra para el desempeño en ciclo 2026.\nProyecto en Cierre.",
    fechaEvaluacionIntermedia: "",
    verificadorContenidos: "En VC:\nTiene 6 advertencias por riesgos, productos con campos vacíos o pendientes y metodología de indicadores."
  },
  'UR-L1193': {
    estadoImplementacion: [],
    productosDestacados: ['GRPs /'],
    probabilidadObjetivos: [],
    accionesSugeridas: [],
    temasCriticosSimulador: "Ciclo 2025:\nDesembolso acumulado de @24% para DI Satisfactorio, al IS reporta desembolso acumulado @23% para DI Alerta.\nTenía MF Pa prevista en P1 - P4, P6 - P13, P15 y P16. Al IIS reporta ejecución MF en P1.1, P1.2, P1.3, P1.4, P1.6, P2.1, P2.3, P2.4, P2.5, P2.6, P3.1 y P3.3\nEn MF$ Pa US$1.52MM, claves P1 y P9. Al IIS reporta ejecución MF$ por US$1.01MM, @66.4% de la meta Pa del año.\nEstá en Satisfactorio.\n\nCiclo 2026\nDesembolso previsto para un acumulado de @45% para DI Satisfactorio.\nMF prevista en P1 - P4, P6 - P13, P15 y P16 en Pa.\nEn MF$ Pa tenía US$15.6MM, se requiere al menos @US$12.5MM, claves P1 y P9.\nSi cumple desembolsos, MF y MF$ se mantendría Satisfactorio.",
    fechaEvaluacionIntermedia: "Segundo semestre 2026",
    verificadorContenidos: "En VC:\nTiene 6 advertencias por riesgos, productos con campos vacíos o pendientes y metodología de indicadores."
  },
  'UR-L1205': {
    estadoImplementacion: [],
    productosDestacados: [],
    probabilidadObjetivos: [],
    accionesSugeridas: [],
    temasCriticosSimulador: "NA. Aprobado pendiente de firma.",
    fechaEvaluacionIntermedia: "",
    verificadorContenidos: ""
  }
};
