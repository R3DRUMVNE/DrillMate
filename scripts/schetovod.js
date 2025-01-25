import {createModuleHeader, tryFormatToNumber, appAlert, newEl} from "./modules/otherModules.js";
import {schetovodStr} from "./objects/strings.js";
import {destroyTimer, setTimer} from "./modules/bufferModule.js";
import {colors} from "./objects/colors.js";

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
    let inputBlock = newEl(blockDiv, "div", "id=inputBlock / class=defaultContainer inputBlock");

    let realtimeCheckbox = newEl(inputBlock, "input", "id=realtimeCheckbox / type=checkbox / checked");
    realtimeCheckbox.onchange = function () {
        startButton.name = false;
        realtimeCalculate(startButton);
        setTimeInput(realtimeCheckbox.checked, inputBlock);
    }

    let realtimeText = newEl(inputBlock, "label", "id=realtimeText", schetovodStr);
    realtimeText.onclick = function () {
        if(!realtimeCheckbox.disabled) {
            realtimeCheckbox.checked = !realtimeCheckbox.checked;
            realtimeCheckbox.onchange();
        }
    }

    let inpContainer = newEl(inputBlock, "div", "id=volumeInputContainer / class=inpContainer");

    newEl(inpContainer, "label", "id=volumeText", schetovodStr);

    let volumeInput = newEl(inpContainer, "input", "id=volumeInput / type=tel");
    volumeInput.placeholder = schetovodStr.volumeInputHint;

    let startButton = newEl(inputBlock, "button", "id=startButton", schetovodStr);
    startButton.name = "true";
    startButton.onclick = function () {
        flowRate.volume = tryFormatToNumber(volumeInput.value);
        if (flowRate.volume !== false) {
            if (realtimeCheckbox.checked) {
                volumeInput.disabled = !volumeInput.disabled;
                realtimeCheckbox.disabled = !realtimeCheckbox.disabled;
                realtimeCalculate(this);
            } else {
                standartCalculate();
            }
        } else {
            appAlert("Ошибка", "Укажите заполняемый объём числом!");
        }
    }
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

function setTimeInput(flag, container) {
    if (!flag) {
        container.className = "defaultContainer inputBlockALT";

        let inpContainer = newEl(container, "div", "id=timeInputContainer / class=inpContainer");

        newEl(inpContainer, "label", "id=userTimeText", schetovodStr);

        newEl(inpContainer, "input", "id=userTimeInput / type=time / value=00:00:00 / step=1");
    } else {
        container.className = "defaultContainer inputBlock";
        document.querySelector("#timeInputContainer").remove();
    }
}


function realtimeCalculate(button) {
    let startTime;
    if (button.name === "true") {
        flowRate.litresPerMinute = 0;
        flowRate.litresPerHour = 0;
        startTime = getTimeInSeconds();
        setTimer("flowRateTimer", setInterval(calculateRealTimeDifference, 20, startTime));
        button.innerHTML = "Стоп!";
        button.style.backgroundColor = colors.stop;
        button.name = false;
    } else {
        destroyTimer("flowRateTimer");
        button.innerHTML = "Старт!";
        button.style.backgroundColor = colors.button;
        button.name = true;
    }
}

function standartCalculate() {
    let seconds = getInputTimeInSeconds();
    if (seconds > 0) {
        showFlowRate(seconds, flowRate.volume);
    } else {
        appAlert("Ошибка", "Укажите время заполнения!");
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