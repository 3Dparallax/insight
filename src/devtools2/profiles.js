define(["messages"], function (Messages) {
    var Profiles = React.createClass({
        getInitialState: function() {
            return {selectedTab: 0, profiles: [], selectedProfile: 0, collectingProfile: false};
        },
        componentWillMount: function() {
            Messages.connection.onMessage.addListener(function(msg) {
                if (msg.source != "content") {return;}

                var newProfile;
                if (msg.type == messageType.GET_PROGRAM_USAGE_COUNT) {
                    newProfile = [0, JSON.parse(msg.data.programUsageCount)];
                } else if (msg.type == messageType.GET_DUPLICATE_PROGRAM_USAGE) {
                    newProfile = [1, JSON.parse(msg.data.duplicateProgramUses)]
                } else if (msg.type == messageType.CALL_STACK) {
                    newProfile = [2, msg.data.functionNames]
                } else if (msg.type == messageType.FUNCTION_HISTOGRAM) {
                    newProfile = [3, msg.data]
                }

                if (newProfile) {
                    Messages.sendMessage(this.props.activeContext, messageType.DISABLE_ALL, {});
                    this.setState({
                        "collectingProfile": false,
                        "selectedTab": this.state.profiles.length + 1,
                        "profiles": this.state.profiles.concat([newProfile]),
                    });
                }
            }.bind(this));
        },
        switchTab: function(i) {
            Messages.sendMessage(this.props.activeContext, messageType.DISABLE_ALL, {});
            this.setState({selectedTab: i, collectingProfile: false});
        },
        getTabNames: function() {
            tabNames = ["Profiles"]
            programUsage = 0;
            duplicateProgramUsage = 0;
            callStack = 0;
            histogram = 0;
            for (var i = 0; i < this.state.profiles.length; i++) {
                var name = ""
                if (this.state.profiles[i][0] == 0) {
                    name = "Program Usage " + programUsage++;
                } else if (this.state.profiles[i][0] == 1) {
                    name = "Duplicate Program Usage " + duplicateProgramUsage++;
                } else if (this.state.profiles[i][0] == 2) {
                    name = "Call Stack " + callStack++;
                } else {
                    name = "Histogram " + histogram++;
                }
                tabNames.push(name)
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
        onProfileChange: function(e) {
            this.setState({selectedProfile: e.currentTarget.value});
        },
        collectProfileButtonClicked: function() {
            if (this.state.collectingProfile) {
                this.setState({collectingProfile: false});
                if (this.state.selectedProfile == 0) {
                    Messages.sendMessage(this.props.activeContext, messageType.GET_PROGRAM_USAGE_COUNT, "getProgramUsageCount");
                } else if (this.state.selectedProfile == 1) {
                    Messages.sendMessage(this.props.activeContext, messageType.GET_DUPLICATE_PROGRAM_USAGE, "getDuplicateProgramUse");
                } else if (this.state.selectedProfile == 2) {
                    Messages.sendMessage(this.props.activeContext, messageType.GET_CALL_STACK, "bothCallStacks");
                } else {
                    Messages.sendMessage(this.props.activeContext, messageType.FUNCTION_HISTOGRAM, {threshold: 10});
                }
                Messages.sendMessage(this.props.activeContext, messageType.DISABLE_ALL, {});
                return;
            }

            this.setState({collectingProfile: true});
            if (this.state.selectedProfile == 0) {
                Messages.sendMessage(this.props.activeContext, messageType.TOGGLE_PROGRAM_USAGE_COUNT, {"enabled": true});
            } else if (this.state.selectedProfile == 1) {
                Messages.sendMessage(this.props.activeContext, messageType.TOGGLE_DUPLICATE_PROGRAM_USAGE, {"enabled": true});
            } else if (this.state.selectedProfile == 2) {
                Messages.sendMessage(this.props.activeContext, messageType.TOGGLE_CALL_STACK, {"enabled": true});
            } else {
                Messages.sendMessage(this.props.activeContext, messageType.TOGGLE_FUNCTION_HISTOGRAM, {"enabled": true});
            }
        },
        getProfileMain: function() {
            var buttonText = this.state.collectingProfile ? "Stop" : "Start";
            return <div className="container">
                <div className="heading">Profiles</div>
                <div>Blah Blah Important text</div>
                <div>
                    <input name="profiles" type="radio" disabled={this.state.collectingProfile} onChange={this.onProfileChange} value={0} checked={this.state.selectedProfile==0}/>
                    Record Program Usage
                </div>
                <div>
                    <input name="profiles" type="radio" disabled={this.state.collectingProfile} onChange={this.onProfileChange} value={1} checked={this.state.selectedProfile==1}/>
                    Detect Duplicate Program Usage
                </div>
                <div>
                    <input name="profiles" type="radio" disabled={this.state.collectingProfile} onChange={this.onProfileChange} value={2} checked={this.state.selectedProfile==2}/>
                    Collect Call Stack
                </div>
                <div>
                    <input name="profiles" type="radio" disabled={this.state.collectingProfile} onChange={this.onProfileChange} value={3} checked={this.state.selectedProfile==3}/>
                    View Call Histogram
                </div>
                <div>
                    <button onClick={this.collectProfileButtonClicked}>{buttonText}</button>
                </div>
            </div>;
        },
        render: function() {
            console.log(this.state.profiles);
            var tab;
            if (this.state.selectedTab == 0) {
                tab = this.getProfileMain();
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
