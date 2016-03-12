define(["messages"], function (Messages) {
    var DepthInspector = React.createClass({
        toggleDepthInspector: function() {
            var data = {
                "enabled": this.refs.depthInspector.checked,
                "range": {
                    "near": this.refs.depthInspectorNear.value,
                    "far": this.refs.depthInspectorFar.value
                }
            };
            Messages.sendMessage(this.props.activeContext, messageType.DEPTH_INSPECTOR, data);
        },
        render: function() {
            return <div className="container">
                <div className="heading">
                    Depth Inspector
                </div>
                <div>
                    Displays the relative depths of the pixels being drawn.  Lighter values are further away whereas darker values are closer.
                </div>
                <div>
                    Enable Depth Inspector&nbsp;&nbsp;
                    <input ref="depthInspector" type="checkbox" onClick={this.toggleDepthInspector} />
                </div>
                <div>
                    Near:&nbsp;<input ref="depthInspectorNear" type="number" defaultValue="1" onChange={this.toggleDepthInspector} />
                    &nbsp;&nbsp;
                    Far:&nbsp;<input ref="depthInspectorFar" type="number" defaultValue="1000" onChange={this.toggleDepthInspector} />
                </div>
                <div>
                    Hint: If only white is displayed then the <b>far</b> value may be too small.  Likewise, if only black is displayed then the <b>far</b> value may be too large.
                </div>
            </div>;
        }
    });
    return DepthInspector;
});
