(function () {
  'use strict';
  function initNavigation() {
    var dropdowns = document.querySelectorAll('.site-header .nav-dropdown');
    Array.prototype.forEach.call(dropdowns, function (dropdown) {
      var trigger = dropdown.querySelector('.nav-dropdown-trigger');
      var menu = dropdown.querySelector('.nav-dropdown-menu');
      if (!trigger || !menu) return;
      function setOpen(open) {
        dropdown.classList.toggle('is-open', open);
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      trigger.setAttribute('aria-expanded', 'false');
      trigger.addEventListener('click', function (event) {
        if (!dropdown.classList.contains('is-open')) {
          event.preventDefault();
          setOpen(true);
        }
      });
      dropdown.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          setOpen(false);
          trigger.focus();
        }
      });
      document.addEventListener('pointerdown', function (event) {
        if (!dropdown.contains(event.target)) setOpen(false);
      });
      menu.addEventListener('click', function (event) {
        if (event.target.closest('a')) setOpen(false);
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
  } else {
    initNavigation();
  }
})();
