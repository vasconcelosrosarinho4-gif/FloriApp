export function updateConnectionStatus(element, isOnline) {
  if (!element) return;

  element.dataset.online = String(isOnline);
  element.textContent = isOnline
    ? 'Ligação disponível'
    : 'Sem ligação. A aplicação continua disponível offline.';
}
