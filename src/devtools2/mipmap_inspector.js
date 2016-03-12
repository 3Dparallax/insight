define(["messages"], function (Messages) {
    var MipmapInspector = React.createClass({
        toggleMipmapInspector: function() {
            var data = {"enabled": this.refs.mipmapInspector.checked};
            Messages.sendMessage(this.props.activeContext, messageType.PIXEL_INSPECTOR, data);
        },
        render: function() {
            return <div className="container">
                <div className="heading">
                    Mipmap Inspector
                </div>
                <div>
                    Detects how how many times a pixel has been drawn. The color ranges from green to red, red being drawn multiple times while green been drawn only on clear.
                </div>
                <div>
                    Enable Mipmap Inspector&nbsp;&nbsp;
                    <input ref="mipmapInspector" type="checkbox" onClick={this.toggleMipmapInspector} />
                </div>
            </div>;
        }
    });
    return MipmapInspector;
});
