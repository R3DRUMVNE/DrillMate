import {menuOption} from "./objects/menuOption.js";
import {linkNewStylesheet, createElement, appToast, scrollController} from "./modules/otherModules.js";
import {startSchetoVodModule} from "./schetovod.js";
import {startDaiCamlockModule} from "./daicamlock.js";
import {startTehPasModule} from "./tehpas.js";
import {mainStr} from "./objects/strings.js";
import {destroyAllTempElements, destroyTimer} from "./modules/bufferModule.js";
import {appTheme} from "./objects/colors.js";
import {startProkachaikaModule} from "./prokachaika.js";

let title = document.querySelector("#programTitle");
let menuButton = document.querySelector("#menuButton");
let settingsInfoButton = document.querySelector("#settingsInfoButton");

let fragmentDiv = document.querySelector("#fragmentDiv");

let addons = {
    clear: function() {
        for(let i in this.list){
            this.list[i] = null;
        }
    },
    list: {
        URLCamlock: null,
        URLPumpModel: null,
    }
};

menuButton.onclick = function () {
    destroyAllTempElements();
    destroyTimer("flowRateTimer");
    history.pushState(null, null, "/DrillMate/");
    addons.clear();
    createMenuButtons();
    title.innerHTML = "DrillMate - маленький помощник бурильщика";
    window.scrollTo(0, 0);
}

settingsInfoButton.onclick = function () {
    showSettingsInfo();
}

document.addEventListener('DOMContentLoaded', () => {
    appTheme.change(localStorage.getItem('appTheme'));
    checkURLParams();
});

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

function checkURLParams(){

    const URLParams = new URLSearchParams(window.location.search);
    if(URLParams.get("module") !== null){
        let moduleFound = false;
        for(let i = 0; i < menuOption.length; i++){
            if(menuOption[i].id === URLParams.get('module')){
                moduleFound = true;
                addons.list.URLCamlock = URLParams.get("camlock");
                addons.list.URLPumpModel = URLParams.get("pumpModel");
                loadProg(menuOption[i].id, menuOption[i].name, addons.list);
            }
        }
        if(!moduleFound){
            appToast("Ошибка: указанный модуль не найден", 3000).then();
            menuButton.click();
        }
    }else{
        menuButton.click();
    }
}

function createMenuButtons() {
    fragmentDiv.innerHTML = "";
    let menuDiv = createElement(fragmentDiv, "div", "id=menuDiv");

    let menuOptionDiv = [];
    for (let i = 0; i < menuOption.length; i++) {
        menuOptionDiv[i] = createElement(menuDiv, "div", "id=" + menuOption[i].id + " / module-name=" + menuOption[i].name + " / class=menuOption");

        createElement(menuOptionDiv[i], "img", "class=image / src=./assets/" + menuOptionDiv[i].id + ".svg");

        createElement(menuOptionDiv[i], "div", "class=header", menuOptionDiv[i].getAttribute("module-name"));

        createElement(menuOptionDiv[i], "div", "class=description", menuOption[i].description);

        menuOptionDiv[i].onclick = function () {
            loadProg(this.id, this.getAttribute("module-name"), addons.list);
        }
    }
}

function loadProg(menuButtonId, moduleName, addons) {
    fragmentDiv.innerHTML = "";
    title.innerHTML = "DrillMate - " + moduleName;
    linkNewStylesheet(menuButtonId + "Adaptive");
    linkNewStylesheet(menuButtonId);
    switch (menuButtonId) {
        case "schetovod":
            startSchetoVodModule(fragmentDiv, moduleName, menuButtonId);
            break;
        case "daicamlock":
            startDaiCamlockModule(fragmentDiv, moduleName, menuButtonId, addons);
            break;
        case "tehpas":
            linkNewStylesheet(menuButtonId+"Print");
            startTehPasModule(fragmentDiv, moduleName, menuButtonId);
            break;
        case "prokachaika":
            startProkachaikaModule(fragmentDiv, moduleName, menuButtonId, addons);
            break;
    }
    window.scrollTo(0, 0);
}

function showSettingsInfo() {
    scrollController.disableBodyScrolling();
    let settingsInfoContainer = createElement(document.body, "div", "id=settingsInfoContainer / class=unPadContainer popUp");

    createElement(settingsInfoContainer, "div", "id=settingsInfoHeader / class=defaultContainer", mainStr);

    let itemsContainer = createElement(settingsInfoContainer, "div", "class=itemsContainer");

    createElement(itemsContainer, "div", "id=infoText", mainStr);

    let themeSelectContainer = createElement(itemsContainer, "div", "id=themeSelectContainer / class=inpContainer");
    createElement(themeSelectContainer, "label", "id=themeSelectLabel", mainStr);
    let themeSelect = createElement(themeSelectContainer, "select", "id=themeSelect", mainStr);
    themeSelect.value = localStorage.getItem("appTheme");
    themeSelect.onchange = function () {
        appTheme.change(themeSelect.value);
    }

    let bugButton = createElement(itemsContainer, "div", "id=bugButton / class=iconButton", mainStr);
    createElement(bugButton, "img", "id=bugButtonImg / src=./assets/bugReport.svg");
    bugButton.onclick = function () {
        settingsInfoContainer.remove();
        showBugReport();
    }

    let downloadButton = createElement(itemsContainer, "div", "id=downloadButton / class=iconButton", mainStr);
    createElement(downloadButton, "img", "id=downloadButtonImg / src=./assets/download.svg");
    downloadButton.onclick = function () {
        window.open('https://github.com/R3DRUMVNE/DrillMate/releases/', '_blank');
    }

    let closeButton = createElement(itemsContainer, "button", "id=closeButton", mainStr);
    closeButton.onclick = function () {
        scrollController.enableBodyScrolling();
        settingsInfoContainer.remove();
    }
}

function showBugReport() {
    let bugReportContainer = createElement(document.body, "div", "id=bugReportContainer / class=unPadContainer popUp");

    createElement(bugReportContainer, "div", "id=bugReportHeader / class=defaultContainer ", mainStr);

    let itemsContainer = createElement(bugReportContainer, "div", "class=itemsContainer");

    createElement(itemsContainer, "label", "id=bugReportInfo", mainStr);

    let clientInfo = "ОС: "+getOS()+"<br>Браузер: "+getBrowser().name+" ver "+getBrowser().version+"<br>Viewport: "+window.innerWidth+"x"+window.innerHeight+"<br>Режим: "+getStatus();
    let clientInfoContainer = createElement(itemsContainer, "div", "id=clientInfoContainer / class=defaultContainer", clientInfo);

    let copyButton = createElement(itemsContainer, "button", "id=copyButton", mainStr);
    copyButton.onclick = function () {
        navigator.clipboard.writeText(clientInfoContainer.innerHTML.replaceAll("<br>", "\n")).then(async function () {
            appToast("Текст успешно скопирован в буфер обмена!", 3000).then(() => {
                window.open('https://t.me/r3drumvne/', '_blank');
            });

        }, function() {
            appToast("Произошла ошибка при копировании текста", 1500).then();
        });
    }

    let closeButton = createElement(itemsContainer, "button", "id=closeButton", mainStr);
    closeButton.onclick = function () {
        scrollController.enableBodyScrolling();
        bugReportContainer.remove();
    }
}

function getStatus(){
    if(window.location.href==="https://r3drumvne.github.io/DrillMate/" || window.location.href==="https://r3drumvne.github.io/DrillMate/index.html"){
        return "Онлайн";
    }
    return "Офлайн";
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