var glpBufferViewer = (function (gl) {

bufferViewer = {};

bufferViewer.buffers = [];
bufferViewer.frameBuffers = [];
bufferViewer.renderBuffers = [];
bufferViewer.boundBuffer = null;

/**
 * Sends the number of buffers created to the front end
 **/
bufferViewer.getBuffers = function() {
  gl.glp().messages.sendMessage(messageType.GET_BUFFERS, { "length" : this.buffers.length });
}

/**
 * Sends the number of frame buffers created to the front end
 **/
bufferViewer.getFrameBuffers = function() {
  gl.glp().messages.sendMessage(messageType.GET_FRAME_BUFFERS, { "length" : this.frameBuffers.length });
}

/**
 * Sends the number of render buffers created to the front end
 **/
bufferViewer.getRenderBuffers = function() {
  gl.glp().messages.sendMessage(messageType.GET_RENDER_BUFFERS, { "length" : this.renderBuffers.length });
}

bufferViewer.bindBuffer = function(buffer) {
  this.boundBuffer = buffer;
}

bufferViewer.unbindBuffer = function() {
  this.boundBuffer = null;
}

bufferViewer.bufferData = function(args) {
  if (this.boundBuffer != null && args != null) {
    if (!this.boundBuffer.bufferDataCalls) {
      this.boundBuffer.bufferDataCalls = [];
    }

    this.boundBuffer.bufferDataCalls.push(glpHelpers.getGLArgsString(gl, args));
  }
}

bufferViewer.bufferSubData = function(args) {
  if (this.boundBuffer != null && args != null) {
    if (!this.boundBuffer.bufferSubDataCalls) {
      this.boundBuffer.bufferSubDataCalls = [];
    }

    this.boundBuffer.bufferSubDataCalls.push(glpHelpers.getGLArgsString(gl, args));
  }
}

bufferViewer.deleteBuffer = function(buffer) {
  buffer.deleted = true;
}

bufferViewer.getBuffer = function(index) {
  if (index < 0 || index >= this.buffers.length) {
    return;
  }

  var buffer = this.buffers[index];
  gl.glp().messages.sendMessage(messageType.GET_BUFFER, JSON.stringify({
    "index" : index,
    "bufferDataCalls" : buffer.bufferDataCalls ? Array.prototype.slice.call(buffer.bufferDataCalls) : [],
    "bufferSubDataCalls" : buffer.bufferSubDataCalls ? Array.prototype.slice.call(buffer.bufferSubDataCalls) : [],
    "deleted" : buffer.deleted,
  }));
}

bufferViewer.pushBuffer = function(buffer) {
  this.buffers.push(buffer);
  return buffer;
}

bufferViewer.pushFrameBuffer = function(buffer) {
  this.frameBuffers.push(buffer);
  return buffer;
}

bufferViewer.pushRenderBuffer = function(buffer) {
  this.renderBuffers.push(buffer);
  return buffer;
}

return bufferViewer;
});
