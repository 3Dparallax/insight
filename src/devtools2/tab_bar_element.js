define([], function () {
    var TabBarElement = React.createClass({
        render: function() {
            var className = "tab-bar-element"
            if (this.props.selected) {
                className += " tab-bar-element-selected"
            }
            return <div className={className} onClick={this.props.onClick}>
                        {this.props.name}
                    </div>;
        }
    });
    return TabBarElement;
});
