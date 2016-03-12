define(["jsx!tab_bar_element"], function (TabBarElement) {
    var TabBar = React.createClass({
        getInitialState: function() {
            return {clicked: 0};
        },
        handleClick: function(i) {
            this.setState({clicked: i});
            this.props.changeTab(i);
        },
        getTabs: function() {
            tabResult = [];
            for (var i = 0; i < this.props.tabs.length; i++) {
                el = <TabBarElement name={this.props.tabs[i]}
                        selected={this.state.clicked == i}
                        onClick={this.handleClick.bind(this, i)} />
                tabResult.push(el);
            }
            return tabResult
        },
        render: function() {
            return <div className="tab-bar">
                {this.getTabs()}
            </div>;
        }
    });
    return TabBar;
});
