isEditable = [
    "DEPTH_CLEAR_VALUE",
    "LINE_WIDTH",
    "PACK_ALIGNMENT",
    "POLYGON_OFFSET_FACTOR",
    "POLYGON_OFFSET_UNITS",
    "STENCIL_REF",
    "STENCIL_BACK_REF",
]

define(["messages"], function (Messages) {
    var StateView = React.createClass({
        getInitialState: function() {
            return {enabled: false, stateVars: {}, enumOptions: {}};
        },
        componentWillMount: function() {
            Messages.connection.onMessage.addListener(function(msg) {
                if (msg.source != "content") {return;}

                if (msg.type == messageType.STATE_VARS) {
                    var stateVars = JSON.parse(msg.data.stateVars);
                    var enumOptions = JSON.parse(msg.data.enumOptions);
                    this.setState({stateVars: stateVars, enumOptions: enumOptions});
                }
            }.bind(this));
        },
        getVariableColumn: function(data) {
            result = [];
            for (var i = 0; i < data.length; i++) {
                var className = "profile-table-column-element";
                if (i == 0) {
                    className += " profile-table-column-element-header";
                }
                el = <div className={className}>{data[i]}</div>
                result.push(el);
            }
            return <div className="profile-table-column">
                {result}
            </div>;
        },
        sendBoolUpdate: function(variableName, value) {
            Messages.sendMessage(this.props.activeContext, messageType.STATE_VARS, {
                type: "bool",
                variable: variableName,
                enable: value
            });
        },
        sendEnumUpdate: function(variableName, value) {
            Messages.sendMessage(this.props.activeContext, messageType.STATE_VARS, {
                type: "enum",
                variable: variableName,
                value: value
            });
        },
        sendNumberUpdate: function(variableName, value) {
            Messages.sendMessage(this.props.activeContext, messageType.STATE_VARS, {
                type: "num",
                variable: variableName,
                value: Number(value)
            });
        },
        boolChange: function(variableName, e) {
            var value = e.target.checked;
            this.sendBoolUpdate(variableName, value);
        },
        enumChange: function(variableName, e) {
            var value  = e.target.value;
            this.sendEnumUpdate(variableName, value);
        },
        numberChange: function(variableName, e) {
            var value = e.target.value;
            this.sendNumberUpdate(variableName, value);
        },
        getStateColumn: function(data) {
            result = [];
            for (var i = 0; i < data.length; i++) {
                var className = "profile-table-column-element";
                var subEl;
                if (i == 0) {
                    className += " profile-table-column-element-header";
                    subEl = "State";
                } else {
                    var name = data[i - 1];
                    var type = this.state.stateVars[name].type;
                    var value = this.state.stateVars[name].value;
                    if (type == "bool") {
                        subEl = <input
                                    type="checkbox"
                                    checked={value}
                                    onClick={this.boolChange.bind(this, name)}/>;
                    } else if (type == "enum") {
                        if (this.state.enumOptions[name] && this.state.enumOptions[name].length > 1) {
                            var options = this.state.enumOptions[name];
                            var optionEls = []
                            for (var j=0; j<options.length; j++) {
                                optionEls.push(
                                    <option value={options[j]}>{options[j]}</option>
                                );
                            }
                            subEl = <select defaultValue={value} onChange={this.enumChange.bind(this, name)}>{optionEls}</select>
                        } else {
                            subEl = <div>{value}</div>; // Setting not supported
                        }
                    } else if (type == "number") {
                        if (isEditable.indexOf(name) > 0) {
                            subEl = <input type="number"
                                     defaultValue={value}
                                     onChange={this.numberChange.bind(this, name)}/>;
                        } else {
                            subEl = <div>{value}</div>; // Setting not supported
                        }
                    }
                }
                el = <div className={className}>{subEl}</div>
                result.push(el);
            }
            return <div className="profile-table-column">
                {result}
            </div>;
        },
        getStateColumns: function(data) {
            var columns = [];

            var vList = Object.keys(this.state.stateVars).sort();
            var variables = ["Variable"].concat(vList);

            columns.push(this.getVariableColumn(variables));
            columns.push(this.getStateColumn(vList));
            return columns;
        },
        getTabs: function() {
            el = <div className="split-view-table-element split-view-table-element-selected">
                    <div className="split-view-table-element-text">
                        State Editor
                    </div>
                 </div>
            return el;
        },
        toggleStateEditor: function() {
            var enabled = this.refs.stateEditor.checked;
            var data = {"enabled": enabled};
            Messages.sendMessage(this.props.activeContext, messageType.TOGGLE_STATE_VARS, data);

            if (enabled) {
                Messages.sendMessage(this.props.activeContext, messageType.STATE_VARS, "getStateVariables");
            }
            this.setState(data);
        },
        render: function() {
            var table = null;
            if (this.state.enabled) {
                table = <div className="profile-table">
                        {this.getStateColumns()}
                     </div>
            }

            return <div className="split-view">
                    <div className="split-view-table">{this.getTabs()}</div>
                    <div className="split-view-content">
                        <div className="state-container">
                            <div className="state-container-child">
                                <div className="heading">States</div>
                                <div>Edit WebGL states. </div>
                                <div>
                                    Enable State Editor&nbsp;&nbsp;
                                    <input ref="stateEditor" type="checkbox" onClick={this.toggleStateEditor} />
                                </div>
                            </div>
                            {table}
                        </div>
                    </div>
                </div>
        }
    });
    return StateView;
});
