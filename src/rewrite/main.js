define(["jsx!panel", "jsx!disabled_panel"], function (Panel, DisabledPanel) {
  var Main = React.createClass({
    getInitialState: function() {
        return {"enabled": false}
    },
    componentWillMount: function() {
        chrome.storage.sync.get({"glpEnabled": false}, function(items) {
            this.setState({"enabled": items["glpEnabled"]});
        }.bind(this))
    },
    render: function() {
        var panel = this.state.enabled ? <Panel /> : <DisabledPanel />;
        return <div className="main">
            {panel}
        </div>
    }
  });

  ReactDOM.render(
    <Main />,
    document.body
  );
});
