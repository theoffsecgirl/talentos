export type TalentItem = {
  id: string;
  text: string;
};

export type Talent = {
  id: number;
  code: string;

  // 🔒 NO se usa en preguntas (para “otra cosa” después)
  titleSymbolic: string;   // Ej: "Delta (Δ) — Estrategia"
  titleGenotype: string;   // Ej: "Triángulo"

  // ✅ Este es el que sí usa el cuestionario
  quizTitle: string;

  intro: string;
  items: TalentItem[];

  // ✅ Contenido para informe (no se usa en el cuestionario)
  reportTitle?: string; // Título corto para el informe
  reportSummary?: string; // 2-4 líneas
  fields?: string[]; // “Campos profesionales”
  competencies?: string[]; // “Competencias personales”
  exampleRoles?: string[]; // “Profesiones / roles”
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

    reportTitle: "Estrategia y comunicación",
    reportSummary:
      "Perfil orientado a influir, persuadir y proyectar ideas. Suele destacar cuando hay que explicar, negociar o dar visibilidad a proyectos y personas.",
    fields: ["Ventas y negociación", "Marketing y comunicación", "Relaciones institucionales", "Dirección y liderazgo"],
    competencies: [
      "Oratoria y presencia",
      "Pensamiento estratégico",
      "Negociación y persuasión",
      "Capacidad de movilizar a otros",
    ],
    exampleRoles: ["Marketing", "Ventas", "Portavocía", "Gestión de cuentas", "Dirección comercial"],
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

    reportTitle: "Investigación y rigor",
    reportSummary:
      "Preferencia por el análisis, la evidencia y la comprensión profunda. Funcionas bien en entornos donde se valora el método, la precisión y el aprendizaje continuo.",
    fields: ["Investigación científica", "Tecnología", "Salud", "Ingenierías"],
    competencies: ["Curiosidad científica", "Razonamiento lógico", "Rigor y validación", "Aprendizaje profundo"],
    exampleRoles: ["I+D", "Data/Analytics", "Ingeniería", "Investigación clínica", "Laboratorio"],
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

    reportTitle: "Acompañamiento y educación",
    reportSummary:
      "Talento para comprender a las personas, enseñar y guiar procesos de mejora. Sueles aportar escucha, estructura y visión crítica para ayudar a crecer.",
    fields: ["Docencia", "Orientación", "Psicología/Coaching", "Área de personas"],
    competencies: ["Escucha activa", "Empatía", "Comunicación pedagógica", "Desarrollo personal"],
    exampleRoles: ["Docencia", "Tutoría", "Orientación", "RRHH", "Coaching"],
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

    reportTitle: "Gestión y organización",
    reportSummary:
      "Orientación a objetivos, estructura y responsabilidad. Suele destacar en contextos donde hay que ordenar recursos, tomar decisiones y garantizar ejecución.",
    fields: ["Empresa y administración", "Finanzas", "Operaciones", "Seguridad y protección"],
    competencies: ["Organización", "Toma de decisiones", "Liderazgo operativo", "Responsabilidad"],
    exampleRoles: ["Gestión", "Administración", "Operaciones", "Mando intermedio", "Planificación"],
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

    reportTitle: "Vocación social",
    reportSummary:
      "Motivación por ayudar, cuidar y mejorar el bienestar. Sueles priorizar impacto humano, conciliación y resolución de conflictos desde el compromiso.",
    fields: ["Servicios sociales", "Salud centrada en la persona", "Educación social", "Entidades sin ánimo de lucro"],
    competencies: ["Altruismo", "Inteligencia emocional", "Mediación", "Compromiso"],
    exampleRoles: ["Intervención social", "Educación social", "Sanidad", "ONG", "Mediación"],
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

    reportTitle: "Creatividad aplicada",
    reportSummary:
      "Necesidad de crear, imaginar y proponer soluciones originales. Suele brillar cuando hay libertad para explorar, prototipar y mejorar lo existente.",
    fields: ["Diseño", "Producto", "Arte y cultura", "Innovación"],
    competencies: ["Imaginación", "Pensamiento divergente", "Prototipado", "Sensibilidad estética"],
    exampleRoles: ["Diseño", "UX", "Contenido", "Producto", "Creatividad"],
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

    reportTitle: "Profundidad e investigación",
    reportSummary:
      "Sensibilidad para detectar lo no evidente y analizar realidades complejas. Suele encajar en investigación, forense, fraude o temas con carga emocional/ética.",
    fields: ["Forense", "Criminología", "Psicología/Salud mental", "Fraude e inspección"],
    competencies: ["Pensamiento profundo", "Intuición analítica", "Atención al detalle", "Tolerancia a lo complejo"],
    exampleRoles: ["Forense", "Compliance", "Investigación", "Análisis de fraude", "Psicología"],
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

    reportTitle: "Ejecución y estabilidad",
    reportSummary:
      "Fortaleza para sostener rutinas, cumplir procesos y ejecutar con constancia. Aporta fiabilidad, servicio y orden cuando hay que asegurar resultados.",
    fields: ["Administración", "Logística", "Mantenimiento", "Hostelería y turismo", "Transporte"],
    competencies: ["Constancia", "Responsabilidad", "Trabajo metódico", "Orientación al servicio"],
    exampleRoles: ["Operativa", "Backoffice", "Logística", "Mantenimiento", "Servicios"],
  },
];

