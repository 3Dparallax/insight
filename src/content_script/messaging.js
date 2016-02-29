/**
 * Instantiates messaging with the devtools panel
 */
function _glpInit() {
    window.postMessage({ type: "init" }, "*");
}
_glpInit();

/**
 * Sends messages to the devtools panel
 * @param {String} Message type
 * @param {Dictionary} Message data
 */
function glpSendMessage(type, data) {
    window.postMessage({ source:"content", type: type, data: data}, "*");
}

/**
 * Receive messages from the devtools panel
 */
window.addEventListener('message', function(event) {
  var message = event.data;

  // Only accept messages that we know are ours
  if (typeof message !== 'object' || message === null || message.source != "panel") {
    return;
  }

  if (message.type == messageType.PIXEL_INSPECTOR) {
    glpPixelInspectorToggle(message.data.enabled);
  } else if (message.type == messageType.CALL_STACK) {
    glpSendCallStack(message.data);
  } else if (message.type == messageType.FUNCTION_HISTOGRAM) {
    glpSendFunctionHistogram(message.data.threshold);
  } else if (message.type == messageType.BEGIN_PROGRAM_USAGE_COUNT) {
    glpBeginProgramUsageCount();
  } else if (message.type == messageType.STOP_PROGRAM_USAGE_COUNT) {
    glpStopProgramUsageCount();
  } else if (message.type == messageType.RESET_PROGRAM_USAGE_COUNT) {
    glpResetProgramUsageCount();
  } else if (message.type == messageType.GET_PROGRAM_USAGE_COUNT) {
    glpGetCurrentProgramUsageCount();
  } else if (message.type == messageType.TOGGLE_DUPLICATE_PROGRAM_USAGE) {
    glpToggleDuplicateProgramUsage(message.data.enabled);
  } else if (message.type == messageType.GET_DUPLICATE_PROGRAM_USAGE) {
    glpGetDuplicateProgramUsage();
  } else if (message.type == messageType.CONTEXTS) {
    glpSendMessage(messageType.CONTEXTS, {"contexts": glpGetWebGLContexts()})
  } else if (message.type == messageType.TEXTURE) {
    glpGetTexture(message.data.index);
  } else {
    console.log(message.data);
  }
});


/**
 * Returns the WebGL contexts available in the dom
 * @param {Array} WebGL Contexts
 */
function glpGetWebGLContexts() {
  var canvases = document.getElementsByTagName("canvas");
  var contexts = [];
  for (var i = 0; i < canvases.length; i++) {
    var canvas = canvases[i];
    var webGLContext = canvas.getContext("webgl");
    if (webGLContext == null) {
      continue;
    } else if (webGLContext.__uuid == null) {
      webGLContext.__uuid = guid();
    }
    contexts.push(webGLContext);
  }
  return contexts;
}

function glpGetWebGLContext(uuid) {
  var contexts = glpGetWebGLContexts();
  for (var i = 0; i < contexts.length; i++) {
    if (contexts[i].__uuid == uuid) {
      return contexts[i];
    }
  }
  return null;
}

function glpGetWebGLActiveContext() {
  // TODO: Handle multiple contexts
  var contexts = glpGetWebGLContexts();
  if (contexts == null || contexts[0] == null) {
        return;
    }

  return contexts[0];
}

// TODO (Dian) rename this so it doesn't collide with webglContext.programUsageCount
function glpBeginProgramUsageCount() {
  var context = glpGetWebGLActiveContext();

  if (!context)
    return;

  context.glp.programUsageCounter.start();
}

function glpStopProgramUsageCount() {
  var context = glpGetWebGLActiveContext();

  if (!context)
    return;

  context.glp.programUsageCounter.stop();
}

function glpResetProgramUsageCount() {
  var context = glpGetWebGLActiveContext();

  if (!context)
    return;

  context.glp.programUsageCounter.reset();
}

function glpGetCurrentProgramUsageCount() {
  var context = glpGetWebGLActiveContext();

  if (!context)
    return;

  context.glp.programUsageCounter.sendUsages();
}

function glpToggleDuplicateProgramUsage(enabled) {
  var context = glpGetWebGLActiveContext();

  if (!context)
    return;

  if (enabled) {
    context.glp.duplicateProgramDetection.enable();
  } else {
    context.glp.duplicateProgramDetection.disable();
  }
}

function glpGetDuplicateProgramUsage() {
  var context = glpGetWebGLActiveContext();

  if (!context)
    return;

  context.glp.duplicateProgramDetection.sendDuplicates();
}

function glpGetTexture(index) {
  var context = glpGetWebGLActiveContext();

  if (!context)
    return;

  context.glpUpdateTextureList();
  context.glpGetTexture(index);
}

/**
 * Sends call stack information to the panel
 * @param {String} Type of stack requested
 */
function glpSendCallStack(type) {
    var context = glpGetWebGLActiveContext();

    if (!context)
      return;

    var callStack;
    if (type == "mostRecentCalls") {
        callStack = context.glpMostRecentCalls;
    } else {
        callStack = context.glpCallsSinceDraw;
    }

    glpSendMessage(messageType.CALL_STACK, {"functionNames": callStack})
}

/**
 * Sends histogram of function calls to the panel
 */
function glpSendFunctionHistogram(threshold) {
    // TODO: Handle multiple contexts
    var contexts = glpGetWebGLContexts();
    if (contexts == null || contexts[0] == null) {
        return;
    }
    var context = contexts[0];

    var dataSeries = []
    var labels = []
    var histogram = context.glpFunctionHistogram
    for (var functionName in histogram) {
        if (histogram[functionName] >= threshold) {
            labels.push(functionName)
            dataSeries.push(histogram[functionName])
        }
    }
    glpSendMessage(messageType.FUNCTION_HISTOGRAM, {"labels": labels, "values": dataSeries})
}

/**
 * Toggles the status of the pixel inspector being enabled/disabled
 * @param {Bool} Enabled
 */
function glpPixelInspectorToggle(enabled) {
  var contexts = glpGetWebGLContexts();
  if (contexts == null) {
    return;
  }

  for (var i = 0; i < contexts.length; i++) {
    var webGLContext = contexts[i];
    if (enabled) {
      webGLContext.glpEnablePixelInspector();
    } else {
      webGLContext.glpDisablePixelInspector();
    }
  }
}
