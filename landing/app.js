/* ============================================================
   DG-LETS AGRI MARKET — Landing Page JS
   ============================================================ */
'use strict';

/* ══════════════════════════════════════
   CONFIG — paste your Apps Script URL below after deploying
   ══════════════════════════════════════ */
const SHEET_URL = 'PASTE_YOUR_APPS_SCRIPT_URL_HERE';

/* ══════════════════════════════════════
   GOOGLE SHEETS INTEGRATION
   ══════════════════════════════════════ */

/* Send data to Google Sheet */
async function sendToSheet(data) {
  if (!SHEET_URL || SHEET_URL === 'PASTE_YOUR_APPS_SCRIPT_URL_HERE') {
    console.info('[DG-LETS] Sheet URL not set — saved to localStorage only.');
    return;
  }
  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors', /* required by Apps Script */
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, userAgent: navigator.userAgent }),
    });
    console.info('[DG-LETS] Signup sent to Google Sheet ✓');
  } catch (err) {
    console.warn('[DG-LETS] Sheet send failed — data kept in localStorage:', err.message);
  }
}

/* Verify the sheet URL is working (GET health check) */
async function verifySheetConnection() {
  if (!SHEET_URL || SHEET_URL === 'PASTE_YOUR_APPS_SCRIPT_URL_HERE') return;
  try {
    const res  = await fetch(SHEET_URL);
    const json = await res.json();
    if (json.status) {
      console.info(`[DG-LETS] ✅ Sheet connected — "${json.sheet}" — ${json.signups} signup(s) so far`);
      showToast(`✅ Sheet connected — ${json.signups} signup(s) recorded`);
    }
  } catch (err) {
    console.warn('[DG-LETS] Sheet health check failed:', err.message);
  }
}

/* localStorage backup — always runs */
function saveLocally(data) {
  try {
    const list = JSON.parse(localStorage.getItem('dglets_signups') || '[]');
    list.push({ ...data, ts: new Date().toISOString() });
    localStorage.setItem('dglets_signups', JSON.stringify(list));
  } catch (_) {}
}

/* View all locally saved signups in console */
window.viewLocalSignups = function () {
  const list = JSON.parse(localStorage.getItem('dglets_signups') || '[]');
  console.table(list);
  return list;
};

/* ══════════════════════════════════════
   NAVBAR
   ══════════════════════════════════════ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.style.boxShadow = window.scrollY > 10 ? '0 2px 12px rgba(0,0,0,.1)' : '';
}, { passive: true });

/* ── Scroll to form ── */
window.scrollToForm = function () {
  const el = document.getElementById('earlyAccessForm');
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
};

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

/* ══════════════════════════════════════
   TOAST
   ══════════════════════════════════════ */
function showToast(msg, duration = 4500) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

/* ══════════════════════════════════════
   FORM VALIDATION HELPERS
   ══════════════════════════════════════ */
function setError(input, msg) {
  input.style.borderColor = '#ef4444';
  let e = input.parentElement.querySelector('.field-error');
  if (!e) {
    e = document.createElement('span');
    e.className = 'field-error';
    e.style.cssText = 'font-size:.72rem;color:#ef4444;margin-top:3px;display:block;';
    input.parentElement.appendChild(e);
  }
  e.textContent = msg;
}
function clearError(input) {
  input.style.borderColor = '';
  const e = input.parentElement.querySelector('.field-error');
  if (e) e.remove();
}
function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }

/* ══════════════════════════════════════
   EARLY ACCESS FORM
   ══════════════════════════════════════ */
const form    = document.getElementById('earlyAccessForm');
const success = document.getElementById('formSuccess');

if (form) {
  /* Live clear errors */
  form.querySelectorAll('input, select').forEach(f => {
    f.addEventListener('input',  () => clearError(f));
    f.addEventListener('change', () => clearError(f));
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const nameEl    = document.getElementById('ea-name');
    const emailEl   = document.getElementById('ea-email');
    const roleEl    = document.getElementById('ea-role');
    const consentEl = document.getElementById('ea-consent');
    let valid = true;

    if (!nameEl.value.trim() || nameEl.value.trim().length < 2) {
      setError(nameEl, 'Enter your full name'); valid = false;
    } else clearError(nameEl);

    if (!isEmail(emailEl.value)) {
      setError(emailEl, 'Enter a valid email address'); valid = false;
    } else clearError(emailEl);

    if (!roleEl.value) {
      setError(roleEl, 'Please select your role'); valid = false;
    } else clearError(roleEl);

    if (!consentEl.checked) {
      setError(consentEl, 'Please agree to receive updates'); valid = false;
    } else clearError(consentEl);

    if (!valid) return;

    /* Loading state */
    const btn = document.getElementById('ea-submit');
    const orig = btn.textContent;
    btn.textContent = 'Submitting…';
    btn.disabled = true;

    const payload = {
      name:   nameEl.value.trim(),
      email:  emailEl.value.trim(),
      phone:  document.getElementById('ea-phone').value.trim(),
      role:   roleEl.value,
      state:  document.getElementById('ea-state').value,
      lga:    document.getElementById('ea-lga').value.trim(),
      source: 'early-access-form',
    };

    /* Always save locally first */
    saveLocally(payload);
    /* Then send to Google Sheet */
    await sendToSheet(payload);

    /* Show success */
    form.style.display = 'none';
    success.style.display = 'block';
    showToast('🎉 You\'re on the early access list!');
    btn.textContent = orig;
    btn.disabled = false;
  });
}

/* ══════════════════════════════════════
   FOOTER NOTIFY FORM
   ══════════════════════════════════════ */
const notifyBtn = document.getElementById('notifyBtn');
if (notifyBtn) {
  notifyBtn.addEventListener('click', async () => {
    const inp = document.getElementById('footer-email');
    if (!isEmail(inp.value)) {
      inp.style.borderColor = '#ef4444';
      inp.placeholder = 'Enter a valid email address';
      setTimeout(() => { inp.style.borderColor = ''; inp.placeholder = 'Enter your email address'; }, 3000);
      return;
    }
    inp.style.borderColor = '';

    const orig = notifyBtn.textContent;
    notifyBtn.textContent = 'Sending…';
    notifyBtn.disabled = true;

    const payload = { email: inp.value.trim(), source: 'footer-notify' };
    saveLocally(payload);
    await sendToSheet(payload);

    inp.value = '';
    notifyBtn.textContent = '✓ You\'re in!';
    notifyBtn.style.background = '#2d7a4f';
    showToast('📬 We\'ll notify you when we launch!');

    setTimeout(() => {
      notifyBtn.textContent = orig;
      notifyBtn.style.background = '';
      notifyBtn.disabled = false;
    }, 5000);
  });

  /* Allow Enter key in footer email input */
  const footerEmailInp = document.getElementById('footer-email');
  if (footerEmailInp) {
    footerEmailInp.addEventListener('keydown', e => {
      if (e.key === 'Enter') notifyBtn.click();
    });
  }
}

/* ══════════════════════════════════════
   SMOOTH SCROLL
   ══════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
    }
  });
});

/* ══════════════════════════════════════
   FADE-UP ON SCROLL
   ══════════════════════════════════════ */
const fadeEls = document.querySelectorAll('.fade-up');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  fadeEls.forEach(el => io.observe(el));
} else {
  fadeEls.forEach(el => el.classList.add('visible'));
}

/* ══════════════════════════════════════
   PEOPLE CARDS → SCROLL TO FORM
   ══════════════════════════════════════ */
document.querySelectorAll('.people-card').forEach(card => {
  card.addEventListener('click', () => scrollToForm());
});

/* ══════════════════════════════════════
   AUTO-VERIFY SHEET ON PAGE LOAD
   (only fires if SHEET_URL is set)
   ══════════════════════════════════════ */
window.addEventListener('load', () => {
  verifySheetConnection();
});
