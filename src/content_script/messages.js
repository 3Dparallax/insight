var glpMessages = function (gl) {
  this.gl = gl;
}

/**
 * Sends messages to the devtools panel
 * @param {WebGLContext} The WebGL Context the Message is sent from.
 * @param {String} Message type
 * @param {Dictionary} Message data
 */
glpMessages.prototype.sendMessage = function(type, data) {
  window.postMessage({
    "source": "content",
    "activeContext": this.gl.__uuid,
    "type": type,
    "data": data
  }, "*");
}

glpMessages.prototype.getCurrentProgramUsageCount = function() {
  this.sendMessage(
    messageType.GET_PROGRAM_USAGE_COUNT,
    {"programUsageCount": JSON.stringify(this.gl.glp().programUsageCounter.usages)}
  );
}

/**
 * Gets duplicate programs list from the time that enable is called
 * Sends duplicated program list to the front end
 */
glpMessages.prototype.getDuplicateProgramUsage = function() {
  this.sendMessage(
    messageType.GET_DUPLICATE_PROGRAM_USAGE,
    {"duplicateProgramUses": JSON.stringify(this.gl.glp().duplicateProgramDetection.duplicates)}
  );
}

glpMessages.prototype.getTextures = function() {
  this.gl.glp().textureViewer.getTextures();
}

glpMessages.prototype.getTexture = function(index) {
  this.gl.glp().textureViewer.getTexture(index);
}

/**
 * Sends call stack information to the panel
 * @param {String} Type of stack requested
 */
glpMessages.prototype.sendCallStack = function(type) {
  var callStack = this.gl.glp().callStack.getStack();
  this.sendMessage(
    messageType.CALL_STACK,
    {"functionNames": callStack}
  );
}

/**
 * Sends histogram of function calls to the panel
 */
glpMessages.prototype.sendFunctionHistogram = function(threshold) {
  var dataSeries = []
  var labels = []
  var histogram = this.gl.glp().histogram.histogram
  for (var functionName in histogram) {
      if (histogram[functionName] >= threshold) {
          labels.push(functionName)
          dataSeries.push(histogram[functionName])
      }
  }

  this.sendMessage(
    messageType.FUNCTION_HISTOGRAM,
    {"labels": labels, "values": dataSeries}
  );
}

/**
 * Toggles the status of the pixel inspector being enabled/disabled
 * @param {Bool} Enabled
 */
glpMessages.prototype.pixelInspectorToggle = function(enabled) {
  if (enabled) {
    this.gl.glp().pixelInspector.enable();
  } else {
    this.gl.glp().pixelInspector.disable();
  }
}

/**
 * Sends call state variable information to the panel
 */
glpMessages.prototype.sendStateVars = function(data) {
  if (data != "getStateVariables") {
      this.gl.glp().stateTracker.toggleBoolState(data);
  }
  var stateVars = JSON.stringify(this.gl.glp().stateTracker.getStates());
  this.sendMessage(
    messageType.STATE_VARS,
    {"stateVars": stateVars})
}
