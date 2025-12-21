import {
    createElement,
    animateElement,
    appAlert, appTheme_getColor,
    appToast,
    createModuleHeader,
    filterValueByNumber, getJSONData,
    scrollController,
    share,
    tryFormatToNumber, createSwitchContainer
} from "./moduleScripts/jointScripts.js";

let prokachaikaStringList = null;

const pumpList = {
    version: "1.2",
    models: [],
    minPerfFactor: [[0, 0, 2000], [0.17, 2000, 3000], [0.2, 3000, 3600], [0.23, 3600, 3800], [0.26, 3800, 4200], [0.29, 4200, 10000]],
}

let compareList = {
    list: [],
    findPump: function (pumpName) {
        for (let i = 0; i < this.list.length; i++) {
            if (pumpName === this.list[i].modelName) {
                return this.list[i];
            }
        }
        return false;
    },
    deletePump: function (pumpName) {
        for (let i = 0; i < this.list.length; i++) {
            if (pumpName === this.list[i].modelName) {
                this.list.splice(i, 1);
                return i;
            }
        }
        return false;
    },
};

export async function startProkachaikaModule(container, moduleName, moduleID, addons) {
    let prokachaikaArticle = createElement(container, "article", {id: "prokachaikaArticle"});
    prokachaikaStringList = await getJSONData("./objects/prokachaikaStringList.json");
    await createPumpList(prokachaikaArticle, addons.URLPumpModel);
    createAdditionalPanel(prokachaikaArticle);
    createFilterBlock(prokachaikaArticle, addons.flowRateLPH);
    createModuleHeader(moduleName, moduleID, prokachaikaArticle).then();
}

function createFilterBlock(container, flowRateLPH) {
    let filters = {
        name: "",
        pumpType: "Любой",
        pumpControl: "Любое",
        bodyMaterial: "Любой",
        wellFlowRate: "",
        pressure: "any",
        lowStatic: false,
        hideExcessPump: false,
    }
    const resetFilters = {};
    Object.assign(resetFilters, filters);

    let filterBlock = createElement(container, "section", {id: "filterBlock", class: "unPadContainer"});

    createElement(filterBlock, "div", {id: "filterBlockHeader", class: "defaultContainer"}, prokachaikaStringList);

    let itemsContainer = createElement(filterBlock, "div", {class: "itemsContainer"});

    let filterFieldsContainer = createElement(itemsContainer, "div", {id: "filterFieldsContainer"});

    let findPumpContainer = createElement(filterFieldsContainer, "div", {id: "findPumpContainer", class: "inpContainer"});
    createElement(findPumpContainer, "span", {id: "findPumpSpan"}, prokachaikaStringList);
    let findPump = createElement(findPumpContainer, "input", {id: "findPump", type: "text"});
    findPump.placeholder = prokachaikaStringList["findPumpHint"];
    findPump.oninput = function () {
        filters.name = findPump.value.trim();
        filterPumpList(filters);
    }

    let pumpTypeContainer = createElement(filterFieldsContainer, "div", {id: "pumpTypeContainer", class: "inpContainer"});
    createElement(pumpTypeContainer, "span", {id: "pumpTypeSpan"}, prokachaikaStringList);
    let pumpTypeSelect = createElement(pumpTypeContainer, "select", {id: "pumpTypeSelect"}, prokachaikaStringList);
    pumpTypeSelect.onchange = function () {
        filters.pumpType = pumpTypeSelect.options[pumpTypeSelect.selectedIndex].value;
        filterPumpList(filters);
    }

    let pumpControlContainer = createElement(filterFieldsContainer, "div", {id: "pumpControlContainer", class: "inpContainer"});
    createElement(pumpControlContainer, "span", {id: "pumpControlSpan"}, prokachaikaStringList);
    let pumpControlSelect = createElement(pumpControlContainer, "select", {id: "pumpControlSelect"}, prokachaikaStringList);
    pumpControlSelect.onchange = function () {
        filters.pumpControl = pumpControlSelect.options[pumpControlSelect.selectedIndex].value;
        filterPumpList(filters);
    }

    let bodyMaterialContainer = createElement(filterFieldsContainer, "div", {id: "bodyMaterialContainer", class: "inpContainer"});
    createElement(bodyMaterialContainer, "span", {id: "bodyMaterialSpan"}, prokachaikaStringList);
    let bodyMaterialSelect = createElement(bodyMaterialContainer, "select", {id: "bodyMaterialSelect"}, prokachaikaStringList);
    bodyMaterialSelect.onchange = function () {
        filters.bodyMaterial = bodyMaterialSelect.options[bodyMaterialSelect.selectedIndex].value;
        filterPumpList(filters);
    }

    let wellFlowRateContainer = createElement(filterFieldsContainer, "div", {id: "wellFlowRateContainer", class: "inpContainer"});
    createElement(wellFlowRateContainer, "span", {id: "wellFlowRateSpan"}, prokachaikaStringList);
    let wellFlowRate = createElement(wellFlowRateContainer, "input", {id: "wellFlowRate", type: "tel"});
    wellFlowRate.placeholder = prokachaikaStringList["wellFlowRateHint"];
    wellFlowRate.oninput = function () {
        filterValueByNumber(wellFlowRate);
        filters.wellFlowRate = wellFlowRate.value;
        filterPumpList(filters);
    }

    let pressureContainer = createElement(filterFieldsContainer, "div", {id: "pressureContainer", class: "inpContainer"});
    createElement(pressureContainer, "span", {id: "pressureSpan"}, prokachaikaStringList);
    let pressureSelect = createElement(pressureContainer, "select", {id: "pressure"}, prokachaikaStringList);
    pressureSelect.onchange = function () {
        filters.pressure = pressureSelect.value;
        filterPumpList(filters);
    }

    let checkboxFiltersContainer = createElement(itemsContainer, "div", {id: "checkboxFiltersContainer"});

    let lowStatic = createSwitchContainer(checkboxFiltersContainer, {}, {id: "lowStatic"}, {id: "lowStaticLabel"}, prokachaikaStringList);
    lowStatic.onchange = function () {
        filters.lowStatic = lowStatic.checked;
        filterPumpList(filters);
    }

    let hideExcessPump = createSwitchContainer(checkboxFiltersContainer, {}, {id: "hideExcessPump"}, {id: "hideExcessPumpLabel"}, prokachaikaStringList);
    hideExcessPump.onchange = function () {
        filters.hideExcessPump = hideExcessPump.checked;
        filterPumpList(filters);
    }

    let filtersResetButton = createElement(itemsContainer, "button", {id: "filtersResetButton"}, prokachaikaStringList);
    filtersResetButton.onclick = function () {
        Object.assign(filters, resetFilters);
        findPump.value = filters.name;
        pumpTypeSelect.value = filters.pumpType;
        pumpControlSelect.value = filters.pumpControl;
        bodyMaterialSelect.value = filters.bodyMaterial;
        wellFlowRate.value = filters.wellFlowRate;
        pressureSelect.value = filters.pressure;
        lowStatic.checked = filters.lowStatic;
        hideExcessPump.checked = filters.hideExcessPump;
        filterPumpList(filters);
    }

    if (flowRateLPH !== null && flowRateLPH !== undefined) {
        wellFlowRate.value = flowRateLPH;
        wellFlowRate.oninput();
        hideExcessPump.checked = true;
        hideExcessPump.onchange();
    }
}

function filterPumpList(filters) {
    for (let i = 0; i < pumpList.models.length; i++) {
        let hidePump = false;
        if (filters.name !== "") {
            !pumpList.models[i].name.toLowerCase().includes(filters.name.toLowerCase()) ? hidePump = true : null;
        }
        if (filters.pumpType !== "Любой") {
            pumpList.models[i].pumpType !== filters.pumpType ? hidePump = true : null;
        }
        if (filters.pumpControl !== "Любое") {
            pumpList.models[i].pumpControl !== filters.pumpControl ? hidePump = true : null;
        }
        if (filters.bodyMaterial !== "Любой") {
            pumpList.models[i].bodyMaterial !== filters.bodyMaterial ? hidePump = true : null;
        }
        if (filters.pressure !== "any") {
            let pressureRange = filters.pressure.split("-");
            if (!(pumpList.models[i].maxPressure >= tryFormatToNumber(pressureRange[0]) && pumpList.models[i].maxPressure < tryFormatToNumber(pressureRange[1]))) {
                hidePump = true;
            }
        }

        if (filters.lowStatic && pumpList.models[i].forLowStaticLevel !== filters.lowStatic) {
            hidePump = true;
        }

        pumpList.models[i].pumpPoints === undefined ? pumpList.models[i].pumpPoints = {} : null;
        if (filters.wellFlowRate !== "" && !hidePump) {
            if (filters.wellFlowRate * 1.05 > pumpList.models[i].maxPerfLPH) {
                hidePump = true;
            } else if (pumpList.models[i].pumpControl !== "Частотное") {
                for (let j = 0; j < pumpList.minPerfFactor.length; j++) {
                    if (pumpList.models[i].maxPerfLPH > pumpList.minPerfFactor[j][1] && pumpList.models[i].maxPerfLPH <= pumpList.minPerfFactor[j][2]) {
                        pumpList.models[i].pumpPoints.factor = pumpList.minPerfFactor[j][0];
                        pumpList.models[i].pumpPoints.minPerfLPH = Math.round(pumpList.models[i].maxPerfLPH * pumpList.models[i].pumpPoints.factor / 100) * 100;

                        if (filters.wellFlowRate < pumpList.models[i].pumpPoints.minPerfLPH) {
                            if(!filters.hideExcessPump){
                                pumpList.models[i].pumpPoints.perfPoints = "ИЗБ";
                                pumpList.models[i].pumpPoints.pointsColor = appTheme_getColor("excessPump");
                            } else{
                                hidePump = true;
                            }
                        } else {
                            pumpList.models[i].pumpPoints.perfPoints = Math.round(filters.wellFlowRate / pumpList.models[i].maxPerfLPH * 100);
                        }
                    }

                }
                if(pumpList.models[i].pumpPoints.perfPoints === "ИЗБ"){
                    pumpList.models[i].container.children[0].style = "width: 100%; background-color: var(--secondaryColor)"
                } else if(pumpList.models[i].pumpPoints.perfPoints > 10){
                    pumpList.models[i].container.children[0].style = "width: " + pumpList.models[i].pumpPoints.perfPoints + "%; background-color: var(--primaryColor)";
                }
            } else {
                if (pumpList.models[i].pumpPoints.minPerfLPH !== undefined && filters.wellFlowRate < pumpList.models[i].pumpPoints.minPerfLPH) {
                    hidePump = true;
                }
                pumpList.models[i].pumpPoints.perfPoints = "";
            }
        } else {
            pumpList.models[i].pumpPoints.perfPoints = "";
        }
        pumpList.models[i].container.children[1].children[1].innerHTML = pumpList.models[i].pumpPoints.perfPoints;

        hidePump ? pumpList.models[i].container.className = "pumpContainerHide" : pumpList.models[i].container.className = "pumpContainer";
    }
}

function createAdditionalPanel(container) {
    let additionalPanelContainer = createElement(container, "section", {id: "additionalPanelContainer"});

    let compareButton = createElement(additionalPanelContainer, "button", {id: "compareButton"}, prokachaikaStringList);
    compareButton.onclick = function () {
        if (compareList.list.length > 0) {
            openCompareList();
        } else {
            appToast("Таблица сравнения пуста", 2000).then();
        }
    }
}

function openCompareList() {
    scrollController.disableBodyScrolling();
    let compareListContainer = createElement(document.body, "div", {id: "compareListContainer", class: "unPadContainer popUp"});

    createElement(compareListContainer, "div", {id: "cL_header", class: "defaultContainer"}, prokachaikaStringList["compareButton"]);

    let compareTable = createElement(compareListContainer, "table", {id: "compareTable"});
    let thead = compareTable.createTHead();
    thead.insertRow().insertCell();
    let tbody = compareTable.createTBody();

    let i = 0;
    for (let param in compareList.list[i].params) {
        let row = tbody.insertRow();
        let cell = row.insertCell();
        cell.innerHTML = prokachaikaStringList[param + "Span"];
        i++;
    }

    let controlRow = tbody.insertRow();
    controlRow.insertCell();
    for (let i = 0; i < compareList.list.length; i++) {
        let pumpNameCell = thead.rows[0].insertCell();
        pumpNameCell.innerHTML = compareList.list[i].modelName;
        let deleteCell = controlRow.insertCell();
        let cL_deleteButton = createElement(deleteCell, "button", {id: "cL_deleteButton", value: compareList.list[i].modelName}, prokachaikaStringList);
        cL_deleteButton.onclick = function () {
            let x = compareList.deletePump(this.value);
            if (compareList.list.length < 1) {
                closeCompareList();
            } else {
                thead.rows[0].cells[x + 1].remove();
                for (let i = 0; i < tbody.rows.length; i++) {
                    tbody.rows[i].cells[x + 1].remove();
                }
            }
        }

        let j = 0;
        for (let param in compareList.list[i].params) {
            let cell = tbody.rows[j].insertCell();
            cell.innerHTML = compareList.list[i].params[param].toString();
            j++;
        }
    }

    let cL_buttonsContainer = createElement(compareListContainer, "div", {id: "cL_buttonsContainer"});

    let cL_clearButton = createElement(cL_buttonsContainer, "button", {id: "cL_clearButton"}, prokachaikaStringList);
    cL_clearButton.onclick = function () {
        compareList.list = [];
        closeCompareList();
        appToast("Таблица сравнения очищена", 2000).then();
    }

    let cL_closeButton = createElement(cL_buttonsContainer, "button", {id: "cL_closeButton"}, prokachaikaStringList);
    cL_closeButton.onclick = function () {
        closeCompareList();
    }

    function closeCompareList() {
        animateElement(compareListContainer, ["popUp_close_start"], ["popUp_close_end"]).then(() => {
            scrollController.enableBodyScrolling();
            compareListContainer.remove();
        });
    }
    animateElement(compareListContainer, ["popUp_open_start"], ["popUp_open_end"]).then();
}

function checkPumpListVersion(newPumps){
    if (localStorage.getItem("prokachaika.pumpListVersion") === null || localStorage.getItem("prokachaika.pumpListVersion") !== pumpList.version) {
        let newPumpsString = "";
        for(let i = 0; i < newPumps.length; i++) {
            i !== newPumps.length - 1 ? newPumpsString += newPumps[i].name + ", " : newPumpsString += newPumps[i].name + ".";
        }
        localStorage.setItem("prokachaika.pumpListVersion", pumpList.version);
        appAlert("Список насосов", prokachaikaStringList["whatsNew"][0] + pumpList.version + prokachaikaStringList["whatsNew"][1] + newPumpsString + "</p>");
    }
}

async function createPumpList(container, URLPumpModel) {
    let noModelError = false;

    const newPumps = await getJSONData("./objects/newPumps.json");
    checkPumpListVersion(newPumps);

    pumpList.models = [...await getJSONData("./objects/pumpList.json"), ...newPumps];

    shuffleArray(pumpList.models);

    let pumpListContainer = createElement(container, "section", {id: "pumpListContainer"});

    for (let i = 0; i < pumpList.models.length; i++) {
        pumpList.models[i].container = createElement(pumpListContainer, "div", {class: "pumpContainer"});
        createElement(pumpList.models[i].container, "div", {class: "persentContainer"});
        let pumpDescription = createElement(pumpList.models[i].container, "div", {class: "pumpDescription"});
        createElement(pumpDescription, "span", {class: "pumpName"}, pumpList.models[i].name);
        createElement(pumpDescription, "span", {class: "pumpPoints"});

        pumpList.models[i].container.onclick = function () {
            openPumpInfo(pumpList.models[i]);
        }

        getMaxPerf(pumpList.models[i]);
        pumpList.models[i].maxPressure = Number((pumpList.models[i].liftingHeight * 0.098064).toFixed(1));

        if (URLPumpModel !== null && URLPumpModel !== undefined) {
            if (URLPumpModel.toLowerCase() === pumpList.models[i].name.toLowerCase()) {
                noModelError = true;
                openPumpInfo(pumpList.models[i]);
            }
        } else {
            noModelError = true;
        }
    }
    if (!noModelError) {
        appToast("Ошибка: указанная модель насоса не найдена", 2000).then();
    }

    function getMaxPerf(pump) {
        if (pump.maxPerfLPM !== null || pump.maxPerfLPH !== null) {
            if (pump.maxPerfLPM === null && pump.maxPerfLPH !== null) {
                pump.maxPerfLPM = Math.round(pump.maxPerfLPH / 60);
            }
            if (pump.maxPerfLPH === null && pump.maxPerfLPM !== null) {
                pump.maxPerfLPH = wholeRound(pump.maxPerfLPM * 60, 2);
            }
            return;
        }
        return null;

        function wholeRound(number, rank) {
            let fraction = Math.pow(10, rank);
            return Math.round(Math.round(number) / fraction) * fraction;
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

function openPumpInfo(model) {
    let pumpInfo = {
        modelName: model.name,
        params: {
            pumpType: model.pumpType,
            pumpVersion: model.pumpControl === "Нет" ? "Насос" : "Насосная станция",
            pumpControl: model.pumpControl,
            bodyMaterial: model.bodyMaterial,
            capacity: model.capacity,
            maxPerf: model.maxPerfLPM + " л/мин | " + model.maxPerfLPH + " л/час",
            liftingHeight: model.liftingHeight,
            maxPressure: model.maxPressure,
            forLowStaticLevel: model.forLowStaticLevel ? "Да" : "Нет",
            accumulator: model.accumulator,
        },
    };

    scrollController.disableBodyScrolling();
    let pumpInfoContainer = createElement(document.body, "div", {id: "pumpInfoContainer", class: "unPadContainer popUp"});

    createElement(pumpInfoContainer, "div", {id: "pumpNameContainer", class: "defaultContainer"}, pumpInfo.modelName);

    let itemsContainer = createElement(pumpInfoContainer, "div", {id: "pumpInfoItems", class: "itemsContainer"});

    let paramsTableBody = createElement(itemsContainer, "div", {id: "paramsTableBody", class: "unPadContainer"});

    for (let param in pumpInfo.params) {
        createElement(paramsTableBody, "div", {id: param + "Span", class: "paramContainer"}, prokachaikaStringList);
        createElement(paramsTableBody, "div", {id: param + "Value", class: "valueContainer"}, pumpInfo.params[param].toString());
    }

    let pumpInfoButtons = createElement(itemsContainer, "div", {id: "pumpInfoButtons"});

    if (pumpInfo.params.pumpControl !== "Нет" && pumpInfo.params.accumulator !== "Нет" && pumpInfo.params.pumpControl !== "Частотное") {
        let relayHAButton = createElement(pumpInfoButtons, "button", {id: "relayHAButton"}, prokachaikaStringList);
        relayHAButton.onclick = function () {
            scrollController.disableElementScrolling(pumpInfoContainer);
            openRelayHASettings(pumpInfo.params.maxPressure);
        }
    }

    createElement(pumpInfoButtons, "span", {id: "searchPumpSpan"}, prokachaikaStringList);

    let getPumpContainer = createElement(pumpInfoButtons, "div", {class: "getContainer"});

    let ozonButton = createElement(getPumpContainer, "img", {class: "getItemButton", src: "./assets/shops/ozon.png"});
    ozonButton.onclick = function () {
        let str = pumpInfo.modelName.replaceAll(" ", "+");
        window.open("https://www.ozon.ru/search/?text=" + str + "&from_global=true", "_blank");
    }
    let wbButton = createElement(getPumpContainer, "img", {class: "getItemButton", src: "./assets/shops/wb.png"});
    wbButton.onclick = function () {
        let str = pumpInfo.modelName.replaceAll(" ", "%20");
        window.open("https://www.wildberries.ru/catalog/0/search.aspx?search=" + str, "_blank");
    }
    let viButton = createElement(getPumpContainer, "img", {class: "getItemButton", src: "./assets/shops/vi.png"});
    viButton.onclick = function () {
        let str = pumpInfo.modelName.replaceAll(" ", "%20");
        window.open("https://www.vseinstrumenti.ru/search/?what=" + str, "_blank");
    }
    let ymButton = createElement(getPumpContainer, "img", {class: "getItemButton", src: "./assets/shops/ym.png"});
    ymButton.onclick = function () {
        let str = pumpInfo.modelName.replaceAll(" ", "%20");
        window.open("https://market.yandex.ru/search?text=" + str, "_blank");
    }
    let lpButton = createElement(getPumpContainer, "img", {class: "getItemButton", src: "./assets/shops/lp.png"});
    lpButton.onclick = function () {
        let str = pumpInfo.modelName.replaceAll(" ", "+");
        window.open("https://lemanapro.ru/search/?q=" + str, "_blank");
    }

    let pumpInfoControls = createElement(itemsContainer, "div", {id: "pumpInfoControls"});

    let shareButton = createElement(pumpInfoControls, "button", {id: "shareButton"}, prokachaikaStringList);
    shareButton.onclick = function () {
        scrollController.disableElementScrolling(pumpInfoContainer);
        share("Поделиться насосом", {module: "prokachaika", pumpModel: pumpInfo.modelName.trim()}, pumpInfo.params.pumpVersion + " " + pumpInfo.modelName);
    }

    let goComparePumpButton = createElement(pumpInfoControls, "button", {id: "goComparePumpButton"}, prokachaikaStringList);
    goComparePumpButton.onclick = function () {
        if (compareList.findPump(pumpInfo.modelName) === false) {
            compareList.list.push(pumpInfo);
            appToast("Насос добавлен в таблицу сравнения", 2000).then();
        } else {
            appToast("Данный насос уже в таблице сравнения", 2000).then();
        }
    }

    let pI_closeButton = createElement(pumpInfoControls, "button", {id: "pI_closeButton"}, prokachaikaStringList);
    pI_closeButton.onclick = function () {
        animateElement(pumpInfoContainer, ["popUp_close_start"], ["popUp_close_end"]).then(() => {
            scrollController.enableBodyScrolling();
            pumpInfoContainer.remove();
        });
    }
    animateElement(pumpInfoContainer, ["popUp_open_start"], ["popUp_open_end"]).then();
}

function openRelayHASettings(maxPressure) {
    let relayHAContainer = createElement(document.body, "div", {id: "relayHAContainer", class: "unPadContainer popUp"});

    createElement(relayHAContainer, "div", {id: "rHA_header", class: "defaultContainer"}, prokachaikaStringList);

    let itemsContainer = createElement(relayHAContainer, "div", {class: "itemsContainer"});

    let pressureOnContainer = createElement(itemsContainer, "div", {id: "pressureOnContainer", class: "inpContainer"});
    createElement(pressureOnContainer, "span", {id: "pressureOnSpan"}, prokachaikaStringList);
    let pressureOnInput = createElement(pressureOnContainer, "input", {id: "pressureOnInput", type: "tel"});
    pressureOnInput.value = prokachaikaStringList["pressureOnInput"];
    let pressureHA = tryFormatToNumber(pressureOnInput.value);
    pressureOnInput.oninput = function () {
        pressureHA = tryFormatToNumber(pressureOnInput.value);
        if (pressureHA !== false) {
            pressureHAInput.value = (pressureHA * 0.9).toFixed(2);
        }
    }

    let pressureHAContainer = createElement(itemsContainer, "div", {id: "pressureHAContainer", class: "inpContainer"});
    createElement(pressureHAContainer, "span", {id: "pressureHASpan"}, prokachaikaStringList);
    let pressureHAInput = createElement(pressureHAContainer, "input", {id: "pressureHAInput", type: "tel", disabled: ""});

    pressureOnInput.oninput();

    let pressureOffContainer = createElement(itemsContainer, "div", {id: "pressureOffContainer", class: "inpContainer"});
    createElement(pressureOffContainer, "span", {id: "pressureOffSpan"}, prokachaikaStringList);
    let pressureOffInput = createElement(pressureOffContainer, "input", {id: "pressureOffInput", type: "tel", disabled: ""});

    pressureOffInput.value = (maxPressure * 0.82).toFixed(1);

    let rHA_closeButton = createElement(itemsContainer, "button", {id: "rHA_closeButton"}, prokachaikaStringList);
    rHA_closeButton.onclick = function () {
        animateElement(relayHAContainer, ["popUp_close_start"], ["popUp_close_end"]).then(() => {
            scrollController.enableElementScrolling();
            relayHAContainer.remove();
        });
    }
    animateElement(relayHAContainer, ["popUp_open_start"], ["popUp_open_end"]).then();
}