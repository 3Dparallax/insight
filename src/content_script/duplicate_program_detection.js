glp.duplicateProgramDetection = {};
glp.duplicateProgramDetection.enabled = false;
glp.duplicateProgramDetection.duplicates = []; // list of { repeatedProgram : lineNumber }
glp.duplicateProgramDetection.duplicatePrograms = {};

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

glp.duplicateProgramDetection.reset = function() {
  glp.duplicateProgramDetection.duplicates = []
  glp.duplicateProgramDetection.duplicatePrograms = {};
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

    var programObj = {"programId" : program.__uuid,
                      "lineNumber" : lineNumber,
                      "functionName" : functionName,
                      "fileName" : fileName};

    if(this.duplicatePrograms[programObj] == undefined) {
      this.duplicates.push(programObj);
      this.duplicatePrograms[programObj] = true;
    }
  }
}
