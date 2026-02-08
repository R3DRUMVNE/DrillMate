import {clearModuleVariables, destroyAllTempElements, destroyAllTimers} from "./moduleScripts/buffer.js";
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
    createSwitchContainer, isExists, updateURL
} from "./moduleScripts/jointScripts.js";
import {startSchetoVodModule} from "./schetovod.js";
import {startDaiCamlockModule} from "./daicamlock.js";
import {startTehPasModule} from "./tehpas.js";
import {startProkachaikaModule} from "./prokachaika.js";

const title = document.querySelector("#programTitle");
const settingsInfoButton = document.querySelector("#settingsInfoButton");

const version = "1.3.0";
let mainStringList = null;

const menuController = {
    mode: {
        desktop: false,
        get: function () {
            menuController.mode.desktop = window.innerWidth >= 1024;
        }
    },
    module: {
        container: document.querySelector("#moduleContainer"),
        shown: false,
        scrollPosY: null,
        animation: ["module_hide", "module_show"],
    },
    menu: {
        button: document.querySelector("#menuButton"),
        container: document.querySelector("#menu"),
        map: null,
        shown: false,
        selectedOption: null,
        animation: ["menu_hide", "menu_show"],
        create: function (withInit) {
            if (!menuController.menu.created) {
                for (let key in menuController.menu.map) {
                    const menuOptionContainer = createElement(menuController.menu.container, "section", {
                        id: key,
                        class: "menuOption"
                    });

                    createElement(menuOptionContainer, "img", {
                        class: "image",
                        src: "./assets/" + key + ".svg",
                        alt: menuController.menu.map[key].name
                    });

                    createElement(menuOptionContainer, "div", {class: "header"}, menuController.menu.map[key].name);

                    createElement(menuOptionContainer, "div", {class: "description"}, menuController.menu.map[key].description);

                    menuOptionContainer.onclick = function () {
                        addons.clear();
                        loadModule(this, addons.list, menuController.mode.desktop).then();
                    }
                }
                menuController.menu.created = true;
                withInit ? menuController.init(menuController.menu).then() : null;
            }
        },
        toggle: function () {
            if (menuController.menu.shown) {
                menuController.menu.button.classList.remove("menuButton_active");
                menuController.hide(menuController.menu).then(() => {
                    menuController.show(menuController.module).then();
                    window.scrollTo(0, menuController.module.scrollPosY);
                });
            } else {
                menuController.menu.button.classList.add("menuButton_active");
                menuController.module.scrollPosY = window.scrollY;
                menuController.hide(menuController.module).then(() => {
                    window.scrollTo(0, 0);
                    menuController.show(menuController.menu).then();
                });
            }
        },
        selectOption: function (optionContainer) {
            isExists(menuController.menu.selectedOption) ? menuController.menu.selectedOption.classList.remove("menuOption_active") : null;
            menuController.menu.selectedOption = optionContainer;
            menuController.menu.selectedOption.classList.add("menuOption_active");
        }
    },
    gesture: {
        startX: null,
        startY: null,
        endX: null,
        endY: null,
        addListener: function () {
            if (isMobile()) {
                document.body.addEventListener("touchstart", (e) => {
                    menuController.gesture.startX = e.touches[0].clientX;
                    menuController.gesture.startY = e.touches[0].clientY;
                    //console.log("startX: " + menuController.gesture.startX + "\nstartY: " + menuController.gesture.startY);
                });
                document.body.addEventListener("touchmove", (e) => {
                    menuController.gesture.endX = e.touches[0].clientX;
                    menuController.gesture.endY = e.touches[0].clientY;
                });
                document.body.addEventListener("touchend", () => {
                    //console.log("endX: " + menuController.gesture.endX + "\nendY: " + menuController.gesture.endY);
                    //console.log("deltaX:" + (menuController.gesture.startX - menuController.gesture.endX) + "\ndeltaY: " + Math.abs(menuController.gesture.startY - menuController.gesture.endY));
                    if (menuController.gesture.startX - menuController.gesture.endX > 100 && Math.abs(menuController.gesture.startY - menuController.gesture.endY) <= 60 && !menuController.menu.shown) {
                        menuController.menu.button.onclick();
                    } else if (menuController.gesture.startX - menuController.gesture.endX < -100 && Math.abs(menuController.gesture.startY - menuController.gesture.endY) <= 60 && menuController.menu.shown) {
                        menuController.menu.button.onclick();
                    }
                });
            }
        }
    },
    init: function (object) {
        return new Promise((resolve) => {
            animateElement(object.container, ["menuController_init_startAnim"], ["menuController_init_endAnim"]).then(() => {
                object.shown = true;
                resolve();
            });
        });
    },
    show: function (object) {
        return new Promise((resolve) => {
            animateElement(object.container, [object.animation[1] + "_startAnim"], [object.animation[1] + "_endAnim"]).then(() => {
                object.shown = true;
                resolve();
            });
        });
    },
    hide: function (object) {
        return new Promise((resolve) => {
            animateElement(object.container, [object.animation[0] + "_startAnim"], [object.animation[0] + "_endAnim"]).then(() => {
                object.shown = false;
                resolve();
            });
        });
    },
};

menuController.menu.button.onclick = function () {
    menuController.module.container.id !== "moduleContainer" ? menuController.menu.toggle() : null;
}

const addons = {
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

function menuButtonChange(parameter) {
    if (parameter) {
        menuButton.classList.add("menuButtonFixed");
    } else {
        menuButton.classList.remove("menuButtonFixed_end");
        menuButton.classList.remove("menuButtonFixed");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    appSettings.check();
    await appTheme_getThemes("./objects/themesList.json");
    appTheme_change(appSettings.keys.appTheme);
    mainStringList = await getJSONData("./objects/mainStringList.json");
    menuController.menu.map = await getJSONData("./objects/menuMap.json");
    menuController.mode.get();
    menuController.gesture.addListener();
    menuButtonChange(appSettings.keys.menuButtonFixed);
    animateElement(document.querySelector("#programHeader"), ["programHeader_startAnim"], ["programHeader_endAnim"]).then(() => {
        checkURL();
        appSettings.keys.menuButtonFixed ? animateElement(menuButton, ["menuButtonFixed_start"], ["menuButtonFixed_end"]).then() : null;

    });
});
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

settingsInfoButton.onclick = function () {
    showSettingsInfo();
}

function checkURL() {
    const URLParams = new URLSearchParams(window.location.search);
    const URLModule = URLParams.get("module");
    if (isExists(URLModule)) {
        let moduleFound = false;
        for (let key in menuController.menu.map) {
            if (key === URLModule) {
                moduleFound = true;
                addons.list.URLCamlock = URLParams.get("camlock");
                addons.list.URLPumpModel = URLParams.get("pumpModel");
                menuController.menu.create(menuController.mode.desktop);
                loadModule(menuController.menu.container.querySelector("#" + key), addons.list, true).then();
            }
        }
        if (!moduleFound) {
            appToast("Ошибка: указанный раздел не найден", 3000).then();
            loadDefault();
        }
    } else {
        loadDefault();
    }

    function loadDefault() {
        menuController.menu.create(true);
        menuController.mode.desktop ? loadModule(menuController.menu.container.querySelector("#schetovod"), addons.list, true).then() : null;
    }
}

export async function loadModule(optionContainer, addons, skipMenuHiding) {
    title.innerHTML = "DrillMate - " + menuController.menu.map[optionContainer.id].name;
    linkNewStylesheet(optionContainer.id);
    linkNewStylesheet(optionContainer.id + "Adaptive");

    clearModuleVariables();
    destroyAllTempElements();
    destroyAllTimers();
    menuController.menu.button.classList.remove("menuButton_active");
    menuController.menu.selectOption(optionContainer);

    if (skipMenuHiding) {
        if (menuController.module.shown) {
            menuController.hide(menuController.module).then(async () => {
                await openModule();
            });
        } else {
            await openModule();
        }
    } else {
        menuController.hide(menuController.menu).then(async () => {
            await openModule();
        });
    }

    async function openModule() {
        updateURL({module: optionContainer.id});
        menuController.module.container.innerHTML = "";
        switch (optionContainer.id) {
            case "schetovod":
                await startSchetoVodModule(menuController.module.container, menuController.menu.map[optionContainer.id].name, optionContainer.id);
                break;
            case "daicamlock":
                await startDaiCamlockModule(menuController.module.container, menuController.menu.map[optionContainer.id].name, optionContainer.id, addons);
                break;
            case "tehpas":
                linkNewStylesheet(optionContainer.id + "Print");
                await startTehPasModule(menuController.module.container, menuController.menu.map[optionContainer.id].name, optionContainer.id);
                break;
            case "prokachaika":
                await startProkachaikaModule(menuController.module.container, menuController.menu.map[optionContainer.id].name, optionContainer.id, addons);
                break;
        }
        window.scrollTo(0, 0);
        skipMenuHiding ? menuController.init(menuController.module).then() : menuController.show(menuController.module).then();
    }
}

function showSettingsInfo() {
    scrollController.disableBodyScrolling().then();
    const settingsInfoContainer = createElement(document.body, "div", {
        id: "settingsInfoContainer",
        class: "unPadContainer popUp"
    });

    createElement(settingsInfoContainer, "div", {id: "settingsInfoHeader", class: "defaultContainer"}, mainStringList);

    const itemsContainer = createElement(settingsInfoContainer, "div", {class: "itemsContainer"});

    createElement(itemsContainer, "div", {id: "infoText"}, mainStringList["infoText"][0] + version + mainStringList["infoText"][1]);

    const settingsContainer = createElement(itemsContainer, "div", {id: "settingsContainer"});

    createElement(settingsContainer, "span", {id: "settingsHeader"}, mainStringList);
    const settingsItems = createElement(settingsContainer, "div", {id: "settingsItems"});

    const themeSelectContainer = createElement(settingsItems, "div", {
        id: "themeSelectContainer",
        class: "inpContainer"
    });
    createElement(themeSelectContainer, "span", {id: "themeSelectSpan"}, mainStringList);
    const themeSelect = createElement(themeSelectContainer, "select", {id: "themeSelect"}, mainStringList);
    themeSelect.value = appSettings.keys.appTheme;
    themeSelect.onchange = function () {
        appTheme_change(themeSelect.value);
        appSettings.set("appTheme", themeSelect.value);
    }

    const animCheckbox = createSwitchContainer(settingsItems, {}, {id: "animCheckbox"}, {id: "animCheckboxLabel"}, mainStringList);
    animCheckbox.checked = appSettings.keys.animations;
    animCheckbox.onchange = function () {
        appSettings.set("animations", animCheckbox.checked);
    }

    const assistantCheckbox = createSwitchContainer(settingsItems, {}, {id: "assistantCheckbox"}, {id: "assistantCheckboxLabel"}, mainStringList);
    assistantCheckbox.checked = appSettings.keys.assistant;
    assistantCheckbox.onchange = function () {
        appSettings.set("assistant", assistantCheckbox.checked);
        appToast("Изменения будут применены при следующем входе в раздел", 3000).then();
    }

    const tehpasSaveHistoryCheckbox = createSwitchContainer(settingsItems, {}, {id: "tehpasSaveHistoryCheckbox"}, {id: "tehpasSaveHistoryCheckboxLabel"}, mainStringList);
    tehpasSaveHistoryCheckbox.checked = appSettings.keys.tehpasSaveHistory;
    tehpasSaveHistoryCheckbox.onchange = function () {
        appSettings.set("tehpasSaveHistory", tehpasSaveHistoryCheckbox.checked);
    }

    if (isMobile()) {
        const menuButtonFixedCheckbox = createSwitchContainer(settingsItems, {}, {id: "menuButtonFixedCheckbox"}, {id: "menuButtonFixedCheckboxLabel"}, mainStringList);
        menuButtonFixedCheckbox.checked = appSettings.keys.menuButtonFixed;
        menuButtonFixedCheckbox.onchange = function () {
            appSettings.set("menuButtonFixed", menuButtonFixedCheckbox.checked);
            animateElement(menuButton, ["menuButtonFixed_start"], ["menuButtonFixed_end"]).then(() => {
                menuButtonChange(appSettings.keys.menuButtonFixed);
            });
        }
    }

    const bugButton = createElement(itemsContainer, "button", {id: "bugButton", class: "iconButton"}, mainStringList);
    createElement(bugButton, "img", {id: "bugButtonImg", src: "./assets/bugReport.svg"});
    bugButton.onclick = function () {
        animateElement(settingsInfoContainer, ["popUp_close_start"], ["popUp_close_end"]).then(() => {
            settingsInfoContainer.remove();
            showBugReport();
        });
    }

    const downloadButton = createElement(itemsContainer, "button", {
        id: "downloadButton",
        class: "iconButton"
    }, mainStringList);
    createElement(downloadButton, "img", {id: "downloadButtonImg", src: "./assets/download.svg"});
    downloadButton.onclick = function () {
        window.open("https://github.com/R3DRUMVNE/DrillMate/wiki", '_blank');
    }

    const closeButton = createElement(itemsContainer, "button", {id: "closeButton"}, mainStringList);
    closeButton.onclick = function () {
        animateElement(settingsInfoContainer, ["popUp_close_start"], ["popUp_close_end"]).then(() => {
            scrollController.enableBodyScrolling().then();
            settingsInfoContainer.remove();
        });
    }
    animateElement(settingsInfoContainer, ["popUp_open_start"], ["popUp_open_end"]).then();
}

function showBugReport() {
    const bugReportContainer = createElement(document.body, "div", {
        id: "bugReportContainer",
        class: "unPadContainer popUp"
    });

    createElement(bugReportContainer, "div", {id: "bugReportHeader", class: "defaultContainer"}, mainStringList);

    const itemsContainer = createElement(bugReportContainer, "div", {class: "itemsContainer"});

    createElement(itemsContainer, "span", {id: "bugReportInfo"}, mainStringList);

    const clientInfo = "ОС: " + getOS() + "<br>Браузер: " + getBrowser().name + " ver " + getBrowser().version + "<br>Viewport: " + window.innerWidth + "x" + window.innerHeight + "<br>Режим: " + getStatus();
    const clientInfoContainer = createElement(itemsContainer, "div", {
        id: "clientInfoContainer",
        class: "defaultContainer"
    }, clientInfo);

    const copyButton = createElement(itemsContainer, "button", {id: "copyButton"}, mainStringList);
    copyButton.onclick = function () {
        navigator.clipboard.writeText(clientInfoContainer.innerHTML.replaceAll("<br>", "\n")).then(async function () {
            appToast("Скопировано в буфер обмена", 3000).then(() => {
                window.open("https://t.me/r3drumvne/", '_blank');
            });

        }, function () {
            appToast("Произошла ошибка при копировании текста", 1500).then();
        });
    }

    const closeButton = createElement(itemsContainer, "button", {id: "closeButton"}, mainStringList);
    closeButton.onclick = function () {
        animateElement(bugReportContainer, ["popUp_close_start"], ["popUp_close_end"]).then(() => {
            scrollController.enableBodyScrolling().then();
            bugReportContainer.remove();
        });
    }
    animateElement(bugReportContainer, ["popUp_open_start"], ["popUp_open_end"]).then();
}

function getStatus() {
    return navigator.onLine ? "Онлайн" : "Офлайн";
}

function getOS() {
    const userDeviceArray = [
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

    if (!isExists(browser.name) || !isExists(browser.version)) {
        return "Unknown Browser";
    }
    return browser;
}

function isMobile() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}