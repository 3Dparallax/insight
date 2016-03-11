define([], function () {
    var ContextBarElement = React.createClass({
        render: function() {
            var className = "context-bar-element"
            if (this.props.selected) {
                className += " context-bar-element-selected";
            }
            return <div className={className} onClick={this.props.onClick}>{this.props.name}</div>;
        }
    });
    return ContextBarElement;
});
