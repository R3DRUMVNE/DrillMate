import {
    createElement,
    animateElement,
    appAlert, appTheme_getColor,
    appToast,
    createModuleHeader,
    filterValueByNumber, getJSONData,
    scrollController,
    share,
    tryFormatToNumber, createSwitchContainer, isExists
} from "./moduleScripts/jointScripts.js";
import {moduleVar} from "./moduleScripts/buffer.js";

export async function startProkachaikaModule(container, moduleName, moduleID, addons) {
    moduleVar.compareList = {
        list: {},
        listLengthSpan: null,
        add: function (pumpName, pumpInfo) {
            this.list[pumpName] = pumpInfo;
            this.refreshListInfo();
        },
        remove: function (pumpName) {
            Reflect.deleteProperty(this.list, pumpName);
            this.refreshListInfo();
        },
        refreshListInfo: function () {
            localStorage.setItem("prokachaika.compareList", JSON.stringify(this.list));
            this.listLengthSpan.innerHTML = Object.keys(this.list).length;
        },
        getFromLS: function () {
            const compareListLS = JSON.parse(localStorage.getItem("prokachaika.compareList"));
            if (isExists(compareListLS)) {
                moduleVar.compareList.list = compareListLS;
            }
        }
    };

    moduleVar.compareList.getFromLS();
    const prokachaikaArticle = createElement(container, "article", {id: "prokachaikaArticle"});
    moduleVar.prokachaikaStringList = await getJSONData("./objects/prokachaikaStringList.json");
    await createPumpList(prokachaikaArticle, addons.URLPumpModel);
    createAdditionalPanel(prokachaikaArticle);
    createFilterBlock(prokachaikaArticle, addons.flowRateLPH);
    createModuleHeader(moduleName, moduleID, prokachaikaArticle).then();
}

function createFilterBlock(container, flowRateLPH) {
    const filters = {
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

    const filterBlock = createElement(container, "section", {id: "filterBlock", class: "unPadContainer"});

    createElement(filterBlock, "div", {id: "filterBlockHeader", class: "defaultContainer"}, moduleVar.prokachaikaStringList);

    const itemsContainer = createElement(filterBlock, "div", {class: "itemsContainer"});

    const filterFieldsContainer = createElement(itemsContainer, "div", {id: "filterFieldsContainer"});

    const findPumpContainer = createElement(filterFieldsContainer, "div", {
        id: "findPumpContainer",
        class: "inpContainer"
    });
    createElement(findPumpContainer, "span", {id: "findPumpSpan"}, moduleVar.prokachaikaStringList);
    const findPump = createElement(findPumpContainer, "input", {id: "findPump", type: "text"});
    findPump.placeholder = moduleVar.prokachaikaStringList["findPumpHint"];
    findPump.oninput = function () {
        filters.name = findPump.value.trim();
        filterPumpList(filters);
    }

    const pumpTypeContainer = createElement(filterFieldsContainer, "div", {
        id: "pumpTypeContainer",
        class: "inpContainer"
    });
    createElement(pumpTypeContainer, "span", {id: "pumpTypeSpan"}, moduleVar.prokachaikaStringList);
    const pumpTypeSelect = createElement(pumpTypeContainer, "select", {id: "pumpTypeSelect"}, moduleVar.prokachaikaStringList);
    pumpTypeSelect.onchange = function () {
        filters.pumpType = pumpTypeSelect.options[pumpTypeSelect.selectedIndex].value;
        filterPumpList(filters);
    }

    const pumpControlContainer = createElement(filterFieldsContainer, "div", {
        id: "pumpControlContainer",
        class: "inpContainer"
    });
    createElement(pumpControlContainer, "span", {id: "pumpControlSpan"}, moduleVar.prokachaikaStringList);
    const pumpControlSelect = createElement(pumpControlContainer, "select", {id: "pumpControlSelect"}, moduleVar.prokachaikaStringList);
    pumpControlSelect.onchange = function () {
        filters.pumpControl = pumpControlSelect.options[pumpControlSelect.selectedIndex].value;
        filterPumpList(filters);
    }

    const bodyMaterialContainer = createElement(filterFieldsContainer, "div", {
        id: "bodyMaterialContainer",
        class: "inpContainer"
    });
    createElement(bodyMaterialContainer, "span", {id: "bodyMaterialSpan"}, moduleVar.prokachaikaStringList);
    const bodyMaterialSelect = createElement(bodyMaterialContainer, "select", {id: "bodyMaterialSelect"}, moduleVar.prokachaikaStringList);
    bodyMaterialSelect.onchange = function () {
        filters.bodyMaterial = bodyMaterialSelect.options[bodyMaterialSelect.selectedIndex].value;
        filterPumpList(filters);
    }

    const wellFlowRateContainer = createElement(filterFieldsContainer, "div", {
        id: "wellFlowRateContainer",
        class: "inpContainer"
    });
    createElement(wellFlowRateContainer, "span", {id: "wellFlowRateSpan"}, moduleVar.prokachaikaStringList);
    const wellFlowRate = createElement(wellFlowRateContainer, "input", {id: "wellFlowRate", type: "tel"});
    wellFlowRate.placeholder = moduleVar.prokachaikaStringList["wellFlowRateHint"];
    wellFlowRate.oninput = function () {
        filterValueByNumber(wellFlowRate);
        filters.wellFlowRate = wellFlowRate.value;
        filterPumpList(filters);
    }

    const pressureContainer = createElement(filterFieldsContainer, "div", {
        id: "pressureContainer",
        class: "inpContainer"
    });
    createElement(pressureContainer, "span", {id: "pressureSpan"}, moduleVar.prokachaikaStringList);
    const pressureSelect = createElement(pressureContainer, "select", {id: "pressure"}, moduleVar.prokachaikaStringList);
    pressureSelect.onchange = function () {
        filters.pressure = pressureSelect.value;
        filterPumpList(filters);
    }

    const checkboxFiltersContainer = createElement(itemsContainer, "div", {id: "checkboxFiltersContainer"});

    const lowStatic = createSwitchContainer(checkboxFiltersContainer, {}, {id: "lowStatic"}, {id: "lowStaticLabel"}, moduleVar.prokachaikaStringList);
    lowStatic.onchange = function () {
        filters.lowStatic = lowStatic.checked;
        filterPumpList(filters);
    }

    const hideExcessPump = createSwitchContainer(checkboxFiltersContainer, {}, {id: "hideExcessPump"}, {id: "hideExcessPumpLabel"}, moduleVar.prokachaikaStringList);
    hideExcessPump.onchange = function () {
        filters.hideExcessPump = hideExcessPump.checked;
        filterPumpList(filters);
    }

    const filtersResetButton = createElement(itemsContainer, "button", {id: "filtersResetButton"}, moduleVar.prokachaikaStringList);
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

    if (isExists(flowRateLPH)) {
        wellFlowRate.value = flowRateLPH;
        wellFlowRate.oninput();
        hideExcessPump.checked = true;
        hideExcessPump.onchange();
    }
}

function filterPumpList(filters) {
    for (let model in moduleVar.pumpList.models) {
        let hidePump = false;
        if (filters.name !== "") {
            !model.toLowerCase().includes(filters.name.toLowerCase()) ? hidePump = true : null;
        }
        if (filters.pumpType !== "Любой") {
            moduleVar.pumpList.models[model].pumpType !== filters.pumpType ? hidePump = true : null;
        }
        if (filters.pumpControl !== "Любое") {
            moduleVar.pumpList.models[model].pumpControl !== filters.pumpControl ? hidePump = true : null;
        }
        if (filters.bodyMaterial !== "Любой") {
            moduleVar.pumpList.models[model].bodyMaterial !== filters.bodyMaterial ? hidePump = true : null;
        }
        if (filters.pressure !== "any") {
            const pressureRange = filters.pressure.split("-");
            if (!(moduleVar.pumpList.models[model].maxPressure >= tryFormatToNumber(pressureRange[0]) && moduleVar.pumpList.models[model].maxPressure < tryFormatToNumber(pressureRange[1]))) {
                hidePump = true;
            }
        }

        if (filters.lowStatic && moduleVar.pumpList.models[model].forLowStaticLevel !== filters.lowStatic) {
            hidePump = true;
        }

        !isExists(moduleVar.pumpList.models[model].pumpPoints) ? moduleVar.pumpList.models[model].pumpPoints = {} : null;
        moduleVar.pumpList.models[model].container.children[0].style = "width: 0; background-color: none";
        if (filters.wellFlowRate !== "" && !hidePump) {
            if (filters.wellFlowRate * 1.05 > moduleVar.pumpList.models[model].maxPerfLPH) {
                hidePump = true;
            } else if (moduleVar.pumpList.models[model].pumpControl !== "Частотное") {
                for (let j = 0; j < moduleVar.pumpList.minPerfFactor.length; j++) {
                    if (moduleVar.pumpList.models[model].maxPerfLPH > moduleVar.pumpList.minPerfFactor[j][1] && moduleVar.pumpList.models[model].maxPerfLPH <= moduleVar.pumpList.minPerfFactor[j][2]) {
                        moduleVar.pumpList.models[model].pumpPoints.factor = moduleVar.pumpList.minPerfFactor[j][0];
                        moduleVar.pumpList.models[model].pumpPoints.minPerfLPH = Math.round(moduleVar.pumpList.models[model].maxPerfLPH * moduleVar.pumpList.models[model].pumpPoints.factor / 100) * 100;

                        if (filters.wellFlowRate < moduleVar.pumpList.models[model].pumpPoints.minPerfLPH) {
                            if (!filters.hideExcessPump) {
                                moduleVar.pumpList.models[model].pumpPoints.perfPoints = "ИЗБ";
                                moduleVar.pumpList.models[model].pumpPoints.pointsColor = appTheme_getColor("excessPump");
                            } else {
                                hidePump = true;
                            }
                        } else {
                            moduleVar.pumpList.models[model].pumpPoints.perfPoints = Math.round(filters.wellFlowRate / moduleVar.pumpList.models[model].maxPerfLPH * 100);
                        }
                    }
                }
                if (moduleVar.pumpList.models[model].pumpPoints.perfPoints === "ИЗБ") {
                    moduleVar.pumpList.models[model].container.children[0].style = "width: 100%; background-color: var(--secondaryColor)"
                } else if (moduleVar.pumpList.models[model].pumpPoints.perfPoints > 10) {
                    moduleVar.pumpList.models[model].container.children[0].style = "width: " + moduleVar.pumpList.models[model].pumpPoints.perfPoints + "%; background-color: var(--primaryColor)";
                }
            } else {
                if (isExists(moduleVar.pumpList.models[model].pumpPoints.minPerfLPH) && filters.wellFlowRate < moduleVar.pumpList.models[model].pumpPoints.minPerfLPH) {
                    hidePump = true;
                }
                moduleVar.pumpList.models[model].pumpPoints.perfPoints = "";
            }
        } else {
            moduleVar.pumpList.models[model].pumpPoints.perfPoints = "";
        }
        moduleVar.pumpList.models[model].container.children[1].children[1].innerHTML = moduleVar.pumpList.models[model].pumpPoints.perfPoints;

        hidePump ? moduleVar.pumpList.models[model].container.className = "pumpContainerHide" : moduleVar.pumpList.models[model].container.className = "pumpContainer";
    }
}

function createAdditionalPanel(container) {
    const additionalPanelContainer = createElement(container, "section", {id: "additionalPanelContainer"});

    const compareButton = createElement(additionalPanelContainer, "button", {id: "compareButton"}, moduleVar.prokachaikaStringList);
    moduleVar.compareList.listLengthSpan = createElement(compareButton, "span", {id: "listLengthSpan"}, Object.keys(moduleVar.compareList.list).length.toString());
    compareButton.onclick = function () {
        if (Object.keys(moduleVar.compareList.list).length > 0) {
            openCompareList();
        } else {
            appToast("Таблица сравнения пуста", 2000).then();
        }
    }
}

function openCompareList() {
    scrollController.disableBodyScrolling().then();
    const compareListContainer = createElement(document.body, "div", {
        id: "compareListContainer",
        class: "unPadContainer popUp"
    });

    createElement(compareListContainer, "div", {
        id: "cL_header",
        class: "defaultContainer"
    }, moduleVar.prokachaikaStringList["compareButton"]);

    const compareTableContainer = createElement(compareListContainer, "div", {id: "compareTableContainer"});
    compareTableContainer.addEventListener("wheel", (e) => {
        e.preventDefault();
        compareTableContainer.scrollLeft += e.deltaY;
    })
    const compareTable = createElement(compareTableContainer, "table", {id: "compareTable"});
    const thead = compareTable.createTHead();
    thead.insertRow().insertCell();
    const tbody = compareTable.createTBody();

    //создание подписей для строк с параметрами
    for (let param in moduleVar.compareList.list[Object.keys(moduleVar.compareList.list)[0]]) {
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.innerHTML = moduleVar.prokachaikaStringList[param + "Span"];
    }

    //создание заголовков в столбцах с названиями насосов и строки удаления
    const controlRow = tbody.insertRow();
    controlRow.insertCell();
    for (let modelName in moduleVar.compareList.list) {
        const pumpNameCell = thead.rows[0].insertCell();
        const pumpLink = createElement(pumpNameCell, "a", {}, modelName);
        pumpLink.onclick = function () {
            closeCompareList().then(() => {
                openPumpInfo(pumpLink.innerHTML);
            });
        }
        const deleteCell = controlRow.insertCell();

        const cL_deleteButton = createElement(deleteCell, "button", {
            id: "cL_deleteButton",
            value: modelName
        }, moduleVar.prokachaikaStringList);
        cL_deleteButton.onclick = function () {
            const currentButton = this;
            moduleVar.compareList.remove(currentButton.value);
            if (Object.keys(moduleVar.compareList.list).length < 1) {
                closeCompareList().then();
            } else {
                thead.rows[0].cells[currentButton.parentElement.cellIndex].remove();
                for (let i = 0; i < tbody.rows.length; i++) {
                    tbody.rows[i].cells[currentButton.parentElement.cellIndex].remove();
                }
            }
        }

        //заполнение таблицы
        let j = 0;
        for (let param in moduleVar.compareList.list[modelName]) {
            const cell = tbody.rows[j].insertCell();
            cell.innerHTML = moduleVar.compareList.list[modelName][param].toString();
            j++;
        }
    }

    const cL_buttonsContainer = createElement(compareListContainer, "div", {id: "cL_buttonsContainer"});

    const cL_clearButton = createElement(cL_buttonsContainer, "button", {id: "cL_clearButton"}, moduleVar.prokachaikaStringList);
    cL_clearButton.onclick = function () {
        moduleVar.compareList.list = {};
        moduleVar.compareList.refreshListInfo();
        closeCompareList().then();
        appToast("Таблица сравнения очищена", 2000).then();
    }

    const cL_closeButton = createElement(cL_buttonsContainer, "button", {id: "cL_closeButton"}, moduleVar.prokachaikaStringList);
    cL_closeButton.onclick = function () {
        closeCompareList().then();
    }

    function closeCompareList() {
        return new Promise(resolve => {
            animateElement(compareListContainer, ["popUp_close_start"], ["popUp_close_end"]).then(() => {
                compareListContainer.remove();
                scrollController.enableBodyScrolling().then(() => {
                    resolve();
                });
            });
        });
    }

    animateElement(compareListContainer, ["popUp_open_start"], ["popUp_open_end"]).then();
}

function checkPumpListVersion(newPumps) {
    return new Promise(async resolve => {
        if (!isExists(localStorage.getItem("prokachaika.pumpListVersion")) || localStorage.getItem("prokachaika.pumpListVersion") !== moduleVar.pumpList.version) {
            const newPumpsString = Object.keys(newPumps).toString().replaceAll(",", "<br>");
            localStorage.setItem("prokachaika.pumpListVersion", moduleVar.pumpList.version);
            await appAlert("Список насосов", moduleVar.prokachaikaStringList["whatsNew"][0] + moduleVar.pumpList.version + moduleVar.prokachaikaStringList["whatsNew"][1] + newPumpsString + "</p>");
        }
        resolve();
    });
}

async function createPumpList(container, URLPumpModel) {
    const newPumps = await getJSONData("./objects/newPumps.json");
    moduleVar.pumpList = await getJSONData("./objects/pumpList.json");
    moduleVar.pumpList.models = shuffleObject({...moduleVar.pumpList.models, ...newPumps});

    const pumpListContainer = createElement(container, "section", {id: "pumpListContainer"});

    for (let model in moduleVar.pumpList.models) {
        moduleVar.pumpList.models[model].container = createElement(pumpListContainer, "div", {class: "pumpContainer"});
        createElement(moduleVar.pumpList.models[model].container, "div", {class: "persentContainer"});
        const pumpDescription = createElement(moduleVar.pumpList.models[model].container, "div", {class: "pumpDescription"});
        createElement(pumpDescription, "span", {class: "pumpName"}, model);
        createElement(pumpDescription, "span", {class: "pumpPoints"});

        moduleVar.pumpList.models[model].container.onclick = function () {
            openPumpInfo(model);
        }

        getMaxPerf(moduleVar.pumpList.models[model]);
        moduleVar.pumpList.models[model].maxPressure = Number((moduleVar.pumpList.models[model].liftingHeight * 0.098064).toFixed(1));
    }

    checkPumpListVersion(newPumps).then(() => {
        if (isExists(URLPumpModel)) {
            moduleVar.pumpList.models.hasOwnProperty(URLPumpModel) ? openPumpInfo(URLPumpModel) : appToast("Ошибка: указанная модель насоса не найдена", 2000).then();
        }
    });

    function getMaxPerf(pump) {
        if (isExists(pump.maxPerfLPM) || isExists(pump.maxPerfLPH)) {
            if (!isExists(pump.maxPerfLPM) && isExists(pump.maxPerfLPH)) {
                pump.maxPerfLPM = Math.round(pump.maxPerfLPH / 60);
            }
            if (!isExists(pump.maxPerfLPH) && isExists(pump.maxPerfLPM)) {
                pump.maxPerfLPH = wholeRound(pump.maxPerfLPM * 60, 2);
            }
            return;
        }
        return null;

        function wholeRound(number, rank) {
            const fraction = Math.pow(10, rank);
            return Math.round(Math.round(number) / fraction) * fraction;
        }
    }

    function shuffleObject(object) {
        const keys = Object.keys(object);

        for (let i = keys.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [keys[i], keys[j]] = [keys[j], keys[i]];
        }

        const shuffledObject = {};
        keys.forEach((key) => {
            shuffledObject[key] = object[key];
        });

        return shuffledObject;
    }
}

function openPumpInfo(modelName) {
    const pumpInfo = {
        pumpType: moduleVar.pumpList.models[modelName].pumpType,
        pumpVersion: moduleVar.pumpList.models[modelName].pumpControl === "Нет" ? "Насос" : "Насосная станция",
        pumpControl: moduleVar.pumpList.models[modelName].pumpControl,
        bodyMaterial: moduleVar.pumpList.models[modelName].bodyMaterial,
        capacity: moduleVar.pumpList.models[modelName].capacity,
        maxPerf: moduleVar.pumpList.models[modelName].maxPerfLPM + " л/мин | " + moduleVar.pumpList.models[modelName].maxPerfLPH + " л/час",
        liftingHeight: moduleVar.pumpList.models[modelName].liftingHeight,
        maxPressure: moduleVar.pumpList.models[modelName].maxPressure,
        forLowStaticLevel: moduleVar.pumpList.models[modelName].forLowStaticLevel ? "Да" : "Нет",
        accumulator: moduleVar.pumpList.models[modelName].accumulator,
    };

    scrollController.disableBodyScrolling().then();
    const pumpInfoContainer = createElement(document.body, "div", {
        id: "pumpInfoContainer",
        class: "unPadContainer popUp"
    });

    createElement(pumpInfoContainer, "div", {id: "pumpNameContainer", class: "defaultContainer"}, modelName);

    const itemsContainer = createElement(pumpInfoContainer, "div", {id: "pumpInfoItems", class: "itemsContainer"});

    const paramsTableBody = createElement(itemsContainer, "div", {id: "paramsTableBody", class: "unPadContainer"});

    for (let param in pumpInfo) {
        createElement(paramsTableBody, "div", {id: param + "Span", class: "paramContainer"}, moduleVar.prokachaikaStringList);
        createElement(paramsTableBody, "div", {
            id: param + "Value",
            class: "valueContainer"
        }, pumpInfo[param].toString());
    }

    const pumpInfoButtons = createElement(itemsContainer, "div", {id: "pumpInfoButtons"});

    if (pumpInfo.pumpControl !== "Нет" && pumpInfo.accumulator !== "Нет" && pumpInfo.pumpControl !== "Частотное") {
        const relayHAButton = createElement(pumpInfoButtons, "button", {id: "relayHAButton"}, moduleVar.prokachaikaStringList);
        relayHAButton.onclick = function () {
            scrollController.disableElementScrolling(pumpInfoContainer);
            openRelayHASettings(pumpInfo.maxPressure);
        }
    }

    createElement(pumpInfoButtons, "span", {id: "searchPumpSpan"}, moduleVar.prokachaikaStringList);

    const getPumpContainer = createElement(pumpInfoButtons, "div", {class: "getContainer"});

    const ozonButton = createElement(getPumpContainer, "img", {class: "getItemButton", src: "./assets/shops/ozon.png"});
    ozonButton.onclick = function () {
        const str = modelName.replaceAll(" ", "+");
        window.open("https://www.ozon.ru/search/?text=" + str + "&from_global=true", "_blank");
    }
    const wbButton = createElement(getPumpContainer, "img", {class: "getItemButton", src: "./assets/shops/wb.png"});
    wbButton.onclick = function () {
        const str = modelName.replaceAll(" ", "%20");
        window.open("https://www.wildberries.ru/catalog/0/search.aspx?search=" + str, "_blank");
    }
    const viButton = createElement(getPumpContainer, "img", {class: "getItemButton", src: "./assets/shops/vi.png"});
    viButton.onclick = function () {
        const str = modelName.replaceAll(" ", "%20");
        window.open("https://www.vseinstrumenti.ru/search/?what=" + str, "_blank");
    }
    const ymButton = createElement(getPumpContainer, "img", {class: "getItemButton", src: "./assets/shops/ym.png"});
    ymButton.onclick = function () {
        const str = modelName.replaceAll(" ", "%20");
        window.open("https://market.yandex.ru/search?text=" + str, "_blank");
    }
    const lpButton = createElement(getPumpContainer, "img", {class: "getItemButton", src: "./assets/shops/lp.png"});
    lpButton.onclick = function () {
        const str = modelName.replaceAll(" ", "+");
        window.open("https://lemanapro.ru/search/?q=" + str, "_blank");
    }

    const pumpInfoControls = createElement(itemsContainer, "div", {id: "pumpInfoControls"});

    const shareButton = createElement(pumpInfoControls, "button", {id: "shareButton"}, moduleVar.prokachaikaStringList);
    shareButton.onclick = function () {
        scrollController.disableElementScrolling(pumpInfoContainer);
        share("Поделиться насосом", {
            module: "prokachaika",
            pumpModel: modelName.trim()
        }, pumpInfo.pumpVersion + " " + modelName);
    }

    const goComparePumpButton = createElement(pumpInfoControls, "button", {
        id: "goComparePumpButton",
        mode: "_add"
    }, moduleVar.prokachaikaStringList["goComparePumpButton_add"]);
    if (moduleVar.compareList.list.hasOwnProperty(modelName)) {
        const mode = "_remove";
        goComparePumpButton.setAttribute("mode", mode);
        goComparePumpButton.innerHTML = moduleVar.prokachaikaStringList[goComparePumpButton.id + mode];
    }
    goComparePumpButton.onclick = function () {
        let mode = this.getAttribute("mode");
        if (mode === "_add") {
            moduleVar.compareList.add(modelName, pumpInfo);
            appToast("Насос добавлен в таблицу сравнения", 2000).then();
            mode = "_remove";
        } else if (mode === "_remove") {
            moduleVar.compareList.remove(modelName);
            appToast("Насос удалён из таблицы сравнения", 2000).then();
            mode = "_add";
        }
        this.innerHTML = moduleVar.prokachaikaStringList[this.id + mode];
        this.setAttribute("mode", mode);
    }

    const pI_closeButton = createElement(pumpInfoControls, "button", {id: "pI_closeButton"}, moduleVar.prokachaikaStringList);
    pI_closeButton.onclick = function () {
        animateElement(pumpInfoContainer, ["popUp_close_start"], ["popUp_close_end"]).then(() => {
            scrollController.enableBodyScrolling().then();
            pumpInfoContainer.remove();
        });
    }
    animateElement(pumpInfoContainer, ["popUp_open_start"], ["popUp_open_end"]).then();
}

function openRelayHASettings(maxPressure) {
    const relayHAContainer = createElement(document.body, "div", {id: "relayHAContainer", class: "unPadContainer popUp"});

    createElement(relayHAContainer, "div", {id: "rHA_header", class: "defaultContainer"}, moduleVar.prokachaikaStringList);

    const itemsContainer = createElement(relayHAContainer, "div", {class: "itemsContainer"});

    const pressureOnContainer = createElement(itemsContainer, "div", {id: "pressureOnContainer", class: "inpContainer"});
    createElement(pressureOnContainer, "span", {id: "pressureOnSpan"}, moduleVar.prokachaikaStringList);
    const pressureOnInput = createElement(pressureOnContainer, "input", {id: "pressureOnInput", type: "tel"});
    pressureOnInput.value = moduleVar.prokachaikaStringList["pressureOnInput"];
    let pressureHA = tryFormatToNumber(pressureOnInput.value);
    pressureOnInput.oninput = function () {
        pressureHA = tryFormatToNumber(pressureOnInput.value);
        if (pressureHA !== false) {
            pressureHAInput.value = (pressureHA * 0.9).toFixed(2);
        }
    }

    const pressureHAContainer = createElement(itemsContainer, "div", {id: "pressureHAContainer", class: "inpContainer"});
    createElement(pressureHAContainer, "span", {id: "pressureHASpan"}, moduleVar.prokachaikaStringList);
    const pressureHAInput = createElement(pressureHAContainer, "input", {
        id: "pressureHAInput",
        type: "tel",
        disabled: ""
    });

    pressureOnInput.oninput();

    const pressureOffContainer = createElement(itemsContainer, "div", {
        id: "pressureOffContainer",
        class: "inpContainer"
    });
    createElement(pressureOffContainer, "span", {id: "pressureOffSpan"}, moduleVar.prokachaikaStringList);
    const pressureOffInput = createElement(pressureOffContainer, "input", {
        id: "pressureOffInput",
        type: "tel",
        disabled: ""
    });

    pressureOffInput.value = (maxPressure * 0.82).toFixed(1);

    const rHA_closeButton = createElement(itemsContainer, "button", {id: "rHA_closeButton"}, moduleVar.prokachaikaStringList);
    rHA_closeButton.onclick = function () {
        animateElement(relayHAContainer, ["popUp_close_start"], ["popUp_close_end"]).then(() => {
            scrollController.enableElementScrolling();
            relayHAContainer.remove();
        });
    }
    animateElement(relayHAContainer, ["popUp_open_start"], ["popUp_open_end"]).then();
}