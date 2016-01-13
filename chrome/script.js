function _h( f, c, n ) {
    return function() {
        var res = f.apply( this, arguments );
        res = c.apply( this, [ n, res, arguments ] ) || res;
        return res;
    }
}

for (var name in WebGLRenderingContext.prototype) {
    try {
        if (typeof WebGLRenderingContext.prototype[name] == 'function') {
            WebGLRenderingContext.prototype[name] = _h(
                WebGLRenderingContext.prototype[name],
                function(n, res, args) {
                    console.log(n, args)
                },
                name
            );
        }
    } catch(err) {
        console.log("ERROR: " + name)
    }
}
