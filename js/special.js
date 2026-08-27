(function () {
  const buttonSelector = '#card-info-btn';
  const portalSelector = '#teldrive-portal';
  const extraSelector = '[data-teldrive-portal-extra]';
  const hintSelector = '[data-teldrive-portal-hint]';

  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getPortal() {
    return document.querySelector(portalSelector);
  }

  function updateButtons(isOpen, hasPortal) {
    document.querySelectorAll(buttonSelector).forEach(button => {
      if (!hasPortal) {
        button.removeAttribute('role');
        button.removeAttribute('aria-controls');
        button.removeAttribute('aria-expanded');
        button.removeAttribute('title');
        return;
      }

      button.setAttribute('role', 'button');
      button.setAttribute('aria-controls', 'teldrive-portal');
      button.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function setPortalOpen(isOpen) {
    const portal = getPortal();
    if (!portal) {
      updateButtons(false, false);
      return;
    }

    const iframe = portal.querySelector('iframe[data-src]');
    if (isOpen && iframe && !iframe.getAttribute('src')) {
      iframe.setAttribute('src', iframe.dataset.src);
    }

    portal.hidden = !isOpen;
    document.querySelectorAll(extraSelector).forEach(item => {
      item.hidden = !isOpen;
    });
    document.querySelectorAll(hintSelector).forEach(item => {
      item.hidden = isOpen;
    });

    updateButtons(isOpen, true);

    if (isOpen) {
      portal.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start'
      });
    }
  }

  function initSpecialPortal() {
    const portal = getPortal();
    if (!portal) {
      updateButtons(false, false);
      return;
    }

    setPortalOpen(false);
  }

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;

    const button = event.target.closest(buttonSelector);
    if (!button) return;

    event.preventDefault();
    if (event.detail === 0) return;

    const portal = getPortal();
    if (!portal) return;

    setPortalOpen(portal.hidden);
  });

  document.addEventListener('DOMContentLoaded', initSpecialPortal);
  document.addEventListener('pjax:complete', initSpecialPortal);
})();
