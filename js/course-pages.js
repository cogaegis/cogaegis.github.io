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
        form.innerHTML = form.id === 'reserve-form'
          ? '<p class="form-success"><strong>Thank you! Your seat request is in.</strong><br>We’ve received your details and will email you as soon as your session’s date and venue are confirmed, along with a secure payment link.</p>'
          : '<p class="form-success"><strong>Thank you! Your demo request is in.</strong><br>We’ll be in touch within two business days to plan your free Beginner 101 session.</p>';
      } catch (err) {
        submit.disabled = false;
        status.innerHTML = 'Sorry, something went wrong. Please try again, or email us at <a href="mailto:questions@cogaegis.com">questions@cogaegis.com</a>.';
      }
    });
  });
});
