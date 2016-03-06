var glp = (function (glp) {

  glp.bufferViewer = {};

  glp.bufferViewer.buffers = [];
  glp.bufferViewer.frameBuffers = [];
  glp.bufferViewer.renderBuffers = [];
  glp.bufferViewer.boundBuffer = null;

  /**
   * Sends the number of buffers created to the front end
   **/
  glp.bufferViewer.getBuffers = function(gl) {
    glpSendMessage(gl, messageType.GET_BUFFERS, { "length" : this.buffers.length });
  }

  /**
   * Sends the number of frame buffers created to the front end
   **/
  glp.bufferViewer.getFrameBuffers = function(gl) {
    glpSendMessage(gl, messageType.GET_FRAME_BUFFERS, { "length" : this.frameBuffers.length });
  }

  /**
   * Sends the number of render buffers created to the front end
   **/
  glp.bufferViewer.getRenderBuffers = function(gl) {
    glpSendMessage(gl, messageType.GET_RENDER_BUFFERS, { "length" : this.renderBuffers.length });
  }

  glp.bufferViewer.bindBuffer = function(buffer) {
    this.boundBuffer = buffer;
  }

  glp.bufferViewer.unbindBuffer = function() {
    this.boundBuffer = null;
  }

  glp.bufferViewer.bufferData = function(gl, args) {
    if (this.boundBuffer != null && args != null) {
      if (!this.boundBuffer.bufferDataCalls) {
        this.boundBuffer.bufferDataCalls = [];
      }

      this.boundBuffer.bufferDataCalls.push(getGLArgsString(gl, args));
    }
  }

  glp.bufferViewer.bufferSubData = function(gl, args) {
    if (this.boundBuffer != null && args != null) {
      if (!this.boundBuffer.bufferSubDataCalls) {
        this.boundBuffer.bufferSubDataCalls = [];
      }

      this.boundBuffer.bufferSubDataCalls.push(getGLArgsString(gl, args));
    }
  }

  glp.bufferViewer.deleteBuffer = function(buffer) {
    buffer.deleted = true;
  }

  glp.bufferViewer.getBuffer = function(gl, index) {
    if (index < 0 || index >= this.buffers.length) {
      return;
    }

    var buffer = this.buffers[index];
    glpSendMessage(gl, messageType.GET_BUFFER, JSON.stringify({
      "index" : index,
      "bufferDataCalls" : buffer.bufferDataCalls ? Array.prototype.slice.call(buffer.bufferDataCalls) : [],
      "bufferSubDataCalls" : buffer.bufferSubDataCalls ? Array.prototype.slice.call(buffer.bufferSubDataCalls) : [],
      "deleted" : buffer.deleted,
    }));
  }

  glp.bufferViewer.pushBuffer = function(buffer) {
    this.buffers.push(buffer);
    return buffer;
  }

  glp.bufferViewer.pushFrameBuffer = function(buffer) {
    this.frameBuffers.push(buffer);
    return buffer;
  }

  glp.bufferViewer.pushRenderBuffer = function(buffer) {
    this.renderBuffers.push(buffer);
    return buffer;
  }

  return glp;
}(glp));
