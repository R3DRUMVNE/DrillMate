const CACHE_NAME = "drillmate_cache(sw-1.2.1c)";

const static_assets = [
    ".",
    "./index.html",
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
    "./scripts/moduleScripts/buffer.js",
    "./scripts/moduleScripts/jointScripts.js",
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

    //==============ассеты в новой версии
    "./assets/favicons/favicon_48-48.png",
    "./assets/favicons/favicon_72-72.png",
    "./assets/favicons/favicon_96-96.png",
    "./assets/favicons/favicon_144-144.png",
    "./assets/favicons/favicon_192-192.png",
    "./assets/favicons/favicon_512-512.png",
    "./assets/schetovod/assistant_default.png",
    "./assets/schetovod/assistant_happy.png",
    "./assets/schetovod/assistant_surprised.png",
    "./objects/assistantPhrases.json",
];

self.addEventListener("install", async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(static_assets);
});

self.addEventListener("activate", async () => {
    const cachesKeys = await caches.keys();
    const checkKeys = cachesKeys.map(async key => {
        if (CACHE_NAME !== key) {
            await caches.delete(key);
            console.log("SW - cache deleted: " + key);
        }
    });
    await Promise.all(checkKeys);
    console.log("SW activated: " + CACHE_NAME);
});

self.addEventListener("fetch", event => {
    event.respondWith(caches.match(event.request).then(cachedResponse => {
        return cachedResponse || fetch(event.request);
    }));
});