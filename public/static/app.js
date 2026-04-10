
// === AUTO_UPDATE_SYSTEM v33 ===
const LOCAL_APP_VERSION = '48';

async function checkForUpdates() {
  try {
    const res = await fetch('/version.json?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    const serverVersion = data.version;
    const storedVersion = localStorage.getItem('debbie_app_version') || '0';

    console.log('[UPDATE] Local: v' + storedVersion + ' | Server: v' + serverVersion);

    if (serverVersion !== storedVersion) {
      console.log('[UPDATE] Nueva versión detectada! Actualizando...');

      // Mostrar toast de actualización
      if (typeof toast === 'function') {
        toast('🔄 Actualizando a v' + serverVersion + '...', 3000);
      }

      // Limpiar todos los caches
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        console.log('[UPDATE] Caches limpiados');
      }

      // Notificar al SW
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage('FORCE_UPDATE');
      }

      // Re-registrar SW
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          await reg.unregister();
          console.log('[UPDATE] SW desregistrado');
        }
        await navigator.serviceWorker.register('/sw.js');
        console.log('[UPDATE] SW re-registrado');
      }

      // Guardar versión y recargar
      localStorage.setItem('debbie_app_version', serverVersion);

      setTimeout(() => {
        window.location.reload(true);
      }, 1500);
    } else {
      console.log('[UPDATE] App actualizada ✅');
    }
  } catch(e) {
    console.warn('[UPDATE] Check falló (offline?):', e.message);
  }
}

// Verificar al iniciar
document.addEventListener('DOMContentLoaded', () => {
  // Verificar inmediatamente
  setTimeout(checkForUpdates, 2000);

  // Verificar cada 30 minutos
  setInterval(checkForUpdates, 30 * 60 * 1000);

  // Verificar al volver de segundo plano
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      setTimeout(checkForUpdates, 1000);
    }
  });
});
// === END AUTO_UPDATE_SYSTEM ===

/* ================================================================
   DEBBIE PRO v16 — COMPLETO CON TODAS LAS MEJORAS
   ================================================================ */

// ── Firebase ──
const FB = {
  apiKey: "AIzaSyDnult3HiIsoX3P6DPXKbAI9s7DVPl102k",
  authDomain: "basededatosdebbiepro.firebaseapp.com",
  databaseURL: "https://basededatosdebbiepro-default-rtdb.firebaseio.com",
  projectId: "basededatosdebbiepro",
  storageBucket: "basededatosdebbiepro.firebasestorage.app",
  messagingSenderId: "526002875285",
  appId: "1:526002875285:web:397097329f0d60bea8649c"
};
firebase.initializeApp(FB);
const db = firebase.firestore();
const auth = firebase.auth();

// ── Globales ──
let U = null;
let PROF = null;
let ROLE = 'client';
let CAL_DATE = new Date();
let TIMER_INT = null;
let TIMER_SEC = 0;
let TIMER_RUN = false;
let CURRENT_TAB = 'dash';
let UNSUB_CAL = null;
let UNSUB_RUTS = null;
let VIEWING_CLIENT = null;
let SELECTED_MUSCLES = [];
let SELECTED_EQUIP = [];
let CURRENT_ROUTINE = null;
let NUTRI_DATE = '';
let NUTRI_LOG = [];
let WATER_COUNT = 0;
let TIMER_MODE = 'stopwatch';
let COUNTDOWN_FROM = 60;
let TABATA_WORK = 20;
let TABATA_REST = 10;
let TABATA_ROUNDS = 8;
let TABATA_CURRENT_ROUND = 0;
let TABATA_IS_WORK = true;
let EMOM_MINUTES = 10;
let EMOM_CURRENT_MIN = 0;
let AMRAP_MINUTES = 12;
let AMRAP_REPS = 0;

// ── Utilidades ──
const $ = id => document.getElementById(id);

// ============================================================
//  AUDIO ENGINE v2 — VOLUMEN SUPERIOR A MÚSICA EXTERNA
// ============================================================
const AudioEngine = {
  ctx: null,
  gainNode: null,
  compressor: null,
  masterGain: 3.5,  // 350% del volumen normal

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();

      // Compresor dinámico — maximiza la señal
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-10, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(0, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(20, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.05, this.ctx.currentTime);

      // Ganancia maestra — amplifica por encima de otros sonidos
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.masterGain, this.ctx.currentTime);

      // Cadena: fuente → compresor → ganancia → salida
      this.compressor.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);

      console.log('🔊 AudioEngine v2 iniciado — Ganancia:', this.masterGain);
    } catch(e) {
      console.error('AudioEngine error:', e);
    }
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  setVolume(level) {
    // level: 1 a 5 (1=normal, 5=máximo)
    this.masterGain = level;
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(level, this.ctx.currentTime);
    }
  },

  // Beep potente con frecuencia y duración
  beep(freq = 880, duration = 0.15, type = 'square') {
    this.init();
    this.resume();
    const osc = this.ctx.createOscillator();
    const envGain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    envGain.gain.setValueAtTime(1, this.ctx.currentTime);
    envGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    osc.connect(envGain);
    envGain.connect(this.compressor);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration + 0.05);
  },

  // Beep doble (cambio de fase, transición)
  doubleBeep(freq = 880) {
    this.beep(freq, 0.12);
    setTimeout(() => this.beep(freq, 0.12), 180);
  },

  // Triple beep (fin de ronda, alerta importante)
  tripleBeep(freq = 1100) {
    this.beep(freq, 0.1);
    setTimeout(() => this.beep(freq, 0.1), 160);
    setTimeout(() => this.beep(freq * 1.5, 0.2), 320);
  },

  // Sirena de inicio/fin — imposible ignorar
  siren(duration = 1.5) {
    this.init();
    this.resume();
    const osc = this.ctx.createOscillator();
    const envGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + duration * 0.5);
    osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + duration);
    envGain.gain.setValueAtTime(1, this.ctx.currentTime);
    envGain.gain.setValueAtTime(1, this.ctx.currentTime + duration - 0.1);
    envGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    osc.connect(envGain);
    envGain.connect(this.compressor);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration + 0.05);
  },

  // Countdown tick (últimos 3 segundos)
  countdownTick(number) {
    if (number <= 3 && number > 0) {
      this.beep(1200 + (3 - number) * 200, 0.08, 'square');
    }
  },

  // Sonido de WORK (Tabata)
  workAlert() {
    this.init();
    this.resume();
    const freqs = [800, 1000, 1200];
    freqs.forEach((f, i) => {
      setTimeout(() => this.beep(f, 0.08, 'square'), i * 80);
    });
  },

  // Sonido de REST (Tabata)
  restAlert() {
    this.init();
    this.resume();
    this.beep(400, 0.3, 'sine');
  },

  // Sonido de completar ronda
  roundComplete() {
    this.init();
    this.resume();
    const freqs = [523, 659, 784, 1047];
    freqs.forEach((f, i) => {
      setTimeout(() => this.beep(f, 0.12, 'sine'), i * 120);
    });
  },

  // Sonido de FINALIZAR entrenamiento
  finishFanfare() {
    this.init();
    this.resume();
    const melody = [
      {f: 523, d: 0.15}, {f: 659, d: 0.15}, {f: 784, d: 0.15},
      {f: 1047, d: 0.3}, {f: 784, d: 0.1}, {f: 1047, d: 0.4}
    ];
    let t = 0;
    melody.forEach(n => {
      setTimeout(() => this.beep(n.f, n.d, 'square'), t);
      t += n.d * 1000 + 50;
    });
  },

  // Voz sintetizada — también a volumen alto
  speak(text, lang = 'es-ES') {
    if (!('speechSynthesis' in window)) return;
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang;
    utt.rate = 1.1;
    utt.volume = 1.0;
    utt.pitch = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
  },

  // Motivación con voz
  motivate(msg) {
    this.doubleBeep(660);
    setTimeout(() => this.speak(msg), 300);
  }
};

// Inicializar audio al primer toque del usuario
document.addEventListener('click', () => AudioEngine.init(), { once: true });
document.addEventListener('touchstart', () => AudioEngine.init(), { once: true });

console.log('🔊 AudioEngine v2 cargado — Volumen máximo sobre música');

const fmt = d => d.toISOString().slice(0,10);
const today = () => fmt(new Date());
const toast = (msg, ms=3000) => {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), ms);
};
const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
};

// ── Motivación ──
const MOTIV = [
  "¡Tú puedes! Cada rep cuenta 💪",
  "El dolor es temporal, el orgullo es para siempre",
  "Hoy es tu día, ¡a darlo todo!",
  "No pares hasta sentirte orgulloso",
  "La disciplina vence al talento",
  "¡Un día más cerca de tu meta!",
  "Tu único límite eres tú",
  "Entrena como si no hubiera mañana",
  "El éxito se construye rep a rep",
  "¡Vamos con toda la energía! 🔥"
];

const BADGES = [
  { id:'first', name:'Primera Rutina', icon:'🏅', desc:'Completaste tu primera rutina' },
  { id:'week', name:'Semana Completa', icon:'🔥', desc:'7 días seguidos' },
  { id:'month', name:'Mes Guerrero', icon:'🏆', desc:'30 rutinas en un mes' },
  { id:'early', name:'Madrugador', icon:'🌅', desc:'Entrena antes de las 7am' },
  { id:'heavy', name:'Peso Pesado', icon:'🦾', desc:'50 ejercicios completados' },
  { id:'streak3', name:'Racha x3', icon:'⚡', desc:'3 días seguidos' },
  { id:'nutrition', name:'Nutrición Pro', icon:'🥗', desc:'7 días registrando comidas' },
  { id:'hydro', name:'Hidratación', icon:'💧', desc:'8 vasos de agua en un día' },
  { id:'warrior', name:'Guerrero', icon:'⚔️', desc:'1 victoria en Battle Mode' },
  { id:'gladiator', name:'Gladiador', icon:'🔥', desc:'2 victorias en Battle Mode' },
  { id:'immortal', name:'Inmortal', icon:'💀', desc:'3+ victorias en Battle Mode' }
];

const MUSCLES = [
  'Pecho','Espalda','Hombros','Bíceps','Tríceps','Antebrazos',
  'Abdominales','Oblicuos','Cuádriceps','Isquiotibiales','Glúteos',
  'Pantorrillas','Trapecio','Lumbares','Aductores','Abductores',
  'Cuello','Cardio','Full Body','Estiramiento'
];

const EQUIP = [
  'Sin equipo','Mancuernas','Barra','Barra Olímpica','Kettlebell','Banda elástica',
  'Máquina de cable','Polea','Banco','Barra EZ','TRX',
  'Balón medicinal','Step','Rueda abdominal','Cuerda','Máquina Smith'
];

// ── Base de ejercicios (200+) ──
const EX = {
  'Pecho': [
    {n:'Press banca con barra',e:['Barra','Banco'],d:'intermedio'},
    {n:'Press banca mancuernas',e:['Mancuernas','Banco'],d:'intermedio'},
    {n:'Press inclinado barra',e:['Barra','Banco'],d:'intermedio'},
    {n:'Press inclinado mancuernas',e:['Mancuernas','Banco'],d:'intermedio'},
    {n:'Press declinado barra',e:['Barra','Banco'],d:'intermedio'},
    {n:'Press declinado mancuernas',e:['Mancuernas','Banco'],d:'intermedio'},
    {n:'Aperturas con mancuernas',e:['Mancuernas','Banco'],d:'principiante'},
    {n:'Aperturas inclinadas',e:['Mancuernas','Banco'],d:'intermedio'},
    {n:'Crossover en polea alta',e:['Máquina de cable'],d:'intermedio'},
    {n:'Crossover en polea baja',e:['Máquina de cable'],d:'intermedio'},
    {n:'Flexiones clásicas',e:['Sin equipo'],d:'principiante'},
    {n:'Flexiones diamante',e:['Sin equipo'],d:'intermedio'},
    {n:'Flexiones declinadas',e:['Sin equipo','Banco'],d:'intermedio'},
    {n:'Pullover con mancuerna',e:['Mancuernas','Banco'],d:'intermedio'},
    {n:'Chest press en máquina',e:['Máquina de cable'],d:'principiante'}
  ],
  'Espalda': [
    {n:'Dominadas pronación',e:['Barra'],d:'avanzado'},
    {n:'Dominadas supinación',e:['Barra'],d:'intermedio'},
    {n:'Dominadas neutras',e:['Barra'],d:'intermedio'},
    {n:'Remo con barra',e:['Barra'],d:'intermedio'},
    {n:'Remo con mancuerna',e:['Mancuernas','Banco'],d:'intermedio'},
    {n:'Remo en polea baja',e:['Máquina de cable'],d:'principiante'},
    {n:'Jalón al pecho',e:['Máquina de cable'],d:'principiante'},
    {n:'Jalón tras nuca',e:['Máquina de cable'],d:'intermedio'},
    {n:'Remo en máquina T',e:['Barra'],d:'intermedio'},
    {n:'Peso muerto convencional',e:['Barra'],d:'avanzado'},
    {n:'Peso muerto rumano',e:['Barra'],d:'intermedio'},
    {n:'Pull-over en polea',e:['Máquina de cable'],d:'intermedio'},
    {n:'Remo Pendlay',e:['Barra'],d:'avanzado'},
    {n:'Face pull',e:['Máquina de cable'],d:'principiante'},
    {n:'Superman',e:['Sin equipo'],d:'principiante'}
  ],
  'Hombros': [
    {n:'Press militar con barra',e:['Barra'],d:'intermedio'},
    {n:'Press militar mancuernas',e:['Mancuernas'],d:'intermedio'},
    {n:'Press Arnold',e:['Mancuernas'],d:'intermedio'},
    {n:'Elevaciones laterales',e:['Mancuernas'],d:'principiante'},
    {n:'Elevaciones frontales',e:['Mancuernas'],d:'principiante'},
    {n:'Elevaciones laterales en polea',e:['Máquina de cable'],d:'intermedio'},
    {n:'Pájaros (rear delt fly)',e:['Mancuernas'],d:'intermedio'},
    {n:'Pájaros en polea',e:['Máquina de cable'],d:'intermedio'},
    {n:'Remo al mentón',e:['Barra'],d:'intermedio'},
    {n:'Encogimientos con barra',e:['Barra'],d:'principiante'},
    {n:'Encogimientos con mancuernas',e:['Mancuernas'],d:'principiante'},
    {n:'Press tras nuca',e:['Barra'],d:'avanzado'},
    {n:'Handstand push-up',e:['Sin equipo'],d:'avanzado'},
    {n:'Lateral raise 21s',e:['Mancuernas'],d:'avanzado'}
  ],
  'Bíceps': [
    {n:'Curl con barra recta',e:['Barra'],d:'principiante'},
    {n:'Curl con barra EZ',e:['Barra EZ'],d:'principiante'},
    {n:'Curl alterno con mancuernas',e:['Mancuernas'],d:'principiante'},
    {n:'Curl martillo',e:['Mancuernas'],d:'principiante'},
    {n:'Curl concentrado',e:['Mancuernas','Banco'],d:'intermedio'},
    {n:'Curl en banco Scott',e:['Barra EZ','Banco'],d:'intermedio'},
    {n:'Curl en polea baja',e:['Máquina de cable'],d:'principiante'},
    {n:'Curl araña',e:['Mancuernas','Banco'],d:'intermedio'},
    {n:'Curl 21s',e:['Barra EZ'],d:'avanzado'},
    {n:'Curl inverso',e:['Barra'],d:'intermedio'},
    {n:'Curl con banda elástica',e:['Banda elástica'],d:'principiante'}
  ],
  'Tríceps': [
    {n:'Press francés con barra EZ',e:['Barra EZ','Banco'],d:'intermedio'},
    {n:'Press francés con mancuernas',e:['Mancuernas','Banco'],d:'intermedio'},
    {n:'Extensión de tríceps en polea',e:['Máquina de cable'],d:'principiante'},
    {n:'Extensión con cuerda en polea',e:['Máquina de cable'],d:'principiante'},
    {n:'Patada de tríceps',e:['Mancuernas'],d:'principiante'},
    {n:'Fondos en paralelas',e:['Sin equipo'],d:'intermedio'},
    {n:'Fondos en banco',e:['Banco'],d:'principiante'},
    {n:'Press cerrado con barra',e:['Barra','Banco'],d:'intermedio'},
    {n:'Extensión sobre cabeza mancuerna',e:['Mancuernas'],d:'intermedio'},
    {n:'Extensión sobre cabeza en polea',e:['Máquina de cable'],d:'intermedio'}
  ],
  'Antebrazos': [
    {n:'Curl de muñeca con barra',e:['Barra'],d:'principiante'},
    {n:'Curl de muñeca inverso',e:['Barra'],d:'principiante'},
    {n:'Curl de muñeca con mancuerna',e:['Mancuernas'],d:'principiante'},
    {n:'Farmer walk',e:['Mancuernas'],d:'intermedio'},
    {n:'Wrist roller',e:['Barra'],d:'intermedio'}
  ],
  'Abdominales': [
    {n:'Crunch clásico',e:['Sin equipo'],d:'principiante'},
    {n:'Crunch inverso',e:['Sin equipo'],d:'principiante'},
    {n:'Crunch en polea alta',e:['Máquina de cable'],d:'intermedio'},
    {n:'Plancha frontal',e:['Sin equipo'],d:'principiante'},
    {n:'Plancha lateral',e:['Sin equipo'],d:'principiante'},
    {n:'Elevación de piernas colgado',e:['Barra'],d:'intermedio'},
    {n:'Elevación de piernas en banco',e:['Banco'],d:'principiante'},
    {n:'Ab wheel rollout',e:['Rueda abdominal'],d:'intermedio'},
    {n:'Mountain climbers',e:['Sin equipo'],d:'principiante'},
    {n:'Bicycle crunch',e:['Sin equipo'],d:'principiante'},
    {n:'V-ups',e:['Sin equipo'],d:'intermedio'},
    {n:'Dead bug',e:['Sin equipo'],d:'principiante'},
    {n:'Hollow body hold',e:['Sin equipo'],d:'intermedio'}
  ],
  'Oblicuos': [
    {n:'Russian twist',e:['Sin equipo'],d:'principiante'},
    {n:'Russian twist con peso',e:['Mancuernas'],d:'intermedio'},
    {n:'Leñador en polea',e:['Máquina de cable'],d:'intermedio'},
    {n:'Side bend con mancuerna',e:['Mancuernas'],d:'principiante'},
    {n:'Plancha lateral con rotación',e:['Sin equipo'],d:'intermedio'}
  ],
  'Cuádriceps': [
    {n:'Sentadilla con barra',e:['Barra'],d:'intermedio'},
    {n:'Sentadilla frontal',e:['Barra'],d:'avanzado'},
    {n:'Sentadilla goblet',e:['Mancuernas'],d:'principiante'},
    {n:'Sentadilla búlgara',e:['Mancuernas'],d:'intermedio'},
    {n:'Prensa de piernas',e:['Máquina de cable'],d:'principiante'},
    {n:'Extensión de piernas',e:['Máquina de cable'],d:'principiante'},
    {n:'Zancadas caminando',e:['Mancuernas'],d:'intermedio'},
    {n:'Zancadas estáticas',e:['Mancuernas'],d:'principiante'},
    {n:'Sentadilla hack',e:['Máquina Smith'],d:'intermedio'},
    {n:'Step-up con mancuernas',e:['Mancuernas','Step'],d:'intermedio'},
    {n:'Sissy squat',e:['Sin equipo'],d:'avanzado'},
    {n:'Wall sit',e:['Sin equipo'],d:'principiante'},
    {n:'Pistol squat',e:['Sin equipo'],d:'avanzado'}
  ],
  'Isquiotibiales': [
    {n:'Curl femoral acostado',e:['Máquina de cable'],d:'principiante'},
    {n:'Curl femoral sentado',e:['Máquina de cable'],d:'principiante'},
    {n:'Peso muerto rumano mancuernas',e:['Mancuernas'],d:'intermedio'},
    {n:'Buenos días (good morning)',e:['Barra'],d:'intermedio'},
    {n:'Nordic curl',e:['Sin equipo'],d:'avanzado'},
    {n:'Puente de glúteos',e:['Sin equipo'],d:'principiante'},
    {n:'Hip thrust con barra',e:['Barra','Banco'],d:'intermedio'},
    {n:'Curl femoral con banda',e:['Banda elástica'],d:'principiante'}
  ],
  'Glúteos': [
    {n:'Hip thrust con barra',e:['Barra','Banco'],d:'intermedio'},
    {n:'Puente de glúteos',e:['Sin equipo'],d:'principiante'},
    {n:'Sentadilla sumo',e:['Mancuernas'],d:'intermedio'},
    {n:'Patada de glúteo en polea',e:['Máquina de cable'],d:'principiante'},
    {n:'Kickback con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Clamshell con banda',e:['Banda elástica'],d:'principiante'},
    {n:'Abducción en máquina',e:['Máquina de cable'],d:'principiante'},
    {n:'Peso muerto sumo',e:['Barra'],d:'intermedio'},
    {n:'Frog pump',e:['Sin equipo'],d:'principiante'},
    {n:'Single leg hip thrust',e:['Banco'],d:'intermedio'}
  ],
  'Pantorrillas': [
    {n:'Elevación de talones de pie',e:['Máquina Smith'],d:'principiante'},
    {n:'Elevación de talones sentado',e:['Máquina de cable'],d:'principiante'},
    {n:'Elevación de talones con mancuerna',e:['Mancuernas'],d:'principiante'},
    {n:'Elevación de talones en prensa',e:['Máquina de cable'],d:'intermedio'},
    {n:'Saltos a una pierna',e:['Sin equipo'],d:'intermedio'}
  ],
  'Trapecio': [
    {n:'Encogimientos con barra',e:['Barra'],d:'principiante'},
    {n:'Encogimientos con mancuernas',e:['Mancuernas'],d:'principiante'},
    {n:'Remo al mentón agarre estrecho',e:['Barra'],d:'intermedio'},
    {n:'Face pull',e:['Máquina de cable'],d:'principiante'},
    {n:'Farmer walk pesado',e:['Mancuernas'],d:'intermedio'}
  ],
  'Lumbares': [
    {n:'Hiperextensión en banco',e:['Banco'],d:'principiante'},
    {n:'Superman',e:['Sin equipo'],d:'principiante'},
    {n:'Good morning',e:['Barra'],d:'intermedio'},
    {n:'Bird dog',e:['Sin equipo'],d:'principiante'},
    {n:'Reverse hyper',e:['Banco'],d:'intermedio'}
  ],
  'Aductores': [
    {n:'Aducción en máquina',e:['Máquina de cable'],d:'principiante'},
    {n:'Aducción en polea',e:['Máquina de cable'],d:'intermedio'},
    {n:'Sentadilla sumo',e:['Mancuernas'],d:'intermedio'},
    {n:'Copenhagen plank',e:['Banco'],d:'avanzado'},
    {n:'Squeeze ball',e:['Balón medicinal'],d:'principiante'}
  ],
  'Abductores': [
    {n:'Abducción en máquina',e:['Máquina de cable'],d:'principiante'},
    {n:'Abducción lateral de pie',e:['Banda elástica'],d:'principiante'},
    {n:'Clamshell',e:['Banda elástica'],d:'principiante'},
    {n:'Monster walk',e:['Banda elástica'],d:'intermedio'},
    {n:'Abducción en polea',e:['Máquina de cable'],d:'intermedio'}
  ],
  'Cuello': [
    {n:'Flexión de cuello con disco',e:['Sin equipo'],d:'principiante'},
    {n:'Extensión de cuello con disco',e:['Sin equipo'],d:'principiante'},
    {n:'Lateral neck flexion',e:['Sin equipo'],d:'principiante'}
  ],
  'Cardio': [
    {n:'Burpees',e:['Sin equipo'],d:'intermedio'},
    {n:'Jumping jacks',e:['Sin equipo'],d:'principiante'},
    {n:'High knees',e:['Sin equipo'],d:'principiante'},
    {n:'Box jumps',e:['Step'],d:'intermedio'},
    {n:'Salto a la cuerda',e:['Cuerda'],d:'principiante'},
    {n:'Sprint en el sitio',e:['Sin equipo'],d:'principiante'},
    {n:'Battle ropes',e:['Cuerda'],d:'intermedio'},
    {n:'Mountain climbers',e:['Sin equipo'],d:'principiante'},
    {n:'Skaters',e:['Sin equipo'],d:'intermedio'},
    {n:'Bear crawl',e:['Sin equipo'],d:'intermedio'}
  ],
  'Full Body': [
    {n:'Burpees',e:['Sin equipo'],d:'intermedio'},
    {n:'Clean and press',e:['Barra'],d:'avanzado'},
    {n:'Thruster con mancuernas',e:['Mancuernas'],d:'intermedio'},
    {n:'Turkish get-up',e:['Kettlebell'],d:'avanzado'},
    {n:'Devil press',e:['Mancuernas'],d:'avanzado'},
    {n:'Man maker',e:['Mancuernas'],d:'avanzado'},
    {n:'Snatch con kettlebell',e:['Kettlebell'],d:'avanzado'},
    {n:'Clean con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Swing con kettlebell',e:['Kettlebell'],d:'intermedio'},
    {n:'Bear complex',e:['Barra'],d:'avanzado'}
  ],
  'Estiramiento': [
    {n:'Estiramiento de pecho en pared',e:['Sin equipo'],d:'principiante'},
    {n:'Estiramiento de isquiotibiales',e:['Sin equipo'],d:'principiante'},
    {n:'Estiramiento de cuádriceps',e:['Sin equipo'],d:'principiante'},
    {n:'Cat-cow',e:['Sin equipo'],d:'principiante'},
    {n:'Child pose',e:['Sin equipo'],d:'principiante'},
    {n:'Estiramiento de hombros',e:['Sin equipo'],d:'principiante'},
    {n:'Pigeon stretch',e:['Sin equipo'],d:'principiante'},
    {n:'Foam rolling espalda',e:['Sin equipo'],d:'principiante'},
    {n:'Foam rolling piernas',e:['Sin equipo'],d:'principiante'},
    {n:'Estiramiento de cadera 90/90',e:['Sin equipo'],d:'principiante'}
  ]
};

let _exCount = 0; for (const m in EX) _exCount += EX[m].length;
console.log('DEBBIE v16 — ' + _exCount + ' ejercicios cargados');

const FOODS = [
  {n:'Pollo (100g)',cal:165,p:31,c:0,g:3.6},
  {n:'Arroz blanco (100g)',cal:130,p:2.7,c:28,g:0.3},
  {n:'Arroz integral (100g)',cal:112,p:2.6,c:24,g:0.9},
  {n:'Huevo entero',cal:72,p:6.3,c:0.4,g:4.8},
  {n:'Clara de huevo',cal:17,p:3.6,c:0.2,g:0.1},
  {n:'Atún en agua (100g)',cal:116,p:26,c:0,g:0.8},
  {n:'Salmón (100g)',cal:208,p:20,c:0,g:13},
  {n:'Carne de res (100g)',cal:250,p:26,c:0,g:15},
  {n:'Avena (100g)',cal:389,p:16.9,c:66,g:6.9},
  {n:'Banana',cal:89,p:1.1,c:23,g:0.3},
  {n:'Manzana',cal:52,p:0.3,c:14,g:0.2},
  {n:'Batata/Camote (100g)',cal:86,p:1.6,c:20,g:0.1},
  {n:'Papa (100g)',cal:77,p:2,c:17,g:0.1},
  {n:'Brócoli (100g)',cal:34,p:2.8,c:7,g:0.4},
  {n:'Espinaca (100g)',cal:23,p:2.9,c:3.6,g:0.4},
  {n:'Leche entera (200ml)',cal:122,p:6.6,c:9.4,g:6.6},
  {n:'Leche descremada (200ml)',cal:70,p:7,c:10,g:0.2},
  {n:'Yogur griego (170g)',cal:100,p:17,c:6,g:0.7},
  {n:'Queso cottage (100g)',cal:98,p:11,c:3.4,g:4.3},
  {n:'Pan integral (rebanada)',cal:69,p:3.6,c:12,g:1.1},
  {n:'Pasta (100g cocida)',cal:131,p:5,c:25,g:1.1},
  {n:'Lentejas (100g cocidas)',cal:116,p:9,c:20,g:0.4},
  {n:'Frijoles negros (100g)',cal:132,p:8.9,c:24,g:0.5},
  {n:'Almendras (30g)',cal:170,p:6,c:6,g:15},
  {n:'Maní (30g)',cal:170,p:7,c:5,g:14},
  {n:'Aguacate (100g)',cal:160,p:2,c:9,g:15},
  {n:'Aceite de oliva (15ml)',cal:119,p:0,c:0,g:14},
  {n:'Proteína whey (scoop)',cal:120,p:24,c:3,g:1.5},
  {n:'Tofu (100g)',cal:76,p:8,c:1.9,g:4.8},
  {n:'Quinoa (100g cocida)',cal:120,p:4.4,c:21,g:1.9}
];

// ── Audio Engine ──
const AudioEng = {
  ctx: null,
  init() {
    if (!this.ctx) {
      try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch(e) { console.warn('Web Audio no disponible'); }
    }
  },
  beep(freq=880, dur=0.15) {
    this.init();
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g); g.connect(this.ctx.destination);
    o.frequency.value = freq;
    g.gain.value = 0.3;
    o.start(); o.stop(this.ctx.currentTime + dur);
  },
  doubleBeep() { this.beep(880,0.1); setTimeout(()=>this.beep(1100,0.15),200); },
  tripleBeep() { this.beep(660,0.1); setTimeout(()=>this.beep(880,0.1),200); setTimeout(()=>this.beep(1200,0.2),400); },
  speak(text) {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'es-CO'; u.rate = 1; u.pitch = 1;
      speechSynthesis.speak(u);
    }
  },
  motivate() {
    const m = MOTIV[Math.floor(Math.random() * MOTIV.length)];
    this.speak(m);
    toast(m, 4000);
  }
};

// ══════════════════════════════════════════════════
//  AUTENTICACIÓN + PERFIL + ENCUESTA + CAMBIO ROL
// ══════════════════════════════════════════════════

const ACCESS_KEY = 'DEBBIE2026';

async function doLogin() {
  const email = $('login-email')?.value?.trim();
  const pass = $('login-pass')?.value?.trim();
  const key = $('login-key')?.value?.trim();
  if (!email || !pass) return toast('Ingresa email y contraseña');
  if (key && key !== ACCESS_KEY) return toast('Clave de acceso incorrecta');

  const btn = $('btn-login');
  if (btn) { btn.disabled = true; btn.textContent = 'Procesando...'; }

  try {
    let cred;

    // CON clave → registrar primero
    if (key === ACCESS_KEY) {
      console.log('🔑 Clave detectada → REGISTRO...');
      try {
        cred = await auth.createUserWithEmailAndPassword(email, pass);
        console.log('✅ Cuenta creada:', cred.user.uid);
      } catch(regErr) {
        console.warn('Registro falló:', regErr.code);
        if (regErr.code === 'auth/email-already-in-use') {
          console.log('📧 Ya existe → LOGIN...');
          cred = await auth.signInWithEmailAndPassword(email, pass);
        } else {
          throw regErr;
        }
      }
    } else {
      // SIN clave → solo login
      console.log('🔐 Sin clave → LOGIN...');
      try {
        cred = await auth.signInWithEmailAndPassword(email, pass);
      } catch(loginErr) {
        if (loginErr.code === 'auth/user-not-found' || loginErr.code === 'auth/invalid-login-credentials') {
          toast('Cuenta no encontrada. Usa la clave DEBBIE2026 para registrarte.');
          return;
        }
        throw loginErr;
      }
    }

    U = cred.user;
    await loadProfile();
  } catch(e) {
    console.error('Login error:', e);
    if (e.code === 'auth/too-many-requests') {
      toast('Firebase bloqueó temporalmente. Espera 15 min o cambia de red.');
    } else if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
      toast('Contraseña incorrecta.');
    } else {
      toast('Error: ' + e.message);
    }
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = 'Ingresar <span style="margin-left:8px">&rarr;</span>';
    }
  }
}

async function loadProfile() {
  if (!U) return;
  const doc = await db.collection('users').doc(U.uid).get();
  if (doc.exists) {
    PROF = doc.data();
    ROLE = PROF.role || 'client';
    if (PROF.goalsSurveyDone) showApp();
    else showGoalsSurvey();
  } else {
    showRoleSelection();
  }
}

function showRoleSelection() {
  $('login-screen').style.display = 'none';
  $('goals-screen').style.display = 'none';
  $('role-screen').style.display = 'flex';
}

async function selectRole(role) {
  ROLE = role;
  PROF = {
    email: U.email, role: role,
    name: U.email.split('@')[0],
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    goalsSurveyDone: false
  };
  if (role === 'trainer') PROF.clients = [];
  await db.collection('users').doc(U.uid).set(PROF);
  showGoalsSurvey();
}

function showGoalsSurvey() {
  $('login-screen').style.display = 'none';
  $('role-screen').style.display = 'none';
  $('app-main').style.display = 'none';
  $('goals-screen').style.display = 'flex';
  const isTrainer = (PROF?.role || ROLE) === 'trainer';
  $('goals-screen').innerHTML = '<div class="glass-card goals-card"><h2 class="neon-text">📋 Cuéntanos sobre ti</h2><p class="goals-subtitle">'+(isTrainer?'Información del entrenador':'Necesitamos estos datos para personalizar tu plan')+'</p><div class="goals-form"><label>Nombre completo</label><input type="text" id="goal-name" class="glass-input" placeholder="Tu nombre" value="'+(PROF?.name||'')+'"><label>Edad</label><input type="number" id="goal-age" class="glass-input" placeholder="Ej: 28" value="'+(PROF?.age||'')+'"><label>Sexo</label><select id="goal-sex" class="glass-input"><option value="">Selecciona...</option><option value="M" '+(PROF?.sex==='M'?'selected':'')+'>Masculino</option><option value="F" '+(PROF?.sex==='F'?'selected':'')+'>Femenino</option><option value="O" '+(PROF?.sex==='O'?'selected':'')+'>Otro</option></select><label>Altura (cm)</label><input type="number" id="goal-height" class="glass-input" placeholder="Ej: 175" value="'+(PROF?.height||'')+'"><label>Peso actual (kg)</label><input type="number" id="goal-weight" class="glass-input" placeholder="Ej: 72" step="0.1" value="'+(PROF?.weight||'')+'">' + (!isTrainer ? '<label>Nivel de actividad física</label><select id="goal-activity" class="glass-input"><option value="">Selecciona...</option><option value="sedentary" '+(PROF?.activity==='sedentary'?'selected':'')+'>Sedentario (poco o nada)</option><option value="light" '+(PROF?.activity==='light'?'selected':'')+'>Ligero (1-3 días/sem)</option><option value="moderate" '+(PROF?.activity==='moderate'?'selected':'')+'>Moderado (3-5 días/sem)</option><option value="active" '+(PROF?.activity==='active'?'selected':'')+'>Activo (6-7 días/sem)</option><option value="veryactive" '+(PROF?.activity==='veryactive'?'selected':'')+'>Muy activo (2x día)</option></select><label>¿Cuáles son tus metas? (puedes elegir varias)</label><div id="goals-multi" class="goals-multi-grid">' + [{v:'lose',t:'🔥 Perder grasa'},{v:'gain',t:'💪 Ganar masa muscular'},{v:'maintain',t:'⚖️ Mantener peso'},{v:'strength',t:'🏋️ Aumentar fuerza'},{v:'endurance',t:'🏃 Mejorar resistencia'},{v:'health',t:'❤️ Salud general'},{v:'flexibility',t:'🧘 Flexibilidad'},{v:'olympic',t:'🏅 Levantamiento olímpico'}].map(g=>'<label class="goal-check-item glass-card-inner"><input type="checkbox" value="'+g.v+'" class="goal-cb" '+((PROF?.goals||[]).includes(g.v)||(PROF?.mainGoal===g.v)?'checked':'')+'>  <span>'+g.t+'</span></label>').join('') + '</div><label>Metas personales</label><textarea id="goal-personal" class="glass-input" rows="3" placeholder="Ej: Quiero correr un maratón...">'+(PROF?.personalGoals||'')+'</textarea><label>¿Lesiones o restricciones?</label><textarea id="goal-injury" class="glass-input" rows="2" placeholder="Ej: Dolor de rodilla...">'+(PROF?.injuries||'')+'</textarea><label>Días de entrenamiento por semana</label><select id="goal-days" class="glass-input"><option value="">Selecciona...</option>'+[1,2,3,4,5,6,7].map(d=>'<option value="'+d+'" '+(PROF?.trainingDays==d?'selected':'')+'>'+d+' día'+(d>1?'s':'')+'</option>').join('')+'</select>' : '<label>Especialidad</label><input type="text" id="goal-specialty" class="glass-input" placeholder="Ej: Musculación, CrossFit..." value="'+(PROF?.specialty||'')+'"><label>Años de experiencia</label><input type="number" id="goal-experience" class="glass-input" placeholder="Ej: 5" value="'+(PROF?.experience||'')+'"><label>Certificaciones</label><textarea id="goal-certs" class="glass-input" rows="2" placeholder="Ej: NSCA-CPT, ACE...">'+(PROF?.certifications||'')+'</textarea>') + '</div><button class="btn-neon btn-full" onclick="saveGoalsSurvey()">Guardar y continuar →</button></div>';
}

async function saveGoalsSurvey() {
  const isTrainer = (PROF?.role || ROLE) === 'trainer';
  const name = $('goal-name')?.value?.trim();
  const age = parseInt($('goal-age')?.value) || 0;
  const sex = $('goal-sex')?.value;
  const height = parseFloat($('goal-height')?.value) || 0;
  const weight = parseFloat($('goal-weight')?.value) || 0;
  if (!name) return toast('Ingresa tu nombre');
  if (!age || age < 10 || age > 100) return toast('Edad válida');
  if (!sex) return toast('Selecciona sexo');
  if (!height || height < 100 || height > 250) return toast('Altura en cm');
  if (!weight || weight < 20 || weight > 300) return toast('Peso en kg');
  const update = { name, age, sex, height, weight, goalsSurveyDone: true, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
  if (!isTrainer) {
    const activity = $('goal-activity')?.value;
    const goalCbs = document.querySelectorAll('.goal-cb:checked'); const goals = Array.from(goalCbs).map(cb=>cb.value); const mainGoal = goals[0] || '';
    const personalGoals = $('goal-personal')?.value?.trim() || '';
    const injuries = $('goal-injury')?.value?.trim() || '';
    const trainingDays = parseInt($('goal-days')?.value) || 0;
    if (!activity) return toast('Selecciona nivel de actividad');
    if (goals.length === 0) return toast('Selecciona al menos una meta');
    if (!trainingDays) return toast('Días de entrenamiento');
    let bmr; if (sex==='M') bmr=10*weight+6.25*height-5*age+5; else bmr=10*weight+6.25*height-5*age-161;
    const actMult={sedentary:1.2,light:1.375,moderate:1.55,active:1.725,veryactive:1.9};
    const tdee=Math.round(bmr*(actMult[activity]||1.55));
    let targetCal=tdee, protRatio=2.0;
    if(mainGoal==='lose'){targetCal=Math.round(tdee*0.8);protRatio=2.2;}
    else if(mainGoal==='gain'){targetCal=Math.round(tdee*1.15);protRatio=2.0;}
    else if(mainGoal==='strength'){targetCal=Math.round(tdee*1.1);protRatio=2.2;}
    const targetProt=Math.round(weight*protRatio);
    const fatCal=Math.round(targetCal*0.25); const targetFat=Math.round(fatCal/9);
    const carbCal=targetCal-targetProt*4-fatCal; const targetCarbs=Math.round(carbCal/4);
    Object.assign(update,{activity,mainGoal,goals,personalGoals,injuries,trainingDays,bmr:Math.round(bmr),tdee,targetCal,targetProt,targetFat,targetCarbs});
  } else {
    Object.assign(update,{specialty:$('goal-specialty')?.value?.trim()||'',experience:parseInt($('goal-experience')?.value)||0,certifications:$('goal-certs')?.value?.trim()||''});
  }
  try {
    await db.collection('users').doc(U.uid).update(update);
    PROF = { ...PROF, ...update };
    toast('¡Perfil guardado!');
    showApp();
  } catch(e) { toast('Error: '+e.message); }
}

// ── Cambiar a Entrenador desde Perfil ──
function showUpgradeToTrainer() {
  const d = document.createElement('div');
  d.className = 'modal-overlay'; d.id = 'upgrade-modal';
  d.innerHTML = '<div class="modal glass-card"><h3>🏋️ Activar modo Entrenador</h3><p style="color:var(--text-secondary);font-size:0.85rem;margin-bottom:14px">Ingresa la clave de acceso para desbloquear las funciones de entrenador</p><input type="password" id="upgrade-key" class="glass-input" placeholder="Clave de acceso"><div class="modal-actions"><button class="btn-neon" onclick="confirmUpgrade()">Activar</button><button class="btn-glass" onclick="closeModal(\'upgrade-modal\')">Cancelar</button></div></div>';
  document.body.appendChild(d);
}

async function confirmUpgrade() {
  const key = $('upgrade-key')?.value?.trim();
  if (key !== ACCESS_KEY) return toast('Clave incorrecta');
  try {
    await db.collection('users').doc(U.uid).update({ role:'trainer', clients: PROF.clients || [] });
    PROF.role = 'trainer'; PROF.clients = PROF.clients || [];
    ROLE = 'trainer';
    closeModal('upgrade-modal');
    toast('✅ ¡Ahora eres Entrenador!');
    showTab('dash');
  } catch(e) { toast('Error: '+e.message); }
}

// ── Volver a Atleta ──
async function downgradeToClient() {
  if (!confirm('¿Volver a modo atleta?')) return;
  await db.collection('users').doc(U.uid).update({ role:'client' });
  PROF.role = 'client'; ROLE = 'client';
  toast('Modo atleta activado');
  showTab('dash');
}

function showApp() {
  $('login-screen').style.display = 'none';
  $('role-screen').style.display = 'none';
  $('goals-screen').style.display = 'none';
  $('app-main').style.display = 'flex';
  NUTRI_DATE = today();
  showTab('dash');
}

async function doLogout() {
  if (UNSUB_CAL) { UNSUB_CAL(); UNSUB_CAL = null; }
  if (UNSUB_RUTS) { UNSUB_RUTS(); UNSUB_RUTS = null; }
  await auth.signOut();
  U = null; PROF = null; ROLE = 'client';
  $('app-main').style.display = 'none';
  $('goals-screen').style.display = 'none';
  $('role-screen').style.display = 'none';
  $('login-screen').style.display = 'flex';
}
// ══════════════════════════════════════════════════
//  NAVEGACIÓN
// ══════════════════════════════════════════════════

function showTab(tab) {
  // Soporte para tab PR
  if (tab === 'pr') {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    const prTab = document.getElementById('tab-pr');
    if (prTab) { prTab.style.display = 'block'; renderPRs(); }
    const prNav = document.getElementById('nav-pr');
    if (prNav) prNav.classList.add('active');
    return;
  }
  CURRENT_TAB = tab;
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
  const panel = $('tab-' + tab);
  if (panel) panel.style.display = 'block';
  const navBtn = document.querySelector('.nav-btn[data-tab="'+tab+'"]');
  if (navBtn) navBtn.classList.add('active');
  renderTab(tab);
}

async function renderTab(tab) {
  switch(tab) {
    case 'dash': await renderDashboard(); break;
    case 'ruts': renderRoutines(); break;
    case 'cal': renderCalendar(); break;
    case 'timer': renderTimer(); break;
    case 'nutri': await loadNutriLog(); renderNutrition(); break;
    case 'perfil': renderProfile(); break;
  }
}

// ══════════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════════

async function renderDashboard() {
  const c = $('tab-dash');
  if (!c) return;
  const todayStr = today();
  let rutinasHoy = 0, calSnap;
  try {
    calSnap = await db.collection('users').doc(U.uid).collection('calendar').doc(todayStr).get();
    if (calSnap.exists) rutinasHoy = (calSnap.data().events || []).length;
  } catch(e) {}
  let totalRuts = 0;
  try {
    const sd = await db.collection('users').doc(U.uid).collection('stats').doc('general').get();
    if (sd.exists) totalRuts = sd.data().totalCompleted || 0;
  } catch(e) {}
  const motivMsg = MOTIV[Math.floor(Math.random() * MOTIV.length)];

  let html = '<div class="dash-header"><h2>'+greeting()+', '+(PROF?.name||'Atleta')+' 👋</h2><p class="motiv-text">'+motivMsg+'</p></div>';
  html += '<div class="stats-grid"><div class="stat-card glass-card"><span class="stat-icon">📅</span><span class="stat-num">'+rutinasHoy+'</span><span class="stat-label">Rutinas hoy</span></div><div class="stat-card glass-card"><span class="stat-icon">🏆</span><span class="stat-num">'+totalRuts+'</span><span class="stat-label">Completadas</span></div><div class="stat-card glass-card"><span class="stat-icon">🎯</span><span class="stat-num">'+(PROF?.targetCal||'—')+'</span><span class="stat-label">kcal/día</span></div><div class="stat-card glass-card"><span class="stat-icon">⚡</span><span class="stat-num">'+(PROF?.trainingDays||'—')+'</span><span class="stat-label">Días/semana</span></div></div>';
  let dashBattleWins=0;try{const dbw=await db.collection('users').doc(U.uid).get();if(dbw.exists)dashBattleWins=dbw.data().battlesWon||0;}catch(e){}
  if(dashBattleWins>0){const dti=window.BattleMode?BattleMode.getBattleTitle(dashBattleWins):{emoji:'⚔️',title:'Guerrero'};html+='<div class="stat-card glass-card battle-stat-card"><span class="stat-icon">⚔️</span><span class="stat-num">'+dashBattleWins+'</span><span class="stat-label">'+dti.emoji+' '+dti.title+'</span></div>';}

  if (ROLE === 'trainer') {
    html += '<div class="section-title">👥 Mis Atletas</div>';
    html += '<div class="trainer-add-client glass-card"><input type="email" id="add-client-email" class="glass-input" placeholder="email del atleta"><button class="btn-neon btn-sm" onclick="addClient()">+ Agregar</button></div>';
    const clients = PROF?.clients || [];
    if (clients.length === 0) {
      html += '<p class="empty-text">No tienes atletas aún</p>';
    } else {
      html += '<div class="clients-list">';
      for (const cid of clients) {
        try {
          const cDoc = await db.collection('users').doc(cid).get();
          if (cDoc.exists) {
            const cd = cDoc.data();
            html += '<div class="client-card glass-card" onclick="viewClient(\''+cid+'\')"><div class="client-info"><strong>'+(cd.name||cd.email)+'</strong><span class="client-meta">'+(cd.mainGoal?goalLabel(cd.mainGoal):'Sin meta')+' · '+(cd.weight||'?')+'kg · '+(cd.height||'?')+'cm</span></div><span class="client-arrow">→</span></div>';
          }
        } catch(e) {}
      }
      html += '</div>';
    }
  }

  if (calSnap && calSnap.exists) {
    const events = calSnap.data().events || [];
    if (events.length > 0) {
      html += '<div class="section-title">🏋️ Rutinas de hoy</div>';
      for (const ev of events) {
        html += '<div class="today-routine glass-card" onclick="openRoutineDetail(\''+ev.routineId+'\',\''+(ev.assignedBy||U.uid)+'\')"><strong>'+(ev.name||'Rutina')+'</strong><span class="routine-meta">'+(ev.exercises||'?')+' ejercicios'+(ev.assignedByName?' · Por: '+ev.assignedByName:'')+(ev.completed?' · ✅ Completada':'')+'</span></div>';
      }
    }
  }
  c.innerHTML = html;
}

function goalLabel(g) {
  const m={lose:'Perder grasa',gain:'Ganar músculo',maintain:'Mantener',strength:'Fuerza',endurance:'Resistencia',health:'Salud'};
  return m[g]||g;
}
function actLabel(a) {
  const m={sedentary:'Sedentario',light:'Ligero',moderate:'Moderado',active:'Activo',veryactive:'Muy activo'};
  return m[a]||a||'';
}

// ══════════════════════════════════════════════════
//  TRAINER: AGREGAR ATLETA
// ══════════════════════════════════════════════════

async function addClient() {
  const email = $('add-client-email')?.value?.trim();
  if (!email) return toast('Ingresa el email del atleta');
  try {
    const snap = await db.collection('users').where('email','==',email).limit(1).get();
    if (snap.empty) return toast('No se encontró usuario con ese email');
    const clientDoc = snap.docs[0];
    const clientId = clientDoc.id;
    const clientData = clientDoc.data();
    if (clientData.role === 'trainer') return toast('Ese usuario es entrenador');
    if ((PROF.clients||[]).includes(clientId)) return toast('Ya está en tu lista');
    const updatedClients = [...(PROF.clients||[]), clientId];
    await db.collection('users').doc(U.uid).update({ clients: updatedClients });
    PROF.clients = updatedClients;
    await db.collection('users').doc(clientId).update({ trainerId: U.uid, trainerName: PROF.name || PROF.email });
    toast('✅ '+(clientData.name||email)+' agregado');
    renderDashboard();
  } catch(e) { toast('Error: '+e.message); }
}

async function viewClient(clientId) {
  VIEWING_CLIENT = clientId;
  showTab('cal');
}

// ══════════════════════════════════════════════════
//  RUTINAS: GENERADOR + EDITOR
// ══════════════════════════════════════════════════

function renderRoutines() {
  const c = $('tab-ruts');
  if (!c) return;
  let html = '<div class="section-title">🏋️ Crear Rutina</div>';
  html += '<div class="filter-section glass-card"><label class="filter-label">Músculos objetivo:</label><div class="chips-wrap" id="muscle-chips">'+MUSCLES.map(m=>'<span class="chip '+(SELECTED_MUSCLES.includes(m)?'active':'')+'" onclick="toggleMuscle(\''+m+'\')">'+m+'</span>').join('')+'</div></div>';
  html += '<div class="filter-section glass-card"><label class="filter-label">Equipamiento disponible:</label><div class="chips-wrap" id="equip-chips">'+EQUIP.map(e=>'<span class="chip '+(SELECTED_EQUIP.includes(e)?'active':'')+'" onclick="toggleEquip(\''+e.replace(/'/g,"\\'") +'\')">'+e+'</span>').join('')+'</div></div>';
  html += '<div class="filter-section glass-card"><label class="filter-label">Nivel:</label><select id="rut-level" class="glass-input"><option value="all">Todos</option><option value="principiante">Principiante</option><option value="intermedio">Intermedio</option><option value="avanzado">Avanzado</option></select><label class="filter-label" style="margin-top:10px">Ejercicios por músculo:</label><select id="rut-count" class="glass-input">'+[2,3,4,5,6].map(n=>'<option value="'+n+'" '+(n===4?'selected':'')+'>'+n+'</option>').join('')+'</select></div>';
  html += '<div class="rut-actions"><button class="btn-neon" onclick="autoGenerate()">⚡ Auto-Generar</button><button class="btn-glass" onclick="blankRoutine()">📝 En blanco</button></div>';
  html += '<div id="routine-editor"></div><div id="routine-history"></div>';
  c.innerHTML = html;
  loadRoutineHistory();
}

function toggleMuscle(m) {
  const i = SELECTED_MUSCLES.indexOf(m);
  if (i>=0) SELECTED_MUSCLES.splice(i,1); else SELECTED_MUSCLES.push(m);
  renderRoutines();
}
function toggleEquip(e) {
  const i = SELECTED_EQUIP.indexOf(e);
  if (i>=0) SELECTED_EQUIP.splice(i,1); else SELECTED_EQUIP.push(e);
  renderRoutines();
}

function autoGenerate() {
  if (SELECTED_MUSCLES.length===0) return toast('Selecciona al menos un músculo');
  const level = $('rut-level')?.value||'all';
  const count = parseInt($('rut-count')?.value)||4;
  const exercises = [];
  for (const muscle of SELECTED_MUSCLES) {
    let pool = EX[muscle]||[];
    if (SELECTED_EQUIP.length>0) pool = pool.filter(ex=>ex.e.some(eq=>SELECTED_EQUIP.includes(eq)));
    if (level!=='all') { const f=pool.filter(ex=>ex.d===level); if(f.length>0)pool=f; }
    const shuffled=[...pool].sort(()=>Math.random()-0.5);
    for (const ex of shuffled.slice(0,count)) {
      exercises.push({name:ex.n,muscle,equipment:ex.e.join(', '),difficulty:ex.d,sets:level==='principiante'?3:(level==='avanzado'?5:4),reps:level==='principiante'?12:(level==='avanzado'?8:10),rest:level==='principiante'?90:(level==='avanzado'?120:60),weight:0,notes:''});
    }
  }
  if (exercises.length===0) return toast('No hay ejercicios con esos filtros');
  CURRENT_ROUTINE = {name:'Rutina '+SELECTED_MUSCLES.join(' + '),exercises,createdAt:new Date().toISOString(),muscles:[...SELECTED_MUSCLES],level,timerType:suggestTimer(exercises,level),timerDuration:suggestDuration(exercises,level)};
  renderRoutineEditor();
  toast('✅ '+exercises.length+' ejercicios generados');
}

function blankRoutine() {
  CURRENT_ROUTINE = {name:'Nueva Rutina',exercises:[],createdAt:new Date().toISOString(),muscles:[],level:'all',timerType:'countdown',timerDuration:60};
  renderRoutineEditor();
}


// === TIMER SUGERIDO EN RUTINAS v39 ===
function suggestTimer(exercises, level) {
  if (!exercises || exercises.length === 0) return 'countdown';
  var avgRest = 0;
  for (var i = 0; i < exercises.length; i++) { avgRest += (exercises[i].rest || 60); }
  avgRest = avgRest / exercises.length;
  if (avgRest <= 20) return 'tabata';
  if (avgRest <= 45) return 'emom';
  if (exercises.length >= 6 && level === 'avanzado') return 'amrap';
  return 'countdown';
}

function suggestDuration(exercises, level) {
  if (!exercises || exercises.length === 0) return 60;
  var type = suggestTimer(exercises, level);
  var totalSets = 0;
  for (var i = 0; i < exercises.length; i++) { totalSets += (exercises[i].sets || 3); }
  if (type === 'tabata') return 20;
  if (type === 'emom') return Math.min(Math.max(totalSets, 8), 30);
  if (type === 'amrap') return Math.min(Math.max(exercises.length * 2, 10), 25);
  return Math.min(Math.max(totalSets * 2, 30), 120);
}

function applyRoutineTimer() {
  if (!CURRENT_ROUTINE) return;
  var type = CURRENT_ROUTINE.timerType || 'countdown';
  var dur = CURRENT_ROUTINE.timerDuration || 60;
  setTimerMode(type);
  if (type === 'countdown') { COUNTDOWN_FROM = dur; TIMER_SEC = dur; }
  else if (type === 'tabata') { TABATA_WORK = dur; TIMER_SEC = dur; }
  else if (type === 'emom') { EMOM_MINUTES = dur; TIMER_SEC = 60; }
  else if (type === 'amrap') { AMRAP_MINUTES = dur; TIMER_SEC = dur * 60; }
  showTab('timer');
  renderTimer();
  toast('Timer ' + type.toUpperCase() + ' configurado');
  AudioEng.speak('Timer ' + type + ' listo. ' + dur + (type === 'emom' || type === 'amrap' ? ' minutos' : ' segundos'));
}

function removeRoutineTimer() {
  if (!CURRENT_ROUTINE) return;
  CURRENT_ROUTINE.timerType = 'countdown';
  CURRENT_ROUTINE.timerDuration = 60;
  renderRoutineEditor();
  toast('Timer reiniciado');
}

function renderRoutineEditor() {
  const ed = $('routine-editor');
  if (!ed || !CURRENT_ROUTINE) return;
  const exs = CURRENT_ROUTINE.exercises;
  let html = '<div class="editor-card glass-card"><div class="editor-header"><input type="text" id="rut-name" class="glass-input rut-name-input" value="'+CURRENT_ROUTINE.name+'" onchange="CURRENT_ROUTINE.name=this.value"><span class="ex-count">'+exs.length+' ejercicios</span></div><div class="routine-timer-config"><div class="rtc-header"><span class="section-title-sm">⏱️ Timer Sugerido</span><button class="btn-icon btn-danger btn-sm" onclick="removeRoutineTimer()" title="Reiniciar timer">✕</button></div><div class="timer-config-row"><select id="rut-timer-type" class="glass-input" onchange="CURRENT_ROUTINE.timerType=this.value;renderRoutineEditor()"><option value="countdown"'+((CURRENT_ROUTINE.timerType||'countdown')==='countdown'?' selected':'')+'>⏳ Cuenta Regresiva</option><option value="tabata"'+(CURRENT_ROUTINE.timerType==='tabata'?' selected':'')+'>🔥 Tabata</option><option value="emom"'+(CURRENT_ROUTINE.timerType==='emom'?' selected':'')+'>⚡ EMOM</option><option value="amrap"'+(CURRENT_ROUTINE.timerType==='amrap'?' selected':'')+'>💪 AMRAP</option><option value="stopwatch"'+(CURRENT_ROUTINE.timerType==='stopwatch'?' selected':'')+'>⏱ Cronómetro</option></select><div class="param"><label>'+(CURRENT_ROUTINE.timerType==='emom'||CURRENT_ROUTINE.timerType==='amrap'?'Min':'Seg')+'</label><input type="number" class="glass-input mini" value="'+(CURRENT_ROUTINE.timerDuration||60)+'" min="1" max="600" onchange="CURRENT_ROUTINE.timerDuration=parseInt(this.value)"></div><button class="btn-neon btn-sm" onclick="applyRoutineTimer()">▶️ Ir al Timer</button></div></div><div class="exercises-list">';
  exs.forEach((ex,i) => {
    html += '<div class="exercise-item glass-card-inner"><div class="ex-header"><span class="ex-num">'+(i+1)+'</span><div class="ex-info"><strong>'+ex.name+'</strong><span class="ex-meta">'+ex.muscle+' · '+ex.equipment+' · '+ex.difficulty+'</span></div><div class="ex-actions-mini">'+(i>0?'<button class="btn-icon" onclick="moveEx('+i+',-1)">↑</button>':'')+(i<exs.length-1?'<button class="btn-icon" onclick="moveEx('+i+',1)">↓</button>':'')+'<button class="btn-icon btn-danger" onclick="removeEx('+i+')">✕</button><button class="btn-icon btn-ai-help" onclick="showExerciseGuide(this)" title="Como se hace?">&#10067;</button></div></div><div class="ex-params"><div class="param"><label>Series</label><input type="number" class="glass-input mini" value="'+ex.sets+'" min="1" max="20" onchange="CURRENT_ROUTINE.exercises['+i+'].sets=parseInt(this.value)"></div><div class="param"><label>Reps</label><input type="number" class="glass-input mini" value="'+ex.reps+'" min="1" max="100" onchange="CURRENT_ROUTINE.exercises['+i+'].reps=parseInt(this.value)"></div><div class="param"><label>Desc(s)</label><input type="number" class="glass-input mini" value="'+ex.rest+'" min="0" max="600" step="5" onchange="CURRENT_ROUTINE.exercises['+i+'].rest=parseInt(this.value)"></div><div class="param"><label>Peso(kg)</label><input type="number" class="glass-input mini" value="'+ex.weight+'" min="0" max="500" step="0.5" onchange="CURRENT_ROUTINE.exercises['+i+'].weight=parseFloat(this.value)"></div></div><input type="text" class="glass-input note-input" placeholder="Notas..." value="'+(ex.notes||'')+'" onchange="CURRENT_ROUTINE.exercises['+i+'].notes=this.value"></div>';
  });
  html += '</div><div class="add-exercise-section"><div class="section-title">➕ Agregar ejercicio</div><div class="add-ex-filters"><select id="add-ex-muscle" class="glass-input" onchange="filterAddExercises()"><option value="">Músculo...</option>'+MUSCLES.map(m=>'<option value="'+m+'">'+m+'</option>').join('')+'</select><select id="add-ex-equip" class="glass-input" onchange="filterAddExercises()"><option value="">Equipo...</option>'+EQUIP.map(e=>'<option value="'+e+'">'+e+'</option>').join('')+'</select></div><div id="add-ex-results" class="add-ex-results"></div></div>';
  html += '<div class="editor-bottom-actions"><button class="btn-neon" onclick="saveRoutine()">💾 Guardar</button><button class="btn-neon" onclick="saveAndSchedule()">📅 Guardar + Programar</button><button class="btn-neon btn-timer-go" onclick="applyRoutineTimer()">⏱️ Ir al Timer</button>'+(ROLE==='trainer'?'<button class="btn-neon btn-assign" onclick="showAssignDialog()">👤 Asignar a Atleta</button>':'')+'</div></div>';
  ed.innerHTML = html;
}

function moveEx(idx,dir){const e=CURRENT_ROUTINE.exercises;const n=idx+dir;if(n<0||n>=e.length)return;[e[idx],e[n]]=[e[n],e[idx]];renderRoutineEditor();}
function removeEx(idx){CURRENT_ROUTINE.exercises.splice(idx,1);renderRoutineEditor();}

function filterAddExercises() {
  const muscle=$('add-ex-muscle')?.value; const equip=$('add-ex-equip')?.value;
  const container=$('add-ex-results'); if(!container)return;
  if(!muscle){container.innerHTML='';return;}
  let pool=EX[muscle]||[];
  if(equip) pool=pool.filter(ex=>ex.e.includes(equip));
  if(pool.length===0){container.innerHTML='<p class="empty-text">Sin resultados</p>';return;}
  container.innerHTML=pool.map(ex=>'<div class="add-ex-item" onclick="addExToRoutine(\''+muscle+'\',\''+ex.n.replace(/'/g,"\\'")+'\',\''+ex.e.join(",")+'\',\''+ex.d+'\')"><span class="add-ex-name">'+ex.n+'</span><span class="add-ex-meta">'+ex.e.join(', ')+' · '+ex.d+'</span></div>').join('');
}

function addExToRoutine(muscle,name,equipStr,diff) {
  if(!CURRENT_ROUTINE)return;
  CURRENT_ROUTINE.exercises.push({name,muscle,equipment:equipStr,difficulty:diff,sets:4,reps:10,rest:60,weight:0,notes:''});
  renderRoutineEditor();
  toast('+ '+name);
}

// ══════════════════════════════════════════════════
//  GUARDAR RUTINA
// ══════════════════════════════════════════════════

async function saveRoutine(targetUid) {
  if(!CURRENT_ROUTINE||CURRENT_ROUTINE.exercises.length===0) return toast('Agrega ejercicios');
  const uid=targetUid||U.uid;
  const name=$('rut-name')?.value?.trim()||CURRENT_ROUTINE.name;
  CURRENT_ROUTINE.name=name;
  const data={...CURRENT_ROUTINE,ownerId:uid,createdBy:U.uid,createdByName:PROF?.name||'',createdByRole:ROLE,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
  try {
    const ref=await db.collection('users').doc(uid).collection('routines').add(data);
    toast('✅ Rutina guardada');
    return ref.id;
  } catch(e){toast('Error: '+e.message);return null;}
}

async function saveAndSchedule() {
  const rid = await saveRoutine();
  if(!rid)return;
  showScheduleDialog(rid, U.uid);
}

function showScheduleDialog(routineId,targetUid) {
  const d=document.createElement('div');d.className='modal-overlay';d.id='schedule-dialog';
  d.innerHTML='<div class="modal glass-card"><h3>📅 Programar rutina</h3><label>Fecha:</label><input type="date" id="sched-date" class="glass-input" value="'+today()+'"><div class="modal-actions"><button class="btn-neon" onclick="confirmSchedule(\''+routineId+'\',\''+targetUid+'\')">Confirmar</button><button class="btn-glass" onclick="closeModal(\'schedule-dialog\')">Cancelar</button></div></div>';
  document.body.appendChild(d);
}

async function confirmSchedule(routineId,targetUid) {
  const date=$('sched-date')?.value;
  if(!date)return toast('Selecciona fecha');
  await addCalendarEvent(targetUid,date,routineId,CURRENT_ROUTINE.name,CURRENT_ROUTINE.exercises.length);
  closeModal('schedule-dialog');
  toast('✅ Programada para '+date);
}

// ══════════════════════════════════════════════════
//  ASIGNAR RUTINA TRAINER → ATLETA
// ══════════════════════════════════════════════════

function showAssignDialog() {
  if(!CURRENT_ROUTINE||CURRENT_ROUTINE.exercises.length===0)return toast('Crea una rutina primero');
  if(ROLE!=='trainer')return toast('Solo entrenadores');
  const clients=PROF?.clients||[];
  if(clients.length===0)return toast('No tienes atletas');
  const d=document.createElement('div');d.className='modal-overlay';d.id='assign-dialog';
  d.innerHTML='<div class="modal glass-card"><h3>👤 Asignar a Atleta</h3><label>Atleta:</label><select id="assign-client" class="glass-input"><option value="">Selecciona...</option></select><label>Fecha:</label><input type="date" id="assign-date" class="glass-input" value="'+today()+'"><div class="modal-actions"><button class="btn-neon" onclick="confirmAssign()">Asignar</button><button class="btn-glass" onclick="closeModal(\'assign-dialog\')">Cancelar</button></div></div>';
  document.body.appendChild(d);
  loadClientsForAssign(clients);
}

async function loadClientsForAssign(clientIds) {
  const sel=$('assign-client');if(!sel)return;
  for(const cid of clientIds){
    try{const cd=await db.collection('users').doc(cid).get();if(cd.exists){const o=document.createElement('option');o.value=cid;o.textContent=cd.data().name||cd.data().email;sel.appendChild(o);}}catch(e){}
  }
}

async function confirmAssign() {
  const clientId=$('assign-client')?.value;
  const date=$('assign-date')?.value;
  if(!clientId)return toast('Selecciona atleta');
  if(!date)return toast('Selecciona fecha');
  try {
    const name=$('rut-name')?.value?.trim()||CURRENT_ROUTINE.name;
    CURRENT_ROUTINE.name=name;
    const routineData={...CURRENT_ROUTINE,ownerId:clientId,createdBy:U.uid,createdByName:PROF?.name||'',createdByRole:'trainer',assignedBy:U.uid,assignedByName:PROF?.name||'',assignedDate:date,updatedAt:firebase.firestore.FieldValue.serverTimestamp()};
    const ref=await db.collection('users').doc(clientId).collection('routines').add(routineData);
    await addCalendarEvent(clientId,date,ref.id,name,CURRENT_ROUTINE.exercises.length);
    await db.collection('users').doc(U.uid).collection('assignments').add({clientId,routineId:ref.id,routineName:name,date,exerciseCount:CURRENT_ROUTINE.exercises.length,assignedAt:firebase.firestore.FieldValue.serverTimestamp()});
    closeModal('assign-dialog');
    toast('✅ Rutina asignada para '+date);
  } catch(e){toast('Error: '+e.message);}
}

// ══════════════════════════════════════════════════
//  CALENDARIO TIEMPO REAL
// ══════════════════════════════════════════════════

async function addCalendarEvent(uid,date,routineId,routineName,exerciseCount) {
  const calRef=db.collection('users').doc(uid).collection('calendar').doc(date);
  await db.runTransaction(async tx=>{
    const doc=await tx.get(calRef);
    let events=doc.exists?(doc.data().events||[]):[];
    events.push({routineId,name:routineName,exercises:exerciseCount,assignedBy:U.uid,assignedByName:PROF?.name||'',assignedByRole:ROLE,completed:false,addedAt:new Date().toISOString()});
    tx.set(calRef,{date,events,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
  });
}

function renderCalendar() {
  const c=$('tab-cal');if(!c)return;
  const viewingUid=(ROLE==='trainer'&&VIEWING_CLIENT)?VIEWING_CLIENT:U.uid;
  const isVC=ROLE==='trainer'&&VIEWING_CLIENT&&VIEWING_CLIENT!==U.uid;
  const year=CAL_DATE.getFullYear();const month=CAL_DATE.getMonth();
  const mNames=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const dNames=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const todayStr=today();

  let html='<div class="cal-header">'+(isVC?'<button class="btn-glass btn-sm" onclick="VIEWING_CLIENT=null;renderCalendar()">← Volver</button>':'')+'<div class="cal-nav"><button class="btn-icon" onclick="changeMonth(-1)">◀</button><h3>'+mNames[month]+' '+year+'</h3><button class="btn-icon" onclick="changeMonth(1)">▶</button></div>'+(isVC?'<span class="viewing-label">📋 Calendario del cliente</span>':'')+'</div>';
  html+='<div class="cal-grid">';
  dNames.forEach(d=>{html+='<div class="cal-day-name">'+d+'</div>';});
  for(let i=0;i<firstDay;i++) html+='<div class="cal-cell empty"></div>';
  for(let d=1;d<=daysInMonth;d++){
    const ds=year+'-'+String(month+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
    html+='<div class="cal-cell '+(ds===todayStr?'today':'')+'" id="cal-'+ds+'" onclick="showDayEvents(\''+ds+'\',\''+viewingUid+'\')"><span class="cal-day-num">'+d+'</span><div class="cal-dots" id="dots-'+ds+'"></div></div>';
  }
  html+='</div><div id="day-events" class="day-events-panel"></div>';
  c.innerHTML=html;
  subscribeCalendar(viewingUid,year,month);
}

function changeMonth(dir){CAL_DATE.setMonth(CAL_DATE.getMonth()+dir);renderCalendar();}

function subscribeCalendar(uid,year,month) {
  if(UNSUB_CAL){UNSUB_CAL();UNSUB_CAL=null;}
  const start=year+'-'+String(month+1).padStart(2,'0')+'-01';
  const end=year+'-'+String(month+1).padStart(2,'0')+'-31';
  UNSUB_CAL=db.collection('users').doc(uid).collection('calendar')
    .where('date','>=',start).where('date','<=',end)
    .onSnapshot(snap=>{
      document.querySelectorAll('.cal-dots').forEach(el=>el.innerHTML='');
      snap.forEach(doc=>{
        const data=doc.data();const dots=$('dots-'+data.date);
        if(dots&&data.events){
          const cnt=data.events.length;const comp=data.events.filter(e=>e.completed).length;
          let dh='';
          for(let i=0;i<Math.min(cnt,4);i++){const cl=i<comp?'#00ff88':'#00f0ff';dh+='<span class="cal-dot" style="background:'+cl+'"></span>';}
          if(cnt>4) dh+='<span class="cal-dot-more">+' +(cnt-4)+'</span>';
          dots.innerHTML=dh;
        }
      });
    },err=>console.error('Cal listener:',err));
}

async function showDayEvents(dateStr,uid) {
  const panel=$('day-events');if(!panel)return;
  try{
    const doc=await db.collection('users').doc(uid).collection('calendar').doc(dateStr).get();
    const events=doc.exists?(doc.data().events||[]):[];
    const canEdit=(uid===U.uid||ROLE==='trainer');
    let html='<div class="day-events-header"><h4>📅 '+dateStr+'</h4><span>'+events.length+' rutina'+(events.length!==1?'s':'')+'</span></div>';
    if(events.length===0){html+='<p class="empty-text">Sin rutinas este día</p>';}
    else{events.forEach((ev,i)=>{
      html+='<div class="day-event-card glass-card-inner '+(ev.completed?'completed':'')+'"><div class="ev-info"><strong>'+(ev.name||'Rutina')+'</strong><span class="ev-meta">'+(ev.exercises||'?')+' ejercicios'+(ev.assignedByName?' · Por: '+ev.assignedByName:'')+'</span></div><div class="ev-actions"><button class="btn-icon" onclick="openRoutineDetail(\''+ev.routineId+'\',\''+uid+'\')" title="Ver">👁</button>'+(!ev.completed?'<button class="btn-icon" onclick="markCompleted(\''+uid+'\',\''+dateStr+'\','+i+')" title="Completar">✅</button>':'<span class="done-badge">✔</span>')+(canEdit?'<button class="btn-icon btn-danger" onclick="removeCalEvent(\''+uid+'\',\''+dateStr+'\','+i+')" title="Eliminar">🗑</button>':'')+'</div></div>';
    });}
    panel.innerHTML=html;
  }catch(e){panel.innerHTML='<p class="empty-text">Error al cargar</p>';}
}

async function markCompleted(uid,date,idx) {
  try{
    const calRef=db.collection('users').doc(uid).collection('calendar').doc(date);
    await db.runTransaction(async tx=>{const doc=await tx.get(calRef);if(!doc.exists)return;const ev=doc.data().events||[];if(ev[idx]){ev[idx].completed=true;ev[idx].completedAt=new Date().toISOString();tx.update(calRef,{events:ev});}});
    await db.collection('users').doc(uid).collection('stats').doc('general').set({totalCompleted:firebase.firestore.FieldValue.increment(1),lastCompleted:new Date().toISOString()},{merge:true});
    AudioEng.motivate();
    toast('🎉 ¡Rutina completada!');
    showDayEvents(date,uid);
  }catch(e){console.error(e);}
}

async function removeCalEvent(uid,date,idx) {
  if(!confirm('¿Eliminar esta rutina del calendario?'))return;
  try{
    const calRef=db.collection('users').doc(uid).collection('calendar').doc(date);
    await db.runTransaction(async tx=>{const doc=await tx.get(calRef);if(!doc.exists)return;const ev=doc.data().events||[];ev.splice(idx,1);tx.update(calRef,{events:ev});});
    toast('Eliminado');showDayEvents(date,uid);
  }catch(e){console.error(e);}
}

async function openRoutineDetail(routineId,uid) {
  try{
    const doc=await db.collection('users').doc(uid).collection('routines').doc(routineId).get();
    if(!doc.exists)return toast('Rutina no encontrada');
    CURRENT_ROUTINE={...doc.data(),id:routineId};
    showTab('ruts');
    setTimeout(()=>renderRoutineEditor(),100);
  }catch(e){toast('Error al abrir');}
}

async function loadRoutineHistory() {
  const container=$('routine-history');if(!container)return;
  try{
    const snap=await db.collection('users').doc(U.uid).collection('routines').orderBy('updatedAt','desc').limit(20).get();
    if(snap.empty){container.innerHTML='<p class="empty-text">Sin rutinas guardadas</p>';return;}
    let html='<div class="section-title">📂 Mis Rutinas</div>';
    snap.forEach(doc=>{
      const r=doc.data();const exC=r.exercises?r.exercises.length:0;
      const byT=r.createdByRole==='trainer'&&r.createdBy!==U.uid;
      const showActions = (ROLE==='trainer');
      html+='<div class="routine-hist-card glass-card"><div class="rh-info" onclick="loadRoutineForEdit(\''+doc.id+'\')"><strong>'+(r.name||'Rutina')+'</strong><span class="rh-meta">'+exC+' ejercicios'+(r.muscles?' · '+r.muscles.join(', '):'')+'</span>'+(byT?'<span class="rh-trainer">Asignada por: '+(r.createdByName||'Entrenador')+'</span>':'')+'</div>'+(showActions?'<div class="rh-actions"><button class="btn-icon" onclick="event.stopPropagation();loadRoutineForEdit(\''+doc.id+'\')" title="Editar">✏️</button><button class="btn-icon btn-danger" onclick="event.stopPropagation();deleteRoutine(\''+doc.id+'\',\''+((r.name||'Rutina').replace(/'/g,"\\'"))+'\')" title="Eliminar">🗑</button></div>':'<span class="client-arrow">→</span>')+'</div>';
    });
    container.innerHTML=html;
  }catch(e){console.error(e);}
}

async function deleteRoutine(routineId, routineName) {
  if(!confirm('¿Eliminar "'+routineName+'"? Esta acción no se puede deshacer.'))return;
  try{
    await db.collection('users').doc(U.uid).collection('routines').doc(routineId).delete();
    toast('🗑 Rutina eliminada');
    loadRoutineHistory();
  }catch(e){
    console.error('Error deleting routine:',e);
    toast('Error al eliminar: '+e.message);
  }
}

async function loadRoutineForEdit(routineId) {
  try{
    const doc=await db.collection('users').doc(U.uid).collection('routines').doc(routineId).get();
    if(!doc.exists)return toast('No encontrada');
    CURRENT_ROUTINE={...doc.data(),id:routineId};
    renderRoutineEditor();
  }catch(e){toast('Error');}
}

function closeModal(id){const m=$(id);if(m)m.remove();}

// ══════════════════════════════════════════════════
//  TIMER — TABATA / EMOM / AMRAP / CRONÓMETRO / CUENTA REGRESIVA
// ══════════════════════════════════════════════════

function renderTimer() {
  const c=$('tab-timer');if(!c)return;
  const mins=Math.floor(TIMER_SEC/60);
  const secs=TIMER_SEC%60;
  const display=String(mins).padStart(2,'0')+':'+String(secs).padStart(2,'0');

  // Calcular progreso del anillo
  let ringOffset = 0;
  const circ = 565.48;
  if (TIMER_MODE==='countdown' && COUNTDOWN_FROM>0) ringOffset = circ*(1-TIMER_SEC/COUNTDOWN_FROM);
  else if (TIMER_MODE==='tabata') {
    const total = TABATA_IS_WORK ? TABATA_WORK : TABATA_REST;
    if(total>0) ringOffset = circ*(1-TIMER_SEC/total);
  }
  else if (TIMER_MODE==='emom') { ringOffset = circ*(1-(TIMER_SEC%60)/60); }
  else if (TIMER_MODE==='amrap' && AMRAP_MINUTES>0) ringOffset = circ*(1-TIMER_SEC/(AMRAP_MINUTES*60));
  else if (TIMER_MODE==='stopwatch') ringOffset = circ*(1-(TIMER_SEC%60)/60);

  // Color del anillo según modo
  let ringColor = '#00f0ff';
  if (TIMER_MODE==='tabata') ringColor = TABATA_IS_WORK ? '#ff2d75' : '#00ff88';
  else if (TIMER_MODE==='emom') ringColor = '#ffd93d';
  else if (TIMER_MODE==='amrap') ringColor = '#a855f7';

  let html = '<div class="timer-container">';

  // Mode selector
  html += '<div class="timer-modes">';
  html += '<button class="btn-glass btn-sm '+(TIMER_MODE==='stopwatch'?'active':'')+'" onclick="setTimerMode(\'stopwatch\')">⏱ Crono</button>';
  html += '<button class="btn-glass btn-sm '+(TIMER_MODE==='countdown'?'active':'')+'" onclick="setTimerMode(\'countdown\')">⏳ Regresiva</button>';
  html += '<button class="btn-glass btn-sm '+(TIMER_MODE==='tabata'?'active':'')+'" onclick="setTimerMode(\'tabata\')">🔥 Tabata</button>';
  html += '<button class="btn-glass btn-sm '+(TIMER_MODE==='emom'?'active':'')+'" onclick="setTimerMode(\'emom\')">⚡ EMOM</button>';
  html += '<button class="btn-glass btn-sm '+(TIMER_MODE==='amrap'?'active':'')+'" onclick="setTimerMode(\'amrap\')">💪 AMRAP</button>';
  html += '</div>';

  // Config según modo
  if (TIMER_MODE==='countdown') {
    html += '<div class="timer-config glass-card"><label>Segundos:</label><div class="countdown-btns"><button class="btn-icon" onclick="adjCountdown(-15)">-15</button><button class="btn-icon" onclick="adjCountdown(-5)">-5</button><span class="countdown-val">'+COUNTDOWN_FROM+'s</span><button class="btn-icon" onclick="adjCountdown(5)">+5</button><button class="btn-icon" onclick="adjCountdown(15)">+15</button></div><div class="countdown-presets">'+[30,45,60,90,120,180].map(s=>'<button class="btn-glass btn-sm" onclick="setCountdown('+s+')">'+s+'s</button>').join('')+'</div></div>';
  }
  else if (TIMER_MODE==='tabata') {
    html += '<div class="timer-config glass-card"><div class="tabata-grid"><div class="param"><label>Trabajo (s)</label><input type="number" class="glass-input mini" value="'+TABATA_WORK+'" min="5" max="120" onchange="TABATA_WORK=parseInt(this.value)"></div><div class="param"><label>Descanso (s)</label><input type="number" class="glass-input mini" value="'+TABATA_REST+'" min="5" max="120" onchange="TABATA_REST=parseInt(this.value)"></div><div class="param"><label>Rondas</label><input type="number" class="glass-input mini" value="'+TABATA_ROUNDS+'" min="1" max="50" onchange="TABATA_ROUNDS=parseInt(this.value)"></div></div>';
    if(TIMER_RUN||TABATA_CURRENT_ROUND>0) html+='<div class="tabata-status"><span class="tabata-phase '+(TABATA_IS_WORK?'work':'rest')+'">'+(TABATA_IS_WORK?'🔥 TRABAJO':'😮‍💨 DESCANSO')+'</span><span class="tabata-round">Ronda '+TABATA_CURRENT_ROUND+'/'+TABATA_ROUNDS+'</span></div>';
    html += '<div class="tabata-presets"><span class="filter-label">Presets:</span><button class="btn-glass btn-sm" onclick="setTabataPreset(20,10,8)">Clásico 20/10×8</button><button class="btn-glass btn-sm" onclick="setTabataPreset(30,15,6)">30/15×6</button><button class="btn-glass btn-sm" onclick="setTabataPreset(40,20,5)">40/20×5</button><button class="btn-glass btn-sm" onclick="setTabataPreset(45,15,8)">45/15×8</button></div></div>';
  }
  else if (TIMER_MODE==='emom') {
    html += '<div class="timer-config glass-card"><div class="param" style="text-align:center"><label>Minutos totales</label><div class="countdown-btns"><button class="btn-icon" onclick="EMOM_MINUTES=Math.max(1,EMOM_MINUTES-1);renderTimer()">-</button><span class="countdown-val">'+EMOM_MINUTES+' min</span><button class="btn-icon" onclick="EMOM_MINUTES++;renderTimer()">+</button></div></div>';
    if(TIMER_RUN||EMOM_CURRENT_MIN>0) html+='<div class="tabata-status"><span class="tabata-phase work">⚡ Minuto '+(EMOM_CURRENT_MIN+1)+'/'+EMOM_MINUTES+'</span></div>';
    html += '<div class="tabata-presets"><button class="btn-glass btn-sm" onclick="EMOM_MINUTES=10;renderTimer()">10 min</button><button class="btn-glass btn-sm" onclick="EMOM_MINUTES=15;renderTimer()">15 min</button><button class="btn-glass btn-sm" onclick="EMOM_MINUTES=20;renderTimer()">20 min</button></div></div>';
  }
  else if (TIMER_MODE==='amrap') {
    html += '<div class="timer-config glass-card"><div class="param" style="text-align:center"><label>Minutos totales</label><div class="countdown-btns"><button class="btn-icon" onclick="AMRAP_MINUTES=Math.max(1,AMRAP_MINUTES-1);renderTimer()">-</button><span class="countdown-val">'+AMRAP_MINUTES+' min</span><button class="btn-icon" onclick="AMRAP_MINUTES++;renderTimer()">+</button></div></div>';
    if(TIMER_RUN) html+='<div class="tabata-status"><span class="tabata-round">Reps: '+AMRAP_REPS+'</span></div>';
    html += '<div class="tabata-presets"><button class="btn-glass btn-sm" onclick="AMRAP_MINUTES=8;renderTimer()">8 min</button><button class="btn-glass btn-sm" onclick="AMRAP_MINUTES=12;renderTimer()">12 min</button><button class="btn-glass btn-sm" onclick="AMRAP_MINUTES=20;renderTimer()">20 min</button></div></div>';
  }

  // Display
  html += '<div class="timer-display-wrap"><svg class="timer-ring" viewBox="0 0 200 200"><circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="6"/><circle cx="100" cy="100" r="90" fill="none" stroke="'+ringColor+'" stroke-width="6" stroke-dasharray="565.48" stroke-dashoffset="'+ringOffset+'" stroke-linecap="round" transform="rotate(-90 100 100)" id="timer-ring-progress"/></svg><div class="timer-display" style="color:'+ringColor+'">'+display+'</div></div>';

  // Controls
  html += '<div class="timer-controls">';
  if(!TIMER_RUN) html+='<button class="btn-neon btn-lg" onclick="startTimer()">▶ Iniciar</button>';
  else html+='<button class="btn-glass btn-lg" onclick="pauseTimer()">⏸ Pausar</button>';
  html+='<button class="btn-glass btn-lg" onclick="resetTimer()">⟲ Reset</button>';
  if(TIMER_MODE==='amrap'&&TIMER_RUN) html+='<button class="btn-neon btn-lg" onclick="AMRAP_REPS++;renderTimer()">+1 Rep</button>';
  html += '</div>';

  // Quick rest
  html += '<div class="timer-quick-rest"><div class="section-title">⚡ Descanso rápido</div><div class="quick-btns">'+[30,45,60,90,120].map(s=>'<button class="btn-glass btn-sm" onclick="quickRest('+s+')">'+s+'s</button>').join('')+'</div></div>';

  // HR
  html += '<div class="timer-hr-section glass-card"><div class="section-title">💓 Frecuencia Cardíaca</div><div class="hr-display"><span id="hr-value" class="hr-value">--</span><span class="hr-unit">BPM</span></div><button class="btn-glass btn-sm" id="btn-connect-hr" onclick="connectHR()">Conectar smartwatch</button></div>';

  html += '</div>';
  c.innerHTML=html;
}

function setTimerMode(mode){TIMER_MODE=mode;resetTimer();renderTimer();}
function adjCountdown(d){COUNTDOWN_FROM=Math.max(5,COUNTDOWN_FROM+d);if(!TIMER_RUN)TIMER_SEC=COUNTDOWN_FROM;renderTimer();}
function setCountdown(v){COUNTDOWN_FROM=v;if(!TIMER_RUN)TIMER_SEC=v;renderTimer();}
function setTabataPreset(w,r,rounds){TABATA_WORK=w;TABATA_REST=r;TABATA_ROUNDS=rounds;resetTimer();renderTimer();}



// ══════════════════════════════════════════════════
//  MENSAJES MOTIVACIONALES PERIÓDICOS
// ══════════════════════════════════════════════════
const MOTIV_EXTRA = [
  "¡Sigue así, vas increíble!",
  "¡No aflojes, falta menos!",
  "¡Eres más fuerte de lo que crees!",
  "¡Dale con todo, campeón!",
  "¡El esfuerzo vale la pena!",
  "¡Respira y sigue adelante!",
  "¡Cada segundo cuenta!",
  "¡Estás dejando todo, sigue!",
  "¡Nadie puede pararte!",
  "¡Mente fuerte, cuerpo fuerte!",
  "¡Lo estás logrando!",
  "¡Aguanta un poco más!",
  "¡Tu yo del futuro te lo agradecerá!",
  "¡Hoy no es día de rendirse!",
  "¡La mejor versión de ti está aquí!"
];
const ALL_MOTIV = MOTIV.concat(MOTIV_EXTRA);
let MOTIV_TIMER = null;
let MOTIV_COUNTER = 0;

function startMotivation() {
  stopMotivation();
  MOTIV_COUNTER = 0;
  MOTIV_TIMER = setInterval(() => {
    if (!TIMER_RUN) return;
    MOTIV_COUNTER++;
    const msg = ALL_MOTIV[Math.floor(Math.random() * ALL_MOTIV.length)];
    // Mostrar toast motivacional
    toast(msg, 3000);
    // Hablar cada 2do mensaje (no todos para no saturar)
    if (MOTIV_COUNTER % 2 === 0) {
      AudioEng.speak(msg.replace(/[💪🔥⚡🏆]/g, ''));
    }
    console.log('[MOTIV] ' + msg);
  }, 45000); // Cada 45 segundos
  // Primer mensaje a los 15 segundos
  setTimeout(() => {
    if (TIMER_RUN) {
      const first = ALL_MOTIV[Math.floor(Math.random() * ALL_MOTIV.length)];
      toast(first, 3000);
      AudioEng.speak(first.replace(/[💪🔥⚡🏆]/g, ''));
    }
  }, 15000);
}

function stopMotivation() {
  if (MOTIV_TIMER) { clearInterval(MOTIV_TIMER); MOTIV_TIMER = null; }
}

// ══════════════════════════════════════════════════
//  AUDIO FOCUS — Pausar música externa (Spotify, etc.)
// ══════════════════════════════════════════════════
const AudioFocus = {
  silentAudio: null,
  mediaSession: null,
  active: false,

  acquire() {
    if (this.active) return;
    try {
      // Crear audio silencioso que toma el audio focus del sistema
      if (!this.silentAudio) {
        this.silentAudio = new Audio();
        // Generar tono silencioso con AudioContext
        const actx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        gain.gain.value = 0.001; // prácticamente silencioso
        osc.connect(gain);
        gain.connect(actx.destination);
        const dest = actx.createMediaStreamDestination();
        gain.connect(dest);
        this.silentAudio.srcObject = dest.stream;
        this.silentAudio.loop = true;
      }
      this.silentAudio.play().then(() => {
        console.log('[AudioFocus] ✅ Audio focus adquirido — música externa pausada');
      }).catch(e => console.warn('[AudioFocus] No se pudo adquirir:', e));

      // MediaSession API para mostrar controles y tomar prioridad
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'DEBBIE PRO Timer',
          artist: 'Entrenamiento activo',
          album: 'DEBBIE PRO'
        });
        navigator.mediaSession.playbackState = 'playing';
        navigator.mediaSession.setActionHandler('pause', () => { pauseTimer(); AudioFocus.release(); });
        navigator.mediaSession.setActionHandler('play', () => { startTimer(); });
        console.log('[AudioFocus] ✅ MediaSession configurado');
      }
      this.active = true;
    } catch(e) { console.warn('[AudioFocus] Error:', e); }
  },

  release() {
    try {
      if (this.silentAudio) {
        this.silentAudio.pause();
        this.silentAudio.currentTime = 0;
      }
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
      this.active = false;
      console.log('[AudioFocus] 🔊 Audio focus liberado — música externa puede resumir');
    } catch(e) { console.warn('[AudioFocus] Error al liberar:', e); }
  }
};

// === PRE-COUNTDOWN 5-4-3-2-1 + MOTIVATIONAL START v34 ===
let PRE_COUNTDOWN_ACTIVE = false;
let PRE_COUNTDOWN_INT = null;

function startTimer() {
  if(TIMER_RUN || PRE_COUNTDOWN_ACTIVE) return;
  AudioEng.init();

  if(TIMER_MODE==='countdown'&&TIMER_SEC===0) TIMER_SEC=COUNTDOWN_FROM;
  if(TIMER_MODE==='tabata') { TABATA_CURRENT_ROUND=1; TABATA_IS_WORK=true; TIMER_SEC=TABATA_WORK; }
  if(TIMER_MODE==='emom') { EMOM_CURRENT_MIN=0; TIMER_SEC=60; }
  if(TIMER_MODE==='amrap') { TIMER_SEC=AMRAP_MINUTES*60; AMRAP_REPS=0; }

  runPreCountdown(function() { actualStartTimer(); });
}

function runPreCountdown(callback) {
  PRE_COUNTDOWN_ACTIVE = true;
  let count = 5;
  showPreCountdownOverlay(count);
  AudioEng.speak('Prep\u00e1rate atleta');
  setTimeout(function() { AudioEng.beep(660, 0.15); }, 800);

  PRE_COUNTDOWN_INT = setInterval(function() {
    count--;
    if (count > 0) {
      showPreCountdownOverlay(count);
      var freq = 660 + ((5 - count) * 80);
      AudioEng.beep(freq, 0.15);
      if (count <= 3) { AudioEng.speak('' + count); }
    } else {
      clearInterval(PRE_COUNTDOWN_INT);
      PRE_COUNTDOWN_INT = null;
      PRE_COUNTDOWN_ACTIVE = false;
      hidePreCountdownOverlay();
      AudioEng.tripleBeep();
      var startMsgs = [
        '\u00a1Dale con todo atleta!',
        '\u00a1Vamos, a darlo todo!',
        '\u00a1Es tu momento, destr\u00fayelo!',
        '\u00a1Sin excusas, a reventar!',
        '\u00a1Ahora es cuando, vamos!'
      ];
      var msg = startMsgs[Math.floor(Math.random() * startMsgs.length)];
      setTimeout(function() { AudioEng.speak(msg); }, 300);
      setTimeout(callback, 600);
    }
  }, 1000);
  renderTimer();
}

function showPreCountdownOverlay(num) {
  var overlay = document.getElementById('pre-countdown-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'pre-countdown-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;transition:opacity 0.3s ease;';
    document.body.appendChild(overlay);
  }
  overlay.style.opacity = '1';
  overlay.style.display = 'flex';
  var colors = { 5:'#00f0ff', 4:'#00ff88', 3:'#ffd93d', 2:'#ff9f43', 1:'#ff1744' };
  var color = colors[num] || '#00f0ff';
  var label = num > 1 ? 'PREP\u00c1RATE' : '\u00a1LISTO!';
  overlay.innerHTML = '<div style="font-size:8rem;font-weight:900;color:' + color + ';text-shadow:0 0 40px ' + color + ',0 0 80px ' + color + '44;animation:preCountPulse 0.5s ease;line-height:1;">' + num + '</div>' +
    '<div style="font-size:1.1rem;color:#ccc;margin-top:16px;font-weight:600;letter-spacing:1px;">' + label + '</div>' +
    '<style>@keyframes preCountPulse{0%{transform:scale(1.5);opacity:0.3}100%{transform:scale(1);opacity:1}}</style>';
}

function hidePreCountdownOverlay() {
  var overlay = document.getElementById('pre-countdown-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(function() { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 400);
  }
}

function cancelPreCountdown() {
  if (PRE_COUNTDOWN_INT) { clearInterval(PRE_COUNTDOWN_INT); PRE_COUNTDOWN_INT = null; }
  PRE_COUNTDOWN_ACTIVE = false;
  hidePreCountdownOverlay();
}

function actualStartTimer() {
  TIMER_RUN=true;
  if(TIMER_MODE==='tabata') { AudioEng.speak('\u00a1Trabajo!'); }
  if(TIMER_MODE==='emom') { AudioEng.speak('Minuto 1, \u00a1vamos!'); }
  if(TIMER_MODE==='amrap') { AudioEng.speak('AMRAP, '+AMRAP_MINUTES+' minutos, \u00a1vamos!'); }

  TIMER_INT=setInterval(function(){
    if(TIMER_MODE==='stopwatch'){
      TIMER_SEC++;
    }
    else if(TIMER_MODE==='countdown'){
      TIMER_SEC--;
      if(TIMER_SEC<=3&&TIMER_SEC>0) AudioEng.beep(880,0.15);
      if(TIMER_SEC<=0){TIMER_SEC=0;pauseTimer();AudioEng.tripleBeep();setTimeout(function(){AudioEng.motivate();},500);}
    }
    else if(TIMER_MODE==='tabata'){
      TIMER_SEC--;
      if(TIMER_SEC<=3&&TIMER_SEC>0) AudioEng.beep(TABATA_IS_WORK?880:660,0.12);
      if(TIMER_SEC<=0){
        if(TABATA_IS_WORK){
          TABATA_IS_WORK=false; TIMER_SEC=TABATA_REST;
          AudioEng.doubleBeep(); AudioEng.speak('Descanso');
        } else {
          TABATA_CURRENT_ROUND++;
          if(TABATA_CURRENT_ROUND>TABATA_ROUNDS){
            pauseTimer(); AudioEng.tripleBeep();
            setTimeout(function(){AudioEng.speak('\u00a1Tabata completado! Incre\u00edble trabajo');},300);
            return;
          }
          TABATA_IS_WORK=true; TIMER_SEC=TABATA_WORK;
          AudioEng.doubleBeep(); AudioEng.speak('Ronda '+TABATA_CURRENT_ROUND+', \u00a1trabajo!');
        }
      }
    }
    else if(TIMER_MODE==='emom'){
      TIMER_SEC--;
      if(TIMER_SEC<=3&&TIMER_SEC>0) AudioEng.beep(880,0.12);
      if(TIMER_SEC<=0){
        EMOM_CURRENT_MIN++;
        if(EMOM_CURRENT_MIN>=EMOM_MINUTES){
          pauseTimer(); AudioEng.tripleBeep();
          setTimeout(function(){AudioEng.speak('EMOM completado');},300);
          return;
        }
        TIMER_SEC=60;
        AudioEng.doubleBeep(); AudioEng.speak('Minuto '+(EMOM_CURRENT_MIN+1));
      }
    }
    else if(TIMER_MODE==='amrap'){
      TIMER_SEC--;
      if(TIMER_SEC<=10&&TIMER_SEC>0&&TIMER_SEC%5===0) AudioEng.beep(660,0.1);
      if(TIMER_SEC<=3&&TIMER_SEC>0) AudioEng.beep(880,0.15);
      if(TIMER_SEC<=0){
        TIMER_SEC=0; pauseTimer(); AudioEng.tripleBeep();
        setTimeout(function(){AudioEng.speak('Tiempo! '+AMRAP_REPS+' repeticiones totales. Gran trabajo!');},300);
      }
    }
    updateTimerDisplay();
  },1000);
  renderTimer();
}
// === END PRE-COUNTDOWN v34 ===

function pauseTimer(){TIMER_RUN=false;cancelPreCountdown();AudioFocus.release();stopMotivation();if(TIMER_INT){clearInterval(TIMER_INT);TIMER_INT=null;}renderTimer();}

function resetTimer(){
  pauseTimer();
  if(TIMER_MODE==='stopwatch') TIMER_SEC=0;
  else if(TIMER_MODE==='countdown') TIMER_SEC=COUNTDOWN_FROM;
  else if(TIMER_MODE==='tabata'){TIMER_SEC=TABATA_WORK;TABATA_CURRENT_ROUND=0;TABATA_IS_WORK=true;}
  else if(TIMER_MODE==='emom'){TIMER_SEC=60;EMOM_CURRENT_MIN=0;}
  else if(TIMER_MODE==='amrap'){TIMER_SEC=AMRAP_MINUTES*60;AMRAP_REPS=0;}
  renderTimer();
}

function quickRest(secs){
  TIMER_MODE='countdown';COUNTDOWN_FROM=secs;TIMER_SEC=secs;
  pauseTimer();renderTimer();startTimer();
  AudioEng.speak('Descanso de '+secs+' segundos');
}

function updateTimerDisplay(){
  const mins=Math.floor(TIMER_SEC/60);const secs=TIMER_SEC%60;
  const el=document.querySelector('.timer-display');
  if(el) el.textContent=String(mins).padStart(2,'0')+':'+String(secs).padStart(2,'0');
  const ring=$('timer-ring-progress');
  if(ring){
    const circ=565.48;let off=0;
    if(TIMER_MODE==='countdown'&&COUNTDOWN_FROM>0) off=circ*(1-TIMER_SEC/COUNTDOWN_FROM);
    else if(TIMER_MODE==='tabata'){const t=TABATA_IS_WORK?TABATA_WORK:TABATA_REST;if(t>0)off=circ*(1-TIMER_SEC/t);}
    else if(TIMER_MODE==='emom') off=circ*(1-(TIMER_SEC%60)/60);
    else if(TIMER_MODE==='amrap'&&AMRAP_MINUTES>0) off=circ*(1-TIMER_SEC/(AMRAP_MINUTES*60));
    else off=circ*(1-(TIMER_SEC%60)/60);
    ring.setAttribute('stroke-dashoffset',off);
    // Color
    let col='#00f0ff';
    if(TIMER_MODE==='tabata') col=TABATA_IS_WORK?'#ff2d75':'#00ff88';
    else if(TIMER_MODE==='emom') col='#ffd93d';
    else if(TIMER_MODE==='amrap') col='#a855f7';
    ring.setAttribute('stroke',col);
  }
}

// Bluetooth HR
let HR_DEVICE=null;
async function connectHR(){
  if(!navigator.bluetooth)return toast('Bluetooth no disponible');
  try{
    const device=await navigator.bluetooth.requestDevice({filters:[{services:['heart_rate']}]});
    HR_DEVICE=device;toast('Conectando a '+device.name+'...');
    const server=await device.gatt.connect();
    const service=await server.getPrimaryService('heart_rate');
    const char=await service.getCharacteristic('heart_rate_measurement');
    char.addEventListener('characteristicvaluechanged',e=>{
      const v=e.target.value;const flags=v.getUint8(0);
      let hr;if(flags&0x01)hr=v.getUint16(1,true);else hr=v.getUint8(1);
      const el=$('hr-value');if(el)el.textContent=hr;
    });
    await char.startNotifications();
    toast('💓 Smartwatch conectado');
    const btn=$('btn-connect-hr');if(btn){btn.textContent='Conectado: '+device.name;btn.disabled=true;}
  }catch(e){if(e.name!=='NotFoundError')toast('Error: '+e.message);}
}

// ══════════════════════════════════════════════════
//  NUTRICIÓN + TRACKER DE AGUA
// ══════════════════════════════════════════════════

function renderNutrition() {
  const c=$('tab-nutri');if(!c)return;
  const tCal=PROF?.targetCal||2000;
  const tProt=PROF?.targetProt||150;
  const tCarbs=PROF?.targetCarbs||250;
  const tFat=PROF?.targetFat||55;

  let sCal=0,sProt=0,sCarbs=0,sFat=0;
  NUTRI_LOG.forEach(item=>{const q=item.qty||1;sCal+=(item.cal||0)*q;sProt+=(item.p||0)*q;sCarbs+=(item.c||0)*q;sFat+=(item.g||0)*q;});

  const calPct=Math.min(Math.round(sCal/tCal*100),100);
  const protPct=Math.min(Math.round(sProt/tProt*100),100);
  const carbsPct=Math.min(Math.round(sCarbs/tCarbs*100),100);
  const fatPct=Math.min(Math.round(sFat/tFat*100),100);

  let html='<div class="nutri-container">';

  // Fecha nav
  html+='<div class="nutri-date-nav"><button class="btn-icon" onclick="changeNutriDate(-1)">◀</button><span class="nutri-date">'+NUTRI_DATE+'</span><button class="btn-icon" onclick="changeNutriDate(1)">▶</button></div>';

  // Meta diaria banner
  html+='<div class="nutri-goal-banner glass-card"><div class="nutri-goal-header"><span class="nutri-goal-title">🎯 Meta diaria</span><span class="nutri-goal-val">'+tCal+' kcal</span></div><div class="nutri-goal-bar-wrap"><div class="nutri-goal-bar" style="width:'+calPct+'%"></div></div><div class="nutri-goal-detail"><span>Consumido: <strong>'+Math.round(sCal)+'</strong> kcal</span><span>Restante: <strong>'+Math.max(0,Math.round(tCal-sCal))+'</strong> kcal</span></div></div>';

  // Macros rings
  html+='<div class="macros-summary glass-card"><div class="macro-ring-wrap">';
  const macros=[
    {label:'Calorías',val:Math.round(sCal),target:tCal,color:'#00f0ff',unit:''},
    {label:'Proteína',val:Math.round(sProt),target:tProt,color:'#ff6b6b',unit:'g'},
    {label:'Carbos',val:Math.round(sCarbs),target:tCarbs,color:'#ffd93d',unit:'g'},
    {label:'Grasas',val:Math.round(sFat),target:tFat,color:'#a29bfe',unit:'g'}
  ];
  macros.forEach(m=>{
    const pct=m.target>0?Math.min(m.val/m.target,1):0;
    const off=219.91*(1-pct);
    html+='<div class="macro-item"><svg class="macro-ring" viewBox="0 0 80 80"><circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="5"/><circle cx="40" cy="40" r="35" fill="none" stroke="'+m.color+'" stroke-width="5" stroke-dasharray="219.91" stroke-dashoffset="'+off+'" stroke-linecap="round" transform="rotate(-90 40 40)"/></svg><div class="macro-center"><strong>'+m.val+m.unit+'</strong><small>/'+m.target+m.unit+'</small></div><span class="macro-label">'+m.label+'</span></div>';
  });
  html+='</div></div>';

  // WATER TRACKER
  html+='<div class="water-tracker glass-card"><div class="section-title">💧 Hidratación</div><div class="water-info"><span class="water-count">'+WATER_COUNT+' / 8 vasos</span><span class="water-ml">'+(WATER_COUNT*250)+' ml</span></div><div class="water-glasses">';
  for(let i=0;i<8;i++){
    html+='<div class="water-glass '+(i<WATER_COUNT?'filled':'')+'" onclick="setWater('+(i+1)+')"><svg viewBox="0 0 24 32" width="28" height="36"><path d="M4 4 L6 28 C6 30 8 30 8 30 L16 30 C16 30 18 30 18 28 L20 4 Z" fill="'+(i<WATER_COUNT?'rgba(0,180,255,0.4)':'rgba(255,255,255,0.05)')+'" stroke="'+(i<WATER_COUNT?'#00b4ff':'rgba(255,255,255,0.15)')+'" stroke-width="1.5"/>'+(i<WATER_COUNT?'<path d="M6 16 Q12 12 18 16 Q12 20 6 16 Z" fill="rgba(0,200,255,0.3)"/>':'')+'</svg></div>';
  }
  html+='</div><div class="water-btns"><button class="btn-glass btn-sm" onclick="setWater(Math.max(0,WATER_COUNT-1))">- Quitar</button><button class="btn-neon btn-sm" onclick="setWater(WATER_COUNT+1)">+ Vaso (250ml)</button></div></div>';

  // Agregar alimento
  html+='<div class="nutri-add glass-card"><div class="section-title">➕ Agregar alimento</div><div class="nutri-search-wrap"><input type="text" id="food-search" class="glass-input" placeholder="Buscar alimento..." oninput="filterFoods()"></div><div id="food-results" class="food-results"></div>';
  html+='<div class="nutri-custom"><div class="section-title" style="margin-top:15px">✏️ Personalizado</div><div class="custom-food-grid"><input type="text" id="cf-name" class="glass-input" placeholder="Nombre"><input type="number" id="cf-cal" class="glass-input mini" placeholder="kcal"><input type="number" id="cf-prot" class="glass-input mini" placeholder="Prot(g)"><input type="number" id="cf-carbs" class="glass-input mini" placeholder="Carbs(g)"><input type="number" id="cf-fat" class="glass-input mini" placeholder="Grasa(g)"></div><button class="btn-glass btn-sm" onclick="addCustomFood()" style="margin-top:8px">+ Agregar</button></div></div>';

  // Registro del día
  html+='<div class="nutri-log glass-card"><div class="section-title">📋 Registro del día</div><div id="nutri-log-list">';
  if(NUTRI_LOG.length===0) html+='<p class="empty-text">No has registrado alimentos hoy</p>';
  else NUTRI_LOG.forEach((item,i)=>{
    const q=item.qty||1;
    html+='<div class="nutri-log-item"><div class="nli-info"><strong>'+item.n+'</strong><span class="nli-meta">'+Math.round(item.cal*q)+' kcal · P:'+Math.round(item.p*q)+'g · C:'+Math.round(item.c*q)+'g · G:'+Math.round(item.g*q)+'g</span></div><div class="nli-actions"><select class="glass-input mini qty-sel" onchange="updateFoodQty('+i+',this.value)">'+[0.5,1,1.5,2,2.5,3].map(qq=>'<option value="'+qq+'" '+(q==qq?'selected':'')+'>'+qq+'x</option>').join('')+'</select><button class="btn-icon btn-danger" onclick="removeFood('+i+')">✕</button></div></div>';
  });
  html+='</div></div></div>';
  c.innerHTML=html;
}

function filterFoods(){
  const q=($('food-search')?.value||'').toLowerCase();
  const container=$('food-results');if(!container)return;
  if(q.length<2){container.innerHTML='';return;}
  const results=FOODS.filter(f=>f.n.toLowerCase().includes(q));
  container.innerHTML=results.map(f=>'<div class="food-item" onclick="addFood(\''+f.n.replace(/'/g,"\\'")+'\','+f.cal+','+f.p+','+f.c+','+f.g+')"><span class="fi-name">'+f.n+'</span><span class="fi-macros">'+f.cal+'kcal · P:'+f.p+'g · C:'+f.c+'g · G:'+f.g+'g</span></div>').join('');
}

function addFood(name,cal,p,c,g){NUTRI_LOG.push({n:name,cal,p,c,g,qty:1});saveNutriLog();renderNutrition();toast('+ '+name);}

async function addCustomFood(){
  var name = ($('cf-name') ? $('cf-name').value : '').trim();
  var cal = parseFloat($('cf-cal') ? $('cf-cal').value : 0) || 0;
  var p = parseFloat($('cf-prot') ? $('cf-prot').value : 0) || 0;
  var c = parseFloat($('cf-carbs') ? $('cf-carbs').value : 0) || 0;
  var g = parseFloat($('cf-fat') ? $('cf-fat').value : 0) || 0;
  if (!name) return toast('Ingresa el nombre del alimento');
  if (!cal) return toast('Ingresa las calorías');

  // 1. Agregar al log del día
  NUTRI_LOG.push({ n: name, cal: cal, p: p, c: c, g: g, qty: 1 });
  saveNutriLog();

  // 2. Agregar al array FOODS local para búsqueda inmediata
  if (!FOODS.find(function(x) { return x.n.toLowerCase() === name.toLowerCase(); })) {
    FOODS.push({ n: name, cal: cal, p: p, c: c, g: g });
    console.log('Alimento agregado a FOODS local: ' + name);
  }

  // 3. Guardar en Firestore shared_foods (base compartida)
  try {
    var existing = await db.collection('shared_foods').where('n', '==', name).limit(1).get();
    if (existing.empty) {
      await db.collection('shared_foods').add({
        n: name, cal: cal, p: p, c: c, g: g,
        addedBy: U ? U.uid : 'anon',
        addedByName: (PROF && PROF.name) ? PROF.name : 'Anónimo',
        createdAt: new Date().toISOString()
      });
      toast('✅ ' + name + ' agregado a la base compartida');
      console.log('Alimento guardado en Firestore: ' + name);
    } else {
      toast('+ ' + name + ' (ya existía en la base)');
    }
  } catch(e) {
    console.warn('Error guardando alimento compartido:', e);
    toast('+ ' + name + ' (guardado local)');
  }

  // 4. Limpiar campos
  if ($('cf-name')) $('cf-name').value = '';
  if ($('cf-cal')) $('cf-cal').value = '';
  if ($('cf-prot')) $('cf-prot').value = '';
  if ($('cf-carbs')) $('cf-carbs').value = '';
  if ($('cf-fat')) $('cf-fat').value = '';

  renderNutrition();
}


function updateFoodQty(idx,val){NUTRI_LOG[idx].qty=parseFloat(val)||1;saveNutriLog();renderNutrition();}
function removeFood(idx){NUTRI_LOG.splice(idx,1);saveNutriLog();renderNutrition();}

function setWater(count){
  WATER_COUNT=Math.min(Math.max(0,count),12);
  saveNutriLog();renderNutrition();
  if(WATER_COUNT===8){toast('💧 ¡Meta de hidratación alcanzada!');AudioEng.beep(1100,0.2);}
}

async function saveNutriLog(){
  if(!U)return;
  try{await db.collection('users').doc(U.uid).collection('nutrition').doc(NUTRI_DATE).set({date:NUTRI_DATE,items:NUTRI_LOG,water:WATER_COUNT,updatedAt:firebase.firestore.FieldValue.serverTimestamp()});}
  catch(e){console.error('Nutri save:',e);}
}

async function loadNutriLog(){
  if(!U)return;
  try{
    const doc=await db.collection('users').doc(U.uid).collection('nutrition').doc(NUTRI_DATE).get();
    if(doc.exists){NUTRI_LOG=doc.data().items||[];WATER_COUNT=doc.data().water||0;}
    else{NUTRI_LOG=[];WATER_COUNT=0;}
  }catch(e){NUTRI_LOG=[];WATER_COUNT=0;}
}

async function changeNutriDate(dir){
  const d=new Date(NUTRI_DATE);d.setDate(d.getDate()+dir);NUTRI_DATE=fmt(d);
  await loadNutriLog();renderNutrition();
}

// ══════════════════════════════════════════════════
//  PERFIL + CAMBIO DE ROL
// ══════════════════════════════════════════════════

async function renderProfile(){
  const c=$('tab-perfil');if(!c)return;
  const isTrainer=ROLE==='trainer';
  let html='<div class="profile-container">';

  // Header
  html+='<div class="profile-header glass-card"><div class="profile-avatar">'+(PROF?.name||'U')[0].toUpperCase()+'</div><h3>'+(PROF?.name||'Usuario')+'</h3><span class="profile-role '+ROLE+'">'+(isTrainer?'🏋️ Entrenador':'💪 Atleta')+'</span><span class="profile-email">'+(PROF?.email||'')+'</span></div>';

  // Datos físicos
  html+='<div class="profile-stats glass-card"><div class="section-title">📊 Datos físicos</div><div class="profile-grid"><div class="pg-item"><label>Edad</label><span>'+(PROF?.age||'—')+' años</span></div><div class="pg-item"><label>Sexo</label><span>'+(PROF?.sex==='M'?'Masculino':PROF?.sex==='F'?'Femenino':PROF?.sex||'—')+'</span></div><div class="pg-item"><label>Altura</label><span>'+(PROF?.height||'—')+' cm</span></div><div class="pg-item"><label>Peso</label><span>'+(PROF?.weight||'—')+' kg</span></div><div class="pg-item"><label>IMC</label><span>'+(PROF?.height&&PROF?.weight?(PROF.weight/((PROF.height/100)**2)).toFixed(1):'—')+'</span></div></div></div>';

  if(!isTrainer){
    // Metas y plan nutricional
    html+='<div class="profile-goals glass-card"><div class="section-title">🎯 Metas y Plan Nutricional</div><div class="profile-grid"><div class="pg-item"><label>Meta principal</label><span>'+(goalLabel(PROF?.mainGoal)||'—')+'</span></div><div class="pg-item"><label>Nivel actividad</label><span>'+(actLabel(PROF?.activity)||'—')+'</span></div><div class="pg-item"><label>Días/semana</label><span>'+(PROF?.trainingDays||'—')+'</span></div><div class="pg-item full"><label>Metas personales</label><span>'+(PROF?.personalGoals||'—')+'</span></div><div class="pg-item full"><label>Lesiones/restricciones</label><span>'+(PROF?.injuries||'Ninguna')+'</span></div></div>';
    html+='<div class="nutri-plan"><div class="section-title" style="margin-top:15px">🍎 Plan Nutricional Calculado</div><div class="profile-grid"><div class="pg-item"><label>TMB</label><span>'+(PROF?.bmr||'—')+' kcal</span></div><div class="pg-item"><label>TDEE</label><span>'+(PROF?.tdee||'—')+' kcal</span></div><div class="pg-item"><label>Objetivo diario</label><span class="highlight">'+(PROF?.targetCal||'—')+' kcal</span></div><div class="pg-item"><label>Proteína</label><span>'+(PROF?.targetProt||'—')+'g</span></div><div class="pg-item"><label>Carbohidratos</label><span>'+(PROF?.targetCarbs||'—')+'g</span></div><div class="pg-item"><label>Grasas</label><span>'+(PROF?.targetFat||'—')+'g</span></div></div></div></div>';
  } else {
    html+='<div class="profile-trainer glass-card"><div class="section-title">🏋️ Info Entrenador</div><div class="profile-grid"><div class="pg-item"><label>Especialidad</label><span>'+(PROF?.specialty||'—')+'</span></div><div class="pg-item"><label>Experiencia</label><span>'+(PROF?.experience||'—')+' años</span></div><div class="pg-item full"><label>Certificaciones</label><span>'+(PROF?.certifications||'—')+'</span></div><div class="pg-item"><label>Clientes</label><span>'+((PROF?.clients||[]).length)+'</span></div></div></div>';
  }

  if(PROF?.trainerId){
    html+='<div class="profile-mytrainer glass-card"><div class="section-title">👨‍🏫 Mi Entrenador</div><p>'+(PROF.trainerName||'Entrenador asignado')+'</p></div>';
  }

  // Battle Mode Status
  try {
    const uBattle = await db.collection('users').doc(U.uid).get();
    if (uBattle.exists) {
      const ub = uBattle.data();
      const bWins = ub.battlesWon || 0;
      if (bWins > 0) {
        const tEmoji = ub.championEmoji || '⚔️';
        const tTitle = ub.championTitle || 'Guerrero';
        const tColor = ub.championColor || '#ffcc00';
        html += '<div class="profile-battle glass-card"><div class="section-title">⚔️ Modo Battle</div><div class="battle-profile-content"><div class="battle-crown-big">👑</div><div class="battle-title-big" style="color:' + tColor + '">' + tEmoji + ' ' + tTitle + '</div><div class="battle-wins-count">' + bWins + ' victoria' + (bWins > 1 ? 's' : '') + '</div><div class="battle-last-win">Última: ' + (ub.lastBattleWon || '—') + '</div></div></div>';
      }
    }
  } catch(e) {}

  // Badges
  html+='<div class="profile-badges glass-card"><div class="section-title">🏅 Insignias</div><div class="badges-grid">'+BADGES.map(b=>'<div class="badge-item locked"><span class="badge-icon">'+b.icon+'</span><span class="badge-name">'+b.name+'</span></div>').join('')+'</div></div>';

  // Acciones
  html+='<div class="profile-actions">';
  html+='<button class="btn-glass" onclick="showGoalsSurvey()">✏️ Editar perfil</button>';
  if(!isTrainer) html+='<button class="btn-neon btn-assign" onclick="showUpgradeToTrainer()">🏋️ Modo Entrenador</button>';
  else html+='<button class="btn-glass" onclick="downgradeToClient()">💪 Volver a Atleta</button>';
  html+='</div>';
  html+='<div class="profile-actions" style="margin-top:8px"><button class="btn-glass btn-danger-outline btn-full" onclick="doLogout()">🚪 Cerrar sesión</button></div>';

  html+='</div>';
  c.innerHTML=html;
  loadBadges();
}

async function loadBadges(){
  if(!U)return;
  try{
    const doc=await db.collection('users').doc(U.uid).collection('stats').doc('general').get();
    if(!doc.exists)return;
    const s=doc.data();const earned=[];
    if((s.totalCompleted||0)>=1)earned.push('first');
    if((s.totalCompleted||0)>=50)earned.push('heavy');
    // Battle badges from user doc
    try{
      const uDoc=await db.collection('users').doc(U.uid).get();
      if(uDoc.exists){
        const bw=uDoc.data().battlesWon||0;
        if(bw>=1)earned.push('warrior');
        if(bw>=2)earned.push('gladiator');
        if(bw>=3)earned.push('immortal');
      }
    }catch(e){}
    document.querySelectorAll('.badge-item').forEach(el=>{
      const name=el.querySelector('.badge-name')?.textContent;
      const badge=BADGES.find(b=>b.name===name);
      if(badge&&earned.includes(badge.id)){el.classList.remove('locked');el.classList.add('earned');}
    });
  }catch(e){}
}

// ══════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════


// V45b: MICROCAPSULAS IA - Guia de ejercicios con Puter.js (GRATIS, SIN LIMITES)
const _guideCache = {};

function showExerciseGuide(btn) {
  var item = btn.closest('.exercise-item') || btn.closest('[class*=ex]');
  var exName = '';
  if (item) {
    var nameEl = item.querySelector('.ex-name, .exercise-name, strong, b');
    if (nameEl) exName = nameEl.textContent.trim();
  }
  if (!exName) { toast('No se encontro el nombre del ejercicio'); return; }
  openGuideModal(exName);
}

async function openGuideModal(exerciseName) {
  var modal = document.getElementById('ai-guide-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ai-guide-modal';
    modal.className = 'ai-guide-overlay';
    document.body.appendChild(modal);
  }
  modal.innerHTML = '<div class="ai-guide-content">' +
    '<div class="ai-guide-header"><h3>' + exerciseName + '</h3>' +
    '<button class="btn-icon ai-guide-close" onclick="closeExerciseGuide()">X</button></div>' +
    '<div class="ai-guide-body"><div class="ai-guide-loading">' +
    '<div class="ai-spinner"></div><p>Generando microcapsula con IA...</p></div></div></div>';
  modal.classList.add('active');

  // Check memory cache
  if (_guideCache[exerciseName]) {
    renderGuide(exerciseName, _guideCache[exerciseName]);
    return;
  }

  // Check Firestore cache
  try {
    var cacheId = exerciseName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 60);
    var cacheDoc = await db.collection('exercise_guides').doc(cacheId).get();
    if (cacheDoc.exists) {
      _guideCache[exerciseName] = cacheDoc.data().guide;
      renderGuide(exerciseName, cacheDoc.data().guide);
      return;
    }
  } catch(e) { console.warn('Cache miss:', e); }

  // Call Puter.js AI (FREE, no API key, no limits)
  try {
    if (typeof puter === 'undefined' || !puter.ai) {
      throw new Error('Puter.js no cargado. Recarga la pagina.');
    }
    var prompt = 'Eres un entrenador personal experto. Genera una microcapsula educativa BREVE sobre el ejercicio: ' + exerciseName + '. IMPORTANTE: En la PRIMERA linea escribe EXACTAMENTE asi: ENGLISH_NAME: [nombre del ejercicio en ingles]. Luego el formato: MUSCULO OBJETIVO (1 linea), POSICION INICIAL (2 lineas), EJECUCION (3-4 pasos numerados), RESPIRACION (1 linea), ERRORES COMUNES (2-3 errores), TIP PRO (1 consejo). Se conciso y motivador. Responde en espanol excepto la primera linea.';

        // Add 15s timeout
    var timeoutPromise = new Promise(function(_, reject) {
      setTimeout(function() { reject(new Error('Timeout: La IA tardo mas de 15s')); }, 15000);
    });
    var aiPromise = puter.ai.chat(prompt, { model: 'gpt-4o-mini' });
    var response = await Promise.race([aiPromise, timeoutPromise]);
    var guide = (typeof response === 'string') ? response : (response.message && response.message.content ? response.message.content : String(response));

    if (!guide || guide.length < 20) throw new Error('Respuesta vacia');

    _guideCache[exerciseName] = guide;
    try {
      var cacheId = exerciseName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 60);
      await db.collection('exercise_guides').doc(cacheId).set({
        name: exerciseName, guide: guide, createdAt: new Date().toISOString()
      });
    } catch(e) { console.warn('Cache save error:', e); }

    renderGuide(exerciseName, guide);
  } catch(e) {
    console.error('AI Guide error:', e);
    var body = document.querySelector('.ai-guide-body');
    console.error('AI GUIDE FULL ERROR:', e, JSON.stringify(e));
    if (body) body.innerHTML = '<div class="ai-guide-error"><p>Error: ' + e.message + '</p><p style="font-size:0.7em;color:#888">' + (e.stack || '') + '</p><button class="btn-neon" onclick="openGuideModal(\x27' + exerciseName.replace(/'/g,'') + '\x27)">Reintentar</button><br><button class="btn-glass" onclick="closeExerciseGuide()" style="margin-top:8px">Cerrar</button></div>';
  }
}

function renderGuide(name, guide) {
  var body = document.querySelector('.ai-guide-body');
  if (!body) return;

  // Extract English name for GIF lookup
  var engName = '';
  var guideText = guide;
  var engMatch = guide.match(/ENGLISH_NAME:\s*(.+)/i);
  if (engMatch) {
    engName = engMatch[1].trim();
    guideText = guide.replace(/ENGLISH_NAME:\s*.+\n?/i, '');
  }

  // Build GIF section from free-exercise-db
  var gifHtml = '';
  if (engName) {
    var gifId = engName.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
    var gifUrl = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/' + gifId + '/0.jpg';
    var gifUrl2 = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/' + gifId + '/1.jpg';
    gifHtml = '<div class="ai-guide-gif">' +
      '<img src="' + gifUrl + '" alt="' + engName + '" onerror="this.style.display=\'none\'" />' +
      '<img src="' + gifUrl2 + '" alt="' + engName + '" onerror="this.style.display=\'none\'" />' +
      '</div>';
  }

  var formatted = guideText.replace(/\n/g, '<br>');
  body.innerHTML = gifHtml + '<div class="ai-guide-text">' + formatted + '</div>' +
    '<div class="ai-guide-actions">' +
    '<button class="btn-neon btn-sm" onclick="speakGuide()">Escuchar</button>' +
    '<button class="btn-glass btn-sm" onclick="closeExerciseGuide()">Cerrar</button></div>';
  body.dataset.rawGuide = guide;
}

function speakGuide() {
  var body = document.querySelector('.ai-guide-body');
  if (!body || !body.dataset.rawGuide) return;
  var text = body.dataset.rawGuide.replace(/\n/g, '. ');
  if (typeof AudioEng !== 'undefined' && AudioEng.speak) { AudioEng.speak(text); }
  else { var u = new SpeechSynthesisUtterance(text); u.lang = 'es-ES'; speechSynthesis.speak(u); }
  toast('Reproduciendo guia de ejercicio');
}
function closeExerciseGuide() {
  var modal = document.getElementById('ai-guide-modal');
  if (modal) { modal.classList.remove('active'); setTimeout(function(){ modal.innerHTML=''; }, 300); }
}

auth.onAuthStateChanged(async user=>{
  if(user){U=user;await loadProfile();
  // AUTO-FIX batalla Z2OzJoLMFsxrqrspPmpX (remover despues)
  try {
    const _fbid = 'Z2OzJoLMFsxrqrspPmpX';
    const _bdoc = await db.collection('battles').doc(_fbid).get();
    if (_bdoc.exists) {
      const _bdata = _bdoc.data();
      const _bparts = _bdata.participants || {};
      for (const _uid of Object.keys(_bparts)) {
        const _sref = db.collection('users').doc(_uid).collection('battles').doc(_fbid);
        const _sdoc = await _sref.get();
        if (!_sdoc.exists) {
          await _sref.set({
            battleId: _fbid, battleName: _bdata.name || 'Batalla',
            trainerId: _bdata.trainerId, trainerName: _bdata.trainerName || '',
            routineName: _bdata.routineName || '', type: _bdata.type,
            status: _bdata.status, createdAt: _bdata.createdAt
          });
          console.log('BATALLA REPARADA para: ' + _uid);
        }
      }
      console.log('Batalla ' + _fbid + ' verificada OK');
    }
  } catch(e) { console.warn('Fix batalla:', e); }
}
  else{U=null;PROF=null;$('login-screen').style.display='flex';$('app-main').style.display='none';$('goals-screen').style.display='none';$('role-screen').style.display='none';}
});

document.addEventListener('DOMContentLoaded',()=>{
  const lb=$('btn-login');if(lb)lb.addEventListener('click',doLogin);
  const pi=$('login-pass');if(pi)pi.addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
  document.querySelectorAll('.nav-btn').forEach(btn=>{btn.addEventListener('click',()=>{const tab=btn.dataset.tab;if(tab)showTab(tab);});});
});

if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/sw.js').then(r=>console.log('SW:',r.scope)).catch(e=>console.warn('SW err:',e));
}

console.log('DEBBIE PRO v16 — Listo ✅');


// ============================================================
//  OVERRIDE handleAuth — FIX DEFINITIVO
// ============================================================
handleAuth = async function() {
  const email = (document.getElementById('login-email')?.value || '').trim();
  const pass  = document.getElementById('login-pass')?.value || '';
  const code  = (document.getElementById('login-code')?.value || '').trim();
  const btn   = document.getElementById('btn-login');

  console.log('🚀 handleAuth OVERRIDE ejecutándose...');
  console.log('📧 Email:', email, '🔑 Código:', code ? 'SÍ' : 'NO');

  if (!email || !pass) {
    showToast('Ingresa correo y contraseña', 'error');
    return;
  }
  if (pass.length < 6) {
    showToast('La contraseña debe tener al menos 6 caracteres', 'error');
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Procesando...'; }

  try {

    // ── CON CÓDIGO DEBBIE2026 → REGISTRO PRIMERO ──
    if (code === 'DEBBIE2026') {
      console.log('🔑 Código DEBBIE2026 detectado → REGISTRANDO...');
      try {
        const cred = await firebase.auth().createUserWithEmailAndPassword(email, pass);
        console.log('✅ REGISTRO EXITOSO — UID:', cred.user.uid);
        showToast('¡Cuenta creada exitosamente! 🎉', 'success');
        return;
      } catch (e) {
        console.warn('⚠️ Registro falló:', e.code, e.message);
        if (e.code === 'auth/email-already-in-use') {
          console.log('📧 Ya existe → intentando LOGIN...');
          const cred = await firebase.auth().signInWithEmailAndPassword(email, pass);
          console.log('✅ LOGIN EXITOSO — UID:', cred.user.uid);
          showToast('¡Bienvenido de vuelta! 💪', 'success');
          return;
        }
        if (e.code === 'auth/too-many-requests') {
          showToast('Firebase bloqueó temporalmente. Espera 15 min o cambia de red.', 'error');
          return;
        }
        showToast('Error al registrar: ' + e.message, 'error');
        return;
      }
    }

    // ── SIN CÓDIGO → SOLO LOGIN ──
    console.log('🔐 Sin código → LOGIN directo...');
    try {
      const cred = await firebase.auth().signInWithEmailAndPassword(email, pass);
      console.log('✅ LOGIN EXITOSO — UID:', cred.user.uid);
      showToast('¡Bienvenido de vuelta! 💪', 'success');
    } catch (e) {
      console.error('❌ Login falló:', e.code, e.message);
      if (e.code === 'auth/too-many-requests') {
        showToast('Firebase bloqueó temporalmente. Espera 15 min o cambia de red.', 'error');
      } else if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-login-credentials') {
        showToast('Cuenta no encontrada. Escribe DEBBIE2026 en clave de acceso para registrarte.', 'error');
      } else if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        showToast('Contraseña incorrecta.', 'error');
      } else {
        showToast('Error: ' + e.message, 'error');
      }
    }

  } catch (err) {
    console.error('💥 Error general:', err);
    showToast('Error inesperado: ' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = 'Ingresar <span style="margin-left:8px">&rarr;</span>';
    }
  }
};

console.log('✅ handleAuth OVERRIDE cargado correctamente');


// ============================================================
//  EJERCICIOS OLÍMPICOS — Levantamiento con Barra
// ============================================================
if (typeof EX !== 'undefined') {

  // Agregar grupo muscular si no existe
  if (!EX['Levantamiento Olímpico']) {
    EX['Levantamiento Olímpico'] = [];
  }

  const OLYMPIC = [
    // ── SNATCH (Arranque) ──
    { name: 'Snatch (Arranque)', equip: 'Barra Olímpica', level: 'avanzado',
      desc: 'Levantamiento completo desde el suelo hasta overhead en un movimiento continuo. Agarre amplio, extensión explosiva de caderas.' },
    { name: 'Snatch Balance', equip: 'Barra Olímpica', level: 'avanzado',
      desc: 'Con barra en espalda, saltar y recibir en squat profundo con barra overhead. Desarrolla velocidad de recepción y estabilidad.' },
    { name: 'Squat Snatch (Arranque en Sentadilla)', equip: 'Barra Olímpica', level: 'avanzado',
      desc: 'Snatch completo recibiendo en sentadilla profunda. La versión más técnica y completa del arranque.' },
    { name: 'Hip Snatch (Arranque desde Cadera)', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Snatch iniciando con la barra a la altura de la cadera. Enfatiza la extensión explosiva sin el tirón desde el suelo.' },
    { name: 'Muscle Snatch (Arranque Muscular)', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Snatch sin recepción en squat — la barra va directamente overhead con fuerza de brazos y extensión. Excelente para aprender la trayectoria.' },
    { name: 'Overhead Squat (Sentadilla Overhead)', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Sentadilla profunda con barra sostenida overhead con agarre de snatch. Trabaja movilidad, core y estabilidad de hombros.' },
    { name: 'Power Snatch (Arranque en Potencia)', equip: 'Barra Olímpica', level: 'avanzado',
      desc: 'Snatch completo recibiendo en media sentadilla (por encima del paralelo). Más potencia, menos movilidad requerida.' },
    { name: 'Hang Snatch (Arranque Colgante)', equip: 'Barra Olímpica', level: 'avanzado',
      desc: 'Snatch desde posición colgante (barra por encima de rodillas). Trabaja la segunda fase del tirón.' },
    { name: 'Snatch Pull (Tirón de Arranque)', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Primera y segunda fase del snatch sin recepción overhead. Desarrolla fuerza de tirón y extensión triple.' },
    { name: 'Snatch Grip Deadlift', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Peso muerto con agarre amplio de snatch. Fortalece la posición inicial y la espalda para el arranque.' },
    { name: 'Snatch High Pull', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Tirón alto con agarre de snatch hasta la altura del pecho. Desarrolla potencia y velocidad de codos.' },
    { name: 'Sotts Press', equip: 'Barra Olímpica', level: 'avanzado',
      desc: 'Press overhead desde posición de sentadilla profunda. Extrema movilidad y estabilidad. Ejercicio de corrección.' },

    // ── CLEAN (Cargada) ──
    { name: 'Clean (Cargada)', equip: 'Barra Olímpica', level: 'avanzado',
      desc: 'Levantamiento desde el suelo hasta los hombros (posición de rack) en un movimiento explosivo.' },
    { name: 'Power Clean (Cargada en Potencia)', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Clean recibiendo en media sentadilla. Muy usado en programas de fuerza y acondicionamiento.' },
    { name: 'Squat Clean (Cargada en Sentadilla)', equip: 'Barra Olímpica', level: 'avanzado',
      desc: 'Clean completo recibiendo en sentadilla frontal profunda. Permite levantar más peso.' },
    { name: 'Hang Clean (Cargada Colgante)', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Clean desde posición colgante por encima de rodillas. Enfoca la explosividad de la segunda fase.' },
    { name: 'Hip Clean (Cargada desde Cadera)', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Clean iniciando desde la cadera. Aísla la extensión de cadera y la velocidad de recepción.' },
    { name: 'Muscle Clean (Cargada Muscular)', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Clean sin recepción en squat — barra directo a posición de rack con fuerza de brazos.' },
    { name: 'Clean Pull (Tirón de Cargada)', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Fase de tirón del clean sin recepción. Desarrolla fuerza y velocidad del pull.' },
    { name: 'Clean High Pull', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Tirón alto con agarre de clean. La barra llega a la altura del pecho con codos altos.' },

    // ── JERK (Envión) ──
    { name: 'Jerk (Envión)', equip: 'Barra Olímpica', level: 'avanzado',
      desc: 'Envío de la barra desde los hombros hasta overhead usando las piernas. Parte del Clean & Jerk.' },
    { name: 'Split Jerk (Envión en Tijera)', equip: 'Barra Olímpica', level: 'avanzado',
      desc: 'Jerk recibiendo en posición de tijera (split). La técnica más común en competición.' },
    { name: 'Push Jerk (Envión en Empuje)', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Jerk recibiendo en media sentadilla con pies paralelos. Más simple que el split.' },
    { name: 'Push Press', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Press overhead usando impulso de piernas (dip and drive). Puente entre press estricto y jerk.' },
    { name: 'Squat Jerk (Envión en Sentadilla)', equip: 'Barra Olímpica', level: 'avanzado',
      desc: 'Jerk recibiendo en sentadilla profunda overhead. Requiere movilidad extrema. Usado por algunos atletas élite.' },

    // ── COMPLEJOS ──
    { name: 'Clean & Jerk (Dos Tiempos)', equip: 'Barra Olímpica', level: 'avanzado',
      desc: 'El movimiento olímpico completo: cargada al pecho + envión overhead. Prueba reina del levantamiento olímpico.' },
    { name: 'Clean & Press', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Cargada seguida de press estricto overhead. Más controlado que el jerk.' },
    { name: 'Snatch + Overhead Squat Complex', equip: 'Barra Olímpica', level: 'avanzado',
      desc: 'Complejo: 1 snatch + 2 overhead squats. Trabaja técnica y estabilidad.' },
    { name: 'Clean + Front Squat + Jerk Complex', equip: 'Barra Olímpica', level: 'avanzado',
      desc: 'Complejo: 1 clean + 1 front squat + 1 jerk. Desarrolla todas las fases del dos tiempos.' },
    { name: 'Barbell Thruster', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Sentadilla frontal directamente a press overhead en un movimiento fluido. Usado en CrossFit y acondicionamiento.' },

    // ── ACCESORIOS OLÍMPICOS ──
    { name: 'Front Squat (Sentadilla Frontal)', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Sentadilla con barra en posición de rack frontal. Esencial para el clean y la fuerza de piernas.' },
    { name: 'Back Squat (Sentadilla Trasera)', equip: 'Barra Olímpica', level: 'principiante',
      desc: 'Sentadilla con barra en espalda alta. La base de todo programa de fuerza.' },
    { name: 'Romanian Deadlift con Barra', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Peso muerto rumano con barra olímpica. Fortalece isquiotibiales y la posición del primer tirón.' },
    { name: 'Strict Press (Press Estricto)', equip: 'Barra Olímpica', level: 'principiante',
      desc: 'Press overhead sin impulso de piernas. Desarrolla fuerza pura de hombros.' },
    { name: 'Behind Neck Snatch Press', equip: 'Barra Olímpica', level: 'avanzado',
      desc: 'Press desde detrás del cuello con agarre de snatch. Fortalece la posición overhead.' },
    { name: 'Good Morning con Barra', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Flexión de cadera con barra en espalda. Fortalece cadena posterior y posición del tirón.' },
    { name: 'Snatch Deadlift', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Peso muerto con agarre amplio de snatch, controlado y lento. Desarrolla fuerza posicional.' },
    { name: 'Drop Snatch', equip: 'Barra Olímpica', level: 'avanzado',
      desc: 'Desde barra overhead en pie, dejarse caer a squat profundo sin dip previo. Velocidad de recepción pura.' },
    { name: 'Tall Snatch', equip: 'Barra Olímpica', level: 'avanzado',
      desc: 'Snatch desde posición erguida sin tirón — solo velocidad de brazos y recepción. Drill de técnica.' },
    { name: 'Tall Clean', equip: 'Barra Olímpica', level: 'intermedio',
      desc: 'Clean desde posición erguida sin tirón. Desarrolla velocidad de codos y recepción.' }
  ];

  // Agregar todos al grupo Levantamiento Olímpico
  OLYMPIC.forEach(ex => EX['Levantamiento Olímpico'].push({
    n: ex.name,
    e: ['Barra', 'Barra Olímpica'],
    d: ex.level,
    desc: ex.desc
  }));

  // También agregar equipamiento si no existe
  if (typeof EQUIPMENT !== 'undefined' && !EQUIPMENT.includes('Barra Olímpica')) {
    EQUIPMENT.push('Barra Olímpica');
  }

  // También agregar al grupo muscular si no está
  if (typeof MUSCLES !== 'undefined' && !MUSCLES.includes('Levantamiento Olímpico')) {
    MUSCLES.push('Levantamiento Olímpico');
  }

  console.log('🏋️ ' + OLYMPIC.length + ' ejercicios olímpicos agregados');
}


// ============================================================
//  CONTROL DE VOLUMEN EN UI
// ============================================================
function addVolumeControl() {
  const timerTab = document.querySelector('[data-tab="timer"]');
  if (!timerTab) return;

  // Verificar si ya existe
  if (document.getElementById('vol-control')) return;

  const existing = document.querySelector('.timer-section, .timer-container, #timer-content');
  if (!existing) return;

  const volHTML = `
    <div id="vol-control" style="
      display:flex; align-items:center; gap:10px;
      padding:10px 15px; margin:10px 0;
      background:rgba(0,240,255,0.05);
      border:1px solid rgba(0,240,255,0.15);
      border-radius:12px;
    ">
      <span style="font-size:20px">🔊</span>
      <input type="range" id="vol-slider" min="1" max="5" step="0.5" value="3.5"
        style="flex:1; accent-color:#00f0ff; height:6px;">
      <span id="vol-label" style="color:#00f0ff; font-weight:bold; min-width:40px;">350%</span>
    </div>
  `;

  existing.insertAdjacentHTML('afterbegin', volHTML);

  const slider = document.getElementById('vol-slider');
  const label = document.getElementById('vol-label');
  if (slider) {
    slider.addEventListener('input', () => {
      const v = parseFloat(slider.value);
      AudioEngine.setVolume(v);
      label.textContent = Math.round(v * 100) + '%';
    });
  }
}

// Hook para agregar control al renderizar timer
const _origShowTab = typeof showTab === 'function' ? showTab : null;
if (_origShowTab) {
  showTab = function(tab) {
    _origShowTab(tab);
    if (tab === 'timer') setTimeout(addVolumeControl, 100);
  };
}


// ══════════════════════════════════════════════════
//  MÓDULO MÉTRICAS — Personal Records (PR)
// ══════════════════════════════════════════════════

const PR_CATEGORIES = [
  { id: 'fuerza', name: 'Fuerza Máxima', icon: '🏋️', unit: 'kg', fields: ['ejercicio','peso','reps'] },
  { id: 'olympic', name: 'Levantamiento Olímpico', icon: '🥇', unit: 'kg', fields: ['ejercicio','peso'] },
  { id: 'cardio', name: 'Cardio / Resistencia', icon: '🏃', unit: 'min', fields: ['ejercicio','tiempo','distancia'] },
  { id: 'calistenia', name: 'Calistenia', icon: '💪', unit: 'reps', fields: ['ejercicio','reps','tiempo'] },
  { id: 'flexibilidad', name: 'Flexibilidad', icon: '🧘', unit: 'cm', fields: ['ejercicio','medida'] },
  { id: 'composicion', name: 'Composición Corporal', icon: '📊', unit: 'kg/%', fields: ['metrica','valor'] },
  { id: 'custom', name: 'Logro Personalizado', icon: '⭐', unit: '', fields: ['titulo','valor','unidad'] }
];

async function loadPRs() {
  if (!U) return [];
  try {
    const snap = await db.collection('users').doc(U.uid).collection('personal_records')
      .orderBy('date','desc').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) { console.warn('Error cargando PRs:', e); return []; }
}

async function savePR(pr) {
  if (!U) return toast('Inicia sesión primero');
  try {
    pr.date = pr.date || new Date().toISOString().split('T')[0];
    pr.createdAt = new Date().toISOString();
    pr.uid = U.uid;
    const ref = await db.collection('users').doc(U.uid).collection('personal_records').add(pr);
    toast('🏆 ¡Nuevo récord guardado!');
    AudioEng.speak('Nuevo récord personal guardado. Felicidades!');
    renderPRs();
    return ref.id;
  } catch(e) { toast('Error al guardar: ' + e.message); }
}

async function deletePR(id) {
  if (!U || !confirm('¿Eliminar este récord?')) return;
  try {
    await db.collection('users').doc(U.uid).collection('personal_records').doc(id).delete();
    toast('Récord eliminado');
    renderPRs();
  } catch(e) { toast('Error: ' + e.message); }
}

async function renderPRs() {
  const container = $('pr-container');
  if (!container) return;
  const prs = await loadPRs();

  let html = '<div class="pr-header glass-card">';
  html += '<h3 class="section-title">🏆 Mis Récords Personales</h3>';
  html += '<p class="pr-subtitle">Registra tus mejores marcas y observa tu progreso</p>';
  html += '<button class="btn-neon btn-add-pr" onclick="showAddPR()">+ Nuevo Récord</button>';
  html += '</div>';

  // Resumen de mejores PRs por categoría
  html += '<div class="pr-summary-grid">';
  PR_CATEGORIES.forEach(cat => {
    const catPRs = prs.filter(p => p.category === cat.id);
    const best = catPRs.length > 0 ? catPRs[0] : null;
    html += '<div class="pr-summary-card glass-card-inner" onclick="filterPRsByCategory(\'' + cat.id + '\')">';
    html += '<span class="pr-cat-icon">' + cat.icon + '</span>';
    html += '<span class="pr-cat-name">' + cat.name + '</span>';
    html += '<span class="pr-cat-count">' + catPRs.length + ' registros</span>';
    if (best) {
      html += '<span class="pr-cat-best">' + (best.peso || best.valor || best.reps || best.tiempo || '-') + ' ' + (best.unidad || cat.unit) + '</span>';
    }
    html += '</div>';
  });
  html += '</div>';

  // Lista de todos los PRs
  if (prs.length === 0) {
    html += '<div class="pr-empty glass-card-inner"><p>Aún no tienes récords registrados.</p><p>¡Agrega tu primer logro!</p></div>';
  } else {
    html += '<div class="pr-list">';
    prs.forEach(pr => {
      const cat = PR_CATEGORIES.find(c => c.id === pr.category) || PR_CATEGORIES[6];
      html += '<div class="pr-item glass-card-inner">';
      html += '<div class="pr-item-header">';
      html += '<span class="pr-item-icon">' + cat.icon + '</span>';
      html += '<div class="pr-item-info">';
      html += '<strong class="pr-item-name">' + (pr.ejercicio || pr.titulo || pr.metrica || 'Sin nombre') + '</strong>';
      html += '<span class="pr-item-cat">' + cat.name + '</span>';
      html += '</div>';
      html += '<div class="pr-item-value">';
      if (pr.peso) html += '<span class="pr-big-number">' + pr.peso + '</span><span class="pr-unit">kg</span>';
      else if (pr.valor) html += '<span class="pr-big-number">' + pr.valor + '</span><span class="pr-unit">' + (pr.unidad || cat.unit) + '</span>';
      else if (pr.reps) html += '<span class="pr-big-number">' + pr.reps + '</span><span class="pr-unit">reps</span>';
      else if (pr.tiempo) html += '<span class="pr-big-number">' + pr.tiempo + '</span><span class="pr-unit">min</span>';
      html += '</div>';
      html += '</div>';
      html += '<div class="pr-item-footer">';
      if (pr.reps && pr.peso) html += '<span class="pr-detail">Reps: ' + pr.reps + '</span>';
      if (pr.distancia) html += '<span class="pr-detail">Distancia: ' + pr.distancia + ' km</span>';
      html += '<span class="pr-date">📅 ' + (pr.date || 'Sin fecha') + '</span>';
      if (pr.notas) html += '<span class="pr-notes">📝 ' + pr.notas + '</span>';
      html += '<button class="btn-icon btn-danger pr-delete" onclick="deletePR(\'' + pr.id + '\')">🗑️</button>';
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  container.innerHTML = html;
}

function filterPRsByCategory(catId) {
  // Scroll a la lista y resaltar la categoría
  const items = document.querySelectorAll('.pr-item');
  items.forEach(item => {
    item.style.display = 'flex';
  });
  toast(PR_CATEGORIES.find(c => c.id === catId)?.name || catId);
}

function showAddPR() {
  const container = $('pr-container');
  if (!container) return;

  let html = '<div class="pr-form glass-card">';
  html += '<h3 class="section-title">➕ Nuevo Récord Personal</h3>';

  // Categoría
  html += '<label class="pr-label">Categoría</label>';
  html += '<select id="pr-category" class="glass-input" onchange="updatePRFields()">';
  PR_CATEGORIES.forEach(cat => {
    html += '<option value="' + cat.id + '">' + cat.icon + ' ' + cat.name + '</option>';
  });
  html += '</select>';

  // Campos dinámicos
  html += '<div id="pr-dynamic-fields"></div>';

  // Fecha
  html += '<label class="pr-label">Fecha</label>';
  html += '<input type="date" id="pr-date" class="glass-input" value="' + new Date().toISOString().split('T')[0] + '">';

  // Notas
  html += '<label class="pr-label">Notas (opcional)</label>';
  html += '<input type="text" id="pr-notas" class="glass-input" placeholder="Ej: Con cinturón, sin straps...">';

  // Botones
  html += '<div class="pr-form-actions">';
  html += '<button class="btn-neon" onclick="submitPR()">💾 Guardar Récord</button>';
  html += '<button class="btn-neon btn-secondary" onclick="renderPRs()">Cancelar</button>';
  html += '</div>';

  html += '</div>';
  container.innerHTML = html;
  updatePRFields();
}

function updatePRFields() {
  const catId = $('pr-category')?.value;
  const cat = PR_CATEGORIES.find(c => c.id === catId);
  const container = $('pr-dynamic-fields');
  if (!container || !cat) return;

  let html = '';
  const fieldLabels = {
    ejercicio: { label: 'Ejercicio', type: 'text', placeholder: 'Ej: Sentadilla, Snatch, Press Banca...' },
    peso: { label: 'Peso (kg)', type: 'number', placeholder: '0.0', step: '0.5' },
    reps: { label: 'Repeticiones', type: 'number', placeholder: '1', step: '1' },
    tiempo: { label: 'Tiempo (min:seg)', type: 'text', placeholder: 'Ej: 5:30' },
    distancia: { label: 'Distancia (km)', type: 'number', placeholder: '0.0', step: '0.1' },
    medida: { label: 'Medida (cm)', type: 'number', placeholder: '0', step: '0.5' },
    metrica: { label: 'Métrica', type: 'text', placeholder: 'Ej: Peso corporal, % grasa, cintura...' },
    valor: { label: 'Valor', type: 'number', placeholder: '0', step: '0.1' },
    titulo: { label: 'Título del logro', type: 'text', placeholder: 'Ej: Primer muscle-up, 100kg squat...' },
    unidad: { label: 'Unidad', type: 'text', placeholder: 'Ej: kg, reps, min, cm...' }
  };

  // Ejercicio sugerido para fuerza y olímpico
  if (cat.id === 'fuerza') {
    html += '<label class="pr-label">Ejercicio</label>';
    html += '<select id="pr-ejercicio" class="glass-input"><option value="">Seleccionar...</option>';
    ['Press Banca','Sentadilla','Peso Muerto','Press Militar','Remo con Barra','Curl Bíceps','Press Inclinado','Sentadilla Frontal','Hip Thrust','Dominadas Lastradas'].forEach(e => {
      html += '<option value="' + e + '">' + e + '</option>';
    });
    html += '<option value="__custom">✏️ Otro ejercicio...</option></select>';
    html += '<input type="text" id="pr-ejercicio-custom" class="glass-input" placeholder="Nombre del ejercicio" style="display:none;margin-top:8px">';
  } else if (cat.id === 'olympic') {
    html += '<label class="pr-label">Ejercicio</label>';
    html += '<select id="pr-ejercicio" class="glass-input"><option value="">Seleccionar...</option>';
    ['Snatch','Clean & Jerk','Power Clean','Power Snatch','Squat Snatch','Squat Clean','Push Press','Push Jerk','Split Jerk','Front Squat','Overhead Squat','Thruster'].forEach(e => {
      html += '<option value="' + e + '">' + e + '</option>';
    });
    html += '<option value="__custom">✏️ Otro ejercicio...</option></select>';
    html += '<input type="text" id="pr-ejercicio-custom" class="glass-input" placeholder="Nombre del ejercicio" style="display:none;margin-top:8px">';
  } else {
    cat.fields.forEach(field => {
      if (field === 'ejercicio') {
        const fl = fieldLabels[field];
        html += '<label class="pr-label">' + fl.label + '</label>';
        html += '<input type="' + fl.type + '" id="pr-' + field + '" class="glass-input" placeholder="' + fl.placeholder + '">';
      }
    });
  }

  // Resto de campos numéricos
  cat.fields.forEach(field => {
    if (field === 'ejercicio') return; // ya lo pusimos arriba
    const fl = fieldLabels[field];
    if (!fl) return;
    html += '<label class="pr-label">' + fl.label + '</label>';
    html += '<input type="' + fl.type + '" id="pr-' + field + '" class="glass-input" placeholder="' + fl.placeholder + '"' + (fl.step ? ' step="' + fl.step + '"' : '') + '>';
  });

  container.innerHTML = html;

  // Listener para "Otro ejercicio"
  const sel = $('pr-ejercicio');
  if (sel) {
    sel.onchange = function() {
      const custom = $('pr-ejercicio-custom');
      if (custom) custom.style.display = this.value === '__custom' ? 'block' : 'none';
    };
  }
}

async function submitPR() {
  const catId = $('pr-category')?.value;
  const cat = PR_CATEGORIES.find(c => c.id === catId);
  if (!cat) return toast('Selecciona una categoría');

  const pr = { category: catId };

  // Obtener ejercicio
  const selEj = $('pr-ejercicio');
  const customEj = $('pr-ejercicio-custom');
  if (selEj) {
    pr.ejercicio = selEj.value === '__custom' ? (customEj?.value?.trim() || '') : selEj.value;
  }

  // Obtener campos dinámicos
  cat.fields.forEach(field => {
    if (field === 'ejercicio' && selEj) return;
    const el = $('pr-' + field);
    if (el && el.value.trim()) {
      pr[field] = isNaN(el.value) ? el.value.trim() : parseFloat(el.value);
    }
  });

  pr.date = $('pr-date')?.value || new Date().toISOString().split('T')[0];
  pr.notas = $('pr-notas')?.value?.trim() || '';

  // Validar que tenga al menos un valor
  const hasValue = pr.ejercicio || pr.titulo || pr.metrica || pr.peso || pr.valor || pr.reps;
  if (!hasValue) return toast('Completa al menos un campo');

  await savePR(pr);
}

// Agregar pestaña de PRs al menú
function addPRTab() {
  // Verificar si ya existe el tab
  if ($('tab-pr')) return;

  // Buscar la barra de navegación
  const nav = document.querySelector('.bottom-nav');
  if (!nav) return;

  // Agregar botón de PRs
  const prBtn = document.createElement('button');
  prBtn.className = 'nav-btn';
  prBtn.id = 'nav-pr';
  prBtn.setAttribute('data-tab', 'pr');
prBtn.addEventListener('click', function() {
  showTab('pr');
  renderPRs();
});
  prBtn.innerHTML = '<span class="nav-icon">🏆</span><span class="nav-label">Récords</span>';
prBtn.setAttribute('data-tab', 'pr');

  // Insertar antes del último botón (perfil)
  const btns = nav.querySelectorAll('.nav-btn');
  if (btns.length > 0) {
    nav.insertBefore(prBtn, btns[btns.length - 1]);
  } else {
    nav.appendChild(prBtn);
  }

  // Crear contenedor de PRs
  const main = document.querySelector('.main-content') || document.querySelector('main') || document.body;
  const prSection = document.createElement('div');
  prSection.id = 'tab-pr';
  prSection.className = 'tab-content';
  prSection.style.display = 'none';
  prSection.innerHTML = '<div id="pr-container"></div>';

  // Insertar después de los otros tabs
  const lastTab = document.querySelector('.tab-content:last-of-type');
  if (lastTab && lastTab.parentNode) {
    lastTab.parentNode.insertBefore(prSection, lastTab.nextSibling);
  } else {
    main.appendChild(prSection);
  }
}

// Inicializar PRs cuando la app carga
// switchTab eliminado — se usa showTab directamente


// Auto-agregar tab cuando DOM esté listo
if (document.readyState === 'complete') { setTimeout(addPRTab, 500); }
else { window.addEventListener('load', () => setTimeout(addPRTab, 500)); }

console.log('🏆 Módulo Personal Records cargado');

// === FIRESTORE_INDEX_HELPER v24 ===
// Capturar errores de índices faltantes y mostrar link
window.addEventListener('unhandledrejection', function(event) {
  if (event.reason && event.reason.message) {
    const msg = event.reason.message;
    if (msg.includes('requires an index') || msg.includes('requires a composite index')) {
      const urlMatch = msg.match(/(https:\/\/console\.firebase\.google\.com[^\s"']+)/);
      if (urlMatch) {
        console.error('🔥 CREAR ÍNDICE FIRESTORE:', urlMatch[1]);
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#ff6600;color:#fff;padding:12px 20px;border-radius:12px;z-index:99999;font-size:13px;max-width:90vw;text-align:center;cursor:pointer;';
        toast.innerHTML = '⚠️ Se necesita crear un índice en Firebase.<br>Toca aquí para crearlo.';
        toast.onclick = function() { window.open(urlMatch[1], '_blank'); toast.remove(); };
        document.body.appendChild(toast);
        setTimeout(function() { if(toast.parentNode) toast.remove(); }, 15000);
      }
    }
    // Prevenir que errores de Firestore bloqueen la app
    event.preventDefault();
  }
});

// Proteger funciones que requieren Firestore
const _origLoadBattles = typeof loadBattles === 'function' ? loadBattles : null;
if (_origLoadBattles) {
  window.loadBattles = async function() {
    try { return await _origLoadBattles.apply(this, arguments); }
    catch(e) { console.warn('⚔️ Batallas: ', e.message); }
  };
}

const _origLoadSchedule = typeof loadSchedule === 'function' ? loadSchedule : null;
if (_origLoadSchedule) {
  window.loadSchedule = async function() {
    try { return await _origLoadSchedule.apply(this, arguments); }
    catch(e) { console.warn('📅 Agenda: ', e.message); }
  };
}

console.log('🛡️ Firestore Index Helper v24 cargado');
// Cargar alimentos compartidos de Firestore
async function loadSharedFoods() {
  try {
    const snap = await db.collection('shared_foods').orderBy('n').limit(500).get();
    let added = 0;
    snap.docs.forEach(d => {
      const f = d.data();
      if (!FOODS.find(x => x.n.toLowerCase() === f.n.toLowerCase())) {
        FOODS.push({ n: f.n, cal: f.cal, p: f.p, c: f.c, g: f.g });
        added++;
      }
    });
    if (added > 0) console.log('🍎 ' + added + ' alimentos compartidos cargados (total: ' + FOODS.length + ')');
  } catch(e) { console.warn('Error cargando alimentos compartidos:', e); }
}
// Ejecutar carga
if (typeof db !== 'undefined') loadSharedFoods();
