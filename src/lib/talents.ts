export type TalentItem = {
  id: string;
  text: string;
};

export type Talent = {
  id: number;
  code: string;

  // NO se usa en preguntas (para informe)
  titleSymbolic: string;
  titleGenotype: string;

  // Este es el que usa el cuestionario
  quizTitle: string;

  intro: string;
  items: TalentItem[];

  // Contenido para informe (del PDF adaptado a neurociencia)
  reportTitle?: string;
  reportSummary?: string;
  axis?: string; // Eje neurocognitivo
  group?: string; // Agrupación secundaria
  fields?: string[]; // Campos profesionales
  competencies?: string[]; // Competencias personales
  exampleRoles?: string[]; // Profesiones específicas (sin ámbitos genéricos)
  
  // Nuevos campos para el mapa visual
  wheelCategory?: string; // Categoría principal en el mapa
  wheelLabel?: string; // Label secundario
};

export const TALENTS: Talent[] = [
  {
    id: 1,
    code: "T1",
    titleSymbolic: "Delta (Δ) — Estrategia",
    titleGenotype: "Triángulo",
    quizTitle: "Comunicación y estrategia",
    intro: "Me atraen actividades o profesiones en las que…",
    items: [
      { id: "1.1", text: "Me importa especialmente que estén bien remuneradas." },
      { id: "1.2", text: "Puedo expresarme con soltura y hablar en público con seguridad." },
      { id: "1.3", text: "Disfruto convenciendo, negociando, persuadiendo o vendiendo ideas." },
      { id: "1.4", text: "Me motiva liderar equipos para lograr resultados y reconocimiento." },
      { id: "1.5", text: "Me veo trabajando en ámbitos como ventas, marketing, publicidad o gestión de marcas." },
    ],

    axis: "GENERADOR",
    group: "CREATIVIDAD Y VÍNCULO",
    reportTitle: "Estrategia y comunicación",
    reportSummary:
      "Perfil con facilidad para la estrategia y el arte de la palabra, así como su divulgación. Capacidad para vender, convencer y negociar. Este perfil se ubica en el eje generador, entre los ámbitos de la emoción y la razón, buscando el equilibrio y la creatividad aplicada.",
    wheelCategory: "Resultados",
    wheelLabel: "DELTA (Δ) ESTRATEGIA",
    fields: [
      "Estrategia y venta",
      "Divulgación y comunicación",
      "Conexión humana",
    ],
    competencies: [
      "Crean utilizando todo tipo de estrategias para conseguir sus objetivos",
      "Dominan la comunicación, la oratoria y el arte de la palabra",
      "Son especialistas en inteligencia emocional y dominan las claves",
      "Lideran desde su habilidad comunicativa y generando conexión",
    ],
    exampleRoles: [
      "Ventas y negociación comercial",
      "Marketing digital y comunicación audiovisual",
      "Técnico en imagen y sonido",
      "Director-realizador audiovisual",
      "Relaciones laborales",
      "Política y diplomacia",
      "Periodismo y divulgación",
    ],
  },
  {
    id: 2,
    code: "T2",
    titleSymbolic: "Pi (Π) — Saber",
    titleGenotype: "Pentágono",
    quizTitle: "Investigación y ciencia",
    intro: "Me atraen actividades o profesiones en las que…",
    items: [
      { id: "2.1", text: "Puedo dedicarme a la ciencia, la investigación o el descubrimiento de cosas nuevas." },
      { id: "2.2", text: "Me gusta comprobar, validar o refutar hipótesis y teorías." },
      { id: "2.3", text: "Prefiero basarme en la razón y el pensamiento lógico más que en la emoción." },
      { id: "2.4", text: "Siento curiosidad por entender el porqué de las cosas que me interesan." },
      { id: "2.5", text: "Disfruto desarrollando y profundizando mis conocimientos intelectuales." },
    ],

    axis: "PRAGMÁTICO",
    group: "ACCIÓN Y RESULTADOS",
    reportTitle: "Analítico y riguroso",
    reportSummary:
      "Perfil que muestra interés por la investigación y pasión por el descubrimiento. Es habitual que genere ideas innovadoras. Les atrae el mundo de la ciencia y la adquisición de conocimientos. Este perfil pertenece al eje pragmático, relacionado con la razón, el control y el enfoque mental.",
    wheelCategory: "Ciencia aplicada",
    wheelLabel: "PI (Π) SABER",
    fields: [
      "Investigación científica",
      "Sanitaria",
      "Tecnológica",
    ],
    competencies: [
      "Crean desde una base de conocimiento, estudian y exploran lo imposible",
      "Se comunican con un lenguaje culto y técnico",
      "Conocen la inteligencia emocional, pero no les preocupa su aplicación",
      "Lideran desde el saber, la autoridad científica",
    ],
    exampleRoles: [
      "Geología y ciencias ambientales",
      "Biología y biotecnología",
      "Astronomía y física",
      "Química aplicada",
      "Medicina y especialidades médicas",
      "Fisioterapia y odontología",
      "Ingeniería de telecomunicaciones",
      "Ingeniería aeronáutica",
      "Ingeniería informática",
      "Desarrollo de software",
    ],
  },
  {
    id: 3,
    code: "T3",
    titleSymbolic: "Psi (Ψ) — Instruir",
    titleGenotype: "Infinito",
    quizTitle: "Educación y desarrollo personal",
    intro: "Me atraen actividades o profesiones en las que…",
    items: [
      { id: "3.1", text: "Puedo fomentar el aprendizaje, la convivencia y el autoconocimiento." },
      { id: "3.2", text: "Siento una curiosidad constante por aprender y comprender más." },
      { id: "3.3", text: "Me gusta acompañar a otras personas para que desarrollen su mejor versión." },
      { id: "3.4", text: "Destaco por escuchar, comprender y empatizar con los demás." },
      { id: "3.5", text: "Me interesa ayudar al desarrollo emocional de personas y equipos." },
    ],

    axis: "GENERADOR",
    group: "CREATIVIDAD Y VÍNCULO",
    reportTitle: "Acompañamiento y docencia",
    reportSummary:
      "Perfil con pasión por el saber y el conocimiento. Suele ser una persona expresiva y comunicativa, con capacidad de escucha y de visión crítica. Este perfil se ubica en el eje generador, relacionado con la conexión humana, el equilibrio entre emoción y razón, y las capacidades creativas aplicadas.",
    wheelCategory: "Conocimiento",
    wheelLabel: "PSI (Ψ) INSTRUIR",
    fields: [
      "Humanidades",
      "Docencia, coaching",
      "Salud de las personas",
    ],
    competencies: [
      "Crean utilizando todo tipo de pensamiento, divergente o disruptivo",
      "Dominan la comunicación y la oratoria para convencer y enseñar",
      "Son especialistas en inteligencia emocional, empáticos y asertivos",
      "Lideran desde el comportamiento y son un ejemplo enriquecedor",
    ],
    exampleRoles: [
      "Docencia y pedagogía",
      "Educación social",
      "Sociología aplicada",
      "Educación especial",
      "Psicología clínica",
      "Coaching personal y ejecutivo",
      "Gestión de personas y talento",
      "Selección y desarrollo RRHH",
    ],
  },
  {
    id: 4,
    code: "T4",
    titleSymbolic: "Alfa (Α) — Control",
    titleGenotype: "Cuadrado",
    quizTitle: "Gestión y liderazgo",
    intro: "Me atraen actividades o profesiones en las que…",
    items: [
      { id: "4.1", text: "Puedo gestionar y administrar recursos económicos, humanos o técnicos." },
      { id: "4.2", text: "Me encaja que todo tenga una lógica clara y una explicación racional." },
      { id: "4.3", text: "Me motiva alcanzar objetivos, tener éxito y emprender proyectos propios." },
      { id: "4.4", text: "Me veo formando parte de cuerpos de seguridad o estructuras muy organizadas." },
      { id: "4.5", text: "Estoy dispuesto a asumir responsabilidades y liderar equipos o situaciones complejas." },
    ],

    axis: "PRAGMÁTICO",
    group: "ACCIÓN Y RESULTADOS",
    reportTitle: "Gestión y organización",
    reportSummary:
      "Perfil que muestra capacidad de gestión y organización, también, para seguir, proponer y dirigir retos. Pueden ser emprendedores y muestran iniciativas para conseguir sus objetivos. Este perfil pertenece al eje pragmático, relacionado con la razón, el control y el enfoque mental en la forma de funcionar.",
    wheelCategory: "Acción",
    wheelLabel: "ALFA (Α) CONTROL",
    fields: [
      "Empresarial",
      "Administrativo",
      "Financiero",
      "Seguridad y protección",
    ],
    competencies: [
      "Crean desde una base analítica o de conocimiento previo, no imaginan",
      "Se comunican de forma directa, breve, van al grano",
      "Conocen la inteligencia emocional, pero la razón va por delante de la emoción",
      "Lideran desde la jerarquía, les cuesta delegar y pueden ser inflexibles",
    ],
    exampleRoles: [
      "Economía y finanzas",
      "Ciencias actuariales",
      "Derecho y abogacía",
      "Administración de empresas",
      "Gestión inmobiliaria",
      "Emprendimiento empresarial",
      "Cuerpos de seguridad del Estado",
      "Gestión de equipos",
    ],
  },
  {
    id: 5,
    code: "T5",
    titleSymbolic: "Omega (Ω) — Trascender",
    titleGenotype: "Círculo",
    quizTitle: "Servicio y ayuda social",
    intro: "Me atraen actividades o profesiones en las que…",
    items: [
      { id: "5.1", text: "Siento que ayudo directamente a otras personas." },
      { id: "5.2", text: "Puedo mejorar el bienestar y la calidad de vida de los demás." },
      { id: "5.3", text: "Me interesa contribuir al bien común y a la resolución de conflictos." },
      { id: "5.4", text: "Actúo desde la intuición, el compromiso y el altruismo." },
      { id: "5.5", text: "Me motiva la idea de transformar el mundo y hacerlo más justo y digno." },
    ],

    axis: "VÍNCULO",
    group: "PROFUNDIDAD Y SENSIBILIDAD",
    reportTitle: "Vocación de servicio",
    reportSummary:
      "Perfil que prioriza el bienestar de las personas, acompañarlas es una prioridad. Se caracteriza por su intuición y también por su compromiso y altruismo. Capacidad para comprender los sentimientos y resolver conflictos. Este perfil pertenece al eje de vínculo, relacionado con la intuición, la capacidad de relación con los demás y con uno mismo.",
    wheelCategory: "Entrega",
    wheelLabel: "OMEGA (Ω) TRASCENDER",
    fields: [
      "Relacionados con las personas y la entrega personal y profesional",
    ],
    competencies: [
      "Crean visualizando un mundo mejor, más justo y equitativo",
      "Comunican estableciendo enlaces potentes",
      "Son especialistas en inteligencia emocional, sobre todo intrapersonal",
      "Lideran siendo un referente, sabiendo escuchar, con el ejemplo",
    ],
    exampleRoles: [
      "Pedagogía terapéutica",
      "Psicología escolar",
      "Educación social",
      "Trabajo social",
      "Medicina familiar",
      "Pediatría y psiquiatría",
      "Servicios sociales",
      "ONGs y tercer sector",
    ],
  },
  {
    id: 6,
    code: "T6",
    titleSymbolic: "Fi (Φ) — Creatividad",
    titleGenotype: "Elipse",
    quizTitle: "Creatividad e innovación",
    intro: "Me atraen actividades o profesiones en las que…",
    items: [
      { id: "6.1", text: "Puedo aplicar mis ideas y creatividad sin demasiadas limitaciones." },
      { id: "6.2", text: "Puedo vivir de una creatividad práctica, innovadora y en constante cambio." },
      { id: "6.3", text: "Expreso mi sensibilidad a través del arte, la imaginación o lo visual." },
      { id: "6.4", text: "Me gusta formar parte de equipos creativos con retos estimulantes." },
      { id: "6.5", text: "Valoro que cada día sea diferente y poco predecible." },
    ],

    axis: "GENERADOR",
    group: "CREATIVIDAD Y VÍNCULO",
    reportTitle: "Imaginación y creatividad",
    reportSummary:
      "Perfil que se caracteriza por su pasión por la creatividad y suele destacar por su gran imaginación e inventiva, aplicada a todos los ámbitos profesionales. Este perfil se ubica en el eje generador, entre los ámbitos de la emoción y la razón, buscando el equilibrio y la creatividad aplicada.",
    wheelCategory: "Imaginación",
    wheelLabel: "FI (Φ) CREATIVIDAD",
    fields: [
      "Capacidades artísticas",
      "Creatividad aplicada a todos los ámbitos profesionales y personales",
      "Arte",
    ],
    competencies: [
      "Crean constantemente en todas las facetas de la vida",
      "Comunican desde el entusiasmo cuando visualizan oportunidades",
      "Viven la emoción pero no siempre son comprendidos en las ideas",
      "Lideran desde el contagio para conseguir nuevos objetivos",
    ],
    exampleRoles: [
      "Arquitectura y diseño",
      "Diseño gráfico y UX/UI",
      "Bellas artes y escultura",
      "Fotografía y video",
      "Ilustración digital",
      "Animación 3D",
      "Diseño de moda",
      "Diseño de interiores",
      "Publicidad creativa",
    ],
  },
  {
    id: 7,
    code: "T7",
    titleSymbolic: "Theta (Θ) — Introspección",
    titleGenotype: "Rombo",
    quizTitle: "Análisis profundo y forense",
    intro: "Me atraen actividades o profesiones en las que…",
    items: [
      { id: "7.1", text: "Se requiere un pensamiento profundo, analítico y reflexivo." },
      { id: "7.2", text: "Se tratan temas difíciles como el dolor, el trauma, la enfermedad o la muerte." },
      { id: "7.3", text: "Puedo investigar fraudes, engaños o comportamientos ocultos." },
      { id: "7.4", text: "Me atrae explorar lo oculto, el misterio, el crimen o lo no evidente." },
      { id: "7.5", text: "Expreso sensibilidad hacia aquello que no es visible a simple vista." },
    ],

    axis: "VÍNCULO",
    group: "PROFUNDIDAD Y SENSIBILIDAD",
    reportTitle: "Profundo e introspectivo",
    reportSummary:
      "Perfil que muestra mucha sensibilidad y profundidad en la forma de percibir el mundo. También destaca por tener una gran intuición. Suelen sentir atracción por temas ocultos o no evidentes y que requieren introspección, investigación o profundidad: la muerte, eventos traumáticos, la diversidad mental y conductual. Este perfil pertenece al eje de vínculo, relacionado con la intuición y la percepción frente al análisis y la razón.",
    wheelCategory: "Arte",
    wheelLabel: "THETA (Θ) INTROSPECCIÓN",
    fields: [
      "Sanitario",
      "Jurídico-social",
      "Artístico, clima dark",
    ],
    competencies: [
      "Crean en zonas ocultas, profundas, a veces de difícil comprensión",
      "Su comunicación es especial, necesita un nivel de conocimiento diferente",
      "Viven las emociones de una forma diferente y no son muy sociables",
      "Lideran desde la generación de estilos que cautivan a seguidores",
    ],
    exampleRoles: [
      "Psiquiatría y psicología forense",
      "Oncología médica",
      "Medicina forense",
      "Criminología aplicada",
      "Investigación criminal",
      "Auditoría forense",
      "Inspección de fraudes",
      "Tanatología",
    ],
  },
  {
    id: 8,
    code: "T8",
    titleSymbolic: "Meandro (▭) — Hacer",
    titleGenotype: "Rectángulo",
    quizTitle: "Ejecución y estabilidad",
    intro: "Me atraen actividades o profesiones en las que…",
    items: [
      { id: "8.1", text: "Sigo normas, ejecuto planes y llevo las ideas a la práctica." },
      { id: "8.2", text: "Valoro la estabilidad, la previsibilidad y el cumplimiento de responsabilidades." },
      { id: "8.3", text: "Trabajo bien siguiendo instrucciones claras para alcanzar objetivos concretos." },
      { id: "8.4", text: "Me gusta facilitar la vida de otras personas cumpliendo expectativas." },
      { id: "8.5", text: "Destaco por mi constancia, estabilidad y capacidad de servicio." },
    ],

    axis: "PRAGMÁTICO",
    group: "ACCIÓN Y RESULTADOS",
    reportTitle: "Aplicado y cooperador",
    reportSummary:
      "Perfil que demuestra facilidad de adaptación al trabajo rutinario, así como constancia y responsabilidad para cumplir retos y objetivos con una alta capacidad funcional. Este perfil pertenece al eje pragmático, relacionado con la razón, el control y la ejecución práctica.",
    wheelCategory: "Servicio",
    wheelLabel: "MEANDRO (▭) HACER",
    fields: [
      "Educación",
      "Administración",
      "Agraria",
      "Hostelería y turismo",
      "Seguridad y vigilancia",
      "Transporte y mecánica",
    ],
    competencies: [
      "La creatividad no es su característica principal",
      "Se comunican de forma clara y sin florituras",
      "No son expertos en inteligencia emocional, pero no generan conflicto",
      "Lideran desde el hacer, son un modelo y ejemplo de cumplimiento",
    ],
    exampleRoles: [
      "Docencia de educación básica",
      "Funcionariado público",
      "Gestión administrativa",
      "Técnico forestal",
      "Conservación ambiental",
      "Turismo y hostelería",
      "Auxiliar de vuelo",
      "Mantenimiento industrial",
      "Vigilancia y seguridad privada",
    ],
  },
];

// Configuración de ejes neurocognitivos
export const AXES = {
  PRAGMATICO: {
    name: "Circuito Pragmático",
    shortName: "Acción y resultados",
    description:
      "El eje del talento de las capacidades pragmáticas se relaciona con la razón y el control. Predomina el enfoque mental en la forma de funcionar. Destaca la capacidad de las personas de gestionar y organizar los recursos, de dirigir o ser dirigidas. Capacidad analítica y práctica de enfrentarse a los problemas. Importante la adquisición de conocimiento intelectual, el rigor científico, las evidencias, la responsabilidad y el compromiso en la realización de la tarea.",
    talents: [2, 4, 8],
  },
  GENERADOR: {
    name: "Circuito Generador",
    shortName: "Creatividad y vínculo",
    description:
      "El eje del talento de las capacidades generadoras se ubica entre los ámbitos de la emoción y la razón, buscando el equilibrio y la creatividad individual. La forma en que se conectan tiene que ver con la relación de las personas y las capacidades creativas aplicadas.",
    talents: [1, 3, 6],
  },
  VINCULO: {
    name: "Circuito de Vínculo",
    shortName: "Profundidad y sensibilidad",
    description:
      "El eje del talento de las capacidades de vínculo está relacionado con la capacidad de la persona para la intuición, la capacidad de relación con los demás y con uno mismo. Les interesa la trascendencia, el mundo de lo que no es tan evidente, y sobre todo utilizan la intuición, la prospección, y la percepción frente al análisis y la razón.",
    talents: [5, 7],
  },
};

// Orden del mapa circular según el diagrama (sentido horario desde arriba)
export const WHEEL_ORDER = [4, 1, 6, 7, 5, 8, 3, 2];

// Función helper para obtener talento por ID
export function getTalentById(id: number): Talent | undefined {
  return TALENTS.find(t => t.id === id);
}
