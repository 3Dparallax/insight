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

glp.messages = {}

/**
 * Receive messages from the devtools panel
 */
window.addEventListener('message', function(event) {
  var message = event.data;

  // Only accept messages that we know are ours
  if (typeof message !== 'object' || message === null || message.source != "panel") {
    return;
  }

  var context = glp.messages.getWebGLActiveContext();
  if (!context)
    return;

  if (message.type == messageType.PIXEL_INSPECTOR) {
    glp.messages.pixelInspectorToggle(message.data.enabled);
  } else if (message.type == messageType.CALL_STACK) {
    glp.messages.sendCallStack(context, message.data);
  } else if (message.type == messageType.FUNCTION_HISTOGRAM) {
    glp.messages.sendFunctionHistogram(message.data.threshold);
  } else if (message.type == messageType.BEGIN_PROGRAM_USAGE_COUNT) {
    context.glp.programUsageCounter.start();
  } else if (message.type == messageType.STOP_PROGRAM_USAGE_COUNT) {
    context.glp.programUsageCounter.stop();
  } else if (message.type == messageType.RESET_PROGRAM_USAGE_COUNT) {
    context.glp.programUsageCounter.reset();
  } else if (message.type == messageType.GET_PROGRAM_USAGE_COUNT) {
    glp.messages.getCurrentProgramUsageCount(context);
  } else if (message.type == messageType.TOGGLE_DUPLICATE_PROGRAM_USAGE) {
    context.glp.duplicateProgramDetection.toggle(message.data.enabled);
  } else if (message.type == messageType.GET_DUPLICATE_PROGRAM_USAGE) {
    glp.messages.getDuplicateProgramUsage(context);
  } else if (message.type == messageType.CONTEXTS) {
    glpSendMessage(messageType.CONTEXTS, {"contexts": glp.messages.getWebGLContexts()})
  } else if (message.type == messageType.TEXTURE) {
    glp.messages.getTexture(context, message.data.index);
  } else {
    console.log(message.data);
  }
});


/**
 * Returns the WebGL contexts available in the dom
 * @param {Array} WebGL Contexts
 */
glp.messages.getWebGLContexts = function() {
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

glp.messages.getWebGLContext = function(uuid) {
  var contexts = glp.messages.getWebGLContexts();
  for (var i = 0; i < contexts.length; i++) {
    if (contexts[i].__uuid == uuid) {
      return contexts[i];
    }
  }
  return null;
}

glp.messages.getWebGLActiveContext = function() {
  // TODO: Handle multiple contexts
  var contexts = glp.messages.getWebGLContexts();
  if (contexts == null || contexts[0] == null) {
        return;
    }

  return contexts[0];
}

glp.messages.getCurrentProgramUsageCount = function(context) {
  glpSendMessage(messageType.GET_PROGRAM_USAGE_COUNT,
      {"programUsageCount": JSON.stringify(
        context.glp.programUsageCounter.usages)})
}

/**
 * Gets duplicate programs list from the time that enable is called
 * Sends duplicated program list to the front end
 */
glp.messages.getDuplicateProgramUsage = function(context) {
  glpSendMessage(messageType.GET_DUPLICATE_PROGRAM_USAGE,
      {"duplicateProgramUses": JSON.stringify(
        context.glp.duplicateProgramDetection.duplicates)})
}

glp.messages.getTexture = function(context, index) {
  context.glpUpdateTextureList();
  context.glpGetTexture(index);
}

/**
 * Sends call stack information to the panel
 * @param {String} Type of stack requested
 */
glp.messages.sendCallStack = function(context, type) {
    var callStack = context.glp.callStack.getStack(type);
    glpSendMessage(messageType.CALL_STACK, {"functionNames": callStack})
}

/**
 * Sends histogram of function calls to the panel
 */
glp.messages.sendFunctionHistogram = function(threshold) {
    // TODO: Handle multiple contexts
    var contexts = glp.messages.getWebGLContexts();
    if (contexts == null || contexts[0] == null) {
        return;
    }
    var context = contexts[0];

    var dataSeries = []
    var labels = []
    var histogram = context.glp.histogram.histogram
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
glp.messages.pixelInspectorToggle = function(enabled) {
  var contexts = glp.messages.getWebGLContexts();
  if (contexts == null) {
    return;
  }

  for (var i = 0; i < contexts.length; i++) {
    var webGLContext = contexts[i];
    if (enabled) {
      webGLContext.glp.pixelInspector.enable(webGLContext);
    } else {
      webGLContext.glp.pixelInspector.disable(webGLContext);
    }
  }
}
