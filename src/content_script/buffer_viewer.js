glp.bufferViewer = {};

glp.bufferViewer.buffers = [];
glp.bufferViewer.frameBuffers = [];
glp.bufferViewer.renderBuffers = [];

/**
 * Sends the number of buffers created to the front end
 **/
glp.bufferViewer.getBuffers = function(gl) {

}

/**
 * Sends the number of frame buffers created to the front end
 **/
glp.bufferViewer.getFrameBuffers = function(gl) {

}

/**
 * Sends the number of render buffers created to the front end
 **/
glp.bufferViewer.getRenderBuffers = function(gl) {

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