let moduleHintStringList = null;

export async function createModuleHeader(moduleName, moduleID, parentDiv) {
    let container = createElement(parentDiv, "div", "id=moduleHeader / class=defaultContainer");
    createElement(container, "div", "id=moduleHeaderName", moduleName);

    let shareModuleButton = createElement(container, "button", "id=shareModuleButton");
    createElement(shareModuleButton, "img", "id=shareModuleButtonImg / src=./assets/share.svg");
    shareModuleButton.onclick = function () {
        scrollController.disableBodyScrolling();
        share("Поделиться разделом", [["module", moduleID]], "DrillMate - " + moduleName);
    }

    moduleHintStringList = await getJSONData("./objects/moduleHintStringList.json");
    let blockInfoButton = createElement(container, "button", "id=blockInfoButton");
    createElement(blockInfoButton, "img", "id=blockInfoButtonImg / src=./assets/moduleHint.svg");
    blockInfoButton.onclick = function () {
        moduleHintStringList[moduleID] !== undefined ? appAlert("Подсказка раздела", moduleHintStringList[moduleID]) : null;
    }
}

export function appAlert(alertHeader, alertText) {
    let dialogContainer = createElement(document.body, "div", "id=dialogContainer / class=unPadContainer popUp");

    createElement(dialogContainer, "div", "id=dialogHeader / class=defaultContainer", alertHeader);

    let itemsContainer = createElement(dialogContainer, "div", "class=itemsContainer");

    createElement(itemsContainer, "div", "id=dialogText", alertText);

    let closeButton = createElement(itemsContainer, "button", "id=closeButton", "Закрыть");

    scrollController.disableBodyScrolling();
    closeButton.onclick = function () {
        scrollController.enableBodyScrolling();
        dialogContainer.remove();
    }
}

export function appToast(toastText, toastMsDelay) {
    let toastContainer = createElement(document.body, "div", "id=toastContainer / class=defaultContainer show", toastText);
    return new Promise((resolve) => {
        setTimeout(function () {
            toastContainer.className = "defaultContainer hide";
            setTimeout(function () {
                resolve(true);
                toastContainer.remove();
            }, 300);
        }, 300 + toastMsDelay);
    });
}

export function share(shareHeaderText, URLParams, shareText) {
    let shareContainer = createElement(document.body, "div", "id=shareContainer / class=unPadContainer popUp");

    createElement(shareContainer, "div", "id=shareHeader / class=defaultContainer", shareHeaderText);

    let shareItemsContainer = createElement(shareContainer, "div", "id=shareItemsContainer");
    let URLInput = createElement(shareItemsContainer, "input", "id=URLInput / type=text / readonly");
    let dmURL = new URL("https://r3drumvne.github.io/DrillMate/");
    for (let i = 0; i < URLParams.length; i++) {
        dmURL.searchParams.set(URLParams[i][0], URLParams[i][1].toLowerCase());
    }
    URLInput.value = dmURL.href;

    let vkShareButton = createElement(shareItemsContainer, "img", "id=vkShareButton / src=./assets/share/vk.png");
    vkShareButton.onclick = function () {
        window.open("https://vk.com/share.php?url=" + encodeURIComponent(dmURL.href) + "&title=" + shareText, "_blank");
    }
    let tgShareButton = createElement(shareItemsContainer, "img", "id=tgShareButton / src=./assets/share/tg.png");
    tgShareButton.onclick = function () {
        window.open("https://t.me/share/url/?text=" + shareText + "&url=" + encodeURIComponent(dmURL.href), "_blank");
    }
    let copyURLButton = createElement(shareItemsContainer, "button", "id=copyURLButton", "Скопировать ссылку");
    copyURLButton.onclick = function () {
        navigator.clipboard.writeText(dmURL.href).then(async function () {
            appToast("Текст успешно скопирован в буфер обмена!", 3000).then();
        }, function () {
            appToast("Произошла ошибка при копировании текста", 1500).then();
        });
    }
    let closeButton = createElement(shareItemsContainer, "button", "id=closeButton", "Закрыть");

    closeButton.onclick = function () {
        shareContainer.remove();
        scrollController.enableElementScrolling();
    }
}

export let scrollController = {
    scrollPos: 0,
    workElement: null,
    fakeBody: document.querySelector("#fakeBody"),
    disableBodyScrolling() {
        this.scrollPos = window.scrollY;
        document.body.style.overflowY = "hidden";
        document.body.style.top = this.scrollPos + "px";
        this.fakeBody.style.filter = "blur(2px)";
        this.fakeBody.style.pointerEvents = "none";
    },
    enableBodyScrolling() {
        document.body.style.overflowY = "scroll";
        window.scrollTo(0, this.scrollPos);
        this.fakeBody.style.filter = "none";
        this.fakeBody.style.pointerEvents = "auto";
    },
    disableElementScrolling(element) {
        this.workElement = element;
        element.style.overflowY = "hidden";
        element.style.filter = "blur(2px)";
        element.style.pointerEvents = "none";
    },
    enableElementScrolling() {
        if (this.workElement !== null) {
            this.workElement.style.overflowY = "scroll";
            this.workElement.style.filter = "none";
            this.workElement.style.pointerEvents = "auto";
            this.workElement = null;
        } else {
            this.enableBodyScrolling();
        }
    },
};

export function linkNewStylesheet(cssName) {
    if (document.querySelector("#" + cssName) === null) {
        createElement(document.head, "link", "id=" + cssName + " / rel=stylesheet / href=./styles/" + cssName + ".css");
    }
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

    if (elementAttributes !== "" && elementAttributes !== undefined) {
        let attributes = elementAttributes.split(" / ");
        for (let i = 0; i < attributes.length; i++) {
            if (attributes[i].includes("=")) {
                let attributeName = attributes[i].split("=")[0];
                let attributeValue = attributes[i].split("=")[1];
                element.setAttribute(attributeName, attributeValue);
            } else {
                element.setAttribute(attributes[i], "");
            }
        }
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
    }
    return element;
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
            let option = createElement(select, "option", "", optionsArray[i][0]);
            option.value = optionsArray[i][1];
        } else {
            createElement(select, "option", "", optionsArray[i]);
        }
    }
}

export function filterValueByNumber(element) {
    element.value !== "" ? element.value = element.value.replace(/\D/g, "") : "";
}

export function createCheckboxContainer(parentContainer, checkboxAttributes, labelAttributes, stringObj) {
    let container = createElement(parentContainer, "div", "class=checkboxContainer");
    let cb = createElement(container, "input", "type=checkbox / " + checkboxAttributes);
    createElement(container, "label", labelAttributes + " / for=" + cb.id, stringObj);
    return cb;
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
    return appTheme.themesList[appTheme.currentTheme][colorName];
}

export async function appTheme_getThemes(path) {
    appTheme.themesList = await getJSONData(path);
}

export function appTheme_change(selectedTheme) {
    if (selectedTheme === null) {
        appTheme.currentTheme = "default";
        selectedTheme = appTheme.currentTheme;
    } else if (selectedTheme === "likeSystem") {
        appTheme.currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "default";
    } else {
        appTheme.currentTheme = selectedTheme;
    }
    localStorage.setItem('appTheme', selectedTheme);

    for(let theme in appTheme.themesList) {
        if(theme === appTheme.currentTheme) {
            for(let color in appTheme.themesList[theme]) {
                document.documentElement.style.setProperty("--" + color, appTheme.themesList[theme][color]);
            }
        }
    }

    appTheme.meta_themeColor.setAttribute("content", appTheme_getColor("primaryColor"));
}