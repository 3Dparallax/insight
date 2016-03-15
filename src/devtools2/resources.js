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
                    var el;

                    if (source.imgSrc) {
                        el = <div className="container">
                            <div className="resource-img-container">
                                <img src={source.imgSrc} height={source.height} width={source.width}></img>
                            </div>
                        </div>;
                        resourceView.push(el);
                    } else if (source.videoSrc) {
                        el = <div className="container">
                            <div className="heading">Video</div>
                            <div><a href={source.videoSrc} target="_blank">{source.videoSrc}</a></div>
                        </div>;
                        resourceView.push(el);
                    } else {
                        resourceView.push(<div>{JSON.stringify(source.arraySrc)}</div>);
                    }

                    if (resource.texImage2DCalls) {
                        el = <div className="container">
                            <div className="heading">texImage2D</div>
                            <ul>
                            {
                                resource.texImage2DCalls.map(function(call) {
                                    return <li>{call}</li>
                                })
                            }
                            </ul>
                        </div>;
                        resourceView.push(el);
                    }
                    if (resource.texSubImage2DCalls) {
                        el = <div className="container">
                            <div className="heading">texSubImage2D</div>
                            <ul>
                            {
                                resource.texSubImage2DCalls.map(function(call) {
                                    return <li>{call}</li>
                                })
                            }
                            </ul>
                        </div>;
                        resourceView.push(el);
                    }
                    if (resource.texParameteriCalls) {
                        el = <div className="container">
                            <div className="heading">texParameteri</div>
                            <ul>
                            {
                                resource.texParameteriCalls.map(function(call) {
                                    return <li>{call}</li>
                                })
                            }
                            </ul>
                        </div>;
                        resourceView.push(el);
                    }
                    if (resource.texParameterfCalls) {
                        el = <div className="container">
                            <div className="heading">texParameterf</div>
                            <ul>
                            {
                                resource.texParameterfCalls.map(function(call) {
                                    return <li>{call}</li>
                                })
                            }
                            </ul>
                        </div>;
                        resourceView.push(el);
                    }

                } else if (this.state.selectedTab == 2) {

                    var resource = this.state.activeResource;
                    var source = resource.source;

                    el = <div className="container">
                        <div className="heading">Buffer</div>
                        <div>{JSON.stringify(source.arraySrc)}</div>
                    </div>;
                    resourceView.push(el);

                    el = <div className="container">
                        <div className="heading">Buffer Deleted</div>
                        <div>{source.deleted.toString()}</div>
                    </div>;
                    resourceView.push(el);

                } else if (this.state.selectedTab == 3) {

                    var resource = this.state.activeResource;
                    var source = resource.source;

                    if (source.imgSrc) {
                        el = <div className="container">
                            <div className="resource-img-container">
                                <img src={source.imgSrc} height={source.height} width={source.width}></img>
                            </div>
                        </div>;
                        resourceView.push(el);
                    }

                    el = <div className="container">
                        <div className="heading">Frame Buffer Deleted</div>
                        <div>{source.deleted.toString()}</div>
                    </div>;
                    resourceView.push(el);

                    if (resource.framebufferRenderbufferCalls) {
                        el = <div className="container">
                            <div className="heading">framebufferRenderbuffer</div>
                            <ul>
                            {
                                resource.framebufferRenderbufferCalls.map(function(call) {
                                    return <li>{call}</li>
                                })
                            }
                            </ul>
                        </div>;
                        resourceView.push(el);
                    }
                    if (resource.framebufferTexture2DCalls) {
                        el = <div className="container">
                            <div className="heading">framebufferTexture2D</div>
                            <ul>
                            {
                                resource.framebufferTexture2DCalls.map(function(call) {
                                    return <li>{call}</li>
                                })
                            }
                            </ul>
                        </div>;
                        resourceView.push(el);
                    }

                } else if (this.state.selectedTab == 4) {

                    var resource = this.state.activeResource;

                    el = <div className="container">
                        <div className="heading">Render Buffer Deleted</div>
                        <div>{resource.deleted.toString()}</div>
                    </div>;
                    resourceView.push(el);

                    el = <div className="container">
                        <div className="heading">renderbufferStatus</div>
                        <ul>
                        {
                            resource.renderbufferStatus.map(function(call) {
                                for (var key in call) {
                                    return <li>{key}: {call[key]}</li>
                                }
                            })
                        }
                        </ul>
                    </div>;
                    resourceView.push(el);

                    if (resource.framebufferRenderbufferCalls) {
                        el = <div className="container">
                            <div className="heading">framebufferRenderbuffer</div>
                            <ul>
                            {
                                resource.framebufferRenderbufferCalls.map(function(call) {
                                    return <li>{call}</li>
                                })
                            }
                            </ul>
                        </div>;
                        resourceView.push(el);
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
                    <div>View textures, buffers, frame buffers, and render buffers.</div>
                    <div><b>Textures</b> - shows a preview of the textures used in the application and the associated creation call(s).</div>
                    <div><b>Buffers</b> - shows the buffer information and whether it has been deleted.</div>
                    <div><b>Frame Buffer</b> - shows a preview of the frame buffer, whether it has been deleted, and the associated call(s).</div>
                    <div><b>Render Buffer</b> - shows whether it has been deleted, the status, and the associated call(s).</div>
                </div>;
            } else {
                render = <div className="split-view">
                    <div className="split-view-table">
                        {this.getResourceList(resourceName, length)}
                    </div>
                    <div className="split-view-content">
                        <div className="resource-container">
                        {this.getResourceView()}
                        </div>
                    </div>
                </div>;

                if (length == 0) {
                    render = <div className="container">
                        <div className="heading">
                            No {resourceName} Detected
                        </div>
                    </div>;
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
