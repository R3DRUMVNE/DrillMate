import {
    createModuleHeader,
    tryFormatToNumber,
    createElement,
    appToast,
    filterValueByNumber, appTheme_getColor, getJSONData
} from "./moduleScripts/otherModules.js";
import {destroyTimer, setTimer} from "./moduleScripts/bufferModule.js";

let schetovodStringList = null;

let flowRate = {
    volume: 0,
    litresPerMinute: 0,
    litresPerHour: 0,
}

export async function startSchetoVodModule(container, moduleName, moduleID) {
    let schetovodDiv = createElement(container, 'div', 'id=schetovodDiv');
    schetovodStringList = await getJSONData("./objects/schetovodStringList.json");
    createModuleHeader(moduleName, moduleID, schetovodDiv).then();
    createInputBlock(schetovodDiv);
    createOutputBlock(schetovodDiv);
}

function createInputBlock(blockDiv) {
    let inputBlock = createElement(blockDiv, "div", "id=inputBlock / class=defaultContainer inputBlockRC");

    let volumeInputContainer = createElement(inputBlock, "div", "id=volumeInputContainer / class=inpContainer");
    createElement(volumeInputContainer, "span", "id=volumeText", schetovodStringList);
    let volumeInput = createElement(volumeInputContainer, "input", "id=volumeInput / type=tel / placeholder=" + schetovodStringList.volumeInputHint);

    let realtimeCheckbox = createElement(inputBlock, "input", "id=realtimeCheckbox / type=checkbox / checked");
    let startButton, timeInputContainer;
    realtimeCheckbox.onchange = function () {
        if (realtimeCheckbox.checked) {
            inputBlock.className = "defaultContainer inputBlockRC";
            volumeInput.oninput = function () {
                filterValueByNumber(this);
            }
            if (timeInputContainer !== undefined) timeInputContainer.remove();

            startButton = createElement(inputBlock, "button", "id=startButton", schetovodStringList);
            startButton.name = "true";
            startButton.onclick = function () {
                flowRate.volume = tryFormatToNumber(volumeInput.value);
                if (flowRate.volume !== false) {
                    volumeInput.disabled = !volumeInput.disabled;
                    realtimeCheckbox.disabled = !realtimeCheckbox.disabled;
                    realtimeCalculate(this);
                } else{
                    appToast("Ошибка: укажите заполняемый объём числом!", 1500).then();
                }
            }
        } else {
            inputBlock.className = "defaultContainer inputBlockSC";
            if (startButton !== undefined) startButton.remove();

            timeInputContainer = createElement(inputBlock, "div", "id=timeInputContainer / class=inpContainer");
            createElement(timeInputContainer, "span", "id=userTimeText", schetovodStringList);
            let userTimeInput = createElement(timeInputContainer, "input", "id=userTimeInput / type=time / value=00:00:30 / step=1");
            userTimeInput.oninput = function () {
                standardCalculate();
            }
            volumeInput.oninput = function () {
                filterValueByNumber(this);
                standardCalculate();
            }
        }
    }
    realtimeCheckbox.dispatchEvent(new Event('change'));
    createElement(inputBlock, "label", "id=realtimeText / for=realtimeCheckbox", schetovodStringList);
}

function createOutputBlock(frg) {
    let currentTimeContainer = createElement(frg, "div", "id=currentTimeContainer / class=unPadContainer");

    createElement(currentTimeContainer, "div", "id=currentTimeText / class=defaultContainer", schetovodStringList);
    createElement(currentTimeContainer, "span", "id=currentTimeOutput", schetovodStringList);

    let fRContainer = createElement(frg, "div", "id=fRContainer / class=unPadContainer");

    createElement(fRContainer, "div", "id=flowRateText / class=defaultContainer", schetovodStringList);
    createElement(fRContainer, "span", "id=flowRateLMOutput", schetovodStringList);
    createElement(fRContainer, "span", "id=flowRateLHOutput", schetovodStringList);
    return frg;
}

function realtimeCalculate(button) {
    let startTime;
    if (button.name === "true") {
        flowRate.litresPerMinute = 0;
        flowRate.litresPerHour = 0;
        startTime = getTimeInSeconds();
        setTimer("flowRateTimer", setInterval(calculateRealTimeDifference, 20, startTime));
        button.innerHTML = "Стоп!";
        button.style.backgroundColor = appTheme_getColor("stop");
        button.name = false;
    } else {
        destroyTimer("flowRateTimer");
        button.innerHTML = "Старт!";
        button.style.backgroundColor = appTheme_getColor("button");
        button.name = true;
    }
}

function standardCalculate() {
    let volumeInput = document.querySelector("#volumeInput");
    flowRate.volume = tryFormatToNumber(volumeInput.value);
    if (flowRate.volume !== false) {
        let seconds = getInputTimeInSeconds();
        if (seconds > 0) {
            showFlowRate(seconds);
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