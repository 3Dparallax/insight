define(["messages"], function (Messages) {
    var MipmapInspector = React.createClass({
        getInitialState: function() {
            return {textures: [], activeTexture: ""};
        },
        toggleMipmapInspector: function() {
            var data = {
                "enabled": this.refs.mipmapInspector.checked,
                "texture": this.state.activeTexture,
            };
            console.log(data)
            Messages.sendMessage(this.props.activeContext, messageType.ENABLE_MIPMAP_TEXTURE, data);
        },
        switchTexture: function(texture) {
            var data = {
                "enabled": this.refs.mipmapInspector.checked,
                "texture": texture,
            };
            Messages.sendMessage(this.props.activeContext, messageType.ENABLE_MIPMAP_TEXTURE, data);
        },
        componentWillMount: function() {
            Messages.connection.onMessage.addListener(function(msg) {
                if (msg.source != "content") {return;}

                if (msg.type == messageType.MIPMAP_TEXTURES) {
                    this.setState({"textures": JSON.parse(msg.data.textures)});
                } else if (msg.type == messageType.MIPMAP_COLOURS) {
                    this.setState({"colours": msg.data.colours});
                }
            }.bind(this));

            Messages.sendMessage(this.props.activeContext, messageType.MIPMAP_TEXTURES, {});
            Messages.sendMessage(this.props.activeContext, messageType.MIPMAP_COLOURS, {});
        },
        textureChange: function(value, e) {
            this.setState({"activeTexture": e.target.value})
            this.switchTexture(e.target.value);
        },
        render: function() {
            var options = this.state.textures;
            var optionEls = []
            var defaultValue;
            for (var i = 0; i < options.length; i++) {
                if (options[i].active) {
                    optionEls.push(
                        <option selected="selected" value={options[i].uuid}>{options[i].name}</option>
                    );
                } else {
                    optionEls.push(
                        <option value={options[i].uuid}>{options[i].name}</option>
                    );
                }
            }
            subEl = <select defaultValue={defaultValue} onChange={this.textureChange.bind(this, name)}>{optionEls}</select>

            var colours = this.state.colours ? this.state.colours : [];
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
                    {subEl}
                </div>
                <div>
                    {
                        colours.map(function(colour) {
                            var backgroundColor = "rgb(" + (colour[0]/0xFF) + "," + (colour[1]/0xFF) + "," + (colour[2]/0xFF) + ");";
                            var style = {"background-color" : backgroundColor};
                            var mipmapLevel = colours.indexOf(colour);
                            return <span style={style}>&nbsp;&nbsp;{mipmapLevel}&nbsp;&nbsp;</span>
                        })
                    }
                </div>
            </div>;
        }
    });
    return MipmapInspector;
});
