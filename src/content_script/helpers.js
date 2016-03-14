var glpHelpers = (function () {

helpers = {};

helpers.guid = function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

_glEnums = {}
helpers.getGLEnumName = function(gl, e) {
  if (Object.keys(_glEnums).length != 0) {
    return _glEnums[e];
  }

  for (var name in gl) {
    _glEnums[gl[name]] = name;
  }
  _glEnums[0] = 0;
  return _glEnums[e];
}

helpers.getGLArgsString = function(gl, args) {
  if (!args) {
    return "";
  }

  var argsString = "";
  for (var i = 0; i < args.length; i++) {
    if (i != 0) {
      argsString += ", ";
    }
    var glEnumName = this.getGLEnumName(gl, args[i]);
    if (typeof glEnumName == "string") {
      argsString += glEnumName;
    } else {
      argsString += args[i];
    }
  }
  return argsString;
}

helpers.getGLArgsList = function(gl, calls) {
  if (calls) {
    var argsList = [];
    for (var i = 0; i < calls.length; i++) {
      argsList.push(this.getGLArgsString(gl, calls[i]));
    }
    return argsList;
  }
  return null;
}

helpers.getTextureSize = function(texture) {
    var size = {};
    size.width = 16;
    size.height = 16;

    if (texture.texImage2DCalls) {
        for (var i = 0; i < texture.texImage2DCalls.length; i++) {
            var args = texture.texImage2DCalls[i];
            if (args[1] == 0) {
                if (args.length == 9) {
                    size.width = Math.max(args[3], size.width);
                    size.height = Math.max(args[4], size.height);
                } else if (args[5]) {
                    size.width = Math.max(args[5].width, size.width);
                    size.height = Math.max(args[5].height, size.height);
                }
            }
        }
    }

    return size;
}

return helpers;
}());
