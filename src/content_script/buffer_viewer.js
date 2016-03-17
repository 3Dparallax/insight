var glpBufferViewer = function (gl) {
  this.gl = gl;
  this.buffers = [];
  this.framebuffers = [];
  this.renderbuffers = [];
  this.boundBuffer = null;
  this.boundFramebuffer = null;
  this.boundRenderbuffer = null;
}

/**
 * Sends the number of buffers created to the front end
 **/
glpBufferViewer.prototype.getBuffers = function() {
  this.gl.glp().messages.sendMessage(messageType.GET_BUFFERS, { "length" : this.buffers.length });
}

/**
 * Sends the number of frame buffers created to the front end
 **/
glpBufferViewer.prototype.getFrameBuffers = function() {
  this.gl.glp().messages.sendMessage(messageType.GET_FRAME_BUFFERS, { "length" : this.framebuffers.length });
}

/**
 * Sends the number of render buffers created to the front end
 **/
glpBufferViewer.prototype.getRenderBuffers = function() {
  this.gl.glp().messages.sendMessage(messageType.GET_RENDER_BUFFERS, { "length" : this.renderbuffers.length });
}

glpBufferViewer.prototype.bindBuffer = function(buffer) {
  this.boundBuffer = buffer;
}

glpBufferViewer.prototype.unbindBuffer = function() {
  this.boundBuffer = null;
}

glpBufferViewer.prototype.bufferData = function(args) {
  if (this.boundBuffer != null && args != null) {

    if (typeof args[1] == "number") {
      this.boundBuffer.buffer = new ArrayBuffer(args[1]);
    } else {
      this.boundBuffer.buffer = args[1].slice();
    }

  }
}

glpBufferViewer.prototype.bufferSubData = function(args) {
  if (this.boundBuffer != null && args != null) {

    if (this.boundBuffer.buffer) {
      for (var i = 0; i < args[2].length; i++) {
        this.boundBuffer.buffer[args[1]+i] = args[2][i];
      }
    }

  }
}

glpBufferViewer.prototype.deleteBuffer = function(buffer) {
  buffer.deleted = true;
}

glpBufferViewer.prototype.bindFramebuffer = function(buffer) {
  this.boundFramebuffer = buffer;
}

glpBufferViewer.prototype.unbindFramebuffer = function() {
  this.boundFramebuffer = null;
}

glpBufferViewer.prototype.deleteFramebuffer = function(buffer) {
  if (buffer != null) {
    buffer.deleted = true;
  }
}

glpBufferViewer.prototype.framebufferRenderbuffer = function(args) {
  if (this.boundFramebuffer != null && args != null) {
    if (!this.boundFramebuffer.framebufferRenderbufferCalls) {
      this.boundFramebuffer.framebufferRenderbufferCalls = [];
    }
    this.boundFramebuffer.framebufferRenderbufferCalls.push(args);

    var renderbuffer = args[3];
    if (renderbuffer) {
      if (!renderbuffer.framebufferRenderbufferCalls) {
        renderbuffer.framebufferRenderbufferCalls = [];
      }
      renderbuffer.framebufferRenderbufferCalls.push(args);
    }
  }
}

glpBufferViewer.prototype.framebufferTexture2D = function(args) {
  if (this.boundFramebuffer != null && args != null) {
    if (!this.boundFramebuffer.framebufferTexture2DCalls) {
      this.boundFramebuffer.framebufferTexture2DCalls = [];
    }
    this.boundFramebuffer.framebufferTexture2DCalls.push(args);
  }
}

glpBufferViewer.prototype.bindRenderbuffer = function(buffer) {
  this.boundRenderbuffer = buffer;
}

glpBufferViewer.prototype.unbindRenderbuffer = function() {
  this.boundRenderbuffer = null;
}

glpBufferViewer.prototype.deleteRenderbuffer = function(buffer) {
  if (buffer != null) {
    buffer.deleted = true;
  }
}

glpBufferViewer.prototype.getBuffer = function(index) {
  if (index < 0 || index >= this.buffers.length) {
    return;
  }

  var buffer = this.buffers[index];

  var source = {};
  source.arraySrc = Array.prototype.slice.call(buffer.buffer);
  source.deleted = buffer.deleted;

  this.gl.glp().messages.sendMessage(messageType.GET_BUFFER, JSON.stringify({
    "index" : index,
    "source" : source,
  }));
}

glpBufferViewer.prototype.createBase64Url = function(framebuffer) {

  var data = null;

  var boundFramebuffer = this.boundFramebuffer;
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);

  var canRead = (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) == this.gl.FRAMEBUFFER_COMPLETE);
  if (canRead) {

    var texture = null;

    for (var i = 0; i < framebuffer.framebufferTexture2DCalls.length; i++) {
      var args = framebuffer.framebufferTexture2DCalls[i];
      if (args[3]) {
        texture = args[3];
      }
    }

    if (texture != null) {
      var size = helpers.getTextureSize(texture);
      var pixels = new Uint8Array(size.width * size.height * 4);
      this.gl.readPixels(0, 0, size.width, size.height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);

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
  }

  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, boundFramebuffer);

  return data;
}

glpBufferViewer.prototype.getFrameBuffer = function(index) {
  if (index < 0 || index >= this.buffers.length) {
    return;
  }

  var buffer = this.framebuffers[index];
  var base64Url = this.createBase64Url(buffer);

  var source = {};
  source.imgSrc = base64Url.url;
  source.width = base64Url.width;
  source.height = base64Url.height;
  source.deleted = buffer.deleted;

  this.gl.glp().messages.sendMessage(messageType.GET_BUFFER, JSON.stringify({
    "index" : index,
    "source" : source,
    "framebufferRenderbufferCalls" : helpers.getGLArgsList(this.gl, buffer.framebufferRenderbufferCalls),
    "framebufferTexture2DCalls" : helpers.getGLArgsList(this.gl, buffer.framebufferTexture2DCalls),
  }));
}

glpBufferViewer.prototype.getRenderBufferStatus = function(renderbuffer) {

  var renderbufferStatus = [
    this.gl.RENDERBUFFER_WIDTH,
    this.gl.RENDERBUFFER_HEIGHT,
    this.gl.RENDERBUFFER_INTERNAL_FORMAT,
    this.gl.RENDERBUFFER_GREEN_SIZE,
    this.gl.RENDERBUFFER_BLUE_SIZE,
    this.gl.RENDERBUFFER_RED_SIZE,
    this.gl.RENDERBUFFER_ALPHA_SIZE,
    this.gl.RENDERBUFFER_DEPTH_SIZE,
    this.gl.RENDERBUFFER_STENCIL_SIZE
  ];

  var boundRenderbuffer = this.boundRenderbuffer;
  this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, renderbuffer);

  var statuses = [];
  for (var i = 0; i < renderbufferStatus.length; i++) {
    var statusName = helpers.getGLEnumName(this.gl, renderbufferStatus[i]);
    var parameter = this.gl.getRenderbufferParameter(this.gl.RENDERBUFFER, renderbufferStatus[i]);

    var status = {};
    status[statusName] = parameter;
    statuses.push(status);
  }

  this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, boundRenderbuffer);

  return statuses;
}

glpBufferViewer.prototype.getRenderBuffer = function(index) {
  if (index < 0 || index >= this.buffers.length) {
    return;
  }

  var buffer = this.renderbuffers[index];

  this.gl.glp().messages.sendMessage(messageType.GET_BUFFER, JSON.stringify({
    "index" : index,
    "deleted" : buffer.deleted,
    "renderbufferStatus" : this.getRenderBufferStatus(buffer),
    "framebufferRenderbufferCalls" : helpers.getGLArgsList(this.gl, buffer.framebufferRenderbufferCalls),
  }));
}

glpBufferViewer.prototype.pushBuffer = function(buffer) {
  this.buffers.push(buffer);
  buffer.deleted = false;
  return buffer;
}

glpBufferViewer.prototype.pushFrameBuffer = function(buffer) {
  this.framebuffers.push(buffer);
  buffer.deleted = false;
  return buffer;
}

glpBufferViewer.prototype.pushRenderBuffer = function(buffer) {
  this.renderbuffers.push(buffer);
  buffer.deleted = false;
  return buffer;
}
