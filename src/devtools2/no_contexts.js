define([], function () {
    var NoContexts = React.createClass({
        render: function() {
            return <div className="center">
                        <div className="heading">WebGL Insight</div>
                        <div>No contexts found on page. Please try refreshing your page.</div>
                   </div>;
        }
    });
    return NoContexts;
});
