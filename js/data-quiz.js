(function () {
  'use strict';

  var App = window.RedesApp = window.RedesApp || {};

  App.QUIZ_QUESTIONS = [
    /* ==================== UNIDAD 2: SUBCAPA MAC (15) ==================== */
    {
      id: 'u2-01',
      unit: 'u2',
      topic: 'Capa de enlace y MAC',
      isTrap: true,
      question: '¿A qué capa superior presta servicio directamente la capa de enlace (LLC + MAC)?',
      options: [
        'A la capa de transporte',
        'A la capa de red',
        'A la capa física',
        'A la capa de aplicación'
      ],
      correctIndex: 1,
      explanation: 'Según el apunte (2.1 y 9.2), la capa de enlace maneja errores, entrama y presta servicios a la capa de red (no a la de transporte ni a la física).'
    },
    {
      id: 'u2-02',
      unit: 'u2',
      topic: 'Asignación estática vs dinámica',
      isTrap: false,
      question: '¿Por qué la asignación estática (FDM/TDM) resulta ineficiente frente a la asignación dinámica de la MAC en redes LAN?',
      options: [
        'Porque FDM y TDM requieren direcciones MAC de 128 bits',
        'Porque ante tráfico en ráfagas la mayoría de los canales fijos quedan ociosos casi todo el tiempo',
        'Porque FDM y TDM solo funcionan sobre fibra óptica monomodo',
        'Porque la asignación estática genera el doble de colisiones que ALOHA puro'
      ],
      correctIndex: 1,
      explanation: 'Cuando el tráfico es en ráfagas o impredecible, repartir el canal por adelantado deja ociosos los subcanales asignados a estaciones sin datos, desperdiciando capacidad.'
    },
    {
      id: 'u2-03',
      unit: 'u2',
      topic: 'Confiabilidad MAC',
      isTrap: false,
      question: 'Respecto de la confiabilidad en los protocolos de multiacceso (MAC), ¿qué advierte el apunte?',
      options: [
        'CSMA/CD garantiza entrega confiable sin pérdidas gracias a la señal de jam',
        'Ningún protocolo de multiacceso garantiza entrega confiable por sí solo',
        'ALOHA ranurado garantiza entrega libre de errores mediante sincronización global',
        'Solo los protocolos de canalización garantizan entrega sin errores de bits'
      ],
      correctIndex: 1,
      explanation: 'Incluso sin colisiones el receptor puede copiar mal parte de la trama; la confiabilidad la aportan otras funciones de enlace o las capas superiores.'
    },
    {
      id: 'u2-04',
      unit: 'u2',
      topic: 'ALOHA puro',
      isTrap: false,
      question: 'En ALOHA puro, ¿cuál es el período vulnerable de una trama de duración T y cuál es su rendimiento máximo S?',
      options: [
        'Período vulnerable T; S máximo ≈ 36,8% en G = 1',
        'Período vulnerable 2T; S máximo ≈ 18,4% en G = 0,5',
        'Período vulnerable 2τ; S máximo ≈ 50% en G = 0,5',
        'Período vulnerable T/2; S máximo ≈ 18,4% en G = 1'
      ],
      correctIndex: 1,
      explanation: 'En ALOHA puro S = G·e^(−2G). Cualquier trama iniciada entre t₀−T y t₀+T colisiona (período vulnerable 2T), alcanzando el máximo 1/(2e) ≈ 18,4% en G = 0,5.'
    },
    {
      id: 'u2-05',
      unit: 'u2',
      topic: 'ALOHA ranurado',
      isTrap: false,
      question: '¿Qué requisito introduce ALOHA ranurado para duplicar el rendimiento máximo hasta 1/e ≈ 36,8%?',
      options: [
        'Detectar colisiones en forma analógica mientras transmite',
        'Sincronización global para comenzar transmisiones solo al inicio de cada slot de duración T',
        'Reservar un canal de control separado mediante tramas RTS/CTS',
        'Usar tramas de tamaño variable según la carga ofrecida G'
      ],
      correctIndex: 1,
      explanation: 'Al alinear el comienzo de las tramas con slots globales de duración T, las colisiones se superponen por completo y el período vulnerable se reduce de 2T a T.'
    },
    {
      id: 'u2-06',
      unit: 'u2',
      topic: 'CSMA variantes',
      isTrap: false,
      question: '¿Qué fenómeno caracteriza al protocolo CSMA 1-persistente cuando el canal ocupado se libera?',
      options: [
        'Las estaciones esperan un tiempo aleatorio antes de volver a sensar',
        'Las estaciones en espera transmiten todas juntas con probabilidad 1 (efecto estampida)',
        'Cada estación transmite con probabilidad p y espera al siguiente slot con 1−p',
        'El AP asigna turnos mediante polling centralizado'
      ],
      correctIndex: 1,
      explanation: 'En CSMA 1-persistente todas las estaciones que estaban escuchando el canal ocupado se lanzan a transmitir apenas queda libre, generando el efecto estampida.'
    },
    {
      id: 'u2-07',
      unit: 'u2',
      topic: 'CSMA y retardo de propagación',
      isTrap: false,
      question: 'Si CSMA sensa el canal antes de transmitir, ¿por qué siguen ocurriendo colisiones?',
      options: [
        'Porque el sensor de portadora solo funciona en fibra óptica',
        'Por el retardo de propagación τ: una estación puede sensar libre porque la señal de otra aún no llegó',
        'Porque las tramas ACK siempre colisionan con las tramas de datos',
        'Porque CSMA no utiliza direcciones MAC de 48 bits'
      ],
      correctIndex: 1,
      explanation: 'Debido al retardo de propagación τ, dos estaciones pueden sensar el canal libre dentro de una ventana comparable a τ antes de recibir la señal de la otra.'
    },
    {
      id: 'u2-08',
      unit: 'u2',
      topic: 'CSMA/CD y slot time',
      isTrap: true,
      question: 'En CSMA/CD (Ethernet clásico de 10 Mb/s), ¿qué representa la duración de 51,2 µs (512 bit-times)?',
      options: [
        'El intervalo DIFS antes de competir por el medio',
        'El slot time mínimo equivalente a 2τ para detectar cualquier colisión en el diámetro de red',
        'El Interframe Gap (IFG) obligatorio entre tramas consecutivas',
        'El tiempo de transmisión de una trama máxima de 1518 bytes'
      ],
      correctIndex: 1,
      explanation: 'A 10 Mb/s, 512 bit-times = 51,2 µs ≈ 2τ, el tiempo máximo de ida y vuelta en la red. Si la trama fuera más corta que 2τ (64 B), el emisor terminaría antes de enterarse de una colisión remota.'
    },
    {
      id: 'u2-09',
      unit: 'u2',
      topic: 'Backoff exponencial binario',
      isTrap: false,
      question: 'En el backoff exponencial binario de CSMA/CD, tras la 3.ª colisión, ¿en qué rango elige el número aleatorio de slots r, y tras cuántas colisiones aborta la MAC?',
      options: [
        'r entre 0 y 3; aborta tras 10 colisiones',
        'r entre 0 y 7; aborta tras 16 colisiones',
        'r entre 0 y 15; aborta tras 10 colisiones',
        'r entre 1 y 8; aborta tras 32 colisiones'
      ],
      correctIndex: 1,
      explanation: 'Tras la colisión i se elige r entre 0 y 2^i − 1 (para i = 3: 0 a 7). A partir de 10 colisiones el tope queda en 1023 y tras 16 colisiones la MAC se rinde y reporta error.'
    },
    {
      id: 'u2-10',
      unit: 'u2',
      topic: 'Protocolos sin colisiones',
      isTrap: false,
      question: '¿Cómo funciona el protocolo sin colisiones de mapa de bits (bit-map)?',
      options: [
        'Las estaciones transmiten inmediatamente y envían una señal de jam si chocan',
        'Tiene N ranuras de reserva antes de los datos donde cada estación j anuncia su deseo con un 1 y luego transmiten en orden',
        'Usa un token que solo puede ser capturado por la estación de menor dirección MAC',
        'Divide el espectro en N subportadoras OFDM ortogonales'
      ],
      correctIndex: 1,
      explanation: 'Es un protocolo de reservación: durante el período de contención de N ranuras cada estación anuncia si tiene trama, y luego todas transmiten sin colisiones en orden numérico.'
    },
    {
      id: 'u2-11',
      unit: 'u2',
      topic: 'CSMA/CD vs inalámbrico',
      isTrap: false,
      question: '¿Cuál es la razón física principal por la que CSMA/CD no se usa en redes inalámbricas 802.11?',
      options: [
        'Las tarjetas Wi-Fi no pueden generar números aleatorios para el backoff',
        'La señal propia del emisor en radio tapa a las señales entrantes (millones de veces más débiles) y además existen terminales ocultas',
        'Las ondas de radio tienen retardo de propagación cero',
        'En Wi-Fi las tramas son más cortas que 64 bytes'
      ],
      correctIndex: 1,
      explanation: 'En radio las estaciones son casi siempre half-duplex y la señal recibida es demasiado débil frente a la propia transmisión para detectar colisiones en el aire; además dos nodos pueden no oírse y chocar en el receptor.'
    },
    {
      id: 'u2-12',
      unit: 'u2',
      topic: 'Terminales ocultas y expuestas',
      isTrap: false,
      question: '¿Cuál de los siguientes enunciados describe correctamente el problema de la terminal expuesta?',
      options: [
        'Dos estaciones que no se oyen entre sí transmiten al mismo receptor y colisionan allí',
        'Una estación pospone su transmisión por oír a otra vecina, aunque ambas transmisiones hacia distintos receptores serían compatibles',
        'Un atacante captura tramas Beacon para descubrir el SSID de la red',
        'El AP queda fuera del alcance de todas las estaciones de su celda'
      ],
      correctIndex: 1,
      explanation: 'En la terminal expuesta (B→A y C quiere enviar a D), C oye a B y se abstiene innecesariamente porque la interferencia entre B y C no afectaría a A ni a D.'
    },
    {
      id: 'u2-13',
      unit: 'u2',
      topic: 'CSMA/CA y RTS/CTS',
      isTrap: true,
      question: 'Sobre RTS/CTS en IEEE 802.11, ¿qué afirmación es VERDADERA según el apunte?',
      options: [
        'RTS/CTS forma parte de CSMA/CD en IEEE 802.3u',
        'Ayuda frente a terminales ocultas mediante el temporizador NAV, pero no resuelve terminales expuestas',
        'Resuelve tanto terminales ocultas como expuestas y es obligatorio en todas las tramas de datos',
        'Elimina la necesidad de esperar ACK tras cada trama unicast'
      ],
      correctIndex: 1,
      explanation: 'Sección 5.3 y 9.2: RTS/CTS de 802.11 actualiza el NAV en vecinos ayudando con terminales ocultas, pero no resuelve terminales expuestas (y es opcional).'
    },
    {
      id: 'u2-14',
      unit: 'u2',
      topic: 'Ventana deslizante',
      isTrap: true,
      question: 'En protocolos de ventana deslizante en la capa de enlace, ¿cuál afirmación es FALSA?',
      options: [
        'La ventana del emisor limita cuántas tramas puede haber en tránsito sin confirmar',
        'El temporizador de retransmisión debe ser algo mayor que el RTT',
        'Retorno a N (Go-Back-N) es siempre más eficiente que Repetición selectiva en canales ruidosos',
        'Usar NAK acelera la recuperación porque el receptor pide la trama sin esperar al temporizador'
      ],
      correctIndex: 2,
      explanation: 'Trampa de Sección 9.2: Retorno a N descarta todo lo posterior a una trama errónea y rinde mal cuando hay muchos errores; Repetición selectiva retransmite solo la trama perdida y es más eficiente en líneas ruidosas.'
    },
    {
      id: 'u2-15',
      unit: 'u2',
      topic: 'Espaciados 802.11',
      isTrap: false,
      question: 'En DCF de 802.11, ¿qué intervalo espera el receptor antes de responder con el ACK tras recibir correctamente una trama de datos?',
      options: [
        'DIFS (mayor que PIFS y SIFS)',
        'SIFS (el más corto, dando prioridad a la respuesta inmediata)',
        'EIFS (extendido tras error)',
        '96 bit-times (IFG)'
      ],
      correctIndex: 1,
      explanation: 'SIFS (Short Interframe Space) es el espaciado más corto y asegura que ninguna estación compitiendo con DIFS interrumpa el envío del ACK o CTS.'
    },

    /* ==================== UNIDAD 3: ETHERNET 802.3 (14) ==================== */
    {
      id: 'u3-01',
      unit: 'u3',
      topic: 'Servicios de IEEE 802.3',
      isTrap: true,
      question: '¿Qué tipo de servicio ofrece la subcapa MAC de IEEE 802.3 (Ethernet)?',
      options: [
        'Orientado a la conexión, con confirmaciones y corrección de errores por FEC',
        'No orientado a la conexión, sin confirmaciones y sin corrección de errores (detecta con CRC y descarta)',
        'Orientado a la conexión mediante circuitos virtuales',
        'No orientado a la conexión pero con retransmisión automática garantizada mediante ACK en cada trama'
      ],
      correctIndex: 1,
      explanation: 'Sección 9.2: IEEE 802.3 es no orientado a la conexión, sin confirmaciones y sin corrección de errores; el FCS (CRC-32) solo detecta errores y descarta la trama.'
    },
    {
      id: 'u3-02',
      unit: 'u3',
      topic: 'Medios y cableados Ethernet',
      isTrap: true,
      question: '¿Cuál de las siguientes correspondencias norma ↔ cableado ↔ codificación es CORRECTA?',
      options: [
        '10BASE-T: Cat 3+, 2 pares trenzados, codificación Manchester',
        '100BASE-TX: Cat 3, 4 pares trenzados, codificación Manchester',
        '1000BASE-T: solo Cat 6, 2 pares trenzados, codificación 8B/10B',
        '10BASE-T: cable coaxial fino RG-58, codificación 4B/5B'
      ],
      correctIndex: 0,
      explanation: '10BASE-T usa Cat 3+ (2 pares, Manchester). 100BASE-TX usa Cat 5+ (2 pares, 4B/5B + MLT-3). 1000BASE-T usa Cat 5e+ (4 pares, PAM-5 + DSP).'
    },
    {
      id: 'u3-03',
      unit: 'u3',
      topic: 'Fast Ethernet (802.3u)',
      isTrap: true,
      question: 'Al pasar de Ethernet clásico (10 Mb/s) a Fast Ethernet (802.3u, 100 Mb/s) con CSMA/CD, ¿qué ocurre con la trama mínima y el diámetro máximo de la red?',
      options: [
        'La trama mínima sube a 5120 bits y el diámetro se mantiene igual',
        'La trama mínima sigue siendo 64 bytes (512 bits) y el diámetro de la red disminuye (÷10)',
        'La trama mínima baja a 64 bits y el diámetro aumenta ×10',
        'Fast Ethernet elimina la trama de 64 bytes porque no soporta half-duplex'
      ],
      correctIndex: 1,
      explanation: 'Sección 9.2: al multiplicar por 10 la velocidad manteniendo el slot time en 512 bits, su duración pasa de 51,2 µs a 5,12 µs, por lo que el diámetro máximo se reduce a la décima parte.'
    },
    {
      id: 'u3-04',
      unit: 'u3',
      topic: 'Gigabit Ethernet',
      isTrap: true,
      question: '¿Qué técnicas agregó Gigabit Ethernet (802.3z/ab) para poder operar en modo half-duplex sin reducir el diámetro a unos ~25 metros?',
      options: [
        'Uso obligatorio de RTS/CTS y NAV',
        'Extensión de portadora (relleno hasta 512 bytes) y ráfagas de tramas',
        'Duplicar el MTU de datos a 3000 bytes',
        'Codificación Manchester diferencial en 4 pares Cat 3'
      ],
      correctIndex: 1,
      explanation: 'En 1 Gb/s half-duplex el slot time sube a 4096 bit-times (512 bytes) mediante extensión de portadora y ráfagas de tramas; en full-duplex con switch no se usan ni CSMA/CD.'
    },
    {
      id: 'u3-05',
      unit: 'u3',
      topic: '1000BASE-T',
      isTrap: false,
      question: '¿Cómo logra 1000BASE-T transmitir 1 Gb/s sobre 4 pares trenzados de categoría 5e hasta 100 m?',
      options: [
        'Usa 2 pares para transmitir a 500 Mb/s y 2 pares para recibir a 500 Mb/s',
        'Cada uno de los 4 pares transmite 250 Mb/s en ambos sentidos simultáneamente usando PAM-5, DSP y cancelación de eco',
        'Aumenta la frecuencia de reloj a 1250 Mbaud con codificación 8B/10B sobre cobre sin blindar',
        'Opera únicamente en half-duplex con CSMA/CD'
      ],
      correctIndex: 1,
      explanation: '1000BASE-T utiliza los 4 pares de forma bidireccional simultánea (250 Mb/s por par en ambas direcciones = 1 Gb/s) gracias a PAM-5 y cancelación de eco por DSP.'
    },
    {
      id: 'u3-06',
      unit: 'u3',
      topic: 'Preámbulo y tamaño de trama',
      isTrap: true,
      question: '¿Cuál es el tamaño mínimo y máximo de una trama Ethernet II clásica (sin etiqueta 802.1Q) y qué campos quedan excluidos de ese conteo?',
      options: [
        '72 a 1526 bytes; excluye el IFG únicamente',
        '64 a 1518 bytes; excluye Preámbulo (7 B) y SFD (1 B)',
        '46 a 1500 bytes; excluye direcciones MAC y FCS',
        '64 a 1522 bytes; incluye Preámbulo y SFD'
      ],
      correctIndex: 1,
      explanation: 'La trama básica mide 64 a 1518 bytes (14 B encabezado + 46–1500 B datos/pad + 4 B FCS). Los 7 B de Preámbulo y 1 B de SFD no forman parte del conteo de 64–1518 B.'
    },
    {
      id: 'u3-07',
      unit: 'u3',
      topic: 'Campo Length/Type',
      isTrap: false,
      question: 'En una trama Ethernet, ¿cómo distingue el receptor si el campo de 2 bytes indica Longitud (IEEE 802.3) o EtherType (Ethernet II)?',
      options: [
        'Por el bit U/L de la dirección MAC de origen',
        'Valores ≤ 1500 indican Longitud; valores ≥ 1536 (0x0600) indican EtherType (ej. 0x0800 IPv4)',
        'Si el FCS es par es Longitud, si es impar es EtherType',
        'Siempre es Longitud salvo que haya una etiqueta 802.1Q'
      ],
      correctIndex: 1,
      explanation: 'El IEEE unificó ambos formatos usando el umbral 0x0600 (1536): de 0 a 1500 indica la longitud de la carga útil; desde 1536 en adelante indica el protocolo superior (0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6).'
    },
    {
      id: 'u3-08',
      unit: 'u3',
      topic: 'Padding y etiqueta 802.1Q',
      isTrap: false,
      question: 'Si una trama Ethernet lleva una etiqueta VLAN 802.1Q de 4 bytes, ¿a cuánto baja el tamaño mínimo de la carga útil (sin padding) y cuál es la trama máxima estándar?',
      options: [
        'Carga mínima 42 bytes; trama máxima 1522 bytes',
        'Carga mínima 46 bytes; trama máxima 1522 bytes',
        'Carga mínima 42 bytes; trama máxima 1518 bytes',
        'Carga mínima 60 bytes; trama máxima 9000 bytes'
      ],
      correctIndex: 0,
      explanation: 'Al insertar 4 bytes de etiqueta 802.1Q, el encabezado pasa de 14 a 18 B; para mantener la trama mínima total en 64 B (18 + 42 + 4 = 64), la carga mínima baja a 42 B y la máxima sube a 1522 B.'
    },
    {
      id: 'u3-09',
      unit: 'u3',
      topic: 'Direcciones MAC',
      isTrap: false,
      question: '¿Cómo se estructura una dirección MAC de 48 bits y qué indican sus bits especiales I/G y U/L?',
      options: [
        '16 bits de red + 32 de host; I/G indica IPv4 o IPv6',
        '24 bits de OUI (asignado por IEEE al fabricante) + 24 bits asignados por el fabricante; I/G distingue unicast/grupo y U/L universal/local',
        '32 bits de OUI + 16 bits aleatorios generados por DHCP',
        '48 bits jerárquicos asignados por LACNIC o ARIN'
      ],
      correctIndex: 1,
      explanation: 'Una MAC tiene 24 bits de OUI + 24 bits del fabricante. El bit I/G (Individual/Group) distingue unicast (0) de multicast/broadcast (1), y U/L distingue administración universal o local.'
    },
    {
      id: 'u3-10',
      unit: 'u3',
      topic: 'FCS / CRC-32',
      isTrap: false,
      question: '¿Qué campos de la trama Ethernet cubre el cálculo del FCS (CRC-32)?',
      options: [
        'Desde el Preámbulo hasta el FCS inclusive',
        'Desde la dirección MAC Destino hasta el último byte de Datos/Padding (no cubre Preámbulo ni SFD)',
        'Únicamente la carga útil (Datos) sin las direcciones MAC',
        'Solo el encabezado de 14 bytes, igual que el checksum de IPv4'
      ],
      correctIndex: 1,
      explanation: 'El CRC-32 (4 bytes) se calcula desde la dirección MAC Destino hasta el final de los datos/pad. El Preámbulo y el SFD son sincronización física y no están cubiertos.'
    },
    {
      id: 'u3-11',
      unit: 'u3',
      topic: 'Duplex mismatch y colisiones tardías',
      isTrap: false,
      question: 'Si un puerto de switch está forzado a Full-Duplex y la PC conectada quedó en Half-Duplex (duplex mismatch), ¿qué síntoma típico aparece?',
      options: [
        'El switch deja de aprender direcciones MAC de origen',
        'Colisiones tardías (después del slot time) y errores de CRC/FCS al transmitir simultáneamente',
        'La PC cambia automáticamente a IPv6 mediante NDP',
        'El enlace pasa a 10BASE5 sobre coaxial'
      ],
      correctIndex: 1,
      explanation: 'El extremo en full-duplex transmite en cualquier momento sin sensar; el extremo en half-duplex interpreta esas tramas recibidas mientras transmite como colisiones tardías y tramas truncadas/con error de CRC.'
    },
    {
      id: 'u3-12',
      unit: 'u3',
      topic: '10 Gigabit Ethernet',
      isTrap: false,
      question: '¿Qué cambio arquitectónico definitivo ocurre a partir de 10 Gigabit Ethernet (802.3ae)?',
      options: [
        'Se duplica el tamaño mínimo de trama a 128 bytes',
        'Es únicamente full-duplex desde el diseño; desaparece el half-duplex y CSMA/CD deja de ser parte del enlace',
        'Se reemplaza la dirección MAC de 48 bits por direcciones de 64 bits',
        'Los switches pasan a operar como hubs repetidores de capa 1'
      ],
      correctIndex: 1,
      explanation: 'Desde 10G Ethernet desaparece el modo half-duplex y con él CSMA/CD; la trama básica se conserva pero la colisión pasa a ser un concepto histórico.'
    },
    {
      id: 'u3-13',
      unit: 'u3',
      topic: 'Codificación Manchester',
      isTrap: false,
      question: 'En 10BASE-T con codificación Manchester, ¿por qué se necesitan hasta 20 Mbaud para transmitir 10 Mb/s?',
      options: [
        'Porque cada bit incluye una transición en el centro para recuperar el reloj (autorreloj)',
        'Porque usa 4 pares trenzados en paralelo',
        'Porque agrega una cabecera LLC/SNAP antes de cada bit',
        'Porque transmite cada trama dos veces como respaldo'
      ],
      correctIndex: 0,
      explanation: 'La codificación Manchester garantiza al menos una transición por bit (en el centro), permitiendo al receptor sincronizar su reloj directamente de la señal a costa del doble de tasa de símbolos.'
    },
    {
      id: 'u3-14',
      unit: 'u3',
      topic: 'Ethernet II vs 802.3 + LLC/SNAP',
      isTrap: false,
      question: '¿Cuál es la diferencia práctica entre Ethernet II y IEEE 802.3 + LLC/SNAP?',
      options: [
        'Ethernet II funciona solo en fibra y 802.3 solo en par trenzado',
        'En Ethernet II el campo de 2 B es EtherType (identificación directa, dominante en IP), mientras que en 802.3 es Longitud y el protocolo va en la cabecera LLC/SNAP',
        'Ethernet II no tiene FCS de 4 bytes',
        '802.3 + LLC/SNAP no soporta direcciones MAC unicast'
      ],
      correctIndex: 1,
      explanation: 'Ambos usan el mismo formato físico, pero 802.3 coloca la longitud en esos 2 bytes e identifica el protocolo superior mediante la cabecera LLC (y SNAP si corresponde).'
    },

    /* ==================== UNIDAD 4: CONMUTACIÓN, STP y PoE (14) ==================== */
    {
      id: 'u4-01',
      unit: 'u4',
      topic: 'Dispositivos y capas OSI',
      isTrap: true,
      question: '¿Cuál de las siguientes afirmaciones sobre dispositivos de red y capas OSI es VERDADERA?',
      options: [
        'Un hub opera en capas 1 y 2 examinando direcciones MAC',
        'Un Access Point (AP) típico opera en capas 2 y 3 como un router inalámbrico puro',
        'Un switch/puente opera en capa 2; un hub y un patch panel operan en capa 1; un router opera en capas 1, 2 y 3',
        'Un switch de capa 2 interpreta cabeceras IP y decrementa el TTL'
      ],
      correctIndex: 2,
      explanation: 'Trampa clásica de 9.2: hub, repetidor, antena y patch panel son capa 1; switch y puente son capa 2; un AP es un puente inalámbrico 802.1D (capas 1 y 2, no router de capa 3); el router llega a capa 3 (no capa 4).'
    },
    {
      id: 'u4-02',
      unit: 'u4',
      topic: 'Access Point como puente',
      isTrap: true,
      question: 'Según el apunte (4.1, 5.4 y 9.2), ¿en qué capas y bajo qué rol de norma opera un Access Point (AP) en modo puente?',
      options: [
        'Capas 1, 2 y 3; equivalente a un router IP',
        'Capas 1 y 2; actúa como puente inalámbrico (norma 802.1D)',
        'Capa 4; controla ventanas TCP entre clientes Wi-Fi',
        'Capa 1 exclusivamente, igual que un repetidor coaxial'
      ],
      correctIndex: 1,
      explanation: 'La afirmación "Un AP opera en capas 2 y 3" aparece explícitamente como FALSA en 9.2. El AP puentea tramas 802.11–Ethernet en capa 2 (802.1D).'
    },
    {
      id: 'u4-03',
      unit: 'u4',
      topic: 'Dominios de colisión y broadcast',
      isTrap: false,
      question: 'Si conectás 10 PCs a un switch de 10 puertos sin configurar VLANs, ¿cuántos dominios de colisión y cuántos dominios de broadcast existen?',
      options: [
        '1 dominio de colisión y 10 dominios de broadcast',
        '10 dominios de colisión (uno por puerto) y 1 dominio de broadcast',
        '1 dominio de colisión y 1 dominio de broadcast',
        '10 dominios de colisión y 10 dominios de broadcast'
      ],
      correctIndex: 1,
      explanation: 'Cada puerto de un switch separa un dominio de colisión independiente (10 en total), pero el switch sigue inundando los broadcasts por todos los puertos (1 dominio de broadcast salvo que haya VLANs).'
    },
    {
      id: 'u4-04',
      unit: 'u4',
      topic: 'Aprendizaje de tabla MAC',
      isTrap: true,
      question: '¿Cómo aprende y reenvía tramas un switch transparente de capa 2?',
      options: [
        'Aprende mirando la MAC de destino y envía mensajes hello OSPF por cada puerto',
        'Aprende asociando la MAC de origen con el puerto de entrada, y decide el reenvío mirando la MAC de destino',
        'Aprende por IP de origen mediante consultas ARP periódicas',
        'Reenvía siempre todas las tramas por todos los puertos como un hub'
      ],
      correctIndex: 1,
      explanation: 'Sección 4.2 y 9.2: el switch trabaja en modo promiscuo, aprende la MAC de origen de cada trama que llega (purgando entradas viejas tras minutos) y reenvía según la MAC de destino (sin mensajes hello ni IP).'
    },
    {
      id: 'u4-05',
      unit: 'u4',
      topic: 'Reglas de reenvío del switch',
      isTrap: false,
      question: 'Al llegar una trama al puerto 2 de un switch, la tabla MAC indica que la dirección MAC de destino también está detrás del puerto 2. ¿Qué hace el switch?',
      options: [
        'La reenvía de vuelta por el puerto 2',
        'La descarta (filtra), porque origen y destino comparten el mismo segmento/puerto',
        'La inunda por todos los demás puertos por seguridad',
        'Envía un mensaje ICMP Redirect al emisor'
      ],
      correctIndex: 1,
      explanation: 'Cuando el puerto de destino coincide con el puerto de origen (por ejemplo con un hub conectado a ese puerto), las estaciones ya se escuchan entre sí y el switch descarta la trama.'
    },
    {
      id: 'u4-06',
      unit: 'u4',
      topic: 'Inundación en switch',
      isTrap: false,
      question: '¿En qué casos un switch de capa 2 inunda (flood) una trama por todos los puertos excepto el de origen?',
      options: [
        'Solo cuando el FCS es inválido',
        'Cuando la MAC destino es desconocida en la tabla MAC o es una dirección broadcast (FF:FF:FF:FF:FF:FF)',
        'Únicamente cuando el puerto está en estado Blocking de STP',
        'Cada vez que recibe una trama IPv6'
      ],
      correctIndex: 1,
      explanation: 'Si la MAC destino no figura en la tabla MAC o corresponde a broadcast, el switch la reenvía por todos los puertos activos de esa VLAN/LAN excepto aquel por el que entró.'
    },
    {
      id: 'u4-07',
      unit: 'u4',
      topic: 'Store-and-forward vs Cut-through',
      isTrap: false,
      question: '¿Cuál es la ventaja y desventaja principal de un switch cut-through frente a uno store-and-forward?',
      options: [
        'Cut-through verifica el FCS completo y tiene mayor latencia',
        'Cut-through logra menor latencia al reenviar apenas lee la MAC destino, pero puede propagar tramas dañadas porque no espera el FCS',
        'Store-and-forward no usa buffers internos',
        'Cut-through solo funciona en enlaces half-duplex de 10 Mb/s'
      ],
      correctIndex: 1,
      explanation: 'Store-and-forward recibe toda la trama y valida el FCS antes de reenviar (descarta errores a costa de mayor latencia). Cut-through reenvía apenas lee la MAC destino.'
    },
    {
      id: 'u4-08',
      unit: 'u4',
      topic: 'Norma y propósito de STP',
      isTrap: true,
      question: '¿Qué norma define Spanning Tree Protocol (STP) y cuál es su finalidad?',
      options: [
        'IEEE 802.1X; autenticar usuarios por puerto antes de asignarles IP',
        'IEEE 802.1D; evitar lazos de capa 2 en topologías con enlaces redundantes dejando un árbol activo sin ciclos',
        'IEEE 802.1Q; acelerar los switches evitando el cálculo del CRC-32',
        'IEEE 802.3at; balancear carga simultáneamente por todos los enlaces redundantes'
      ],
      correctIndex: 1,
      explanation: 'Trampa clásica de 9.2: STP es 802.1D (no 802.1X, que es autenticación por puerto), opera en capa 2 (no ruteo) y se diseñó para evitar bucles infinitos de tramas inundadas, no para acelerar los puentes.'
    },
    {
      id: 'u4-09',
      unit: 'u4',
      topic: 'Elección de raíz en STP',
      isTrap: false,
      question: 'En STP (802.1D), ¿cómo se elige el puente raíz (root bridge) mediante los mensajes BPDU?',
      options: [
        'El switch con mayor dirección IP administrativa',
        'El puente con el identificador (Bridge ID) más bajo',
        'El switch con mayor cantidad de puertos PoE activos',
        'El último switch en encenderse dentro de la topología'
      ],
      correctIndex: 1,
      explanation: 'Los puentes intercambian BPDUs y eligen como raíz al puente con el identificador más bajo (basado en prioridad + dirección MAC).'
    },
    {
      id: 'u4-10',
      unit: 'u4',
      topic: 'Estados de puerto STP',
      isTrap: false,
      question: '¿Cuál es la secuencia ordenada de estados activos de un puerto en STP clásico (802.1D) hasta quedar reenviando tráfico?',
      options: [
        'Blocking → Forwarding → Learning → Listening',
        'Disabled → Blocking → Listening → Learning → Forwarding',
        'Listening → Blocking → Learning → Forwarding',
        'Learning → Listening → Blocking → Forwarding'
      ],
      correctIndex: 1,
      explanation: 'Los 5 estados en orden son: Disabled (fuera de servicio), Blocking (no reenvía tramas), Listening (procesa BPDUs), Learning (aprende MACs sin reenviar aún) y Forwarding (aprende y reenvía).'
    },
    {
      id: 'u4-11',
      unit: 'u4',
      topic: 'VLAN 802.1Q',
      isTrap: true,
      question: '¿Qué afirmación sobre las VLANs (IEEE 802.1Q) es CORRECTA?',
      options: [
        'Las estaciones en distintas VLANs se comunican directamente a través de un switch de capa 2 sin router',
        'Cada VLAN crea un dominio de broadcast lógico separado agregando una etiqueta de 4 bytes; comunicar VLANs distintas requiere un router (capa 3)',
        'VLAN es sinónimo de Software Defined Networks (SDN)',
        'La etiqueta 802.1Q reemplaza al campo FCS de la trama'
      ],
      correctIndex: 1,
      explanation: 'Sección 9.2: una VLAN particiona lógicamente la capa 2 (un dominio de broadcast por VLAN) con un tag 802.1Q de 4 B; para pasar tráfico entre VLANs distintas hace falta capa 3 (router).'
    },
    {
      id: 'u4-12',
      unit: 'u4',
      topic: 'PoE 802.3af vs 802.3at',
      isTrap: false,
      question: '¿Qué potencia máxima entrega el PSE y qué potencia mínima garantiza al PD el estándar PoE+ (802.3at Tipo 2)?',
      options: [
        '15,4 W en el PSE y 12,95 W en el PD',
        '30 W en el PSE y 25,5 W en el PD',
        '60 W en el PSE y 51 W en el PD',
        '10 W en el PSE y 10 W en el PD sin pérdida en el cable'
      ],
      correctIndex: 1,
      explanation: 'PoE 802.3af (Tipo 1) entrega hasta 15,4 W en el PSE y garantiza 12,95 W en el PD; PoE+ 802.3at (Tipo 2) entrega 30 W en el PSE y 25,5 W en el PD (la diferencia se disipa en el cable).'
    },
    {
      id: 'u4-13',
      unit: 'u4',
      topic: 'Presupuesto PoE',
      isTrap: false,
      question: 'Si un switch PoE de 24 puertos soporta 802.3af, ¿qué hay que verificar antes de conectar 24 cámaras de 12 W cada una?',
      options: [
        'Que las cámaras tengan direcciones IP privadas 10/8',
        'El presupuesto total de potencia del switch (PSE), ya que puede no poder entregar el máximo en todos los puertos simultáneamente',
        'Que el cable sea coaxial RG-58 para tolerar corriente continua',
        'Que STP esté desactivado en los 24 puertos'
      ],
      correctIndex: 1,
      explanation: 'Sección 4.5: un switch PoE tiene un presupuesto total de potencia menor a la suma máxima teórica de todos sus puertos; hay que sumar el consumo de todos los PD.'
    },
    {
      id: 'u4-14',
      unit: 'u4',
      topic: 'Backplane y modo promiscuo',
      isTrap: false,
      question: '¿Por qué un switch mejora el rendimiento global de la LAN respecto a un hub incluso si todas las tramas fueran de igual tamaño?',
      options: [
        'Porque comprime los datos de capa 4 antes de enviarlos',
        'Porque su backplane de alta velocidad permite múltiples transmisiones simultáneas entre pares distintos de puertos sin colisiones',
        'Porque elimina la cabecera Ethernet de 14 bytes',
        'Porque reemplaza las direcciones MAC por direcciones IPv4'
      ],
      correctIndex: 1,
      explanation: 'Mientras un hub comparte eléctricamente un único canal, el switch aísla cada puerto y mediante su backplane y buffers puede conmutar múltiples tramas a la vez entre pares distintos.'
    },

    /* ==================== UNIDAD 5: WI-FI 802.11 (16) ==================== */
    {
      id: 'u5-01',
      unit: 'u5',
      topic: 'Canales en 2,4 GHz',
      isTrap: false,
      question: '¿Qué canales forman el plan habitual sin solapamiento en la banda de 2,4 GHz y por qué?',
      options: [
        'Canales 1, 2 y 3, porque están separados 5 MHz entre sí',
        'Canales 1, 6 y 11, porque aunque los centros distan 5 MHz cada canal es mucho más ancho y estos tres no se superponen',
        'Canales 36, 40 y 44, para evitar radares DFS',
        'Todos los canales del 1 al 11 son ortogonales entre sí'
      ],
      correctIndex: 1,
      explanation: 'En 2,4 GHz los centros están separados solo 5 MHz, por lo que canales adyacentes se solapan; 1, 6 y 11 forman el esquema clásico de tres canales sin solapamiento.'
    },
    {
      id: 'u5-02',
      unit: 'u5',
      topic: 'ISM, U-NII y DFS',
      isTrap: false,
      question: '¿Qué función cumple el mecanismo DFS (Dynamic Frequency Selection) en ciertas subbandas de 5 GHz?',
      options: [
        'Duplicar la potencia del transmisor cuando el canal está libre',
        'Detectar señales de radar antes y durante la operación, obligando a abandonar el canal si aparece un radar',
        'Cifrar las tramas de gestión Beacon mediante SAE',
        'Combinar las bandas de 2,4 GHz y 6 GHz en un solo canal'
      ],
      correctIndex: 1,
      explanation: 'Las bandas U-NII sin licencia individual siguen reguladas: en subbandas DFS de 5 GHz el equipo debe verificar ausencia de radares y abandonar el canal si detecta uno.'
    },
    {
      id: 'u5-03',
      unit: 'u5',
      topic: 'Presupuesto de enlace en dBm',
      isTrap: false,
      question: 'Un transmisor emite a Pt = +20 dBm con antena Gt = 3 dBi, el receptor tiene antena Gr = 2 dBi y las pérdidas totales (propagación + otras) son 87 dB. ¿Cuál es la potencia recibida Pr?',
      options: [
        '−62 dBm',
        '−67 dBm',
        '+112 dBm',
        '−102 dBm'
      ],
      correctIndex: 0,
      explanation: 'Aplicando la fórmula del apunte: Pr = Pt + Gt + Gr − L_prop − L_otras = 20 + 3 + 2 − 87 = −62 dBm.'
    },
    {
      id: 'u5-04',
      unit: 'u5',
      topic: 'OFDM en 802.11a',
      isTrap: false,
      question: 'En 802.11a (OFDM con FFT de 64 puntos), ¿cuántas subportadoras activas se usan y para qué sirve el prefijo cíclico?',
      options: [
        '64 subportadoras de datos; sirve para cifrar la señal con RC4',
        '52 subportadoras activas (48 de datos + 4 pilotos); el prefijo cíclico ayuda a tolerar la dispersión temporal por multitrayectoria',
        '12 subportadoras activas; sirve para detectar colisiones en el aire',
        '256 subportadoras activas; reemplaza la dirección MAC de la trama'
      ],
      correctIndex: 1,
      explanation: 'Sección 5.2: en 802.11a la FFT de 64 puntos usa 52 subportadoras activas (48 datos + 4 pilotos), y el símbolo más largo con prefijo cíclico mitiga el efecto de la multitrayectoria.'
    },
    {
      id: 'u5-05',
      unit: 'u5',
      topic: 'Estándares 802.11a vs 802.11g',
      isTrap: true,
      question: '¿Cuál de estas afirmaciones sobre 802.11a y 802.11g es VERDADERA?',
      options: [
        '802.11a opera en 5 GHz con OFDM (54 Mb/s) y NO es compatible directamente con 802.11g (que opera en 2,4 GHz)',
        '802.11a es una mejora posterior compatible hacia atrás con 802.11b en 2,4 GHz',
        '802.11b alcanza 54 Mb/s usando OFDM en 5 GHz',
        '802.11ac (Wi-Fi 5) agrega soporte obligatorio para 2,4 GHz con OFDMA'
      ],
      correctIndex: 0,
      explanation: 'Sección 9.2 y 11.5: 802.11a trabaja en 5 GHz (OFDM, 54 Mb/s), mientras 802.11g trabaja en 2,4 GHz (OFDM, 54 Mb/s, compatible con 802.11b). 802.11ac es solo 5 GHz.'
    },
    {
      id: 'u5-06',
      unit: 'u5',
      topic: 'MIMO y Beamforming',
      isTrap: false,
      question: 'Sobre MIMO y Beamforming en Wi-Fi, ¿qué afirmación es correcta?',
      options: [
        'El beamforming crea potencia eléctrica adicional en el amplificador del AP',
        'La multiplexación espacial envía flujos independientes en el mismo canal para duplicar/aumentar la tasa, y el beamforming pondera fase y amplitud para concentrar energía hacia el receptor',
        'La diversidad espacial envía datos distintos en cada antena para multiplicar la velocidad',
        'MU-MIMO en 802.11ac funciona tanto en uplink como en downlink'
      ],
      correctIndex: 1,
      explanation: 'Multiplexación espacial = flujos distintos (más bits/s); diversidad = misma info (robustez). Beamforming no crea potencia, combina constructivamente en la dirección del cliente. 802.11ac tenía MU-MIMO solo downlink (uplink se sumó en ax).'
    },
    {
      id: 'u5-07',
      unit: 'u5',
      topic: '802.11ax (Wi-Fi 6 / 6E)',
      isTrap: false,
      question: '¿Qué aporta OFDMA en 802.11ax (Wi-Fi 6) y en qué se diferencia de MU-MIMO?',
      options: [
        'OFDMA separa usuarios en el espacio usando una sola portadora',
        'OFDMA divide el canal en unidades de recurso (RU) de subportadoras para atender varios usuarios en frecuencia simultáneamente (ideal para paquetes pequeños), mientras MU-MIMO separa en el espacio',
        'OFDMA es solo un sinónimo comercial de Wi-Fi 6E en 6 GHz',
        'BSS Coloring en 802.11ax asigna colores a cada RU de OFDMA'
      ],
      correctIndex: 1,
      explanation: 'En 802.11ax, OFDMA asigna RUs (subgrupos de subportadoras) en frecuencia coordinando uplink con trigger frame; MU-MIMO separa en el espacio. BSS Coloring (1–63) identifica el BSS para reutilización espacial, no colores de OFDMA.'
    },
    {
      id: 'u5-08',
      unit: 'u5',
      topic: 'DCF vs PCF vs modo infraestructura',
      isTrap: true,
      question: '¿Cuál de las siguientes afirmaciones sobre DCF y PCF en 802.11 es CORRECTA?',
      options: [
        'DCF significa "modo infraestructura" y PCF significa "modo ad hoc"',
        'DCF es acceso distribuido (CSMA/CA) y también se usa en infraestructura; PCF es acceso centralizado por polling del AP y casi no se usa en la práctica',
        'PCF funciona sin AP usando únicamente tramas Beacon entre estaciones ad hoc',
        'DCF utiliza CSMA/CD y PCF utiliza token ring cableado'
      ],
      correctIndex: 1,
      explanation: 'Trampa de 9.2: DCF no es sinónimo de infraestructura (de hecho se usa tanto en infraestructura como en ad hoc). PCF es polling centralizado por el AP usando PIFS, casi sin uso práctico.'
    },
    {
      id: 'u5-09',
      unit: 'u5',
      topic: 'Backoff en DCF',
      isTrap: false,
      question: 'Una estación Wi-Fi elige un backoff de 5 ranuras. Descuenta 2 ranuras libres y otra estación ocupa el canal. ¿Qué hace su contador cuando el canal vuelve a quedar libre tras DIFS?',
      options: [
        'Sortea un backoff nuevo desde [0, CWmax]',
        'Conserva las 3 ranuras restantes (se había congelado) y sigue descontando desde 3',
        'Transmite inmediatamente sin descontar más ranuras',
        'Aborta la trama igual que tras 16 colisiones Ethernet'
      ],
      correctIndex: 1,
      explanation: 'Sección 5.3: el contador de backoff en 802.11 se decrementa solo mientras el canal está libre y se congela si se ocupa; al liberarse tras DIFS continúa con el saldo restante.'
    },
    {
      id: 'u5-10',
      unit: 'u5',
      topic: 'EDCA y TXOP',
      isTrap: false,
      question: 'En EDCA (802.11e), ¿qué ofrece este mecanismo y para qué sirve el TXOP (Transmission Opportunity)?',
      options: [
        'Ofrece QoS determinística absoluta garantizada para voz',
        'Ofrece QoS estadística con 4 categorías (AC_VO, AC_VI, AC_BE, AC_BK), y TXOP evita la "anomalía de la tasa" limitando el tiempo de ocupación por ráfaga',
        'Elimina los espaciados inter-trama reemplazándolos por el slot time de 51,2 µs',
        'Asigna un canal DFS exclusivo para cada estación de voz'
      ],
      correctIndex: 1,
      explanation: 'EDCA da prioridad estadística (AIFS y CWmin más chicos para voz/video). TXOP asigna un tiempo máximo de transmisión por turno evitando que una estación lenta acapare el medio.'
    },
    {
      id: 'u5-11',
      unit: 'u5',
      topic: 'Trama Beacon y SSID/BSSID',
      isTrap: true,
      question: '¿Qué tipo de trama es el Beacon de 802.11, cada cuánto suele emitirse y qué información anuncia?',
      options: [
        'Trama de control (subtipo 11); solo contiene la dirección RA',
        'Trama de gestión (subtipo 8), emitida típicamente cada 100 TU (102,4 ms); incluye SSID (si se difunde), BSSID, tasas soportadas, TSF y seguridad (RSN)',
        'Trama de datos (tipo 10); transporta el 4-Way Handshake',
        'Trama de gestión emitida solo cuando el SSID está oculto'
      ],
      correctIndex: 1,
      explanation: 'Sección 5.4 y 9.2: Beacon es gestión subtipo 8, intervalo típico 100 TU (1 TU = 1024 µs → 102,4 ms), y anuncia SSID, BSSID (MAC del AP), capacidades/tasas, TSF, RSN y TIM/DTIM.'
    },
    {
      id: 'u5-12',
      unit: 'u5',
      topic: 'Trama MAC 802.11 y 4 direcciones',
      isTrap: false,
      question: 'Una notebook envía datos por Wi-Fi a su AP para que lleguen a un servidor en la LAN cableada (To DS = 1, From DS = 0). ¿Qué hay en Address 1, Address 2 y Address 3?',
      options: [
        'A1 = Servidor (DA), A2 = Notebook (SA), A3 = AP (BSSID)',
        'A1 = AP (RA / BSSID), A2 = Notebook (TA = SA), A3 = Servidor (DA)',
        'A1 = Notebook (RA), A2 = Servidor (SA), A3 = Router (Gateway)',
        'Se requieren obligatoriamente 4 direcciones (Address 4 incluida)'
      ],
      correctIndex: 1,
      explanation: 'En To DS = 1, From DS = 0: Address 1 es el receptor de radio (RA = BSSID del AP), Address 2 es el transmisor y origen (TA = SA = Notebook) y Address 3 es el destino final (DA = Servidor). Las 4 direcciones se usan en WDS (To DS=1, From DS=1).'
    },
    {
      id: 'u5-13',
      unit: 'u5',
      topic: 'Open System Authentication',
      isTrap: false,
      question: '¿Qué papel cumple "Open System Authentication" en una red moderna protegida con WPA2-Personal o WPA2-Enterprise?',
      options: [
        'Significa que todo el tráfico de datos viajará sin cifrado',
        'Es un intercambio inicial de autenticación 802.11 sin contraseña que precede a la asociación y al 4-Way Handshake (donde sí se prueba la clave)',
        'Es el protocolo de cifrado que reemplazó a AES-CCMP',
        'Es exclusivo del modo ad hoc IBSS'
      ],
      correctIndex: 1,
      explanation: 'Conectarse en 802.11 no es lo mismo que autenticar credenciales de seguridad: Open System solo habilita el paso hacia la asociación; luego 802.1X/EAP y el 4-Way Handshake validan y derivan claves.'
    },
    {
      id: 'u5-14',
      unit: 'u5',
      topic: 'WEP, WPA2 y 4-Way Handshake',
      isTrap: false,
      question: 'En WPA2-Personal, ¿qué ocurre durante el 4-Way Handshake?',
      options: [
        'La STA envía la passphrase en texto claro al AP para que la compare',
        'AP y STA prueban posesión de la PMK intercambiando nonces y MIC, y derivan la PTK (unicast) y reciben la GTK (grupo)',
        'El servidor RADIUS asigna una dirección IPv4 por DHCP',
        'Se utiliza RC4 con un IV de 24 bits para proteger cada trama'
      ],
      correctIndex: 1,
      explanation: 'En el 4-Way Handshake nunca viaja la contraseña: con ANonce, SNonce y direcciones MAC se verifica la PMK mediante MIC y se derivan PTK (unicast) y GTK (tráfico de grupo).'
    },
    {
      id: 'u5-15',
      unit: 'u5',
      topic: 'WPA3 y SAE',
      isTrap: false,
      question: '¿Qué vulnerabilidad práctica de WPA2-Personal corrige el protocolo SAE (Simultaneous Authentication of Equals) en WPA3-Personal?',
      options: [
        'Evita la necesidad de usar antenas MIMO en 5 GHz',
        'Evita que un atacante que capture pasivamente el handshake pueda probar diccionarios de contraseñas offline',
        'Permite reutilizar el cifrado WEP de forma segura',
        'Reemplaza la MAC del AP por una dirección IPv6 link-local'
      ],
      correctIndex: 1,
      explanation: 'SAE realiza un acuerdo autenticado de claves basado en contraseña sin enviar la contraseña ni permitir ataques de diccionario offline a partir de capturas pasivas, además de exigir PMF.'
    },
    {
      id: 'u5-16',
      unit: 'u5',
      topic: 'Dos clientes en el mismo BSS',
      isTrap: false,
      question: 'En modo infraestructura convencional, cuando una laptop A envía datos a una impresora B asociada al mismo AP, ¿cuántas transmisiones por radio ocurren normalmente?',
      options: [
        'Una transmisión directa de A hacia B sin pasar por el AP',
        'Dos transmisiones de radio: de A hacia el AP, y del AP hacia B',
        'Cuatro transmisiones usando obligatoriamente WDS (Address 4)',
        'Ninguna por radio, porque usan Ethernet full-duplex'
      ],
      correctIndex: 1,
      explanation: 'Sección 5.4: en infraestructura convencional todo el tráfico entre clientes del mismo BSS atraviesa el AP (salvo extensiones directas como TDLS), implicando dos saltos por radio.'
    },

    /* ==================== UNIDAD 6: CAPA DE RED IPv4/IPv6 (16) ==================== */
    {
      id: 'u6-01',
      unit: 'u6',
      topic: 'Finalidad de la capa de red',
      isTrap: true,
      question: '¿Cuál es la función principal de la capa de red y a qué capa superior presta servicio?',
      options: [
        'Proveer acceso físico al medio compartido y servir a la capa de enlace',
        'Brindar conectividad y selección de ruta extremo a extremo entre hosts en redes distintas, sirviendo a la capa de transporte',
        'Garantizar entrega confiable libre de errores y reordenamiento de segmentos',
        'Conmutar tramas dentro de una misma LAN por dirección MAC'
      ],
      correctIndex: 1,
      explanation: 'Sección 6.2 y 9.2: la capa de red da conectividad y selección de ruta entre redes distintas y presta servicios a la capa de transporte (su dispositivo típico es el router).'
    },
    {
      id: 'u6-02',
      unit: 'u6',
      topic: 'Datagramas vs Circuitos Virtuales',
      isTrap: false,
      question: '¿Qué sucede en una red de datagramas (como IP) frente a una de circuitos virtuales (VC) si falla un router intermedio?',
      options: [
        'En datagramas se caen todas las conexiones que pasaron alguna vez por ese router; en VC se reencaminan solas',
        'En datagramas solo se pierden los paquetes en tránsito y el resto puede tomar otra ruta porque los routers no guardan estado de conexión; en VC terminan todos los circuitos que pasaban por él',
        'En ambos casos cada paquete lleva un número corto de VC',
        'En datagramas es obligatorio establecer la ruta antes de enviar el primer paquete'
      ],
      correctIndex: 1,
      explanation: 'Tabla 6.3 / 11.9: en datagramas no hay estado de conexión en los routers y cada paquete lleva origen/destino completos y se enruta independientemente.'
    },
    {
      id: 'u6-03',
      unit: 'u6',
      topic: 'Cabecera IPv4',
      isTrap: true,
      question: 'Respecto a los campos de la cabecera IPv4, ¿cuál afirmación es VERDADERA?',
      options: [
        'El campo PROTOCOL indica el protocolo de capa 2 (Ethernet o Wi-Fi)',
        'El TTL es decrementado por cada switch de capa 2 en el camino',
        'El Checksum verifica únicamente la cabecera IPv4 (no la carga útil) y el TTL lo decrementa cada router',
        'El campo IHL siempre vale exactamente 40 bytes porque la cabecera es fija'
      ],
      correctIndex: 2,
      explanation: 'Sección 6.5 y 9.2: PROTOCOL indica el protocolo de capa 4 (TCP, UDP, ICMP…), TTL lo decrementa cada router (no los switches) y el Checksum cubre solo la cabecera IPv4 (mínimo 20 B = IHL 5).'
    },
    {
      id: 'u6-04',
      unit: 'u6',
      topic: 'Fragmentación IPv4 y MTU',
      isTrap: true,
      question: 'Cuando un datagrama IPv4 con DF = 0 supera la MTU de un enlace intermedio y se fragmenta, ¿quién realiza el reensamblado de los fragmentos?',
      options: [
        'El primer router después del enlace de menor MTU',
        'El último router antes de la red de destino',
        'Exclusivamente el host de destino final',
        'El switch de capa 2 de la LAN destino'
      ],
      correctIndex: 2,
      explanation: 'Sección 9.2: los routers intermedios tratan cada fragmento como un datagrama independiente (por si toman rutas distintas); solo el host destino reensambla. Si DF = 1, el router descarta y avisa por ICMP.'
    },
    {
      id: 'u6-05',
      unit: 'u6',
      topic: 'Subnetting y AND con máscara',
      isTrap: false,
      question: 'Dado el host 192.228.17.57 con máscara 255.255.255.224 (/27), ¿cuál es su dirección de red/subred y cuántos hosts utilizables admite esa subred?',
      options: [
        'Red 192.228.17.0; 254 hosts utilizables',
        'Red 192.228.17.32; 30 hosts utilizables (2^5 − 2)',
        'Red 192.228.17.48; 14 hosts utilizables',
        'Red 192.228.17.32; 32 hosts utilizables'
      ],
      correctIndex: 1,
      explanation: '224 en binario es 11100000 (bloques de 32). El AND bit a bit entre .57 y .224 da .32 (192.228.17.32). Quedan 5 bits de host: 2^5 − 2 = 30 hosts utilizables.'
    },
    {
      id: 'u6-06',
      unit: 'u6',
      topic: 'Envío local vs Gateway',
      isTrap: true,
      question: '¿Cómo decide un host IPv4 si envía un paquete directamente al destino o al gateway por defecto?',
      options: [
        'Consulta primero a un servidor DNS si el destino está en la misma LAN',
        'Aplica AND entre la IP destino y su propia máscara; si el resultado coincide con su red local resuelve la MAC del destino por ARP, y si no, resuelve la MAC del gateway',
        'Envía el paquete primero al gateway siempre y este lo devuelve si es local',
        'Compara los primeros 24 bits (OUI) de la dirección IP'
      ],
      correctIndex: 1,
      explanation: 'Sección 6.7 y 9.2: el host usa su máscara con AND para saber si la IP destino está en su misma red. Además recordar la trampa: los hosts envían paquetes, pero NO reenvían paquetes entre redes (eso es función del router).'
    },
    {
      id: 'u6-07',
      unit: 'u6',
      topic: 'El paquete no cambia, la trama sí',
      isTrap: false,
      question: 'Al atravesar un router desde la Red 1 hacia la Red 2 (sin NAT), ¿qué ocurre con el paquete IP y con la trama de capa 2?',
      options: [
        'El router cambia la IP de origen y destino por las suyas y mantiene intactas las direcciones MAC',
        'El router desencapsula la trama, busca la ruta para la IP destino, decrementa el TTL y encapsula el mismo paquete IP en una nueva trama con nuevas direcciones MAC',
        'El router reenvía la trama Ethernet original sin modificar su dirección MAC de origen',
        'El router solo cambia la IP si el protocolo es UDP'
      ],
      correctIndex: 1,
      explanation: 'Regla de oro del apunte (6.7): "El paquete no cambia; la trama sí." Las IP extremo a extremo se mantienen (solo cambia TTL/checksum en IPv4), mientras las MAC cambian en cada enlace.'
    },
    {
      id: 'u6-08',
      unit: 'u6',
      topic: 'ARP y RARP',
      isTrap: true,
      question: '¿Cuál es el propósito exacto de ARP y qué método utiliza para resolver direcciones?',
      options: [
        'Resuelve direcciones IP conociendo la dirección MAC mediante consultas TCP al puerto 53',
        'Resuelve IP → MAC dentro de la red local enviando una consulta por broadcast de capa 2',
        'Asigna dinámicamente IP, máscara y gateway durante el arranque',
        'Resuelve nombres de dominio (www.gmail.com) a direcciones IP'
      ],
      correctIndex: 1,
      explanation: 'Trampa de 9.2: ARP traduce IP → MAC mediante broadcast de capa 2 dentro de la LAN (sin puertos ni DNS). La operación inversa (MAC → IP) era RARP.'
    },
    {
      id: 'u6-09',
      unit: 'u6',
      topic: 'ARP gratuito y Proxy ARP',
      isTrap: false,
      question: '¿Para qué sirve que un host envíe un "ARP gratuito" al iniciar su interfaz de red?',
      options: [
        'Para obtener una dirección IP gratuita de un servidor BOOTP',
        'Consulta por su propia IP para detectar si otra máquina ya la tiene (IP duplicada) y actualizar las cachés ARP vecinas',
        'Para limpiar las tablas MAC de todos los switches STP',
        'Para descubrir la MTU mínima de la ruta hacia Internet'
      ],
      correctIndex: 1,
      explanation: 'Sección 6.8: en el ARP gratuito el host pregunta por su propia IP; si alguien responde, hay conflicto de IP duplicada, y de paso actualiza las cachés ARP de la LAN.'
    },
    {
      id: 'u6-10',
      unit: 'u6',
      topic: 'DHCP y BOOTP',
      isTrap: false,
      question: '¿Cuáles son los 4 mensajes del intercambio básico DHCP y qué lo diferencia de BOOTP?',
      options: [
        'SYN, SYN-ACK, ACK, FIN; DHCP es solo para IPv6',
        'DISCOVER, OFFER, REQUEST, ACK; DHCP asigna IPs de forma temporal en arrendamiento (lease) a diferencia del mapeo fijo de BOOTP',
        'ARP Request, ARP Reply, RARP Request, RARP Reply',
        'Hello, LSA, SPF, Update; DHCP es un protocolo de enrutamiento'
      ],
      correctIndex: 1,
      explanation: 'DHCP evolucionó de BOOTP agregando asignación dinámica temporal (lease con renovación). Su secuencia es DISCOVER → OFFER → REQUEST → ACK.'
    },
    {
      id: 'u6-11',
      unit: 'u6',
      topic: 'ICMP (ping y traceroute)',
      isTrap: true,
      question: '¿Qué herramientas utilizan ICMP y qué mensajes aprovechan?',
      options: [
        'ping usa ICMP Echo/Echo Reply y traceroute aprovecha ICMP Time Exceeded incrementando el TTL (1, 2, 3…)',
        'ping usa ARP Broadcast y traceroute usa DHCP Relay',
        'ICMP configura automáticamente las IPs privadas de los hosts',
        'Un router envía ICMP Source Quench cuando una ventana TCP llega a 0'
      ],
      correctIndex: 0,
      explanation: 'Sección 6.8 y 9.2: ICMP informa errores y diagnóstico sobre IP; ping usa Echo/Echo Reply y traceroute envía paquetes con TTL creciente para provocar Time Exceeded en cada router.'
    },
    {
      id: 'u6-12',
      unit: 'u6',
      topic: 'NAT / PAT',
      isTrap: true,
      question: 'Sobre NAT/PAT, ¿qué afirmación es VERDADERA según la cátedra y la sección 9.2?',
      options: [
        'NAT es un mecanismo sin estado (stateless) que solo modifica direcciones de capa 2',
        'NAT vuelve con estado al router, viola el modelo de capas porque reescribe puertos de capa 4 (su código depende de protocolos de capa 4) y bloquea conexiones entrantes por defecto',
        'NAT no cumple con los estándares del NIST y por eso no funciona en redes domésticas',
        'NAT es obligatorio en IPv6 para poder salir a Internet'
      ],
      correctIndex: 1,
      explanation: 'Trampa clásica de 9.2: NAT guarda una tabla de traducciones (router con estado), depende de los puertos de capa 4 (cambia si cambian los protocolos de capa 4) y requiere port forwarding o uPnP para conexiones entrantes.'
    },
    {
      id: 'u6-13',
      unit: 'u6',
      topic: 'Enrutamiento dinámico',
      isTrap: true,
      question: '¿Qué par protocolo ↔ algoritmo ↔ familia es CORRECTO?',
      options: [
        'RIP usa el algoritmo de Dijkstra (estado del enlace)',
        'OSPF es un protocolo de enrutamiento estático configurado a mano',
        'RIP e IGRP son de vector distancia (Bellman-Ford); OSPF e IS-IS son de estado del enlace (Dijkstra)',
        'El algoritmo de estado del enlace solo intercambia distancias con los vecinos directos'
      ],
      correctIndex: 2,
      explanation: 'Trampa de 9.2: RIP e IGRP son vector distancia (Bellman-Ford, hablan solo con vecinos). OSPF e IS-IS son estado del enlace (Dijkstra, inundan el estado de enlaces para conocer la topología completa, y son dinámicos, no estáticos).'
    },
    {
      id: 'u6-14',
      unit: 'u6',
      topic: 'IPv6 características y cabecera',
      isTrap: false,
      question: '¿Qué elementos de la cabecera IPv4 DESAPARECIERON en la cabecera fija de 40 bytes de IPv6?',
      options: [
        'Las direcciones de origen y destino',
        'El campo IHL, los campos de fragmentación en cabecera fija y el Checksum de cabecera (además el TTL pasa a llamarse Límite de saltos)',
        'La versión de protocolo y la indicación del protocolo superior',
        'El soporte para tráfico en tiempo real y QoS'
      ],
      correctIndex: 1,
      explanation: 'Sección 6.9 y 11.10: IPv6 fija la cabecera en 40 B eliminando IHL, el checksum (por desempeño) y la fragmentación en routers intermedios (la MTU mínima garantizada sube a 1280 B).'
    },
    {
      id: 'u6-15',
      unit: 'u6',
      topic: 'Notación y direcciones IPv6',
      isTrap: false,
      question: '¿Cuál es la compresión válida de la dirección IPv6 2001:0DB8:0000:0000:0000:0000:1428:57AB y qué representa fe80::/10?',
      options: [
        '2001:DB8::1428:57AB; fe80::/10 es dirección de enlace local (link-local)',
        '2001:DB8::0:0::1428:57AB; fe80::/10 es loopback equivalente a 127.0.0.1',
        '2001:DB8:0:0:1428:57AB; fe80::/10 es dirección local única (ULA)',
        '2001:0DB8::1428:57AB/128; fe80::/10 es broadcast de IPv6'
      ],
      correctIndex: 0,
      explanation: 'Se omiten ceros a la izquierda en cada grupo y se reemplaza UNA sola secuencia continua de ceros por "::". Loopback es ::1/128, ULA es fc00::/7, enlace local es fe80::/10, y en IPv6 no existe broadcast.'
    },
    {
      id: 'u6-16',
      unit: 'u6',
      topic: 'IPv4 clases y privadas',
      isTrap: false,
      question: '¿Cuáles son los tres rangos de direcciones IPv4 privadas reservadas que requieren NAT para salir a Internet?',
      options: [
        '10.0.0.0/8, 127.0.0.0/8 y 192.168.0.0/16',
        '10.0.0.0/8, 172.16.0.0/12 y 192.168.0.0/16',
        '11.0.0.0/8, 172.32.0.0/16 y 192.0.0.0/24',
        '169.254.0.0/16, 224.0.0.0/4 y 240.0.0.0/4'
      ],
      correctIndex: 1,
      explanation: 'Sección 6.6 y 11.11: las IPv4 privadas son 10.0.0.0/8, 172.16.0.0/12 y 192.168.0.0/16. 127.0.0.0/8 es loopback y 224.0.0.0/4 es multicast (clase D).'
    }
  ];
})();
