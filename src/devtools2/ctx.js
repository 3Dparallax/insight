contextTabs = [
    "Shaders",
    "Usages",
    "Programs",
    "States",
    "Resources",
    "Settings",
    "Feedback",
]

define(["jsx!tab_bar", "jsx!shaders", "jsx!profiles", "jsx!state_view", "jsx!settings", "messages", "jsx!resources", "jsx!programs", "jsx!feedback"],
function (TabBar, Shaders, Profiles, StateView, Settings, Messages, Resources, Programs, Feedback) {
    var ctx = React.createClass({
        getInitialState: function() {
            return {"currentTab": 0}
        },
        componentWillMount: function() {
            Messages.sendMessage(this.props.activeContext, messageType.DISABLE_ALL, {});
            window.addEventListener('unload', function() {
                Messages.sendMessage(this.props.activeContext, messageType.DISABLE_ALL, {});
            }.bind(this))
        },
        changeTab: function(i) {
            Messages.sendMessage(this.props.activeContext, messageType.DISABLE_ALL, {});
            this.setState({currentTab: i});
        },
        render: function() {
            var tab;
            var key = String(Math.random()); // TODO: Use a unique key to ensure refresh
            if (this.state.currentTab == 0) {
                tab = <Shaders key={key} activeContext={this.props.activeContext}/>;
            } else if (this.state.currentTab == 1) {
                tab = <Profiles key={key} activeContext={this.props.activeContext}/>;
            } else if (this.state.currentTab == 2) {
                tab = <Programs key={key} activeContext={this.props.activeContext}/>;
            } else if (this.state.currentTab == 3) {
                tab = <StateView key={key} activeContext={this.props.activeContext}/>;
            } else if (this.state.currentTab == 4) {
                tab = <Resources key={key} activeContext={this.props.activeContext}/>;
            } else if (this.state.currentTab == 5) {
                tab = <Settings key={key} activeContext={this.props.activeContext}/>;
            } else {
                tab = <Feedback key={key} activeContext={this.props.activeContext}/>;
            }
            return <div className="context">
                <TabBar tabs={contextTabs} changeTab={this.changeTab} />
                <div className="tab-container">{tab}</div>
            </div>;
        }
    });
    return ctx;
});
