//=-=-=--=-=-=-=-=-=
//  Global Variables
items = [];
availableColors = ["#00B500", "#000064", "#F6D101", "#D101F6", "#F60101", "#1E90FF", "#00FF7F", "#00FF00", "#8B0000"]
previewItem = {};
canAdd = false;
//=-=-=--=-=-=-=-=-=

//=-=-=--=-=-=-=-=-=
//  HTML Objects
const ItemRender = (itemObj) => {
    const headerTextValid = stringValid(itemObj.headerText);
    const headerColorValid = stringValid(itemObj.headerColor, "#");
    const bannerValid = stringValid(itemObj.imageBanner);
    let html = `<div class="item-wrapper">`;

    if (!bannerValid) {
        return "";
    }

    html += `<div class="item">`;
    if (headerTextValid) {
        html += `
        <div class="header" style="background-color:${headerColorValid ? itemObj.headerColor : "#000"}">
            <span class="title">${itemObj.headerText.toUpperCase()}</span>
        </div>`;
    }
    if (bannerValid) {
        html += `<img class="banner" src="${itemObj.imageBanner}"/>`;
    }
    html += `</div>`;

    if (itemObj.replayed) {
        html += `<img class="replayed" src="./assets/replayed.png"/>`
    }
    if (itemObj.completed) {
        html += `<img class="completed" src="./assets/trophy.png"/>`
    }

    html += `</div>`;
    return html;
}

const ColorInput = (color, indexId, activated) => {
    const html =
        `
            <label title="${color}" class="colorPreview" style="background-color:${color}">
                <input id="color-radio-${indexId}" ${activated ? "checked" : ""} onchange="updatePreview('headerColor', 'color-radio-${indexId}', 'value')" type="radio" value='${color}' name="headerColorInput">
            </label>
        `;
    return html;
}
//=-=-=--=-=-=-=-=-=

//=-=-=--=-=-=-=-=-=
//  Utils
function stringValid(string, containsChar) {
    if (containsChar) {
        return string && (string.replace(/ /g, "") != "") && string.includes(containsChar);
    }
    return string && (string.replace(/ /g, "") != "");
}

function verifyCanAdd() {
    document.getElementById("create-item-btn").disabled = !stringValid(previewItem.imageBanner);
}
//=-=-=--=-=-=-=-=-=

//=-=-=--=-=-=-=-=-=
//  Preview Setup
function initialSetup() {
    changeGridColumnsAndRows();
    verifyCanAdd();
    toggleBannerInput();
    renderColorsInput();
    document.getElementById('bannerUpload').addEventListener('change', convertFileToPreviewImg);
}

function toggleBannerInput() {
    const bannerViaUpload = document.getElementById("uploadCheckbox").checked;
    const bannerViaUrl = document.getElementById("urlCheckbox").checked;
    let bannerUploadContainer = document.getElementById("bannerUploadSection");
    let bannerUrlContainer = document.getElementById("bannerUrlSection")

    bannerUploadContainer.style.display = bannerViaUpload ? 'block' : 'none';
    bannerUrlContainer.style.display = bannerViaUrl ? 'block' : 'none';
}

function renderColorsInput() {
    let colorsInputContainer = document.getElementById("headerColorsInput");
    availableColors.forEach((color, index) => {
        colorsInputContainer.innerHTML += ColorInput(color, index, index == 0);
        if (index == 0) {
            updatePreview("headerColor", `color-radio-${index}`, "value");
        }
    });
}

function updatePreview(propName, elementId, elementPropValue, isImage) {
    let previewContainer = document.getElementById("preview");
    previewContainer.innerHTML = "";
    const value = document.getElementById(elementId)[elementPropValue];
    if (!isImage) {
        let valueValid = true;
        if (typeof value == 'string') {
            valueValid = value.replace(/ /g, "") != "";
        }

        if (valueValid) {
            previewItem[propName] = value;
        } else {
            previewItem[propName] = undefined;
        }
        previewContainer.innerHTML = ItemRender(previewItem);
        verifyCanAdd();
        return;
    } else {
        const imgElement = new Image();
        imgElement.src = value;
        imgElement.onload = function () {
            previewItem.imageBanner = value;
            previewContainer.innerHTML = ItemRender(previewItem);
            verifyCanAdd();
        };

        imgElement.onerror = function () {
            previewItem.imageBanner = undefined;
            previewContainer.innerHTML = ItemRender(previewItem);
            verifyCanAdd();
        };
    }

    return;

}

function convertFileToPreviewImg(uploadEvent) {
    const input = uploadEvent.target;
    let previewContainer = document.getElementById("preview");
    if (!input.files || input.files.length == 0) {
        return;
    }
    const file = input.files[0];
    if (file.type && file.type.indexOf('image') == -1) {
        alert('O arquivo selecionado não é uma imagem.');
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = function (e) {
        previewItem.imageBanner = e.target.result;
        previewContainer.innerHTML = ItemRender(previewItem);

        uploadEvent.target = "";
        uploadEvent.files = [];
        verifyCanAdd();
        return;
    };

    fileReader.readAsDataURL(file);
}

initialSetup();
//=-=-=--=-=-=-=-=-=

//=-=-=--=-=-=-=-=-=
//  GRID SETUP
function changeGridColumnsAndRows() {
    const numberOfColumns = document.getElementById("columnsSelect").value;
    let wrapperContainer = document.getElementById("items-wrapper");
    wrapperContainer.style.gridTemplateColumns = `repeat(${numberOfColumns}, minmax(200px, 1fr))`;
}

function changeListTitle() {
    const value = document.getElementById("listTitleInput").value;
    let titleContainer = document.getElementById("list-name");
    if (stringValid(value)) {
        titleContainer.innerHTML = value;
    } else {
        titleContainer.innerHTML = "";
    }
}

function addNewItem() {
    let itemsWrapperContainer = document.getElementById("items-wrapper");
    let newItem = { ...previewItem };
    newItem.id = items.length + 1;
    items.push(newItem);
    itemsWrapperContainer.innerHTML += ItemRender(newItem);
    resetItem();
}

function resetItem() {
    previewItem = {};
    let previewContainer = document.getElementById("preview");
    previewContainer.innerHTML = "";
    let inputs = document.getElementsByTagName("input");
    Array.from(inputs).forEach(x => {
        if (x.type != "radio") {
            x.value = "";
        }
        x.checked = false;
    });
    verifyCanAdd();
}

function renderAllItems() {
    let itemsWrapperContainer = document.getElementById("items-wrapper");
    itemsWrapperContainer.innerHTML = "";
    items.forEach(item => {
        itemsWrapperContainer.innerHTML += ItemRender(item);
    });
}

function saveImage() {
    html2canvas(document.getElementById("result")).then(function (image) {
        let imageDataUrl = image.toDataURL();
        var a = document.createElement("a");
        a.href = imageDataUrl;
        a.download = "Lista_2023.png";
        a.click();
        // document.body.appendChild(image);
    });
}

function saveCache() {
    if (!items || items.length == 0) {
        sessionStorage.removeItem("grid-list-items");
        return;
    }

    sessionStorage.setItem("grid-list-items", JSON.stringify(items));
    alert("Os itens foram salvos no cache da sessão do navegador.");
}

function getCacheItems() {
    let itemsSaved = sessionStorage.getItem("grid-list-items");
    if (!itemsSaved || itemsSaved == "") {
        return;
    }

    items = JSON.parse(itemsSaved);
    sessionStorage.removeItem("grid-list-items");
    alert("Itens importados e removidos do cache, se necessário, salve novamente.");
    renderAllItems();

}

setTimeout(() => {
    getCacheItems();
}, 100);