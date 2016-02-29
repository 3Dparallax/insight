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

glp.callStack.helper.getAllDetailsOfLine = function(stacks) {
  info = []
  for (var i = 0; i < stacks.length; i++) {
    info.push({
      lineNumber: stacks[i].getLineNumber(),
      functionName: stacks[i].getFunctionName(),
      funktion: stacks[i].getFunction(),
      fileName: stacks[i].getFileName(),
    })
  }
  return info;
}

// Uses the stack and gets the first call's line number
glp.callStack.helper.getLineNumber = function() {
  var stack = this.getFirstUserStack(this.getStack());
  return stack.getLineNumber();
}

// input: given a full stack trace down to glp
// output: gives the first stack that's not
glp.callStack.helper.getFirstUserStack = function(fullStack) {
  for(var i = 1; i < fullStack.length; i++) {
    if (!~fullStack[i].getFileName().indexOf("src/content_script")) {
      return fullStack[i];
    }
  }

  return null;
}

glp.callStack.helper.getUserStacks = function(fullStack) {
  for(var i = 1; i < fullStack.length; i++) {
    if (!~fullStack[i].getFileName().indexOf("src/content_script")) {
      break;
    }
  }

  return fullStack.slice(i-1, fullStack.length);
}


glp.callStack.getStack = function(type) {
  console.log(this.helper.getStack());
  if (type == "mostRecentCalls") {
      return this.mostRecentCalls;
  } else {
      return this.callsSinceDraw;
  }
}

glp.callStack.push = function(name, args, stack) {
  var d = new Date();
  var timeString = d.getHours() + ":"
      + ('00'+d.getMinutes()).substring(d.getMinutes().toString().length) + ":"
      + ('00'+d.getSeconds()).substring(d.getSeconds().toString().length) + "."
      + ('000'+d.getMilliseconds()).substring(d.getMilliseconds().toString().length);
    var callDetails = [name, JSON.stringify(this.helper.getAllDetailsOfLine(stack)), window.performance.now(), timeString];
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

glp.histogram.add = function(name) {
  if (!this.histogram[name]) {
    this.histogram[name] = 1;
  } else {
    this.histogram[name] += 1;
  }
}