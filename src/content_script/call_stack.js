glp.callStack = {}
glp.callStack.helper = {}

glp.callStack.enabled = true;
glp.callStack.maxSize = 100;
glp.callStack.mostRecentCalls = [];
glp.callStack.callsSinceDraw = [];

glp.histogram = {};
glp.histogram.enabled = true;
glp.histogram.histogram = {};
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
glp.callStack.helper.getStack = function() {
    var orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack){ return stack; };
    var err = new Error;
    // console.log(arguments.callee.caller);
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
}

/**
 * Returns "FileName:LineNumber" of requested call site
 * @param {CallSite} call site object
 */
glp.callStack.helper.getCallSiteDetails = function(stack) {
  return stack.getFileName() + ":" + stack.getLineNumber();
}

/**
 * Returns the first call stack trace from the user
 */
glp.callStack.helper.getFirstUserStack = function() {
  fullStack = this.getStack()
  for(var i = 1; i < fullStack.length; i++) {
    if (!~fullStack[i].getFileName().indexOf("src/content_script")) {
      return fullStack[i];
    }
  }

  return null;
}


/**
 * Returns the call stack of the requested type
 * CallSite details (filename and line number) are processed
 * only on request because it's too expensive at storage time
 * @param {String} "mostRecentCalls" or "callsSinceDraw"
 */
glp.callStack.getStack = function(type) {
  var formatted = []
  if (type == "mostRecentCalls") {
      formatted = this.mostRecentCalls;
  } else {
      formatted = this.callsSinceDraw;
  }
  for (var i = 0; i < formatted.length; i++) {
    formatted[i][0] = formatted[i][0] + " (" + this.helper.getCallSiteDetails(formatted[i][4]) + ")";
    formatted[i].pop();
  }
  return formatted;
}

/**
 * Formats a date object to HH:MM:SS.mmm
 * @param {Date} d
 */
glp.callStack.helper.dateTimeFormat = function(d) {
  return d.getHours() + ":"
      + ('00'+d.getMinutes()).substring(d.getMinutes().toString().length) + ":"
      + ('00'+d.getSeconds()).substring(d.getSeconds().toString().length) + "."
      + ('000'+d.getMilliseconds()).substring(d.getMilliseconds().toString().length);
}

/**
 * Adds a new function to the call stack
 * @param {String} Name of function
 * @param {Dictionary} arguments used by the function
 * @param {CallSite} Obtained from getFirstUserStack
 */
glp.callStack.push = function(name, args, stack) {
  var d = new Date();
  var timeString = this.helper.dateTimeFormat(d);
    var callDetails = [name, JSON.stringify(args), window.performance.now(), timeString, stack];
    //JSON.stringify(args)
    if (this.mostRecentCalls.length > this.maxSize) {
      this.mostRecentCalls.shift();
    }
    this.mostRecentCalls.push(callDetails);

    var lastFunction = this.callsSinceDraw[this.callsSinceDraw.length - 1];
    if (lastFunction &&
        (lastFunction[0] == "drawElements" || lastFunction[0] == "drawArrays")) {
      this.callsSinceDraw = [];
    }
    this.callsSinceDraw.push(callDetails);
}

/**
 * Used post function call to update time elapsed
 * @param {String} Name of function
 * @param {CallSite} Obtained from getFirstUserStack
 */
glp.callStack.update = function(name) {
  var endTime = window.performance.now();
  if (this.callsSinceDraw.length > 0) {
    var i = this.callsSinceDraw.length - 1
    // Most of the time we just need to update the last element on the stack,
    // but there are rare cases of nesting where we have to trace backwards
    while (i > 0 && this.callsSinceDraw[i][0] != name) {
      i--;
    }
    // "| 0" truncates to an int.  "+ 0.5" is for rounding
    this.callsSinceDraw[i][2] = (((endTime - this.callsSinceDraw[i][2]) * 1000) + 0.5) | 0
  }
}

/**
 * Adds a data point to the function histogram
 * @param {String} Name of function
 */
glp.histogram.add = function(name) {
  if (!this.histogram[name]) {
    this.histogram[name] = 1;
  } else {
    this.histogram[name] += 1;
  }
}