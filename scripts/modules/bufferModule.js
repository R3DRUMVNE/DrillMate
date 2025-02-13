let timerList = {
    "flowRateTimer": null,
};

export function setTimer(timerName, timer) {
    timerList[timerName] = timer;
}

export function destroyTimer(timerName) {
    if (timerList[timerName] !== null) {
        clearInterval(timerList[timerName]);
    }
}

let tempElementsList = [];

export function addTempElement(elementID) {
    if (tempElementsList.indexOf(elementID) === -1) {
        tempElementsList.push(elementID);
    }
}

export function destroyAllTempElements() {
    for (let i = 0; i < tempElementsList.length; i++) {
        let unnecessaryElement = document.querySelector("#" + tempElementsList[i]);
        if (unnecessaryElement !== null && unnecessaryElement !== undefined) {
            unnecessaryElement.remove();
        }
    }
}