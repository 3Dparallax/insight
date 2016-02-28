glp.duplicateProgramDetection = {};
glp.duplicateProgramDetection.enabled = false;
glp.duplicateProgramDetection.duplicates = []; // list of { repeatedProgram : lineNumber }

/**
 * Enables duplicate program usage detection
 */
glp.duplicateProgramDetection.enable = function() {
  this.enabled = true;
}

/**
 * Disables duplicate program usage detection
 */
glp.duplicateProgramDetection.disable = function() {
  this.enabled = false;
  this.duplicates.length = 0;
}

/**
 * Gets duplicate programs list from the time that enable is called
 * Sends duplicated program list to the front end
 */
glp.duplicateProgramDetection.sendDuplicates = function() {
  glpSendMessage("getDuplicateProgramUsage", {"duplicateProgramUses": JSON.stringify(this.duplicates)})
}
