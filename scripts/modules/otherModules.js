import {blockInfoStrings} from "../objects/strings.js";

export function createModuleHeader(moduleName, moduleID, parentDiv) {
    let container = newEl(parentDiv, "div", "id=moduleHeader / class=defaultContainer");
    newEl(container, "div", "id=moduleHeaderName / class=name", moduleName);

    let blockInfoButton = newEl(container, "button", "id=blockInfoButton");
    newEl(blockInfoButton, "img", "id=blockInfoButtonImg / src=./assets/moduleHint.svg");
    blockInfoButton.onclick = function () {
        if (typeof blockInfoStrings[moduleID] !== "undefined") appAlert("Подсказка раздела", blockInfoStrings[moduleID]);
    }
}

export function appAlert(alertHeader, alertText) {
    let dialogContainer = newEl(document.body, "div", "id=dialogContainer / class=unPadContainer popUp");

    newEl(dialogContainer, "div", "id=dialogHeader / class=defaultContainer", alertHeader);

    let itemsContainer = newEl(dialogContainer, "div", "class=itemsContainer");

    newEl(itemsContainer, "div", "id=dialogText", alertText);

    let closeButton = newEl(itemsContainer, "button", "id=closeButton", "Закрыть");

    scrollController.disableScrolling();
    closeButton.onclick = function () {
        scrollController.enableScrolling();
        dialogContainer.remove();
    }
}

export function appToast(toastText, toastMsDelay) {
    let toastContainer = newEl(document.body, "div", "id=toastContainer / class=defaultContainer show", toastText);
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

export let scrollController = {
    scrollPos: 0,
    fakeBody: document.querySelector("#fakeBody"),
    disableScrolling() {
        this.scrollPos = window.scrollY;
        document.body.style.overflowY = "hidden";
        document.body.style.top = this.scrollPos + "px";
        this.fakeBody.style.filter = "blur(2px)";
        this.fakeBody.style.pointerEvents = "none";
    },
    enableScrolling() {
        document.body.style.overflowY = "scroll";
        window.scrollTo(0, this.scrollPos);
        this.fakeBody.style.filter = "none";
        this.fakeBody.style.pointerEvents = "auto";
    }
};

export function linkNewStylesheet(cssName) {
    if (document.querySelector("#" + cssName) === null) {
        newEl(document.head, "link", "id=" + cssName + " / rel=stylesheet / href=./styles/" + cssName + ".css");
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

export function newEl(container, elementName, elementAttributes, stringsObj) {
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

    if(stringsObj !== undefined) {
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
            let option = newEl(select, "option", "", optionsArray[i][0]);
            option.value = optionsArray[i][1];
        } else {
            newEl(select, "option", "", optionsArray[i]);
        }
    }
}

export function filterValueByNumber(element){
    element.value !== "" ? element.value = element.value.replace(/\D/g, "") : "";
}

export function createCheckboxField(parentContainer, checkboxAttributes, labelAttributes, stringObj){
    let container = newEl(parentContainer, "div", "class=checkboxField");
    let cb = newEl(container, "input", "type=checkbox / " + checkboxAttributes);
    newEl(container, "label", labelAttributes + " / for=" + cb.id, stringObj);
    return cb;
}