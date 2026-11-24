# Apunte Redes A · Plataforma de Estudio Interactiva

Aplicación web interactiva para estudiar **Redes de Datos** (Capas 1 a 3), desarrollada 100% en **HTML, CSS y JavaScript puros**, sin servidor, sin bundlers ni dependencias externas. Funciona por completo offline abriendo directamente `index.html`.

---

## Cómo usarla

1. Cloná o descargá este repositorio.
2. Abrí `index.html` con doble clic en cualquier navegador moderno (o habilitá **GitHub Pages** desde la rama `main`).
3. Tu historial de exámenes, notas personales, estado de dominio y preferencia de tema se guardan automáticamente en `localStorage`.

---

## Secciones principales

### 1. Exámenes Multiple Choice
- **75 preguntas** distribuidas en las cinco unidades del apunte (`U2`: 15, `U3`: 14, `U4`: 14, `U5`: 16, `U6`: 16).
- Incluye **25 trampas típicas de parcial** (con un modo específico para practicarlas).
- Modo examen sin spoilers mientras rendís: cronómetro, navegador numérico de preguntas y marcador para revisar.
- **Corrección automática al entregar**: puntaje total, desglose por unidad, filtros (`Todas`, `Incorrectas`, `Correctas`, `Sin responder`), explicación detallada de cada pregunta y botón para reintentar solo las falladas o sin responder.

### 2. Mapas Conceptuales y Explicaciones Gráficas
Seis capítulos visuales interactivos en SVG + controles dinámicos:
1. **Mapa Conceptual Global (Capas 1 a 3):** nodos clicables con inspector de conceptos y conexiones entre capas.
2. **Acceso MAC y ALOHA:** curvas interactivas de rendimiento ($S = Ge^{-2G}$ vs $S = Ge^{-G}$) con deslizador de carga $G$, diagrama espacio-tiempo de la regla $2\tau$ (64 bytes) y selector de escenarios de terminal oculta, RTS/CTS (NAV) y terminal expuesta.
3. **Trama Ethernet y PHY:** explorador clicable campo por campo (con interruptor para etiqueta VLAN `802.1Q`) y tabla filtrable de evolución PHY (`10BASE5` a `800G`).
4. **Switch, STP y PoE:** simulador vivo de aprendizaje de **Tabla MAC** paso a paso, dominios de colisión vs broadcast, diagrama STP (`802.1D`) con sus 5 estados, y comparativas `store-and-forward` / `cut-through` y PoE (`802.3af` / `802.3at`).
5. **Wi-Fi 802.11:** gráfico de canales `1, 6 y 11` en 2,4 GHz, calculadora de presupuesto de enlace en dBm, matriz interactiva `To DS / From DS` (3 y 4 direcciones WDS), espaciados DCF/EDCA y flujo de seguridad hasta WPA3-SAE.
6. **IPv4, IPv6 y Router:** comparador clicable de cabeceras IPv4 (20 B) vs IPv6 (40 B fija), animador paso a paso de *"el paquete no cambia, la trama sí"*, y resumen de DHCP (DORA), ARP, NAT/PAT y enrutamiento (`RIP` vs `OSPF`).

Cada capítulo incluye al pie un **mini-cuestionario de 3 preguntas múltiple choice** (18 en total) con corrección automática instantánea y explicación del acierto o error.

### 3. Preguntas para Indagar en Profundidad
- **45 preguntas abiertas** clasificadas por unidad y por enfoque (*¿Por qué funciona así?*, *¿Qué pasaría si...?*, *Comparación crítica* y *Escenario / Cálculo*).
- Área de notas personales (autoguardado local), pista desplegable, checklist de puntos clave del apunte, chips conectados al glosario, botones de dominio (`Repasar` / `Dudosa` / `Dominada`) y **modo auto-interrogación aleatoria**.

### 4. Glosario y Tema Claro/Oscuro
- **131 términos** del glosario con buscador instantáneo y filtro por bloque (`MAC`, `Ethernet / Switch`, `Wi-Fi 802.11`, `Capa de Red`).
- Cambio instantáneo entre tema claro y oscuro desde la barra superior.

---

## Temario cubierto

- **Unidad 2:** Subcapa MAC y acceso aleatorio (ALOHA puro y ranurado, CSMA, CSMA/CD, CSMA/CA, terminales ocultas/expuestas).
- **Unidad 3:** Ethernet IEEE 802.3 (evolución PHY, codificaciones, formato de trama, direcciones MAC, duplex mismatch).
- **Unidad 4:** Conmutación Ethernet (switches, tabla MAC, store-and-forward vs cut-through, STP 802.1D, VLAN 802.1Q, PoE).
- **Unidad 5:** Redes inalámbricas IEEE 802.11 (canales 2,4/5/6 GHz, DFS, dBm, OFDM/MIMO/OFDMA, DCF/EDCA, trama de 3 y 4 direcciones, WEP/WPA2/WPA3).
- **Unidad 6:** Capa de red (datagramas vs circuitos virtuales, IPv4, CIDR/subnetting, fragmentación, router, ARP, DHCP, ICMP, NAT/PAT, RIP vs OSPF, IPv6).

---

## Estructura del proyecto

```text
├── index.html             # Estructura principal y vistas
├── css/
│   └── styles.css         # Estilos responsivos y tema claro/oscuro
├── js/
│   ├── app.js             # Navegación, tema, estadísticas y glosario
│   ├── data-quiz.js       # Banco de 75 preguntas multiple choice
│   ├── data-diagrams.js   # Datos de mapas, tramas, glosario y quizzes por capítulo
│   ├── data-deep.js       # Banco de 45 preguntas de indagación profunda
│   ├── quiz.js            # Motor de exámenes y revisión automática
│   ├── diagrams.js        # Gráficos SVG, simuladores y quizzes de capítulo
│   └── deep-questions.js  # Interfaz socrática, notas y auto-interrogación
└── README.md
```
