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

        this.boundTexture.texImage2DCalls.push(Array.prototype.slice.call(args));
    }
}

glp.textureViewer.texParameteri = function(gl, args) {
    if (this.boundTexture != null && args != null) {
        if (!this.boundTexture.texParameteriCalls) {
            this.boundTexture.texParameteriCalls = [];
        }

        this.boundTexture.texParameteriCalls.push(Array.prototype.slice.call(args));
    }
}

glp.textureViewer.getTextureSize = function(texture) {
    var size = { "x" : 128, "y" : 128 };

    if (texture.texImage2DCalls) {
        for (var i = 0; i < texture.texImage2DCalls.length; i++) {
            var args = texture.texImage2DCalls[i];
            if (args[1] == 0) {
                if (args.length == 9) {
                    size.x = Math.max(args[3], size.x);
                    size.y = Math.max(args[4], size.y);
                } else if (args[5]) {
                    size.x = Math.max(args[5].width, size.x);
                    size.y = Math.max(args[5].height, size.y);
                }
            }
        }
    }

    return size;
}

/**
 * Get a texture in the textures list by its index.
 * Sends the texture to the front end
 **/
glp.textureViewer.getTexture = function(gl, index) {
    if (index < 0 || index >= this.textures.length) {
        return;
    }

    var texture = this.textures[index];
    var size = this.getTextureSize(texture);

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
            "texImage2DCalls" : getGLArgsList(gl, texture.texImage2DCalls),
            "texParameteriCalls" : getGLArgsList(gl, texture.texParameteriCalls),
            "width" : size.x,
            "height" : size.y,
        }));
    }

    gl.deleteFramebuffer(frameBuffer);
}

glp.textureViewer.pushTexture = function(texture) {
    this.textures.push(texture);
    return texture;
}
