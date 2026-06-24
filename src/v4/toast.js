// Lightweight toast — a single host container; each node self-removes after a
// timeout. Framework-agnostic, ported from the original template.

let host;
function getHost() {
  if (host && host.isConnected) return host;
  host = document.createElement('div');
  host.className = 'toast-host';
  host.setAttribute('role', 'status');
  host.setAttribute('aria-live', 'polite');
  document.body.appendChild(host);
  return host;
}

export function showToast(message, opts = {}) {
  const { variant = 'default', duration = 2600 } = opts;
  const node = document.createElement('div');
  node.className = `toast toast-${variant}`;
  node.textContent = message;
  getHost().appendChild(node);

  node.getBoundingClientRect();
  node.classList.add('show');

  const dismiss = () => {
    node.classList.remove('show');
    node.addEventListener('transitionend', () => node.remove(), { once: true });
  };
  setTimeout(dismiss, duration);
  node.addEventListener('click', dismiss);
  return node;
}
