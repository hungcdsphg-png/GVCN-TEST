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
    const questions = ids.some(id => !['wheel','stage','duck','embedded'].includes(games[id].kind));
    const picker = questions ? '<label>Nguồn câu hỏi <select id="offline-source"><option value="">Bộ đang dùng (dùng thư viện nếu trống)</option><option value="library">Thư viện câu hỏi</option></select></label>' : '';
    return picker + '<div class="flex flex-wrap gap-2 my-3" aria-label="Tải từng mục chơi offline">' + ids.map(id => {
      const game = games[id];
      return '<button type="button" onclick="downloadGameHtml(\'' + id + '\')" class="px-3 py-2 bg-white text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-50">' + game.icon + ' Tải HTML · ' + escape(game.title) + '</button><button type="button" class="px-3 py-2 text-indigo-800 border rounded-xl text-xs font-bold" onclick="downloadSlideGame(\'' + id + '\')">Chèn vào PowerPoint · ' + escape(game.title) + '</button>';
    }).join('') + '</div>';
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
  const SLIDE_GUIDE = "CHƠI TRÒ HTML TRONG SLIDE POWERPOINT\n\nChuẩn bị một lần trên từng máy trình chiếu\n1. Dùng PowerPoint desktop hỗ trợ Content Add-ins và được phép cài add-in riêng. Cài Python 3 và công cụ mkcert (https://github.com/FiloSottile/mkcert) từ trước khi đi dạy. Nếu máy trường do quản trị viên quản lý, nhờ quản trị viên chuẩn bị chứng chỉ HTTPS localhost và triển khai manifest.\n2. Mở Terminal hoặc PowerShell trong thư mục PowerPoint cạnh index.html của app. Tạo chứng chỉ tin cậy trên máy bằng hai lệnh:\n   mkcert -install\n   mkcert -cert-file localhost.pem -key-file localhost-key.pem localhost 127.0.0.1\n   Giữ các khóa riêng trên máy. Tạo chứng chỉ riêng trên mỗi máy.\n3. Mỗi buổi dạy, từ thư mục này chạy python3 chay.py (macOS) hoặc py -3 chay.py (Windows). Giữ cửa sổ mở. Dịch vụ chỉ lắng nghe trên máy này. Nếu báo cổng đang dùng, kiểm tra xem đã chạy một bản chưa.\n\nChèn trò vào bài giảng\n1. Trong app, bấm “Chèn vào PowerPoint” ở trò cần dùng, giải nén gói đã tải. Chép tệp HTML vào thư mục PowerPoint/tro-choi, giữ đúng tên tệp. Mỗi lần xuất tạo một trò độc lập gồm nội dung và danh sách lúc xuất.\n2. Trên Mac, thoát PowerPoint. Trong Finder bấm Command+Shift+G, mở ~/Library/Containers/com.microsoft.Powerpoint/Data/Documents/wef (tạo thư mục wef nếu cần), chép tệp XML vào đó. Mở lại PowerPoint, vào Home hoặc Insert → Add-ins → My Add-ins, chọn tên trò trong Developer Add-ins.\n3. Trên Windows, đặt XML vào thư mục danh mục add-in đã chia sẻ. Trong PowerPoint vào File → Options → Trust Center → Trust Center Settings → Trusted Add-in Catalogs, thêm đường dẫn mạng của thư mục, bật Show in Menu, khởi động lại PowerPoint. Vào Home hoặc Insert → Add-ins → My Add-ins → Shared Folder, chọn trò. Quản trị viên có thể cấp add-in tập trung theo quy định của trường.\n4. Chọn đúng slide trước khi chèn, kéo các góc của khung trò chơi để chỉnh kích thước, lưu bài giảng và chạy Slide Show. Bấm nút chơi trong khung. Có thể chèn nhiều trò khác nhau vào cùng bài.\n5. Khi chuyển máy, mang theo các tệp HTML và XML tương ứng cùng bài giảng. Lặp lại phần chuẩn bị, cài add-in và chạy dịch vụ trên máy đó. Chạy thử trên đúng máy với mạng ngắt trước buổi dạy. Một số chính sách Office cần mạng để đăng nhập hoặc xác thực add-in.\n\nTài liệu Microsoft\nhttps://learn.microsoft.com/en-us/office/dev/add-ins/testing/sideload-an-office-add-in-on-mac\nhttps://learn.microsoft.com/en-us/office/dev/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins\n";
  function selectedGame(id, source) {
      source = source || document.getElementById('offline-source')?.value;
      let raw = window.gvcnGetOfflineItem(id, source || 'questions');
      if (!source && !raw.questions?.length && !['embedded','wheel','stage','duck'].includes(games[id].kind)) {
        raw = window.gvcnGetOfflineItem(id, 'library');
      }
      return normalizeExport(id, raw);
  }
  window.downloadSlideGame = async function(id) {
    try {
      const data = selectedGame(id);
      const uid = crypto.randomUUID();
      const title = escape(data.title + ' · ' + uid.slice(0, 8));
      const url = 'https://localhost:43127/';
      const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<OfficeApp xmlns="http://schemas.microsoft.com/office/appforoffice/1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="ContentApp">
<Id>${uid}</Id><Version>1.0.0.0</Version><ProviderName>GVCN</ProviderName><DefaultLocale>vi-VN</DefaultLocale>
<DisplayName DefaultValue="${title}"/><Description DefaultValue="Chơi trò GVCN trong slide"/>
<IconUrl DefaultValue="${url}icon.png"/><Hosts><Host Name="Presentation"/></Hosts>
<DefaultSettings><SourceLocation DefaultValue="${url}${uid}.html"/></DefaultSettings><Permissions>Restricted</Permissions></OfficeApp>`;
      const zip = new JSZip();
      zip.file(uid + '.html', buildHtml(data));
      zip.file(filename(data, 'xml'), manifest);
      zip.file('Huong-dan.txt', SLIDE_GUIDE);
      saveBlob(await zip.generateAsync({type:'blob',compression:'DEFLATE'}), filename(data, 'zip'));
    } catch(error) {
      alert(error.message || 'Chưa xuất được trò chơi.');
    }
  };
  window.downloadGameHtml = function(id, source) {
    try {
      const data = selectedGame(id, source);
      saveBlob(new Blob([buildHtml(data)], {type:'text/html;charset=utf-8'}), filename(data, 'html'));
    } catch (error) {
      alert(error.message || 'Chưa tải được trò chơi.');
    }
  };
})();
