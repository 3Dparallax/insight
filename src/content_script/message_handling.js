/**
 * Instantiates messaging with the devtools panel
 */
function _glpInit() {
    window.postMessage({ type: "init" }, "*");
}
_glpInit();

// Send contexts whenever page is loaded
document.addEventListener("DOMContentLoaded", _ => setTimeout(glpContexts.sendContexts, 500));

/**
 * Receive messages from the devtools panel
 */
window.addEventListener('message', function(event) {
  var message = event.data;

  // Only accept messages that we know are ours
  if (typeof message !== 'object' || message === null || message.source != "panel") {
    return;
  }

  if (message.type == messageType.GET_CONTEXTS) {
    glpContexts.sendContexts();
    return;
  }

  // TODO: verify that all features are disabled
  var disableContext = function(gl) {
    gl.glp().messages.pixelInspectorToggle(false);
    gl.glp().callStack.toggle(false);
    gl.glp().histogram.toggle(false);
    gl.glp().programUsageCounter.toggle(false);
    gl.glp().programUsageCounter.reset();
    gl.glp().duplicateProgramDetection.toggle(false);
    gl.glp().stateTracker.toggle(false);
    gl.glp().messages.depthInspectorToggle(false, null);
    gl.glp().frameControl.play();
    gl.glp().mipmapViewer.disable();
  }

  if (message.type == messageType.DISABLE_ALL_CONTEXTS) {
    // Dev panel closed -- disable all features
    var c = glpContexts.getWebGLContexts();
    for (var i = 0; i < c.length; i++) {
      disableContext(c[i]);
    }
  }

  var gl = glpContexts.getWebGLContext(message.activeContext);
  if (!gl) {
    return;
  }

  if (message.type == messageType.PIXEL_INSPECTOR) {
    gl.glp().messages.pixelInspectorToggle(message.data.enabled);
  } else if (message.type == messageType.DEPTH_INSPECTOR) {
    gl.glp().messages.depthInspectorToggle(message.data.enabled, message.data.range);
  } else if (message.type == messageType.ENABLE_MIPMAP_TEXTURE) {
    gl.glp().messages.mipmapViewerToggle(message.data.enabled, message.data.texture);
  } else if (message.type == messageType.MIPMAP_TEXTURES) {
    gl.glp().messages.mipmapGetTextures();
  } else if (message.type == messageType.GET_CALL_STACK) {
    gl.glp().messages.sendCallStack(message.data);
  } else if (message.type == messageType.GET_CALL_STACK_DRAW) {
    gl.glp().messages.sendCallStackDraw(message.data);
  } else if (message.type == messageType.TOGGLE_CALL_STACK) {
    gl.glp().callStack.toggle(message.data.enabled);
  } else if (message.type == messageType.TOGGLE_FUNCTION_HISTOGRAM) {
    gl.glp().histogram.toggle(message.data.enabled);
  } else if (message.type == messageType.FUNCTION_HISTOGRAM) {
    gl.glp().messages.sendFunctionHistogram(message.data.threshold);
  } else if (message.type == messageType.TOGGLE_PROGRAM_USAGE_COUNT) {
    gl.glp().programUsageCounter.toggle(message.data.enabled);
  } else if (message.type == messageType.RESET_PROGRAM_USAGE_COUNT) {
    gl.glp().programUsageCounter.reset();
  } else if (message.type == messageType.GET_PROGRAM_USAGE_COUNT) {
    gl.glp().messages.getCurrentProgramUsageCount();
  } else if (message.type == messageType.TOGGLE_DUPLICATE_PROGRAM_USAGE) {
    gl.glp().duplicateProgramDetection.toggle(message.data.enabled);
  } else if (message.type == messageType.RESET_DUPLICATE_PROGRAM_USAGE) {
    gl.glp().duplicateProgramDetection.reset();
  } else if (message.type == messageType.GET_DUPLICATE_PROGRAM_USAGE) {
    gl.glp().messages.getDuplicateProgramUsage();
  } else if (message.type == messageType.GET_TEXTURE) {
    gl.glp().messages.getTexture(message.data.index);
  } else if (message.type == messageType.GET_TEXTURES) {
    gl.glp().messages.getTextures();
  } else if (message.type == messageType.GET_BUFFER) {
    gl.glp().bufferViewer.getBuffer(message.data.index);
  } else if (message.type == messageType.GET_BUFFERS) {
    gl.glp().bufferViewer.getBuffers();
  } else if (message.type == messageType.GET_FRAME_BUFFER) {
    gl.glp().bufferViewer.getFrameBuffer(message.data.index);
  } else if (message.type == messageType.GET_FRAME_BUFFERS) {
    gl.glp().bufferViewer.getFrameBuffers();
  } else if (message.type == messageType.GET_RENDER_BUFFER) {
    gl.glp().bufferViewer.getRenderBuffer(message.data.index);
  } else if (message.type == messageType.GET_RENDER_BUFFERS) {
    gl.glp().bufferViewer.getRenderBuffers();
  } else if (message.type == messageType.STATE_VARS) {
    gl.glp().messages.sendStateVars(message.data);
  } else if (message.type == messageType.TOGGLE_STATE_VARS) {
    gl.glp().stateTracker.toggle(message.data.enabled);
  } else if (message.type == messageType.FRAME_CONTROL_PLAY) {
    gl.glp().frameControl.play();
  } else if (message.type == messageType.FRAME_CONTROL_PAUSE) {
    gl.glp().frameControl.pause();
  } else if (message.type == messageType.FRAME_CONTROL_NEXT_FRAME) {
    gl.glp().frameControl.nextFrame();
  } else if (message.type == messageType.DISABLE_ALL) {
    disableContext(gl);
  } else if (message.type == messageType.SHADERS) {
    gl.glp().messages.getShaders();
  } else {
    console.error(message.type, message.data);
  }
});
