define(["jsx!ctx"], function (Ctx) {
    var Panel = React.createClass({
        render: function() {
            return <div>
                <Ctx />
                <div>Bottom Context Bar</div>
            </div>;
        }
    });
    return Panel;
});