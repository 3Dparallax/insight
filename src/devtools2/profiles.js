define(["messages", "jsx!profile_table", "jsx!profile_graph"], function (Messages, ProfileTable, ProfileGraph) {
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
                    newProfile = [1, JSON.parse(msg.data.duplicateProgramUses)];
                } else if (msg.type == messageType.CALL_STACK) {
                    newProfile = [2, msg.data.functionNames]
                } else if (msg.type == messageType.CALL_STACK_DRAW) {
                    newProfile = [3, msg.data.functionNames]
                } else if (msg.type == messageType.FUNCTION_HISTOGRAM) {
                    newProfile = [4, msg.data];
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
            drawCallStack = 0;
            histogram = 0;
            for (var i = 0; i < this.state.profiles.length; i++) {
                var name = ""
                if (this.state.profiles[i][0] == 0) {
                    name = "Program Usage " + programUsage++;
                } else if (this.state.profiles[i][0] == 1) {
                    name = "Duplicate Program Usage " + duplicateProgramUsage++;
                } else if (this.state.profiles[i][0] == 2) {
                    name = "Call Stack " + callStack++;
                } else if (this.state.profiles[i][0] == 3) {
                    name = "Recent Draw: Call Stack " + drawCallStack++;
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
            // When collecting recent draw, it will return itself in 1000ms
            if (this.state.collectingProfile && this.state.selectedProfile == 3) {
                return;
            }

            if (this.state.collectingProfile) {
                this.setState({collectingProfile: false});
                if (this.state.selectedProfile == 0) {
                    Messages.sendMessage(this.props.activeContext, messageType.GET_PROGRAM_USAGE_COUNT, "getProgramUsageCount");
                } else if (this.state.selectedProfile == 1) {
                    Messages.sendMessage(this.props.activeContext, messageType.GET_DUPLICATE_PROGRAM_USAGE, "getDuplicateProgramUse");
                } else if (this.state.selectedProfile == 2) {
                    Messages.sendMessage(this.props.activeContext, messageType.GET_CALL_STACK, null);
                } else if (this.state.selectedProfile == 4) {
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
            } else if (this.state.selectedProfile == 3) {
                Messages.sendMessage(this.props.activeContext, messageType.TOGGLE_CALL_STACK, {"enabled": true});
                setTimeout(function() {
                    Messages.sendMessage(this.props.activeContext, messageType.GET_CALL_STACK_DRAW, null);
                }.bind(this), 1000);
            } else {
                Messages.sendMessage(this.props.activeContext, messageType.TOGGLE_FUNCTION_HISTOGRAM, {"enabled": true});
            }
        },
        getProfileMain: function() {
            var buttonText = this.state.collectingProfile ? "Stop" : "Start";
            return <div className="container">
                <div className="heading">Usages</div>
                <div>Collect information about usages in a given period of time. Select a usage type. Press start to begin recording and stop to end recording.</div>
                <div>
                    <input name="profiles" type="radio" disabled={this.state.collectingProfile} onChange={this.onProfileChange} value={0} checked={this.state.selectedProfile==0}/>
                    <b>Record Program Usage</b> - records how many times each shader program has been called by useProgram.
                </div>
                <div>
                    <input name="profiles" type="radio" disabled={this.state.collectingProfile} onChange={this.onProfileChange} value={1} checked={this.state.selectedProfile==1}/>
                    <b>Detect Duplicate Program Usage</b> - detects whether there are any duplicate useProgram calls on the same program.
                </div>
                <div>
                    <input name="profiles" type="radio" disabled={this.state.collectingProfile} onChange={this.onProfileChange} value={2} checked={this.state.selectedProfile==2}/>
                    <b>Collect Call Stack</b> - collects WebGL calls during that time.
                </div>
                <div>
                    <input name="profiles" type="radio" disabled={this.state.collectingProfile} onChange={this.onProfileChange} value={3} checked={this.state.selectedProfile==3}/>
                    <b>Fetch Call Stack from Recent Draw Call</b> - collects WebGL calls since last draw call.
                </div>
                <div>
                    <input name="profiles" type="radio" disabled={this.state.collectingProfile} onChange={this.onProfileChange} value={4} checked={this.state.selectedProfile==4}/>
                    <b>View Call Stack Histogram</b> - counts WebGL calls during that time and displays the result in a histogram.
                </div>
                <div>
                    <button onClick={this.collectProfileButtonClicked}>{buttonText}</button>
                </div>
            </div>;
        },
        render: function() {
            var tab;
            if (this.state.selectedTab == 0) {
                tab = this.getProfileMain();
            } else {
                var profile = this.state.profiles[this.state.selectedTab - 1];
                if (profile[0] == 4) {
                    tab = <ProfileGraph profileData={profile} />
                } else {
                    tab = <ProfileTable profileData={profile} />
                }
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
