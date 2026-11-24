(function () {
  'use strict';

  var App = window.RedesApp = window.RedesApp || {};

  App.DEEP_QUESTIONS = [
    /* ==================== UNIDAD 2: SUBCAPA MAC (9) ==================== */
    {
      id: 'dq-u2-01',
      unit: 'u2',
      category: 'porque',
      title: 'Asignación estática vs dinámica',
      question: '¿Por qué la asignación estática (FDM/TDM) funciona mal para tráfico de datos en LAN, y qué problema resuelve exactamente la subcapa MAC?',
      hint: 'Pensá en qué ocurre cuando el tráfico llega en ráfagas intermitentes.',
      keyPoints: [
        'En tráfico en ráfagas o impredecible, repartir ranuras o frecuencias fijas deja ociosos casi todo el tiempo los canales de estaciones inactivas.',
        'Una sola estación con demanda alta no puede aprovechar la capacidad desperdiciada por las demás.',
        'La MAC resuelve la asignación dinámica en tiempo real: decide quién puede transmitir y cuándo sobre un canal único compartido.'
      ],
      relatedTerms: ['Asignación estática (FDM, TDM)', 'Asignación dinámica', 'MAC (Medium Access Control)']
    },
    {
      id: 'dq-u2-02',
      unit: 'u2',
      category: 'porque',
      title: 'Período vulnerable en ALOHA',
      question: '¿Por qué el período vulnerable en ALOHA puro es 2T mientras que en ALOHA ranurado baja a T, duplicando el rendimiento máximo de 18,4% a 36,8%?',
      hint: 'Dibujá mentalmente cuándo puede empezar una trama B que pise el inicio o el final de una trama A de duración T.',
      keyPoints: [
        'En ALOHA puro, si A empieza en t₀, cualquier trama que empiece entre t₀−T y t₀ pisa su comienzo, y cualquiera entre t₀ y t₀+T pisa su final (ventana 2T).',
        'En ALOHA ranurado se exige sincronización global: las tramas solo empiezan al inicio de un slot de ancho T.',
        'Al alinear los comienzos, o chocan completamente dentro del mismo slot o no se tocan: el período vulnerable pasa a T y S_max pasa de 1/(2e) a 1/e.'
      ],
      relatedTerms: ['ALOHA puro', 'ALOHA ranurado', 'Período vulnerable']
    },
    {
      id: 'dq-u2-03',
      unit: 'u2',
      category: 'quepasaria',
      title: 'Espera determinística tras colisión',
      question: '¿Qué pasaría en ALOHA o Ethernet si todas las estaciones usaran un tiempo de espera fijo (no aleatorio) tras detectar una colisión?',
      hint: 'Imaginá a A y B colisionando en t = 0 y esperando exactamente 10 ms las dos.',
      keyPoints: [
        'Ambas estaciones volverían a transmitir exactamente en el mismo instante.',
        'Las mismas tramas colisionarían una y otra vez indefinidamente (bloqueo mutuo).',
        'El tiempo aleatorio (y en CSMA/CD el backoff exponencial binario creciente) rompe la sincronía entre contendientes.'
      ],
      relatedTerms: ['ALOHA puro', 'Backoff exponencial binario']
    },
    {
      id: 'dq-u2-04',
      unit: 'u2',
      category: 'comparacion',
      title: 'CSMA 1-persistente vs no persistente vs p-persistente',
      question: 'Compará las tres variantes de CSMA frente a carga baja y carga alta: ¿por qué la 1-persistente sufre el "efecto estampida" y qué sacrifica la no persistente para evitarlo?',
      hint: 'Pensá qué hace cada una cuando encuentra el canal ocupado.',
      keyPoints: [
        'CSMA 1-persistente sigue escuchando y transmite con prob. 1 apenas queda libre: baja latencia en baja carga, pero si varias esperan chocan juntas (estampida).',
        'CSMA no persistente suelta el canal y espera un tiempo aleatorio antes de volver a sensar: reduce colisiones bajo carga alta, pero introduce demoras e instantes ociosos.',
        'CSMA p-persistente (canales ranurados) busca un compromiso regulado por p entre demora y contención.'
      ],
      relatedTerms: ['CSMA', 'Efecto estampida']
    },
    {
      id: 'dq-u2-05',
      unit: 'u2',
      category: 'quepasaria',
      title: 'Regla 2τ y trama mínima de 64 bytes',
      question: '¿Qué pasaría en Ethernet clásico (10BASE5 / 10 Mb/s) si se permitieran tramas válidas de 20 bytes? Explicá la relación entre diámetro de red, τ y los 512 bit-times.',
      hint: 'Seguí el peor caso: A está en un extremo, B en el otro, y B empieza justo antes de que llegue la señal de A.',
      keyPoints: [
        'La señal tarda τ en llegar de A a B; si B empieza justo en τ − ε, la ráfaga de colisión tarda otro τ en volver a A (total 2τ ≈ 50 µs en 2,5 km).',
        'Si A terminara de transmitir los 20 bytes (16 µs a 10 Mb/s) antes de 2τ, A creería erróneamente que transmitió con éxito y no reintentaría.',
        'Por eso la trama mínima dura ≥ 2τ: 512 bit-times = 51,2 µs = 64 bytes, lo que también distingue tramas válidas de fragmentos de colisión.'
      ],
      relatedTerms: ['Retardo de propagación (τ)', 'Slot time', 'Trama mínima y 2τ']
    },
    {
      id: 'dq-u2-06',
      unit: 'u2',
      category: 'porque',
      title: 'Por qué CSMA/CD falla en radio',
      question: '¿Por qué es físicamente inviable usar CSMA/CD en redes inalámbricas 802.11, y cómo compensa CSMA/CA esa imposibilidad?',
      hint: 'Pensá en el hardware de radio (potencia propia vs ajena) y en lo que importa al receptor.',
      keyPoints: [
        'La señal propia del emisor es millones de veces más fuerte que una señal entrante débil ("una aguja en un pajar") y las radios suelen ser half-duplex.',
        'Además, en radio dos emisores pueden no oírse entre sí y colisionar igual en el receptor (terminal oculta).',
        'CSMA/CA evita colisiones antes de transmitir (DIFS + backoff congelable + RTS/CTS opcional) e infiere el éxito o colisión a posteriori mediante ACK.'
      ],
      relatedTerms: ['CSMA/CD', 'CSMA/CA', 'Terminal oculta']
    },
    {
      id: 'dq-u2-07',
      unit: 'u2',
      category: 'comparacion',
      title: 'Terminales ocultas vs expuestas y alcance de RTS/CTS',
      question: 'Explicá con claridad la diferencia entre terminal oculta y terminal expuesta. ¿Por qué el RTS/CTS de 802.11 ayuda con las ocultas pero NO con las expuestas?',
      hint: 'Fijate qué trama escucha la estación vecina en cada caso y en qué lugar importa la interferencia.',
      keyPoints: [
        'Terminal oculta: A y C no se oyen pero interfieren en el receptor B. Con RTS/CTS, C oye el CTS de B, actualiza su NAV y espera.',
        'Terminal expuesta: B→A y C→D son compatibles porque sus receptores no oyen al otro emisor, pero C oye a B y se aplaza.',
        'En 802.11, RTS/CTS no resuelve la expuesta porque la estación expuesta igualmente oye el RTS de B o se frena por sensado físico (a diferencia del esquema ideal MACA).'
      ],
      relatedTerms: ['Terminal oculta', 'Terminal expuesta', 'RTS / CTS', 'NAV (Network Allocation Vector)']
    },
    {
      id: 'dq-u2-08',
      unit: 'u2',
      category: 'porque',
      title: 'Protocolos sin colisiones vs tráfico en tiempo real',
      question: '¿Por qué CSMA/CD es malo para tráfico en tiempo real como VoIP y cómo garantizan determinismo protocolos como mapa de bits o token passing?',
      hint: 'Compará varianza de retardo (jitter) y contención bajo carga alta.',
      keyPoints: [
        'En CSMA/CD las colisiones hacen variable e impredecible el tiempo de acceso al canal (incluso riesgo de abandono tras 16 colisiones).',
        'Los protocolos de reservación (mapa de bits) o acceso controlado (token passing) resuelven quién transmite sin colisiones en un tiempo acotado.',
        'Además, el backoff exponencial binario tiene efecto LIFO: estaciones recién llegadas pueden ganar antes que las que llevan varias colisiones.'
      ],
      relatedTerms: ['Protocolo de mapa de bits', 'Paso de testigo (token passing)', 'Acceso controlado']
    },
    {
      id: 'dq-u2-09',
      unit: 'u2',
      category: 'comparacion',
      title: 'Retorno a N vs Repetición selectiva',
      question: 'En ventanas deslizantes de capa de enlace, ¿por qué Retorno a N no es siempre más eficiente que Repetición selectiva y qué costo de memoria tiene la segunda?',
      hint: 'Analizá qué pasa con las tramas posteriores que llegan bien después de una trama perdida.',
      keyPoints: [
        'Retorno a N descarta todas las tramas posteriores a una errónea y obliga a retransmitir toda la ventana: sirve solo si los errores son muy escasos.',
        'Repetición selectiva acepta y almacena en buffer las tramas posteriores correctas, retransmitiendo solo la perdida: rinde mucho mejor en enlaces ruidosos.',
        'El costo de Repetición selectiva es mayor complejidad y memoria de buffer en el receptor; el NAK acelera ambos evitando esperar al timeout.'
      ],
      relatedTerms: ['MAC (Medium Access Control)']
    },

    /* ==================== UNIDAD 3: ETHERNET 802.3 (9) ==================== */
    {
      id: 'dq-u3-01',
      unit: 'u3',
      category: 'porque',
      title: 'La estabilidad de la MAC frente al cambio de la PHY',
      question: '¿Por qué Ethernet pudo pasar de 3–10 Mb/s sobre coaxial a 800 Gb/s sobre fibra y múltiples lanes conservando casi intacta la trama y la MAC?',
      hint: 'Pensá en la separación arquitectónica de IEEE 802.3 y en el software superior.',
      keyPoints: [
        'IEEE 802.3 separó una subcapa MAC común (misma trama, direcciones de 48 bits, FCS) de capas físicas (PHY) intercambiables adaptadas mediante RS/xMII.',
        'Mantener una trama estable protegió a las pilas de protocolos superiores (IP, TCP, OS) durante décadas sin romper compatibilidad.',
        'Cuando apareció la conmutación full-duplex, la trama sobrevivió incluso tras desaparecer CSMA/CD.'
      ],
      relatedTerms: ['IEEE 802.3', 'PHY, RS/xMII, MDI']
    },
    {
      id: 'dq-u3-02',
      unit: 'u3',
      category: 'porque',
      title: 'Unificación de Ethernet II e IEEE 802.3 (umbral 0x0600)',
      question: '¿Cómo conviven en el mismo formato físico las tramas Ethernet II (que usan EtherType) y las 802.3 originales (que usan Longitud) sin ambigüedad?',
      hint: 'Fijate cuál es el tamaño máximo permitido para la carga útil (MTU).',
      keyPoints: [
        'En 802.3 el campo de 2 bytes indica la longitud de la carga útil, que nunca supera 1500 bytes (MTU).',
        'Todos los valores históricos de EtherType de DIX eran mayores o iguales a 1536 (0x0600), como 0x0800 (IPv4) o 0x0806 (ARP).',
        'En 1997 el IEEE aceptó ambos: ≤ 1500 se interpreta como longitud (+ cabecera LLC/SNAP), y ≥ 1536 como EtherType directo.'
      ],
      relatedTerms: ['Length/Type', 'LLC/SNAP', 'MTU (1500 B)']
    },
    {
      id: 'dq-u3-03',
      unit: 'u3',
      category: 'quepasaria',
      title: 'Sin longitud en protocolo superior con padding',
      question: 'Si una trama IPv4 lleva solo 26 bytes totales, la MAC Ethernet le agrega 20 bytes de padding para llegar a 46 bytes. ¿Cómo sabe IP dónde termina el paquete real y empieza el relleno?',
      hint: 'Pensá qué información trae la propia cabecera del protocolo de capa 3.',
      keyPoints: [
        'En Ethernet II el campo de 2 bytes es EtherType (no indica la longitud de datos de la trama).',
        'La MAC entrega los 46 bytes completos hacia arriba; el padding no es semántico.',
        'Por eso el protocolo superior (como IPv4 con su campo "Longitud total") necesita declarar su propia longitud para ignorar el relleno.'
      ],
      relatedTerms: ['Padding', 'Length/Type']
    },
    {
      id: 'dq-u3-04',
      unit: 'u3',
      category: 'comparacion',
      title: 'Fast Ethernet vs Gigabit Half-Duplex',
      question: '¿Por qué al pasar de 10 Mb/s a 100 Mb/s se aceptó reducir el diámetro de red ÷10, mientras que en 1 Gb/s half-duplex se prefirió agregar extensión de portadora y ráfagas de tramas?',
      hint: 'Calculá cuánto mediría una red de 1 Gb/s si dividiéramos por 10 otra vez los ~200 metros de Fast Ethernet.',
      keyPoints: [
        'En 100BASE-TX, mantener el slot time de 512 bits redujo su duración a 5,12 µs y el diámetro bajó de ~2,5 km a ~200 m (aceptable para estrella con hub).',
        'A 1 Gb/s, 512 bits durarían solo 0,512 µs, reduciendo el diámetro máximo a unos ~25 m (impráctico).',
        'Por eso en 1 Gb/s half-duplex se elevó el slot time a 4096 bits (512 B) mediante extensión de portadora (padding físico) y ráfagas, aunque en la práctica todo pasó a switch full-duplex.'
      ],
      relatedTerms: ['Slot time', 'Extensión de portadora y ráfagas de tramas']
    },
    {
      id: 'dq-u3-05',
      unit: 'u3',
      category: 'porque',
      title: 'Cómo logra 1000BASE-T 1 Gb/s en Cat 5e',
      question: '¿Por qué 100BASE-TX usa 2 pares trenzados y necesita 125 MBd, mientras que 1000BASE-T logra 10 veces más velocidad (1 Gb/s) manteniendo los mismos 100 metros en Cat 5e?',
      hint: 'Analizá cuántos pares se usan, la bidireccionalidad y los niveles de señal.',
      keyPoints: [
        '1000BASE-T usa los 4 pares simultáneamente en lugar de 2.',
        'Cada par opera full-duplex a la vez (250 Mb/s en cada sentido) usando DSP y cancelación de eco.',
        'En lugar de 3 niveles (MLT-3) usa modulación multinivel PAM-5 (más bits por baudio), manteniendo baja la frecuencia en el cable.'
      ],
      relatedTerms: ['PAM‑5 / PAM‑16', '4B/5B, MLT‑3, NRZI']
    },
    {
      id: 'dq-u3-06',
      unit: 'u3',
      category: 'escenario',
      title: 'Diagnóstico de Duplex Mismatch',
      question: 'Un enlace entre un servidor y un switch anda lentísimo y reporta "colisiones tardías" y errores de CRC en un extremo. ¿Cuál es la causa más probable y cómo ocurre?',
      hint: 'Pensá qué pasa cuando falla la autonegociación y un extremo queda fijo en full-duplex mientras el otro cae a half-duplex.',
      keyPoints: [
        'El extremo en full-duplex desactiva CSMA/CD y transmite cuando quiere, incluso mientras recibe.',
        'El extremo en half-duplex sigue sensando: cuando recibe tráfico mientras está transmitiendo (incluso después de los primeros 512 bits) lo registra como colisión tardía y aborta.',
        'Las tramas abortadas a mitad de camino llegan al otro extremo con FCS inválido (errores de CRC).'
      ],
      relatedTerms: ['Duplex mismatch', 'Autonegociación', 'Colisión tardía']
    },
    {
      id: 'dq-u3-07',
      unit: 'u3',
      category: 'porque',
      title: 'Preámbulo, SFD e IFG fuera del conteo de la trama',
      question: '¿Por qué el Preámbulo (7 B), el SFD (1 B) y el IFG (96 bit-times) existen en el cable pero NO se cuentan dentro de los 64–1518 bytes ni los cubre el FCS?',
      hint: 'Diferenciá sincronización física de datos de enlace verificables.',
      keyPoints: [
        'El preámbulo (patrón 101010...) sirve para que la electrónica receptora sincronice su reloj físico antes de leer datos.',
        'El SFD (10101011) marca el bit exacto donde empieza el primer byte de la MAC destino; el IFG da respiro entre tramas.',
        'Recién a partir de la MAC destino comienzan los bytes protegidos por el CRC-32 (FCS) y contabilizados en los 64–1518 bytes.'
      ],
      relatedTerms: ['Preámbulo (7 B) y SFD (1 B)', 'IFG', 'FCS']
    },
    {
      id: 'dq-u3-08',
      unit: 'u3',
      category: 'comparacion',
      title: 'Unicast vs Multicast vs Broadcast MAC',
      question: '¿Cómo distingue físicamente una NIC Ethernet entre una trama unicast, una multicast (01:00:5E:...) y una broadcast (FF:FF:FF:FF:FF:FF)?',
      hint: 'Recordá qué bit del primer octeto de la MAC destino se transmite primero.',
      keyPoints: [
        'En Ethernet se transmite primero el bit menos significativo de cada octeto: el primer bit de la MAC destino es el bit I/G (Individual/Group).',
        'Si ese bit es 0, es unicast (destinada a una sola interfaz).',
        'Si es 1, es de grupo: multicast (un subconjunto suscripto) o FF:FF:FF:FF:FF:FF (broadcast a toda la LAN, sin gestión de grupos).'
      ],
      relatedTerms: ['Bit I/G y bit U/L', 'Unicast, multicast y broadcast']
    },
    {
      id: 'dq-u3-09',
      unit: 'u3',
      category: 'porque',
      title: 'Detección sin corrección en Ethernet',
      question: '¿Por qué Ethernet detecta errores con CRC-32 y simplemente descarta la trama dañada en lugar de corregirla o pedir retransmisión por ACK?',
      hint: 'Tené en cuenta la tasa de error del cableado y dónde conviene recuperar errores.',
      keyPoints: [
        'Los medios cableados tienen una tasa de error de bit muy baja: agregar redundancia FEC o ACKs por cada trama agregaría sobrecarga innecesaria.',
        'El CRC-32 se implementa muy rápido y barato en hardware.',
        'Cuando ocurre un error poco frecuente, es más eficiente descartar y dejar que capas superiores (como TCP) recuperen el paquete.'
      ],
      relatedTerms: ['FCS', 'IEEE 802.3']
    },

    /* ==================== UNIDAD 4: CONMUTACIÓN, STP y PoE (8) ==================== */
    {
      id: 'dq-u4-01',
      unit: 'u4',
      category: 'comparacion',
      title: 'Hub vs Switch vs Router vs AP',
      question: 'Si tenés una red con un Hub, un Switch, un Access Point y un Router, ¿cómo trata cada uno los dominios de colisión, los dominios de broadcast y en qué capa OSI decide?',
      hint: 'Ojo con la trampa clásica del Access Point: ¿es capa 3 o capa 2?',
      keyPoints: [
        'Hub (Capa 1): repite señales eléctricas; todo queda en 1 dominio de colisión y 1 de broadcast.',
        'Switch (Capa 2): decide por MAC destino; crea 1 dominio de colisión por puerto, pero mantiene 1 dominio de broadcast (salvo VLANs).',
        'Access Point (Capas 1 y 2): es un puente inalámbrico 802.1D (no un router); el canal de radio del BSS es compartido.',
        'Router (Capa 3): decide por IP destino; separa tanto dominios de colisión como dominios de broadcast.'
      ],
      relatedTerms: ['Hub / repetidor', 'Switch / puente', 'Dominio de colisión']
    },
    {
      id: 'dq-u4-02',
      unit: 'u4',
      category: 'quepasaria',
      title: 'Envejecimiento (purga) de la tabla MAC',
      question: '¿Por qué la tabla MAC de un switch guarda una marca de tiempo y purga periódicamente las entradas viejas? ¿Qué pasaría si nunca expiraran?',
      hint: 'Imaginá desconectar una notebook del puerto 1 y conectarla al puerto 4.',
      keyPoints: [
        'El switch es transparente: aprende por la MAC de origen de las tramas entrantes sin configuración manual.',
        'Si una estación se muda de puerto (o se apaga) y la entrada nunca venciera, el switch seguiría enviando tramas al puerto viejo hasta que el equipo transmita de nuevo.',
        'Purgar entradas inactivas (tras unos minutos) permite que la red se adapte sola y evita que la tabla se llene de equipos desconectados.'
      ],
      relatedTerms: ['Tabla MAC', 'Aprendizaje hacia atrás']
    },
    {
      id: 'dq-u4-03',
      unit: 'u4',
      category: 'quepasaria',
      title: 'Tormenta de broadcast sin STP',
      question: 'Conectás dos switches en paralelo con dos cables para tener redundancia sin activar STP (802.1D). ¿Qué ocurre exactamente cuando una PC envía un ARP broadcast o una trama a destino desconocido?',
      hint: 'Seguí cómo inunda cada switch una trama que recibe por uno de sus puertos.',
      keyPoints: [
        'Las tramas Ethernet no tienen TTL, y el switch no sabe distinguir si dos copias de un broadcast son la misma trama.',
        'SW1 inunda el broadcast por ambos enlaces; SW2 recibe una copia por el enlace 1 y la reenvía por el enlace 2 de vuelta a SW1 (y viceversa).',
        'El bucle es eterno, satura el CPU y el ancho de banda de toda la LAN (tormenta de broadcast) y vuelve inestable la tabla MAC.'
      ],
      relatedTerms: ['STP (802.1D) y BPDU', 'Inundación y filtrado']
    },
    {
      id: 'dq-u4-04',
      unit: 'u4',
      category: 'porque',
      title: 'Estados intermedios Listening y Learning en STP',
      question: '¿Por qué un puerto en STP (802.1D) no pasa directamente de Blocking a Forwarding sino que atraviesa Listening y Learning?',
      hint: 'Pensá en dos riesgos: bucles transitorios mientras convergen BPDUs e inundación masiva sin tabla MAC.',
      keyPoints: [
        'En Listening el puerto solo procesa BPDUs para asegurar que la nueva topología sin ciclos haya convergido en toda la red antes de abrir paso al tráfico.',
        'En Learning sigue sin reenviar tramas de usuario, pero ya lee direcciones MAC de origen para poblar su tabla MAC.',
        'Así, al llegar a Forwarding se evitan lazos temporales y se minimiza la inundación innecesaria.'
      ],
      relatedTerms: ['Estados de puerto STP', 'STP (802.1D) y BPDU']
    },
    {
      id: 'dq-u4-05',
      unit: 'u4',
      category: 'comparacion',
      title: 'Store-and-forward vs Cut-through',
      question: '¿En qué escenario elegirías conmutación cut-through frente a store-and-forward, y qué desventaja asumís al hacerlo?',
      hint: 'Evaluá latencia versus integridad de tramas y velocidades distintas entre puertos.',
      keyPoints: [
        'Cut-through reduce la latencia porque empieza a reenviar apenas lee los primeros bytes (MAC destino), útil en enlaces de muy baja latencia.',
        'Desventaja: no espera los últimos 4 bytes del FCS, por lo que reenvía tramas corruptas o fragmentos de colisión desperdiciando ancho de banda.',
        'Store-and-forward valida el FCS completo y permite además adaptar velocidades distintas entre puertos mediante buffers.'
      ],
      relatedTerms: ['Store‑and‑forward / cut‑through', 'FCS']
    },
    {
      id: 'dq-u4-06',
      unit: 'u4',
      category: 'porque',
      title: 'Etiqueta VLAN 802.1Q transparente para los hosts',
      question: '¿Por qué el primer switch con soporte VLAN agrega la etiqueta 802.1Q y el último la quita antes de entregar la trama a la PC destino?',
      hint: '¿Las tarjetas de red de usuario común esperan una trama estándar o una etiquetada?',
      keyPoints: [
        'Las estaciones comunes no necesitan saber de VLANs y esperan tramas Ethernet estándar de hasta 1518 B.',
        'El switch de acceso inserta la etiqueta de 4 B (1522 B máx) para transportar la pertenencia de VLAN por troncales entre switches.',
        'Al salir hacia el host destino se remueve el tag para mantener total compatibilidad.'
      ],
      relatedTerms: ['VLAN (802.1Q)', 'Etiqueta 802.1Q']
    },
    {
      id: 'dq-u4-07',
      unit: 'u4',
      category: 'escenario',
      title: 'Presupuesto de potencia PoE',
      question: 'Un switch PoE+ (802.3at) anuncia 30 W por puerto y tiene 24 puertos, pero su fuente interna tiene un presupuesto total de 370 W. ¿Qué pasa si conectás 20 cámaras que piden 25 W cada una?',
      hint: 'Multiplicá la demanda real contra el presupuesto total y distinguí potencia en PSE vs PD.',
      keyPoints: [
        '20 cámaras × 25 W en el PD exigen al menos 500 W (más las pérdidas en el cable hacia los 30 W del PSE).',
        'Aunque cada puerto individual soporte 802.3at (30 W PSE / 25,5 W PD), el presupuesto total de 370 W no alcanza.',
        'Algunos PD no encenderán o serán desconectados por prioridad cuando el switch alcance su tope.'
      ],
      relatedTerms: ['PoE (PSE y PD)']
    },
    {
      id: 'dq-u4-08',
      unit: 'u4',
      category: 'porque',
      title: 'Seguridad: Hub vs Switch en modo promiscuo',
      question: '¿Por qué si un atacante pone su NIC en modo promiscuo puede capturar el tráfico ajeno si está conectado a un hub, pero normalmente no ve el tráfico unicast ajeno detrás de un switch?',
      hint: 'Compará qué llega físicamente al cable de cada puerto.',
      keyPoints: [
        'El hub repite eléctricamente todas las tramas por todos los puertos: cualquier NIC en modo promiscuo recibe el tráfico de toda la LAN.',
        'El switch filtra según la tabla MAC y envía las tramas unicast únicamente hacia el puerto del destinatario.',
        'Aunque el switch aisla mejor (salvo inundaciones, broadcast o ataques a la tabla), el apunte recuerda que cifrar sigue siendo necesario.'
      ],
      relatedTerms: ['Hub / repetidor', 'Switch / puente', 'Inundación y filtrado']
    },

    /* ==================== UNIDAD 5: WI-FI 802.11 (10) ==================== */
    {
      id: 'dq-u5-01',
      unit: 'u5',
      category: 'porque',
      title: 'Tasa PHY vs Goodput en Wi-Fi',
      question: '¿Por qué una red Wi-Fi con tasa PHY anunciada de 300 Mb/s (o 802.11ac teórico de varios Gbps) entrega un rendimiento útil (goodput) mucho menor en la práctica?',
      hint: 'Enumerá todo lo que ocurre en el aire además de los bits de datos de usuario.',
      keyPoints: [
        'El canal es compartido half-duplex: solo una estación transmite a la vez en el BSS.',
        'Hay sobrecarga obligatoria de MAC y PHY: preámbulos, espaciados DIFS/SIFS, backoff aleatorio, tramas ACK, Beacons y eventuales RTS/CTS.',
        'Además la tasa adaptativa baja la modulación ante ruido/distancia y la contienda con otros usuarios o redes vecinas reduce el tiempo útil.'
      ],
      relatedTerms: ['DCF', 'Beacon']
    },
    {
      id: 'dq-u5-02',
      unit: 'u5',
      category: 'escenario',
      title: 'Planificación de canales en 2,4 GHz vs 5 GHz',
      question: 'Si instalás 3 Access Points cercanos en 2,4 GHz y ponés uno en canal 1, otro en canal 3 y otro en canal 6, ¿qué problema vas a generar frente a usar 1, 6 y 11?',
      hint: 'Recordá que los canales de 2,4 GHz se solapan en frecuencia aunque tengan números distintos.',
      keyPoints: [
        'Los centros en 2,4 GHz están separados solo 5 MHz mientras el ancho de canal es ~20–22 MHz.',
        'El canal 3 se solapa tanto con el 1 como con el 6, causando interferencia cocanal/adyacente y colisiones/esperas de portadora innecesarias.',
        'Usar 1, 6 y 11 garantiza tres canales independientes sin solapamiento; en 5 GHz hay más canales aunque algunas subbandas requieren DFS.'
      ],
      relatedTerms: ['Canales 1, 6 y 11', 'DFS']
    },
    {
      id: 'dq-u5-03',
      unit: 'u5',
      category: 'comparacion',
      title: 'OFDM vs MIMO vs OFDMA vs Beamforming',
      question: 'Distinguí claramente qué hace cada una de estas cuatro tecnologías en 802.11: OFDM, MIMO (multiplexación vs diversidad), Beamforming y OFDMA.',
      hint: 'Asigná cada una a su dimensión: subportadoras ortogonales, antenas espaciales, fase dirigida o unidades de recurso multiusuario.',
      keyPoints: [
        'OFDM divide un canal en muchas subportadoras ortogonales para combatir multitrayectoria (con prefijo cíclico).',
        'MIMO usa múltiples antenas/cadenas RF: diversidad mejora robustez; multiplexación espacial envía flujos distintos simultáneos (más tasa).',
        'Beamforming pondera fase y amplitud para concentrar energía hacia el receptor (mejora SNR sin crear potencia extra).',
        'OFDMA (802.11ax) reparte subportadoras en RUs entre distintos usuarios dentro de una misma transmisión (eficiente para muchos paquetes chicos).'
      ],
      relatedTerms: ['OFDM', 'MIMO', 'Beamforming', 'OFDMA']
    },
    {
      id: 'dq-u5-04',
      unit: 'u5',
      category: 'porque',
      title: 'Anomalía de la tasa y TXOP en EDCA',
      question: '¿Qué es la "anomalía de la tasa" en Wi-Fi cuando convive una estación lejos (6 Mb/s) y otra cerca (54 Mb/s), y cómo ayuda TXOP en EDCA?',
      hint: 'Pensá quién acapara el tiempo del aire si ambos compiten por igual cantidad de tramas.',
      keyPoints: [
        'Con DCF justo por paquete, cada estación manda una trama por turno, pero la estación a 6 Mb/s tarda 9 veces más tiempo en el aire por trama.',
        'Como resultado, la estación lenta consume casi todo el tiempo del canal y arrastra el rendimiento de la estación rápida.',
        'TXOP asigna una ventana de tiempo (oportunidad de transmisión) en lugar de "una trama", permitiendo al rápido enviar varias tramas en su turno.'
      ],
      relatedTerms: ['EDCA, AC, AIFS, TXOP', 'DCF']
    },
    {
      id: 'dq-u5-05',
      unit: 'u5',
      category: 'porque',
      title: 'Por qué el backoff Wi-Fi se congela',
      question: 'En 802.11 DCF, ¿por qué cuando el canal se vuelve a ocupar durante la cuenta regresiva del backoff se congela el contador restante en vez de sortear uno nuevo?',
      hint: 'Pensá en justicia (fairness) frente a estaciones que recién llegan al canal.',
      keyPoints: [
        'Congelar el contador garantiza que la estación que ya esperó parte de su backoff conserve esa ventaja en el próximo período libre.',
        'Si sorteara siempre un backoff nuevo, una estación podría sufrir inanición indefinida frente a tráfico continuo.',
        'Solo cuando falla una transmisión (falta de ACK) se duplica la ventana CW hasta CWmax.'
      ],
      relatedTerms: ['Backoff 802.11', 'DCF']
    },
    {
      id: 'dq-u5-06',
      unit: 'u5',
      category: 'porque',
      title: '3 direcciones en infraestructura vs 4 en WDS',
      question: '¿Por qué una trama Ethernet usa solo 2 direcciones MAC (Destino y Origen) mientras una trama de datos 802.11 normal usa 3 direcciones y en WDS usa 4?',
      hint: 'Diferenciá los actores del salto de radio (TA, RA) de los extremos lógicos de la trama (SA, DA).',
      keyPoints: [
        'En Wi-Fi infraestructura el salto por aire siempre involucra al AP (BSSID), que puede no ser ni el origen ni el destino lógico del paquete Ethernet detrás del DS.',
        'Hacen falta 4 roles (RA, TA, DA, SA). En Notebook→AP→Servidor coinciden TA=SA, así que alcanzan 3 direcciones (RA=BSSID, TA=SA, DA).',
        'En WDS (enlace puente entre dos APs), tanto transmisor como receptor de radio difieren de origen y destino finales: se necesita Address 4 (30 bytes de cabecera).'
      ],
      relatedTerms: ['RA, TA, DA, SA', 'To DS / From DS', 'WDS']
    },
    {
      id: 'dq-u5-07',
      unit: 'u5',
      category: 'quepasaria',
      title: 'Ocultar el SSID del Beacon',
      question: '¿Qué pasa si configurás un AP para "ocultar el SSID" en sus tramas Beacon? ¿Eso evita que la red exista en el aire o aporta verdadera seguridad?',
      hint: 'Recordá cómo descubre la red una STA que ya conoce el nombre (Probe Request).',
      keyPoints: [
        'El AP sigue emitiendo Beacons cada 100 TU (102,4 ms) anunciando su BSSID, canal y parámetros, solo que con el SSID vacío.',
        'Las estaciones configuradas deben enviar Probe Requests activos nombrando el SSID, revelándolo en el aire.',
        'La seguridad real no depende de ocultar el nombre sino de WPA2/WPA3 (4-Way Handshake, AES-CCMP/GCMP, SAE).'
      ],
      relatedTerms: ['Beacon', 'SSID / BSSID', 'Probe Request']
    },
    {
      id: 'dq-u5-08',
      unit: 'u5',
      category: 'comparacion',
      title: 'WEP vs WPA2-Personal vs Enterprise vs WPA3-SAE',
      question: '¿Por qué WEP está completamente roto y qué mejoras concretas introducen WPA2-Personal (4-Way Handshake), Enterprise (802.1X/EAP) y WPA3-SAE?',
      hint: 'Contrastá RC4/IV24, posesión de PMK sin enviarla, credenciales individuales y resistencia a diccionario offline.',
      keyPoints: [
        'WEP usa RC4 con IV corto (24 bits) que se repite y permite recuperar flujo de clave y la clave misma.',
        'WPA2-Personal usa AES-CCMP y el 4-Way Handshake prueba la PMK con nonces/MIC derivando PTK y GTK sin transmitir la passphrase (aunque sigue vulnerable a diccionario offline si capturan el handshake).',
        'Enterprise usa 802.1X/EAP + servidor RADIUS para autenticar por usuario/certificado sin clave compartida única.',
        'WPA3-Personal reemplaza PSK por SAE (resiste ataques de diccionario offline) y exige PMF.'
      ],
      relatedTerms: ['WEP, WPA, WPA2, WPA3', '4‑Way Handshake', 'SAE', '802.1X / EAP / RADIUS']
    },
    {
      id: 'dq-u5-09',
      unit: 'u5',
      category: 'porque',
      title: 'Fiabilidad Wi-Fi: bajar tasa o acortar tramas',
      question: '¿Por qué en un enlace inalámbrico con alta tasa de error de bit (ej. p = 10⁻⁴) conviene bajar la tasa de modulación o fragmentar en tramas más cortas?',
      hint: 'Calculá intuitivamente la probabilidad de que 12.144 bits lleguen todos bien frente a 4.048 bits.',
      keyPoints: [
        'Con p = 10⁻⁴ por bit, una trama Ethernet completa (12.144 bits) tiene menos de 30% de probabilidad de llegar intacta, generando retransmisiones constantes.',
        'Usar modulaciones más robustas (menor tasa PHY, ej. QPSK en vez de 1024-QAM) tolera menor SNR y reduce p.',
        'Usar fragmentación o tramas cortas sube la probabilidad de éxito de cada envío y solo retransmite el fragmento perdido.'
      ],
      relatedTerms: ['QAM', 'SIFS / PIFS / DIFS / EIFS']
    },
    {
      id: 'dq-u5-10',
      unit: 'u5',
      category: 'escenario',
      title: 'ESP32 en modo STA+SoftAP y 2,4 GHz',
      question: 'Si usás un ESP32 clásico en modo STA + SoftAP para leer un sensor y ofrecer una web de configuración, ¿qué limitaciones físicas y de estándar tenés según el apunte?',
      hint: 'Revisá qué versiones de 802.11, bandas y flujos espaciales soporta el ESP32 clásico.',
      keyPoints: [
        'El ESP32 clásico solo soporta Wi-Fi 4 (802.11b/g/n) en 2,4 GHz con un único flujo espacial (1×1): no soporta 5 GHz, ni ac/ax ni MIMO multiflujo.',
        'En STA + SoftAP ambos roles comparten la misma radio y el mismo canal.',
        'Además, activar STA + SoftAP no lo convierte automáticamente en un router ni en un repetidor puenteado por sí solo.'
      ],
      relatedTerms: ['STA, AP', 'Wi‑Fi 4, 5, 6 y 6E']
    },

    /* ==================== UNIDAD 6: CAPA DE RED IPv4 / IPv6 (9) ==================== */
    {
      id: 'dq-u6-01',
      unit: 'u6',
      category: 'porque',
      title: 'Por qué el direccionamiento MAC plano no escala',
      question: 'Si cada placa de red ya viene de fábrica con una dirección MAC única globalmente, ¿por qué necesitamos además direcciones IP de capa 3?',
      hint: 'Pensá en el tamaño de las tablas de reenvío mundiales y en los códigos postales.',
      keyPoints: [
        'Las direcciones MAC son planas (OUI del fabricante + número): no indican en qué red o ubicación geográfica está un host.',
        'Para enrutar por MAC en Internet cada router debería conocer mil millones de entradas individuales.',
        'IP introduce direccionamiento jerárquico (prefijo de red + host): los routers miran solo el prefijo (~300.000 rutas en lugar de miles de millones).'
      ],
      relatedTerms: ['Direccionamiento plano / jerárquico', 'Dirección MAC']
    },
    {
      id: 'dq-u6-02',
      unit: 'u6',
      category: 'escenario',
      title: 'Viaje extremo a extremo: paquete vs trama',
      question: 'Explicá paso a paso qué pasa cuando tu PC (192.168.1.10/24, gateway 192.168.1.1) envía un paquete a un servidor remoto 200.10.20.30. ¿Dónde cambia el paquete y dónde cambia la trama?',
      hint: 'Seguí AND con máscara, caché ARP, encapsulado, router y desencapsulado.',
      keyPoints: [
        'La PC hace AND entre 200.10.20.30 y 255.255.255.0: no da 192.168.1.0, por lo que decide enviar al gateway (192.168.1.1).',
        'Resuelve por ARP la MAC del gateway (no la del servidor remoto) y encapsula el paquete (IP origen .1.10 → IP destino 200.10.20.30) en una trama con MAC destino = gateway.',
        'Cada router desencapsula la trama, decrementa TTL, elige el próximo salto y arma una nueva trama con sus MACs. Sin NAT, las IPs origen y destino nunca cambian ("el paquete no cambia, la trama sí").'
      ],
      relatedTerms: ['El paquete no cambia, la trama sí', 'Gateway / ruta por defecto', 'ARP y caché ARP']
    },
    {
      id: 'dq-u6-03',
      unit: 'u6',
      category: 'porque',
      title: 'Por qué existen subredes y CIDR',
      question: '¿Qué problema motivó abandonar el esquema histórico de Clases A, B y C ("problema de los tres osos") y adoptar CIDR y subnetting?',
      hint: 'Pensá en una empresa mediana de 400 hosts pidiendo direcciones antes de 1993.',
      keyPoints: [
        'La clase C (254 hosts) quedaba chica y la clase B (65.534 hosts) desperdiciaba casi todo el bloque; la clase A era enorme.',
        'CIDR eliminó las fronteras fijas permitiendo prefijos de longitud variable (/n) y agregación de rutas (supernetting).',
        'El subnetting permite además dividir una red en subredes más chicas (VLSM) para achicar los dominios de broadcast y organizar el enrutamiento.'
      ],
      relatedTerms: ['Clases A, B, C, D, E', 'CIDR', 'VLSM', 'Subred / subnetting']
    },
    {
      id: 'dq-u6-04',
      unit: 'u6',
      category: 'quepasaria',
      title: 'Qué pasa con DF = 1 frente a una MTU menor',
      question: 'Si un datagrama IPv4 de 1500 bytes viaja con la bandera DF = 1 hacia un enlace PPPoE con MTU 1492 bytes, ¿qué hace el router y para qué aprovecha esto el descubrimiento de Path MTU?',
      hint: 'Recordá qué protocolo de control notifica el descarte al origen.',
      keyPoints: [
        'Con DF = 1 (Don\'t Fragment) el router tiene prohibido fragmentar el datagrama.',
        'Descarta el paquete y envía al emisor un mensaje ICMP Destination Unreachable ("fragmentation needed").',
        'El host emisor reduce el tamaño de sus paquetes hasta que pasen sin descartes: así descubre la MTU de toda la ruta.'
      ],
      relatedTerms: ['Fragmentación (DF, MF, offset)', 'ICMP']
    },
    {
      id: 'dq-u6-05',
      unit: 'u6',
      category: 'porque',
      title: 'Cómo funciona traceroute usando TTL e ICMP',
      question: '¿De qué ingeniosa manera logra el comando traceroute descubrir cada router intermedio hasta un destino sin que exista un protocolo especial de "rastreo"?',
      hint: 'Combiná el campo TTL de IPv4 (o Hop Limit en IPv6) con ICMP Time Exceeded.',
      keyPoints: [
        'El origen envía paquetes hacia el destino empezando con TTL = 1.',
        'El primer router decrementa el TTL a 0, descarta el paquete y devuelve ICMP Time Exceeded revelando su propia IP.',
        'Luego el origen repite con TTL = 2, 3, 4... descubriendo salto a salto cada router hasta alcanzar el destino.'
      ],
      relatedTerms: ['TTL', 'ICMP']
    },
    {
      id: 'dq-u6-06',
      unit: 'u6',
      category: 'porque',
      title: 'Por qué NAT viola el modelo de capas',
      question: '¿Por qué se dice que NAT/PAT "viola el modelo de capas", vuelve con estado al router e impide conexiones entrantes por defecto?',
      hint: 'Fijate hasta qué capa debe leer y reescribir el router NAT para distinguir dos PCs de la misma casa.',
      keyPoints: [
        'Un router puro debería mirar solo capa 3 (IP); una caja NAT/PAT inspecciona y reescribe puertos TCP/UDP (capa 4), por lo que su código depende de protocolos de capa 4.',
        'Debe mantener una tabla en memoria asociando (IP privada, puerto interno) ↔ (IP pública, puerto externo), volviendo con estado al router.',
        'Si llega una conexión nueva desde afuera hacia la IP pública sin entrada previa en la tabla, el router no sabe a qué host interno entregarla (requiere port forwarding o uPnP).'
      ],
      relatedTerms: ['NAT / PAT', 'Port forwarding, uPnP']
    },
    {
      id: 'dq-u6-07',
      unit: 'u6',
      category: 'comparacion',
      title: 'Vector Distancia (RIP) vs Estado del Enlace (OSPF)',
      question: 'Compará el funcionamiento interno de Vector Distancia (Bellman-Ford / RIP) frente a Estado del Enlace (Dijkstra / OSPF): ¿qué sabe cada router de la red?',
      hint: 'Contrastá "creerle a tus vecinos" frente a "tener el mapa completo".',
      keyPoints: [
        'En Vector Distancia cada router solo habla con sus vecinos directos contándoles las distancias que conoce; no ve la topología completa y converge lento (problema de cuenta hasta infinito).',
        'En Estado del Enlace cada router mide sus propios enlaces vecinos e inunda anuncios a toda la red.',
        'Así cada router construye el mapa completo de la topología y ejecuta Dijkstra para calcular las rutas más cortas, convergiendo rápido a costa de más CPU y memoria.'
      ],
      relatedTerms: ['Vector distancia / estado del enlace', 'Lazo de enrutamiento']
    },
    {
      id: 'dq-u6-08',
      unit: 'u6',
      category: 'porque',
      title: 'Cambios de diseño en IPv6 frente a IPv4',
      question: '¿Por qué IPv6 eliminó el checksum de cabecera, prohibió la fragmentación en routers intermedios y suprimió el broadcast?',
      hint: 'Pensá en velocidad de procesamiento en routers de núcleo y en qué capas ya verifican errores.',
      keyPoints: [
        'Eliminar el checksum ahorra recalcularlo en cada router tras decrementar el Hop Limit; las capas de enlace (CRC) y transporte (TCP/UDP) ya verifican integridad.',
        'Prohibir la fragmentación en routers acelera el reenvío y deja la responsabilidad en el host origen (Path MTU, con mínimo garantizado de 1280 B).',
        'El broadcast se reemplaza por multicast dirigido (y ARP por NDP), evitando interrumpir a todos los hosts de la red.'
      ],
      relatedTerms: ['IPv6', 'Cabecera IPv6', 'NDP']
    },
    {
      id: 'dq-u6-09',
      unit: 'u6',
      category: 'escenario',
      title: 'Cálculo rápido de subredes y prefijo más largo',
      question: 'Si un router tiene en su tabla las rutas 10.20.0.0/16 (por interfaz A) y 10.20.4.0/24 (por interfaz B), ¿por qué interfaz sale un paquete hacia 10.20.4.55 y qué regla aplica?',
      hint: 'Ambas entradas coinciden haciendo AND con sus respectivas máscaras.',
      keyPoints: [
        '10.20.4.55 coincide tanto con 10.20.0.0/16 (16 bits) como con 10.20.4.0/24 (24 bits).',
        'Los routers aplican la regla de coincidencia del prefijo más largo (longest prefix match).',
        'Gana 10.20.4.0/24 (24 bits > 16 bits), por lo que el paquete sale por la interfaz B.'
      ],
      relatedTerms: ['Prefijo más largo', 'Tabla de rutas', 'CIDR']
    }
  ];
})();
