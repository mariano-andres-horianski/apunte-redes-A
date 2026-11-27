# **2. Subcapa MAC: acceso aleatorio al medio compartido** 

## **2.1 Dónde está la MAC y qué problema resuelve** 

La capa de enlace suele dividirse en **LLC** (Logical Link Control: interfaz uniforme hacia la capa de red) y **MAC** (Medium Access Control: direcciones MAC, acceso al medio, formato de trama y coordinación entre estaciones). La MAC es máxima en importancia cuando varias estaciones comparten físicamente el canal. Idea guía: la MAC decide **quién puede transmitir y cuándo** . 

Si varias estaciones comparten un medio único, no todas pueden transmitir con éxito a la vez. Hay dos estrategias: **asignación estática** (el canal se reparte por adelantado: FDM, TDM) y **asignación dinámica** (se decide en tiempo real). TDM/FDM desperdician canal cuando el tráfico es en ráfagas o impredecible; la MAC se ocupa de la asignación dinámica. Medios típicos: radio y satélite, Ethernet clásico con bus o hub, WLAN 802.11. 

Con asignación estática, si el tráfico es en ráfagas, la mayoría de los canales fijos están ociosos casi siempre y se desperdicia capacidad. Los supuestos del modelo dinámico son: **estaciones independientes** que generan tramas; **canal único** de difusión; **colisiones** (si dos tramas se superponen en el tiempo la señal resultante se distorsiona y ambas se pierden; todas las estaciones detectan la colisión); **tiempo continuo o ranurado** (el ranurado exige sincronizar con un reloj maestro y no siempre está disponible); y **detección de portadora o no** (las redes cableadas suelen tenerla; las inalámbricas no siempre, porque no todas las estaciones están dentro del alcance de las demás; «portadora» aquí significa simplemente una señal en el canal). Y una advertencia general: **ningún protocolo de multiacceso garantiza entrega confiable** ; incluso sin colisiones el receptor puede copiar mal parte de la trama, y la confiabilidad la dan otras partes de la capa de enlace o las capas superiores. 

## **2.2 Familias de protocolos MAC** 

|Familia|Idea central|Ejemplos|
|---|---|---|
|Canalización|Se reparte el canal de forma previa|FDM, TDM, CDM|
|Acceso aleatorio|Se transmite cuando hace falta y se resuelven|ALOHA,<br>CSMA,|
||las colisiones|CSMA/CD, CSMA/CA|
|Acceso controlado|Se otorga permiso explícito para transmitir|Polling, token passing|
|Contención limitada|Se mezclan etapas de contención y reserva|Variantes híbridas|



## **2.3 ALOHA puro** 

Desarrollado para redes de radio (Abramson, Universidad de Hawái, comienzos de los años 70). La estación **transmite inmediatamente** cuando tiene una trama. Si recibe ACK, la transmisión fue exitosa; si no lo recibe antes de un timeout, asume colisión o pérdida y **retransmite tras esperar un tiempo aleatorio** . Virtud: extrema simplicidad. Problema: demasiadas colisiones al crecer la carga. No hay sensado previo: las estaciones «prueban suerte» y la coordinación ocurre por realimentación posterior. 

**Período vulnerable = 2T.** Si una trama de duración T empieza en t ₀ , cualquier otra que comience entre t ₀ −T y t ₀ +T provoca colisión: una trama que empiece antes pisa su comienzo y una que empiece dentro del siguiente tiempo de trama pisa su final. 

**Rendimiento:** con G = carga ofrecida (intentos por tiempo de trama), **S = G·e^(−2G)** , máximo en **G = 0,5** con **S = 1/(2e) ≈ 0,184** : como mucho ~18,4 % del canal transporta tramas útiles. 

Deducción: las nuevas tramas siguen una distribución de Poisson con media N por tiempo de trama; sumando las retransmisiones, la media es G ≥ N (con carga baja G ≈ N; con carga alta G > N). El _throughput_ es S = G·P ₀ , donde P ₀ es la probabilidad de que una trama no colisione. Sin otra trama iniciada en un período vulnerable de dos tiempos de trama (media 2G), P ₀ = e^(−2G). Se usan tramas de igual longitud porque el rendimiento se maximiza con tamaño uniforme. La suma de verificación no distingue una pérdida total de un error leve: «lo malo es malo». El tiempo de espera debe ser aleatorio, o las mismas tramas chocarían una y otra vez. En el sistema original, la estación escuchaba la retransmisión del hub central para saber si su trama había llegado. **Ampliación (Stallings):** la estación escucha durante un tiempo igual al máximo retardo de ida y vuelta más un pequeño incremento, y se rinde tras varias retransmisiones sin ACK. 

## **2.4 ALOHA ranurado** 

El tiempo se divide en **slots de longitud T** (el tiempo de una trama) y las estaciones solo pueden comenzar a transmitir al **inicio de un slot** ; si dos o más eligen el mismo slot, hay colisión. Requiere **sincronización global** (por ejemplo una estación que emita un «bip» al inicio de cada intervalo). Mejora: al alinear los comienzos, las tramas que colisionan se superponen completamente y el **período vulnerable se reduce a T** . Costo: distribuir la referencia temporal y esperar al próximo slot aunque el canal esté libre. 

**S = G·e^(−G)** , máximo en **G = 1** con **S = 1/e ≈ 0,368** (el doble que el puro). A G = 1, lo mejor que se puede esperar es 37 % de slots vacíos, 37 % de éxitos y 26 % de colisiones; operar con G mayor reduce los slots vacíos pero aumenta exponencialmente las colisiones. La probabilidad de que una transmisión requiera exactamente k intentos es P ₖ = e^(−G)(1−e^(−G))^(k−1), y el número esperado de transmisiones por trama es E = e^G, por eso pequeños aumentos de carga degradan mucho el desempeño. Dato histórico del libro: el ALOHA ranurado casi se olvidó y luego se rescató para el **acceso a Internet por cable** . 

Tanto el puro como el ranurado siguen siendo «ciegos»: no sensan el canal antes de transmitir. 

## **2.5 CSMA: escuchar antes de transmitir** 

**Carrier Sense Multiple Access:** «escucho primero; si parece libre, transmito». Reduce las colisiones innecesarias, sobre todo cuando el canal suele estar ocupado. Pero todavía hay colisiones por el **retardo de propagación τ** : A puede empezar porque aún no «ve» la transmisión de B y viceversa; si ambos comienzan dentro de una ventana comparable con τ, la colisión es posible. Cuanto menor sea τ respecto del tiempo de trama, mejor se comporta CSMA. 

El efecto depende del **producto ancho de banda** ‑ **retardo** (cuántas tramas «caben» en el canal); en la mayoría de las LAN es pequeño, por lo que la chance de colisión es baja, pero cuanto mayor sea, peor el protocolo. Si el retardo de propagación fuera grande frente al tiempo de transmisión, las otras estaciones tardarían mucho en enterarse y varias podrían empezar una tras otra sin que ninguna trama sobreviva; con retardo chico, las estaciones se enteran casi de inmediato. 

**CSMA 1** ‑ **persistente:** (1) sensar; (2) si está libre, transmitir de inmediato; (3) si está ocupado, seguir escuchando hasta que se libere; (4) apenas se libera, transmitir con probabilidad 1. Simple y agresivo; buena utilización con baja carga; el problema es que, si varias estaciones esperan, **se lanzan juntas cuando el canal se libera** (efecto estampida, «impaciente»). 

**CSMA no persistente:** (1) sensar; (2) si está libre, transmitir; (3) si está ocupado, **esperar un tiempo aleatorio** y volver a sensar (no se «pega» al canal). Reduce la probabilidad de que muchas estaciones ataquen al liberarse el medio y es más estable bajo carga alta, a costa de más demora y de dejar instantes ociosos aunque el canal ya esté libre. 

**CSMA p** ‑ **persistente:** pensado para canales ranurados. Cuando el canal queda libre, la estación transmite con probabilidad p; con probabilidad (1−p) espera al siguiente slot y decide de nuevo (y si otra estación empieza, actúa como si hubiera colisionado). p grande → menor demora media pero más colisiones; p chico → menos colisiones pero más espera y tiempo ocioso. Es un compromiso controlable entre eficiencia y contención. (Tanenbaum menciona que 802.11 usa un refinamiento de este esquema.) 

## **2.6 CSMA/CD: detección de colisiones** 

Carrier Sense Multiple Access with Collision Detection. Además de sensar antes, la estación **monitorea el medio mientras transmite** ; si detecta una colisión, **aborta** y reintenta más tarde, por lo que no se desperdicia tiempo enviando una trama completa ya perdida. Fue la base del **Ethernet clásico** (bus coaxial y luego hubs). Supone que el emisor puede detectar anomalías eléctricas en el mismo medio por el que transmite. 

**Paso a paso:** (1) sensar; (2) si está libre, transmitir; (3) mientras transmite, escuchar el medio; (4) si detecta colisión, enviar señal de **jam** , abortar y contar el intento fallido; (5) **backoff** aleatorio antes de reintentar. El jam hace evidente la colisión a todas las involucradas. 

Detectar colisiones es un proceso **analógico** : el hardware escucha mientras transmite y, si la señal que lee es distinta de la que envía, hay colisión; esto implica que la señal recibida no sea muy pequeña frente a la transmitida (imposible en radio, donde puede ser un millón de veces más débil) y que la modulación permita detectar colisiones. El modelo conceptual alterna **períodos de contención, de transmisión y de inactividad** . El tiempo mínimo para saber que se ha «tomado» el canal es **2τ** : en el peor caso, una estación a punto de ser alcanzada por la señal del otro extremo empieza a transmitir, detecta la colisión casi al instante, pero la ráfaga de ruido vuelve al emisor original recién a los 2τ. Por eso la contención CSMA/CD se modela como un ALOHA ranurado con slots de ancho 2τ (en 1 km de coaxial, τ ≈ 5 µs). **Stallings:** la detección no lleva más de dos veces el retardo de propagación extremo a extremo, y si las tramas fueran más cortas que eso CSMA/CD rendiría igual que el CSMA menos eficiente. 

**Longitud mínima de trama y slot time.** Si una estación terminara de transmitir antes de que una colisión remota pudiera regresar, creería erróneamente que la trama salió bien; por eso la trama mínima debe durar **al menos 2τ** . En Ethernet clásico esto se tradujo en un **slot time de 512 bit** ‑ **times** , de donde deriva la **trama mínima de 64 bytes** . **Ampliación:** para 10 Mb/s con 2,5 km y cuatro repetidores el viaje de ida y vuelta en el peor caso es casi 50 µs; a 100 ns por bit, 500 bits es lo mínimo garantizado, y con margen se redondeó a 512 bits = 64 bytes. Además la longitud mínima ayuda a distinguir tramas válidas de los fragmentos de basura que dejan las colisiones. 

**Backoff exponencial binario.** Tras la colisión número i, la estación elige un número aleatorio entre 0 y 2 ⁱ −1 y espera esa cantidad de slots (después de 10 colisiones el tope queda en 1023; tras **16** colisiones la MAC se rinde y reporta error). Después de la 1.ª colisión: 0 o 1 slot; después de la 2.ª: 0–3; después de la 3.ª: 0–7, etc. **Ampliación:** el algoritmo se adapta dinámicamente al número de estaciones: si el intervalo fuera siempre 0–1, con 100 estaciones colisionarían una y otra vez; si fuera siempre 0–1023, la espera media sería de cientos de slots aun con pocas estaciones. **Stallings:** un efecto secundario es «último en llegar, primero en salir»: las estaciones con pocas colisiones tienen chance antes que las que llevan más tiempo esperando. Ni CSMA/CD ni Ethernet dan confirmaciones: si no hubo colisión, el emisor asume que probablemente llegó; el CRC detecta errores y las capas superiores recuperan. 

Con k estaciones siempre listas y probabilidad p de transmitir por slot, la probabilidad de que alguna adquiera el canal es A = k·p·(1−p)^(k−1), máxima con p = 1/k (tiende a 1/e). Un intervalo de contención dura en media 2τ/A, como mucho 2τe ≈ 5,4τ, y la eficiencia del canal es P/(P + 2τ/A), donde P es el tiempo de trama: mejora si las tramas son largas respecto de la propagación. 

**Dónde vivió CSMA/CD:** Ethernet original (coaxial compartido), Ethernet con hub (dominio de colisión compartido). En Ethernet moderno con switches full ‑ duplex **ya no hay colisiones** , por eso dejó de ser necesario. No confundir «Ethernet» con «Ethernet con colisiones»: el estándar evolucionó. 

## **2.7 Protocolos sin colisiones y de contención limitada** 

CSMA/CD no elimina las colisiones durante el período de contención, y esas colisiones hacen variable el tiempo de envío de una trama (malo para tráfico en tiempo real como VoIP). Los protocolos **sin colisiones** resuelven la contención antes de transmitir. El más simple es el **protocolo de mapa de bits** : cada período de contención tiene exactamente N ranuras (una por estación, con direcciones 0 a N−1); la estación j anuncia que tiene una trama poniendo un 1 en su ranura j, y cuando pasaron las N ranuras todas saben quiénes quieren transmitir y lo hacen en orden numérico. Como se difunde el deseo de transmitir antes de transmitir, se llama **protocolo de reservación** . Con carga baja una estación de numeración baja espera en promedio N/2 ranuras (para que termine el escaneo en curso) más otras N antes de poder transmitir. Otros representantes de la familia son el **paso de testigo** (un token circula en orden y solo quien lo tiene transmite, el «acceso controlado» de la tabla anterior), la **cuenta regresiva binaria** (las estaciones emiten su dirección bit a bit y gana la de mayor dirección) y los protocolos de **contención limitada** , que combinan contención con baja carga y reserva con alta carga. La mayoría no se usa hoy en grandes sistemas, pero conviene conocerlos. 

## **2.8 Por qué CSMA/CD no sirve bien en inalámbrico** 

- En radio es muy difícil transmitir y escuchar con suficiente sensibilidad **al mismo tiempo** : la señal propia del emisor tapa las ajenas. 

- La cobertura depende de distancia, obstáculos, reflexión y _fading_ . 

- Dos nodos pueden no oírse entre sí y, sin embargo, colisionar en el receptor. 

Conclusión: en WLAN se prefiere **evitar** colisiones en vez de detectarlas. La señal recibida puede ser un millón de veces más débil que la transmitida («una aguja en un pajar»), las radios son casi siempre _half_ ‑ _duplex_ , el rango dinámico de la señal es muy alto y la estación no distingue una señal entrante débil del ruido más su propia transmisión. Por eso las **confirmaciones (ACK)** se usan para descubrir colisiones y otros errores _a posteriori_ . 

## **2.9 Terminales ocultas y expuestas** 

**Terminal oculta:** dos estaciones que no se oyen entre sí transmiten a un mismo receptor y colisionan allí (A y C transmiten a B, con A fuera del alcance de C: C escucha el canal libre y transmite). 

**Terminal expuesta:** una estación se abstiene de transmitir porque oye a otra, aunque ambas transmisiones serían compatibles (B transmite a A y C quiere transmitir a D: C oye a B y se aplaza sin necesidad, ya que la transmisión solo perjudicaría la zona entre B y C, donde no hay receptores). La raíz del problema es que lo que importa para la recepción es la interferencia **en el receptor** , no en el emisor, y CSMA solo informa de la actividad cerca del transmisor. En cable todas las señales llegan a todas las estaciones, por eso esa distinción no existe. Una de las primeras soluciones fue **MACA** ( _Multiple Access with Collision Avoidance_ , Karn, 1990): el emisor estimula al receptor para que emita una trama corta que las estaciones vecinas puedan oír, antes de la trama de datos (idea que reaparece en RTS/CTS). Un AP, además, tiene a todas las estaciones de su celda en alcance. 

## **2.10 CSMA/CA: evitar colisiones** 

Carrier Sense Multiple Access with Collision Avoidance. La estación escucha el canal; si está libre no siempre transmite de inmediato: puede esperar un intervalo y ejecutar **backoff** . Tras una trama de datos se espera un **ACK** ; la ausencia de ACK sugiere colisión o pérdida. La lógica pasa de «detectar durante la transmisión» a «disminuir la probabilidad de choque antes de transmitir». 

**DCF (Distributed Coordination Function) de 802.11, esquema básico:** (1) esperar a que el canal esté libre durante un intervalo **DIFS** ( _Distributed Interframe Space_ ); (2) elegir un backoff aleatorio dentro de una ventana de contención; (3) el contador se decrementa solo mientras el canal sigue libre; (4) al llegar a cero, transmitir; (5) el receptor responde con ACK tras un intervalo corto **SIFS** ( _Short Interframe Space_ ). 

**RTS/CTS y portadora virtual:** RTS ( _Request To Send_ ) y CTS ( _Clear To Send_ ) son tramas cortas opcionales que «reservan» el canal y ayudan frente a terminales ocultas; las estaciones que oyen RTS o CTS actualizan un temporizador llamado **NAV** ( _Network Allocation Vector_ ), que indica durante cuánto tiempo conviene no transmitir. Intuición: es más barato chocar dos tramas cortas de control que dos tramas largas de datos; se reserva para casos con alto costo de colisión. **Secuencia típica:** sensado → DIFS + backoff → (opcional) RTS/CTS → DATA → ACK. 

**Ampliación (Tanenbaum 4.4.3).** Una estación con una trama empieza con un retroceso aleatorio (salvo que no haya usado el canal recientemente y esté inactivo): el número de ranuras se elige, por ejemplo, entre 0 y 15 en la PHY OFDM, espera DIFS, cuenta regresivamente las ranuras inactivas pausando cuando hay tráfico y envía al llegar a 0. La falta de ACK se interpreta como error: el emisor **duplica el período de retroceso** y reintenta hasta el máximo de retransmisiones. Dos diferencias con Ethernet: (1) iniciar los retrocesos por adelantado ayuda a evitar colisiones, lo que vale la pena porque en inalámbrico se transmite la trama completa aunque colisione; (2) los ACK sirven para inferir colisiones que no se pueden detectar. 

|Aspecto|CSMA/CD|CSMA/CA|
|---|---|---|
|Medio típico|Ethernet compartido clásico|WLAN 802.11|
|Filosofía|Detectar y abortar colisiones|Evitar colisiones antes de transmitir|
|Mientras transmite|Escucha el medio|No confía en detectar colisión durante TX|
|Confirmación|No depende de ACK por trama a<br>nivel MAC clásico|Usa<br>ACK<br>como<br>parte<br>natural<br>del<br>esquema|
|Problema central|Slot time y backoff|Terminales ocultas/expuestas, backoff,<br>RTS/CTS|



Idea de cierre del tema: ALOHA puro (sin sensado, vulnerable 2T) → ALOHA ranurado (sincroniza slots, mejora eficiencia) → CSMA (escucha, pero τ sigue importando) → CSMA/CD (Ethernet compartido, detecta) y CSMA/CA (WLAN, evita). La MAC siempre dialoga con la física del medio. 

# **3. Ethernet (IEEE 802.3)** 

## **3.1 Historia: de ALOHA a IEEE 802.3** 

Idea central de la unidad: **la MAC cambia poco; la PHY cambia muchísimo.** Ethernet conservó una trama reconocible mientras reemplazó casi todo lo de abajo (de 10 Mb/s sobre coaxial a 800 Gb/s con múltiples _lanes_ ). El problema original era compartir un solo medio de difusión sin controlador central: la colisión no es una falla excepcional sino una consecuencia posible del diseño. De ALOHAnet hereda el acceso distribuido, la detección indirecta del conflicto y la espera aleatoria; Ethernet **agrega carrier sense y detección de colisión** . 

- **1973:** memo de Metcalfe (22 de mayo, «Alto Aloha Network»): conectar estaciones Alto en Xerox PARC con un coaxial pasivo, compartido y de difusión; tasa experimental 2,94 Mb/s; el nombre toma la idea del «éter» como medio omnipresente; sin switch, la inteligencia estaba en los extremos. 

- **1976:** artículo de Metcalfe y Boggs (CACM): canal de difusión local, rápido, sin control central y capaz de recuperarse de colisiones; 3 Mb/s y objetivo de 100 estaciones. 

- **DIX** (Digital, Intel, Xerox): Ethernet Versión 1 (1980) y Versión 2 (1982); una especificación abierta que creó un mercado compatible antes de la norma IEEE. 

- **IEEE 802.3:** el proyecto 802 comienza en 1980 y la primera edición de 802.3 se publica en 1985 (según las diapositivas; Tanenbaum ubica la conversión del estándar DIX en 802.3 en 1983, por eso las fechas varían entre fuentes). La decisión arquitectónica: una MAC común y capas físicas intercambiables, extensiones mediante enmiendas compatibles. Resultado: una familia, no un único cable. 

Línea de tiempo de tasas: 10 Mb/s (10BASE ‑ T, 1990) → 100 Mb/s (1995) → 1 Gb/s (1998/99) → 10 Gb/s (2002) → 200/400 Gb/s (2017) → 800 Gb/s (2024): ×80.000 en tasa nominal con la trama básica reconocible. **Por qué ganó la LAN:** interoperabilidad con estándares abiertos, trama estable que protege al software, economías de escala, evolución de bus compartido a estrella conmutada y capacidad de incorporar cobre, fibra y nuevas codificaciones: compatibilidad + volumen + mejora continua. 

**H** ay dos tipos: **Ethernet clásica** (resuelve el multiacceso con las técnicas vistas; 3 a 10 Mbps) y **Ethernet conmutada** (switches; 100 Mbps y más). Ambas se llaman Ethernet pero son muy distintas; hoy solo se usa la conmutada. Ethernet e IEEE 802.3 son idénticos salvo una pequeña diferencia (el campo Tipo/Longitud), por lo que se usan indistintamente. 

## **3.2 Arquitectura y capas físicas** 

|Capa OSI|IEEE 802|Responsabilidad|
|---|---|---|
|2|LLC (802.2)|Interfaz común hacia protocolos de red|
|2|MAC (802.3)|Trama, direcciones, FCS y acceso al medio|
|1|PHY (802.3)|Codificación, señal, medio y conector|



Una interfaz Ethernet tiene cuatro piezas: **MAC** (construye y valida la trama), **RS/xMII** (adapta la MAC a la PHY), **PHY** (codifica bits y gobierna la señal) y **MDI + medio** (conector y canal físico). **Cómo leer un nombre:** en 1000BASE ‑ T, 1000 = Mb/s nominales, BASE = señalización _baseband_ , T = par trenzado; 10BASE5 = 10 Mb/s, baseband, coaxial con segmentos de 500 m; 100BASE ‑ TX = 100 Mb/s, par trenzado, variante TX; 10GBASE ‑ SR = 10 Gb/s, fibra de corto alcance. 

**Del bus a la estrella.** La primera estrella usaba hubs; la moderna usa switches. 

- **10BASE5 (Thick Ethernet):** 10 Mb/s, coaxial grueso de 50 Ω, segmentos hasta 500 m, transceptor externo con cable AUI, topología de bus con terminadores. Ventaja: distancia; costo: complejidad. **Ampliación:** marcas cada 2,5 m para conectar, hasta 100 máquinas por segmento. 

- **10BASE2:** coaxial fino RG ‑ 58, 185 m por segmento (redondeado a «2» en el nombre), conector BNC en T junto a la estación; un corte o un terminador incorrecto afecta a todo el bus; más barato pero con falla física compartida. **Ampliación:** hasta 30 máquinas por segmento. 

- **Repetidores (Tanenbaum):** dispositivos de capa física que regeneran la señal; en Ethernet clásica no podía haber dos transceptores a más de 2,5 km ni más de cuatro repetidores en una ruta, para que el protocolo MAC funcionara. 

- **10BASE** ‑ **T:** 10 Mb/s sobre dos pares trenzados, hasta 100 m por enlace en categoría 3 o superior, topología física en estrella y detección de enlace por puerto. Con hubs sigue habiendo un único dominio de colisión; con switches cada enlace es un dominio independiente. Aislar el cable por estación cambió la operación más que la trama. 

- **Manchester:** cada bit contiene una transición en el centro; el receptor recupera el sincronismo de la propia señal (autorreloj); 10 Mb/s requieren hasta 20 Mbaud: robustez temporal a cambio de eficiencia espectral. 

- **Fast Ethernet (802.3u, 1995):** conserva trama, direcciones y CSMA/CD, y agrega auto ‑ negociación para convivir con 10 Mb/s. **100BASE** ‑ **TX:** 2 pares Cat 5+, 100 m, codificación 4B/5B + NRZI + MLT ‑ 3 (4B/5B agrega transiciones suficientes; MLT ‑ 3 limita la frecuencia dominante con tres niveles), 125 MBd para llevar 100 Mb/s. **Ampliación (Tanenbaum):** la idea era mantener formatos, interfaces y reglas y reducir el tiempo de bit de 100 ns a 10 ns; se basó solo en par trenzado con hubs y switches (nada de cables multipunto con derivaciones vampiro o BNC). 

- **Gigabit Ethernet:** dos familias. **1000BASE** ‑ **X (802.3z, 1998):** fibra o cobre corto, codificación 8B/10B (1250 Mbaud), SX 850 nm multimodo (< 550 m), LX 1310 nm multimodo o monomodo (< 10 km), CX par trenzado blindado (< 25 m), óptica modular con SFP + LC. **1000BASE** ‑ **T (802.3ab, 1999):** Cat 5e, 4 pares, PAM ‑ 5 y DSP, 100 m; cada par transporta 250 Mb/s **en cada dirección a la vez** (cancelación de eco): 4 × 250 = 1 Gb/s. La opción half ‑ duplex existió en el estándar, pero en la práctica todo se volvió conmutado y full ‑ duplex. **Ampliación (Tanenbaum 4.3.6):** objetivos del comité: 10 veces el desempeño y compatibilidad total (servicio de datagramas sin confirmación en unicast y multicast, mismo direccionamiento de 48 bits, mismo formato y tamaños mínimo y máximo de trama); todas las configuraciones son punto a punto. En full ‑ duplex con switch no hay contención, no se usa CSMA/CD y la longitud máxima la fija la intensidad de la señal, no el tiempo de la ráfaga de ruido; en half ‑ duplex con hub (que no almacena tramas en buffer) sí se usa CSMA/CD. 

- **10 Gigabit (802.3ae, 2002):** full ‑ duplex desde el diseño, se elimina el half ‑ duplex y CSMA/CD deja de ser parte del enlace; trama conservada. Desde 10G, «colisión Ethernet» es un concepto histórico y de diagnóstico de equipos de legado. **10GBASE** ‑ **T:** 4 × 2,5 Gb/s (cada par, en ambos sentidos), 800 Mbaud por par, PAM ‑ 16 con 128 ‑ DSQ, corrección LDPC, cancelación de eco y diafonía, Cat 6A hasta 100 m («el conector parece familiar, la electrónica no»). **Fibra 10G:** SR 850 nm multimodo (≈ 300 m en OM3, 400 m en OM4), LR 1310 nm monomodo (10 km), ER 1550 nm monomodo (40 km); las letras describen un presupuesto óptico. 

- **40/100/400/800 Gb/s:** paralelismo en _lanes_ : 40G = 4 × 10; 100G = 4 × 25; 400G = 8 × 50 o 4 × 100; 800G = 8 × 100 o 4 × 200 (802.3df). La cifra del puerto es agregada. 

- **Auto** ‑ **negociación:** (1) anunciar velocidades, duplex y capacidades mediante pulsos de enlace; (2) resolver la capacidad común de mayor prioridad; (3) configurar (en 1000BASE ‑ T también el rol master/slave). Riesgo clásico: **duplex mismatch** . 

|PHY|Medio|Codificación|Alcance|Duplex típico|
|---|---|---|---|---|
|10BASE‑T|Cat 3+, 2 pares|Manchester|100 m|Half / Full|
|100BASE‑TX|Cat 5+, 2 pares|4B/5B + MLT‑3|100 m|Half / Full|
|1000BASE‑T|Cat 5e, 4 pares|PAM‑5 + DSP|100 m|Full|
|10GBASE‑T|Cat 6A, 4 pares|PAM‑16 + LDPC|100 m|Full|
|10GBASE‑SR|MMF|64B/66B|300–400 m|Full|
|10GBASE‑LR|SMF|64B/66B|10 km|Full|



La selección de PHY depende de medio, distancia, consumo, costo y densidad. 

## **3.3 La trama Ethernet** 

Orden en el cable: **Preámbulo (7 B) · SFD (1 B) · Destino (6 B) · Origen (6 B) · [802.1Q (0 o 4 B)] · Longitud/Tipo (2 B) · Datos + pad (46–1500 B) · FCS (4 B)** . 

- **Tamaño:** 64 a 1518 bytes la trama básica (sin contar preámbulo ni SFD); 1522 con una etiqueta 802.1Q. El **IFG** ( _interframe gap_ ) de 96 bit times separa transmisiones pero no forma parte de la trama. 

- **Preámbulo y SFD:** 7 bytes 55 hex (alternancia 101010…, permite recuperar reloj y sincronismo) y el _Start Frame Delimiter_ (D5, termina en 10101011) que marca el comienzo de la dirección destino. **Ampliación:** Tanenbaum cuenta 8 bytes de preámbulo cuyo último, con los dos últimos bits en 11, hace de delimitador; en Manchester a 10 Mb/s son 6,4 µs de onda cuadrada de 10 MHz para sincronizar el reloj. 

- **Direcciones MAC (48 bits):** 24 bits de **OUI** (asignado por el IEEE al fabricante) + 24 bits administrados por el fabricante; bit **I/G** (individual/grupo) y bit **U/L** (universal/local); se transmite primero el bit menos significativo de cada octeto. Son únicas globalmente: el fabricante programa la dirección en la NIC. **Unicast** (una interfaz concreta, p. ej. 00:1A:2B:3C:4D:5E), **multicast** (grupo de interfaces interesadas, p. ej. 01:00:5E:xx:xx:xx; el primer bit transmitido en 1) y **broadcast** (FF:FF:FF:FF:FF:FF, todas las interfaces del dominio de broadcast; no requiere gestión de grupos). 

- **Length/Type:** 0 a 1500 = longitud de la carga (802.3 + LLC); 1501–1535 zona no definida; 1536 (0x0600) a 65535 = **EtherType** (0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6). **Ampliación (Tanenbaum):** DIX usaba Tipo y 802.3 decidió poner Longitud (agregando un encabezado LLC de 8 bytes dentro de los datos para saber el protocolo superior); en 1997 el IEEE aceptó ambos y como todos los Tipo en uso eran mayores que 1500, el umbral 0x600 los distingue. 

- **Datos y padding:** carga mínima 46 B (sin 802.1Q) y máxima 1500 B (MTU Ethernet). Si es más corta, la MAC agrega **padding** ; con una etiqueta 802.1Q de 4 bytes la carga mínima baja a 42 B y la trama sigue midiendo 64. El protocolo superior necesita su propia longitud cuando el pad no es semántico. **Ampliación:** el límite de 1500 se eligió por el costo de la RAM del transceptor en 1978. 

- **FCS:** CRC ‑ 32 calculado desde la dirección destino hasta el último byte de datos o pad (no cubre preámbulo ni SFD). El receptor recalcula y descarta si no coincide: Ethernet **detecta, no corrige** ; la retransmisión queda a cargo de protocolos superiores. 

- **Por qué 64 bytes:** 14 B (direcciones + Len/Tipo) + 46 B (datos + pad) + 4 B (FCS) = 64 B × 8 = **512 bit times** , tiempo que permite que una estación que todavía transmite se entere de una colisión dentro del diámetro máximo de la red: está ligado a la propagación. 

- **Tamaño máximo:** clásica hasta 1518 B; con una etiqueta 802.1Q hasta 1522 B; envelope IEEE hasta 2000 B para extensiones; **jumbo frame** usualmente ≈ 9000 B (extensión de proveedor). «MTU 1500» describe la carga IP típica, no el tamaño completo sobre el cable. 

- **Ethernet II vs IEEE 802.3 + LLC/SNAP:** en Ethernet II el campo de 2 B es EtherType (identificación directa: 0x0800 IPv4, 0x0806 ARP; dominante en redes IP); en 802.3 + LLC/SNAP es Longitud y el protocolo se identifica con cabecera LLC (DSAP, SSAP, Control) y, si aplica, SNAP (OUI y PID); persiste en protocolos y entornos específicos. Ambas caben en el mismo formato físico. 

## **3.4 CSMA/CD en Ethernet** 

El acceso es **1** ‑ **persistente** : (1) escuchar; (2) si el medio está ocupado, seguir escuchando; (3) cuando queda libre, transmitir de inmediato; (4) monitorear comparando lo enviado con lo observado. «Escuchar antes» reduce colisiones pero no elimina las causadas por el retardo de propagación. **Una colisión paso a paso:** A escucha libre (la señal de B todavía no llegó) → B escucha libre → ambas transmiten y las señales se superponen → ambas detectan la colisión, interrumpen la trama y envían **jam** → cada una elige una espera aleatoria ( **backoff** ). Jam = 32 bits para asegurar que todas las estaciones reconozcan la colisión ( **ampliación:** Tanenbaum describe una ráfaga de ruido de 48 bits; el valor exacto depende de la edición de la norma). 

|Velocidad|Slot time<br>Duración|
|---|---|



|Velocidad|Slot time|Duración|
|---|---|---|
|10 Mb/s|512 bit times|51,2 µs|
|100 Mb/s|512 bit times|5,12 µs|
|1 Gb/s half‑duplex|4096 bit times|4,096 µs|



El slot time (512 bits = 64 bytes en 10/100 Mb/s) es la ventana para detectar una colisión normal. Una **colisión tardía** ocurre después del slot time e indica un problema de diseño, cableado o duplex. **Backoff exponencial binario:** espera = r × slot time, con r en 0–1 (1.ª colisión, 2 opciones), 0–3 (2.ª, 4 opciones), 0–7 (3.ª, 8 opciones)… 0–1023 (10 o más colisiones, 1024 opciones); **tras 16 colisiones la MAC aborta y reporta error** . La ventana crece para desincronizar contendientes sin reservar turnos fijos. 

**Qué queda de CSMA/CD hoy:** en **full** ‑ **duplex** hay dos canales lógicos sin colisiones, los switches aíslan cada enlace y eliminan el medio compartido, por lo que CSMA/CD queda deshabilitado; la historia sigue explicando los 64 bytes y parte del vocabulario operativo. 

# **4. Conmutación Ethernet: switches, tablas MAC, STP y PoE** 

## **4.1 Qué hace un switch** 

En Ethernet conmutada **cada enlace es un dominio de colisión** : el switch aísla el tráfico de cada puerto y reenvía la trama solo donde corresponde, tomando la decisión con la **dirección MAC de destino** . En enlaces **full** ‑ **duplex** punto a punto cada enlace usa canales independientes para transmitir y recibir (TX + RX simultáneos): **sin colisiones** . Un switch de capa 2 hace tres cosas: **analizar** (lee las MAC de las tramas que llegan), **filtrar** (decide si reenviar, descartar o inundar) y **separar** (cada puerto crea un dominio de colisión independiente). Opera en la capa de enlace y transporta protocolos de capas superiores sin interpretarlos. Un **hub** repite la señal en todos los puertos (un solo dominio de colisión); un **switch** reenvía hacia el puerto de destino. 

**Ventajas:** _compatibilidad_ (los equipos conservan la misma interfaz Ethernet MAC al migrar desde un hub), _capacidad dedicada_ (cada puerto tiene su enlace, si el backplane acompaña la carga) y _escalabilidad_ (agregar puertos o switches amplía la red sin volver al medio compartido). La mejora depende de que el switch tenga capacidad suficiente para atender todos los enlaces. 

**Ampliación (Tanenbaum 4.3.4 y 4.7.4).** El hub conecta eléctricamente todos los cables (lógicamente equivale al cable largo de la Ethernet clásica): no aumenta la capacidad y cada estación obtiene una parte menor de la capacidad fija. El switch tiene un **backplane** de alta velocidad (propietario, oculto dentro de la caja) que conecta todos los puertos; mejora el desempeño porque no hay colisiones y porque permite **múltiples tramas simultáneas** entre pares distintos de estaciones (el rendimiento total puede subir un orden de magnitud). Como dos tramas pueden dirigirse al mismo puerto de salida, necesita **buffers** para encolar. Si el cable es half ‑ duplex, estación y puerto compiten con CSMA/CD como siempre. Seguridad: la mayoría de las NIC tienen **modo promiscuo** (reciben todas las tramas); con hub cualquiera puede espiar el tráfico, con switch el tráfico solo va a los puertos de destino (aunque cifrar sigue siendo mejor). Los switches también pueden mezclar velocidades por puerto (10/100/1000 Mbps). 

**Dispositivos según la capa (Tanenbaum 4.7.4):** _repetidores_ (capa física, analógicos, regeneran señal, no entienden tramas), _hubs_ (capa física, varias líneas conectadas eléctricamente, no examinan direcciones), _puentes y switches_ (capa de enlace, examinan la dirección MAC; cada puerto es su propio dominio de colisión; «switch» es el nombre moderno de «puente») y _routers_ (capa de red, deciden por dirección de red y solo funcionan con los protocolos para los que fueron diseñados). 

## **4.2 Tabla MAC y aprendizaje** 

La **tabla MAC** asocia puerto y estación: el switch aprende qué estación aparece detrás de cada puerto (en el ejemplo de la cátedra: puerto 1 ↔ estación 10, 2 ↔ 20, 3 ↔ 30, 6 ↔ 15, 7 ↔ 25, 8 ↔ 35, y puertos 4 y 5 sin estación). **L** os puentes trabajan en modo promiscuo y miran la **dirección de origen** de cada trama que reciben para saber qué máquinas están en qué puerto; cada entrada lleva la hora de la última trama vista y un proceso periódico **purga** las entradas de más de unos minutos (así una máquina que se muda vuelve a funcionar sola). Regla de reenvío al llegar una trama: (1) si el puerto de destino es el mismo que el de origen, se **descarta** (ocurre con hubs conectados al puente); (2) si son distintos, se **reenvía** al puerto de destino; (3) si el destino es desconocido, se **inunda** por todos los puertos excepto el de origen. Los puentes son _transparentes_ : se conectan y funcionan, sin configurar nada. **Stallings:** el algoritmo combina retransmisión de tramas, aprendizaje de direcciones y mecanismo para evitar bucles; el puerto puede estar en estado de bloqueo o de envío. 

**Ampliación (Tanenbaum 4.7.1): por qué unir LANs con puentes:** autonomía de los departamentos, distancias entre edificios (los cables tienen longitud máxima por atenuación y retardo), y carga (dos LAN separadas tienen el doble de capacidad que una; el puente no envía tráfico donde no hace falta). También aumenta la confiabilidad: actúa como cortafuegos y evita que un nodo defectuoso que emite basura obstruya toda la LAN. 

## **4.3 Store** ‑ **and** ‑ **forward y cut** ‑ **through** 

|Criterio|Store‑and‑forward|Cut‑through|
|---|---|---|
|Cuándo reenvía|Después de recibir la trama completa|Al reconocer la dirección destino|
|Verificación|Comprueba el FCS|No espera el FCS|
|Latencia|Mayor|Menor|
|Riesgo|Descarta tramas con error|Puede propagar tramas dañadas|



El compromiso central es **latencia frente a validación completa** . En store ‑ and ‑ forward el switch usa un buffer y calcula el FCS antes del reenvío. 

## **4.4 Spanning Tree Protocol (802.1D)** 

**Por qué hace falta:** con enlaces redundantes se forman **lazos de capa 2** ; los broadcasts y las tramas de destino desconocido (que se inundan) pueden circular repetidamente. **Ampliación (Tanenbaum 4.7.3):** con dos enlaces en paralelo entre B1 y B2, una trama inundada llega duplicada a B2, que no puede saber que son copias de la misma y las inunda otra vez por los dos enlaces de vuelta: el ciclo es eterno. La solución es que los puentes se comuniquen y superpongan al grafo real un **árbol de expansión** que llegue a todos los puentes: algunos enlaces se ignoran para construir una topología ficticia **sin ciclos** , con exactamente una ruta entre cada par de estaciones. STP conserva la redundancia física y deja una topología activa sin ciclos (un puerto bloqueado «B» y un _root port_ «RP» en los diagramas). Cada puente emite periódicamente mensajes de configuración (BPDU) por todos sus puertos; primero se **elige la raíz** (el puente con el identificador más bajo, basado en su dirección MAC), luego se construye el árbol de rutas más cortas desde la raíz hasta cada puente. Si un enlace o puente cae, el algoritmo recalcula automáticamente un nuevo árbol. 

**Estados de puerto en STP clásico:** 1) Disabled (fuera de servicio); 2) Blocking (no reenvía tramas); 3) Listening (procesa BPDUs); 4) Learning (aprende direcciones MAC); 5) Forwarding (aprende y reenvía). 

## **4.5 Power over Ethernet (PoE)** 

Usa el mismo cable Ethernet para transportar **datos y alimentación** al dispositivo (corriente continua sobre los pares trenzados). **PSE** ( _Power Sourcing Equipment_ ): entrega la energía, un switch PoE o un inyector. **PD** ( _Powered Device_ ): la recibe: teléfono VoIP, punto de acceso, cámara o lector. Un solo tendido simplifica la instalación y permite centralizar el respaldo eléctrico. 

|Parámetro|PoE 802.3af (Tipo 1)|PoE+ 802.3at (Tipo 2)|
|---|---|---|
|Potencia máxima del PSE|15,4 W|30 W|
|Potencia mínima en el PD|12,95 W|25,5 W|
|Diferencia|Pérdida en el cable|Pérdida en el cable|



**Presupuesto total:** un switch puede no entregar la potencia máxima en todos los puertos al mismo tiempo; antes de elegir el PSE hay que sumar el consumo requerido por todos los PD. La asignación depende del modo y de la velocidad del enlace. 

# **5. Redes inalámbricas IEEE 802.11 (Wi** ‑ **Fi)** 

## **5.1 Arquitectura y evolución** 

- **Modo infraestructura:** las estaciones (STA) se **asocian a un AP** ( _Access Point_ ) y forman un BSS; el AP se conecta a la red cableada o sistema de distribución (DS). **Modo ad hoc:** las STA forman un **IBSS** sin AP. DCF también se usa en infraestructura; PCF no define el modo ad hoc. 

- **Una MAC, distintas capas físicas:** la MAC ofrece servicios de enlace sobre diferentes PHY; la evolución de la radio no elimina las funciones de acceso al medio. Una enmienda puede cambiar la PHY, la MAC o ambas. Las tasas de las tablas históricas son **máximos PHY** : la tasa útil depende de configuración, sobrecarga y contienda ( _goodput_ ≠ tasa PHY). 

- **Ampliación (Tanenbaum 4.4):** una red 802.11 típica es una celda con AP cableados al sistema de distribución; el **SSID** ( _Service Set IDentifier_ ) es lo que la gente conoce como nombre de la red; 802.11 es, como Ethernet, un servicio de **mejor esfuerzo** (sin garantía de entrega). Tanenbaum compara 802.11ac, que teóricamente llega a 7 Gbps, con la práctica, mucho más lenta. 

## **5.2 Capa física** 

**Bandas y canales.** En 2,4 GHz los centros separados 5 MHz **no son canales independientes** ; **1, 6 y 11** forman el plan habitual de tres canales sin solapamiento. En 5 GHz los canales permitidos y los requisitos **DFS** dependen del dominio regulatorio (el esquema de la cátedra es el de la FCC). **ISM** ( _Industrial, Scientific, Medical_ , designación del Reglamento de Radiocomunicaciones; aplicaciones que emplean energía RF, p. ej. 2,4 GHz) y **U** ‑ **NII** ( _Unlicensed National Information Infrastructure_ , denominación regulatoria de EE. UU. por la FCC; subbandas de 5 y 6 GHz) son conceptos distintos; en ambos «sin licencia individual» no significa «sin regulación» (potencia, uso y coexistencia según subbanda). **DFS** ( _Dynamic Frequency Selection_ ): en ciertas subbandas de 5 GHz detecta radares y evita que la WLAN siga usando un canal ocupado por ellos; al elegir un canal DFS el equipo debe comprobar la ausencia de radares antes de transmitir y, si detecta uno, debe abandonar el canal (puede haber interrupción y cambio de canal). Existe también en equipos domésticos compatibles; 6 GHz tiene otro régimen de coexistencia. **Ampliación (Tanenbaum):** las bandas ISM sin licencia las comparten otros dispositivos como los hornos de microondas, fuente de interferencia. 

**Antenas y potencia. dB** expresa una relación de potencias: 10·log ₁₀ (P ₂ /P ₁ ). **dBi** compara la ganancia de una antena con una antena isotrópica ideal (irradia por igual en todas direcciones): 5 dBi ≈ 3,16 veces la densidad de potencia en la dirección de máxima radiación; la antena concentra la energía, no crea 

potencia. **dBm** es potencia respecto de 1 mW: P(dBm) = 10·log ₁₀ [P(mW)]; 0 dBm = 1 mW, 10 dBm = 10 mW, 20 dBm = 100 mW. **Presupuesto de enlace:** Pᵣ = P ₜ + G ₜ + Gᵣ − L_prop − L_otras (potencias en dBm, ganancias en dBi, pérdidas en dB). Ejemplo: 20 + 3 + 2 − 85 − 2 = **−62 dBm** . La sensibilidad del receptor depende de la tasa, el ancho de canal y el receptor. 

**OFDM.** Divide la transmisión en **subportadoras ortogonales** ; cada una lleva símbolos PSK o QAM a menor tasa. En 802.11a, una FFT de 64 puntos usa **52 subportadoras activas: 48 de datos y 4 pilotos** . La ortogonalidad permite superponer los espectros (al demodular una subportadora las demás aportan cero, idealmente) y depende del espaciamiento y la sincronización. Un símbolo más largo y su **prefijo cíclico** ayudan a tolerar la dispersión temporal por multitrayectoria. Gráficamente: subportadoras superpuestas en frecuencia, símbolos sucesivos en el tiempo. 

**802.11b:** hasta 11 Mb/s. **802.11g:** OFDM, hasta 54 Mb/s. **802.11n:** canales de 20 o 40 MHz; con un flujo espacial (1×1), MCS 0–7 y 40 MHz con intervalo de guarda corto llega a 150 Mb/s PHY. 

**MIMO.** Usa varias cadenas de radio y antenas en ambos extremos. La **multiplexación espacial** envía flujos distintos al mismo tiempo y en el mismo canal; cada antena receptora recibe una mezcla y el receptor estima el canal y separa los flujos por procesamiento de señales (la multitrayectoria puede ayudar si aporta caminos independientes). Dos usos: **diversidad espacial** (combinar observaciones o transmitir versiones codificadas de la misma información: más robustez, menos desvanecimientos) y **multiplexación espacial** (información diferente en cada flujo: más bits por segundo). Un enlace 2×2 puede transportar hasta 2 flujos si el canal permite separarlos; a igual ancho, modulación y codificación, 2 flujos duplican la tasa PHY de 1. **SU** ‑ **MIMO** concentra flujos en un usuario; **MU** ‑ **MIMO** atiende varios usuarios a la vez por separación espacial (802.11ac: MU ‑ MIMO downlink; 802.11ax añade uplink y admite hasta 8 flujos espaciales; el máximo de flujos no equivale al número de usuarios de cualquier equipo). 

**Beamforming.** El transmisor pondera fase y amplitud de cada antena para combinar las señales favorablemente en el receptor (con cuatro antenas, las contribuciones se suman en la dirección buscada y en otras pueden cancelarse parcialmente). El beamforming explícito usa mediciones del canal y realimentación del cliente. Mejora posible: mayor SNR, mayor tasa o alcance (permite una modulación más exigente), menor interferencia, separación de usuarios en MU ‑ MIMO. Requiere soporte de los equipos, estimación de canal y sincronización; el movimiento y la información desactualizada reducen la eficacia; **no crea potencia adicional** , modifica cómo se combina la energía. 

**802.11ax (Wi** ‑ **Fi 6). OFDMA:** asigna grupos de subportadoras ( **RU** , _Resource Unit_ ) a distintos usuarios dentro de una misma transmisión (en 20 MHz, por ejemplo, nueve RU de 26 tonos; hay tonos de datos y pilotos); el AP planifica y en uplink coordina con una _trigger frame_ . Es útil para muchos paquetes pequeños. OFDMA separa usuarios en frecuencia, MU ‑ MIMO en el espacio, y ax puede combinarlos. **1024** ‑ **QAM** transporta 10 bits por símbolo contra 8 de 256 ‑ QAM (+25 % bruto) y exige buena SNR. **Subportadoras más próximas:** Δf pasa de 312,5 kHz a **78,125 kHz** (un cuarto) y el símbolo útil de 3,2 µs a **12,8 µs** ; FFT de 256/512/1024/2048 puntos para 20/40/80/160 MHz (el intervalo de guarda se suma al símbolo útil). **BSS Coloring:** el color (valores 1–63; 0 = desactivado) identifica un BSS en la señalización PHY y permite distinguir tráfico propio del de un BSS superpuesto (OBSS); con las reglas de reutilización espacial, una señal OBSS suficientemente débil puede permitir acceso simultáneo (no se ignora cualquier trama de otro color: intervienen umbrales y potencia). No debe confundirse con los colores de OFDMA. 

|IEEE|Nombre|Bandas|Hito|Aporte|
|---|---|---|---|---|
|802.11n|Wi‑Fi 4|2,4 / 5 GHz|2009|MIMO; 40 MHz|
|802.11ac|Wi‑Fi 5|5 GHz|2013|256‑QAM; DL MU‑MIMO|



|IEEE|Nombre|Bandas|Hito|Aporte|
|---|---|---|---|---|
|802.11ax|Wi‑Fi 6|2,4 / 5 GHz|2019|OFDMA; eficiencia|
|802.11ax|Wi‑Fi 6E|6 GHz|2020|Extensión a otra banda|



(Hitos comerciales/de certificación aproximados.) **Wi** ‑ **Fi 6E** designa equipos 802.11ax capaces de operar también en 6 GHz; no es una enmienda «802.11ax ‑ 6E». Donde se habilitan los 5925–7125 MHz completos caben hasta 14 canales de 80 MHz o 7 de 160 MHz; disponibilidad, potencia y uso interior/exterior dependen del dominio regulatorio y más espectro no garantiza ausencia de interferencia. 

**Caso ESP32.** El ESP32 clásico es **Wi** ‑ **Fi 4 en 2,4 GHz** (802.11b/g/n, un único flujo espacial, no admite 5 GHz, 802.11ac ni ax, ni MIMO de varios flujos). Roles: **STA** (cliente del AP, p. ej. sensor que publica por MQTT), **SoftAP** (crea una red para otros dispositivos), **STA + SoftAP** (comparten radio y canal; no configura por sí solo un router o repetidor) y **promiscuo** (captura tramas para análisis). La capacidad depende del chip: ESP32 ‑ C6 = 802.11b/g/n/ax en 2,4 GHz; ESP32 ‑ C5 = 802.11a/b/g/n/ac/ax en 2,4 y 5 GHz. 

## **5.3 Subcapa MAC: DCF, backoff y EDCA** 

**DCF** distribuye la contienda entre estaciones y AP con detección física del canal y reserva virtual mediante NAV. La radio no detecta colisiones mientras transmite: el éxito se infiere de la respuesta. Pasos: (1) esperar canal libre durante DIFS cuando corresponde; (2) descontar el backoff en ranuras libres, **congelándolo** si el canal se ocupa; (3) transmitir cuando el contador llega a cero; (4) en unicast ordinario, esperar ACK tras SIFS. Sin ACK puede haber colisión, ruido o pérdida de la respuesta. **Backoff:** se elige un entero uniforme en [0, CW]; el tiempo de espera es ese número por la duración de la ranura. Ejemplo: quedan 5 ranuras y el medio se ocupa después de 2: se conservan las 3 restantes y se continúa tras el nuevo período libre ( **no se sortea siempre un backoff nuevo** ). Ante un fallo: **CW ← min[2(CW + 1) − 1, CWmax]** ; tras un éxito se vuelve a CWmin. La aleatoriedad reduce colisiones pero no las elimina. 

**Ampliación (Stallings 17):** el algoritmo MAC de 802.11 es **DFWMAC** ( _Distributed Foundation Wireless MAC_ ): un control de acceso distribuido (DCF) con un control centralizado opcional ( **PCF** , _Point Coordination Function_ , libre de contención, apoyado sobre DCF). DCF no incluye detección de colisiones porque no es práctica en inalámbrico. Los tres espaciados: **SIFS** (el más corto: respuestas inmediatas como ACK, CTS o fragmentos siguientes), **PIFS** (intermedio, usado por el controlador central en PCF) y **DIFS** (el mayor; mínimo para tramas asíncronas que compiten). Tanenbaum agrega **AIFS** (arbitration IFS: intervalos de distinta duración para prioridades: más corto = más prioridad) y **EIFS** (extendido: solo tras recibir una trama defectuosa o desconocida) y confirma que **PCF no se usa en la práctica** porque no hay forma de impedir que redes vecinas transmitan en competencia. SIFS permite que nadie «salte» en medio de un intercambio (ACK, RTS/CTS, ráfagas de fragmentos). 

**EDCA** (extensión de 802.11e) pone prioridades sobre la contienda: ofrece **QoS estadística, sin garantía absoluta** . 

|Aspecto|DCF|EDCA|
|---|---|---|
|Contienda|Una función de acceso|Cuatro categorías (AC)|
|Prioridad|Sin clases de tráfico|Diferenciada por categoría|
|Parámetros|DIFS; CWmin / CWmax|AIFS; CWmin / CWmax; TXOP|
|Relación|Mecanismo de base|Extensión de 802.11e|



|Categoría|Tráfico típico|CWmin|AIFSN|
|---|---|---|---|
|AC_VO|Voz|3|2|
|AC_VI|Video|7|2|
|AC_BE|Best effort|15|3|
|AC_BK|Segundo plano|15|7|



(Valores habituales para PHY OFDM; configurables.) **AIFS = SIFS + AIFSN × SlotTime** ; CWmax y **TXOP** (oportunidad de transmisión) también influyen. **Ampliación (Tanenbaum):** TXOP evita la «anomalía de la tasa»: si una estación envía a 6 Mbps y otra a 54 Mbps, cada una manda una trama por turno y la lenta tarda nueve veces más, arrastrando al emisor rápido. 

**Ocultas, expuestas y NAV.** _Oculta:_ no oye al otro emisor, aunque ambos interfieren en el receptor. _Expuesta:_ posterga una transmisión que podría ser compatible. El campo **Duration** anuncia el tiempo reservado y quien lo interpreta actualiza su **NAV** ; RTS/CTS ayuda frente a nodos ocultos pero agrega sobrecarga. **Ampliación (Tanenbaum):** el NAV son recordatorios internos (no se transmite) medidos en microsegundos y reservan incluso el tiempo del ACK; el RTS/CTS de 802.11 **solo ayuda con terminales ocultas, no con expuestas** (a diferencia de MACA), y rara vez se usa en la práctica: no sirve para tramas cortas ni para el AP y casi siempre solo ralentiza. En redes densas el NAV puede reiniciarse por emisores vecinos; **802.11ax introduce dos NAV** (uno para el propio BSS y otro para redes superpuestas). **Fiabilidad:** la estrategia principal es **bajar la tasa** (modulaciones más robustas) y usar **tramas más cortas** o **fragmentación** (cada fragmento con su propio checksum, confirmado con stop ‑ and ‑ wait y enviado en ráfaga); con probabilidad de error de bit p = 10 ⁻ ⁴ una trama Ethernet completa (12 144 bits) llega bien menos del 30 % de las veces, y una de 4048 bits unas dos terceras partes. **Ahorro de energía:** los clientes pueden dormirse y el AP almacena su tráfico (TIM/DTIM). 

## **5.4 El AP y los servicios de la WLAN** 

En infraestructura convencional el AP reenvía el tráfico entre las estaciones y el sistema de distribución: **dos clientes del mismo BSS normalmente intercambian datos a través del AP (dos transmisiones de radio)** ; puede actuar como **puente 802.11–Ethernet** (la función de router/IP es distinta) y existen extensiones para enlaces directos como TDLS. 

|Servicio|Función del AP|
|---|---|
|Anuncio del BSS|Emite beacons con identidad y capacidades|
|Asociación|Acepta estaciones y mantiene su estado|
|Seguridad|Participa en autenticación y establecimiento de claves|
|Sincronización|Proporciona la referencia TSF del BSS|
|QoS|Anuncia parámetros EDCA y TXOP|
|Ahorro de energía|Almacena tráfico y lo anuncia mediante TIM / DTIM|
|Distribución|Puentea tramas hacia la LAN o el sistema de distribución|
|Radio|Configura canal, potencia y parámetros del BSS|



El AP **también compite** por el canal con DCF/EDCA; publica parámetros con beacons; autentica (SAE, EAP, claves); reenvía como puente de capa 2; configura prioridades con EDCA/TXOP; en ax planifica recursos (OFDMA, triggers); y en el PCF histórico podía sondear (polling). 

**Servicios de la WLAN:** _asociación_ (registrar la estación en un AP y negociar capacidades), _reasociación y desasociación_ (cambiar o terminar la relación; la reasociación equivale a un handover), _distribución y entrega_ (transportar las tramas a su destino; el _servicio de integración_ traduce tramas hacia/desde redes no 802.11), _autenticación y cifrado_ , y _QoS y energía_ . **Descubrimiento:** la STA escucha pasivamente beacons o envía **Probe Requests** . 

**Beacon:** trama de gestión, **subtipo 8** (1000 en binario), destino habitual broadcast FF:FF:FF:FF:FF:FF, intervalo típico **100 TU** (1 TU = 1024 µs, por lo que 100 TU = **102,4 ms** ; el instante real puede demorarse por la ocupación del medio). Anuncia: SSID y BSSID, capacidades (tasas, PHY, QoS), timestamp (TSF, para sincronizar temporizadores), intervalo, canal, RSN (suites de cifrado y autenticación) y TIM/DTIM. **Ampliación (Tanenbaum):** las balizas siempre se emiten pero el SSID puede o no difundirse (si no se difunde la estación debe conocer el nombre). 

## **5.5 La trama MAC de 802.11** 

**Frame Control** (2 bytes, posición fija) dice cómo leer la trama: Versión (2 bits), **Type** (2 bits), **Subtype** (4 bits) e indicadores (8 bits). Tipos: **Gestión (00)** (Beacon, autenticación, asociación), **Control (01)** (RTS, CTS, ACK; un ACK solo lleva RA) y **Datos (10)** (Data, QoS Data; To DS / From DS definen las direcciones). **Ampliación (Tanenbaum 4.4.4):** los indicadores son Para DS, De DS, Más fragmentos, Reintentar, Administración de energía, Más datos, Trama protegida (cuerpo cifrado) y Orden; el campo **Duration** está presente en todos los tipos y se usa para el NAV; **Sequence** (16 bits: 4 de fragmento + 12 de número) detecta duplicados; el cuerpo admite hasta 2312 bytes y comienza con un encabezado **LLC** que identifica el protocolo superior; las tramas de control son cortas (una sola dirección, sin datos). 

**Encabezados de datos:** los primeros 24 bytes tienen posiciones fijas (FC · Duration · A1 · A2 · A3 · Sequence); si To DS = From DS = 1, **Address 4** agrega 6 bytes tras Sequence Control (30 bytes); **QoS Data** agrega QoS Control (2 bytes): 26 o 32 bytes. Con tres direcciones el cuerpo comienza en el byte 24 y con cuatro en el 30 (sin contar otras extensiones, cuerpo ni FCS). La longitud del encabezado se deduce del formato y los indicadores; los campos opcionales ausentes no dejan espacio vacío. 

**Direcciones: RA** y **TA** identifican receptor y transmisor del salto por radio; **DA** y **SA** identifican destino y origen de la trama transportada. Hay cuatro roles pero bastan tres direcciones porque dos coinciden: Notebook → AP: TA = SA; AP → notebook: RA = DA. 

|Campo|Notebook → AP → servidor|Servidor → AP → notebook|
|---|---|---|
|Address 1|AP: RA (BSSID)|Notebook: RA = DA|
|Address 2|Notebook: TA = SA|AP: TA (BSSID)|
|Address 3|Servidor: DA|Servidor: SA|



En un enlace entre puentes ( **WDS** ) transmisor y receptor por radio pueden diferir del origen y destino: hacen falta RA, TA, DA y SA (cuatro direcciones). 

|To DS|From DS|Address 1|Address 2|Address 3|Address 4|
|---|---|---|---|---|---|
|0|0|RA = DA|TA = SA|BSSID|—|
|1|0|RA = BSSID|TA = SA|DA|—|
|0|1|RA = DA|TA = BSSID|SA|—|
|1|1|RA|TA|DA|SA|



## **5.6 Seguridad: de la búsqueda de red al tráfico protegido** 

**Conectarse no es lo mismo que autenticarse.** La «autenticación 802.11» y la verificación de credenciales de seguridad son conceptos diferentes. **Open System** intercambia tramas de autenticación sin probar una contraseña (precede a WPA2 y a Enterprise). La **asociación** negocia la participación de la STA en el BSS, no implica acceso a datos protegidos. Luego el **4** ‑ **Way Handshake** establece las claves para proteger el tráfico. 

|Mecanismo|Qué comprueba|Uso|
|---|---|---|
|Open System|No prueba posesión de contraseña|Precede<br>a<br>WPA2<br>y<br>a<br>Enterprise|
|Shared Key (WEP)|Respuesta a un desafío cifrado|Histórico; inseguro|
|802.1X / EAP|Identidad según el método EAP|WPA2/WPA3‑Enterprise|
|SAE|Acuerdo de claves basado en contraseña|WPA3‑Personal|



**WEP / Shared Key:** (1) la STA solicita autenticación (algoritmo 1); (2) el AP envía un desafío en claro; (3) la STA lo cifra con WEP y lo devuelve; (4) el AP descifra y compara. El desafío conocido y su versión cifrada revelan el flujo de clave usado para ese IV, lo que permite falsificar respuestas; además hay ataques de recuperación de clave (RC4 con IV de 24 bits). **Está obsoleto y no debe usarse.** 

**WPA2** ‑ **Personal:** con una passphrase, AP y STA derivan la **PMK** a partir de esa frase y el SSID (o se configura una PSK de 256 bits). El **4** ‑ **Way Handshake** prueba la posesión de la PMK y deriva la **PTK** usando nonces y direcciones MAC (la contraseña no se transmite): 1) AP → STA: ANonce; 2) STA → AP: SNonce + MIC; 3) AP → STA: confirmación + GTK cifrada + MIC; 4) STA → AP: confirmación protegida con MIC. La **PTK** protege el unicast; la **GTK** , el tráfico de grupo. 

**Enterprise:** tres roles: STA **suplicante** , AP **autenticador** y **servidor de autenticación** (habitualmente RADIUS). **802.1X** controla el acceso al puerto; **EAP** transporta el método elegido (p. ej. EAP ‑ TLS con certificados). Tras autenticar se obtiene material de clave del que se establece la PMK y luego se ejecuta el 4 ‑ Way Handshake. La seguridad depende del método EAP y de validar bien la identidad del servidor; no requiere una contraseña compartida por todos. 

**WPA3** ‑ **Personal / SAE** ( _Simultaneous Authentication of Equals_ ): acuerdo autenticado de claves basado en contraseña; reemplaza el PSK de WPA2 ‑ Personal (ambos extremos obtienen una PMK sin enviar la contraseña) y evita probar listas de contraseñas _offline_ a partir de una captura pasiva, bajo sus supuestos. Después de SAE y la asociación se realiza el 4 ‑ Way Handshake. 

|Etapa|Función|Tramas / protocolo|
|---|---|---|
|Descubrimiento|Encontrar BSS y capacidades|Beacon / Probe|
|Autenticación|Open System o SAE, según modo|Authentication|
|Asociación|Negociar participación y parámetros|Association|
|Claves|EAP si corresponde; luego 4‑Way|EAPOL / EAPOL‑Key|
|Datos|Cifrar y verificar integridad|Data con CCMP / GCMP|



|Familia<br>Hito|Protección|Claves / acceso|Observación|
|---|---|---|---|



|Familia|Hito|Protección|Claves / acceso|Observación|
|---|---|---|---|---|
|WEP|1997|RC4; IV de 24 bits|Clave compartida|Obsoleto; IV débil y reutilización|
|WPA|2003|TKIP sobre RC4|PSK o 802.1X|Solución transitoria; obsoleta|
|WPA2|2004|AES‑CCMP|PSK o 802.1X|La fortaleza depende del modo y la<br>configuración|
|WPA3|2018|CCMP<br>/<br>GCMP<br>según perfil|SAE o Enterprise;<br>PMF|SAE autentica; CCMP/GCMP cifran|



# **6. La capa de red: IPv4, protocolos complementarios e IPv6** 

## **6.1 Repaso previo y motivación** 

La capa de transporte entrega segmentos (capa 4), la de red arma **paquetes/datagramas** (capa 3) y la de enlace los encierra en **tramas** (capa 2). Dispositivos: capa física (hubs, repetidores), capa de enlace (NIC, bridges, switches) y capa de red ( **routers** , el dispositivo que está en las capas inferiores hasta la de red). Términos de capa 2 que se repasan: tramas, dirección MAC (origen/destino), hubs, colisiones, bridge/switch, segmentos y dominios de colisión. 

**El problema del direccionamiento plano.** Los dispositivos de capa 2 deciden «en forma plana» con las direcciones MAC aprendidas; el espacio MAC **no es jerárquico** y funciona bien en una LAN, pero no escala: nuestro host no conoce la MAC de www.gmail.com ni sabe llegar a una máquina fuera de su LAN. Hace falta un **direccionamiento jerárquico** (como los códigos postales o telefónicos, que son códigos de enrutamiento: primero se decide la zona y después el destino). Los apuntes mencionan, como ejemplos de esquemas no IP, NetBIOS (nombres de host, redes Microsoft sin IP), el protocolo DLC (IBM, AS/400) y RIP como protocolo para aprender rutas jerárquicas. 

## **6.2 Finalidad y responsabilidades de la capa de red** 

Proporcionar **conectividad y selección de ruta** entre dos hosts que pueden estar en ubicaciones geográficas distintas, haciendo que los datos lleguen del origen al destino **aunque no tengan conexión directa** ; ofrece servicios a la capa de transporte y se apoya en el enlace. Responsabilidades: selección de ruta, direccionamiento y enrutamiento, asignar direcciones de red únicas, interconectar subredes distintas, encaminar paquetes y brindar control de congestión y de errores. 

## **6.3 Servicios de red** 

**Conmutación de paquetes.** Técnicas: **datagramas** (cada paquete se encamina independientemente, sin establecimiento previo entre origen y destino) y **circuitos virtuales** (al comienzo de la sesión se establece una ruta única entre los hosts extremos y todos los paquetes la siguen). Servicios **orientados a la conexión** (el primer paquete lleva la dirección destino, se establece la ruta para todos, cada paquete identifica a qué conexión pertenece, y la información generada con el primer paquete queda almacenada en cada nodo) y **no orientados a la conexión** (cada paquete lleva la dirección destino y cada nodo decide el camino, que puede cambiar según congestión, etc.). Pregunta de la cátedra: ejemplo de conmutación de circuitos (red telefónica tradicional) y de paquetes (Internet). 

#### **Ampliación (Tanenbaum 5.1.5).** 

|Asunto||Red de datagramas|Red de circuitos virtuales|
|---|---|---|---|
|Configuración|del|No es necesaria|Requerida|



|Asunto|Red de datagramas|Red de circuitos virtuales|
|---|---|---|
|circuito|||
|Direccionamiento|Cada paquete lleva origen y<br>destino completos|Cada paquete lleva un número corto de<br>VC|
|Información de estado|Los routers no guardan estado de<br>conexiones|Cada VC requiere espacio de tabla por<br>conexión|
|Enrutamiento|Cada paquete se enruta de forma<br>independiente|La ruta se elige al establecer el VC|
|Efecto de fallas de un<br>router|Ninguno,<br>salvo<br>los<br>paquetes<br>perdidos|Terminan todos los VC que pasaban<br>por él|
|Calidad de servicio y<br>congestión|Difíciles|Fáciles si se reservan recursos por<br>adelantado|



## **6.4 Paquete, datagrama y MTU** 

Un **paquete** es cada bloque en que se divide la información en el nivel de red (por debajo, «trama» en capa 2; por arriba, «segmento» en capa 4). Consta de **cabecera** (origen y destino), **área de datos (payload)** y, en algunos casos, cola (código de detección de errores). El **datagrama** es el paquete que constituye el mínimo bloque de información en una red de conmutación por datagramas. Su tamaño depende de la **MTU** ( _Maximum Transmission Unit_ ): el tamaño en bytes de la unidad de datos más grande que puede enviarse en el segmento de red (Ethernet 1500 B, PPPoE 1492 B, ATM AAL5 9180 B, FDDI 4470 B, PPP 576 B); el tamaño incluye cabecera + datos + cola. **Ampliación (Tanenbaum 5.5.6):** los límites vienen del hardware, el sistema operativo, los protocolos, estándares y el deseo de reducir retransmisiones o no ocupar el canal demasiado; la **MTU de la ruta** es el paquete más grande que viaja por toda la ruta sin fragmentarse y se descubre con el bit DF; 802.11 admite cargas de 2272 B según el libro; IP permite paquetes de hasta 65 515 bytes de datos. 

## **6.5 El datagrama IPv4** 

- **Versión** (4 bits): versión del protocolo (4). 

- **Longitud de cabecera / IHL** (4 bits): longitud de la cabecera IP en palabras de 32 bits (mínimo 5 = 20 bytes; máximo 15 = 60 bytes). 

- **TOS / Servicios diferenciados** (8 bits): calidad de servicio solicitada (subcampos: Precedencia 3 bits, TOS 4 bits, MBZ 1 bit). **Ampliación:** hoy los 6 bits superiores marcan la clase de servicio (DiffServ) y los 2 inferiores llevan notificación explícita de congestión (ECN). 

- **Longitud total** (16 bits): cabecera + datos (máximo 65 535 bytes). 

- **Identificación** (16 bits): valor único asignado por el emisor; todos los fragmentos de un datagrama lo comparten, para reensamblar. 

- **Flags** (3 bits: 0, DF, MF): **DF** = no fragmentar; **MF** = más fragmentos (1) o último (0). 

- **Offset de fragmentación** (13 bits): desplazamiento en unidades de 8 bytes (64 bits). 

- **TTL** (8 bits): tiempo de vida, para que los datagramas no vivan para siempre; al llegar a 0 se descarta. **Ampliación:** en la práctica cuenta saltos y se decrementa en cada router; al descartar se avisa al origen (ICMP _Time Exceeded_ ). 

- **Protocolo** (8 bits): protocolo de alto nivel al que se entrega el datagrama (TCP, UDP, ICMP…). 

- • **Checksum** (16 bits): control **solo de la cabecera** ; si no concuerda se descarta. (Es la suma de verificación de Internet vista en 1.7.) 

- **Dirección IP origen y destino** (32 bits cada una). 

- **Opciones** (hasta 40 bytes, longitud variable) y **relleno** con ceros hasta múltiplo de 32 bits. Referencia: RFC 791. 

## **6.6 Direcciones IPv4** 

Una dirección IP identifica, de manera **lógica y jerárquica** , a una **interfaz** en red ( **Ampliación:** no a un host: un host con dos redes tiene dos IP, y los routers tienen varias). Es un número de 32 bits dividido en 4 octetos, expresado en decimal con puntos (0–255): hasta 2³² = 4.294.967.296 direcciones. Una red queda definida por una **dirección IP y una máscara de red** ; tiene un número de red, un rango de hosts y una dirección de **broadcast** . Ejemplo de la cátedra: host 192.168.1.23, red 192.168.1.0, broadcast 192.168.1.255, máscara 255.255.255.0. 

**Máscara y prefijo.** La máscara permite identificar la parte de red y la parte de host: 255.255.255.255 = /32, 255.255.255.0 = /24, 255.255.0.0 = /16, 255.0.0.0 = /8. **Ampliación (Tanenbaum 5.7.2):** el bloque contiguo de direcciones de una red se llama **prefijo** , se escribe «dirección más baja/longitud» (p. ej. 128.208.2.0/24), la longitud no se puede inferir solo de la dirección y los protocolos de enrutamiento deben transportarla; aplicando **AND** entre la máscara y la dirección se extrae la porción de red. Ventaja: los routers reenvían mirando solo la parte de red (tablas de ~300.000 prefijos en lugar de mil millones de hosts). Desventajas: la IP depende de la ubicación (hace falta IP móvil para hosts que se mueven) y la jerarquía desperdicia direcciones si se asignan bloques muy grandes. **Ampliación (Tanenbaum):** la ICANN delega bloques a autoridades regionales que los reparten a ISP y empresas. 

**Privadas, públicas, estáticas y dinámicas.** Las **privadas** están reservadas para uso interno: 10.0.0.0/8, 172.16.0.0/12 y 192.168.0.0/16 (no pueden aparecer en Internet). Las **públicas** se solicitan al registro regional (ARIN, LACNIC). **Estática:** asignada por el administrador. **Dinámica:** configurada desde un servidor **DHCP** . 

**Clases (histórico).** Antes de 1993 había cinco clases: A (empieza con 0; 1–126; 126 redes de ~16 millones de hosts), B (empieza con 10; 128–191; 16.384 redes de 65.536 hosts), C (110; 192–223; ~2 millones de redes de 256 hosts), D (1110, multidifusión) y E (reservada). **Ampliación (Tanenbaum):** el «problema de los tres osos» (A muy grande, C muy chica, B desperdiciada: más de la mitad de las B tenían menos de 50 hosts) llevó a las subredes y luego a **CIDR** ; hoy los bits de clase ya no se usan, aunque las referencias persisten (las máscaras por defecto son /8, /16 y /24). 

**Subredes (subnetting).** ¿Por qué? Reducir el **dominio de broadcast** (los broadcasts llegan a todos los hosts de una red; si consumen demasiado ancho de banda se reduce el tamaño del dominio, análogamente al broadcast de capa 2) y por decisiones de ruteo. Se «piden bits prestados» a la parte de host. **Ampliación (Tanenbaum):** ejemplo con un /16 repartido entre departamentos: Computación recibe un /17 (la mitad), Ingeniería Eléctrica un /18 (un cuarto) y Artes un /19 (un octavo); el router principal sabe a qué subred entregar aplicando AND con cada máscara y comparando con el prefijo, y desde afuera la división no es visible. **Ampliación (Stallings):** ejemplo 192.228.17.57 con máscara 255.255.255.224: AND bit a bit = 192.228.17.32 (número de red/subred); número de subred 1, número de host 25; la máscara permite a un host decidir si el destino está en su LAN (envío directo) o en otra (se envía al router). 

**NAT (Network Address Translation).** Frente al agotamiento de IPv4 (rediseño sin clases en 1992 y muchas redes ocultas detrás de una IP pública), el ISP asigna una sola IP pública y dentro de la red cada computadora usa una IP privada única; al salir, una caja NAT traduce la IP interna a la pública. **Ampliación (Tanenbaum):** para saber a qué máquina interna corresponde la respuesta se usan los **puertos** : la caja NAT reescribe también el puerto de origen TCP/UDP (los puertos son 16 bits extra de direccionamiento, como las extensiones de una central telefónica) y guarda una tabla de traducciones; por eso NAT rompe a las aplicaciones que incrustan direcciones y viola el modelo de capas, pero se usa mucho en redes domésticas. 

## **6.7 Gateway y router: cómo pasan los paquetes entre redes** 

Un **router** une o separa redes y encamina los paquetes entre ellas; generalmente es el **gateway (pasarela, puerta de salida) por defecto** de cada red: el router o host que encamina paquetes con destino fuera de la red local. Un host se configura normalmente con **dirección IP, máscara de red y dirección del gateway** ; sin gateway no puede salir de la red local. **Las tramas de la Red 1 no pasan a la Red 2: el router separa redes.** Cuando recibe una trama dirigida a su MAC en la Red 1 el router: (1) **desencapsula** la trama; (2) analiza el encabezado del paquete (toma la IP destino y le aplica **AND** con las máscaras); (3) elige la **mejor ruta** comparando la red destino con su tabla; (4) **encapsula** una nueva trama para la red elegida (con su MAC de origen en la Red 2). **El paquete no cambia; la trama sí.** El router «enmascara» con su MAC de origen. **Cómo conoce las rutas:** (1) todo router conoce las redes a las que está conectado; (2) puede aprender otras redes en forma **estática** ; (3) o **dinámica** (protocolos de enrutamiento). Se distinguen redes de host (donde hay hosts) y redes de paso (enlaces entre routers). 

## **6.8 Protocolos complementarios de IPv4** 

Protocolos que **mapean IP con MAC: ARP** (resolución de direcciones MAC), **RARP** (resolución de IP desde MAC), **BOOTP** (arranque remoto) y **DHCP** (asignación dinámica de IP). Protocolos de **notificación de problemas y errores: ICMP** . De **gestión de grupos multicast: IGMP** . Recordatorio: para enviar un paquete hay que encapsularlo en capa 2. 

**ARP (Address Resolution Protocol).** Antes de encapsular el paquete hace falta conocer la MAC del destinatario. **Ampliación (Tanenbaum):** las NIC solo entienden direcciones de 48 bits, no IP; el host emite por **broadcast** una consulta (¿quién tiene la IP X?) y el dueño responde con su dirección Ethernet; si el destino está en otra red, se resuelve por ARP la MAC del **router/gateway** y el router repite el proceso en la red siguiente (la trama cambia, el paquete IP no). **Caché ARP:** tabla en memoria con las IP con las que se intercambió información; se vacía al arrancar y las entradas viejas se eliminan al agotarse el espacio o tras inactividad (típicamente ~20 minutos); se consulta con el comando <mark>arp.</mark> Optimizaciones: incluir en la consulta la asociación IP–MAC del emisor, y el **ARP gratuito** (un host consulta por su propia IP al arrancar: no debería haber respuesta; si la hay, hay una IP duplicada; además actualiza las cachés). **Proxy ARP:** en una red dividida en dos o más segmentos, el router responde a consultas ARP entre segmentos «haciéndose pasar» por las máquinas del otro segmento, con su propia MAC; ventajas: menos broadcast y posibilidad de aislar segmentos dentro de una misma red. **RARP:** convierte direcciones Ethernet en IP (la inversa de ARP); útil para estaciones sin disco; mismo formato que ARP con otro código de operación (3: RARP Request, 4: RARP Reply). 

**BOOTP** (UDP): permite a los clientes obtener su IP automáticamente; el mapeo IP–MAC es **fijo** en el servidor. **DHCP:** misma funcionalidad pero con **asignación temporal** de direcciones a una MAC. **Ampliación (Tanenbaum):** cada red tiene un servidor DHCP (o un router que retransmite las solicitudes); el cliente, que solo conoce su MAC, difunde un **DHCP DISCOVER** , el servidor responde con **DHCP OFFER** con una IP libre (identifica al host por su MAC) y el cliente confirma con REQUEST/ACK. La IP se otorga en **arrendamiento (lease)** por un período; antes de que expire el host debe pedir la **renovación** (los apuntes muestran solicitud inicial y renovación) y si no lo hace o se lo deniegan pierde la dirección. DHCP configura además máscara, gateway, DNS y otros parámetros, y lo usan también los ISP. 

**ICMP (Internet Control Message Protocol).** Informa al emisor de eventos inesperados en el procesamiento de paquetes y sirve para probar la red. **Ampliación (Stallings):** es un «usuario» de IP: el mensaje ICMP se encapsula en un datagrama IP (por lo que no se garantiza su entrega); todos empiezan con una cabecera de 64 bits (Tipo 8 bits, Código 8 bits, Checksum 16 bits, Parámetros 32 bits) y, si se refieren a un datagrama previo, incluyen su cabecera IP más los primeros 64 bits de datos. **Tanenbaum:** tipos principales: _Destination unreachable_ (no se pudo entregar; también si hay DF y una red de paquetes pequeños), _Time exceeded_ (TTL llegó a 0), _Parameter problem_ , _Source quench_ , _Redirect_ (enseñar a un router la geografía), _Echo / Echo reply_ (comprobar si una máquina funciona: es el 

_ping_ ), _Timestamp_ , _Router advertisement/solicitation_ . El _time exceeded_ sirve para **traceroute** (paquetes con TTL 1, 2, 3… que mueren en routers sucesivos y revelan la ruta). 

## **6.9 IPv6** 

**Problema de IPv4:** las direcciones IP públicas se agotaron (2³² = 4.294.967.296); en 1992 se rediseñó la red **sin clases (classless)** y se usó **NAT** para esconder muchas redes detrás de una IP pública. **Ampliación (Tanenbaum):** las últimas direcciones IPv4 se asignaron el 25 de noviembre de 2019 según el libro; IPv6 es estándar desde 1998 pero se calcula que se usa en cerca del 25 % de Internet, y no es compatible con IPv4 (sí con TCP, UDP, ICMP, OSPF, BGP, DNS con pequeños cambios). La **IETF** generó la versión 6: **128 bits** (2¹²⁸ ≈ 340 sextillones de direcciones; unos 3 × 10³⁸). Objetivos de diseño: soportar miles de millones de hosts, reducir tablas de enrutamiento, **simplificar el protocolo** y acelerar el procesamiento, seguridad, tipo de servicio para tiempo real, multidifusión con alcances, movilidad, evolución y coexistencia con IPv4. 

**Notación.** Ocho grupos de cuatro dígitos hexadecimales (16 bits cada uno) separados por dos puntos: 2001:0db8:85a3:0000:1319:8a2e:0370:7334. Reglas: se pueden omitir los **ceros a la izquierda** de cada grupo y reemplazar **una secuencia de grupos de ceros por ::** (una sola vez por dirección). Equivalentes de la cátedra: 2001:0DB8:0000:0000:0000:0000:1428:57ab = 2001:0DB8:0:0:0:0:1428:57ab = 2001:0DB8::1428:57ab = 2001:DB8::1428:57ab. Se usa «/» para indicar los bits de prefijo de enrutamiento: 2001:0DB8::1428:57AB/96 (prefijo 2001:0DB8::). Una IPv4 puede escribirse como ::192.31.20.46. 

**Direcciones especiales:** ::/128 (ausencia de dirección, no se asigna a ningún nodo); ::1/128 (loopback, equivale a 127.0.0.1); ::ffff:0:0/96 (dirección IPv4 mapeada, para transición en hosts duales); **fe80::/10** (enlace local, _link local_ ); **fc00::/7** (dirección local única, _unique local address_ , equivalente a las privadas de IPv4). 

**Cabecera IPv6** (fija; las opciones van en cabeceras de extensión): versión (4 bits), **clase de tráfico** (8 bits, prioridad del paquete), **etiqueta de flujo** (20 bits, manejo de QoS), **longitud de datos** (16 bits), **cabecera siguiente** (8 bits), **límite de saltos** (8 bits, el equivalente al TTL) y direcciones de origen y destino de 128 bits. **Ampliación (Tanenbaum) — qué desapareció respecto de IPv4:** IHL (cabecera de longitud fija), Protocolo (lo reemplaza «Siguiente cabecera»), los campos de **fragmentación** (el host descubre la MTU de la ruta y los routers ya no fragmentan: si el paquete es demasiado grande se descarta y se devuelve un error ICMP; el mínimo que todo router debe reenviar sube de 576 a 1280 bytes) y el **checksum** (porque su cálculo reduce el desempeño en redes confiables y las capas superiores ya verifican). El equivalente de ARP en IPv6 es **NDP** (Neighbor Discovery Protocol); ICMP y DHCP tienen versiones para IPv6. 

## **9.2 Lista de afirmaciones que aparecen (verdaderas y trampas)** 

### **Capa de enlace y Ethernet** 

- **Funciones de la capa de enlace:** manejar errores, entramar y dar servicios a la capa de **red** (no de transporte, ni «a la capa física»). 

- **IEEE 802.3** es una LAN cableada derivada del estándar DIX (no es WiFi ni una MAN inalámbrica). Es **no orientado a la conexión, sin confirmaciones y sin corrección de errores** : detecta con el CRC (FCS) y descarta. Preguntas del tipo «servicios de 802.3: orientación a conexión / confirmaciones / corrección» → todas incorrectas. 

- **Gestión de errores:** puede hacerse en varias capas (no «solo» el enlace); 802.3 no corrige. Criterio: canal con tasa de error baja → detección y retransmisión; tasa alta (típicamente inalámbrico) → corrección; el CRC se usa porque se implementa eficientemente por hardware (ver 1.7 y 1.8). 

- **Ventana deslizante en el enlace** (aparece en 2022; no está en las diapositivas, Tanenbaum 3.4): la ventana del emisor fija cuántas tramas puede haber en tránsito sin confirmar (verdadero); el temporizador debe guardar relación con el RTT (verdadero, algo mayor que el RTT); **Retorno a N no es más eficiente que Repetición selectiva** : Retorno a N descarta todo lo posterior a la trama errónea y funciona bien solo si los errores son escasos, mientras que Repetición selectiva retransmite solo lo perdido y rinde mejor en líneas ruidosas (a costa de más buffer en el receptor); usar NAK acelera la recuperación porque el receptor pide la trama sin esperar al temporizador. 

- **CSMA/CD** («2T en 51,2 µs», pariente de ALOHA): el slot time de 10 Mb/s es 512 bit times = 51,2 µs = 2τ. **No usa RTS/CTS** (eso es CSMA/CA) ni es un protocolo LLC. 

- **CSMA/CA** intercambia RTS/CTS (a veces escrito CTS ‑ RTS), no necesita 2T para detectar colisiones y **no es de 802.3u** (802.3u es Fast Ethernet). 

- **Fast Ethernet (802.3u): disminuye el diámetro** de la red respecto de la Ethernet clásica (÷10); la trama mínima sigue siendo 64 B = 512 bits (no «5120 bits»); 100BASE ‑ TX usa **2 pares** UTP; no está limitado a un solo switch. 

- **Gigabit Ethernet:** en **half** ‑ **duplex** usa **extensión de portadora** (relleno hasta 512 B) y **ráfagas de tramas** ; en **full** ‑ **duplex no** (ni CSMA/CD). Sin esas mejoras el diámetro de un half ‑ duplex a 1 Gb/s sería de ~25 m; con ellas llega a ~200 m. 1000BASE ‑ T usa **4 pares Cat 5e** (no «solo Cat 6» ni 2 pares). 

- **Cableados:** 10BASE ‑ T = Cat 3, 2 pares, Manchester (no 4B/5B, no coaxil, y no es «la base de todo Ethernet»); 100BASE ‑ TX = Cat 5, 2 pares (no Cat 3 con 4 pares); 1000BASE ‑ T = Cat 5e, 4 pares. «Cableados permitidos de 802.11b»: ninguno (es inalámbrico). 

- **Dispositivos y capas:** hub, repetidor, antena y patch panel = capa 1 (el hub **no** es de capas 1 y 2); switch y bridge = capa 2 (no capa 4); **AP = puente inalámbrico (norma 802.1D)** , no un router; **router = capas 1, 2 y 3** (no la 4); un host o una tablet llega hasta la 7. «Un AP opera en capas 2 y 3» es falso. 

- **Switch (puente transparente):** aprende por **dirección MAC de origen** , reenvía por **MAC de destino** , inunda broadcast y destinos desconocidos; **no** intercambia mensajes hello ni usa IP. 

- **Spanning Tree:** es **802.1D** ; 802.1X es autenticación por puerto (trampa clásica). Es de capa 2 (no de ruteo de capa 3) y se diseñó para evitar lazos, no para que los puentes anden más rápido. 

- **VLAN:** partición lógica de una red de capa 2 (un dominio de broadcast por VLAN); funciona agregando una etiqueta ( _tag_ ) **802.1Q** de 4 bytes a la trama Ethernet (queda 1522 B); para comunicar VLAN distintas se necesita un router (capa 3). No es lo mismo que _software defined networks_ . **Ampliación (Tanenbaum 4.7.5):** el primer puente con soporte VLAN que toca la trama agrega la etiqueta y el último la quita, porque las estaciones comunes no necesitan saber de VLAN. 

- **802.11: PCF** = coordinación **centralizada por el AP** (polling, casi no se usa); no es «ad hoc», ni «Ethernet clásico», ni depende de un hub. **DCF** = distribuido con CSMA/CA, sin AP que arbitre; también funciona en infraestructura, por lo que **no es sinónimo de «modo infraestructura»** ; no usa CSMA/CD. **Beacon:** incluye SSID, velocidades soportadas y parámetros de seguridad (RSN) (todas las anteriores). **SSID** = nombre de la red; el BSSID es la MAC del AP. **802.11a:** 5 GHz, OFDM, 54 Mb/s, **no** compatible con 802.11g (que opera en 2,4 GHz). 

### **Capa de red** 

- **Funciones:** encontrar la ruta entre hosts origen y destino y dar servicios a la capa de **transporte** (no a la de enlace); el dispositivo de red es el **router** , no el conmutador. 

- **Servicios:** orientado a la conexión = tres etapas (establecer, usar, liberar); no orientado = **cada mensaje lleva dirección de origen y de destino** ; no orientado y sin confirmación = **servicio de datagramas** ; el ejemplo de servicio con conexión es el teléfono (sin conexión es el correo). 

- **IPv4:** no confirmado, sin conexión, **direcciones de 32 bits** (48 bits es la MAC). **IPv6:** 128 bits (no 96), también sin conexión y sin confirmación (no usa circuitos virtuales). 

- **Direccionamiento IP:** jerárquico (no plano); se separa en parte de red y de host mediante la máscara/prefijo; hoy no se usa por clases (CIDR); no es innecesario por existir la MAC (la MAC es local, la IP es entre redes). 

- **Cabecera IPv4: MF** es un flag de fragmentación; **PROTOCOL** indica el protocolo de capa **4** (no de capa 2); **TTL lo decrementa cada router** (no cada switch). 

- **Fragmentación:** con **DF = 1** no se fragmenta (el router descarta y avisa por ICMP); el reensamblado lo hace el **host destino** (no «el último router»); los routers tratan a cada fragmento como un datagrama más; en IPv6 los routers intermedios no fragmentan. 

- **MTU:** el tamaño máximo de **carga útil de una trama (capa 2)** , lo que determina el tamaño máximo del paquete IP que puede viajar por ese enlace. 

- **ARP:** resuelve **IP → MAC** por **difusión de capa 2** dentro de la LAN; no usa números de puerto ni DNS; la dirección inversa (MAC → IP) era RARP. La opción «resuelve direcciones de capa 3 conociendo las de capa 2» es falsa (está al revés). 

- **ICMP:** informa errores y sirve para diagnóstico; **ping usa ICMP Echo** ; no configura hosts (eso es DHCP); un router no envía ICMP por una ventana TCP en 0. _Nota:_ en la hoja del 2.º parcial 2021 figura marcada «ninguna», pero por teoría «ICMP es el protocolo que usa el comando ping» es verdadera. 

- **DHCP:** es la evolución de **BOOTP** ; asigna IP dinámicas. No es de enrutamiento, no manda errores de TTL y no federa servidores DNS. 

- **Qué hace un host para enviar un paquete:** aplica **AND** entre la IP destino y su máscara; si da su misma red, es local (resuelve la MAC por ARP y entrega directo); si no, lo manda al **gateway por defecto** (resolviendo la MAC del gateway). Pregunta con trampa: «los hosts no **reenvían** paquetes, eso lo hacen los routers»; fijate si el enunciado habla de _enviar_ o de _reenviar_ . 

- **NAT:** viola el modelo de capas; vuelve **con estado** al router (tabla de traducciones); además depende de la capa 4 (traduce puertos), de modo que su código cambia si cambian los protocolos de **capa 4** (en 2025 esa opción cuenta como correcta; en 2021 decía «capa 2», que es falsa). «No cumple los estándares NIST» es falso. **Conexiones entrantes:** NAT no las permite por defecto; se resuelve con **port forwarding manual** , con **uPnP** (mecanismo que redirige puertos externos del router a puertos internos de hosts de la LAN automáticamente) o con protocolos de recorrido de NAT como TURN. 

- **Protocolos de enrutamiento:** _vector distancia_ (Bellman ‑ Ford; RIP, IGRP): cada router intercambia con sus vecinos las distancias que conoce; _estado del enlace_ (OSPF, IS ‑ IS; algoritmo de Dijkstra): cada router aprende la topología completa y calcula las rutas, **no es enrutamiento estático** (el estático lo configura el administrador); **RIP no usa Dijkstra** , es vector distancia; **IGRP es vector distancia** . 

## **9.3 Cómo resolver los ejercicios que se repiten** 

## **11.1 Protocolos de acceso aleatorio al medio** 

|Protocolo|¿Sensa<br>el<br>canal?|¿Detecta<br>colisión?|Idea|Rendimiento<br>o<br>rasgo clave|Dónde<br>se<br>usa|
|---|---|---|---|---|---|
|ALOHA puro|No|No<br>(usa<br>ACK<br>y<br>timeout)|Transmite apenas<br>tiene una trama;<br>si no hay ACK,<br>espera un tiempo<br>aleatorio<br>y<br>reenvía|Vulnerable 2T; S<br>=<br>G·e^(−2G),<br>máximo 18,4 %<br>(G = 0,5)|Radio<br>original<br>(ALOHAnet)|
|ALOHA<br>ranurado|No|No|Solo se empieza<br>a<br>transmitir<br>al<br>inicio de un slot|Vulnerable T; S<br>=<br>G·e^(−G),<br>máximo 36,8 %<br>(G = 1); exige<br>sincronización|Acceso<br>por<br>cable, redes<br>de radio|
|CSMA<br>1‑persistente|Sí|No|Si está ocupado<br>sigue<br>escuchando<br>y<br>transmite apenas<br>se libera (prob. 1)|Agresivo; efecto<br>estampida<br>al<br>liberarse<br>el<br>canal|Base<br>de<br>Ethernet<br>clásico|
|CSMA<br>no<br>persistente|Sí|No|Si está ocupado<br>espera un tiempo<br>aleatorio y vuelve<br>a sensar|Menos<br>colisiones, más<br>demora y tiempo<br>ocioso|Teórico|
|CSMA<br>p‑persistente|Sí|No|Canal<br>ranurado:<br>al<br>liberarse<br>transmite<br>con<br>probabilidad p|p<br>grande:<br>menos demora,<br>más colisiones;<br>p<br>chico,<br>lo<br>contrario|Teórico<br>(802.11<br>usa<br>un<br>refinamiento)|
|CSMA/CD|Sí|Sí<br>(mientras<br>transmite)|Detecta<br>la<br>colisión,<br>envía<br>jam,<br>aborta<br>y<br>aplica<br>backoff<br>exponencial<br>binario|Trama mínima ≥<br>2τ (slot time de<br>512 bit times en<br>10/100 Mb/s)|Ethernet<br>compartido<br>(coaxial,<br>hubs)|
|CSMA/CA|Sí|No<br>(la<br>infiere por<br>falta<br>de<br>ACK)|Backoff antes de<br>transmitir,<br>ACK<br>por<br>trama<br>y<br>RTS/CTS<br>opcional con NAV|Resuelve<br>terminales<br>ocultas<br>(con<br>RTS/CTS);<br>es<br>más lento|WLAN<br>802.11 (DCF)|



## **11.2 CSMA/CD frente a CSMA/CA** 

|Aspecto|CSMA/CD|CSMA/CA|
|---|---|---|
|Medio|Cable compartido (Ethernet<br>clásico)|Radio (802.11)|
|Filosofía|Detectar y abortar la colisión|Evitar la colisión antes de transmitir|
|Mientras transmite|Escucha el medio|No puede escuchar (half‑duplex)|
|Confirmación|No hay ACK por trama en la<br>MAC clásica|ACK<br>por<br>trama<br>(parte<br>del<br>mecanismo)|
|Reserva del canal|No|RTS/CTS y NAV (opcional)|
|Esperas|Backoff exponencial tras la<br>colisión|DIFS + backoff aleatorio (que se<br>congela si el canal se ocupa)|
|Problemas propios|Slot<br>time,<br>trama<br>mínima,<br>diámetro de red|Terminales<br>ocultas<br>y<br>expuestas,<br>sobrecarga|



## **11.3 Versiones de Ethernet** 

|Norma|Tasa|Medio|Codificación|Alcance<br>por<br>segmento|Notas|
|---|---|---|---|---|---|
|10BASE5|10 Mb/s|Coaxial<br>grueso<br>50<br>Ω|Manchester|500 m|Bus<br>con<br>terminadores;<br>transceptor externo<br>(AUI)|
|10BASE2|10 Mb/s|Coaxial fino<br>RG‑58|Manchester|185 m|Bus con BNC en T;<br>un corte afecta a<br>todos|
|10BASE‑T<br>(802.3i)|10 Mb/s|2<br>pares,<br>Cat<br>3<br>o<br>mejor|Manchester|100 m|Estrella con hub o<br>switch|
|100BASE‑TX<br>(802.3u)|100 Mb/s|2<br>pares,<br>Cat 5|4B/5B<br>+<br>NRZI/MLT‑3|100 m|Autonegociación,<br>misma trama|
|100BASE‑FX|100 Mb/s|Fibra<br>multimodo|4B/5B<br>+<br>NRZI|412 m half,<br>2 km full|Dos fibras|
|1000BASE‑S<br>X/LX/CX<br>(802.3z)|1 Gb/s|Fibra<br>o<br>cobre corto|8B/10B|SX < 550<br>m, LX < 10<br>km, CX <<br>25 m|Óptica<br>modular<br>(SFP)|



|Norma|Tasa|Medio|Codificación|Alcance<br>por<br>segmento|Notas|
|---|---|---|---|---|---|
|1000BASE‑T<br>(802.3ab)|1 Gb/s|4<br>pares,<br>Cat 5e|PAM‑5<br>+<br>DSP|100 m|250 Mb/s por par en<br>ambos sentidos|
|10GBASE‑T|10 Gb/s|4<br>pares,<br>Cat 6A|PAM‑16<br>+<br>LDPC|100 m|Solo full‑duplex|
|10GBASE‑S<br>R/LR/ER<br>(802.3ae)|10 Gb/s|Fibra|64B/66B|≈ 300–400<br>m / 10 km /<br>40 km|Pensado<br>para<br>centros de datos|



La trama y las direcciones se mantienen en toda la familia; a partir de 10G desaparece el half ‑ duplex y con él CSMA/CD. 

## **11.4 Hub, repetidor, switch, router y AP** 

|Dispositivo|Capa|Decide por||Dominios<br>de<br>colisión|Dominios<br>de<br>broadcast|
|---|---|---|---|---|---|
|Repetidor|1|Nada:<br>regenera<br>señal|la|Extiende el mismo|El mismo|
|Hub|1|Nada: repite por to<br>los puertos|dos|Uno<br>solo<br>para<br>todos|Uno solo|
|Puente<br>/<br>switch|<br>2|Dirección<br>MAC<br>destino (tabla MAC|de<br>)|Uno por puerto|Uno (se separa<br>con VLAN)|
|Router|3|Dirección<br>IP<br>destino<br>(tabla<br>rutas)|de<br>de|Uno por interfaz|Uno por interfaz|
|Access<br>point|1<br>y<br>2<br>(puente<br>inalámbrico<br>802.1D)|Dirección MAC||Las estaciones de<br>un BSS comparten<br>el canal|Uno<br>por<br>BSS/SSID<br>(según<br>la<br>configuración)|



|Switch store‑and‑forward|Switch cut‑through|
|---|---|
|Recibe la trama completa y verifica el FCS|Reenvía al leer la dirección destino|
|Mayor latencia; descarta tramas con error|Menor latencia; puede propagar tramas<br>dañadas|



## **11.5 Estándares 802.11** 

|Norma|Nombre<br>comercial|Banda|Aporte principal|Dato útil|
|---|---|---|---|---|
|802.11b|—|2,4 GHz|Primera<br>ampliación<br>comercial|Hasta 11 Mb/s|
|802.11a|—|5 GHz|OFDM|54 Mb/s; no compatible<br>con b/g|
|802.11g|—|2,4 GHz|OFDM|54 Mb/s; compatible con b|
|802.11n|Wi‑Fi 4|2,4 y 5 GHz|MIMO, canales de 40<br>MHz|150 Mb/s PHY por flujo<br>(40 MHz, MCS 7, GI<br>corto)|
|802.11ac|Wi‑Fi 5|5 GHz|256‑QAM, MU‑MIMO<br>en downlink|Beamforming|
|802.11ax|Wi‑Fi<br>6<br>(6E con 6<br>GHz)|2,4, 5 y 6 GHz|OFDMA, 1024‑QAM,<br>MU‑MIMO UL y DL,<br>BSS Coloring|Hasta 8 flujos espaciales;<br>mejor<br>eficiencia<br>con<br>muchos usuarios|



## **11.6 DCF, PCF y EDCA** 

|Aspecto|DCF||PCF|EDCA|
|---|---|---|---|---|
|Control|Distribuido<br>compiten)|(todas|Centralizado por el<br>AP (polling)|Distribuido con prioridades|
|Acceso|CSMA/CA con|backoff|El AP sondea a<br>las estaciones|Cuatro categorías (voz, video,<br>best effort, background)|
|Espaciado|DIFS||PIFS|AIFS = SIFS + AIFSN × slot|
|Uso actual|Mecanismo<br>también<br>infraestructura|base,<br>en|Casi no se usa|Extensión 802.11e para QoS|
|Garantías|Ninguna||Teóricas|Estadísticas, no absolutas|



## **11.7 Seguridad inalámbrica** 

|Familia|Año|Cifrado|Acceso|Estado|
|---|---|---|---|---|
|WEP|1997|RC4 con IV de<br>24 bits|Clave compartida (Shared<br>Key)|Obsoleto, roto|
|WPA|2003|TKIP<br>sobre<br>RC4|PSK o 802.1X|Transitorio, obsoleto|



|Familia|Año|Cifrado|Acceso|Estado|
|---|---|---|---|---|
|WPA2|2004|AES‑CCMP|PSK (WPA2‑Personal) o<br>802.1X/EAP (Enterprise)|Vigente; depende del modo<br>y la configuración|
|WPA3|2018|CCMP/GCMP|SAE<br>(Personal)<br>o<br>Enterprise; PMF|Más seguro (evita ataques<br>de diccionario offline)|



## **11.8 Direcciones MAC frente a direcciones IP** 

|Aspecto|MAC|IP|
|---|---|---|
|Capa|Enlace (2)|Red (3)|
|Tamaño|48 bits (hexadecimal)|32 bits (IPv4) o 128 bits (IPv6)|
|Estructura|Plana (OUI + identificador del<br>fabricante)|Jerárquica (red + host)|
|Alcance|Local al enlace; cambia en cada<br>salto|Extremo a extremo; no cambia en el viaje<br>(salvo NAT)|
|Asignación|Grabada en la placa por el<br>fabricante|Estática<br>(administrador)<br>o<br>dinámica<br>(DHCP)|
|Broadcast|FF:FF:FF:FF:FF:FF|Limitado 255.255.255.255 o dirigido (última<br>dirección de la red)|



## **11.9 Servicios de la capa de red** 

|Asunto|Datagramas|Circuitos virtuales||
|---|---|---|---|
|Establecimiento|No hace falta|Obligatorio||
|Dirección en cada paquete|Origen y destino completos|Número corto de circuito||
|Estado en los routers|Ninguno por conexión|Una entrada por circuito||
|Ruta|Cada paquete se enruta por<br>separado|Fija durante la conexión||
|Falla de un router|Solo<br>se<br>pierden<br>los<br>paquetes en tránsito|Se<br>caen<br>los<br>circuitos<br>pasaban por él|que|
|QoS y congestión|Difíciles|Más<br>fáciles<br>(reserva<br>recursos)|de|
|Ejemplo|Internet (IP)|Red telefónica, MPLS||



## **11.10 IPv4 frente a IPv6** 

|Aspecto|IPv4|IPv6|
|---|---|---|



|Aspecto|IPv4||IPv6|
|---|---|---|---|
|Dirección|32<br>bits<br>(decimal<br>puntos)|con|128 bits (hexadecimal con «:» y «::»)|
|Cabecera|20<br>a<br>60<br>bytes,<br>opciones|con|Fija de 40 bytes; opciones en cabeceras<br>de extensión|
|Checksum|Sí (solo de la cabecer|a)|No|
|Fragmentación|La hacen los router<br>DF = 0)|s (si|Solo el origen; los routers no fragmentan|
|TTL / límite|TTL||Límite de saltos (hop limit)|
|Broadcast|Sí||No: multicast|
|Resolución de MAC|ARP||NDP (Neighbor Discovery)|
|Configuración|Manual o DHCP||Autoconfiguración (SLAAC) o DHCPv6|
|NAT|Muy usado||No necesario|
|Servicio|No<br>confirmado,<br>conexión|sin|No confirmado, sin conexión|



## **11.11 Clases IPv4 y direcciones especiales** 

|Primer octeto|Clase|Máscara<br>por<br>defecto|Uso|
|---|---|---|---|
|0–127|A (bit inicial 0)|255.0.0.0|Redes<br>grandes;<br>127.0.0.0/8<br>es<br>loopback|
|128–191|B (10)|255.255.0.0|Redes medianas (65.534 hosts)|
|192–223|C (110)|255.255.255.0|Redes chicas (254 hosts)|
|224–239|D (1110)|—|Multicast|
|240–255|E (1111)|—|Reservada|



|Dirección|Significado|
|---|---|
|0.0.0.0|Este host / ruta por defecto|
|127.0.0.1|Loopback (el propio host)|
|255.255.255.255|Broadcast limitado (red local, no cruza routers)|
|Red con los bits de host en 1|Broadcast dirigido de esa red|
|10/8, 172.16/12, 192.168/16|Privadas (necesitan NAT para salir a Internet)|



## **11.12 Protocolos complementarios de IP** 

|Protocolo|Para qué sirve|Detalle|
|---|---|---|
|ARP|IP → MAC|Consulta por broadcast en la LAN; guarda el<br>resultado en la caché ARP|
|RARP|MAC → IP|Inverso de ARP; para estaciones sin disco|
|Proxy ARP|Respuesta en nombre de<br>otro|El router responde con su MAC por hosts del<br>otro segmento|
|BOOTP|Arranque remoto|Mapa IP‑MAC fijo en el servidor|
|DHCP|IP dinámica|DISCOVER,<br>OFFER,<br>REQUEST,<br>ACK;<br>arrendamiento (lease) con renovación|
|ICMP|Errores y diagnóstico|Echo (ping), destino inalcanzable, tiempo<br>excedido (traceroute)|
|IGMP|Grupos multicast|Gestiona la pertenencia a grupos|
|NAT/PAT|Traducción de direcciones y<br>puertos|Router con estado; viola el modelo de capas|



## **11.13 Enrutamiento** 

|Aspecto|Estático|Dinámico|
|---|---|---|
|Quién configura|El administrador|Los routers intercambian información|
|Ante un cambio|No se adapta|Se adapta (reconverge)|
|Carga|Ninguna|CPU, memoria y ancho de banda|
|Cuándo conviene|Redes chicas o con una sola<br>salida (stub)|Muchos routers y caminos redundantes|



|Aspecto|Vector distancia|Estado del enlace|
|---|---|---|
|Algoritmo|Bellman‑Ford|Dijkstra|
|Qué intercambia|Con los vecinos, las distancias que<br>conoce|Anuncios<br>del<br>estado<br>de<br>sus<br>enlaces, inundados a toda la red|
|Visión de la red|Solo vecinos y distancias|Topología completa|
|Ejemplos|RIP, IGRP|OSPF, IS‑IS|
|Problema típico|Convergencia lenta, cuenta hasta<br>infinito|Más memoria y cálculo|



# **12. Glosario** 

### **12.1 Subcapa MAC y acceso al medio** 

- **LLC (Logical Link Control):** subcapa superior del enlace; da una interfaz uniforme hacia la capa de red. 

- **MAC (Medium Access Control):** subcapa inferior; define direcciones MAC, formato de trama y quién transmite y cuándo. 

- **Canal compartido:** medio donde varias estaciones compiten y solo una transmite con éxito a la vez. 

- **Asignación estática (FDM, TDM):** el canal se reparte por adelantado; desperdicia capacidad con tráfico en ráfagas. 

- **Asignación dinámica:** se decide en tiempo real quién usa el canal; es lo que resuelve la MAC. 

- **Colisión:** superposición de dos o más tramas en el tiempo; ambas se pierden. 

- • **Protocolo de contención:** técnica donde las estaciones compiten por el canal sin turno fijo (acceso aleatorio). 

- **Tiempo continuo / ranurado:** en el ranurado las transmisiones solo empiezan al inicio de un slot y hace falta sincronización. 

- **Detección de portadora (carrier sense):** capacidad de saber si el canal está ocupado antes de transmitir. 

- **Retardo de propagación (τ):** tiempo que tarda la señal en recorrer el medio; es la causa de las colisiones en CSMA. 

- **Carga ofrecida (G) y rendimiento (S):** G = intentos por tiempo de trama; S = tramas exitosas por tiempo de trama. 

- **ALOHA puro:** transmite apenas hay una trama; vulnerable 2T; S máximo 18,4 %. 

- **ALOHA ranurado:** transmite solo al inicio de slot; vulnerable T; S máximo 36,8 %. 

- **Período vulnerable:** intervalo en que otra transmisión provoca colisión (2T en el puro, T en el ranurado). 

- **CSMA:** sensa antes de transmitir; sus variantes son 1 ‑ persistente, no persistente y p ‑ persistente. 

- **Efecto estampida:** en CSMA 1 ‑ persistente, las estaciones en espera transmiten juntas al liberarse el canal. 

- **CSMA/CD:** CSMA con detección de colisiones: aborta al detectarlas. 

- **Señal de jam:** ráfaga que refuerza la colisión para que todas la reconozcan (32 bits en las diapositivas). 

- **Backoff exponencial binario:** tras la colisión i se espera un número aleatorio de slots entre 0 y 2^i − 1; tope 1023 y abandono tras 16. 

- **Slot time:** 512 bit times (51,2 µs a 10 Mb/s); ventana para detectar la colisión. 

- **Trama mínima y 2τ:** la trama debe durar al menos 2τ para que el emisor se entere de una colisión remota (64 bytes en Ethernet). 

- **Colisión tardía:** la que ocurre después del slot time; señala un problema de cableado, longitud o dúplex. 

- **Producto ancho de banda** ‑ **retardo:** cuántos bits caben en el canal; cuanto mayor, peor rinde CSMA. 

- **Protocolo de mapa de bits:** protocolo sin colisiones con ranuras de reserva, una por estación. 

- **Paso de testigo (token passing):** solo transmite quien tiene el token, que circula en orden (acceso controlado). 

- **Contención limitada:** combina contención con baja carga y reserva con alta carga. 

- **Terminal oculta:** dos estaciones que no se oyen transmiten a un mismo receptor y chocan allí. 

- **Terminal expuesta:** una estación se abstiene de transmitir aunque su transmisión no interferiría. 

- **MACA:** esquema que usa tramas cortas de reserva (idea de RTS/CTS). 

- **CSMA/CA:** evita colisiones con backoff previo, ACK por trama y RTS/CTS opcional. 

- **DIFS / SIFS:** espaciados entre tramas; SIFS (corto) para respuestas inmediatas, DIFS para empezar a competir. 

- **RTS / CTS:** tramas cortas de reserva del canal. 

- **NAV (Network Allocation Vector):** temporizador de portadora virtual: tiempo durante el que no se debe transmitir. 

- **Acceso controlado:** se da permiso explícito para transmitir (polling, token passing). 

### **12.2 Ethernet y conmutación** 

- **IEEE 802.3:** estándar de LAN cableada derivada de Ethernet; una MAC común con PHY intercambiables. 

- **DIX:** Digital, Intel y Xerox; especificación Ethernet anterior a la norma IEEE. 

- **PHY, RS/xMII, MDI:** capa física, interfaz que la adapta a la MAC y conector con el medio. 

- **Nomenclatura (ej. 1000BASE** ‑ **T):** velocidad en Mb/s, BASE = banda base, y sufijo del medio (T par trenzado, SR fibra corta). 

- **Preámbulo (7 B) y SFD (1 B):** secuencia de sincronización y delimitador de inicio; no cuentan en los 64 a 1518 bytes. 

- **Dirección MAC:** 48 bits grabados en la placa; OUI (24 bits del fabricante) + identificador. 

- **Bit I/G y bit U/L:** individual/grupo y universal/local dentro de la dirección. 

- **Unicast, multicast y broadcast:** una interfaz, un grupo (01:00:5E:…) o todas (FF:FF:FF:FF:FF:FF). 

- **Length/Type:** hasta 1500 es longitud; desde 1536 (0x0600) es EtherType (0x0800 IPv4, 0x0806 ARP, 0x86DD IPv6). 

- **Padding:** relleno para llegar a la carga mínima de 46 bytes. 

- **FCS:** CRC ‑ 32 de 4 bytes; detecta errores y la trama se descarta. 

- **MTU (1500 B):** carga útil máxima de la trama; limita el tamaño del paquete IP. 

- **Etiqueta 802.1Q:** 4 bytes que identifican la VLAN (trama máxima de 1522 B). 

- **Jumbo frame:** trama de ~9000 B de carga, extensión de proveedor. 

- **IFG:** separación de 96 bit times entre tramas. 

- **LLC/SNAP:** alternativa a EtherType para identificar el protocolo superior. 

- **Manchester:** codificación con transición en el centro del bit; el reloj viaja con los datos (10 Mb/s). 

- **4B/5B, MLT** ‑ **3, NRZI:** codificaciones de 100BASE ‑ TX (cada 4 bits en 5; MLT ‑ 3 usa tres niveles). 

- **8B/10B:** codificación de 1000BASE ‑ X. 

- **PAM** ‑ **5 / PAM** ‑ **16:** modulación multinivel de 1000BASE ‑ T y 10GBASE ‑ T; con DSP y cancelación de eco. 

- **Autonegociación:** los extremos acuerdan velocidad y dúplex con pulsos de enlace. 

- • **Duplex mismatch:** extremos con dúplex distinto; produce colisiones tardías y errores de CRC. 

- **Half** ‑ **duplex / full** ‑ **duplex:** un sentido por vez con CSMA/CD, o dos canales sin colisiones. 

- **Extensión de portadora y ráfagas de tramas:** mejoras de Gigabit half ‑ duplex para mantener el diámetro de red. 

- **Dominio de colisión:** conjunto de equipos cuyas tramas pueden colisionar (uno por puerto de switch). 

- **Hub / repetidor:** capa 1; repiten la señal por todos los puertos. 

- **Switch / puente:** capa 2; reenvía por MAC destino y separa dominios de colisión. 

- **Tabla MAC:** relación entre estación (MAC) y puerto. 

- **Aprendizaje hacia atrás:** el switch aprende el origen de cada trama que recibe y purga entradas viejas. 

- **Inundación y filtrado:** si el destino es desconocido o broadcast, se envía por todos los puertos menos el de entrada; si está en el mismo puerto, se descarta. 

- **Store** ‑ **and** ‑ **forward / cut** ‑ **through:** reenvío tras recibir la trama entera y verificar el FCS, o apenas se lee el destino. 

- **Backplane:** bus interno de alta velocidad del switch. 

- • **STP (802.1D) y BPDU:** protocolo que bloquea enlaces para dejar un árbol sin ciclos; los BPDU son sus mensajes. 

- **Puente raíz / puerto raíz:** el puente con identificador menor es la raíz; el puerto raíz es el de mejor camino hacia ella. 

- **Estados de puerto STP:** Disabled, Blocking, Listening, Learning y Forwarding. 

- **VLAN (802.1Q):** partición lógica de capa 2 con un dominio de broadcast por VLAN; comunicar VLAN exige un router. 

- **PoE (PSE y PD):** alimentación por el cable de datos; 802.3af da 15,4 W y 802.3at (PoE+), 30 W en el PSE. 

### **12.3 Redes inalámbricas 802.11** 

- **STA, AP:** estación cliente y punto de acceso. 

- **BSS, IBSS, DS:** celda de un AP; red ad hoc sin AP; sistema de distribución que conecta APs y LAN. 

- **Modo infraestructura / ad hoc:** con AP o sin AP. 

- **SSID / BSSID:** nombre de la red / identificador del BSS (MAC del AP). 

- **Beacon:** trama de gestión (subtipo 8) que anuncia la red cada 100 TU (102,4 ms). 

- **TU, TSF:** unidad de tiempo de 1024 µs y referencia de sincronización del BSS. 

- **TIM / DTIM:** anuncian tráfico almacenado para estaciones en ahorro de energía. 

- **Probe Request:** consulta activa para descubrir redes. 

- **Asociación, reasociación, desasociación:** registrar, cambiar o terminar la relación con un AP. 

- **ISM / U** ‑ **NII:** bandas sin licencia individual (2,4 GHz / 5 y 6 GHz); no significa sin regulación. 

- **Canales 1, 6 y 11:** plan de tres canales sin solapamiento en 2,4 GHz. 

- **DFS:** detecta radares en 5 GHz y obliga a abandonar el canal. 

- **dB, dBi, dBm:** relación de potencias; ganancia de antena respecto de la isotrópica; potencia respecto de 1 mW. 

- **Presupuesto de enlace:** Pr = Pt + Gt + Gr − pérdidas; se compara con la sensibilidad del receptor. 

- **OFDM:** muchas subportadoras ortogonales que llevan símbolos PSK/QAM; usa prefijo cíclico contra la multitrayectoria. 

- **QAM:** modulación de amplitud y fase (256 ‑ QAM, 1024 ‑ QAM). 

- **MIMO:** varias antenas y cadenas de radio; diversidad (robustez) o multiplexación espacial (más tasa). 

- **SU** ‑ **MIMO / MU** ‑ **MIMO:** flujos a un usuario o a varios a la vez. 

- **Beamforming:** pondera fase y amplitud para concentrar la señal hacia el cliente. 

- **OFDMA:** reparte el canal entre usuarios en unidades de recurso (RU); el AP planifica con una trigger frame. 

- **BSS Coloring:** identifica el BSS en la señalización PHY de 802.11ax para reutilizar el canal. 

- **Wi** ‑ **Fi 4, 5, 6 y 6E:** 802.11n, ac, ax y ax en 6 GHz. 

- **DCF:** acceso distribuido CSMA/CA con DIFS, backoff y ACK tras SIFS. 

- **Backoff 802.11:** entero aleatorio en [0, CW] que se congela si el canal se ocupa; CW se duplica ante fallas y vuelve a CWmin tras un éxito. 

- **PCF:** acceso centralizado por polling del AP; casi sin uso. 

- **EDCA, AC, AIFS, TXOP:** QoS de 802.11e con cuatro categorías de acceso; AIFS = SIFS + AIFSN × slot; TXOP es la oportunidad de transmisión. 

- **SIFS / PIFS / DIFS / EIFS:** espaciados de respuesta inmediata, del controlador PCF, de contienda y tras una trama errónea. 

- **Frame Control / Duration / Sequence:** campos de la trama: tipo y subtipo, tiempo reservado (NAV) y detección de duplicados. 

- **Tipos de trama:** gestión (00, Beacon), control (01, RTS/CTS/ACK) y datos (10). 

- **To DS / From DS:** definen el significado de las direcciones de la trama. 

- **RA, TA, DA, SA:** receptor y transmisor del salto por radio, destino y origen de la trama transportada. 

- **WDS:** enlace entre puentes; usa las cuatro direcciones. 

- **Open System:** «autenticación» 802.11 sin contraseña. 

- **WEP, WPA, WPA2, WPA3:** familias de seguridad (ver tabla 11.7). 

- **PMK, PTK, GTK:** clave maestra, de sesión (unicast) y de grupo. 

- **4** ‑ **Way Handshake:** intercambio que prueba la PMK y deriva las claves de sesión sin enviar la contraseña. 

- **802.1X / EAP / RADIUS:** control de acceso por puerto, método de autenticación y servidor de autenticación (Enterprise). 

- **SAE:** acuerdo de claves basado en contraseña de WPA3 ‑ Personal. 

- **CCMP / GCMP / TKIP:** modos de cifrado; TKIP es el de WPA. 

- **PMF:** protección de las tramas de gestión (WPA3). 

### **12.4 Capa de red** 

- **Capa de red:** da conectividad y selección de ruta entre hosts en redes distintas; sirve a la capa de transporte. 

- **Reenvío y enrutamiento:** mover el paquete al siguiente salto según la tabla; construir esa tabla. 

- **Paquete / datagrama:** unidad de la capa de red; el datagrama se encamina de forma independiente. 

- **Conmutación de paquetes, circuito virtual:** servicio con o sin conexión previa y ruta fija. 

- **Direccionamiento plano / jerárquico:** MAC no tiene estructura; IP sí (red + host), como un número de teléfono. 

- **IPv4:** dirección de 32 bits en 4 octetos; no confirmado y sin conexión. 

- **Máscara y prefijo (/n):** marcan la parte de red; el AND con la IP da la dirección de red. 

- **Dirección de red y de broadcast:** primera y última de la red; no se asignan a hosts. 

- **Hosts utilizables:** 2^(bits de host) − 2. 

- **Clases A, B, C, D, E:** esquema histórico por el primer octeto; hoy se usa CIDR. 

- **CIDR:** direccionamiento sin clases con máscara de longitud variable. 

- **Subred / subnetting:** dividir una red pidiendo bits prestados a la parte de host; reduce el dominio de broadcast. 

- **VLSM:** máscaras de distinto largo según el tamaño de cada sector. 

- **Supernetting / agregación:** unir prefijos contiguos en uno más corto para tener menos rutas. 

- **Prefijo más largo:** regla de reenvío: gana la ruta que coincide con más bits. 

- **IP privadas y públicas:** 10/8, 172.16/12 y 192.168/16 no se enrutan en Internet; las públicas las asigna el registro regional. 

- **IP estática y dinámica:** fijada por el administrador o entregada por DHCP. 

- **Loopback (127.0.0.0/8):** el propio host. 

- **Broadcast limitado y dirigido:** 255.255.255.255 (red local) o el de una red concreta. 

- **Cabecera IPv4:** versión, IHL, TOS/DS, longitud total, identificación, flags, offset, TTL, protocolo, checksum, origen, destino y opciones. 

- **TTL:** cada router lo decrementa; en 0 se descarta (ICMP tiempo excedido). 

- **Fragmentación (DF, MF, offset):** dividir un datagrama mayor que la MTU; se reensambla en el destino. 

- **Gateway / ruta por defecto:** router para destinos fuera de la red local. 

- **Router:** une redes; desencapsula la trama, mira la IP, elige la ruta y encapsula otra trama. 

- **El paquete no cambia, la trama sí:** las IP se mantienen; las MAC cambian en cada red. 

- **Tabla de rutas:** redes conocidas con interfaz de salida o próximo salto. 

- **Red de paso / red de host:** enlaces entre routers sin hosts / redes con hosts. 

- **Ruta conectada, estática y dinámica:** directa, puesta por el administrador o aprendida de otros routers. 

- **Distancia administrativa:** preferencia entre fuentes de rutas (menor = más confiable). 

- • **Vector distancia / estado del enlace:** familias de protocolos dinámicos (RIP, IGRP / OSPF). 

- **Lazo de enrutamiento:** dos routers se reenvían el mismo paquete; lo corta el TTL. 

- **ARP y caché ARP:** resuelve IP → MAC por broadcast; la caché guarda el resultado unos minutos. 

- **Proxy ARP, ARP gratuito:** el router responde por otros hosts; un host consulta por su propia IP para detectar duplicados. 

- **RARP, BOOTP, DHCP:** MAC → IP, arranque con mapeo fijo, asignación dinámica con lease. 

- **DISCOVER / OFFER / REQUEST / ACK:** los cuatro mensajes de DHCP; el relay lo reenvía entre redes. 

- **ICMP:** mensajes de error y diagnóstico; ping usa Echo y traceroute aprovecha el TTL. 

- **IGMP:** gestiona grupos multicast. 

- **NAT / PAT:** traducción de direcciones (y puertos) en el router; router con estado y viola el modelo de capas. 

- **Port forwarding, uPnP:** redirigen puertos externos a hosts internos (manual o automático). 

- **IPv6:** 128 bits; cabecera fija de 40 bytes; sin checksum, sin fragmentación en routers y sin broadcast. 

- **Notación IPv6:** ocho grupos hexadecimales; se omiten ceros iniciales y una secuencia de ceros con «::». 

- **Direcciones IPv6 especiales:** ::1 (loopback), fe80::/10 (enlace local) y fc00::/7 (local única). 

- **Campos de la cabecera IPv6:** clase de tráfico, etiqueta de flujo, longitud, siguiente cabecera y límite de saltos. 

- **NDP:** descubrimiento de vecinos; reemplaza a ARP en IPv6. 

