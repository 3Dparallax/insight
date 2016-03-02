function displayTexture(texture) {
    if (texture == null) {
        return;
    }
    var ctx = document.getElementById("textureCanvas").getContext("2d");
    var imageData = ctx.getImageData(0, 0, 256, 256);
    imageData.data.set(texture.pixels);
    ctx.putImageData(imageData, 0, 0);
}

function updateTextureList(length) {
    var textureList = document.getElementById("textures-list");

    var elementsToAdd = length - textureList.children.length;
    if (elementsToAdd == 0) {
        return;
    }

    var baseIndex = textureList.children.length;
    if (elementsToAdd < 0) {
        textureList.innerHTML = "";
        elementsToAdd = length;
        baseIndex = 0;
    }

    for (var i = 0; i < elementsToAdd; i++) {
        var elementIndex = i + baseIndex;

        var textureElementA = document.createElement("a");
        textureElementA.href = "#";
        textureElementA.innerHTML = "texture" + elementIndex;

        var textureElementLi = document.createElement("li");
        textureElementLi.id = elementIndex;
        textureElementLi.appendChild(textureElementA);

        textureElementLi.onclick = function() {
            sendMessage(messageType.GET_TEXTURE, { "index": this.id });
        };

        textureList.appendChild(textureElementLi);
    }
}

function getTextures(e) {
    sendMessage(messageType.GET_TEXTURES, "");
}

document.getElementById("getTextures").addEventListener("click", getTextures);
