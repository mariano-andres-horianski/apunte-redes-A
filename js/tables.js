(function () {
  'use strict';

  var App = window.RedesApp = window.RedesApp || {};

  var activeUnit = 'all';
  var searchQuery = '';
  var recallMode = false;

  function render() {
    var root = document.getElementById('tables-root');
    if (!root) return;

    var allTables = App.TABLES_DATA || [];
    var q = searchQuery.trim().toLowerCase();

    var filtered = allTables.filter(function (t) {
      if (activeUnit !== 'all' && t.unit !== activeUnit) return false;
      if (!q) return true;
      var hay = [
        t.code,
        t.title,
        t.caption,
        (t.headers || []).join(' '),
        (t.rows || []).map(function (r) { return r.join(' '); }).join(' ')
      ].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    var unitButtons = [
      { id: 'all', label: 'Todas (' + allTables.length + ')' },
      { id: 'u2', label: 'U2 · MAC' },
      { id: 'u3', label: 'U3 · Ethernet' },
      { id: 'u4', label: 'U4 · Switch/STP/PoE' },
      { id: 'u5', label: 'U5 · Wi-Fi' },
      { id: 'u6', label: 'U6 · Capa de Red' }
    ].map(function (u) {
      return '<button type="button" class="review-filter-btn' + (activeUnit === u.id ? ' is-active' : '') + '" data-tbl-unit="' + u.id + '">' + App.escapeHtml(u.label) + '</button>';
    }).join('');

    var tablesHtml = !filtered.length
      ? '<div class="card"><p class="muted">No hay tablas que coincidan con el filtro.</p></div>'
      : filtered.map(function (t) {
          var unitInfo = App.UNITS[t.unit];
          var headHtml = '<tr>' + (t.headers || []).map(function (h) {
            return '<th>' + App.escapeHtml(h) + '</th>';
          }).join('') + '</tr>';

          var bodyHtml = (t.rows || []).map(function (row) {
            return '<tr>' + row.map(function (cell, idx) {
              if (idx === 0) {
                return '<td><strong>' + App.escapeHtml(cell) + '</strong></td>';
              }
              var cls = recallMode ? ' class="recall-cell is-hidden" data-reveal-cell="1" title="Clic para revelar"' : '';
              return '<td' + cls + '>' + App.escapeHtml(cell) + '</td>';
            }).join('') + '</tr>';
          }).join('');

          return (
            '<article class="card table-ref-card">' +
              '<div class="card-header-row" style="margin-bottom:0.35rem">' +
                '<div>' +
                  '<div class="badges-group">' +
                    '<span class="pill pill-blue">' + App.escapeHtml(unitInfo ? unitInfo.short : t.unit) + '</span>' +
                    '<span class="pill pill-teal">' + App.escapeHtml(t.code) + '</span>' +
                  '</div>' +
                  '<h3>' + App.escapeHtml(t.title) + '</h3>' +
                  '<p class="small muted" style="margin:0">' + App.escapeHtml(t.caption) + '</p>' +
                '</div>' +
              '</div>' +
              '<div class="table-scroll-wrap">' +
                '<table class="table-clean">' +
                  '<thead>' + headHtml + '</thead>' +
                  '<tbody>' + bodyHtml + '</tbody>' +
                '</table>' +
              '</div>' +
            '</article>'
          );
        }).join('');

    root.innerHTML =
      '<div class="view-header">' +
        '<div>' +
          '<span class="pill pill-teal">Sección 11 + Tablas Clave</span>' +
          '<h1>Tablas Comparativas Resumen</h1>' +
          '<p class="muted">Todas las tablas comparativas del apunte reunidas para repaso rápido. Activá el Modo Repaso para ocultar columnas y autoevaluarte.</p>' +
        '</div>' +
        '<button type="button" id="btn-toggle-recall" class="btn ' + (recallMode ? 'btn-teal' : 'btn-outline') + '">' +
          (recallMode ? '👁 Desactivar Modo Repaso' : '🙈 Activar Modo Repaso (ocultar celdas)') +
        '</button>' +
      '</div>' +

      '<div class="card tables-toolbar">' +
        '<div class="tables-toolbar-top">' +
          '<div class="notes-unit-tabs">' + unitButtons + '</div>' +
        '</div>' +
        '<input type="search" id="tables-search-input" class="input" placeholder="Filtrar tablas por palabra clave (ej: Dijkstra, 15,4 W, PPPoE, WEP, 802.11ax...)" value="' + App.escapeHtml(searchQuery) + '">' +
      '</div>' +

      '<div class="tables-grid">' + tablesHtml + '</div>';

    root.querySelectorAll('[data-tbl-unit]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeUnit = this.getAttribute('data-tbl-unit');
        render();
      });
    });

    document.getElementById('btn-toggle-recall').addEventListener('click', function () {
      recallMode = !recallMode;
      render();
    });

    var searchEl = document.getElementById('tables-search-input');
    searchEl.addEventListener('input', function () {
      searchQuery = this.value;
      var pos = this.selectionStart;
      render();
      var nextInput = document.getElementById('tables-search-input');
      if (nextInput) {
        nextInput.focus();
        if (typeof pos === 'number') nextInput.setSelectionRange(pos, pos);
      }
    });

    root.querySelectorAll('[data-reveal-cell]').forEach(function (cell) {
      cell.addEventListener('click', function () {
        this.classList.toggle('is-hidden');
      });
    });
  }

  App.TablesModule = {
    init: function () {
      render();
    },
    render: render
  };
})();
