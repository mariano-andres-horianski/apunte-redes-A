(function () {
  'use strict';

  var App = window.RedesApp = window.RedesApp || {};

  /* ==================== 1. COMPLETAR LOS 24 TÉRMINOS FALTANTES DEL GLOSARIO (131 -> 155) ==================== */
  var EXTRA_GLOSSARY_TERMS = [
    /* MAC (2) */
    { term: 'Protocolo de contención', group: 'mac', definition: 'Técnica donde las estaciones compiten por el canal compartido sin turno fijo (acceso aleatorio).' },
    { term: 'Tiempo continuo / ranurado', group: 'mac', definition: 'En tiempo continuo se transmite en cualquier instante; en el ranurado solo al inicio de un slot (exige sincronización).' },

    /* Ethernet y Conmutación (2) */
    { term: 'Nomenclatura (ej. 1000BASE-T)', group: 'ethernet', definition: 'Velocidad en Mb/s, BASE = señalización en banda base y sufijo del medio (T = par trenzado, SR = fibra corta).' },
    { term: 'Half-duplex / full-duplex', group: 'ethernet', definition: 'Un sentido por vez con CSMA/CD sobre medio compartido, o dos canales simultáneos TX/RX sin colisiones.' },

    /* Wi-Fi 802.11 (6) */
    { term: 'Modo infraestructura / ad hoc', group: 'wifi', definition: 'Infraestructura: estaciones asociadas a un AP (BSS); ad hoc (IBSS): comunicación directa entre estaciones sin AP.' },
    { term: 'Asociación, reasociación, desasociación', group: 'wifi', definition: 'Registrar una STA en un AP, cambiar de AP manteniendo sesión (handover) o terminar la relación con el BSS.' },
    { term: 'Frame Control / Duration / Sequence', group: 'wifi', definition: 'Campos de cabecera 802.11: tipo/subtipo e indicadores (2 B), reserva temporal NAV (2 B) y fragmento/secuencia anti-duplicados (2 B).' },
    { term: 'Tipos de trama (802.11)', group: 'wifi', definition: 'Gestión (Type 00: Beacon, Probe, Auth, Assoc), Control (Type 01: RTS, CTS, ACK) y Datos (Type 10: Data, QoS Data).' },
    { term: 'CCMP / GCMP / TKIP', group: 'wifi', definition: 'Modos de cifrado/integridad en Wi-Fi: TKIP (transitorio en WPA sobre RC4), AES-CCMP (WPA2/WPA3) y AES-GCMP (WPA3).' },
    { term: 'PMF', group: 'wifi', definition: 'Protected Management Frames: protege tramas de gestión (ej. desautenticación) contra suplantación; obligatorio en WPA3.' },

    /* Capa de Red (14) */
    { term: 'Reenvío y enrutamiento', group: 'red', definition: 'Reenvío (forwarding): mover cada paquete al siguiente salto según la tabla; enrutamiento (routing): construir esa tabla.' },
    { term: 'Dirección de red y de broadcast', group: 'red', definition: 'Primera dirección (bits de host en 0) y última dirección (bits de host en 1) de una subred; no se asignan a hosts.' },
    { term: 'Supernetting / agregación', group: 'red', definition: 'Unir varios prefijos contiguos en un único prefijo más corto para achicar las tablas de rutas globales.' },
    { term: 'IP estática y dinámica', group: 'red', definition: 'Estática: configurada manualmente por el administrador; dinámica: asignada temporalmente desde un servidor DHCP.' },
    { term: 'Loopback (127.0.0.0/8)', group: 'red', definition: 'Rango reservado para el propio host (127.0.0.1 en IPv4, ::1/128 en IPv6); el tráfico no sale a la red física.' },
    { term: 'Broadcast limitado y dirigido', group: 'red', definition: 'Limitado: 255.255.255.255 (solo red local, no cruza routers); dirigido: dirección de broadcast específica de una red.' },
    { term: 'Cabecera IPv4', group: 'red', definition: 'Encabezado de 20 a 60 bytes (IHL 5–15): Versión, IHL, TOS/DS+ECN, Long. total, ID, Flags, Offset, TTL, Protocolo, Checksum, IP origen/destino y opciones.' },
    { term: 'Router', group: 'red', definition: 'Dispositivo de capa 3 que une y separa redes: desencapsula la trama L2, consulta su tabla de rutas por IP y re-encapsula en una nueva trama.' },
    { term: 'Tabla de rutas', group: 'red', definition: 'Tabla en el router con las redes destino conocidas, su máscara/prefijo, interfaz de salida, próximo salto y métrica/distancia.' },
    { term: 'Red de paso / red de host', group: 'red', definition: 'Red de paso: enlace punto a punto entre routers sin hosts; red de host: subred donde se conectan equipos finales.' },
    { term: 'Ruta conectada, estática y dinámica', group: 'red', definition: 'Conectada: interfaz directa del router; estática: cargada a mano por el admin; dinámica: aprendida mediante RIP, OSPF, etc.' },
    { term: 'Distancia administrativa', group: 'red', definition: 'Valor de preferencia entre distintas fuentes de rutas en un router (conectada < estática < dinámica; menor = más confiable).' },
    { term: 'Notación IPv6', group: 'red', definition: 'Ocho grupos de 4 dígitos hex separados por ":"; permite omitir ceros a la izquierda de cada grupo y reemplazar una secuencia de ceros por "::".' },
    { term: 'Cabecera IPv6 (campos)', group: 'red', definition: 'Cabecera fija de 40 B: Versión (4b), Clase de tráfico (8b), Etiqueta de flujo (20b), Long. datos (16b), Cabecera siguiente (8b), Límite de saltos (8b) e IPs 128b.' }
  ];

  App.GLOSSARY_TERMS = (App.GLOSSARY_TERMS || []).concat(EXTRA_GLOSSARY_TERMS);

  /* ==================== 2. MINI-CUESTIONARIOS PARA LAS 4 PESTAÑAS NUEVAS (12 PREGUNTAS) ==================== */
  App.DIAGRAMS_DATA = App.DIAGRAMS_DATA || {};
  App.DIAGRAMS_DATA.chapterQuizzes = App.DIAGRAMS_DATA.chapterQuizzes || {};

  App.DIAGRAMS_DATA.chapterQuizzes['mac-extra'] = [
    {
      id: 'cq-macx-1',
      question: 'Según el simulador de CSMA, ¿qué ocurre cuando crece el producto ancho de banda-retardo (más tramas en vuelo en el cable) o cuando muchas estaciones usan CSMA 1-persistente?',
      options: [
        'CSMA 1-persistente reduce a cero las colisiones al liberarse el canal',
        'El mayor producto ancho de banda-retardo empeora el rendimiento de CSMA, y CSMA 1-persistente genera el "efecto estampida" al liberarse el medio',
        'CSMA no persistente transmite con probabilidad 1 sin esperar nunca',
        'CSMA p-persistente solo funciona en cables coaxiales sin ranuras'
      ],
      correctIndex: 1,
      explanation: 'Cuando muchas estaciones esperan bajo 1-persistente, todas transmiten juntas al quedar libre el medio (estampida). Además, si caben muchas tramas en tránsito (producto ancho de banda-retardo alto), las estaciones sensan libre demasiado tarde.'
    },
    {
      id: 'cq-macx-2',
      question: 'En los protocolos sin colisiones del apunte, ¿cuánto espera en promedio una estación de numeración baja con carga baja en Mapa de Bits (N estaciones) y quién gana en Cuenta Regresiva Binaria?',
      options: [
        'En Mapa de Bits espera 2τ; en Cuenta Regresiva gana la dirección más baja',
        'En Mapa de Bits espera en promedio N/2 + N ranuras; en Cuenta Regresiva Binaria gana la estación con la dirección mayor',
        'Ambos protocolos aplican backoff exponencial binario tras colisionar',
        'Solo permiten transmitir a la estación 0'
      ],
      correctIndex: 1,
      explanation: 'En Mapa de Bits (2.7) una estación de número bajo espera en media N/2 ranuras para que termine la ronda actual más las N ranuras de reserva. En Cuenta Regresiva Binaria las estaciones emiten su dirección bit a bit y gana la mayor.'
    },
    {
      id: 'cq-macx-3',
      question: 'En el simulador de Ventana Deslizante (capa de enlace), ¿qué diferencia a Repetición Selectiva de Retorno a N (Go-Back-N) cuando la trama #2 se pierde y las tramas #3, #4 y #5 llegan bien?',
      options: [
        'Retorno a N guarda #3, #4 y #5 en buffer y solo retransmite #2',
        'Retorno a N descarta #3, #4 y #5 y retransmite toda la ventana desde #2; Repetición Selectiva las almacena en buffer y retransmite solo la #2',
        'Ninguno de los dos puede usar tramas NAK para acelerar la recuperación',
        'Repetición Selectiva requiere menos memoria en el receptor que Retorno a N'
      ],
      correctIndex: 1,
      explanation: 'Retorno a N descarta toda trama posterior a una errónea (bueno solo si hay muy pocos errores). Repetición Selectiva almacena en buffer las posteriores válidas y retransmite únicamente la perdida, a costa de mayor memoria en receptor.'
    }
  ];

  App.DIAGRAMS_DATA.chapterQuizzes['eth-arch'] = [
    {
      id: 'cq-etha-1',
      question: 'En la historia y arquitectura de Ethernet (3.1–3.2), ¿cuál fue la velocidad experimental del memo original de Metcalfe (1973) y cuál era el límite de repetidores en Ethernet clásica (2,5 km)?',
      options: [
        '10 Mb/s en 1973 y hasta 10 repetidores en 5 km',
        '2,94 Mb/s en 1973 (Alto Aloha Network) y máximo 4 repetidores en un camino de hasta 2,5 km',
        '100 Mb/s en 1973 y sin límite de repetidores',
        '1 Gb/s en 1980 con coaxial RG-58'
      ],
      correctIndex: 1,
      explanation: 'El memo de Metcalfe (22 de mayo de 1973) conectó estaciones Alto a 2,94 Mb/s. En Ethernet clásica la regla MAC prohibía superar 2,5 km de extremo a extremo o más de 4 repetidores en la ruta.'
    },
    {
      id: 'cq-etha-2',
      question: 'Según la arquitectura interna y nomenclatura PHY, ¿qué papel cumple RS/xMII y qué medio usa 1000BASE-CX (802.3z)?',
      options: [
        'RS/xMII adapta la subcapa MAC a la PHY; 1000BASE-CX usa par trenzado blindado corto (< 25 m) con 8B/10B',
        'RS/xMII es el conector físico RJ-45; 1000BASE-CX es fibra monomodo de 40 km',
        'RS/xMII reemplaza al FCS de 4 bytes en 10GBASE-T',
        '1000BASE-CX opera únicamente en 2,4 GHz con OFDM'
      ],
      correctIndex: 0,
      explanation: 'Las 4 piezas son MAC → RS/xMII (adaptación) → PHY → MDI + medio. Dentro de 802.3z (8B/10B), CX corresponde a cobre/par trenzado blindado de corto alcance (< 25 m).'
    },
    {
      id: 'cq-etha-3',
      question: 'En la tabla completa de dispositivos y motivos de puenteo (4.1–4.2 y 11.4), ¿qué afirmación es CORRECTA sobre un Access Point (AP) y los puentes?',
      options: [
        'Un AP opera en Capa 3 igual que un router y separa dominios de broadcast por cada cliente',
        'Un AP es un puente inalámbrico 802.1D (Capas 1 y 2) donde las STA de un BSS comparten el canal de radio; los puentes además actúan como cortafuegos aislando nodos ruidosos',
        'Un hub opera en Capas 1 y 2 y permite múltiples transmisiones simultáneas por su backplane',
        'El slot time de 1 Gb/s half-duplex sigue siendo de 512 bit-times (0,512 µs)'
      ],
      correctIndex: 1,
      explanation: 'El AP es puente inalámbrico 802.1D (Capas 1 y 2). En un BSS las estaciones comparten el medio de radio. Además, unir LANs con puentes aporta autonomía, alcance, carga agregada y aislamiento frente a nodos defectuosos.'
    }
  ];

  App.DIAGRAMS_DATA.chapterQuizzes['wifi-deep'] = [
    {
      id: 'cq-wifid-1',
      question: 'En 802.11ax (Wi-Fi 6), ¿cómo cambian el espaciado entre subportadoras Δf, la duración del símbolo útil y el mecanismo NAV respecto a 802.11a/n/ac?',
      options: [
        'Δf sube a 1 MHz y se elimina el NAV por completo',
        'Δf baja a 78,125 kHz (un cuarto de 312,5 kHz), el símbolo útil sube a 12,8 µs e introduce dos NAV (propio BSS y OBSS) junto con BSS Coloring (1–63)',
        'Usa exactamente los mismos 312,5 kHz y 3,2 µs de 802.11a sin OFDMA',
        'Solo opera en la banda de 6 GHz (nunca en 2,4 ni 5 GHz)'
      ],
      correctIndex: 1,
      explanation: '802.11ax cuadruplica el tamaño de FFT (Δf = 78,125 kHz, símbolo útil 12,8 µs), introduce OFDMA con RUs (hasta 9 RU de 26 tonos en 20 MHz), 1024-QAM, BSS Coloring (1–63) y doble NAV.'
    },
    {
      id: 'cq-wifid-2',
      question: '¿Cómo se comporta el ESP32 clásico frente a los chips ESP32-C6 y ESP32-C5 según el apunte (5.2), y qué categoría EDCA tiene mayor prioridad (CWmin más chico)?',
      options: [
        'ESP32 clásico es Wi-Fi 6E en 6 GHz; en EDCA la categoría más prioritaria es AC_BK (CWmin 15)',
        'ESP32 clásico es Wi-Fi 4 en 2,4 GHz (1×1), ESP32-C6 suma 802.11ax en 2,4 GHz y ESP32-C5 soporta 2,4 y 5 GHz (a/b/g/n/ac/ax); la categoría más prioritaria es AC_VO (CWmin 3, AIFSN 2)',
        'En STA+SoftAP el ESP32 clásico se convierte automáticamente en router IP con dos radios independientes',
        'AC_VO garantiza QoS determinística absoluta sin contienda'
      ],
      correctIndex: 1,
      explanation: 'Sección 5.2 y 5.3: ESP32 clásico es 802.11b/g/n 2,4 GHz 1×1 (C6 agrega ax en 2,4 GHz; C5 opera en 2,4 y 5 GHz hasta ax). En EDCA, AC_VO (Voz) tiene CWmin=3 y AIFSN=2 (QoS estadística, no absoluta).'
    },
    {
      id: 'cq-wifid-3',
      question: 'En la trama MAC 802.11 y su seguridad (5.5–5.6), ¿cuántos bytes mide una cabecera QoS Data con 3 direcciones y por qué es insegura la autenticación WEP Shared Key?',
      options: [
        '24 bytes; WEP Shared Key es segura gracias al IV de 24 bits',
        '26 bytes (24 base + 2 QoS Control); en Shared Key el desafío en claro y la respuesta cifrada revelan el flujo de clave RC4 usado para ese IV',
        '32 bytes siempre; Shared Key usa el 4-Way Handshake con ANonce y SNonce',
        '14 bytes igual que Ethernet II'
      ],
      correctIndex: 1,
      explanation: 'Con 3 direcciones, 24 B base + 2 B de QoS Control = 26 B (32 B con Address 4 en WDS). En WEP Shared Key, conocer el desafío en texto plano y su cifrado con RC4 permite recuperar el keystream de ese IV y falsificar respuestas.'
    }
  ];

  App.DIAGRAMS_DATA.chapterQuizzes['ip-lab'] = [
    {
      id: 'cq-iplab-1',
      question: 'Si una empresa tiene el bloque /16 del ejemplo de Tanenbaum y asigna /17 a Computación, /18 a Ingeniería Eléctrica y /19 a Artes, ¿qué fracción del /16 original recibe cada sector y cómo decide el router?',
      options: [
        'Todos reciben exactamente 254 hosts; el router usa RIP con cuenta infinita',
        'Computación recibe 1/2 (/17), Eléctrica 1/4 (/18) y Artes 1/8 (/19); el router aplica AND con cada máscara y elige la coincidencia de prefijo más largo',
        'Desde afuera se ven las tres subredes por separado aunque no se anuncien',
        'El prefijo más corto siempre tiene prioridad sobre el más específico'
      ],
      correctIndex: 1,
      explanation: 'Al pedir bits prestados de a uno se divide a la mitad: /17 = 1/2 del /16, /18 = 1/4, /19 = 1/8 (VLSM). El router aplica AND con las máscaras y aplica Longest Prefix Match.'
    },
    {
      id: 'cq-iplab-2',
      question: 'Un datagrama IPv4 de 4000 bytes (20 B cabecera + 3980 B datos) con DF = 0 atraviesa un enlace Ethernet (MTU 1500 B). ¿Qué Offset (en unidades de 8 bytes) lleva el 2.º fragmento y qué MTU tiene PPPoE?',
      options: [
        'Offset = 1480 y MF = 0; PPPoE tiene MTU 576 B',
        'Cada fragmento salvo el último lleva hasta 1480 B de datos (múltiplo de 8), por lo que el 2.º fragmento lleva Offset = 185 (1480/8) y MF = 1; PPPoE tiene MTU 1492 B',
        'Offset = 185 bytes sin dividir por 8; PPPoE tiene MTU 9180 B',
        'Los routers intermedios reensamblan los 3 fragmentos antes de pasar al siguiente salto'
      ],
      correctIndex: 1,
      explanation: 'MTU 1500 − 20 B de cabecera = 1480 B de datos (divisible por 8). Frag 1: 1480 B, MF=1, Offset=0. Frag 2: 1480 B, MF=1, Offset=1480/8=185. Frag 3: 1020 B, MF=0, Offset=2960/8=370. PPPoE usa MTU 1492 B.'
    },
    {
      id: 'cq-iplab-3',
      question: 'En IPv6, ¿qué dirección representa ::1/128, qué representa ::ffff:0:0/96 y por qué es inválida la escritura 2001::1428::57ab?',
      options: [
        '::1/128 es enlace local; ::ffff:0:0/96 es multicast; se permiten múltiples "::"',
        '::1/128 es loopback, ::ffff:0:0/96 es IPv4 mapeada para transición, y "::" solo puede usarse una única vez por dirección para evitar ambigüedad',
        '::1/128 es dirección local única (ULA); ::ffff:0:0/96 es broadcast',
        'En IPv6 no se pueden omitir ceros a la izquierda de cada bloque'
      ],
      correctIndex: 1,
      explanation: 'Sección 6.9: en una dirección IPv6 "::" solo puede aparecer una vez (si no, no se sabría cuántos bloques de ceros reemplaza cada uno). ::1/128 es loopback y ::ffff:0:0/96 mapea IPv4 en hosts duales.'
    }
  ];

  /* ==================== 3. APUNTE COMPLETO ESTRUCTURADO (TODAS LAS SECCIONES DE RedResumen.md) ==================== */
  App.NOTES_DATA = [
    /* ---------- UNIDAD 2 ---------- */
    {
      id: 'n-2-1',
      unit: 'u2',
      section: '2.1',
      title: 'Dónde está la MAC, supuestos dinámicos y confiabilidad',
      summary: 'La capa de enlace (Capa 2) se divide en LLC (802.2, interfaz uniforme hacia la capa de red) y MAC (acceso al medio, direcciones de trama y coordinación). La idea guía de la MAC es decidir quién puede transmitir y cuándo sobre un medio compartido.',
      bullets: [
        'Asignación estática (FDM/TDM): reparte el canal por adelantado; desperdicia capacidad si el tráfico es en ráfagas e impide que una estación aproveche canales ociosos ajenos.',
        'Asignación dinámica: decide en tiempo real quién usa el canal (típico en radio/satélite, Ethernet clásico con bus/hub y WLAN 802.11).',
        '5 supuestos del modelo dinámico: (1) estaciones independientes; (2) canal único de difusión; (3) colisiones (si dos tramas se superponen en el tiempo, ambas se pierden); (4) tiempo continuo o ranurado (el ranurado exige sincronización con reloj maestro); (5) detección de portadora o no (en inalámbrico no siempre todas están al alcance).',
        'Advertencia clave: ningún protocolo de multiacceso (MAC) garantiza entrega confiable por sí solo; incluso sin colisiones pueden llegar bits erróneos.'
      ],
      trap: 'La capa de enlace presta servicios a la capa de RED (no a la de transporte ni a la física).',
      diagramTab: 'mac',
      terms: ['LLC (Logical Link Control)', 'MAC (Medium Access Control)', 'Asignación estática (FDM, TDM)', 'Asignación dinámica', 'Colisión', 'Tiempo continuo / ranurado']
    },
    {
      id: 'n-2-2',
      unit: 'u2',
      section: '2.2–2.4',
      title: 'Familias MAC, ALOHA puro y ALOHA ranurado',
      summary: 'Las cuatro familias MAC son: Canalización (FDM, TDM, CDM), Acceso aleatorio (ALOHA, CSMA, CSMA/CD, CSMA/CA), Acceso controlado (polling, token passing) y Contención limitada (híbridos).',
      bullets: [
        'ALOHA puro (Abramson, Hawái, años 70): transmite apenas hay trama; si no llega ACK antes del timeout espera un tiempo aleatorio (si fuera fijo, chocarían indefinidamente). En el sistema original escuchaba la retransmisión del hub central; Stallings agrega que espera al menos el máximo RTT + margen y se rinde tras varios intentos.',
        'Deducción ALOHA puro: nuevas tramas siguen Poisson con media N; con retransmisiones la carga total es G ≥ N. Si no inicia otra trama en el período vulnerable 2T (media 2G), P₀ = e^(−2G) ⇒ S = G·e^(−2G).',
        'El tamaño uniforme de trama maximiza el rendimiento; el checksum no distingue error leve de pérdida total ("lo malo es malo").',
        'ALOHA ranurado: slots sincronizados de ancho T (p. ej. "bip" maestro). Solo se empieza al inicio de un slot; el período vulnerable baja a T y S = G·e^(−G). A G = 1: 37% slots vacíos, 37% éxitos y 26% colisiones.',
        'Dato histórico: el ALOHA ranurado casi se olvidó y luego se rescató para el acceso a Internet por cable.'
      ],
      formulas: [
        'ALOHA puro: vulnerable = 2T · S = G·e^(−2G) · Máx S = 1/(2e) ≈ 18,4% en G = 0,5',
        'ALOHA ranurado: vulnerable = T · S = G·e^(−G) · Máx S = 1/e ≈ 36,8% en G = 1',
        'Ranurado: prob. de exactamente k intentos P_k = e^(−G)(1−e^(−G))^(k−1) · intentos esperados E = e^G'
      ],
      diagramTab: 'mac',
      terms: ['ALOHA puro', 'ALOHA ranurado', 'Período vulnerable', 'Carga ofrecida (G) y rendimiento (S)', 'Protocolo de contención']
    },
    {
      id: 'n-2-5',
      unit: 'u2',
      section: '2.5–2.6',
      title: 'CSMA, producto ancho de banda-retardo y CSMA/CD',
      summary: 'CSMA ("escucho primero; si parece libre, transmito") reduce colisiones, pero siguen existiendo por el retardo de propagación τ y el producto ancho de banda-retardo (cuántas tramas caben en tránsito en el cable).',
      bullets: [
        'CSMA 1-persistente: si está ocupado sigue escuchando y transmite con prob. 1 al liberarse → baja latencia con carga baja, pero sufre "efecto estampida".',
        'CSMA no persistente: si está ocupado suelta el medio, espera tiempo aleatorio y vuelve a sensar → menos colisiones en alta carga, pero más demora e instantes ociosos.',
        'CSMA p-persistente (canales ranurados): al liberarse transmite con prob. p y espera al siguiente slot con (1−p); si otro empieza actúa como colisión (802.11 refina este esquema).',
        'CSMA/CD (Ethernet clásico coaxial/hub): escucha analógicamente mientras transmite; si la señal leída difiere de la enviada, manda jam (32 bits en diapositivas / 48 en Tanenbaum), aborta y ejecuta backoff exponencial binario.',
        'Regla 2τ y trama mínima: en 10 Mb/s (2,5 km + 4 repetidores) 2τ ≈ 50 µs ⇒ slot time = 512 bit-times = 51,2 µs = 64 bytes. Tramas menores a 2τ rendirían igual que CSMA sin CD y no se distinguirían de basura de colisión.',
        'Backoff exponencial binario: tras colisión i espera r ∈ [0, 2^min(i,10) − 1] slots (tope 1023) y abandona tras 16 colisiones. Efecto secundario (Stallings): efecto LIFO (el último en llegar tiene más chances que quien ya colisionó varias veces).'
      ],
      formulas: [
        'Con k estaciones listas y prob. p por slot: A = k·p·(1−p)^(k−1) → máx 1/e en p = 1/k',
        'Contención media = 2τ/A ≤ 2τe ≈ 5,4τ · Eficiencia = P / (P + 2τ/A) (P = duración de trama)'
      ],
      trap: 'CSMA/CD NO usa RTS/CTS (eso es CSMA/CA) ni es un protocolo LLC; hoy con switches full-duplex ya no hay colisiones.',
      diagramTab: 'mac-extra',
      terms: ['CSMA', 'Efecto estampida', 'Retardo de propagación (τ)', 'Producto ancho de banda-retardo', 'CSMA/CD', 'Señal de jam', 'Backoff exponencial binario', 'Slot time', 'Trama mínima y 2τ', 'Colisión tardía']
    },
    {
      id: 'n-2-7',
      unit: 'u2',
      section: '2.7–2.10',
      title: 'Sin colisiones, inalámbrico (CSMA/CA) y ventana deslizante',
      summary: 'La contención de CSMA/CD introduce jitter malo para VoIP. Los protocolos sin colisiones resuelven turnos antes de transmitir; las WLAN usan CSMA/CA porque en radio no es viable escuchar mientras se transmite.',
      bullets: [
        'Protocolo de mapa de bits (reservación): N ranuras previas (0..N−1); cada estación marca un 1 en su ranura y luego transmiten en orden numérico. En carga baja una estación de número bajo espera N/2 + N ranuras en promedio.',
        'Otros sin colisiones / híbridos: paso de testigo (token passing, acceso controlado), cuenta regresiva binaria (emiten dirección bit a bit y gana la mayor) y contención limitada (contención con baja carga + reserva con alta).',
        'Por qué CSMA/CD falla en radio: la señal propia tapa señales entrantes un millón de veces más débiles ("aguja en un pajar"), las radios son half-duplex, hay fading/obstáculos y existen terminales ocultas.',
        'Terminal oculta (A y C no se oyen y chocan en B) vs Terminal expuesta (B→A frena a C→D sin necesidad). MACA (Karn, 1990) inspiró RTS/CTS; en 802.11 RTS/CTS + NAV ayuda con ocultas pero NO resuelve expuestas.',
        'CSMA/CA (DCF): sensado → DIFS + backoff aleatorio congelable → (opcional RTS/CTS + NAV) → DATA → ACK tras SIFS. Ante falta de ACK duplica el rango de backoff.',
        'Ventana deslizante en enlace (Tanenbaum 3.4, presente en parciales): la ventana limita tramas en tránsito sin confirmar; el timeout debe ser algo mayor que el RTT. Retorno a N descarta todo lo posterior a una trama errónea; Repetición Selectiva almacena en buffer las posteriores y retransmite solo la perdida (mejor en líneas ruidosas, mayor buffer). NAK acelera la recuperación sin esperar al timeout.'
      ],
      diagramTab: 'mac-extra',
      terms: ['Protocolo de mapa de bits', 'Paso de testigo (token passing)', 'Acceso controlado', 'Contención limitada', 'Terminal oculta', 'Terminal expuesta', 'MACA', 'CSMA/CA', 'DIFS / SIFS', 'RTS / CTS', 'NAV (Network Allocation Vector)']
    },

    /* ---------- UNIDAD 3 ---------- */
    {
      id: 'n-3-1',
      unit: 'u3',
      section: '3.1',
      title: 'Historia de Ethernet: de Alto Aloha Network a 800 Gb/s',
      summary: 'Idea central de la unidad: la MAC cambia poco; la PHY cambia muchísimo. Ethernet multiplicó por ×80.000 su velocidad manteniendo una trama reconocible y compatibilidad con las capas superiores.',
      bullets: [
        '1973 (22 de mayo): memo de Robert Metcalfe ("Alto Aloha Network") en Xerox PARC sobre coaxial pasivo a 2,94 Mb/s ("éter" omnipresente; sin switch, inteligencia en los extremos).',
        '1976: artículo de Metcalfe y Boggs en CACM (3 Mb/s, objetivo 100 estaciones, sin control central y recuperación de colisiones).',
        'DIX (Digital, Intel, Xerox): Ethernet v1 (1980) y v2 (1982) crearon el mercado abierto previo al estándar IEEE.',
        'IEEE 802.3: el proyecto 802 inicia en 1980; primera edición publicada en 1985 según diapositivas (Tanenbaum cita 1983 al convertir DIX en 802.3).',
        'Línea temporal: 10 Mb/s (10BASE-T, 1990) → 100 Mb/s (1995) → 1 Gb/s (1998/99) → 10 Gb/s (2002) → 200/400 Gb/s (2017) → 800 Gb/s (2024).',
        'Por qué ganó la LAN: estándares abiertos, trama estable que protege el software, economías de escala, paso de bus compartido a estrella conmutada e incorporación de cobre, fibra y nuevas codificaciones. Hoy solo se usa Ethernet conmutada.'
      ],
      diagramTab: 'eth-arch',
      terms: ['IEEE 802.3', 'DIX']
    },
    {
      id: 'n-3-2',
      unit: 'u3',
      section: '3.2',
      title: 'Arquitectura Ethernet y evolución de capas físicas (PHY)',
      summary: 'Una interfaz Ethernet consta de 4 piezas: MAC → RS/xMII (adaptador) → PHY (codificación y señal) → MDI + medio (conector y cable). La nomenclatura indica velocidad (Mb/s), BASE (banda base) y medio.',
      bullets: [
        '10BASE5 (Thick, 50 Ω): bus coaxial hasta 500 m, marcas cada 2,5 m, hasta 100 equipos, transceptor externo + cable AUI. 10BASE2 (RG-58 fino): 185 m, BNC en T, hasta 30 equipos, falla compartida.',
        'Regla clásica con repetidores (Capa 1): máx 2,5 km entre dos transceptores y máx 4 repetidores en la ruta para respetar 2τ.',
        '10BASE-T (802.3i): 2 pares Cat 3+, 100 m, estrella (hub o switch), codificación Manchester (transición al centro = autorreloj, hasta 20 Mbaud).',
        '100BASE-TX (802.3u, 1995): 2 pares Cat 5+, 100 m, 4B/5B + NRZI + MLT-3 (125 MBd), autonegociación, tiempo de bit pasa de 100 ns a 10 ns (diámetro ÷10 en half). 100BASE-FX: 2 fibras multimodo (412 m half / 2 km full).',
        'Gigabit Ethernet: 1000BASE-X (802.3z, 1998) usa 8B/10B (1250 MBd) con SFP+LC en SX (MMF 850 nm < 550 m), LX (MMF/SMF 1310 nm < 10 km) y CX (STP < 25 m). 1000BASE-T (802.3ab, 1999) usa 4 pares Cat 5e, PAM-5 + DSP, 250 Mb/s bidireccional simultáneo por par (cancelación de eco).',
        '10 Gigabit (802.3ae, 2002) y posteriores: elimina por completo half-duplex y CSMA/CD. 10GBASE-T usa Cat 6A 100 m, PAM-16 con 128-DSQ y LDPC; fibra SR/LR/ER (64B/66B, 300–400 m / 10 km / 40 km). 40/100/400/800G agregan lanes paralelos (802.3df).',
        'Autonegociación (3 pasos): (1) anunciar capacidades por pulsos de enlace; (2) elegir capacidad común de mayor prioridad; (3) configurar (incluye master/slave en 1000BASE-T). Si falla un lado fijo en full y otro cae a half ocurre duplex mismatch.'
      ],
      trap: 'Trampa frecuente: 1000BASE-T usa 4 pares Cat 5e (no "solo Cat 6" ni 2 pares). 10BASE-T es Cat 3+ (no coaxil ni 4B/5B).',
      diagramTab: 'eth-arch',
      terms: ['PHY, RS/xMII, MDI', 'Nomenclatura (ej. 1000BASE-T)', 'Manchester', '4B/5B, MLT-3, NRZI', '8B/10B', 'PAM-5 / PAM-16', 'Autonegociación', 'Duplex mismatch']
    },
    {
      id: 'n-3-3',
      unit: 'u3',
      section: '3.3–3.4',
      title: 'La trama Ethernet, direcciones MAC y CSMA/CD en detalle',
      summary: 'Orden en el cable: Preámbulo (7 B 0x55) · SFD (1 B 0xD5) · MAC Destino (6 B) · MAC Origen (6 B) · [802.1Q (4 B)] · Longitud/Tipo (2 B) · Datos + pad (46–1500 B) · FCS (4 B), separados por un IFG de 96 bit-times.',
      bullets: [
        'Conteo de trama: 64 a 1518 B (1522 B con etiqueta 802.1Q, envelope IEEE hasta 2000 B, jumbo frames ~9000 B). Preámbulo (6,4 µs de onda cuadrada 10 MHz en Manchester), SFD e IFG NO forman parte del conteo ni del FCS.',
        'Direcciones MAC (48 bits): 24 bits OUI (IEEE) + 24 bits fabricante; primer bit transmitido (LSB del 1.er octeto) = I/G (0 unicast, 1 multicast 01:00:5E:... / broadcast FF:FF:FF:FF:FF:FF); segundo bit = U/L (universal/local).',
        'Length/Type (umbral 0x0600 = 1536): ≤ 1500 indica longitud de carga (IEEE 802.3 + cabecera LLC de 8 B / SNAP); 1501–1535 no definido; ≥ 1536 indica EtherType (0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6). Unificado en 1997.',
        'Padding y MTU: carga mínima 46 B (baja a 42 B con 802.1Q) para alcanzar 64 B (512 bits); MTU 1500 B nació en 1978 por el costo de la RAM del transceptor. El protocolo superior (p. ej. IP) debe indicar su propia longitud para ignorar el pad.',
        'FCS (CRC-32): se calcula desde MAC Destino hasta el final de Datos/Pad. Ethernet es no orientado a conexión, sin confirmaciones ni corrección: detecta y descarta.',
        'Slot time por velocidad: 10 Mb/s → 512 bit-times (51,2 µs); 100 Mb/s → 512 bit-times (5,12 µs); 1 Gb/s half-duplex → 4096 bit-times (4,096 µs) usando extensión de portadora (512 B) y ráfagas de tramas para conservar ~200 m de diámetro.'
      ],
      diagramTab: 'ethernet',
      terms: ['Preámbulo (7 B) y SFD (1 B)', 'Dirección MAC', 'Bit I/G y bit U/L', 'Unicast, multicast y broadcast', 'Length/Type', 'Padding', 'FCS', 'MTU (1500 B)', 'Etiqueta 802.1Q', 'Jumbo frame', 'IFG', 'LLC/SNAP', 'Extensión de portadora y ráfagas de tramas']
    },

    /* ---------- UNIDAD 4 ---------- */
    {
      id: 'n-4-1',
      unit: 'u4',
      section: '4.1–4.2',
      title: 'Switches, backplane, tabla MAC y puentes entre LANs',
      summary: 'El switch de Capa 2 analiza, filtra y separa: cada puerto crea su propio dominio de colisión independiente. Su backplane interno permite múltiples conmutaciones simultáneas con buffers para encolar colisiones de salida y mezclar velocidades (10/100/1000).',
      bullets: [
        'Capas de dispositivos (Tanenbaum 4.7.4): Repetidor y Hub (Capa 1, no entienden tramas, 1 dominio de colisión); Puente/Switch (Capa 2, decide por MAC destino; "switch" es el nombre moderno de "puente"); Access Point (Capas 1 y 2, puente inalámbrico 802.1D); Router (Capas 1, 2 y 3, decide por IP).',
        'Seguridad: en un hub una NIC en modo promiscuo captura todo; en un switch el tráfico unicast va solo al puerto destino (aunque cifrar sigue siendo necesario).',
        'Aprendizaje hacia atrás (switch transparente): mira la MAC de origen de cada trama entrante para asociarla al puerto con marca de tiempo, y purga entradas tras unos minutos de inactividad.',
        'Regla de reenvío: mismo puerto que origen → descarta (filtra); otro puerto conocido → reenvía allí; desconocido o broadcast → inunda por todos menos el de entrada.',
        '4 motivos para unir LANs con puentes (Tanenbaum 4.7.1): (1) autonomía departamental; (2) distancia física entre edificios; (3) carga/capacidad (dos LAN duplican ancho de banda); (4) confiabilidad/cortafuegos frente a nodos defectuosos.'
      ],
      trap: 'El switch NO intercambia mensajes hello ni usa IP. Un Access Point NO es de Capa 3.',
      diagramTab: 'switching',
      terms: ['Hub / repetidor', 'Switch / puente', 'Dominio de colisión', 'Backplane', 'Tabla MAC', 'Aprendizaje hacia atrás', 'Inundación y filtrado']
    },
    {
      id: 'n-4-3',
      unit: 'u4',
      section: '4.3–4.5',
      title: 'Store-and-forward, STP (802.1D), VLAN (802.1Q) y PoE',
      summary: 'La conmutación moderna balancea latencia vs integridad (store-and-forward vs cut-through), evita bucles L2 con Spanning Tree, segmenta dominios de broadcast con VLANs y alimenta equipos por el mismo cable con PoE.',
      bullets: [
        'Store-and-forward (recibe toda la trama, valida FCS, descarta dañadas, mayor latencia) vs Cut-through (reenvía al leer MAC destino, menor latencia, puede propagar tramas corruptas).',
        'STP (IEEE 802.1D): intercambia BPDUs para elegir al puente raíz (menor Bridge ID) y dejar una topología activa en árbol sin lazos, bloqueando enlaces redundantes ("B" vs Root Port "RP"). Si cae un enlace, recalcula.',
        'Estados STP en orden: Disabled → Blocking → Listening (solo BPDUs) → Learning (aprende MACs sin reenviar) → Forwarding (aprende y reenvía).',
        'VLAN (IEEE 802.1Q): partición lógica de Capa 2 (un dominio de broadcast por VLAN) agregando tag de 4 B (trama máx 1522 B). El primer switch VLAN agrega la etiqueta y el último la quita para mantener compatibilidad con los hosts. Comunicar VLANs distintas exige un router (Capa 3).',
        'PoE: corriente continua sobre pares trenzados desde un PSE (switch/inyector) hacia un PD (AP, cámara, VoIP). 802.3af (Tipo 1): 15,4 W PSE / 12,95 W PD; PoE+ 802.3at (Tipo 2): 30 W PSE / 25,5 W PD. Verificar siempre el presupuesto total de potencia del switch.'
      ],
      trap: '802.1D = STP (evita bucles, NO acelera switches). 802.1X = autenticación por puerto. 802.1Q = VLAN (NO es sinónimo de SDN).',
      diagramTab: 'switching',
      terms: ['Store-and-forward / cut-through', 'STP (802.1D) y BPDU', 'Puente raíz / puerto raíz', 'Estados de puerto STP', 'VLAN (802.1Q)', 'PoE (PSE y PD)']
    },

    /* ---------- UNIDAD 5 ---------- */
    {
      id: 'n-5-1',
      unit: 'u5',
      section: '5.1–5.2',
      title: 'Wi-Fi 802.11: arquitectura, bandas, dBm, OFDM, MIMO, ax y ESP32',
      summary: 'Como Ethernet, 802.11 mantiene una MAC sobre múltiples capas físicas y brinda un servicio de mejor esfuerzo. Las tasas nominales son máximos PHY: el goodput real es mucho menor por contienda half-duplex, sobrecarga y atenuación.',
      bullets: [
        'Arquitectura: Modo infraestructura (STAs asociadas a un AP formando un BSS conectado al DS; nombre = SSID, BSSID = MAC del AP) vs Ad hoc (IBSS sin AP).',
        'Bandas: ISM (2,4 GHz, canales de 5 MHz de paso ⇒ 1, 6 y 11 sin solapar; interferencia de microondas) y U-NII (5 y 6 GHz). Sin licencia ≠ sin regulación: DFS en 5 GHz obliga a detectar radares y cambiar de canal si aparece uno.',
        'OFDM: 802.11a usa FFT de 64 puntos con 52 subportadoras activas (48 datos + 4 pilotos) y prefijo cíclico contra multitrayectoria. 802.11n (1×1, MCS 0–7, 40 MHz, GI corto) llega a 150 Mb/s PHY.',
        'MIMO y Beamforming: diversidad espacial (robustez) vs multiplexación espacial (flujos distintos = más tasa); SU-MIMO vs MU-MIMO (DL en ac; DL+UL y hasta 8 flujos en ax). Beamforming pondera fase y amplitud para sumar energía hacia el cliente sin crear potencia adicional.',
        '802.11ax (Wi-Fi 6 / 6E en 5925–7125 MHz): OFDMA reparte subportadoras en RUs (p. ej. 9 RU de 26 tonos en 20 MHz) coordinando UL con trigger frame; 1024-QAM (+25% sobre 256-QAM); Δf pasa de 312,5 a 78,125 kHz y símbolo útil de 3,2 a 12,8 µs (FFT 256/512/1024/2048); BSS Coloring (1–63) y doble NAV.',
        'Caso ESP32: el clásico es Wi-Fi 4 (802.11b/g/n) 2,4 GHz 1×1; roles: STA, SoftAP, STA+SoftAP (misma radio y canal, no lo vuelve router solo) y modo promiscuo. Chips recientes: ESP32-C6 (b/g/n/ax en 2,4 GHz) y ESP32-C5 (a/b/g/n/ac/ax en 2,4 y 5 GHz).'
      ],
      formulas: [
        'dB = 10·log₁₀(P₂/P₁) · P(dBm) = 10·log₁₀(P(mW)) ⇒ 0 dBm = 1 mW, 10 dBm = 10 mW, 20 dBm = 100 mW',
        'dBi: ganancia respecto a antena isotrópica (5 dBi ≈ 3,16×) · Presupuesto: Pr = Pt + Gt + Gr − L_prop − L_otras'
      ],
      diagramTab: 'wifi-deep',
      terms: ['STA, AP', 'BSS, IBSS, DS', 'SSID / BSSID', 'ISM / U-NII', 'Canales 1, 6 y 11', 'DFS', 'dB, dBi, dBm', 'Presupuesto de enlace', 'OFDM', 'QAM', 'MIMO', 'SU-MIMO / MU-MIMO', 'Beamforming', 'OFDMA', 'BSS Coloring', 'Wi-Fi 4, 5, 6 y 6E']
    },
    {
      id: 'n-5-3',
      unit: 'u5',
      section: '5.3–5.4',
      title: 'MAC 802.11 (DCF, PCF, EDCA), servicios del AP y Beacon',
      summary: 'La MAC de 802.11 (DFWMAC) combina acceso distribuido DCF (CSMA/CA) con un modo centralizado PCF casi sin uso. El AP actúa como puente L2: dos clientes del mismo BSS intercambian datos normalmente en dos saltos de radio (salvo TDLS).',
      bullets: [
        'DCF: esperar DIFS → descontar backoff entero en [0, CW] solo en ranuras libres (se congela si se ocupa el medio) → transmitir → ACK tras SIFS. Ante fallo: CW ← min[2(CW+1)−1, CWmax]; tras éxito vuelve a CWmin.',
        'Espaciados: SIFS (más corto: ACK, CTS, fragmentos) < PIFS (PCF) < DIFS (contienda DCF) < EIFS (tras trama defectuosa).',
        'EDCA (802.11e, QoS estadística sin garantía absoluta): 4 categorías con AIFS = SIFS + AIFSN × SlotTime: AC_VO (CWmin 3, AIFSN 2), AC_VI (7, 2), AC_BE (15, 3), AC_BK (15, 7). TXOP asigna una ventana temporal para evitar la "anomalía de la tasa" (ej. 6 vs 54 Mb/s).',
        'Fiabilidad y energía: con p = 10⁻⁴ una trama de 12.144 bits tiene < 30% de llegar intacta (vs ~2/3 en 4048 bits) ⇒ bajar modulación o fragmentar (stop-and-wait en ráfaga). Los clientes duermen y el AP bufea tráfico anunciándolo con TIM/DTIM.',
        'Servicios del AP (8 funciones): anuncio (Beacon), asociación/reasociación (handover)/desasociación, seguridad, sincronización TSF, QoS (EDCA/TXOP), ahorro de energía (TIM/DTIM), distribución/integración (802.11↔Ethernet) y radio.',
        'Beacon: trama de gestión subtipo 8 (1000₂), broadcast cada 100 TU (1 TU = 1024 µs ⇒ 102,4 ms). Anuncia SSID (si no está oculto), BSSID, tasas/PHY, TSF, canal, RSN y TIM/DTIM.'
      ],
      trap: 'DCF NO es sinónimo de modo infraestructura (también funciona en ad hoc). 802.11a (5 GHz) NO es compatible con 802.11g (2,4 GHz).',
      diagramTab: 'wifi-deep',
      terms: ['DCF', 'Backoff 802.11', 'PCF', 'EDCA, AC, AIFS, TXOP', 'SIFS / PIFS / DIFS / EIFS', 'Beacon', 'TU, TSF', 'TIM / DTIM', 'Probe Request', 'Modo infraestructura / ad hoc', 'Asociación, reasociación, desasociación']
    },
    {
      id: 'n-5-5',
      unit: 'u5',
      section: '5.5–5.6',
      title: 'Trama MAC 802.11 (3 y 4 dir.) y Seguridad (WEP a WPA3-SAE)',
      summary: 'La cabecera base 802.11 mide 24 bytes (3 direcciones), sube a 26 B en QoS Data, a 30 B en WDS (4 direcciones) o 32 B con ambos. En seguridad, conectarse (Open System + Asociación) es previo a autenticar credenciales (4-Way Handshake / SAE).',
      bullets: [
        'Frame Control (2 B): Versión (2b), Type (2b: 00 Gestión, 01 Control, 10 Datos), Subtype (4b) y 8 flags (To DS, From DS, Más fragmentos, Reintentar, Energía, Más datos, Protegida, Orden).',
        'Otros campos: Duration (2 B, para NAV en todos los tipos), Sequence Control (2 B: 4b fragmento + 12b secuencia anti-duplicados), cuerpo hasta 2312 B (empieza con cabecera LLC) y FCS (4 B).',
        '4 roles de dirección: RA/TA (salto de radio) y DA/SA (extremos lógicos). (0,0) Ad hoc: RA=DA, TA=SA, BSSID. (1,0) STA→AP→LAN: BSSID, TA=SA, DA. (0,1) LAN→AP→STA: RA=DA, BSSID, SA. (1,1) WDS: RA, TA, DA, SA.',
        'WEP Shared Key (roto): (1) STA pide auth; (2) AP manda desafío en claro; (3) STA cifra con WEP (RC4 + IV 24b); (4) AP compara. Texto claro + cifrado revelan el keystream para ese IV. WPA usó TKIP (obsoleto).',
        'WPA2-Personal: PMK derivada de passphrase + SSID. El 4-Way Handshake nunca envía la clave: (1) AP→STA ANonce; (2) STA→AP SNonce + MIC; (3) AP→STA confirmación + GTK cifrada + MIC; (4) STA→AP ACK + MIC. Deriva PTK (unicast) y GTK (grupo).',
        'Enterprise (802.1X/EAP/RADIUS): STA suplicante, AP autenticador y servidor RADIUS; permite credenciales individuales/certificados. WPA3-Personal usa SAE (acuerdo autenticado resistente a diccionario offline) + PMF obligatorio + AES-CCMP/GCMP.'
      ],
      diagramTab: 'wifi-deep',
      terms: ['Frame Control / Duration / Sequence', 'Tipos de trama (802.11)', 'To DS / From DS', 'RA, TA, DA, SA', 'WDS', 'Open System', 'WEP, WPA, WPA2, WPA3', 'PMK, PTK, GTK', '4-Way Handshake', '802.1X / EAP / RADIUS', 'SAE', 'CCMP / GCMP / TKIP', 'PMF']
    },

    /* ---------- UNIDAD 6 ---------- */
    {
      id: 'n-6-1',
      unit: 'u6',
      section: '6.1–6.5',
      title: 'Capa de red: servicios, MTU y cabecera del datagrama IPv4',
      summary: 'Las MAC son planas y no escalan a nivel global; IP introduce direccionamiento jerárquico (red + host) como códigos postales para dar conectividad y selección de ruta entre redes distintas sirviendo a la capa de transporte.',
      bullets: [
        'Ejemplos históricos no-IP mencionados: NetBIOS (nombres Microsoft sin IP) y DLC (IBM AS/400).',
        'Conmutación de paquetes: Datagramas (IP, no orientado a conexión, sin estado en routers, cada paquete se enruta independiente) vs Circuitos Virtuales (MPLS/telefonía, 3 etapas, número corto de VC, estado en cada nodo, un router caído tira todos sus VC).',
        'MTUs típicas: Ethernet 1500 B, PPPoE 1492 B, ATM AAL5 9180 B, FDDI 4470 B, PPP 576 B, 802.11 hasta 2272 B de carga (IP permite hasta 65.515 B de datos). Path MTU se descubre con bit DF = 1.',
        'Cabecera IPv4 (20–60 B, RFC 791): Versión (4b), IHL (4b en palabras de 32b: 5..15), TOS/DS+ECN (8b: 6b DiffServ + 2b ECN), Longitud Total (16b, máx 65.535 B), Identificación (16b), Flags (3b: 0, DF, MF), Offset (13b en unidades de 8 B), TTL (8b), Protocolo (8b: capa 4), Checksum (16b, solo cabecera), IP origen/destino (32b c/u) y Opciones+relleno.'
      ],
      trap: 'La capa de red sirve a la capa de TRANSPORTE. PROTOCOL en IPv4 indica protocolo de capa 4 (no capa 2). El TTL lo decrementa cada ROUTER (no los switches) y quien reensambla fragmentos es solo el HOST DESTINO.',
      diagramTab: 'ip-lab',
      terms: ['Capa de red', 'Direccionamiento plano / jerárquico', 'Paquete / datagrama', 'Conmutación de paquetes / circuito virtual', 'Cabecera IPv4', 'TTL', 'Fragmentación (DF, MF, offset)']
    },
    {
      id: 'n-6-6',
      unit: 'u6',
      section: '6.6–6.7',
      title: 'IPv4, CIDR, Subnetting, NAT y el viaje por el Router',
      summary: 'Una dirección IPv4 de 32 bits identifica a una interfaz de red (un router tiene varias). Aplicar AND entre IP y máscara separa prefijo de red y host; los routers aplican coincidencia del prefijo más largo.',
      bullets: [
        'Clases históricas (pre-1993): A (0, /8, 1–126; 127.0.0.0/8 loopback), B (10, /16, 128–191), C (110, /24, 192–223), D (1110, multicast 224–239), E (1111, reservada 240–255). El "problema de los tres osos" llevó a CIDR y VLSM.',
        'CIDR y VLSM: prefijos /n variables, agregación de rutas (supernetting) y subredes que reducen dominios de broadcast L3 (ej. /16 dividido en /17, /18 y /19; o 192.228.17.57/27 → red .32, subred 1, host 25, 30 hosts útiles).',
        'Privadas (no enrutables en Internet): 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. Especiales: 0.0.0.0 (este host/default), 127.0.0.1 (loopback), 255.255.255.255 (broadcast limitado). Públicas gestionadas por ICANN → ARIN / LACNIC.',
        'NAT/PAT: traduce IP privadas + puertos origen TCP/UDP (capa 4) a una IP pública. Vuelve con estado al router, viola el modelo de capas y bloquea conexiones entrantes salvo port forwarding manual, uPnP o TURN.',
        'Router y regla de oro: "El paquete no cambia; la trama sí." Un host hace AND con su máscara: si es local envía directo (ARP al destino); si es remoto manda al gateway (ARP al gateway). Los hosts envían pero NO reenvían paquetes. Enrutamiento: redes conectadas, estáticas o dinámicas (Distancia administrativa; Vector Distancia Bellman-Ford RIP/IGRP vs Estado del Enlace Dijkstra OSPF/IS-IS). Se distinguen redes de host y redes de paso.'
      ],
      diagramTab: 'ip-lab',
      terms: ['IPv4', 'Máscara y prefijo (/n)', 'Dirección de red y de broadcast', 'Hosts utilizables', 'Clases A, B, C, D, E', 'CIDR', 'Subred / subnetting', 'VLSM', 'Supernetting / agregación', 'Prefijo más largo', 'IP privadas y públicas', 'IP estática y dinámica', 'Loopback (127.0.0.0/8)', 'Broadcast limitado y dirigido', 'Gateway / ruta por defecto', 'Router', 'El paquete no cambia, la trama sí', 'Tabla de rutas', 'Red de paso / red de host', 'Ruta conectada, estática y dinámica', 'Distancia administrativa', 'Vector distancia / estado del enlace', 'Lazo de enrutamiento', 'NAT / PAT', 'Port forwarding, uPnP']
    },
    {
      id: 'n-6-8',
      unit: 'u6',
      section: '6.8–6.9',
      title: 'ARP, DHCP, ICMP, IGMP e IPv6',
      summary: 'Los protocolos complementarios resuelven direcciones locales (ARP/RARP), automatizan configuración (BOOTP/DHCP), reportan errores y diagnósticos (ICMP) y gestionan multicast (IGMP). IPv6 amplía el espacio a 128 bits y simplifica la cabecera.',
      bullets: [
        'ARP: resuelve IP → MAC por broadcast L2 en la LAN; caché en memoria (~20 min, comando arp). Incluye optimización IP–MAC del emisor, ARP gratuito (detecta IP duplicada al arrancar) y Proxy ARP (router responde con su MAC por otro segmento). RARP (códigos 3/4): MAC → IP para estaciones sin disco.',
        'DHCP (evolución de BOOTP, sobre UDP): asignación dinámica temporal (lease) con renovación mediante DISCOVER → OFFER → REQUEST → ACK (DORA); el DHCP Relay reenvía solicitudes entre redes. Configura IP, máscara, gateway y DNS.',
        'ICMP (sobre IP, no confiable): cabecera de 64 bits (Tipo 8b, Código 8b, Checksum 16b, Parámetros 32b) + cabecera IP y primeros 64 bits del paquete original. Tipos: Echo/Reply (ping), Time Exceeded (TTL=0, base de traceroute), Destination Unreachable (incluye DF=1), Redirect, Parameter Problem, Source Quench, Router Adv/Sol. IGMP gestiona grupos multicast.',
        'IPv6 (1998, ~25% Internet; últimas IPv4 asignadas el 25/11/2019): 128 bits (≈ 3×10³⁸). 8 grupos hex de 16 bits; se omiten ceros a la izquierda y una sola secuencia de ceros con "::" (también ::192.31.20.46).',
        'Especiales IPv6: ::/128 (sin dirección), ::1/128 (loopback), ::ffff:0:0/96 (IPv4 mapeada), fe80::/10 (link-local), fc00::/7 (ULA privada).',
        'Cabecera fija de 40 B: Versión (4b), Clase tráfico (8b), Etiqueta de flujo (20b), Long. datos (16b), Cabecera siguiente (8b), Límite de saltos (8b) e IPs 128b. Desaparecen IHL, Checksum de cabecera y fragmentación en routers (Path MTU mín = 1280 B). Broadcast reemplazado por multicast; ARP reemplazado por NDP; autoconfiguración por SLAAC o DHCPv6.'
      ],
      diagramTab: 'ip-lab',
      terms: ['ARP y caché ARP', 'Proxy ARP / ARP gratuito', 'RARP, BOOTP, DHCP', 'DISCOVER / OFFER / REQUEST / ACK', 'ICMP', 'IGMP', 'IPv6', 'Notación IPv6', 'Direcciones IPv6 especiales', 'Cabecera IPv6 (campos)', 'NDP']
    }
  ];

  /* ==================== 4. TABLAS COMPARATIVAS COMPLETAS (SECCIÓN 11 + TABLAS CLAVE DEL CUERPO) ==================== */
  App.TABLES_DATA = [
    {
      id: 't-2-2',
      code: 'Tabla 2.2',
      unit: 'u2',
      title: 'Familias de protocolos MAC',
      caption: 'Clasificación general de estrategias de reparto de un medio compartido.',
      headers: ['Familia', 'Idea central', 'Ejemplos'],
      rows: [
        ['Canalización', 'Se reparte el canal de forma previa', 'FDM, TDM, CDM'],
        ['Acceso aleatorio', 'Se transmite cuando hace falta y se resuelven las colisiones', 'ALOHA, CSMA, CSMA/CD, CSMA/CA'],
        ['Acceso controlado', 'Se otorga permiso explícito para transmitir', 'Polling, token passing'],
        ['Contención limitada', 'Se mezclan etapas de contención y reserva', 'Variantes híbridas']
      ]
    },
    {
      id: 't-11-1',
      code: 'Tabla 11.1',
      unit: 'u2',
      title: 'Protocolos de acceso aleatorio al medio',
      caption: 'Comparativa integral de sensado, detección de colisiones, rendimiento y uso.',
      headers: ['Protocolo', '¿Sensa?', '¿Detecta colisión?', 'Idea', 'Rendimiento o rasgo clave', 'Dónde se usa'],
      rows: [
        ['ALOHA puro', 'No', 'No (ACK y timeout)', 'Transmite apenas tiene trama; si no hay ACK espera tiempo aleatorio', 'Vulnerable 2T; S = G·e^(−2G), máx 18,4% (G = 0,5)', 'Radio original (ALOHAnet)'],
        ['ALOHA ranurado', 'No', 'No', 'Solo empieza a transmitir al inicio de un slot global', 'Vulnerable T; S = G·e^(−G), máx 36,8% (G = 1); exige sincronización', 'Acceso por cable, redes de radio'],
        ['CSMA 1-persistente', 'Sí', 'No', 'Sigue escuchando si está ocupado y transmite apenas se libera (prob. 1)', 'Agresivo; efecto estampida al liberarse el canal', 'Base de Ethernet clásico'],
        ['CSMA no persistente', 'Sí', 'No', 'Si está ocupado espera tiempo aleatorio y vuelve a sensar', 'Menos colisiones, más demora y tiempo ocioso', 'Teórico'],
        ['CSMA p-persistente', 'Sí', 'No', 'Canal ranurado: al liberarse transmite con probabilidad p', 'p grande: menos demora, más colisiones; p chico: lo contrario', 'Teórico (802.11 usa refinamiento)'],
        ['CSMA/CD', 'Sí', 'Sí (mientras transmite)', 'Detecta colisión, envía jam, aborta y aplica backoff exponencial binario', 'Trama mínima ≥ 2τ (slot time 512 bit-times en 10/100 Mb/s)', 'Ethernet compartido (coaxial, hubs)'],
        ['CSMA/CA', 'Sí', 'No (infiere por falta de ACK)', 'Backoff previo, ACK por trama y RTS/CTS opcional con NAV', 'Ayuda frente a terminales ocultas (RTS/CTS); más lento', 'WLAN 802.11 (DCF)']
      ]
    },
    {
      id: 't-11-2',
      code: 'Tabla 11.2',
      unit: 'u2',
      title: 'CSMA/CD frente a CSMA/CA',
      caption: 'Diferencias arquitectónicas entre acceso aleatorio cableado e inalámbrico.',
      headers: ['Aspecto', 'CSMA/CD', 'CSMA/CA'],
      rows: [
        ['Medio', 'Cable compartido (Ethernet clásico)', 'Radio (802.11)'],
        ['Filosofía', 'Detectar y abortar la colisión', 'Evitar la colisión antes de transmitir'],
        ['Mientras transmite', 'Escucha el medio', 'No puede escuchar (half-duplex)'],
        ['Confirmación', 'No hay ACK por trama en la MAC clásica', 'ACK por trama (parte del mecanismo)'],
        ['Reserva del canal', 'No', 'RTS/CTS y NAV (opcional)'],
        ['Esperas', 'Backoff exponencial tras la colisión', 'DIFS + backoff aleatorio congelable'],
        ['Problemas propios', 'Slot time, trama mínima (64 B), diámetro de red', 'Terminales ocultas/expuestas, sobrecarga']
      ]
    },
    {
      id: 't-3-4',
      code: 'Tabla 3.4',
      unit: 'u3',
      title: 'Slot time según velocidad Ethernet (half-duplex)',
      caption: 'Relación entre tasa nominal, bit-times y duración de la ventana de colisión.',
      headers: ['Velocidad', 'Slot time', 'Duración', 'Notas'],
      rows: [
        ['10 Mb/s', '512 bit-times (64 B)', '51,2 µs', 'Diámetro clásico ~2,5 km (hasta 4 repetidores)'],
        ['100 Mb/s (Fast)', '512 bit-times (64 B)', '5,12 µs', 'Diámetro reducido ÷10 (~200 m)'],
        ['1 Gb/s half-duplex', '4096 bit-times (512 B)', '4,096 µs', 'Extensión de portadora y ráfagas de tramas (~200 m); en full-duplex no aplica']
      ]
    },
    {
      id: 't-11-3',
      code: 'Tabla 11.3',
      unit: 'u3',
      title: 'Versiones físicas de Ethernet (IEEE 802.3)',
      caption: 'La trama y direcciones MAC se mantienen en toda la familia; desde 10G desaparece CSMA/CD.',
      headers: ['Norma', 'Tasa', 'Medio', 'Codificación', 'Alcance', 'Notas'],
      rows: [
        ['10BASE5', '10 Mb/s', 'Coaxial grueso 50 Ω', 'Manchester', '500 m', 'Bus con terminadores; transceptor AUI; ≤ 100 equipos'],
        ['10BASE2', '10 Mb/s', 'Coaxial fino RG-58', 'Manchester', '185 m', 'BNC en T; ≤ 30 equipos; corte tira todo el bus'],
        ['10BASE-T (802.3i)', '10 Mb/s', '2 pares Cat 3+', 'Manchester', '100 m', 'Estrella con hub o switch; Half/Full'],
        ['100BASE-TX (802.3u)', '100 Mb/s', '2 pares Cat 5+', '4B/5B + NRZI/MLT-3', '100 m', '125 MBd; autonegociación; misma trama'],
        ['100BASE-FX', '100 Mb/s', 'Fibra multimodo (2 fibras)', '4B/5B + NRZI', '412 m half / 2 km full', 'Inmune a EMI'],
        ['1000BASE-SX/LX/CX (802.3z)', '1 Gb/s', 'Fibra o cobre corto STP', '8B/10B (1250 MBd)', 'SX < 550 m, LX < 10 km, CX < 25 m', 'Óptica modular SFP + LC'],
        ['1000BASE-T (802.3ab)', '1 Gb/s', '4 pares Cat 5e', 'PAM-5 + DSP', '100 m', '250 Mb/s por par en ambos sentidos (eco)'],
        ['10GBASE-T', '10 Gb/s', '4 pares Cat 6A', 'PAM-16 + LDPC', '100 m', 'Solo full-duplex; 128-DSQ'],
        ['10GBASE-SR/LR/ER (802.3ae)', '10 Gb/s', 'Fibra MMF / SMF', '64B/66B', '300–400 m / 10 km / 40 km', 'Centros de datos; sin CSMA/CD']
      ]
    },
    {
      id: 't-11-4',
      code: 'Tabla 11.4',
      unit: 'u4',
      title: 'Dispositivos de red por capa, dominios y modo de switch',
      caption: 'Incluye el Access Point (puente inalámbrico 802.1D) y modos de reenvío.',
      headers: ['Dispositivo', 'Capa OSI', 'Decide por', 'Dominios de colisión', 'Dominios de broadcast'],
      rows: [
        ['Repetidor', '1', 'Nada: regenera la señal', 'Extiende el mismo', 'El mismo'],
        ['Hub', '1', 'Nada: repite por todos los puertos', 'Uno solo para todos', 'Uno solo'],
        ['Puente / Switch', '2', 'MAC destino (Tabla MAC)', 'Uno por puerto', 'Uno (se separa con VLAN)'],
        ['Access Point (AP)', '1 y 2 (puente 802.1D)', 'Dirección MAC', 'Las STA de un BSS comparten el canal', 'Uno por BSS/SSID (según config.)'],
        ['Router', '3', 'IP destino (Tabla de rutas)', 'Uno por interfaz', 'Uno por interfaz']
      ]
    },
    {
      id: 't-4-5',
      code: 'Tabla 4.3 & 4.5',
      unit: 'u4',
      title: 'Store-and-forward vs Cut-through y PoE (802.3af / at)',
      caption: 'Compromiso latencia/validación en switches y límites eléctricos PoE.',
      headers: ['Tecnología / Modo', 'Parámetro 1', 'Parámetro 2', 'Observación clave'],
      rows: [
        ['Switch Store-and-forward', 'Reenvía al recibir trama completa', 'Comprueba FCS (CRC-32)', 'Mayor latencia; descarta tramas dañadas'],
        ['Switch Cut-through', 'Reenvía al leer MAC destino', 'No espera el FCS', 'Menor latencia; puede propagar basura'],
        ['PoE 802.3af (Tipo 1)', 'Máx PSE: 15,4 W', 'Mín PD: 12,95 W', 'Diferencia se disipa en el cable'],
        ['PoE+ 802.3at (Tipo 2)', 'Máx PSE: 30 W', 'Mín PD: 25,5 W', 'Verificar presupuesto total del switch']
      ]
    },
    {
      id: 't-11-5',
      code: 'Tabla 11.5',
      unit: 'u5',
      title: 'Estándares IEEE 802.11 (Wi-Fi)',
      caption: 'Evolución física de 802.11b hasta Wi-Fi 6 y 6E.',
      headers: ['Norma', 'Nombre', 'Banda', 'Aporte principal', 'Dato útil'],
      rows: [
        ['802.11b', '—', '2,4 GHz', 'Primera ampliación comercial', 'Hasta 11 Mb/s'],
        ['802.11a', '—', '5 GHz', 'OFDM (48 datos + 4 pilotos)', '54 Mb/s; NO compatible con b/g'],
        ['802.11g', '—', '2,4 GHz', 'OFDM en 2,4 GHz', '54 Mb/s; compatible con b'],
        ['802.11n', 'Wi-Fi 4', '2,4 y 5 GHz', 'MIMO, canales 40 MHz', '150 Mb/s PHY por flujo (40 MHz, MCS 7, GI corto)'],
        ['802.11ac', 'Wi-Fi 5', '5 GHz', '256-QAM, DL MU-MIMO', 'Beamforming; solo 5 GHz'],
        ['802.11ax', 'Wi-Fi 6 / 6E', '2,4, 5 y 6 GHz', 'OFDMA, 1024-QAM, MU-MIMO UL/DL, BSS Coloring', 'Hasta 8 flujos; Δf 78,125 kHz; 6E añade 5925–7125 MHz']
      ]
    },
    {
      id: 't-11-6',
      code: 'Tabla 11.6 & 5.3',
      unit: 'u5',
      title: 'DCF, PCF, EDCA y categorías de acceso (802.11e)',
      caption: 'Mecanismos de coordinación y parámetros por categoría (AIFS = SIFS + AIFSN × SlotTime).',
      headers: ['Mecanismo / AC', 'Control / Tráfico', 'Acceso / CWmin', 'Espaciado / AIFSN', 'Garantías / Uso'],
      rows: [
        ['DCF', 'Distribuido (compiten todos)', 'CSMA/CA con backoff congelable', 'DIFS', 'Base actual (también en infraestructura); sin garantías'],
        ['PCF', 'Centralizado por AP (polling)', 'El AP sondea estaciones', 'PIFS', 'Casi no se usa en la práctica; garantías teóricas'],
        ['EDCA', 'Distribuido con prioridades', '4 categorías (AC) + TXOP', 'AIFS por categoría', 'Extensión 802.11e; QoS estadística (no absoluta)'],
        ['AC_VO (EDCA)', 'Voz', 'CWmin = 3', 'AIFSN = 2', 'Máxima prioridad estadística'],
        ['AC_VI (EDCA)', 'Video', 'CWmin = 7', 'AIFSN = 2', 'Alta prioridad; TXOP mitiga anomalía de la tasa'],
        ['AC_BE (EDCA)', 'Best effort', 'CWmin = 15', 'AIFSN = 3', 'Tráfico general'],
        ['AC_BK (EDCA)', 'Segundo plano', 'CWmin = 15', 'AIFSN = 7', 'Menor prioridad']
      ]
    },
    {
      id: 't-5-4',
      code: 'Tabla 5.4 & 5.5',
      unit: 'u5',
      title: 'Servicios del AP y Matriz de Direcciones 802.11',
      caption: 'Roles de dirección según To DS / From DS y funciones del Access Point.',
      headers: ['To DS / From DS', 'Escenario', 'Address 1', 'Address 2', 'Address 3', 'Address 4'],
      rows: [
        ['To DS = 0, From DS = 0', 'Ad hoc (IBSS) / enlace directo', 'RA = DA', 'TA = SA', 'BSSID', '— (24 B)'],
        ['To DS = 1, From DS = 0', 'Notebook → AP → Servidor LAN', 'RA = BSSID', 'TA = SA', 'DA', '— (24 B)'],
        ['To DS = 0, From DS = 1', 'Servidor LAN → AP → Notebook', 'RA = DA', 'TA = BSSID', 'SA', '— (24 B)'],
        ['To DS = 1, From DS = 1', 'WDS (puente inalámbrico AP–AP)', 'RA', 'TA', 'DA', 'SA (30 B)']
      ]
    },
    {
      id: 't-11-7',
      code: 'Tabla 11.7',
      unit: 'u5',
      title: 'Seguridad inalámbrica (WEP a WPA3)',
      caption: 'Evolución del cifrado, autenticación y vulnerabilidades conocidas.',
      headers: ['Familia', 'Año', 'Cifrado', 'Acceso', 'Estado / Observación'],
      rows: [
        ['WEP', '1997', 'RC4 con IV de 24 bits', 'Shared Key (desafío en claro)', 'Obsoleto, completamente roto'],
        ['WPA', '2003', 'TKIP sobre RC4', 'PSK o 802.1X', 'Solución transitoria; obsoleta'],
        ['WPA2', '2004', 'AES-CCMP', 'PSK (4-Way Handshake) o 802.1X/EAP', 'Vigente; Personal vulnerable a diccionario offline si capturan handshake'],
        ['WPA3', '2018', 'CCMP / GCMP', 'SAE (Personal) o Enterprise; PMF', 'Más seguro: SAE evita diccionario offline y PMF protege gestión']
      ]
    },
    {
      id: 't-11-8',
      code: 'Tabla 11.8',
      unit: 'u6',
      title: 'Direcciones MAC frente a direcciones IP',
      caption: 'Por qué MAC no reemplaza a IP ni viceversa.',
      headers: ['Aspecto', 'MAC (Capa 2)', 'IP (Capa 3)'],
      rows: [
        ['Tamaño', '48 bits (hexadecimal)', '32 bits (IPv4) o 128 bits (IPv6)'],
        ['Estructura', 'Plana (OUI + identificador del fabricante)', 'Jerárquica (prefijo de red + host)'],
        ['Alcance', 'Local al enlace; cambia en cada salto', 'Extremo a extremo; no cambia en el viaje (salvo NAT)'],
        ['Asignación', 'Grabada en la NIC por el fabricante', 'Estática (admin) o dinámica (DHCP)'],
        ['Broadcast', 'FF:FF:FF:FF:FF:FF', 'Limitado 255.255.255.255 o dirigido (última IP de la red)']
      ]
    },
    {
      id: 't-11-9',
      code: 'Tabla 11.9 & 6.4',
      unit: 'u6',
      title: 'Servicios de Capa de Red (Datagramas vs VC) y MTUs',
      caption: 'Comparación de modelos de conmutación de paquetes y límites MTU por tecnología.',
      headers: ['Asunto / Enlace', 'Datagramas (IP) / Valor MTU', 'Circuitos Virtuales (VC) / Detalle'],
      rows: [
        ['Establecimiento', 'No hace falta (sin conexión)', 'Obligatorio (3 etapas: establecer, usar, liberar)'],
        ['Dirección en paquete', 'Origen y destino completos', 'Número corto de circuito virtual'],
        ['Estado en routers', 'Ninguno por conexión', 'Una entrada por circuito en cada router'],
        ['Falla de un router', 'Solo se pierden paquetes en tránsito', 'Se caen todos los circuitos que pasaban por él'],
        ['QoS y congestión', 'Difíciles', 'Más fáciles si se reservan recursos previos'],
        ['MTUs del apunte', 'Ethernet 1500 B · PPPoE 1492 B · PPP 576 B', '802.11 2272 B · FDDI 4470 B · ATM AAL5 9180 B (IP máx datos 65.515 B)']
      ]
    },
    {
      id: 't-11-10',
      code: 'Tabla 11.10',
      unit: 'u6',
      title: 'IPv4 frente a IPv6',
      caption: 'Diferencias de formato, procesamiento en routers y protocolos asociados.',
      headers: ['Aspecto', 'IPv4', 'IPv6'],
      rows: [
        ['Dirección', '32 bits (decimal con puntos)', '128 bits (hex con ":" y una sola vez "::")'],
        ['Cabecera', '20 a 60 bytes, con opciones', 'Fija de 40 bytes; opciones en cabeceras de extensión'],
        ['Checksum', 'Sí (solo de la cabecera)', 'No (eliminado para acelerar routers)'],
        ['Fragmentación', 'La hacen los routers (si DF = 0); reensambla destino', 'Solo el origen (Path MTU ≥ 1280 B); routers no fragmentan'],
        ['TTL / límite', 'TTL', 'Límite de saltos (Hop Limit)'],
        ['Broadcast', 'Sí', 'No (reemplazado por multicast)'],
        ['Resolución MAC', 'ARP', 'NDP (Neighbor Discovery Protocol)'],
        ['Configuración', 'Manual o DHCP', 'Autoconfiguración (SLAAC) o DHCPv6'],
        ['NAT', 'Muy usado por agotamiento', 'No necesario']
      ]
    },
    {
      id: 't-11-11',
      code: 'Tabla 11.11',
      unit: 'u6',
      title: 'Clases históricas IPv4 y direcciones especiales',
      caption: 'Referencias clásicas (hoy reemplazadas por CIDR) y direcciones reservadas.',
      headers: ['Rango / Dirección', 'Clase / Tipo', 'Máscara por defecto / Significado'],
      rows: [
        ['0–127 (bit inicial 0)', 'Clase A', '255.0.0.0 (/8) · 127.0.0.0/8 es loopback'],
        ['128–191 (10)', 'Clase B', '255.255.0.0 (/16) · 16.384 redes de 65.534 hosts'],
        ['192–223 (110)', 'Clase C', '255.255.255.0 (/24) · ~2 millones de redes de 254 hosts'],
        ['224–239 (1110)', 'Clase D', 'Multicast'],
        ['240–255 (1111)', 'Clase E', 'Reservada'],
        ['0.0.0.0 / 127.0.0.1', 'Especiales host', 'Este host o ruta por defecto / Loopback local'],
        ['255.255.255.255 / host=1', 'Broadcast', 'Broadcast limitado (no cruza routers) / Broadcast dirigido de subred'],
        ['10/8, 172.16/12, 192.168/16', 'Privadas (RFC 1918)', 'No enrutables en Internet; requieren NAT para salir'],
        ['::/128, ::1/128, ::ffff:0:0/96, fe80::/10, fc00::/7', 'Especiales IPv6', 'Sin dirección · Loopback · IPv4 mapeada · Link-local · Local única (ULA)']
      ]
    },
    {
      id: 't-11-12',
      code: 'Tabla 11.12',
      unit: 'u6',
      title: 'Protocolos complementarios de IP',
      caption: 'Resolución IP↔MAC, asignación dinámica, control/errores y traducción NAT.',
      headers: ['Protocolo', 'Para qué sirve', 'Detalle operativo'],
      rows: [
        ['ARP', 'IP → MAC', 'Broadcast L2 en la LAN; caché ~20 min; ARP gratuito detecta IP duplicada'],
        ['RARP', 'MAC → IP', 'Inverso de ARP (códigos 3 y 4) para estaciones sin disco'],
        ['Proxy ARP', 'Respuesta por otro', 'El router responde con su propia MAC por hosts de otro segmento'],
        ['BOOTP', 'Arranque remoto (UDP)', 'Mapeo IP–MAC fijo en el servidor'],
        ['DHCP', 'IP dinámica', 'DISCOVER → OFFER → REQUEST → ACK; arrendamiento (lease) con renovación y Relay'],
        ['ICMP', 'Errores y diagnóstico', 'Cabecera 64 bits; Echo (ping), Time Exceeded (traceroute), Dest. Unreachable (DF=1)'],
        ['IGMP', 'Grupos multicast', 'Gestiona pertenencia de hosts a grupos multicast'],
        ['NAT/PAT', 'Traducción IP y puertos', 'Router con estado; toca capa 4 (viola capas); entrantes requieren port forwarding / uPnP / TURN']
      ]
    },
    {
      id: 't-11-13',
      code: 'Tabla 11.13',
      unit: 'u6',
      title: 'Enrutamiento: Estático vs Dinámico · Vector Distancia vs Estado del Enlace',
      caption: 'Cómo conocen y comparan rutas los routers.',
      headers: ['Aspecto / Familia', 'Estático / Vector Distancia', 'Dinámico / Estado del Enlace'],
      rows: [
        ['Estático vs Dinámico', 'Configurado por admin; sin carga CPU; no se adapta (ideal redes stub)', 'Routers intercambian rutas; reconverge ante fallos; consume CPU/mem/ancho de banda'],
        ['Algoritmo', 'Bellman-Ford (Vector distancia)', 'Dijkstra (Estado del enlace)'],
        ['Qué intercambia', 'Con los vecinos directos, las distancias conocidas', 'Inunda anuncios del estado de sus enlaces a toda la red'],
        ['Visión de la red', 'Solo vecinos y distancias', 'Mapa completo de la topología'],
        ['Ejemplos', 'RIP, IGRP', 'OSPF, IS-IS'],
        ['Problema típico', 'Convergencia lenta, cuenta hasta infinito', 'Mayor consumo de memoria y cálculo']
      ]
    }
  ];

  /* ==================== 5. INTRODUCCIONES VISUALES PARA LAS 10 PESTAÑAS DE MAPAS Y GRÁFICOS ==================== */
  App.DIAGRAM_INTROS = {
    map: {
      badge: 'Módulo 1 · Visión Global',
      title: 'Mapa Conceptual Global (Capas 1 a 3)',
      intro: 'Panorama interactivo de cómo se articulan la capa Física, la subcapa MAC/LLC de Enlace y la capa de Red. Clicá cualquier bloque del diagrama para ver sus claves y cómo condiciona el medio físico a los protocolos superiores.',
      topics: ['Capas 1, 2 y 3 (OSI / IEEE 802)', 'Interfaz LLC ↔ MAC ↔ PHY', 'Ethernet 802.3 vs Wi-Fi 802.11', 'Roles de Hub, Switch, AP y Router', 'IPv4/IPv6 y protocolos auxiliares']
    },
    mac: {
      badge: 'Módulo 2 · Acceso al Medio',
      title: 'Acceso MAC, ALOHA y Escenarios Inalámbricos',
      intro: 'Simulá cómo cae el rendimiento S cuando sube la carga ofrecida G en ALOHA puro y ranurado, entendé gráficamente la regla espacio-tiempo de 2τ (64 bytes) en CSMA/CD y compará terminales ocultas, RTS/CTS + NAV y terminales expuestas.',
      topics: ['ALOHA puro (2T, 18,4%) vs ranurado (T, 36,8%)', 'Intentos E = e^G y proporción V/E/C', 'Regla 2τ (51,2 µs / 64 B)', 'Terminal oculta vs expuesta', 'RTS/CTS y portadora virtual NAV']
    },
    ethernet: {
      badge: 'Módulo 3 · Trama y Capa Física',
      title: 'Explorador de Trama Ethernet y Evolución PHY',
      intro: 'Inspeccioná byte a byte la estructura real de una trama Ethernet sobre el cable (activando o quitando la etiqueta VLAN 802.1Q) y filtrá las variantes físicas desde coaxial 10BASE5 hasta 800 Gb/s.',
      topics: ['Preámbulo (7 B), SFD (1 B) e IFG (96 b)', 'MAC Destino/Origen (48 bits)', 'Etiqueta VLAN 802.1Q (4 B → 1522 B)', 'Length/Type (umbral 0x0600) y Padding', 'FCS (CRC-32) y tabla PHY 10M → 800G']
    },
    switching: {
      badge: 'Módulo 4 · Conmutación L2',
      title: 'Switch L2, Tabla MAC, STP (802.1D) y PoE',
      intro: 'Enviá tramas en vivo para observar cómo el switch aprende por MAC de origen, filtra o inunda, compará dominios de colisión y broadcast, repasá los 5 estados de Spanning Tree y contrastá Store-and-forward, Cut-through y PoE.',
      topics: ['Aprendizaje hacia atrás (Tabla MAC)', 'Inundación, filtrado y broadcast', 'Dominios de colisión vs broadcast', 'STP 802.1D (Raíz, RP, B y 5 estados)', 'Store-and-forward vs Cut-through y PoE/PoE+']
    },
    wifi: {
      badge: 'Módulo 5 · Wi-Fi Base',
      title: 'Wi-Fi 802.11: Canales, Enlace, Direcciones y Seguridad',
      intro: 'Visualizá por qué solo los canales 1, 6 y 11 no se solapan en 2,4 GHz, calculá la potencia recibida en dBm, probá cómo cambian Address 1–4 según To DS / From DS y seguí la secuencia completa desde el Beacon hasta el cifrado.',
      topics: ['Canales 1, 6 y 11 en 2,4 GHz', 'Presupuesto de enlace Pr (dBm / dBi)', 'Matriz To DS / From DS (3 y 4 dir. WDS)', 'Espaciados SIFS < PIFS < DIFS < EIFS', 'Descubrimiento, Asociación y 4-Way Handshake']
    },
    network: {
      badge: 'Módulo 6 · Capa de Red',
      title: 'Cabeceras IPv4 vs IPv6, Router paso a paso y Enrutamiento',
      intro: 'Compará campo por campo la cabecera IPv4 (20–60 B) frente a la fija de IPv6 (40 B), animá el viaje de un paquete cruzando un router ("el paquete no cambia, la trama sí") y repasá DORA, ARP, NAT/PAT y algoritmos dinámicos.',
      topics: ['Cabecera IPv4 (IHL, TTL, Flags, Checksum)', 'Cabecera fija IPv6 (40 B)', 'AND con máscara, ARP al Gateway y TTL−1', 'DHCP (DORA), ARP y NAT/PAT con estado', 'Vector Distancia (RIP) vs Estado del Enlace (OSPF)']
    },
    'mac-extra': {
      badge: 'Módulo 7 · Profundización MAC',
      title: 'Variantes CSMA, Backoff Exponencial, Sin Colisiones y Ventanas',
      intro: 'Explorá las tres variantes de CSMA y el producto ancho de banda-retardo, calculá la ventana de backoff tras cada colisión i hasta el abandono en 16, simulá protocolos sin colisiones y compará Retorno a N frente a Repetición Selectiva.',
      topics: ['CSMA 1-persistente, no persistente y p-persistente', 'Producto ancho de banda-retardo y eficiencia P/(P+2τe)', 'Backoff exponencial binario (i = 1..16) y LIFO', 'Mapa de bits (N/2+N) y Cuenta regresiva binaria', 'Ventana deslizante: Retorno a N vs Rep. Selectiva + NAK']
    },
    'eth-arch': {
      badge: 'Módulo 8 · Historia y Arquitectura 802.3',
      title: 'Línea de Tiempo Ethernet, Piezas Internas, Slot Time y Dispositivos',
      intro: 'Recorré la evolución histórica desde el memo de Metcalfe (1973) hasta 800 Gb/s, inspeccioná la separación LLC / MAC / RS-xMII / PHY / MDI, decodificá siglas PHY y revisá la tabla completa de dispositivos incluyendo el Access Point 802.1D.',
      topics: ['Historia 1973–2024 (Alto Aloha, DIX, 802.3)', 'Bloques internos MAC → RS/xMII → PHY → MDI', 'Decodificador PHY (10BASE5 a 10GBASE-ER y CX)', 'Slot time por velocidad y Autonegociación', 'Tabla de dispositivos con AP 802.1D y puentes']
    },
    'wifi-deep': {
      badge: 'Módulo 9 · Wi-Fi Avanzado',
      title: 'Estándares b–6E, ESP32, PHY (OFDM/MIMO/ax), EDCA y Seguridad',
      intro: 'Filtrá los estándares 802.11, convertí mW a dBm y dBi, explorá esquemas de OFDM/MIMO/Beamforming/OFDMA, comprobá la anomalía de la tasa con TXOP y el backoff congelable en EDCA, y seguí los pasos de Frame Control y WEP a WPA3-SAE.',
      topics: ['802.11b/a/g/n/ac/ax/6E y caso ESP32/C6/C5', 'Conversor mW ↔ dBm y dBi', 'OFDM (48+4), MIMO, Beamforming, OFDMA y doble NAV', 'EDCA (AC_VO..AC_BK), backoff congelable y TXOP', 'Frame Control (16 b) y flujos WEP / WPA2 / Enterprise / WPA3']
    },
    'ip-lab': {
      badge: 'Módulo 10 · Laboratorio IP',
      title: 'Calculadora Binaria IPv4, LPM/VLSM, Fragmentación/ICMP e IPv6',
      intro: 'Practicá cálculo real de Capa 3: visualizá los 32 bits de red y host con operación AND y decisión local/remota, probá Prefijo Más Largo (LPM) y VLSM, fragmentá datagramas según MTU y DF, e inspeccioná ICMP y compresión canónica IPv6.',
      topics: ['Calculadora binaria IPv4 (AND, red, broadcast, 2^h−2)', 'Prefijo Más Largo (LPM), VLSM y entrenador', 'Fragmentación IPv4 (DF, MF, Offset×8) y MTUs', 'Cabecera ICMP (64 bits) y tipos principales', 'Compresión/expansión IPv6 (::) y prefijos especiales']
    }
  };

  /* ==================== 6. INTRODUCCIÓN TEÓRICA DESDE CERO (PURA TEORÍA, 10 MÓDULOS) ==================== */
  App.DIAGRAM_THEORY = {
    map: {
      badge: 'Base Teórica · Arquitectura',
      title: '¿Por qué dividir una red en Capas 1, 2 y 3?',
      problem: 'El problema central: llevar bits desde tu computadora hasta un servidor en otro continente exige resolver desafíos muy distintos al mismo tiempo — desde convertir ceros y unos en voltaje o radiofrecuencia hasta encontrar un camino entre millones de redes.',
      intuition: 'Si un único protocolo hiciera todo junto, cambiar un cable por fibra óptica obligaría a reescribir las aplicaciones y el direccionamiento de todo Internet. Por eso se apilan capas independientes: cada una resuelve un problema concreto, habla solo con sus vecinas y confía en que la de abajo hace su parte.',
      pillars: [
        { label: 'Capa 1 · Física (el medio)', text: 'Mueve bits crudos como impulsos eléctricos, luz o microondas. No sabe qué es una dirección ni una trama: solo regenera o repite señales (repetidores, hubs, antenas).' },
        { label: 'Capa 2 · Enlace (salto local)', text: 'Agrupa bits en tramas con direcciones físicas planas (MAC de 48 bits), detecta errores con CRC y coordina quién habla en un medio compartido o conmutado (switches y APs).' },
        { label: 'Capa 3 · Red (extremo a extremo)', text: 'Introduce direcciones lógicas jerárquicas (IP) para cruzar múltiples redes distintas mediante routers, eligiendo rutas paso a paso hasta el destino final.' }
      ],
      bridge: 'Idea clave de diseño: la física del medio condiciona directamente a la capa de enlace (el retardo τ en cable impone mínimos de trama; la radio half-duplex obliga a evitar colisiones), mientras la capa de red oculta esas diferencias debajo de una IP uniforme.'
    },
    mac: {
      badge: 'Base Teórica · Acceso al Medio',
      title: '¿Cómo comparten un mismo medio varias máquinas sin hablarse encima?',
      problem: 'El problema central: cuando dos o más equipos están conectados al mismo cable o canal de radio, si transmiten al mismo tiempo sus señales se superponen, se deforman y ambas tramas se pierden (colisión).',
      intuition: 'Una salida obvia sería repartir el canal por turnos fijos o frecuencias fijas (TDM/FDM). Pero los datos de red llegan en ráfagas intermitentes: mientras una PC lee una página, el canal queda vacío y nadie más puede aprovecharlo. La subcapa MAC nace para asignar el canal dinámicamente en tiempo real.',
      pillars: [
        { label: 'De ALOHA a escuchar antes (CSMA)', text: 'ALOHA transmite sin mirar y solo rinde 18,4% (36,8% si se sincronizan ranuras de tiempo). Escuchar la portadora antes (CSMA) reduce choques, pero no los elimina porque la señal tarda τ segundos en viajar por el cable.' },
        { label: 'En cable: detectar y abortar (CSMA/CD)', text: 'Una placa cableada puede escuchar mientras transmite: si detecta una colisión, manda una señal de jam, aborta rápido y espera un tiempo aleatorio. Para enterarse a tiempo en los extremos, la trama debe durar al menos 2τ (64 bytes).' },
        { label: 'En radio: evitar y confirmar (CSMA/CA)', text: 'En el aire la señal propia es millones de veces más fuerte que la entrante y existen nodos que no se oyen entre sí (terminales ocultas). Por eso se evita el choque antes (esperas + backoff + RTS/CTS) y se confirma con ACK.' }
      ],
      bridge: 'Ningún protocolo de multiacceso garantiza entrega confiable por sí solo: su trabajo es decidir quién transmite y cuándo; detectar bits dañados o recuperar pérdidas corresponde a funciones adicionales o a capas superiores.'
    },
    ethernet: {
      badge: 'Base Teórica · Trama y PHY',
      title: '¿Por qué Ethernet duró 50 años cambiando el cable pero casi no la trama?',
      problem: 'El problema central: en 1973 se transmitía a 2,94 Mb/s sobre cable coaxial grueso y hoy se transmiten 800 Gb/s sobre fibra óptica. ¿Cómo se multiplica la velocidad ×80.000 sin romper los sistemas operativos ni los protocolos como IP?',
      intuition: 'IEEE 802.3 congeló la "cápsula" lógica (direcciones MAC de 48 bits, formato de trama y verificación CRC-32) y volvió intercambiable todo lo físico que está debajo. Para el software superior, enviar una trama a 10 Mb/s o a 100 Gb/s se ve exactamente igual.',
      pillars: [
        { label: 'Sincronización fuera de la trama', text: 'Antes de los datos viajan 7 bytes de Preámbulo (101010…) y 1 byte delimitador (SFD) para que el reloj físico del receptor se enganche. Recién después empiezan los 64 a 1518 bytes protegidos por el FCS.' },
        { label: 'Identificar al receptor y al protocolo', text: 'Cada interfaz trae grabada una MAC de 48 bits (24 bits de fabricante OUI + 24 propios). El campo de 2 bytes indica la longitud (≤ 1500, formato 802.3 + LLC) o directamente el protocolo superior (≥ 1536 / 0x0600, EtherType como IPv4 o ARP).' },
        { label: 'Detectar barato sin corregir', text: 'El cableado moderno tiene bajísima tasa de error. Calcular un CRC-32 en hardware es muy rápido: si falla se descarta la trama y las capas superiores (como TCP) se encargan de retransmitir solo en esos casos raros.' }
      ],
      bridge: 'Por esa herencia histórica, aunque las redes conmutadas modernas en full-duplex ya no tienen colisiones, Ethernet conserva el relleno mínimo (padding hasta 64 B) y la MTU de 1500 B como lengua franca de las LAN.'
    },
    switching: {
      badge: 'Base Teórica · Conmutación L2',
      title: 'Del cable compartido a la red conmutada moderna',
      problem: 'El problema central: en una LAN con coaxial o un hub, todos los equipos comparten un único dominio de colisión: cuanto más crece la red, más chocan entre sí y menor es la velocidad real de cada uno.',
      intuition: 'El switch de Capa 2 reemplaza el medio único por conexiones punto a punto dedicadas y un bus interno veloz (backplane). Sin que nadie lo configure (es transparente), aprende dónde vive cada equipo observando la MAC de origen de las tramas que recibe.',
      pillars: [
        { label: 'Aprender, filtrar e inundar', text: 'Si el switch ya anotó en su tabla MAC el puerto del destinatario, envía la trama solo por ese puerto (aislando el tráfico). Si aún no lo conoce o la trama es broadcast (FF:FF:FF:FF:FF:FF), la inunda por todos los demás puertos.' },
        { label: 'El peligro de los bucles (STP)', text: 'Las tramas de Capa 2 no tienen contador de vida (TTL). Si conectás dos cables entre switches por redundancia sin control, un broadcast gira en círculo eternamente saturando la red. Spanning Tree (802.1D) bloquea lógicamente los enlaces sobrantes dejando un árbol sin ciclos.' },
        { label: 'Segmentación lógica y energía', text: 'Las VLANs (802.1Q) agregan una etiqueta de 4 bytes para dividir un mismo switch físico en múltiples dominios de broadcast aislados (comunicarlas exige un router). PoE aprovecha los mismos pares de cobre para alimentar cámaras, teléfonos y APs.' }
      ],
      bridge: 'Un switch separa dominios de colisión por puerto, pero NO separa dominios de broadcast por sí solo (para eso hacen falta VLANs o un router). Y un Access Point actúa como un puente inalámbrico de Capas 1 y 2, no como un router.'
    },
    wifi: {
      badge: 'Base Teórica · Wi-Fi Base',
      title: 'Por qué el aire cambia todas las reglas respecto del cable',
      problem: 'El problema central: en un cable la señal viaja confinada y limpia entre dos puntas; en el aire cualquiera en el vecindario comparte las mismas frecuencias, la energía cae rápido con la distancia y cada radio queda "sorda" mientras transmite.',
      intuition: 'Wi-Fi (IEEE 802.11) intenta ofrecer al sistema operativo la misma ilusión que Ethernet, pero por debajo tiene que lidiar con física de radiofrecuencia, interferencias, un Access Point haciendo de intermediario y la imposibilidad de impedir que un tercero escuche las ondas en el aire.',
      pillars: [
        { label: 'Espectro y presupuesto de enlace', text: 'Las bandas libres ISM (2,4 GHz, con solo 3 canales no solapados: 1, 6 y 11) y U-NII (5/6 GHz, con reglas DFS por radares) están reguladas. En decibeles (dBm), la potencia que llega debe superar la sensibilidad del receptor.' },
        { label: 'El AP y las 3 o 4 direcciones', text: 'En modo infraestructura todo pasa por el Access Point, puente entre el aire y la red cableada (DS). Por eso una trama Wi-Fi distingue al transmisor/receptor del salto de radio (TA/RA) del origen/destino final (SA/DA), usando 3 direcciones normalmente y 4 entre puentes (WDS).' },
        { label: 'Acceso cuidadoso y seguridad obligatoria', text: 'Antes de emitir se espera DIFS y un backoff aleatorio, y toda trama unicast espera un ACK tras SIFS. Como el aire es público, primero se descubre y asocia al BSS (Beacon / Open System) y luego se negocian claves cifradas sin enviar la contraseña.' }
      ],
      bridge: 'Por la sobrecarga de preámbulos, esperas, ACKs, contienda y reenvíos por el AP, la velocidad útil real (goodput) de una red Wi-Fi siempre es bastante menor que la tasa PHY anunciada en la caja.'
    },
    network: {
      badge: 'Base Teórica · Capa de Red',
      title: 'De la LAN local a Internet: el salto al direccionamiento jerárquico',
      problem: 'El problema central: las direcciones MAC sirven para encontrarte dentro de tu misma red local, pero son planas (solo indican fabricante + número serie). Si Internet usara MACs, cada router del planeta tendría que recordar miles de millones de direcciones individuales.',
      intuition: 'La Capa 3 resuelve la escala mundial con una idea idéntica a la del código postal: dividir cada dirección IP en una parte de red (la zona o barrio) y una parte de host (la casa). Los routers solo miran a qué red pertenece el paquete hasta llegar al enlace final.',
      pillars: [
        { label: 'Datagramas independientes', text: 'IP ofrece un servicio sin conexión y sin confirmación: cada paquete lleva origen y destino completos y cada router decide el próximo salto por su cuenta, lo que hace a la red muy resistente si cae un nodo intermedio.' },
        { label: 'El paquete no cambia, la trama sí', text: 'Al cruzar un router, el paquete IP conserva intactas las IP origen y destino (salvo NAT) y solo decrementa su TTL. Lo que se descarta y vuelve a fabricar en cada salto es la trama de Capa 2 con las MAC de esa red concreta.' },
        { label: 'Un ecosistema de asistentes', text: 'Para operar hace falta saber si el destino es local o va al Gateway (AND con máscara), traducir IP→MAC en la LAN (ARP), obtener IP automática (DHCP), reportar errores (ICMP), compartir IP pública (NAT) y que los routers calculen caminos (RIP/OSPF).' }
      ],
      bridge: 'Separar "dónde estás en el mundo" (IP) de "qué placa física sos en este cable" (MAC) es lo que permite que un paquete atraviese Wi-Fi, fibra submarina y Ethernet llegando exactamente a destino.'
    },
    'mac-extra': {
      badge: 'Base Teórica · Dinámica de Acceso',
      title: 'Eficiencia bajo carga, contención ordenada y recuperación de errores',
      problem: 'El problema central: saber que existe CSMA no basta para diseñar una red real. ¿Qué pasa cuando decenas de nodos esperan a la vez, cuando el cable es muy largo respecto de la trama, o cuando el tráfico de voz no tolera demoras aleatorias?',
      intuition: 'Las variantes de acceso al medio expresan un compromiso inevitable entre demora con baja carga, estabilidad bajo saturación y equidad. Además, cuando el medio compartido igual pierde tramas por ruido, la capa de enlace puede recuperarlas mediante ventanas deslizantes.',
      pillars: [
        { label: 'Persistencia y ancho de banda-retardo', text: 'Ser "impaciente" (1-persistente) provoca estampidas al liberarse el medio; esperar al azar (no persistente) desperdicia huecos libres. Y cuantas más tramas quepan en tránsito en el cable (B×τ alto), peor rinde escuchar antes.' },
        { label: 'Backoff adaptable y protocolos sin choques', text: 'Duplicar la ventana tras cada colisión adapta la espera al número de rivales (aunque favorece a los recién llegados). Si se necesita determinismo (como en VoIP), mapa de bits o cuenta regresiva binaria reservan turno sin colisiones.' },
        { label: 'Ventanas deslizantes en el enlace', text: 'En lugar de frenar tras cada trama, se envían varias dentro de una ventana mientras llega confirmación. Ante una pérdida, Retorno a N descarta todo lo posterior y Repetición Selectiva guarda lo válido en buffer para retransmitir solo la faltante.' }
      ],
      bridge: 'Comprender estas trade-offs explica por qué Ethernet evolucionó hacia switches sin contención, mientras la eficiencia de cualquier protocolo MAC depende siempre de la relación entre el tamaño de trama P y el retardo τ.'
    },
    'eth-arch': {
      badge: 'Base Teórica · Evolución 802.3',
      title: 'Cómo una idea experimental en coaxial escaló ×80.000',
      problem: 'El problema central: los primeros cables coaxiales limitaban la red a un único bus frágil con tope estricto de distancia y repetidores. ¿Qué piezas internas y cambios físicos permitieron pasar a gigabits sin abandonar el estándar?',
      intuition: 'La clave estuvo en aislar la subcapa MAC (que arma la trama) de la PHY (que habla con el cable o fibra) mediante una interfaz adaptadora (RS/xMII). Así cada generación física pudo inventar nuevas codificaciones y usar más pares o haces de luz manteniendo intacto el resto de la arquitectura.',
      pillars: [
        { label: 'Del bus pasivo a la estrella conmutada', text: 'Un corte en coaxial tiraba toda la oficina y obligaba a respetar 2,5 km y máximo 4 repetidores por el 2τ. Pasar a par trenzado en estrella (10BASE-T) aisló fallas y permitió reemplazar hubs por switches.' },
        { label: 'Exprimir el cobre con codificación', text: 'Manchester gastaba el doble de baudios para llevar el reloj; 100BASE-TX combinó 4B/5B + MLT-3 en 2 pares; 1000BASE-T usó los 4 pares en simultáneo ida y vuelta con PAM-5 y cancelación de eco por DSP.' },
        { label: 'El fin del half-duplex', text: 'Al subir ×10 la velocidad a 100 Mb/s el diámetro cayó ÷10; a 1 Gb/s half-duplex hubo que estirar el slot time a 512 B (extensión de portadora). Desde 10 Gb/s se eliminó half-duplex y CSMA/CD pasó a la historia.' }
      ],
      bridge: 'Al analizar cualquier red actual, distinguir dónde termina la Capa 1 (hub/repetidor), dónde trabaja la Capa 2 (switch/puente/AP 802.1D) y dónde entra la Capa 3 (router) evita casi todas las confusiones de arquitectura.'
    },
    'wifi-deep': {
      badge: 'Base Teórica · Wi-Fi Avanzado',
      title: 'Cómo exprime el Wi-Fi moderno el espectro y prioriza el tráfico',
      problem: 'El problema central: el aire sufre rebotes en paredes (multitrayectoria), clientes lentos que acaparan tiempo de aire, redes vecinas superpuestas y atacantes pasivos capturando paquetes en el vecindario.',
      intuition: 'Cada generación de 802.11 atacó uno de estos cuellos de botella: primero dividió la señal en cientos de subportadoras resistentes al eco (OFDM), luego sumó múltiples antenas (MIMO y Beamforming), más tarde repartió frecuencias entre varios usuarios a la vez (OFDMA en Wi-Fi 6) y reforzó la autenticación criptográfica.',
      pillars: [
        { label: 'Física de alta eficiencia (OFDM → OFDMA)', text: 'OFDM usa subportadoras ortogonales y prefijo cíclico contra ecos; MIMO suma flujos espaciales y Beamforming enfoca fase hacia el cliente. Wi-Fi 6 (11ax) agrega RUs en frecuencia (OFDMA), 1024-QAM y BSS Coloring + doble NAV.' },
        { label: 'Justicia y prioridades en la MAC (EDCA)', text: 'Congelar el backoff al ocuparse el canal impide que una estación espere eternamente. EDCA añade 4 colas con prioridades estadísticas (AIFS/CWmin) y TXOP da una ventana de tiempo fija para que un cliente lento no hunda a los rápidos.' },
        { label: 'De WEP roto a WPA3-SAE', text: 'WEP reutilizaba vectores de inicialización RC4 débiles. WPA2 probó posesión de clave sin enviarla mediante el 4-Way Handshake (aunque vulnerable a diccionario offline). WPA3-SAE bloquea ese ataque offline y exige proteger tramas de gestión (PMF).' }
      ],
      bridge: 'Incluso con toda esta complejidad física y criptográfica, la trama de datos 802.11 sigue identificando cada salto y tipo mediante los 16 bits de Frame Control y manteniendo compatibilidad hacia atrás con la pila IP.'
    },
    'ip-lab': {
      badge: 'Base Teórica · Matemática IP',
      title: 'La matemática detrás del ruteo: bits, máscaras, fragmentación e IPv6',
      problem: 'El problema central: cuando leemos "192.228.17.57/27", vemos cuatro números decimales; pero un router y un host ven una tira continua de 32 bits que deben partir, comparar contra rutas superpuestas y adaptar al tamaño máximo de cada enlace.',
      intuition: 'Las operaciones de Capa 3 son en esencia aritmética binaria muy limpia: un AND bit a bit separa red de host, el prefijo más largo desempata rutas solapadas, y las reglas de MTU y compresión IPv6 mantienen el reenvío veloz en el núcleo de Internet.',
      pillars: [
        { label: 'CIDR, AND y Prefijo Más Largo', text: 'Las viejas clases A/B/C desperdiciaban direcciones ("problema de los tres osos"). CIDR permite máscaras de cualquier longitud (/n), dividir bloques en subredes a medida (VLSM) y elegir siempre la ruta coincidente con más bits de red.' },
        { label: 'MTU, fragmentación e ICMP', text: 'Si un paquete IPv4 supera la MTU del siguiente enlace y DF = 0, el router lo parte en fragmentos múltiplos de 8 bytes y solo el destino final lo reensambla. Si DF = 1, descarta y avisa por ICMP (base de Path MTU y traceroute).' },
        { label: 'Simplificación en IPv6 (128 bits)', text: 'Ante el agotamiento de IPv4, IPv6 amplía a 8 grupos hexadecimales (compresión única con "::") y fija la cabecera en 40 bytes: quita el checksum de cabecera, prohíbe fragmentar en routers (MTU mín 1280 B) y reemplaza broadcast/ARP por multicast/NDP.' }
      ],
      bridge: 'Dominar el paso a binario, la operación AND con la máscara, el cálculo de fragmentos múltiplos de 8 y las reglas de compresión "::" convierte cualquier ejercicio de parcial en una verificación mecánica sin margen de error.'
    }
  };
})();
