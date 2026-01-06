import {
    createModuleHeader,
    appToast,
    share,
    getJSONData,
    animateElement, scrollController, createElement, isExists
} from "./moduleScripts/jointScripts.js";
import {moduleVar} from "./moduleScripts/buffer.js";

//export const camlockThreadSizes = ["1/2\" | 20мм", "3/4\" | 25мм", "1\" | 32мм", "1-1/4\" | 40мм", "1-1/2\" | 46мм", "2\" | 58мм", "2-1/2\" |74мм", "3\" | 86мм", "4\" | 111мм", "5\" | 137мм", "6\" | 162мм"];
//export const hoseFittingSizes = ["12мм | 1/2\"", "20мм | 3/4\"", "25мм | 1\"", "32мм | 1-1/4\"", "40мм | 1-1/2\"", "50мм | 2\"", "65мм | 2-1/2\"", "80мм | 3\"", "100мм | 4\"", "125мм | 5\"", "152мм | 6\""];

export async function startDaiCamlockModule(container, moduleName, moduleID, addons) {
    moduleVar.moduleLoaded = false;
    moduleVar.sizeSpans = [];
    moduleVar.camlockSizes = ["050", "075", "100", "125", "150", "200", "250", "300", "400", "500", "600"];
    moduleVar.camlockObject = await getJSONData("./objects/camlockTypeList.json");
    moduleVar.camlockImageSizeList = await getJSONData("./objects/camlockImageSizesList.json");
    moduleVar.daicamlockStringList = await getJSONData("./objects/daicamlockStringList.json");
    moduleVar.currentCamlock = {
        type: "",
        size: "",
        mainConnection: "",
        extraConnection: "",
    };

    const daicamlockArticle = createElement(container, "article", {id: "daicamlockArticle"});
    createModuleHeader(moduleName, moduleID, daicamlockArticle).then();
    createOutputBlock(daicamlockArticle);
    createSizesBlock(daicamlockArticle);
    createInputBlock(daicamlockArticle, addons.URLCamlock);
    createGetCamlockBlock(daicamlockArticle);
}

function createOutputBlock(blockDiv) {
    moduleVar.camlockImage = createElement(blockDiv, "img", {id: "camlockImage", class: "camlockImageOut_end"});

    const answerContainer = createElement(blockDiv, "section", {id: "answerContainer", class: "defaultContainer"});
    moduleVar.answer = createElement(answerContainer, "div", {id: "answer"}, moduleVar.daicamlockStringList);
    const shareCamlockbutton = createElement(answerContainer, "button", {id: "shareCamlockbutton"});
    createElement(shareCamlockbutton, "img", {id: "shareModuleButtonImg", src: "./assets/share.svg"});
    shareCamlockbutton.onclick = function () {
        scrollController.disableBodyScrolling().then();
        share("Поделиться камлоком", {module: "daicamlock", camlock: moduleVar.currentCamlock.type + "-" + moduleVar.currentCamlock.size}, "Камлок " + moduleVar.currentCamlock.type + "-" + moduleVar.currentCamlock.size);
    }
}

function createInputBlock(blockDiv, URLCamlock) {
    const camlockInputBlock = createElement(blockDiv, "section", {id: "camlockInputBlock", class: "defaultContainer"});

    const connectionRadios = {};

    const fatherMotherContainer = createElement(camlockInputBlock, "div", {id: "fatherMotherContainer"});

    connectionRadios.father = createElement(fatherMotherContainer, "input", {id: "father", type: "radio", value: "Father", checked: ""});
    connectionRadios.father.name = "mainConnection";
    connectionRadios.father.onchange = function () {
        changeCamlock(this.name, this.value);
        changeSizes();
    }

    createElement(fatherMotherContainer, "label", {id: "fatherLabel", class: "radioLabel", for: "father"}, moduleVar.daicamlockStringList);

    connectionRadios.mother = createElement(fatherMotherContainer, "input", {id: "mother", type: "radio", value: "Mother"});
    connectionRadios.mother.name = "mainConnection";
    connectionRadios.mother.onchange = function () {
        changeCamlock(this.name, this.value);
        changeSizes();
    }

    createElement(fatherMotherContainer, "label", {id: "motherLabel", class: "radioLabel", for: "mother"}, moduleVar.daicamlockStringList);

    const fittingDiv = createElement(camlockInputBlock, "div", {id: "fittingDiv"});

    connectionRadios.hoseFitting = createElement(fittingDiv, "input", {id: "hoseFitting", type: "radio", value: "HoseFitting", checked: ""});
    connectionRadios.hoseFitting.name = "extraConnection";
    connectionRadios.hoseFitting.onchange = function () {
        changeCamlock(this.name, this.value);
        changeSizes();
    }


    createElement(fittingDiv, "label", {id: "hoseFittingLabel", class: "radioLabel", for: "hoseFitting"}, moduleVar.daicamlockStringList);

    connectionRadios.internalThread = createElement(fittingDiv, "input", {id: "internalThread", type: "radio", value: "InternalThread"});
    connectionRadios.internalThread.name = "extraConnection";
    connectionRadios.internalThread.onchange = function () {
        changeCamlock(this.name, this.value);
        changeSizes();
    }

    createElement(fittingDiv, "label", {id: "internalThreadLabel", class: "radioLabel", for: "internalThread"}, moduleVar.daicamlockStringList);

    connectionRadios.externalThread = createElement(fittingDiv, "input", {id: "externalThread", type: "radio", value: "ExternalThread"});
    connectionRadios.externalThread.name = "extraConnection";
    connectionRadios.externalThread.onchange = function () {
        changeCamlock(this.name, this.value);
        changeSizes();
    }

    createElement(fittingDiv, "label", {id: "externalThreadLabel", class: "radioLabel", for: "externalThread"}, moduleVar.daicamlockStringList);

    connectionRadios.stub = createElement(fittingDiv, "input", {id: "stub", type: "radio", value: "Stub"});
    connectionRadios.stub.name = "extraConnection";
    connectionRadios.stub.onchange = function () {
        changeCamlock(this.name, this.value);
        changeSizes();
    }

    createElement(fittingDiv, "label", {id: "stubLabel", class: "radioLabel", for: "stub"}, moduleVar.daicamlockStringList);

    const DNSelectContainer = createElement(camlockInputBlock, "div", {id: "DNSelectContainer"});

    createElement(DNSelectContainer, "span", {id: "DNSelectSpan", for: "DNSelect"}, moduleVar.daicamlockStringList);

    moduleVar.DNSelect = createElement(DNSelectContainer, "select", {id: "DNSelect"}, moduleVar.daicamlockStringList);
    moduleVar.DNSelect.options[3].selected = true;
    moduleVar.DNSelect.onchange = function () {
        changeSizes();
    }

    if (isExists(URLCamlock)) {
        const URLCamlockFound = changeToCamlockFromURL(URLCamlock, connectionRadios);
        if (!URLCamlockFound) {
            appToast("Указанный камлок не найден", 3000).then();
            setDefaultCamlock();
        }
    } else {
        setDefaultCamlock();
    }

    function setDefaultCamlock() {
        connectionRadios.father.dispatchEvent(new Event('change'));
        connectionRadios.hoseFitting.dispatchEvent(new Event('change'));
    }

    animateElement(moduleVar.camlockImage, ["camlockImageIn_start"], ["camlockImageIn_end"]).then(() => {
        moduleVar.moduleLoaded = true;
    });
}

function createSizesBlock(blockDiv) {
    const sizesBlock = createElement(blockDiv, "section", {id: "sizesBlock", class: "unPadContainer"});

    createElement(sizesBlock, "div", {id: "sizesBlockHeader", class: "defaultContainer"}, moduleVar.daicamlockStringList);

    moduleVar.sizeSpans[0] = createElement(sizesBlock, "span", {id: "sizeSpan1"}, moduleVar.daicamlockStringList);
    moduleVar.sizeSpans[1] = createElement(sizesBlock, "span", {id: "sizeSpan2"}, moduleVar.daicamlockStringList)
    moduleVar.sizeSpans[2] = createElement(sizesBlock, "span", {id: "sizeSpan3"}, moduleVar.daicamlockStringList)
}

function changeCamlock(connectionName, connectionValue) {
    if (connectionName === "mainConnection") {
        moduleVar.currentCamlock.mainConnection = connectionValue;
    } else if (connectionName === "extraConnection") {
        moduleVar.currentCamlock.extraConnection = connectionValue;
    }

    for (let typeKey in moduleVar.camlockObject.type) {
        if (moduleVar.currentCamlock.mainConnection + "_" + moduleVar.currentCamlock.extraConnection === moduleVar.camlockObject.type[typeKey].connection) {
            moduleVar.currentCamlock.type = typeKey;
        }
    }
    if(moduleVar.moduleLoaded){
        animateElement(moduleVar.camlockImage, ["camlockImageOut_start"], ["camlockImageOut_end"]).then(async () => {
            moduleVar.camlockImage.src = "./assets/daicamlock/camlock" + moduleVar.currentCamlock.mainConnection + "_" + moduleVar.currentCamlock.extraConnection + ".png";
            setTimeout(() =>{
                animateElement(moduleVar.camlockImage, ["camlockImageIn_start"], ["camlockImageIn_end"]).then();
            }, 1);
        });
    } else{
        moduleVar.camlockImage.src = "./assets/daicamlock/camlock" + moduleVar.currentCamlock.mainConnection + "_" + moduleVar.currentCamlock.extraConnection + ".png";
    }
}

function changeSizes() {
    moduleVar.currentCamlock.size = moduleVar.camlockSizes[moduleVar.DNSelect.selectedIndex];
    moduleVar.answer.innerHTML = "Ваш камлок: <u>" + moduleVar.currentCamlock.type + "-" + moduleVar.currentCamlock.size + "</u>";
    let j = 0;
    for (let i = 0; i < moduleVar.sizeSpans.length; i++) {
        moduleVar.sizeSpans[i].innerHTML = "-";
        for (j; j < moduleVar.camlockImageSizeList.length; j++) {
            if (moduleVar.camlockImageSizeList[j].partOfType.includes(moduleVar.currentCamlock.type)) {
                if (isExists(moduleVar.camlockImageSizeList[j].size[moduleVar.DNSelect.selectedIndex])) {
                    moduleVar.sizeSpans[i].innerHTML = "<u>" + moduleVar.camlockImageSizeList[j].name + ":</u> " + moduleVar.camlockImageSizeList[j].size[moduleVar.DNSelect.selectedIndex];
                }
                j++;
                break;
            }
        }
    }
}

function createGetCamlockBlock(container) {
    const getCamlockBlock = createElement(container, "section", {id: "getCamlockBlock", class: "unPadContainer"});
    createElement(getCamlockBlock, "div", {id: "getCamlockHeader", class: "defaultContainer"}, moduleVar.daicamlockStringList);

    const itemsContainer = createElement(getCamlockBlock, "div", {id: "getCamlockItemsContainer", class: "itemsContainer"});

    const getContainer = createElement(itemsContainer, "div", {class: "getContainer"});

    const ozonButton = createElement(getContainer, "img", {class: "getItemButton", src: "./assets/shops/ozon.png"});
    ozonButton.onclick = function () {
        const str = ("Камлок " + moduleVar.currentCamlock.type + "-" + moduleVar.currentCamlock.size).replaceAll(" ", "+");
        window.open("https://www.ozon.ru/search/?text=" + str + "&from_global=true", "_blank");
    }
    const wbButton = createElement(getContainer, "img", {class: "getItemButton", src: "./assets/shops/wb.png"});
    wbButton.onclick = function () {
        const str = ("Камлок " + moduleVar.currentCamlock.type + "-" + moduleVar.currentCamlock.size).replaceAll(" ", "%20");
        window.open("https://www.wildberries.ru/catalog/0/search.aspx?search=" + str, "_blank");
    }
    const ymButton = createElement(getContainer, "img", {class: "getItemButton", src: "./assets/shops/ym.png"});
    ymButton.onclick = function () {
        const str = ("Камлок " + moduleVar.currentCamlock.type + "-" + moduleVar.currentCamlock.size).replaceAll(" ", "%20");
        window.open("https://market.yandex.ru/search?text=" + str, "_blank");
    }
}

function changeToCamlockFromURL(camlockAnswer, connectionRadios) {
    let connectionsFound = false, sizesFound = false;
    for (let typeKey in moduleVar.camlockObject.type) {
        if (typeKey.toLowerCase() === camlockAnswer.split("-")[0].toLowerCase()) {
            const mainConnection = moduleVar.camlockObject.type[typeKey].connection.split("_")[0];
            const extraConnection = moduleVar.camlockObject.type[typeKey].connection.split("_")[1];
            for (let radio in connectionRadios) {
                if (connectionRadios[radio].value === mainConnection || connectionRadios[radio].value === extraConnection) {
                    connectionRadios[radio].checked = true;
                    connectionRadios[radio].dispatchEvent(new Event('change'));
                    connectionsFound = true;
                }
            }
        }
    }
    for (let i = 0; i < moduleVar.camlockSizes.length; i++) {
        if (camlockAnswer.split("-")[1] === moduleVar.camlockSizes[i]) {
            moduleVar.DNSelect.options[i].selected = true;
            moduleVar.DNSelect.dispatchEvent(new Event('change'));
            sizesFound = true;
        }
    }
    return connectionsFound && sizesFound;
}