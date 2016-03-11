tabs = [
    "Inspector",
    "Profiles",
    "State",
    "Settings"
]

define(["jsx!tab_bar", "jsx!inspector", "jsx!profiles", "jsx!state_view", "jsx!settings"],
function (TabBar, Inspector, Profiles, StateView, Settings) {
    var ctx = React.createClass({
        getInitialState: function() {
            return {"currentTab": 0}
        },
        changeTab: function(i) {
            this.setState({currentTab: i});
        },
        render: function() {
            var tab;
            if (this.state.currentTab == 0) {
                tab = <Inspector />;
            } else if (this.state.currentTab == 1) {
                tab = <Profiles />;
            } else if (this.state.currentTab == 2) {
                tab = <StateView />;
            } else {
                tab = <Settings />;
            }
            return <div>
                <TabBar tabs={tabs} changeTab={this.changeTab} />
                <div className="tab-container">{tab}</div>
            </div>;
        }
    });
    return ctx;
});
