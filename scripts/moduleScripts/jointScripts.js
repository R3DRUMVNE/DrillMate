import {moduleVar} from "./buffer.js";

export function isExists(variable){
    return variable != null;
}

export const appSettings = {
    keys: {
        appTheme: localStorage.getItem("settings.appTheme"),
        animations: JSON.parse(localStorage.getItem("settings.animations")),
        assistant: JSON.parse(localStorage.getItem("settings.assistant")),
        tehpasSaveHistory: JSON.parse(localStorage.getItem("settings.tehpasSaveHistory")),
        menuButtonFixed: JSON.parse(localStorage.getItem("settings.menuButtonFixed")),
        prokachaikaSaveCache: JSON.parse(localStorage.getItem("settings.prokachaikaSaveCache")),
    },
    check: function () {
        const defaultSettings = {
            appTheme: "default",
            animations: true,
            assistant: true,
            tehpasSaveHistory: false,
            menuButtonFixed: false,
            prokachaikaSaveCache: false,
        };
        for (let key in this.keys) {
            if (!isExists(this.keys[key])) {
                this.keys[key] = defaultSettings[key];
                localStorage.setItem("settings." + key, defaultSettings[key]);
            }
        }
    },
    set: function (key, value) {
        this.keys[key] = value;
        localStorage.setItem("settings." + key, value);
    }
};

export function appSettings_get(key) {
    return appSettings.keys[key];
}

export async function createModuleHeader(moduleName, moduleID, parentDiv) {
    const container = createElement(parentDiv, "header", {id: "moduleHeader", class: "defaultContainer"});
    createElement(container, "div", {id: "moduleHeaderName"}, moduleName);

    const shareModuleButton = createElement(container, "button", {id: "shareModuleButton"});
    createElement(shareModuleButton, "img", {id: "shareModuleButtonImg", src: "./assets/share.svg"});
    shareModuleButton.onclick = function () {
        scrollController.disableBodyScrolling().then();
        share("Поделиться разделом", {module: moduleID}, "DrillMate - " + moduleName);
    }

    moduleVar.moduleHintStringList = await getJSONData("./objects/moduleHintStringList.json");
    const blockInfoButton = createElement(container, "button", {id: "blockInfoButton"});
    createElement(blockInfoButton, "img", {id: "blockInfoButtonImg", src: "./assets/moduleHint.svg"});
    blockInfoButton.onclick = function () {
        isExists(moduleVar.moduleHintStringList[moduleID]) ? appAlert("Подсказка раздела", moduleVar.moduleHintStringList[moduleID]).then() : null;
    }
}

export function appAlert(alertHeader, alertText) {
    const alertContainer = createElement(document.body, "div", {class: "unPadContainer popUp alertContainer"});

    createElement(alertContainer, "div", {class: "defaultContainer alertHeader"}, alertHeader);

    const itemsContainer = createElement(alertContainer, "div", {class: "itemsContainer"});

    createElement(itemsContainer, "div", {class: "alertText"}, alertText);

    const closeButton = createElement(itemsContainer, "button", {}, "Закрыть");

    scrollController.disableBodyScrolling().then();
    animateElement(alertContainer, ["popUp_open_start"], ["popUp_open_end"]).then();
    return new Promise(resolve => {
        closeButton.onclick = function () {
            animateElement(alertContainer, ["popUp_close_start"], ["popUp_close_end"]).then(async () => {
                alertContainer.remove();
                await scrollController.enableBodyScrolling().then();
                resolve();
            });
        }
    })
}

export function appToast(toastText, toastMsDelay) {
    const toastContainer = createElement(document.body, "div", {
        id: "toastContainer",
        class: "defaultContainer"
    }, toastText);
    return new Promise((resolve) => {
        animateElement(toastContainer, ["toastShow_start"], ["toastShow_end"]).then(() => {
            setTimeout(() => {
                animateElement(toastContainer, ["toastHide_start"], ["toastHide_end"]).then(() => {
                    toastContainer.remove();
                    resolve(true);
                });
            }, toastMsDelay);
        });
    });
}

export function appDialog(dialogHeader, dialogText, buttonsObject) {
    const dialogContainer = createElement(document.body, "div", {class: "unPadContainer popUp dialogContainer"});

    createElement(dialogContainer, "div", {class: "defaultContainer dialogHeader"}, dialogHeader);

    const itemsContainer = createElement(dialogContainer, "div", {class: "itemsContainer"});

    createElement(itemsContainer, "div", {class: "dialogText"}, dialogText);

    const buttonsContainer = createElement(itemsContainer, "div", {class: "buttonsContainer"});

    scrollController.disableBodyScrolling().then();
    animateElement(dialogContainer, ["popUp_open_start"], ["popUp_open_end"]).then();

    return new Promise(resolve => {
        buttonsObject.forEach(buttonObj => {
            const dialogButton = createElement(buttonsContainer, "button", {class: "dialogButton", value: buttonObj.value}, buttonObj.text);
            dialogButton.onclick = function () {
                animateElement(dialogContainer, ["popUp_close_start"], ["popUp_close_end"]).then(async () => {
                    dialogContainer.remove();
                    await scrollController.enableBodyScrolling();
                    resolve(dialogButton.value);
                });
            }
        });
    });
}

export function share(shareHeaderText, URLParams, shareText) {
    const dmURL = location.protocol + "//" + location.host + location.pathname + "?" + new URLSearchParams(URLParams);

    const shareContainer = createElement(document.body, "div", {id: "shareContainer", class: "unPadContainer popUp"});

    createElement(shareContainer, "div", {id: "shareHeader", class: "defaultContainer"}, shareHeaderText);

    const shareItemsContainer = createElement(shareContainer, "div", {id: "shareItemsContainer"});
    const URLInput = createElement(shareItemsContainer, "input", {id: "URLInput", type: "text", readonly: "", value: dmURL});

    const vkShareButton = createElement(shareItemsContainer, "img", {id: "vkShareButton", src: "./assets/share/vk.png"});
    vkShareButton.onclick = function () {
        window.open("https://vk.com/share.php?url=" + encodeURIComponent(URLInput.value) + "&title=" + shareText, "_blank");
    }
    const tgShareButton = createElement(shareItemsContainer, "img", {id: "tgShareButton", src: "./assets/share/tg.png"});
    tgShareButton.onclick = function () {
        window.open("https://t.me/share/url/?text=" + shareText + "&url=" + encodeURIComponent(URLInput.value), "_blank");
    }
    const copyURLButton = createElement(shareItemsContainer, "button", {id: "copyURLButton"}, "Скопировать ссылку");
    copyURLButton.onclick = function () {
        navigator.clipboard.writeText(URLInput.value).then(async function () {
            appToast("Скопировано в буфер обмена", 3000).then();
        }, function () {
            appToast("Произошла ошибка при копировании текста", 1500).then();
        });
    }
    const closeButton = createElement(shareItemsContainer, "button", {id: "closeButton"}, "Закрыть");

    closeButton.onclick = function () {
        animateElement(shareContainer, ["popUp_close_start"], ["popUp_close_end"]).then(() => {
            shareContainer.remove();
            scrollController.enableElementScrolling();
        });
    }
    animateElement(shareContainer, ["popUp_open_start"], ["popUp_open_end"]).then();
}

export const scrollController = {
    scrollPos: 0,
    workElement: null,
    fakeBody: document.querySelector("#fakeBody"),
    disableBodyScrolling() {
        return new Promise(resolve => {
            this.scrollPos = window.scrollY;
            document.body.style.overflowY = "hidden";
            document.body.style.top = this.scrollPos + "px";
            moduleVar.ignoreMenuControllerGestures = true;
            animateElement(this.fakeBody, ["blur_start"], ["blur_end"]).then(() => {
                resolve();
            });
        });
    },
    enableBodyScrolling() {
        return new Promise(resolve => {
            document.body.style.overflowY = "scroll";
            window.scrollTo(0, this.scrollPos);
            moduleVar.ignoreMenuControllerGestures = false;
            animateElement(this.fakeBody, ["unblur_start"], ["unblur_end"]).then(() =>{
                resolve();
            });
        });
    },
    disableElementScrolling(element) {
        this.workElement = element;
        moduleVar.ignoreMenuControllerGestures = true;
        animateElement(this.workElement, ["blur_start"], ["blur_end"]).then();
    },
    enableElementScrolling() {
        if (isExists(this.workElement)) {
            animateElement(this.workElement, ["unblur_start"], ["unblur_end"]).then();
            this.workElement = null;
        } else {
            this.enableBodyScrolling().then();
        }
    },
};

export function linkNewStylesheet(cssName) {
    !isExists(document.querySelector("#" + cssName + "CSS")) ? createElement(document.head, "link", {
        id: cssName + "CSS",
        rel: "stylesheet",
        href: "./styles/" + cssName + ".css"
    }) : null;
}

export function tryFormatToNumber(value) {
    if (value !== "") {
        let newValue = value.toString();
        if (newValue.includes(",")) {
            newValue = newValue.replace(",", ".");
        }

        if (!Number.isNaN(Number(newValue))) {
            return Number(newValue);
        }
    }
    return false;
}

export function createElement(container, elementName, elementAttributes, stringsObj) {
    const element = document.createElement(elementName);

    if (isExists(container)) {
        container.appendChild(element);
    }

    for (let key in elementAttributes) {
        element.setAttribute(key, elementAttributes[key]);
    }

    if (isExists(stringsObj)) {
        if (isExists(stringsObj[element.id])) {
            if (elementName === "select") {
                addOptionsToSelect(element, stringsObj[element.id]);
            } else {
                element.innerHTML = stringsObj[element.id];
            }
        } else if (typeof stringsObj === 'string') {
            element.innerHTML = stringsObj;
        }
    }

    switch (elementName) {
        case "input":
        case "textarea":
        case "select":
            element.setAttribute("autocomplete", "off");
            break;
        case "img":
            if (appTheme.themesList[appTheme.currentTheme].invertIcons && !elementAttributes.ignoreColorsInvert) {
                switch (element.parentElement.tagName.toLowerCase()) {
                    case "section":
                        element.classList.add("invertColors");
                }
            }else{
                element.classList.remove("invertColors");
            }
            break;
    }
    return element;
}

export function animateElement(element, startAnimClass, endAnimClass, skipEnd) {
    let classes = Array.from(element.classList);
    classes.forEach((key) => {
        if (key.includes("_end")) {
            element.classList.remove(key);
        }
    });

    return new Promise(function (resolve) {
        if (appSettings.keys.animations) {
            startAnimClass.forEach((animClass) => {
                element.classList.add(animClass);
            });

            element.addEventListener("animationend", function animationendListener() {
                element.removeEventListener("animationend", animationendListener);
                classes = Array.from(element.classList);
                classes.forEach((key) => {
                    if (key.includes("_start")) {
                        element.classList.remove(key);
                    }
                });

                endAnimClass.forEach((endClass) => {
                    element.classList.add(endClass);
                });
                resolve(true);
            });
        } else {
            if (!skipEnd) {
                endAnimClass.forEach((endClass) => {
                    element.classList.add(endClass);
                });
            }
            resolve(false);
        }
    });
}

function addOptionsToSelect(select, optionsArray) {
    for (let i = 0; i < optionsArray.length; i++) {
        if (Array.isArray(optionsArray[i])) {
            const option = createElement(select, "option", {}, optionsArray[i][0]);
            option.value = optionsArray[i][1];
        } else {
            createElement(select, "option", {}, optionsArray[i]);
        }
    }
}

export function filterValueByNumber(element) {
    element.value !== "" ? element.value = element.value.replace(/\D/g, "") : "";
}

export function createSwitchContainer(parentContainer, containerAttributes, switchAttributes, labelAttributes, stringObj) {
    const container = createElement(parentContainer, "div", {class: "switchContainer", ...containerAttributes});
    const sw = createElement(container, "input", {type: "checkbox", ...switchAttributes});
    createElement(container, "label", {for: sw.id, ...labelAttributes}, stringObj);
    return sw;
}

export class singleRangeInput {
    constructor(parentContainer, containerAttributes, stringObj, rangeStart, rangeEnd, rangeStep, defaultValue) {
        const srGeneral = createElement(parentContainer, "div", {class: "singleRangeInputGeneral inpContainer", ...containerAttributes});
        createElement(srGeneral, "span", {id: srGeneral.id + "Span"}, stringObj);
        const container = createElement(srGeneral, "div", {class: "singleRangeInputContainer"});

        const bar = createElement(container, "div", {class: "bar"});
        const selectedRange = createElement(container, "div", {class: "selectedRange"});

        const rangeInput = createElement(container, "input", {
            id: srGeneral.id + "Input",
            type: "range",
            min: rangeStart,
            max: rangeEnd,
            step: rangeStep,
            value: defaultValue
        });
        const rangeOutput = createElement(container, "output", {for: rangeInput.id});

        rangeInput.addEventListener("input", () => {
            moduleVar.ignoreMenuControllerGestures = true;
            const rangeInputValue = tryFormatToNumber(rangeInput.value);
            rangeOutput.value = "-" + rangeInputValue.toFixed(1);
            const pMaxPx = (rangeInputValue - rangeStart) / (rangeEnd - rangeStart) * bar.clientWidth;
            selectedRange.style.width = pMaxPx + 12.5 + "px";
            rangeOutput.style.left = pMaxPx - 6 + "px";
        });

        rangeInput.addEventListener("change", () => {
            moduleVar.ignoreMenuControllerGestures = false;
        });

        this.input = rangeInput;
        this.refresh();
    }
    refresh(){
            setTimeout(() => {
                const refreshBar = new Event("input");
                this.input.dispatchEvent(refreshBar);
            }, 50);
    }
}

export class doubleRangeInput {
    constructor(parentContainer, containerAttributes, stringObj, rangeStart, rangeEnd, rangeStep, minValue, maxValue, minimalRange) {
        const drGeneral = createElement(parentContainer, "div", {class: "doubleRangeInputGeneral inpContainer", ...containerAttributes});
        createElement(drGeneral, "span", {id: drGeneral.id + "Span"}, stringObj);
        const container = createElement(drGeneral, "div", {class: "doubleRangeInputContainer"});

        const bar = createElement(container, "div", {class: "bar"});
        const selectedRange = createElement(container, "div", {class: "selectedRange"});

        const minInput = createElement(container, "input", {
            id: drGeneral.id + "Min",
            type: "range",
            min: rangeStart,
            max: rangeEnd,
            step: rangeStep,
            value: minValue
        });
        const minOutput = createElement(container, "output", {for: minInput.id});

        const maxInput = createElement(container, "input", {
            id: drGeneral.id + "Max",
            type: "range",
            min: rangeStart,
            max: rangeEnd,
            step: rangeStep,
            value: maxValue
        });
        const maxOutput = createElement(container, "output", {for: maxInput.id});

        minInput.addEventListener("input", () => {
            moduleVar.ignoreMenuControllerGestures = true;
            const minInputValue = tryFormatToNumber(minInput.value);
            const maxInputValue = tryFormatToNumber(maxInput.value);
            if (minInputValue - rangeStep < maxInputValue - minimalRange) {
                minOutput.value = minInputValue.toFixed(1);
                changeSelectedRange(minInputValue, maxInputValue);
            } else {
                minInput.value = maxInputValue - minimalRange;
            }
        });

        minInput.addEventListener("change", () => {
            moduleVar.ignoreMenuControllerGestures = false;
        });

        maxInput.addEventListener("input", () => {
            moduleVar.ignoreMenuControllerGestures = true;
            const minInputValue = tryFormatToNumber(minInput.value);
            const maxInputValue = tryFormatToNumber(maxInput.value);
            if (maxInputValue + rangeStep > minInputValue + minimalRange) {
                maxOutput.value = maxInputValue.toFixed(1);
                changeSelectedRange(minInputValue, maxInputValue);
            } else {
                maxInput.value = minInputValue + minimalRange;
            }
        });

        maxInput.addEventListener("change", () => {
            moduleVar.ignoreMenuControllerGestures = false;
        });

        function changeSelectedRange(minInputValue, maxInputValue) {
            const pMinPx = (minInputValue - rangeStart) / (rangeEnd - rangeStart) * bar.clientWidth;
            selectedRange.style.left = pMinPx + 12.5 + 'px';
            selectedRange.style.left = pMinPx + 12.5 + "px";
            minOutput.style.left = pMinPx + "px";

            const pMaxPx = (maxInputValue - rangeStart) / (rangeEnd - rangeStart) * bar.clientWidth;
            selectedRange.style.width = pMaxPx - pMinPx + "px";
            maxOutput.style.left = pMaxPx + "px";
        }

        this.minInput = minInput;
        this.maxInput = maxInput;
        this.refresh();
    }
    refresh(){
            setTimeout(() => {
                const refreshBar = new Event("input");
                this.minInput.dispatchEvent(refreshBar);
                this.maxInput.dispatchEvent(refreshBar);
            }, 50);
    }
}

export function getJSONData(path) {
    return fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error("Ошибка в fetch: " + response.statusText);
            }
            return response.json();
        })
        .then(jsonData => {
            return jsonData
        })
        .catch(error => console.error("Ошибка при исполнении запроса: " + error));
}

const appTheme = {
    currentTheme: "",
    themesList: {},
    meta_themeColor: document.head.querySelector("#theme-color"),
}

export function appTheme_getColor(colorName) {
    return appTheme.themesList[appTheme.currentTheme].colors[colorName];
}

export async function appTheme_getThemes(path) {
    appTheme.themesList = await getJSONData(path);
}

export function appTheme_change(selectedTheme) {
    if (selectedTheme === "likeSystem") {
        appTheme.currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "default";
    } else {
        appTheme.currentTheme = selectedTheme;
    }

    const icons = document.querySelectorAll("section > img");
    if (appTheme.themesList[appTheme.currentTheme].invertIcons) {
        icons.forEach(icon => {
            if(icon.getAttribute("ignorecolorsinvert") !== "true") {
                icon.classList.add("invertColors");
            }
        });
    } else {
        icons.forEach(icon => {
            icon.classList.remove("invertColors");
        });
    }

    for (let color in appTheme.themesList[appTheme.currentTheme].colors) {
        document.documentElement.style.setProperty("--" + color, appTheme.themesList[appTheme.currentTheme].colors[color]);
    }

    appTheme.meta_themeColor.setAttribute("content", appTheme_getColor("primaryColor"));
}

export function randomInt(min, max, previousInt) {
    let ok = false, randomInt;
    while (!ok) {
        randomInt = Math.floor(min + Math.random() * (max + 1 - min));
        randomInt !== previousInt || !isExists(previousInt) ? ok = true : null;
    }
    return randomInt;
}

export function isJSON(JSONString) {
    return Object.prototype.toString.call(JSON.parse(JSONString)) === "[object Object]";
}

export function updateURL(params) {
    const URLParams = new URLSearchParams(params);
    history.pushState(null, null, window.location.pathname + "?" + URLParams);
}

export function messageToSW(messageObj){
    return new Promise((resolve, reject) => {
        if (!navigator.serviceWorker.controller) {
            return reject("SW не активен");
        }

        //ответ от sw
        const mCh = new MessageChannel();
        mCh.port1.onmessage = (event) => { //port[0]
            if (event.data && event.data.error) {
                reject(event.data.error);
            } else {
                resolve(event.data); // Получаем значение от SW
            }
        };

        navigator.serviceWorker.controller.postMessage(messageObj, [mCh.port2]);
    });
}