
// Program usage count variables
WebGLRenderingContext.prototype.glpProgramUsageCountProgramUsages = {}; // program.__uuid : usage
WebGLRenderingContext.prototype.glpProgramUsageCounterEnabled = false;

WebGLRenderingContext.prototype.glpBeginProgramUsageCount = function() {
  this.glpProgramUsageCounterEnabled = true;
}

WebGLRenderingContext.prototype.glpResetProgramUsageCount = function() {
  this.glpProgramUsageCountProgramUsages = {};
}

WebGLRenderingContext.prototype.glpStopProgramUsageCount = function() {
  this.glpProgramUsageCounterEnabled = false;
}


// Duplicate program detection variables
WebGLRenderingContext.prototype.glpProgramDuplicateDetectionEnabled = false;
WebGLRenderingContext.prototype.glpProgramDuplicatesList = []; // list of { repeatedProgram : lineNumber }

/**
 * Enables duplicate program usage detection
 */
WebGLRenderingContext.prototype.glpEnableDuplicateProgramUsage = function() {
  this.glpProgramDuplicateDetectionEnabled = true;
}

/**
 * Disables duplicate program usage detection
 */
WebGLRenderingContext.prototype.glpDisableDuplicateProgramUsage = function() {
  this.glpProgramDuplicateDetectionEnabled = false;
  this.glpProgramDuplicatesList.length = 0;
}

/**
 * Gets duplicate programs list from the time that enable is called
 * Sends duplicated program list to the front end
 */
WebGLRenderingContext.prototype.glpGetDuplicateProgramUsage = function() {
  glpSendMessage("getDuplicateProgramUsage", {"duplicateProgramUses": JSON.stringify(this.glpProgramDuplicatesList)})
}

/**
 * Gets the current program usage count since the last glpResetProgramUsageCount call
 * @return a map from WebGLProgram to count
 **/
WebGLRenderingContext.prototype.glpGetCurrentProgramUsageCount = function() {
  glpSendMessage("getProgramUsageCount", {"programUsageCount": JSON.stringify(this.glpProgramUsageCountProgramUsages)})
}
