define([], function () {
    var Feedback = React.createClass({
        disableExtension: function() {
            chrome.storage.sync.set({"glpEnabled": false}, function() {
                chrome.devtools.inspectedWindow.reload()
                window.location.reload();
            });
        },
        render: function() {
            return <div className="container">
                        <div className="heading">Feedback</div>
                        <div>
                            Want to give us feedback? Open an issue on Github&nbsp;
                            <a href="https://github.com/3Dparallax/insight/issues" target="_blank">
                                here.
                            </a>
                        </div>
                        <div>We'd love to know how to make Insight better for you!</div>
                   </div>;
        }
    });
    return Feedback;
});
