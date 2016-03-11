var glpShaderViewer = function (gl) {
  this.gl = gl;
  this.enabled = false;
}

glpShaderViewer.prototype.toggle = function(enabled) {
  if (enabled) {
    this.enabled = true;
  } else {
    this.enabled = false;
  }
}

glpShaderViewer.prototype.getShaders = function(programId) {
  if (this.enabled) {
    var program = this.gl.glp().programUsageCounter.getProgram(programId);
    return this.gl.getAttachedShaders(program)
  }
}

glpShaderViewer.prototype.getShaderSources = function(programId) {
  if (!this.enabled) {
    return [];
  }
  var shaderSources = [];
  var shaders = this.getShaders(programId);
  for (var i = 0; i < shaders.length; i++) {
    shaderSources.push(this.gl.getShaderSource(shaders[i]));
  }
  return shaderSources;
}
