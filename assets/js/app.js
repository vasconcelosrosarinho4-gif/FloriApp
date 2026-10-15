import { updateConnectionStatus } from './modules/UI.js';

const status = document.querySelector('#connection-status');

function refreshConnectionStatus() {
  updateConnectionStatus(status, navigator.onLine);
}

window.addEventListener('online', refreshConnectionStatus);
window.addEventListener('offline', refreshConnectionStatus);
refreshConnectionStatus();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(error => {
      console.error('Não foi possível registar o Service Worker:', error);
    });
  });
}
