const CACHE_NAME = "drillmate_cache";

const static_assets = [
    ".",
    "./index.html",
    "./assets/favicon.svg",
    "./assets/daicamlock/camlockFather_ExternalThread.png",
    "./assets/daicamlock/camlockFather_HoseFitting.png",
    "./assets/daicamlock/camlockFather_InternalThread.png",
    "./assets/daicamlock/camlockFather_Stub.png",
    "./assets/daicamlock/camlockMother_ExternalThread.png",
    "./assets/daicamlock/camlockMother_HoseFitting.png",
    "./assets/daicamlock/camlockMother_InternalThread.png",
    "./assets/daicamlock/camlockMother_Stub.png",
    "./assets/share/tg.png",
    "./assets/share/vk.png",
    "./assets/shops/lp.png",
    "./assets/shops/ozon.png",
    "./assets/shops/vi.png",
    "./assets/shops/wb.png",
    "./assets/shops/ym.png",
    "./assets/bugReport.svg",
    "./assets/daicamlock.svg",
    "./assets/download.svg",
    "./assets/gidrohod.svg",
    "./assets/menuButton.svg",
    "./assets/moduleHint.svg",
    "./assets/prokachaika.svg",
    "./assets/schetovod.svg",
    "./assets/settingsInfo.svg",
    "./assets/share.svg",
    "./assets/tehpas.svg",
    "./objects/camlockImageSizesList.json",
    "./objects/camlockTypeList.json",
    "./objects/daicamlockStringList.json",
    "./objects/mainStringList.json",
    "./objects/menuMap.json",
    "./objects/moduleHintStringList.json",
    "./objects/newPumps.json",
    "./objects/passportMap.json",
    "./objects/prokachaikaStringList.json",
    "./objects/pumpList.json",
    "./objects/schetovodStringList.json",
    "./objects/tehpasStringList.json",
    "./objects/themesList.json",
    "./scripts/moduleScripts/bufferModule.js",
    "./scripts/moduleScripts/otherModules.js",
    "./scripts/app.js",
    "./scripts/daicamlock.js",
    "./scripts/main.js",
    "./scripts/prokachaika.js",
    "./scripts/schetovod.js",
    "./scripts/tehpas.js",
    "./styles/daicamlock.css",
    "./styles/daicamlockAdaptive.css",
    "./styles/dsPrint.css",
    "./styles/main.css",
    "./styles/mainAdaptive.css",
    "./styles/osPrint.css",
    "./styles/prokachaika.css",
    "./styles/prokachaikaAdaptive.css",
    "./styles/schetovod.css",
    "./styles/schetovodAdaptive.css",
    "./styles/tehpas.css",
    "./styles/tehpasAdaptive.css",
    "./styles/tehpasPrint.css",
];

self.addEventListener("install",  (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => {
        cache.addAll(static_assets).then(() => {
            console.log("SW - Cache has been created: " + CACHE_NAME);
        });
        })
    );


    /*const cache = await caches.open(CACHE_NAME);
    await cache.addAll(static_assets);
    console.log("SW - Cache has been created: " + CACHE_NAME);
    await self.skipWaiting();*/
});

self.addEventListener("activate",  (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
    event.respondWith(fromCache(event.request));

    event.waitUntil(update(event.request));


    /*event.respondWith(
        (async () => {
            try {
                const response = await fetch(event.request);
                console.log("SW - Resource loaded from web: " + event.request.url);

                const cache = await caches.open(CACHE_NAME);
                cache.put(event.request, response.clone()).then(() => {
                    console.log("SW - Resource has been cached: " + event.request.url);
                });

                return response;
            } catch (error) {
                const cachedResponse = await caches.match(event.request);
                if (cachedResponse) {
                    console.log("SW - Resource loaded from cache: " + cachedResponse.url);
                    return cachedResponse;
                }
            }
        })()
    );*/
});

function fromCache(request) {
    return caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((matching) =>
            matching || Promise.reject("no-match")
        ));
}

function update(request) {
    return caches.open(CACHE_NAME).then((cache) =>
        fetch(request).then((response) => {
                cache.put(request, response).then(() => {
                    console.log("SW - Resource cache updated: " + request.url);
                });
        })
    );
}