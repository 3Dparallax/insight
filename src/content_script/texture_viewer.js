glp.textureViewer = {};

glp.textureViewer.textures = [];

/**
 * Sends the number of textures created to the front end
 **/
glp.textureViewer.getTextures = function(gl) {
    glpSendMessage(gl, messageType.GET_TEXTURES, { "length" : this.textures.length });
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
        glpSendMessage(gl, messageType.GET_TEXTURE, {
            "index" : index,
            "pixels" : Array.prototype.slice.call(pixels)
        });
    }

    gl.deleteFramebuffer(frameBuffer);
}
