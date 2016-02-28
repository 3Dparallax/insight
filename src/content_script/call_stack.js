WebGLRenderingContext.prototype.glpCallstackEnabled = true;
WebGLRenderingContext.prototype.glpCallstackMaxSize = 100;
WebGLRenderingContext.prototype.glpFunctionHistogramEnabled = true;
WebGLRenderingContext.prototype.glpMostRecentCalls = [];
WebGLRenderingContext.prototype.glpCallsSinceDraw = [];

/*
 * Determines which file and line number called a certain function
 * Other things we can see other than line number include but are not limited to:
 * getThis, getTypeName, getFunction, getFunctionName, getMethodName, getFileName, getLineNumber,
 * getColumnNumber, getEvalOrigin, isToplevel, isEval, isNative, isConstructor
 *
 * To see more details, go to
 * http://stackoverflow.com/questions/11386492/accessing-line-number-in-v8-javascript-chrome-node-js
 * https://github.com/v8/v8/wiki/Stack%20Trace%20API
*/
function glpGetStack() {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack){ return stack; };
    var err = new Error;
    // console.log(arguments.callee.caller);
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
}

// Uses the stack and gets the first call's line number
function glpGetLineNumber() {
  var stack = glpGetStack();
  return stack[stack.length-1].getLineNumber();
}

// input: given a full stack trace down to glp
// output: gives the first stack that's not
// bug: if we refactor our code, we need to change this. not sure
// how to fix until we have a consistent file naming scheme
function glpGetFirstUserStack(fullStack) {
  // The first item in the full stack is this file
  var glpStackFileName = fullStack[0].getFileName();

  for(var i = 1; i < fullStack.length; i++) {
    if (fullStack[i].getFileName() != glpStackFileName)
      return fullStack[i];
  }

  return null;
}
