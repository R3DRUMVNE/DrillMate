import {createModuleHeader, createElement, appToast, share, getJSONData} from "./moduleScripts/otherModules.js";

export const camlockSizes = ["050", "075", "100", "125", "150", "200", "250", "300", "400", "500", "600"];
//export const camlockThreadSizes = ["1/2\" | 20мм", "3/4\" | 25мм", "1\" | 32мм", "1-1/4\" | 40мм", "1-1/2\" | 46мм", "2\" | 58мм", "2-1/2\" |74мм", "3\" | 86мм", "4\" | 111мм", "5\" | 137мм", "6\" | 162мм"];
//export const hoseFittingSizes = ["12мм | 1/2\"", "20мм | 3/4\"", "25мм | 1\"", "32мм | 1-1/4\"", "40мм | 1-1/2\"", "50мм | 2\"", "65мм | 2-1/2\"", "80мм | 3\"", "100мм | 4\"", "125мм | 5\"", "152мм | 6\""];


let daicamlockStringList = null;
let camlockObject = null;
let camlockImageSizeList = null;

let camlockImage, DNSelect, answer;
let sizeSpans = [];

let currentCamlock = {
    type: "",
    size: "",
    mainConnection: "",
    extraConnection: "",
};

export async function startDaiCamlockModule(container, moduleName, moduleID, addons) {
    let daicamlockDiv = createElement(container, 'div', 'id=daicamlockDiv');
    daicamlockStringList = await getJSONData("./objects/daicamlockStringList.json");
    camlockObject = await getJSONData("./objects/camlockTypeList.json");
    camlockImageSizeList = await getJSONData("./objects/camlockImageSizesList.json");
    createModuleHeader(moduleName, moduleID, daicamlockDiv).then();
    createOutputBlock(daicamlockDiv);
    createSizesBlock(daicamlockDiv);
    createInputBlock(daicamlockDiv, addons.URLCamlock);
    createGetCamlockBlock(daicamlockDiv);
}

function createOutputBlock(blockDiv) {
    camlockImage = createElement(blockDiv, "img", "id=camlockImage");

    let answerContainer = createElement(blockDiv, "div", "id=answerContainer / class=defaultContainer");
    answer = createElement(answerContainer, "div", "id=answer", daicamlockStringList);
    let shareCamlockbutton = createElement(answerContainer, "button", "id=shareCamlockbutton");
    createElement(shareCamlockbutton, "img", "id=shareModuleButtonImg / src=./assets/share.svg");
    shareCamlockbutton.onclick = function () {
        share("Поделиться камлоком", [["module", "daicamlock"], ["camlock", currentCamlock.type + "-" + currentCamlock.size]], "Камлок " + currentCamlock.type + "-" + currentCamlock.size);
    }
}

function createInputBlock(blockDiv, URLCamlock) {
    let camlockInputBlock = createElement(blockDiv, "div", "id=camlockInputBlock / class=defaultContainer");

    let connectionRadios = {};

    let fatherMotherContainer = createElement(camlockInputBlock, "div", "id=fatherMotherContainer");

    connectionRadios.father = createElement(fatherMotherContainer, "input", "id=father / type=radio / value=Father / checked");
    connectionRadios.father.name = "mainConnection";
    connectionRadios.father.onchange = function () {
        changeCamlock(this.name, this.value);
        changeSizes();
    }

    createElement(fatherMotherContainer, "label", "id=fatherLabel / class=radioLabel / for=father", daicamlockStringList);

    connectionRadios.mother = createElement(fatherMotherContainer, "input", "id=mother / type=radio / value=Mother");
    connectionRadios.mother.name = "mainConnection";
    connectionRadios.mother.onchange = function () {
        changeCamlock(this.name, this.value);
        changeSizes();
    }

    createElement(fatherMotherContainer, "label", "id=motherLabel / class=radioLabel / for=mother", daicamlockStringList);

    let fittingDiv = createElement(camlockInputBlock, "div", "id=fittingDiv");

    connectionRadios.hoseFitting = createElement(fittingDiv, "input", "id=hoseFitting / type=radio / value=HoseFitting / checked");
    connectionRadios.hoseFitting.name = "extraConnection";
    connectionRadios.hoseFitting.onchange = function () {
        changeCamlock(this.name, this.value);
        changeSizes();
    }


    createElement(fittingDiv, "label", "id=hoseFittingLabel / class=radioLabel / for=hoseFitting", daicamlockStringList);

    connectionRadios.internalThread = createElement(fittingDiv, "input", "id=internalThread / type=radio / value=InternalThread");
    connectionRadios.internalThread.name = "extraConnection";
    connectionRadios.internalThread.onchange = function () {
        changeCamlock(this.name, this.value);
        changeSizes();
    }

    createElement(fittingDiv, "label", "id=internalThreadLabel / class=radioLabel / for=internalThread", daicamlockStringList);

    connectionRadios.externalThread = createElement(fittingDiv, "input", "id=externalThread / type=radio / value=ExternalThread");
    connectionRadios.externalThread.name = "extraConnection";
    connectionRadios.externalThread.onchange = function () {
        changeCamlock(this.name, this.value);
        changeSizes();
    }

    createElement(fittingDiv, "label", "id=externalThreadLabel / class=radioLabel / for=externalThread", daicamlockStringList);

    connectionRadios.stub = createElement(fittingDiv, "input", "id=stub / type=radio / value=Stub");
    connectionRadios.stub.name = "extraConnection";
    connectionRadios.stub.onchange = function () {
        changeCamlock(this.name, this.value);
        changeSizes();
    }

    createElement(fittingDiv, "label", "id=stubLabel / class=radioLabel / for=stub", daicamlockStringList);

    let DNSelectContainer = createElement(camlockInputBlock, "div", "id=DNSelectContainer");

    createElement(DNSelectContainer, "span", "id=DNSelectSpan / for=DNSelect", daicamlockStringList);

    DNSelect = createElement(DNSelectContainer, "select", "id=DNSelect", daicamlockStringList);
    DNSelect.options[3].selected = true;
    DNSelect.onchange = function () {
        changeSizes();
    }

    if(URLCamlock !== null){
        let URLCamlockFound = changeToCamlockFromURL(URLCamlock, connectionRadios);
        if(!URLCamlockFound){
            appToast("Указанный камлок не найден", 3000).then();
            setDefaultCamlock();
        }
    } else{
        setDefaultCamlock();
    }

    function setDefaultCamlock(){
        connectionRadios.father.dispatchEvent(new Event('change'));
        connectionRadios.hoseFitting.dispatchEvent(new Event('change'));
    }
}

function createSizesBlock(blockDiv) {
    let sizesBlock = createElement(blockDiv, "div", "id=sizesBlock / class=unPadContainer");

    createElement(sizesBlock, "div", "id=sizesBlockHeader / class=defaultContainer", daicamlockStringList);

    sizeSpans[0] = createElement(sizesBlock, "span", "id=sizeSpan1", daicamlockStringList);
    sizeSpans[1] = createElement(sizesBlock, "span", "id=sizeSpan2", daicamlockStringList)
    sizeSpans[2] = createElement(sizesBlock, "span", "id=sizeSpan3", daicamlockStringList)
}

function changeCamlock(connectionName, connectionValue) {
    if (connectionName === "mainConnection") {
        currentCamlock.mainConnection = connectionValue;
    } else if (connectionName === "extraConnection") {
        currentCamlock.extraConnection = connectionValue;
    }

    for(let typeKey in camlockObject.type){
        if (currentCamlock.mainConnection + "_" + currentCamlock.extraConnection === camlockObject.type[typeKey].connection) {
            currentCamlock.type = typeKey;
        }
    }
    camlockImage.src = "./assets/daicamlock/camlock" + currentCamlock.mainConnection + "_" + currentCamlock.extraConnection + ".png";
}

function changeSizes() {
    currentCamlock.size = camlockSizes[DNSelect.selectedIndex];
    answer.innerHTML = "Ваш камлок: <u>" + currentCamlock.type + "-" + currentCamlock.size + "</u>";
    let j = 0;
    for (let i = 0; i < sizeSpans.length; i++) {
        sizeSpans[i].innerHTML = "-";
        for (j; j < camlockImageSizeList.length; j++) {
            if (camlockImageSizeList[j].partOfType.includes(currentCamlock.type)) {
                if(camlockImageSizeList[j].size[DNSelect.selectedIndex] !== undefined) {
                    sizeSpans[i].innerHTML = "<u>" + camlockImageSizeList[j].name + ":</u> " + camlockImageSizeList[j].size[DNSelect.selectedIndex];
                }
                j++;
                break;
            }
        }
    }
}

function createGetCamlockBlock(container) {
    let getCamlockBlock = createElement(container, "div", "id=getCamlockBlock / class=unPadContainer");
    createElement(getCamlockBlock, "div", "id=getCamlockHeader / class=defaultContainer", daicamlockStringList);

    let itemsContainer = createElement(getCamlockBlock, "div", "id=getCamlockItemsContainer / class=itemsContainer");

    let getContainer = createElement(itemsContainer, "div", "class=getContainer");

    let ozonButton = createElement(getContainer, "img", "class=getItemButton / src=./assets/shops/ozon.png");
    ozonButton.onclick = function () {
        let str = ("Камлок " + currentCamlock.type + "-" + currentCamlock.size).replaceAll(" ", "+");
        window.open("https://www.ozon.ru/search/?text=" + str + "&from_global=true", "_blank");
    }
    let wbButton = createElement(getContainer, "img", "class=getItemButton / src=./assets/shops/wb.png");
    wbButton.onclick = function () {
        let str = ("Камлок " + currentCamlock.type + "-" + currentCamlock.size).replaceAll(" ", "%20");
        window.open("https://www.wildberries.ru/catalog/0/search.aspx?search=" + str, "_blank");
    }
    let ymButton = createElement(getContainer, "img", "class=getItemButton / src=./assets/shops/ym.png");
    ymButton.onclick = function () {
        let str = ("Камлок " + currentCamlock.type + "-" + currentCamlock.size).replaceAll(" ", "%20");
        window.open("https://market.yandex.ru/search?text=" + str, "_blank");
    }
}

function changeToCamlockFromURL(camlockAnswer, connectionRadios) {
    let connectionsFound = false, sizesFound = false;
    for (let typeKey in camlockObject.type) {
        if (typeKey.toLowerCase() === camlockAnswer.split("-")[0].toLowerCase()) {
            let mainConnection = camlockObject.type[typeKey].connection.split("_")[0];
            let extraConnection = camlockObject.type[typeKey].connection.split("_")[1];
            for (let radio in connectionRadios) {
                if (connectionRadios[radio].value === mainConnection || connectionRadios[radio].value === extraConnection) {
                    connectionRadios[radio].checked = true;
                    connectionRadios[radio].dispatchEvent(new Event('change'));
                    connectionsFound = true;
                }
            }
        }
    }
    for (let i = 0; i < camlockSizes.length; i++) {
        if (camlockAnswer.split("-")[1] === camlockSizes[i]) {
            DNSelect.options[i].selected = true;
            DNSelect.dispatchEvent(new Event('change'));
            sizesFound = true;
        }
    }
    return connectionsFound && sizesFound;
}