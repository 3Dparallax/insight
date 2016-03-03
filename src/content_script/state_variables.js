glp.stateTracker = {}

/*
 * Boolean states affected by enable()/disable()
 * BLEND
 * CULL_FACE
 * DEPTH_TEST
 * DITHER
 * POLYGON_OFFSET_FILL
 * SAMPLE_ALPHA_TO_COVERAGE
 * SAMPLE_COVERAGE
 * SCISSOR_TEST
 * STENCIL_TEST
 */

glp.stateTracker.getStates = function(gl) {
  if (!gl) {
    return {};
  }
  return {
    blend: gl.isEnabled(gl.BLEND),
    cullFace: gl.isEnabled(gl.CULL_FACE),
    depthTest: gl.isEnabled(gl.DEPTH_TEST),
    dither: gl.isEnabled(gl.DITHER),
    polygonOffsetFill: gl.isEnabled(gl.POLYGON_OFFSET_FILL),
    sampleAlphaToCoverage: gl.isEnabled(gl.SAMPLE_ALPHA_TO_COVERAGE),
    sampleCoverage: gl.isEnabled(gl.SAMPLE_COVERAGE),
    scissorTest: gl.isEnabled(gl.SCISSOR_TEST),
    stencilTest: gl.isEnabled(gl.STENCIL_TEST),
  }
}
