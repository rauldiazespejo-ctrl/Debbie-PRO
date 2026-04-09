try {
// ══════════════════════════════════════════════════════════════
//  DEBBIE PRO — MEGA FEATURES v1
//  1. Battle Mode  2. Mid-Timer Alert  3. Class Scheduler
// ══════════════════════════════════════════════════════════════
(function() {
if (typeof db === 'undefined' || typeof auth === 'undefined') return;

// ════════════════════════════════════════════════════
//  1. MODO BATALLA — Battle Mode
// ════════════════════════════════════════════════════

const BattleMode = {

  // Títulos progresivos
  getBattleTitle(wins) {
    if (wins >= 3) return { emoji: "💀", title: "Inmortal", color: "#ff0000" };
    if (wins >= 2) return { emoji: "🔥", title: "Gladiador", color: "#ff6600" };
    if (wins >= 1) return { emoji: "⚔️", title: "Guerrero", color: "#ffcc00" };
    return { emoji: "", title: "", color: "" };
  },


  // Helper: formatear segundos a mm:ss
  formatTime(secs) {
    if (!secs && secs !== 0) return '-';
    secs = parseFloat(secs);
    if (secs < 60) return secs.toFixed(1) + 's';
    var m = Math.floor(secs / 60);
    var s = Math.round(secs % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  },

  // Helper: parsear input de tiempo (acepta "2:30" o "150")
  parseTimeInput(input) {
    if (!input) return null;
    input = input.trim();
    if (input.includes(':')) {
      var parts = input.split(':');
      var mins = parseInt(parts[0]) || 0;
      var secs = parseInt(parts[1]) || 0;
      return mins * 60 + secs;
    }
    return parseFloat(input) || null;
  },


  // Crear batalla (solo entrenador)
  async create() {
    if (ROLE !== 'trainer') return toast('Solo entrenadores pueden crear batallas');
    const clients = PROF?.clients || [];
    if (clients.length < 2) return toast('Necesitas al menos 2 atletas para una batalla');

    // Cargar nombres de atletas
    const clientList = [];
    for (const cid of clients) {
      try {
        const doc = await db.collection('users').doc(cid).get();
        if (doc.exists) clientList.push({ uid: cid, name: doc.data().name || doc.data().email || cid });
      } catch(e) {}
    }

    const container = $('tab-battle');
    if (!container) return;

    // Cargar rutinas del entrenador
    let routines = [];
    try {
      const snap = await db.collection('users').doc(U.uid).collection('routines').orderBy('updatedAt','desc').limit(20).get();
      routines = snap.docs.map(d => ({ id: d.id, name: d.data().name || 'Sin nombre' }));
    } catch(e) {}

    let html = '<div class="glass-card battle-create-form">';
    html += '<h3 class="section-title">⚔️ Crear Modo Batalla</h3>';
    html += '<p class="battle-desc">Selecciona una rutina y los atletas que competirán. Cada atleta registrará sus tiempos y se generará un ranking en tiempo real.</p>';

    // Nombre de la batalla
    html += '<label class="pr-label">Nombre de la Batalla</label>';
    html += '<input type="text" id="battle-name" class="glass-input" placeholder="Ej: Desafío Tabata Extremo" value="Batalla ' + new Date().toLocaleDateString('es') + '">';

    // Seleccionar rutina
    html += '<label class="pr-label">Rutina de Competencia</label>';
    html += '<select id="battle-routine" class="glass-input"><option value="">Seleccionar rutina...</option>';
    routines.forEach(r => { html += '<option value="' + r.id + '">' + r.name + '</option>'; });
    html += '</select>';

    // Seleccionar clientes
    html += '<label class="pr-label">Participantes (mín. 2)</label>';
    html += '<div class="battle-clients-grid">';
    clientList.forEach(c => {
      html += '<label class="battle-client-check glass-card-inner"><input type="checkbox" value="' + c.uid + '" class="battle-client-cb"> <span>' + c.name + '</span></label>';
    });
    html += '</div>';

    // Tipo de competencia
    html += '<label class="pr-label">Tipo de Competencia</label>';
    html += '<select id="battle-type" class="glass-input">';
    html += '<option value="time">⏱️ Menor tiempo en completar</option>';
    html += '<option value="reps">🔄 Mayor repeticiones en tiempo límite</option>';
    html += '<option value="weight">🏋️ Mayor peso total levantado</option>';
    html += '</select>';

    // Tiempo límite (para tipo reps)
    html += '<div id="battle-time-limit-wrap" style="display:none"><label class="pr-label">Tiempo límite (minutos)</label>';
    html += '<input type="number" id="battle-time-limit" class="glass-input" value="10" min="1" max="60"></div>';

    html += '<div class="pr-form-actions">';
    html += '<button class="btn-neon" onclick="BattleMode.submit()">⚔️ Iniciar Batalla</button>';
    html += '<button class="btn-neon btn-secondary" onclick="BattleMode.list()">Cancelar</button>';
    html += '</div></div>';

    container.innerHTML = html;

    // Toggle tiempo límite
    $('battle-type').onchange = function() {
      const wrap = $('battle-time-limit-wrap');
      if (wrap) wrap.style.display = this.value === 'reps' ? 'block' : 'none';
    };
  },

  async submit() {
    const name = $('battle-name')?.value?.trim();
    const routineId = $('battle-routine')?.value;
    const type = $('battle-type')?.value || 'time';
    const timeLimit = parseInt($('battle-time-limit')?.value) || 10;
    const checked = document.querySelectorAll('.battle-client-cb:checked');
    const participants = Array.from(checked).map(cb => cb.value);

    if (!name) return toast('Ingresa un nombre para la batalla');
    if (!routineId) return toast('Selecciona una rutina');
    if (participants.length < 2) return toast('Selecciona al menos 2 participantes');

    // Obtener rutina
    let routineName = 'Rutina';
    try {
      const rDoc = await db.collection('users').doc(U.uid).collection('routines').doc(routineId).get();
      if (rDoc.exists) routineName = rDoc.data().name || 'Rutina';
    } catch(e) {}

    // Crear estructura de participantes
    const participantsMap = {};
    for (const pid of participants) {
      try {
        const pDoc = await db.collection('users').doc(pid).get();
        const pName = pDoc.exists ? (pDoc.data().name || pDoc.data().email) : pid;
        participantsMap[pid] = { name: pName, status: 'pending', time: null, reps: null, weight: null, validated: false };
      } catch(e) {
        participantsMap[pid] = { name: pid, status: 'pending', time: null, reps: null, weight: null, validated: false };
      }
    }

    const battle = {
      name, routineId, routineName, type, timeLimit: type === 'reps' ? timeLimit : null,
      trainerId: U.uid, trainerName: PROF?.name || PROF?.email || '',
      participants: participantsMap,
      participantIds: participants,
      champion: null,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    try {
      const ref = await db.collection('battles').add(battle);
      toast('⚔️ ¡Batalla creada! ID: ' + ref.id);
      AudioEng.speak('Batalla creada. Que comience la competencia!');

      // Notificar a cada participante guardando en su subcolección
      for (const pid of participants) {
        await db.collection('users').doc(pid).collection('battles').doc(ref.id).set({
          battleId: ref.id, battleName: name, trainerId: U.uid, trainerName: battle.trainerName,
          routineName, type, status: 'active', createdAt: battle.createdAt
        });
      }

      BattleMode.list();
    } catch(e) { toast('Error: ' + e.message); }
  },

  // Listar batallas
  async list() {
    const container = $('tab-battle');
    if (!container) return;

    let battles = [];
    try {
      if (ROLE === 'trainer') {
        const snap = await db.collection('battles').where('trainerId','==',U.uid).orderBy('createdAt','desc').limit(20).get();
        battles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } else {
        // Cliente: buscar batallas donde participa
        const snap = await db.collection('users').doc(U.uid).collection('battles').orderBy('createdAt','desc').limit(20).get();
        for (const d of snap.docs) {
          try {
            const bDoc = await db.collection('battles').doc(d.data().battleId || d.id).get();
            if (bDoc.exists) battles.push({ id: bDoc.id, ...bDoc.data() });
          } catch(e) {}
        }
      }
    } catch(e) { console.warn('Error cargando batallas:', e); }

    let html = '<div class="glass-card battle-header">';
    html += '<h3 class="section-title">⚔️ Modo Batalla</h3>';
    if (ROLE === 'trainer') {
      html += '<button class="btn-neon btn-add-pr" onclick="BattleMode.create()">+ Nueva Batalla</button>';
    }
    html += '</div>';

    
    // ═══ RANKING GLOBAL ═══
    const rankingHtml = await BattleMode.renderGlobalRanking();
    html += rankingHtml;
    html += '<div class="rank-separator"><span>⚔️ BATALLAS</span></div>';

    if (battles.length === 0) {
      html += '<div class="pr-empty glass-card-inner"><p>No hay batallas activas.</p>';
      if (ROLE === 'trainer') html += '<p>¡Crea una para desafiar a tus atletas!</p>';
      else html += '<p>Tu entrenador aún no ha creado una batalla.</p>';
      html += '</div>';
    } else {
      battles.forEach(b => {
        const isActive = b.status === 'active';
        html += '<div class="battle-card glass-card-inner ' + (isActive ? 'battle-active' : 'battle-finished') + '">';
        html += '<div class="battle-card-header">';
        html += '<div><strong class="battle-card-name">' + ((b.isChallenge ? '\u2694\uFE0F ' : '') + b.name || 'Batalla') + '</strong>';
        html += '<span class="battle-card-routine">📋 ' + (b.routineName || '') + '</span></div>';
        html += '<span class="battle-status ' + (isActive ? 'status-active' : 'status-done') + '">' + (isActive ? '🔴 EN CURSO' : '✅ FINALIZADA') + '</span>';
        html += '</div>';

        // Ranking
        const parts = b.participants || {}; var bType = b.type;
        const sorted = Object.entries(parts).sort((x,y) => {
          if (y[1].validated && !x[1].validated) return 1;
          if (x[1].validated && !y[1].validated) return -1;
          if (bType === 'time') return (x[1].time||99999) - (y[1].time||99999);
          if (bType === 'reps') return (y[1].reps||0) - (x[1].reps||0);
          return (y[1].weight||0) - (x[1].weight||0);
        });

        html += '<div class="battle-ranking">';
        sorted.forEach(([uid, p], idx) => {
          const isChamp = b.champion === uid;
          const isMe = uid === U?.uid;
          html += '<div class="battle-rank-item ' + (isMe ? 'battle-rank-me' : '') + '">';
          html += '<span class="battle-rank-pos">' + (isChamp ? '<span class="crown-anim">👑</span>' : (idx+1)) + '</span>';
          html += '<span class="battle-rank-name">' + (isChamp ? '<strong>Champion</strong> ' : '') + p.name + '</span>';
          html += '<span class="battle-rank-value">';
          if (p.status === 'completed') {
            if (b.type === 'time') html += BattleMode.formatTime(p.time);
            else if (b.type === 'reps') html += (p.reps || '-') + ' reps';
            else html += (p.weight || '-') + ' kg';
            html += p.validated ? ' ✅' : ' ⏳';
          } else {
            html += '<span class="battle-pending">Pendiente</span>';
          }
          html += '</span>';

          // Botones según rol
          if (ROLE === 'trainer' && p.status === 'pending' && isActive) {
            html += '<button class="btn-icon btn-neon-sm" data-bid="' + b.id + '" data-uid="' + uid + '" data-type="' + b.type + '" onclick="BattleMode.trainerRecord(this.dataset.bid,this.dataset.uid,this.dataset.type)">\u270D\uFE0F Cargar</button>';
          }
          if (ROLE === 'trainer' && p.status === 'completed' && !p.validated) {
            html += '<button class="btn-icon btn-neon-sm" onclick="BattleMode.validate(\'' + b.id + '\',\'' + uid + '\')">✓ Validar</button>';
          }
          if (ROLE === 'client' && uid === U?.uid && p.status === 'pending' && isActive) {
            html += '<button class="btn-icon btn-neon-sm" onclick="BattleMode.record(\'' + b.id + '\',\'' + b.type + '\')">📝 Registrar</button>';
          }
          // Botón desafiar al champion
          if (!isActive && b.champion && b.champion !== U?.uid && uid === b.champion) {
            html += '<button class="btn-icon btn-challenge" data-bid="' + b.id + '" data-champ="' + uid + '" data-type="' + b.type + '" onclick="BattleMode.challengeChampion(this.dataset.bid,this.dataset.champ,this.dataset.type)">\u2694\uFE0F Desafiar</button>';
          }
          html += '</div>';
        });
        html += '</div>';


        // Battle Timer (solo batallas activas)
        if (isActive) {
          html += '<div class="battle-timer-section" id="battle-timer-' + b.id + '">';
          html += '<div class="battle-timer-display">';
          html += '<span class="battle-timer-icon">\u23F1</span>';
          html += '<span class="battle-timer-clock" id="btclock-' + b.id + '">00:00</span>';
          html += '</div>';
          html += '<div class="battle-timer-msg" id="btmsg-' + b.id + '"></div>';
          html += '<div class="battle-timer-controls">';
          html += '<button class="btn-battle-timer btn-bt-start" data-bid="' + b.id + '" onclick="BattleMode.battleTimerStart(this.dataset.bid)">\u25B6 Iniciar</button>';
          html += '<button class="btn-battle-timer btn-bt-pause" data-bid="' + b.id + '" onclick="BattleMode.battleTimerPause(this.dataset.bid)">\u23F8 Pausar</button>';
          html += '<button class="btn-battle-timer btn-bt-reset" data-bid="' + b.id + '" onclick="BattleMode.battleTimerReset(this.dataset.bid)">\u21BA Reset</button>';
          html += '</div>';
          html += '</div>';
        }

        // Botón finalizar (entrenador)
        if (ROLE === 'trainer') {
          html += '<div class="battle-actions">';
          if (isActive) html += '<button class="btn-neon btn-guest" data-bid="' + b.id + '" onclick="BattleMode.addGuest(this.dataset.bid)">\u{1F464}+ Presencial</button>';
          if (isActive) html += '<button class="btn-neon" data-bid="' + b.id + '" onclick="BattleMode.finish(this.dataset.bid)">🏁 Finalizar</button>';
          html += '<button class="btn-neon btn-danger-battle" data-bid="' + b.id + '" onclick="BattleMode.deleteBattle(this.dataset.bid)">🗑️ Eliminar</button>';
          html += '</div>';
        }
        html += '<div class="battle-card-footer">📅 ' + new Date(b.createdAt).toLocaleDateString('es') + '</div>';
        html += '</div>';
      });
    }

    container.innerHTML = html;
  },

  // Atleta registra su marca
  async record(battleId, type) {
    let value;
    if (type === 'time') {
      value = prompt('Ingresa tu tiempo (min:seg o segundos)\nEjemplo: 2:30 o 150');
      value = BattleMode.parseTimeInput(value); if (!value) return toast('Tiempo inv\u00e1lido (ej: 2:30)');
    } else if (type === 'reps') {
      value = prompt('Ingresa tus repeticiones totales:');
      if (!value || isNaN(value)) return toast('Ingresa reps válidas');
    } else {
      value = prompt('Ingresa peso total levantado (kg):');
      if (!value || isNaN(value)) return toast('Ingresa un peso válido');
    }

    try {
      const field = type === 'time' ? 'time' : (type === 'reps' ? 'reps' : 'weight');
      const update = {};
      update['participants.' + U.uid + '.status'] = 'completed';
      update['participants.' + U.uid + '.' + field] = value;
      update['participants.' + U.uid + '.submittedAt'] = new Date().toISOString();
      await db.collection('battles').doc(battleId).update(update);
      toast('✅ Marca registrada: ' + value);
      AudioEng.speak('Marca registrada exitosamente');
      BattleMode.list();
    } catch(e) { toast('Error: ' + e.message); }
  },

  // Entrenador carga marca para cualquier participante
  async trainerRecord(battleId, uid, type) {
    if (ROLE !== 'trainer') return toast('Solo entrenadores');
    var value;
    if (type === 'time') {
      var input = prompt('Tiempo del atleta (min:seg o segundos)\nEjemplo: 2:30 o 150');
      value = BattleMode.parseTimeInput(input);
      if (!value) return toast('Tiempo inv\u00e1lido');
    } else if (type === 'reps') {
      value = parseFloat(prompt('Repeticiones del atleta:'));
      if (!value) return toast('Reps inv\u00e1lidas');
    } else {
      value = parseFloat(prompt('Peso levantado (kg):'));
      if (!value) return toast('Peso inv\u00e1lido');
    }
    try {
      var field = type === 'time' ? 'time' : (type === 'reps' ? 'reps' : 'weight');
      var update = {};
      update['participants.' + uid + '.status'] = 'completed';
      update['participants.' + uid + '.' + field] = value;
      update['participants.' + uid + '.submittedAt'] = new Date().toISOString();
      update['participants.' + uid + '.recordedByTrainer'] = true;
      await db.collection('battles').doc(battleId).update(update);
      var display = type === 'time' ? BattleMode.formatTime(value) : value;
      toast('\u2705 Marca cargada: ' + display);
      BattleMode.list();
    } catch(e) { toast('Error: ' + e.message); }
  },

  // Agregar participante presencial (sin cuenta)
  async addGuest(battleId) {
    if (ROLE !== 'trainer') return toast('Solo entrenadores');
    var guestName = prompt('Nombre del participante presencial:');
    if (!guestName || !guestName.trim()) return toast('Ingresa un nombre');
    guestName = guestName.trim();
    var guestId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    try {
      var update = {};
      update['participants.' + guestId] = { name: guestName, status: 'pending', time: null, reps: null, weight: null, validated: false, isGuest: true };
      update['participantIds'] = firebase.firestore.FieldValue.arrayUnion(guestId);
      await db.collection('battles').doc(battleId).update(update);
      toast('\u2705 ' + guestName + ' agregado a la batalla');
      BattleMode.list();
    } catch(e) { toast('Error: ' + e.message); }
  },

  // Entrenador valida marca
  async validate(battleId, clientUid) {
    const key = prompt('Ingresa tu clave de entrenador para validar:');
    if (key !== 'DEBBIE2026') return toast('Clave incorrecta');

    try {
      const update = {};
      update['participants.' + clientUid + '.validated'] = true;
      update['participants.' + clientUid + '.validatedAt'] = new Date().toISOString();
      await db.collection('battles').doc(battleId).update(update);
      toast('✅ Marca validada');
      BattleMode.list();
    } catch(e) { toast('Error: ' + e.message); }
  },

  // Finalizar batalla y elegir champion
  async finish(battleId) {
    try {
      const doc = await db.collection('battles').doc(battleId).get();
      if (!doc.exists) return toast('Batalla no encontrada');
      const data = doc.data();
      const parts = data.participants || {};
      const type = data.type;

      // Filtrar solo validados
      const validated = Object.entries(parts).filter(([,p]) => p.validated);
      if (validated.length === 0) return toast('Valida al menos una marca antes de finalizar');

      // Determinar ganador
      let winner;
      if (type === 'time') {
        winner = validated.sort((a,b) => (a[1].time||99999) - (b[1].time||99999))[0];
      } else if (type === 'reps') {
        winner = validated.sort((a,b) => (b[1].reps||0) - (a[1].reps||0))[0];
      } else {
        winner = validated.sort((a,b) => (b[1].weight||0) - (a[1].weight||0))[0];
      }

      const championUid = winner[0];
      const championName = winner[1].name;

      await db.collection('battles').doc(battleId).update({
        status: 'finished', champion: championUid, championName,
        finishedAt: new Date().toISOString()
      });

      // Guardar badge de champion en el perfil del ganador
      // Obtener victorias actuales para título progresivo
      let currentWins = 0;
      try {
        const champDoc = await db.collection("users").doc(championUid).get();
        if (champDoc.exists) currentWins = champDoc.data().battlesWon || 0;
      } catch(e) {}
      const newWins = currentWins + 1;
      const titleInfo = BattleMode.getBattleTitle(newWins);

      await db.collection("users").doc(championUid).update({
        battleChampion: true,
        championTitle: titleInfo.title,
        championEmoji: titleInfo.emoji,
        championColor: titleInfo.color,
        lastBattleWon: data.name,
        battlesWon: firebase.firestore.FieldValue.increment(1)
      });

      // Guardar título en participantes de la batalla
      const titleUpdate = {};
      titleUpdate["participants." + championUid + ".battleTitle"] = titleInfo.title;
      titleUpdate["participants." + championUid + ".titleEmoji"] = titleInfo.emoji;
      titleUpdate["participants." + championUid + ".titleColor"] = titleInfo.color;
      await db.collection("battles").doc(battleId).update(titleUpdate);

      toast('🏆 ¡' + championName + ' es el Champion! ' + titleInfo.emoji + ' ' + titleInfo.title);
      AudioEng.speak(championName + ' es el nuevo Champion. Título: ' + titleInfo.title + '. Felicidades!');
      BattleMode.showCoronation(championName, titleInfo);

      // Si es un desafío 1v1, ajustar títulos
      if (data.isChallenge && data.defendingChampion) {
        const loserUid = championUid === data.defendingChampion ? data.challengerUid : data.defendingChampion;
        const isUpset = championUid === data.challengerUid; // el retador ganó
        if (isUpset) {
          // El retador derrota al champion: bajar título del ex-champion
          try {
            const exChampDoc = await db.collection('users').doc(data.defendingChampion).get();
            if (exChampDoc.exists) {
              const exWins = Math.max(0, (exChampDoc.data().battlesWon || 1) - 1);
              const exTitle = BattleMode.getBattleTitle(exWins);
              await db.collection('users').doc(data.defendingChampion).update({
                championTitle: exTitle.title || '',
                championEmoji: exTitle.emoji || '',
                championColor: exTitle.color || '',
                battlesWon: exWins
              });
            }
          } catch(e) { console.warn('Error ajustando ex-champion:', e); }
          toast('\uD83D\uDCA5 \u00a1' + championName + ' ha destronado al Champion!');
          AudioEng.speak(championName + ' ha destronado al Champion. Nuevo orden!');
        }
      }
      BattleMode.list();
    } catch(e) { toast('Error: ' + e.message); }
  },

  // ═══ Battle Timer (cronómetro hacia adelante con mensajes motivacionales) ═══
  _battleTimers: {},

  battleTimerStart(battleId) {
    if (this._battleTimers[battleId] && this._battleTimers[battleId].running) return;
    if (!this._battleTimers[battleId]) {
      this._battleTimers[battleId] = { seconds: 0, running: false, interval: null, lastMsg: 0 };
    }
    const t = this._battleTimers[battleId];
    t.running = true;

    // Audio de inicio
    AudioEng.speak('Cronometro de batalla iniciado. Vamos!');
    toast('\u23F1 Cronometro iniciado');

    t.interval = setInterval(() => {
      t.seconds++;
      BattleMode._battleTimerTick(battleId);
    }, 1000);
  },

  battleTimerPause(battleId) {
    const t = this._battleTimers[battleId];
    if (!t || !t.running) return;
    t.running = false;
    clearInterval(t.interval);
    t.interval = null;
    toast('\u23F8 Cronometro pausado: ' + BattleMode.formatTime(t.seconds));
    AudioEng.speak('Cronometro pausado en ' + BattleMode.formatTime(t.seconds));
  },

  battleTimerReset(battleId) {
    const t = this._battleTimers[battleId];
    if (t) {
      clearInterval(t.interval);
      t.seconds = 0;
      t.running = false;
      t.interval = null;
      t.lastMsg = 0;
    }
    const clock = document.getElementById('btclock-' + battleId);
    if (clock) clock.textContent = '00:00';
    const msg = document.getElementById('btmsg-' + battleId);
    if (msg) msg.textContent = '';
    toast('\u21BA Cronometro reiniciado');
  },

  _battleMotivMsgs: [
    '\uD83D\uDCAA \u00a1Vamos, no aflojen!',
    '\uD83D\uDD25 \u00a1Eso es, m\u00e1s r\u00e1pido!',
    '\u26A1 \u00a1A tope, guerreros!',
    '\uD83C\uDFC6 \u00a1El champion se define ahora!',
    '\uD83D\uDE4C \u00a1No paren, falta poco!',
    '\uD83D\uDCA5 \u00a1Cada segundo cuenta!',
    '\u2694\uFE0F \u00a1Esta es su batalla!',
    '\uD83E\uDDBE \u00a1M\u00e1s fuerte, m\u00e1s r\u00e1pido!',
    '\uD83C\uDFAF \u00a1Enfoque total, sin parar!',
    '\uD83D\uDE80 \u00a1Al l\u00edmite, sin excusas!'
  ],

  _battleTimerTick(battleId) {
    const t = this._battleTimers[battleId];
    if (!t) return;

    // Update clock display
    const clock = document.getElementById('btclock-' + battleId);
    if (clock) {
      const m = Math.floor(t.seconds / 60);
      const s = t.seconds % 60;
      clock.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }

    // Motivational messages every 30 seconds
    if (t.seconds > 0 && t.seconds % 30 === 0 && t.seconds !== t.lastMsg) {
      t.lastMsg = t.seconds;
      const msgs = BattleMode._battleMotivMsgs;
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      const msgEl = document.getElementById('btmsg-' + battleId);
      if (msgEl) {
        msgEl.textContent = msg;
        msgEl.classList.remove('battle-msg-anim');
        void msgEl.offsetWidth;
        msgEl.classList.add('battle-msg-anim');
      }
      AudioEng.speak(msg.replace(/[\uD83D\uDCAA\uD83D\uDD25\u26A1\uD83C\uDFC6\uD83D\uDE4C\uD83D\uDCA5\u2694\uFE0F\uD83E\uDDBE\uD83C\uDFAF\uD83D\uDE80]/gu, ''));
      toast(msg, 3000);
    }

    // Milestone announcements
    if (t.seconds === 60) AudioEng.speak('Un minuto de batalla');
    if (t.seconds === 300) AudioEng.speak('Cinco minutos. Sigan asi!');
    if (t.seconds === 600) AudioEng.speak('Diez minutos de batalla. Increible esfuerzo!');
  },

  // Desafiar al Champion 1v1
  async challengeChampion(battleId, championUid, type) {
    if (!U) return toast('Debes iniciar sesión');
    const myUid = U.uid;
    if (myUid === championUid) return toast('¡Tú eres el Champion!');

    // Obtener datos del champion y del retador
    let champName = 'Champion', myName = 'Retador';
    try {
      const champDoc = await db.collection('users').doc(championUid).get();
      if (champDoc.exists) champName = champDoc.data().name || champDoc.data().email || 'Champion';
      const myDoc = await db.collection('users').doc(myUid).get();
      if (myDoc.exists) myName = myDoc.data().name || myDoc.data().email || 'Retador';
    } catch(e) {}

    if (!confirm('\u00bf Desafiar a ' + champName + ' en un 1v1 de ' + type + '?')) return;

    try {
      // Obtener la batalla original para referencia
      const origBattle = await db.collection('battles').doc(battleId).get();
      const origData = origBattle.exists ? origBattle.data() : {};

      // Crear batalla 1v1
      const challengeData = {
        name: '\u2694\uFE0F Desaf\u00edo: ' + myName + ' vs ' + champName,
        type: type,
        status: 'active',
        isChallenge: true,
        originalBattle: battleId,
        challengerUid: myUid,
        challengerName: myName,
        defendingChampion: championUid,
        defendingChampionName: champName,
        routine: origData.routine || 'Desaf\u00edo libre',
        trainerId: origData.trainerId || '',
        createdAt: new Date().toISOString(),
        participants: {}
      };

      // Agregar ambos participantes
      challengeData.participants[championUid] = {
        name: champName, status: 'pending', isDefender: true
      };
      challengeData.participants[myUid] = {
        name: myName, status: 'pending', isChallenger: true
      };

      const ref = await db.collection('battles').add(challengeData);

      // Notificar al champion
      await db.collection('users').doc(championUid).collection('notifications').add({
        type: 'challenge',
        message: '\uD83D\uDD25 ' + myName + ' te ha desafiado a un 1v1 de ' + type + '!',
        battleId: ref.id,
        from: myUid,
        fromName: myName,
        read: false,
        createdAt: new Date().toISOString()
      });

      toast('\u2694\uFE0F \u00a1Desaf\u00edo enviado a ' + champName + '!');
      AudioEng.speak('Desaf\u00edo enviado a ' + champName + '. Buena suerte!');
      BattleMode.list();
    } catch(e) { toast('Error al crear desaf\u00edo: ' + e.message); }
  },

  // Eliminar batalla (solo entrenador)
  async deleteBattle(battleId) {
    if (ROLE !== 'trainer') return toast('Solo entrenadores');
    if (!confirm('¿Eliminar esta batalla? Esta acción no se puede deshacer.')) return;

    try {
      // Obtener datos de la batalla para limpiar subcolecciones
      const doc = await db.collection('battles').doc(battleId).get();
      if (!doc.exists) return toast('Batalla no encontrada');
      const data = doc.data();

      // Eliminar referencia en cada participante
      const participants = data.participants || {};
      for (const uid of Object.keys(participants)) {
        try {
          await db.collection('users').doc(uid).collection('battles').doc(battleId).delete();
        } catch(e) { console.warn('Error limpiando batalla de usuario:', uid, e); }
      }

      // Eliminar la batalla principal
      await db.collection('battles').doc(battleId).delete();

      toast('🗑️ Batalla eliminada');
      AudioEng.speak('Batalla eliminada correctamente');
      BattleMode.list();
    } catch(e) {
      toast('Error al eliminar: ' + e.message);
      console.error('Error eliminando batalla:', e);
    }
  },
  // Animación de coronación
  showCoronation(name, titleInfo) {
    const overlay = document.createElement("div");
    overlay.className = "coronation-overlay";
    overlay.innerHTML = '<div class="coronation-content">'
      + '<div class="coronation-crown">👑</div>'
      + '<h2 class="coronation-name">' + name + '</h2>'
      + '<div class="coronation-title" style="color:' + titleInfo.color + '">' + titleInfo.emoji + " " + titleInfo.title + '</div>'
      + '<div class="coronation-confetti"></div>'
      + '</div>';
    document.body.appendChild(overlay);
    setTimeout(() => { overlay.classList.add("active"); }, 50);
    setTimeout(() => { overlay.classList.remove("active"); setTimeout(() => overlay.remove(), 500); }, 4000);
  },

// ═══════════════════════════════════════════════════════════
  //  RANKING GLOBAL — Sistema de puntajes acumulados
  // ═══════════════════════════════════════════════════════════

  _rankCache: null,
  _rankCacheTime: 0,

  getPointsForPosition(pos, total) {
    if (pos === 0) return 100;
    if (pos === 1) return 70;
    if (pos === 2) return 50;
    if (pos === 3) return 35;
    return 25;
  },

  async computeGlobalRanking() {
    // Cache 60s
    if (this._rankCache && (Date.now() - this._rankCacheTime < 60000)) return this._rankCache;

    try {
      const trainerId = ROLE === 'trainer' ? U.uid : (PROF?.trainerId || '');
      if (!trainerId) return [];

      const snap = await db.collection('battles')
        .where('trainerId','==', trainerId)
        .where('status','==','finished')
        .orderBy('createdAt','desc')
        .limit(50).get();

      const playerMap = {};

      snap.docs.forEach(doc => {
        const b = doc.data();
        const parts = b.participants || {};
        const type = b.type;
        const isChallenge = b.isChallenge || false;

        // Sort participants by performance
        const sorted = Object.entries(parts).sort((x,y) => {
          if (type === 'time') return (x[1].time||99999) - (y[1].time||99999);
          if (type === 'reps') return (y[1].reps||0) - (x[1].reps||0);
          return (y[1].weight||0) - (x[1].weight||0);
        });

        sorted.forEach(([uid, p], idx) => {
          if (!playerMap[uid]) {
            playerMap[uid] = {
              uid, name: p.name || 'Atleta',
              totalPts: 0, wins: 0, battles: 0, podiums: 0,
              streak: 0, maxStreak: 0, bestTime: null, bestReps: 0, bestWeight: 0,
              lastBattle: null, lastResult: '', challengeWins: 0,
              history: []
            };
          }
          const pm = playerMap[uid];
          pm.battles++;

          const pts = BattleMode.getPointsForPosition(idx, sorted.length);
          let earned = pts;

          // Bonus Champion
          if (idx === 0) {
            pm.wins++;
            pm.streak++;
            if (pm.streak > pm.maxStreak) pm.maxStreak = pm.streak;
            // Streak bonus
            if (pm.streak >= 3) earned = Math.round(earned * 1.5);
            else if (pm.streak >= 2) earned = Math.round(earned * 1.2);
            // Challenge bonus
            if (isChallenge) { earned += 30; pm.challengeWins++; }
          } else {
            pm.streak = 0;
          }

          if (idx < 3) pm.podiums++;

          // Track bests
          if (type === 'time' && p.time && (!pm.bestTime || p.time < pm.bestTime)) pm.bestTime = p.time;
          if (type === 'reps' && p.reps && p.reps > pm.bestReps) pm.bestReps = p.reps;
          if (type === 'weight' && p.weight && p.weight > pm.bestWeight) pm.bestWeight = p.weight;

          pm.totalPts += earned;
          pm.lastBattle = b.name || 'Batalla';
          pm.lastResult = idx === 0 ? 'Champion' : (idx+1) + 'o lugar';

          pm.history.push({
            battle: b.name || 'Batalla',
            date: b.finishedAt || b.createdAt,
            pos: idx + 1,
            pts: earned,
            type: type,
            value: type === 'time' ? p.time : (type === 'reps' ? p.reps : p.weight)
          });
        });
      });

      // Sort by total points
      const ranking = Object.values(playerMap).sort((a,b) => b.totalPts - a.totalPts);

      // Assign ranks and tiers
      ranking.forEach((r, i) => {
        r.rank = i + 1;
        if (r.totalPts >= 500) r.tier = { name: 'Leyenda', icon: '👑', color: '#FFD700', glow: '0 0 20px #FFD700' };
        else if (r.totalPts >= 350) r.tier = { name: 'Diamante', icon: '💎', color: '#b9f2ff', glow: '0 0 15px #00e5ff' };
        else if (r.totalPts >= 200) r.tier = { name: 'Platino', icon: '⚡', color: '#E5E4E2', glow: '0 0 12px #ccc' };
        else if (r.totalPts >= 100) r.tier = { name: 'Oro', icon: '🔥', color: '#ff9800', glow: '0 0 10px #ff9800' };
        else if (r.totalPts >= 50) r.tier = { name: 'Plata', icon: '⚔️', color: '#90CAF9', glow: '0 0 8px #42A5F5' };
        else r.tier = { name: 'Bronce', icon: '🛡️', color: '#CD7F32', glow: '0 0 6px #8B4513' };
      });

      this._rankCache = ranking;
      this._rankCacheTime = Date.now();
      return ranking;
    } catch(e) {
      console.error('Ranking error:', e);
      return [];
    }
  },

  async renderGlobalRanking() {
    const ranking = await this.computeGlobalRanking();
    let html = '';

    // ═══ HEADER ═══
    html += '<div class="rank-global-header">';
    html += '<div class="rank-global-title">';
    html += '<span class="rank-trophy-anim">🏆</span>';
    html += '<h3>RANKING GLOBAL</h3>';
    html += '<span class="rank-trophy-anim">🏆</span>';
    html += '</div>';
    html += '<p class="rank-subtitle">Puntaje acumulado de todas las batallas</p>';
    html += '</div>';

    if (ranking.length === 0) {
      html += '<div class="rank-empty"><p>Aún no hay batallas finalizadas para generar ranking.</p></div>';
      return html;
    }

    // ═══ TOP 3 PODIUM ═══
    const top3 = ranking.slice(0, 3);
    html += '<div class="rank-podium">';

    // 2nd place (left)
    if (top3[1]) {
      html += '<div class="rank-podium-item rank-podium-2">';
      html += '<div class="rank-podium-medal">🥈</div>';
      html += '<div class="rank-podium-avatar" style="box-shadow:' + top3[1].tier.glow + '">' + top3[1].tier.icon + '</div>';
      html += '<div class="rank-podium-name">' + top3[1].name + '</div>';
      html += '<div class="rank-podium-pts">' + top3[1].totalPts + ' pts</div>';
      html += '<div class="rank-podium-tier" style="color:' + top3[1].tier.color + '">' + top3[1].tier.name + '</div>';
      html += '<div class="rank-podium-bar rank-bar-2"></div>';
      html += '</div>';
    }

    // 1st place (center, tallest)
    if (top3[0]) {
      html += '<div class="rank-podium-item rank-podium-1">';
      html += '<div class="rank-podium-crown">👑</div>';
      html += '<div class="rank-podium-avatar rank-avatar-gold" style="box-shadow:' + top3[0].tier.glow + '">' + top3[0].tier.icon + '</div>';
      html += '<div class="rank-podium-name rank-name-gold">' + top3[0].name + '</div>';
      html += '<div class="rank-podium-pts rank-pts-gold">' + top3[0].totalPts + ' pts</div>';
      html += '<div class="rank-podium-tier" style="color:' + top3[0].tier.color + '">' + top3[0].tier.name + '</div>';
      html += '<div class="rank-podium-stats-mini">';
      html += '🏆' + top3[0].wins + ' | 🎯' + top3[0].podiums + ' | 🔥' + top3[0].maxStreak;
      html += '</div>';
      html += '<div class="rank-podium-bar rank-bar-1"></div>';
      html += '</div>';
    }

    // 3rd place (right)
    if (top3[2]) {
      html += '<div class="rank-podium-item rank-podium-3">';
      html += '<div class="rank-podium-medal">🥉</div>';
      html += '<div class="rank-podium-avatar" style="box-shadow:' + top3[2].tier.glow + '">' + top3[2].tier.icon + '</div>';
      html += '<div class="rank-podium-name">' + top3[2].name + '</div>';
      html += '<div class="rank-podium-pts">' + top3[2].totalPts + ' pts</div>';
      html += '<div class="rank-podium-tier" style="color:' + top3[2].tier.color + '">' + top3[2].tier.name + '</div>';
      html += '<div class="rank-podium-bar rank-bar-3"></div>';
      html += '</div>';
    }
    html += '</div>';

    // ═══ FULL TABLE ═══
    html += '<div class="rank-table">';
    html += '<div class="rank-table-header">';
    html += '<span class="rank-th rank-th-pos">#</span>';
    html += '<span class="rank-th rank-th-name">Atleta</span>';
    html += '<span class="rank-th rank-th-pts">Pts</span>';
    html += '<span class="rank-th rank-th-wins">W</span>';
    html += '<span class="rank-th rank-th-bat">B</span>';
    html += '<span class="rank-th rank-th-streak">🔥</span>';
    html += '<span class="rank-th rank-th-last">Última</span>';
    html += '</div>';

    ranking.forEach((r, i) => {
      const isMe = r.uid === (U ? U.uid : '');
      html += '<div class="rank-row ' + (isMe ? 'rank-row-me' : '') + ' rank-row-tier-' + r.tier.name.toLowerCase() + '" onclick="BattleMode.showPlayerDetail(\'' + r.uid + '\')">';
      html += '<span class="rank-td rank-td-pos">';
      if (i === 0) html += '<span class="rank-pos-1">👑</span>';
      else if (i === 1) html += '<span class="rank-pos-2">🥈</span>';
      else if (i === 2) html += '<span class="rank-pos-3">🥉</span>';
      else html += '<span class="rank-pos-n">' + (i+1) + '</span>';
      html += '</span>';
      html += '<span class="rank-td rank-td-name">';
      html += '<span class="rank-tier-icon" style="text-shadow:' + r.tier.glow + '">' + r.tier.icon + '</span> ';
      html += r.name;
      if (r.streak >= 2) html += ' <span class="rank-streak-badge">🔥x' + r.streak + '</span>';
      html += '</span>';
      html += '<span class="rank-td rank-td-pts"><strong>' + r.totalPts + '</strong></span>';
      html += '<span class="rank-td rank-td-wins">' + r.wins + '</span>';
      html += '<span class="rank-td rank-td-bat">' + r.battles + '</span>';
      html += '<span class="rank-td rank-td-streak">' + r.maxStreak + '</span>';
      html += '<span class="rank-td rank-td-last">' + r.lastResult + '</span>';
      html += '</div>';
    });
    html += '</div>';

    // ═══ POINTS LEGEND ═══
    html += '<div class="rank-legend">';
    html += '<div class="rank-legend-title">📊 Sistema de Puntos</div>';
    html += '<div class="rank-legend-grid">';
    html += '<span>🥇 1er lugar: 100 pts</span>';
    html += '<span>🥈 2do lugar: 70 pts</span>';
    html += '<span>🥉 3er lugar: 50 pts</span>';
    html += '<span>4to+: 25 pts</span>';
    html += '<span>⚔️ Desafío 1v1: +30 pts</span>';
    html += '<span>🔥 Racha x3+: x1.5</span>';
    html += '</div>';
    html += '</div>';

    return html;
  },

  async showPlayerDetail(uid) {
    const ranking = await this.computeGlobalRanking();
    const player = ranking.find(r => r.uid === uid);
    if (!player) return;

    let html = '<div class="rank-detail-overlay" onclick="if(event.target===this)this.remove()">';
    html += '<div class="rank-detail-card">';
    html += '<button class="rank-detail-close" onclick="this.closest(\'.rank-detail-overlay\').remove()">✕</button>';

    // Header
    html += '<div class="rank-detail-header" style="border-color:' + player.tier.color + '">';
    html += '<div class="rank-detail-icon" style="text-shadow:' + player.tier.glow + '">' + player.tier.icon + '</div>';
    html += '<h3>' + player.name + '</h3>';
    html += '<div class="rank-detail-tier" style="color:' + player.tier.color + '">' + player.tier.name + '</div>';
    html += '<div class="rank-detail-pts">' + player.totalPts + ' PTS</div>';
    html += '</div>';

    // Stats grid
    html += '<div class="rank-detail-stats">';
    html += '<div class="rank-stat-box"><div class="rank-stat-num">' + player.rank + '</div><div class="rank-stat-label">Ranking</div></div>';
    html += '<div class="rank-stat-box"><div class="rank-stat-num">' + player.wins + '</div><div class="rank-stat-label">Victorias</div></div>';
    html += '<div class="rank-stat-box"><div class="rank-stat-num">' + player.battles + '</div><div class="rank-stat-label">Batallas</div></div>';
    html += '<div class="rank-stat-box"><div class="rank-stat-num">' + player.podiums + '</div><div class="rank-stat-label">Podios</div></div>';
    html += '<div class="rank-stat-box"><div class="rank-stat-num">' + player.maxStreak + '</div><div class="rank-stat-label">Max Racha</div></div>';
    html += '<div class="rank-stat-box"><div class="rank-stat-num">' + player.challengeWins + '</div><div class="rank-stat-label">Desafíos</div></div>';
    html += '</div>';

    // Personal bests
    html += '<div class="rank-detail-bests">';
    html += '<div class="rank-best-title">🏅 Mejores Marcas</div>';
    if (player.bestTime) html += '<div>⏱️ Mejor tiempo: ' + BattleMode.formatTime(player.bestTime) + '</div>';
    if (player.bestReps) html += '<div>💪 Mejores reps: ' + player.bestReps + '</div>';
    if (player.bestWeight) html += '<div>🏋️ Mejor peso: ' + player.bestWeight + ' kg</div>';
    html += '</div>';

    // Battle history
    html += '<div class="rank-detail-history">';
    html += '<div class="rank-history-title">📜 Historial</div>';
    player.history.slice(-10).reverse().forEach(h => {
      const posIcon = h.pos === 1 ? '👑' : (h.pos === 2 ? '🥈' : (h.pos === 3 ? '🥉' : '▪️'));
      html += '<div class="rank-history-row">';
      html += '<span>' + posIcon + ' ' + h.battle + '</span>';
      html += '<span>+' + h.pts + ' pts</span>';
      html += '</div>';
    });
    html += '</div>';

    html += '</div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  },
};



window.BattleMode = BattleMode;

// ════════════════════════════════════════════════════
//  2. AVISO MITAD DE TIEMPO — Mid-Timer Alert
// ════════════════════════════════════════════════════

(function() {
  // Variables para rastrear si ya se anunció la mitad
  let halfAnnounced = false;
  let originalTotal = 0;

  // Interceptar startTimer para resetear el flag
  const _origStartTimer = window.startTimer;
  window.startTimer = function() {
    halfAnnounced = false;
    // Calcular tiempo total según modo
    if (TIMER_MODE === 'countdown') originalTotal = COUNTDOWN_FROM;
    else if (TIMER_MODE === 'tabata') originalTotal = (TABATA_WORK + TABATA_REST) * TABATA_ROUNDS;
    else if (TIMER_MODE === 'emom') originalTotal = EMOM_MINUTES * 60;
    else if (TIMER_MODE === 'amrap') originalTotal = AMRAP_MINUTES * 60;
    else originalTotal = 0;

    _origStartTimer();
  };

  // Interceptar updateTimerDisplay para detectar mitad
  const _origUpdate = window.updateTimerDisplay;
  window.updateTimerDisplay = function() {
    _origUpdate();

    if (!TIMER_RUN || halfAnnounced || originalTotal === 0) return;

    let elapsed, total;

    if (TIMER_MODE === 'countdown') {
      total = COUNTDOWN_FROM;
      elapsed = total - TIMER_SEC;
    } else if (TIMER_MODE === 'tabata') {
      total = (TABATA_WORK + TABATA_REST) * TABATA_ROUNDS;
      const roundsDone = TABATA_CURRENT_ROUND - 1;
      elapsed = roundsDone * (TABATA_WORK + TABATA_REST) + (TABATA_IS_WORK ? (TABATA_WORK - TIMER_SEC) : (TABATA_WORK + TABATA_REST - TIMER_SEC));
    } else if (TIMER_MODE === 'emom') {
      total = EMOM_MINUTES * 60;
      elapsed = EMOM_CURRENT_MIN * 60 + (60 - TIMER_SEC);
    } else if (TIMER_MODE === 'amrap') {
      total = AMRAP_MINUTES * 60;
      elapsed = total - TIMER_SEC;
    } else return;

    const half = Math.floor(total / 2);
    if (elapsed >= half && elapsed <= half + 2 && !halfAnnounced) {
      halfAnnounced = true;
      const msg = '¡Vamos con todo! ¡Queda la mitad del tiempo! ¡No aflojes!';
      toast(msg, 4000);
      AudioEng.speak(msg);
      AudioEng.doubleBeep();
      console.log('[MID-TIMER] ' + msg);
    }
  };
})();

// ════════════════════════════════════════════════════
//  3. AGENDA DE CLASES — Class Scheduler
// ════════════════════════════════════════════════════

const ClassScheduler = {

  // ── ENTRENADOR: Crear horario disponible ──
  async renderTrainer() {
    const container = $('tab-agenda');
    if (!container) return;

    let html = '<div class="glass-card agenda-header">';
    html += '<h3 class="section-title">📅 Agenda de Clases</h3>';
    html += '<p class="battle-desc">Programa tus horarios disponibles. Tus atletas podrán agendar clases en estos horarios.</p>';
    html += '<button class="btn-neon btn-add-pr" onclick="ClassScheduler.showCreateSlot()">+ Crear Horario</button>';
    html += '</div>';

    // Cargar horarios existentes
    try {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const snap = await db.collection('users').doc(U.uid).collection('class_slots')
        .where('date','>=',todayStr).orderBy('date').limit(50).get();

      const sortedDocs = snap.docs.sort((a,b) => (a.data().startTime||'').localeCompare(b.data().startTime||''));
      if (snap.empty) {
        html += '<div class="pr-empty glass-card-inner"><p>No tienes horarios programados.</p><p>Crea tu primer horario disponible.</p></div>';
      } else {
        let currentDate = '';
        snap.docs.sort((a,b) => ((a.data().date+a.data().startTime)||'').localeCompare((b.data().date+b.data().startTime)||'')).forEach(d => {
          const slot = { id: d.id, ...d.data() };
          if (slot.date !== currentDate) {
            if (currentDate) html += '</div>';
            currentDate = slot.date;
            const dateObj = new Date(slot.date + 'T12:00:00');
            const dayName = dateObj.toLocaleDateString('es', { weekday:'long', day:'numeric', month:'long' });
            html += '<div class="agenda-day-group"><h4 class="agenda-day-title">📆 ' + dayName + '</h4>';
          }

          const booked = slot.bookedBy;
          const bookedCount = slot.bookedCount || 0;
          const maxCap = slot.maxCapacity || 1;
          const pct = Math.round((bookedCount / maxCap) * 100);
          const statusClass = bookedCount >= maxCap ? 'slot-card-full' : bookedCount > 0 ? 'slot-card-partial' : 'slot-card-open';

          html += '<div class="slot-card ' + statusClass + '">';
          html += '<div class="slot-card-header">';
          html += '<div class="slot-card-type">' + (slot.className || 'Clase') + '</div>';
          html += '<div class="slot-card-time">🕐 ' + slot.startTime + ' - ' + slot.endTime + '</div>';
          html += '</div>';
          if (slot.modality === 'online') html += '<div class="slot-card-online-badge">📹 ONLINE</div>';
          html += '<div class="slot-card-body">';
          html += '<div class="slot-card-capacity-row">';
          html += '<span class="slot-card-cap-label">Cupos</span>';
          html += '<div class="slot-card-bar-wrap"><div class="slot-card-bar" style="width:' + pct + '%"></div></div>';
          html += '<span class="slot-card-cap-num">' + bookedCount + '/' + maxCap + '</span>';
          html += '</div>';

          if (booked && typeof booked === 'object') {
            html += '<div class="slot-card-athletes">';
            Object.entries(booked).forEach(([uid, info]) => {
              html += '<span class="slot-card-athlete">👤 ' + (info.name || 'Atleta') + '</span>';
            });
            html += '</div>';
          }

          if (slot.notes) html += '<div class="slot-card-notes">📝 ' + slot.notes + '</div>';
          html += '</div>';
          html += '<div class="slot-card-footer">';
          if (slot.modality === 'online' && slot.roomId && bookedCount > 0) {
            html += '<button class="slot-card-btn-start" data-room="' + slot.roomId + '" onclick="ClassScheduler.joinOnline(this.dataset.room)">\uD83D\uDCF9 Iniciar Clase</button>';
          }
          if (slot.modality === 'online' && slot.roomId && bookedCount === 0) {
            html += '<button class="slot-card-btn-prepare" data-room="' + slot.roomId + '" onclick="ClassScheduler.joinOnline(this.dataset.room)">\uD83D\uDCF9 Preparar Sala</button>';
          }
          if (slot.modality === 'online' && slot.roomId) {
            html += '<div class="slot-card-room-info">\uD83D\uDD17 Sala: ' + slot.roomId + '</div>';
            html += '<button class="slot-card-btn-copy" data-room="' + slot.roomId + '" onclick="ClassScheduler.copyRoomLink(this.dataset.room)">\uD83D\uDCCB Copiar enlace</button>';
          }
          html += '<button class="slot-card-btn-delete" onclick="ClassScheduler.deleteSlot(\'' + slot.id + '\')">🗑️ Eliminar</button>';
          html += '</div>';
          html += '</div>';
        });
        html += '</div>';
      }
    } catch(e) {
      html += '<div class="pr-empty glass-card-inner"><p>Error cargando horarios: ' + e.message + '</p></div>';
      console.warn('Error agenda:', e);
    }

    container.innerHTML = html;
  },

  showCreateSlot() {
    const container = $('tab-agenda');
    if (!container) return;

    const today = new Date().toISOString().split('T')[0];

    let html = '<div class="glass-card agenda-form">';
    html += '<h3 class="section-title">➕ Nuevo Horario de Clase</h3>';

    html += '<label class="pr-label">Nombre de la clase</label>';
    html += '<select id="slot-class-name" class="glass-input">';
    html += '<option value="Entrenamiento Personal">🏋️ Entrenamiento Personal</option>';
    html += '<option value="Clase Grupal">👥 Clase Grupal</option>';
    html += '<option value="CrossFit">🔥 CrossFit</option>';
    html += '<option value="Levantamiento Olímpico">🥇 Levantamiento Olímpico</option>';
    html += '<option value="Funcional">💪 Funcional</option>';
    html += '<option value="Cardio">🏃 Cardio</option>';
    html += '<option value="Yoga">🧘 Yoga</option>';
    html += '<option value="Evaluación">📋 Evaluación</option>';
    html += '<option value="__custom">✏️ Otro...</option>';
    html += '</select>';
    html += '<input type="text" id="slot-class-custom" class="glass-input" placeholder="Nombre personalizado" style="display:none;margin-top:8px">';

    html += '<label class="pr-label">Fecha</label>';
    html += '<input type="date" id="slot-date" class="glass-input" value="' + today + '" min="' + today + '">';

    html += '<label class="pr-label">Hora inicio</label>';
    html += '<input type="time" id="slot-start" class="glass-input" value="09:00">';

    html += '<label class="pr-label">Hora fin</label>';
    html += '<input type="time" id="slot-end" class="glass-input" value="10:00">';

    html += '<label class="pr-label">Capacidad máxima</label>';
    html += '<input type="number" id="slot-capacity" class="glass-input" value="1" min="1" max="30">';

    // Repetir
    html += '<label class="pr-label">Repetir</label>';
    html += '<select id="slot-repeat" class="glass-input">';
    html += '<option value="none">Solo esta fecha</option>';
    html += '<option value="weekly">Semanalmente (4 semanas)</option>';
    html += '<option value="daily">Diariamente (7 días)</option>';
    html += '</select>';

    html += '<label class="pr-label">Notas (opcional)</label>';
    html += '<input type="text" id="slot-notes" class="glass-input" placeholder="Ej: Traer toalla, nivel avanzado...">';

    html += '<label class="pr-label">Modalidad</label>';
    html += '<select id="slot-modality" class="glass-input">';
    html += '<option value="presencial">🏢 Presencial</option>';
    html += '<option value="online">📹 Online (Video)</option>';
    html += '</select>';

    html += '<div class="pr-form-actions">';
    html += '<button class="btn-neon" onclick="ClassScheduler.submitSlot()">💾 Crear Horario</button>';
    html += '<button class="btn-neon btn-secondary" onclick="ClassScheduler.render()">Cancelar</button>';
    html += '</div></div>';

    container.innerHTML = html;

    $('slot-class-name').onchange = function() {
      const c = $('slot-class-custom');
      if (c) c.style.display = this.value === '__custom' ? 'block' : 'none';
    };
  },

  async submitSlot() {
    const classSelect = $('slot-class-name')?.value;
    const className = classSelect === '__custom' ? ($('slot-class-custom')?.value?.trim() || 'Clase') : classSelect;
    const date = $('slot-date')?.value;
    const startTime = $('slot-start')?.value;
    const endTime = $('slot-end')?.value;
    const maxCapacity = parseInt($('slot-capacity')?.value) || 1;
    const repeat = $('slot-repeat')?.value || 'none';
    const notes = $('slot-notes')?.value?.trim() || '';
    const modality = $('slot-modality')?.value || 'presencial';
    const roomId = modality === 'online' ? 'DebbiePro-' + U.uid.substring(0,8) + '-' + Date.now().toString(36) : null;

    if (!date || !startTime || !endTime) return toast('Completa fecha y horarios');
    if (startTime >= endTime) return toast('La hora de fin debe ser mayor a la de inicio');

    // Generar fechas según repetición
    const dates = [date];
    if (repeat === 'weekly') {
      for (let i = 1; i <= 3; i++) {
        const d = new Date(date + 'T12:00:00');
        d.setDate(d.getDate() + (i * 7));
        dates.push(d.toISOString().split('T')[0]);
      }
    } else if (repeat === 'daily') {
      for (let i = 1; i <= 6; i++) {
        const d = new Date(date + 'T12:00:00');
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }
    }

    try {
      for (const dt of dates) {
        await db.collection('users').doc(U.uid).collection('class_slots').add({
          className, date: dt, startTime, endTime, maxCapacity, notes, modality, roomId,
          trainerId: U.uid, trainerName: PROF?.name || PROF?.email || '',
          bookedBy: {}, bookedCount: 0,
          createdAt: new Date().toISOString()
        });
      }
      toast('✅ ' + dates.length + ' horario(s) creado(s)');
      AudioEng.speak('Horarios creados exitosamente');
      ClassScheduler.render();
    } catch(e) { toast('Error: ' + e.message); }
  },

  async deleteSlot(slotId) {
    if (!confirm('¿Cancelar este horario? Los atletas agendados serán notificados.')) return;
    try {
      await db.collection('users').doc(U.uid).collection('class_slots').doc(slotId).delete();
      toast('Horario cancelado');
      ClassScheduler.render();
    } catch(e) { toast('Error: ' + e.message); }
  },

  // ── ATLETA: Ver y agendar clases ──
  async renderClient() {
    const container = $('tab-agenda');
    if (!container) return;

    let html = '<div class="glass-card agenda-header">';
    html += '<h3 class="section-title">📅 Agendar Clase</h3>';
    html += '<p class="battle-desc">Selecciona un horario disponible de tu entrenador para agendar tu clase.</p>';
    html += '</div>';

    // Buscar trainerId del atleta
    const trainerId = PROF?.trainerId;
    if (!trainerId) {
      html += '<div class="pr-empty glass-card-inner"><p>No tienes un entrenador asignado.</p><p>Pide a tu entrenador que te agregue como atleta.</p></div>';
      container.innerHTML = html;
      return;
    }

    try {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const snap = await db.collection('users').doc(trainerId).collection('class_slots')
        .where('date','>=',todayStr).orderBy('date').limit(30).get();

      if (snap.empty) {
        html += '<div class="pr-empty glass-card-inner"><p>Tu entrenador no tiene horarios disponibles por el momento.</p></div>';
      } else {
        let currentDate = '';
        snap.docs.sort((a,b) => ((a.data().date+a.data().startTime)||'').localeCompare((b.data().date+b.data().startTime)||'')).forEach(d => {
          const slot = { id: d.id, ...d.data() };
          if (slot.date !== currentDate) {
            if (currentDate) html += '</div>';
            currentDate = slot.date;
            const dateObj = new Date(slot.date + 'T12:00:00');
            const dayName = dateObj.toLocaleDateString('es', { weekday:'long', day:'numeric', month:'long' });
            html += '<div class="agenda-day-group"><h4 class="agenda-day-title">📆 ' + dayName + '</h4>';
          }

          const myBooking = slot.bookedBy && slot.bookedBy[U.uid];
          const isFull = (slot.bookedCount || 0) >= (slot.maxCapacity || 1);

          const bookedC = slot.bookedCount || 0;
          const maxCapC = slot.maxCapacity || 1;
          const pctC = Math.round((bookedC / maxCapC) * 100);
          const cardClass = myBooking ? 'slot-card-booked' : (isFull ? 'slot-card-full' : 'slot-card-open');

          html += '<div class="slot-card ' + cardClass + '">';
          html += '<div class="slot-card-header">';
          html += '<div class="slot-card-type">' + (slot.className || 'Clase') + '</div>';
          html += '<div class="slot-card-time">🕐 ' + slot.startTime + ' - ' + slot.endTime + '</div>';
          html += '</div>';
          if (slot.modality === 'online') html += '<div class="slot-card-online-badge">📹 ONLINE</div>';
          html += '<div class="slot-card-body">';
          html += '<div class="slot-card-capacity-row">';
          html += '<span class="slot-card-cap-label">Cupos</span>';
          html += '<div class="slot-card-bar-wrap"><div class="slot-card-bar" style="width:' + pctC + '%"></div></div>';
          html += '<span class="slot-card-cap-num">' + bookedC + '/' + maxCapC + '</span>';
          html += '</div>';
          if (slot.notes) html += '<div class="slot-card-notes">📝 ' + slot.notes + '</div>';
          html += '</div>';

          html += '<div class="slot-card-footer">';
          if (myBooking) {
            html += '<span class="slot-card-badge-ok">✅ Agendado</span>';
            if (slot.modality === 'online' && slot.roomId) html += '<button class="slot-card-btn-join" data-room="' + slot.roomId + '" onclick="ClassScheduler.joinOnline(this.dataset.room)">📹 Unirse</button>';
          } else if (!isFull) {
            html += '<button class="slot-card-btn-book" onclick="ClassScheduler.book(\'' + trainerId + '\',\'' + slot.id + '\')">📋 Agendar</button>';
          } else {
            html += '<span class="slot-card-badge-full">Clase llena</span>';
          }
          html += '</div>';
          html += '</div>';
        });
        html += '</div>';
      }
    } catch(e) {
      html += '<div class="pr-empty glass-card-inner"><p>Error: ' + e.message + '</p></div>';
    }

    container.innerHTML = html;
  },

  async book(trainerId, slotId) {
    try {
      const ref = db.collection('users').doc(trainerId).collection('class_slots').doc(slotId);
      const doc = await ref.get();
      if (!doc.exists) return toast('Horario no disponible');
      const slot = doc.data();

      if ((slot.bookedCount || 0) >= (slot.maxCapacity || 1)) return toast('Clase llena');
      if (slot.bookedBy && slot.bookedBy[U.uid]) return toast('Ya tienes esta clase agendada');

      const update = {};
      update['bookedBy.' + U.uid] = { name: PROF?.name || PROF?.email || '', bookedAt: new Date().toISOString() };
      update['bookedCount'] = firebase.firestore.FieldValue.increment(1);
      await ref.update(update);

      toast('✅ ¡Clase agendada!');
      AudioEng.speak('Clase agendada exitosamente');
      ClassScheduler.render();
    } catch(e) { toast('Error: ' + e.message); }
  },

  async cancelBooking(trainerId, slotId) {
    if (!confirm('¿Cancelar esta clase?')) return;
    try {
      const ref = db.collection('users').doc(trainerId).collection('class_slots').doc(slotId);
      const update = {};
      update['bookedBy.' + U.uid] = firebase.firestore.FieldValue.delete();
      update['bookedCount'] = firebase.firestore.FieldValue.increment(-1);
      await ref.update(update);
      toast('Clase cancelada');
      ClassScheduler.render();
    } catch(e) { toast('Error: ' + e.message); }
  },

  // Render según rol

  copyRoomLink(roomId) {
    const url = 'https://meet.jit.si/' + roomId;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        toast('\u2705 Enlace copiado: ' + url);
        AudioEng.speak('Enlace de clase copiado');
      }).catch(() => {
        prompt('Copia este enlace:', url);
      });
    } else {
      prompt('Copia este enlace:', url);
    }
  },

  joinOnline(roomId) {
    if (!roomId) return toast('Esta clase no tiene sala online configurada');
    
    // Verificar permisos de cámara antes de unirse
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(function(stream) {
        // Cámara OK, detener stream de prueba
        stream.getTracks().forEach(function(t) { t.stop(); });
        
        // Abrir sala Jitsi con cámara obligatoria
        var jitsiUrl = 'https://meet.jit.si/' + roomId;
        jitsiUrl += '#config.startWithVideoMuted=false';
        jitsiUrl += '&config.startWithAudioMuted=false';
        jitsiUrl += '&config.prejoinPageEnabled=false';
        if (ROLE === 'trainer') {
          jitsiUrl += '&config.toolbarButtons=["microphone","camera","chat","desktop","fullscreen","hangup","participants-pane","settings","tileview"]';
          jitsiUrl += '&config.subject=' + encodeURIComponent('Clase Debbie Pro');
        }
        jitsiUrl += '&config.disableDeepLinking=true';
        jitsiUrl += '&userInfo.displayName=' + encodeURIComponent(PROF?.name || PROF?.email || (ROLE === 'trainer' ? 'Entrenador' : 'Atleta'));
        
        // Abrir en nueva ventana/pestaña
        var videoWin = window.open(jitsiUrl, 'debbie-class-' + roomId, 'width=800,height=600');
        if (!videoWin) {
          // Si bloqueó popup, abrir en misma pestaña con opción de volver
          if (confirm('Se abrirá la videollamada. ¿Continuar?')) {
            window.open(jitsiUrl, '_blank');
          }
        }
        toast('📹 Conectando a clase online...');
        AudioEng.speak('Conectando a clase online');
      })
      .catch(function(err) {
        toast('⚠️ Debes permitir acceso a la cámara para unirte a clases online');
        AudioEng.speak('Necesitas activar tu cámara para esta clase');
        console.warn('Camera error:', err);
      });
  },

  render() {
    if (ROLE === 'trainer') ClassScheduler.renderTrainer();
    else ClassScheduler.renderClient();
  }
};

window.ClassScheduler = ClassScheduler;

// ════════════════════════════════════════════════════
//  INTEGRAR TABS DE BATALLA Y AGENDA
// ════════════════════════════════════════════════════

function addMegaTabs() {
  const nav = document.querySelector('.bottom-nav');
  if (!nav) return;

  // Tab Batalla ⚔️
  if (!$('nav-battle')) {
    const battleBtn = document.createElement('button');
    battleBtn.className = 'nav-btn';
    battleBtn.id = 'nav-battle';
    battleBtn.setAttribute('data-tab', 'battle');
    battleBtn.innerHTML = '<span class="nav-icon">⚔️</span><span class="nav-label">Batalla</span>';
    battleBtn.addEventListener('click', function() { showTab('battle'); });

    const prNav = $('nav-pr');
    if (prNav) nav.insertBefore(battleBtn, prNav);
    else nav.appendChild(battleBtn);

    const battleSection = document.createElement('div');
    battleSection.id = 'tab-battle';
    battleSection.className = 'tab-content';
    battleSection.style.display = 'none';
    const main = document.querySelector('.main-content') || document.querySelector('main') || document.body;
    main.appendChild(battleSection);
  }

  // Tab Agenda 📅
  if (!$('nav-agenda')) {
    const agendaBtn = document.createElement('button');
    agendaBtn.className = 'nav-btn';
    agendaBtn.id = 'nav-agenda';
    agendaBtn.setAttribute('data-tab', 'agenda');
    agendaBtn.innerHTML = '<span class="nav-icon">📅</span><span class="nav-label">Agenda</span>';
    agendaBtn.addEventListener('click', function() { showTab('agenda'); });

    const prNav = $('nav-pr');
    if (prNav) nav.insertBefore(agendaBtn, prNav);
    else nav.appendChild(agendaBtn);

    const agendaSection = document.createElement('div');
    agendaSection.id = 'tab-agenda';
    agendaSection.className = 'tab-content';
    agendaSection.style.display = 'none';
    const main = document.querySelector('.main-content') || document.querySelector('main') || document.body;
    main.appendChild(agendaSection);
  }
}

// Extender showTab para las nuevas pestañas
const _origShowTabMega = window.showTab;
window.showTab = function(tab) {
  if (tab === 'battle') {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    const bt = $('tab-battle');
    if (bt) { bt.style.display = 'block'; BattleMode.list(); }
    const bn = $('nav-battle');
    if (bn) bn.classList.add('active');
    return;
  }
  if (tab === 'agenda') {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    const at = $('tab-agenda');
    if (at) { at.style.display = 'block'; ClassScheduler.render(); }
    const an = $('nav-agenda');
    if (an) an.classList.add('active');
    return;
  }
  _origShowTabMega(tab);
};

// Inicializar
if (document.readyState === 'complete') setTimeout(addMegaTabs, 600);
else window.addEventListener('load', () => setTimeout(addMegaTabs, 600));

console.log('⚔️ Modo Batalla cargado');
console.log('⏱️ Mid-Timer Alert cargado');
console.log('📅 Agenda de Clases cargado');

})();
} catch(e) {
  console.warn('⚠️ mega-features.js error (no-fatal):', e.message);
}
