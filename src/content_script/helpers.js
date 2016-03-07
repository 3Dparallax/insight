function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

_glEnums = {}
function getGLEnumName(gl, e) {
  if (Object.keys(_glEnums).length != 0) {
    return _glEnums[e];
  }

  for (var name in gl) {
    _glEnums[gl[name]] = name;
  }
  return _glEnums[e];
}

function getGLArgsString(gl, args) {
  if (!args) {
    return "";
  }

  var argsString = "";
  for (var i = 0; i < args.length; i++) {
    if (i != 0) {
      argsString += ", ";
    }
    var glEnumName = getGLEnumName(gl, args[i]);
    if (typeof glEnumName == "string") {
      argsString += glEnumName;
    } else {
      argsString += args[i];
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
