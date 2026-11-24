(function () {
  'use strict';

  var App = window.RedesApp = window.RedesApp || {};

  App.DIAGRAMS_DATA = {
    conceptMapNodes: {
      phy: {
        unit: 'u3',
        diagramTab: 'ethernet',
        title: 'Capa 1 · Capa Física (Medios y Señales)',
        description: 'Transmite bits sobre coaxial, par trenzado, fibra o radiofrecuencia. No entiende direcciones MAC ni IP.',
        bullets: [
          'Dispositivos de Capa 1: repetidores, hubs, antenas y patch panels.',
          'Ethernet PHY evoluciona de Manchester (10 Mb/s) a 4B/5B+MLT-3 (100 Mb/s), PAM-5 (1 Gb/s) y PAM-16/64B66B (10G+).',
          'Wi-Fi PHY usa OFDM (subportadoras ortogonales), MIMO, Beamforming y OFDMA.'
        ],
        connection: 'Impone restricciones reales a la MAC: retardo de propagación τ en cable (regla 2τ) y atenuación/half-duplex en radio.'
      },
      mac: {
        unit: 'u2',
        diagramTab: 'mac',
        title: 'Capa 2 · Subcapa MAC (Acceso al Medio)',
        description: 'Decide quién puede transmitir y cuándo sobre un medio compartido, define direcciones MAC y formato de trama.',
        bullets: [
          'ALOHA puro (vulnerable 2T, S_max 18,4%) → ALOHA ranurado (T, 36,8%).',
          'CSMA/CD (Ethernet compartido): escucha, detecta colisión, envía jam y aplica backoff exponencial binario.',
          'CSMA/CA (Wi-Fi 802.11): evita colisiones antes (DIFS + backoff congelable + RTS/CTS + NAV) y confirma con ACK.'
        ],
        connection: 'Recibe paquetes de la capa de red (vía LLC) y los encapsula en tramas para la PHY.'
      },
      ethernet: {
        unit: 'u3',
        diagramTab: 'ethernet',
        title: 'IEEE 802.3 · Ethernet',
        description: 'Estándar de LAN cableada derivado de DIX: mantiene una trama común de 64–1518 B (1522 B con 802.1Q) a lo largo de todas las velocidades.',
        bullets: [
          'Servicio no orientado a conexión, sin confirmaciones y sin corrección (FCS CRC-32 detecta y descarta).',
          'Campo Length/Type: ≤ 1500 es longitud (+ LLC); ≥ 1536 (0x0600) es EtherType (0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6).',
          'Desde 10G desaparece por completo el modo half-duplex y CSMA/CD.'
        ],
        connection: 'En redes modernas Ethernet corre sobre switches full-duplex punto a punto.'
      },
      switching: {
        unit: 'u4',
        diagramTab: 'switching',
        title: 'Conmutación Ethernet, STP, VLAN y PoE',
        description: 'El switch de capa 2 aísla cada puerto en su propio dominio de colisión y reenvía tramas usando la Tabla MAC.',
        bullets: [
          'Aprende por MAC de origen, reenvía por MAC de destino e inunda broadcasts y destinos desconocidos.',
          'STP (802.1D) bloquea enlaces redundantes para evitar tormentas de broadcast (Disabled → Blocking → Listening → Learning → Forwarding).',
          'VLAN (802.1Q) separa dominios de broadcast lógicos; comunicar VLANs exige un router (Capa 3).'
        ],
        connection: 'Un Access Point (AP) es un puente inalámbrico 802.1D (capas 1 y 2), no un router.'
      },
      wifi: {
        unit: 'u5',
        diagramTab: 'wifi',
        title: 'IEEE 802.11 · Wi-Fi',
        description: 'LAN inalámbrica sobre bandas ISM (2,4 GHz: canales 1, 6, 11) y U-NII (5 y 6 GHz, con DFS para radares).',
        bullets: [
          'Acceso DCF (CSMA/CA), EDCA (4 categorías de QoS + TXOP) y PCF (casi sin uso).',
          'Trama de gestión Beacon cada 100 TU (102,4 ms); trama de datos usa 3 direcciones normalmente y 4 en WDS.',
          'Seguridad: Open System precede a WPA2/Enterprise; 4-Way Handshake deriva PTK/GTK; WPA3 agrega SAE y PMF.'
        ],
        connection: 'El AP puentea tramas 802.11 hacia Ethernet (Sistema de Distribución DS).'
      },
      network_ip: {
        unit: 'u6',
        diagramTab: 'network',
        title: 'Capa 3 · IPv4, IPv6 y Subnetting',
        description: 'Direccionamiento lógico jerárquico (red + host) para conectar hosts a través de múltiples redes.',
        bullets: [
          'Servicio de datagramas: sin conexión y sin confirmación; el paquete se enruta por prefijo más largo.',
          'IPv4 (32 bits): cabecera 20–60 B, TTL decrementado por routers, fragmentación (reensambla solo el destino), CIDR y subredes.',
          'IPv6 (128 bits): cabecera fija 40 B, sin checksum, sin fragmentación en routers, sin broadcast (usa multicast).'
        ],
        connection: 'Para salir de la red local, el host usa AND con su máscara y envía la trama al Gateway.'
      },
      network_proto: {
        unit: 'u6',
        diagramTab: 'network',
        title: 'Protocolos Complementarios y Enrutamiento',
        description: 'Protocolos auxiliares que resuelven IP↔MAC, configuran hosts, reportan errores, traducen NAT y calculan rutas.',
        bullets: [
          'ARP (IP → MAC por broadcast L2); DHCP (DISCOVER, OFFER, REQUEST, ACK con lease); ICMP (ping Echo, traceroute TTL).',
          'NAT/PAT vuelve con estado al router y viola el modelo de capas al reescribir puertos de capa 4.',
          'Enrutamiento: Vector Distancia (Bellman-Ford: RIP, IGRP) vs Estado del Enlace (Dijkstra: OSPF, IS-IS).'
        ],
        connection: 'El router desencapsula la trama L2, consulta su tabla de rutas y re-encapsula el mismo paquete IP en una nueva trama.'
      }
    },

    ethernetFrameFields: [
      {
        id: 'preamble',
        name: 'Preámbulo',
        bytes: '7 B',
        detail: 'Siete bytes 0x55 (alternancia 10101010...) para que el receptor sincronice su reloj físico.',
        examNote: 'No se cuenta dentro de los 64–1518 bytes de la trama ni está cubierto por el FCS.'
      },
      {
        id: 'sfd',
        name: 'SFD',
        bytes: '1 B',
        detail: 'Start Frame Delimiter (0xD5, termina en ...10101011). Marca el inicio exacto de la MAC destino.',
        examNote: 'Junto al Preámbulo suma 8 bytes de sincronización física previos a la trama.'
      },
      {
        id: 'dst',
        name: 'MAC Destino',
        bytes: '6 B',
        detail: 'Dirección física de 48 bits del destinatario en la LAN (unicast, multicast 01:00:5E:... o broadcast FF:FF:FF:FF:FF:FF).',
        examNote: 'Es el campo que lee el switch de capa 2 para decidir por qué puerto reenviar (o inundar).'
      },
      {
        id: 'src',
        name: 'MAC Origen',
        bytes: '6 B',
        detail: 'Dirección física de 48 bits de la NIC transmisora (24 bits OUI del IEEE + 24 bits del fabricante).',
        examNote: 'Es el campo que lee el switch para aprender detrás de qué puerto está el emisor.'
      },
      {
        id: 'vlan',
        name: '802.1Q (VLAN)',
        bytes: '4 B',
        detail: 'Etiqueta opcional de VLAN insertada por switches con soporte 802.1Q para aislar dominios de broadcast lógicos.',
        examNote: 'Eleva la trama máxima a 1522 B y reduce el mínimo necesario de carga útil de 46 a 42 B.'
      },
      {
        id: 'type',
        name: 'Long / Tipo',
        bytes: '2 B',
        detail: 'Valores ≤ 1500 indican longitud (IEEE 802.3 + LLC); valores ≥ 1536 (0x0600) indican EtherType (0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6).',
        examNote: 'El rango 1501–1535 es zona no definida para evitar ambigüedades entre DIX y 802.3.'
      },
      {
        id: 'data',
        name: 'Datos + Pad',
        bytes: '46–1500 B',
        detail: 'Carga útil (MTU 1500 B). Si el paquete superior es menor a 46 B (o 42 B con 802.1Q), la MAC rellena con padding.',
        examNote: 'El relleno existe para asegurar que la trama total alcance al menos 64 B (512 bit-times = 2τ).'
      },
      {
        id: 'fcs',
        name: 'FCS (CRC-32)',
        bytes: '4 B',
        detail: 'Secuencia de verificación de trama calculada desde MAC Destino hasta el final de Datos/Pad.',
        examNote: 'Ethernet solo detecta errores y descarta la trama dañada; no corrige ni pide retransmisión.'
      },
      {
        id: 'ifg',
        name: 'IFG (pausa)',
        bytes: '96 bit-times',
        detail: 'Interframe Gap: silencio mínimo obligatorio entre transmisiones consecutivas en el cable.',
        examNote: 'No forma parte de la trama (equivale a 9,6 µs a 10 Mb/s).'
      }
    ],

    ethernetPhys: [
      { name: '10BASE5', rate: '10 Mb/s', mediumType: 'coax', medium: 'Coaxial grueso 50 Ω', coding: 'Manchester', reach: '500 m', notes: 'Bus con terminadores; transceptor AUI; hasta 100 equipos' },
      { name: '10BASE2', rate: '10 Mb/s', mediumType: 'coax', medium: 'Coaxial fino RG-58', coding: 'Manchester', reach: '185 m', notes: 'Conector BNC en T; hasta 30 equipos; corte tira todo el bus' },
      { name: '10BASE-T (802.3i)', rate: '10 Mb/s', mediumType: 'utp', medium: '2 pares Cat 3+', coding: 'Manchester', reach: '100 m', notes: 'Estrella con hub o switch; Half/Full duplex' },
      { name: '100BASE-TX (802.3u)', rate: '100 Mb/s', mediumType: 'utp', medium: '2 pares Cat 5+', coding: '4B/5B + NRZI + MLT-3', reach: '100 m', notes: '125 MBd; autonegociación; reduce diámetro ÷10 en half' },
      { name: '100BASE-FX', rate: '100 Mb/s', mediumType: 'fiber', medium: 'Fibra multimodo (2 fibras)', coding: '4B/5B + NRZI', reach: '412 m half / 2 km full', notes: 'Inmune a interferencia electromagnética' },
      { name: '1000BASE-SX/LX (802.3z)', rate: '1 Gb/s', mediumType: 'fiber', medium: 'Fibra MMF (850nm) / SMF (1310nm)', coding: '8B/10B (1250 MBd)', reach: 'SX < 550 m / LX < 10 km', notes: 'Óptica modular SFP + LC' },
      { name: '1000BASE-T (802.3ab)', rate: '1 Gb/s', mediumType: 'utp', medium: '4 pares Cat 5e', coding: 'PAM-5 + DSP', reach: '100 m', notes: '250 Mb/s bidireccional por par con cancelación de eco' },
      { name: '10GBASE-T', rate: '10 Gb/s', mediumType: 'utp', medium: '4 pares Cat 6A', coding: 'PAM-16 + LDPC', reach: '100 m', notes: 'Solo full-duplex; sin CSMA/CD' },
      { name: '10GBASE-SR/LR/ER (802.3ae)', rate: '10 Gb/s', mediumType: 'fiber', medium: 'Fibra MMF / SMF', coding: '64B/66B', reach: '300–400 m / 10 km / 40 km', notes: 'Full-duplex nativo para centros de datos y troncales' },
      { name: '40G / 100G / 400G / 800G', rate: '40–800 Gb/s', mediumType: 'fiber', medium: 'Lanes paralelos (fibra/DAC)', coding: 'Multilane (4×10, 4×25, 8×100)', reach: 'Variable', notes: 'Tasa agregada; la trama Ethernet básica sigue intacta' }
    ],

    wifiAddressModes: [
      {
        toDS: 0, fromDS: 0,
        a1: 'RA = DA', a2: 'TA = SA', a3: 'BSSID', a4: '—',
        scenario: 'To DS = 0, From DS = 0 · Modo Ad Hoc (IBSS) o enlace directo entre estaciones',
        note: 'No interviene el Sistema de Distribución (DS); transmisor y receptor de radio coinciden con origen y destino finales.'
      },
      {
        toDS: 1, fromDS: 0,
        a1: 'RA (BSSID)', a2: 'TA = SA', a3: 'DA', a4: '—',
        scenario: 'To DS = 1, From DS = 0 · Notebook → AP → Servidor en la LAN',
        note: 'La estación envía por radio al AP (Address 1 = BSSID), identificándose en A2 (TA=SA) e indicando el servidor destino final en A3 (DA).'
      },
      {
        toDS: 0, fromDS: 1,
        a1: 'RA = DA', a2: 'TA (BSSID)', a3: 'SA', a4: '—',
        scenario: 'To DS = 0, From DS = 1 · Servidor en LAN → AP → Notebook',
        note: 'El AP envía por radio a la notebook (A1 = RA = DA), poniendo su propio BSSID como transmisor de radio (A2) y al servidor como origen original (A3 = SA).'
      },
      {
        toDS: 1, fromDS: 1,
        a1: 'RA', a2: 'TA', a3: 'DA', a4: 'SA',
        scenario: 'To DS = 1, From DS = 1 · Enlace inalámbrico entre puentes (WDS)',
        note: 'Ni el transmisor ni el receptor del salto por radio coinciden con el origen/destino final; se habilita Address 4 (encabezado de 30 bytes).'
      }
    ],

    ipHeaders: {
      ipv4: [
        { id: 'v4_ver', name: 'Versión', bits: '4 bits', span: 1, detail: 'Vale 4 para IPv4.' },
        { id: 'v4_ihl', name: 'IHL', bits: '4 bits', span: 1, detail: 'Longitud de cabecera en palabras de 32 bits (mínimo 5 = 20 B; máximo 15 = 60 B si hay opciones).' },
        { id: 'v4_tos', name: 'TOS / DS + ECN', bits: '8 bits', span: 1, detail: 'Antes Precedencia/TOS; hoy 6 bits para DiffServ (QoS) y 2 bits para notificación explícita de congestión (ECN).' },
        { id: 'v4_len', name: 'Longitud Total', bits: '16 bits', span: 1, detail: 'Tamaño completo del datagrama (cabecera + datos) hasta 65.535 bytes. Permite distinguir datos reales del padding Ethernet.' },
        { id: 'v4_id', name: 'Identificación', bits: '16 bits', span: 2, detail: 'Número único del datagrama; todos los fragmentos de un mismo paquete comparten este valor para reensamblarse en el destino.' },
        { id: 'v4_flags', name: 'Flags (0, DF, MF)', bits: '3 bits', span: 1, detail: 'DF = No fragmentar (si excede MTU se descarta y avisa ICMP); MF = Más fragmentos (1 en todos menos el último).' },
        { id: 'v4_off', name: 'Offset Frag.', bits: '13 bits', span: 1, detail: 'Desplazamiento del fragmento dentro del paquete original, expresado en unidades de 8 bytes (64 bits).' },
        { id: 'v4_ttl', name: 'TTL', bits: '8 bits', span: 1, detail: 'Tiempo de vida (saltos). Cada router lo decrementa en 1 (los switches NO); al llegar a 0 se descarta y responde ICMP Time Exceeded.' },
        { id: 'v4_proto', name: 'Protocolo', bits: '8 bits', span: 1, detail: 'Indica el protocolo de capa 4 (o superior) al que se entrega el datagrama (ej. TCP, UDP, ICMP). Trampa: NO es capa 2.' },
        { id: 'v4_chk', name: 'Checksum', bits: '16 bits', span: 2, detail: 'Control SOLO de la cabecera IPv4 (no cubre el payload). Debe recalcularse en cada router porque cambia el TTL.' },
        { id: 'v4_src', name: 'IP Origen', bits: '32 bits', span: 4, detail: 'Dirección IPv4 del emisor (permanece constante extremo a extremo salvo que atraviese un NAT).' },
        { id: 'v4_dst', name: 'IP Destino', bits: '32 bits', span: 4, detail: 'Dirección IPv4 del destinatario final; los routers la usan con AND y su tabla de rutas (prefijo más largo).' }
      ],
      ipv6: [
        { id: 'v6_ver', name: 'Versión', bits: '4 bits', span: 1, detail: 'Vale 6 para IPv6.' },
        { id: 'v6_tc', name: 'Clase de Tráfico', bits: '8 bits', span: 1, detail: 'Equivalente al campo TOS/DiffServ+ECN para prioridad y congestión.' },
        { id: 'v6_fl', name: 'Etiqueta de Flujo', bits: '20 bits', span: 2, detail: 'Identifica flujos de paquetes que requieren tratamiento especial o QoS constante.' },
        { id: 'v6_plen', name: 'Long. de Datos', bits: '16 bits', span: 2, detail: 'Longitud del payload (sin contar los 40 B fijos de esta cabecera).' },
        { id: 'v6_nh', name: 'Cabecera Siguiente', bits: '8 bits', span: 1, detail: 'Reemplaza a "Protocolo": indica si sigue una cabecera de extensión o directamente TCP/UDP/ICMPv6.' },
        { id: 'v6_hl', name: 'Límite de Saltos', bits: '8 bits', span: 1, detail: 'Equivalente exacto al TTL de IPv4; cada router lo decrementa en 1.' },
        { id: 'v6_src', name: 'Dirección IPv6 Origen', bits: '128 bits', span: 4, detail: 'Dirección de 128 bits (8 grupos hex). Cabecera fija total de 40 bytes: desaparecieron IHL, Checksum y campos de fragmentación.' },
        { id: 'v6_dst', name: 'Dirección IPv6 Destino', bits: '128 bits', span: 4, detail: 'Dirección de 128 bits. Los routers intermedios ya NO fragmentan (Path MTU mínima garantizada = 1280 B).' }
      ]
    },

    packetJourneySteps: [
      {
        title: 'Decisión local vs remota (AND)',
        badge: 'Host A calcula AND(10.0.0.20, 255.255.255.0)',
        detail: 'Host A compara su red (192.168.1.0) con el resultado (10.0.0.0). Como son distintas, el destino es remoto: el paquete debe ir al Gateway (192.168.1.1).'
      },
      {
        title: 'Resolución ARP del Gateway',
        badge: 'ARP Broadcast: "¿Quién tiene 192.168.1.1?"',
        detail: 'Host A NO busca la MAC de Host B (que está en otra red), sino la MAC de la interfaz R1 del Router, mediante ARP broadcast en su LAN.'
      },
      {
        title: 'Trama 1 en la Red 1',
        badge: 'MAC: AA → R1 | IP: 192.168.1.10 → 10.0.0.20',
        detail: 'Host A encapsula el paquete IP en una trama Ethernet dirigida a la MAC del router. El switch de la Red 1 la conmuta hasta el router.'
      },
      {
        title: 'Procesamiento en el Router',
        badge: 'Desencapsula trama · TTL−1 · Busca ruta · ARP en Red 2',
        detail: 'El router quita la cabecera Ethernet, valida el checksum IPv4, decrementa el TTL, encuentra 10.0.0.0/24 en su tabla y resuelve por ARP la MAC de Host B (BB).'
      },
      {
        title: 'Trama 2 en la Red 2',
        badge: 'MAC: R2 → BB | IP: 192.168.1.10 → 10.0.0.20',
        detail: 'El router encapsula el MISMO paquete IP (mismas IPs origen y destino) dentro de una nueva trama con MAC origen R2 y MAC destino BB. "El paquete no cambia, la trama sí".'
      }
    ],

    chapterQuizzes: {
      map: [
        {
          id: 'cq-map-1',
          question: 'Según el mapa de capas 1 a 3, ¿en qué capas opera un Access Point (AP) y en qué se diferencia de un Router?',
          options: [
            'El AP opera en Capa 3 igual que un router, pero sin cables',
            'El AP es un puente inalámbrico de Capas 1 y 2 (802.1D), mientras que el Router opera hasta Capa 3 decidiendo por IP',
            'El AP opera únicamente en Capa 1 como un repetidor pasivo',
            'Ambos operan hasta Capa 4 inspeccionando puertos TCP/UDP'
          ],
          correctIndex: 1,
          explanation: 'Como muestra el mapa conceptual, el AP puentea tramas 802.11–Ethernet en Capa 2 (802.1D) sobre la física inalámbrica; el dispositivo de Capa 3 que encamina paquetes entre redes distintas es el Router.'
        },
        {
          id: 'cq-map-2',
          question: 'En el mapa se destaca que la Capa Física (Capa 1) dialoga directamente con la Subcapa MAC. ¿Qué restricción física explica la regla 2τ de Ethernet y el uso de ACK en Wi-Fi?',
          options: [
            'La imposibilidad de encapsular direcciones IPv6 en tramas Ethernet',
            'El retardo de propagación τ en cable (trama mínima 64 B) y la imposibilidad en radio de escuchar mientras se transmite',
            'El tamaño fijo de 40 bytes de la cabecera IPv4',
            'La falta de direcciones MAC únicas en las tarjetas de red'
          ],
          correctIndex: 1,
          explanation: 'La física del medio condiciona a la MAC: en cable compartido el retardo τ obliga a que la trama dure al menos 2τ; en radio la señal propia tapa las ajenas, obligando a evitar colisiones (CSMA/CA) y confirmar con ACK.'
        },
        {
          id: 'cq-map-3',
          question: '¿Qué subcapa sirve de interfaz entre la MAC de Capa 2 y los protocolos de Capa 3 como IPv4 o IPv6?',
          options: [
            'La subcapa PHY mediante MDI',
            'La subcapa LLC (Logical Link Control)',
            'El protocolo STP (802.1D)',
            'El protocolo NAT/PAT'
          ],
          correctIndex: 1,
          explanation: 'La Capa 2 se divide en MAC (acceso al medio, direcciones y trama) y LLC (interfaz uniforme superior hacia la capa de red).'
        }
      ],
      mac: [
        {
          id: 'cq-mac-1',
          question: 'Al mover el deslizador de carga G en la gráfica de ALOHA, ¿en qué valores de G alcanzan su rendimiento máximo S ALOHA puro y ALOHA ranurado?',
          options: [
            'ALOHA puro: 36,8% en G = 1; ALOHA ranurado: 18,4% en G = 0,5',
            'ALOHA puro: 18,4% en G = 0,5; ALOHA ranurado: 36,8% en G = 1',
            'Ambos alcanzan 50% en G = 1,5',
            'ALOHA puro: 100% en G = 0; ALOHA ranurado: 36,8% en G = 2'
          ],
          correctIndex: 1,
          explanation: 'En ALOHA puro S = G·e^(−2G), cuyo máximo es 1/(2e) ≈ 18,4% en G = 0,5 (período vulnerable 2T). Al ranurar el tiempo en slots, el período vulnerable baja a T y S = G·e^(−G) llega a 1/e ≈ 36,8% en G = 1.'
        },
        {
          id: 'cq-mac-2',
          question: 'En el diagrama espacio-tiempo de CSMA/CD, si B empieza a transmitir en t = τ − ε (justo antes de recibir la señal de A), ¿cuánto tiempo como máximo tarda A en enterarse de la colisión?',
          options: [
            'τ/2, porque la señal de colisión viaja al doble de velocidad',
            '2τ (≈ 51,2 µs en 10 Mb/s, equivalente a 512 bit-times = 64 bytes)',
            'T, igual que el período vulnerable de ALOHA ranurado',
            '0 µs, porque el switch bloquea el puerto instantáneamente'
          ],
          correctIndex: 1,
          explanation: 'La señal de A tarda τ en llegar a B y la ráfaga de colisión tarda otro τ en volver a A: en total 2τ. Por eso la trama mínima dura al menos 2τ (64 bytes a 10/100 Mb/s).'
        },
        {
          id: 'cq-mac-3',
          question: 'Comparando los tres escenarios inalámbricos del capítulo, ¿qué logra exactamente el intercambio RTS/CTS con el temporizador NAV?',
          options: [
            'Resuelve únicamente la terminal expuesta, pero no la oculta',
            'Ayuda frente a terminales ocultas porque los vecinos del receptor (como C al oír el CTS de B) fijan su NAV y esperan',
            'Elimina los ACK tras las tramas de datos unicast',
            'Hace que C pueda transmitir hacia D sin escuchar a B'
          ],
          correctIndex: 1,
          explanation: 'Cuando C no oye a A (terminal oculta), sí oye el CTS que envía el receptor B y actualiza su temporizador de portadora virtual NAV para abstenerse mientras dura el intercambio.'
        }
      ],
      ethernet: [
        {
          id: 'cq-ethernet-1',
          question: 'Si activás el interruptor "Incluir etiqueta VLAN 802.1Q (4 B)" en el explorador de trama, ¿cómo cambian la carga útil mínima y el tamaño máximo estándar de la trama?',
          options: [
            'La carga mínima sube a 50 B y la trama máxima queda en 1518 B',
            'La carga mínima baja de 46 a 42 B y la trama máxima sube de 1518 a 1522 B (excluyendo Preámbulo y SFD)',
            'El Preámbulo pasa de 7 B a 11 B para compensar los 4 bytes',
            'El FCS aumenta de 4 B a 8 B'
          ],
          correctIndex: 1,
          explanation: 'Los 4 bytes del tag 802.1Q se suman al encabezado (14 → 18 B): para que la trama mínima siga midiendo 64 B (18 + 42 + 4), la carga útil mínima baja a 42 B y el máximo pasa de 1518 a 1522 B.'
        },
        {
          id: 'cq-ethernet-2',
          question: '¿Qué indica el campo de 2 bytes "Long / Tipo" cuando contiene un valor menor o igual a 1500 frente a un valor mayor o igual a 1536 (0x0600)?',
          options: [
            '≤ 1500 indica EtherType (ej. IPv4); ≥ 1536 indica longitud de datos',
            '≤ 1500 indica longitud de la carga (IEEE 802.3 + LLC); ≥ 1536 indica EtherType directo (Ethernet II, ej. 0x0800 IPv4)',
            '≤ 1500 indica trama de gestión Wi-Fi; ≥ 1536 indica trama de datos',
            'Ambos rangos indican siempre la cantidad de bits del Preámbulo'
          ],
          correctIndex: 1,
          explanation: 'Como el MTU estándar es 1500 B, valores ≤ 1500 representan la longitud de datos (formato 802.3 + LLC) y valores ≥ 0x0600 (1536) identifican el protocolo superior vía EtherType.'
        },
        {
          id: 'cq-ethernet-3',
          question: 'Según la tabla de evolución PHY, ¿qué caracteriza a 1000BASE-T frente a 10GBASE-T y 10GBASE-SR/LR?',
          options: [
            '1000BASE-T usa 2 pares Cat 3 con Manchester; 10GBASE-T usa coaxial',
            '1000BASE-T usa 4 pares Cat 5e con PAM-5 + DSP (250 Mb/s bidireccional por par), mientras que desde 10G todas las variantes son solo full-duplex sin CSMA/CD',
            '10GBASE-T mantiene half-duplex con extensión de portadora hasta 100 m',
            '100BASE-TX y 1000BASE-T usan ambos codificación 64B/66B sobre fibra'
          ],
          correctIndex: 1,
          explanation: '1000BASE-T logra 1 Gb/s usando los 4 pares de Cat 5e en ambos sentidos a la vez (PAM-5 + cancelación de eco). Desde 10 Gb/s (802.3ae y 10GBASE-T) desaparece el half-duplex y CSMA/CD.'
        }
      ],
      switching: [
        {
          id: 'cq-switching-1',
          question: 'En el simulador de Tabla MAC (con tabla inicialmente vacía), si Host A envía una trama unicast hacia Host B, ¿qué hace el switch en ese primer envío?',
          options: [
            'Descarta la trama porque aún no conoce la MAC de B',
            'Aprende AA:11 → P1 (MAC de origen) e inunda la trama por P2, P3 y P4 porque aún desconoce dónde está BB:22',
            'Reenvía la trama únicamente hacia P2 usando la tabla ARP',
            'Aprende BB:22 → P2 mirando la MAC destino'
          ],
          correctIndex: 1,
          explanation: 'El switch siempre aprende mirando la MAC de origen (AA:11 → P1). Como BB:22 todavía no está en la tabla MAC, inunda la trama por todos los puertos salvo el de entrada (P1).'
        },
        {
          id: 'cq-switching-2',
          question: 'Si hay 4 PCs conectadas a un Switch L2 sin VLANs y 4 PCs conectadas a un Hub, ¿cuántos dominios de colisión y de broadcast tiene cada dispositivo?',
          options: [
            'Switch: 1 dominio de colisión y 4 de broadcast; Hub: 4 de colisión y 1 de broadcast',
            'Switch: 4 dominios de colisión (1 por puerto) y 1 de broadcast; Hub: 1 de colisión y 1 de broadcast',
            'Ambos tienen 4 dominios de colisión y 4 de broadcast',
            'El Switch separa dominios de broadcast por puerto sin necesidad de VLANs ni Router'
          ],
          correctIndex: 1,
          explanation: 'Un Hub repite señales en Capa 1 (1 dominio de colisión y 1 de broadcast). El Switch separa 1 dominio de colisión por puerto, pero mantiene 1 dominio de broadcast salvo que se configuren VLANs.'
        },
        {
          id: 'cq-switching-3',
          question: 'En el diagrama de STP (802.1D) y las comparativas del capítulo, ¿cuál afirmación es CORRECTA?',
          options: [
            'STP pasa directo de Blocking a Forwarding y sirve para acelerar los switches',
            'STP bloquea enlaces redundantes (puerto B) para evitar bucles L2 y atraviesa Disabled → Blocking → Listening → Learning → Forwarding',
            'Cut-through valida siempre el FCS antes de reenviar; Store-and-forward no lo verifica',
            'PoE+ (802.3at) entrega 15,4 W máximos en el PSE y 12,95 W mínimos en el PD'
          ],
          correctIndex: 1,
          explanation: 'STP (802.1D) evita tormentas de broadcast bloqueando enlaces redundantes y pasando por Listening y Learning antes de Forwarding. Store-and-forward es quien verifica FCS, y 802.3at entrega 30 W PSE / 25,5 W PD.'
        }
      ],
      wifi: [
        {
          id: 'cq-wifi-1',
          question: 'Usando la calculadora de presupuesto de enlace del capítulo con Pt = 20 dBm, Gt = 3 dBi, Gr = 2 dBi y pérdidas totales de 90 dB, ¿qué potencia recibida Pr obtenés y qué canales de 2,4 GHz no se solapan?',
          options: [
            'Pr = −65 dBm; canales 1, 6 y 11',
            'Pr = −70 dBm; canales 1, 3 y 6',
            'Pr = +65 dBm; canales 1, 6 y 11',
            'Pr = −65 dBm; todos los canales del 1 al 11'
          ],
          correctIndex: 0,
          explanation: 'Pr = Pt + Gt + Gr − L = 20 + 3 + 2 − 90 = −65 dBm. Y como muestra la gráfica de 2,4 GHz, solo los canales 1, 6 y 11 no se solapan entre sí.'
        },
        {
          id: 'cq-wifi-2',
          question: 'En la matriz interactiva To DS / From DS de 802.11, ¿cuándo aparece Address 4 (encabezado de 30 bytes) y qué hay en Address 1..3 cuando To DS = 1 y From DS = 0?',
          options: [
            'Address 4 aparece en modo Ad Hoc (0,0); en (1,0) A1 es el Servidor',
            'Address 4 aparece solo en WDS (To DS = 1, From DS = 1); en (1,0) A1 = RA (BSSID del AP), A2 = TA = SA (Notebook) y A3 = DA (Servidor)',
            'Address 4 aparece siempre en modo infraestructura; en (1,0) A3 es el BSSID',
            'Todas las tramas de datos 802.11 miden exactamente 24 bytes de cabecera sin excepción'
          ],
          correctIndex: 1,
          explanation: 'En To DS = 1, From DS = 0 (Notebook → AP → Servidor) bastan 3 direcciones (24 B) porque TA = SA. Solo en enlaces puente WDS (To DS = 1, From DS = 1) los 4 roles difieren y se usa Address 4 (30 B).'
        },
        {
          id: 'cq-wifi-3',
          question: 'Respecto al acceso DCF/EDCA y la secuencia de seguridad mostrados al pie del capítulo Wi-Fi, ¿qué afirmación es VERDADERA?',
          options: [
            'SIFS es más largo que DIFS, y el backoff se reinicia a un valor nuevo cada vez que se ocupa el canal',
            'SIFS < PIFS < DIFS < EIFS, el backoff se congela cuando el canal se ocupa, y tras Open/SAE + Asociación el 4-Way Handshake deriva PTK y GTK',
            'El Beacon se emite cada 1000 ms y reemplaza al 4-Way Handshake',
            'En WPA2-Personal el 4-Way Handshake envía la passphrase en texto claro al AP'
          ],
          correctIndex: 1,
          explanation: 'SIFS es el espaciado más corto (prioriza ACK/CTS), el contador de backoff se congela si el medio se ocupa, y en seguridad el 4-Way Handshake prueba la PMK sin enviar la contraseña para derivar PTK y GTK.'
        }
      ],
      network: [
        {
          id: 'cq-network-1',
          question: 'Comparando los diagramas clicables de cabeceras IPv4 e IPv6, ¿qué cambios clave introduce la cabecera fija de 40 bytes de IPv6?',
          options: [
            'Agrega un campo IHL variable y un Checksum más largo de 32 bits',
            'Elimina IHL, Checksum de cabecera y campos de fragmentación en cabecera fija; Protocol pasa a Cabecera Siguiente y TTL a Límite de Saltos',
            'Mantiene la fragmentación obligatoria en todos los routers intermedios',
            'Reduce las direcciones de 128 bits a 48 bits'
          ],
          correctIndex: 1,
          explanation: 'La cabecera fija de IPv6 (40 B) simplifica el trabajo de los routers eliminando IHL, el checksum de cabecera y la fragmentación en tránsito (el origen descubre Path MTU ≥ 1280 B).'
        },
        {
          id: 'cq-network-2',
          question: 'En el animador "El paquete no cambia, la trama sí" (Host A 192.168.1.10 → Router → Host B 10.0.0.20), ¿qué ocurre en los pasos 2 y 5?',
          options: [
            'En el paso 2 Host A pide por ARP la MAC de Host B; en el paso 5 el Router cambia la IP origen a la suya',
            'En el paso 2 Host A resuelve por ARP la MAC del Gateway (R1); en el paso 5 el Router arma una nueva trama (MAC R2 → BB) manteniendo intactas las IPs 192.168.1.10 → 10.0.0.20',
            'Host A no necesita ARP ni máscara porque el switch encamina por IP',
            'El router reenvía exactamente la misma trama Ethernet sin cambiar las MACs'
          ],
          correctIndex: 1,
          explanation: 'Al detectar con AND que 10.0.0.20 es remoto, Host A busca por ARP la MAC del Gateway (no la de B). Luego el router desencapsula, decrementa TTL y re-encapsula el mismo paquete IP con las MAC de la Red 2.'
        },
        {
          id: 'cq-network-3',
          question: 'Según la tabla de protocolos y enrutamiento de este capítulo, ¿cuál relación es CORRECTA?',
          options: [
            'DHCP usa DISCOVER-OFFER-REQUEST-ACK; RIP es Estado del Enlace (Dijkstra) y OSPF es Vector Distancia (Bellman-Ford)',
            'DHCP usa DISCOVER-OFFER-REQUEST-ACK con lease; NAT/PAT es con estado y toca Capa 4; RIP usa Bellman-Ford y OSPF usa Dijkstra',
            'ARP resuelve MAC → IP; NAT es completamente sin estado (stateless)',
            'Vector Distancia inunda la topología completa a toda la red'
          ],
          correctIndex: 1,
          explanation: 'DHCP sigue la secuencia DORA con arrendamiento; NAT guarda estado y modifica puertos de capa 4; Vector Distancia (RIP, IGRP) usa Bellman-Ford con vecinos y Estado del Enlace (OSPF, IS-IS) usa Dijkstra con mapa completo.'
        }
      ]
    }
  };

  App.GLOSSARY_TERMS = [
    /* MAC */
    { term: 'LLC (Logical Link Control)', group: 'mac', definition: 'Subcapa superior del enlace (802.2); da una interfaz uniforme hacia la capa de red.' },
    { term: 'MAC (Medium Access Control)', group: 'mac', definition: 'Subcapa inferior del enlace; define direcciones MAC, formato de trama y quién transmite y cuándo.' },
    { term: 'Canal compartido', group: 'mac', definition: 'Medio donde varias estaciones compiten y solo una transmite con éxito a la vez.' },
    { term: 'Asignación estática (FDM, TDM)', group: 'mac', definition: 'El canal se reparte por adelantado; desperdicia capacidad con tráfico en ráfagas.' },
    { term: 'Asignación dinámica', group: 'mac', definition: 'Se decide en tiempo real quién usa el canal; es el problema central que resuelve la MAC.' },
    { term: 'Colisión', group: 'mac', definition: 'Superposición de dos o más tramas en el tiempo; la señal se distorsiona y ambas se pierden.' },
    { term: 'Detección de portadora (carrier sense)', group: 'mac', definition: 'Capacidad de escuchar si hay una señal en el canal antes de transmitir.' },
    { term: 'Retardo de propagación (τ)', group: 'mac', definition: 'Tiempo que tarda la señal en recorrer el medio; es la causa de las colisiones en CSMA.' },
    { term: 'Carga ofrecida (G) y rendimiento (S)', group: 'mac', definition: 'G = intentos por tiempo de trama; S = tramas exitosas por tiempo de trama.' },
    { term: 'ALOHA puro', group: 'mac', definition: 'Transmite apenas hay una trama; período vulnerable 2T; S = G·e^(−2G), máximo 18,4% en G = 0,5.' },
    { term: 'ALOHA ranurado', group: 'mac', definition: 'Transmite solo al inicio de slots sincronizados; vulnerable T; S = G·e^(−G), máximo 36,8% en G = 1.' },
    { term: 'Período vulnerable', group: 'mac', definition: 'Intervalo temporal en el que el inicio de otra transmisión provoca colisión (2T en ALOHA puro, T en ranurado).' },
    { term: 'CSMA', group: 'mac', definition: 'Carrier Sense Multiple Access: sensa antes de transmitir; variantes 1-persistente, no persistente y p-persistente.' },
    { term: 'Efecto estampida', group: 'mac', definition: 'En CSMA 1-persistente, las estaciones en espera transmiten juntas apenas se libera el canal.' },
    { term: 'CSMA/CD', group: 'mac', definition: 'CSMA con detección de colisiones mientras transmite; envía jam, aborta y aplica backoff exponencial binario.' },
    { term: 'Señal de jam', group: 'mac', definition: 'Ráfaga que refuerza la colisión para que todas las estaciones involucradas la reconozcan (32 bits en las diapositivas).' },
    { term: 'Backoff exponencial binario', group: 'mac', definition: 'Tras la colisión i se espera entre 0 y 2^i − 1 slots; tope 1023 (desde i = 10) y abandono tras 16 colisiones.' },
    { term: 'Slot time', group: 'mac', definition: '512 bit-times (51,2 µs a 10 Mb/s); ventana máxima 2τ para detectar una colisión.' },
    { term: 'Trama mínima y 2τ', group: 'mac', definition: 'La trama debe durar al menos 2τ para que el emisor se entere de una colisión remota (64 bytes en Ethernet).' },
    { term: 'Colisión tardía', group: 'mac', definition: 'Colisión ocurrida después del slot time; señala error de longitud, cableado o duplex mismatch.' },
    { term: 'Producto ancho de banda-retardo', group: 'mac', definition: 'Cuántos bits o tramas caben en el canal en tránsito; cuanto mayor es, peor rinde CSMA.' },
    { term: 'Protocolo de mapa de bits', group: 'mac', definition: 'Protocolo sin colisiones con N ranuras de reserva previas, una por estación.' },
    { term: 'Paso de testigo (token passing)', group: 'mac', definition: 'Acceso controlado donde circula un token en orden y solo transmite quien lo posee.' },
    { term: 'Acceso controlado', group: 'mac', definition: 'Familia de protocolos donde se otorga permiso explícito para transmitir (polling, token passing).' },
    { term: 'Contención limitada', group: 'mac', definition: 'Protocolos híbridos que combinan contención con baja carga y reserva con alta carga.' },
    { term: 'Terminal oculta', group: 'mac', definition: 'Dos estaciones que no se oyen entre sí transmiten a un mismo receptor y chocan allí.' },
    { term: 'Terminal expuesta', group: 'mac', definition: 'Estación que se abstiene de transmitir por oír a una vecina, aunque su transmisión no interferiría en los receptores.' },
    { term: 'MACA', group: 'mac', definition: 'Multiple Access with Collision Avoidance (Karn, 1990): precursor de RTS/CTS con tramas cortas de reserva.' },
    { term: 'CSMA/CA', group: 'mac', definition: 'Evita colisiones en 802.11 con backoff previo, ACK por trama y RTS/CTS opcional.' },
    { term: 'DIFS / SIFS', group: 'mac', definition: 'Espaciados entre tramas en 802.11: SIFS (corto) para respuestas inmediatas (ACK/CTS); DIFS para iniciar contienda.' },
    { term: 'RTS / CTS', group: 'mac', definition: 'Request To Send / Clear To Send: tramas cortas opcionales que reservan el canal frente a terminales ocultas.' },
    { term: 'NAV (Network Allocation Vector)', group: 'mac', definition: 'Temporizador de portadora virtual alimentado por el campo Duration; indica cuánto tiempo abstenerse de transmitir.' },

    /* Ethernet y Conmutación */
    { term: 'IEEE 802.3', group: 'ethernet', definition: 'Estándar de LAN cableada derivada de Ethernet; una MAC común con capas físicas (PHY) intercambiables.' },
    { term: 'DIX', group: 'ethernet', definition: 'Digital, Intel y Xerox; especificación Ethernet v1/v2 previa a la norma IEEE 802.3.' },
    { term: 'PHY, RS/xMII, MDI', group: 'ethernet', definition: 'Capa física, interfaz de adaptación a la MAC y conector físico con el medio.' },
    { term: 'Preámbulo (7 B) y SFD (1 B)', group: 'ethernet', definition: 'Secuencia de sincronización (0x55) y delimitador de inicio (0xD5); no cuentan en los 64–1518 bytes.' },
    { term: 'Dirección MAC', group: 'ethernet', definition: 'Identificador plano de 48 bits grabado en la NIC: 24 bits OUI del fabricante + 24 bits propios.' },
    { term: 'Bit I/G y bit U/L', group: 'ethernet', definition: 'Bits de la dirección MAC: Individual/Grupo (unicast vs multicast/broadcast) y Universal/Local.' },
    { term: 'Unicast, multicast y broadcast', group: 'ethernet', definition: 'Una interfaz concreta, un grupo (ej. 01:00:5E:...) o todas las de la LAN (FF:FF:FF:FF:FF:FF).' },
    { term: 'Length/Type', group: 'ethernet', definition: 'Campo de 2 B: ≤ 1500 es longitud (802.3 + LLC); ≥ 1536 (0x0600) es EtherType (0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6).' },
    { term: 'Padding', group: 'ethernet', definition: 'Relleno agregado por la MAC Ethernet para alcanzar el mínimo de 46 B de carga (42 B con etiqueta 802.1Q).' },
    { term: 'FCS', group: 'ethernet', definition: 'Frame Check Sequence (CRC-32 de 4 bytes); detecta errores desde MAC Destino hasta datos/pad y descarta si falla.' },
    { term: 'MTU (1500 B)', group: 'ethernet', definition: 'Maximum Transmission Unit: carga útil máxima estándar de una trama Ethernet (limita el tamaño sin fragmentar de IP).' },
    { term: 'Etiqueta 802.1Q', group: 'ethernet', definition: '4 bytes agregados a la trama Ethernet para identificar la VLAN (eleva trama máxima a 1522 B).' },
    { term: 'Jumbo frame', group: 'ethernet', definition: 'Extensión de proveedor con carga útil de ~9000 bytes.' },
    { term: 'IFG', group: 'ethernet', definition: 'Interframe Gap: separación de 96 bit-times entre tramas consecutivas.' },
    { term: 'LLC/SNAP', group: 'ethernet', definition: 'Cabecera dentro de datos usada junto al campo Longitud en 802.3 para identificar el protocolo superior.' },
    { term: 'Manchester', group: 'ethernet', definition: 'Codificación con transición en el centro de cada bit (autorreloj); usada en 10 Mb/s (hasta 20 MBd).' },
    { term: '4B/5B, MLT-3, NRZI', group: 'ethernet', definition: 'Codificaciones de 100BASE-TX (125 MBd para 100 Mb/s sobre 2 pares Cat 5+).' },
    { term: '8B/10B', group: 'ethernet', definition: 'Codificación usada en Gigabit Ethernet 1000BASE-X sobre fibra o cobre corto.' },
    { term: 'PAM-5 / PAM-16', group: 'ethernet', definition: 'Modulaciones multinivel usadas en 1000BASE-T y 10GBASE-T junto a DSP y cancelación de eco.' },
    { term: 'Autonegociación', group: 'ethernet', definition: 'Mecanismo por pulsos de enlace para acordar velocidad, duplex y rol master/slave.' },
    { term: 'Duplex mismatch', group: 'ethernet', definition: 'Desajuste con un extremo en full-duplex y otro en half-duplex; causa colisiones tardías y errores CRC.' },
    { term: 'Extensión de portadora y ráfagas de tramas', group: 'ethernet', definition: 'Mejoras de 1 Gb/s half-duplex (slot time 512 B) para conservar un diámetro de ~200 m.' },
    { term: 'Dominio de colisión', group: 'ethernet', definition: 'Conjunto de equipos cuyas tramas pueden colisionar; en un switch hay uno por puerto.' },
    { term: 'Hub / repetidor', group: 'ethernet', definition: 'Dispositivos de capa 1 que regeneran o repiten señal eléctrica por todos los puertos.' },
    { term: 'Switch / puente', group: 'ethernet', definition: 'Dispositivo de capa 2 que filtra y reenvía según la MAC destino; "switch" es el nombre moderno de "puente".' },
    { term: 'Tabla MAC', group: 'ethernet', definition: 'Tabla en el switch que asocia direcciones MAC aprendidas con puertos físicos.' },
    { term: 'Aprendizaje hacia atrás', group: 'ethernet', definition: 'El switch inspecciona la MAC de origen de cada trama entrante para aprender el puerto y purga entradas viejas.' },
    { term: 'Inundación y filtrado', group: 'ethernet', definition: 'Inunda por otros puertos si el destino es desconocido o broadcast; descarta si origen y destino están en el mismo puerto.' },
    { term: 'Store-and-forward / cut-through', group: 'ethernet', definition: 'Reenviar tras validar el FCS completo (+latencia, sin errores) o apenas leer la MAC destino (-latencia).' },
    { term: 'Backplane', group: 'ethernet', definition: 'Bus o matriz interna de alta velocidad del switch que permite múltiples conmutaciones simultáneas.' },
    { term: 'STP (802.1D) y BPDU', group: 'ethernet', definition: 'Spanning Tree Protocol: intercambia BPDUs para bloquear enlaces redundantes y dejar un árbol L2 sin lazos.' },
    { term: 'Puente raíz / puerto raíz', group: 'ethernet', definition: 'Puente con menor ID elegido raíz en STP; el root port es el puerto con mejor camino hacia él.' },
    { term: 'Estados de puerto STP', group: 'ethernet', definition: 'Secuencia en 802.1D: Disabled, Blocking, Listening, Learning y Forwarding.' },
    { term: 'VLAN (802.1Q)', group: 'ethernet', definition: 'Partición lógica de capa 2 (un dominio de broadcast por VLAN); comunicar distintas VLANs requiere un router.' },
    { term: 'PoE (PSE y PD)', group: 'ethernet', definition: 'Power over Ethernet: 802.3af (15,4 W PSE / 12,95 W PD) y PoE+ 802.3at (30 W PSE / 25,5 W PD).' },

    /* Wi-Fi 802.11 */
    { term: 'STA, AP', group: 'wifi', definition: 'Estación cliente inalámbrica y Access Point (puente inalámbrico 802.1D).' },
    { term: 'BSS, IBSS, DS', group: 'wifi', definition: 'Basic Service Set (celda de un AP), Independent BSS (ad hoc sin AP) y Distribution System.' },
    { term: 'SSID / BSSID', group: 'wifi', definition: 'Nombre legible de la red Wi-Fi / identificador único del BSS (dirección MAC del AP).' },
    { term: 'Beacon', group: 'wifi', definition: 'Trama de gestión (subtipo 8) emitida cada 100 TU (102,4 ms) anunciando SSID, tasas, TSF y seguridad.' },
    { term: 'TU, TSF', group: 'wifi', definition: 'Time Unit = 1024 µs; Time Synchronization Function para sincronizar relojes del BSS.' },
    { term: 'TIM / DTIM', group: 'wifi', definition: 'Mapas en el Beacon que anuncian tráfico almacenado en el AP para clientes en ahorro de energía.' },
    { term: 'Probe Request', group: 'wifi', definition: 'Trama de gestión enviada por una STA para descubrir redes activamente.' },
    { term: 'ISM / U-NII', group: 'wifi', definition: 'Bandas sin licencia individual (2,4 GHz ISM / 5 y 6 GHz U-NII), sujetas igualmente a regulación de potencia y uso.' },
    { term: 'Canales 1, 6 y 11', group: 'wifi', definition: 'Plan clásico de tres canales que no se solapan en la banda de 2,4 GHz.' },
    { term: 'DFS', group: 'wifi', definition: 'Dynamic Frequency Selection: detecta radares en subbandas de 5 GHz y obliga a abandonar el canal.' },
    { term: 'dB, dBi, dBm', group: 'wifi', definition: 'Relación logarítmica de potencias; ganancia respecto a antena isotrópica; potencia absoluta respecto a 1 mW.' },
    { term: 'Presupuesto de enlace', group: 'wifi', definition: 'Cálculo Pr = Pt + Gt + Gr − pérdidas para verificar si supera la sensibilidad del receptor.' },
    { term: 'OFDM', group: 'wifi', definition: 'Subportadoras ortogonales (en 802.11a: 48 datos + 4 pilotos) con prefijo cíclico frente a multitrayectoria.' },
    { term: 'QAM', group: 'wifi', definition: 'Modulación en amplitud y fase (ej. 256-QAM = 8 bits/símbolo; 1024-QAM = 10 bits/símbolo en Wi-Fi 6).' },
    { term: 'MIMO', group: 'wifi', definition: 'Múltiples antenas y radios para diversidad (robustez) o multiplexación espacial (más flujos y tasa).' },
    { term: 'SU-MIMO / MU-MIMO', group: 'wifi', definition: 'Flujos espaciales hacia un solo usuario o hacia múltiples usuarios simultáneamente.' },
    { term: 'Beamforming', group: 'wifi', definition: 'Ponderación de fase y amplitud entre antenas para sumar energía en la dirección del receptor (no crea potencia).' },
    { term: 'OFDMA', group: 'wifi', definition: 'Reparte subportadoras en Resource Units (RU) entre distintos usuarios a la vez en 802.11ax (trigger frame en UL).' },
    { term: 'BSS Coloring', group: 'wifi', definition: 'Identificador de BSS (1–63) en la señalización PHY de 802.11ax para reutilización espacial en redes densas.' },
    { term: 'Wi-Fi 4, 5, 6 y 6E', group: 'wifi', definition: 'Nombres comerciales de 802.11n, 802.11ac, 802.11ax y 802.11ax operando en la banda de 6 GHz.' },
    { term: 'DCF', group: 'wifi', definition: 'Distributed Coordination Function: mecanismo base CSMA/CA con DIFS, backoff congelable y ACK tras SIFS.' },
    { term: 'Backoff 802.11', group: 'wifi', definition: 'Entero en [0, CW] descontado en ranuras libres (se congela si se ocupa); CW se duplica al fallar.' },
    { term: 'PCF', group: 'wifi', definition: 'Point Coordination Function: polling centralizado por el AP usando PIFS; casi sin uso práctico.' },
    { term: 'EDCA, AC, AIFS, TXOP', group: 'wifi', definition: 'Extensión QoS 802.11e con 4 categorías (VO, VI, BE, BK), AIFS = SIFS + AIFSN×Slot y oportunidad de transmisión TXOP.' },
    { term: 'SIFS / PIFS / DIFS / EIFS', group: 'wifi', definition: 'Espaciados de menor a mayor: respuestas inmediatas, PCF, contienda DCF y espera extendida tras trama errónea.' },
    { term: 'To DS / From DS', group: 'wifi', definition: 'Indicadores en Frame Control que determinan el significado de Address 1–4 en tramas de datos.' },
    { term: 'RA, TA, DA, SA', group: 'wifi', definition: 'Receiver/Transmitter Address (salto de radio) y Destination/Source Address (extremos lógicos).' },
    { term: 'WDS', group: 'wifi', definition: 'Wireless Distribution System: enlace puente AP-AP con To DS = 1 y From DS = 1 (usa 4 direcciones).' },
    { term: 'Open System', group: 'wifi', definition: 'Autenticación 802.11 sin verificación de contraseña que precede a la asociación en WPA2/Enterprise.' },
    { term: 'WEP, WPA, WPA2, WPA3', group: 'wifi', definition: 'Evolución de seguridad: WEP (RC4 roto), WPA (TKIP), WPA2 (AES-CCMP) y WPA3 (SAE + CCMP/GCMP + PMF).' },
    { term: 'PMK, PTK, GTK', group: 'wifi', definition: 'Pairwise Master Key, Pairwise Transient Key (unicast) y Group Temporal Key (broadcast/multicast).' },
    { term: '4-Way Handshake', group: 'wifi', definition: 'Intercambio EAPOL-Key que prueba posesión de PMK con nonces/MIC y deriva PTK y GTK sin enviar la clave.' },
    { term: '802.1X / EAP / RADIUS', group: 'wifi', definition: 'Control de acceso por puerto, protocolo extensible de autenticación y servidor de autenticación en modo Enterprise.' },
    { term: 'SAE', group: 'wifi', definition: 'Simultaneous Authentication of Equals: acuerdo autenticado de claves de WPA3-Personal resistente a diccionario offline.' },

    /* Capa de Red */
    { term: 'Capa de red', group: 'red', definition: 'Proporciona conectividad y selección de ruta extremo a extremo entre redes distintas; sirve a la capa de transporte.' },
    { term: 'Paquete / datagrama', group: 'red', definition: 'Unidad de datos de capa 3; en redes de datagramas cada paquete se encamina independientemente sin conexión previa.' },
    { term: 'Conmutación de paquetes / circuito virtual', group: 'red', definition: 'Sin estado por conexión (datagramas como IP) frente a establecimiento previo de ruta fija con estado (VC).' },
    { term: 'Direccionamiento plano / jerárquico', group: 'red', definition: 'MAC es plano (sin estructura geográfica/topológica); IP es jerárquico (prefijo de red + host) para escalar el ruteo.' },
    { term: 'IPv4', group: 'red', definition: 'Protocolo de red sin conexión y no confirmado con direcciones de 32 bits (4 octetos).' },
    { term: 'Máscara y prefijo (/n)', group: 'red', definition: 'Indican cuántos bits corresponden a la red; el AND bit a bit con la IP extrae la dirección de red.' },
    { term: 'Hosts utilizables', group: 'red', definition: 'Cantidad de direcciones asignables a hosts en una subred: 2^(bits de host) − 2 (excluye red y broadcast).' },
    { term: 'Clases A, B, C, D, E', group: 'red', definition: 'Esquema histórico anterior a 1993 según primeros bits del primer octeto; reemplazado por CIDR.' },
    { term: 'CIDR', group: 'red', definition: 'Classless Inter-Domain Routing: direccionamiento sin clases con prefijos de longitud variable.' },
    { term: 'Subred / subnetting', group: 'red', definition: 'Dividir una red pidiendo bits prestados a la parte de host para reducir dominios de broadcast y organizar rutas.' },
    { term: 'VLSM', group: 'red', definition: 'Variable Length Subnet Mask: asignar máscaras de distinto tamaño según los hosts necesarios en cada sector.' },
    { term: 'Prefijo más largo', group: 'red', definition: 'Regla de reenvío en routers: ante varias rutas coincidentes gana la máscara con más bits (más específica).' },
    { term: 'IP privadas y públicas', group: 'red', definition: 'Privadas: 10/8, 172.16/12 y 192.168/16 (no enrutables en Internet; requieren NAT).' },
    { term: 'TTL', group: 'red', definition: 'Time To Live: contador decrementado por cada router; al llegar a 0 se descarta el paquete (corta lazos de ruteo).' },
    { term: 'Fragmentación (DF, MF, offset)', group: 'red', definition: 'División de un datagrama IPv4 mayor que la MTU; se reensambla únicamente en el host destino.' },
    { term: 'Gateway / ruta por defecto', group: 'red', definition: 'Router de salida usado por un host cuando el destino está fuera de su red local.' },
    { term: 'El paquete no cambia, la trama sí', group: 'red', definition: 'Sin NAT, las IP origen/destino se conservan de punta a punta mientras las direcciones MAC cambian en cada salto.' },
    { term: 'Vector distancia / estado del enlace', group: 'red', definition: 'Familias dinámicas: Bellman-Ford con vecinos (RIP, IGRP) frente a Dijkstra con topología completa (OSPF, IS-IS).' },
    { term: 'Lazo de enrutamiento', group: 'red', definition: 'Dos o más routers se reenvían el mismo paquete en ciclo hasta que su TTL llega a 0.' },
    { term: 'ARP y caché ARP', group: 'red', definition: 'Resuelve IP → MAC dentro de la LAN por broadcast de capa 2; almacena entradas temporalmente en memoria.' },
    { term: 'Proxy ARP / ARP gratuito', group: 'red', definition: 'Router que responde por otro segmento con su MAC / consulta por la propia IP para detectar IP duplicada.' },
    { term: 'RARP, BOOTP, DHCP', group: 'red', definition: 'MAC → IP (obsoleto), arranque con mapa fijo y asignación dinámica con arrendamiento (lease).' },
    { term: 'DISCOVER / OFFER / REQUEST / ACK', group: 'red', definition: 'Los cuatro mensajes del proceso DORA en DHCP para asignar dirección IP, máscara, gateway y DNS.' },
    { term: 'ICMP', group: 'red', definition: 'Internet Control Message Protocol: notifica errores y diagnóstico sobre IP (ping = Echo, traceroute = Time Exceeded).' },
    { term: 'IGMP', group: 'red', definition: 'Protocolo que gestiona la pertenencia de hosts a grupos multicast.' },
    { term: 'NAT / PAT', group: 'red', definition: 'Traducción de direcciones y puertos TCP/UDP; vuelve con estado al router, viola capas y bloquea entrantes por defecto.' },
    { term: 'Port forwarding, uPnP', group: 'red', definition: 'Mecanismos manual o automático para redirigir puertos externos del router NAT hacia hosts internos.' },
    { term: 'IPv6', group: 'red', definition: '128 bits en 8 grupos hex; cabecera fija 40 B; sin checksum, sin fragmentación en routers y sin broadcast.' },
    { term: 'Direcciones IPv6 especiales', group: 'red', definition: '::/128 (sin dirección), ::1/128 (loopback), fe80::/10 (enlace local) y fc00::/7 (local única).' },
    { term: 'NDP', group: 'red', definition: 'Neighbor Discovery Protocol: reemplaza a ARP en IPv6 utilizando mensajes ICMPv6 y multicast.' }
  ];
})();
