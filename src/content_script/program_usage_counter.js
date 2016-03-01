glp.programUsageCounter = {};

glp.programUsageCounter.enabled = false;
glp.programUsageCounter.usages = {}; // program.__uuid : usage

glp.programUsageCounter.start = function() {
  this.enabled = true;
}

glp.programUsageCounter.reset = function() {
  this.usages = {};
}

glp.programUsageCounter.stop = function() {
  this.enabled = false;
}

glp.programUsageCounter.addUsage = function(program) {
  if (this.enabled) {
    if (this.usages[program.__uuid] != undefined) {
      this.usages[program.__uuid] += 1;
    } else {
      this.usages[program.__uuid] = 1;
    }
  }
}