//=-=-=--=-=-=-=-=-=
//  Global Variables
items = [];
availableColors = ["#00B500", "#000064", "#F6D101", "#D101F6", "#F60101", "#1E90FF", "#00FF7F", "#00FF00", "#8B0000"]
previewItem = {};
canAdd = false;
canSaveImg = false;
//=-=-=--=-=-=-=-=-=

//=-=-=--=-=-=-=-=-=
//  HTML Objects
const ItemRender = (itemObj, addToGrid) => {
    const headerTextValid = stringValid(itemObj.headerText);
    const headerColorValid = stringValid(itemObj.headerColor, "#");
    const bannerValid = stringValid(itemObj.imageBanner);
    let html = `<div ${addToGrid ? `id="grid-item-${itemObj.id}"` : ""} class="item-wrapper">`;

    if (!bannerValid) {
        return "";
    }

    if (addToGrid) {
        html += `<button class="delete-btn" onclick="deleteItem(${itemObj.id})">
            <img src="./assets/delete.svg" />
        </button>`
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

    if (itemObj.date) {
        html += `<span class='item-date'>${formatDate(itemObj.date)}</span>`
    }

    if (!addToGrid) {
        html += `<div id="rank-selector-wrapper" class="rank-selector-wrapper">`;
        for (let starPosition = 1; starPosition <= 10; starPosition++) {
            const sidePosition = starPosition % 2 == 0 ? 'right' : 'left';
            html += `<img onclick="updateStarRatingSelected(${starPosition})" alt="Estrela de avaliação" height="32px" width="16px" src="./assets/empty-star-${sidePosition}.svg" class="half-star ${sidePosition}" id="preview-star-${starPosition}">`;
        }
        html += `</div>`
    } else {
        html += `<div id="rank-selector-wrapper" class="rank-selector-wrapper">`;
        for (let starPosition = 1; starPosition <= 10; starPosition++) {
            const sidePosition = starPosition % 2 == 0 ? 'right' : 'left';
            html += `<img alt="Estrela de avaliação" height="32px" width="16px" src="./assets/${starPosition <= itemObj.starRating ? 'filled' : 'empty'}-star-${sidePosition}.svg" class="set half-star ${sidePosition}" id="star-${starPosition}">`;
        }
        html += `</div>`
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

function formatDate(date) {
    const newDate = new Date(`${date}T00:00:00`);
    return `${newDate.getDate().toString().padStart(2, '0')}/${(newDate.getMonth() + 1).toString().padStart(2, '0')}/${newDate.getFullYear().toString().padStart(4, '0')}`;
}
function stringValid(string, containsChar) {
    if (containsChar) {
        return string && (string.replace(/ /g, "") != "") && string.includes(containsChar);
    }
    return string && (string.replace(/ /g, "") != "");
}

function verifyCanAdd() {
    document.getElementById("create-item-btn").disabled = !stringValid(previewItem.imageBanner);
}

function verifyCanSaveImg() {
    let valid = true;

    if (!items || items.length == 0) {
        valid = false;
    }

    items.forEach(x => {
        if (!x.imageBanner.includes("data:image/")) {
            valid = false;
        }
    });

    let btn = document.getElementById("export-items-btn");
    btn.title = valid ? "" : "Não é possível exportar itens com imagens de URLs externas, apenas upload";
    btn.disabled = !valid;
}
//=-=-=--=-=-=-=-=-=

//=-=-=--=-=-=-=-=-=
//  Preview Setup
function initialSetup() {
    changeGridColumnsAndRows();
    verifyCanAdd();
    verifyCanSaveImg();
    toggleBannerInput();
    renderColorsInput();
    document.getElementById("bannerUpload").addEventListener("change", convertFileToPreviewImg);
    document.getElementById("itemsUpload").addEventListener("change", convertCsvFileToItems);
    document.getElementById("itemDateInput").valueAsDate = new Date();
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
        handleStarCounterObserver();
        verifyCanAdd();
        verifyCanSaveImg();
        return;
    } else {
        const imgElement = new Image();
        imgElement.src = value;
        imgElement.onload = function () {
            previewItem.imageBanner = value;
            previewContainer.innerHTML = ItemRender(previewItem);
            handleStarCounterObserver();

            verifyCanAdd();
            verifyCanSaveImg();
        };

        imgElement.onerror = function () {
            previewItem.imageBanner = undefined;
            previewContainer.innerHTML = ItemRender(previewItem);
            handleStarCounterObserver();

            verifyCanAdd();
            verifyCanSaveImg();

        };
    }

    return;
}

function updateStarRatingSelected(starRating) {
    previewItem["starRating"] = starRating;
}

function handleStarCounterObserver(deleteObserver) {
    let starsWrapper = document.getElementById("rank-selector-wrapper");
    if (starsWrapper) {

        const handlerFunction = () => {
            const minimumStars = previewItem["starRating"] ? previewItem["starRating"] : 1;
            for (let i = 10; i >= minimumStars; i--) {
                const sidePosition = i % 2 == 0 ? 'right' : 'left';
                document.getElementById(`preview-star-${i}`).setAttribute("src", `./assets/empty-star-${sidePosition}.svg`);
            }

            for (let i = 1; i <= minimumStars; i++) {
                const sidePosition = i % 2 == 0 ? 'right' : 'left';
                document.getElementById(`preview-star-${i}`).setAttribute("src", `./assets/filled-star-${sidePosition}.svg`);
            }
        };

        if (deleteObserver) {
            document.getElementById("rank-selector-wrapper").removeEventListener('mouseleave', handlerFunction);
        } else {
            document.getElementById("rank-selector-wrapper").addEventListener('mouseleave', handlerFunction);
        }
    }

    let stars = document.getElementsByClassName("half-star");
    for (let starElementIndex = 0; starElementIndex < stars.length; starElementIndex++) {
        let element = stars[starElementIndex];
        const handlerFunction = (e) => {
            const targetPosition = (e.target.id.toString()).replace("preview-star-", "");
            for (let i = 1; i <= targetPosition; i++) {
                const sidePosition = i % 2 == 0 ? 'right' : 'left';
                let star = document.getElementById(`preview-star-${i}`);
                star.setAttribute("src", `./assets/filled-star-${sidePosition}.svg`);
            }

            for (let i = 10; i > targetPosition; i--) {
                const sidePosition = i % 2 == 0 ? 'right' : 'left';
                document.getElementById(`preview-star-${i}`).setAttribute("src", `./assets/empty-star-${sidePosition}.svg`);
            }
        };

        if (deleteObserver) {
            element.removeEventListener('mouseover', handlerFunction)
        } else {
            element.addEventListener('mouseover', handlerFunction);
        }
    }
}

function convertFileToPreviewImg(uploadEvent) {
    const input = uploadEvent.target;
    let previewContainer = document.getElementById("preview");
    if (!input.files || input.files.length == 0) {
        return;
    }
    const file = input.files[0];
    uploadEvent.target = "";
    uploadEvent.files = [];
    if (file.type && file.type.indexOf('image') == -1) {
        alert('O arquivo selecionado não é uma imagem.');
        return;
    }

    const fileReader = new FileReader();
    fileReader.onload = function (e) {
        previewItem.imageBanner = e.target.result;
        previewContainer.innerHTML = ItemRender(previewItem);
        handleStarCounterObserver();


        verifyCanAdd();
        verifyCanSaveImg();

        return;
    };

    fileReader.readAsDataURL(file);
}

function convertCsvFileToItems(uploadEvent) {
    const input = uploadEvent.target;
    if (!input.files || input.files.length == 0) {
        return;
    }

    const file = input.files[0];
    uploadEvent.target = "";
    uploadEvent.files = [];
    if (file.type && file.type != 'text/csv') {
        alert('O arquivo selecionado é inválido.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const csvData = event.target.result.replace("[object Object]", "");
        items = JSON.parse(csvData);
        renderAllItems();
    };
    reader.readAsText(file);
}

initialSetup();
//=-=-=--=-=-=-=-=-=

//=-=-=--=-=-=-=-=-=
//  GRID SETUP
function changeGridColumnsAndRows(numberOfColumns, rowHeight = 220) {
    let wrapperContainer = document.getElementById("items-wrapper");
    wrapperContainer.style.gridTemplateColumns = `repeat(${numberOfColumns}, minmax(220px, 1fr))`;
    wrapperContainer.style.gridAutoRows = `${rowHeight}px`;
}

function changeListTitle() {
    const value = document.getElementById("listTitleInput").value;
    let titleContainer = document.getElementById("custom-title");
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
    itemsWrapperContainer.innerHTML += ItemRender(newItem, true);
    autoAdjustCollumnsAndRows();
    resetItem();
}

function resetItem() {
    previewItem = {};
    let previewContainer = document.getElementById("preview");
    previewContainer.innerHTML = "";
    let inputs = document.getElementsByTagName("input");
    Array.from(inputs).forEach(x => {
        if (x.type == "radio") {
            x.checked = false;
        } else if (x.type == "date") {
            x.valueAsDate = new Date();
        } else {
            x.value = "";
        }
    });
    verifyCanAdd();
    verifyCanSaveImg();
    handleStarCounterObserver(true);

}

function deleteItem(itemId) {
    items = items.filter(item => item.id != itemId);
    renderAllItems();
}

function renderAllItems() {
    let itemsWrapperContainer = document.getElementById("items-wrapper");
    itemsWrapperContainer.innerHTML = "";
    items.forEach(item => {
        itemsWrapperContainer.innerHTML += ItemRender(item, true);
    });
    verifyCanAdd();
    verifyCanSaveImg();
    autoAdjustCollumnsAndRows();
}

function autoAdjustCollumnsAndRows() {
    const numberOfItems = items.length;
    if (numberOfItems > 0) {
        const itemsHtmlCollection = [...document.querySelectorAll("#items-wrapper .item")];
        const maxHeightInCollection = itemsHtmlCollection.reduce((max, obj) => obj.clientHeight > max ? obj.clientHeight : max, itemsHtmlCollection[0].clientHeight);

        const containDate = items.find(x => x.date != null);
        changeGridColumnsAndRows(Math.round(Math.sqrt(numberOfItems)), (maxHeightInCollection + (containDate ? 80 : 48)));
    }
}

function saveImage() {
    html2canvas(document.getElementById("result")).then(function (img) {
        const titleInput = document.getElementById("listTitleInput").value;
        setTimeout(() => {
            let imageDataUrl = img.toDataURL("image/png");
            var a = document.createElement("a");
            a.href = imageDataUrl;
            a.download = `Lista_${titleInput}.png`;
            a.click();
        }, 100);
    });
}

function exportItems() {
    if (!items || items.length == 0) {
        return;
    }

    try {
        const itemsBlob = new Blob([JSON.stringify(items), { type: 'text/csv;' }]);
        const downloadAnchor = document.createElement('a');
        const titleInput = document.getElementById("listTitleInput").value;
        downloadAnchor.download = `Grid_Export_${titleInput}_${dateToString(new Date())}.csv`;
        downloadAnchor.href = window.URL.createObjectURL(itemsBlob);
        downloadAnchor.style.display = 'none';
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        document.body.removeChild(downloadAnchor);
    } catch (exception) {
        alert("Ocorreu um erro ao salvar os dados, tente novamente com imagens menores.");
    }
}

function importItemsToggle() {
    document.getElementById("itemsUpload").click();
}

function dateToString(date) {
    const dateAux = new Date(date);
    const day = String(dateAux.getDate()).padStart(2, '0');
    const month = String(dateAux.getMonth() + 1).padStart(2, '0');
    const year = dateAux.getFullYear();

    return `${day}_${month}_${year}`;
}