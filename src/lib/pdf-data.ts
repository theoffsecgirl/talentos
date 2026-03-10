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

export const SYMBOLS_GENOTIPO: Record<string, string> = {
  estrategia:     '▷',
  acompanamiento: '∞',
  aplicado:       '▭',
  empatico:       '○',
  analitico:      '⬠',
  profundo:       '□',
  imaginacion:    '◇',
  gestion:        '◆',
}

export const SYMBOLS_NEUROTALENTO: Record<string, string> = {
  estrategia:     'Σ',
  acompanamiento: 'Ψ',
  aplicado:       'M',
  empatico:       'Ω',
  analitico:      'Π',
  profundo:       'Θ',
  imaginacion:    'Φ',
  gestion:        'α',
}

export const EJES = [
  { label: 'ACCIÓN Y RESULTADOS',   keys: ['gestion', 'estrategia'] },
  { label: 'SABER Y CONOCIMIENTO',  keys: ['analitico', 'acompanamiento'] },
  { label: 'IMAGINACIÓN Y ARTE',    keys: ['imaginacion', 'profundo'] },
  { label: 'DESTREZA Y PROYECCIÓN', keys: ['aplicado', 'empatico'] },
]

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

export const TALENT_NAMES: Record<string, string> = {
  estrategia:     'Estrategia y comunicación',
  acompanamiento: 'Acompañamiento y docencia',
  aplicado:       'Aplicado y cooperador',
  empatico:       'Empático y compasivo',
  analitico:      'Analítico y riguroso',
  profundo:       'Profundo e introspectivo',
  imaginacion:    'Imaginación y creatividad',
  gestion:        'Gestión y organización',
}

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
    resumen: 'Perfil con facilidad para la estrategia y el arte de la palabra, así como su divulgación. Capacidad para vender, convencer y negociar.',
    detalle: 'Perfil con facilidad por la estrategia y el arte de la palabra y la oratoria. También tienen capacidad para vender, convencer y negociar. Es el talento de las personas que realizan su actividad profesional sustentada en la habilidad comunicativa, la capacidad comercial y negociadora.',
    ambitos: ['Gestión empresarial, principalmente comercial', 'Divulgación y comunicación', 'Negociación', 'Conexión con personas'],
    perfilPuntos: ['Dominan la palabra y la persuasión', 'Alta capacidad de negociación', 'Orientados a resultados con creatividad', 'Lideran desde la influencia y el carisma'],
    rol: 'Comercial, divulgación, oratoria, política',
  },
  acompanamiento: {
    eje: 'CREATIVIDAD Y VÍNCULO — SABER Y CONOCIMIENTO',
    resumen: 'Perfil con pasión por el saber y el conocimiento. Suele ser una persona expresiva y comunicativa, con capacidad de escucha y de visión crítica.',
    detalle: 'Perfil interesado por el saber y el conocimiento. Suele ser personas expresivas y comunicativas, con capacidad de escucha y de visión crítica. Es el talento de las personas que realizan su actividad profesional sustentada en el acompañamiento de otras personas.',
    ambitos: ['Humanidades', 'Docencia, coaching, RRHH', 'Salud, desarrollo y crecimiento de las personas'],
    perfilPuntos: ['Crean utilizando todo tipo de pensamiento, divergente o disruptivo', 'Dominan la comunicación y la oratoria para convencer y enseñar', 'Son especialistas en inteligencia emocional, empáticos y asertivos', 'Lideran desde el comportamiento y son un ejemplo enriquecedor'],
    rol: 'Docencia, pedagogía, sociología, educación social',
  },
  aplicado: {
    eje: 'ACCIÓN Y RESULTADOS — DESEMPEÑO Y PROYECCIÓN',
    resumen: 'Perfil que demuestra facilidad de adaptación al trabajo rutinario, así como constancia y responsabilidad para cumplir retos y objetivos.',
    detalle: 'Perfil que demuestra facilidad de adaptación al trabajo rutinario, así como constancia y responsabilidad para cumplir retos y objetivos con una alta capacidad funcional. Cumplen, son responsables y logran los objetivos encomendados.',
    ambitos: ['Administración', 'Educación', 'Agrario'],
    perfilPuntos: ['La creatividad no es su característica principal', 'Se comunican de forma clara y sin florituras', 'No son expertos en inteligencia emocional, pero no generan conflicto', 'Lideran desde el hacer, son un modelo y ejemplo de cumplimiento'],
    rol: 'Educación básica, funcionariado, trabajos que impliquen seguridad y responsabilidad',
  },
  empatico: {
    eje: 'PROFUNDIDAD Y SENSIBILIDAD — DESEMPEÑO Y PROYECCIÓN',
    resumen: 'Perfil que prioriza el bienestar de las personas. Se caracteriza por su intuición y también por su compromiso y altruismo.',
    detalle: 'Perfil que prioriza el bienestar de las personas, ayudar es una prioridad. Se caracterizan por su intuición y también por su compromiso y altruismo. Capacidad para comprender los sentimientos y resolver conflictos.',
    ambitos: ['Relacionados con las personas y la entrega personal y profesional'],
    perfilPuntos: ['Alta empatía y sensibilidad hacia los demás', 'Comprenden y gestionan los sentimientos ajenos', 'Compromiso altruista en su entorno profesional', 'Resuelven conflictos desde la escucha y el vínculo'],
    rol: 'Salud, servicios sociales, trabajo humanitario, cuidados',
  },
  analitico: {
    eje: 'ACCIÓN Y RESULTADOS — SABER Y CONOCIMIENTO',
    resumen: 'Perfil que muestra interés por la investigación y pasión por el descubrimiento. Es habitual que genere ideas innovadoras.',
    detalle: 'Perfil que muestra interés por la investigación y pasión por el descubrimiento. Es habitual que generen ideas innovadoras. Les atrae el mundo de la ciencia por su curiosidad intelectual aplicada a todos los ámbitos profesionales.',
    ambitos: ['Investigación científica', 'La salud: humana, animal, de la naturaleza', 'Ciencias aplicadas', 'Tecnología y diseño del entorno'],
    perfilPuntos: ['Pensamiento analítico y metódico', 'Pasión por el conocimiento y la investigación', 'Rigor y precisión en su trabajo', 'Orientados a la resolución de problemas complejos'],
    rol: 'Investigación, ciencias, tecnología, salud',
  },
  profundo: {
    eje: 'PROFUNDIDAD Y SENSIBILIDAD — IMAGINACIÓN Y ARTE',
    resumen: 'Perfil que muestra mucha sensibilidad y profundidad en la forma de percibir el mundo. También destaca por tener una gran intuición.',
    detalle: 'Perfil que muestra sensibilidad y profundidad en la manera de percibir el mundo, tanto personal como profesional. Suelen sentir atracción por temas ocultos o no evidentes que requieren introspección e intuición.',
    ambitos: ['Sanitario', 'Jurídico-social', 'Investigación del fraude, el error, la estafa', 'Artístico del mundo cute-gore, neo-gore, gothic, coming-of-age'],
    perfilPuntos: ['Gran sensibilidad e intuición', 'Atraídos por temas complejos y profundos', 'Capacidad de introspección y reflexión', 'Percepción única del mundo que les rodea'],
    rol: 'Cuidados paliativos, forense, psiquiatría, arte oscuro',
  },
  imaginacion: {
    eje: 'CREATIVIDAD Y VÍNCULO — IMAGINACIÓN Y ARTE',
    resumen: 'Perfil que se caracteriza por su pasión por la creatividad y suele destacar por su gran imaginación e inventiva.',
    detalle: 'Perfil que se caracteriza por su pasión por la creatividad y suelen destacar por su gran imaginación e inventiva, aplicada a todos los ámbitos profesionales. Puede expresarse en las diferentes modalidades de arte.',
    ambitos: ['Capacidades artísticas', 'Creatividad aplicada a todos los ámbitos', 'Arte en todas sus expresiones', 'Deporte de élite'],
    perfilPuntos: ['Gran capacidad creativa e imaginativa', 'Pensamiento divergente y disruptivo', 'Expresividad en múltiples formatos y disciplinas', 'Innovación aplicada a cualquier ámbito'],
    rol: 'Arte, diseño, arquitectura, deporte de élite, innovación',
  },
  gestion: {
    eje: 'ACCIÓN Y RESULTADOS — ACCIÓN Y RESULTADOS',
    resumen: 'Perfil que muestra capacidad de gestión y organización, también para seguir, proponer y dirigir retos.',
    detalle: 'Perfil que muestra capacidad de control, gestión y organización, también, para seguir, proponer y dirigir retos. Pueden ser emprendedores y muestran iniciativas para conseguir éxitos y resultados.',
    ambitos: ['Empresarial', 'Administrativo', 'Financiero', 'Legal', 'Seguridad y protección'],
    perfilPuntos: ['Alta capacidad de organización y gestión', 'Emprendedores con visión clara de objetivos', 'Orientados a resultados con enfoque racional', 'Lideran desde la planificación y el control'],
    rol: 'Dirección empresarial, finanzas, legal, administración',
  },
}
