var glpDuplicateProgramDetection = function (gl) {
  this.gl = gl;

  this.enabled = false;
  this.duplicates = []; // list of { repeatedProgram : lineNumber }
  this.duplicatePrograms = {};
}

/**
 * Toggles duplicate program usage detection
 */
glpDuplicateProgramDetection.prototype.toggle = function(enable) {
  this.enabled = enable;
}

glpDuplicateProgramDetection.prototype.reset = function() {
  this.duplicates = []
  this.duplicatePrograms = {};
}

glpDuplicateProgramDetection.prototype.useProgramCalled = function(program) {
  if (!this.enabled) {
    return
  }
  var currentProgram = this.gl.getParameter(this.gl.CURRENT_PROGRAM);

  if(currentProgram != undefined &&
     currentProgram.__uuid != undefined &&
     currentProgram.__uuid == program.__uuid) {
    /*
     * callStack gets the current call stack information up to this point
     */
    var callStack = this.gl.glp().callStack.helper.getStack();
    var userStack = this.gl.glp().callStack.helper.getFirstUserStack(callStack);
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

    if (this.duplicatePrograms[programObj] == undefined) {
      this.duplicates.push(programObj);
      this.duplicatePrograms[programObj] = true;
    }
  }
}
