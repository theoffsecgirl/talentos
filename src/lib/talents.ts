export type TalentItem = {
  id: string;
  text: string;
};

export type Talent = {
  id: number;
  code: string;
  titleSymbolic: string;
  titleGenotype: string;
  quizTitle: string;
  intro: string;
  items: TalentItem[];
  
  // Datos para el informe (basados en neurociencia aplicada)
  reportTitle: string;
  reportSummary: string;
  axis: string; // Eje: Pragmático, Generador, Vínculo
  axisDescription: string;
  fields: string[]; // Campos profesionales
  competencies: string[]; // Competencias personales
  exampleRoles: string[]; // Profesiones
};

export const TALENTS: Talent[] = [
  {
    id: 1,
    code: "T1",
    titleSymbolic: "Delta (Δ) — Estrategia",
    titleGenotype: "Triángulo",
    quizTitle: "Comunicación, influencia y proyección profesional",
    intro: "Me atraen actividades o profesiones en las que…",
    items: [
      { id: "1.1", text: "Me importa especialmente que estén bien remuneradas." },
      { id: "1.2", text: "Puedo expresarme con soltura y hablar en público con seguridad." },
      { id: "1.3", text: "Disfruto convenciendo, negociando, persuadiendo o vendiendo ideas." },
      { id: "1.4", text: "Me motiva liderar equipos para lograr resultados y reconocimiento." },
      { id: "1.5", text: "Me veo trabajando en ámbitos como ventas, marketing, publicidad o gestión de marcas." },
    ],
    reportTitle: "Un talento de la estrategia y la comunicación",
    reportSummary: "Es habitual mostrar facilidad para la estrategia y el arte de la palabra, así como su divulgación. También, capacidad para vender, convencer y negociar.",
    axis: "Generador",
    axisDescription: "El eje del talento de las capacidades generadoras se ubica entre los ámbitos de la emoción y la razón, buscando el equilibrio y la creatividad individual. La forma en que se conectan tiene que ver con la relación de las personas y las capacidades creativas aplicadas.",
    fields: ["Estrategia y venta", "Divulgación y comunicación", "Conexión humana"],
    competencies: [
      "Crean utilizando todo tipo de estrategias para conseguir sus objetivos",
      "Dominan la comunicación, la oratoria y el arte de la palabra",
      "Son especialistas en Inteligencia emocional y dominan las claves",
      "Lideran desde su habilidad comunicativa y generando conexión",
    ],
    exampleRoles: [
      "Todas las del mundo de la venta y la negociación",
      "Marketing. Comunicación Audiovisual. Técnicos en Imagen o Sonido. Director-realizador de medios audiovisuales",
      "Relaciones laborales. Ciencias del trabajo",
      "Política, Derecho, Diplomacia, Divulgación técnica, Periodismo",
    ],
  },
  {
    id: 2,
    code: "T2",
    titleSymbolic: "Pi (Π) — Saber",
    titleGenotype: "Pentágono",
    quizTitle: "Pensamiento lógico, ciencia e investigación",
    intro: "Me atraen actividades o profesiones en las que…",
    items: [
      { id: "2.1", text: "Puedo dedicarme a la ciencia, la investigación o el descubrimiento de cosas nuevas." },
      { id: "2.2", text: "Me gusta comprobar, validar o refutar hipótesis y teorías." },
      { id: "2.3", text: "Prefiero basarme en la razón y el pensamiento lógico más que en la emoción." },
      { id: "2.4", text: "Siento curiosidad por entender el porqué de las cosas que me interesan." },
      { id: "2.5", text: "Disfruto desarrollando y profundizando mis conocimientos intelectuales." },
    ],
    reportTitle: "Un talento analítico y riguroso",
    reportSummary: "Muestran interés por la investigación y pasión por el descubrimiento. Es habitual que genere ideas innovadoras. Les atrae el mundo de la ciencia y la adquisición de conocimientos.",
    axis: "Pragmático",
    axisDescription: "El eje del talento de las capacidades pragmáticas se relaciona con la razón y el control. Predomina el enfoque mental en la forma de funcionar. Destaca la capacidad de las personas de gestionar y organizar los recursos, de dirigir o ser dirigidas. Capacidad analítica y práctica de enfrentarse a los problemas. Importante la adquisición de conocimiento intelectual, el rigor científico, las evidencias, la responsabilidad y el compromiso en la realización de la tarea.",
    fields: ["Investigación Científica", "Sanitaria", "Tecnológica"],
    competencies: [
      "Crean desde una base de conocimiento, estudian y exploran lo imposible",
      "Se comunican con un lenguaje culto y técnico",
      "Conocen la inteligencia emocional, pero no les preocupa su aplicación",
      "Lideran desde el saber, la autoridad científica",
    ],
    exampleRoles: [
      "Todas las profesiones que requieran un buen nivel de conocimientos, curiosidad científica y deseo de saber",
      "Geología. Biología. Astronomía. Química. Ciencias ambientales. Ciencias del Deporte, Física",
      "Medicina. Fisioterapia. Odontología. Dietética. Oftalmología. Medicina especialista cardiología, pediatría, etc.",
      "Ingenierías de Telecomunicación, Aeronáutica, en Electrónica, Ingeniería en informática. T.S. desarrollo aplicaciones informáticas. T.S. en administración de sistemas informáticos. Especialista en Telemática",
    ],
  },
  {
    id: 3,
    code: "T3",
    titleSymbolic: "Psi (Ψ) — Instruir",
    titleGenotype: "Infinito",
    quizTitle: "Acompañamiento, educación y desarrollo personal",
    intro: "Me atraen actividades o profesiones en las que…",
    items: [
      { id: "3.1", text: "Puedo fomentar el aprendizaje, la convivencia y el autoconocimiento." },
      { id: "3.2", text: "Siento una curiosidad constante por aprender y comprender más." },
      { id: "3.3", text: "Me gusta acompañar a otras personas para que desarrollen su mejor versión." },
      { id: "3.4", text: "Destaco por escuchar, comprender y empatizar con los demás." },
      { id: "3.5", text: "Me interesa ayudar al desarrollo emocional de personas y equipos." },
    ],
    reportTitle: "Un talento del acompañamiento",
    reportSummary: "Es frecuente la pasión por el saber y el conocimiento. Suele ser una persona expresiva y comunicativa, con capacidad de escucha y de visión crítica.",
    axis: "Generador",
    axisDescription: "El eje del talento de las capacidades generadoras se ubica entre los ámbitos de la emoción y la razón, buscando el equilibrio y la creatividad individual. La forma en que se conectan tiene que ver con la relación de las personas y las capacidades creativas aplicadas.",
    fields: ["Humanidades", "Docencia, coaching", "Salud de las personas"],
    competencies: [
      "Crean utilizando todo tipo de pensamiento, divergente o disruptivo",
      "Dominan la comunicación y la oratoria para convencer y enseñar",
      "Son especialistas en Inteligencia emocional, empáticos y asertivos",
      "Lideran desde el comportamiento y son un ejemplo enriquecedor",
    ],
    exampleRoles: [
      "Docencia, Pedagogía, Sociología, Educación social",
      "Técnicos en educación de todas las etapas educativas, educación especial. Docencia vocacional",
      "Psicología y técnicos especializados en el acompañamiento de personas para mejorar su bienestar, coach",
      "Área de personas de las organizaciones. Selección, contratación, reclutamiento, planes de carrera, salud corporativa",
    ],
  },
  {
    id: 4,
    code: "T4",
    titleSymbolic: "Alfa (Α) — Control",
    titleGenotype: "Cuadrado",
    quizTitle: "Gestión, liderazgo y responsabilidad",
    intro: "Me atraen actividades o profesiones en las que…",
    items: [
      { id: "4.1", text: "Puedo gestionar y administrar recursos económicos, humanos o técnicos." },
      { id: "4.2", text: "Me encaja que todo tenga una lógica clara y una explicación racional." },
      { id: "4.3", text: "Me motiva alcanzar objetivos, tener éxito y emprender proyectos propios." },
      { id: "4.4", text: "Me veo formando parte de cuerpos de seguridad o estructuras muy organizadas." },
      { id: "4.5", text: "Estoy dispuesto a asumir responsabilidades y liderar equipos o situaciones complejas." },
    ],
    reportTitle: "Un talento de la gestión",
    reportSummary: "Suelen mostrar capacidad de gestión y organización, también, para seguir, proponer y dirigir retos. Pueden ser emprendedores y muestran iniciativas para conseguir sus objetivos.",
    axis: "Pragmático",
    axisDescription: "El eje del talento de las capacidades pragmáticas se relaciona con la razón y el control. Predomina el enfoque mental en la forma de funcionar. Destaca la capacidad de las personas de gestionar y organizar los recursos, de dirigir o ser dirigidas. Capacidad analítica y práctica de enfrentarse a los problemas. Importante la adquisición de conocimiento intelectual, el rigor científico, las evidencias, la responsabilidad y el compromiso en la realización de la tarea.",
    fields: ["Empresarial", "Administrativo", "Financiero", "Seguridad y Protección"],
    competencies: [
      "Crean desde una base analítica y de conocimiento previo, no imaginan",
      "Se comunican de forma directa, breve, van al grano",
      "Conocen la inteligencia emocional, pero la razón va por delante de la emoción",
      "Lideran desde la jerarquía, les cuesta delegar y pueden ser inflexibles",
    ],
    exampleRoles: [
      "Economía. Ciencias Actuariales y Financieras. Abogacía. Administración de recursos y personas",
      "Agentes de la propiedad inmobiliaria. Gestión administrativa",
      "Emprendimiento, iniciativa empresarial. Saben conseguir que los objetivos se cumplan. Solucionan los problemas cuando se presentan",
      "Cuerpos de seguridad del Estado, principalmente con responsabilidades y nivel de mando",
    ],
  },
  {
    id: 5,
    code: "T5",
    titleSymbolic: "Omega (Ω) — Trascender",
    titleGenotype: "Círculo",
    quizTitle: "Vocación social, ayuda y justicia",
    intro: "Me atraen actividades o profesiones en las que…",
    items: [
      { id: "5.1", text: "Siento que ayudo directamente a otras personas." },
      { id: "5.2", text: "Puedo mejorar el bienestar y la calidad de vida de los demás." },
      { id: "5.3", text: "Me interesa contribuir al bien común y a la resolución de conflictos." },
      { id: "5.4", text: "Actúo desde la intuición, el compromiso y el altruismo." },
      { id: "5.5", text: "Me motiva la idea de transformar el mundo y hacerlo más justo y digno." },
    ],
    reportTitle: "Un talento empático y compasivo",
    reportSummary: "Suelen priorizar el bienestar de las personas, acompañarlas es una prioridad. Se caracterizan por su intuición y también por su compromiso y altruismo. Capacidad para comprender los sentimientos y resolver conflictos.",
    axis: "Vínculo",
    axisDescription: "El eje del talento de las capacidades de vínculo está relacionado con la capacidad de la persona para la intuición, la capacidad de relación con los demás y con uno mismo/a. Les interesa la trascendencia, el mundo de lo que no es tan evidente, y sobre todo utilizan la intuición, la prospección, y la percepción frente al análisis y la razón.",
    fields: ["Relacionados con las personas y la entrega personal y profesional"],
    competencies: [
      "Crean visualizando un mundo mejor, más justo y equitativo",
      "Comunican estableciendo enlaces potentes",
      "Son especialistas en Inteligencia emocional, sobre todo intra personal",
      "Lideran siendo un referente, sabiendo escuchar, con el ejemplo",
    ],
    exampleRoles: [
      "Pedagogía. Psicología escolar. Educadores y trabajadores sociales y todo lo que signifique acompañar y ayudar a niños y niñas en su crecimiento y evolución madurativa",
      "Medicina centrada en la persona y su recuperación, especialistas en pediatría, psiquiatría, etc.",
      "Personas especializadas en servicios sociales y salud, entidades sin ánimo de lucro",
      "Entrega personal y profesional de forma vocacional",
    ],
  },
  {
    id: 6,
    code: "T6",
    titleSymbolic: "Fi (Φ) — Creatividad",
    titleGenotype: "Elipse",
    quizTitle: "Creatividad, innovación y expresión",
    intro: "Me atraen actividades o profesiones en las que…",
    items: [
      { id: "6.1", text: "Puedo aplicar mis ideas y creatividad sin demasiadas limitaciones." },
      { id: "6.2", text: "Puedo vivir de una creatividad práctica, innovadora y en constante cambio." },
      { id: "6.3", text: "Expreso mi sensibilidad a través del arte, la imaginación o lo visual." },
      { id: "6.4", text: "Me gusta formar parte de equipos creativos con retos estimulantes." },
      { id: "6.5", text: "Valoro que cada día sea diferente y poco predecible." },
    ],
    reportTitle: "Un talento de la imaginación",
    reportSummary: "Se caracteriza por su pasión por la creatividad y suele destacar por su gran imaginación e inventiva, aplicada a todos los ámbitos profesionales. Capacidades artísticas.",
    axis: "Generador",
    axisDescription: "El eje del talento de las capacidades generadoras se ubica entre los ámbitos de la emoción y la razón, buscando el equilibrio y la creatividad individual. La forma en que se conectan tiene que ver con la relación de las personas y las capacidades creativas aplicadas.",
    fields: ["Creatividad aplicada a todos los ámbitos profesionales y personales", "Arte"],
    competencies: [
      "Crean constantemente en todas las facetas de la vida",
      "Comunican desde el entusiasmo cuando visualizan oportunidades",
      "Viven la emoción pero no siempre son comprendidos en las ideas",
      "Lideran desde el contagio para conseguir nuevos objetivos",
    ],
    exampleRoles: [
      "Creatividad aplicada a la actividad profesional. Arquitectura, ingenierías, venta, política, RRHH, medicina, etc.",
      "Ideas sin límite para innovar y solucionar todo tipo de problemas",
      "Habilidades deportivas y artísticas en todas las expresiones",
    ],
  },
  {
    id: 7,
    code: "T7",
    titleSymbolic: "Theta (Θ) — Introspección",
    titleGenotype: "Rombo",
    quizTitle: "Profundidad, análisis y realidades complejas",
    intro: "Me atraen actividades o profesiones en las que…",
    items: [
      { id: "7.1", text: "Se requiere un pensamiento profundo, analítico y reflexivo." },
      { id: "7.2", text: "Se tratan temas difíciles como el dolor, el trauma, la enfermedad o la muerte." },
      { id: "7.3", text: "Puedo investigar fraudes, engaños o comportamientos ocultos." },
      { id: "7.4", text: "Me atrae explorar lo oculto, el misterio, el crimen o lo no evidente." },
      { id: "7.5", text: "Expreso sensibilidad hacia aquello que no es visible a simple vista." },
    ],
    reportTitle: "Un talento visionario e innovador",
    reportSummary: "Muestran mucha sensibilidad y profundidad en la forma de percibir el mundo. También destacan por tener una gran intuición. Suelen sentir atracción por temas ocultos o no evidentes y que requieren introspección, investigación o profundidad: la muerte, eventos traumáticos, la diversidad mental y conductual.",
    axis: "Vínculo",
    axisDescription: "El eje del talento de las capacidades de vínculo está relacionado con la capacidad de la persona para la intuición, la capacidad de relación con los demás y con uno mismo/a. Les interesa la trascendencia, el mundo de lo que no es tan evidente, y sobre todo utilizan la intuición, la prospección, y la percepción frente al análisis y la razón.",
    fields: ["Sanitario", "Jurídico-Social", "Artístico, clima dark"],
    competencies: [
      "Crean en zonas ocultas, profundas, a veces de difícil comprensión",
      "Su comunicación es especial, necesita un nivel de conocimiento diferente",
      "Viven las emociones de una forma diferente y no son muy sociables",
      "Lideran desde la generación de estilos que cautivan a seguidores",
    ],
    exampleRoles: [
      "Todos los ámbitos profesionales donde sea necesaria una sensibilidad especial para detectar lo que no es evidente, requiere investigar, intuir, descubrir",
      "Salud en Psiquiatría, Psicología, Oncología, Forense, y técnicos especializados en el mundo de la muerte o el trauma",
      "Criminología, y técnicos especializados en la investigación y el descubrimiento de lo oculto",
      "Investigación en el mundo de la empresa, Forensic, actuarial, fraudes, inspecciones, etc.",
    ],
  },
  {
    id: 8,
    code: "T8",
    titleSymbolic: "Meandro (▭) — Hacer",
    titleGenotype: "Rectángulo",
    quizTitle: "Orden, estabilidad y ejecución",
    intro: "Me atraen actividades o profesiones en las que…",
    items: [
      { id: "8.1", text: "Sigo normas, ejecuto planes y llevo las ideas a la práctica." },
      { id: "8.2", text: "Valoro la estabilidad, la previsibilidad y el cumplimiento de responsabilidades." },
      { id: "8.3", text: "Trabajo bien siguiendo instrucciones claras para alcanzar objetivos concretos." },
      { id: "8.4", text: "Me gusta facilitar la vida de otras personas cumpliendo expectativas." },
      { id: "8.5", text: "Destaco por mi constancia, estabilidad y capacidad de servicio." },
    ],
    reportTitle: "Un talento aplicado y cooperador",
    reportSummary: "Suelen demostrar facilidad de adaptación al trabajo rutinario, así como constancia y responsabilidad para cumplir retos y objetivos con una alta capacidad funcional.",
    axis: "Pragmático",
    axisDescription: "El eje del talento de las capacidades pragmáticas se relaciona con la razón y el control. Predomina el enfoque mental en la forma de funcionar. Destaca la capacidad de las personas de gestionar y organizar los recursos, de dirigir o ser dirigidas. Capacidad analítica y práctica de enfrentarse a los problemas. Importante la adquisición de conocimiento intelectual, el rigor científico, las evidencias, la responsabilidad y el compromiso en la realización de la tarea.",
    fields: ["Educación", "Administración", "Agraria", "Hostelería y Turismo", "Seguridad y Vigilancia", "Transporte y mecánica"],
    competencies: [
      "La creatividad no es su característica principal",
      "Se comunican de forma clara y sin florituras",
      "No son expertos en inteligencia emocional, pero no generan conflicto",
      "Lideran desde el hacer, son un modelo y ejemplo de cumplimiento",
    ],
    exampleRoles: [
      "Educación básica, funcionariado, trabajos que impliquen seguridad, repetición, compromiso y responsabilidad",
      "Técnicos en gestión administrativa y comercial. Técnicos en trabajos forestales y conservación del medio ambiente. Mantenimiento de instalaciones y transporte",
      "Técnicos en turismo y restauración. Tripulante de cabina o auxiliar de barco",
      "Fuerzas de seguridad del estado y la vigilancia",
    ],
  },
];

// Información de los ejes
export const AXES_INFO = {
  Pragmático: {
    title: "Eje Pragmático",
    description: "El eje del talento de las capacidades pragmáticas se relaciona con la razón y el control. Predomina el enfoque mental en la forma de funcionar. Destaca la capacidad de las personas de gestionar y organizar los recursos, de dirigir o ser dirigidas. Capacidad analítica y práctica de enfrentarse a los problemas. Importante la adquisición de conocimiento intelectual, el rigor científico, las evidencias, la responsabilidad y el compromiso en la realización de la tarea.",
  },
  Generador: {
    title: "Eje Generador",
    description: "El eje del talento de las capacidades generadoras se ubica entre los ámbitos de la emoción y la razón, buscando el equilibrio y la creatividad individual. La forma en que se conectan tiene que ver con la relación de las personas y las capacidades creativas aplicadas.",
  },
  Vínculo: {
    title: "Eje Vínculo",
    description: "El eje del talento de las capacidades de vínculo está relacionado con la capacidad de la persona para la intuición, la capacidad de relación con los demás y con uno mismo/a. Les interesa la trascendencia, el mundo de lo que no es tan evidente, y sobre todo utilizan la intuición, la prospección, y la percepción frente al análisis y la razón.",
  },
};
