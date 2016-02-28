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

glp.duplicateProgramDetection.useProgramCalled = function(gl, program) {
  var currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
  if( currentProgram != undefined &&
      currentProgram.__uuid != undefined &&
      currentProgram.__uuid == program.__uuid ) {
    /*
     * callStack gets the current call stack information up to this point
     */
    var callStack = glpGetStack();
    var userStack = glpGetFirstUserStack(callStack);
    var lineNumber = ""
    var functionName = "";
    if (userStack != null) {
      lineNumber = userStack.getLineNumber();
      // Sometimes the function name can be undefined if
      // it's called from a global scope or from an object
      if (userStack.getFunctionName() != undefined) {
        functionName = userStack.getFunctionName()
      }

      fileName = userStack.getFileName();
    }
    this.duplicates.push({"programId" : program.__uuid,
                          "lineNumber" : lineNumber,
                          "functionName" : functionName,
                          "fileName" : fileName})
  }
}

/**
 * Gets duplicate programs list from the time that enable is called
 * Sends duplicated program list to the front end
 */
glp.duplicateProgramDetection.sendDuplicates = function() {
  glpSendMessage("getDuplicateProgramUsage", {"duplicateProgramUses": JSON.stringify(this.duplicates)})
}
