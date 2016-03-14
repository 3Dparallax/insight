var glpTextureViewer = function (gl) {
    this.gl = gl;

    this.textures = [];
    this.boundTexture = null;
}

/**
 * Sends the number of textures created to the front end
 **/
glpTextureViewer.prototype.getTextures = function() {
    this.gl.glp().messages.sendMessage(messageType.GET_TEXTURES, { "length" : this.textures.length });
}

glpTextureViewer.prototype.bindTexture = function(bindingPoint, texture) {
    if (this.boundTexture != null && this.boundTexture != texture) {
        this.boundTexture.bindingPoint = bindingPoint;
        this.boundTexture.rendered = false;
    }
    this.boundTexture = texture;
}

glpTextureViewer.prototype.unbindTexture = function() {
    if (this.boundTexture != null) {
        this.boundTexture.rendered = false;
    }
    this.boundTexture = null;
}

glpTextureViewer.prototype.addCall = function(callList, args) {
    if (args) {
        callList.push(Array.prototype.slice.call(args));
    }
}

glpTextureViewer.prototype.texImage2D = function(args) {
    if (this.boundTexture != null && !this.boundTexture.rendered) {
        if (!this.boundTexture.texImage2DCalls) {
            this.boundTexture.texImage2DCalls = [];
        }
        this.addCall(this.boundTexture.texImage2DCalls, args);
    }
}

glpTextureViewer.prototype.texSubImage2D = function(args) {
    if (this.boundTexture != null && !this.boundTexture.rendered) {
        if (!this.boundTexture.texSubImage2DCalls) {
            this.boundTexture.texSubImage2DCalls = [];
        }
        this.addCall(this.boundTexture.texSubImage2DCalls, args);
    }
}

glpTextureViewer.prototype.texParameteri = function(args) {
    if (this.boundTexture != null && !this.boundTexture.rendered) {
        if (!this.boundTexture.texParameteriCalls) {
            this.boundTexture.texParameteriCalls = [];
        }
        this.addCall(this.boundTexture.texParameteriCalls, args);
    }
}

glpTextureViewer.prototype.texParameterf = function(args) {
    if (this.boundTexture != null && !this.boundTexture.rendered) {
        if (!this.boundTexture.texParameterfCalls) {
            this.boundTexture.texParameterfCalls = [];
        }
        this.addCall(this.boundTexture.texParameterfCalls, args);
    }
}

glpTextureViewer.prototype.createBase64Url = function(gl, texture) {
    var frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    var data = null;

    var canRead = (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE);
    if (canRead) {
        var size = helpers.getTextureSize(texture);
        var pixels = new Uint8Array(size.width * size.height * 4);
        gl.readPixels(0, 0, size.width, size.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        var canvas = document.createElement("canvas");
        canvas.width = size.width;
        canvas.height = size.height;

        var context = canvas.getContext("2d");
        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        imageData.data.set(pixels);
        context.putImageData(imageData, 0, 0);

        data = {
            "url" : canvas.toDataURL(),
            "width": size.width,
            "height": size.height,
        };
    }

    gl.deleteFramebuffer(frameBuffer);

    return data;
}

glpTextureViewer.prototype.getTextureSource = function(texture) {

    var data = {};
    data.width = 16;
    data.height = 16;

    if (texture.texImage2DCalls) {
        for (var i = 0; i < texture.texImage2DCalls.length; i++) {
            var args = texture.texImage2DCalls[i];
            if (args[1] == 0) {
                if (args.length == 9 && args[8]) {
                    data.width = Math.max(args[3], data.width);
                    data.height = Math.max(args[4], data.height);
                    data.arraySrc = Array.prototype.slice.call(args[8]);
                } else if (args[5]) {
                    var pixels = args[5];

                    data.width = Math.max(pixels.width, data.width);
                    data.height = Math.max(pixels.height, data.height);
                    if (pixels instanceof HTMLImageElement) {
                        data.imgSrc = pixels.src;
                    } else if (pixels instanceof HTMLCanvasElement) {
                        data.imgSrc = pixels.toDataURL();
                    } else if (pixels instanceof HTMLVideoElement) {
                        data.videoSrc = pixels.src;
                    } else if (pixels instanceof ImageData) {
                        data.arraySrc = Array.prototype.slice.call(pixels.data);
                    }
                }
            }
        }
    }

    return data;
}

/**
 * Get a texture in the textures list by its index.
 * Sends the texture to the front end
 **/
glpTextureViewer.prototype.getTexture = function(index) {
    if (index < 0 || index >= this.textures.length) {
        return;
    }

    var texture = this.textures[index];
    var source = this.getTextureSource(texture);

    if (source.arraySrc) {
        var base64Url = this.createBase64Url(this.gl, texture);
        if (base64Url != null) {
            source.imgSrc = base64Url.url;
            source.width = base64Url.width;
            source.height = base64Url.height;
        }
    }

    var textureInformation = {
        "index": index,
        "source": source,
        "texImage2DCalls": helpers.getGLArgsList(this.gl, texture.texImage2DCalls),
        "texSubImage2DCalls": helpers.getGLArgsList(this.gl, texture.texSubImage2DCalls),
        "texParameteriCalls": helpers.getGLArgsList(this.gl, texture.texParameteriCalls),
        "texParameterfCalls": helpers.getGLArgsList(this.gl, texture.texParameterfCalls),
    };

    this.gl.glp().messages.sendMessage(messageType.GET_TEXTURE, JSON.stringify(textureInformation));
}

glpTextureViewer.prototype.pushTexture = function(texture) {
    this.textures.push(texture);
    return texture;
}
