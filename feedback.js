/* Calcora page feedback — lightweight, accessible, no third-party dependency. */
(function () {
  'use strict';
  if (document.getElementById('calcora-feedback')) return;

  const box = document.createElement('section');
  box.id = 'calcora-feedback';
  box.className = 'calcora-feedback';
  box.setAttribute('aria-labelledby', 'calcora-feedback-title');
  box.innerHTML = [
    '<h2 id="calcora-feedback-title">Was this page helpful?</h2>',
    '<p class="calcora-feedback-intro">Your feedback helps us improve Calcora. If a calculation looks wrong, please tell us which inputs you used.</p>',
    '<div class="calcora-feedback-actions" role="group" aria-label="Rate this page">',
    '<button type="button" data-vote="yes">Yes, helpful</button>',
    '<button type="button" data-vote="no">No, not yet</button>',
    '<a class="calcora-feedback-report" href="#">Report a calculation issue</a>',
    '</div>',
    '<p class="calcora-feedback-status" aria-live="polite" hidden></p>',
    '<form class="calcora-feedback-form" hidden>',
    '<label for="calcora-feedback-details">What went wrong? Include the inputs and result if possible.</label>',
    '<textarea id="calcora-feedback-details" name="details" rows="3" maxlength="1500" placeholder="Describe the issue (optional)"></textarea>',
    '<div class="calcora-feedback-actions">',
    '<button type="submit">Email issue report</button>',
    '<button type="button" data-cancel>Cancel</button>',
    '</div></form>',
    '<p class="calcora-feedback-note">Feedback buttons do not send data automatically. Issue reports open your email app so you can review the message before sending.</p>'
  ].join('');

  const style = document.createElement('style');
  style.textContent = [
    '.calcora-feedback{box-sizing:border-box;max-width:1100px;margin:2rem auto;padding:1.15rem;border:1px solid #dbe3ec;border-radius:14px;background:#f8fafc;color:#182338;font:inherit}',
    '.calcora-feedback h2{margin:0 0 .45rem;font-size:1.15rem;line-height:1.4}',
    '.calcora-feedback p{line-height:1.55}',
    '.calcora-feedback-intro{margin:.25rem 0 .9rem;color:#475569}',
    '.calcora-feedback-actions{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem}',
    '.calcora-feedback button,.calcora-feedback-report{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:.6rem .9rem;border:1px solid #cbd5e1;border-radius:8px;background:#fff;color:#182338;text-decoration:none;font:inherit;font-size:.95rem;cursor:pointer}',
    '.calcora-feedback button:hover,.calcora-feedback-report:hover{background:#eef2f7}',
    '.calcora-feedback button:focus-visible,.calcora-feedback-report:focus-visible,.calcora-feedback textarea:focus-visible{outline:3px solid rgba(37,99,235,.35);outline-offset:2px}',
    '.calcora-feedback-form{margin-top:1rem}.calcora-feedback-form label{display:block;margin-bottom:.4rem;font-weight:600}',
    '.calcora-feedback textarea{box-sizing:border-box;width:100%;max-width:100%;min-height:90px;padding:.7rem;border:1px solid #cbd5e1;border-radius:8px;font:inherit;background:#fff;color:#182338}',
    '.calcora-feedback-status{margin:.8rem 0 0;font-weight:600;color:#166534}.calcora-feedback-note{margin:.85rem 0 0;color:#64748b;font-size:.82rem}',
    '@media(max-width:600px){.calcora-feedback{margin:1.25rem .75rem;padding:1rem}.calcora-feedback-actions>*{flex:1 1 100%}}'
  ].join('');
  document.head.appendChild(style);

  const footer = document.querySelector('footer');
  if (footer && footer.parentNode) footer.parentNode.insertBefore(box, footer);
  else document.body.appendChild(box);

  const status = box.querySelector('.calcora-feedback-status');
  const form = box.querySelector('.calcora-feedback-form');
  const details = box.querySelector('#calcora-feedback-details');
  const reportLink = box.querySelector('.calcora-feedback-report');

  function mailtoBody(extra) {
    return [
      'Page: ' + window.location.href,
      'Page title: ' + document.title,
      extra || ''
    ].filter(Boolean).join('\n');
  }
  function openIssueEmail(extra) {
    const subject = encodeURIComponent('Calcora feedback / calculation issue');
    const body = encodeURIComponent(mailtoBody(extra));
    window.location.href = 'mailto:ranaaakas@gmail.com?subject=' + subject + '&body=' + body;
  }

  box.querySelectorAll('[data-vote]').forEach(function (button) {
    button.addEventListener('click', function () {
      const vote = button.getAttribute('data-vote');
      if (vote === 'yes') {
        status.textContent = 'Thank you — your feedback is appreciated.';
        status.hidden = false;
        form.hidden = true;
      } else {
        status.textContent = 'Thanks for letting us know. You can describe the problem below.';
        status.hidden = false;
        form.hidden = false;
        details.focus();
      }
    });
  });
  reportLink.addEventListener('click', function (event) {
    event.preventDefault();
    form.hidden = false;
    status.textContent = 'Please describe the issue, then choose “Email issue report”.';
    status.hidden = false;
    details.focus();
  });
  box.querySelector('[data-cancel]').addEventListener('click', function () {
    form.hidden = true;
    details.value = '';
  });
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    openIssueEmail(details.value.trim() ? 'Details: ' + details.value.trim() : 'Details: Not provided');
  });
})();