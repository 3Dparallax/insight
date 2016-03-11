profileTabs = [
    "Profiles"
]
define([], function () {
    var Profiles = React.createClass({
        getInitialState: function() {
            return {selectedTab: 0, profiles: []};
        },
        switchTab: function(i) {
            Messages.sendMessage(this.props.activeContext, messageType.DISABLE_ALL, {});
            this.setState({selectedTab: i});
        },
        getTabs: function() {
            tabResult = [];
            for (var i = 0; i < profileTabs.length; i++) {
                var className = "split-view-table-element";
                if (this.state.selectedTab == i) {
                    className += " split-view-table-element-selected";
                }

                el = <div className={className} onClick={this.switchTab.bind(this, i)}>
                        <div className={".split-view-table-element-text"}>
                            {profileTabs[i]}
                        </div>
                     </div>
                tabResult.push(el);
            }
            return tabResult;
        },
        render: function() {
            var tab;
            if (this.state.selectedTab == 0) {
                tab = <div className="center">Hello World2</div>
            } else {
                tab = <div className="center">Hello World</div>
            }
            return <div className="split-view">
                <div className="split-view-table">{this.getTabs()}</div>
                <div className="split-view-content">
                    {tab}
                </div>
            </div>;
        }
    });
    return Profiles;
});
