var glpProgramUsageCounter = function (gl) {
  this.gl = gl;

  this.enabled = false;
  this.usages = {}; // program.__uuid : usage
  this.idToProgram = {} //program.__uuid : program
}

glpProgramUsageCounter.prototype.toggle = function(enabled) {
  if (enabled) {
    this.enabled = true;
  } else {
    this.enabled = false;
  }
}

glpProgramUsageCounter.prototype.reset = function() {
  this.usages = {};
}

glpProgramUsageCounter.prototype.addUsage = function(program) {
  if (this.enabled) {
    if (this.usages[program.__uuid] != undefined) {
      this.usages[program.__uuid] += 1;
    } else {
      this.usages[program.__uuid] = 1;
      this.idToProgram[program.__uuid] = program;
    }
  }
}

glpProgramUsageCounter.prototype.getProgram = function(prgoramUUid) {
  return this.idToProgram[prgoramUUid];
}
