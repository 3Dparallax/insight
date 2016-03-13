define(["messages"], function (Messages) {
  var Program = React.createClass({
    componentDidMount: function() {
      this.highlightCode();
    },
    componentDidUpdate: function() {
      this.highlightCode();
    },
    highlightCode: function() {
      Prism.highlightAll(true);
    },
    render: function() {
      return <div className="program-container">
        <div className="heading container">
          {"Program " + this.props.programData.programId}
        </div>
        <div className="program-table">
          <div className="program-column">
            <div className="profile-table-column-element profile-table-column-element-header">
              Vertex Shader
            </div>
            <pre className="program-element">
              <code className={"language-glsl"}>{this.props.programData.shaderSources[0]}</code>
            </pre>
          </div>
          <div className="program-column">
            <div className="profile-table-column-element profile-table-column-element-header">
              Fragment Shader
            </div>
            <pre className="program-element">
              <code className={"language-glsl"}>{this.props.programData.shaderSources[1]}</code>
            </pre>
          </div>
        </div>
      </div>;
    }
  });
  return Program;
});
