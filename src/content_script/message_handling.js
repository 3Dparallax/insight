/**
 * Instantiates messaging with the devtools panel
 */
function _glpInit() {
    window.postMessage({ type: "init" }, "*");
}
_glpInit();

// Send contexts whenever page is loaded
document.addEventListener("DOMContentLoaded", glpContexts.sendContexts);

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

  var context = glpContexts.getWebGLContext(message.activeContext);
  if (!context) {
    return;
  }

  if (message.type == messageType.PIXEL_INSPECTOR) {
    context.glp.messages.pixelInspectorToggle(context, message.data.enabled);
  } else if (message.type == messageType.GET_CALL_STACK) {
    context.glp.messages.sendCallStack(context, message.data);
  } else if (message.type == messageType.TOGGLE_CALL_STACK) {
    context.glp.callStack.toggle(message.data.enabled);
  } else if (message.type == messageType.TOGGLE_FUNCTION_HISTOGRAM) {
    context.glp.histogram.toggle(message.data.enabled);
  } else if (message.type == messageType.FUNCTION_HISTOGRAM) {
    context.glp.messages.sendFunctionHistogram(context, message.data.threshold);
  } else if (message.type == messageType.TOGGLE_PROGRAM_USAGE_COUNT) {
    context.glp.programUsageCounter.toggle(message.data.enabled);
  } else if (message.type == messageType.RESET_PROGRAM_USAGE_COUNT) {
    context.glp.programUsageCounter.reset();
  } else if (message.type == messageType.GET_PROGRAM_USAGE_COUNT) {
    context.glp.messages.getCurrentProgramUsageCount(context);
  } else if (message.type == messageType.TOGGLE_DUPLICATE_PROGRAM_USAGE) {
    context.glp.duplicateProgramDetection.toggle(message.data.enabled);
  } else if (message.type == messageType.RESET_DUPLICATE_PROGRAM_USAGE) {
    context.glp.duplicateProgramDetection.reset();
  } else if (message.type == messageType.GET_DUPLICATE_PROGRAM_USAGE) {
    context.glp.messages.getDuplicateProgramUsage(context);
  } else if (message.type == messageType.GET_TEXTURE) {
    context.glp.messages.getTexture(context, message.data.index);
  } else if (message.type == messageType.GET_TEXTURES) {
    context.glp.messages.getTextures(context);
  } else if (message.type == messageType.GET_BUFFER) {
    context.glp.bufferViewer.getBuffer(context, message.data.index);
  } else if (message.type == messageType.GET_BUFFERS) {
    context.glp.bufferViewer.getBuffers(context);
  } else if (message.type == messageType.GET_FRAME_BUFFERS) {
    context.glp.bufferViewer.getFrameBuffers(context);
  } else if (message.type == messageType.GET_RENDER_BUFFERS) {
    context.glp.bufferViewer.getRenderBuffers(context);
  } else if (message.type == messageType.STATE_VARS) {
    context.glp.messages.sendStateVars(context);
  } else {
    console.error(message.type, message.data);
  }

  if (message.data) {
    console.log("Received " + message.type + " with " + message.data);
  } else {
    console.log("Received " + message.type);
  }
});
