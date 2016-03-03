glp.textureViewer = {};

glp.textureViewer.textures = [];
glp.textureViewer.boundTexture = null;

/**
 * Sends the number of textures created to the front end
 **/
glp.textureViewer.getTextures = function(gl) {
    glpSendMessage(gl, messageType.GET_TEXTURES, { "length" : this.textures.length });
}

glp.textureViewer.bindTexture = function(texture) {
    this.boundTexture = texture;
}

glp.textureViewer.unbindTexture = function() {
    this.boundTexture = null;
}

glp.textureViewer.texImage2D = function(gl, args) {
    if (this.boundTexture != null && args != null) {
        if (!this.boundTexture.texImage2DCalls) {
            this.boundTexture.texImage2DCalls = [];
        }

        var argsList = Array.prototype.slice.call(args);
        var argsString = "";
        for (var i = 0; i < argsList.length; i++) {
            if (i != 0) {
                argsString += ", ";
            }
            var glEnumName = getGLEnumName(gl, argsList[i]);
            if (typeof glEnumName == "string") {
                argsString += glEnumName;
            } else {
                argsString += argsList[i];
            }
        }
        this.boundTexture.texImage2DCalls.push(argsString);
    }
}

glp.textureViewer.texParameteri = function(gl, args) {
    if (this.boundTexture != null && args != null) {
        if (!this.boundTexture.texParameteriCalls) {
            this.boundTexture.texParameteriCalls = [];
        }

        var argsList = Array.prototype.slice.call(args);
        var argsString = "";
        for (var i = 0; i < argsList.length; i++) {
            if (i != 0) {
                argsString += ", ";
            }
            argsString += getGLEnumName(gl, argsList[i]);
        }
        this.boundTexture.texParameteriCalls.push(argsString);
    }
}

/**
 * Get a texture in the textures list by its index.
 * Sends the texture to the front end
 **/
glp.textureViewer.getTexture = function(gl, index) {
    if (index < 0 || index >= this.textures.length) {
        return;
    }

    var size = { "x" : 256, "y" : 256 };
    var texture = this.textures[index];

    var frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    var canRead = (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE);
    if (canRead) {
        var pixels = new Uint8Array(size.x * size.y * 4);
        gl.readPixels(0, 0, size.x, size.y, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        glpSendMessage(gl, messageType.GET_TEXTURE, JSON.stringify({
            "index" : index,
            "pixels" : Array.prototype.slice.call(pixels),
            "texImage2DCalls" : Array.prototype.slice.call(texture.texImage2DCalls),
            "texParameteriCalls" : Array.prototype.slice.call(texture.texParameteriCalls),
        }));
    }

    gl.deleteFramebuffer(frameBuffer);
}

glp.textureViewer.pushTexture = function(texture) {
    this.textures.push(texture);
    return texture;
}
