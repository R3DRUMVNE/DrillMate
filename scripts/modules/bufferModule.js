let timerList = {
    "flowRateTimer": null,
};

export function setTimer(timerName, timer){
    timerList[timerName] = timer;
}

export function destroyTimer(timerName) {
    if(timerList[timerName] !== null) {
        clearInterval(timerList[timerName]);
    }
}