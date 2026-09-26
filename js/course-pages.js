/* ==========================================================================
   CogAegis course pages: pop-ups (dialogs) and form sending
   ========================================================================== */

/* ---- ONLINE PAYMENT ----------------------------------------------------
   When you set up Stripe, Square or PayPal, create a "payment link" for the
   $75 public session and paste it between the quotes below, e.g.
     const PAYMENT_LINK = "https://buy.stripe.com/abc123";
   After someone reserves a seat, they'll be sent straight to that secure
   checkout page. Leave it empty ("") to keep the "we'll email you a link"
   message.
   ------------------------------------------------------------------------ */
const PAYMENT_LINK = "";

document.addEventListener('DOMContentLoaded', () => {
  const byId = id => document.getElementById(id);

  // Background videos: play only while on screen; stay paused for visitors who prefer reduced motion
  const bgVideos = document.querySelectorAll('.bg-video');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bgVideos.forEach(v => { v.removeAttribute('autoplay'); v.pause(); });
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(en =>
      en.isIntersecting ? en.target.play().catch(() => {}) : en.target.pause()), { threshold: 0.05 });
    bgVideos.forEach(v => io.observe(v));
  }

  // Pricing flip cards: tap the front to flip and grow to fit the details; "Back" returns to the square card
  const flips = document.querySelectorAll('.price-flip');
  const fitHeight = card => {
    const back = card.querySelector('.price-back');
    back.style.position = 'relative';            // measure the details at their natural height
    const h = back.offsetHeight;
    back.style.position = '';
    card.style.height = Math.max(h, card.offsetWidth) + 'px';
  };
  const setFlip = (card, open) => {
    card.style.height = card.offsetHeight + 'px'; // start the height animation from the current size
    card.style.aspectRatio = 'auto';
    card.classList.toggle('is-flipped', open);
    card.querySelector('.price-front').setAttribute('aria-expanded', open);
    requestAnimationFrame(() => {
      if (open) fitHeight(card);
      else card.style.height = card.offsetWidth + 'px';
    });
    if (!open) setTimeout(() => { if (!card.classList.contains('is-flipped')) { card.style.height = ''; card.style.aspectRatio = ''; } }, 550);
  };
  // Tapping a card flips it open; tapping it again (or anywhere else on the page) flips it back.
  // Buttons on the back (e.g. "See sessions & reserve") do their own job instead of flipping.
  flips.forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('[data-open], a')) return;
      setFlip(card, !card.classList.contains('is-flipped'));
    });
  });
  document.addEventListener('click', e => {
    if (document.querySelector('dialog[open]')) return;   // leave cards alone while a pop-up is open
    flips.forEach(card => {
      if (card.classList.contains('is-flipped') && !card.contains(e.target)) setFlip(card, false);
    });
  });
  window.addEventListener('resize', () => flips.forEach(c => c.classList.contains('is-flipped') && fitHeight(c)));

  // Open any dialog from a button with data-open="dialog-id"
  document.querySelectorAll('[data-open]').forEach(btn => {
    btn.addEventListener('click', () => byId(btn.dataset.open)?.showModal());
  });

  // Close with the × button, or by clicking the dark backdrop outside the box
  document.querySelectorAll('dialog.cg-dialog').forEach(dialog => {
    dialog.querySelector('[data-close]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  });

  // "Reserve a seat" in the schedule: remember which session, then open the form
  document.querySelectorAll('[data-reserve]').forEach(btn => {
    btn.addEventListener('click', () => {
      const session = btn.dataset.reserve;
      byId('reserve-session').value = session;
      byId('reserve-session-label').textContent = 'Session: ' + session.replace(/ · TBA/g, '') + (session.includes('TBA') ? ' (date to be announced)' : '');
      byId('schedule-dialog').close();
      byId('reserve-dialog').showModal();
    });
  });

  // If a payment link has been added, update the wording in the reservation form
  if (PAYMENT_LINK) {
    byId('payment-msg').innerHTML = 'After you reserve, you’ll go to our secure checkout to pay <strong>$75</strong> and confirm your seat.';
    byId('reserve-submit').textContent = 'Continue to secure payment';
  }

  // Send forms in the background (no page reload), then show a thank-you message
  document.querySelectorAll('form[data-ajax]').forEach(form => {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const status = form.querySelector('.form-status');
      const submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      status.textContent = 'Sending…';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (!res.ok) throw new Error('Request failed');

        if (form.id === 'reserve-form' && PAYMENT_LINK) {
          const email = encodeURIComponent(form.email.value);
          window.location.href = PAYMENT_LINK + (PAYMENT_LINK.includes('?') ? '&' : '?') + 'prefilled_email=' + email;
          return;
        }
        form.innerHTML = form.dataset.success ? '<p class="form-success">' + form.dataset.success + '</p>'
          : form.id === 'reserve-form'
          ? '<p class="form-success"><strong>Thank you! Your seat request is in.</strong><br>We’ve received your details and will email you as soon as your session’s date and venue are confirmed, along with a secure payment link.</p>'
          : '<p class="form-success"><strong>Thank you! Your demo request is in.</strong><br>We’ll be in touch within two business days to plan your free Beginner 101 session.</p>';
      } catch (err) {
        submit.disabled = false;
        status.innerHTML = 'Sorry, something went wrong. Please try again, or email us at <a href="mailto:questions@cogaegis.com">questions@cogaegis.com</a>.';
      }
    });
  });
});
