import {
    linkNewStylesheet,
    appToast,
    scrollController,
    getJSONData,
    appTheme_change,
    appTheme_getThemes,
    animateElement,
    appSettings,
    createElement,
    createSwitchContainer
} from "./moduleScripts/jointScripts.js";
import {startSchetoVodModule} from "./schetovod.js";
import {startDaiCamlockModule} from "./daicamlock.js";
import {startTehPasModule} from "./tehpas.js";
import {destroyAllTempElements, destroyAllTimers} from "./moduleScripts/buffer.js";
import {startProkachaikaModule} from "./prokachaika.js";

let title = document.querySelector("#programTitle");
let menuButton = document.querySelector("#menuButton");
let settingsInfoButton = document.querySelector("#settingsInfoButton");
let main = document.querySelector("main");

const version = "1.2.0";
let mainStringList = null;

const menu = {
    map: null,
    alreadyIn: null,
    createMenuButtons: function () {
        if (this.alreadyIn === null || this.alreadyIn === undefined) {
            createButtons();
        } else if (!this.alreadyIn) {
            animateElement(main, ["main_close_startAnim"], ["main_close_endAnim"]).then(() => {
                createButtons();
            });
        }

        function createButtons() {
            menu.alreadyIn = true;
            window.scrollTo(0, 0);
            main.innerHTML = "";
            let menuDiv = createElement(main, "article", {id: "menu"});

            for (let key in menu.map) {
                let menuOptionContainer = createElement(menuDiv, "section", {id: key, class: "menuOption"});

                createElement(menuOptionContainer, "img", {
                    class: "image",
                    src: "./assets/" + key + ".svg",
                    alt: menu.map[key].name
                });

                createElement(menuOptionContainer, "div", {class: "header"}, menu.map[key].name);

                createElement(menuOptionContainer, "div", {class: "description"}, menu.map[key].description);

                menuOptionContainer.onclick = function () {
                    menu.alreadyIn = false;
                    loadModule(this.id, addons.list).then();
                }
            }
            animateElement(main, ["main_open_startAnim"], ["main_open_endAnim"]).then();
        }
    }
};

let addons = {
    clear: function () {
        for (let i in this.list) {
            this.list[i] = null;
        }
    },
    list: {
        URLCamlock: null,
        URLPumpModel: null,
    }
};

function menuButtonChange(parameter){
    if(parameter){
        menuButton.classList.add("menuButtonFixed");
    }else{
        menuButton.classList.remove("menuButtonFixed_end");
        menuButton.classList.remove("menuButtonFixed");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    appSettings.check();
    await appTheme_getThemes("./objects/themesList.json");
    appTheme_change(appSettings.keys.appTheme);
    mainStringList = await getJSONData("./objects/mainStringList.json");
    menu.map = await getJSONData("./objects/menuMap.json");
    menuButtonChange(appSettings.keys.menuButtonFixed);
    animateElement(document.querySelector("#programHeader"), ["programHeader_startAnim"], ["programHeader_endAnim"]).then(() => {
        checkURL();
        appSettings.keys.menuButtonFixed ? animateElement(menuButton, ["menuButtonFixed_start"], ["menuButtonFixed_end"]).then() : null;
    });
});
window.onbeforeunload = function (e) {
    e.preventDefault();
    window.scrollTo(0, 0);
    if(isMobile() && appSettings.keys.confirmExit){
        return true;
    }
};

menuButton.onclick = function () {
    destroyAllTempElements();
    destroyAllTimers();
    history.replaceState(null, null, "/DrillMate/");
    addons.clear();
    menu.createMenuButtons();
    title.innerHTML = "DrillMate - маленький помощник бурильщика";
}

settingsInfoButton.onclick = function () {
    showSettingsInfo();
}

function checkURL() {
    const URLParams = new URLSearchParams(window.location.search);
    if (URLParams.get("module") !== null) {
        let moduleFound = false;
        for (let key in menu.map) {
            if (key === URLParams.get("module")) {
                moduleFound = true;
                addons.list.URLCamlock = URLParams.get("camlock");
                addons.list.URLPumpModel = URLParams.get("pumpModel");
                loadModule(key, addons.list, true).then();
            }
        }
        if (!moduleFound) {
            appToast("Ошибка: указанный модуль не найден", 3000).then();
            menuButton.click();
        }
    } else {
        menuButton.click();
    }
}

export async function loadModule(id, addons, skipAnimations) {
    if(!skipAnimations) await animateElement(main, ["main_close_startAnim"], ["main_close_endAnim"]);
    main.innerHTML = "";
    title.innerHTML = "DrillMate - " + menu.map[id].name;
    linkNewStylesheet(id + "Adaptive");
    linkNewStylesheet(id);
    switch (id) {
        case "schetovod":
            startSchetoVodModule(main, menu.map[id].name, id).then();
            break;
        case "daicamlock":
            startDaiCamlockModule(main, menu.map[id].name, id, addons).then();
            break;
        case "tehpas":
            linkNewStylesheet(id + "Print");
            startTehPasModule(main, menu.map[id].name, id).then();
            break;
        case "prokachaika":
            startProkachaikaModule(main, menu.map[id].name, id, addons).then();
            break;
    }
    window.scrollTo(0, 0);
    animateElement(main, ["main_open_startAnim"], ["main_open_endAnim"]).then();
}

function showSettingsInfo() {
    scrollController.disableBodyScrolling();
    let settingsInfoContainer = createElement(document.body, "div", {
        id: "settingsInfoContainer",
        class: "unPadContainer popUp"
    });

    createElement(settingsInfoContainer, "div", {id: "settingsInfoHeader", class: "defaultContainer"}, mainStringList);

    let itemsContainer = createElement(settingsInfoContainer, "div", {class: "itemsContainer"});

    createElement(itemsContainer, "div", {id: "infoText"}, mainStringList["infoText"][0] + version + mainStringList["infoText"][1]);

    let settingsContainer = createElement(itemsContainer, "div", {id: "settingsContainer"});

    createElement(settingsContainer, "span", {id: "settingsHeader"}, mainStringList);
    let settingsItems = createElement(settingsContainer, "div", {id: "settingsItems"});

    let themeSelectContainer = createElement(settingsItems, "div", {id: "themeSelectContainer", class: "inpContainer"});
    createElement(themeSelectContainer, "span", {id: "themeSelectSpan"}, mainStringList);
    let themeSelect = createElement(themeSelectContainer, "select", {id: "themeSelect"}, mainStringList);
    themeSelect.value = appSettings.keys.appTheme;
    themeSelect.onchange = function () {
        appTheme_change(themeSelect.value);
        appSettings.set("appTheme", themeSelect.value);
    }

    let animCheckbox = createSwitchContainer(settingsItems, {}, {id: "animCheckbox"}, {id: "animCheckboxLabel"}, mainStringList);
    animCheckbox.checked = appSettings.keys.animations;
    animCheckbox.onchange = function () {
        appSettings.set("animations", animCheckbox.checked);
    }

    let assistantCheckbox = createSwitchContainer(settingsItems, {}, {id: "assistantCheckbox"}, {id: "assistantCheckboxLabel"}, mainStringList);
    assistantCheckbox.checked = appSettings.keys.assistant;
    assistantCheckbox.onchange = function () {
        appSettings.set("assistant", assistantCheckbox.checked);
        appToast("Изменения будут применены при следующем входе в раздел", 3000).then();
    }

    if(isMobile()){
        let menuButtonFixedCheckbox = createSwitchContainer(settingsItems, {}, {id: "menuButtonFixedCheckbox"}, {id: "menuButtonFixedCheckboxLabel"}, mainStringList);
        menuButtonFixedCheckbox.checked = appSettings.keys.menuButtonFixed;
        menuButtonFixedCheckbox.onchange = function () {
            appSettings.set("menuButtonFixed", menuButtonFixedCheckbox.checked);
            menuButtonChange(appSettings.keys.menuButtonFixed);
            animateElement(menuButton, ["menuButtonFixed_start"], ["menuButtonFixed_end"]).then()
        }

        let confirmExitCheckbox = createSwitchContainer(settingsItems, {}, {id: "confirmExitCheckbox"}, {id: "confirmExitCheckboxLabel"}, mainStringList);
        confirmExitCheckbox.checked = appSettings.keys.confirmExit;
        confirmExitCheckbox.onchange = function () {
            appSettings.set("confirmExit", confirmExitCheckbox.checked);
        }
    }

    let bugButton = createElement(itemsContainer, "button", {id: "bugButton", class: "iconButton"}, mainStringList);
    createElement(bugButton, "img", {id: "bugButtonImg", src: "./assets/bugReport.svg"});
    bugButton.onclick = function () {
        animateElement(settingsInfoContainer, ["popUp_close_start"], ["popUp_close_end"]).then(() => {
            settingsInfoContainer.remove();
            showBugReport();
        });
    }

    let downloadButton = createElement(itemsContainer, "button", {
        id: "downloadButton",
        class: "iconButton"
    }, mainStringList);
    createElement(downloadButton, "img", {id: "downloadButtonImg", src: "./assets/download.svg"});
    downloadButton.onclick = function () {
        window.open("https://github.com/R3DRUMVNE/DrillMate/wiki", '_blank');
    }

    let closeButton = createElement(itemsContainer, "button", {id: "closeButton"}, mainStringList);
    closeButton.onclick = function () {
        animateElement(settingsInfoContainer, ["popUp_close_start"], ["popUp_close_end"]).then(() => {
            scrollController.enableBodyScrolling();
            settingsInfoContainer.remove();
        });
    }
    animateElement(settingsInfoContainer, ["popUp_open_start"], ["popUp_open_end"]).then();
}

function showBugReport() {
    let bugReportContainer = createElement(document.body, "div", {
        id: "bugReportContainer",
        class: "unPadContainer popUp"
    });

    createElement(bugReportContainer, "div", {id: "bugReportHeader", class: "defaultContainer"}, mainStringList);

    let itemsContainer = createElement(bugReportContainer, "div", {class: "itemsContainer"});

    createElement(itemsContainer, "span", {id: "bugReportInfo"}, mainStringList);

    let clientInfo = "ОС: " + getOS() + "<br>Браузер: " + getBrowser().name + " ver " + getBrowser().version + "<br>Viewport: " + window.innerWidth + "x" + window.innerHeight + "<br>Режим: " + getStatus();
    let clientInfoContainer = createElement(itemsContainer, "div", {
        id: "clientInfoContainer",
        class: "defaultContainer"
    }, clientInfo);

    let copyButton = createElement(itemsContainer, "button", {id: "copyButton"}, mainStringList);
    copyButton.onclick = function () {
        navigator.clipboard.writeText(clientInfoContainer.innerHTML.replaceAll("<br>", "\n")).then(async function () {
            appToast("Скопировано в буфер обмена", 3000).then(() => {
                window.open("https://t.me/r3drumvne/", '_blank');
            });

        }, function () {
            appToast("Произошла ошибка при копировании текста", 1500).then();
        });
    }

    let closeButton = createElement(itemsContainer, "button", {id: "closeButton"}, mainStringList);
    closeButton.onclick = function () {
        animateElement(bugReportContainer, ["popUp_close_start"], ["popUp_close_end"]).then(() => {
            scrollController.enableBodyScrolling();
            bugReportContainer.remove();
        });
    }
    animateElement(bugReportContainer, ["popUp_open_start"], ["popUp_open_end"]).then();
}

function getStatus() {
    return navigator.onLine ? "Онлайн" : "Офлайн";
}

function getOS() {
    let userDeviceArray = [
        {device: 'Android', platform: /Android/},
        {device: 'iPhone', platform: /iPhone/},
        {device: 'iPad', platform: /iPad/},
        {device: 'Symbian', platform: /Symbian/},
        {device: 'Windows Phone', platform: /Windows Phone/},
        {device: 'Tablet OS', platform: /Tablet OS/},
        {device: 'Linux', platform: /Linux/},
        {device: 'Windows', platform: /Windows NT/},
        {device: 'Macintosh', platform: /Macintosh/}
    ];

    for (let i = 0; i < userDeviceArray.length; i++) {
        if (userDeviceArray[i].platform.test(navigator.userAgent)) {
            return userDeviceArray[i].device;
        }
    }
    return "Unknown";
}

function getBrowser() {
    const userAgent = navigator.userAgent;
    const browserName = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
    const browser = {};

    if (/trident/i.test(browserName[0])) {
        const rv = /\brv[ :]+(\d+)/g.exec(userAgent) || [];
        browser.name = "IE";
        browser.version = rv[1];
    } else {
        browser.name = browserName[1] ? browserName[1] : null;
        browser.version = browserName[2] ? browserName[2] : null;
    }

    if (browser.name === null || browser.version === null) {
        return 'Unknown Browser';
    }
    return browser;
}

function isMobile() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}
