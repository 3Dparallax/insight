define(["messages"], function (Messages) {
    var DepthInspector = React.createClass({
        toggleDepthInspector: function() {
            var data = {"enabled": this.refs.depthInspector.checked};
            Messages.sendMessage(this.props.activeContext, messageType.PIXEL_INSPECTOR, data);
        },
        render: function() {
            return <div className="container">
                <div className="heading">
                    Depth Inspector
                </div>
                <div>
                    Detects how how many times a pixel has been drawn. The color ranges from green to red, red being drawn multiple times while green been drawn only on clear.
                </div>
                <div>
                    Enable Depth Inspector&nbsp;&nbsp;
                    <input ref="depthInspector" type="checkbox" onClick={this.toggleDepthInspector} />
                </div>
            </div>;
        }
    });
    return DepthInspector;
});
