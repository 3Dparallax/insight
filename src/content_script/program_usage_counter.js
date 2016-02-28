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

glp.programUsageCounter.sendUsages = function() {
  glpSendMessage("getProgramUsageCount", {"programUsageCount": JSON.stringify(this.usages)})
}
