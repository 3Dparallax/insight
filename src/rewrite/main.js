define(["jsx!panel"], function (Panel) {
  var Main = React.createClass({
    render: function() {
      return <Panel />;
    }
  });

  ReactDOM.render(
    <Main />,
    document.getElementById('main')
  );
});