/* ============================================================
   DG-LETS AGRI MARKET — Landing Page JS
   ============================================================ */
'use strict';

/* ── Scroll to form helper ── */
window.scrollToForm = function () {
  const el = document.getElementById('earlyAccessForm');
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};

/* ── Navbar scroll shadow ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.style.boxShadow = window.scrollY > 10
    ? '0 2px 12px rgba(0,0,0,.1)' : '';
}, { passive: true });

/* ── Mobile menu ── */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
  const spans = hamburger.querySelectorAll('span');
  if (open) {
    spans[0].style.cssText = 'transform:rotate(45deg) translate(5px,5px)';
    spans[1].style.cssText = 'opacity:0';
    spans[2].style.cssText = 'transform:rotate(-45deg) translate(5px,-5px)';
  } else {
    spans.forEach(s => s.style.cssText = '');
  }
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => s.style.cssText = '');
  });
});

/* ── Toast ── */
function showToast(msg, duration = 4000) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

/* ── Config — paste your Google Apps Script Web App URL here ── */
const SHEET_URL = 'PASTE_YOUR_APPS_SCRIPT_URL_HERE';

/* ── Save to localStorage (always runs as backup) ── */
function saveSignup(data) {
  try {
    const list = JSON.parse(localStorage.getItem('dglets_signups') || '[]');
    list.push({ ...data, ts: new Date().toISOString() });
    localStorage.setItem('dglets_signups', JSON.stringify(list));
  } catch (_) {}
}

/* ── Send to Google Sheet ── */
async function sendToSheet(data) {
  if (!SHEET_URL || SHEET_URL === 'PASTE_YOUR_APPS_SCRIPT_URL_HERE') return;
  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors', /* Apps Script requires no-cors */
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.warn('Sheet submission failed (data saved locally):', err);
  }
}

/* ── Field helpers ── */
function setError(input, msg) {
  input.style.borderColor = '#ef4444';
  let e = input.parentElement.querySelector('.field-error');
  if (!e) { e = document.createElement('span'); e.className = 'field-error'; input.parentElement.appendChild(e); }
  e.textContent = msg;
}
function clearError(input) {
  input.style.borderColor = '';
  const e = input.parentElement.querySelector('.field-error');
  if (e) e.remove();
}
function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

/* ── Early Access Form ── */
const form = document.getElementById('earlyAccessForm');
const success = document.getElementById('formSuccess');

if (form) {
  form.querySelectorAll('input,select').forEach(f => {
    f.addEventListener('input', () => clearError(f));
    f.addEventListener('change', () => clearError(f));
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const name    = document.getElementById('ea-name');
    const email   = document.getElementById('ea-email');
    const role    = document.getElementById('ea-role');
    const consent = document.getElementById('ea-consent');
    let ok = true;

    if (!name.value.trim() || name.value.trim().length < 2) { setError(name, 'Enter your full name'); ok = false; } else clearError(name);
    if (!isEmail(email.value)) { setError(email, 'Enter a valid email address'); ok = false; } else clearError(email);
    if (!role.value) { setError(role, 'Please select your role'); ok = false; } else clearError(role);
    if (!consent.checked) { setError(consent, 'Please agree to receive updates'); ok = false; } else clearError(consent);

    if (!ok) return;

    const btn = document.getElementById('ea-submit');
    btn.textContent = 'Submitting…';
    btn.disabled = true;

    const payload = {
      name:   name.value.trim(),
      email:  email.value.trim(),
      phone:  document.getElementById('ea-phone').value.trim(),
      role:   role.value,
      state:  document.getElementById('ea-state').value,
      lga:    document.getElementById('ea-lga').value.trim(),
      source: 'early-access-form',
    };

    /* Save locally as backup, then send to Google Sheet */
    saveSignup(payload);
    await sendToSheet(payload);

    form.style.display = 'none';
    success.style.display = 'block';
    showToast('🎉 You\'re on the early access list!');
    btn.textContent = 'Join Early Access';
    btn.disabled = false;
  });
}

/* ── Footer notify ── */
const notifyBtn = document.getElementById('notifyBtn');
if (notifyBtn) {
  notifyBtn.addEventListener('click', async () => {
    const inp = document.getElementById('footer-email');
    if (!isEmail(inp.value)) {
      inp.style.borderColor = '#ef4444';
      inp.placeholder = 'Enter a valid email address';
      return;
    }
    inp.style.borderColor = '';
    const payload = { email: inp.value.trim(), source: 'footer-notify' };
    saveSignup(payload);
    await sendToSheet(payload);
    inp.value = '';
    notifyBtn.textContent = '✓ Subscribed!';
    notifyBtn.style.background = '#2d7a4f';
    notifyBtn.disabled = true;
    showToast('📬 We\'ll notify you at launch!');
    setTimeout(() => {
      notifyBtn.textContent = '🔔 Notify Me';
      notifyBtn.style.background = '';
      notifyBtn.disabled = false;
    }, 5000);
  });
}

/* ── Smooth scroll ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const el = document.querySelector(a.getAttribute('href'));
    if (el) {
      e.preventDefault();
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
    }
  });
});

/* ── Fade-up on scroll ── */
const fadeEls = document.querySelectorAll('.fade-up');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  fadeEls.forEach(el => io.observe(el));
} else {
  fadeEls.forEach(el => el.classList.add('visible'));
}

/* ── People cards click → form ── */
document.querySelectorAll('.people-card').forEach(card => {
  card.addEventListener('click', () => scrollToForm());
  card.style.cursor = 'pointer';
});
