var CACHE = "ai-nutrition-v1";
var FILES = ["/", "/index.html"];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return c.addAll(FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);})
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(e){
  // Only cache GET requests for our domain
  if(e.request.method!=="GET") return;
  if(e.request.url.indexOf("/api/")>=0) return; // Never cache API calls
  
  e.respondWith(
    fetch(e.request).then(function(res){
      if(res.status===200){
        var clone=res.clone();
        caches.open(CACHE).then(function(c){c.put(e.request,clone);});
      }
      return res;
    }).catch(function(){
      return caches.match(e.request);
    })
  );
});
