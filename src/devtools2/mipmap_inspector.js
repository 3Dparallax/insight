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
                    Displays the mipmap levels for a selected texture in different colors.
                    Depending on how many mipmap levels there are and the maximum mipmap level, the colors will vary.
                    This can be used to show whether certain mipmap levels of a selected texture is used.
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
