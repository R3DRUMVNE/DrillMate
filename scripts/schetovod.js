import {
    createModuleHeader,
    tryFormatToNumber,
    newEl,
    appToast,
    filterValueByNumber
} from "./modules/otherModules.js";
import {schetovodStr} from "./objects/strings.js";
import {destroyTimer, setTimer} from "./modules/bufferModule.js";
import {appTheme} from "./objects/colors.js";

let flowRate = {
    volume: 0,
    litresPerMinute: 0,
    litresPerHour: 0,
}

export function startSchetoVodModule(container, moduleName, moduleID) {
    let schetovodDiv = newEl(container, 'div', 'id=schetovodDiv');
    createModuleHeader(moduleName, moduleID, schetovodDiv);
    createInputBlock(schetovodDiv);
    createOutputBlock(schetovodDiv);
}

function createInputBlock(blockDiv) {
    let inputBlock = newEl(blockDiv, "div", "id=inputBlock / class=defaultContainer inputBlockRC");

    let volumeInputContainer = newEl(inputBlock, "div", "id=volumeInputContainer / class=inpContainer");
    newEl(volumeInputContainer, "label", "id=volumeText", schetovodStr);
    let volumeInput = newEl(volumeInputContainer, "input", "id=volumeInput / type=tel / placeholder=" + schetovodStr.volumeInputHint);

    let realtimeCheckbox = newEl(inputBlock, "input", "id=realtimeCheckbox / type=checkbox / checked");
    let startButton, timeInputContainer;
    realtimeCheckbox.onchange = function () {
        if (realtimeCheckbox.checked) {
            inputBlock.className = "defaultContainer inputBlockRC";
            volumeInput.oninput = function () {
                filterValueByNumber(this);
            }
            if (timeInputContainer !== undefined) timeInputContainer.remove();

            startButton = newEl(inputBlock, "button", "id=startButton", schetovodStr);
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

            timeInputContainer = newEl(inputBlock, "div", "id=timeInputContainer / class=inpContainer");
            newEl(timeInputContainer, "label", "id=userTimeText", schetovodStr);
            let userTimeInput = newEl(timeInputContainer, "input", "id=userTimeInput / type=time / value=00:00:30 / step=1");
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
    newEl(inputBlock, "label", "id=realtimeText / for=realtimeCheckbox", schetovodStr);
}

function createOutputBlock(frg) {
    let currentTimeContainer = newEl(frg, "div", "id=currentTimeContainer / class=unPadContainer");

    newEl(currentTimeContainer, "div", "id=currentTimeText / class=defaultContainer", schetovodStr);
    newEl(currentTimeContainer, "label", "id=currentTimeOutput", schetovodStr);

    let fRContainer = newEl(frg, "div", "id=fRContainer / class=unPadContainer");

    newEl(fRContainer, "div", "id=flowRateText / class=defaultContainer", schetovodStr);
    newEl(fRContainer, "label", "id=flowRateLMOutput", schetovodStr);
    newEl(fRContainer, "label", "id=flowRateLHOutput", schetovodStr);
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
        button.style.backgroundColor = appTheme.getColor("stop");
        button.name = false;
    } else {
        destroyTimer("flowRateTimer");
        button.innerHTML = "Старт!";
        button.style.backgroundColor = appTheme.getColor("button");
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