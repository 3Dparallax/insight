define(["jsx!refresh_icon"], function (RefreshIcon) {
    var NoContexts = React.createClass({
        render: function() {
            return <div className="center">
                        <div className="heading">WebGL Insight</div>
                        <RefreshIcon/>
                        <div>No contexts found on page. Click the refresh button to check again.</div>
                   </div>;
        }
    });
    return NoContexts;
});
