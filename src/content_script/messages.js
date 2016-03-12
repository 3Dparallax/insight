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
 */
glpMessages.prototype.sendCallStack = function() {
  var callStack = this.gl.glp().callStack.getStack();
  this.sendMessage(
    messageType.CALL_STACK,
    {"functionNames": callStack}
  );
}

/**
 * Sends call stack information for recent draw call to the panel
 */
glpMessages.prototype.sendCallStackDraw = function() {
  var callStack = this.gl.glp().callStack.getStackDraw();
  this.sendMessage(
    messageType.CALL_STACK_DRAW,
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
 * Toggles the status of the mipmapViewer being enabled/disabled
 * @param {Bool} Enabled
 * @param {UUID} uuid of the texture
 */
glpMessages.prototype.mipmapViewerToggle = function(enabled, texture) {
  if (enabled) {
    this.gl.glp().mipmapViewer.enable(texture);
  } else {
    this.gl.glp().mipmapViewer.disable();
  }
}

glpMessages.prototype.mipmapGetTextures = function() {
  this.sendMessage(
    messageType.MIPMAP_TEXTURES,
    {
      "textures": JSON.stringify(this.gl.glp().mipmapViewer.getTextureList())
    })
}
/**
 * Toggles the status of the depth inspector being enabled/disabled
 * @param {Bool} Enabled
 * @param {Object} {near: float, far: float}
 */
glpMessages.prototype.depthInspectorToggle = function(enabled, range) {
  if (enabled) {
    this.gl.glp().depthInspector.enable(range.near, range.far);
  } else {
    this.gl.glp().depthInspector.disable();
  }
}

/**
 * Sends call state variable information to the panel
 */
glpMessages.prototype.sendStateVars = function(data) {
  if (data != "getStateVariables") {
      if (data.type == "bool") {
        this.gl.glp().stateTracker.toggleBoolState(data);
      } else if (data.type == "num") {
        this.gl.glp().stateTracker.changeNumberState(data);
      } else if (data.type == "enum") {
        this.gl.glp().stateTracker.changeEnumState(data);
      }
  }
  var stateVars = JSON.stringify(this.gl.glp().stateTracker.getStates());
  var enumOptions = JSON.stringify(this.gl.glp().stateTracker.getEnumOptions());
  this.sendMessage(
    messageType.STATE_VARS,
    {
      "stateVars": stateVars,
      "enumOptions": enumOptions
    })
}

glpMessages.prototype.getShaders = function() {
  shaders = []
  var programs = this.gl.glp().shaderViewer.programIDs;
  for (var i=0; i<programs.length; i++) {
    var sources = this.gl.glp().shaderViewer.getShaderSources(programs[i]);
    if (sources.length == 0) {
      continue;
    }

    shaders.push({
      "programId" : programs[i],
      "shaderSources" : sources
    });
  }

  this.sendMessage(
    messageType.SHADERS,
    JSON.stringify(shaders)
  );
}
