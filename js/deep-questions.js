(function () {
  'use strict';

  var App = window.RedesApp = window.RedesApp || {};

  var CATEGORY_LABELS = {
    porque: '¿Por qué funciona así?',
    quepasaria: '¿Qué pasaría si...?',
    comparacion: 'Comparación crítica',
    escenario: 'Escenario / Cálculo'
  };

  var randomMode = false;
  var currentRandomId = null;

  function getStatusMap() {
    return App.storage.get('deep_status', {});
  }

  function getNotesMap() {
    return App.storage.get('deep_notes', {});
  }

  function updateProgress() {
    var list = App.DEEP_QUESTIONS || [];
    var statusMap = getStatusMap();
    var mastered = 0;
    var doubt = 0;
    var pending = 0;

    list.forEach(function (q) {
      var st = statusMap[q.id] || 'pending';
      if (st === 'mastered') mastered++;
      else if (st === 'doubt') doubt++;
      else pending++;
    });

    document.getElementById('deep-stat-mastered').textContent = String(mastered);
    document.getElementById('deep-stat-doubt').textContent = String(doubt);
    document.getElementById('deep-stat-pending').textContent = String(pending);

    var pct = list.length ? Math.round((mastered / list.length) * 100) : 0;
    document.getElementById('deep-progress-fill').style.width = pct + '%';
    App.updateHomeStats();
  }

  function buildCardHtml(q, status, note) {
    var unitInfo = App.UNITS[q.unit];
    var catLabel = CATEGORY_LABELS[q.category] || q.category;

    var keyPointsHtml = q.keyPoints.map(function (kp) {
      return '<li>' + App.escapeHtml(kp) + '</li>';
    }).join('');

    var termsHtml = (q.relatedTerms || []).map(function (t) {
      return '<button type="button" class="term-chip" data-glossary-term="' + App.escapeHtml(t) + '">' + App.escapeHtml(t) + '</button>';
    }).join('');

    return (
      '<article class="card deep-card status-' + status + '" data-dq-id="' + App.escapeHtml(q.id) + '">' +
        '<div class="deep-card-top">' +
          '<div class="badges-group">' +
            '<span class="pill pill-blue">' + App.escapeHtml(unitInfo ? unitInfo.short : q.unit) + '</span>' +
            '<span class="pill pill-violet">' + App.escapeHtml(catLabel) + '</span>' +
            '<span class="pill">' + App.escapeHtml(q.title) + '</span>' +
          '</div>' +
          '<div class="deep-status-btns">' +
            '<button type="button" class="status-btn' + (status === 'pending' ? ' is-active' : '') + '" data-set-status="pending" data-status="pending">Repasar</button>' +
            '<button type="button" class="status-btn' + (status === 'doubt' ? ' is-active' : '') + '" data-set-status="doubt" data-status="doubt">Dudosa</button>' +
            '<button type="button" class="status-btn' + (status === 'mastered' ? ' is-active' : '') + '" data-set-status="mastered" data-status="mastered">Dominada</button>' +
          '</div>' +
        '</div>' +
        '<h3>' + App.escapeHtml(q.question) + '</h3>' +
        '<textarea class="deep-notes-area" data-note-for="' + App.escapeHtml(q.id) + '" placeholder="Escribí acá tu explicación o esquema mental antes de abrir las claves (se guarda automático)...">' + App.escapeHtml(note || '') + '</textarea>' +
        '<div class="deep-card-controls">' +
          '<div class="deep-toggle-btns">' +
            '<button type="button" class="btn btn-outline btn-sm" data-toggle-drawer="hint">Ver pista</button>' +
            '<button type="button" class="btn btn-violet btn-sm" data-toggle-drawer="keys">Ver claves de respuesta</button>' +
          '</div>' +
        '</div>' +
        '<div class="deep-drawer" data-drawer="hint" hidden>' +
          '<strong>Pista de razonamiento:</strong> ' + App.escapeHtml(q.hint) +
        '</div>' +
        '<div class="deep-drawer" data-drawer="keys" hidden>' +
          '<strong>Puntos clave que debería cubrir tu respuesta:</strong>' +
          '<ul>' + keyPointsHtml + '</ul>' +
        '</div>' +
        (termsHtml ? '<div class="terms-row"><span class="small muted">Glosario:</span>' + termsHtml + '</div>' : '') +
      '</article>'
    );
  }

  function renderList() {
    var listEl = document.getElementById('deep-cards-list');
    if (!listEl) return;

    var unitFilter = document.getElementById('deep-filter-unit').value;
    var catFilter = document.getElementById('deep-filter-category').value;
    var statusFilter = document.getElementById('deep-filter-status').value;
    var search = document.getElementById('deep-search-input').value.trim().toLowerCase();

    var statusMap = getStatusMap();
    var notesMap = getNotesMap();

    var filtered = (App.DEEP_QUESTIONS || []).filter(function (q) {
      var st = statusMap[q.id] || 'pending';
      if (unitFilter !== 'all' && q.unit !== unitFilter) return false;
      if (catFilter !== 'all' && q.category !== catFilter) return false;
      if (statusFilter !== 'all' && st !== statusFilter) return false;
      if (search) {
        var hay = (q.title + ' ' + q.question + ' ' + q.hint + ' ' + q.keyPoints.join(' ')).toLowerCase();
        if (hay.indexOf(search) === -1) return false;
      }
      return true;
    });

    if (!filtered.length) {
      listEl.innerHTML = '<div class="card"><p class="muted">No hay preguntas que coincidan con los filtros elegidos.</p></div>';
      return;
    }

    listEl.innerHTML = filtered.map(function (q) {
      return buildCardHtml(q, statusMap[q.id] || 'pending', notesMap[q.id] || '');
    }).join('');
  }

  function pickRandomQuestion() {
    var list = App.DEEP_QUESTIONS || [];
    var statusMap = getStatusMap();
    var candidates = list.filter(function (q) {
      var st = statusMap[q.id] || 'pending';
      return st !== 'mastered' && q.id !== currentRandomId;
    });
    if (!candidates.length) {
      candidates = list.filter(function (q) { return q.id !== currentRandomId; });
    }
    if (!candidates.length) candidates = list;

    var chosen = candidates[Math.floor(Math.random() * candidates.length)];
    currentRandomId = chosen ? chosen.id : null;
    renderRandomCard();
  }

  function renderRandomCard() {
    var target = document.getElementById('deep-random-card');
    if (!target || !currentRandomId) return;
    var q = (App.DEEP_QUESTIONS || []).find(function (item) { return item.id === currentRandomId; });
    if (!q) return;
    var statusMap = getStatusMap();
    var notesMap = getNotesMap();
    target.innerHTML = buildCardHtml(q, statusMap[q.id] || 'pending', notesMap[q.id] || '');
  }

  function handleContainerClick(e) {
    var toggleBtn = e.target.closest('[data-toggle-drawer]');
    if (toggleBtn) {
      var card = toggleBtn.closest('.deep-card');
      var kind = toggleBtn.getAttribute('data-toggle-drawer');
      var drawer = card.querySelector('[data-drawer="' + kind + '"]');
      if (drawer) {
        drawer.hidden = !drawer.hidden;
      }
      return;
    }

    var statusBtn = e.target.closest('[data-set-status]');
    if (statusBtn) {
      var cardEl = statusBtn.closest('.deep-card');
      var qId = cardEl.getAttribute('data-dq-id');
      var newStatus = statusBtn.getAttribute('data-set-status');

      var map = getStatusMap();
      map[qId] = newStatus;
      App.storage.set('deep_status', map);

      cardEl.classList.remove('status-pending', 'status-doubt', 'status-mastered');
      cardEl.classList.add('status-' + newStatus);
      var allBtns = cardEl.querySelectorAll('.status-btn');
      for (var i = 0; i < allBtns.length; i++) {
        allBtns[i].classList.toggle('is-active', allBtns[i].getAttribute('data-set-status') === newStatus);
      }
      updateProgress();
      return;
    }

    var chip = e.target.closest('[data-glossary-term]');
    if (chip) {
      App.openGlossary(chip.getAttribute('data-glossary-term'));
    }
  }

  function handleNotesInput(e) {
    var area = e.target.closest('[data-note-for]');
    if (!area) return;
    var qId = area.getAttribute('data-note-for');
    var notes = getNotesMap();
    notes[qId] = area.value;
    App.storage.set('deep_notes', notes);
  }

  App.DeepModule = {
    init: function () {
      updateProgress();
      renderList();

      ['deep-filter-unit', 'deep-filter-category', 'deep-filter-status'].forEach(function (id) {
        document.getElementById(id).addEventListener('change', renderList);
      });
      document.getElementById('deep-search-input').addEventListener('input', renderList);

      var listEl = document.getElementById('deep-cards-list');
      var randomCardEl = document.getElementById('deep-random-card');

      listEl.addEventListener('click', handleContainerClick);
      listEl.addEventListener('input', handleNotesInput);
      randomCardEl.addEventListener('click', handleContainerClick);
      randomCardEl.addEventListener('input', handleNotesInput);

      document.getElementById('btn-deep-random').addEventListener('click', function () {
        randomMode = true;
        document.getElementById('deep-random-panel').hidden = false;
        document.getElementById('deep-filters-bar').hidden = true;
        document.getElementById('deep-cards-list').hidden = true;
        pickRandomQuestion();
      });

      document.getElementById('btn-next-random').addEventListener('click', pickRandomQuestion);

      document.getElementById('btn-exit-random').addEventListener('click', function () {
        randomMode = false;
        document.getElementById('deep-random-panel').hidden = true;
        document.getElementById('deep-filters-bar').hidden = false;
        document.getElementById('deep-cards-list').hidden = false;
        renderList();
      });
    },

    setUnitFilter: function (unit) {
      if (randomMode) {
        document.getElementById('btn-exit-random').click();
      }
      document.getElementById('deep-filter-unit').value = unit;
      document.getElementById('deep-filter-category').value = 'all';
      document.getElementById('deep-filter-status').value = 'all';
      document.getElementById('deep-search-input').value = '';
      renderList();
    }
  };
})();
