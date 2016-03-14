resourceTabs = [
    "Resources",
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

            Messages.sendMessage(this.props.activeContext, messageType.GET_TEXTURES, {});
            Messages.sendMessage(this.props.activeContext, messageType.GET_BUFFERS, {});
            Messages.sendMessage(this.props.activeContext, messageType.GET_FRAME_BUFFERS, {});
            Messages.sendMessage(this.props.activeContext, messageType.GET_RENDER_BUFFERS, {});
        },
        switchResource: function(i) {
            this.setState({selectedResource: i});
            if (this.state.selectedTab == 1) {
                Messages.sendMessage(this.props.activeContext, messageType.GET_TEXTURE, {"index": i});
            } else if (this.state.selectedTab == 2) {
                Messages.sendMessage(this.props.activeContext, messageType.GET_BUFFER, {"index": i});
            } else if (this.state.selectedTab == 3) {
                Messages.sendMessage(this.props.activeContext, messageType.GET_FRAME_BUFFER, {"index": i});
            } else if (this.state.selectedTab == 4) {
                Messages.sendMessage(this.props.activeContext, messageType.GET_RENDER_BUFFER, {"index": i});
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
        getResourceList: function(name, length) {
            tabResult = [];
            for (var i = 0; i < length; i++) {
                var className = "split-view-table-element";
                if (this.state.selectedResource == i) {
                    className += " split-view-table-element-selected";
                }

                el = <div className={className} onClick={this.switchResource.bind(this, i)}>
                        <div className={".split-view-table-element-text"}>
                            {name + i}
                        </div>
                     </div>
                tabResult.push(el);
            }
            return tabResult;
        },
        getResourceView: function() {
            var resourceView = [];

            if (this.state.activeResource) {

                if (this.state.selectedTab == 1) {

                    var resource = this.state.activeResource;
                    var source = resource.source;

                    if (source.imgSrc) {
                        resourceView.push(<div className="resource-container">
                            <img src={source.imgSrc} height={source.height} width={source.width}></img>
                        </div>);
                    } else if (source.videoSrc) {
                        resourceView.push(<a href={source.videoSrc} target="_blank">{source.videoSrc}</a>);
                    } else {
                        resourceView.push(<div>{JSON.stringify(source.arraySrc)}</div>);
                    }

                    if (resource.texImage2DCalls) {
                        resourceView.push(<div>texImage2D</div>);
                        for (var i = 0; i < resource.texImage2DCalls.length; i++) {
                            resourceView.push(<div>{resource.texImage2DCalls[i]}</div>);
                        }
                    }
                    if (resource.texSubImage2DCalls) {
                        resourceView.push(<div>texSubImage2DCalls</div>);
                        for (var i = 0; i < resource.texSubImage2DCalls.length; i++) {
                            resourceView.push(<div>{resource.texSubImage2DCalls[i]}</div>);
                        }
                    }
                    if (resource.texParameteriCalls) {
                        resourceView.push(<div>texParameteriCalls</div>);
                        for (var i = 0; i < resource.texParameteriCalls.length; i++) {
                            resourceView.push(<div>{resource.texParameteriCalls[i]}</div>);
                        }
                    }
                    if (resource.texParameterfCalls) {
                        resourceView.push(<div>texParameterfCalls</div>);
                        for (var i = 0; i < resource.texParameterfCalls.length; i++) {
                            resourceView.push(<div>{resource.texParameterfCalls[i]}</div>);
                        }
                    }

                } else if (this.state.selectedTab == 2) {

                    var resource = this.state.activeResource;
                    var source = resource.source;

                    resourceView.push(<div>{JSON.stringify(source.arraySrc)}</div>);
                    resourceView.push(<div>Deleted: {source.deleted.toString()}</div>);

                } else if (this.state.selectedTab == 3) {

                    var resource = this.state.activeResource;
                    var source = resource.source;

                    if (source.imgSrc) {
                        resourceView.push(<div className="resource-container">
                            <img src={source.imgSrc} height={source.height} width={source.width}></img>
                        </div>);
                    }

                    resourceView.push(<div>Deleted: {source.deleted.toString()}</div>);

                    if (resource.framebufferRenderbufferCalls) {
                        resourceView.push(<div>framebufferRenderbufferCalls</div>);
                        for (var i = 0; i < resource.framebufferRenderbufferCalls.length; i++) {
                            resourceView.push(<div>{resource.framebufferRenderbufferCalls[i]}</div>);
                        }
                    }
                    if (resource.framebufferTexture2DCalls) {
                        resourceView.push(<div>framebufferTexture2DCalls</div>);
                        for (var i = 0; i < resource.framebufferTexture2DCalls.length; i++) {
                            resourceView.push(<div>{resource.framebufferTexture2DCalls[i]}</div>);
                        }
                    }

                } else if (this.state.selectedTab == 4) {

                    var resource = this.state.activeResource;

                    resourceView.push(<div>Deleted: {resource.deleted.toString()}</div>);

                    for (var i = 0; i < resource.renderbufferStatus.length; i++) {
                        var status = resource.renderbufferStatus[i];
                        for (var key in status) {
                            resourceView.push(<div>{key}</div>);
                            resourceView.push(<div>{status[key]}</div>);
                        }
                    }

                    if (resource.framebufferRenderbufferCalls) {
                        resourceView.push(<div>framebufferRenderbufferCalls</div>);
                        for (var i = 0; i < resource.framebufferRenderbufferCalls.length; i++) {
                            resourceView.push(<div>{resource.framebufferRenderbufferCalls[i]}</div>);
                        }
                    }

                }

            }
            return resourceView;
        },
        render: function() {
            var resourceName = resourceNames[this.state.selectedTab - 1];
            var length = 0;
            switch (this.state.selectedTab) {
                case 1:
                    length = this.state.textures;
                    break;
                case 2:
                    length = this.state.buffers;
                    break;
                case 3:
                    length = this.state.frameBuffers;
                    break;
                case 4:
                    length = this.state.renderBuffers;
                    break;
            }

            var render;
            if (this.state.selectedTab == 0) {
                render = <div className="container">
                    <div className="heading">Resources</div>
                    <div>Resources</div>
                </div>;
            } else {
                render = <div className="split-view">
                    <div className="split-view-table">
                        {this.getResourceList(resourceName, length)}
                    </div>
                    <div className="split-view-content">
                        {this.getResourceView()}
                    </div>
                </div>;

                if (length == 0) {
                    render = <div clasName="center">No resources detected</div>;
                }
            }

            return <div className="split-view">
                <div className="split-view-table">
                    {this.getTabs()}
                </div>
                <div className="split-view-content">
                    {render}
                </div>
            </div>;
        }
    });
    return Resources;
});
