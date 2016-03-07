var glpMessages = (function () {

messages = {}

/**
 * Sends messages to the devtools panel
 * @param {WebGLContext} The WebGL Context the Message is sent from.
 * @param {String} Message type
 * @param {Dictionary} Message data
 */
messages.sendMessage = function(context, type, data) {
  window.postMessage({
    "source": "content",
    "activeContext": context.__uuid,
    "type": type,
    "data": data
  }, "*");
}

messages.getCurrentProgramUsageCount = function(context) {
  this.sendMessage(
    context,
    messageType.GET_PROGRAM_USAGE_COUNT,
    {"programUsageCount": JSON.stringify(context.glp.programUsageCounter.usages)}
  );
}

/**
 * Gets duplicate programs list from the time that enable is called
 * Sends duplicated program list to the front end
 */
messages.getDuplicateProgramUsage = function(context) {
  this.sendMessage(
    context,
    messageType.GET_DUPLICATE_PROGRAM_USAGE,
    {"duplicateProgramUses": JSON.stringify(context.glp.duplicateProgramDetection.duplicates)}
  );
}

messages.getTextures = function(context) {
  context.glp.textureViewer.getTextures(context);
}

messages.getTexture = function(context, index) {
  context.glp.textureViewer.getTexture(context, index);
}

/**
 * Sends call stack information to the panel
 * @param {String} Type of stack requested
 */
messages.sendCallStack = function(context, type) {
  var callStack = context.glp.callStack.getStack();
  this.sendMessage(
    context,
    messageType.CALL_STACK,
    {"functionNames": callStack}
  );
}

/**
 * Sends histogram of function calls to the panel
 */
messages.sendFunctionHistogram = function(context, threshold) {
  var dataSeries = []
  var labels = []
  var histogram = context.glp.histogram.histogram
  for (var functionName in histogram) {
      if (histogram[functionName] >= threshold) {
          labels.push(functionName)
          dataSeries.push(histogram[functionName])
      }
  }

  this.sendMessage(
    context,
    messageType.FUNCTION_HISTOGRAM,
    {"labels": labels, "values": dataSeries}
  );
}

/**
 * Toggles the status of the pixel inspector being enabled/disabled
 * @param {Bool} Enabled
 */
messages.pixelInspectorToggle = function(context, enabled) {
  if (enabled) {
    context.glp.pixelInspector.enable(context);
  } else {
    context.glp.pixelInspector.disable(context);
  }
}

/**
 * Sends call state variable information to the panel
 */
messages.sendStateVars = function(context) {
  var stateVars = JSON.stringify(context.glp.stateTracker.getStates(context));
  this.sendMessage(
    context,
    messageType.STATE_VARS,
    {"stateVars": stateVars})
}

return messages;
}());
