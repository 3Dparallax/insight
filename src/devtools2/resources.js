resourceTabs = [
    "Textures",
    "Buffers",
    "Frames Buffers",
    "Render Buffers"
]
resourceNames = [
    "Texture",
    "Buffer",
    "Frame Buffer",
    "Render Buffer"
]

define(["messages"], function (Messages) {
    var Resources = React.createClass({
        getInitialState: function() {
            return {
                selectedTab: 0,
                selectedResource: 0,
                textures: 0,
                buffers: 0,
                frameBuffers: 0,
                renderBuffers: 0,
                activeResource: null
            };
        },
        componentWillMount: function() {
            Messages.connection.onMessage.addListener(function(msg) {
                if (msg.source != "content") {return;}

                if (msg.type == messageType.GET_TEXTURES) {
                    this.setState({textures: msg.data.length});
                } else if (msg.type == messageType.GET_BUFFERS) {
                    this.setState({buffers: msg.data.length});
                } else if (msg.type == messageType.GET_FRAME_BUFFERS) {
                    this.setState({frameBuffers: msg.data.length});
                } else if (msg.type == messageType.GET_RENDER_BUFFERS) {
                    this.setState({renderBuffers: msg.data.length});
                } else if (msg.type == messageType.GET_TEXTURE) {
                    this.setState({activeResource: JSON.parse(msg.data)});
                } else if (msg.type == messageType.GET_BUFFER) {
                    this.setState({activeResource: JSON.parse(msg.data)});
                }
            }.bind(this));

            Messages.sendMessage(this.props.activeContext, messageType.DISABLE_ALL, {});
            Messages.sendMessage(this.props.activeContext, messageType.GET_TEXTURES, {});
            Messages.sendMessage(this.props.activeContext, messageType.GET_BUFFERS, {});
            Messages.sendMessage(this.props.activeContext, messageType.GET_FRAME_BUFFERS, {});
            Messages.sendMessage(this.props.activeContext, messageType.GET_RENDER_BUFFERS, {});
        },
        switchTab: function(i) {
            Messages.sendMessage(this.props.activeContext, messageType.DISABLE_ALL, {});
            this.setState({selectedTab: i, selectedResource:0, activeResource: null});
        },
        switchBufferList: function(i) {
            this.setState({selectedResource: i});
            if (this.state.activeContext == 0) {
                Messages.sendMessage(this.props.activeContext, messageType.GET_TEXTURE, {});
            } else if (this.state.activeContext == 1) {
                Messages.sendMessage(this.props.activeContext, messageType.GET_BUFFER, {});
            } else if (this.state.activeContext == 2) {
                Messages.sendMessage(this.props.activeContext, messageType.GET_FRAME_BUFFER, {});
            } else {
                Messages.sendMessage(this.props.activeContext, messageType.GET_RENDER_BUFFER, {});
            }
        },
        getTabs: function() {
            tabResult = [];
            for (var i = 0; i < resourceTabs.length; i++) {
                var className = "split-view-table-element";
                if (this.state.selectedTab == i) {
                    className += " split-view-table-element-selected";
                }

                el = <div className={className} onClick={this.switchTab.bind(this, i)}>
                        <div className={".split-view-table-element-text"}>
                            {resourceTabs[i]}
                        </div>
                     </div>
                tabResult.push(el);
            }
            return tabResult;
        },
        getBufferList: function(name, length) {
            tabResult = [];
            for (var i = 0; i < length; i++) {
                var className = "split-view-table-element";
                if (this.state.selectedResource == i) {
                    className += " split-view-table-element-selected";
                }

                el = <div className={className} onClick={this.switchBufferList.bind(this, i)}>
                        <div className={".split-view-table-element-text"}>
                            {name + i}
                        </div>
                     </div>
                tabResult.push(el);
            }
            return tabResult;
        },
        render: function() {
            var resourceName = resourceNames[this.state.selectedTab];
            var length = 0;
            switch (this.state.selectedTab) {
                case 0:
                    length = this.state.textures;
                    break;
                case 1:
                    length = this.state.buffers;
                    break;
                case 2:
                    length = this.state.frameBuffers;
                    break;
                case 3:
                    length = this.state.renderBuffers;
                    break;
            }

            var render = <div className="split-view">
                <div className="split-view-table">{this.getBufferList(resourceName, length)}</div>
                <div className="split-view-content">
                    {JSON.stringify(this.state.activeContext)}
                </div>
            </div>;
            if (length == 0) {
                render = <div clasName="center">No resources detected</div>;
            }

            return <div className="split-view">
                <div className="split-view-table">{this.getTabs()}</div>
                <div className="split-view-content">
                    {render}
                </div>
            </div>;
        }
    });
    return Resources;
});
