/* ==========================================================================
   CogAegis AI Detector — page logic
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Settings: edit these ---------- */
  var CONFIG = {
    // Your detection backend. While this is empty the page runs in PREVIEW MODE:
    // it shows sample reports and a banner saying so.
    // When set, the page POSTs the upload / link / text here and expects JSON shaped like:
    // { "pct": 87, "source": "beach.jpg", "meta": "Image · 2.4 MB",
    //   "summary": "Plain-language explanation…",
    //   "evidence": [ { "check": "Detector A", "finding": "0.91 …", "signal": "ai" | "human" | "neutral" } ],
    //   "engine": "Engine v1.0 · updated 2026-10-01" }
    API_URL: '',
    // Checkout page for the Pro plan (e.g. a Stripe Payment Link)
    SUBSCRIBE_URL: '#',
    FREE_SCANS: 3,
    MIN_WORDS: 150
  };

  /* ---------- Sample reports used in preview mode ---------- */
  var SAMPLES = [
    { pct: 87, source: 'beach_sunset.jpg', meta: 'Image · 2.4 MB · 3024 × 4032',
      summary: 'Two independent detectors both rate this image as very likely AI-generated, and a close look at the details agrees. The hands of the person on the left have fused fingers, the lettering on the beach sign is garbled, and the shadows fall in two different directions from a single sun. No content credentials were attached, which on its own proves nothing, since most platforms strip them on upload.',
      evidence: [
        { check: 'Content credentials (C2PA)', finding: 'None attached. Common for files saved from social media.', signal: 'neutral' },
        { check: 'Detector A', finding: '0.91 — texture pattern matches diffusion-model output.', signal: 'ai' },
        { check: 'Detector B', finding: '0.83 — fine noise lacks a camera sensor signature.', signal: 'ai' },
        { check: 'Visual review', finding: 'Fused fingers on the left figure; unreadable sign text.', signal: 'ai' },
        { check: 'Lighting and physics', finding: 'Shadows cast in two directions from one light source.', signal: 'ai' }
      ] },
    { pct: 38, source: 'news-site.com/opinion/remote-work-future', meta: 'Link · article · 1,180 words',
      summary: 'The signals disagree, so we place this in the middle of the scale rather than guess. The opening includes a specific personal anecdote with named places and dates, which reads as human. Sections two and three switch to evenly sized sentences, stock transitions and generic claims that are typical of AI drafting. The most likely explanation is a human-written piece that was partly expanded or edited with an AI tool.',
      evidence: [
        { check: 'Detector A', finding: '0.31 — mostly human patterns in the first 400 words.', signal: 'human' },
        { check: 'Detector B', finding: '0.77 — sections 2 and 3 flagged as likely AI.', signal: 'ai' },
        { check: 'Sentence rhythm', finding: 'Very uniform sentence length after the introduction.', signal: 'ai' },
        { check: 'Specific detail', finding: 'Named people, places and dates in the opening.', signal: 'human' },
        { check: 'Agreement check', finding: 'Detectors differ by 0.46, so we do not pick a side.', signal: 'neutral' }
      ] },
    { pct: 9, source: 'street_interview.mp4', meta: 'Video · 0:42 · 1080p',
      summary: 'Everything we checked points to a real camera recording. The file carries a valid content credential from a capture device with no AI edits listed, both detectors score every sampled frame low, and the motion blur, lip sync and background crowd movement behave the way real footage does.',
      evidence: [
        { check: 'Content credentials (C2PA)', finding: 'Valid credential from a capture device; no AI edits listed.', signal: 'human' },
        { check: 'Detector A', finding: '0.06 average across 21 sampled frames.', signal: 'human' },
        { check: 'Detector B', finding: '0.12 — no frame scored above 0.25.', signal: 'human' },
        { check: 'Motion and audio', finding: 'Natural motion blur; lip sync within normal range.', signal: 'human' }
      ] }
  ];

  var SIGNAL_TEXT = { ai: 'Points to AI', human: 'Points to human', neutral: 'Inconclusive' };
  var PREVIEW = !CONFIG.API_URL;
  var STORE_KEY = 'cogaegis_detector_scans_used';
  var sampleIndex = 0;
  var mode = 'upload';
  var selectedFile = null;

  /* ---------- Free-scan counter (browser only; real limits must be enforced by your backend) ---------- */
  function getUsed() {
    try { return parseInt(localStorage.getItem(STORE_KEY), 10) || 0; } catch (e) { return memoryUsed; }
  }
  var memoryUsed = 0;
  function setUsed(n) {
    memoryUsed = n;
    try { localStorage.setItem(STORE_KEY, String(n)); } catch (e) { /* storage blocked: keep in memory */ }
  }

  var $ = function (id) { return document.getElementById(id); };

  function renderCounter() {
    var left = Math.max(0, CONFIG.FREE_SCANS - getUsed());
    $('scanCounterText').innerHTML = '<strong>' + left + '</strong> of ' + CONFIG.FREE_SCANS + ' free scans left';
    var dots = document.querySelectorAll('#scanCounter .scan-dots span');
    dots.forEach(function (d, i) { d.classList.toggle('on', i < left); });
  }

  /* ---------- Tabs ---------- */
  var tabs = document.querySelectorAll('.tab');
  function selectTab(tab) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      $(t.getAttribute('aria-controls')).hidden = !on;
    });
    mode = tab.dataset.mode;
    $('formError').textContent = '';
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab); });
    tab.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      var next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      selectTab(next); next.focus();
    });
  });

  /* ---------- Inputs ---------- */
  function setFile(file) {
    selectedFile = file || null;
    $('dropTitle').textContent = file ? 'Selected: ' + file.name : 'Drop a file here or click to browse';
  }
  $('fileInput').addEventListener('change', function (e) { setFile(e.target.files[0]); });
  var dz = $('dropzone');
  ['dragenter', 'dragover'].forEach(function (ev) {
    dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('is-dragover'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('is-dragover'); });
  });
  dz.addEventListener('drop', function (e) { if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); });

  function wordCount() {
    var t = $('textInput').value.trim();
    return t ? t.split(/\s+/).length : 0;
  }
  $('textInput').addEventListener('input', function () {
    var w = wordCount();
    $('wordNote').textContent = w
      ? w + ' words' + (w < CONFIG.MIN_WORDS ? ' · add ' + (CONFIG.MIN_WORDS - w) + ' more for a reliable result' : ' · ready to scan')
      : 'Minimum ' + CONFIG.MIN_WORDS + ' words. Longer text gives a more reliable result.';
  });

  function validate() {
    if (mode === 'upload' && !selectedFile) return 'Choose a file to scan first.';
    if (mode === 'link') {
      var v = $('linkInput').value.trim();
      if (!/^https?:\/\/\S+\.\S+/.test(v)) return 'Paste a full link starting with http:// or https://';
    }
    if (mode === 'text' && wordCount() < CONFIG.MIN_WORDS) return 'Paste at least ' + CONFIG.MIN_WORDS + ' words so the result is reliable.';
    return '';
  }

  /* ---------- Scanning ---------- */
  function analyze() {
    if (PREVIEW) {
      return new Promise(function (resolve) {
        setTimeout(function () { resolve(SAMPLES[sampleIndex++ % SAMPLES.length]); }, 1600);
      });
    }
    var body = new FormData();
    body.append('mode', mode);
    if (mode === 'upload') body.append('file', selectedFile);
    if (mode === 'link') body.append('url', $('linkInput').value.trim());
    if (mode === 'text') body.append('text', $('textInput').value);
    return fetch(CONFIG.API_URL, { method: 'POST', body: body, credentials: 'include' })
      .then(function (res) {
        if (res.status === 402) { var err = new Error('limit'); err.limit = true; throw err; }
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      });
  }

  function setBusy(busy) {
    $('scanBtn').disabled = busy;
    $('scanBtn').textContent = busy ? 'Scanning…' : 'Scan for AI';
    $('scanning').hidden = !busy;
  }

  $('scanBtn').addEventListener('click', function () {
    if (getUsed() >= CONFIG.FREE_SCANS) { openPaywall(); return; }
    var problem = PREVIEW ? '' : validate();
    $('formError').textContent = problem;
    if (problem) return;
    $('result').hidden = true;
    setBusy(true);
    analyze().then(function (data) {
      setUsed(getUsed() + 1);          // only successful scans count
      renderCounter();
      renderResult(data);
    }).catch(function (err) {
      if (err.limit) { openPaywall(); return; }
      $('formError').textContent = "We couldn't analyze that. It didn't use up a scan — please try again.";
    }).then(function () { setBusy(false); });
  });

  /* ---------- Result ---------- */
  function renderResult(r) {
    var pct = Math.max(0, Math.min(100, Math.round(Number(r.pct) || 0)));
    var st = CogBrain.stage(pct);
    $('brainSlot').innerHTML = CogBrain.svg(pct);
    $('scorePct').textContent = pct + '%';
    $('stagePill').textContent = st.name;
    $('stagePill').className = 'stage-pill stage-' + st.key;
    $('scaleMarker').style.left = pct + '%';
    $('sourceMeta').textContent = r.meta || '';
    $('sourceName').textContent = r.source || '';
    if (r.engine) $('engineTag').textContent = r.engine;
    $('whyHeading').textContent = 'Why we rated it ' + pct + '%';
    $('summary').textContent = r.summary || '';

    var list = $('evidence');
    list.innerHTML = '';
    (r.evidence || []).forEach(function (e) {
      var sig = SIGNAL_TEXT[e.signal] ? e.signal : 'neutral';
      var li = document.createElement('li');
      var text = document.createElement('div'); text.className = 'evidence-text';
      var check = document.createElement('div'); check.className = 'evidence-check'; check.textContent = e.check || '';
      var finding = document.createElement('div'); finding.className = 'evidence-finding'; finding.textContent = e.finding || '';
      var pill = document.createElement('span'); pill.className = 'signal signal-' + sig; pill.textContent = SIGNAL_TEXT[sig];
      text.appendChild(check); text.appendChild(finding);
      li.appendChild(text); li.appendChild(pill);
      list.appendChild(li);
    });

    $('toast').textContent = '';
    $('result').hidden = false;
    $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  $('againBtn').addEventListener('click', function () {
    $('result').hidden = true;
    setFile(null);
    $('fileInput').value = '';
    $('linkInput').value = '';
    $('textInput').value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  $('saveBtn').addEventListener('click', function () {
    $('toast').textContent = 'Saving reports needs an account. Sign in to keep your history.';
  });
  $('reportBtn').addEventListener('click', function () {
    $('toast').textContent = 'Thanks — wrong results help train the next version of the detector.';
  });

  /* ---------- Paywall ---------- */
  var paywall = $('paywall');
  function openPaywall() {
    $('paywallBrain').innerHTML = CogBrain.svg(70);
    if (typeof paywall.showModal === 'function') paywall.showModal(); else paywall.setAttribute('open', '');
  }
  function closePaywall() {
    if (typeof paywall.close === 'function') paywall.close(); else paywall.removeAttribute('open');
  }
  $('paywallClose').addEventListener('click', closePaywall);
  $('laterBtn').addEventListener('click', closePaywall);
  paywall.addEventListener('click', function (e) { if (e.target === paywall) closePaywall(); });
  $('subscribeBtn').href = CONFIG.SUBSCRIBE_URL;

  /* ---------- Start ---------- */
  $('demoBanner').hidden = !PREVIEW;
  renderCounter();
})();
