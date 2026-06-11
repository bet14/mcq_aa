/* quiz.js — shared quiz engine */
(function () {
  const QUIZ_FILE = window.QUIZ_DATA_FILE || 'quiz.json';

  let quizData = null;
  let answered = 0;
  let score = 0;

  async function loadQuiz() {
    const res = await fetch(QUIZ_FILE);
    quizData = await res.json();
    renderQuiz();
  }

  function renderQuiz() {
    document.getElementById('heroTitle').textContent = quizData.title;
    document.getElementById('heroSubtitle').textContent = quizData.subtitle || '';
    document.getElementById('totalText').textContent = quizData.questions.length;

    const area = document.getElementById('quizArea');
    area.innerHTML = '';

    quizData.questions.forEach((q, idx) => {
      const card = document.createElement('div');
      card.className = 'question-card';
      card.id = 'q' + idx;

      const meta = document.createElement('div');
      meta.className = 'question-meta';
      meta.innerHTML =
        '<span class="q-number">Q' + (idx + 1) + '</span>' +
        '<span class="q-category">' + (q.category || '') + '</span>' +
        '<span class="q-level level-' + (q.level || 'Medium').toLowerCase() + '">' + (q.level || 'Medium') + '</span>';

      const text = document.createElement('p');
      text.className = 'question-text';
      text.textContent = q.question;

      const options = document.createElement('div');
      options.className = 'options';

      q.options.forEach((opt, oi) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.dataset.qi = idx;
        btn.dataset.oi = oi;
        btn.addEventListener('click', handleAnswer);
        options.appendChild(btn);
      });

      const expl = document.createElement('div');
      expl.className = 'explanation hidden';
      expl.textContent = q.explanation || '';

      card.appendChild(meta);
      card.appendChild(text);
      card.appendChild(options);
      card.appendChild(expl);
      area.appendChild(card);
    });

    document.getElementById('submitBtn').addEventListener('click', showResults);
    updateStats();
  }

  function handleAnswer(e) {
    const btn = e.currentTarget;
    const qi = parseInt(btn.dataset.qi);
    const oi = parseInt(btn.dataset.oi);
    const card = document.getElementById('q' + qi);

    if (card.classList.contains('locked')) return;
    card.classList.add('locked');

    const correct = quizData.questions[qi].answerIndex;
    const allBtns = card.querySelectorAll('.option-btn');

    allBtns.forEach((b, i) => {
      b.disabled = true;
      if (i === correct) b.classList.add('correct');
      else if (i === oi) b.classList.add('wrong');
    });

    if (oi === correct) score++;
    answered++;

    const expl = card.querySelector('.explanation');
    expl.classList.remove('hidden');

    updateStats();
  }

  function updateStats() {
    document.getElementById('scoreText').textContent = score;
    document.getElementById('answeredText').textContent = answered;
    const total = quizData ? quizData.questions.length : 1;
    const pct = Math.round((answered / total) * 100);
    document.getElementById('progressBar').style.width = pct + '%';
    if (answered === total) {
      document.getElementById('statusText').textContent = 'Complete';
    }
  }

  function showResults() {
    const total = quizData.questions.length;
    const pct = Math.round((score / total) * 100);
    const section = document.getElementById('resultsSection');

    let missed = '';
    quizData.questions.forEach((q, i) => {
      const card = document.getElementById('q' + i);
      if (!card.classList.contains('locked')) return;
      const isCorrect = card.querySelector('.option-btn.correct') &&
        !card.querySelector('.option-btn.wrong');
      if (!isCorrect) {
        missed += '<div class="result-card wrong-summary">' +
          '<strong>Q' + (i + 1) + ':</strong> ' + q.question +
          '<br><em>Correct: </em>' + q.options[q.answerIndex] +
          '<br><small>' + (q.explanation || '') + '</small>' +
          '</div>';
      }
    });

    section.innerHTML =
      '<h2>Results</h2>' +
      '<div class="result-card score-card">' +
        '<span class="big-score">' + score + ' / ' + total + '</span>' +
        '<span class="big-pct">' + pct + '%</span>' +
      '</div>' +
      (missed ? '<h3>Review incorrect answers</h3>' + missed : '<p>All answered questions were correct.</p>');

    section.scrollIntoView({ behavior: 'smooth' });
  }

  loadQuiz();
})();
