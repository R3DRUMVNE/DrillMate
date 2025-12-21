let moduleHintStringList = null;


export const appSettings = {
    keys: {
        appTheme: localStorage.getItem("settings.appTheme"),
        animations: JSON.parse(localStorage.getItem("settings.animations")),
        assistant: JSON.parse(localStorage.getItem("settings.assistant")),
        menuButtonFixed: JSON.parse(localStorage.getItem("settings.menuButtonFixed")),
        confirmExit: JSON.parse(localStorage.getItem("settings.confirmExit")),

    },
    check: function () {
        const defaultSettings = {
            appTheme: "default",
            animations: true,
            assistant: true,
            menuButtonFixed: false,
            confirmExit: true,
        };
        for (let key in this.keys) {
            if (this.keys[key] === null || this.keys[key] === undefined) {
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
    let container = createElement(parentDiv, "header", {id: "moduleHeader", class: "defaultContainer"});
    createElement(container, "div", {id: "moduleHeaderName"}, moduleName);

    let shareModuleButton = createElement(container, "button", {id: "shareModuleButton"});
    createElement(shareModuleButton, "img", {id: "shareModuleButtonImg", src: "./assets/share.svg"});
    shareModuleButton.onclick = function () {
        scrollController.disableBodyScrolling();
        share("Поделиться разделом", {module: moduleID}, "DrillMate - " + moduleName);
    }

    moduleHintStringList = await getJSONData("./objects/moduleHintStringList.json");
    let blockInfoButton = createElement(container, "button", {id: "blockInfoButton"});
    createElement(blockInfoButton, "img", {id: "blockInfoButtonImg", src: "./assets/moduleHint.svg"});
    blockInfoButton.onclick = function () {
        moduleHintStringList[moduleID] !== undefined ? appAlert("Подсказка раздела", moduleHintStringList[moduleID]) : null;
    }
}

export function appAlert(alertHeader, alertText) {
    let dialogContainer = createElement(document.body, "div", {id: "dialogContainer", class: "unPadContainer popUp"});

    createElement(dialogContainer, "div", {id: "dialogHeader", class: "defaultContainer"}, alertHeader);

    let itemsContainer = createElement(dialogContainer, "div", {class: "itemsContainer"});

    createElement(itemsContainer, "div", {id: "dialogText"}, alertText);

    let closeButton = createElement(itemsContainer, "button", {id: "closeButton"}, "Закрыть");

    scrollController.disableBodyScrolling();
    animateElement(dialogContainer, ["popUp_open_start"], ["popUp_open_end"]).then();
    closeButton.onclick = function () {
        animateElement(dialogContainer, ["popUp_close_start"], ["popUp_close_end"]).then(() => {
            scrollController.enableBodyScrolling();
            dialogContainer.remove();
        });
    }
}

export function appToast(toastText, toastMsDelay) {
    let toastContainer = createElement(document.body, "div", {
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

export function share(shareHeaderText, URLParams, shareText) {
    let shareContainer = createElement(document.body, "div", {id: "shareContainer", class: "unPadContainer popUp"});

    createElement(shareContainer, "div", {id: "shareHeader", class: "defaultContainer"}, shareHeaderText);

    let shareItemsContainer = createElement(shareContainer, "div", {id: "shareItemsContainer"});
    let URLInput = createElement(shareItemsContainer, "input", {id: "URLInput", type: "text", readonly: ""});
    let dmURL = new URL("https://r3drumvne.github.io/DrillMate/");
    for (let key in URLParams) {
        dmURL.searchParams.set(key, URLParams[key].toLowerCase());
    }
    URLInput.value = dmURL.href;

    let vkShareButton = createElement(shareItemsContainer, "img", {id: "vkShareButton", src: "./assets/share/vk.png"});
    vkShareButton.onclick = function () {
        window.open("https://vk.com/share.php?url=" + encodeURIComponent(dmURL.href) + "&title=" + shareText, "_blank");
    }
    let tgShareButton = createElement(shareItemsContainer, "img", {id: "tgShareButton", src: "./assets/share/tg.png"});
    tgShareButton.onclick = function () {
        window.open("https://t.me/share/url/?text=" + shareText + "&url=" + encodeURIComponent(dmURL.href), "_blank");
    }
    let copyURLButton = createElement(shareItemsContainer, "button", {id: "copyURLButton"}, "Скопировать ссылку");
    copyURLButton.onclick = function () {
        navigator.clipboard.writeText(dmURL.href).then(async function () {
            appToast("Скопировано в буфер обмена", 3000).then();
        }, function () {
            appToast("Произошла ошибка при копировании текста", 1500).then();
        });
    }
    let closeButton = createElement(shareItemsContainer, "button", {id: "closeButton"}, "Закрыть");

    closeButton.onclick = function () {
        animateElement(shareContainer, ["popUp_close_start"], ["popUp_close_end"]).then(() => {
            shareContainer.remove();
            scrollController.enableElementScrolling();
        });
    }
    animateElement(shareContainer, ["popUp_open_start"], ["popUp_open_end"]).then();
}

export let scrollController = {
    scrollPos: 0,
    workElement: null,
    fakeBody: document.querySelector("#fakeBody"),
    disableBodyScrolling() {
        this.scrollPos = window.scrollY;
        document.body.style.overflowY = "hidden";
        document.body.style.top = this.scrollPos + "px";
        animateElement(this.fakeBody, ["blur_start"], ["blur_end"]).then();
    },
    enableBodyScrolling() {
        document.body.style.overflowY = "scroll";
        window.scrollTo(0, this.scrollPos);
        animateElement(this.fakeBody, ["unblur_start"], ["unblur_end"]).then();
    },
    disableElementScrolling(element) {
        this.workElement = element;
        animateElement(this.workElement, ["blur_start"], ["blur_end"]).then();
    },
    enableElementScrolling() {
        if (this.workElement !== null) {
            animateElement(this.workElement, ["unblur_start"], ["unblur_end"]).then();
            this.workElement = null;
        } else {
            this.enableBodyScrolling();
        }
    },
};

export function linkNewStylesheet(cssName) {
    document.querySelector("#" + cssName) === null ? createElement(document.head, "link", {
        id: cssName,
        rel: "stylesheet",
        href: "./styles/" + cssName + ".css"
    }) : null;
}

export function tryFormatToNumber(value) {
    if (value !== "") {
        let newValue = value;
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
    let element = document.createElement(elementName);

    if (container !== null) {
        container.appendChild(element);
    }

    for (let key in elementAttributes) {
        element.setAttribute(key, elementAttributes[key]);
    }

    if (stringsObj !== undefined) {
        if (stringsObj[element.id] !== undefined) {
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

export function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\/+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

export function setCookie(name, value, options = {}) {
    options = {
        path: '/',
        ...options
    };

    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
    }

    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);

    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
    }
    document.cookie = updatedCookie;
}

function addOptionsToSelect(select, optionsArray) {
    for (let i = 0; i < optionsArray.length; i++) {
        if (Array.isArray(optionsArray[i])) {
            let option = createElement(select, "option", {}, optionsArray[i][0]);
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
    let container = createElement(parentContainer, "div", {class: "switchContainer", ...containerAttributes});
    let sw = createElement(container, "input", {type: "checkbox", ...switchAttributes});
    createElement(container, "label", {for: sw.id, ...labelAttributes}, stringObj);
    return sw;
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

    let icons = document.querySelectorAll("section > img");
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
        randomInt !== previousInt || previousInt === undefined ? ok = true : null;
    }
    return randomInt;
}