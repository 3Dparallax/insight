shaderTabs = [
    "Overdraw Inspector",
    "Mipmap Inspector",
    "Depth Inspector",
    "Frame Control",
]
define(["jsx!pixel_inspector", "jsx!depth_inspector", "jsx!mipmap_inspector", "jsx!frame_control", "messages"], function (PixelInspector, DepthInspector, MipmapInspector, FrameControl, Messages) {
    var Shaders = React.createClass({
        getInitialState: function() {
            return {selectedTab: 0};
        },
        switchTab: function(i) {
            Messages.sendMessage(this.props.activeContext, messageType.DISABLE_ALL, {});
            this.setState({selectedTab: i});
        },
        getTabs: function() {
            tabResult = [];
            for (var i = 0; i < shaderTabs.length; i++) {
                var className = "split-view-table-element";
                if (this.state.selectedTab == i) {
                    className += " split-view-table-element-selected";
                }

                el = <div className={className} onClick={this.switchTab.bind(this, i)}>
                        <div className={".split-view-table-element-text"}>
                            {shaderTabs[i]}
                        </div>
                     </div>
                tabResult.push(el);
            }
            return tabResult;
        },
        render: function() {
            var tab;
            if (this.state.selectedTab == 0) {
                tab = <PixelInspector activeContext={this.props.activeContext} />
            } else if (this.state.selectedTab == 1) {
                tab = <MipmapInspector activeContext={this.props.activeContext} />
            } else if (this.state.selectedTab == 2) {
                tab = <DepthInspector activeContext={this.props.activeContext} />
            } else if (this.state.selectedTab == 3) {
                tab = <FrameControl activeContext={this.props.activeContext} />
            }
            return <div className="split-view">
                <div className="split-view-table">{this.getTabs()}</div>
                <div className="split-view-content">
                    {tab}
                </div>
            </div>;
        }
    });
    return Shaders;
});
