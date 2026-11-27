(function () {
  'use strict';

  var App = window.RedesApp = window.RedesApp || {};

  /* ==================== UTILIDADES PURAS DE CÁLCULO (EXPUESTAS EN App.LabUtils) ==================== */
  function parseIPv4(str) {
    var parts = String(str || '').trim().split('.');
    if (parts.length !== 4) return null;
    var nums = [];
    for (var i = 0; i < 4; i++) {
      if (!/^\d+$/.test(parts[i])) return null;
      var v = parseInt(parts[i], 10);
      if (v < 0 || v > 255) return null;
      nums.push(v);
    }
    return (((nums[0] << 24) | (nums[1] << 16) | (nums[2] << 8) | nums[3]) >>> 0);
  }

  function intToIPv4(n) {
    return [
      (n >>> 24) & 255,
      (n >>> 16) & 255,
      (n >>> 8) & 255,
      n & 255
    ].join('.');
  }

  function toBin32(n) {
    return (n >>> 0).toString(2).padStart(32, '0');
  }

  function calcIPv4(ipStr, prefix, dstStr) {
    var ip = parseIPv4(ipStr);
    var p = parseInt(prefix, 10);
    if (ip === null || isNaN(p) || p < 0 || p > 32) {
      return { valid: false, error: 'Ingresá una IPv4 válida (ej. 192.228.17.57) y prefijo /0 a /32.' };
    }
    var mask = p === 0 ? 0 : ((0xFFFFFFFF << (32 - p)) >>> 0);
    var net = (ip & mask) >>> 0;
    var bcast = (net | (~mask >>> 0)) >>> 0;
    var hostBits = 32 - p;
    var usableHosts = hostBits >= 2 ? (Math.pow(2, hostBits) - 2) : (hostBits === 1 ? 0 : 1);
    var firstHost = hostBits >= 2 ? ((net + 1) >>> 0) : net;
    var lastHost = hostBits >= 2 ? ((bcast - 1) >>> 0) : bcast;

    var o1 = (ip >>> 24) & 255;
    var o2 = (ip >>> 16) & 255;
    var histClass = o1 <= 127 ? 'A (bit 0 · /8)' : (o1 <= 191 ? 'B (10 · /16)' : (o1 <= 223 ? 'C (110 · /24)' : (o1 <= 239 ? 'D (Multicast)' : 'E (Reservada)')));

    var scope = 'Pública (enrutable en Internet)';
    if (o1 === 10 || (o1 === 172 && o2 >= 16 && o2 <= 31) || (o1 === 192 && o2 === 168)) {
      scope = 'Privada RFC 1918 (requiere NAT para salir a Internet)';
    } else if (o1 === 127) {
      scope = 'Loopback (127.0.0.0/8 · propio host)';
    } else if (ip === 0) {
      scope = '0.0.0.0 (este host / ruta por defecto)';
    } else if (ip === 0xFFFFFFFF) {
      scope = 'Broadcast limitado (255.255.255.255)';
    } else if (o1 >= 224 && o1 <= 239) {
      scope = 'Multicast (Clase D)';
    } else if (o1 >= 240) {
      scope = 'Reservada (Clase E)';
    }

    var dstResult = null;
    if (dstStr && String(dstStr).trim()) {
      var dst = parseIPv4(dstStr);
      if (dst !== null) {
        var dstNet = (dst & mask) >>> 0;
        dstResult = {
          valid: true,
          dstIp: intToIPv4(dst),
          dstAndNet: intToIPv4(dstNet),
          sameSubnet: dstNet === net
        };
      } else {
        dstResult = { valid: false };
      }
    }

    return {
      valid: true,
      ip: intToIPv4(ip),
      prefix: p,
      mask: intToIPv4(mask),
      network: intToIPv4(net),
      broadcast: intToIPv4(bcast),
      firstHost: intToIPv4(firstHost),
      lastHost: intToIPv4(lastHost),
      hostBits: hostBits,
      usableHosts: usableHosts,
      ipBin: toBin32(ip),
      maskBin: toBin32(mask),
      netBin: toBin32(net),
      histClass: histClass,
      scope: scope,
      dstCheck: dstResult
    };
  }

  function matchRoute(ipStr, routes) {
    var ip = parseIPv4(ipStr);
    if (ip === null) return { valid: false, matches: [], winnerIndex: -1 };
    var matches = [];
    var bestIdx = -1;
    var bestPrefix = -1;
    routes.forEach(function (r, idx) {
      var rNet = parseIPv4(r.net);
      var mask = r.prefix === 0 ? 0 : ((0xFFFFFFFF << (32 - r.prefix)) >>> 0);
      var isMatch = rNet !== null && ((ip & mask) >>> 0) === ((rNet & mask) >>> 0);
      matches.push(isMatch);
      if (isMatch && r.prefix > bestPrefix) {
        bestPrefix = r.prefix;
        bestIdx = idx;
      }
    });
    return { valid: true, matches: matches, winnerIndex: bestIdx };
  }

  function fragmentIPv4(totalBytes, mtu, df) {
    var total = parseInt(totalBytes, 10);
    var m = parseInt(mtu, 10);
    if (isNaN(total) || total < 20 || total > 65535 || isNaN(m) || m < 68) {
      return { valid: false, error: 'Ingresá un datagrama entre 20 y 65535 bytes y una MTU ≥ 68 bytes.' };
    }
    if (total <= m) {
      return {
        valid: true,
        needsFragmentation: false,
        dropped: false,
        fragments: [{ index: 1, totalLen: total, payloadLen: total - 20, mf: 0, offset8: 0, offsetBytes: 0 }]
      };
    }
    if (df) {
      return {
        valid: true,
        needsFragmentation: true,
        dropped: true,
        icmpMessage: 'ICMP Destination Unreachable (Código 4: Fragmentación necesaria y bit DF = 1). El router descarta el paquete y permite descubrir la Path MTU.'
      };
    }
    var payloadTotal = total - 20;
    var maxFragPayload = Math.floor((m - 20) / 8) * 8;
    if (maxFragPayload < 8) {
      return { valid: false, error: 'La MTU no alcanza para transportar al menos 8 bytes de datos por fragmento.' };
    }
    var fragments = [];
    var byteOffset = 0;
    var idx = 1;
    while (byteOffset < payloadTotal) {
      var remaining = payloadTotal - byteOffset;
      var chunk = remaining > maxFragPayload ? maxFragPayload : remaining;
      var mf = (byteOffset + chunk < payloadTotal) ? 1 : 0;
      fragments.push({
        index: idx++,
        totalLen: chunk + 20,
        payloadLen: chunk,
        mf: mf,
        offset8: byteOffset / 8,
        offsetBytes: byteOffset
      });
      byteOffset += chunk;
    }
    return {
      valid: true,
      needsFragmentation: true,
      dropped: false,
      maxFragPayload: maxFragPayload,
      fragments: fragments
    };
  }

  function analyzeIPv6(rawInput) {
    var raw = String(rawInput || '').trim();
    var prefixPart = '';
    if (raw.indexOf('/') !== -1) {
      var sp = raw.split('/');
      raw = sp[0];
      prefixPart = '/' + sp[1];
    }
    if (!raw) return { valid: false, error: 'Ingresá una dirección IPv6 válida.' };

    /* Soporte para IPv4 embebida al final (ej. ::ffff:192.168.1.1 o ::192.31.20.46) */
    var lastColon = raw.lastIndexOf(':');
    if (lastColon !== -1 && raw.slice(lastColon + 1).indexOf('.') !== -1) {
      var v4Int = parseIPv4(raw.slice(lastColon + 1));
      if (v4Int === null) return { valid: false, error: 'Parte IPv4 embebida inválida.' };
      var hi = ((v4Int >>> 16) & 0xFFFF).toString(16);
      var lo = (v4Int & 0xFFFF).toString(16);
      raw = raw.slice(0, lastColon + 1) + hi + ':' + lo;
    }

    var dblParts = raw.split('::');
    if (dblParts.length > 2) {
      return { valid: false, error: 'Inválida: "::" solo puede aparecer UNA vez en una dirección IPv6.' };
    }

    var groups = [];
    if (dblParts.length === 2) {
      var left = dblParts[0] ? dblParts[0].split(':') : [];
      var right = dblParts[1] ? dblParts[1].split(':') : [];
      var missing = 8 - (left.length + right.length);
      if (missing < 1) return { valid: false, error: 'Cantidad de grupos inválida alrededor de "::".' };
      groups = left.concat(new Array(missing).fill('0')).concat(right);
    } else {
      groups = raw.split(':');
      if (groups.length !== 8) return { valid: false, error: 'Una dirección IPv6 sin "::" debe tener exactamente 8 grupos.' };
    }

    var expanded = [];
    var stripped = [];
    for (var i = 0; i < 8; i++) {
      var g = groups[i];
      if (!/^[0-9a-fA-F]{1,4}$/.test(g)) {
        return { valid: false, error: 'Grupo hexadecimal inválido: "' + g + '".' };
      }
      var low = g.toLowerCase();
      expanded.push(low.padStart(4, '0'));
      stripped.push(low.replace(/^0+/, '') || '0');
    }

    /* Buscar la secuencia más larga de ceros (>= 2 grupos) para "::" */
    var bestStart = -1;
    var bestLen = 0;
    var curStart = -1;
    var curLen = 0;
    for (var j = 0; j < 8; j++) {
      if (stripped[j] === '0') {
        if (curStart === -1) { curStart = j; curLen = 1; }
        else curLen++;
        if (curLen > bestLen) { bestStart = curStart; bestLen = curLen; }
      } else {
        curStart = -1;
        curLen = 0;
      }
    }

    var compressed = '';
    if (bestLen >= 2) {
      var pre = stripped.slice(0, bestStart).join(':');
      var post = stripped.slice(bestStart + bestLen).join(':');
      compressed = pre + '::' + post;
    } else {
      compressed = stripped.join(':');
    }

    var expStr = expanded.join(':');
    var firstGroup = parseInt(expanded[0], 16);
    var classification = 'Unicast global (2000::/3 o asignable)';
    if (expStr === '0000:0000:0000:0000:0000:0000:0000:0000') {
      classification = '::/128 · Ausencia de dirección (no se asigna a ningún nodo)';
    } else if (expStr === '0000:0000:0000:0000:0000:0000:0000:0001') {
      classification = '::1/128 · Loopback (equivale a 127.0.0.1 en IPv4)';
    } else if (expanded.slice(0, 6).join(':') === '0000:0000:0000:0000:0000:ffff') {
      classification = '::ffff:0:0/96 · IPv4 mapeada en IPv6 (transición en hosts duales)';
    } else if ((firstGroup & 0xFFC0) === 0xFE80) {
      classification = 'fe80::/10 · Enlace local (link-local, válida solo dentro del enlace)';
    } else if ((firstGroup & 0xFE00) === 0xFC00) {
      classification = 'fc00::/7 · Dirección local única (ULA, equivalente a privadas IPv4)';
    } else if ((firstGroup & 0xFF00) === 0xFF00) {
      classification = 'ff00::/8 · Multicast IPv6 (reemplaza al broadcast de IPv4)';
    } else if (expanded[0] === '2001' && expanded[1] === '0db8') {
      classification = '2001:db8::/32 · Prefijo reservado para documentación y ejemplos';
    }

    return {
      valid: true,
      expanded: expStr + prefixPart,
      compressed: compressed + prefixPart,
      groups: expanded,
      classification: classification
    };
  }

  App.LabUtils = {
    calcIPv4: calcIPv4,
    matchRoute: matchRoute,
    fragmentIPv4: fragmentIPv4,
    analyzeIPv6: analyzeIPv6
  };

  /* ==================== ESTADOS LOCALES DE LOS 4 NUEVOS SIMULADORES ==================== */
  var csmaVariant = '1p';
  var csmaP = 0.35;
  var csmaBwDelayRatio = 0.25;
  var backoffRate = '10';
  var backoffColl = 3;
  var cdRatio = 10;
  var collFreeMode = 'bitmap';
  var readyStations = [false, true, false, true, true, false];
  var swProto = 'sr';
  var swWindow = 4;
  var swUseNak = true;
  var swLostPkt = 2;

  var ethTimelineIdx = 0;
  var ethArchPiece = 'mac';
  var ethNameSelected = '1000BASE-T';

  var wifiBandFilter = 'all';
  var mwInput = 100;
  var dbiInput = 5;
  var wifiTechMode = 'ofdm';
  var edcaAc = 'AC_VO';
  var freezeStep = 0;
  var txopEnabled = false;
  var fcField = 'type';
  var secFlowMode = 'wpa2';
  var secStep = 0;

  var ipCalcSrc = '192.228.17.57';
  var ipCalcPrefix = 27;
  var ipCalcDst = '192.228.17.40';
  var lpmIp = '10.20.4.55';
  var lpmMode = 'campus';
  var subQuiz = null;
  var subQuizFeedback = '';
  var fragSize = 4000;
  var fragMtu = 1500;
  var fragDf = 0;
  var icmpSelected = 'type';
  var ipv6Input = '2001:0DB8:0000:0000:0000:0000:1428:57AB';

  /* ==================== TAB 7: CSMA, BACKOFF Y VENTANAS ==================== */
  function renderMacExtraTab(stage) {
    var csmaMeta = {
      '1p': {
        title: 'CSMA 1-persistente',
        rule: 'Sensa; si está libre transmite; si está ocupado sigue escuchando y al liberarse transmite con probabilidad 1.',
        pro: 'Baja latencia con poca carga (base de Ethernet clásico).',
        con: 'Efecto estampida: si varias estaciones esperaban, todas lanzan a la vez apenas queda libre el canal.'
      },
      'np': {
        title: 'CSMA no persistente',
        rule: 'Sensa; si está ocupado suelta el canal, espera un tiempo aleatorio y vuelve a sensar.',
        pro: 'Evita la estampida y rinde mejor con carga alta.',
        con: 'Introduce demoras e instantes ociosos aunque el canal ya esté libre.'
      },
      'pp': {
        title: 'CSMA p-persistente (canales ranurados)',
        rule: 'Al liberarse transmite con probabilidad p (' + csmaP.toFixed(2) + ') y espera al próximo slot con 1−p (' + (1 - csmaP).toFixed(2) + ').',
        pro: 'Compromiso regulable (802.11 usa un refinamiento de esta idea).',
        con: 'p grande ⇒ más colisiones; p chico ⇒ más espera y tiempo ocioso.'
      }
    }[csmaVariant];

    var slotUsMap = { '10': 51.2, '100': 5.12, '1000h': 4.096 };
    var slotBitsMap = { '10': 512, '100': 512, '1000h': 4096 };
    var slotUs = slotUsMap[backoffRate];
    var expCap = Math.min(backoffColl, 10);
    var maxSlots = Math.pow(2, expCap) - 1;
    var maxWaitUs = (maxSlots * slotUs).toFixed(1);
    var cdEff = cdRatio / (cdRatio + 2 * Math.E);

    var stHtml = readyStations.map(function (on, idx) {
      var bin = idx.toString(2).padStart(3, '0');
      return '<button type="button" class="pkt-box ' + (on ? 'pkt-ok' : '') + '" data-toggle-st="' + idx + '">' +
        '<strong>Est. ' + idx + '</strong><span>' + bin + '₂</span><small>' + (on ? 'Lista' : 'Libre') + '</small></button>';
    }).join('');

    var readyIdx = [];
    readyStations.forEach(function (on, idx) { if (on) readyIdx.push(idx); });

    var collFreeHtml = '';
    if (collFreeMode === 'bitmap') {
      var slotsBar = readyStations.map(function (on, idx) {
        return '<span class="bit-box ' + (on ? 'is-net' : '') + '">R' + idx + ':' + (on ? '1' : '0') + '</span>';
      }).join('');
      collFreeHtml =
        '<div class="bit-strip">' + slotsBar + '</div>' +
        '<div class="explanation-box">' +
          '<strong>Orden de transmisión (sin colisiones):</strong> ' + (readyIdx.length ? readyIdx.map(function (i) { return 'Est. ' + i; }).join(' → ') : 'Ninguna estación lista') +
          '<div class="small muted" style="margin-top:0.3rem">En el protocolo de mapa de bits (N = 6), con carga baja una estación de número bajo espera en promedio <strong>N/2 + N = 9 ranuras</strong>.</div>' +
        '</div>';
    } else {
      var active = readyIdx.slice();
      var roundsHtml = [2, 1, 0].map(function (bitPos) {
        var maskBit = 1 << bitPos;
        var hasOne = active.some(function (id) { return (id & maskBit) !== 0; });
        var before = active.map(function (id) { return id + ' (' + id.toString(2).padStart(3, '0') + ')'; }).join(', ') || '—';
        if (hasOne) active = active.filter(function (id) { return (id & maskBit) !== 0; });
        return '<tr><td>Bit ' + bitPos + ' (peso ' + maskBit + ')</td><td>' + before + '</td><td>' + (hasOne ? '1 gana' : '0 todas') + '</td><td><strong>' + (active.join(', ') || '—') + '</strong></td></tr>';
      }).join('');
      collFreeHtml =
        '<table class="table-clean"><thead><tr><th>Ronda</th><th>Compiten</th><th>OR en canal</th><th>Sobreviven</th></tr></thead><tbody>' + roundsHtml + '</tbody></table>' +
        '<div class="explanation-box" style="margin-top:0.65rem"><strong>Ganadora:</strong> ' + (active.length ? 'Estación ' + active[0] + ' (dirección mayor, sin colisiones).' : 'Ninguna lista.') + '</div>';
    }

    var pktsHtml = [];
    var retransCount = 0;
    for (var p = 0; p < 8; p++) {
      var cls = 'pkt-ok';
      var lbl = 'ACK';
      if (p === swLostPkt) {
        cls = 'pkt-lost';
        lbl = swUseNak ? 'Perdida (NAK)' : 'Perdida (TO)';
        retransCount++;
      } else if (p > swLostPkt && p < swLostPkt + swWindow) {
        if (swProto === 'gbn') {
          cls = 'pkt-resent';
          lbl = 'Descartada/Reenv.';
          retransCount++;
        } else {
          cls = 'pkt-buffered';
          lbl = 'En buffer';
        }
      } else if (p >= swLostPkt + swWindow) {
        cls = '';
        lbl = 'Pendiente';
      }
      pktsHtml.push(
        '<button type="button" class="pkt-box ' + cls + '" data-lost-pkt="' + p + '">' +
          '<strong>Trama #' + p + '</strong><span>' + lbl + '</span>' +
        '</button>'
      );
    }

    stage.innerHTML =
      '<div class="sim-grid-2">' +
        '<div class="card">' +
          '<h3>Variantes de CSMA y Producto Ancho de Banda-Retardo</h3>' +
          '<div class="filter-pills" style="margin-bottom:0.75rem">' +
            '<button type="button" class="review-filter-btn' + (csmaVariant === '1p' ? ' is-active' : '') + '" data-csma-v="1p">1-persistente</button>' +
            '<button type="button" class="review-filter-btn' + (csmaVariant === 'np' ? ' is-active' : '') + '" data-csma-v="np">No persistente</button>' +
            '<button type="button" class="review-filter-btn' + (csmaVariant === 'pp' ? ' is-active' : '') + '" data-csma-v="pp">p-persistente</button>' +
          '</div>' +
          (csmaVariant === 'pp' ? '<div class="slider-row"><strong>p = ' + csmaP.toFixed(2) + '</strong><input type="range" id="csma-p-slider" min="0.1" max="1" step="0.05" value="' + csmaP + '"></div>' : '') +
          '<div class="explanation-box">' +
            '<strong>' + csmaMeta.title + '</strong>' +
            '<p style="margin:0.3rem 0">' + csmaMeta.rule + '</p>' +
            '<p class="small" style="margin:0.2rem 0"><strong class="text-success">Ventaja:</strong> ' + csmaMeta.pro + '</p>' +
            '<p class="small" style="margin:0"><strong class="text-danger">Costo:</strong> ' + csmaMeta.con + '</p>' +
          '</div>' +
          '<div class="slider-row" style="margin-top:0.85rem"><strong>Tramas en vuelo (B×τ): ' + csmaBwDelayRatio.toFixed(2) + '</strong><input type="range" id="csma-bd-slider" min="0.05" max="3" step="0.05" value="' + csmaBwDelayRatio + '"></div>' +
          '<p class="small muted" style="margin:0">' + (csmaBwDelayRatio > 0.8 ? 'Alto producto ancho de banda-retardo: muchas tramas caben en tránsito y las estaciones sensan libre demasiado tarde → alta probabilidad de colisión.' : 'Producto ancho de banda-retardo bajo (LAN típica): τ es chico frente a la trama y CSMA se comporta muy bien.') + '</p>' +
        '</div>' +

        '<div class="card">' +
          '<h3>Backoff Exponencial Binario y Eficiencia CSMA/CD</h3>' +
          '<div class="sim-controls-row">' +
            '<div class="form-group" style="flex:1"><label>Velocidad half-duplex</label>' +
              '<select id="bo-rate-sel" class="input">' +
                '<option value="10"' + (backoffRate === '10' ? ' selected' : '') + '>10 Mb/s (512 bits = 51,2 µs)</option>' +
                '<option value="100"' + (backoffRate === '100' ? ' selected' : '') + '>100 Mb/s (512 bits = 5,12 µs)</option>' +
                '<option value="1000h"' + (backoffRate === '1000h' ? ' selected' : '') + '>1 Gb/s half (4096 bits = 4,096 µs)</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
          '<div class="slider-row"><strong>Colisión i = ' + backoffColl + '</strong><input type="range" id="bo-coll-slider" min="1" max="16" step="1" value="' + backoffColl + '"></div>' +
          '<div class="stats-strip" style="grid-template-columns:repeat(3,1fr);margin-bottom:0.75rem">' +
            '<div class="stat-box"><span class="stat-label">Rango r (slots)</span><strong class="stat-value">0 .. ' + maxSlots + '</strong></div>' +
            '<div class="stat-box"><span class="stat-label">Espera máxima</span><strong class="stat-value">' + maxWaitUs + ' µs</strong></div>' +
            '<div class="stat-box"><span class="stat-label">Slot time</span><strong class="stat-value">' + slotBitsMap[backoffRate] + ' b</strong></div>' +
          '</div>' +
          '<div class="explanation-box">' +
            (backoffColl === 16 ? '<strong class="text-danger">¡16 colisiones alcanzadas! La MAC aborta la trama y reporta error.</strong>' : 'Tope desde i = 10 en <strong>1023 slots</strong>. Efecto secundario (Stallings): <em>LIFO</em> (estaciones nuevas tienen menos espera media que las que acumulan colisiones).') +
          '</div>' +
          '<div class="slider-row" style="margin-top:0.85rem"><strong>P / τ = ' + cdRatio + '</strong><input type="range" id="cd-ratio-slider" min="2" max="50" step="1" value="' + cdRatio + '"></div>' +
          '<p class="small muted" style="margin:0">Eficiencia teórica máxima con contención 2τe: <code>P / (P + 2τe)</code> = <strong>' + (cdEff * 100).toFixed(1) + '%</strong> (mejora cuando las tramas son largas respecto de τ).</p>' +
        '</div>' +
      '</div>' +

      '<div class="sim-grid-2">' +
        '<div class="card">' +
          '<div class="card-header-row">' +
            '<h3>Protocolos sin Colisiones (2.7)</h3>' +
            '<div class="filter-pills">' +
              '<button type="button" class="review-filter-btn' + (collFreeMode === 'bitmap' ? ' is-active' : '') + '" data-cf-mode="bitmap">Mapa de bits</button>' +
              '<button type="button" class="review-filter-btn' + (collFreeMode === 'countdown' ? ' is-active' : '') + '" data-cf-mode="countdown">Cuenta regresiva</button>' +
            '</div>' +
          '</div>' +
          '<p class="small muted">Clicá las estaciones (0–5) para marcar cuáles tienen una trama lista para transmitir:</p>' +
          '<div class="window-track" style="grid-template-columns:repeat(6,1fr)">' + stHtml + '</div>' +
          collFreeHtml +
        '</div>' +

        '<div class="card">' +
          '<div class="card-header-row">' +
            '<h3>Ventana Deslizante (Retorno a N vs Rep. Selectiva)</h3>' +
            '<div class="filter-pills">' +
              '<button type="button" class="review-filter-btn' + (swProto === 'gbn' ? ' is-active' : '') + '" data-sw-proto="gbn">Retorno a N</button>' +
              '<button type="button" class="review-filter-btn' + (swProto === 'sr' ? ' is-active' : '') + '" data-sw-proto="sr">Rep. Selectiva</button>' +
            '</div>' +
          '</div>' +
          '<div class="sim-controls-row">' +
            '<div class="slider-row" style="flex:1;margin:0"><strong>Ventana W = ' + swWindow + '</strong><input type="range" id="sw-win-slider" min="2" max="6" step="1" value="' + swWindow + '"></div>' +
            '<label class="checkbox-label" style="padding:0"><input type="checkbox" id="sw-nak-chk"' + (swUseNak ? ' checked' : '') + '><span>Usar NAK</span></label>' +
          '</div>' +
          '<p class="small muted">Clicá qué trama falla/se pierde (actual: <strong>#' + swLostPkt + '</strong>):</p>' +
          '<div class="window-track">' + pktsHtml.join('') + '</div>' +
          '<div class="explanation-box">' +
            '<strong>Resultado (' + (swProto === 'gbn' ? 'Retorno a N' : 'Repetición Selectiva') + '):</strong> se retransmiten <strong>' + retransCount + '</strong> trama(s). ' +
            (swProto === 'gbn' ? 'El receptor descarta las posteriores válidas; solo rinde bien si los errores son muy escasos.' : 'El receptor guarda en buffer las posteriores válidas y pide solo la #' + swLostPkt + ' (mayor costo de buffer).') +
            ' El temporizador debe ser algo mayor que el <strong>RTT</strong>' + (swUseNak ? ', y el <strong>NAK</strong> evita esperar al timeout.' : '.') +
          '</div>' +
        '</div>' +
      '</div>';

    stage.querySelectorAll('[data-csma-v]').forEach(function (b) {
      b.addEventListener('click', function () { csmaVariant = this.getAttribute('data-csma-v'); renderMacExtraTab(stage); });
    });
    var pSl = document.getElementById('csma-p-slider');
    if (pSl) pSl.addEventListener('input', function () { csmaP = parseFloat(this.value); renderMacExtraTab(stage); });
    document.getElementById('csma-bd-slider').addEventListener('input', function () { csmaBwDelayRatio = parseFloat(this.value); renderMacExtraTab(stage); });
    document.getElementById('bo-rate-sel').addEventListener('change', function () { backoffRate = this.value; renderMacExtraTab(stage); });
    document.getElementById('bo-coll-slider').addEventListener('input', function () { backoffColl = parseInt(this.value, 10); renderMacExtraTab(stage); });
    document.getElementById('cd-ratio-slider').addEventListener('input', function () { cdRatio = parseInt(this.value, 10); renderMacExtraTab(stage); });
    stage.querySelectorAll('[data-cf-mode]').forEach(function (b) {
      b.addEventListener('click', function () { collFreeMode = this.getAttribute('data-cf-mode'); renderMacExtraTab(stage); });
    });
    stage.querySelectorAll('[data-toggle-st]').forEach(function (b) {
      b.addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-toggle-st'), 10);
        readyStations[idx] = !readyStations[idx];
        renderMacExtraTab(stage);
      });
    });
    stage.querySelectorAll('[data-sw-proto]').forEach(function (b) {
      b.addEventListener('click', function () { swProto = this.getAttribute('data-sw-proto'); renderMacExtraTab(stage); });
    });
    document.getElementById('sw-win-slider').addEventListener('input', function () { swWindow = parseInt(this.value, 10); renderMacExtraTab(stage); });
    document.getElementById('sw-nak-chk').addEventListener('change', function () { swUseNak = this.checked; renderMacExtraTab(stage); });
    stage.querySelectorAll('[data-lost-pkt]').forEach(function (b) {
      b.addEventListener('click', function () { swLostPkt = parseInt(this.getAttribute('data-lost-pkt'), 10); renderMacExtraTab(stage); });
    });
  }

  /* ==================== TAB 8: HISTORIA Y ARQUITECTURA ETHERNET ==================== */
  function renderEthArchTab(stage) {
    var milestones = [
      { year: '1973', label: 'Alto Aloha Network', detail: '22 de mayo de 1973: memo de Robert Metcalfe en Xerox PARC. Coaxial pasivo de difusión a 2,94 Mb/s ("éter" omnipresente; sin switch, inteligencia en los extremos).' },
      { year: '1976', label: 'Metcalfe & Boggs', detail: 'Artículo clásico en CACM: canal de difusión local rápido, sin control central y con recuperación ante colisiones a 3 Mb/s para hasta 100 estaciones.' },
      { year: '1980/82', label: 'DIX v1 y v2', detail: 'Digital, Intel y Xerox publican la especificación abierta Ethernet II usando campo EtherType, creando un mercado interoperable.' },
      { year: '1983/85', label: 'IEEE 802.3', detail: 'El proyecto 802 comienza en 1980; Tanenbaum sitúa la conversión DIX→802.3 en 1983 y las diapositivas la 1.ª edición en 1985. Define una MAC común + PHYs intercambiables.' },
      { year: '1990', label: '10BASE-T (10 Mb/s)', detail: 'Salto a par trenzado Cat 3+ en topología física en estrella (hub o switch) con codificación Manchester.' },
      { year: '1995', label: 'Fast Ethernet (100 Mb/s)', detail: '802.3u: conserva trama y CSMA/CD, agrega autonegociación y reduce el tiempo de bit a 10 ns (diámetro ÷10).' },
      { year: '1998/99', label: 'Gigabit (1 Gb/s)', detail: '802.3z (fibra/CX con 8B/10B) y 802.3ab (1000BASE-T Cat 5e con PAM-5 y cancelación de eco); en half-duplex usó extensión de portadora.' },
      { year: '2002', label: '10 Gb/s (802.3ae)', detail: 'Full-duplex nativo desde el diseño: desaparece por completo CSMA/CD y el half-duplex.' },
      { year: '2017', label: '200 / 400 Gb/s', detail: 'Paralelismo multilane en centros de datos y troncales manteniendo la trama Ethernet clásica.' },
      { year: '2024', label: '800 Gb/s (802.3df)', detail: '×80.000 respecto a los 10 Mb/s iniciales con 8×100 o 4×200 lanes, sin romper compatibilidad con IP/TCP.' }
    ];

    var archPieces = {
      llc: { title: 'LLC (IEEE 802.2 · Capa 2 superior)', text: 'Brinda una interfaz uniforme hacia los protocolos de Capa 3 (IPv4, IPv6, ARP). En tramas 802.3 clásicas usa cabecera DSAP/SSAP/Control (+ SNAP si aplica).' },
      mac: { title: 'MAC (IEEE 802.3 · Capa 2 inferior)', text: 'Construye y valida la trama (64–1518 B), maneja direcciones de 48 bits, padding, FCS (CRC-32) y acceso al medio (CSMA/CD en legado).' },
      xmii: { title: 'RS / xMII (Reconciliation Sublayer / Media Independent Interface)', text: 'Adapta la MAC estándar hacia distintas capas físicas (MII, GMII, XGMII...) para que la MAC no dependa del cable o fibra.' },
      phy: { title: 'PHY (Capa 1 · Codificación y señal)', text: 'Codifica bits y modula señales según el medio: Manchester, 4B/5B+MLT-3, 8B/10B, PAM-5, PAM-16+LDPC o 64B/66B.' },
      mdi: { title: 'MDI + Medio (Conector y canal físico)', text: 'Interfaz física con el medio: coaxial 50 Ω (AUI/BNC), RJ-45 sobre UTP o conectores ópticos LC/SFP sobre fibra MMF/SMF.' }
    };

    var nameDecoders = {
      '10BASE5': { rate: '10 Mb/s', base: 'Baseband (banda base)', suffix: '5 = segmentos de 500 m (Thick coax 50 Ω)', extra: 'Marcas cada 2,5 m, hasta 100 máquinas/seg, cable AUI. Máx clásico: 2,5 km y 4 repetidores.' },
      '10BASE2': { rate: '10 Mb/s', base: 'Baseband', suffix: '2 = ~200 m (185 m reales en RG-58 fino)', extra: 'Conector BNC en T, hasta 30 máquinas; un corte tira todo el bus.' },
      '10BASE-T': { rate: '10 Mb/s', base: 'Baseband', suffix: 'T = Twisted pair (2 pares Cat 3+, 100 m)', extra: 'Estrella con hub o switch; codificación Manchester (hasta 20 Mbaud).' },
      '100BASE-TX': { rate: '100 Mb/s', base: 'Baseband', suffix: 'TX = Par trenzado Cat 5+ (2 pares, 100 m)', extra: '4B/5B + NRZI + MLT-3 (125 MBd); autonegociación; diámetro ÷10 en half.' },
      '1000BASE-CX': { rate: '1 Gb/s', base: 'Baseband', suffix: 'CX = Cobre / par trenzado blindado corto (< 25 m)', extra: 'Familia 802.3z con codificación 8B/10B (1250 MBd).' },
      '1000BASE-SX': { rate: '1 Gb/s', base: 'Baseband', suffix: 'SX = Short wavelength (fibra MMF 850 nm, < 550 m)', extra: '802.3z, 8B/10B, óptica modular SFP + LC.' },
      '1000BASE-LX': { rate: '1 Gb/s', base: 'Baseband', suffix: 'LX = Long wavelength (1310 nm MMF/SMF, < 10 km)', extra: '802.3z, 8B/10B, enlaces troncales.' },
      '1000BASE-T': { rate: '1 Gb/s', base: 'Baseband', suffix: 'T = 4 pares UTP Cat 5e (100 m)', extra: 'PAM-5 + DSP + cancelación de eco (250 Mb/s bidireccional simultáneo por par).' },
      '10GBASE-T': { rate: '10 Gb/s', base: 'Baseband', suffix: 'T = 4 pares Cat 6A (100 m)', extra: 'PAM-16 con 128-DSQ + LDPC (800 Mbaud/par). Solo full-duplex.' },
      '10GBASE-SR/LR/ER': { rate: '10 Gb/s', base: 'Baseband', suffix: 'SR (300–400 m MMF) / LR (10 km SMF) / ER (40 km SMF)', extra: '802.3ae, 64B/66B; las letras indican presupuesto óptico.' }
    };

    var activeMs = milestones[ethTimelineIdx];
    var activePiece = archPieces[ethArchPiece];
    var activeName = nameDecoders[ethNameSelected];

    stage.innerHTML =
      '<div class="card">' +
        '<h3>Línea de Tiempo Ethernet (1973 → 2024 · ×80.000 en tasa nominal)</h3>' +
        '<div class="timeline-track">' +
          milestones.map(function (m, idx) {
            return '<button type="button" class="timeline-pill' + (idx === ethTimelineIdx ? ' is-active' : '') + '" data-eth-ms="' + idx + '">' + m.year + '<small>' + m.label + '</small></button>';
          }).join('') +
        '</div>' +
        '<div class="explanation-box">' +
          '<strong>' + activeMs.year + ' · ' + activeMs.label + ':</strong> ' + activeMs.detail +
          '<div class="small muted" style="margin-top:0.35rem"><strong>¿Por qué ganó la LAN?</strong> Estándares abiertos, trama estable que protege el software superior, economías de escala, paso de bus a estrella conmutada e incorporación continua de nuevos medios/codificaciones.</div>' +
        '</div>' +
      '</div>' +

      '<div class="sim-grid-2">' +
        '<div class="card">' +
          '<h3>Arquitectura Interna de una Interfaz Ethernet</h3>' +
          '<p class="small muted">Clicá cada bloque para ver su rol (la MAC no cambia al cambiar la PHY):</p>' +
          '<div class="frame-strip">' +
            ['llc', 'mac', 'xmii', 'phy', 'mdi'].map(function (k) {
              var labels = { llc: ['LLC', '802.2'], mac: ['MAC', '802.3'], xmii: ['RS/xMII', 'Adaptador'], phy: ['PHY', 'Codif.'], mdi: ['MDI', 'Conector'] };
              return '<button type="button" class="frame-field-btn' + (ethArchPiece === k ? ' is-active' : '') + '" data-arch-piece="' + k + '"><strong>' + labels[k][0] + '</strong><span>' + labels[k][1] + '</span></button>';
            }).join('') +
          '</div>' +
          '<div class="explanation-box"><strong>' + activePiece.title + '</strong><p style="margin:0.3rem 0 0">' + activePiece.text + '</p></div>' +
        '</div>' +

        '<div class="card">' +
          '<h3>Decodificador de Nomenclatura PHY</h3>' +
          '<div class="form-group" style="margin-bottom:0.75rem"><label>Elegí una norma para desarmar su nombre</label>' +
            '<select id="eth-name-sel" class="input">' +
              Object.keys(nameDecoders).map(function (k) {
                return '<option value="' + k + '"' + (k === ethNameSelected ? ' selected' : '') + '>' + k + '</option>';
              }).join('') +
            '</select>' +
          '</div>' +
          '<div class="explanation-box">' +
            '<ul class="feature-list" style="margin:0">' +
              '<li><strong>Velocidad nominal:</strong> ' + activeName.rate + '</li>' +
              '<li><strong>BASE:</strong> ' + activeName.base + '</li>' +
              '<li><strong>Sufijo / Medio:</strong> ' + activeName.suffix + '</li>' +
              '<li><strong>Detalle de examen:</strong> ' + activeName.extra + '</li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="sim-grid-2">' +
        '<div class="card">' +
          '<h3>Slot Time, Jam y Autonegociación (3.2 y 3.4)</h3>' +
          '<table class="table-clean" style="margin-bottom:0.85rem">' +
            '<thead><tr><th>Velocidad</th><th>Slot Time</th><th>Duración</th></tr></thead>' +
            '<tbody>' +
              '<tr><td>10 Mb/s</td><td>512 bit-times (64 B)</td><td>51,2 µs</td></tr>' +
              '<tr><td>100 Mb/s</td><td>512 bit-times (64 B)</td><td>5,12 µs</td></tr>' +
              '<tr><td>1 Gb/s half-duplex</td><td>4096 bit-times (512 B)</td><td>4,096 µs</td></tr>' +
            '</tbody>' +
          '</table>' +
          '<p class="small muted"><strong>Autonegociación:</strong> (1) anuncia capacidades con pulsos de enlace → (2) elige la capacidad común de mayor prioridad → (3) configura velocidad/duplex (y master/slave en 1000BASE-T). <strong>Jam:</strong> 32 bits en diapositivas / 48 bits en Tanenbaum.</p>' +
        '</div>' +

        '<div class="card">' +
          '<h3>Dispositivos por Capa (con Access Point 802.1D) y Puentes</h3>' +
          '<table class="table-clean" style="margin-bottom:0.75rem">' +
            '<thead><tr><th>Dispositivo</th><th>Capa</th><th>Dom. Colisión</th><th>Dom. Broadcast</th></tr></thead>' +
            '<tbody>' +
              '<tr><td>Repetidor / Hub</td><td>1</td><td>1 compartido</td><td>1</td></tr>' +
              '<tr><td>Switch / Puente</td><td>2</td><td>1 por puerto</td><td>1 (salvo VLAN)</td></tr>' +
              '<tr><td><strong>Access Point (AP)</strong></td><td><strong>1 y 2 (802.1D)</strong></td><td>BSS comparte radio</td><td>1 por BSS/SSID</td></tr>' +
              '<tr><td>Router</td><td>3</td><td>1 por interfaz</td><td>1 por interfaz</td></tr>' +
            '</tbody>' +
          '</table>' +
          '<p class="small muted" style="margin:0"><strong>4 motivos para unir LANs con puentes (4.2):</strong> autonomía departamental, distancias entre edificios, carga (doble capacidad) y confiabilidad (cortafuegos frente a nodos defectuosos).</p>' +
        '</div>' +
      '</div>';

    stage.querySelectorAll('[data-eth-ms]').forEach(function (b) {
      b.addEventListener('click', function () { ethTimelineIdx = parseInt(this.getAttribute('data-eth-ms'), 10); renderEthArchTab(stage); });
    });
    stage.querySelectorAll('[data-arch-piece]').forEach(function (b) {
      b.addEventListener('click', function () { ethArchPiece = this.getAttribute('data-arch-piece'); renderEthArchTab(stage); });
    });
    document.getElementById('eth-name-sel').addEventListener('change', function () { ethNameSelected = this.value; renderEthArchTab(stage); });
  }

  /* ==================== TAB 9: WI-FI PHY, EDCA Y SEGURIDAD ==================== */
  function renderWifiDeepTab(stage) {
    var wifiStds = [
      { std: '802.11b', name: '—', band: '2.4', bandTxt: '2,4 GHz', aporte: 'Primera ampliación comercial', data: 'Hasta 11 Mb/s' },
      { std: '802.11a', name: '—', band: '5', bandTxt: '5 GHz', aporte: 'OFDM (48 datos + 4 pilotos)', data: '54 Mb/s · NO compatible con b/g' },
      { std: '802.11g', name: '—', band: '2.4', bandTxt: '2,4 GHz', aporte: 'OFDM en 2,4 GHz', data: '54 Mb/s · compatible con b' },
      { std: '802.11n', name: 'Wi-Fi 4', band: '2.4/5', bandTxt: '2,4 y 5 GHz', aporte: 'MIMO, canales 40 MHz', data: '150 Mb/s PHY (1×1, MCS 7, 40 MHz, GI corto)' },
      { std: '802.11ac', name: 'Wi-Fi 5', band: '5', bandTxt: '5 GHz', aporte: '256-QAM, DL MU-MIMO, Beamforming', data: 'Solo 5 GHz' },
      { std: '802.11ax', name: 'Wi-Fi 6 / 6E', band: '6', bandTxt: '2,4 / 5 / 6 GHz', aporte: 'OFDMA, 1024-QAM, UL/DL MU-MIMO, BSS Coloring', data: 'Hasta 8 flujos; 6E: 5925–7125 MHz (14×80 MHz)' }
    ];
    var filteredStds = wifiStds.filter(function (s) {
      if (wifiBandFilter === 'all') return true;
      return s.band.indexOf(wifiBandFilter) !== -1;
    });

    var dbmCalc = mwInput > 0 ? (10 * Math.log10(mwInput)).toFixed(2) + ' dBm' : '—';
    var linGain = Math.pow(10, dbiInput / 10).toFixed(2) + '×';

    var techInfo = {
      ofdm: {
        title: 'OFDM (802.11a/g/n/ac/ax)',
        text: 'Divide el canal en subportadoras ortogonales superpuestas en frecuencia sin interferirse idealmente. En 802.11a (FFT 64 pts) usa 52 activas: 48 de datos + 4 pilotos. El prefijo cíclico protege contra dispersión por multitrayectoria.',
        svg: '<svg viewBox="0 0 440 125"><line x1="20" y1="100" x2="420" y2="100" stroke="#64748b" stroke-width="1.5"/><path d="M 45 100 Q 75 22 105 100" fill="rgba(37,99,235,0.18)" stroke="#2563eb" stroke-width="2"/><path d="M 85 100 Q 115 22 145 100" fill="rgba(13,148,136,0.18)" stroke="#0d9488" stroke-width="2"/><path d="M 125 100 Q 155 22 185 100" fill="rgba(124,58,237,0.18)" stroke="#7c3aed" stroke-width="2"/><path d="M 165 100 Q 195 22 225 100" fill="rgba(37,99,235,0.18)" stroke="#2563eb" stroke-width="2"/><rect x="260" y="42" width="38" height="44" fill="#d97706" rx="4"/><text x="279" y="68" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">CP</text><rect x="300" y="42" width="110" height="44" fill="#0d9488" rx="4"/><text x="355" y="68" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">Símbolo OFDM</text><text x="135" y="116" text-anchor="middle" font-size="11" fill="#475569">48 datos + 4 pilotos ortogonales</text><text x="335" y="116" text-anchor="middle" font-size="11" fill="#475569">Prefijo cíclico anti-eco</text></svg>'
      },
      mimo: {
        title: 'MIMO (Diversidad vs Multiplexación y SU/MU-MIMO)',
        text: 'Varias antenas y cadenas RF. Diversidad espacial envía versiones de la misma señal (robustez). Multiplexación espacial envía flujos distintos simultáneos (2×2 duplica tasa PHY). SU-MIMO atiende a 1 cliente; MU-MIMO a varios a la vez (DL en ac; DL+UL hasta 8 flujos en ax).',
        svg: '<svg viewBox="0 0 440 125"><rect x="20" y="25" width="70" height="75" rx="8" fill="#1e293b"/><text x="55" y="67" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">AP 2×2</text><line x1="90" y1="42" x2="220" y2="38" stroke="#2563eb" stroke-width="2.5"/><line x1="90" y1="80" x2="220" y2="85" stroke="#0d9488" stroke-width="2.5"/><line x1="90" y1="42" x2="220" y2="85" stroke="#94a3b8" stroke-dasharray="4 3"/><line x1="90" y1="80" x2="220" y2="38" stroke="#94a3b8" stroke-dasharray="4 3"/><rect x="220" y="20" width="95" height="36" rx="6" fill="#2563eb"/><text x="267" y="42" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">Flujo 1 (STA A)</text><rect x="220" y="68" width="95" height="36" rx="6" fill="#0d9488"/><text x="267" y="90" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">Flujo 2 (STA B)</text><text x="375" y="65" text-anchor="middle" font-size="11" fill="#475569">Separa flujos en espacio</text></svg>'
      },
      beam: {
        title: 'Beamforming',
        text: 'El transmisor pondera fase y amplitud de cada antena usando realimentación del canal para que las ondas se sumen constructivamente hacia el receptor. Mejora SNR, tasa y alcance, pero NO crea potencia adicional (requiere canal estable).',
        svg: '<svg viewBox="0 0 440 125"><circle cx="55" cy="62" r="22" fill="#1e293b"/><text x="55" y="66" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">AP</text><path d="M 80 62 Q 210 15 340 62 Q 210 110 80 62 Z" fill="rgba(124,58,237,0.22)" stroke="#7c3aed" stroke-width="2"/><circle cx="365" cy="62" r="20" fill="#7c3aed"/><text x="365" y="66" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">STA</text><text x="210" y="66" text-anchor="middle" font-size="11" font-weight="700" fill="#6d28d9">Suma en fase → mayor SNR (misma potencia total)</text></svg>'
      },
      ofdma: {
        title: 'OFDMA + BSS Coloring + Doble NAV (802.11ax)',
        text: 'OFDMA reparte subportadoras en Resource Units (RU, ej. nueve RU de 26 tonos en 20 MHz) entre múltiples clientes a la vez (trigger frame en UL). Δf baja de 312,5 a 78,125 kHz y el símbolo útil sube de 3,2 a 12,8 µs. BSS Coloring (1–63) y doble NAV permiten reutilización espacial frente a OBSS.',
        svg: '<svg viewBox="0 0 440 125"><rect x="20" y="25" width="90" height="70" rx="6" fill="#2563eb"/><text x="65" y="64" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">RU1 · STA A</text><rect x="116" y="25" width="90" height="70" rx="6" fill="#0d9488"/><text x="161" y="64" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">RU2 · STA B</text><rect x="212" y="25" width="90" height="70" rx="6" fill="#7c3aed"/><text x="257" y="64" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">RU3 · STA C</text><rect x="308" y="25" width="110" height="70" rx="6" fill="#d97706"/><text x="363" y="57" text-anchor="middle" fill="#fff" font-size="10" font-weight="700">BSS Color 1..63</text><text x="363" y="74" text-anchor="middle" fill="#fff" font-size="10">+ Doble NAV</text><text x="220" y="114" text-anchor="middle" font-size="11" fill="#475569">Separa usuarios en frecuencia dentro de un mismo turno</text></svg>'
      }
    }[wifiTechMode];

    var acTable = {
      AC_VO: { label: 'Voz (máxima prioridad)', cwmin: 3, aifsn: 2 },
      AC_VI: { label: 'Video', cwmin: 7, aifsn: 2 },
      AC_BE: { label: 'Best effort', cwmin: 15, aifsn: 3 },
      AC_BK: { label: 'Segundo plano', cwmin: 15, aifsn: 7 }
    };
    var selAc = acTable[edcaAc];
    var aifsUs = 16 + selAc.aifsn * 9;

    var freezeTexts = [
      'Paso 0: La STA sortea Backoff = 5 ranuras en [0, CW] y espera DIFS libre.',
      'Paso 1: El canal sigue libre 2 ranuras → el contador baja de 5 a 3.',
      'Paso 2: Otra estación transmite y ocupa el medio → la STA CONGELA el contador en 3 (no sortea uno nuevo).',
      'Paso 3: Se libera el canal y pasa DIFS → reanuda desde 3 → 2 → 1 → 0 y transmite (tras éxito vuelve a CWmin).'
    ];

    var fcDetails = {
      ver: 'Versión (2 bits): versión del protocolo 802.11 (0).',
      type: 'Type (2 bits): 00 = Gestión (Beacon, Probe, Auth, Assoc), 01 = Control (RTS, CTS, ACK), 10 = Datos (Data, QoS Data).',
      sub: 'Subtype (4 bits): identifica la trama concreta (ej. Beacon = subtipo 8 = 1000₂).',
      flags: '8 flags (1 bit c/u): To DS, From DS, Más fragmentos, Reintentar, Administración de energía, Más datos, Trama protegida (cifrada) y Orden.'
    };

    var secFlows = {
      wep: {
        title: 'WEP Shared Key (1997 · ROTO, obsoleto)',
        steps: [
          '1. La STA solicita autenticación (algoritmo 1: Shared Key).',
          '2. El AP envía un texto de desafío en claro.',
          '3. La STA cifra el desafío con WEP (RC4 + IV de 24 bits) y lo devuelve.',
          '4. El AP descifra y compara. Falla fatal: texto claro + cifrado revelan el flujo RC4 de ese IV y permiten falsificar respuestas.'
        ]
      },
      wpa2: {
        title: 'WPA2-Personal (AES-CCMP + 4-Way Handshake)',
        steps: [
          'Previo: Open System Auth + Asociación. Ambos derivan PMK desde passphrase + SSID (sin transmitirla).',
          '1. AP → STA: envía ANonce.',
          '2. STA → AP: envía SNonce + MIC (prueba posesión de PMK y deriva PTK).',
          '3. AP → STA: confirmación + GTK cifrada (tráfico de grupo) + MIC. 4. STA → AP: ACK con MIC. (Vulnerable a diccionario offline si capturan el handshake.)'
        ]
      },
      ent: {
        title: 'WPA2/WPA3-Enterprise (802.1X / EAP / RADIUS)',
        steps: [
          '1. Tres roles: STA (suplicante), AP (autenticador) y Servidor de Autenticación (RADIUS).',
          '2. Open System + Asociación: 802.1X bloquea tráfico hasta completar autenticación.',
          '3. EAP transporta credenciales/certificados (ej. EAP-TLS) hasta el RADIUS sin clave compartida única.',
          '4. RADIUS entrega material maestro → se establece PMK y corre el 4-Way Handshake.'
        ]
      },
      wpa3: {
        title: 'WPA3-Personal (SAE + PMF obligatorio)',
        steps: [
          '1. Descubre BSS vía Beacon / Probe.',
          '2. Autenticación SAE (Simultaneous Authentication of Equals): acuerdo de claves por contraseña que impide ataques de diccionario offline sobre capturas pasivas.',
          '3. Asociación negocia capacidades y activa PMF (protección de tramas de gestión).',
          '4. 4-Way Handshake deriva PTK/GTK y cifra datos con AES-CCMP o GCMP.'
        ]
      }
    }[secFlowMode];

    stage.innerHTML =
      '<div class="sim-grid-2">' +
        '<div class="card">' +
          '<div class="card-header-row">' +
            '<h3>Estándares 802.11 (b → 6E)</h3>' +
            '<div class="filter-pills">' +
              '<button type="button" class="review-filter-btn' + (wifiBandFilter === 'all' ? ' is-active' : '') + '" data-wband="all">Todas</button>' +
              '<button type="button" class="review-filter-btn' + (wifiBandFilter === '2.4' ? ' is-active' : '') + '" data-wband="2.4">2,4 GHz</button>' +
              '<button type="button" class="review-filter-btn' + (wifiBandFilter === '5' ? ' is-active' : '') + '" data-wband="5">5 GHz</button>' +
              '<button type="button" class="review-filter-btn' + (wifiBandFilter === '6' ? ' is-active' : '') + '" data-wband="6">6 GHz</button>' +
            '</div>' +
          '</div>' +
          '<div style="overflow-x:auto"><table class="table-clean">' +
            '<thead><tr><th>Norma</th><th>Nombre</th><th>Banda</th><th>Aporte</th><th>Dato clave</th></tr></thead>' +
            '<tbody>' + filteredStds.map(function (s) {
              return '<tr><td><strong>' + s.std + '</strong></td><td>' + s.name + '</td><td>' + s.bandTxt + '</td><td class="small">' + s.aporte + '</td><td class="small muted">' + s.data + '</td></tr>';
            }).join('') + '</tbody>' +
          '</table></div>' +
        '</div>' +

        '<div class="card">' +
          '<h3>Caso ESP32 y Conversor mW ↔ dBm / dBi</h3>' +
          '<table class="table-clean" style="margin-bottom:0.75rem">' +
            '<thead><tr><th>Chip</th><th>Estándar / Banda</th><th>Roles (clásico)</th></tr></thead>' +
            '<tbody>' +
              '<tr><td><strong>ESP32 clásico</strong></td><td>Wi-Fi 4 (b/g/n), 2,4 GHz, 1×1</td><td>STA, SoftAP, STA+SoftAP (mismo canal), Promiscuo</td></tr>' +
              '<tr><td><strong>ESP32-C6</strong></td><td>802.11b/g/n/ax en 2,4 GHz</td><td>Wi-Fi 6 en 2,4 GHz</td></tr>' +
              '<tr><td><strong>ESP32-C5</strong></td><td>802.11a/b/g/n/ac/ax</td><td>2,4 y 5 GHz</td></tr>' +
            '</tbody>' +
          '</table>' +
          '<div class="sim-controls-row" style="margin-bottom:0.4rem">' +
            '<div class="form-group" style="flex:1"><label>Potencia (mW)</label><input type="number" id="mw-input" class="input" min="0.001" step="1" value="' + mwInput + '"></div>' +
            '<div class="form-group" style="flex:1"><label>Resultado dBm</label><div class="explanation-box"><strong>' + dbmCalc + '</strong></div></div>' +
            '<div class="form-group" style="flex:1"><label>Ganancia (dBi)</label><input type="number" id="dbi-input" class="input" step="0.5" value="' + dbiInput + '"></div>' +
            '<div class="form-group" style="flex:1"><label>Concentración</label><div class="explanation-box"><strong>' + linGain + '</strong></div></div>' +
          '</div>' +
          '<p class="small muted" style="margin:0">0 dBm = 1 mW · 10 dBm = 10 mW · 20 dBm = 100 mW. Una antena de 5 dBi concentra ~3,16× (no crea energía).</p>' +
        '</div>' +
      '</div>' +

      '<div class="sim-grid-2">' +
        '<div class="card">' +
          '<div class="card-header-row">' +
            '<h3>Explorador PHY: OFDM, MIMO, Beamforming y OFDMA</h3>' +
            '<div class="filter-pills">' +
              '<button type="button" class="review-filter-btn' + (wifiTechMode === 'ofdm' ? ' is-active' : '') + '" data-wtech="ofdm">OFDM</button>' +
              '<button type="button" class="review-filter-btn' + (wifiTechMode === 'mimo' ? ' is-active' : '') + '" data-wtech="mimo">MIMO</button>' +
              '<button type="button" class="review-filter-btn' + (wifiTechMode === 'beam' ? ' is-active' : '') + '" data-wtech="beam">Beamforming</button>' +
              '<button type="button" class="review-filter-btn' + (wifiTechMode === 'ofdma' ? ' is-active' : '') + '" data-wtech="ofdma">OFDMA / 11ax</button>' +
            '</div>' +
          '</div>' +
          '<div class="svg-box">' + techInfo.svg + '</div>' +
          '<div class="explanation-box" style="margin-top:0.75rem"><strong>' + techInfo.title + '</strong><p style="margin:0.3rem 0 0">' + techInfo.text + '</p></div>' +
        '</div>' +

        '<div class="card">' +
          '<h3>EDCA (QoS), Backoff Congelable y Anomalía de la Tasa</h3>' +
          '<div class="filter-pills" style="margin-bottom:0.75rem">' +
            Object.keys(acTable).map(function (k) {
              return '<button type="button" class="review-filter-btn' + (edcaAc === k ? ' is-active' : '') + '" data-ac="' + k + '">' + k + '</button>';
            }).join('') +
          '</div>' +
          '<div class="explanation-box" style="margin-bottom:0.75rem">' +
            '<strong>' + edcaAc + ' (' + selAc.label + '):</strong> CWmin = <strong>' + selAc.cwmin + '</strong> · AIFSN = <strong>' + selAc.aifsn + '</strong> · <code>AIFS = SIFS + AIFSN × Slot</code> ≈ <strong>' + aifsUs + ' µs</strong> (OFDM 5 GHz). QoS estadística, no absoluta. Fórmula de fallo: <code>CW ← min[2(CW+1)−1, CWmax]</code>.' +
          '</div>' +
          '<div class="card-header-row" style="margin-bottom:0.4rem"><strong class="small">Ejemplo de backoff congelable (5 → 3)</strong>' +
            '<div class="filter-pills">' +
              '<button type="button" class="btn btn-outline btn-xs" id="btn-freeze-prev"' + (freezeStep === 0 ? ' disabled' : '') + '>←</button>' +
              '<button type="button" class="btn btn-teal btn-xs" id="btn-freeze-next"' + (freezeStep === 3 ? ' disabled' : '') + '>Siguiente →</button>' +
            '</div>' +
          '</div>' +
          '<div class="explanation-box" style="margin-bottom:0.75rem">' + freezeTexts[freezeStep] + '</div>' +
          '<div class="card-header-row" style="margin-bottom:0.3rem"><strong class="small">Anomalía de la tasa (6 Mb/s vs 54 Mb/s)</strong>' +
            '<label class="checkbox-label" style="padding:0"><input type="checkbox" id="chk-txop"' + (txopEnabled ? ' checked' : '') + '><span>Activar TXOP</span></label>' +
          '</div>' +
          '<div class="airtime-bar-track">' +
            (txopEnabled
              ? '<div class="airtime-bar" style="width:50%;background:#d97706">6 Mb/s (1 turno)</div><div class="airtime-bar" style="width:50%;background:#059669">54 Mb/s (múltiples tramas)</div>'
              : '<div class="airtime-bar" style="width:90%;background:#dc2626">6 Mb/s acapara 90% del aire</div><div class="airtime-bar" style="width:10%;background:#2563eb">54M</div>') +
          '</div>' +
          '<p class="small muted" style="margin:0">' + (txopEnabled ? 'Con TXOP ambas estaciones reciben tiempo similar de aire; la rápida envía varias tramas en su ventana.' : 'Sin TXOP cada estación manda 1 trama por turno: la de 6 Mb/s tarda 9× más y arrastra a la rápida.') + '</p>' +
        '</div>' +
      '</div>' +

      '<div class="sim-grid-2">' +
        '<div class="card">' +
          '<h3>Inspector Frame Control 802.11 y Longitud de Cabecera</h3>' +
          '<div class="frame-strip">' +
            [['ver', 'Versión', '2 b'], ['type', 'Type', '2 b'], ['sub', 'Subtype', '4 b'], ['flags', '8 Flags', '8 b']].map(function (it) {
              return '<button type="button" class="frame-field-btn' + (fcField === it[0] ? ' is-active' : '') + '" data-fc="' + it[0] + '"><strong>' + it[1] + '</strong><span>' + it[2] + '</span></button>';
            }).join('') +
          '</div>' +
          '<div class="explanation-box" style="margin-bottom:0.75rem">' + fcDetails[fcField] + '</div>' +
          '<p class="small muted" style="margin:0"><strong>Sequence Control:</strong> 16 bits (4 fragmento + 12 número) para detectar duplicados. <strong>Cuerpo:</strong> hasta 2312 B (+ LLC). <strong>Cabecera:</strong> 24 B (3 dir.), 26 B (3 dir. + QoS Control 2 B), 30 B (WDS 4 dir.), 32 B (WDS + QoS).</p>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-header-row">' +
            '<h3>Flujos de Autenticación y Claves (5.6)</h3>' +
            '<div class="filter-pills">' +
              [['wep', 'WEP'], ['wpa2', 'WPA2'], ['ent', 'Enterprise'], ['wpa3', 'WPA3-SAE']].map(function (it) {
                return '<button type="button" class="review-filter-btn' + (secFlowMode === it[0] ? ' is-active' : '') + '" data-secf="' + it[0] + '">' + it[1] + '</button>';
              }).join('') +
            '</div>' +
          '</div>' +
          '<p style="margin-bottom:0.5rem"><strong>' + secFlows.title + '</strong></p>' +
          '<div class="timeline-track">' +
            secFlows.steps.map(function (_, idx) {
              return '<button type="button" class="timeline-pill' + (secStep === idx ? ' is-active' : '') + '" data-secstep="' + idx + '">Paso ' + (idx + 1) + '</button>';
            }).join('') +
          '</div>' +
          '<div class="explanation-box">' + secFlows.steps[secStep] + '</div>' +
        '</div>' +
      '</div>';

    stage.querySelectorAll('[data-wband]').forEach(function (b) {
      b.addEventListener('click', function () { wifiBandFilter = this.getAttribute('data-wband'); renderWifiDeepTab(stage); });
    });
    document.getElementById('mw-input').addEventListener('input', function () { mwInput = parseFloat(this.value) || 0; renderWifiDeepTab(stage); });
    document.getElementById('dbi-input').addEventListener('input', function () { dbiInput = parseFloat(this.value) || 0; renderWifiDeepTab(stage); });
    stage.querySelectorAll('[data-wtech]').forEach(function (b) {
      b.addEventListener('click', function () { wifiTechMode = this.getAttribute('data-wtech'); renderWifiDeepTab(stage); });
    });
    stage.querySelectorAll('[data-ac]').forEach(function (b) {
      b.addEventListener('click', function () { edcaAc = this.getAttribute('data-ac'); renderWifiDeepTab(stage); });
    });
    document.getElementById('btn-freeze-prev').addEventListener('click', function () { if (freezeStep > 0) { freezeStep--; renderWifiDeepTab(stage); } });
    document.getElementById('btn-freeze-next').addEventListener('click', function () { if (freezeStep < 3) { freezeStep++; renderWifiDeepTab(stage); } });
    document.getElementById('chk-txop').addEventListener('change', function () { txopEnabled = this.checked; renderWifiDeepTab(stage); });
    stage.querySelectorAll('[data-fc]').forEach(function (b) {
      b.addEventListener('click', function () { fcField = this.getAttribute('data-fc'); renderWifiDeepTab(stage); });
    });
    stage.querySelectorAll('[data-secf]').forEach(function (b) {
      b.addEventListener('click', function () { secFlowMode = this.getAttribute('data-secf'); secStep = 0; renderWifiDeepTab(stage); });
    });
    stage.querySelectorAll('[data-secstep]').forEach(function (b) {
      b.addEventListener('click', function () { secStep = parseInt(this.getAttribute('data-secstep'), 10); renderWifiDeepTab(stage); });
    });
  }

  /* ==================== TAB 10: SUBNETTING, ICMP E IPv6 ==================== */
  function generateSubnetQuiz() {
    var prefixes = [24, 25, 26, 27, 28, 29];
    var p = prefixes[Math.floor(Math.random() * prefixes.length)];
    var o3 = 1 + Math.floor(Math.random() * 200);
    var o4 = 1 + Math.floor(Math.random() * 250);
    var ip = '192.168.' + o3 + '.' + o4;
    var res = calcIPv4(ip, p, '');
    subQuiz = { ip: ip, prefix: p, res: res };
    subQuizFeedback = '';
  }

  function renderIpLabTab(stage) {
    if (!subQuiz) generateSubnetQuiz();

    var v4Res = calcIPv4(ipCalcSrc, ipCalcPrefix, ipCalcDst);
    var binStripHtml = '';
    if (v4Res.valid) {
      for (var b = 0; b < 32; b++) {
        if (b > 0 && b % 8 === 0) binStripHtml += '<span class="bit-box is-sep">.</span>';
        binStripHtml += '<span class="bit-box ' + (b < v4Res.prefix ? 'is-net' : 'is-host') + '">' + v4Res.ipBin[b] + '</span>';
      }
    }

    var routeSets = {
      campus: [
        { net: '10.20.0.0', prefix: 16, iface: 'Interfaz A (Troncales)' },
        { net: '10.20.4.0', prefix: 24, iface: 'Interfaz B (Lab Redes)' },
        { net: '10.20.4.48', prefix: 28, iface: 'Interfaz C (Servidores)' },
        { net: '0.0.0.0', prefix: 0, iface: 'Default Gateway' }
      ],
      vlsm: [
        { net: '172.16.0.0', prefix: 17, iface: 'Computación (/17 = 1/2)' },
        { net: '172.16.128.0', prefix: 18, iface: 'Ing. Eléctrica (/18 = 1/4)' },
        { net: '172.16.192.0', prefix: 19, iface: 'Artes (/19 = 1/8)' },
        { net: '0.0.0.0', prefix: 0, iface: 'Internet / Default' }
      ]
    };
    var curRoutes = routeSets[lpmMode];
    var lpmRes = matchRoute(lpmIp, curRoutes);

    var fragRes = fragmentIPv4(fragSize, fragMtu, fragDf === 1);
    var icmpFields = {
      type: 'Tipo (8 bits): identifica el mensaje (Echo Reply 0, Dest. Unreachable 3, Source Quench 4, Redirect 5, Echo Request 8, Router Adv/Sol 9/10, Time Exceeded 11, Parameter Problem 12).',
      code: 'Código (8 bits): detalla el subtipo de error (p. ej. en Tipo 3, Código 4 = Fragmentación necesaria y DF = 1).',
      chk: 'Checksum (16 bits): suma de verificación sobre todo el mensaje ICMP.',
      param: 'Parámetros (32 bits): identificador/secuencia en ping o puntero/MTU según el tipo.',
      orig: 'Datos del error: cuando reporta un problema, adjunta la cabecera IP del datagrama original + los primeros 64 bits de sus datos (puertos TCP/UDP).'
    };

    var v6Res = analyzeIPv6(ipv6Input);

    stage.innerHTML =
      '<div class="card">' +
        '<div class="card-header-row">' +
          '<h3>Calculadora Binaria IPv4: AND, Subred, Broadcast y Decisión Local vs Gateway</h3>' +
          '<div class="filter-pills">' +
            '<button type="button" class="review-filter-btn" data-ip-preset="192.228.17.57|27|192.228.17.40">Stallings (/27)</button>' +
            '<button type="button" class="review-filter-btn" data-ip-preset="192.168.1.23|24|10.0.0.20">Cátedra (/24)</button>' +
            '<button type="button" class="review-filter-btn" data-ip-preset="172.16.45.10|20|172.16.48.2">Privada (/20)</button>' +
          '</div>' +
        '</div>' +
        '<div class="sim-controls-row">' +
          '<div class="form-group" style="flex:1.2"><label>IPv4 Origen</label><input type="text" id="ip4-src" class="input" value="' + App.escapeHtml(ipCalcSrc) + '"></div>' +
          '<div class="form-group" style="flex:0.6"><label>Prefijo /n</label><input type="number" id="ip4-prefix" class="input" min="0" max="32" value="' + ipCalcPrefix + '"></div>' +
          '<div class="form-group" style="flex:1.2"><label>IPv4 Destino (para comparar AND)</label><input type="text" id="ip4-dst" class="input" value="' + App.escapeHtml(ipCalcDst) + '"></div>' +
        '</div>' +
        (v4Res.valid
          ? '<div class="small muted">Bits en azul = parte de Red (/' + v4Res.prefix + ') · Bits en verde = parte de Host (' + v4Res.hostBits + ' bits)</div>' +
            '<div class="bit-strip">' + binStripHtml + '</div>' +
            '<div class="stats-strip" style="grid-template-columns:repeat(4,1fr);margin:0.75rem 0">' +
              '<div class="stat-box"><span class="stat-label">Red (IP AND Másc)</span><strong class="stat-value" style="font-size:1.02rem">' + v4Res.network + '</strong></div>' +
              '<div class="stat-box"><span class="stat-label">Máscara decimal</span><strong class="stat-value" style="font-size:1.02rem">' + v4Res.mask + '</strong></div>' +
              '<div class="stat-box"><span class="stat-label">Broadcast</span><strong class="stat-value" style="font-size:1.02rem">' + v4Res.broadcast + '</strong></div>' +
              '<div class="stat-box"><span class="stat-label">Hosts útiles (2^h−2)</span><strong class="stat-value" style="font-size:1.02rem">' + v4Res.usableHosts + '</strong></div>' +
            '</div>' +
            '<div class="explanation-box">' +
              '<div><strong>Rango útil:</strong> <code>' + v4Res.firstHost + '</code> a <code>' + v4Res.lastHost + '</code> · <strong>Clase histórica:</strong> ' + v4Res.histClass + ' · <strong>Ámbito:</strong> ' + v4Res.scope + '</div>' +
              (v4Res.dstCheck && v4Res.dstCheck.valid
                ? '<div style="margin-top:0.35rem"><strong>Decisión hacia ' + v4Res.dstCheck.dstIp + ':</strong> AND da <code>' + v4Res.dstCheck.dstAndNet + '</code> → ' +
                  (v4Res.dstCheck.sameSubnet ? '<span class="text-success"><strong>Misma subred (envío directo con ARP al destino)</strong></span>' : '<span class="text-warning"><strong>Red remota (envía trama al Gateway por defecto)</strong></span>') + '</div>'
                : '') +
            '</div>'
          : '<div class="explanation-box text-danger">' + v4Res.error + '</div>') +
      '</div>' +

      '<div class="sim-grid-2">' +
        '<div class="card">' +
          '<div class="card-header-row">' +
            '<h3>Prefijo Más Largo (LPM) y VLSM</h3>' +
            '<div class="filter-pills">' +
              '<button type="button" class="review-filter-btn' + (lpmMode === 'campus' ? ' is-active' : '') + '" data-lpm-m="campus">10.20/16 vs /24</button>' +
              '<button type="button" class="review-filter-btn' + (lpmMode === 'vlsm' ? ' is-active' : '') + '" data-lpm-m="vlsm">VLSM (/17, /18, /19)</button>' +
            '</div>' +
          '</div>' +
          '<div class="form-group" style="margin-bottom:0.75rem"><label>IP Destino a enrutar</label><input type="text" id="lpm-ip-inp" class="input" value="' + App.escapeHtml(lpmIp) + '"></div>' +
          '<table class="table-clean">' +
            '<thead><tr><th>Prefijo</th><th>Interfaz / Sector</th><th>¿Coincide?</th></tr></thead>' +
            '<tbody>' + curRoutes.map(function (r, idx) {
              var isWin = lpmRes.winnerIndex === idx;
              var isMatch = lpmRes.matches[idx];
              var cls = isWin ? 'route-row-win' : (isMatch ? 'route-row-match' : '');
              return '<tr class="' + cls + '"><td><code>' + r.net + '/' + r.prefix + '</code></td><td>' + r.iface + '</td><td>' + (isWin ? '✓ GANA (más largo)' : (isMatch ? 'Coincide' : 'No')) + '</td></tr>';
            }).join('') + '</tbody>' +
          '</table>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-header-row">' +
            '<h3>Entrenador Rápido de Subnetting</h3>' +
            '<button type="button" id="btn-new-subq" class="btn btn-teal btn-xs">Nuevo ejercicio</button>' +
          '</div>' +
          '<p>Dada la IP <code>' + subQuiz.ip + '/' + subQuiz.prefix + '</code>, calculá su dirección de red y cantidad de hosts utilizables:</p>' +
          '<div class="sim-controls-row">' +
            '<div class="form-group" style="flex:1.2"><label>Dirección de red</label><input type="text" id="subq-net" class="input" placeholder="Ej. 192.168.10.32"></div>' +
            '<div class="form-group" style="flex:0.8"><label>Hosts útiles</label><input type="number" id="subq-hosts" class="input" placeholder="Ej. 30"></div>' +
            '<button type="button" id="btn-check-subq" class="btn btn-primary btn-sm">Comprobar</button>' +
          '</div>' +
          (subQuizFeedback ? '<div class="explanation-box">' + subQuizFeedback + '</div>' : '<p class="small muted">Tip: calculá el tamaño de bloque en el último octeto como <code>2^(32 − prefijo)</code> y restá 2 para hosts útiles.</p>') +
        '</div>' +
      '</div>' +

      '<div class="sim-grid-2">' +
        '<div class="card">' +
          '<h3>Simulador de Fragmentación IPv4 y MTUs</h3>' +
          '<div class="sim-controls-row">' +
            '<div class="form-group" style="flex:0.9"><label>Datagrama (B)</label><input type="number" id="frag-size-inp" class="input" min="20" max="65535" value="' + fragSize + '"></div>' +
            '<div class="form-group" style="flex:1.2"><label>MTU enlace</label>' +
              '<select id="frag-mtu-sel" class="input">' +
                '<option value="1500"' + (fragMtu === 1500 ? ' selected' : '') + '>Ethernet (1500 B)</option>' +
                '<option value="1492"' + (fragMtu === 1492 ? ' selected' : '') + '>PPPoE (1492 B)</option>' +
                '<option value="576"' + (fragMtu === 576 ? ' selected' : '') + '>PPP (576 B)</option>' +
                '<option value="2272"' + (fragMtu === 2272 ? ' selected' : '') + '>802.11 (2272 B)</option>' +
                '<option value="4470"' + (fragMtu === 4470 ? ' selected' : '') + '>FDDI (4470 B)</option>' +
                '<option value="9180"' + (fragMtu === 9180 ? ' selected' : '') + '>ATM AAL5 (9180 B)</option>' +
              '</select>' +
            '</div>' +
            '<div class="form-group" style="flex:0.8"><label>Flag DF</label>' +
              '<select id="frag-df-sel" class="input"><option value="0"' + (fragDf === 0 ? ' selected' : '') + '>DF = 0 (permite)</option><option value="1"' + (fragDf === 1 ? ' selected' : '') + '>DF = 1 (prohíbe)</option></select>' +
            '</div>' +
          '</div>' +
          (fragRes.valid
            ? (fragRes.dropped
                ? '<div class="explanation-box text-danger"><strong>Descarte en Router:</strong> ' + fragRes.icmpMessage + '</div>'
                : '<p class="small muted">' + (fragRes.needsFragmentation ? 'Carga útil máxima múltiplo de 8 por fragmento: <strong>' + fragRes.maxFragPayload + ' B</strong>. Reensambla solo el host destino.' : 'No requiere fragmentación (cabe en la MTU).') + '</p>' +
                  '<div class="frag-grid">' + fragRes.fragments.map(function (f) {
                    return '<div class="frag-card"><strong>Fragmento #' + f.index + '</strong><div>Long. total: <code>' + f.totalLen + ' B</code> (' + f.payloadLen + ' B datos)</div><div>MF = <code>' + f.mf + '</code> · Offset = <code>' + f.offset8 + '</code> (' + f.offsetBytes + ' B)</div></div>';
                  }).join('') + '</div>')
            : '<div class="explanation-box text-danger">' + fragRes.error + '</div>') +
          '<h4 style="margin-top:0.85rem">Cabecera ICMP (64 bits)</h4>' +
          '<div class="frame-strip">' +
            [['type', 'Tipo', '8 b'], ['code', 'Código', '8 b'], ['chk', 'Checksum', '16 b'], ['param', 'Parámetros', '32 b'], ['orig', 'IP + 64b datos', 'opc.']].map(function (it) {
              return '<button type="button" class="frame-field-btn' + (icmpSelected === it[0] ? ' is-active' : '') + '" data-icmp="' + it[0] + '"><strong>' + it[1] + '</strong><span>' + it[2] + '</span></button>';
            }).join('') +
          '</div>' +
          '<div class="explanation-box">' + icmpFields[icmpSelected] + '</div>' +
        '</div>' +

        '<div class="card">' +
          '<div class="card-header-row">' +
            '<h3>Laboratorio IPv6 (Notación, Compresión y Especiales)</h3>' +
            '<div class="filter-pills">' +
              '<button type="button" class="review-filter-btn" data-v6-pre="2001:0DB8:0000:0000:0000:0000:1428:57AB">Cátedra</button>' +
              '<button type="button" class="review-filter-btn" data-v6-pre="fe80::1a2b">Link-local</button>' +
              '<button type="button" class="review-filter-btn" data-v6-pre="::ffff:192.168.1.1">IPv4 map</button>' +
              '<button type="button" class="review-filter-btn" data-v6-pre="::1">Loopback</button>' +
            '</div>' +
          '</div>' +
          '<div class="form-group"><label>Dirección IPv6 (probá comprimir o expandir)</label><input type="text" id="v6-inp" class="input" value="' + App.escapeHtml(ipv6Input) + '"></div>' +
          (v6Res.valid
            ? '<div class="ipv6-group-row">' + v6Res.groups.map(function (g) {
                return '<div class="ipv6-group' + (g === '0000' ? ' is-zero' : '') + '">' + g + '</div>';
              }).join('') + '</div>' +
              '<div class="explanation-box">' +
                '<div><strong>Comprimida canónica:</strong> <code>' + App.escapeHtml(v6Res.compressed) + '</code></div>' +
                '<div style="margin:0.25rem 0"><strong>Expandida (128 bits):</strong> <code>' + App.escapeHtml(v6Res.expanded) + '</code></div>' +
                '<div><strong>Clasificación:</strong> ' + App.escapeHtml(v6Res.classification) + '</div>' +
              '</div>'
            : '<div class="explanation-box text-danger">' + App.escapeHtml(v6Res.error) + '</div>') +
          '<p class="small muted" style="margin:0.7rem 0 0"><strong>Reglas:</strong> (1) omitir ceros a la izquierda de cada bloque; (2) reemplazar UNA sola secuencia continua de ceros por <code>::</code>. IPv6 elimina broadcast (usa multicast), ARP (usa NDP), checksum y fragmentación en routers (Path MTU ≥ 1280 B).</p>' +
        '</div>' +
      '</div>';

    stage.querySelectorAll('[data-ip-preset]').forEach(function (b) {
      b.addEventListener('click', function () {
        var parts = this.getAttribute('data-ip-preset').split('|');
        ipCalcSrc = parts[0]; ipCalcPrefix = parseInt(parts[1], 10); ipCalcDst = parts[2];
        renderIpLabTab(stage);
      });
    });
    document.getElementById('ip4-src').addEventListener('change', function () { ipCalcSrc = this.value; renderIpLabTab(stage); });
    document.getElementById('ip4-prefix').addEventListener('change', function () { ipCalcPrefix = parseInt(this.value, 10) || 24; renderIpLabTab(stage); });
    document.getElementById('ip4-dst').addEventListener('change', function () { ipCalcDst = this.value; renderIpLabTab(stage); });

    stage.querySelectorAll('[data-lpm-m]').forEach(function (b) {
      b.addEventListener('click', function () {
        lpmMode = this.getAttribute('data-lpm-m');
        lpmIp = lpmMode === 'campus' ? '10.20.4.55' : '172.16.140.10';
        renderIpLabTab(stage);
      });
    });
    document.getElementById('lpm-ip-inp').addEventListener('input', function () { lpmIp = this.value; renderIpLabTab(stage); });

    document.getElementById('btn-new-subq').addEventListener('click', function () { generateSubnetQuiz(); renderIpLabTab(stage); });
    document.getElementById('btn-check-subq').addEventListener('click', function () {
      var uNet = document.getElementById('subq-net').value.trim();
      var uHosts = parseInt(document.getElementById('subq-hosts').value, 10);
      var netOk = uNet === subQuiz.res.network;
      var hostOk = uHosts === subQuiz.res.usableHosts;
      subQuizFeedback = (netOk && hostOk ? '<strong class="text-success">✓ ¡Exacto!</strong> ' : '<strong class="text-danger">✗ Revisá:</strong> ') +
        'Red = <code>' + subQuiz.res.network + '</code> (broadcast <code>' + subQuiz.res.broadcast + '</code>), Hosts útiles = <code>' + subQuiz.res.usableHosts + '</code> (2^' + subQuiz.res.hostBits + ' − 2).';
      renderIpLabTab(stage);
    });

    document.getElementById('frag-size-inp').addEventListener('change', function () { fragSize = parseInt(this.value, 10) || 1500; renderIpLabTab(stage); });
    document.getElementById('frag-mtu-sel').addEventListener('change', function () { fragMtu = parseInt(this.value, 10) || 1500; renderIpLabTab(stage); });
    document.getElementById('frag-df-sel').addEventListener('change', function () { fragDf = parseInt(this.value, 10) || 0; renderIpLabTab(stage); });
    stage.querySelectorAll('[data-icmp]').forEach(function (b) {
      b.addEventListener('click', function () { icmpSelected = this.getAttribute('data-icmp'); renderIpLabTab(stage); });
    });

    stage.querySelectorAll('[data-v6-pre]').forEach(function (b) {
      b.addEventListener('click', function () { ipv6Input = this.getAttribute('data-v6-pre'); renderIpLabTab(stage); });
    });
    document.getElementById('v6-inp').addEventListener('change', function () { ipv6Input = this.value; renderIpLabTab(stage); });
  }

  var theoryCollapsed = false;

  function renderDiagramTheory(tabId) {
    var box = document.getElementById('diagram-theory-box');
    if (!box) return;
    var theories = App.DIAGRAM_THEORY || {};
    var info = theories[tabId];
    if (!info) {
      box.hidden = true;
      return;
    }
    box.hidden = false;

    var pillarsHtml = (info.pillars || []).map(function (p) {
      return (
        '<div class="diagram-theory-pillar">' +
          '<strong>' + App.escapeHtml(p.label) + '</strong>' +
          '<p>' + App.escapeHtml(p.text) + '</p>' +
        '</div>'
      );
    }).join('');

    box.innerHTML =
      '<div class="diagram-theory-header">' +
        '<div class="diagram-theory-title-wrap">' +
          '<span class="pill pill-blue">' + App.escapeHtml(info.badge) + '</span>' +
          '<h2>' + App.escapeHtml(info.title) + '</h2>' +
        '</div>' +
        '<button type="button" id="btn-toggle-theory" class="btn btn-outline btn-xs">' +
          (theoryCollapsed ? 'Mostrar base teórica ▾' : 'Ocultar base teórica ▴') +
        '</button>' +
      '</div>' +
      '<div class="diagram-theory-body"' + (theoryCollapsed ? ' hidden' : '') + '>' +
        '<p class="diagram-theory-problem">' + App.escapeHtml(info.problem) + '</p>' +
        '<p class="diagram-theory-lead">' + App.escapeHtml(info.intuition) + '</p>' +
        '<div class="diagram-theory-pillars">' + pillarsHtml + '</div>' +
        '<div class="diagram-theory-bridge"><strong>Síntesis previa:</strong> ' + App.escapeHtml(info.bridge) + '</div>' +
      '</div>';

    var toggleBtn = document.getElementById('btn-toggle-theory');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        theoryCollapsed = !theoryCollapsed;
        renderDiagramTheory(tabId);
      });
    }
  }

  function renderDiagramIntro(tabId) {
    var box = document.getElementById('diagram-intro-box');
    if (!box) return;
    var intros = App.DIAGRAM_INTROS || {};
    var info = intros[tabId];
    if (!info) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    var topicsHtml = (info.topics || []).map(function (t) {
      return '<span class="pill">' + App.escapeHtml(t) + '</span>';
    }).join('');

    box.innerHTML =
      '<div class="diagram-intro-head">' +
        '<span class="pill pill-teal">' + App.escapeHtml(info.badge) + '</span>' +
        '<h2>' + App.escapeHtml(info.title) + '</h2>' +
      '</div>' +
      '<p class="diagram-intro-text">' + App.escapeHtml(info.intro) + '</p>' +
      '<div class="diagram-intro-topics">' +
        '<span class="small muted"><strong>Vas a ver:</strong></span>' +
        topicsHtml +
      '</div>';
  }

  App.renderDiagramTheory = renderDiagramTheory;
  App.renderDiagramIntro = renderDiagramIntro;

  /* ==================== HOOK NO INVASIVO SOBRE App.DiagramsModule.setTab ==================== */
  var EXTRA_RENDERERS = {
    'mac-extra': renderMacExtraTab,
    'eth-arch': renderEthArchTab,
    'wifi-deep': renderWifiDeepTab,
    'ip-lab': renderIpLabTab
  };

  if (App.DiagramsModule && typeof App.DiagramsModule.setTab === 'function') {
    var origSetTab = App.DiagramsModule.setTab;
    App.DiagramsModule.setTab = function (tabId) {
      origSetTab.call(App.DiagramsModule, tabId);
      renderDiagramTheory(tabId);
      renderDiagramIntro(tabId);
      if (EXTRA_RENDERERS[tabId]) {
        var contentHost = document.getElementById('diagram-chapter-content');
        if (contentHost) EXTRA_RENDERERS[tabId](contentHost);
      }
    };
  }
})();
