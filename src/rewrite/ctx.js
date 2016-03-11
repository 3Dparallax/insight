tabs = [
    "Program Usage",
    "Program Duplicates",
    "Call Stack",
    "Call Histogram",
    "Resources",
    "States"
]

define(["jsx!tab_bar"], function (TabBar) {
    var ctx = React.createClass({
        changeTab: function(i) {
            console.log("UP", i);
        },
        render: function() {
            return <div>
                <TabBar tabs={tabs} changeTab={this.changeTab} />
                <div>Content</div>
            </div>;
        }
    });
    return ctx;
});