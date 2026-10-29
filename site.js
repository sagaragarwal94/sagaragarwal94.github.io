/* Shared site behaviour — sagarchandagarwal.com */
(function () {
  var root = document.documentElement;

  /* ── Theme toggle ── */
  function setTheme(t) {
    root.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) {}
    var btn = document.getElementById('themeBtn');
    if (btn) {
      btn.textContent = t === 'dark' ? '☀' : '☾';
      btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
  }
  var themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    setTheme(root.dataset.theme || 'dark');
    themeBtn.addEventListener('click', function () {
      setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    });
  }

  /* ── Mobile nav ── */
  var nav = document.getElementById('navLinks');
  var ham = document.getElementById('navHam');
  function closeNav() {
    if (!nav) return;
    nav.classList.remove('open');
    if (ham) ham.setAttribute('aria-expanded', 'false');
  }
  if (ham && nav) {
    ham.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      ham.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !ham.contains(e.target)) closeNav();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
  }

  /* ── Mark the active nav link ── */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    var target = a.getAttribute('href').split('/').pop();
    if (target === here) a.classList.add('active');
    if (here.indexOf('.html') === -1 && target === 'index.html') a.classList.add('active');
  });
  if (location.pathname.indexOf('/blogs/') !== -1) {
    document.querySelectorAll('.nav-links a[href$="writing.html"]').forEach(function (a) { a.classList.add('active'); });
  }

  /* ── Reading progress bar (blog posts) ── */
  var bar = document.getElementById('readProgress');
  if (bar) {
    var tick = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0) + '%';
    };
    window.addEventListener('scroll', tick, { passive: true });
    tick();
  }

  /* ── Back to top ── */
  var top = document.getElementById('backTop');
  if (top) {
    var showTop = function () { top.classList.toggle('show', window.scrollY > 600); };
    window.addEventListener('scroll', showTop, { passive: true });
    top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    showTop();
  }

  /* ── Copy link / share ── */
  document.querySelectorAll('[data-copy-link]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var url = location.href.split('#')[0];
      var done = function () {
        var old = btn.textContent;
        btn.textContent = 'Copied';
        setTimeout(function () { btn.textContent = old; }, 1600);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done); else done();
    });
  });

  /* ── Copy button on code blocks ── */
  document.querySelectorAll('.post-body pre, .code-wrap').forEach(function (pre) {
    var b = document.createElement('button');
    b.className = 'code-copy';
    b.type = 'button';
    b.textContent = 'Copy';
    b.addEventListener('click', function () {
      var code = pre.querySelector('pre') || pre;
      var text = code.innerText;
      var done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
    });
    pre.style.position = 'relative';
    pre.appendChild(b);
  });

  /* ── Writing: filter + search ── */
  var filterBar = document.getElementById('postFilters');
  var search = document.getElementById('postSearch');
  var items = Array.prototype.slice.call(document.querySelectorAll('.post-list [data-cat]'));
  var count = document.getElementById('postCount');
  if (items.length && (filterBar || search)) {
    var activeCat = 'all';
    var apply = function () {
      var q = search ? search.value.trim().toLowerCase() : '';
      var n = 0;
      items.forEach(function (it) {
        var okCat = activeCat === 'all' || it.dataset.cat === activeCat;
        var okQ = !q || it.textContent.toLowerCase().indexOf(q) !== -1;
        var show = okCat && okQ;
        it.style.display = show ? '' : 'none';
        if (show) n++;
      });
      if (count) count.textContent = n + (n === 1 ? ' post' : ' posts');
      var empty = document.getElementById('postEmpty');
      if (empty) empty.style.display = n ? 'none' : '';
    };
    if (filterBar) {
      filterBar.addEventListener('click', function (e) {
        var b = e.target.closest('[data-filter]');
        if (!b) return;
        activeCat = b.dataset.filter;
        filterBar.querySelectorAll('[data-filter]').forEach(function (x) { x.classList.toggle('on', x === b); });
        apply();
      });
    }
    if (search) search.addEventListener('input', apply);
    apply();
  }

  /* ── Contact form → mailto (no backend) ── */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      var topic = form.topic.value;
      var msg = form.message.value.trim();
      var subject = encodeURIComponent('[' + topic + '] ' + (name || 'Hello'));
      var body = encodeURIComponent(msg + '\n\n— ' + name + (email ? ' <' + email + '>' : ''));
      location.href = 'mailto:' + form.dataset.to + '?subject=' + subject + '&body=' + body;
      var note = document.getElementById('formNote');
      if (note) note.textContent = 'Opening your mail client… if nothing happens, email ' + form.dataset.to + ' directly.';
    });
  }

  /* ── Footer year ── */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ── Print ── */
  document.querySelectorAll('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });
})();
