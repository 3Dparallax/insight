$(document).ready(function() {
    var context = $("canvas")[0].getContext("webgl")
    for (var propertyName in context) {
        if (/^[A-Z_]+$/.test(propertyName)) {
            console.log(propertyName, context[propertyName]);
        }
    }
});