import {menuOption} from "./objects/menuOption.js";
import {linkNewStylesheet, newEl, appToast, scrollController} from "./modules/otherModules.js";
import {startSchetoVodModule} from "./schetovod.js";
import {startDaiCamlockModule} from "./daicamlock.js";
import {startTehPasModule} from "./tehpas.js";
import {mainStr} from "./objects/strings.js";
import {destroyAllTempElements, destroyTimer} from "./modules/bufferModule.js";
import {appTheme} from "./objects/colors.js";

let title = document.querySelector("#programTitle");
let menuButton = document.querySelector("#menuButton");
let aboutProgramButton = document.querySelector("#aboutProgramButton");

let fragmentDiv = document.querySelector("#fragmentDiv");

menuButton.onclick = function () {
    destroyAllTempElements();
    destroyTimer("flowRateTimer");
    createMenuButtons();
    title.innerHTML = "DrillMate - маленький помощник бурильщика";
    window.scrollTo(0, 0);
}
menuButton.click();

aboutProgramButton.onclick = function () {
    showAbout();
}

document.addEventListener('DOMContentLoaded', () => {
    appTheme.change(localStorage.getItem('appTheme'));
});

window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};


function createMenuButtons() {
    fragmentDiv.innerHTML = "";
    let menuDiv = newEl(fragmentDiv, "div", "id=menuDiv");

    let menuOptionDiv = [];
    for (let i = 0; i < menuOption.length; i++) {
        menuOptionDiv[i] = newEl(menuDiv, "div", "id=" + menuOption[i].id + " / module-name=" + menuOption[i].name + " / class=" + menuOption[i].class);

        newEl(menuOptionDiv[i], "img", "class=image / src=./assets/" + menuOptionDiv[i].id + ".svg");

        newEl(menuOptionDiv[i], "div", "class=header", menuOptionDiv[i].getAttribute("module-name"));

        newEl(menuOptionDiv[i], "div", "class=description", menuOption[i].description);

        menuOptionDiv[i].onclick = function () {
            loadProg(this);
        }
    }
}

function loadProg(clickedDiv) {
    fragmentDiv.innerHTML = "";
    switch (clickedDiv.id) {
        case "schetovod": {
            linkNewStylesheet(clickedDiv.id + "Adaptive");
            linkNewStylesheet(clickedDiv.id);
            startSchetoVodModule(fragmentDiv, clickedDiv.getAttribute("module-name"), clickedDiv.id);
            title.innerHTML = "DrillMate - " + clickedDiv.getAttribute("module-name");
            break;
        }
        case "daicamlock": {
            linkNewStylesheet(clickedDiv.id + "Adaptive");
            linkNewStylesheet(clickedDiv.id);
            startDaiCamlockModule(fragmentDiv, clickedDiv.getAttribute("module-name"), clickedDiv.id);
            title.innerHTML = "DrillMate - " + clickedDiv.getAttribute("module-name");
            break;
        }
        case "tehpas": {
            linkNewStylesheet(clickedDiv.id+"Print");
            linkNewStylesheet(clickedDiv.id + "Adaptive");
            linkNewStylesheet(clickedDiv.id);
            startTehPasModule(fragmentDiv, clickedDiv.getAttribute("module-name"), clickedDiv.id);
            title.innerHTML = "DrillMate - " + clickedDiv.getAttribute("module-name");
            break;
        }
    }
    window.scrollTo(0, 0);
}

function showAbout() {
    scrollController.disableScrolling();
    let infoContainer = newEl(document.body, "div", "id=infoContainer / class=unPadContainer popUp");

    newEl(infoContainer, "div", "id=infoHeader / class=defaultContainer", mainStr);

    let itemsContainer = newEl(infoContainer, "div", "class=itemsContainer");

    newEl(itemsContainer, "div", "id=infoText", mainStr);

    let themeSelectContainer = newEl(itemsContainer, "div", "id=themeSelectContainer / class=inpContainer");
    newEl(themeSelectContainer, "label", "id=themeSelectLabel", mainStr);
    let themeSelect = newEl(themeSelectContainer, "select", "id=themeSelect", mainStr);
    themeSelect.value = localStorage.getItem("appTheme");
    themeSelect.onchange = function () {
        appTheme.change(themeSelect.value);
    }

    let bugButton = newEl(itemsContainer, "div", "id=bugButton / class=iconButton", mainStr);
    newEl(bugButton, "img", "id=bugButtonImg / src=./assets/bugReport.svg");
    bugButton.onclick = function () {
        infoContainer.remove();
        showBugReport();
    }

    let downloadButton = newEl(itemsContainer, "div", "id=downloadButton / class=iconButton", mainStr);
    newEl(downloadButton, "img", "id=downloadButtonImg / src=./assets/download.svg");
    downloadButton.onclick = function () {
        window.open('https://github.com/R3DRUMVNE/DrillMate/releases/', '_blank');
    }

    let closeButton = newEl(itemsContainer, "button", "id=closeButton", mainStr);
    closeButton.onclick = function () {
        scrollController.enableScrolling();
        infoContainer.remove();
    }
}

function showBugReport() {
    let bugReportContainer = newEl(document.body, "div", "id=bugReportContainer / class=unPadContainer popUp");

    newEl(bugReportContainer, "div", "id=bugReportHeader / class=defaultContainer ", mainStr);

    let itemsContainer = newEl(bugReportContainer, "div", "class=itemsContainer");

    newEl(itemsContainer, "label", "id=bugReportInfo", mainStr);

    let clientInfo = "ОС: "+getOS()+"<br>Браузер: "+getBrowser().name+" ver "+getBrowser().version+"<br>Viewport: "+window.innerWidth+"x"+window.innerHeight+"<br>Режим: "+getStatus();
    let clientInfoContainer = newEl(itemsContainer, "div", "id=clientInfoContainer / class=defaultContainer", clientInfo);

    let copyButton = newEl(itemsContainer, "button", "id=copyButton", mainStr);
    copyButton.onclick = function () {
        navigator.clipboard.writeText(clientInfoContainer.innerHTML.replaceAll("<br>", "\n")).then(async function () {
            appToast("Текст успешно скопирован в буфер обмена!", 3000).then(() => {
                window.open('https://t.me/r3drumvne/', '_blank');
            });

        }, function() {
            appToast("Произошла ошибка при копировании текста", 1500).then();
        });
    }

    let closeButton = newEl(itemsContainer, "button", "id=closeButton", mainStr);
    closeButton.onclick = function () {
        scrollController.enableScrolling();
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