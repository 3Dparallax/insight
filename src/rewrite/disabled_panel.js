define([], function () {
    var DisabledPanel = React.createClass({
        enableExtension: function() {
            chrome.storage.sync.set({"glpEnabled": true}, function(e) {
                chrome.devtools.inspectedWindow.reload();
                window.location.reload();
            });
        },
        render: function() {
            return <div className="center">
                        <div className="heading">WebGL Insight is currently disabled</div>
                        <button onClick={this.enableExtension}>Click to refresh page and enable</button>
                   </div>;
        }
    });
    return DisabledPanel;
});
