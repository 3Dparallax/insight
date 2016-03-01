glp.duplicateProgramDetection = {};
glp.duplicateProgramDetection.enabled = false;
glp.duplicateProgramDetection.duplicates = []; // list of { repeatedProgram : lineNumber }

/**
 * Toggles duplicate program usage detection
 */
glp.duplicateProgramDetection.toggle = function(enable) {
    if (enable) {
      this.enable();
    } else {
      this.disable();
    }
}

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
  if (!this.enabled) {
    return
  }
  var currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
  if( currentProgram != undefined &&
      currentProgram.__uuid != undefined &&
      currentProgram.__uuid == program.__uuid ) {
    /*
     * callStack gets the current call stack information up to this point
     */
    var callStack = glp.callStack.helper.getStack();
    var userStack = glp.callStack.helper.getFirstUserStack(callStack);
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
