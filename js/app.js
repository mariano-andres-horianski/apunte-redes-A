(function () {
  'use strict';

  var App = window.RedesApp = window.RedesApp || {};

  App.UNITS = {
    u2: {
      id: 'u2',
      short: 'Unidad 2',
      title: 'Subcapa MAC y acceso aleatorio',
      summary: 'ALOHA puro y ranurado, CSMA, CSMA/CD (2τ, 64 B, backoff), terminales ocultas/expuestas y CSMA/CA.',
      diagramTab: 'mac'
    },
    u3: {
      id: 'u3',
      short: 'Unidad 3',
      title: 'Ethernet (IEEE 802.3)',
      summary: 'De DIX a 800G, capas PHY y codificaciones, trama Ethernet (64–1518 B, 802.1Q), MAC 48b y duplex mismatch.',
      diagramTab: 'ethernet'
    },
    u4: {
      id: 'u4',
      short: 'Unidad 4',
      title: 'Conmutación, STP y PoE',
      summary: 'Hub vs switch vs router vs AP, tabla MAC y aprendizaje, store-and-forward, STP 802.1D, VLAN y PoE.',
      diagramTab: 'switching'
    },
    u5: {
      id: 'u5',
      short: 'Unidad 5',
      title: 'Redes inalámbricas (802.11)',
      summary: 'Canales 1/6/11 y DFS, dBm, OFDM/MIMO/OFDMA, DCF/EDCA, trama de 4 direcciones y WPA2/WPA3.',
      diagramTab: 'wifi'
    },
    u6: {
      id: 'u6',
      short: 'Unidad 6',
      title: 'Capa de red (IPv4 e IPv6)',
      summary: 'Datagramas vs VC, cabecera IPv4/IPv6, CIDR/subnetting, router, ARP, DHCP, ICMP, NAT y enrutamiento.',
      diagramTab: 'network'
    }
  };

  App.storage = {
    get: function (key, fallback) {
      try {
        var raw = window.localStorage.getItem('redes_app_' + key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        window.localStorage.setItem('redes_app_' + key, JSON.stringify(value));
      } catch (e) {
        /* Ignorar si el navegador bloquea storage bajo file:// */
      }
    },
    remove: function (key) {
      try {
        window.localStorage.removeItem('redes_app_' + key);
      } catch (e) {
        /* no-op */
      }
    }
  };

  App.escapeHtml = function (str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  var currentView = 'home';
  var currentGlossaryGroup = 'all';

  App.navigate = function (viewName, options) {
    options = options || {};
    currentView = viewName;

    var views = document.querySelectorAll('.view');
    for (var i = 0; i < views.length; i++) {
      views[i].classList.toggle('is-active', views[i].id === 'view-' + viewName);
    }

    var navBtns = document.querySelectorAll('.nav-btn');
    for (var j = 0; j < navBtns.length; j++) {
      navBtns[j].classList.toggle('is-active', navBtns[j].getAttribute('data-view') === viewName);
    }

    if (viewName === 'home') {
      App.updateHomeStats();
    } else if (viewName === 'quiz' && options.quickMode && App.QuizModule) {
      App.QuizModule.startQuickQuiz(options.quickMode);
    } else if (viewName === 'diagrams' && options.tab && App.DiagramsModule) {
      App.DiagramsModule.setTab(options.tab);
    } else if (viewName === 'deep' && options.unit && App.DeepModule) {
      App.DeepModule.setUnitFilter(options.unit);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  App.updateHomeStats = function () {
    var history = App.storage.get('quiz_history', []);
    var examsEl = document.getElementById('stat-exams-count');
    var avgEl = document.getElementById('stat-avg-score');
    var deepEl = document.getElementById('stat-deep-mastered');
    var glossaryEl = document.getElementById('stat-glossary-count');

    if (examsEl) examsEl.textContent = String(history.length);
    if (avgEl) {
      if (!history.length) {
        avgEl.textContent = '—';
      } else {
        var sum = history.reduce(function (acc, item) { return acc + item.pct; }, 0);
        avgEl.textContent = Math.round(sum / history.length) + '%';
      }
    }

    var deepStatus = App.storage.get('deep_status', {});
    var totalDeep = (App.DEEP_QUESTIONS || []).length;
    var mastered = 0;
    Object.keys(deepStatus).forEach(function (k) {
      if (deepStatus[k] === 'mastered') mastered++;
    });
    if (deepEl) deepEl.textContent = mastered + ' / ' + totalDeep;

    var glossaryTotal = (App.GLOSSARY_TERMS || []).length;
    if (glossaryEl) glossaryEl.textContent = String(glossaryTotal);
  };

  function renderHomeUnits() {
    var container = document.getElementById('home-units-grid');
    if (!container) return;

    var quizList = App.QUIZ_QUESTIONS || [];
    var deepList = App.DEEP_QUESTIONS || [];

    var html = Object.keys(App.UNITS).map(function (unitId) {
      var u = App.UNITS[unitId];
      var qCount = quizList.filter(function (q) { return q.unit === unitId; }).length;
      var dCount = deepList.filter(function (d) { return d.unit === unitId; }).length;

      return (
        '<article class="unit-card">' +
          '<div>' +
            '<span class="pill pill-primary">' + App.escapeHtml(u.short) + '</span>' +
            '<h4>' + App.escapeHtml(u.title) + '</h4>' +
            '<p>' + App.escapeHtml(u.summary) + '</p>' +
          '</div>' +
          '<div class="unit-card-actions">' +
            '<button type="button" class="btn btn-outline btn-xs" data-unit-quiz="' + unitId + '">Examen (' + qCount + ')</button>' +
            '<button type="button" class="btn btn-outline btn-xs" data-unit-diagram="' + u.diagramTab + '">Gráficos</button>' +
            '<button type="button" class="btn btn-outline btn-xs" data-unit-deep="' + unitId + '">Profundas (' + dCount + ')</button>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    container.innerHTML = html;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    App.storage.set('theme', theme);
  }

  function initTheme() {
    var saved = App.storage.get('theme', 'light');
    applyTheme(saved === 'dark' ? 'dark' : 'light');

    var btn = document.getElementById('btn-toggle-theme');
    if (btn) {
      btn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }
  }

  function renderGlossary() {
    var listEl = document.getElementById('glossary-list');
    var countEl = document.getElementById('glossary-count-badge');
    var searchInput = document.getElementById('glossary-search-input');
    if (!listEl) return;

    var query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    var terms = (App.GLOSSARY_TERMS || []).filter(function (item) {
      var groupOk = currentGlossaryGroup === 'all' || item.group === currentGlossaryGroup;
      if (!groupOk) return false;
      if (!query) return true;
      return (
        item.term.toLowerCase().indexOf(query) !== -1 ||
        item.definition.toLowerCase().indexOf(query) !== -1
      );
    });

    if (countEl) {
      countEl.textContent = terms.length + ' término' + (terms.length === 1 ? '' : 's');
    }

    if (!terms.length) {
      listEl.innerHTML = '<p class="muted">No se encontraron términos que coincidan con la búsqueda.</p>';
      return;
    }

    var groupLabels = {
      mac: 'MAC',
      ethernet: 'Ethernet / Switch',
      wifi: 'Wi-Fi 802.11',
      red: 'Capa de Red'
    };

    listEl.innerHTML = terms.map(function (item) {
      return (
        '<div class="glossary-item">' +
          '<div class="glossary-item-head">' +
            '<strong>' + App.escapeHtml(item.term) + '</strong>' +
            '<span class="pill">' + App.escapeHtml(groupLabels[item.group] || item.group) + '</span>' +
          '</div>' +
          '<div class="small muted">' + App.escapeHtml(item.definition) + '</div>' +
        '</div>'
      );
    }).join('');
  }

  App.openGlossary = function (searchTerm) {
    var modal = document.getElementById('glossary-modal');
    var searchInput = document.getElementById('glossary-search-input');
    if (!modal) return;

    currentGlossaryGroup = 'all';
    var groupBtns = document.querySelectorAll('.glossary-group-btn');
    for (var i = 0; i < groupBtns.length; i++) {
      groupBtns[i].classList.toggle('is-active', groupBtns[i].getAttribute('data-group') === 'all');
    }

    if (searchInput) {
      searchInput.value = searchTerm || '';
    }
    renderGlossary();
    modal.hidden = false;
    if (searchInput) searchInput.focus();
  };

  function initGlossary() {
    var modal = document.getElementById('glossary-modal');
    var openBtn = document.getElementById('btn-open-glossary');
    var closeBtn = document.getElementById('btn-close-glossary');
    var searchInput = document.getElementById('glossary-search-input');

    if (openBtn) {
      openBtn.addEventListener('click', function () { App.openGlossary(''); });
    }
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', function () { modal.hidden = true; });
    }
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) modal.hidden = true;
      });
    }
    if (searchInput) {
      searchInput.addEventListener('input', renderGlossary);
    }

    var groupBtns = document.querySelectorAll('.glossary-group-btn');
    for (var i = 0; i < groupBtns.length; i++) {
      groupBtns[i].addEventListener('click', function () {
        currentGlossaryGroup = this.getAttribute('data-group');
        for (var j = 0; j < groupBtns.length; j++) {
          groupBtns[j].classList.toggle('is-active', groupBtns[j] === this);
        }
        renderGlossary();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && !modal.hidden) {
        modal.hidden = true;
      }
    });
  }

  function bindGlobalNavigation() {
    var brand = document.getElementById('btn-brand');
    if (brand) {
      brand.addEventListener('click', function () { App.navigate('home'); });
    }

    document.addEventListener('click', function (e) {
      var navBtn = e.target.closest('.nav-btn');
      if (navBtn) {
        App.navigate(navBtn.getAttribute('data-view'));
        return;
      }

      var gotoBtn = e.target.closest('[data-goto-view]');
      if (gotoBtn) {
        App.navigate(gotoBtn.getAttribute('data-goto-view'));
        return;
      }

      var quickQuizBtn = e.target.closest('[data-quick-quiz]');
      if (quickQuizBtn) {
        App.navigate('quiz', { quickMode: quickQuizBtn.getAttribute('data-quick-quiz') });
        return;
      }

      var unitQuizBtn = e.target.closest('[data-unit-quiz]');
      if (unitQuizBtn) {
        App.navigate('quiz', { quickMode: unitQuizBtn.getAttribute('data-unit-quiz') });
        return;
      }

      var unitDiagBtn = e.target.closest('[data-unit-diagram]');
      if (unitDiagBtn) {
        App.navigate('diagrams', { tab: unitDiagBtn.getAttribute('data-unit-diagram') });
        return;
      }

      var unitDeepBtn = e.target.closest('[data-unit-deep]');
      if (unitDeepBtn) {
        App.navigate('deep', { unit: unitDeepBtn.getAttribute('data-unit-deep') });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initGlossary();
    bindGlobalNavigation();
    renderHomeUnits();

    if (App.QuizModule && App.QuizModule.init) App.QuizModule.init();
    if (App.DiagramsModule && App.DiagramsModule.init) App.DiagramsModule.init();
    if (App.DeepModule && App.DeepModule.init) App.DeepModule.init();

    App.updateHomeStats();
  });
})();
