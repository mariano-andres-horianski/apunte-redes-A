(function () {
  'use strict';

  var App = window.RedesApp = window.RedesApp || {};

  var selectedMode = 'all';
  var activeSession = null;
  var timerInterval = null;
  var currentReviewFilter = 'all';
  var lastResults = null;

  function shuffleArray(arr) {
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function formatSeconds(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function getPoolByMode(mode) {
    var all = App.QUIZ_QUESTIONS || [];
    if (mode === 'all') return all.slice();
    if (mode === 'traps') return all.filter(function (q) { return !!q.isTrap; });
    return all.filter(function (q) { return q.unit === mode; });
  }

  function getModeLabel(mode) {
    if (mode === 'all') return 'Simulacro Integral';
    if (mode === 'traps') return 'Trampas de Parcial (9.2)';
    if (mode === 'retry') return 'Reintento de errores';
    return (App.UNITS[mode] ? App.UNITS[mode].short + ' · ' + App.UNITS[mode].title : mode);
  }

  function updateAvailableCount() {
    var el = document.getElementById('quiz-available-count');
    if (!el) return;
    var pool = getPoolByMode(selectedMode);
    el.textContent = pool.length + ' preguntas disponibles para esta selección';
  }

  function renderHistory() {
    var listEl = document.getElementById('quiz-history-list');
    if (!listEl) return;
    var history = App.storage.get('quiz_history', []);
    if (!history.length) {
      listEl.innerHTML = '<p class="muted small">Todavía no entregaste ningún examen.</p>';
      return;
    }

    listEl.innerHTML = history.slice(0, 12).map(function (item) {
      var cls = item.pct >= 85 ? 'text-success' : (item.pct >= 60 ? '' : 'text-danger');
      return (
        '<div class="history-item">' +
          '<div>' +
            '<strong>' + App.escapeHtml(item.label) + '</strong>' +
            '<div class="muted" style="font-size:0.75rem">' + App.escapeHtml(item.date) + ' · ' + item.correct + '/' + item.total + ' · ' + App.escapeHtml(item.duration) + '</div>' +
          '</div>' +
          '<span class="history-score ' + cls + '">' + item.pct + '%</span>' +
        '</div>'
      );
    }).join('');
  }

  function showPanel(panelId) {
    var panels = ['quiz-setup-panel', 'quiz-active-panel', 'quiz-results-panel'];
    panels.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.hidden = (id !== panelId);
    });
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function startTimer() {
    stopTimer();
    var timerEl = document.getElementById('quiz-timer');
    if (timerEl) timerEl.textContent = formatSeconds(activeSession.elapsedSec);
    timerInterval = setInterval(function () {
      if (!activeSession) return;
      activeSession.elapsedSec += 1;
      if (timerEl) timerEl.textContent = formatSeconds(activeSession.elapsedSec);
    }, 1000);
  }

  function prepareQuestions(pool, countVal, shouldShuffle) {
    var list = shouldShuffle ? shuffleArray(pool) : pool.slice();
    if (countVal !== 'all') {
      var n = parseInt(countVal, 10);
      if (!isNaN(n) && n > 0) list = list.slice(0, n);
    }

    return list.map(function (q) {
      var indexedOpts = q.options.map(function (opt, idx) {
        return { text: opt, isCorrect: idx === q.correctIndex };
      });
      if (shouldShuffle) indexedOpts = shuffleArray(indexedOpts);
      var newCorrect = 0;
      indexedOpts.forEach(function (o, idx) {
        if (o.isCorrect) newCorrect = idx;
      });
      return {
        id: q.id,
        unit: q.unit,
        topic: q.topic,
        isTrap: !!q.isTrap,
        question: q.question,
        options: indexedOpts.map(function (o) { return o.text; }),
        correctIndex: newCorrect,
        explanation: q.explanation
      };
    });
  }

  function beginSession(questions, modeLabel) {
    if (!questions.length) return;
    activeSession = {
      label: modeLabel,
      questions: questions,
      answers: new Array(questions.length).fill(null),
      flagged: new Array(questions.length).fill(false),
      currentIndex: 0,
      elapsedSec: 0
    };

    document.getElementById('quiz-active-title').textContent = modeLabel;
    showPanel('quiz-active-panel');
    startTimer();
    renderActiveQuestion();
  }

  function renderActiveQuestion() {
    if (!activeSession) return;
    var qs = activeSession.questions;
    var idx = activeSession.currentIndex;
    var q = qs[idx];
    var total = qs.length;

    var answeredCount = activeSession.answers.filter(function (a) { return a !== null; }).length;
    document.getElementById('quiz-progress-text').textContent = 'Respondidas ' + answeredCount + ' de ' + total;
    document.getElementById('quiz-progress-fill').style.width = Math.round((answeredCount / total) * 100) + '%';

    var unitInfo = App.UNITS[q.unit];
    document.getElementById('quiz-q-unit-badge').textContent = unitInfo ? unitInfo.short : q.unit;
    document.getElementById('quiz-q-topic-badge').textContent = q.topic;
    document.getElementById('quiz-q-trap-badge').hidden = !q.isTrap;

    var flagBtn = document.getElementById('btn-flag-question');
    var isFlagged = activeSession.flagged[idx];
    flagBtn.textContent = isFlagged ? '⚑ Marcada (quitar)' : '⚑ Marcar para revisar';
    flagBtn.classList.toggle('pill-amber', isFlagged);

    document.getElementById('quiz-q-number').textContent = 'Pregunta ' + (idx + 1) + ' de ' + total;
    document.getElementById('quiz-q-text').textContent = q.question;

    var letters = ['A', 'B', 'C', 'D'];
    var chosen = activeSession.answers[idx];
    var optsEl = document.getElementById('quiz-options-list');
    optsEl.innerHTML = q.options.map(function (optText, optIdx) {
      var selectedCls = chosen === optIdx ? ' is-selected' : '';
      return (
        '<button type="button" class="option-btn' + selectedCls + '" data-opt-idx="' + optIdx + '" role="radio" aria-checked="' + (chosen === optIdx) + '">' +
          '<span class="option-letter">' + letters[optIdx] + '</span>' +
          '<span>' + App.escapeHtml(optText) + '</span>' +
        '</button>'
      );
    }).join('');

    document.getElementById('btn-prev-q').disabled = (idx === 0);
    var nextBtn = document.getElementById('btn-next-q');
    nextBtn.disabled = (idx === total - 1);

    renderQuestionGrid();
  }

  function renderQuestionGrid() {
    var gridEl = document.getElementById('quiz-question-grid');
    if (!gridEl || !activeSession) return;

    gridEl.innerHTML = activeSession.questions.map(function (_, i) {
      var classes = ['q-dot'];
      if (i === activeSession.currentIndex) classes.push('is-current');
      if (activeSession.answers[i] !== null) classes.push('is-answered');
      if (activeSession.flagged[i]) classes.push('is-flagged');
      return '<button type="button" class="' + classes.join(' ') + '" data-jump-q="' + i + '">' + (i + 1) + '</button>';
    }).join('');
  }

  function finishAndGrade() {
    if (!activeSession) return;
    stopTimer();

    var qs = activeSession.questions;
    var ans = activeSession.answers;
    var correctCount = 0;
    var unitStats = {};

    var items = qs.map(function (q, i) {
      var userChoice = ans[i];
      var status = userChoice === null ? 'unanswered' : (userChoice === q.correctIndex ? 'correct' : 'wrong');
      if (status === 'correct') correctCount++;

      if (!unitStats[q.unit]) unitStats[q.unit] = { total: 0, correct: 0 };
      unitStats[q.unit].total += 1;
      if (status === 'correct') unitStats[q.unit].correct += 1;

      return {
        index: i,
        question: q,
        userChoice: userChoice,
        status: status
      };
    });

    var pct = Math.round((correctCount / qs.length) * 100);
    var durationStr = formatSeconds(activeSession.elapsedSec);

    lastResults = {
      label: activeSession.label,
      total: qs.length,
      correct: correctCount,
      pct: pct,
      duration: durationStr,
      unitStats: unitStats,
      items: items
    };

    var history = App.storage.get('quiz_history', []);
    var now = new Date();
    var dateStr = now.toLocaleDateString('es-AR') + ' ' + now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    history.unshift({
      label: activeSession.label,
      correct: correctCount,
      total: qs.length,
      pct: pct,
      duration: durationStr,
      date: dateStr
    });
    if (history.length > 25) history = history.slice(0, 25);
    App.storage.set('quiz_history', history);
    App.updateHomeStats();

    activeSession = null;
    currentReviewFilter = 'all';
    renderResults();
    showPanel('quiz-results-panel');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderResults() {
    if (!lastResults) return;

    var badge = document.getElementById('result-verdict-badge');
    if (lastResults.pct >= 85) {
      badge.textContent = 'Excelente dominio';
      badge.className = 'pill pill-green';
    } else if (lastResults.pct >= 60) {
      badge.textContent = 'Aprobado · Buen avance';
      badge.className = 'pill pill-blue';
    } else {
      badge.textContent = 'A reforzar · Revisá las explicaciones';
      badge.className = 'pill pill-red';
    }

    document.getElementById('result-score-pct').textContent = lastResults.pct + '%';
    document.getElementById('result-score-frac').textContent = lastResults.correct + ' / ' + lastResults.total + ' correctas';
    document.getElementById('result-time').textContent = lastResults.duration;

    var wrongCount = lastResults.items.filter(function (it) { return it.status !== 'correct'; }).length;
    var retryBtn = document.getElementById('btn-retry-wrong');
    retryBtn.hidden = (wrongCount === 0);
    retryBtn.textContent = 'Reintentar falladas / sin responder (' + wrongCount + ')';

    var breakdownEl = document.getElementById('result-unit-breakdown');
    breakdownEl.innerHTML = Object.keys(lastResults.unitStats).map(function (uId) {
      var st = lastResults.unitStats[uId];
      var uPct = Math.round((st.correct / st.total) * 100);
      var uLabel = App.UNITS[uId] ? App.UNITS[uId].short : uId;
      return (
        '<div class="breakdown-row">' +
          '<strong>' + App.escapeHtml(uLabel) + '</strong>' +
          '<div class="breakdown-bar"><div class="breakdown-fill" style="width:' + uPct + '%"></div></div>' +
          '<span>' + st.correct + '/' + st.total + ' (' + uPct + '%)</span>' +
        '</div>'
      );
    }).join('');

    var filterBtns = document.querySelectorAll('.review-filter-btn');
    for (var i = 0; i < filterBtns.length; i++) {
      filterBtns[i].classList.toggle('is-active', filterBtns[i].getAttribute('data-filter') === currentReviewFilter);
    }

    renderReviewList();
  }

  function renderReviewList() {
    if (!lastResults) return;
    var listEl = document.getElementById('quiz-review-list');
    var filtered = lastResults.items.filter(function (it) {
      if (currentReviewFilter === 'all') return true;
      return it.status === currentReviewFilter;
    });

    if (!filtered.length) {
      listEl.innerHTML = '<div class="card"><p class="muted">No hay preguntas en esta categoría de filtro.</p></div>';
      return;
    }

    var letters = ['A', 'B', 'C', 'D'];
    listEl.innerHTML = filtered.map(function (it) {
      var q = it.question;
      var unitInfo = App.UNITS[q.unit];
      var statusPill = it.status === 'correct'
        ? '<span class="pill pill-green">Correcta</span>'
        : (it.status === 'wrong' ? '<span class="pill pill-red">Incorrecta</span>' : '<span class="pill pill-amber">Sin responder</span>');

      var optsHtml = q.options.map(function (optText, optIdx) {
        var cls = 'review-opt';
        var tag = '';
        if (optIdx === q.correctIndex) {
          cls += ' opt-correct';
          tag = '✓ Correcta';
        } else if (optIdx === it.userChoice && it.status === 'wrong') {
          cls += ' opt-wrong';
          tag = '✗ Tu respuesta';
        }
        return (
          '<div class="' + cls + '">' +
            '<span><strong>' + letters[optIdx] + '.</strong> ' + App.escapeHtml(optText) + '</span>' +
            (tag ? '<span class="small">' + tag + '</span>' : '') +
          '</div>'
        );
      }).join('');

      return (
        '<article class="card review-card is-' + it.status + '">' +
          '<div class="question-meta-row">' +
            '<div class="badges-group">' +
              '<span class="pill pill-blue">#' + (it.index + 1) + ' · ' + App.escapeHtml(unitInfo ? unitInfo.short : q.unit) + '</span>' +
              '<span class="pill">' + App.escapeHtml(q.topic) + '</span>' +
              (q.isTrap ? '<span class="pill pill-red">Trampa de parcial</span>' : '') +
            '</div>' +
            statusPill +
          '</div>' +
          '<h4>' + App.escapeHtml(q.question) + '</h4>' +
          '<div class="review-options">' + optsHtml + '</div>' +
          '<div class="explanation-box"><strong>Explicación:</strong> ' + App.escapeHtml(q.explanation) + '</div>' +
        '</article>'
      );
    }).join('');
  }

  function startConfiguredQuiz() {
    var pool = getPoolByMode(selectedMode);
    var countVal = document.getElementById('quiz-count-select').value;
    var shouldShuffle = document.getElementById('quiz-shuffle-check').checked;
    var prepared = prepareQuestions(pool, countVal, shouldShuffle);
    beginSession(prepared, getModeLabel(selectedMode));
  }

  App.QuizModule = {
    init: function () {
      updateAvailableCount();
      renderHistory();

      var modeGrid = document.getElementById('quiz-mode-grid');
      if (modeGrid) {
        modeGrid.addEventListener('click', function (e) {
          var btn = e.target.closest('.quiz-mode-option');
          if (!btn) return;
          selectedMode = btn.getAttribute('data-mode');
          var allBtns = modeGrid.querySelectorAll('.quiz-mode-option');
          for (var i = 0; i < allBtns.length; i++) {
            allBtns[i].classList.toggle('is-selected', allBtns[i] === btn);
          }
          updateAvailableCount();
        });
      }

      document.getElementById('btn-start-quiz').addEventListener('click', startConfiguredQuiz);

      document.getElementById('btn-clear-history').addEventListener('click', function () {
        App.storage.remove('quiz_history');
        renderHistory();
        App.updateHomeStats();
      });

      document.getElementById('quiz-options-list').addEventListener('click', function (e) {
        var btn = e.target.closest('.option-btn');
        if (!btn || !activeSession) return;
        var optIdx = parseInt(btn.getAttribute('data-opt-idx'), 10);
        activeSession.answers[activeSession.currentIndex] = optIdx;
        renderActiveQuestion();
      });

      document.getElementById('quiz-question-grid').addEventListener('click', function (e) {
        var dot = e.target.closest('[data-jump-q]');
        if (!dot || !activeSession) return;
        activeSession.currentIndex = parseInt(dot.getAttribute('data-jump-q'), 10);
        renderActiveQuestion();
      });

      document.getElementById('btn-prev-q').addEventListener('click', function () {
        if (!activeSession || activeSession.currentIndex === 0) return;
        activeSession.currentIndex -= 1;
        renderActiveQuestion();
      });

      document.getElementById('btn-next-q').addEventListener('click', function () {
        if (!activeSession || activeSession.currentIndex >= activeSession.questions.length - 1) return;
        activeSession.currentIndex += 1;
        renderActiveQuestion();
      });

      document.getElementById('btn-flag-question').addEventListener('click', function () {
        if (!activeSession) return;
        var i = activeSession.currentIndex;
        activeSession.flagged[i] = !activeSession.flagged[i];
        renderActiveQuestion();
      });

      var confirmModal = document.getElementById('quiz-confirm-modal');
      document.getElementById('btn-submit-quiz').addEventListener('click', function () {
        if (!activeSession) return;
        var unanswered = activeSession.answers.filter(function (a) { return a === null; }).length;
        if (unanswered === 0) {
          finishAndGrade();
        } else {
          document.getElementById('quiz-unanswered-warn').textContent =
            'Todavía tenés ' + unanswered + ' pregunta' + (unanswered === 1 ? '' : 's') + ' sin responder. Las preguntas en blanco contarán como no respondidas.';
          confirmModal.hidden = false;
        }
      });

      document.getElementById('btn-cancel-submit').addEventListener('click', function () {
        confirmModal.hidden = true;
      });

      document.getElementById('btn-confirm-submit').addEventListener('click', function () {
        confirmModal.hidden = true;
        finishAndGrade();
      });

      document.getElementById('quiz-results-panel').addEventListener('click', function (e) {
        var fBtn = e.target.closest('.review-filter-btn');
        if (fBtn) {
          currentReviewFilter = fBtn.getAttribute('data-filter');
          var btns = document.querySelectorAll('.review-filter-btn');
          for (var i = 0; i < btns.length; i++) {
            btns[i].classList.toggle('is-active', btns[i] === fBtn);
          }
          renderReviewList();
        }
      });

      document.getElementById('btn-retry-wrong').addEventListener('click', function () {
        if (!lastResults) return;
        var wrongQs = lastResults.items
          .filter(function (it) { return it.status !== 'correct'; })
          .map(function (it) { return it.question; });
        var prepared = prepareQuestions(wrongQs, 'all', true);
        beginSession(prepared, 'Reintento de errores');
      });

      document.getElementById('btn-new-quiz').addEventListener('click', function () {
        renderHistory();
        showPanel('quiz-setup-panel');
      });
    },

    startQuickQuiz: function (mode) {
      selectedMode = mode;
      var allBtns = document.querySelectorAll('.quiz-mode-option');
      for (var i = 0; i < allBtns.length; i++) {
        allBtns[i].classList.toggle('is-selected', allBtns[i].getAttribute('data-mode') === mode);
      }
      updateAvailableCount();
      var pool = getPoolByMode(mode);
      var prepared = prepareQuestions(pool, pool.length <= 16 ? 'all' : '15', true);
      beginSession(prepared, getModeLabel(mode));
    }
  };
})();
