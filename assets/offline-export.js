/* Offline game exports. Only the selected questions, display names and play settings leave the app. */
(function () {
  'use strict';
  const games = Object.freeze({
    'keo-co-kien': { title: 'Kéo co / Đua thuyền', icon: '⛵', kind: 'duel' },
    'quizz-nghieng-dau': { title: 'Nghiêng đầu', icon: '↔️', kind: 'quiz' },
    'quet-the-qr': { title: 'Quét thẻ QR', icon: '🔠', kind: 'class' },
    'ngon-tay-than-ky': { title: 'Ngón tay thần kỳ', icon: '🖐️', kind: 'duel' },
    'space-race': { title: 'Phi thuyền vũ trụ', icon: '🚀', kind: 'duel' },
    millionaire: { title: 'Ai là học bá', icon: '💎', kind: 'ladder' },
    'mine-expert': { title: 'Chuyên gia gỡ mìn', icon: '🧨', kind: 'mine' },
    'phi-thuyen': { title: 'Phi thuyền', icon: '🛸', kind: 'embedded' },
    'may-gap': { title: 'Máy gắp thú', icon: '🧸', kind: 'embedded' },
    'cau-ca': { title: 'Câu cá vàng', icon: '🎣', kind: 'embedded' },
    'long-cau': { title: 'Lồng cầu may mắn', icon: '🎱', kind: 'embedded' },
    'den-pin': { title: 'Đèn pin', icon: '🔦', kind: 'embedded' },
    'the-do': { title: 'Thẻ đỏ', icon: '⚽', kind: 'embedded' },
    'cun-con': { title: 'Cún con náo loạn', icon: '🐕', kind: 'embedded' },
    wheel: { title: 'Vòng quay gọi tên', icon: '🎡', kind: 'wheel' },
    stage: { title: 'Sân khấu ngẫu nhiên', icon: '🎭', kind: 'stage' },
    duck: { title: 'Đua vịt', icon: '🦆', kind: 'duck' }
  });
  let pending = null;
  let busy = false;
  let pptLibrary = null;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const jsonForHtml = data => JSON.stringify(data).replace(/</g, () => String.fromCharCode(92) + 'u003c');
  function filename(data, extension) {
    return data.title.normalize('NFD').replace(/đ/gi, 'd').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') + '-offline.' + extension;
  }
  function saveBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  function shuffled(values) {
    const copy = values.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const buffer = new Uint32Array(1);
      crypto.getRandomValues(buffer);
      const j = Math.floor(buffer[0] / 4294967296 * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
  function normalizeExport(id, raw) {
    const meta = games[id];
    if (!meta) throw new Error('Mục tải xuống không hợp lệ.');
    const names = (raw.names || []).map(String).filter(name => name.trim());
    const settings = raw.settings || {};
    const data = {
      version: 1, id, kind: meta.kind, title: meta.title, icon: meta.icon,
      subtitle: String(settings.title || '').slice(0, 300),
      names, teams: (raw.teams || []).map(String).slice(0, 2),
      settings: {
        duration: Math.max(1, Math.min(30, Number(settings.duration) || 5)),
        shuffleQuestions: settings.questionOrder === 'random' || settings.shuffleQuestions === true,
        shuffleAnswers: settings.shuffleAnswers === true || settings.dontShuffleAnswers === false,
        sound: settings.soundEnabled !== false,
        target: Math.max(1, Number(settings.pointsToWin || settings.starsToWin || settings.questionsPerPlayer) || 5)
      },
      questions: []
    };
    if (['wheel', 'stage', 'duck','embedded'].includes(data.kind)) {
      if (!names.length) throw new Error('Danh sách đang trống. Hãy thêm học sinh hoặc nhóm trước khi tải.');
    } else {
      if (!Array.isArray(raw.questions) || !raw.questions.length) throw new Error('Bộ câu hỏi đang trống. Hãy thêm câu hỏi hoặc chọn nguồn Thư viện.');
      data.questions = raw.questions.map((q, i) => {
        const options = (q.options || []).map(o => ({ text: String(o.text || '').trim(), isCorrect: o.isCorrect === true }));
        if (!q.text?.trim() || options.length < 2 || options.length > 4 || options.some(o => !o.text) || options.filter(o => o.isCorrect).length !== 1) {
          throw new Error('Câu ' + (i + 1) + ' cần nội dung, 2–4 đáp án và đúng một đáp án đúng. Hãy sửa trước khi tải.');
        }
        return { text: String(q.text).trim(), options };
      });
      if (data.kind === 'class' && !names.length) throw new Error('Chưa có học sinh trong danh sách để ghi nhận đáp án.');
    }
    return data;
  }
  window.offlineDownloadButtons = function (ids) {
    return '<div class="flex flex-wrap gap-2 my-3" aria-label="Tải từng mục chơi offline">' + ids.map(id => {
      const game = games[id];
      return '<button type="button" onclick="openOfflineExport(\'' + id + '\')" class="px-3 py-2 bg-white text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-50">' + game.icon + ' Tải ' + escape(game.title) + '</button>';
    }).join('') + '</div>';
  };
  window.closeOfflineExport = function () {
    if (busy) return;
    document.getElementById('offline-export-dialog')?.remove();
    pending = null;
  };
  window.openOfflineExport = function (id) {
    if (!games[id] || busy) return;
    document.getElementById('offline-export-dialog')?.remove();
    pending = id;
    const naming = ['wheel', 'stage', 'duck','embedded'].includes(games[id].kind);
    const dialog = document.createElement('div');
    dialog.id = 'offline-export-dialog';
    dialog.className = 'fixed inset-0 z-[9999] bg-slate-900/70 flex items-center justify-center p-4';
    dialog.innerHTML = '<section role="dialog" aria-modal="true" aria-labelledby="offline-export-title" class="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl">' +
      '<h2 id="offline-export-title" class="text-xl font-black text-indigo-950">' + escape(games[id].title) + ' · Tải xuống</h2>' +
      '<p class="mt-3 text-sm text-slate-700">HTML là bản chơi độc lập bằng trình duyệt khi mất mạng. PowerPoint là bản chuyển thể dùng câu hỏi và thẻ bấm trong chế độ trình chiếu.</p>' +
      '<p class="mt-2 text-sm text-slate-700">' + (naming
        ? 'HTML chọn ngẫu nhiên mỗi lượt. PowerPoint trộn tên khi tải và đặt sau thẻ úp số; bấm thẻ để gọi tên. Tải lại để trộn lại thứ tự.'
        : 'Bản tải dùng chuột hoặc bàn phím để trả lời. Với Quét thẻ QR, chọn học sinh rồi ghi nhận đáp án trên máy. Hiệu ứng và luật được rút gọn cho bản tải.') + '</p>' +
      (!naming ? '<label class="block mt-4 text-sm font-bold">Nguồn câu hỏi <select id="offline-question-source" class="ml-2 border rounded p-2"><option value="questions">Bộ câu hỏi đang dùng</option><option value="library">Toàn bộ Thư viện của trò này</option></select></label>' : '') +
      '<p class="mt-3 text-xs text-slate-500">File mang theo nội dung và tên được chọn. Khi chia sẻ file, người nhận cũng xem được các dữ liệu này. PowerPoint cần hỗ trợ liên kết giữa các slide; hiệu ứng có thể khác giữa các phiên bản.</p>' +
      '<div id="offline-export-status" role="status" class="mt-3 text-sm text-rose-700"></div>' +
      '<div class="mt-5 flex flex-wrap gap-3"><button data-export-format="html" onclick="downloadOfflineItem(\'html\')" class="px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold">Tải HTML offline</button>' +
      '<button data-export-format="pptx" onclick="downloadOfflineItem(\'pptx\')" class="px-4 py-3 rounded-xl bg-orange-600 text-white font-bold">Tải PowerPoint (.pptx)</button>' +
      '<button onclick="closeOfflineExport()" class="px-4 py-3 rounded-xl bg-slate-100 font-bold">Đóng</button></div></section>';
    document.body.appendChild(dialog);
    dialog.querySelector('button').focus();
  };

  const offlineStyles = `
*{box-sizing:border-box}body{margin:0;background:#0e1534;color:#fff;font:18px Arial,sans-serif}
header,main{max-width:1100px;margin:auto;padding:22px}header{display:flex;gap:16px;align-items:center;flex-wrap:wrap}
h1{font-size:clamp(24px,4vw,44px);margin:0}h2{font-size:clamp(24px,3vw,40px);line-height:1.3}
p{line-height:1.55}.muted{color:#b5c6e8;font-size:15px}.panel{background:#19254b;border:1px solid #3b4b77;border-radius:22px;padding:25px;margin:15px 0}
button,select,textarea{font:inherit}button{cursor:pointer;border:0;border-radius:13px;background:#e8ecff;color:#16244c;padding:14px 22px;font-weight:bold}
button:disabled{opacity:.6;cursor:default}button:focus-visible,select:focus-visible{outline:4px solid #fbbf24;outline-offset:3px}.primary{background:#fbbf24;color:#111b35}
.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}.answer{text-align:left;min-height:90px;white-space:pre-wrap;overflow-wrap:anywhere}
.good{background:#a7f3d0!important;color:#064e3b}.bad{background:#fecaca!important;color:#7f1d1d}.row{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.grow{flex:1}.big{font-size:clamp(32px,7vw,76px);font-weight:bold;text-align:center;overflow-wrap:anywhere}
#message{min-height:44px;font-weight:bold;margin:18px 0}.track{position:relative;background:#24345c;border-radius:15px;height:42px;margin:14px 0;overflow:hidden}
.racer{position:absolute;top:3px;font-size:30px;transition:left .12s linear}.track-label{font-size:14px;color:#d2dcf5}.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:12px}
progress{width:100%;height:25px;accent-color:#fbbf24}#wheel{display:block;width:min(100%,500px);height:auto;margin:0 auto}
select{max-width:100%;padding:10px;border-radius:10px;background:white;color:#19254b}.history{color:#b5c6e8;font-size:15px;overflow-wrap:anywhere}
label{display:flex;align-items:center;gap:8px}#floaters{height:200px;overflow:hidden;position:relative}.floater{position:absolute;padding:8px;background:#4257a5;border-radius:12px;animation:float 3s ease-in-out infinite alternate}
@keyframes float{to{transform:translateY(-40px) rotate(6deg)}}@media(max-width:600px){.grid{grid-template-columns:1fr}header,main{padding:14px}.panel{padding:16px}}
@media(prefers-reduced-motion:reduce){.floater{animation:none}.racer{transition:none}}`;

  // This function is serialized into the downloaded HTML. It has no app or network dependencies.
  function offlinePlayer(data) {
    const $ = id => document.getElementById(id);
    const main = $('main');
    const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    function randomInt(limit) {
      const value = new Uint32Array(1);
      crypto.getRandomValues(value);
      return Math.floor(value[0] / 4294967296 * limit);
    }
    function shuffle(items) {
      const result = items.slice();
      for (let i = result.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [result[i], result[j]] = [result[j], result[i]];
      }
      return result;
    }
    let soundOn = data.settings.sound;
    let audio;
    function beep(correct) {
      if (!soundOn) return;
      try {
        audio ||= new (window.AudioContext || window.webkitAudioContext)();
        if (audio.state === 'suspended') audio.resume();
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.frequency.value = correct ? 660 : 180;
        gain.gain.setValueAtTime(.07, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .2);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start();
        oscillator.stop(audio.currentTime + .2);
      } catch (_) { /* Device audio is optional. */ }
    }
    $('title').textContent = data.icon + ' ' + data.title;
    $('subtitle').textContent = data.subtitle;
    $('full').onclick = () => document.documentElement.requestFullscreen?.().catch(() => {});
    $('sound').checked = soundOn;
    $('sound').onchange = event => soundOn = event.target.checked;
    const isNameGame = ['wheel', 'stage', 'duck','embedded'].includes(data.kind);
    let animation = 0;
    let running = false;
    let activeQuestion = 0;
    let locked = false;
    let team = 0;
    let scores = [0, 0];
    let correct = 0;
    let wrong = 0;
    let questions = [];
    let qrResponses = {};
    let turnQuestion = null;
    function resetQuiz() {
      questions = data.questions.map(q => ({ text: q.text, options: data.settings.shuffleAnswers ? shuffle(q.options) : q.options.slice() }));
      if (data.settings.shuffleQuestions) questions = shuffle(questions);
      activeQuestion = 0; scores = [0, 0]; correct = 0; wrong = 0; team = 0; qrResponses = {};
      renderQuiz();
    }
    function namesControl() {
      return '<label>Học sinh <select id="respondent">' + data.names.map((name, i) => '<option value="' + i + '">' + e(name) + '</option>').join('') + '</select></label>';
    }
    function renderQuiz() {
      locked = false;
      if (activeQuestion >= questions.length) {
        main.innerHTML = '<div class="panel big">🏆 Hoàn thành</div><p>Đúng ' + correct + ' · Chưa đúng ' + wrong + '</p>' +
          (data.kind === 'duel' ? '<p>' + data.teams.map((name, i) => e(name) + ' ' + scores[i]).join(' · ') + '</p>' : '') +
          '<button id="again" class="primary">Chơi lại</button>';
        $('again').onclick = resetQuiz;
        return;
      }
      turnQuestion = questions[activeQuestion];
      const isDuel = data.kind === 'duel';
      const prefix = data.kind === 'ladder' ? '💎 Bậc ' : data.kind === 'mine' ? '🧨 Mìn ' : 'Câu ';
      main.innerHTML = '<div class="row"><p class="grow">' + prefix + (activeQuestion + 1) + '/' + questions.length + '</p><p>Đúng ' + correct + ' · Chưa đúng ' + wrong + '</p></div>' +
        (isDuel ? '<div class="row">' + data.teams.map((name, i) => '<button id="team-' + i + '" class="' + (team === i ? 'primary' : '') + '">' + e(name) + ' · ' + scores[i] + '</button>').join('') + '</div><div id="duel-tracks"></div>' : '') +
        (data.kind === 'class' ? '<div class="row">' + namesControl() + '<span id="class-count" class="muted"></span></div>' : '') +
        '<section class="panel"><h2>' + e(turnQuestion.text) + '</h2><div class="grid">' +
        turnQuestion.options.map((option, i) => '<button class="answer" id="answer-' + i + '">' + 'ABCD'[i] + '. ' + e(option.text) + '</button>').join('') +
        '</div><div id="message" role="status" aria-live="polite"></div><button class="primary" id="next" ' + (data.kind === 'class' ? '' : 'disabled') + '>Câu tiếp</button></section>' +
        (data.kind === 'class' ? '<div id="responses" class="history"></div>' : '') +
        '<p class="muted">Bấm A/B/C/D hoặc 1/2/3/4 để chọn. Phím Enter chuyển câu. ' + (isDuel ? 'Chọn đội trước khi trả lời; hai đội luân phiên.' : '') + '</p>';
      if (isDuel) {
        data.teams.forEach((_, i) => {
          $('team-' + i).onclick = () => { if (!locked) { team = i; renderQuiz(); } };
        });
        drawDuel();
      }
      turnQuestion.options.forEach((_, i) => $('answer-' + i).onclick = () => answer(i));
      $('next').onclick = () => {
        if (!locked && data.kind !== 'class') return;
        activeQuestion++; team = isDuel ? 1 - team : 0; qrResponses = {};
        renderQuiz();
      };
      if (data.kind === 'class') $('respondent').onchange = clearAnswerHighlight;
    }
    function drawDuel() {
      const icon = data.id === 'space-race' ? '🚀' : data.id === 'ngon-tay-than-ky' ? '⭐' : '⛵';
      $('duel-tracks').innerHTML = scores.map((score, i) => '<div class="track-label">' + e(data.teams[i]) + '</div><div class="track"><span class="racer" style="left:' + Math.min(88, score / Math.max(1, questions.length) * 88) + '%">' + icon + '</span></div>').join('');
    }
    function clearAnswerHighlight() {
      turnQuestion.options.forEach((_, i) => $('answer-' + i).classList.remove('good', 'bad'));
      $('message').textContent = '';
    }
    function answer(index) {
      if (locked || !turnQuestion?.options[index] || activeQuestion >= questions.length) return;
      const option = turnQuestion.options[index];
      const isClass = data.kind === 'class';
      const who = isClass ? $('respondent').value : '';
      if (isClass && Object.hasOwn(qrResponses, who)) {
        $('message').textContent = 'Đã ghi nhận đáp án của học sinh này. Chuyển sang học sinh khác.';
        return;
      }
      if (isClass) {
        qrResponses[who] = { index, correct: option.isCorrect };
        $('class-count').textContent = Object.keys(qrResponses).length + '/' + data.names.length + ' đã trả lời';
        $('responses').textContent = Object.entries(qrResponses).map(([i, result]) => data.names[i] + ' · ' + 'ABCD'[result.index] + ' · ' + (result.correct ? 'Đúng' : 'Chưa đúng')).join(' / ');
      } else locked = true;
      if (option.isCorrect) { correct++; if (data.kind === 'duel') scores[team]++; } else wrong++;
      clearAnswerHighlight();
      $('answer-' + index).classList.add(option.isCorrect ? 'good' : 'bad');
      $('message').textContent = option.isCorrect ? (data.kind === 'mine' ? '🛡️ Gỡ mìn thành công!' : '✅ Chính xác!') : (data.kind === 'mine' ? '💥 Mìn nổ. Cùng xem lại câu trả lời.' : 'Hãy xem lại đáp án.');
      if (!isClass) {
        turnQuestion.options.forEach((o, i) => { $('answer-' + i).disabled = true; if (o.isCorrect) $('answer-' + i).classList.add('good'); });
        $('next').disabled = false;
      }
      if (data.kind === 'duel') drawDuel();
      beep(option.isCorrect);
    }
    let pool = data.names.map((name, i) => ({ name, id: i }));
    const history = [];
    function renderNames() {
      const content = data.kind === 'wheel' ? '<canvas id="wheel" width="600" height="600"></canvas>' :
        data.kind === 'duck' ? '<div id="races"></div>' : '<div id="floaters"></div>';
      main.innerHTML = '<section class="panel">' + content + '<div id="name-result" class="big" role="status" aria-live="polite">Sẵn sàng</div></section>' +
        '<div class="row"><button id="start" class="primary">Bắt đầu</button><button id="restore">Chơi lại toàn bộ</button><label><input id="exclude" type="checkbox" checked>Loại tên đã chọn</label><span id="remaining"></span></div>' +
        '<p id="names-history" class="history"></p>';
      $('start').onclick = startNames;
      $('restore').onclick = () => {
        if (running) return;
        pool = data.names.map((name, i) => ({ name, id: i })); history.length = 0;
        $('name-result').textContent = 'Sẵn sàng'; showNames();
      };
      showNames();
    }
    function drawWheel(rotation = 0) {
      const canvas = $('wheel');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const count = pool.length;
      ctx.clearRect(0, 0, 600, 600);
      if (!count) return;
      const colors = ['#be185d', '#a16207', '#047857', '#1d4ed8', '#6d28d9', '#0e7490'];
      for (let i = 0; i < count; i++) {
        const a = rotation + i * 2 * Math.PI / count;
        ctx.beginPath(); ctx.moveTo(300, 300); ctx.arc(300, 300, 275, a, a + 2 * Math.PI / count); ctx.closePath();
        ctx.fillStyle = colors[i % colors.length]; ctx.fill();
        ctx.save(); ctx.translate(300, 300); ctx.rotate(a + Math.PI / count); ctx.textAlign = 'right';
        ctx.fillStyle = 'white'; ctx.font = Math.min(22, Math.max(10, 480 / count)) + 'px Arial';
        const label = pool[i].name;
        ctx.fillText(label.length > 24 ? label.slice(0, 22) + '…' : label, 258, 5, 220); ctx.restore();
      }
      ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.moveTo(577, 300); ctx.lineTo(596, 285); ctx.lineTo(596, 315); ctx.closePath(); ctx.fill();
    }
    function showNames() {
      $('remaining').textContent = pool.length + ' lượt còn lại';
      $('names-history').textContent = 'Đã chọn ' + history.join(' · ');
      if (data.kind === 'wheel') drawWheel();
      if (data.kind === 'duck') $('races').innerHTML = pool.map((entry, i) => '<div class="track-label">' + e(entry.name) + '</div><div class="track"><span id="duck-' + i + '" class="racer" style="left:0%">🦆</span></div>').join('');
      if (data.kind === 'stage') $('floaters').innerHTML = pool.map((entry, i) => '<span class="floater" style="left:' + (i * 23 % 75) + '%;top:' + (40 + i * 37 % 120) + 'px;animation-delay:-' + (i % 3) + 's">' + e(entry.name) + '</span>').join('');
    }
    function startNames() {
      if (running) return;
      if (!pool.length) { $('name-result').textContent = 'Đã gọi hết danh sách. Bấm Chơi lại toàn bộ.'; return; }
      running = true;
      $('start').disabled = true; $('restore').disabled = true; $('exclude').disabled = true;
      const winner = randomInt(pool.length);
      const duration = data.settings.duration * 1000;
      const start = performance.now();
      const stopRotation = 8 * Math.PI + 2 * Math.PI - (winner + .5) * 2 * Math.PI / pool.length;
      function frame(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        if (data.kind === 'wheel') drawWheel(stopRotation * eased);
        else if (data.kind === 'duck') pool.forEach((_, i) => {
          const distance = i === winner ? t : Math.min(.97, t * (.68 + .24 * ((i * 17 % 13) / 13)));
          $('duck-' + i).style.left = (88 * distance) + '%';
        });
        else $('name-result').textContent = pool[Math.floor((now - start) / 90) % pool.length].name;
        if (t < 1) animation = requestAnimationFrame(frame);
        else {
          $('name-result').textContent = '🎉 ' + pool[winner].name;
          history.push(pool[winner].name); beep(true);
          if ($('exclude').checked) pool.splice(winner, 1);
          $('remaining').textContent = pool.length + ' lượt còn lại';
          $('names-history').textContent = 'Đã chọn ' + history.join(' · ');
          running = false; $('start').disabled = false; $('restore').disabled = false; $('exclude').disabled = false;
        }
      }
      if (data.kind === 'duck') showNames();
      animation = requestAnimationFrame(frame);
    }
    document.addEventListener('keydown', event => {
      if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(event.target.tagName) || event.repeat) return;
      if (isNameGame) { if (event.code === 'Space') { event.preventDefault(); startNames(); } return; }
      const index = ['a', 'b', 'c', 'd'].indexOf(event.key.toLowerCase());
      if (index >= 0) answer(index);
      else if (/^[1-4]$/.test(event.key)) answer(Number(event.key) - 1);
      else if (event.key === 'Enter') $('next')?.click();
    });
    window.addEventListener('pagehide', () => { cancelAnimationFrame(animation); audio?.close(); });
    if (isNameGame) renderNames(); else resetQuiz();
  }
  function embeddedDownload(data) {
    const frame = document.getElementById('wheel-embedded-game');
    if (!frame || frame.dataset.wheelGame !== data.id || !frame.srcdoc) throw Error('Mở trò chơi rồi tải lại.');
    const original = window.gvcnWheelGameRead(data.id, frame.contentWindow);
    const group = original.lops[0];
    const initial = { ...original, lops: [{ ...group, daGoi: [], lichSu: [], vang: {ngay:'',ds:[]}, vong:1 }] };
    function boot(id, initial, source) {
      const frame = document.querySelector('iframe');
      frame.dataset.wheelGame = id;
      let state = initial;
      const base = initial.lops[0];
      window.gvcnWheelGameRead = () => JSON.parse(JSON.stringify(state));
      window.gvcnWheelGameSave = (_, sender, next) => {
        if (sender !== frame.contentWindow) return;
        state = {...state, ...next, lops:[{...state.lops[0], ...next.lops[0]}]};
      };
      window.gvcnWheelGameImport = () => {
        const value = prompt('Nhập danh sách, mỗi dòng một tên', state.lops[0].hs.join('\n'));
        if (!value?.trim()) return;
        const names = value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
        if (new Set(names).size !== names.length) return alert('Thêm số thứ tự để phân biệt học sinh trùng tên.');
        state = {...initial, caiDat:state.caiDat, lops:[{...base,hs:names,lichSu:[],daGoi:[]}]};
        frame.contentWindow.GoiTen?.dung?.();
        frame.srcdoc = source;
      };
      window.gvcnWheelGameNavigate = () => alert('Tệp này chứa một trò chơi. Mở tệp của trò khác để chuyển trò.');
      window.gvcnWheelGamePresent = () => true;
      frame.srcdoc = source;
    }
    return '<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(data.title)+'</title><style>body{margin:0}iframe{width:100vw;height:100dvh;border:0;display:block}</style><iframe allowfullscreen title="'+escape(data.title)+'"></iframe><script>('+boot.toString()+')('+[data.id,initial,frame.srcdoc].map(jsonForHtml).join(',')+');<\/script></html>';
  }

  function buildHtml(data) {
    if(data.kind==='embedded') return embeddedDownload(data);
    const note = ['wheel', 'stage', 'duck','embedded'].includes(data.kind)
      ? 'Bấm Bắt đầu hoặc phím cách để chọn ngẫu nhiên. Kết quả chỉ nằm trong phiên chơi này.'
      : 'Bản offline điều khiển bằng nút bấm. Trò camera được chuyển thành trả lời thủ công. Dữ liệu chỉ nằm trong phiên chơi này.';
    return '<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + escape(data.title) +
      '</title><style>' + offlineStyles + '</style></head><body><header><div class="grow"><h1 id="title"></h1><p id="subtitle" class="muted"></p></div><label><input type="checkbox" id="sound">Âm thanh</label><button id="full">Toàn màn hình</button></header>' +
      '<main><p class="muted">' + note + '</p><div id="main"></div></main><script>(' + offlinePlayer.toString() + ')(' + jsonForHtml(data) + ');<\/script></body></html>';
  }
  async function ensurePptLibrary() {
    if (window.PptxGenJS) return;
    if (!pptLibrary) pptLibrary = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = './assets/vendor/pptxgen.bundle.js';
      script.onload = () => window.PptxGenJS ? resolve() : reject(new Error('Thư viện PowerPoint chưa sẵn sàng.'));
      script.onerror = () => { script.remove(); pptLibrary = null; reject(new Error('Không tải được thư viện PowerPoint. Kiểm tra tệp assets/vendor/pptxgen.bundle.js.')); };
      document.head.appendChild(script);
    });
    await pptLibrary;
  }
  function buildPresentation(data, Pptx) {
    const ppt = new Pptx();
    ppt.layout = 'LAYOUT_WIDE';
    ppt.author = 'GVCN PRO';
    ppt.subject = data.title;
    ppt.title = data.title;
    ppt.lang = 'vi-VN';
    const color = { bg: '0E1534', panel: '233462', gold: 'FBBF24', text: 'FFFFFF', muted: 'B8C8E8' };
    ppt.theme = { headFontFace: 'Arial', bodyFontFace: 'Arial', lang: 'vi-VN' };
    const addText = (slide, text, x, y, w, h, options = {}) => slide.addText(String(text), {
      x, y, w, h, fontFace: 'Arial', fontSize: 24, color: color.text, margin: .12, breakLine: false,
      fit: 'shrink', valign: 'mid', ...options
    });
    function page(title) {
      const slide = ppt.addSlide();
      slide.background = { color: color.bg };
      addText(slide, title, .5, .22, 12.3, .7, { bold: true, fontSize: 30, color: color.gold });
      return slide;
    }
    function button(slide, text, x, y, w, h, target, options = {}) {
      slide.addShape(ppt.ShapeType.roundRect, { x, y, w, h, radius: .12, fill: { color: color.panel }, line: { color: '52679E', width: 1 }, hyperlink: { slide: target } });
      addText(slide, text, x + .05, y + .03, w - .1, h - .06, { fontSize: 22, bold: true, hyperlink: { slide: target }, ...options });
    }
    const namesGame = ['wheel', 'stage', 'duck','embedded'].includes(data.kind);
    const start = page(data.title);
    addText(start, data.subtitle, .6, 1.05, 12, .7, { color: color.muted, fontSize: 22 });
    addText(start, namesGame
      ? 'Các tên đã được trộn khi tạo file. Bấm một thẻ số để mở tên, rồi quay lại bảng chọn.'
      : 'Trình chiếu và bấm đáp án. Đáp án sai có nút thử lại. Có thể chọn câu hỏi từ bảng.', .8, 2.05, 11.7, 1.3, { fontSize: 26 });
    addText(start, namesGame
      ? 'PowerPoint dùng thẻ chọn. Tải lại từ app để trộn lại tên. Bản HTML hỗ trợ quay và đua ngẫu nhiên mỗi lượt.'
      : 'Phiên bản bằng nút bấm. Giáo viên ghi điểm theo luật mong muốn. Trò camera dùng đáp án trên slide.', .8, 4, 11.7, 1.1, { fontSize: 20, color: color.muted });
    button(start, 'BẮT ĐẦU', 4.3, 5.8, 4.7, .9, 2, { align: 'center', color: color.gold });
    const items = namesGame ? shuffled(data.names) : (data.settings.shuffleQuestions ? shuffled(data.questions) : data.questions.slice());
    const perPage = 20;
    const menuPages = Math.ceil(items.length / perPage);
    const menus = [];
    for (let i = 0; i < menuPages; i++) {
      const slide = page((namesGame ? 'Chọn thẻ' : 'Chọn câu hỏi') + ' · ' + (i + 1) + '/' + menuPages);
      menus.push(slide);
      button(slide, 'Trang đầu', .5, 6.55, 2.4, .6, 1, { fontSize: 18, align: 'center' });
      if (i > 0) button(slide, 'Bảng trước', 6.2, 6.55, 2.5, .6, i + 1, { fontSize: 18, align: 'center' });
      if (i < menuPages - 1) button(slide, 'Bảng tiếp', 9, 6.55, 2.5, .6, i + 3, { fontSize: 18, align: 'center' });
    }
    const firstItemSlide = 2 + menuPages;
    let nextNumber = firstItemSlide;
    items.forEach((item, index) => {
      const menuIndex = Math.floor(index / perPage);
      const menuNumber = 2 + menuIndex;
      const tile = index % perPage;
      button(menus[menuIndex], String(index + 1), .65 + tile % 5 * 2.45, 1.3 + Math.floor(tile / 5) * 1.2, 2.15, .95, nextNumber, { fontSize: 28, align: 'center' });
      if (namesGame) {
        const slide = page(data.title);
        addText(slide, item, .75, 2.1, 11.8, 2.2, { fontSize: 52, bold: true, align: 'center' });
        button(slide, 'Về bảng thẻ', 4.6, 5.7, 4.2, .9, menuNumber, { align: 'center' });
        nextNumber++;
      } else {
        const question = { text: item.text, options: data.settings.shuffleAnswers ? shuffled(item.options) : item.options };
        const questionNumber = nextNumber;
        const correctNumber = nextNumber + 1;
        const wrongNumber = nextNumber + 2;
        const slide = page(data.title + ' · Câu ' + (index + 1));
        addText(slide, question.text, .7, 1.1, 11.9, 1.8, { fontSize: question.text.length > 180 ? 24 : 32, bold: true });
        question.options.forEach((option, i) => button(slide, 'ABCD'[i] + '. ' + option.text,
          .7 + i % 2 * 6.1, 3.2 + Math.floor(i / 2) * 1.35, 5.8, 1.1, option.isCorrect ? correctNumber : wrongNumber,
          { fontSize: option.text.length > 100 ? 18 : 24 }));
        button(slide, 'Bảng câu hỏi', .7, 6.3, 3, .65, menuNumber, { fontSize: 18 });
        const success = page('Chính xác');
        addText(success, question.options.find(o => o.isCorrect).text, .8, 1.8, 11.7, 2, { fontSize: 38, color: 'A7F3D0', bold: true, align: 'center' });
        button(success, 'Về bảng câu hỏi', .9, 5.5, 4.5, .95, menuNumber, { align: 'center' });
        if (index < items.length - 1) button(success, 'Câu tiếp theo', 7.1, 5.5, 4.5, .95, questionNumber + 3, { align: 'center', color: color.gold });
        const retry = page('Cùng suy nghĩ lại');
        addText(retry, 'Hãy đọc lại câu hỏi và chọn một đáp án khác.', 1, 2, 11.3, 1.5, { fontSize: 34, align: 'center' });
        button(retry, 'Thử lại câu này', 4.3, 5.2, 4.7, 1, questionNumber, { align: 'center' });
        nextNumber += 3;
      }
    });
    return ppt;
  }
  window.downloadOfflineItem = async function (format) {
    if (busy || !pending || !['html', 'pptx'].includes(format)) return;
    const status = document.getElementById('offline-export-status');
    busy = true;
    document.querySelectorAll('#offline-export-dialog button').forEach(button => button.disabled = true);
    try {
      status.textContent = 'Đang đóng gói…';
      const source = document.getElementById('offline-question-source')?.value || 'questions';
      const raw = window.gvcnGetOfflineItem(pending, source);
      const data = normalizeExport(pending, raw);
      if (format === 'html') saveBlob(new Blob([buildHtml(data)], { type: 'text/html;charset=utf-8' }), filename(data, 'html'));
      else {
        await ensurePptLibrary();
        const ppt = buildPresentation(data, window.PptxGenJS);
        await ppt.writeFile({ fileName: filename(data, 'pptx') });
      }
      status.textContent = 'Đã tạo file. HTML mở bằng trình duyệt; PPTX mở bằng PowerPoint rồi bật Trình chiếu.';
    } catch (error) {
      status.textContent = error.message || 'Không tạo được file. Hãy kiểm tra nội dung rồi thử lại.';
    } finally {
      busy = false;
      document.querySelectorAll('#offline-export-dialog button').forEach(button => button.disabled = false);
    }
  };
  // Exposed for validation and reuse, with no references to private app state.
  window.GvcnOfflineExport = { normalizeExport, buildHtml, buildPresentation };
})();
