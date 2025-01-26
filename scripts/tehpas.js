import {
    newEl,
    createModuleHeader,
    tryFormatToNumber,
    appAlert,
    scrollController,
    linkNewStylesheet, setCookie, getCookie
} from "./modules/otherModules.js";
import {tehpasStr} from "./objects/strings.js";
import {passportBlock} from "./objects/passport.js";
import {colors} from "./objects/colors.js";

let passportHeaderImage;
let currentFile;

export function startTehPasModule(container, moduleName, moduleID) {
    currentFile = "";
    let tehPasDiv = newEl(container, 'div', 'id=tehPasDiv');
    passportHeaderImage = undefined;
    createModuleHeader(moduleName, moduleID, tehPasDiv);
    createControls(tehPasDiv);
    createInputBlocks(tehPasDiv);
    createGeoSectionBlock(tehPasDiv);
    createFormPassportButton(tehPasDiv);
    if(getCookie("firstTime") === undefined){
        let currentDate = new Date();
        setCookie("firstTime", false, {expires: currentDate.setDate(currentDate.getDate() + 30)});
        appAlert("Внимание", "Для корректного отображения техпаспорта на печати рекомендуется использовать браузер Google Chrome");
    }
}

function createInputBlocks(container) {
    for (let i = 0; i < passportBlock.length; i++) {
        let block = newEl(container, "div", "id=" + passportBlock[i].header + "Block" + " / class=unPadContainer");

        newEl(block, "div", "id=" + passportBlock[i].header + "Header / class=shadow defaultContainer blockHeader", tehpasStr);

        let itemsContainer = newEl(block, "div", "id=" + block.id + "Items");

        let inputContainer;
        for (let j = 0; j < passportBlock[i].input.length; j++) {
            if (passportBlock[i].input[j].checkbox) {
                inputContainer = newEl(itemsContainer, "div", "class=inputContainer");

                newEl(inputContainer, "input", "id=" + passportBlock[i].input[j].name + "Checkbox / class=cb / type=checkbox / file=cb / checked");
            } else {
                inputContainer = newEl(itemsContainer, "div", "class=inputContainerNoCheckbox");
            }

            if (tehpasStr[passportBlock[i].input[j].name + "Label"] !== undefined) {
                newEl(inputContainer, "label", "id=" + passportBlock[i].input[j].name + "Label / class=lb", tehpasStr);
            }

            if (passportBlock[i].input[j].kind === "input" || passportBlock[i].input[j].kind === "textarea") {
                let input = newEl(inputContainer, passportBlock[i].input[j].kind, "id=" + passportBlock[i].input[j].name + " / class=inp / file=inp");
                if (passportBlock[i].input[j].type !== null) {
                    input.setAttribute("type", passportBlock[i].input[j].type);
                }
                if (input.type !== "datetime-local") {
                    input.placeholder = tehpasStr[passportBlock[i].input[j].name + "Hint"];
                }
                inputContainer.id = input.id + "Container";
            } else if (passportBlock[i].input[j].kind === "select") {
                let select = newEl(inputContainer, passportBlock[i].input[j].kind, "id=" + passportBlock[i].input[j].name + " / class=inp / file=inp");
                if (typeof tehpasStr[passportBlock[i].input[j].name + "Select"] !== undefined) {
                    for (let k = 0; k < tehpasStr[passportBlock[i].input[j].name + "Select"][0].length; k++) {
                        let option = newEl(select, "option", "", tehpasStr[passportBlock[i].input[j].name + "Select"][0][k]);
                        option.value = tehpasStr[passportBlock[i].input[j].name + "Select"][1][k];
                    }
                    inputContainer.id = select.id + "Container";
                }

            }
        }
    }
    document.querySelector("#wellType").onchange = function () {
        document.querySelector("#dynamicLevelCheckbox").checked = !(document.querySelector("#wellType").value === "abyss" || document.querySelector("#wellType").value === "abyssNeedle");
        changeWellConstructionOptions(true);
    }
    document.querySelector("#wellType").onchange();
}

function createFormPassportButton(container) {
    let printControlContainer = newEl(container, "div", "id=printControlContainer / class=defaultContainer");

    let printCheckboxContainer = newEl(printControlContainer, "div", "id=printCheckboxContainer");

    let dsPrintCheckbox = newEl(printCheckboxContainer, "input", "id=dsPrintCheckbox / type=checkbox");
    dsPrintCheckbox.onchange = function () {
        if (this.checked) {
            linkNewStylesheet("dsPrint");
            if(document.querySelector("#osPrint") !== null){
                document.querySelector("#osPrint").remove();
            }
        } else {
            linkNewStylesheet("osPrint");
            if(document.querySelector("#dsPrint") !== null){
                document.querySelector("#dsPrint").remove();
            }
        }
    }
    dsPrintCheckbox.onchange();
    newEl(printCheckboxContainer, "label", "id=dsPrintLabel / for=dsPrintCheckbox", tehpasStr);
    newEl(printCheckboxContainer, "input", "id=signaturesPrintCheckbox / type=checkbox / file=cb / checked");
    newEl(printCheckboxContainer, "label", "id=signaturesPrintLabel / for=signaturesPrintCheckbox", tehpasStr);

    let formPassButton = newEl(printControlContainer, "button", "id=formPassButton", tehpasStr);
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

    let passportContainer = newEl(document.body, "div", "id=passportContainer / class=print");

    newEl(passportContainer, "div", "id=frame");

    if (passportHeaderImage !== undefined) {
        passportContainer.appendChild(passportHeaderImage);
    }

    let passportHeaderContainer = newEl(passportContainer, "div", "id=passportHeaderContainer");

    let passportHeaderLabel = newEl(passportHeaderContainer, "label", "id=passportHeaderLabel", tehpasStr);

    newEl(passportHeaderContainer, "label", "id=passportUnderHeaderLabel", tehpasStr);

    for (let i = 0; i < passportBlock.length; i++) {
        let tableBlock = newEl(passportContainer, "table", "class=tableBlock");

        newEl(tableBlock, "col", "");
        newEl(tableBlock, "col", "");

        newEl(tableBlock, "caption", "class=tableCaption", tehpasStr[passportBlock[i].header + "Header"]);

        for (let j = 0; j < passportBlock[i].input.length; j++) {
            if (passportBlock[i].input[j].name === "passNumber") {
                if (document.querySelector("#" + passportBlock[i].input[j].name + "Checkbox").checked) {
                    if (document.querySelector("#" + passportBlock[i].input[j].name).value === "") {
                        passportHeaderLabel.innerHTML += " №_____";
                    } else {
                        passportHeaderLabel.innerHTML += " №" + document.querySelector("#" + passportBlock[i].input[j].name).value;
                    }
                }
            } else if (passportBlock[i].input[j].checkbox) {
                if (!document.querySelector("#" + passportBlock[i].input[j].name + "Checkbox").checked) {
                    passportBlock[i].input[j].passportDisplay = false;
                    if (passportBlock[i].header === "wb") {
                        tableBlock.remove();
                    }
                } else {
                    passportBlock[i].input[j].passportDisplay = true;
                }
            }

            if (passportBlock[i].input[j].passportDisplay) {
                if (passportBlock[i].input[j].inTableVision.includes("default")) {
                    let row = tableBlock.insertRow();
                    let cell = row.insertCell();
                    cell.innerHTML = tehpasStr[passportBlock[i].input[j].name + "Label"];
                    cell = row.insertCell();
                    cell.innerHTML = getValueFromElement(document.querySelector("#" + passportBlock[i].input[j].name));
                } else if (passportBlock[i].input[j].inTableVision.includes("noLabel")) {
                    let row = tableBlock.insertRow();
                    let cell = row.insertCell();
                    cell.colSpan = 2;
                    cell.innerHTML = getValueFromElement(document.querySelector("#" + passportBlock[i].input[j].name));
                } else if (passportBlock[i].input[j].inTableVision.includes("upperLabel")) {
                    let row = tableBlock.insertRow();
                    let cell = row.insertCell();
                    cell.colSpan = 2;
                    cell.innerHTML = "<b>" + tehpasStr[passportBlock[i].input[j].name + "Label"] + "</b><br>" + getValueFromElement(document.querySelector("#" + passportBlock[i].input[j].name));
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

    if (document.querySelector("#gsShowCheckbox").checked) {
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
    let signTable = newEl(container, "table", "id=signTable");

    newEl(signTable, "caption", "", tehpasStr["signaturesTableHeader"]);

    let tableScheme = [
        ["jobDone / leftText", null, null],
        ["drillMasterLabel / noBreak leftText", "signatureField / noBreak", "drillMaster / noBreak"],
        [null, null, "dateField"],
        ["acceptJob / noBreakAfter leftText", null, null],
        ["customerLabel / noBreak leftText", "signatureField / noBreak", "customer / noBreak"],
        [null, null, "dateField"],
    ];

    newEl(signTable, "col", "style=width: 32%;");
    newEl(signTable, "col", "style=width: 18%;");
    newEl(signTable, "col", "style=width: 50%;");

    for (let i = 0; i < tableScheme.length; i++) {
        let signTableRow = signTable.insertRow();
        for (let j = 0; j < tableScheme[i].length; j++) {
            let signTableCell = signTableRow.insertCell();
            if (tableScheme[i][j] !== null) {
                if (tableScheme[i][j].includes(" / ")) {
                    let labelName = tableScheme[i][j].split(" / ")[0];
                    let labelClass = tableScheme[i][j].split(" / ")[1];
                    if (labelName === "drillMaster" || labelName === "customer") {
                        if (document.querySelector("#" + labelName).value.trim() !== "") {
                            signTableCell.innerHTML = document.querySelector("#" + labelName).value.trim();
                        } else {
                            signTableCell.innerHTML = tehpasStr["transcriptField"];
                        }
                        signTableCell.className = labelClass;
                    } else {
                        signTableCell.innerHTML = tehpasStr[labelName];
                        signTableCell.className = labelClass;
                    }
                } else {
                    if (tableScheme[i][j] === "drillMaster" || tableScheme[i][j] === "customer") {
                        if (document.querySelector("#" + tableScheme[i][j]).value.trim() !== "") {
                            signTableCell.innerHTML = document.querySelector("#" + tableScheme[i][j]).value.trim();
                        } else {
                            signTableCell.innerHTML = tehpasStr["transcriptField"];
                        }
                    } else {
                        signTableCell.innerHTML = tehpasStr[tableScheme[i][j]];
                    }

                }
            }
        }
    }
}

function createGeoSectionTable(container) {
    let error = false;
    let gsTable = newEl(container, "table", "id=gsTable");

    let colWidth = [21, 25, 2, 3, 2, 3, 2, 3, 2, 37];
    for (let i = 0; i < colWidth.length; i++) {
        let col = newEl(gsTable, "col", "");
        col.width = colWidth[i] + "%";
    }

    newEl(gsTable, "caption", "", tehpasStr["geoSectionHeader"]);
    let headerRow = gsTable.insertRow();
    headerRow.className = "headerRow";
    let headerCell;
    for (let i = 0; i < tehpasStr["gsTableHeader"].length; i++) {
        headerCell = headerRow.insertCell();
        headerCell.innerHTML = tehpasStr["gsTableHeader"][i];
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
    let controlsDiv = newEl(container, "div", "id=controlsDiv");

    let headerUploadButton = newEl(controlsDiv, "input", "id=headerUploadButton / type=file / accept=image/*");
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
                        passportHeaderImage = img;
                        passportHeaderImage.id = "passportHeaderImage";
                        headerUploadLabel.style.backgroundColor = colors.ready;
                        headerUploadButton.value = "";
                    }
                }
            } else {
                appAlert("Ошибка", "Файл \"" + imageFile.name + "\" не является изображением");
            }
        }
    }
    let headerUploadLabel = newEl(controlsDiv, "label", "id=headerUploadLabel / for=headerUploadButton / class=of", tehpasStr);
    headerUploadLabel.onclick = function () {
        this.style.backgroundColor = colors.button;
    }

    let openFileButton = newEl(controlsDiv, "input", "id=openFileButton / type=file / accept=.tehpas");
    openFileButton.onchange = function () {
        if (this.value.trim() !== "") {
            let inputFile = this.files[0];
            if (inputFile.name.split(".").pop() === "tehpas") {
                let fr = new FileReader();
                fr.onloadend = function () {
                    openFileLabel.style.backgroundColor = colors.ready;
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
    let openFileLabel = newEl(controlsDiv, "label", "id=openFileLabel / for=openFileButton / class=of", tehpasStr);
    openFileLabel.onclick = function () {
        this.style.backgroundColor = colors.button;
    }

    let saveButton = newEl(controlsDiv, "button", "id=saveFileButton", tehpasStr);
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
                if (element.id === "layerColor") element.onchange();
            } else {
                layerElements = false;
                let element = document.querySelector("#" + rowData[i].split("#:# ")[0]);
                if (element.getAttribute("file") === "cb") {
                    element.checked = JSON.parse(rowData[i].split("#:# ")[1]);
                } else if (element.getAttribute("file") === "inp") {
                    element.value = rowData[i].split("#:# ")[1].replaceAll("<br>", "\n");
                }
            }
        }
    }
}

function showFileSaveDialog() {
    scrollController.disableScrolling();
    let fileSaveContainer = newEl(document.body, "div", "id=fileSaveContainer / class=unPadContainer popUp");

    newEl(fileSaveContainer, "div", "id=fileSaveHeader / class=defaultContainer", tehpasStr);

    let itemsContainer = newEl(fileSaveContainer, "div", "class=itemsContainer");

    let inpContainer = newEl(itemsContainer, "div", "class=inpContainer");

    newEl(inpContainer, "label", "id=fileNameLabel", tehpasStr);
    let fileName = newEl(inpContainer, "input", "id=fileName / type=text");
    fileName.value = currentFile;
    fileName.placeholder = tehpasStr[fileName.id + "Hint"];

    let buttonsContainer = newEl(itemsContainer, "div", "id=buttonsContainer");

    let saveFileButton = newEl(buttonsContainer, "button", "id=saveFileButton", tehpasStr);
    saveFileButton.onclick = function () {
        if (fileName.value.trim() !== "") {
            saveFile(fileName.value, getDataToSave());
        } else {
            saveFile("drillmate_tehpas", getDataToSave());
        }
        closeButton.onclick();
    }

    let closeButton = newEl(buttonsContainer, "button", "id=closeButton", "Закрыть");
    closeButton.onclick = function () {
        scrollController.enableScrolling();
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
}

function createGeoSectionBlock(container) {
    let geoSectionContainer = newEl(container, "div", "id=geoSectionContainer / class=unPadContainer");

    newEl(geoSectionContainer, "div", "id=geoSectionHeader / class=defaultContainer blockHeader", tehpasStr);

    let gsCheckboxContainer = newEl(geoSectionContainer, "div", "id=gsCheckboxContainer");
    newEl(gsCheckboxContainer, "label", "id=gsShowLabel / for=gsShowCheckbox", tehpasStr);
    newEl(gsCheckboxContainer, "input", "id=gsShowCheckbox / type=checkbox / file=cb");
    newEl(gsCheckboxContainer, "label", "id=gsDrawSLLabel / for=gsDrawSLCheckbox", tehpasStr);
    newEl(gsCheckboxContainer, "input", "id=gsDrawSLCheckbox / type=checkbox / file=cb");

    let itemsContainer = newEl(geoSectionContainer, "div", "id=layersContainer / class=itemsContainer");

    addLayer(null, itemsContainer);
}

function addOptionToSelect(select, optionsName) {
    if (!Array.isArray(tehpasStr[optionsName][0])) {
        for (let i = 0; i < tehpasStr[optionsName].length; i++) {
            newEl(select, "option", "", tehpasStr[optionsName][i]);
        }
    } else {
        for (let i = 0; i < tehpasStr[optionsName][0].length; i++) {
            let option = newEl(select, "option", "", tehpasStr[optionsName][0][i]);
            option.value = tehpasStr[optionsName][1][i];
        }
    }
}

function addLayer(prevLayer, container) {
    let layer = newEl(null, "div", "class=layer");
    if (prevLayer !== null) {
        prevLayer.insertAdjacentElement('afterend', layer);
    } else {
        container.appendChild(layer);
    }


    newEl(layer, "label", "id=depthLabel", tehpasStr);

    let startDepthContainer = newEl(layer, "div", "id=startDepthContainer / class=inpContainer");

    newEl(startDepthContainer, "label", "id=startDepthLabel", tehpasStr);
    let startDepth = newEl(startDepthContainer, "input", "id=startDepth / type=tel / file");
    startDepth.placeholder = tehpasStr[startDepth.id + "Hint"];
    if (layer.previousElementSibling !== null) {
        startDepth.value = layer.previousElementSibling.children[2].children[1].value;
    }
    startDepth.oninput = function () {
        if (layer.previousElementSibling !== null) {
            layer.previousElementSibling.children[2].children[1].value = startDepth.value;
        }
    }

    let endDepthContainer = newEl(layer, "div", "id=endDepthContainer / class=inpContainer");

    newEl(endDepthContainer, "label", "id=endDepthLabel", tehpasStr);
    let endDepth = newEl(endDepthContainer, "input", "id=endDepth / type=tel / file");
    endDepth.placeholder = tehpasStr[endDepth.id + "Hint"];
    endDepth.oninput = function () {
        if (layer.nextElementSibling !== null) {
            layer.nextElementSibling.children[1].children[1].value = this.value;
        }
    }

    let layerNameContainer = newEl(layer, "div", "id=layerNameContainer / class=inpContainer");

    newEl(layerNameContainer, "label", "id=layerNameLabel", tehpasStr);
    let layerName = newEl(layerNameContainer, "select", "id=layerName / file");
    addOptionToSelect(layerName, layerName.id + "Select");

    let layerColorContainer = newEl(layer, "div", "id=layerColorContainer / class=inpContainer");

    newEl(layerColorContainer, "label", "id=layerColorLabel", tehpasStr);
    let layerColor = newEl(layerColorContainer, "select", "id=layerColor / file");
    addOptionToSelect(layerColor, layerColor.id + "Select");
    layerColor.style.backgroundColor = layerColor.value;
    layerColor.onchange = function () {
        if (layerColor.value === "Khaki" || layerColor.value === "White") {
            layerColor.style.color = "black";
        } else {
            layerColor.style.color = "white";
        }
        layerColor.style.backgroundColor = layerColor.value;
    }

    let wellConstructionContainer = newEl(layer, "div", "id=wellConstructionContainer / class=inpContainer");

    newEl(wellConstructionContainer, "label", "id=wellConstructionLabel", tehpasStr);
    let wellConstruction = newEl(wellConstructionContainer, "select", "id=wellConstruction / file");
    addOptionToSelect(wellConstruction, wellConstruction.id + "Select");
    changeWellConstructionOptions(false);

    let addLayerButton = newEl(layer, "button", "id=addLayerButton", tehpasStr);
    addLayerButton.onclick = function () {
        addLayer(layer);
    }

    let removeLayerButton = newEl(layer, "button", "id=removeLayerButton", tehpasStr);
    removeLayerButton.onclick = function () {
        let itemsContainer = layer.parentElement;
        layer.remove();
        checkMinimumLayer(itemsContainer);
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