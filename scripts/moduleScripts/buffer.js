import {isExists} from "./jointScripts.js";

const timerList = {};

export function setTimer(timerName, timer) {
    timerList[timerName] = timer;
}

export function destroyTimer(timerName) {
    if (isExists(timerList[timerName])) {
        clearInterval(timerList[timerName]);
        timerList[timerName] = null;
    }
}

export function destroyAllTimers(exception) {
    for(let timer in timerList) {
        if(exception){
            exception.forEach((exc) => {
                if(exc === timer){
                    destroyTimer(timer);
                }
            });
        } else{
            destroyTimer(timer);
        }
    }
}

const tempElementsList = [];

export function addTempElement(elementID) {
    if (tempElementsList.indexOf(elementID) === -1) {
        tempElementsList.push(elementID);
    }
}

export function destroyAllTempElements() {
    for (let i = 0; i < tempElementsList.length; i++) {
        const unnecessaryElement = document.querySelector("#" + tempElementsList[i]);
        if (isExists(unnecessaryElement)) {
            unnecessaryElement.remove();
        }
    }
}

export const moduleVar = {};

export function clearModuleVariables(){
    Object.keys(moduleVar).forEach((key) => {
        Reflect.deleteProperty(moduleVar, key);
    });
}