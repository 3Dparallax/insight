WebGLRenderingContext.prototype.glpTextures = [];

/**
 * Sends the number of textures created to the front end
 **/
WebGLRenderingContext.prototype.glpUpdateTextureList = function() {
    glpSendMessage("Textures", { "length" : this.glpTextures.length });
}

/**
 * Get a texture in the textures list by its index.
 * Sends the texture to the front end
 **/
WebGLRenderingContext.prototype.glpGetTexture = function(index) {
    if (index < 0 || index >= this.glpTextures.length) {
        return;
    }

    var size = { "x" : 512, "y" : 512 };
    var texture = this.glpTextures[index];
    var frameBuffer = this.createFramebuffer();
    this.bindFramebuffer(this.FRAMEBUFFER, frameBuffer);
    this.framebufferTexture2D(this.FRAMEBUFFER, this.COLOR_ATTACHMENT0, this.TEXTURE_2D, texture, 0);

    var canRead = (this.checkFramebufferStatus(this.FRAMEBUFFER) == this.FRAMEBUFFER_COMPLETE);
    if (canRead) {
        var pixels = new Uint8Array(size.x * size.y * 4);
        this.readPixels(0, 0, size.x, size.y, this.RGBA, this.UNSIGNED_BYTE, pixels);
        glpSendMessage("Texture", {
            "index" : index,
            "pixels" : Array.prototype.slice.call(pixels)
        });
    }

    this.deleteFramebuffer(frameBuffer);
}
