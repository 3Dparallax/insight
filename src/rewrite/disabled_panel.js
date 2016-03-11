define([], function () {
    var DisabledPanel = React.createClass({
        enableExtension: function() {
            chrome.storage.sync.set({"glpEnabled": true}, function(e) {
                chrome.devtools.inspectedWindow.reload();
                window.location.reload();
            });
        },
        render: function() {
            return <div>
                        The extension is currently disabled.
                        <button onClick={this.enableExtension}>Enable Extension</button>
                   </div>;
        }
    });
    return DisabledPanel;
});
