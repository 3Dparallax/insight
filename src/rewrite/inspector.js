define(["messages"], function (Messages) {
    var Inspector = React.createClass({
        togglePixelInspector: function() {
            var data = {"enabled": this.refs.pixelInspector.checked};
            Messages.sendMessage(this.props.activeContext, messageType.PIXEL_INSPECTOR, data);
        },
        render: function() {
            return <div>
                Enable Pixel Inspector
                <input ref="pixelInspector" type="checkbox" onClick={this.togglePixelInspector} />
            </div>;
        }
    });
    return Inspector;
});
