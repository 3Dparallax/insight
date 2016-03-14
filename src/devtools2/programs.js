define(["messages", "jsx!program"], function (Messages, Program) {
    var Programs = React.createClass({
        getInitialState: function() {
            return {selectedTab: 0, programs: []};
        },
        componentWillMount: function() {
            Messages.connection.onMessage.addListener(function(msg) {
                if (msg.source != "content") {return;}

                if (msg.type == messageType.SHADERS) {
                    this.setState({"programs": JSON.parse(msg.data)});
                }
            }.bind(this));
            Messages.sendMessage(this.props.activeContext, messageType.SHADERS, {});
        },
        switchTab: function(i) {
            this.setState({selectedTab: i});
        },
        getTabNames: function() {
            tabNames = ["Programs"]
            for (var i = 0; i < this.state.programs.length; i++) {
                tabNames.push("Program" + i);
            }
            return tabNames;
        },
        getTabs: function() {
            tabResult = [];
            tabNames = this.getTabNames();
            for (var i = 0; i < tabNames.length; i++) {
                var className = "split-view-table-element";
                if (this.state.selectedTab == i) {
                    className += " split-view-table-element-selected";
                }

                el = <div className={className} onClick={this.switchTab.bind(this, i)}>
                        <div className={".split-view-table-element-text"}>
                            {tabNames[i]}
                        </div>
                     </div>
                tabResult.push(el);
            }
            return tabResult;
        },
        getProgramMain: function() {
            return <div className="container">
                <div className="heading">Programs</div>
                <div>Here, you can view all programs (active and inactive) in the application. Each program consists of an ID, vertex shader, and fragment shader.</div>
            </div>;
        },
        render: function() {
            var tab;
            if (this.state.selectedTab == 0) {
                tab = this.getProgramMain();
            } else {
                var program = this.state.programs[this.state.selectedTab - 1];
                tab = <Program programData={program}/>;
            }
            return <div className="split-view">
                <div className="split-view-table">{this.getTabs()}</div>
                <div className="split-view-content">
                    {tab}
                </div>
            </div>;
        }
    });
    return Programs;
});
