const DATABASE_NAME = 'floriapp';
const DATABASE_VERSION = 4;

export function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB não está disponível neste navegador.'));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains('flowers')) database.createObjectStore('flowers', { keyPath: 'id' });
      if (!database.objectStoreNames.contains('activities')) database.createObjectStore('activities', { keyPath: 'id' });
      if (!database.objectStoreNames.contains('tasks')) database.createObjectStore('tasks', { keyPath: 'id' });
      if (!database.objectStoreNames.contains('plants')) database.createObjectStore('plants', { keyPath: 'id' });
      if (!database.objectStoreNames.contains('educators')) database.createObjectStore('educators', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllRecords(storeName) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const request = database.transaction(storeName, 'readonly').objectStore(storeName).getAll();
    request.onsuccess = () => { database.close(); resolve(request.result); };
    request.onerror = () => { database.close(); reject(request.error); };
  });
}

export async function saveRecord(storeName, record) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).put(record);
    transaction.oncomplete = () => { database.close(); resolve(record); };
    transaction.onerror = () => { database.close(); reject(transaction.error); };
  });
}

export async function deleteRecord(storeName, id) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    transaction.objectStore(storeName).delete(id);
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transaction.error); };
  });
}
