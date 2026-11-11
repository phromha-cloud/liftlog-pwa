const DB_NAME = "liftlog-pwa";
const STORE = "state";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onblocked = () => reject(new Error('database-blocked'));
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// State and its generation share a transaction; revision is not part of backups.
export async function loadSnapshot() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE);
    const store = tx.objectStore(STORE), data = store.get("app"), rev = store.get("revision");
    tx.oncomplete = () => { db.close(); resolve({state:data.result ?? null, revision:rev.result ?? 0}); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error("read-aborted")); };
  });
}
export async function loadState() { return (await loadSnapshot()).state; }

export async function saveState(state, expectedRevision) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite"), store = tx.objectStore(STORE);
    let next, failure;
    tx.onabort = () => { db.close(); reject(failure || tx.error || new Error("save-aborted")); };
    tx.oncomplete = () => { db.close(); resolve(next); };
    const read = store.get("revision");
    read.onsuccess = () => {
      const current = read.result ?? 0;
      if (expectedRevision !== undefined && current !== expectedRevision) {
        failure = new Error("stale-state"); tx.abort(); return;
      }
      next = current + 1;
      try {
        store.put(state, "app"); store.put(next, "revision");
      } catch (error) { failure = error; try { tx.abort(); } catch {} }
    };
  });
}

export async function requestPersistentStorage() {
  if (!navigator.storage?.persist) return false;
  return navigator.storage.persist();
}

export async function isStoragePersistent() {
  if (!navigator.storage?.persisted) return false;
  return navigator.storage.persisted();
}
