/* AmbientDrive | script.js — clean rewrite */

/* ─── Loader ─────────────────────────────────── */
window.addEventListener('load', () => {
    setTimeout(() => document.body.classList.add('loading-finished'), 1200);
});

/* ─── Navbar scroll ──────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ─── Hamburger ──────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
});

document.querySelectorAll('.mobile-item').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
    });
});

/* ─── Smooth scroll ──────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    });
});

/* ─── Reveal on scroll ───────────────────────── */
const doReveal = () => {
    document.querySelectorAll('.reveal:not(.active)').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 60) {
            el.classList.add('active');
        }
    });
};
window.addEventListener('scroll', doReveal, { passive: true });
// Run immediately so above-fold content is visible right away
doReveal();

/* ─── Stat counter ───────────────────────────── */
const counted = new Set();

const countUp = (el) => {
    if (counted.has(el)) return;
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    if (!target) return;
    counted.add(el);

    const duration = 1200;
    const startTime = performance.now();

    const tick = (now) => {
        const p = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
};

const checkStats = () => {
    document.querySelectorAll('.stat-number[data-target]').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 40) countUp(el);
    });
};
window.addEventListener('scroll', checkStats, { passive: true });
checkStats();

/* ─── Gallery filter ─────────────────────────── */
let filterGeneration = 0;

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const gen = ++filterGeneration;
        const filter = btn.dataset.filter;
        document.querySelectorAll('.gallery-item').forEach(item => {
            const show = filter === 'all' || item.dataset.category === filter;
            if (show) {
                item.style.removeProperty('display');
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    if (gen === filterGeneration) item.classList.remove('hidden');
                }));
            } else {
                item.classList.add('hidden');
            }
        });
    });
});

/* ─── Lightbox ───────────────────────────────── */
const lightbox        = document.getElementById('lightbox');
const lightboxImg     = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxBackdrop = document.getElementById('lightboxBackdrop');

function openLightbox(item) {
    const imgEl     = item.querySelector('.gallery-img');
    const captionEl = item.querySelector('.gallery-caption');

    // Reset
    lightboxImg.className = 'lightbox-img';
    lightboxImg.style.backgroundImage = '';

    // Use inline background-image if set (real photos)
    const inlineBg = imgEl.style.backgroundImage;
    if (inlineBg) {
        lightboxImg.style.backgroundImage = inlineBg;
    } else {
        // Fall back to gradient class
        const bgClass = Array.from(imgEl.classList).find(c => c !== 'gallery-img');
        if (bgClass) lightboxImg.classList.add(bgClass);
    }

    lightboxCaption.textContent = captionEl ? captionEl.textContent : '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
}

function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
}

// Wire up gallery items — NO inline onclick in HTML
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', 'Bekijk groter');
    item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLightbox(item);
        }
    });
});

// Close button
lightboxClose.addEventListener('click', closeLightbox);

// Backdrop click closes
lightboxBackdrop.addEventListener('click', closeLightbox);

// Escape key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
});

/* ─── Contact form ───────────────────────────── */
const form      = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');

if (form && submitBtn) {
    form.addEventListener('submit', async e => {
        e.preventDefault();

        const btnText    = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        btnText.style.display    = 'none';
        btnLoading.style.display = 'inline';
        submitBtn.disabled       = true;

        try {
            const res = await fetch(form.action, {
                method:  'POST',
                body:    new FormData(form),
                headers: { Accept: 'application/json' }
            });

            if (res.ok) {
                showFeedback('success', '✅ Aanvraag ontvangen! We nemen binnen 24 uur contact op.');
                form.reset();
            } else {
                showFeedback('error', '❌ Er ging iets mis. Probeer opnieuw of stuur een WhatsApp.');
            }
        } catch {
            showFeedback('error', '❌ Geen verbinding. Stuur ons een WhatsApp bericht.');
        } finally {
            btnText.style.display    = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled       = false;
        }
    });
}

function showFeedback(type, msg) {
    document.getElementById('formFeedback')?.remove();
    const el = document.createElement('div');
    el.id = 'formFeedback';
    const isOk = type === 'success';
    Object.assign(el.style, {
        marginTop:    '16px',
        padding:      '16px 22px',
        borderRadius: '12px',
        fontSize:     '0.9rem',
        fontWeight:   '600',
        textAlign:    'center',
        background:   isOk ? 'rgba(37,211,102,0.12)' : 'rgba(255,80,80,0.12)',
        border:       `1px solid ${isOk ? 'rgba(37,211,102,0.35)' : 'rgba(255,80,80,0.35)'}`,
        color:        isOk ? '#25D366' : '#ff6b6b',
        animation:    'fadeInUp 0.4s ease'
    });
    el.textContent = msg;
    form.after(el);
    setTimeout(() => el.remove(), 8000);
}
