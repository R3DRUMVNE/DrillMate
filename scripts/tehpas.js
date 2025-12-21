import {
    createModuleHeader,
    tryFormatToNumber,
    appAlert,
    scrollController,
    linkNewStylesheet,
    setCookie,
    getCookie,
    getJSONData,
    appTheme_getColor,
    animateElement,
    createElement, createSwitchContainer
} from "./moduleScripts/jointScripts.js";
import {addTempElement} from "./moduleScripts/buffer.js";

let tehpasStringList = null;
let passportHeaderImage;
let currentFile;
let passportMap = [];

export async function startTehPasModule(container, moduleName, moduleID) {
    currentFile = "";
    let tehpasArticle = createElement(container, "article", {id: "tehpasArticle"});
    tehpasStringList = await getJSONData("./objects/tehpasStringList.json");
    passportMap = await getJSONData("./objects/passportMap.json");

    passportHeaderImage = undefined;
    createModuleHeader(moduleName, moduleID, tehpasArticle).then();
    createControls(tehpasArticle);
    createInputBlocks(tehpasArticle);
    createGeoSectionBlock(tehpasArticle);
    createFormPassportButton(tehpasArticle);
    if (getCookie("tehpas-firstTime") === undefined) {
        let currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 14);
        setCookie("tehpas-firstTime", false, {expires: currentDate});
        appAlert("Внимание", "Для корректного отображения техпаспорта на печати рекомендуется использовать браузер Google Chrome");
    }
}

function createInputBlocks(container) {
    for (let i = 0; i < passportMap.length; i++) {
        let block = createElement(container, "section", {id: passportMap[i].header + "Block", class: "unPadContainer"});

        createElement(block, "div", {id: passportMap[i].header + "Header", class: "defaultContainer blockHeader"}, tehpasStringList);

        if(passportMap[i].displayBlockCheckbox || passportMap[i].toNextPageCheckbox){
            let blockCheckboxContainer = createElement(block, "div", {id: block.id +"CheckboxContainer", class: "blockCheckboxContainer"});
            if(passportMap[i].displayBlockCheckbox){
                createSwitchContainer(blockCheckboxContainer, {},{id: block.id + "Checkbox", file: "cb"}, {id: block.id + "CheckboxLabel"}, tehpasStringList);
            }
            if(passportMap[i].toNextPageCheckbox){
                createSwitchContainer(blockCheckboxContainer, {}, {id: block.id + "ToNextPageCheckbox", file: "cb"}, {id: "toNextPageCheckboxLabel"}, tehpasStringList);
            }
        }

        let itemsContainer = createElement(block, "div", {id: block.id + "Items"});

        let inputContainer;
        for (let j = 0; j < passportMap[i].input.length; j++) {
            if (passportMap[i].input[j].checkbox) {
                inputContainer = createElement(itemsContainer, "div", {class: "inputContainer"});

                createElement(inputContainer, "input", {id: passportMap[i].input[j].name + "Checkbox", class: "cb", type: "checkbox", file: "cb", checked: ""});
            } else {
                inputContainer = createElement(itemsContainer, "div", {class: "inputContainerNoCheckbox"});
            }

            if (tehpasStringList[passportMap[i].input[j].name + "Span"] !== undefined) {
                createElement(inputContainer, "span", {id: passportMap[i].input[j].name + "Span", class: "lb"}, tehpasStringList);
            }

            if (passportMap[i].input[j].kind === "input" || passportMap[i].input[j].kind === "textarea") {
                let input = createElement(inputContainer, passportMap[i].input[j].kind, {id: passportMap[i].input[j].name, class: "inp", file: "inp"});
                if (passportMap[i].input[j].type !== null) {
                    input.setAttribute("type", passportMap[i].input[j].type);
                }
                if (input.type !== "datetime-local") {
                    input.placeholder = tehpasStringList[passportMap[i].input[j].name + "Hint"];
                }
                inputContainer.id = input.id + "Container";
            } else if (passportMap[i].input[j].kind === "select") {
                let select = createElement(inputContainer, passportMap[i].input[j].kind, {id: passportMap[i].input[j].name, class: "inp", file: "inp"}, tehpasStringList);
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
            let endDate = new Date(startDate);
            endDate.setHours(startDate.getHours() + 6);
            const tzOffset = (new Date()).getTimezoneOffset() * 60000;
            document.querySelector("#endWork").value = (new Date(endDate - tzOffset)).toISOString().slice(0, -1);
        }
    }
}

function createFormPassportButton(container) {
    let printControlContainer = createElement(container, "section", {id: "printControlContainer", class: "defaultContainer"});

    let printCheckboxContainer = createElement(printControlContainer, "div", {id: "printCheckboxContainer", class: "blockCheckboxContainer"});

    let dsPrintCheckbox = createSwitchContainer(printCheckboxContainer, {}, {id: "dsPrintCheckbox", file: "cb"}, {id: "dsPrintLabel"}, tehpasStringList);
    dsPrintCheckbox.onchange = function () {
        if (this.checked) {
            linkNewStylesheet("dsPrint");
            if (document.querySelector("#osPrint") !== null) {
                document.querySelector("#osPrint").remove();
            }
        } else {
            linkNewStylesheet("osPrint");
            if (document.querySelector("#dsPrint") !== null) {
                document.querySelector("#dsPrint").remove();
            }
        }
    }
    dsPrintCheckbox.dispatchEvent(new Event('change'));
    createSwitchContainer(printCheckboxContainer, {}, {id: "signaturesPrintCheckbox", file: "cb", checked: ""}, {id: "signaturesPrintLabel"}, tehpasStringList);

    let formPassButton = createElement(printControlContainer, "button", {id: "formPassButton"}, tehpasStringList);
    formPassButton.onclick = function () {

        let error = createPassport();
        if (error === false) {
            window.print();
        } else {
            appAlert("Ошибка", error);
        }
    }
}

function createPassport() {
    if (document.querySelector("#passportContainer") !== null) {
        document.querySelector("#passportContainer").remove();
    }

    let error = false;

    let passportContainer = createElement(document.body, "div", {id: "passportContainer", class: "print"});
    addTempElement(passportContainer.id);

    createElement(passportContainer, "div", {id: "frame"});

    if (passportHeaderImage !== undefined) {
        passportContainer.appendChild(passportHeaderImage);
    }

    let passportHeaderContainer = createElement(passportContainer, "div", {id: "passportHeaderContainer"});

    let passportHeaderSpan = createElement(passportHeaderContainer, "span", {id: "passportHeaderSpan"}, tehpasStringList);

    createElement(passportHeaderContainer, "span", {id: "passportUnderHeaderSpan"}, tehpasStringList);

    for (let i = 0; i < passportMap.length; i++) {
        let hideBlock = false;
        if (passportMap[i].displayBlockCheckbox) {
            if (!document.querySelector("#" + passportMap[i].header + "BlockCheckbox").checked) {
                hideBlock = true;
            }
        }
        if (!hideBlock) {
            let tableBlock = createElement(passportContainer, "table", {class: "tableBlock"});
            if(passportMap[i].toNextPageCheckbox){
                if(document.querySelector("#" + passportMap[i].header + "BlockToNextPageCheckbox").checked){
                    tableBlock.className = "tableBlock breakBefore";
                }
            }

            createElement(tableBlock, "col");
            createElement(tableBlock, "col");

            createElement(tableBlock, "caption", {class: "tableCaption"}, tehpasStringList[passportMap[i].header + "Header"]);

            for (let j = 0; j < passportMap[i].input.length; j++) {
                if (passportMap[i].input[j].name === "passNumber") {
                    if (document.querySelector("#" + passportMap[i].input[j].name + "Checkbox").checked) {
                        if (document.querySelector("#" + passportMap[i].input[j].name).value === "") {
                            passportHeaderSpan.innerHTML += " №_____";
                        } else {
                            passportHeaderSpan.innerHTML += " №" + document.querySelector("#" + passportMap[i].input[j].name).value;
                        }
                    }
                } else if (passportMap[i].input[j].checkbox) {
                    if (!document.querySelector("#" + passportMap[i].input[j].name + "Checkbox").checked) {
                        passportMap[i].input[j].passportDisplay = false;
                        if (passportMap[i].header === "wb") {
                            tableBlock.remove();
                        }
                    } else {
                        passportMap[i].input[j].passportDisplay = true;
                    }
                }

                if (passportMap[i].input[j].passportDisplay) {
                    if (passportMap[i].input[j].inTableVision.includes("default")) {
                        let row = tableBlock.insertRow();
                        let cell = row.insertCell();
                        cell.innerHTML = tehpasStringList[passportMap[i].input[j].name + "Span"];
                        cell = row.insertCell();
                        cell.innerHTML = getValueFromElement(document.querySelector("#" + passportMap[i].input[j].name));
                    } else if (passportMap[i].input[j].inTableVision.includes("noSpan")) {
                        let row = tableBlock.insertRow();
                        let cell = row.insertCell();
                        cell.colSpan = 2;
                        cell.innerHTML = getValueFromElement(document.querySelector("#" + passportMap[i].input[j].name));
                    } else if (passportMap[i].input[j].inTableVision.includes("upperSpan")) {
                        let row = tableBlock.insertRow();
                        let cell = row.insertCell();
                        cell.colSpan = 2;
                        cell.innerHTML = "<b>" + tehpasStringList[passportMap[i].input[j].name + "Span"] + "</b><br>" + getValueFromElement(document.querySelector("#" + passportMap[i].input[j].name));
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
    let signTable = createElement(container, "table", {id: "signTable"});

    createElement(signTable, "caption", {}, tehpasStringList["signaturesTableHeader"]);

    let tableScheme = [
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
        let signTableRow = signTable.insertRow();
        for (let j = 0; j < tableScheme[i].length; j++) {
            let signTableCell = signTableRow.insertCell();
            if (tableScheme[i][j] !== null) {
                if (tableScheme[i][j].includes(" / ")) {
                    let spanName = tableScheme[i][j].split(" / ")[0];
                    let spanClass = tableScheme[i][j].split(" / ")[1];
                    if (spanName === "drillMaster" || spanName === "customer") {
                        if (document.querySelector("#" + spanName).value.trim() !== "") {
                            signTableCell.innerHTML = document.querySelector("#" + spanName).value.trim();
                        } else {
                            signTableCell.innerHTML = tehpasStringList["transcriptField"];
                        }
                        signTableCell.className = spanClass;
                    } else {
                        signTableCell.innerHTML = tehpasStringList[spanName];
                        signTableCell.className = spanClass;
                    }
                } else {
                    if (tableScheme[i][j] === "drillMaster" || tableScheme[i][j] === "customer") {
                        if (document.querySelector("#" + tableScheme[i][j]).value.trim() !== "") {
                            signTableCell.innerHTML = document.querySelector("#" + tableScheme[i][j]).value.trim();
                        } else {
                            signTableCell.innerHTML = tehpasStringList["transcriptField"];
                        }
                    } else {
                        signTableCell.innerHTML = tehpasStringList[tableScheme[i][j]];
                    }

                }
            }
        }
    }
}

function createGeoSectionTable(container) {
    let error = false;
    let gsTable = createElement(container, "table", {id: "gsTable"});
    if(document.querySelector("#gsBlockToNextPageCheckbox").checked){
        gsTable.className = "breakBefore";
    }

    let colWidth = [21, 25, 2, 3, 2, 3, 2, 3, 2, 37];
    for (let i = 0; i < colWidth.length; i++) {
        let col = createElement(gsTable, "col", {});
        col.width = colWidth[i] + "%";
    }

    createElement(gsTable, "caption", {}, tehpasStringList["geoSectionHeader"]);
    let headerRow = gsTable.insertRow();
    headerRow.className = "headerRow";
    let headerCell;
    for (let i = 0; i < tehpasStringList["gsTableHeader"].length; i++) {
        headerCell = headerRow.insertCell();
        headerCell.innerHTML = tehpasStringList["gsTableHeader"][i];
    }
    headerCell.colSpan = 8;

    let layersContainer = document.querySelector("#layersContainer");
    const wellScheme = ["firstCasing", "firstCasingVoid", "firstWaterIntakePipe", "waterIntakePipeVoid", "secondWaterIntakePipe", "secondCasingVoid", "secondCasing"];

    let staticLevelNum = tryFormatToNumber(document.querySelector("#staticLevel").value);
    let lastDepth = tryFormatToNumber(layersContainer.lastElementChild.querySelector("#endDepth").value);

    if (staticLevelNum === false && document.querySelector("#gsDrawSLCheckbox").checked) {
        return "Параметры скважины: Статический уровень должен быть записан числом!";
    }

    if ((lastDepth === false || staticLevelNum >= lastDepth) && document.querySelector("#gsDrawSLCheckbox").checked) {
        return "Геологический разрез: Статический уровень больше конечной глубины последнего слоя!";
    }

    for (let i = 0; i < layersContainer.children.length; i++) {
        let startDepthNum = tryFormatToNumber(layersContainer.children[i].querySelector("#startDepth").value);
        let endDepthNum = tryFormatToNumber(layersContainer.children[i].querySelector("#endDepth").value);
        if (startDepthNum !== false && endDepthNum !== false) {
            if (document.querySelector("#gsDrawSLCheckbox").checked) {
                //console.log(staticLevelNum + " >= " + startDepthNum + "; " + staticLevelNum + " < " + endDepthNum + " : ", staticLevelNum >= startDepthNum && staticLevelNum < endDepthNum);
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
        let tableLayerRow = table.insertRow();
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
            let staticLevel = tryFormatToNumber(document.querySelector("#staticLevel").value);
            let start = tryFormatToNumber(depthCell.innerHTML.split("-")[0].trim());
            let end = tryFormatToNumber(depthCell.innerHTML.split("-")[1].trim());
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
    let controlsDiv = createElement(container, "section", {id: "controlsDiv"});

    let headerUploadButton = createElement(controlsDiv, "input", {id: "headerUploadButton", type: "file", accept: "image/*"});
    headerUploadButton.onchange = function () {
        if (this.value.trim() !== "") {
            let imageFile = this.files[0];
            if (imageFile.type.includes("image/")) {
                let img = new Image();
                img.src = URL.createObjectURL(imageFile);
                img.onload = function () {
                    if (img.naturalWidth !== 900 || img.naturalHeight > 150) {
                        appAlert("Ошибка", "Недопустимые размеры изображения. Размеры для шапки техпаспорта:<br>Ширина: 900px<br>Высота: не более 150px");
                    } else {
                        img.id = "passportHeaderImage";
                        passportHeaderImage = img;
                        headerUploadLabel.style.backgroundColor = appTheme_getColor("ready");
                        headerUploadButton.value = "";
                        URL.revokeObjectURL(img.src);
                    }
                }
            } else {
                appAlert("Ошибка", "Файл \"" + imageFile.name + "\" не является изображением");
            }
        }
    }
    let headerUploadLabel = createElement(controlsDiv, "label", {id: "headerUploadLabel", for: "headerUploadButton", class: "of"}, tehpasStringList);
    headerUploadLabel.onclick = function () {
        this.style.backgroundColor = appTheme_getColor("button");
    }

    let openFileButton = createElement(controlsDiv, "input", {id: "openFileButton", type: "file", accept: ".tehpas"});
    openFileButton.onchange = function () {
        if (this.value.trim() !== "") {
            let inputFile = this.files[0];
            if (inputFile.name.split(".").pop() === "tehpas") {
                let fr = new FileReader();
                fr.onloadend = function () {
                    openFileLabel.style.backgroundColor = appTheme_getColor("ready");
                    currentFile = inputFile.name.replace(".tehpas", "");
                    let fileText = this.result;
                    setReadedData(fileText);
                    openFileButton.value = "";
                }
                fr.onerror = function () {
                    appAlert("Ошибка", "Ошибка чтения файла \"" + inputFile.name + "\"");
                }
                fr.readAsText(inputFile);
            } else {
                appAlert("Ошибка", "Файл \"" + inputFile.name + "\" не имеет расширения \".tehpas\"");
            }
        }
    }
    let openFileLabel = createElement(controlsDiv, "label", {id: "openFileLabel", for: "openFileButton", class: "of"}, tehpasStringList);
    openFileLabel.onclick = function () {
        this.style.backgroundColor = appTheme_getColor("button");
        currentFile = "";
    }

    let saveButton = createElement(controlsDiv, "button", {id: "saveFileButton"}, tehpasStringList);
    saveButton.onclick = function () {
        showFileSaveDialog();
    }
}

function setReadedData(content) {
    let rowData = content.split("\n");
    let newLayer = null, layerElements = false, cleanContainer = false;
    let layersContainer = document.querySelector("#layersContainer");
    for (let i = 0; i < rowData.length; i++) {
        if (rowData[i] !== "") {
            if (rowData[i] === "#LAYER#") {
                if (!cleanContainer) {
                    cleanContainer = true;
                    layersContainer.innerHTML = "";
                }
                newLayer = addLayer(null, layersContainer);
                layerElements = true;
            } else if (layerElements) {
                let element = newLayer.querySelector("#" + rowData[i].split("#:# ")[0]);
                element.value = rowData[i].split("#:# ")[1].replaceAll("<br>", "\n");
                if (element.id === "layerColor") element.dispatchEvent(new Event('change'));
            } else {
                layerElements = false;
                let element = document.querySelector("#" + rowData[i].split("#:# ")[0]);
                if (element !== null) {
                    if (element.getAttribute("file") === "cb") {
                        element.checked = JSON.parse(rowData[i].split("#:# ")[1]);
                        element.dispatchEvent(new Event('change'));
                    } else if (element.getAttribute("file") === "inp") {
                        element.value = rowData[i].split("#:# ")[1].replaceAll("<br>", "\n");
                    }
                }
            }
        }
    }
}

function showFileSaveDialog() {
    scrollController.disableBodyScrolling();
    let fileSaveContainer = createElement(document.body, "div", {id: "fileSaveContainer", class: "unPadContainer popUp"});

    createElement(fileSaveContainer, "div", {id: "fileSaveHeader", class: "defaultContainer"}, tehpasStringList);

    let itemsContainer = createElement(fileSaveContainer, "div", {class: "itemsContainer"});

    let inpContainer = createElement(itemsContainer, "div", {class: "inpContainer"});

    createElement(inpContainer, "span", {id: "fileNameSpan"}, tehpasStringList);
    let fileName = createElement(inpContainer, "input", {id: "fileName", type: "text"});
    fileName.value = currentFile;
    fileName.placeholder = tehpasStringList[fileName.id + "Hint"];

    let buttonsContainer = createElement(itemsContainer, "div", {id: "buttonsContainer"});

    let saveFileButton = createElement(buttonsContainer, "button", {id: "saveFileButton"}, tehpasStringList);
    saveFileButton.onclick = function () {
        if (fileName.value.trim() !== "") {
            saveFile(fileName.value, getDataToSave());
        } else {
            saveFile("drillmate_tehpas", getDataToSave());
        }
        closeButton.onclick();
    }

    let closeButton = createElement(buttonsContainer, "button", {id: "closeButton"}, "Закрыть");
    closeButton.onclick = function () {
        scrollController.enableBodyScrolling();
        fileSaveContainer.remove();
    }

}

function getDataToSave() {
    let data = "";
    let elements = Array.from(document.querySelectorAll("[file]"));

    for (let i = 0; i < elements.length; i++) {
        if (elements[i].getAttribute("file") === "cb") {
            data += elements[i].id + "#:# " + elements[i].checked + "\n";
        } else if (elements[i].getAttribute("file") === "inp" && elements[i].value !== "") {
            data += elements[i].id + "#:# " + elements[i].value.replaceAll("\n", "<br>") + "\n";
        }
    }
    data += "\n";

    let layers = document.querySelector("#layersContainer");
    for (let i = 0; i < layers.children.length; i++) {
        data += "#LAYER#\n";
        let elements = Array.from(layers.children[i].querySelectorAll("[file]"));
        for (let j = 0; j < elements.length; j++) {
            data += elements[j].id + "#:# " + elements[j].value + "\n";
        }
    }

    return data.trim();
}

function saveFile(fileName, data) {
    let a = document.createElement("a");
    let file = new Blob([data], {
        type: 'plain/text'
    });
    a.href = URL.createObjectURL(file);
    a.download = fileName.trim() + ".tehpas";
    a.click();
    a.remove();
    currentFile = fileName.trim();
}

function createGeoSectionBlock(container) {
    let geoSectionContainer = createElement(container, "section", {id: "geoSectionContainer", class: "unPadContainer"});

    createElement(geoSectionContainer, "div", {id: "geoSectionHeader", class: "defaultContainer blockHeader"}, tehpasStringList);

    let gsCheckboxContainer = createElement(geoSectionContainer, "div", {id: "gsCheckboxContainer", class: "blockCheckboxContainer"});
    createSwitchContainer(gsCheckboxContainer, {}, {id: "gsBlockShowCheckbox", file: "cb"}, {id: "gsBlockShowLabel"}, tehpasStringList);
    createSwitchContainer(gsCheckboxContainer, {}, {id: "gsBlockToNextPageCheckbox", file: "cb"}, {id: "toNextPageCheckboxLabel"}, tehpasStringList);
    createSwitchContainer(gsCheckboxContainer, {}, {id: "gsDrawSLCheckbox", file: "cb"}, {id: "gsDrawSLLabel"}, tehpasStringList);

    let itemsContainer = createElement(geoSectionContainer, "div", {id: "layersContainer", class: "itemsContainer"});

    addLayer(null, itemsContainer);
}

function addLayer(prevLayer, container) {
    let layer = createElement(null, "div", {class: "layer"});
    if (prevLayer !== null) {
        prevLayer.insertAdjacentElement("afterend", layer);
    } else {
        container.appendChild(layer);
    }
    animateElement(layer, ["layerShow_start"], ["layerShow_end"]).then();

    createElement(layer, "span", {id: "depthSpan"}, tehpasStringList);

    let startDepthContainer = createElement(layer, "div", {id: "startDepthContainer", class: "inpContainer"});

    createElement(startDepthContainer, "span", {id: "startDepthSpan"}, tehpasStringList);
    let startDepth = createElement(startDepthContainer, "input", {id: "startDepth", type: "tel", file: ""});
    startDepth.placeholder = tehpasStringList[startDepth.id + "Hint"];
    if (layer.previousElementSibling !== null) {
        startDepth.value = layer.previousElementSibling.children[2].children[1].value;
    }
    startDepth.oninput = function () {
        if (layer.previousElementSibling !== null) {
            layer.previousElementSibling.children[2].children[1].value = startDepth.value;
        }
    }

    let endDepthContainer = createElement(layer, "div", {id: "endDepthContainer", class: "inpContainer"});

    createElement(endDepthContainer, "span", {id: "endDepthSpan"}, tehpasStringList);
    let endDepth = createElement(endDepthContainer, "input", {id: "endDepth", type: "tel", file: ""});
    endDepth.placeholder = tehpasStringList[endDepth.id + "Hint"];
    endDepth.oninput = function () {
        if (layer.nextElementSibling !== null) {
            layer.nextElementSibling.children[1].children[1].value = this.value;
        }
    }

    let layerNameContainer = createElement(layer, "div", {id: "layerNameContainer", class: "inpContainer"});

    createElement(layerNameContainer, "span", {id: "layerNameSpan"}, tehpasStringList);
    createElement(layerNameContainer, "select", {id: "layerName", file: ""}, tehpasStringList);

    let layerColorContainer = createElement(layer, "div", {id: "layerColorContainer", class: "inpContainer"});

    createElement(layerColorContainer, "span", {id: "layerColorSpan"}, tehpasStringList);
    let layerColor = createElement(layerColorContainer, "select", {id: "layerColor", file: ""}, tehpasStringList);
    layerColor.style.backgroundColor = layerColor.value;
    layerColor.onchange = function () {
        if (layerColor.value === "Khaki" || layerColor.value === "AliceBlue") {
            layerColor.style.color = "black";
        } else {
            layerColor.style.color = "white";
        }
        layerColor.style.backgroundColor = layerColor.value;
    }

    let wellConstructionContainer = createElement(layer, "div", {id: "wellConstructionContainer", class: "inpContainer"});

    createElement(wellConstructionContainer, "span", {id: "wellConstructionSpan"}, tehpasStringList);
    createElement(wellConstructionContainer, "select", {id: "wellConstruction", file: ""}, tehpasStringList);
    changeWellConstructionOptions(false);

    let addLayerButton = createElement(layer, "button", {id: "addLayerButton"}, tehpasStringList);
    addLayerButton.onclick = function () {
        addLayer(layer);
    }

    let removeLayerButton = createElement(layer, "button", {id: "removeLayerButton"}, tehpasStringList);
    removeLayerButton.onclick = function () {
        animateElement(layer, ["layerHide_start"], ["layerHide_end"]).then(() => {
            let itemsContainer = layer.parentElement;
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
    let wellConstruction = document.querySelectorAll("#wellConstruction");
    let wellType = document.querySelector("#wellType");
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