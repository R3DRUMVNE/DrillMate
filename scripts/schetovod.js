import {
    createModuleHeader,
    tryFormatToNumber,
    appToast,
    filterValueByNumber, getJSONData, animateElement, appSettings_get, createElement, randomInt, createSwitchContainer,
    isExists
} from "./moduleScripts/jointScripts.js";
import {destroyTimer, setTimer, moduleVar} from "./moduleScripts/buffer.js";
import {loadModule} from "./main.js";

export async function startSchetoVodModule(container, moduleName, moduleID) {
    moduleVar.flowRate = {
        volume: 0,
        litresPerMinute: 0,
        litresPerHour: 0,
    };
    moduleVar.assistant = {
        image: null,
        message: null,
        say: null,
        stopSaying: null,
    };
    moduleVar.schetovodStringList = await getJSONData("./objects/schetovodStringList.json");

    const schetovodArticle = createElement(container, "article", {id: "schetovodArticle"});
    createModuleHeader(moduleName, moduleID, schetovodArticle).then();
    createInputBlock(schetovodArticle);
    createOutputBlock(schetovodArticle);

    appSettings_get("assistant") ? await createAssistantBlock(schetovodArticle) : null;
}

function createInputBlock(blockDiv) {
    const inputBlock = createElement(blockDiv, "section", {id: "inputBlock", class: "defaultContainer inputBlockRC"});

    const volumeInputContainer = createElement(inputBlock, "div", {id: "volumeInputContainer"});
    createElement(volumeInputContainer, "span", {id: "volumeText"}, moduleVar.schetovodStringList);
    const volumeInput = createElement(volumeInputContainer, "input", {
        id: "volumeInput",
        type: "tel",
        placeholder: moduleVar.schetovodStringList.volumeInputHint
    });
    const buttonsContainer = createElement(inputBlock, "div", {class: "buttonsContainer"});

    const realtimeCheckbox = createSwitchContainer(inputBlock, {id: "realtimeCheckboxContainer", class: "switchContainer"}, {id: "realtimeCheckbox", type: "checkbox", checked: ""}, {id: "realtimeText"}, moduleVar.schetovodStringList);

    let startButton, selectPumpButton, timeInputContainer;
    realtimeCheckbox.onchange = async function () {
        if (realtimeCheckbox.checked) {
            if (timeInputContainer) {
                await Promise.all([animateElement(buttonsContainer, ["buttonsContainerOut_start"], ["buttonsContainerOut_end"]), animateElement(timeInputContainer, ["timeInputContainerOut_start"], ["timeInputContainerOut_end"])]);
            }

            if (selectPumpButton) selectPumpButton.remove();
            inputBlock.className = "defaultContainer inputBlockRC";
            volumeInput.oninput = function () {
                filterValueByNumber(this);
            }
            if (isExists(timeInputContainer)) timeInputContainer.remove();

            startButton = createElement(buttonsContainer, "div", {class: "startButton"});
            const buttonSpan = createElement(startButton, "span", {id: "startButtonSpan"}, moduleVar.schetovodStringList);
            const liquid = createElement(startButton, "div", {class: "liquid"});

            selectPumpButton = createElement(buttonsContainer, "button", {
                id: "selectPumpButton",
                class: "selectPumpButton"
            }, moduleVar.schetovodStringList);
            selectPumpButton.onclick = function () {
                loadModule("prokachaika", {flowRateLPH: moduleVar.flowRate.litresPerHour});
            }
            setTimeout(() => {
                clearTimeout(this);
                animateElement(buttonsContainer, ["buttonsContainerIn_start"], ["buttonsContainerIn_end"]).then();
            }, 10);

            buttonSpan.setAttribute("started", "false");

            let firstPlay = true;

            function animateButtons(flag) {
                if (flag === "false") {
                    animateElement(liquid, ["liquidOut_start"], ["liquidOut_end"], true).then(() => {
                        liquid.classList.remove("liquid_animate");
                    });
                    animateElement(selectPumpButton, ["selectPumpButtonIn_start"], ["selectPumpButtonIn_end"]).then();
                } else {
                    animateElement(liquid, ["liquidIn_start", "liquid_animate"], ["liquidIn_end"], true).then();
                    firstPlay ? firstPlay = false : animateElement(selectPumpButton, ["selectPumpButtonOut_start"], ["selectPumpButtonOut_end"]).then();
                }
            }

            startButton.onclick = function () {
                moduleVar.flowRate.volume = tryFormatToNumber(volumeInput.value);
                if (moduleVar.flowRate.volume !== false) {
                    if (moduleVar.flowRate.volume !== 0) {
                        volumeInput.disabled = !volumeInput.disabled;
                        realtimeCheckbox.disabled = !realtimeCheckbox.disabled;
                        realtimeCalculate(buttonSpan);
                        animateButtons(buttonSpan.getAttribute("started"));
                    } else {
                        appToast("Ошибка: заполняемый объём не может быть равен нулю!", 1500).then();
                    }
                } else {
                    appToast("Ошибка: укажите заполняемый объём числом!", 1500).then();
                }
            }
        } else {
            inputBlock.className = "defaultContainer inputBlockSC";
            await animateElement(buttonsContainer, ["buttonsContainerOut_start"], ["buttonsContainerOut_end"]);
            startButton.remove();
            selectPumpButton.className = "selectPumpButton";

            timeInputContainer = createElement(inputBlock, "div", {
                id: "timeInputContainer",
                class: "timeInputContainer"
            });
            createElement(timeInputContainer, "span", {id: "userTimeText"}, moduleVar.schetovodStringList);
            const userTimeInput = createElement(timeInputContainer, "input", {
                id: "userTimeInput",
                type: "time",
                value: "00:00:30",
                step: "1"
            });

            await animateElement(timeInputContainer, ["timeInputContainerIn_start"], ["timeInputContainerIn_end"]).then();
            buttonsContainer.classList.remove("buttonsContainerOut_end");

            userTimeInput.oninput = function () {
                standardCalculate();
                selectPumpButton_show();
            }
            volumeInput.oninput = function () {
                filterValueByNumber(this);
                standardCalculate();
                selectPumpButton_show();
            }
            let showTimeout, alreadyShown = false;

            function selectPumpButton_show() {
                if (!alreadyShown) {
                    clearTimeout(showTimeout);
                    showTimeout = setTimeout(function () {
                        animateElement(selectPumpButton, ["selectPumpButtonIn_start"], ["selectPumpButtonIn_end"]).then();
                        alreadyShown = true;
                    }, 1000);
                }
            }
        }
    }
    realtimeCheckbox.dispatchEvent(new Event('change'));
}

function createOutputBlock(frg) {
    const currentTimeContainer = createElement(frg, "section", {id: "currentTimeContainer", class: "unPadContainer"});

    createElement(currentTimeContainer, "div", {id: "currentTimeText", class: "defaultContainer"}, moduleVar.schetovodStringList);
    createElement(currentTimeContainer, "span", {id: "currentTimeOutput"}, moduleVar.schetovodStringList);

    const fRContainer = createElement(frg, "section", {id: "fRContainer", class: "unPadContainer"});

    createElement(fRContainer, "div", {id: "flowRateText", class: "defaultContainer"}, moduleVar.schetovodStringList);
    createElement(fRContainer, "span", {id: "flowRateLMOutput"}, moduleVar.schetovodStringList);
    createElement(fRContainer, "span", {id: "flowRateLHOutput"}, moduleVar.schetovodStringList);
    return frg;
}

function realtimeCalculate(button) {
    let startTime;
    if (button.getAttribute("started") === "false") {
        moduleVar.flowRate.litresPerMinute = 0;
        moduleVar.flowRate.litresPerHour = 0;
        startTime = getTimeInSeconds();
        setTimer("flowRateTimer", setInterval(calculateRealTimeDifference, 20, startTime));
        button.innerHTML = moduleVar.schetovodStringList["startButtonSpan_stop"];
        button.setAttribute("started", "true");

        moduleVar.assistant.sayPhrasesPeriodically ? moduleVar.assistant.sayPhrasesPeriodically(moduleVar.assistant.phrases.waiting, 3000) : null;
    } else {
        destroyTimer("flowRateTimer");
        button.innerHTML = moduleVar.schetovodStringList["startButtonSpan"];
        button.setAttribute("started", "false");

        if(moduleVar.assistant.sayResult){
            moduleVar.assistant.sayResult(60000).then(() => {
                moduleVar.assistant.sayPhrasesPeriodically(moduleVar.assistant.phrases.facts, 7000);
            });
        }
    }
}

function standardCalculate() {
    const volumeInput = document.querySelector("#volumeInput");
    moduleVar.flowRate.volume = tryFormatToNumber(volumeInput.value);
    if (moduleVar.flowRate.volume !== false) {
        const seconds = getInputTimeInSeconds();
        if (seconds > 0) {
            showFlowRate(seconds);
            if(moduleVar.assistant.sayResult) {
                moduleVar.assistant.sayResult(60000).then(() => {
                    moduleVar.assistant.sayPhrasesPeriodically(moduleVar.assistant.phrases.facts, 7000);
                });
            }
        }
    }
}

function calculateRealTimeDifference(startTime) {
    const endTime = getTimeInSeconds();
    const seconds = (endTime - startTime).toFixed(2);
    showFlowRate(seconds);
}

function showFlowRate(currentSeconds) {
    moduleVar.flowRate.litresPerMinute = (moduleVar.flowRate.volume / currentSeconds * 60).toFixed(1);
    moduleVar.flowRate.litresPerHour = (moduleVar.flowRate.volume / currentSeconds * 3600).toFixed(0);
    document.querySelector("#currentTimeOutput").innerHTML = currentSeconds + " сек";
    document.querySelector("#flowRateLMOutput").innerHTML = moduleVar.flowRate.litresPerMinute + " л/мин";
    document.querySelector("#flowRateLHOutput").innerHTML = moduleVar.flowRate.litresPerHour + " л/час";

}

function getTimeInSeconds() {
    const newTime = new Date();
    return (newTime.getHours() * 3600) + (newTime.getMinutes() * 60) + newTime.getSeconds() + (newTime.getMilliseconds() / 1000);
}

function getInputTimeInSeconds() {
    const timeMass = document.querySelector("#userTimeInput").value.split(":");
    return Number(timeMass[0] * 3600) + Number(timeMass[1] * 60) + Number(timeMass[2]);
}

async function createAssistantBlock(container) {
    const assistantContainer = createElement(container, "section", {id: "assistantContainer", class: "defaultContainer"});

    moduleVar.assistant.image = createElement(assistantContainer, "img", {
        id: "assistantImage",
        src: "./assets/schetovod/assistant_default.png",
        ignoreColorsInvert: true
    });
    moduleVar.assistant.text = createElement(assistantContainer, "div", {id: "assistantText"});
    moduleVar.assistant.phrases = await getJSONData("./objects/assistantPhrases.json");
    moduleVar.assistant.stopSaying = function () {
        destroyTimer("letterInterval");
        destroyTimer("sayPhrases");
    }
    moduleVar.assistant.sayPhrase = function (text, emotion, nextOperationDelay) {
        moduleVar.assistant.stopSaying();
        return new Promise((resolve) => {
            let i = 0;
            this.text.innerHTML = "";
            isExists(emotion) ? this.image.src = "./assets/schetovod/assistant_" + emotion + ".png" : this.image.src = "./assets/schetovod/assistant_default.png";
            setTimer("letterInterval", setInterval(() => {
                if (i === text.length) {
                    destroyTimer("letterInterval");
                    setTimer("sayPhrases", setTimeout(() => {
                        resolve(true);
                    }, nextOperationDelay));
                } else {
                    this.text.innerHTML += text[i];
                    i++;
                }
            }, 30));
        });
    };
    moduleVar.assistant.sayPhrasesPeriodically = function (phrasesObj, delay, prevPhraseID) {
        destroyTimer("sayPhrases");
        const phraseID = randomInt(0, phrasesObj.length - 1, prevPhraseID);

        moduleVar.assistant.sayPhrase(phrasesObj[phraseID].text, phrasesObj[phraseID].emotion, delay).then(() => {
            moduleVar.assistant.sayPhrasesPeriodically(phrasesObj, delay, phraseID);
        });
    }
    moduleVar.assistant.sayResult = function (nextOperationDelay) {
        return new Promise((resolve) => {
            let phrase = moduleVar.assistant.phrases.error;
            if (moduleVar.flowRate.litresPerHour > 0 && moduleVar.flowRate.litresPerHour <= 400) { //bad
                phrase = moduleVar.assistant.phrases.answer.bad[randomInt(0, moduleVar.assistant.phrases.answer.bad.length - 1)];

            } else if (moduleVar.flowRate.litresPerHour > 400 && moduleVar.flowRate.litresPerHour <= 1000) { //good
                phrase = moduleVar.assistant.phrases.answer.good[randomInt(0, moduleVar.assistant.phrases.answer.good.length - 1)];

            } else if (moduleVar.flowRate.litresPerHour > 1000 && moduleVar.flowRate.litresPerHour <= 3000) { //great
                phrase = moduleVar.assistant.phrases.answer.great[randomInt(0, moduleVar.assistant.phrases.answer.great.length - 1)];

            } else if (moduleVar.flowRate.litresPerHour > 3000) { //best
                phrase = moduleVar.assistant.phrases.answer.best[randomInt(0, moduleVar.assistant.phrases.answer.best.length - 1)];

            }
            moduleVar.assistant.sayPhrase(phrase.text, phrase.emotion, nextOperationDelay).then(() => {
                resolve(true);
            });
        });
    }

    moduleVar.assistant.sayPhrase(moduleVar.schetovodStringList["assistantText"], "default", 5000).then(() => {
        moduleVar.assistant.sayPhrasesPeriodically(moduleVar.assistant.phrases.facts, 7000);
    });
}