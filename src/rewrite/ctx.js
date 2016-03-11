tabs = [
    "Inspector",
    "Profiles",
    "State",
    "Settings"
]

define(["jsx!tab_bar", "jsx!inspector", "jsx!profiles", "jsx!state_view", "jsx!settings", "messages"],
function (TabBar, Inspector, Profiles, StateView, Settings, Messages) {
    var ctx = React.createClass({
        getInitialState: function() {
            return {"currentTab": 0}
        },
        componentWillMount: function() {
            Messages.sendMessage(this.props.activeContext, messageType.DISABLE_ALL, {});
            window.addEventListener('unload', function() {
                Messages.sendMessage("", messageType.GET_CONTEXTS, {});
                Messages.sendMessage(this.props.activeContext, messageType.DISABLE_ALL, {});
            }.bind(this))
        },
        changeTab: function(i) {
            Messages.sendMessage(this.props.activeContext, messageType.DISABLE_ALL, {});
            this.setState({currentTab: i});
        },
        render: function() {
            var tab;
            if (this.state.currentTab == 0) {
                tab = <Inspector activeContext={this.props.activeContext}/>;
            } else if (this.state.currentTab == 1) {
                tab = <Profiles activeContext={this.props.activeContext}/>;
            } else if (this.state.currentTab == 2) {
                tab = <StateView activeContext={this.props.activeContext}/>;
            } else {
                tab = <Settings activeContext={this.props.activeContext}/>;
            }
            return <div>
                <TabBar tabs={tabs} changeTab={this.changeTab} />
                <div className="tab-container">{tab}</div>
            </div>;
        }
    });
    return ctx;
});
