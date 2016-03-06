function displayTexture(texture) {
    if (texture == null) {
        return;
    }

    var textureCanvas = document.getElementById("textureCanvas");
    textureCanvas.width = texture.width;
    textureCanvas.height = texture.height;
    var ctx = textureCanvas.getContext("2d");
    var imageData = ctx.getImageData(0, 0, texture.width, texture.height);
    imageData.data.set(texture.pixels);
    ctx.putImageData(imageData, 0, 0);

    if (texture.texImage2DCalls) {
        for (var i = 0; i < texture.texImage2DCalls.length; i++) {
            var texImage2DDescription = document.createElement("dd");
            texImage2DDescription.innerHTML = texture.texImage2DCalls[i];
            texParams.appendChild(texImage2DDescription);
        }
    }

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

    var textureData = [];
    for (var i = 0; i < length; i++) {
        var value = "texture" + i;
        var element = { "textureId" : value };
        textureData.push(element);
    }

    if (length == 0) {
        $('#texture-list').bootstrapTable({});
    } else {
        $('#texture-list').bootstrapTable("load", textureData);
    }

    $('#texture-list > tbody > tr').on('click', function(event) {
        $(this).addClass('active').siblings().removeClass('active');

        var rowIndex = $(this).index();
        sendMessage(messageType.GET_TEXTURE, { "index": rowIndex });
    });
}

function getTextures(e) {
    sendMessage(messageType.GET_TEXTURES, "");
}

document.getElementById("getTextures").addEventListener("click", getTextures);
