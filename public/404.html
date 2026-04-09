<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no">
  <meta name="theme-color" content="#00f0ff">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="description" content="DEBBIE PRO - Tu entrenador inteligente">
  <link rel="manifest" href="/manifest.json">
  <link rel="icon" type="image/png" href="/static/icon-192.png">
  <link rel="apple-touch-icon" href="/static/icon-192.png">
  <title>DEBBIE PRO</title>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
  <link rel="stylesheet" href="/static/styles.css">
  <script src="https://js.puter.com/v2/"></script>
</head>
<body>

  <!-- LOGIN -->
  <div id="login-screen" class="screen login-screen" style="display:flex">
    <div class="login-card glass-card">
      <div class="login-logo">
        <div class="logo-circle">
          <svg viewBox="0 0 60 60" width="60" height="60">
            <circle cx="30" cy="30" r="28" fill="none" stroke="#00f0ff" stroke-width="2"/>
            <text x="30" y="36" text-anchor="middle" fill="#00f0ff" font-size="22" font-weight="bold" font-family="sans-serif">DP</text>
          </svg>
        </div>
        <h1 class="app-title">DEBBIE <span class="pro">PRO</span></h1>
        <p class="login-subtitle">Tu entrenador inteligente</p>
      </div>
      <form id="loginForm" autocomplete="on" onsubmit="event.preventDefault(); doLogin();">
        <div class="input-group">
          <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          <input type="email" id="login-email" class="glass-input" placeholder="Email" autocomplete="email" required>
        </div>
        <div class="input-group">
          <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <input type="password" id="login-pass" class="glass-input" placeholder="Contraseña" autocomplete="current-password" required>
        </div>
        <div class="input-group">
          <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
          <input type="text" id="login-key" class="glass-input" placeholder="Clave de acceso (solo registro)" autocomplete="off">
        </div>
        <button type="submit" id="btn-login" class="btn-neon btn-full">
          <span>Ingresar</span>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </form>
      <p class="login-hint"></p>
    </div>
  </div>

  <!-- ROL -->
  <div id="role-screen" class="screen role-screen" style="display:none">
    <div class="glass-card role-card">
      <h2 class="neon-text">¿Cuál es tu rol?</h2>
      <p class="role-subtitle">Personaliza tu experiencia</p>
      <div class="role-options">
        <div class="role-option glass-card-inner" onclick="selectRole('client')">
          <span class="role-icon">💪</span>
          <strong>Soy Atleta</strong>
          <p>Entrenar, seguir rutinas, controlar nutrición</p>
        </div>
        <div class="role-option glass-card-inner" onclick="selectRole('trainer')">
          <span class="role-icon">🏋️</span>
          <strong>Soy Entrenador</strong>
          <p>Crear rutinas, asignar a atletas, monitorear</p>
        </div>
      </div>
    </div>
  </div>

  <!-- ENCUESTA METAS -->
  <div id="goals-screen" class="screen goals-screen" style="display:none"></div>

  <!-- APP PRINCIPAL -->
  <div id="app-main" class="app-main" style="display:none">
    <header class="top-bar">
      <div class="top-left"><span class="top-logo">DEBBIE <span class="pro">PRO</span></span></div>
      <div class="top-right">
        <button class="btn-icon-top" onclick="showTab('perfil')" title="Perfil">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </div>
    </header>

    <main class="main-content">
      <div class="tab-content" id="tab-dash"></div>
      <div class="tab-content" id="tab-ruts" style="display:none"></div>
      <div class="tab-content" id="tab-timer" style="display:none"></div>
      <div class="tab-content" id="tab-nutri" style="display:none"></div>
      <div class="tab-content" id="tab-cal" style="display:none"></div>
      <div class="tab-content" id="tab-perfil" style="display:none"></div>
    </main>

    <nav class="bottom-nav">
      <button class="nav-btn active" data-tab="dash">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <span>Inicio</span>
      </button>
      <button class="nav-btn" data-tab="ruts">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 5h12M6 12h12M6 19h12"/><circle cx="3" cy="5" r="1" fill="currentColor"/><circle cx="3" cy="12" r="1" fill="currentColor"/><circle cx="3" cy="19" r="1" fill="currentColor"/></svg>
        <span>Rutinas</span>
      </button>
      <button class="nav-btn" data-tab="timer">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span>Timer</span>
      </button>
      <button class="nav-btn" data-tab="nutri">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
        <span>Nutrición</span>
      </button>
      <button class="nav-btn" data-tab="cal">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span>Calendario</span>
      </button>
      <button class="nav-btn" data-tab="perfil">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Perfil</span>
      </button>
    </nav>
  </div>

  <div id="toast" class="toast"></div>
  <script src="/static/app.js"></script>
<script src="/static/exercises-extra.js"></script>
<script src="/static/mega-features.js"></script>

<script>
// Auto-update Service Worker v2 — recarga automática
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(reg => {
    // Chequear actualización al abrir la app
    reg.update();

    // Detectar nuevo SW instalándose
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'activated') {
          console.log('[APP] Nueva versión activada — recargando...');
          window.location.reload();
        }
      });
    });

    // Chequear actualizaciones cada 60 segundos
    setInterval(() => reg.update(), 60000);
  });

  // Escuchar mensaje del SW para recargar
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'SW_UPDATED') {
      console.log('[APP] SW actualizado a:', event.data.version, '— recargando...');
      window.location.reload();
    }
  });
}
</script>
</body>
</html>