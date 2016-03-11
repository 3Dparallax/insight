require.config({
    'paths' : {
        'JSXTransformer' : 'lib/JSXTransformer',
        'text' : 'lib/text',
        'jsx' : 'lib/jsx'
    }
});

require(["messages", "jsx!main"]);
