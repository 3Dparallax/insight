var glpProgramUsageCounter = (function () {

programUsageCounter = {};

programUsageCounter.enabled = false;
programUsageCounter.usages = {}; // program.__uuid : usage

programUsageCounter.toggle = function(enabled) {
	if (enabled) {
		this.enabled = true;
	} else {
		this.enabled = false;
	}
}

programUsageCounter.reset = function() {
  this.usages = {};
}

programUsageCounter.addUsage = function(program) {
  if (this.enabled) {
    if (this.usages[program.__uuid] != undefined) {
      this.usages[program.__uuid] += 1;
    } else {
      this.usages[program.__uuid] = 1;
    }
  }
}

return programUsageCounter;
}());