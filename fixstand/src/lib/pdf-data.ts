// ─────────────────────────────────────────────
// COLORES por talento
// ─────────────────────────────────────────────
export const TALENT_COLORS: Record<string, string> = {
  estrategia:     '#E63946',
  acompanamiento: '#7B2D8B',
  aplicado:       '#E76F51',
  empatico:       '#F4A261',
  analitico:      '#9B5DE5',
  profundo:       '#2EC4B6',
  imaginacion:    '#4CC9F0',
  gestion:        '#C1121F',
}

// ─────────────────────────────────────────────
// SÍMBOLOS — Modelo Geniotipo (formas)
// ─────────────────────────────────────────────
export const SYMBOLS_GENOTIPO: Record<string, string> = {
  gestion:        '□',
  estrategia:     '△',
  imaginacion:    '⬯',
  profundo:       '◇',
  aplicado:       '▭',
  empatico:       '○',
  analitico:      '⬠',
  acompanamiento: '∞',
}

// ─────────────────────────────────────────────
// SÍMBOLOS — Modelo Neurotalento (letras griegas)
// ─────────────────────────────────────────────
export const SYMBOLS_NEUROTALENTO: Record<string, string> = {
  gestion:        'Α',
  estrategia:     'Δ',
  imaginacion:    'Φ',
  profundo:       'Θ',
  aplicado:       'Μ',
  empatico:       'Ω',
  analitico:      'Π',
  acompanamiento: 'Ψ',
}

// ─────────────────────────────────────────────
// EJES de agrupación
// ─────────────────────────────────────────────
export const EJES = [
  { label: 'ACCIÓN Y RESULTADOS',   keys: ['gestion', 'estrategia'] },
  { label: 'IMAGINACIÓN Y ARTE',    keys: ['imaginacion', 'profundo'] },
  { label: 'DESTREZA Y PROYECCIÓN', keys: ['aplicado', 'empatico'] },
  { label: 'SABER Y CONOCIMIENTO',  keys: ['analitico', 'acompanamiento'] },
]

// ─────────────────────────────────────────────
// SOFT SKILLS por talento
// X = la tiene, sin entrada = no la tiene
// Tabla (foto papel):
//   Creatividad:          estrategia✓ acompanamiento✓ analitico✓ profundo✓ imaginacion✓ gestion✓
//   Comunicación:         acompanamiento✓ empatico✓ imaginacion✓
//   Intelig. emocional:   acompanamiento✓ empatico✓ imaginacion✓
//   Liderazgo:            estrategia✓ acompanamiento✓ empatico✓ imaginacion✓ gestion✓
// ─────────────────────────────────────────────
export const SOFT_SKILLS_GENOTIPO: Record<string, string[]> = {
  estrategia:     ['Creatividad', 'Liderazgo'],
  acompanamiento: ['Creatividad', 'Comunicación', 'Inteligencia emocional', 'Liderazgo'],
  aplicado:       [],
  empatico:       ['Comunicación', 'Inteligencia emocional', 'Liderazgo'],
  analitico:      ['Creatividad'],
  profundo:       ['Creatividad'],
  imaginacion:    ['Creatividad', 'Comunicación', 'Inteligencia emocional', 'Liderazgo'],
  gestion:        ['Creatividad', 'Liderazgo'],
}

// Neurotalento: mismas skills pero con nombres adaptados al modelo
export const SOFT_SKILLS_NEUROTALENTO: Record<string, string[]> = {
  estrategia:     ['Pensamiento estratégico', 'Influencia'],
  acompanamiento: ['Pensamiento creativo', 'Comunicación empática', 'Gestión emocional', 'Liderazgo pedagógico'],
  aplicado:       [],
  empatico:       ['Escucha activa', 'Gestión emocional', 'Influencia positiva'],
  analitico:      ['Pensamiento divergente'],
  profundo:       ['Pensamiento divergente'],
  imaginacion:    ['Pensamiento creativo', 'Comunicación', 'Gestión emocional', 'Liderazgo innovador'],
  gestion:        ['Pensamiento estratégico', 'Influencia'],
}

// ─────────────────────────────────────────────
// NOMBRES de display por talento
// ─────────────────────────────────────────────
export const TALENT_NAMES: Record<string, string> = {
  gestion:        'Control y gestión',
  estrategia:     'Estrategia y comunicación',
  imaginacion:    'Creatividad e inventiva',
  profundo:       'Introspección y mirada interior',
  aplicado:       'Funcionalidad y cooperación',
  empatico:       'Trascendencia y intuición',
  analitico:      'Investigación y ciencia aplicada',
  acompanamiento: 'Acompañamiento y facilitación',
}

// ─────────────────────────────────────────────
// DATOS NEUROCOGNITIVOS por talento
// ─────────────────────────────────────────────
export type TalentData = {
  eje: string
  resumen: string
  detalle: string
  ambitos: string[]
  perfilPuntos: string[]
  rol: string
}

export const NEUROCOGNITIVE_DATA: Record<string, TalentData> = {
  estrategia: {
    eje: 'CREATIVIDAD Y VÍNCULO — ACCIÓN Y RESULTADOS',
    resumen: 'Perfil con facilidad para la estrategia y el arte de la palabra, así como su divulgación. Capacidad para vender, convencer y negociar. Este perfil se ubica en el eje generador, entre los ámbitos de la emoción y la razón, buscando el equilibrio y la creatividad aplicada.',
    detalle: 'Perfil con facilidad por la estrategia y el arte de la palabra y la oratoria. También tienen capacidad para vender, convencer y negociar. Es el talento de las personas que realizan su actividad profesional sustentada en la habilidad comunicativa, la capacidad comercial y negociadora, y la perseverancia para alcanzar los objetivos propuestos. Propio de personas divulgadoras, políticas que trasladan una imagen de éxito de sí mismas.',
    ambitos: ['Gestión empresarial, principalmente comercial', 'Divulgación y comunicación', 'Negociación', 'Conexión con personas'],
    perfilPuntos: ['Dominan la palabra y la persuasión', 'Alta capacidad de negociación', 'Orientados a resultados con creatividad', 'Lideran desde la influencia y el carisma'],
    rol: 'Comercial, divulgación, oratoria, política',
  },
  acompanamiento: {
    eje: 'CREATIVIDAD Y VÍNCULO — SABER Y CONOCIMIENTO',
    resumen: 'Perfil con pasión por el saber y el conocimiento. Suele ser una persona expresiva y comunicativa, con capacidad de escucha y de visión crítica. Este perfil se ubica en el eje generador, relacionado con la conexión humana, el equilibrio entre emoción y razón, y las capacidades creativas aplicadas.',
    detalle: 'Perfil interesado por el saber y el conocimiento. Suele ser personas expresivas y comunicativas, con capacidad de escucha y de visión crítica. Es el talento de las personas que realizan su actividad profesional sustentada en el acompañamiento de otras personas para hacerlas crecer y conseguir lo mejor de sí mismas. Propio de todo tipo de gestores de personas, docentes y formadores, filósofos, psicólogos y personas que realizan diferentes tipos de terapias.',
    ambitos: ['Humanidades', 'Docencia, coaching, RRHH', 'Salud, desarrollo y crecimiento de las personas'],
    perfilPuntos: ['Crean utilizando todo tipo de pensamiento, divergente o disruptivo', 'Dominan la comunicación y la oratoria para convencer y enseñar', 'Son especialistas en inteligencia emocional, empáticos y asertivos', 'Lideran desde el comportamiento y son un ejemplo enriquecedor'],
    rol: 'Docencia, pedagogía, sociología, educación social',
  },
  aplicado: {
    eje: 'ACCIÓN Y RESULTADOS — DESEMPEÑO Y PROYECCIÓN',
    resumen: 'Perfil que demuestra facilidad de adaptación al trabajo rutinario, así como constancia y responsabilidad para cumplir retos y objetivos con una alta capacidad funcional. Este perfil pertenece al eje pragmático, relacionado con la razón, el control y la ejecución práctica.',
    detalle: 'Perfil que demuestra facilidad de adaptación al trabajo rutinario, así como constancia y responsabilidad para cumplir retos y objetivos con una alta capacidad funcional y de proyección hacia el equipo de trabajo. Es el talento de las personas que realizan su actividad profesional siguiendo las instrucciones que reciben de un organismo superior. Cumplen, son responsables y logran los objetivos que les han sido encomendados.',
    ambitos: ['Administración', 'Educación', 'Agrario'],
    perfilPuntos: ['La creatividad no es su característica principal', 'Se comunican de forma clara y sin florituras', 'No son expertos en inteligencia emocional, pero no generan conflicto', 'Lideran desde el hacer, son un modelo y ejemplo de cumplimiento'],
    rol: 'Educación básica, funcionariado, trabajos que impliquen seguridad, repetición, compromiso y responsabilidad',
  },
  empatico: {
    eje: 'PROFUNDIDAD Y SENSIBILIDAD — DESEMPEÑO Y PROYECCIÓN',
    resumen: 'Perfil que prioriza el bienestar de las personas, acompañarlas es una prioridad. Se caracteriza por su intuición y también por su compromiso y altruismo. Capacidad para comprender los sentimientos y resolver conflictos. Este perfil pertenece al eje de vínculo, relacionado con la intuición, la capacidad de relación con los demás y con uno mismo.',
    detalle: 'Perfil que prioriza el bienestar de las personas, ayudar es una prioridad. Se caracterizan por su intuición y también por su compromiso y altruismo. Capacidad para comprender los sentimientos y resolver conflictos. Es el talento de las personas que realizan su actividad profesional proyectada en la entrega, y la ayuda incondicional a los demás.',
    ambitos: ['Relacionados con las personas y la entrega personal y profesional'],
    perfilPuntos: ['Alta empatía y sensibilidad hacia los demás', 'Comprenden y gestionan los sentimientos ajenos', 'Compromiso altruista en su entorno profesional', 'Resuelven conflictos desde la escucha y el vínculo'],
    rol: 'Salud, servicios sociales, trabajo humanitario, cuidados',
  },
  analitico: {
    eje: 'ACCIÓN Y RESULTADOS — SABER Y CONOCIMIENTO',
    resumen: 'Perfil que muestra interés por la investigación y pasión por el descubrimiento. Es habitual que genere ideas innovadoras. Les atrae el mundo de la ciencia y la adquisición de conocimientos. Este perfil pertenece al eje pragmático, relacionado con la razón, el control y el enfoque mental.',
    detalle: 'Perfil que muestra interés por la investigación y pasión por el descubrimiento. Es habitual que generen ideas innovadoras. Les atrae el mundo de la ciencia por su curiosidad intelectual aplicada a todos los ámbitos profesionales. Es el talento de las personas que realizan su actividad profesional sustentada en altos conocimientos, la aplicación de lo que se sabe y la búsqueda de lo que se quiere saber.',
    ambitos: ['Investigación científica', 'La salud: humana, animal, de la naturaleza', 'Ciencias aplicadas', 'Tecnología y diseño del entorno'],
    perfilPuntos: ['Pensamiento analítico y metódico', 'Pasión por el conocimiento y la investigación', 'Rigor y precisión en su trabajo', 'Orientados a la resolución de problemas complejos'],
    rol: 'Investigación, ciencias, tecnología, salud',
  },
  profundo: {
    eje: 'PROFUNDIDAD Y SENSIBILIDAD — IMAGINACIÓN Y ARTE',
    resumen: 'Perfil que muestra mucha sensibilidad y profundidad en la forma de percibir el mundo. También destaca por tener una gran intuición. Suelen sentir atracción por temas ocultos o no evidentes y que requieren introspección, investigación o profundidad. Este perfil pertenece al eje de vínculo, relacionado con la intuición y la percepción frente al análisis y la razón.',
    detalle: 'Perfil que muestra sensibilidad y profundidad en la manera de percibir el mundo, tanto personal como profesional. Suelen sentir atracción por temas ocultos o no evidentes y que requieren introspección, intuición, investigación y profundidad: la muerte, acontecimientos traumáticos, la diversidad mental y conductual.',
    ambitos: ['Sanitario', 'Jurídico-social', 'Investigación del fraude, el error, la estafa', 'Artístico del mundo cute-gore, neo-gore, gothic, coming-of-age'],
    perfilPuntos: ['Gran sensibilidad e intuición', 'Atraídos por temas complejos y profundos', 'Capacidad de introspección y reflexión', 'Percepción única del mundo que les rodea'],
    rol: 'Cuidados paliativos, forense, psiquiatría, arte oscuro',
  },
  imaginacion: {
    eje: 'CREATIVIDAD Y VÍNCULO — IMAGINACIÓN Y ARTE',
    resumen: 'Perfil que se caracteriza por su pasión por la creatividad y suele destacar por su gran imaginación e inventiva, aplicada a todos los ámbitos profesionales. Este perfil se ubica en el eje generador, entre los ámbitos de la emoción y la razón, buscando el equilibrio y la creatividad aplicada.',
    detalle: 'Perfil que se caracteriza por su pasión por la creatividad y suelen destacar por su gran imaginación e inventiva, aplicada a todos los ámbitos profesionales. Puede expresarse en las diferentes modalidades de arte, ya sean las más tradicionales, como el cine, el teatro, la pintura o la música, pero también pueden asociarse a todo tipo de ciencias aplicadas como la arquitectura, ingenierías, o incluso del mundo de la salud donde sea necesaria la creatividad para solucionar todo tipo de problemas.',
    ambitos: ['Capacidades artísticas', 'Creatividad aplicada a todos los ámbitos profesionales y personales', 'Arte en todas sus expresiones', 'Deporte de élite'],
    perfilPuntos: ['Gran capacidad creativa e imaginativa', 'Pensamiento divergente y disruptivo', 'Expresividad en múltiples formatos y disciplinas', 'Innovación aplicada a cualquier ámbito'],
    rol: 'Arte, diseño, arquitectura, deporte de élite, innovación',
  },
  gestion: {
    eje: 'ACCIÓN Y RESULTADOS — ACCIÓN Y RESULTADOS',
    resumen: 'Perfil que muestra capacidad de gestión y organización, también, para seguir, proponer y dirigir retos. Pueden ser emprendedores y muestran iniciativas para conseguir sus objetivos. Este perfil pertenece al eje pragmático, relacionado con la razón, el control y el enfoque mental en la forma de funcionar.',
    detalle: 'Perfil que muestra capacidad de control, gestión y organización, también, para seguir, proponer y dirigir retos. Pueden ser emprendedores y muestran iniciativas para conseguir éxitos y resultados. Es el talento de las personas que realizan su actividad profesional sustentada en la capacidad de gestionar recursos de todo tipo y donde el análisis y la razón están por delante de la emoción.',
    ambitos: ['Empresarial', 'Administrativo', 'Financiero', 'Legal', 'Seguridad y protección'],
    perfilPuntos: ['Alta capacidad de organización y gestión', 'Emprendedores con visión clara de objetivos', 'Orientados a resultados con enfoque racional', 'Lideran desde la planificación y el control'],
    rol: 'Dirección empresarial, finanzas, legal, administración',
  },
}
