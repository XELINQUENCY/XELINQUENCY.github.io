(function () {
  const buttonSelector = '#card-info-btn';
  const portalSelector = '#teldrive-portal';
  const extraSelector = '[data-teldrive-hidden]';
  const hintSelector = '[data-teldrive-shown]';
  const markerMap = {
    'teldrive-shown': 'data-teldrive-shown',
    'teldrive-hidden': 'data-teldrive-hidden'
  };

  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getPortal() {
    return document.querySelector(portalSelector);
  }

  function getMarkerName(node) {
    return node.nodeType === Node.COMMENT_NODE ? node.nodeValue.trim() : '';
  }

  function wrapMarkedRegion(startNode, name, attribute) {
    const endMarker = `${name}:end`;
    const wrapper = document.createElement('div');
    let current = startNode.nextSibling;
    const nodes = [];

    wrapper.setAttribute(attribute, '');

    while (current) {
      const next = current.nextSibling;

      if (getMarkerName(current) === endMarker) {
        nodes.forEach(node => wrapper.append(node));
        current.remove();
        startNode.replaceWith(wrapper);
        return;
      }

      nodes.push(current);
      current = next;
    }
  }

  function wrapMarkedRegions() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT);
    const markers = [];

    while (walker.nextNode()) {
      const marker = getMarkerName(walker.currentNode);
      Object.keys(markerMap).forEach(name => {
        if (marker === `${name}:start`) {
          markers.push({ node: walker.currentNode, name, attribute: markerMap[name] });
        }
      });
    }

    markers.forEach(({ node, name, attribute }) => {
      if (node.isConnected) wrapMarkedRegion(node, name, attribute);
    });
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
    document.body.classList.toggle('teldrive-portal-open', isOpen);

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
    wrapMarkedRegions();

    const portal = getPortal();
    if (!portal) {
      document.body.classList.remove('teldrive-portal-open');
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
