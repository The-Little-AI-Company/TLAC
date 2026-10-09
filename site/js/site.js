/* The Little AI Company site script. The pages work without it: it adds the phone menu,
   the light and dark switch, and the email helper on the project form. */
(function () {
  var root = document.documentElement;

  /* Phone menu */
  document.querySelectorAll('.lai-nav').forEach(function (nav) {
    var btn = nav.querySelector('.lai-nav__menu');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('is-open', open);
    });
  });

  /* Light and dark. With no saved choice the page follows the system setting. */
  function current() {
    var t = root.getAttribute('data-theme');
    if (t === 'dark' || t === 'light') return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function label(btn) { btn.textContent = current() === 'dark' ? 'Switch to light' : 'Switch to dark'; }
  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    label(btn);
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('lai-theme', next); } catch (e) {}
      label(btn);
    });
  });

  /* Project form. There is no server, so it writes the email for you. */
  var form = document.getElementById('project-form');
  if (!form) return;
  var EMAIL = 'jeff@littleaicompany.com';
  var out = document.getElementById('project-out');
  var pre = document.getElementById('project-text');
  var open = document.getElementById('project-open');
  var copy = document.getElementById('project-copy');
  var copied = document.getElementById('project-copied');

  function setError(id, msg) {
    var input = document.getElementById(id);
    var field = input.closest('.lai-field');
    var err = document.getElementById(id + '-err');
    if (msg) {
      field.classList.add('is-error');
      input.setAttribute('aria-invalid', 'true');
      err.hidden = false;
      err.lastChild.textContent = 'Error: ' + msg;
    } else {
      field.classList.remove('is-error');
      input.removeAttribute('aria-invalid');
      err.hidden = true;
    }
    return !msg;
  }
  function val(id) { return document.getElementById(id).value.trim(); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var need = val('p-need'), email = val('p-email');
    var ok1 = setError('p-need', need ? '' : 'Write a sentence or two about the job.');
    var ok2 = setError('p-email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Add an email address so I can reply, like you@example.com.');
    if (!ok1 || !ok2) { (ok1 ? document.getElementById('p-email') : document.getElementById('p-need')).focus(); return; }
    var name = val('p-name'), site = val('p-site'), when = val('p-when');
    var lines = ['Hi Jeff,', '', need, ''];
    if (site) lines.push('Current site or link: ' + site);
    if (when) lines.push('Timing: ' + when);
    lines.push('Reply to: ' + email, '', name || '');
    var body = lines.join('\n').replace(/\n+$/, '');
    var subject = 'Project: ' + (need.length > 60 ? need.slice(0, 57) + '...' : need);
    pre.textContent = 'To: ' + EMAIL + '\nSubject: ' + subject + '\n\n' + body;
    open.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    copied.hidden = true;
    out.hidden = false;
    out.querySelector('.lai-notice').focus();
  });

  copy.addEventListener('click', function () {
    var text = pre.textContent;
    function done() { copied.hidden = false; }
    function fallback() {
      var r = document.createRange(); r.selectNodeContents(pre);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      copied.hidden = false; copied.textContent = 'Selected. Press Ctrl+C or Cmd+C to copy.';
    }
    try { navigator.clipboard.writeText(text).then(done, fallback); } catch (err) { fallback(); }
  });
})();
