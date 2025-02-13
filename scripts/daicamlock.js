import {createModuleHeader, newEl} from "./modules/otherModules.js";
import {daicamlockStr} from "./objects/strings.js";
import {camlockObject, camlockImageSizes, camlockSizes} from "./objects/camlock.js";

let camlockImage, DNSelect, answerContainer;
let sizeLabels = [];

let currentCamlock = {
    type: "",
    size: "",
    mainConnection: "",
    extraConnection: "",
};

export function startDaiCamlockModule(container, moduleName, moduleID) {
    let daicamlockDiv = newEl(container, 'div', 'id=daicamlockDiv');
    createModuleHeader(moduleName, moduleID, daicamlockDiv);
    createOutputBlock(daicamlockDiv);
    createSizesBlock(daicamlockDiv);
    createInputBlock(daicamlockDiv);
}

function createOutputBlock(blockDiv) {
    camlockImage = newEl(blockDiv, "img", "id=camlockImage");

    answerContainer = newEl(blockDiv, "div", "id=answerContainer / class=defaultContainer", daicamlockStr);
}

function createInputBlock(blockDiv) {
    let camlockInputBlock = newEl(blockDiv, "div", "id=camlockInputBlock / class=defaultContainer");

    let fatherMotherContainer = newEl(camlockInputBlock, "div", "id=fatherMotherContainer");

    let father = newEl(fatherMotherContainer, "input", "id=father / type=radio / value=Father / checked");
    father.name = "mainConnection";
    father.onchange = function () {
        changeCamlock(this);
        changeSizes();
    }

    newEl(fatherMotherContainer, "label", "id=fatherLabel / class=radioLabel / for=father", daicamlockStr);

    let mother = newEl(fatherMotherContainer, "input", "id=mother / type=radio / value=Mother");
    mother.name = "mainConnection";
    mother.onchange = function () {
        changeCamlock(this);
        changeSizes();
    }

    newEl(fatherMotherContainer, "label", "id=motherLabel / class=radioLabel / for=mother", daicamlockStr);

    let fittingDiv = newEl(camlockInputBlock, "div", "id=fittingDiv");

    let hoseFitting = newEl(fittingDiv, "input", "id=hoseFitting / type=radio / value=HoseFitting / checked");
    hoseFitting.name = "extraConnection";
    hoseFitting.onchange = function () {
        changeCamlock(this);
        changeSizes();
    }


    newEl(fittingDiv, "label", "id=hoseFittingLabel / class=radioLabel / for=hoseFitting", daicamlockStr);

    let internalThread = newEl(fittingDiv, "input", "id=internalThread / type=radio / value=InternalThread");
    internalThread.name = "extraConnection";
    internalThread.onchange = function () {
        changeCamlock(this);
        changeSizes();
    }

    newEl(fittingDiv, "label", "id=internalThreadLabel / class=radioLabel / for=internalThread", daicamlockStr);

    let externalThread = newEl(fittingDiv, "input", "id=externalThread / type=radio / value=ExternalThread");
    externalThread.name = "extraConnection";
    externalThread.onchange = function () {
        changeCamlock(this);
        changeSizes();
    }

    newEl(fittingDiv, "label", "id=externalThreadLabel / class=radioLabel / for=externalThread", daicamlockStr);

    let stub = newEl(fittingDiv, "input", "id=stub / type=radio / value=Stub");
    stub.name = "extraConnection";
    stub.onchange = function () {
        changeCamlock(this);
        changeSizes();
    }

    newEl(fittingDiv, "label", "id=stubLabel / class=radioLabel / for=stub", daicamlockStr);

    let DNSelectContainer = newEl(camlockInputBlock, "div", "id=DNSelectContainer");

    newEl(DNSelectContainer, "label", "id=DNSelectLabel / for=DNSelect", daicamlockStr);

    DNSelect = newEl(DNSelectContainer, "select", "id=DNSelect", daicamlockStr);
    DNSelect.options[3].selected = true;
    DNSelect.onchange = function () {
        changeSizes();
    }
    father.dispatchEvent(new Event('change'));
    hoseFitting.dispatchEvent(new Event('change'));
}

function createSizesBlock(blockDiv) {
    let sizesBlock = newEl(blockDiv, "div", "id=sizesBlock / class=unPadContainer");

    newEl(sizesBlock, "div", "id=sizesBlockHeader / class=defaultContainer", daicamlockStr);

    sizeLabels[0] = newEl(sizesBlock, "label", "id=sizeLabel1", daicamlockStr);
    sizeLabels[1]= newEl(sizesBlock, "label", "id=sizeLabel2", daicamlockStr)
    sizeLabels[2] = newEl(sizesBlock, "label", "id=sizeLabel3", daicamlockStr)
}

function changeCamlock(radio) {
    if (radio.name === "mainConnection") {
        currentCamlock.mainConnection = radio.value;
    } else if (radio.name === "extraConnection") {
        currentCamlock.extraConnection = radio.value;
    }
    getCamlockInfo();
    camlockImage.src = "./assets/daicamlock/camlock" + currentCamlock.mainConnection + "_" + currentCamlock.extraConnection + ".png";
}

function getCamlockInfo() {
    for (let i = 0; i < camlockObject.type.length; i++) {
        if (currentCamlock.mainConnection + "_" + currentCamlock.extraConnection === camlockObject.type[i].connection) {
            currentCamlock.type = camlockObject.type[i].name;
        }
    }
}

function changeSizes() {
    currentCamlock.size = camlockSizes[DNSelect.selectedIndex];
    answerContainer.innerHTML = "Ваш камлок: <u>" + currentCamlock.type + "-" + currentCamlock.size+"</u>";
    let j = 0;
    for (let i = 0; i < sizeLabels.length; i++) {
        sizeLabels[i].innerHTML = "-";
        for (j; j < camlockImageSizes.length; j++) {
            if (camlockImageSizes[j].partOfType.includes(currentCamlock.type)) {
                sizeLabels[i].innerHTML = "<u>" + camlockImageSizes[j].name + ":</u> " + camlockImageSizes[j].size[DNSelect.selectedIndex];
                j++;
                break;
            }
        }
    }
}

