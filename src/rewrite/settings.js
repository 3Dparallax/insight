define([], function () {
    var Settings = React.createClass({
        disableExtension: function() {
            chrome.storage.sync.set({"glpEnabled": false}, function() {
                chrome.devtools.inspectedWindow.reload()
                window.location.reload();
            });
        },
        render: function() {
            return <div>
                        Settings Tab
                        <button onClick={this.disableExtension}>Disable Extension</button>
                   </div>;
        }
    });
    return Settings;
});
