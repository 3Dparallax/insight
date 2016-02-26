/**
 * Switches the current program to the pixel inspector program
 */
WebGLRenderingContext.prototype.glpSwitchToPixelInspectorProgram = function() {
  var oldProgram = this.getParameter(this.CURRENT_PROGRAM);
  var program = this.glpGetPixelInspectorProgram(oldProgram);
  this.glpPixelInspectorOriginalPrograms[program.__uuid] = oldProgram;
  this.glpSwitchToProgram(oldProgram, program);
}

/**
 * Switches the current program and copies over location and attribute data
 */
WebGLRenderingContext.prototype.glpSwitchToProgram = function(oldProgram, program) {
  this.useProgram(program);
  this.glpCopyUniforms(oldProgram, program);
  this.glpCopyAttributes(oldProgram, program);
  // TODO: Swap attributes!
}

/**
 * Returns the pixel inspector fragment shader
 * @return {WebGLShader} Pixel Inspector Fragment Shader
 */
WebGLRenderingContext.prototype.glpGetPixelInspectFragShader = function() {
    var pixelInspectFragShader = this.createShader(this.FRAGMENT_SHADER);
    var shaderStr = 'precision mediump float;' +
        'void main(void) {' +
            'gl_FragColor = vec4(1.0, 0.0, 0.0, 0.10);' +
        '}';

    this.shaderSource(pixelInspectFragShader, shaderStr);
    this.compileShader(pixelInspectFragShader);

    return pixelInspectFragShader;
}

/**
 * Returns the appropriate pixel inspector program
 * @param {WebGLProgram} Original Program
 * @return {WebGLProgram.__uuid} Pixel Inspector Progam
 */
WebGLRenderingContext.prototype.glpGetPixelInspectorProgram = function(originalProgram) {
    if (originalProgram.__uuid in this.glpPixelInspectorProgramsMap) {
        return this.glpPixelInspectorProgramsMap[originalProgram.__uuid];
    }

    var program = this.createProgram();

    this.attachShader(program, this.glpVertexShaders[originalProgram.__uuid]);
    this.attachShader(program, this.glpGetPixelInspectFragShader());
    this.linkProgram(program);
    this.validateProgram(program);

    this.glpPixelInspectorPrograms.push(program.__uuid);
    this.glpPixelInspectorProgramsMap[originalProgram.__uuid] = program;

    return program;
}
