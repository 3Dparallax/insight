define([], function () {
    var NoContexts = React.createClass({
        render: function() {
            return <div>There are no contexts on the page. Please try refreshing your page.</div>;
        }
    });
    return NoContexts;
});
