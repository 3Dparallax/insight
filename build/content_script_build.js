// Adapted from: http://www.howtocreate.co.uk/tutorials/jsexamples/syntax/prepareInline.html
function convert(inputCode, variableName) {
    var tempVal = inputCode
    var tempNm = variableName;

    var quoteStyle = '\"';
    var fromAr = new Array(/\\/g,/'/g,/"/g,/\r\n/g,/[\r\n]/g,/\t/g,new RegExp('--'+'>','g'),new RegExp('<!'+'--','g'),/\//g), toAr = new Array('\\\\','\\\'','\\\"','\\n','\\n','\\t','--\'+\'>','<!\'+\'--','\\\/');
    for( var x = 0; x < fromAr.length; x++ ) {
        tempVal = tempVal.replace(fromAr[x],toAr[x]);
    }
    tempVal = 'var ' + tempNm + ' = ' + quoteStyle + tempVal + quoteStyle + ';';

    return tempVal;
}

var stdin = process.stdin;
var stdout = process.stdout;
var inputChunks = [];

stdin.resume();
stdin.setEncoding('utf8');

stdin.on('data', function (chunk) {
    inputChunks.push(chunk);
});

stdin.on('end', function () {
    var inputCode = inputChunks.join();
    stdout.write(convert(inputCode, "code_to_inject"));
});