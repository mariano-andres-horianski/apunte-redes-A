(function () {
  'use strict';

  var App = window.RedesApp = window.RedesApp || {};

  /* Normalizar guiones Unicode de no separación (\u2011, \u2010, \u2013) al abrir el glosario
     para que todos los chips de data-deep.js encuentren su término sin tocar data-deep.js ni app.js */
  if (typeof App.openGlossary === 'function') {
    var origOpenGlossary = App.openGlossary;
    App.openGlossary = function (searchTerm) {
      var normalized = String(searchTerm || '')
        .replace(/[\u2010\u2011\u2012\u2013\u2014]/g, '-');
      return origOpenGlossary.call(App, normalized);
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (App.NotesModule && App.NotesModule.init) App.NotesModule.init();
    if (App.TablesModule && App.TablesModule.init) App.TablesModule.init();
    if (typeof App.renderDiagramTheory === 'function') App.renderDiagramTheory('map');
    if (typeof App.renderDiagramIntro === 'function') App.renderDiagramIntro('map');

    /* Delegar clics en chips de glosario dentro de las nuevas vistas y diagramas */
    ['notes-root', 'tables-root', 'diagram-stage'].forEach(function (containerId) {
      var el = document.getElementById(containerId);
      if (!el) return;
      el.addEventListener('click', function (e) {
        var chip = e.target.closest('[data-glossary-term]');
        if (chip && typeof App.openGlossary === 'function') {
          App.openGlossary(chip.getAttribute('data-glossary-term'));
        }
      });
    });
  });
})();
