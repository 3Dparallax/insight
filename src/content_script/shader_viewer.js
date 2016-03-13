var glpShaderViewer = function (gl) {
  this.gl = gl;
  this.programs = {};
  this.programIDs = [];
}

glpShaderViewer.prototype.addProgram = function(program) {
  this.programIDs.push(program.__uuid);
  this.programs[program.__uuid] = program;
}

glpShaderViewer.prototype.getShaders = function(programId) {
  var program = this.programs[programId];
  return this.gl.getAttachedShaders(program)
}

glpShaderViewer.prototype.getShaderSources = function(programId) {
  var shaderSources = [];
  var shaders = this.getShaders(programId);
  if (shaders == null) {
    return [];
  }

  for (var i = 0; i < shaders.length; i++) {
    shaderSources.push(this.gl.getShaderSource(shaders[i]));
  }
  return shaderSources;
}
