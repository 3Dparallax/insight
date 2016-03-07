var glpTextureViewer = function (gl) { this.gl = gl; }

glpTextureViewer.prototype.textures = [];
glpTextureViewer.prototype.boundTexture = null;

/**
 * Sends the number of textures created to the front end
 **/
glpTextureViewer.prototype.getTextures = function() {
    this.gl.glp().messages.sendMessage(messageType.GET_TEXTURES, { "length" : this.textures.length });
}

glpTextureViewer.prototype.bindTexture = function(texture) {
    this.boundTexture = texture;
}

glpTextureViewer.prototype.unbindTexture = function() {
    this.boundTexture = null;
}

glpTextureViewer.prototype.texImage2D = function(args) {
    if (this.boundTexture != null && args != null) {
        if (!this.boundTexture.texImage2DCalls) {
            this.boundTexture.texImage2DCalls = [];
        }

        this.boundTexture.texImage2DCalls.push(Array.prototype.slice.call(args));
    }
}

glpTextureViewer.prototype.texParameteri = function(args) {
    if (this.boundTexture != null && args != null) {
        if (!this.boundTexture.texParameteriCalls) {
            this.boundTexture.texParameteriCalls = [];
        }

        this.boundTexture.texParameteriCalls.push(Array.prototype.slice.call(args));
    }
}

glpTextureViewer.prototype.getTextureSize = function(texture) {
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
glpTextureViewer.prototype.getTexture = function(index) {
    if (index < 0 || index >= this.textures.length) {
        return;
    }

    var texture = this.textures[index];
    var size = this.getTextureSize(texture);
    var gl = this.gl;

    var frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    var canRead = (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE);
    if (canRead) {
        var pixels = new Uint8Array(size.x * size.y * 4);
        gl.readPixels(0, 0, size.x, size.y, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        gl.glp().messages.sendMessage(messageType.GET_TEXTURE, JSON.stringify({
            "index": index,
            "pixels": Array.prototype.slice.call(pixels),
            "texImage2DCalls": glpHelpers.getGLArgsList(gl, texture.texImage2DCalls),
            "texParameteriCalls": glpHelpers.getGLArgsList(gl, texture.texParameteriCalls),
            "width": size.x,
            "height": size.y,
        }));
    }

    gl.deleteFramebuffer(frameBuffer);
}

glpTextureViewer.prototype.pushTexture = function(texture) {
    this.textures.push(texture);
    return texture;
}
