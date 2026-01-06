import {
    createModuleHeader,
    tryFormatToNumber,
    appAlert,
    scrollController,
    linkNewStylesheet,
    getJSONData,
    appTheme_getColor,
    animateElement,
    createElement, createSwitchContainer, isJSON, appSettings_get, appDialog, isExists
} from "./moduleScripts/jointScripts.js";
import {addTempElement, moduleVar, setTimer} from "./moduleScripts/buffer.js";

export async function startTehPasModule(container, moduleName, moduleID) {
    moduleVar.currentFile = "";
    moduleVar.passportHeaderImage = undefined;
    moduleVar.tehpasStringList = await getJSONData("./objects/tehpasStringList.json");
    moduleVar.passportMap = await getJSONData("./objects/passportMap.json");

    const tehpasArticle = createElement(container, "article", {id: "tehpasArticle"});
    createModuleHeader(moduleName, moduleID, tehpasArticle).then();
    createControls(tehpasArticle);
    createInputBlocks(tehpasArticle);
    createGeoSectionBlock(tehpasArticle);
    createFormPassportButton(tehpasArticle);
    checkBrowserReminder().then(() =>{
        checkSavedHistory().then();
    });
}

async function checkSavedHistory() {
    moduleVar.tehpasHistory = {
        list: null,
        emptyList: getDataToSave(),
        get(){
            moduleVar.tehpasHistory.list = localStorage.getItem("tehpas.history");
        },
        set(JSONString){
            this.list = JSONString;
            localStorage.setItem("tehpas.history", this.list);
        },
        refreshPeriodically: function (refreshDelay){
            setTimer("tehpasHistoryRefresh", setInterval(function (){
                if(appSettings_get("tehpasSaveHistory")){
                    moduleVar.tehpasHistory.set(getDataToSave());
                }
            }, refreshDelay));
        },
    };

    if (appSettings_get("tehpasSaveHistory")) {
        moduleVar.tehpasHistory.get();
        if(Object.prototype.toString.call(JSON.parse(moduleVar.tehpasHistory.list)) === "[object Object]" && moduleVar.tehpasHistory.list !== moduleVar.tehpasHistory.emptyList){
            const answer = await appDialog("Восстановление сеанса", "Хотите восстановить данные последнего сеанса?", [{text: "Да", value: "yes"}, {text: "Нет", value: "no"}]);
            switch (answer) {
                case "yes":
                    setReadedData(moduleVar.tehpasHistory.list);
                    break;
                case "no":
                    moduleVar.tehpasHistory.set(null);
                    break;
            }
        }
    }
    moduleVar.tehpasHistory.refreshPeriodically(30000);
}

function checkBrowserReminder() {
    return new Promise(async resolve => {
        let browserReminderISODate = localStorage.getItem("tehpas.browserReminderISODate");
        if (!Date.parse(browserReminderISODate)) {
            await updateAndAlert();
        } else {
            const browserReminderDate = new Date(browserReminderISODate);
            const currentDate = new Date();
            if (Math.floor((currentDate - browserReminderDate) / (1000 * 60 * 60 * 24)) >= 14) {
                await updateAndAlert();
            }
        }
        resolve();

        function updateAndAlert() {
            return new Promise(resolve => {
                browserReminderISODate = new Date().toISOString();
                localStorage.setItem("tehpas.browserReminderISODate", browserReminderISODate);
                appAlert("Внимание", moduleVar.tehpasStringList["browserReminder"]).then(() =>{
                    resolve();
                });
            });
        }
    });
}

function createInputBlocks(container) {
    for (let i = 0; i < moduleVar.passportMap.length; i++) {
        const block = createElement(container, "section", {id: moduleVar.passportMap[i].header + "Block", class: "unPadContainer"});

        createElement(block, "div", {
            id: moduleVar.passportMap[i].header + "Header",
            class: "defaultContainer blockHeader"
        }, moduleVar.tehpasStringList);

        if (moduleVar.passportMap[i].displayBlockCheckbox || moduleVar.passportMap[i].toNextPageCheckbox) {
            const blockCheckboxContainer = createElement(block, "div", {
                id: block.id + "CheckboxContainer",
                class: "blockCheckboxContainer"
            });
            if (moduleVar.passportMap[i].displayBlockCheckbox) {
                createSwitchContainer(blockCheckboxContainer, {}, {
                    id: block.id + "Checkbox",
                    file: "cb"
                }, {id: block.id + "CheckboxLabel"}, moduleVar.tehpasStringList);
            }
            if (moduleVar.passportMap[i].toNextPageCheckbox) {
                createSwitchContainer(blockCheckboxContainer, {}, {
                    id: block.id + "ToNextPageCheckbox",
                    file: "cb"
                }, {id: "toNextPageCheckboxLabel"}, moduleVar.tehpasStringList);
            }
        }

        const itemsContainer = createElement(block, "div", {id: block.id + "Items"});

        let inputContainer;
        for (let j = 0; j < moduleVar.passportMap[i].input.length; j++) {
            if (moduleVar.passportMap[i].input[j].checkbox) {
                inputContainer = createElement(itemsContainer, "div", {class: "inputContainer"});

                createElement(inputContainer, "input", {
                    id: moduleVar.passportMap[i].input[j].name + "Checkbox",
                    class: "cb",
                    type: "checkbox",
                    file: "cb",
                    checked: ""
                });
            } else {
                inputContainer = createElement(itemsContainer, "div", {class: "inputContainerNoCheckbox"});
            }

            if (isExists(moduleVar.tehpasStringList[moduleVar.passportMap[i].input[j].name + "Span"])) {
                createElement(inputContainer, "span", {
                    id: moduleVar.passportMap[i].input[j].name + "Span",
                    class: "lb"
                }, moduleVar.tehpasStringList);
            }

            if (moduleVar.passportMap[i].input[j].kind === "input" || moduleVar.passportMap[i].input[j].kind === "textarea") {
                const input = createElement(inputContainer, moduleVar.passportMap[i].input[j].kind, {
                    id: moduleVar.passportMap[i].input[j].name,
                    class: "inp",
                    file: "inp"
                });
                if (isExists(moduleVar.passportMap[i].input[j].type)) {
                    input.setAttribute("type", moduleVar.passportMap[i].input[j].type);
                }
                if (input.type !== "datetime-local") {
                    input.placeholder = moduleVar.tehpasStringList[moduleVar.passportMap[i].input[j].name + "Hint"];
                }
                inputContainer.id = input.id + "Container";
            } else if (moduleVar.passportMap[i].input[j].kind === "select") {
                const select = createElement(inputContainer, moduleVar.passportMap[i].input[j].kind, {
                    id: moduleVar.passportMap[i].input[j].name,
                    class: "inp",
                    file: "inp"
                }, moduleVar.tehpasStringList);
                inputContainer.id = select.id + "Container";
            }
        }
    }

    document.querySelector("#wellType").onchange = function () {
        document.querySelector("#dynamicLevelCheckbox").checked = !(document.querySelector("#wellType").value === "abyss" || document.querySelector("#wellType").value === "abyssNeedle");
        changeWellConstructionOptions(true);
    }
    document.querySelector("#wellType").dispatchEvent(new Event('change'));

    document.querySelector("#startWork").oninput = function () {
        if (document.querySelector("#endWork").value === "") {
            const startDate = new Date(document.querySelector("#startWork").value);
            const endDate = new Date(startDate);
            endDate.setHours(startDate.getHours() + 6);
            const tzOffset = (new Date()).getTimezoneOffset() * 60000;
            document.querySelector("#endWork").value = (new Date(endDate - tzOffset)).toISOString().slice(0, -1);
        }
    }
}

function createFormPassportButton(container) {
    const printControlContainer = createElement(container, "section", {
        id: "printControlContainer",
        class: "defaultContainer"
    });

    const printCheckboxContainer = createElement(printControlContainer, "div", {
        id: "printCheckboxContainer",
        class: "blockCheckboxContainer"
    });

    const dsPrintCheckbox = createSwitchContainer(printCheckboxContainer, {}, {
        id: "dsPrintCheckbox",
        file: "cb"
    }, {id: "dsPrintLabel"}, moduleVar.tehpasStringList);
    dsPrintCheckbox.onchange = function () {
        if (this.checked) {
            linkNewStylesheet("dsPrint");
            const osPrint = document.querySelector("#osPrint");
            if (isExists(osPrint)) {
                osPrint.remove();
            }
        } else {
            linkNewStylesheet("osPrint");
            const dsPrint = document.querySelector("#dsPrint");
            if (isExists(dsPrint)) {
                dsPrint.remove();
            }
        }
    }
    dsPrintCheckbox.dispatchEvent(new Event('change'));
    createSwitchContainer(printCheckboxContainer, {}, {
        id: "signaturesPrintCheckbox",
        file: "cb",
        checked: ""
    }, {id: "signaturesPrintLabel"}, moduleVar.tehpasStringList);

    const formPassButton = createElement(printControlContainer, "button", {id: "formPassButton"}, moduleVar.tehpasStringList);
    formPassButton.onclick = function () {

        let error = createPassport();
        if (error === false) {
            window.print();
        } else {
            appAlert("Ошибка", error).then();
        }
    }
}

function createPassport() {
    let passportContainer = document.querySelector("#passportContainer");
    if (isExists(passportContainer)) {
        passportContainer.remove();
    }

    let error = false;

    passportContainer = createElement(document.body, "div", {id: "passportContainer", class: "print"});
    addTempElement(passportContainer.id);

    createElement(passportContainer, "div", {id: "frame"});

    if (isExists(moduleVar.passportHeaderImage)) {
        passportContainer.appendChild(moduleVar.passportHeaderImage);
    }

    const passportHeaderContainer = createElement(passportContainer, "div", {id: "passportHeaderContainer"});

    const passportHeaderSpan = createElement(passportHeaderContainer, "span", {id: "passportHeaderSpan"}, moduleVar.tehpasStringList);

    createElement(passportHeaderContainer, "span", {id: "passportUnderHeaderSpan"}, moduleVar.tehpasStringList);

    for (let i = 0; i < moduleVar.passportMap.length; i++) {
        let hideBlock = false;
        if (moduleVar.passportMap[i].displayBlockCheckbox) {
            if (!document.querySelector("#" + moduleVar.passportMap[i].header + "BlockCheckbox").checked) {
                hideBlock = true;
            }
        }
        if (!hideBlock) {
            const tableBlock = createElement(passportContainer, "table", {class: "tableBlock"});
            if (moduleVar.passportMap[i].toNextPageCheckbox) {
                if (document.querySelector("#" + moduleVar.passportMap[i].header + "BlockToNextPageCheckbox").checked) {
                    tableBlock.className = "tableBlock breakBefore";
                }
            }

            createElement(tableBlock, "col");
            createElement(tableBlock, "col");

            createElement(tableBlock, "caption", {class: "tableCaption"}, moduleVar.tehpasStringList[moduleVar.passportMap[i].header + "Header"]);

            for (let j = 0; j < moduleVar.passportMap[i].input.length; j++) {
                if (moduleVar.passportMap[i].input[j].name === "passNumber") {
                    if (document.querySelector("#" + moduleVar.passportMap[i].input[j].name + "Checkbox").checked) {
                        if (document.querySelector("#" + moduleVar.passportMap[i].input[j].name).value === "") {
                            passportHeaderSpan.innerHTML += " №_____";
                        } else {
                            passportHeaderSpan.innerHTML += " №" + document.querySelector("#" + moduleVar.passportMap[i].input[j].name).value;
                        }
                    }
                } else if (moduleVar.passportMap[i].input[j].checkbox) {
                    if (!document.querySelector("#" + moduleVar.passportMap[i].input[j].name + "Checkbox").checked) {
                        moduleVar.passportMap[i].input[j].passportDisplay = false;
                        if (moduleVar.passportMap[i].header === "wb") {
                            tableBlock.remove();
                        }
                    } else {
                        moduleVar.passportMap[i].input[j].passportDisplay = true;
                    }
                }

                if (moduleVar.passportMap[i].input[j].passportDisplay) {
                    if (moduleVar.passportMap[i].input[j].inTableVision.includes("default")) {
                        const row = tableBlock.insertRow();
                        let cell = row.insertCell();
                        cell.innerHTML = moduleVar.tehpasStringList[moduleVar.passportMap[i].input[j].name + "Span"];
                        cell = row.insertCell();
                        cell.innerHTML = getValueFromElement(document.querySelector("#" + moduleVar.passportMap[i].input[j].name));
                    } else if (moduleVar.passportMap[i].input[j].inTableVision.includes("noSpan")) {
                        const row = tableBlock.insertRow();
                        const cell = row.insertCell();
                        cell.colSpan = 2;
                        cell.innerHTML = getValueFromElement(document.querySelector("#" + moduleVar.passportMap[i].input[j].name));
                    } else if (moduleVar.passportMap[i].input[j].inTableVision.includes("upperSpan")) {
                        const row = tableBlock.insertRow();
                        const cell = row.insertCell();
                        cell.colSpan = 2;
                        cell.innerHTML = "<b>" + moduleVar.tehpasStringList[moduleVar.passportMap[i].input[j].name + "Span"] + "</b><br>" + getValueFromElement(document.querySelector("#" + moduleVar.passportMap[i].input[j].name));
                    }
                }
            }
        }
    }

    function getValueFromElement(element) {
        let value;
        if (element.tagName === "SELECT") {
            value = element.options[element.selectedIndex].innerHTML;
        } else if (element.tagName === "TEXTAREA") {
            value = element.value.replaceAll("\n", "<br>");
        } else {
            if (element.type === "datetime-local" && element.value !== "") {
                value = formatDateTimeValue(element.value);
            } else {
                value = element.value;
            }
        }
        return value;
    }

    function formatDateTimeValue(datetime) {
        return datetime.split("T")[1] + " " + datetime.split("T")[0].split("-")[2] + "." + datetime.split("T")[0].split("-")[1] + "." + datetime.split("T")[0].split("-")[0];
    }

    if (document.querySelector("#gsBlockShowCheckbox").checked) {
        error = createGeoSectionTable(passportContainer);
    }

    if (document.querySelector("#signaturesPrintCheckbox").checked) {
        createSignaturesTable(passportContainer);
    }

    if (error !== false) {
        passportContainer.remove();
    }
    return error;
}

function createSignaturesTable(container) {
    const signTable = createElement(container, "table", {id: "signTable"});

    createElement(signTable, "caption", {}, moduleVar.tehpasStringList["signaturesTableHeader"]);

    const tableScheme = [
        ["jobDone / leftText", null, null],
        ["drillMasterSpan / noBreak leftText", "signatureField / noBreak", "drillMaster / noBreak"],
        [null, null, "dateField"],
        ["acceptJob / noBreakAfter leftText", null, null],
        ["customerSpan / noBreak leftText", "signatureField / noBreak", "customer / noBreak"],
        [null, null, "dateField"],
    ];

    createElement(signTable, "col", {style: "width: 32%;"});
    createElement(signTable, "col", {style: "width: 18%;"});
    createElement(signTable, "col", {style: "width: 50%;"});

    for (let i = 0; i < tableScheme.length; i++) {
        const signTableRow = signTable.insertRow();
        for (let j = 0; j < tableScheme[i].length; j++) {
            const signTableCell = signTableRow.insertCell();
            if (isExists(tableScheme[i][j])) {
                if (tableScheme[i][j].includes(" / ")) {
                    const spanName = tableScheme[i][j].split(" / ")[0];
                    const spanClass = tableScheme[i][j].split(" / ")[1];
                    if (spanName === "drillMaster" || spanName === "customer") {
                        if (document.querySelector("#" + spanName).value.trim() !== "") {
                            signTableCell.innerHTML = document.querySelector("#" + spanName).value.trim();
                        } else {
                            signTableCell.innerHTML = moduleVar.tehpasStringList["transcriptField"];
                        }
                        signTableCell.className = spanClass;
                    } else {
                        signTableCell.innerHTML = moduleVar.tehpasStringList[spanName];
                        signTableCell.className = spanClass;
                    }
                } else {
                    if (tableScheme[i][j] === "drillMaster" || tableScheme[i][j] === "customer") {
                        if (document.querySelector("#" + tableScheme[i][j]).value.trim() !== "") {
                            signTableCell.innerHTML = document.querySelector("#" + tableScheme[i][j]).value.trim();
                        } else {
                            signTableCell.innerHTML = moduleVar.tehpasStringList["transcriptField"];
                        }
                    } else {
                        signTableCell.innerHTML = moduleVar.tehpasStringList[tableScheme[i][j]];
                    }

                }
            }
        }
    }
}

function createGeoSectionTable(container) {
    let error = false;
    const gsTable = createElement(container, "table", {id: "gsTable"});
    if (document.querySelector("#gsBlockToNextPageCheckbox").checked) {
        gsTable.className = "breakBefore";
    }

    const colWidth = [21, 25, 2, 3, 2, 3, 2, 3, 2, 37];
    for (let i = 0; i < colWidth.length; i++) {
        const col = createElement(gsTable, "col", {});
        col.width = colWidth[i] + "%";
    }

    createElement(gsTable, "caption", {}, moduleVar.tehpasStringList["geoSectionHeader"]);
    const headerRow = gsTable.insertRow();
    headerRow.className = "headerRow";
    let headerCell;
    for (let i = 0; i < moduleVar.tehpasStringList["gsTableHeader"].length; i++) {
        headerCell = headerRow.insertCell();
        headerCell.innerHTML = moduleVar.tehpasStringList["gsTableHeader"][i];
    }
    headerCell.colSpan = 8;

    const layersContainer = document.querySelector("#layersContainer");
    const wellScheme = ["firstCasing", "firstCasingVoid", "firstWaterIntakePipe", "waterIntakePipeVoid", "secondWaterIntakePipe", "secondCasingVoid", "secondCasing"];

    const staticLevelNum = tryFormatToNumber(document.querySelector("#staticLevel").value);
    const lastDepth = tryFormatToNumber(layersContainer.lastElementChild.querySelector("#endDepth").value);

    if (staticLevelNum === false && document.querySelector("#gsDrawSLCheckbox").checked) {
        return "Параметры скважины: Статический уровень должен быть записан числом!";
    }

    if ((lastDepth === false || staticLevelNum >= lastDepth) && document.querySelector("#gsDrawSLCheckbox").checked) {
        return "Геологический разрез: Статический уровень больше конечной глубины последнего слоя!";
    }

    for (let i = 0; i < layersContainer.children.length; i++) {
        const startDepthNum = tryFormatToNumber(layersContainer.children[i].querySelector("#startDepth").value);
        const endDepthNum = tryFormatToNumber(layersContainer.children[i].querySelector("#endDepth").value);
        if (startDepthNum !== false && endDepthNum !== false) {
            if (document.querySelector("#gsDrawSLCheckbox").checked) {
                if (staticLevelNum >= startDepthNum && staticLevelNum < endDepthNum) {
                    addRow(gsTable, layersContainer, i, startDepthNum, staticLevelNum);
                    addRow(gsTable, layersContainer, i, staticLevelNum, endDepthNum);
                } else {
                    addRow(gsTable, layersContainer, i, startDepthNum, endDepthNum);
                }
            } else {
                addRow(gsTable, layersContainer, i, startDepthNum, endDepthNum);
            }
        } else {
            return "Геологический разрез: Глубина залегания в каждом слое должна быть записана числом!";
        }
    }

    gsTableIdenticalRowsSpan(gsTable, 1, 9);
    gsTableIdenticalRowsSpan(gsTable, 1, 1);
    error = drawWellConstruction(gsTable);

    function addRow(table, layersContainer, i, startDepth, endDepth) {
        const tableLayerRow = table.insertRow();
        for (let j = 0; j < 10; j++) {
            tableLayerRow.insertCell();
        }
        tableLayerRow.cells[0].innerHTML = startDepth + " - " + endDepth;
        tableLayerRow.cells[0].id = layersContainer.children[i].querySelector("#wellConstruction").value;
        tableLayerRow.cells[1].innerHTML = layersContainer.children[i].querySelector("#layerName").options[layersContainer.children[i].querySelector("#layerName").selectedIndex].innerHTML + ", " + layersContainer.children[i].querySelector("#layerColor").options[layersContainer.children[i].querySelector("#layerColor").selectedIndex].innerHTML.toLowerCase().split(" ")[0];
        tableLayerRow.cells[1].style.backgroundColor = layersContainer.children[i].querySelector("#layerColor").value;

        for (let i = 0; i < wellScheme.length; i++) {
            tableLayerRow.cells[i + 2].id = wellScheme[i];
            tableLayerRow.cells[i + 2].style.backgroundColor = tableLayerRow.cells[1].style.backgroundColor;
        }

        tableLayerRow.cells[9].innerHTML = layersContainer.children[i].querySelector("#wellConstruction").options[layersContainer.children[i].querySelector("#wellConstruction").selectedIndex].innerHTML;
    }

    return error;
}

function gsTableIdenticalRowsSpan(table, startRowNumber, cellNumber) {
    let k;
    for (k = startRowNumber + 1; k < table.rows.length; k++) {
        if (table.rows[startRowNumber].cells[cellNumber].innerHTML === table.rows[k].cells[cellNumber].innerHTML) {
            table.rows[startRowNumber].cells[cellNumber].rowSpan++;
            table.rows[k].cells[cellNumber].remove();
        } else {
            break;
        }
    }
    if (k < table.rows.length) {
        gsTableIdenticalRowsSpan(table, k, cellNumber);
    } else {
        return 0;
    }
}

function drawWellConstruction(table) {
    let error = false;

    for (let v = 1; v < table.rows.length; v++) {
        for (let c = 0; c < table.rows[v].cells.length; c++) {
            switch (table.rows[v].cells[c].id) {
                case "firstCasing":
                    switch (table.rows[v].cells[0].id) {
                        case "nothing":
                            tableCellSpan(table.rows[v], c, 7);
                            break;
                        case "waterIntakePipe":
                        case "filterZone":
                            tableCellSpan(table.rows[v], c, 2);
                            break;
                        case "casing":
                        case "waterIntakePipeCasing":
                        case "submersiblePumpCasing":
                            table.rows[v].cells[c].style.backgroundColor = "DarkBlue";
                            break;
                        case "filterZoneCasing":
                        case "submersiblePumpFilterZone":
                        case "filterZoneWaterIntakePipeCasing":
                            table.rows[v].cells[c].style.backgroundColor = "SlateGray";
                            break;
                    }
                    break;
                case "firstWaterIntakePipe":
                    switch (table.rows[v].cells[0].id) {
                        case "waterIntakePipe":
                        case "waterIntakePipeCasing":
                        case "filterZoneWaterIntakePipeCasing":
                            table.rows[v].cells[c].style.backgroundColor = "Black";
                            break;
                        case "submersiblePumpCasing":
                        case "submersiblePumpFilterZone":
                            tableCellSpan(table.rows[v], c, 3);
                            table.rows[v].cells[c].style.backgroundColor = "Orange";
                            break;
                        case "filterZone":
                            table.rows[v].cells[c].style.backgroundColor = "SlateGray";
                            break;
                    }
                    break;
                case "waterIntakePipeVoid": {
                    switch (table.rows[v].cells[0].id) {
                        case "waterIntakePipeCasing":
                        case "waterIntakePipe":
                        case "filterZone":
                        case "filterZoneWaterIntakePipeCasing":
                            drawStaticLevel(table.rows[v].cells[0], table.rows[v].cells[c]);
                            break;
                    }
                    break;
                }
                case "secondWaterIntakePipe":
                    switch (table.rows[v].cells[0].id) {
                        case "waterIntakePipe":
                        case "waterIntakePipeCasing":
                        case "filterZoneWaterIntakePipeCasing":
                            table.rows[v].cells[c].style.backgroundColor = "Black";
                            break;
                        case "filterZone":
                            table.rows[v].cells[c].style.backgroundColor = "SlateGray";
                            break;
                    }
                    break;
                case "firstCasingVoid":
                    switch (table.rows[v].cells[0].id) {
                        case "casing":
                        case "filterZoneCasing":
                            tableCellSpan(table.rows[v], c, 5);
                            drawStaticLevel(table.rows[v].cells[0], table.rows[v].cells[c]);
                            break;
                        case "waterIntakePipeCasing":
                        case "submersiblePumpCasing":
                        case "submersiblePumpFilterZone":
                        case "filterZoneWaterIntakePipeCasing":
                            drawStaticLevel(table.rows[v].cells[0], table.rows[v].cells[c]);
                            break;
                    }
                    break;
                case "secondCasingVoid":
                    switch (table.rows[v].cells[0].id) {
                        case "waterIntakePipe":
                        case "filterZone":
                            tableCellSpan(table.rows[v], c, 2);
                            break;
                        case "waterIntakePipeCasing":
                        case "submersiblePumpCasing":
                        case "submersiblePumpFilterZone":
                        case "filterZoneWaterIntakePipeCasing":
                            drawStaticLevel(table.rows[v].cells[0], table.rows[v].cells[c]);
                            break;
                    }
                    break;
                case "secondCasing":
                    switch (table.rows[v].cells[0].id) {
                        case "casing":
                        case "waterIntakePipeCasing":
                        case "submersiblePumpCasing":
                            table.rows[v].cells[c].style.backgroundColor = "DarkBlue";
                            break;
                        case "filterZoneCasing":
                        case "submersiblePumpFilterZone":
                        case "filterZoneWaterIntakePipeCasing":
                            table.rows[v].cells[c].style.backgroundColor = "SlateGray";
                            break;
                    }
                    break;
            }
        }
    }

    function tableCellSpan(row, startCellNumber, numberSpan) {
        for (let o = startCellNumber + 1; o < startCellNumber + numberSpan; o++) {
            row.cells[startCellNumber + 1].remove();
        }
        row.cells[startCellNumber].colSpan = numberSpan;
    }

    function drawStaticLevel(depthCell, cell) {
        if (document.querySelector("#gsDrawSLCheckbox").checked) {
            const staticLevel = tryFormatToNumber(document.querySelector("#staticLevel").value);
            const start = tryFormatToNumber(depthCell.innerHTML.split("-")[0].trim());
            const end = tryFormatToNumber(depthCell.innerHTML.split("-")[1].trim());
            if (start !== false && end !== false) {
                if (start >= staticLevel || (start >= staticLevel && end < staticLevel)) {
                    cell.style.backgroundColor = "DodgerBlue";
                } else {
                    cell.style.backgroundColor = "White";
                }
            }
        } else {
            cell.style.backgroundColor = "White";
        }
    }


    return error;
}

function createControls(container) {
    const controlsDiv = createElement(container, "section", {id: "controlsDiv"});

    const headerUploadButton = createElement(controlsDiv, "input", {
        id: "headerUploadButton",
        type: "file",
        accept: "image/*"
    });
    headerUploadButton.onchange = function () {
        if (this.value.trim() !== "") {
            const imageFile = this.files[0];
            if (imageFile.type.includes("image/")) {
                const img = new Image();
                img.src = URL.createObjectURL(imageFile);
                img.onload = function () {
                    if (img.naturalWidth !== 900 || img.naturalHeight > 150) {
                        appAlert("Ошибка", "Недопустимые размеры изображения. Размеры для шапки техпаспорта:<br>Ширина: 900px<br>Высота: не более 150px").then();
                    } else {
                        img.id = "passportHeaderImage";
                        moduleVar.passportHeaderImage = img;
                        headerUploadLabel.style.backgroundColor = appTheme_getColor("ready");
                        headerUploadButton.value = "";
                        URL.revokeObjectURL(img.src);
                    }
                }
            } else {
                appAlert("Ошибка", "Файл \"" + imageFile.name + "\" не является изображением").then();
            }
        }
    }
    const headerUploadLabel = createElement(controlsDiv, "label", {
        id: "headerUploadLabel",
        for: "headerUploadButton",
        class: "of"
    }, moduleVar.tehpasStringList);
    headerUploadLabel.onclick = function () {
        this.style.backgroundColor = appTheme_getColor("button");
    }

    const openFileButton = createElement(controlsDiv, "input", {id: "openFileButton", type: "file", accept: ".tehpas"});
    openFileButton.onchange = function () {
        if (this.value.trim() !== "") {
            const inputFile = this.files[0];
            if (inputFile.name.split(".").pop() === "tehpas") {
                const fr = new FileReader();
                fr.onloadend = function () {
                    openFileLabel.style.backgroundColor = appTheme_getColor("ready");
                    moduleVar.currentFile = inputFile.name.replace(".tehpas", "");
                    isJSON(this.result) ? setReadedData(this.result) : appAlert("Ошибка", "Ошибка преобразования данных файла в JSON").then();
                    openFileButton.value = "";
                }
                fr.onerror = function () {
                    appAlert("Ошибка", "Ошибка чтения файла \"" + inputFile.name + "\"").then();
                }
                fr.readAsText(inputFile);
            } else {
                appAlert("Ошибка", "Файл \"" + inputFile.name + "\" не имеет расширения \".tehpas\"").then();
            }
        }
    }
    const openFileLabel = createElement(controlsDiv, "label", {
        id: "openFileLabel",
        for: "openFileButton",
        class: "of"
    }, moduleVar.tehpasStringList);
    openFileLabel.onclick = function () {
        this.style.backgroundColor = appTheme_getColor("button");
        moduleVar.currentFile = "";
    }

    const saveButton = createElement(controlsDiv, "button", {id: "saveFileButton"}, moduleVar.tehpasStringList);
    saveButton.onclick = function () {
        showFileSaveDialog();
    }
}

function setReadedData(JSONString) {
    const data = JSON.parse(JSONString);
    for (let field in data.fields) {
        const element = document.querySelector("#" + field);
        if (element) {
            const loadAsAttr = element.getAttribute("file")
            loadAsAttr === "cb" ? element.checked = JSON.parse(data.fields[field]) : null;
            loadAsAttr === "inp" ? element.value = data.fields[field] : null;
        }
    }

    const layersContainer = document.querySelector("#layersContainer");
    layersContainer.innerHTML = "";
    if (data.layers !== []) {
        data.layers.forEach(fileLayer => {
            const newLayer = addLayer(null, layersContainer);
            for (let fileLayerField in fileLayer) {
                const layerField = newLayer.querySelector("#" + fileLayerField);
                if (layerField) {
                    layerField.value = fileLayer[fileLayerField];
                    layerField.id === "layerColor" ? layerField.dispatchEvent(new Event("change")) : null;
                }
            }
        });
    }
}

function showFileSaveDialog() {
    scrollController.disableBodyScrolling().then();
    const fileSaveContainer = createElement(document.body, "div", {
        id: "fileSaveContainer",
        class: "unPadContainer popUp"
    });

    createElement(fileSaveContainer, "div", {id: "fileSaveHeader", class: "defaultContainer"}, moduleVar.tehpasStringList);

    const itemsContainer = createElement(fileSaveContainer, "div", {class: "itemsContainer"});

    const inpContainer = createElement(itemsContainer, "div", {class: "inpContainer"});

    createElement(inpContainer, "span", {id: "fileNameSpan"}, moduleVar.tehpasStringList);
    const fileName = createElement(inpContainer, "input", {id: "fileName", type: "text"});
    fileName.value = moduleVar.currentFile;
    fileName.placeholder = moduleVar.tehpasStringList[fileName.id + "Hint"];

    const buttonsContainer = createElement(itemsContainer, "div", {id: "buttonsContainer"});

    const saveFileButton = createElement(buttonsContainer, "button", {id: "saveFileButton"}, moduleVar.tehpasStringList);
    saveFileButton.onclick = function () {
        fileName.value.trim() !== "" ? saveFile(fileName.value, getDataToSave()) : saveFile("drillmate_tehpas", getDataToSave());
        closeButton.onclick();
    }

    const closeButton = createElement(buttonsContainer, "button", {id: "closeButton"}, "Закрыть");
    closeButton.onclick = function () {
        scrollController.enableBodyScrolling().then();
        fileSaveContainer.remove();
    }

}

function getDataToSave() {
    const data = {};
    const fieldsToSave = document.querySelectorAll("[file]");

    data.fields = {};
    fieldsToSave.forEach(field => {
        const saveAsAttr = field.getAttribute("file");
        saveAsAttr === "cb" ? data.fields[field.id] = field.checked : null;
        saveAsAttr === "inp" ? data.fields[field.id] = field.value : null;
    });

    const geoLayersContainer = document.querySelector("#layersContainer");
    data.layers = [];
    for (let i = 0; i < geoLayersContainer.children.length; i++) {
        data.layers[i] = {};
        const geoLayerFields = geoLayersContainer.children[i].querySelectorAll("[file]");
        geoLayerFields.forEach(gLField => {
            data.layers[i][gLField.id] = gLField.value;
        });
    }

    return JSON.stringify(data);
}

function saveFile(fileName, data) {
    const a = document.createElement("a");
    const file = new Blob([data], {
        type: 'plain/text'
    });
    a.href = URL.createObjectURL(file);
    a.download = fileName.trim() + ".tehpas";
    a.click();
    a.remove();
    moduleVar.currentFile = fileName.trim();
}

function createGeoSectionBlock(container) {
    const geoSectionContainer = createElement(container, "section", {id: "geoSectionContainer", class: "unPadContainer"});

    createElement(geoSectionContainer, "div", {
        id: "geoSectionHeader",
        class: "defaultContainer blockHeader"
    }, moduleVar.tehpasStringList);

    const gsCheckboxContainer = createElement(geoSectionContainer, "div", {
        id: "gsCheckboxContainer",
        class: "blockCheckboxContainer"
    });
    createSwitchContainer(gsCheckboxContainer, {}, {
        id: "gsBlockShowCheckbox",
        file: "cb"
    }, {id: "gsBlockShowLabel"}, moduleVar.tehpasStringList);
    createSwitchContainer(gsCheckboxContainer, {}, {
        id: "gsBlockToNextPageCheckbox",
        file: "cb"
    }, {id: "toNextPageCheckboxLabel"}, moduleVar.tehpasStringList);
    createSwitchContainer(gsCheckboxContainer, {}, {
        id: "gsDrawSLCheckbox",
        file: "cb"
    }, {id: "gsDrawSLLabel"}, moduleVar.tehpasStringList);

    const itemsContainer = createElement(geoSectionContainer, "div", {id: "layersContainer", class: "itemsContainer"});

    addLayer(null, itemsContainer);
}

function addLayer(prevLayer, container) {
    const layer = createElement(null, "div", {class: "layer"});
    if (isExists(prevLayer)) {
        prevLayer.insertAdjacentElement("afterend", layer);
    } else {
        container.appendChild(layer);
    }
    animateElement(layer, ["layerShow_start"], ["layerShow_end"]).then();

    createElement(layer, "span", {id: "depthSpan"}, moduleVar.tehpasStringList);

    const startDepthContainer = createElement(layer, "div", {id: "startDepthContainer", class: "inpContainer"});

    createElement(startDepthContainer, "span", {id: "startDepthSpan"}, moduleVar.tehpasStringList);
    const startDepth = createElement(startDepthContainer, "input", {id: "startDepth", type: "tel", file: ""});
    startDepth.placeholder = moduleVar.tehpasStringList[startDepth.id + "Hint"];
    if (isExists(layer.previousElementSibling)) {
        startDepth.value = layer.previousElementSibling.children[2].children[1].value;
    }
    startDepth.oninput = function () {
        if (isExists(layer.previousElementSibling)) {
            layer.previousElementSibling.children[2].children[1].value = startDepth.value;
        }
    }

    const endDepthContainer = createElement(layer, "div", {id: "endDepthContainer", class: "inpContainer"});

    createElement(endDepthContainer, "span", {id: "endDepthSpan"}, moduleVar.tehpasStringList);
    const endDepth = createElement(endDepthContainer, "input", {id: "endDepth", type: "tel", file: ""});
    endDepth.placeholder = moduleVar.tehpasStringList[endDepth.id + "Hint"];
    endDepth.oninput = function () {
        if (isExists(layer.nextElementSibling)) {
            layer.nextElementSibling.children[1].children[1].value = this.value;
        }
    }

    const layerNameContainer = createElement(layer, "div", {id: "layerNameContainer", class: "inpContainer"});

    createElement(layerNameContainer, "span", {id: "layerNameSpan"}, moduleVar.tehpasStringList);
    createElement(layerNameContainer, "select", {id: "layerName", file: ""}, moduleVar.tehpasStringList);

    const layerColorContainer = createElement(layer, "div", {id: "layerColorContainer", class: "inpContainer"});

    createElement(layerColorContainer, "span", {id: "layerColorSpan"}, moduleVar.tehpasStringList);
    const layerColor = createElement(layerColorContainer, "select", {id: "layerColor", file: ""}, moduleVar.tehpasStringList);
    layerColor.style.backgroundColor = layerColor.value;
    layerColor.onchange = function () {
        if (layerColor.value === "Khaki" || layerColor.value === "AliceBlue") {
            layerColor.style.color = "black";
        } else {
            layerColor.style.color = "white";
        }
        layerColor.style.backgroundColor = layerColor.value;
    }

    const wellConstructionContainer = createElement(layer, "div", {
        id: "wellConstructionContainer",
        class: "inpContainer"
    });

    createElement(wellConstructionContainer, "span", {id: "wellConstructionSpan"}, moduleVar.tehpasStringList);
    createElement(wellConstructionContainer, "select", {id: "wellConstruction", file: ""}, moduleVar.tehpasStringList);
    changeWellConstructionOptions(false);

    const addLayerButton = createElement(layer, "button", {id: "addLayerButton"}, moduleVar.tehpasStringList);
    addLayerButton.onclick = function () {
        addLayer(layer);
    }

    const removeLayerButton = createElement(layer, "button", {id: "removeLayerButton"}, moduleVar.tehpasStringList);
    removeLayerButton.onclick = function () {
        animateElement(layer, ["layerHide_start"], ["layerHide_end"]).then(() => {
            const itemsContainer = layer.parentElement;
            layer.remove();
            checkMinimumLayer(itemsContainer);
        });
    }

    checkMinimumLayer(layer.parentElement);
    return layer;
}

function checkMinimumLayer(container) {
    if (container.childElementCount === 1) {
        container.lastElementChild.lastElementChild.disabled = true;
        container.lastElementChild.children[1].children[1].value = "0";
    } else {
        container.children[container.children.length - 2].lastElementChild.disabled = false;
    }
}

function changeWellConstructionOptions(refresh) {
    const wellConstruction = document.querySelectorAll("#wellConstruction");
    const wellType = document.querySelector("#wellType");
    for (let i = 0; i < wellConstruction.length; i++) {
        enableAllSelectOptions(wellConstruction[i]);
        if (refresh) wellConstruction[i].options[0].selected = true;
        switch (wellType.value) {
            case "abyss":
            case "abyssNeedle":
                disableSelectOptions(wellConstruction[i], [3, 4, 5, 6, 7, 8]);
                break;
            case "abyssSump":
                disableSelectOptions(wellConstruction[i], [1, 2, 4, 5]);
                break;
            case "wellSubmersiblePump":
                disableSelectOptions(wellConstruction[i], [1, 2]);
                break;
        }
    }

    function enableAllSelectOptions(wellConstruction) {
        for (let i = 0; i < wellConstruction.options.length; i++) {
            wellConstruction.options[i].style.display = "block";
        }
    }

    function disableSelectOptions(wellConstruction, optionList) {
        for (let i = 0; i < optionList.length; i++) {
            wellConstruction.options[optionList[i]].style.display = "none";
        }
    }
}