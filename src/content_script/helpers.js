function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function getGLEnumName(gl, glEnum) {
  for (var name in gl) {
    if (gl[name] == glEnum) {
      return name;
    }
  }
  return glEnum;
}

function getGLArgsString(gl, args) {
  if (!args) {
    return "";
  }

  var argsList = Array.prototype.slice.call(args);
  var argsString = "";
  for (var i = 0; i < argsList.length; i++) {
    if (i != 0) {
      argsString += ", ";
    }
    var glEnumName = getGLEnumName(gl, argsList[i]);
    if (typeof glEnumName == "string") {
      argsString += glEnumName;
    } else {
      argsString += argsList[i];
    }
  }
  return argsString;
}

function getGLArgsList(gl, calls) {
  var argsList = [];
  for (var i = 0; i < calls.length; i++) {
    argsList.push(getGLArgsString(gl, calls[i]));
  }
  return argsList;
}
