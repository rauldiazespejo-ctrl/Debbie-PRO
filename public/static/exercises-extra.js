try {
// ══════════════════════════════════════════════════
// EXPANSIÓN DE BASE DE DATOS DE EJERCICIOS v2
// Mínimo 4 ejercicios por grupo muscular × equipo
// ══════════════════════════════════════════════════
(function() {
  if (typeof EX === 'undefined') return;

  function add(muscle, exercises) {
    if (!EX[muscle]) EX[muscle] = [];
    const existing = EX[muscle].map(e => e.n.toLowerCase());
    let added = 0;
    exercises.forEach(ex => {
      if (!existing.includes(ex.n.toLowerCase())) {
        EX[muscle].push(ex);
        added++;
      }
    });
    return added;
  }

  let total = 0;

  // ═══ PECHO ═══
  total += add('Pecho', [
    {n:'Press banca en Máquina Smith',e:['Máquina Smith','Banco'],d:'principiante'},
    {n:'Press inclinado en Máquina Smith',e:['Máquina Smith','Banco'],d:'intermedio'},
    {n:'Flexiones con banda elástica',e:['Banda elástica'],d:'intermedio'},
    {n:'Press con banda elástica de pie',e:['Banda elástica'],d:'principiante'},
    {n:'Aperturas con banda elástica',e:['Banda elástica'],d:'principiante'},
    {n:'Floor press con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Press alterno con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Push-up con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Bottoms-up press kettlebell',e:['Kettlebell'],d:'avanzado'},
    {n:'Flexiones en TRX',e:['TRX'],d:'intermedio'},
    {n:'Press de pecho en TRX',e:['TRX'],d:'intermedio'},
    {n:'Aperturas en TRX',e:['TRX'],d:'avanzado'},
    {n:'Fly en TRX',e:['TRX'],d:'intermedio'},
    {n:'Press con balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Pase de pecho con balón medicinal',e:['Balón medicinal'],d:'principiante'},
    {n:'Push-up con manos en balón',e:['Balón medicinal'],d:'intermedio'},
    {n:'Lanzamiento frontal balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Press banca con barra EZ',e:['Barra EZ','Banco'],d:'intermedio'},
    {n:'Push-up con pies en step',e:['Step'],d:'intermedio'},
    {n:'Press inclinado en step',e:['Step','Mancuernas'],d:'intermedio'},
    {n:'Flexiones con cuerda (battle rope push)',e:['Cuerda'],d:'avanzado'},
    {n:'Press en polea de pie',e:['Polea'],d:'intermedio'},
    {n:'Crossover en polea media',e:['Polea'],d:'intermedio'},
    {n:'Aperturas en polea baja de pie',e:['Polea'],d:'intermedio'},
    {n:'Press unilateral en polea',e:['Polea'],d:'intermedio'}
  ]);

  // ═══ ESPALDA ═══
  total += add('Espalda', [
    {n:'Remo en Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Peso muerto en Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Encogimientos en Máquina Smith',e:['Máquina Smith'],d:'principiante'},
    {n:'Remo invertido en Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Remo con kettlebell a un brazo',e:['Kettlebell'],d:'intermedio'},
    {n:'Swing con kettlebell (espalda)',e:['Kettlebell'],d:'intermedio'},
    {n:'Remo gorila con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Kettlebell high pull',e:['Kettlebell'],d:'intermedio'},
    {n:'Remo en TRX',e:['TRX'],d:'principiante'},
    {n:'Remo invertido en TRX',e:['TRX'],d:'intermedio'},
    {n:'Face pull en TRX',e:['TRX'],d:'intermedio'},
    {n:'Y-raise en TRX',e:['TRX'],d:'intermedio'},
    {n:'Remo con banda elástica',e:['Banda elástica'],d:'principiante'},
    {n:'Pull-apart con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Face pull con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Lat pulldown con banda',e:['Banda elástica'],d:'intermedio'},
    {n:'Slam con balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Remo con balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Rotación con balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Lanzamiento overhead balón',e:['Balón medicinal'],d:'intermedio'},
    {n:'Remo con barra EZ',e:['Barra EZ'],d:'intermedio'},
    {n:'Pull-over con barra EZ',e:['Barra EZ','Banco'],d:'intermedio'},
    {n:'Jalón en polea con agarre V',e:['Polea'],d:'principiante'},
    {n:'Remo en polea con agarre ancho',e:['Polea'],d:'intermedio'},
    {n:'Pull-over en polea alta',e:['Polea'],d:'intermedio'},
    {n:'Remo unilateral en polea',e:['Polea'],d:'intermedio'},
    {n:'Step-up con peso corporal',e:['Step'],d:'principiante'},
    {n:'Saltos al step con giro',e:['Step'],d:'intermedio'}
  ]);

  // ═══ HOMBROS ═══
  total += add('Hombros', [
    {n:'Press militar en Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Elevación frontal en Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Press militar Máquina Smith sentado',e:['Máquina Smith','Banco'],d:'intermedio'},
    {n:'Remo al mentón Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Press con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Push press con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Windmill con kettlebell',e:['Kettlebell'],d:'avanzado'},
    {n:'Halo con kettlebell',e:['Kettlebell'],d:'principiante'},
    {n:'Elevación lateral con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Y-T-W en TRX',e:['TRX'],d:'intermedio'},
    {n:'Press en TRX',e:['TRX'],d:'intermedio'},
    {n:'Deltoid fly en TRX',e:['TRX'],d:'intermedio'},
    {n:'Face pull en TRX (hombros)',e:['TRX'],d:'intermedio'},
    {n:'Elevación lateral con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Press overhead con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Pull-apart con banda (hombros)',e:['Banda elástica'],d:'principiante'},
    {n:'Elevación frontal con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Slam frontal con balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Press overhead con balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Pase lateral balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Lanzamiento overhead balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Press militar con barra EZ',e:['Barra EZ'],d:'intermedio'},
    {n:'Elevación frontal con barra EZ',e:['Barra EZ'],d:'principiante'},
    {n:'Remo al mentón con barra EZ',e:['Barra EZ'],d:'intermedio'},
    {n:'Elevación frontal en polea',e:['Polea'],d:'intermedio'},
    {n:'Press con cuerda en polea',e:['Polea'],d:'intermedio'},
    {n:'Elevación lateral en step',e:['Step','Mancuernas'],d:'intermedio'},
    {n:'Step-up con press',e:['Step','Mancuernas'],d:'intermedio'}
  ]);

  // ═══ BÍCEPS ═══
  total += add('Bíceps', [
    {n:'Curl en Máquina Smith (drag curl)',e:['Máquina Smith'],d:'intermedio'},
    {n:'Curl con kettlebell',e:['Kettlebell'],d:'principiante'},
    {n:'Curl alterno con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Curl martillo con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Bottoms-up curl kettlebell',e:['Kettlebell'],d:'avanzado'},
    {n:'Curl en TRX',e:['TRX'],d:'intermedio'},
    {n:'Curl supino en TRX',e:['TRX'],d:'intermedio'},
    {n:'Curl isométrico en TRX',e:['TRX'],d:'principiante'},
    {n:'Curl con banda elástica de pie',e:['Banda elástica'],d:'principiante'},
    {n:'Curl martillo con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Curl concentrado con banda',e:['Banda elástica'],d:'intermedio'},
    {n:'Curl alto con banda',e:['Banda elástica'],d:'intermedio'},
    {n:'Curl en polea baja unilateral',e:['Polea'],d:'intermedio'},
    {n:'Curl en polea alta (doble)',e:['Polea'],d:'intermedio'},
    {n:'Curl martillo en polea con cuerda',e:['Polea'],d:'intermedio'},
    {n:'Curl Scott en polea',e:['Polea'],d:'intermedio'},
    {n:'Curl con balón medicinal',e:['Balón medicinal'],d:'principiante'},
    {n:'Curl en step inclinado',e:['Step','Mancuernas'],d:'intermedio'},
    {n:'Curl con Máquina Smith invertido',e:['Máquina Smith'],d:'intermedio'}
  ]);

  // ═══ TRÍCEPS ═══
  total += add('Tríceps', [
    {n:'Press cerrado en Máquina Smith',e:['Máquina Smith','Banco'],d:'intermedio'},
    {n:'Press francés en Máquina Smith',e:['Máquina Smith','Banco'],d:'intermedio'},
    {n:'Extensión tríceps Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Dip en Máquina Smith asistido',e:['Máquina Smith'],d:'principiante'},
    {n:'Extensión de tríceps con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Floor press con kettlebell (tríceps)',e:['Kettlebell'],d:'intermedio'},
    {n:'Press cerrado con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Kickback con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Extensión de tríceps en TRX',e:['TRX'],d:'intermedio'},
    {n:'Fondos en TRX',e:['TRX'],d:'intermedio'},
    {n:'Press de tríceps en TRX',e:['TRX'],d:'intermedio'},
    {n:'Skull crusher en TRX',e:['TRX'],d:'avanzado'},
    {n:'Extensión con banda sobre cabeza',e:['Banda elástica'],d:'principiante'},
    {n:'Kickback con banda elástica',e:['Banda elástica'],d:'principiante'},
    {n:'Press down con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Extensión de tríceps con banda anclada',e:['Banda elástica'],d:'intermedio'},
    {n:'Pase de tríceps con balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Slam de tríceps con balón',e:['Balón medicinal'],d:'intermedio'},
    {n:'Overhead extension balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Press francés con barra EZ cerrado',e:['Barra EZ'],d:'intermedio'},
    {n:'Press down en polea con barra',e:['Polea'],d:'principiante'},
    {n:'Kickback en polea',e:['Polea'],d:'intermedio'},
    {n:'Extensión overhead en polea',e:['Polea'],d:'intermedio'},
    {n:'Fondos en step',e:['Step'],d:'principiante'}
  ]);

  // ═══ ANTEBRAZOS ═══
  total += add('Antebrazos', [
    {n:'Curl de muñeca con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Farmer walk con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Bottoms-up hold kettlebell',e:['Kettlebell'],d:'avanzado'},
    {n:'Curl de muñeca invertido kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Curl de muñeca con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Extensión de muñeca con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Agarre isométrico con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Rotación de muñeca con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Curl de muñeca en polea',e:['Polea'],d:'intermedio'},
    {n:'Extensión de muñeca en polea',e:['Polea'],d:'intermedio'},
    {n:'Curl inverso en polea',e:['Polea'],d:'intermedio'},
    {n:'Pronación/supinación en polea',e:['Polea'],d:'intermedio'},
    {n:'Curl de muñeca con barra EZ',e:['Barra EZ'],d:'principiante'},
    {n:'Curl inverso con barra EZ',e:['Barra EZ'],d:'intermedio'},
    {n:'Reverse curl barra EZ de pie',e:['Barra EZ'],d:'intermedio'},
    {n:'Squeeze balón medicinal',e:['Balón medicinal'],d:'principiante'},
    {n:'Dead hang',e:['Sin equipo'],d:'intermedio'},
    {n:'Towel hang',e:['Sin equipo'],d:'avanzado'},
    {n:'Finger curls con mancuerna',e:['Mancuernas'],d:'principiante'},
    {n:'Wrist roller en TRX',e:['TRX'],d:'intermedio'}
  ]);

  // ═══ ABDOMINALES ═══
  total += add('Abdominales', [
    {n:'Crunch en Máquina Smith (pies)',e:['Máquina Smith'],d:'intermedio'},
    {n:'Turkish get-up (abs)',e:['Kettlebell'],d:'avanzado'},
    {n:'Windmill con kettlebell (abs)',e:['Kettlebell'],d:'avanzado'},
    {n:'Sit-up con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Swing con kettlebell (core)',e:['Kettlebell'],d:'intermedio'},
    {n:'Crunch en TRX',e:['TRX'],d:'intermedio'},
    {n:'Pike en TRX',e:['TRX'],d:'avanzado'},
    {n:'Mountain climbers en TRX',e:['TRX'],d:'intermedio'},
    {n:'Plancha en TRX',e:['TRX'],d:'intermedio'},
    {n:'Pallof press con banda',e:['Banda elástica'],d:'intermedio'},
    {n:'Crunch con banda anclada',e:['Banda elástica'],d:'intermedio'},
    {n:'Anti-rotación con banda',e:['Banda elástica'],d:'intermedio'},
    {n:'Dead bug con banda',e:['Banda elástica'],d:'intermedio'},
    {n:'Slam con balón medicinal (abs)',e:['Balón medicinal'],d:'intermedio'},
    {n:'Russian twist con balón',e:['Balón medicinal'],d:'intermedio'},
    {n:'V-up con balón medicinal',e:['Balón medicinal'],d:'avanzado'},
    {n:'Sit-up con balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Step-up con crunch',e:['Step'],d:'intermedio'},
    {n:'Decline crunch en step',e:['Step'],d:'intermedio'},
    {n:'Mountain climbers en step',e:['Step'],d:'intermedio'},
    {n:'Ab rollout con rueda',e:['Rueda abdominal'],d:'intermedio'},
    {n:'Ab rollout de rodillas',e:['Rueda abdominal'],d:'principiante'},
    {n:'Ab rollout de pie',e:['Rueda abdominal'],d:'avanzado'},
    {n:'Ab rollout lateral',e:['Rueda abdominal'],d:'avanzado'},
    {n:'Crunch en polea alta arrodillado',e:['Polea'],d:'intermedio'},
    {n:'Pallof press en polea',e:['Polea'],d:'intermedio'},
    {n:'Rotación anti en polea',e:['Polea'],d:'intermedio'},
    {n:'Crunch con cuerda en polea',e:['Polea'],d:'intermedio'}
  ]);

  // ═══ OBLICUOS ═══
  total += add('Oblicuos', [
    {n:'Leñador con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Windmill kettlebell (oblicuos)',e:['Kettlebell'],d:'avanzado'},
    {n:'Turkish get-up parcial kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Rotación con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Oblicuo en TRX',e:['TRX'],d:'intermedio'},
    {n:'Rotación en TRX',e:['TRX'],d:'intermedio'},
    {n:'Pike lateral en TRX',e:['TRX'],d:'avanzado'},
    {n:'Crunch oblicuo en TRX',e:['TRX'],d:'intermedio'},
    {n:'Leñador con banda elástica',e:['Banda elástica'],d:'intermedio'},
    {n:'Rotación con banda de pie',e:['Banda elástica'],d:'principiante'},
    {n:'Anti-rotación con banda (oblicuos)',e:['Banda elástica'],d:'intermedio'},
    {n:'Pallof press con banda (oblicuos)',e:['Banda elástica'],d:'intermedio'},
    {n:'Leñador con balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Lanzamiento lateral balón',e:['Balón medicinal'],d:'intermedio'},
    {n:'Slam lateral balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Russian twist con balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Leñador en polea alta',e:['Polea'],d:'intermedio'},
    {n:'Leñador en polea baja',e:['Polea'],d:'intermedio'},
    {n:'Rotación en polea media',e:['Polea'],d:'intermedio'},
    {n:'Anti-rotación en polea',e:['Polea'],d:'intermedio'},
    {n:'Side bend en Máquina Smith',e:['Máquina Smith'],d:'principiante'},
    {n:'Oblicuo en step lateral',e:['Step'],d:'intermedio'},
    {n:'Side bend con barra EZ',e:['Barra EZ'],d:'principiante'},
    {n:'Side bend con barra',e:['Barra'],d:'principiante'}
  ]);

  // ═══ CUÁDRICEPS ═══
  total += add('Cuádriceps', [
    {n:'Sentadilla en Máquina Smith',e:['Máquina Smith'],d:'principiante'},
    {n:'Sentadilla frontal Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Zancadas en Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Sentadilla sumo Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Goblet squat con kettlebell',e:['Kettlebell'],d:'principiante'},
    {n:'Sentadilla con doble kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Zancadas con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Pistol squat con kettlebell',e:['Kettlebell'],d:'avanzado'},
    {n:'Sentadilla TRX asistida',e:['TRX'],d:'principiante'},
    {n:'Sentadilla búlgara en TRX',e:['TRX'],d:'intermedio'},
    {n:'Pistol squat asistido TRX',e:['TRX'],d:'intermedio'},
    {n:'Zancada en TRX',e:['TRX'],d:'intermedio'},
    {n:'Sentadilla con banda en rodillas',e:['Banda elástica'],d:'principiante'},
    {n:'Sentadilla con banda overhead',e:['Banda elástica'],d:'intermedio'},
    {n:'Extensión de pierna con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Zancada con banda',e:['Banda elástica'],d:'intermedio'},
    {n:'Wall ball con balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Sentadilla con balón medicinal',e:['Balón medicinal'],d:'principiante'},
    {n:'Thruster con balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Zancada con balón medicinal overhead',e:['Balón medicinal'],d:'intermedio'},
    {n:'Step-up con mancuerna',e:['Step','Mancuernas'],d:'intermedio'},
    {n:'Box jump al step',e:['Step'],d:'intermedio'},
    {n:'Step-up alterno explosivo',e:['Step'],d:'intermedio'},
    {n:'Sentadilla con barra EZ frontal',e:['Barra EZ'],d:'intermedio'},
    {n:'Sentadilla en polea',e:['Polea'],d:'principiante'},
    {n:'Extensión en polea de pie',e:['Polea'],d:'intermedio'}
  ]);

  // ═══ ISQUIOTIBIALES ═══
  total += add('Isquiotibiales', [
    {n:'Peso muerto rumano Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Buenos días en Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Peso muerto sumo Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Stiff leg deadlift Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Swing con kettlebell (isquios)',e:['Kettlebell'],d:'intermedio'},
    {n:'Peso muerto rumano kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Single leg deadlift kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Kettlebell sumo deadlift',e:['Kettlebell'],d:'principiante'},
    {n:'Curl femoral en TRX',e:['TRX'],d:'intermedio'},
    {n:'Hip raise en TRX',e:['TRX'],d:'intermedio'},
    {n:'Single leg curl en TRX',e:['TRX'],d:'avanzado'},
    {n:'Puente de glúteos en TRX',e:['TRX'],d:'intermedio'},
    {n:'Good morning con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Pull-through con banda',e:['Banda elástica'],d:'intermedio'},
    {n:'Curl femoral con banda sentado',e:['Banda elástica'],d:'principiante'},
    {n:'Peso muerto con banda',e:['Banda elástica'],d:'intermedio'},
    {n:'Curl femoral en polea de pie',e:['Polea'],d:'intermedio'},
    {n:'Pull-through en polea',e:['Polea'],d:'intermedio'},
    {n:'Peso muerto rumano en polea',e:['Polea'],d:'intermedio'},
    {n:'Stiff leg en polea',e:['Polea'],d:'intermedio'},
    {n:'Peso muerto rumano barra EZ',e:['Barra EZ'],d:'intermedio'},
    {n:'Slam isquios balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Step-up isquiotibiales',e:['Step'],d:'intermedio'}
  ]);

  // ═══ GLÚTEOS ═══
  total += add('Glúteos', [
    {n:'Hip thrust en Máquina Smith',e:['Máquina Smith','Banco'],d:'intermedio'},
    {n:'Sentadilla sumo Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Puente de glúteos Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Zancada reversa Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Swing con kettlebell (glúteos)',e:['Kettlebell'],d:'intermedio'},
    {n:'Goblet squat kettlebell (glúteos)',e:['Kettlebell'],d:'principiante'},
    {n:'Sumo deadlift con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Single leg deadlift kettlebell (glúteos)',e:['Kettlebell'],d:'intermedio'},
    {n:'Hip thrust en TRX',e:['TRX'],d:'intermedio'},
    {n:'Single leg hip thrust TRX',e:['TRX'],d:'avanzado'},
    {n:'Sentadilla sumo en TRX',e:['TRX'],d:'intermedio'},
    {n:'Zancada reversa en TRX',e:['TRX'],d:'intermedio'},
    {n:'Puente de glúteos con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Clamshell con banda (glúteos)',e:['Banda elástica'],d:'principiante'},
    {n:'Monster walk con banda (glúteos)',e:['Banda elástica'],d:'intermedio'},
    {n:'Lateral walk con banda',e:['Banda elástica'],d:'intermedio'},
    {n:'Patada de glúteo en polea baja',e:['Polea'],d:'intermedio'},
    {n:'Pull-through en polea (glúteos)',e:['Polea'],d:'intermedio'},
    {n:'Abducción en polea (glúteos)',e:['Polea'],d:'intermedio'},
    {n:'Hip extension en polea',e:['Polea'],d:'intermedio'},
    {n:'Wall ball squat balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Hip thrust con barra EZ',e:['Barra EZ','Banco'],d:'intermedio'},
    {n:'Step-up lateral al step',e:['Step'],d:'intermedio'},
    {n:'Step-up con patada glúteo',e:['Step'],d:'intermedio'}
  ]);

  // ═══ PANTORRILLAS ═══
  total += add('Pantorrillas', [
    {n:'Elevación de talones Máquina Smith',e:['Máquina Smith'],d:'principiante'},
    {n:'Elevación sentado Máquina Smith',e:['Máquina Smith','Banco'],d:'intermedio'},
    {n:'Elevación unilateral Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Calf raise Máquina Smith puntillas',e:['Máquina Smith'],d:'principiante'},
    {n:'Calf raise con kettlebell',e:['Kettlebell'],d:'principiante'},
    {n:'Calf raise unilateral kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Swing alto con kettlebell (pantorrillas)',e:['Kettlebell'],d:'intermedio'},
    {n:'Farmer walk en puntillas kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Calf raise en TRX asistido',e:['TRX'],d:'principiante'},
    {n:'Salto en TRX (pantorrillas)',e:['TRX'],d:'intermedio'},
    {n:'Single leg calf raise TRX',e:['TRX'],d:'intermedio'},
    {n:'Pogo jumps TRX',e:['TRX'],d:'intermedio'},
    {n:'Calf raise con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Dorsiflexión con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Calf raise con banda sentado',e:['Banda elástica'],d:'principiante'},
    {n:'Resistencia plantar con banda',e:['Banda elástica'],d:'intermedio'},
    {n:'Calf raise en polea',e:['Polea'],d:'intermedio'},
    {n:'Donkey calf raise en polea',e:['Polea'],d:'intermedio'},
    {n:'Calf raise en step',e:['Step'],d:'principiante'},
    {n:'Calf raise unilateral en step',e:['Step'],d:'intermedio'},
    {n:'Saltos al step (pantorrillas)',e:['Step'],d:'intermedio'},
    {n:'Drop calf raise en step',e:['Step'],d:'intermedio'},
    {n:'Saltar cuerda puntillas',e:['Cuerda'],d:'principiante'},
    {n:'Doble salto de cuerda',e:['Cuerda'],d:'intermedio'},
    {n:'Calf raise con balón medicinal',e:['Balón medicinal'],d:'principiante'},
    {n:'Calf raise con barra EZ',e:['Barra EZ'],d:'principiante'}
  ]);

  // ═══ TRAPECIO ═══
  total += add('Trapecio', [
    {n:'Encogimientos en Máquina Smith',e:['Máquina Smith'],d:'principiante'},
    {n:'Encogimientos tras espalda Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Remo alto Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Shrug en Máquina Smith con pausa',e:['Máquina Smith'],d:'intermedio'},
    {n:'Shrug con kettlebell',e:['Kettlebell'],d:'principiante'},
    {n:'High pull con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Farmer walk con kettlebell (trapecio)',e:['Kettlebell'],d:'intermedio'},
    {n:'Upright row kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Y-raise en TRX (trapecio)',e:['TRX'],d:'intermedio'},
    {n:'Shrug en TRX',e:['TRX'],d:'intermedio'},
    {n:'Face pull en TRX (trapecio)',e:['TRX'],d:'intermedio'},
    {n:'W-raise en TRX',e:['TRX'],d:'intermedio'},
    {n:'Shrug con banda elástica',e:['Banda elástica'],d:'principiante'},
    {n:'Face pull con banda (trapecio)',e:['Banda elástica'],d:'principiante'},
    {n:'Pull-apart alto con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Remo alto con banda',e:['Banda elástica'],d:'intermedio'},
    {n:'Shrug en polea baja',e:['Polea'],d:'intermedio'},
    {n:'Shrug en polea con cuerda',e:['Polea'],d:'intermedio'},
    {n:'Face pull en polea (trapecio)',e:['Polea'],d:'intermedio'},
    {n:'Remo alto en polea',e:['Polea'],d:'intermedio'},
    {n:'Shrug con barra EZ',e:['Barra EZ'],d:'principiante'},
    {n:'Slam overhead balón medicinal (trapecio)',e:['Balón medicinal'],d:'intermedio'}
  ]);

  // ═══ LUMBARES ═══
  total += add('Lumbares', [
    {n:'Good morning en Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Hiperextensión con peso Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Deadlift parcial Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Rack pull Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Swing con kettlebell (lumbares)',e:['Kettlebell'],d:'intermedio'},
    {n:'Good morning con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Single leg deadlift kettlebell (lumbares)',e:['Kettlebell'],d:'intermedio'},
    {n:'Kettlebell suitcase deadlift',e:['Kettlebell'],d:'intermedio'},
    {n:'Hiperextensión en TRX',e:['TRX'],d:'intermedio'},
    {n:'Superman en TRX',e:['TRX'],d:'intermedio'},
    {n:'Back extension en TRX',e:['TRX'],d:'intermedio'},
    {n:'Reverse plank en TRX',e:['TRX'],d:'intermedio'},
    {n:'Good morning con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Pull-through con banda (lumbares)',e:['Banda elástica'],d:'intermedio'},
    {n:'Deadlift con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Bird dog con banda',e:['Banda elástica'],d:'intermedio'},
    {n:'Hiperextensión con balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Superman con balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Good morning con barra EZ',e:['Barra EZ'],d:'intermedio'},
    {n:'Pull-through en polea (lumbares)',e:['Polea'],d:'intermedio'},
    {n:'Extensión lumbar en polea',e:['Polea'],d:'intermedio'},
    {n:'Back raise en step',e:['Step'],d:'principiante'}
  ]);

  // ═══ ADUCTORES ═══
  total += add('Aductores', [
    {n:'Sentadilla sumo Máquina Smith (aductores)',e:['Máquina Smith'],d:'intermedio'},
    {n:'Zancada lateral Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Aducción en Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Plie squat Máquina Smith',e:['Máquina Smith'],d:'principiante'},
    {n:'Sumo deadlift con kettlebell (aductores)',e:['Kettlebell'],d:'intermedio'},
    {n:'Goblet squat sumo kettlebell',e:['Kettlebell'],d:'principiante'},
    {n:'Cossack squat con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Lateral lunge con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Aducción en TRX',e:['TRX'],d:'intermedio'},
    {n:'Sentadilla sumo en TRX',e:['TRX'],d:'intermedio'},
    {n:'Copenhagen plank en TRX',e:['TRX'],d:'avanzado'},
    {n:'Zancada lateral en TRX',e:['TRX'],d:'intermedio'},
    {n:'Aducción con banda acostado',e:['Banda elástica'],d:'principiante'},
    {n:'Sentadilla sumo con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Aducción de pie con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Lateral lunge con banda',e:['Banda elástica'],d:'intermedio'},
    {n:'Aducción en polea baja de pie',e:['Polea'],d:'intermedio'},
    {n:'Aducción en polea acostado',e:['Polea'],d:'intermedio'},
    {n:'Squeeze balón medicinal (aductores)',e:['Balón medicinal'],d:'principiante'},
    {n:'Side lunge con balón medicinal',e:['Balón medicinal'],d:'intermedio'},
    {n:'Sentadilla sumo barra EZ',e:['Barra EZ'],d:'intermedio'},
    {n:'Step lateral al step (aductores)',e:['Step'],d:'intermedio'}
  ]);

  // ═══ ABDUCTORES ═══
  total += add('Abductores', [
    {n:'Sentadilla Máquina Smith ancha',e:['Máquina Smith'],d:'intermedio'},
    {n:'Abducción lateral Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Zancada lateral Máquina Smith (abductores)',e:['Máquina Smith'],d:'intermedio'},
    {n:'Step lateral Máquina Smith',e:['Máquina Smith'],d:'principiante'},
    {n:'Goblet squat con kettlebell ancho',e:['Kettlebell'],d:'intermedio'},
    {n:'Lateral lunge con kettlebell (abductores)',e:['Kettlebell'],d:'intermedio'},
    {n:'Cossack squat kettlebell (abductores)',e:['Kettlebell'],d:'intermedio'},
    {n:'Single leg deadlift kettlebell (abductores)',e:['Kettlebell'],d:'intermedio'},
    {n:'Abducción en TRX de pie',e:['TRX'],d:'intermedio'},
    {n:'Side plank con abducción en TRX',e:['TRX'],d:'avanzado'},
    {n:'Sentadilla lateral en TRX',e:['TRX'],d:'intermedio'},
    {n:'Curtsy lunge en TRX',e:['TRX'],d:'intermedio'},
    {n:'Fire hydrant con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Standing abduction con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Side lying abduction con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Abducción en polea baja',e:['Polea'],d:'intermedio'},
    {n:'Abducción lateral en polea',e:['Polea'],d:'intermedio'},
    {n:'Side lunge con balón medicinal (abductores)',e:['Balón medicinal'],d:'intermedio'},
    {n:'Lateral step-up al step',e:['Step'],d:'intermedio'},
    {n:'Side step-over step',e:['Step'],d:'principiante'},
    {n:'Abducción con barra EZ overhead',e:['Barra EZ'],d:'intermedio'}
  ]);

  // ═══ CUELLO ═══
  total += add('Cuello', [
    {n:'Flexión de cuello con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Extensión de cuello con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Lateral flexion con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Rotación de cuello con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Neck curl con peso (acostado)',e:['Mancuernas'],d:'intermedio'},
    {n:'Neck extension con peso',e:['Mancuernas'],d:'intermedio'},
    {n:'Isométrico frontal cuello',e:['Sin equipo'],d:'principiante'},
    {n:'Isométrico lateral cuello',e:['Sin equipo'],d:'principiante'},
    {n:'Puente de cuello (wrestling bridge)',e:['Sin equipo'],d:'avanzado'},
    {n:'Shrug con hold isométrico',e:['Mancuernas'],d:'intermedio'},
    {n:'Flexión de cuello en polea',e:['Polea'],d:'intermedio'},
    {n:'Extensión de cuello en polea',e:['Polea'],d:'intermedio'}
  ]);

  // ═══ CARDIO ═══
  total += add('Cardio', [
    {n:'Swing con kettlebell (cardio)',e:['Kettlebell'],d:'intermedio'},
    {n:'Snatch con kettlebell (cardio)',e:['Kettlebell'],d:'avanzado'},
    {n:'Clean and press kettlebell',e:['Kettlebell'],d:'avanzado'},
    {n:'Kettlebell long cycle',e:['Kettlebell'],d:'avanzado'},
    {n:'TRX jump squats',e:['TRX'],d:'intermedio'},
    {n:'TRX burpees',e:['TRX'],d:'avanzado'},
    {n:'TRX mountain climbers (cardio)',e:['TRX'],d:'intermedio'},
    {n:'TRX sprint start',e:['TRX'],d:'intermedio'},
    {n:'Band sprints',e:['Banda elástica'],d:'intermedio'},
    {n:'Band jacks',e:['Banda elástica'],d:'principiante'},
    {n:'Band high knees',e:['Banda elástica'],d:'intermedio'},
    {n:'Band squat jumps',e:['Banda elástica'],d:'intermedio'},
    {n:'Wall ball throws',e:['Balón medicinal'],d:'intermedio'},
    {n:'Slam ball (cardio)',e:['Balón medicinal'],d:'intermedio'},
    {n:'Balón medicinal clean',e:['Balón medicinal'],d:'intermedio'},
    {n:'Balón thruster',e:['Balón medicinal'],d:'intermedio'},
    {n:'Step-up rápido alterno',e:['Step'],d:'intermedio'},
    {n:'Lateral step-overs rápidos',e:['Step'],d:'intermedio'},
    {n:'Step burpees',e:['Step'],d:'avanzado'},
    {n:'Step jumping jacks',e:['Step'],d:'principiante'},
    {n:'Saltar cuerda básico (cardio)',e:['Cuerda'],d:'principiante'},
    {n:'Doble unders',e:['Cuerda'],d:'avanzado'},
    {n:'Crossover con cuerda',e:['Cuerda'],d:'intermedio'},
    {n:'Battle rope slams',e:['Cuerda'],d:'intermedio'},
    {n:'Battle rope waves',e:['Cuerda'],d:'intermedio'},
    {n:'Battle rope circles',e:['Cuerda'],d:'intermedio'}
  ]);

  // ═══ FULL BODY ═══
  total += add('Full Body', [
    {n:'Thruster en Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Squat to press Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Deadlift to row Máquina Smith',e:['Máquina Smith'],d:'intermedio'},
    {n:'Full clean Máquina Smith',e:['Máquina Smith'],d:'avanzado'},
    {n:'Double kettlebell clean and press',e:['Kettlebell'],d:'avanzado'},
    {n:'Kettlebell flow complex',e:['Kettlebell'],d:'avanzado'},
    {n:'Kettlebell goblet thruster',e:['Kettlebell'],d:'intermedio'},
    {n:'TRX atomic push-up',e:['TRX'],d:'avanzado'},
    {n:'TRX burpee to row',e:['TRX'],d:'avanzado'},
    {n:'TRX squat to row',e:['TRX'],d:'intermedio'},
    {n:'TRX pull to press',e:['TRX'],d:'intermedio'},
    {n:'Band thruster',e:['Banda elástica'],d:'intermedio'},
    {n:'Band clean and press',e:['Banda elástica'],d:'intermedio'},
    {n:'Band deadlift to row',e:['Banda elástica'],d:'intermedio'},
    {n:'Band squat to press',e:['Banda elástica'],d:'principiante'},
    {n:'Balón medicinal clean and throw',e:['Balón medicinal'],d:'intermedio'},
    {n:'Balón medicinal squat throw',e:['Balón medicinal'],d:'intermedio'},
    {n:'Balón medicinal slam burpee',e:['Balón medicinal'],d:'avanzado'},
    {n:'Balón medicinal thruster',e:['Balón medicinal'],d:'intermedio'},
    {n:'Step-up to press',e:['Step','Mancuernas'],d:'intermedio'},
    {n:'Step burpee con mancuerna',e:['Step','Mancuernas'],d:'avanzado'},
    {n:'Battle rope squat slams',e:['Cuerda'],d:'intermedio'},
    {n:'Clean and press con barra EZ',e:['Barra EZ'],d:'intermedio'},
    {n:'Thruster con barra EZ',e:['Barra EZ'],d:'intermedio'},
    {n:'Deadlift to upright row barra EZ',e:['Barra EZ'],d:'intermedio'},
    {n:'Sumo deadlift high pull en polea',e:['Polea'],d:'intermedio'},
    {n:'Squat to row en polea',e:['Polea'],d:'intermedio'}
  ]);

  // ═══ ESTIRAMIENTO ═══
  total += add('Estiramiento', [
    {n:'Estiramiento de pecho con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Estiramiento de hombros con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Dislocación de hombros con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Estiramiento de isquios con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Estiramiento de cuádriceps en TRX',e:['TRX'],d:'principiante'},
    {n:'Estiramiento de cadera en TRX',e:['TRX'],d:'principiante'},
    {n:'Estiramiento de espalda en TRX',e:['TRX'],d:'principiante'},
    {n:'Estiramiento de pecho en TRX',e:['TRX'],d:'principiante'},
    {n:'Estiramiento con balón medicinal overhead',e:['Balón medicinal'],d:'principiante'},
    {n:'Rotación torácica con balón',e:['Balón medicinal'],d:'principiante'},
    {n:'Estiramiento de cadera con kettlebell',e:['Kettlebell'],d:'principiante'},
    {n:'Goblet squat hold (estiramiento)',e:['Kettlebell'],d:'principiante'},
    {n:'Calf stretch en step',e:['Step'],d:'principiante'},
    {n:'Hip flexor stretch en step',e:['Step'],d:'principiante'},
    {n:'Step-over stretch',e:['Step'],d:'principiante'},
    {n:'Estiramiento de pantorrilla en step',e:['Step'],d:'principiante'}
  ]);

  // Contar total
  let newTotal = 0;
  for (const m in EX) newTotal += EX[m].length;
  console.log('🏋️ Expansión v2: ' + total + ' ejercicios nuevos agregados. Total: ' + newTotal);
})();
} catch(e) {
  console.warn('⚠️ exercises-extra.js error (no-fatal):', e.message);
}