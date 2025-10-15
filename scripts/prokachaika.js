import {
    appAlert,
    appToast,
    createCheckboxContainer,
    createElement,
    createModuleHeader,
    filterValueByNumber,
    scrollController,
    share,
    tryFormatToNumber
} from "./modules/otherModules.js";
import {prokachaikaStr} from "./objects/strings.js";
import {minPerfFactor, pL_ver, pumpList} from "./objects/pumpList.js";
import {appTheme} from "./objects/colors.js";

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

export function startProkachaikaModule(container, moduleName, moduleID, addons) {
    let prokachaikaDiv = createElement(container, 'div', 'id=prokachaikaDiv');
    createModuleHeader(moduleName, moduleID, prokachaikaDiv);
    createFilterBlock(prokachaikaDiv);
    createAdditionalPanel(prokachaikaDiv);
    createPumpList(prokachaikaDiv, addons.URLPumpModel);

    if(localStorage.getItem("pumpListVer") === null || localStorage.getItem("pumpListVer") !== pL_ver){
        localStorage.setItem("pumpListVer", pL_ver);
        appAlert("Список насосов", pumpList.whatsNew);
    }
}

function createFilterBlock(container) {
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

    let filterBlock = createElement(container, "div", "id=filterBlock / class=unPadContainer");

    createElement(filterBlock, "div", "id=filterBlockHeader / class=defaultContainer", prokachaikaStr);

    let itemsContainer = createElement(filterBlock, "div", "class=itemsContainer");

    let filterFieldsContainer = createElement(itemsContainer, "div", "id=filterFieldsContainer");

    let findPumpContainer = createElement(filterFieldsContainer, "div", "id=findPumpContainer / class=inpContainer");
    createElement(findPumpContainer, "label", "id=findPumpLabel", prokachaikaStr);
    let findPump = createElement(findPumpContainer, "input", "id=findPump / type=text");
    findPump.placeholder = prokachaikaStr["findPumpHint"];
    findPump.oninput = function () {
        filters.name = findPump.value.trim();
        filterPumpList(filters);
    }

    let pumpTypeContainer = createElement(filterFieldsContainer, "div", "id=pumpTypeContainer / class=inpContainer");
    createElement(pumpTypeContainer, "label", "id=pumpTypeLabel", prokachaikaStr);
    let pumpTypeSelect = createElement(pumpTypeContainer, "select", "id=pumpTypeSelect", prokachaikaStr);
    pumpTypeSelect.onchange = function () {
        filters.pumpType = pumpTypeSelect.options[pumpTypeSelect.selectedIndex].value;
        filterPumpList(filters);
    }

    let pumpControlContainer = createElement(filterFieldsContainer, "div", "id=pumpControlContainer / class=inpContainer");
    createElement(pumpControlContainer, "label", "id=pumpControlLabel", prokachaikaStr);
    let pumpControlSelect = createElement(pumpControlContainer, "select", "id=pumpControlSelect", prokachaikaStr);
    pumpControlSelect.onchange = function () {
        filters.pumpControl = pumpControlSelect.options[pumpControlSelect.selectedIndex].value;
        filterPumpList(filters);
    }

    let bodyMaterialContainer = createElement(filterFieldsContainer, "div", "id=bodyMaterialContainer / class=inpContainer");
    createElement(bodyMaterialContainer, "label", "id=bodyMaterialLabel", prokachaikaStr);
    let bodyMaterialSelect = createElement(bodyMaterialContainer, "select", "id=bodyMaterialSelect", prokachaikaStr);
    bodyMaterialSelect.onchange = function () {
        filters.bodyMaterial = bodyMaterialSelect.options[bodyMaterialSelect.selectedIndex].value;
        filterPumpList(filters);
    }

    let wellFlowRateContainer = createElement(filterFieldsContainer, "div", "id=wellFlowRateContainer / class=inpContainer");
    createElement(wellFlowRateContainer, "label", "id=wellFlowRateLabel", prokachaikaStr);
    let wellFlowRate = createElement(wellFlowRateContainer, "input", "id=wellFlowRate / type=tel");
    wellFlowRate.placeholder = prokachaikaStr["wellFlowRateHint"];
    wellFlowRate.oninput = function () {
        filterValueByNumber(wellFlowRate);
        filters.wellFlowRate = wellFlowRate.value;
        filterPumpList(filters);
    }

    let pressureContainer = createElement(filterFieldsContainer, "div", "id=pressureContainer / class=inpContainer");
    createElement(pressureContainer, "label", "id=pressureLabel", prokachaikaStr);
    let pressureSelect = createElement(pressureContainer, "select", "id=pressure", prokachaikaStr);
    pressureSelect.onchange = function () {
        filters.pressure = pressureSelect.value;
        filterPumpList(filters);
    }

    let checkboxFiltersContainer = createElement(itemsContainer, "div", "id=checkboxFiltersContainer");

    let lowStatic = createCheckboxContainer(checkboxFiltersContainer, "id=lowStatic", "id=lowStaticLabel", prokachaikaStr);
    lowStatic.onchange = function () {
        filters.lowStatic = lowStatic.checked;
        filterPumpList(filters);
    }

    let hideExcessPump = createCheckboxContainer(checkboxFiltersContainer, "id=hideExcessPump", "id=hideExcessPumpLabel", prokachaikaStr);
    hideExcessPump.onchange = function () {
        filters.hideExcessPump = hideExcessPump.checked;
        filterPumpList(filters);
    }

    let filtersResetButton = createElement(itemsContainer, "button", "id=filtersResetButton", prokachaikaStr);
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
                for (let j = 0; j < minPerfFactor.length; j++) {
                    if (pumpList.models[i].maxPerfLPH > minPerfFactor[j][1] && pumpList.models[i].maxPerfLPH <= minPerfFactor[j][2]) {
                        pumpList.models[i].pumpPoints.factor = minPerfFactor[j][0];
                        pumpList.models[i].pumpPoints.minPerfLPH = Math.round(pumpList.models[i].maxPerfLPH * pumpList.models[i].pumpPoints.factor / 100) * 100;

                        if (filters.wellFlowRate < pumpList.models[i].pumpPoints.minPerfLPH) {
                            if(!filters.hideExcessPump){
                                pumpList.models[i].pumpPoints.perfPoints = "ИЗБ";
                                pumpList.models[i].pumpPoints.pointsColor = appTheme.getColor("excessPump");
                            } else{
                                hidePump = true;
                            }
                        } else {
                            pumpList.models[i].pumpPoints.perfPoints = Math.round(filters.wellFlowRate / pumpList.models[i].maxPerfLPH * 100);
                            pumpList.models[i].pumpPoints.pointsColor = "color-mix(in srgb-linear, " + appTheme.getColor("excessPump") + ", " + appTheme.getColor("greatPump") + " " + pumpList.models[i].pumpPoints.perfPoints + "%);";
                        }
                    }

                }
                pumpList.models[i].container.children[1].style = "color: " + pumpList.models[i].pumpPoints.pointsColor;
            } else {
                if (pumpList.models[i].pumpPoints.minPerfLPH !== undefined && filters.wellFlowRate < pumpList.models[i].pumpPoints.minPerfLPH) {
                    hidePump = true;
                }
                pumpList.models[i].pumpPoints.perfPoints = "";
            }
        } else {
            pumpList.models[i].pumpPoints.perfPoints = "";
        }
        pumpList.models[i].container.children[1].innerHTML = pumpList.models[i].pumpPoints.perfPoints;

        hidePump ? pumpList.models[i].container.className = "defaultContainer pumpContainerHide" : pumpList.models[i].container.className = "defaultContainer pumpContainer";
    }
}

function createAdditionalPanel(container) {
    let additionalPanelContainer = createElement(container, "div", "id=additionalPanelContainer");

    let compareButton = createElement(additionalPanelContainer, "button", "id=compareButton", prokachaikaStr);
    compareButton.onclick = function () {
        if (compareList.list.length > 0) {
            openCompareList();
        } else {
            appToast("Таблица сравнения пуста", 3000).then();
        }
    }
}

function openCompareList() {
    scrollController.disableBodyScrolling();
    let compareListContainer = createElement(document.body, "div", "id=compareListContainer / class=unPadContainer popUp");

    createElement(compareListContainer, "div", "id=cL_header / class=defaultContainer", prokachaikaStr["compareButton"]);

    let compareTable = createElement(compareListContainer, "table", "id=compareTable");
    let thead = compareTable.createTHead();
    thead.insertRow().insertCell();
    let tbody = compareTable.createTBody();

    let i = 0;
    for (let param in compareList.list[i].params) {
        let row = tbody.insertRow();
        let cell = row.insertCell();
        cell.innerHTML = prokachaikaStr[param + "Label"];
        i++;
    }

    let controlRow = tbody.insertRow();
    controlRow.insertCell();
    for (let i = 0; i < compareList.list.length; i++) {
        let pumpNameCell = thead.rows[0].insertCell();
        pumpNameCell.innerHTML = compareList.list[i].modelName;
        let deleteCell = controlRow.insertCell();
        let cL_deleteButton = createElement(deleteCell, "button", "id=cL_deleteButton / value=" + compareList.list[i].modelName, prokachaikaStr);
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

    let cL_buttonsContainer = createElement(compareListContainer, "div", "id=cL_buttonsContainer");

    let cL_clearButton = createElement(cL_buttonsContainer, "button", "id=cL_clearButton", prokachaikaStr);
    cL_clearButton.onclick = function () {
        compareList.list = [];
        closeCompareList();
        appToast("Таблица сравнения очищена", 3000).then();
    }

    let cL_closeButton = createElement(cL_buttonsContainer, "button", "id=cL_closeButton", prokachaikaStr);
    cL_closeButton.onclick = function () {
        closeCompareList();
    }

    function closeCompareList() {
        scrollController.enableBodyScrolling();
        compareListContainer.remove();
    }
}

function createPumpList(container, URLPumpModel) {
    let noModelError = false;

    shuffleArray(pumpList.models);

    let pumpListContainer = createElement(container, "div", "id=pumpListContainer");

    for (let i = 0; i < pumpList.models.length; i++) {
        pumpList.models[i].container = createElement(pumpListContainer, "div", "class=defaultContainer pumpContainer");
        pumpList.models[i].container.onclick = function () {
            openPumpInfo(pumpList.models[i]);
        }

        createElement(pumpList.models[i].container, "label", "class=pumpName", pumpList.models[i].name);
        createElement(pumpList.models[i].container, "label", "class=pumpPoints");

        getMaxPerf(pumpList.models[i]);
        pumpList.models[i].maxPressure = Number((pumpList.models[i].liftingHeight * 0.098064).toFixed(1));

        if (URLPumpModel !== null) {
            if (URLPumpModel.toLowerCase() === pumpList.models[i].name.toLowerCase()) {
                noModelError = true;
                openPumpInfo(pumpList.models[i]);
            }
        } else {
            noModelError = true;
        }
    }
    if (!noModelError) {
        appToast("Ошибка: указанная модель насоса не найдена", 3000).then();
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
    let pumpInfoContainer = createElement(document.body, "div", "id=pumpInfoContainer / class=unPadContainer popUp");

    createElement(pumpInfoContainer, "div", "id=pumpNameContainer / class=defaultContainer", pumpInfo.modelName);

    let itemsContainer = createElement(pumpInfoContainer, "div", "id=pumpInfoItems / class=itemsContainer");

    let paramsTableBody = createElement(itemsContainer, "div", "id=paramsTableBody / class=unPadContainer");

    for (let param in pumpInfo.params) {
        createElement(paramsTableBody, "div", "id=" + param + "Label / class=paramContainer", prokachaikaStr);
        createElement(paramsTableBody, "div", "id=" + param + "Value / class=valueContainer", pumpInfo.params[param].toString());
    }

    let pumpInfoButtons = createElement(itemsContainer, "div", "id=pumpInfoButtons");

    if (pumpInfo.params.pumpControl !== "Нет" && pumpInfo.params.pumpControl !== "Частотное") {
        let relayHAButton = createElement(pumpInfoButtons, "button", "id=relayHAButton", prokachaikaStr);
        relayHAButton.onclick = function () {
            scrollController.disableElementScrolling(pumpInfoContainer);
            openRelayHASettings(pumpInfo.params.maxPressure);
        }
    }

    createElement(pumpInfoButtons, "label", "id=searchPumpLabel", prokachaikaStr);

    let getPumpContainer = createElement(pumpInfoButtons, "div", "class=getContainer");

    let ozonButton = createElement(getPumpContainer, "img", "class=getItemButton / src=./assets/shops/ozon.png");
    ozonButton.onclick = function () {
        let str = pumpInfo.modelName.replaceAll(" ", "+");
        window.open("https://www.ozon.ru/search/?text=" + str + "&from_global=true", "_blank");
    }
    let wbButton = createElement(getPumpContainer, "img", "class=getItemButton / src=./assets/shops/wb.png");
    wbButton.onclick = function () {
        let str = pumpInfo.modelName.replaceAll(" ", "%20");
        window.open("https://www.wildberries.ru/catalog/0/search.aspx?search=" + str, "_blank");
    }
    let viButton = createElement(getPumpContainer, "img", "class=getItemButton / src=./assets/shops/vi.png");
    viButton.onclick = function () {
        let str = pumpInfo.modelName.replaceAll(" ", "%20");
        window.open("https://www.vseinstrumenti.ru/search/?what=" + str, "_blank");
    }
    let ymButton = createElement(getPumpContainer, "img", "class=getItemButton / src=./assets/shops/ym.png");
    ymButton.onclick = function () {
        let str = pumpInfo.modelName.replaceAll(" ", "%20");
        window.open("https://market.yandex.ru/search?text=" + str, "_blank");
    }
    let lpButton = createElement(getPumpContainer, "img", "class=getItemButton / src=./assets/shops/lp.png");
    lpButton.onclick = function () {
        let str = pumpInfo.modelName.replaceAll(" ", "+");
        window.open("https://lemanapro.ru/search/?q=" + str, "_blank");
    }

    let pumpInfoControls = createElement(itemsContainer, "div", "id=pumpInfoControls");

    let shareButton = createElement(pumpInfoControls, "button", "id=shareButton", prokachaikaStr);
    shareButton.onclick = function () {
        scrollController.disableElementScrolling(pumpInfoContainer);
        share("Поделиться насосом", [["module", "prokachaika"], ["pumpModel", pumpInfo.modelName.trim()]], pumpInfo.params.pumpVersion + " " + pumpInfo.modelName);
    }

    let goComparePumpButton = createElement(pumpInfoControls, "button", "id=goComparePumpButton", prokachaikaStr);
    goComparePumpButton.onclick = function () {
        if (compareList.findPump(pumpInfo.modelName) === false) {
            compareList.list.push(pumpInfo);
            appToast("Насос добавлен в таблицу сравнения", 3000).then();
        } else {
            appToast("Данный насос уже в таблице сравнения", 3000).then();
        }
    }

    let pI_closeButton = createElement(pumpInfoControls, "button", "id=pI_closeButton", prokachaikaStr);
    pI_closeButton.onclick = function () {
        scrollController.enableBodyScrolling();
        pumpInfoContainer.remove();
    }
}

function openRelayHASettings(maxPressure) {
    let relayHAContainer = createElement(document.body, "div", "id=relayHAContainer / class=unPadContainer popUp");

    createElement(relayHAContainer, "div", "id=rHA_header / class=defaultContainer", prokachaikaStr);

    let itemsContainer = createElement(relayHAContainer, "div", "class=itemsContainer");

    let pressureOnContainer = createElement(itemsContainer, "div", "id=pressureOnContainer / class=inpContainer");
    createElement(pressureOnContainer, "label", "id=pressureOnLabel", prokachaikaStr);
    let pressureOnInput = createElement(pressureOnContainer, "input", "id=pressureOnInput / type=tel");
    pressureOnInput.value = prokachaikaStr["pressureOnInput"];
    let pressureHA = tryFormatToNumber(pressureOnInput.value);
    pressureOnInput.oninput = function () {
        pressureHA = tryFormatToNumber(pressureOnInput.value);
        if (pressureHA !== false) {
            pressureHAInput.value = (pressureHA * 0.9).toFixed(2);
        }
    }

    let pressureHAContainer = createElement(itemsContainer, "div", "id=pressureHAContainer / class=inpContainer");
    createElement(pressureHAContainer, "label", "id=pressureHALabel", prokachaikaStr);
    let pressureHAInput = createElement(pressureHAContainer, "input", "id=pressureHAInput / type=tel / disabled");

    pressureOnInput.oninput();

    let pressureOffContainer = createElement(itemsContainer, "div", "id=pressureOffContainer / class=inpContainer");
    createElement(pressureOffContainer, "label", "id=pressureOffLabel", prokachaikaStr);
    let pressureOffInput = createElement(pressureOffContainer, "input", "id=pressureOffInput / type=tel / disabled");

    pressureOffInput.value = (maxPressure * 0.82).toFixed(1);

    let rHA_closeButton = createElement(itemsContainer, "button", "id=rHA_closeButton", prokachaikaStr);
    rHA_closeButton.onclick = function () {
        scrollController.enableElementScrolling();
        relayHAContainer.remove();
    }
}