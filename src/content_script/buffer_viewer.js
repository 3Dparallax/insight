glp.bufferViewer = {};

glp.bufferViewer.buffers = [];
glp.bufferViewer.frameBuffers = [];
glp.bufferViewer.renderBuffers = [];

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
