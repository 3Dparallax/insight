function displayTexture(texture) {
    if (texture == null) {
        return;
    }

    var ctx = document.getElementById("textureCanvas").getContext("2d");
    var imageData = ctx.getImageData(0, 0, 256, 256);
    imageData.data.set(texture.pixels);
    ctx.putImageData(imageData, 0, 0);

    var texParams = document.getElementById("textureParameters");
    texParams.innerHTML = "";

    var texImage2DTerm = document.createElement("dt");
    texImage2DTerm.innerHTML = "texImage2D";
    texParams.appendChild(texImage2DTerm);

    if (texture.texImage2DCalls) {
        for (var i = 0; i < texture.texImage2DCalls.length; i++) {
            var texImage2DDescription = document.createElement("dd");
            texImage2DDescription.innerHTML = texture.texImage2DCalls[i];
            texParams.appendChild(texImage2DDescription);
        }
    }

    var texParameteriTerm = document.createElement("dt");
    texParameteriTerm.innerHTML = "texParameteri";
    texParams.appendChild(texParameteriTerm);

    if (texture.texParameteriCalls) {
        for (var i = 0; i < texture.texParameteriCalls.length; i++) {
            var texParameterDescription = document.createElement("dd");
            texParameterDescription.innerHTML = texture.texParameteriCalls[i];
            texParams.appendChild(texParameterDescription);
        }
    }
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
