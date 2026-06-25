/* ALIYA HARDWARE LLC — main.js */

// ── Mobile menu ──
function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

// ── Sticky header shadow ──
window.addEventListener('scroll', () => {
  const h = document.getElementById('site-header');
  if (h) h.style.boxShadow = window.scrollY > 20 ? '0 4px 24px rgba(10,22,40,.35)' : '';
});

// ── Scroll reveal ──
(function () {
  const items = document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale');
  if (!items.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 55);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  items.forEach(el => obs.observe(el));
})();

// ── Animated counters ──
(function () {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      let cur = 0;
      const inc = target / (1800 / 16);
      const tick = () => {
        cur = Math.min(cur + inc, target);
        el.textContent = Math.round(cur) + suffix;
        if (cur < target) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      };
      tick();
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
})();

// ── Nav active class on current page ──
(function () {
  const links = document.querySelectorAll('.nav-links a');
  const path = window.location.pathname;
  links.forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (href !== '/' && path.startsWith(href))) {
      a.classList.add('active');
    }
  });
})();

// ── Contact form ──
(function () {
  const btn = document.getElementById('submit-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const name = document.getElementById('f-name');
    if (!name || !name.value.trim()) {
      alert('Please fill in your name.');
      return;
    }
    btn.textContent = '✓ Sent!';
    btn.style.background = '#25D366';
    setTimeout(() => {
      btn.textContent = 'Send Enquiry →';
      btn.style.background = '';
    }, 3000);
    alert('Thank you! We\'ll be in touch shortly.\n\nFor urgent enquiries, WhatsApp: +971 56 721 1873');
  });
})();

// ── Image fallback ──
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', function () {
    this.style.background = 'linear-gradient(135deg,#1A3355,#0A1628)';
    this.alt = '';
    this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>';
  });
});
