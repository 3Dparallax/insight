define([], function () {
    var Settings = React.createClass({
        disableExtension: function() {
            chrome.storage.sync.set({"glpEnabled": false}, function() {
                chrome.devtools.inspectedWindow.reload()
                window.location.reload();
            });
        },
        render: function() {
            return <div className="container">
                        <div className="heading">Settings</div>
                        <div>
                            Disable WebGL Insight&nbsp;&nbsp;<button onClick={this.disableExtension}>Disable</button>
                        </div>
                   </div>;
        }
    });
    return Settings;
});
