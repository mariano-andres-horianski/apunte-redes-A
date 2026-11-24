(function () {
  'use strict';

  var App = window.RedesApp = window.RedesApp || {};
  var currentTab = 'map';

  /* Estados locales de simuladores */
  var selectedMapNode = 'mac';
  var alohaG = 0.5;
  var wirelessScenario = 'hidden_no_rts';
  var includeVlan = false;
  var selectedEthField = 'preamble';
  var phyFilter = 'all';
  var switchMacTable = {};
  var switchLastLog = 'Elegí origen y destino y presioná "Enviar trama" para observar cómo aprende el switch.';
  var switchHighlight = { src: null, dst: null, mode: 'idle' };
  var toDS = 1;
  var fromDS = 0;
  var selectedIpHeaderMode = 'ipv4';
  var selectedIpField = 'v4_ttl';
  var packetStep = 0;
  var chapterQuizAnswers = {};

  function renderStage() {
    var stage = document.getElementById('diagram-stage');
    if (!stage) return;

    stage.innerHTML =
      '<div id="diagram-chapter-content" class="diagram-stage"></div>' +
      '<div id="diagram-chapter-quiz"></div>';

    var contentHost = document.getElementById('diagram-chapter-content');
    var quizHost = document.getElementById('diagram-chapter-quiz');

    if (currentTab === 'map') renderConceptMapTab(contentHost);
    else if (currentTab === 'mac') renderMacTab(contentHost);
    else if (currentTab === 'ethernet') renderEthernetTab(contentHost);
    else if (currentTab === 'switching') renderSwitchingTab(contentHost);
    else if (currentTab === 'wifi') renderWifiTab(contentHost);
    else if (currentTab === 'network') renderNetworkTab(contentHost);

    renderChapterQuiz(quizHost, currentTab);
  }

  /* ==================== TAB 1: MAPA CONCEPTUAL GLOBAL ==================== */
  function renderConceptMapTab(stage) {
    var nodes = (App.DIAGRAMS_DATA && App.DIAGRAMS_DATA.conceptMapNodes) || {};
    var active = nodes[selectedMapNode] || nodes.mac;

    stage.innerHTML =
      '<div class="diagram-grid-2">' +
        '<div class="card">' +
          '<h3>Arquitectura de Capas 1 a 3 (clicá un nodo)</h3>' +
          '<p class="small muted">Visualizá cómo dialogan el medio físico, la subcapa MAC, las LAN conmutadas/Wi-Fi y el enrutamiento IP.</p>' +
          '<div class="svg-box">' +
            '<svg viewBox="0 0 720 460" aria-label="Mapa conceptual de Redes de Datos">' +
              '<defs>' +
                '<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
                  '<path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b"></path>' +
                '</marker>' +
              '</defs>' +
              /* Fondos de capas */
              '<rect x="14" y="14" width="692" height="118" rx="10" fill="rgba(37,99,235,0.08)" stroke="#2563eb" stroke-dasharray="5 4"></rect>' +
              '<text x="26" y="36" font-size="13.5" font-weight="700" fill="#2563eb">CAPA 3 · RED (Paquetes / Datagramas · Router · Dirección IP jerárquica)</text>' +

              '<rect x="14" y="146" width="692" height="178" rx="10" fill="rgba(13,148,136,0.08)" stroke="#0d9488" stroke-dasharray="5 4"></rect>' +
              '<text x="26" y="168" font-size="13.5" font-weight="700" fill="#0d9488">CAPA 2 · ENLACE (Tramas · LLC + MAC · Switch / AP · Dirección MAC plana 48b)</text>' +

              '<rect x="14" y="338" width="692" height="108" rx="10" fill="rgba(100,116,139,0.10)" stroke="#64748b" stroke-dasharray="5 4"></rect>' +
              '<text x="26" y="360" font-size="13.5" font-weight="700" fill="#475569">CAPA 1 · FÍSICA (Señal, codificación, medio · Repetidor / Hub)</text>' +

              /* Flechas */
              '<line x1="360" y1="370" x2="360" y2="302" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)"></line>' +
              '<line x1="178" y1="242" x2="194" y2="242" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)"></line>' +
              '<line x1="350" y1="242" x2="366" y2="242" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)"></line>' +
              '<line x1="273" y1="190" x2="210" y2="122" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)"></line>' +
              '<line x1="580" y1="190" x2="510" y2="122" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)"></line>' +
              '<line x1="320" y1="84" x2="368" y2="84" stroke="#64748b" stroke-width="2" marker-end="url(#arrow)"></line>' +

              /* Nodos */
              mapNodeSvg('network_ip', 28, 50, 292, 68, 'IPv4 / IPv6 & Subnetting', 'Cabeceras, CIDR, TTL, MTU', '#2563eb') +
              mapNodeSvg('network_proto', 372, 50, 320, 68, 'ARP · DHCP · ICMP · NAT · Routing', 'IP↔MAC, DORA, OSPF vs RIP', '#1d4ed8') +

              mapNodeSvg('mac', 22, 192, 156, 100, 'Subcapa MAC', 'ALOHA · CSMA/CD · CA', '#0d9488') +
              mapNodeSvg('ethernet', 196, 192, 154, 100, 'Ethernet 802.3', 'Trama 64–1518B · PHY', '#0f766e') +
              mapNodeSvg('switching', 368, 192, 158, 100, 'Switches y STP', 'Tabla MAC · VLAN · PoE', '#0891b2') +
              mapNodeSvg('wifi', 542, 192, 156, 100, 'Wi‑Fi 802.11', 'DCF/EDCA · MIMO · WPA3', '#7c3aed') +

              mapNodeSvg('phy', 34, 372, 652, 60, 'Capa Física: Coaxial · Par Trenzado · Fibra · Radio (2,4 / 5 / 6 GHz)', 'Manchester · 4B/5B · PAM-5 · OFDM', '#475569') +
            '</svg>' +
          '</div>' +
        '</div>' +

        '<div class="card">' +
          '<span class="pill pill-teal">Inspector de Concepto</span>' +
          '<h3 style="margin-top:0.5rem">' + App.escapeHtml(active.title) + '</h3>' +
          '<p>' + App.escapeHtml(active.description) + '</p>' +
          '<h4>Claves del apunte</h4>' +
          '<ul class="feature-list">' +
            active.bullets.map(function (b) { return '<li>' + App.escapeHtml(b) + '</li>'; }).join('') +
          '</ul>' +
          '<div class="explanation-box" style="margin-bottom:1rem">' +
            '<strong>Conexión entre capas:</strong> ' + App.escapeHtml(active.connection) +
          '</div>' +
          '<div class="mode-card-actions">' +
            (active.diagramTab !== 'map' ? '<button type="button" class="btn btn-teal btn-sm" data-open-diag-tab="' + active.diagramTab + '">Ir al simulador de este tema</button>' : '') +
            '<button type="button" class="btn btn-outline btn-sm" data-unit-quiz="' + active.unit + '">Practicar examen</button>' +
            '<button type="button" class="btn btn-outline btn-sm" data-unit-deep="' + active.unit + '">Preguntas profundas</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    var mapNodes = stage.querySelectorAll('[data-map-node]');
    for (var i = 0; i < mapNodes.length; i++) {
      mapNodes[i].addEventListener('click', function () {
        selectedMapNode = this.getAttribute('data-map-node');
        renderConceptMapTab(stage);
      });
    }
    var jumpBtn = stage.querySelector('[data-open-diag-tab]');
    if (jumpBtn) {
      jumpBtn.addEventListener('click', function () {
        App.DiagramsModule.setTab(this.getAttribute('data-open-diag-tab'));
      });
    }
  }

  function mapNodeSvg(id, x, y, w, h, title, sub, color) {
    var isSel = selectedMapNode === id;
    var strokeW = isSel ? 3 : 1.5;
    var strokeCol = isSel ? '#f59e0b' : color;
    var midY = y + h / 2;
    var titleSize = title.length > 36 ? 15 : 16;
    var subSize = w < 170 ? 12.5 : 13.5;
    return (
      '<g class="svg-node" data-map-node="' + id + '">' +
        '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="9" fill="' + color + '" stroke="' + strokeCol + '" stroke-width="' + strokeW + '"></rect>' +
        '<text x="' + (x + w / 2) + '" y="' + (midY - 10) + '" text-anchor="middle" dominant-baseline="central" font-size="' + titleSize + '" font-weight="700" fill="#ffffff">' + App.escapeHtml(title) + '</text>' +
        '<text x="' + (x + w / 2) + '" y="' + (midY + 13) + '" text-anchor="middle" dominant-baseline="central" font-size="' + subSize + '" fill="#e2e8f0">' + App.escapeHtml(sub) + '</text>' +
      '</g>'
    );
  }

  /* ==================== TAB 2: MAC, ALOHA, CSMA/CD y WIRELESS ==================== */
  function renderMacTab(stage) {
    var sPure = alohaG * Math.exp(-2 * alohaG);
    var sSlot = alohaG * Math.exp(-alohaG);
    var eAttempts = Math.exp(alohaG);
    var pEmpty = Math.exp(-alohaG);
    var pSuccess = sSlot;
    var pColl = Math.max(0, 1 - pEmpty - pSuccess);

    /* Puntos de curva SVG: G de 0 a 3, X: 55..535, Y: 225..30 (max S=0.45) */
    function toX(g) { return 55 + (g / 3.0) * 480; }
    function toY(s) { return 225 - (s / 0.45) * 190; }

    var ptsPure = [];
    var ptsSlot = [];
    for (var g = 0; g <= 3.01; g += 0.1) {
      ptsPure.push(toX(g).toFixed(1) + ',' + toY(g * Math.exp(-2 * g)).toFixed(1));
      ptsSlot.push(toX(g).toFixed(1) + ',' + toY(g * Math.exp(-g)).toFixed(1));
    }

    var scenarioInfo = getWirelessScenarioInfo(wirelessScenario);

    stage.innerHTML =
      '<div class="diagram-grid-2">' +
        '<div class="card">' +
          '<h3>Rendimiento ALOHA Puro vs Ranurado</h3>' +
          '<p class="small muted">Mové el deslizador de carga ofrecida <strong>G</strong> (intentos por tiempo de trama T) para ver cómo colapsa el canal al aumentar la contención.</p>' +
          '<div class="slider-row">' +
            '<strong>G = <span id="aloha-g-val">' + alohaG.toFixed(2) + '</span></strong>' +
            '<input type="range" id="aloha-g-slider" min="0" max="3" step="0.05" value="' + alohaG + '">' +
          '</div>' +
          '<div class="svg-box">' +
            '<svg viewBox="0 0 580 260">' +
              '<line x1="55" y1="225" x2="545" y2="225" stroke="#64748b" stroke-width="1.5"></line>' +
              '<line x1="55" y1="25" x2="55" y2="225" stroke="#64748b" stroke-width="1.5"></line>' +
              '<line x1="55" y1="' + toY(0.368).toFixed(1) + '" x2="540" y2="' + toY(0.368).toFixed(1) + '" stroke="#0d9488" stroke-dasharray="4 4" opacity="0.5"></line>' +
              '<line x1="55" y1="' + toY(0.184).toFixed(1) + '" x2="540" y2="' + toY(0.184).toFixed(1) + '" stroke="#2563eb" stroke-dasharray="4 4" opacity="0.5"></line>' +
              '<text x="10" y="' + (toY(0.368) + 4).toFixed(1) + '" font-size="11" fill="#0d9488">36,8%</text>' +
              '<text x="10" y="' + (toY(0.184) + 4).toFixed(1) + '" font-size="11" fill="#2563eb">18,4%</text>' +
              '<text x="275" y="250" font-size="12" fill="#475569">Carga ofrecida G (0 a 3.0)</text>' +
              '<polyline fill="none" stroke="#0d9488" stroke-width="3" points="' + ptsSlot.join(' ') + '"></polyline>' +
              '<polyline fill="none" stroke="#2563eb" stroke-width="3" points="' + ptsPure.join(' ') + '"></polyline>' +
              '<line x1="' + toX(alohaG).toFixed(1) + '" y1="30" x2="' + toX(alohaG).toFixed(1) + '" y2="225" stroke="#d97706" stroke-dasharray="3 3"></line>' +
              '<circle cx="' + toX(alohaG).toFixed(1) + '" cy="' + toY(sSlot).toFixed(1) + '" r="6" fill="#0d9488" stroke="#fff" stroke-width="2"></circle>' +
              '<circle cx="' + toX(alohaG).toFixed(1) + '" cy="' + toY(sPure).toFixed(1) + '" r="6" fill="#2563eb" stroke="#fff" stroke-width="2"></circle>' +
              '<rect x="345" y="24" width="190" height="48" rx="6" fill="rgba(255,255,255,0.9)" stroke="#cbd5e1"></rect>' +
              '<circle cx="360" cy="40" r="5" fill="#0d9488"></circle><text x="372" y="44" font-size="11" fill="#0f172a">Ranurado: S = G·e^(-G)</text>' +
              '<circle cx="360" cy="58" r="5" fill="#2563eb"></circle><text x="372" y="62" font-size="11" fill="#0f172a">Puro: S = G·e^(-2G)</text>' +
            '</svg>' +
          '</div>' +
          '<div class="stats-strip" style="margin-top:0.85rem;grid-template-columns:repeat(4,1fr)">' +
            '<div class="stat-box"><span class="stat-label">S Puro</span><strong class="stat-value">' + (sPure * 100).toFixed(1) + '%</strong></div>' +
            '<div class="stat-box"><span class="stat-label">S Ranurado</span><strong class="stat-value">' + (sSlot * 100).toFixed(1) + '%</strong></div>' +
            '<div class="stat-box"><span class="stat-label">Intentos E=e^G</span><strong class="stat-value">' + eAttempts.toFixed(2) + '</strong></div>' +
            '<div class="stat-box"><span class="stat-label">Slots (V/E/C)</span><strong class="stat-value" style="font-size:0.92rem">' + Math.round(pEmpty * 100) + '/' + Math.round(pSuccess * 100) + '/' + Math.round(pColl * 100) + '%</strong></div>' +
          '</div>' +
        '</div>' +

        '<div class="card">' +
          '<h3>Regla 2τ y Trama Mínima en CSMA/CD</h3>' +
          '<p class="small muted">¿Por qué 64 bytes (512 bits) como mínimo en Ethernet de 10/100 Mb/s? En el peor caso, la estación B empieza a transmitir justo antes de que llegue la señal de A.</p>' +
          '<div class="svg-box">' +
            '<svg viewBox="0 0 460 210">' +
              '<line x1="65" y1="24" x2="65" y2="185" stroke="#2563eb" stroke-width="3"></line>' +
              '<line x1="395" y1="24" x2="395" y2="185" stroke="#dc2626" stroke-width="3"></line>' +
              '<text x="65" y="16" text-anchor="middle" font-size="12" font-weight="700" fill="#2563eb">Estación A</text>' +
              '<text x="395" y="16" text-anchor="middle" font-size="12" font-weight="700" fill="#dc2626">Estación B</text>' +
              '<line x1="65" y1="38" x2="395" y2="102" stroke="#2563eb" stroke-width="2.5"></line>' +
              '<line x1="395" y1="96" x2="65" y2="165" stroke="#dc2626" stroke-width="2.5" stroke-dasharray="5 3"></line>' +
              '<circle cx="65" cy="38" r="5" fill="#2563eb"></circle><text x="14" y="42" font-size="11" fill="#475569">t = 0</text>' +
              '<circle cx="395" cy="96" r="5" fill="#dc2626"></circle><text x="403" y="100" font-size="11" fill="#dc2626">t = τ − ε</text>' +
              '<circle cx="65" cy="165" r="5" fill="#d97706"></circle><text x="10" y="169" font-size="11" font-weight="700" fill="#d97706">t ≈ 2τ</text>' +
              '<rect x="115" y="172" width="245" height="28" rx="6" fill="rgba(217,119,6,0.14)" stroke="#d97706"></rect>' +
              '<text x="237" y="190" text-anchor="middle" font-size="11" font-weight="700" fill="#b45309">A debe seguir transmitiendo hasta 2τ (51,2 µs)</text>' +
            '</svg>' +
          '</div>' +
          '<ul class="feature-list" style="margin-top:0.75rem;margin-bottom:0">' +
            '<li><strong>ALOHA puro:</strong> período vulnerable = <code>2T</code> (sin sensado).</li>' +
            '<li><strong>ALOHA ranurado:</strong> alinea inicios a slots, vulnerable = <code>T</code>.</li>' +
            '<li><strong>CSMA/CD:</strong> si la trama terminara antes de <code>2τ</code>, A creería que salió bien aunque colisionó en B.</li>' +
          '</ul>' +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-header-row">' +
          '<div>' +
            '<h3>Terminales Ocultas vs Expuestas y RTS/CTS + NAV</h3>' +
            '<p class="small muted">En inalámbrico importa la interferencia <strong>en el receptor</strong>, no en el emisor.</p>' +
          '</div>' +
          '<div class="filter-pills">' +
            '<button type="button" class="review-filter-btn' + (wirelessScenario === 'hidden_no_rts' ? ' is-active' : '') + '" data-wscen="hidden_no_rts">Oculta (sin RTS/CTS)</button>' +
            '<button type="button" class="review-filter-btn' + (wirelessScenario === 'hidden_rts' ? ' is-active' : '') + '" data-wscen="hidden_rts">Oculta + RTS/CTS (NAV)</button>' +
            '<button type="button" class="review-filter-btn' + (wirelessScenario === 'exposed' ? ' is-active' : '') + '" data-wscen="exposed">Terminal Expuesta</button>' +
          '</div>' +
        '</div>' +
        '<div class="diagram-grid-2">' +
          '<div class="svg-box">' + scenarioInfo.svg + '</div>' +
          '<div class="explanation-box">' +
            '<h4>' + App.escapeHtml(scenarioInfo.title) + '</h4>' +
            '<p>' + App.escapeHtml(scenarioInfo.text) + '</p>' +
            '<p class="small muted" style="margin:0"><strong>Nota de parcial:</strong> ' + App.escapeHtml(scenarioInfo.note) + '</p>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.getElementById('aloha-g-slider').addEventListener('input', function () {
      alohaG = parseFloat(this.value);
      renderMacTab(stage);
    });

    var wBtns = stage.querySelectorAll('[data-wscen]');
    for (var i = 0; i < wBtns.length; i++) {
      wBtns[i].addEventListener('click', function () {
        wirelessScenario = this.getAttribute('data-wscen');
        renderMacTab(stage);
      });
    }
  }

  function getWirelessScenarioInfo(mode) {
    if (mode === 'hidden_no_rts') {
      return {
        title: 'Problema de Terminal Oculta (colisión en B)',
        text: 'A transmite hacia B. Como C está fuera del alcance de A, C sensa el canal libre y también transmite hacia B. Ambas señales colisionan en el receptor B.',
        note: 'En radio no hay detección de colisiones durante TX; A y C recién notan la falla al no recibir ACK.',
        svg: '<svg viewBox="0 0 520 190">' +
          '<circle cx="150" cy="95" r="82" fill="rgba(37,99,235,0.10)" stroke="#2563eb" stroke-dasharray="4 3"></circle>' +
          '<circle cx="370" cy="95" r="82" fill="rgba(124,58,237,0.10)" stroke="#7c3aed" stroke-dasharray="4 3"></circle>' +
          '<circle cx="110" cy="95" r="20" fill="#2563eb"></circle><text x="110" y="100" text-anchor="middle" fill="#fff" font-weight="700">A</text>' +
          '<circle cx="260" cy="95" r="20" fill="#dc2626"></circle><text x="260" y="100" text-anchor="middle" fill="#fff" font-weight="700">B</text>' +
          '<circle cx="410" cy="95" r="20" fill="#7c3aed"></circle><text x="410" y="100" text-anchor="middle" fill="#fff" font-weight="700">C</text>' +
          '<line x1="132" y1="95" x2="236" y2="95" stroke="#2563eb" stroke-width="3"></line>' +
          '<line x1="388" y1="95" x2="284" y2="95" stroke="#7c3aed" stroke-width="3"></line>' +
          '<text x="260" y="150" text-anchor="middle" font-size="12" font-weight="700" fill="#dc2626">¡COLISIÓN EN B! (C no oye a A)</text>' +
        '</svg>'
      };
    }
    if (mode === 'hidden_rts') {
      return {
        title: 'Solución con RTS / CTS y portadora virtual (NAV)',
        text: 'A envía RTS a B; B responde con CTS (que incluye el campo Duration). Aunque C no oye el RTS de A, sí oye el CTS de B y actualiza su temporizador NAV para abstenerse mientras dura la trama + ACK.',
        note: 'Es más barato chocar dos tramas cortas de control que dos tramas largas de datos, aunque rara vez se activa para tramas cortas.',
        svg: '<svg viewBox="0 0 520 190">' +
          '<circle cx="260" cy="95" r="165" fill="rgba(13,148,136,0.08)" stroke="#0d9488" stroke-dasharray="4 3"></circle>' +
          '<circle cx="110" cy="95" r="20" fill="#2563eb"></circle><text x="110" y="100" text-anchor="middle" fill="#fff" font-weight="700">A</text>' +
          '<circle cx="260" cy="95" r="20" fill="#0d9488"></circle><text x="260" y="100" text-anchor="middle" fill="#fff" font-weight="700">B</text>' +
          '<circle cx="410" cy="95" r="20" fill="#d97706"></circle><text x="410" y="100" text-anchor="middle" fill="#fff" font-weight="700">C</text>' +
          '<path d="M 135 82 Q 185 52 238 82" fill="none" stroke="#2563eb" stroke-width="2.5"></path><text x="185" y="60" text-anchor="middle" font-size="11" font-weight="700" fill="#2563eb">1. RTS</text>' +
          '<path d="M 282 108 Q 335 138 386 108" fill="none" stroke="#0d9488" stroke-width="2.5"></path><text x="335" y="138" text-anchor="middle" font-size="11" font-weight="700" fill="#0d9488">2. CTS → C fija NAV</text>' +
          '<text x="410" y="148" text-anchor="middle" font-size="11" font-weight="700" fill="#b45309">C espera (NAV activo)</text>' +
        '</svg>'
      };
    }
    return {
      title: 'Problema de Terminal Expuesta (espera innecesaria)',
      text: 'B transmite hacia A. C quiere transmitir hacia D (fuera del alcance de B). Como C oye la transmisión de B, pospone su envío sin necesidad, aunque A no oye a C y D no oye a B: ambas transmisiones serían compatibles.',
      note: 'El RTS/CTS estándar de 802.11 resuelve terminales ocultas, pero NO resuelve terminales expuestas.',
      svg: '<svg viewBox="0 0 520 190">' +
        '<circle cx="80" cy="95" r="19" fill="#0d9488"></circle><text x="80" y="100" text-anchor="middle" fill="#fff" font-weight="700">A</text>' +
        '<circle cx="200" cy="95" r="19" fill="#2563eb"></circle><text x="200" y="100" text-anchor="middle" fill="#fff" font-weight="700">B</text>' +
        '<circle cx="320" cy="95" r="19" fill="#d97706"></circle><text x="320" y="100" text-anchor="middle" fill="#fff" font-weight="700">C</text>' +
        '<circle cx="440" cy="95" r="19" fill="#64748b"></circle><text x="440" y="100" text-anchor="middle" fill="#fff" font-weight="700">D</text>' +
        '<line x1="178" y1="95" x2="103" y2="95" stroke="#2563eb" stroke-width="3"></line><text x="140" y="82" text-anchor="middle" font-size="11" font-weight="700" fill="#2563eb">B → A</text>' +
        '<line x1="222" y1="108" x2="298" y2="108" stroke="#dc2626" stroke-dasharray="4 3" stroke-width="2"></line><text x="260" y="128" text-anchor="middle" font-size="11" fill="#dc2626">C oye a B</text>' +
        '<line x1="342" y1="95" x2="418" y2="95" stroke="#94a3b8" stroke-dasharray="4 4" stroke-width="2.5"></line><text x="380" y="82" text-anchor="middle" font-size="11" fill="#64748b">C ✕ D (se frena)</text>' +
      '</svg>'
    };
  }

  /* ==================== TAB 3: TRAMA ETHERNET Y PHY ==================== */
  function renderEthernetTab(stage) {
    var fields = (App.DIAGRAMS_DATA && App.DIAGRAMS_DATA.ethernetFrameFields) || [];
    var activeField = fields.find(function (f) { return f.id === selectedEthField; }) || fields[0];
    var phys = (App.DIAGRAMS_DATA && App.DIAGRAMS_DATA.ethernetPhys) || [];

    var minPayload = includeVlan ? 42 : 46;
    var maxFrame = includeVlan ? 1522 : 1518;

    var stripHtml = fields.map(function (f) {
      if (f.id === 'vlan' && !includeVlan) return '';
      var sizeLabel = f.id === 'data' ? (minPayload + '–1500 B') : f.bytes;
      return (
        '<button type="button" class="frame-field-btn' + (f.id === activeField.id ? ' is-active' : '') + '" data-eth-field="' + f.id + '">' +
          '<strong>' + App.escapeHtml(f.name) + '</strong>' +
          '<span>' + App.escapeHtml(sizeLabel) + '</span>' +
        '</button>'
      );
    }).join('');

    var filteredPhys = phys.filter(function (p) {
      return phyFilter === 'all' || p.mediumType === phyFilter;
    });

    stage.innerHTML =
      '<div class="card">' +
        '<div class="card-header-row">' +
          '<div>' +
            '<h3>Explorador Interactivo de la Trama Ethernet (IEEE 802.3)</h3>' +
            '<p class="small muted">Clicá cualquier campo para ver su función. Trama actual: <strong>64 B mín · ' + maxFrame + ' B máx</strong> (sin contar Preámbulo ni SFD).</p>' +
          '</div>' +
          '<label class="checkbox-label">' +
            '<input type="checkbox" id="toggle-vlan-tag"' + (includeVlan ? ' checked' : '') + '>' +
            '<span>Incluir etiqueta VLAN 802.1Q (4 B)</span>' +
          '</label>' +
        '</div>' +
        '<div class="frame-strip">' + stripHtml + '</div>' +
        '<div class="explanation-box">' +
          '<div class="badges-group" style="margin-bottom:0.4rem">' +
            '<span class="pill pill-teal">' + App.escapeHtml(activeField.name) + '</span>' +
            '<span class="pill">' + App.escapeHtml(activeField.id === 'data' ? (minPayload + '–1500 B') : activeField.bytes) + '</span>' +
          '</div>' +
          '<p style="margin-bottom:0.35rem">' + App.escapeHtml(activeField.detail) + '</p>' +
          '<p class="small muted" style="margin:0"><strong>Dato de examen:</strong> ' + App.escapeHtml(activeField.examNote) + '</p>' +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<div class="card-header-row">' +
          '<div>' +
            '<h3>Evolución PHY de Ethernet (10 Mb/s → 800 Gb/s)</h3>' +
            '<p class="small muted">La MAC y la trama se conservan; cambia radicalmente la capa física debajo.</p>' +
          '</div>' +
          '<div class="filter-pills">' +
            '<button type="button" class="review-filter-btn' + (phyFilter === 'all' ? ' is-active' : '') + '" data-phy-filter="all">Todos</button>' +
            '<button type="button" class="review-filter-btn' + (phyFilter === 'coax' ? ' is-active' : '') + '" data-phy-filter="coax">Coaxial</button>' +
            '<button type="button" class="review-filter-btn' + (phyFilter === 'utp' ? ' is-active' : '') + '" data-phy-filter="utp">Par trenzado</button>' +
            '<button type="button" class="review-filter-btn' + (phyFilter === 'fiber' ? ' is-active' : '') + '" data-phy-filter="fiber">Fibra</button>' +
          '</div>' +
        '</div>' +
        '<div style="overflow-x:auto">' +
          '<table class="table-clean">' +
            '<thead><tr><th>Norma</th><th>Tasa</th><th>Medio</th><th>Codificación</th><th>Alcance</th><th>Notas</th></tr></thead>' +
            '<tbody>' +
              filteredPhys.map(function (p) {
                return '<tr><td><strong>' + App.escapeHtml(p.name) + '</strong></td><td>' + App.escapeHtml(p.rate) + '</td><td>' + App.escapeHtml(p.medium) + '</td><td><code>' + App.escapeHtml(p.coding) + '</code></td><td>' + App.escapeHtml(p.reach) + '</td><td class="small muted">' + App.escapeHtml(p.notes) + '</td></tr>';
              }).join('') +
            '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>';

    document.getElementById('toggle-vlan-tag').addEventListener('change', function () {
      includeVlan = this.checked;
      if (!includeVlan && selectedEthField === 'vlan') selectedEthField = 'type';
      renderEthernetTab(stage);
    });

    var fBtns = stage.querySelectorAll('[data-eth-field]');
    for (var i = 0; i < fBtns.length; i++) {
      fBtns[i].addEventListener('click', function () {
        selectedEthField = this.getAttribute('data-eth-field');
        renderEthernetTab(stage);
      });
    }

    var pBtns = stage.querySelectorAll('[data-phy-filter]');
    for (var j = 0; j < pBtns.length; j++) {
      pBtns[j].addEventListener('click', function () {
        phyFilter = this.getAttribute('data-phy-filter');
        renderEthernetTab(stage);
      });
    }
  }

  /* ==================== TAB 4: SWITCH, DOMINIOS, STP Y PoE ==================== */
  function renderSwitchingTab(stage) {
    var hosts = [
      { id: 'A', mac: 'AA:11', port: 'P1', x: 75, y: 45 },
      { id: 'B', mac: 'BB:22', port: 'P2', x: 325, y: 45 },
      { id: 'C', mac: 'CC:33', port: 'P3', x: 75, y: 205 },
      { id: 'D', mac: 'DD:44', port: 'P4', x: 325, y: 205 }
    ];

    var rowsHtml = Object.keys(switchMacTable).length === 0
      ? '<tr><td colspan="2" class="muted small">Tabla vacía (el switch aún no recibió tramas)</td></tr>'
      : Object.keys(switchMacTable).map(function (mac) {
          return '<tr><td><code>' + mac + '</code></td><td><strong>' + switchMacTable[mac] + '</strong></td></tr>';
        }).join('');

    function lineStroke(hostId) {
      if (switchHighlight.mode === 'idle') return '#94a3b8';
      if (hostId === switchHighlight.src) return '#2563eb';
      if (switchHighlight.mode === 'flood' && hostId !== switchHighlight.src) return '#d97706';
      if (switchHighlight.mode === 'forward' && hostId === switchHighlight.dst) return '#059669';
      return '#cbd5e1';
    }

    stage.innerHTML =
      '<div class="diagram-grid-2">' +
        '<div class="card">' +
          '<div class="card-header-row">' +
            '<h3>Simulador de Aprendizaje de Tabla MAC</h3>' +
            '<button type="button" id="btn-reset-mac-table" class="btn btn-outline btn-xs">Vaciar tabla</button>' +
          '</div>' +
          '<div class="quiz-config-row" style="margin-bottom:0.75rem">' +
            '<div class="form-group">' +
              '<label for="sw-src-select">Host Origen</label>' +
              '<select id="sw-src-select" class="input">' +
                hosts.map(function (h) { return '<option value="' + h.id + '">Host ' + h.id + ' (' + h.mac + ' · ' + h.port + ')</option>'; }).join('') +
              '</select>' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="sw-dst-select">Host Destino</label>' +
              '<select id="sw-dst-select" class="input">' +
                hosts.map(function (h, idx) { return '<option value="' + h.id + '"' + (idx === 1 ? ' selected' : '') + '>Host ' + h.id + ' (' + h.mac + ')</option>'; }).join('') +
                '<option value="BCAST">Broadcast (FF:FF:FF:FF:FF:FF)</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
          '<button type="button" id="btn-send-frame" class="btn btn-teal" style="margin-bottom:0.85rem">Enviar trama Ethernet</button>' +
          '<div class="svg-box">' +
            '<svg viewBox="0 0 400 245">' +
              hosts.map(function (h) {
                var col = lineStroke(h.id);
                return '<line x1="' + h.x + '" y1="' + h.y + '" x2="200" y2="125" stroke="' + col + '" stroke-width="' + (col === '#94a3b8' || col === '#cbd5e1' ? 2 : 4) + '"></line>';
              }).join('') +
              '<rect x="145" y="100" width="110" height="50" rx="8" fill="#0d9488"></rect>' +
              '<text x="200" y="129" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">SWITCH L2</text>' +
              hosts.map(function (h) {
                return (
                  '<rect x="' + (h.x - 42) + '" y="' + (h.y - 22) + '" width="84" height="44" rx="8" fill="#1e293b"></rect>' +
                  '<text x="' + h.x + '" y="' + (h.y - 2) + '" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">Host ' + h.id + ' (' + h.port + ')</text>' +
                  '<text x="' + h.x + '" y="' + (h.y + 14) + '" text-anchor="middle" fill="#94a3b8" font-size="10">' + h.mac + '</text>'
                );
              }).join('') +
            '</svg>' +
          '</div>' +
          '<div class="explanation-box" style="margin-top:0.75rem">' + App.escapeHtml(switchLastLog) + '</div>' +
        '</div>' +

        '<div class="card">' +
          '<h3>Tabla MAC en vivo</h3>' +
          '<table class="table-clean" style="margin-bottom:1.1rem">' +
            '<thead><tr><th>Dirección MAC aprendida</th><th>Puerto</th></tr></thead>' +
            '<tbody>' + rowsHtml + '</tbody>' +
          '</table>' +
          '<h4>Dominios de Colisión vs Broadcast</h4>' +
          '<table class="table-clean">' +
            '<thead><tr><th>Dispositivo</th><th>Capa</th><th>Dom. Colisión</th><th>Dom. Broadcast</th></tr></thead>' +
            '<tbody>' +
              '<tr><td>Hub / Repetidor</td><td>1</td><td>1 compartido</td><td>1</td></tr>' +
              '<tr><td>Switch L2</td><td>2</td><td>1 por puerto</td><td>1 (sin VLAN)</td></tr>' +
              '<tr><td>Switch + VLAN</td><td>2</td><td>1 por puerto</td><td>1 por VLAN</td></tr>' +
              '<tr><td>Router</td><td>3</td><td>1 por interfaz</td><td>1 por interfaz</td></tr>' +
            '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +

      '<div class="diagram-grid-2">' +
        '<div class="card">' +
          '<h3>Spanning Tree Protocol (IEEE 802.1D)</h3>' +
          '<p class="small muted">Evita lazos de capa 2 (tormentas de broadcast) dejando enlaces redundantes en bloqueo lógico hasta que caiga un camino activo.</p>' +
          '<div class="svg-box">' +
            '<svg viewBox="0 0 460 175">' +
              '<line x1="230" y1="40" x2="105" y2="135" stroke="#059669" stroke-width="3"></line>' +
              '<line x1="230" y1="40" x2="355" y2="135" stroke="#059669" stroke-width="3"></line>' +
              '<line x1="105" y1="135" x2="355" y2="135" stroke="#dc2626" stroke-width="2.5" stroke-dasharray="6 4"></line>' +
              '<rect x="165" y="15" width="130" height="44" rx="8" fill="#2563eb"></rect>' +
              '<text x="230" y="36" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">Puente Raíz</text>' +
              '<text x="230" y="51" text-anchor="middle" fill="#dbeafe" font-size="10">Menor Bridge ID</text>' +
              '<rect x="55" y="115" width="100" height="40" rx="8" fill="#0d9488"></rect><text x="105" y="139" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">SW2 (RP)</text>' +
              '<rect x="305" y="115" width="100" height="40" rx="8" fill="#0d9488"></rect><text x="355" y="139" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">SW3 (RP)</text>' +
              '<circle cx="290" cy="135" r="12" fill="#dc2626"></circle><text x="290" y="139" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">B</text>' +
              '<text x="230" y="164" text-anchor="middle" font-size="11" fill="#dc2626">Puerto bloqueado (B) corta el bucle</text>' +
            '</svg>' +
          '</div>' +
          '<div class="stp-states-row">' +
            '<span class="stp-state-box">1. Disabled</span><span>→</span>' +
            '<span class="stp-state-box">2. Blocking</span><span>→</span>' +
            '<span class="stp-state-box">3. Listening</span><span>→</span>' +
            '<span class="stp-state-box">4. Learning</span><span>→</span>' +
            '<span class="stp-state-box"><strong>5. Forwarding</strong></span>' +
          '</div>' +
        '</div>' +

        '<div class="card">' +
          '<h3>Store-and-forward vs Cut-through &amp; PoE</h3>' +
          '<table class="table-clean" style="margin-bottom:1rem">' +
            '<thead><tr><th>Modo Switch</th><th>Cuándo reenvía</th><th>FCS / Riesgo</th></tr></thead>' +
            '<tbody>' +
              '<tr><td><strong>Store-and-forward</strong></td><td>Al recibir trama completa</td><td>Verifica FCS; descarta errores (+latencia)</td></tr>' +
              '<tr><td><strong>Cut-through</strong></td><td>Al leer MAC destino</td><td>No verifica FCS; propaga basura (-latencia)</td></tr>' +
            '</tbody>' +
          '</table>' +
          '<table class="table-clean">' +
            '<thead><tr><th>Estándar PoE</th><th>Máx PSE</th><th>Mín PD</th></tr></thead>' +
            '<tbody>' +
              '<tr><td><strong>802.3af (PoE Tipo 1)</strong></td><td>15,4 W</td><td>12,95 W</td></tr>' +
              '<tr><td><strong>802.3at (PoE+ Tipo 2)</strong></td><td>30 W</td><td>25,5 W</td></tr>' +
            '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>';

    document.getElementById('btn-reset-mac-table').addEventListener('click', function () {
      switchMacTable = {};
      switchHighlight = { src: null, dst: null, mode: 'idle' };
      switchLastLog = 'Tabla MAC vaciada. Enviá una trama para comenzar.';
      renderSwitchingTab(stage);
    });

    document.getElementById('btn-send-frame').addEventListener('click', function () {
      var srcId = document.getElementById('sw-src-select').value;
      var dstId = document.getElementById('sw-dst-select').value;
      var srcHost = hosts.find(function (h) { return h.id === srcId; });
      switchMacTable[srcHost.mac] = srcHost.port;

      if (dstId === 'BCAST') {
        switchHighlight = { src: srcId, dst: null, mode: 'flood' };
        switchLastLog = 'Aprendió ' + srcHost.mac + ' → ' + srcHost.port + '. Destino Broadcast (FF:FF:...): INUNDA por todos los puertos excepto ' + srcHost.port + '.';
      } else if (dstId === srcId) {
        switchHighlight = { src: srcId, dst: srcId, mode: 'filter' };
        switchLastLog = 'Aprendió ' + srcHost.mac + ' → ' + srcHost.port + '. Mismo puerto de origen y destino: DESCARTA (filtra) la trama.';
      } else {
        var dstHost = hosts.find(function (h) { return h.id === dstId; });
        if (switchMacTable[dstHost.mac]) {
          switchHighlight = { src: srcId, dst: dstId, mode: 'forward' };
          switchLastLog = 'Aprendió ' + srcHost.mac + ' → ' + srcHost.port + '. Destino ' + dstHost.mac + ' conocido en ' + switchMacTable[dstHost.mac] + ': REENVÍA solo hacia ' + switchMacTable[dstHost.mac] + '.';
        } else {
          switchHighlight = { src: srcId, dst: dstId, mode: 'flood' };
          switchLastLog = 'Aprendió ' + srcHost.mac + ' → ' + srcHost.port + '. Destino ' + dstHost.mac + ' DESCONOCIDO en tabla: INUNDA por todos los puertos salvo ' + srcHost.port + '.';
        }
      }
      renderSwitchingTab(stage);
    });
  }

  /* ==================== TAB 5: WI-FI 802.11 ==================== */
  function renderWifiTab(stage) {
    var modes = (App.DIAGRAMS_DATA && App.DIAGRAMS_DATA.wifiAddressModes) || [];
    var currentAddr = modes.find(function (m) { return m.toDS === toDS && m.fromDS === fromDS; }) || modes[0];

    stage.innerHTML =
      '<div class="diagram-grid-2">' +
        '<div class="card">' +
          '<h3>Canales en 2,4 GHz (1, 6 y 11 sin solapamiento)</h3>' +
          '<p class="small muted">Cada canal ocupa ~22 MHz, mientras que los centros están separados solo 5 MHz. Solo 1, 6 y 11 son independientes entre sí.</p>' +
          '<div class="svg-box">' +
            '<svg viewBox="0 0 520 175">' +
              '<line x1="25" y1="140" x2="495" y2="140" stroke="#64748b" stroke-width="1.5"></line>' +
              '<path d="M 40 140 Q 95 25 150 140" fill="rgba(13,148,136,0.22)" stroke="#0d9488" stroke-width="2.5"></path>' +
              '<path d="M 190 140 Q 245 25 300 140" fill="rgba(37,99,235,0.22)" stroke="#2563eb" stroke-width="2.5"></path>' +
              '<path d="M 340 140 Q 395 25 450 140" fill="rgba(124,58,237,0.22)" stroke="#7c3aed" stroke-width="2.5"></path>' +
              '<path d="M 100 140 Q 155 40 210 140" fill="none" stroke="#94a3b8" stroke-dasharray="4 3"></path>' +
              '<text x="95" y="158" text-anchor="middle" font-size="12" font-weight="700" fill="#0d9488">Ch 1</text>' +
              '<text x="155" y="158" text-anchor="middle" font-size="11" fill="#64748b">Ch 3 (solapa)</text>' +
              '<text x="245" y="158" text-anchor="middle" font-size="12" font-weight="700" fill="#2563eb">Ch 6</text>' +
              '<text x="395" y="158" text-anchor="middle" font-size="12" font-weight="700" fill="#7c3aed">Ch 11</text>' +
            '</svg>' +
          '</div>' +
          '<h4 style="margin-top:0.9rem">Calculadora rápida de Presupuesto de Enlace (dBm)</h4>' +
          '<div class="quiz-config-row" style="grid-template-columns:repeat(4,1fr);margin-bottom:0.5rem">' +
            '<div class="form-group"><label>Pt (dBm)</label><input type="number" id="lb-pt" class="input" value="20"></div>' +
            '<div class="form-group"><label>Gt (dBi)</label><input type="number" id="lb-gt" class="input" value="3"></div>' +
            '<div class="form-group"><label>Gr (dBi)</label><input type="number" id="lb-gr" class="input" value="2"></div>' +
            '<div class="form-group"><label>Pérdidas (dB)</label><input type="number" id="lb-loss" class="input" value="87"></div>' +
          '</div>' +
          '<div class="explanation-box"><strong>Potencia recibida:</strong> P<sub>r</sub> = P<sub>t</sub> + G<sub>t</sub> + G<sub>r</sub> − L = <strong id="lb-result">-62 dBm</strong></div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-header-row">' +
            '<h3>Matriz de Direcciones 802.11 (To DS / From DS)</h3>' +
            '<div class="filter-pills">' +
              '<button type="button" id="btn-tods" class="review-filter-btn' + (toDS ? ' is-active' : '') + '">To DS = ' + toDS + '</button>' +
              '<button type="button" id="btn-fromds" class="review-filter-btn' + (fromDS ? ' is-active' : '') + '">From DS = ' + fromDS + '</button>' +
            '</div>' +
          '</div>' +
          '<p class="small muted">' + App.escapeHtml(currentAddr.scenario) + '</p>' +
          '<div class="frame-strip">' +
            '<div class="frame-field-btn"><strong>FC + Dur</strong><span>4 B</span></div>' +
            '<div class="frame-field-btn is-active"><strong>Addr 1</strong><span>' + App.escapeHtml(currentAddr.a1) + '</span></div>' +
            '<div class="frame-field-btn is-active"><strong>Addr 2</strong><span>' + App.escapeHtml(currentAddr.a2) + '</span></div>' +
            '<div class="frame-field-btn is-active"><strong>Addr 3</strong><span>' + App.escapeHtml(currentAddr.a3) + '</span></div>' +
            '<div class="frame-field-btn"><strong>Seq</strong><span>2 B</span></div>' +
            (currentAddr.a4 !== '—' ? '<div class="frame-field-btn is-active"><strong>Addr 4 (WDS)</strong><span>' + App.escapeHtml(currentAddr.a4) + '</span></div>' : '') +
          '</div>' +
          '<div class="explanation-box">' +
            '<p style="margin-bottom:0.3rem"><strong>Encabezado base:</strong> ' + (currentAddr.a4 !== '—' ? '30 bytes (4 direcciones)' : '24 bytes (3 direcciones)') + '.</p>' +
            '<p class="small muted" style="margin:0">' + App.escapeHtml(currentAddr.note) + '</p>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<h3>Acceso DCF / EDCA y Seguridad 802.11</h3>' +
        '<div class="stp-states-row">' +
          '<span class="stp-state-box"><strong>1. Descubrimiento</strong><br><small>Beacon (100 TU = 102,4 ms) / Probe</small></span><span>→</span>' +
          '<span class="stp-state-box"><strong>2. Autenticación</strong><br><small>Open System o SAE (WPA3)</small></span><span>→</span>' +
          '<span class="stp-state-box"><strong>3. Asociación</strong><br><small>Negocia capacidades del BSS</small></span><span>→</span>' +
          '<span class="stp-state-box"><strong>4. Claves</strong><br><small>802.1X/EAP + 4-Way Handshake (PTK/GTK)</small></span><span>→</span>' +
          '<span class="stp-state-box"><strong>5. Datos</strong><br><small>AES-CCMP / GCMP</small></span>' +
        '</div>' +
        '<p class="small muted" style="margin:0.5rem 0 0"><strong>Espaciados:</strong> SIFS (más corto: ACK/CTS) &lt; PIFS (PCF) &lt; DIFS (DCF contienda) &lt; EIFS (tras error). En EDCA, <code>AIFS = SIFS + AIFSN × SlotTime</code> y el backoff se <strong>congela</strong> cuando el medio se ocupa.</p>' +
      '</div>';

    ['lb-pt', 'lb-gt', 'lb-gr', 'lb-loss'].forEach(function (id) {
      document.getElementById(id).addEventListener('input', function () {
        var pt = parseFloat(document.getElementById('lb-pt').value) || 0;
        var gt = parseFloat(document.getElementById('lb-gt').value) || 0;
        var gr = parseFloat(document.getElementById('lb-gr').value) || 0;
        var loss = parseFloat(document.getElementById('lb-loss').value) || 0;
        document.getElementById('lb-result').textContent = (pt + gt + gr - loss) + ' dBm';
      });
    });

    document.getElementById('btn-tods').addEventListener('click', function () {
      toDS = toDS ? 0 : 1;
      renderWifiTab(stage);
    });
    document.getElementById('btn-fromds').addEventListener('click', function () {
      fromDS = fromDS ? 0 : 1;
      renderWifiTab(stage);
    });
  }

  /* ==================== TAB 6: CAPA DE RED, CABECERAS Y ROUTER ==================== */
  function renderNetworkTab(stage) {
    var headers = (App.DIAGRAMS_DATA && App.DIAGRAMS_DATA.ipHeaders) || { ipv4: [], ipv6: [] };
    var currentFields = headers[selectedIpHeaderMode] || [];
    var activeField = currentFields.find(function (f) { return f.id === selectedIpField; }) || currentFields[0];

    var steps = (App.DIAGRAMS_DATA && App.DIAGRAMS_DATA.packetJourneySteps) || [];
    var stepObj = steps[packetStep] || steps[0];

    stage.innerHTML =
      '<div class="diagram-grid-2">' +
        '<div class="card">' +
          '<div class="card-header-row">' +
            '<h3>Cabeceras IPv4 (20 B) vs IPv6 (40 B fija)</h3>' +
            '<div class="filter-pills">' +
              '<button type="button" class="review-filter-btn' + (selectedIpHeaderMode === 'ipv4' ? ' is-active' : '') + '" data-iphdr="ipv4">IPv4</button>' +
              '<button type="button" class="review-filter-btn' + (selectedIpHeaderMode === 'ipv6' ? ' is-active' : '') + '" data-iphdr="ipv6">IPv6</button>' +
            '</div>' +
          '</div>' +
          '<div class="header-grid-32">' +
            currentFields.map(function (f) {
              var spanCls = f.span === 4 ? ' hdr-span-4' : (f.span === 2 ? ' hdr-span-2' : '');
              var actCls = f.id === activeField.id ? ' is-active' : '';
              return '<button type="button" class="hdr-cell' + spanCls + actCls + '" data-ipfield="' + f.id + '">' + App.escapeHtml(f.name) + '<small>' + App.escapeHtml(f.bits) + '</small></button>';
            }).join('') +
          '</div>' +
          '<div class="explanation-box" style="margin-top:0.85rem">' +
            '<strong>' + App.escapeHtml(activeField.name) + ' (' + App.escapeHtml(activeField.bits) + '):</strong> ' + App.escapeHtml(activeField.detail) +
          '</div>' +
        '</div>' +

        '<div class="card">' +
          '<h3>"El paquete no cambia, la trama sí"</h3>' +
          '<p class="small muted">Seguí paso a paso cómo viaja un paquete desde Host A (192.168.1.10) hasta Host B (10.0.0.20) cruzando un router.</p>' +
          '<div class="svg-box">' +
            '<svg viewBox="0 0 460 140">' +
              '<line x1="70" y1="60" x2="210" y2="60" stroke="' + (packetStep <= 2 ? '#2563eb' : '#94a3b8') + '" stroke-width="3"></line>' +
              '<line x1="250" y1="60" x2="390" y2="60" stroke="' + (packetStep >= 3 ? '#059669' : '#94a3b8') + '" stroke-width="3"></line>' +
              '<rect x="20" y="34" width="84" height="52" rx="8" fill="#1e293b"></rect>' +
              '<text x="62" y="56" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">Host A</text>' +
              '<text x="62" y="72" text-anchor="middle" fill="#94a3b8" font-size="9">MAC AA · .1.10</text>' +
              '<circle cx="230" cy="60" r="28" fill="#2563eb"></circle>' +
              '<text x="230" y="57" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">Router</text>' +
              '<text x="230" y="71" text-anchor="middle" fill="#dbeafe" font-size="9">R1 | R2</text>' +
              '<rect x="356" y="34" width="84" height="52" rx="8" fill="#1e293b"></rect>' +
              '<text x="398" y="56" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">Host B</text>' +
              '<text x="398" y="72" text-anchor="middle" fill="#94a3b8" font-size="9">MAC BB · .0.20</text>' +
              '<text x="230" y="122" text-anchor="middle" font-size="11" font-weight="700" fill="#0f172a">' + App.escapeHtml(stepObj.badge) + '</text>' +
            '</svg>' +
          '</div>' +
          '<div class="explanation-box" style="margin:0.75rem 0">' +
            '<strong>Paso ' + (packetStep + 1) + ' de ' + steps.length + ' · ' + App.escapeHtml(stepObj.title) + ':</strong> ' + App.escapeHtml(stepObj.detail) +
          '</div>' +
          '<div class="question-nav-footer" style="margin-top:0;padding-top:0.5rem">' +
            '<button type="button" id="btn-pkt-prev" class="btn btn-outline btn-sm"' + (packetStep === 0 ? ' disabled' : '') + '>← Anterior</button>' +
            '<button type="button" id="btn-pkt-next" class="btn btn-primary btn-sm"' + (packetStep === steps.length - 1 ? ' disabled' : '') + '>Siguiente →</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="card">' +
        '<h3>Protocolos Complementarios y Enrutamiento</h3>' +
        '<div class="stp-states-row" style="margin-bottom:0.9rem">' +
          '<span class="stp-state-box"><strong>DHCP (DORA):</strong> DISCOVER → OFFER → REQUEST → ACK (arrendamiento / lease)</span>' +
          '<span class="stp-state-box"><strong>ARP:</strong> Broadcast L2 ("¿Quién tiene IP X?") → Caché ~20 min</span>' +
          '<span class="stp-state-box"><strong>NAT/PAT:</strong> Con estado · Depende de L4 (puertos) · Viola modelo de capas</span>' +
        '</div>' +
        '<table class="table-clean">' +
          '<thead><tr><th>Familia de Enrutamiento</th><th>Algoritmo</th><th>Qué intercambia</th><th>Ejemplos</th><th>Problema típico</th></tr></thead>' +
          '<tbody>' +
            '<tr><td><strong>Vector Distancia</strong></td><td>Bellman-Ford</td><td>Distancias conocidas con vecinos</td><td>RIP, IGRP</td><td>Convergencia lenta, cuenta a infinito</td></tr>' +
            '<tr><td><strong>Estado del Enlace</strong></td><td>Dijkstra</td><td>Inunda estado de enlaces (topología total)</td><td>OSPF, IS-IS</td><td>Mayor uso de memoria y CPU</td></tr>' +
          '</tbody>' +
        '</table>' +
      '</div>';

    var hdrBtns = stage.querySelectorAll('[data-iphdr]');
    for (var i = 0; i < hdrBtns.length; i++) {
      hdrBtns[i].addEventListener('click', function () {
        selectedIpHeaderMode = this.getAttribute('data-iphdr');
        selectedIpField = headers[selectedIpHeaderMode][0].id;
        renderNetworkTab(stage);
      });
    }

    var fieldBtns = stage.querySelectorAll('[data-ipfield]');
    for (var j = 0; j < fieldBtns.length; j++) {
      fieldBtns[j].addEventListener('click', function () {
        selectedIpField = this.getAttribute('data-ipfield');
        renderNetworkTab(stage);
      });
    }

    document.getElementById('btn-pkt-prev').addEventListener('click', function () {
      if (packetStep > 0) { packetStep--; renderNetworkTab(stage); }
    });
    document.getElementById('btn-pkt-next').addEventListener('click', function () {
      if (packetStep < steps.length - 1) { packetStep++; renderNetworkTab(stage); }
    });
  }

  function renderChapterQuiz(container, tabId) {
    if (!container) return;
    var quizzes = (App.DIAGRAMS_DATA && App.DIAGRAMS_DATA.chapterQuizzes) || {};
    var questions = quizzes[tabId] || [];
    if (!questions.length) {
      container.innerHTML = '';
      return;
    }

    var answeredCount = 0;
    var correctCount = 0;
    questions.forEach(function (q) {
      if (typeof chapterQuizAnswers[q.id] === 'number') {
        answeredCount++;
        if (chapterQuizAnswers[q.id] === q.correctIndex) correctCount++;
      }
    });

    var letters = ['A', 'B', 'C', 'D'];
    var questionsHtml = questions.map(function (q, qIdx) {
      var chosen = chapterQuizAnswers[q.id];
      var isAnswered = typeof chosen === 'number';
      var isCorrect = isAnswered && chosen === q.correctIndex;

      var optsHtml = q.options.map(function (optText, optIdx) {
        var cls = 'option-btn chapter-quiz-opt';
        var tag = '';
        if (isAnswered) {
          if (optIdx === q.correctIndex) {
            cls += ' opt-correct';
            tag = '<span class="small" style="margin-left:auto">✓</span>';
          } else if (optIdx === chosen) {
            cls += ' opt-wrong';
            tag = '<span class="small" style="margin-left:auto">✗</span>';
          }
        }
        return (
          '<button type="button" class="' + cls + '" data-cq-qid="' + App.escapeHtml(q.id) + '" data-cq-opt="' + optIdx + '"' + (isAnswered ? ' disabled' : '') + '>' +
            '<span class="option-letter">' + letters[optIdx] + '</span>' +
            '<span>' + App.escapeHtml(optText) + '</span>' +
            tag +
          '</button>'
        );
      }).join('');

      var feedbackHtml = '';
      if (isAnswered) {
        var verdictClass = isCorrect ? 'text-success' : 'text-danger';
        var verdictText = isCorrect ? '✓ ¡Correcto!' : '✗ Incorrecto.';
        feedbackHtml =
          '<div class="explanation-box chapter-quiz-feedback">' +
            '<strong class="' + verdictClass + '">' + verdictText + '</strong> ' +
            App.escapeHtml(q.explanation) +
          '</div>';
      }

      return (
        '<div class="chapter-quiz-item">' +
          '<p class="chapter-quiz-q"><strong>' + (qIdx + 1) + '.</strong> ' + App.escapeHtml(q.question) + '</p>' +
          '<div class="options-list">' + optsHtml + '</div>' +
          feedbackHtml +
        '</div>'
      );
    }).join('');

    container.innerHTML =
      '<div class="card chapter-quiz-card">' +
        '<div class="card-header-row">' +
          '<div>' +
            '<span class="pill pill-teal">Autoevaluación del capítulo</span>' +
            '<h3 style="margin-top:0.35rem;margin-bottom:0">Comprobá lo visto en este capítulo</h3>' +
          '</div>' +
          '<div class="chapter-quiz-meta">' +
            '<span class="pill">' + correctCount + ' / ' + questions.length + ' aciertos</span>' +
            (answeredCount > 0 ? '<button type="button" id="btn-reset-chapter-quiz" class="btn btn-outline btn-xs">Reiniciar</button>' : '') +
          '</div>' +
        '</div>' +
        '<div class="chapter-quiz-list">' + questionsHtml + '</div>' +
      '</div>';

    var optBtns = container.querySelectorAll('[data-cq-qid]');
    for (var i = 0; i < optBtns.length; i++) {
      optBtns[i].addEventListener('click', function () {
        var qId = this.getAttribute('data-cq-qid');
        if (typeof chapterQuizAnswers[qId] === 'number') return;
        chapterQuizAnswers[qId] = parseInt(this.getAttribute('data-cq-opt'), 10);
        renderChapterQuiz(container, tabId);
      });
    }

    var resetBtn = document.getElementById('btn-reset-chapter-quiz');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        questions.forEach(function (q) {
          delete chapterQuizAnswers[q.id];
        });
        renderChapterQuiz(container, tabId);
      });
    }
  }

  App.DiagramsModule = {
    init: function () {
      var tabs = document.querySelectorAll('.diagram-tab-btn');
      for (var i = 0; i < tabs.length; i++) {
        tabs[i].addEventListener('click', function () {
          App.DiagramsModule.setTab(this.getAttribute('data-tab'));
        });
      }
      renderStage();
    },

    setTab: function (tabId) {
      currentTab = tabId;
      var tabs = document.querySelectorAll('.diagram-tab-btn');
      for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.toggle('is-active', tabs[i].getAttribute('data-tab') === tabId);
      }
      renderStage();
    }
  };
})();
