window.chiruCacheReady=(async()=>{
 if(!('serviceWorker' in navigator))return;
 const controlled=Boolean(navigator.serviceWorker.controller);
 const registrations=await navigator.serviceWorker.getRegistrations();
 await Promise.all(registrations.map(registration=>registration.unregister()));
 if('caches' in window){const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('chiru-')).map(key=>caches.delete(key)))}
 // A removed worker can still control this document until the next navigation.
 // Never make authenticated API requests through the old cache-everything worker.
 if(controlled){location.reload();await new Promise(()=>{})}
})();
