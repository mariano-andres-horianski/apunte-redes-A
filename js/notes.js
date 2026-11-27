(function () {
  'use strict';

  var App = window.RedesApp = window.RedesApp || {};

  var activeUnit = 'all';
  var searchQuery = '';
  var expandedMap = {};

  function getReadMap() {
    return App.storage.get('notes_read', {});
  }

  function render() {
    var root = document.getElementById('notes-root');
    if (!root) return;

    var allNotes = App.NOTES_DATA || [];
    var readMap = getReadMap();
    var readCount = allNotes.filter(function (n) { return !!readMap[n.id]; }).length;
    var pct = allNotes.length ? Math.round((readCount / allNotes.length) * 100) : 0;

    var q = searchQuery.trim().toLowerCase();
    var filtered = allNotes.filter(function (n) {
      if (activeUnit !== 'all' && n.unit !== activeUnit) return false;
      if (!q) return true;
      var hay = [
        n.section,
        n.title,
        n.summary,
        (n.bullets || []).join(' '),
        (n.formulas || []).join(' '),
        n.trap || ''
      ].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    var unitButtons = [
      { id: 'all', label: 'Todas las unidades' },
      { id: 'u2', label: 'U2 · MAC' },
      { id: 'u3', label: 'U3 · Ethernet' },
      { id: 'u4', label: 'U4 · Switch/STP' },
      { id: 'u5', label: 'U5 · Wi-Fi' },
      { id: 'u6', label: 'U6 · Capa de Red' }
    ].map(function (u) {
      return '<button type="button" class="review-filter-btn' + (activeUnit === u.id ? ' is-active' : '') + '" data-notes-unit="' + u.id + '">' + App.escapeHtml(u.label) + '</button>';
    }).join('');

    var cardsHtml = !filtered.length
      ? '<div class="card"><p class="muted">No se encontraron secciones del apunte que coincidan con la búsqueda.</p></div>'
      : filtered.map(function (n) {
          var isRead = !!readMap[n.id];
          var isExpanded = expandedMap[n.id] !== false;
          var unitInfo = App.UNITS[n.unit];

          var bulletsHtml = (n.bullets || []).map(function (b) {
            return '<li>' + App.escapeHtml(b) + '</li>';
          }).join('');

          var formulasHtml = (n.formulas && n.formulas.length)
            ? '<div class="note-callout callout-formula"><strong>Fórmulas y valores clave</strong><ul style="margin:0.25rem 0 0;padding-left:1.1rem">' +
                n.formulas.map(function (f) { return '<li><code>' + App.escapeHtml(f) + '</code></li>'; }).join('') +
              '</ul></div>'
            : '';

          var trapHtml = n.trap
            ? '<div class="note-callout callout-trap"><strong>Trampa típica de parcial</strong>' + App.escapeHtml(n.trap) + '</div>'
            : '';

          var termsHtml = (n.terms || []).map(function (t) {
            return '<button type="button" class="term-chip" data-glossary-term="' + App.escapeHtml(t) + '">' + App.escapeHtml(t) + '</button>';
          }).join('');

          return (
            '<article class="card note-section-card' + (isRead ? ' is-read' : '') + '" data-note-id="' + App.escapeHtml(n.id) + '">' +
              '<div class="note-section-header" data-toggle-note="' + App.escapeHtml(n.id) + '">' +
                '<div class="note-section-title-wrap">' +
                  '<span class="pill pill-blue">' + App.escapeHtml(unitInfo ? unitInfo.short : n.unit) + ' · ' + App.escapeHtml(n.section) + '</span>' +
                  '<h3>' + App.escapeHtml(n.title) + '</h3>' +
                '</div>' +
                '<div class="note-header-actions">' +
                  '<button type="button" class="note-read-btn' + (isRead ? ' is-read' : '') + '" data-mark-read="' + App.escapeHtml(n.id) + '">' +
                    (isRead ? '✓ Leído' : 'Marcar leído') +
                  '</button>' +
                  '<span class="pill">' + (isExpanded ? '▾' : '▸') + '</span>' +
                '</div>' +
              '</div>' +
              '<div class="note-section-body"' + (isExpanded ? '' : ' hidden') + '>' +
                '<p class="note-summary">' + App.escapeHtml(n.summary) + '</p>' +
                '<ul class="feature-list" style="margin-bottom:0.85rem">' + bulletsHtml + '</ul>' +
                ((formulasHtml || trapHtml) ? '<div class="note-subsection-grid">' + formulasHtml + trapHtml + '</div>' : '') +
                '<div class="note-actions-row">' +
                  '<div class="terms-row" style="margin-top:0"><span class="small muted">Glosario:</span>' + termsHtml + '</div>' +
                  '<div class="mode-card-actions">' +
                    (n.diagramTab ? '<button type="button" class="btn btn-teal btn-xs" data-unit-diagram="' + App.escapeHtml(n.diagramTab) + '">Ir al simulador</button>' : '') +
                    '<button type="button" class="btn btn-outline btn-xs" data-unit-quiz="' + App.escapeHtml(n.unit) + '">Practicar examen</button>' +
                    '<button type="button" class="btn btn-outline btn-xs" data-unit-deep="' + App.escapeHtml(n.unit) + '">Profundas</button>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</article>'
          );
        }).join('');

    root.innerHTML =
      '<div class="view-header">' +
        '<div>' +
          '<span class="pill pill-primary">Lectura Integral · RedResumen.md</span>' +
          '<h1>Apunte Completo de Estudio</h1>' +
          '<p class="muted">Desarrollo completo de las Unidades 2 a 6 incluyendo historia, fórmulas, ampliaciones de Tanenbaum/Stallings y alertas de parcial.</p>' +
        '</div>' +
      '</div>' +

      '<div class="card notes-progress-bar">' +
        '<div class="notes-progress-meta">' +
          '<span>Progreso de lectura del apunte: <strong>' + readCount + ' / ' + allNotes.length + '</strong> bloques (' + pct + '%)</span>' +
          '<button type="button" id="btn-notes-to-tables" class="btn btn-outline btn-xs">Ir a Tablas Resumen</button>' +
        '</div>' +
        '<div class="progress-bar-track" style="margin-bottom:0"><div class="progress-bar-fill" style="width:' + pct + '%"></div></div>' +
      '</div>' +

      '<div class="card notes-toolbar">' +
        '<div class="notes-toolbar-top">' +
          '<div class="notes-unit-tabs">' + unitButtons + '</div>' +
        '</div>' +
        '<div class="notes-search-row">' +
          '<input type="search" id="notes-search-input" class="input" placeholder="Buscar cualquier concepto del apunte (ej: 4 repetidores, DF=1, ESP32-C6, cuenta regresiva...)" value="' + App.escapeHtml(searchQuery) + '">' +
          '<button type="button" id="btn-notes-expand-all" class="btn btn-outline btn-sm">Expandir todo</button>' +
          '<button type="button" id="btn-notes-collapse-all" class="btn btn-outline btn-sm">Colapsar todo</button>' +
        '</div>' +
      '</div>' +

      '<div class="notes-list">' + cardsHtml + '</div>';

    root.querySelectorAll('[data-notes-unit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeUnit = this.getAttribute('data-notes-unit');
        render();
      });
    });

    var searchEl = document.getElementById('notes-search-input');
    searchEl.addEventListener('input', function () {
      searchQuery = this.value;
      var pos = this.selectionStart;
      render();
      var nextInput = document.getElementById('notes-search-input');
      if (nextInput) {
        nextInput.focus();
        if (typeof pos === 'number') nextInput.setSelectionRange(pos, pos);
      }
    });

    document.getElementById('btn-notes-expand-all').addEventListener('click', function () {
      allNotes.forEach(function (n) { expandedMap[n.id] = true; });
      render();
    });

    document.getElementById('btn-notes-collapse-all').addEventListener('click', function () {
      allNotes.forEach(function (n) { expandedMap[n.id] = false; });
      render();
    });

    document.getElementById('btn-notes-to-tables').addEventListener('click', function () {
      App.navigate('tables');
    });

    root.querySelectorAll('[data-mark-read]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = this.getAttribute('data-mark-read');
        var map = getReadMap();
        map[id] = !map[id];
        App.storage.set('notes_read', map);
        render();
      });
    });

    root.querySelectorAll('[data-toggle-note]').forEach(function (hdr) {
      hdr.addEventListener('click', function () {
        var id = this.getAttribute('data-toggle-note');
        expandedMap[id] = expandedMap[id] === false;
        render();
      });
    });
  }

  App.NotesModule = {
    init: function () {
      render();
    },
    render: render
  };
})();
