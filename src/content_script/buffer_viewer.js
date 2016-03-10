var glpBufferViewer = function (gl) {
  this.gl = gl;
  this.buffers = [];
  this.frameBuffers = [];
  this.renderBuffers = [];
  this.boundBuffer = null;
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
  this.gl.glp().messages.sendMessage(messageType.GET_FRAME_BUFFERS, { "length" : this.frameBuffers.length });
}

/**
 * Sends the number of render buffers created to the front end
 **/
glpBufferViewer.prototype.getRenderBuffers = function() {
  this.gl.glp().messages.sendMessage(messageType.GET_RENDER_BUFFERS, { "length" : this.renderBuffers.length });
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

glpBufferViewer.prototype.getBuffer = function(index) {
  if (index < 0 || index >= this.buffers.length) {
    return;
  }

  var buffer = this.buffers[index];
  this.gl.glp().messages.sendMessage(messageType.GET_BUFFER, JSON.stringify({
    "index" : index,
    "buffer" : Array.prototype.slice.call(buffer.buffer),
    "deleted" : buffer.deleted,
  }));
}

glpBufferViewer.prototype.pushBuffer = function(buffer) {
  this.buffers.push(buffer);
  return buffer;
}

glpBufferViewer.prototype.pushFrameBuffer = function(buffer) {
  this.frameBuffers.push(buffer);
  return buffer;
}

glpBufferViewer.prototype.pushRenderBuffer = function(buffer) {
  this.renderBuffers.push(buffer);
  return buffer;
}
