var glpCallStack = (function (gl) {

callStack = {}
callStack.helper = {}

callStack.enabled = false;
callStack.maxSize = 100;
callStack.mostRecentCalls = [];
callStack.callsSinceDraw = [];

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
callStack.helper.getStack = function() {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack){ return stack; };
    var err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
}

/**
 * Returns "FileName:LineNumber" of requested call site
 * @param {CallSite} call site object
 */
callStack.helper.getCallSiteDetails = function(stack) {
  if (!stack) {
    return "";
  }
  return stack.getFileName() + ":" + stack.getLineNumber();
}

/**
 * Returns the first call stack trace from the user
 */
callStack.helper.getFirstUserStack = function() {
  fullStack = this.getStack()
  for(var i = 1; i < fullStack.length; i++) {
    if (!~fullStack[i].getFileName().indexOf("src/content_script")) {
      return fullStack[i];
    }
  }

  return null;
}

callStack.toggle = function(enabled) {
  this.enabled = enabled;
}

/**
 * Returns the call stack of the requested type
 * CallSite details (filename and line number) are processed
 * only on request because it's too expensive at storage time
 * @param {String} "mostRecentCalls" or "callsSinceDraw"
 */
callStack.getStack = function() {
  var formatted = {};
  formatted.mostRecentCalls = this.mostRecentCalls;
  formatted.callsSinceDraw = this.callsSinceDraw;

  for (var i = 0; i < formatted.mostRecentCalls.length; i++) {
    if (!formatted.mostRecentCalls[i].formatted) {
      formatted.mostRecentCalls[i].name = formatted.mostRecentCalls[i].name + " (" + this.helper.getCallSiteDetails(formatted.mostRecentCalls[i].callSite) + ")";
      formatted.mostRecentCalls[i].args = JSON.stringify(formatted.mostRecentCalls[i].args);
      formatted.mostRecentCalls[i].formatted = true;
    }
  }

  for (var i = 0; i < formatted.callsSinceDraw.length; i++) {
    if (!formatted.callsSinceDraw[i].formatted) {
      formatted.callsSinceDraw[i].name = formatted.callsSinceDraw[i].name + " (" + this.helper.getCallSiteDetails(formatted.callsSinceDraw[i].callSite) + ")";
      formatted.callsSinceDraw[i].args = JSON.stringify(formatted.callsSinceDraw[i].args);
      formatted.callsSinceDraw[i].formatted = true;
    }
  }
  return formatted;
}

/**
 * Formats a date object to HH:MM:SS.mmm
 * @param {Date} d
 */
callStack.helper.dateTimeFormat = function(d) {
  return d.getHours() + ":"
      + ('00'+d.getMinutes()).substring(d.getMinutes().toString().length) + ":"
      + ('00'+d.getSeconds()).substring(d.getSeconds().toString().length) + "."
      + ('000'+d.getMilliseconds()).substring(d.getMilliseconds().toString().length);
}

/**
 * Adds a new function to the call stack
 * @param {String} Name of function
 * @param {Dictionary} arguments used by the function
 */
callStack.push = function(name, args) {
  if (!this.enabled) {
    return;
  }
  var d = new Date();
  var timeString = this.helper.dateTimeFormat(d);
  var stack = this.helper.getFirstUserStack();
  var callDetails = {
    name: name,
    args: args,
    time: window.performance.now(),
    executionTime: timeString,
    callSite: stack,
    formatted: false,
  };
  //JSON.stringify(args)
  if (this.mostRecentCalls.length > this.maxSize) {
    this.mostRecentCalls.shift();
  }
  this.mostRecentCalls.push(callDetails);

  var lastFunction = this.callsSinceDraw[this.callsSinceDraw.length - 1];
  if (lastFunction &&
      (lastFunction.name == "drawElements" || lastFunction.name == "drawArrays")) {
    this.callsSinceDraw = [];
  }
  this.callsSinceDraw.push(callDetails);
}

/**
 * Used post function call to update time elapsed
 * @param {String} Name of function
 * @param {CallSite} Obtained from getFirstUserStack
 */
callStack.update = function(name) {
  if (!this.enabled) {
    return;
  }
  var endTime = window.performance.now();
  if (this.callsSinceDraw.length > 0) {
    var i = this.callsSinceDraw.length - 1
    // Most of the time we just need to update the last element on the stack,
    // but there are rare cases of nesting where we have to trace backwards
    while (i > 0 && this.callsSinceDraw[i].name != name) {
      i--;
    }
    // "| 0" truncates to an int.  "+ 0.5" is for rounding
    this.callsSinceDraw[i].time = (((endTime - this.callsSinceDraw[i].time) * 1000) + 0.5) | 0
  }
}

return callStack;
});
