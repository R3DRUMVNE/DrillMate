import {
    createModuleHeader,
    tryFormatToNumber,
    appToast,
    filterValueByNumber, getJSONData, animateElement, appSettings_get, createElement, randomInt, createSwitchContainer
} from "./moduleScripts/jointScripts.js";
import {destroyTimer, setTimer} from "./moduleScripts/buffer.js";
import {loadModule} from "./main.js";

let assistant = null, schetovodStringList = null;

let flowRate = {
    volume: 0,
    litresPerMinute: 0,
    litresPerHour: 0,
}

export async function startSchetoVodModule(container, moduleName, moduleID) {
    let schetovodArticle = createElement(container, "article", {id: "schetovodArticle"});
    schetovodStringList = await getJSONData("./objects/schetovodStringList.json");
    createModuleHeader(moduleName, moduleID, schetovodArticle).then();
    createInputBlock(schetovodArticle);
    createOutputBlock(schetovodArticle);

    assistant = {
        image: null,
        message: null,
        say: null,
        stopSaying: null,
    };
    appSettings_get("assistant") ? await createAssistantBlock(schetovodArticle) : null;
}

function createInputBlock(blockDiv) {
    let inputBlock = createElement(blockDiv, "section", {id: "inputBlock", class: "defaultContainer inputBlockRC"});

    let volumeInputContainer = createElement(inputBlock, "div", {id: "volumeInputContainer"});
    createElement(volumeInputContainer, "span", {id: "volumeText"}, schetovodStringList);
    let volumeInput = createElement(volumeInputContainer, "input", {
        id: "volumeInput",
        type: "tel",
        placeholder: schetovodStringList.volumeInputHint
    });
    let buttonsContainer = createElement(inputBlock, "div", {class: "buttonsContainer"});

    let realtimeCheckbox = createSwitchContainer(inputBlock, {id: "realtimeCheckboxContainer", class: "switchContainer"}, {id: "realtimeCheckbox", type: "checkbox", checked: ""}, {id: "realtimeText"}, schetovodStringList);

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
            if (timeInputContainer !== undefined) timeInputContainer.remove();

            startButton = createElement(buttonsContainer, "div", {class: "startButton"});
            let buttonSpan = createElement(startButton, "span", {id: "startButtonSpan"}, schetovodStringList);
            let liquid = createElement(startButton, "div", {class: "liquid"});

            selectPumpButton = createElement(buttonsContainer, "button", {
                id: "selectPumpButton",
                class: "selectPumpButton"
            }, schetovodStringList);
            selectPumpButton.onclick = function () {
                loadModule("prokachaika", {flowRateLPH: flowRate.litresPerHour});
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
                flowRate.volume = tryFormatToNumber(volumeInput.value);
                if (flowRate.volume !== false) {
                    if (flowRate.volume !== 0) {
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
            createElement(timeInputContainer, "span", {id: "userTimeText"}, schetovodStringList);
            let userTimeInput = createElement(timeInputContainer, "input", {
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
    let currentTimeContainer = createElement(frg, "section", {id: "currentTimeContainer", class: "unPadContainer"});

    createElement(currentTimeContainer, "div", {id: "currentTimeText", class: "defaultContainer"}, schetovodStringList);
    createElement(currentTimeContainer, "span", {id: "currentTimeOutput"}, schetovodStringList);

    let fRContainer = createElement(frg, "section", {id: "fRContainer", class: "unPadContainer"});

    createElement(fRContainer, "div", {id: "flowRateText", class: "defaultContainer"}, schetovodStringList);
    createElement(fRContainer, "span", {id: "flowRateLMOutput"}, schetovodStringList);
    createElement(fRContainer, "span", {id: "flowRateLHOutput"}, schetovodStringList);
    return frg;
}

function realtimeCalculate(button) {
    let startTime;
    if (button.getAttribute("started") === "false") {
        flowRate.litresPerMinute = 0;
        flowRate.litresPerHour = 0;
        startTime = getTimeInSeconds();
        setTimer("flowRateTimer", setInterval(calculateRealTimeDifference, 20, startTime));
        button.innerHTML = schetovodStringList["startButtonSpan_stop"];
        button.setAttribute("started", "true");

        assistant.sayPhrasesPeriodically ? assistant.sayPhrasesPeriodically(assistant.phrases.waiting, 3000) : null;
    } else {
        destroyTimer("flowRateTimer");
        button.innerHTML = schetovodStringList["startButtonSpan"];
        button.setAttribute("started", "false");

        if(assistant.sayResult){
            assistant.sayResult(60000).then(() => {
                assistant.sayPhrasesPeriodically(assistant.phrases.facts, 7000);
            });
        }
    }
}

function standardCalculate() {
    let volumeInput = document.querySelector("#volumeInput");
    flowRate.volume = tryFormatToNumber(volumeInput.value);
    if (flowRate.volume !== false) {
        let seconds = getInputTimeInSeconds();
        if (seconds > 0) {
            showFlowRate(seconds);
            if(assistant.sayResult) {
                assistant.sayResult(60000).then(() => {
                    assistant.sayPhrasesPeriodically(assistant.phrases.facts, 7000);
                });
            }
        }
    }
}

function calculateRealTimeDifference(startTime) {
    let endTime = getTimeInSeconds();
    let seconds = (endTime - startTime).toFixed(2);
    showFlowRate(seconds);
}

function showFlowRate(currentSeconds) {
    flowRate.litresPerMinute = (flowRate.volume / currentSeconds * 60).toFixed(1);
    flowRate.litresPerHour = (flowRate.volume / currentSeconds * 3600).toFixed(0);
    document.querySelector("#currentTimeOutput").innerHTML = currentSeconds + " сек";
    document.querySelector("#flowRateLMOutput").innerHTML = flowRate.litresPerMinute + " л/мин";
    document.querySelector("#flowRateLHOutput").innerHTML = flowRate.litresPerHour + " л/час";

}

function getTimeInSeconds() {
    let newTime = new Date();
    return (newTime.getHours() * 3600) + (newTime.getMinutes() * 60) + newTime.getSeconds() + (newTime.getMilliseconds() / 1000);
}

function getInputTimeInSeconds() {
    let timeMass = document.querySelector("#userTimeInput").value.split(":");
    return Number(timeMass[0] * 3600) + Number(timeMass[1] * 60) + Number(timeMass[2]);
}

async function createAssistantBlock(container) {
    let assistantContainer = createElement(container, "section", {id: "assistantContainer", class: "defaultContainer"});

    assistant.image = createElement(assistantContainer, "img", {
        id: "assistantImage",
        src: "./assets/schetovod/assistant_default.png",
        ignoreColorsInvert: true
    });
    assistant.text = createElement(assistantContainer, "div", {id: "assistantText"});
    assistant.phrases = await getJSONData("./objects/assistantPhrases.json");
    console.log(assistant.phrases);
    assistant.stopSaying = function () {
        destroyTimer("letterInterval");
        destroyTimer("sayPhrases");
    }
    assistant.sayPhrase = function (text, emotion, nextOperationDelay) {
        assistant.stopSaying();
        return new Promise((resolve) => {
            let i = 0;
            this.text.innerHTML = "";
            emotion !== undefined ? this.image.src = "./assets/schetovod/assistant_" + emotion + ".png" : this.image.src = "./assets/schetovod/assistant_default.png";
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
    assistant.sayPhrasesPeriodically = function (phrasesObj, delay, prevPhraseID) {
        destroyTimer("sayPhrases");
        let phraseID = randomInt(0, phrasesObj.length - 1, prevPhraseID);

        assistant.sayPhrase(phrasesObj[phraseID].text, phrasesObj[phraseID].emotion, delay).then(() => {
            assistant.sayPhrasesPeriodically(phrasesObj, delay, phraseID);
        });
    }
    assistant.sayResult = function (nextOperationDelay) {
        return new Promise((resolve) => {
            let phrase = assistant.phrases.error;
            if (flowRate.litresPerHour > 0 && flowRate.litresPerHour <= 400) { //bad
                phrase = assistant.phrases.answer.bad[randomInt(0, assistant.phrases.answer.bad.length - 1)];

            } else if (flowRate.litresPerHour > 400 && flowRate.litresPerHour <= 1000) { //good
                phrase = assistant.phrases.answer.good[randomInt(0, assistant.phrases.answer.good.length - 1)];

            } else if (flowRate.litresPerHour > 1000 && flowRate.litresPerHour <= 3000) { //great
                phrase = assistant.phrases.answer.great[randomInt(0, assistant.phrases.answer.great.length - 1)];

            } else if (flowRate.litresPerHour > 3000) { //best
                phrase = assistant.phrases.answer.best[randomInt(0, assistant.phrases.answer.best.length - 1)];

            }
            assistant.sayPhrase(phrase.text, phrase.emotion, nextOperationDelay).then(() => {
                resolve(true);
            });
        });
    }

    assistant.sayPhrase(schetovodStringList["assistantText"], "default", 5000).then(() => {
        assistant.sayPhrasesPeriodically(assistant.phrases.facts, 7000);
    });
}