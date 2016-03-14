var globalGraph = null; // TODO: integrate with react
define([], function () {
    var ProfileGraph = React.createClass({
        componentDidMount: function() {
            this.updateGraph();
        },
        componentDidUpdate: function() {
            this.updateGraph();
        },
        updateGraph: function() {
            var pData = this.props.profileData[1];

            var sortList = [];
            for (var i=0; i<pData.labels.length; i++) {
                sortList.push({"label": pData.labels[i], "value": pData.values[i]});
            }
            sortList.sort(function(a, b) {
                return a.value - b.value;
            });

            debugger
            var data = {
                labels: sortList.map(function(a) {return a.label}),
                datasets: [
                    {
                        label: "Call Frequency",
                        fillColor: "rgba(151,187,205,0.5)",
                        strokeColor: "rgba(151,187,205,0.8)",
                        highlightFill: "rgba(151,187,205,0.75)",
                        highlightStroke: "rgba(151,187,205,1)",
                        data: sortList.map(function(a) {return a.value})
                    }
                ]
            };
            var ctx = this.refs.canvas.getContext("2d");
            if (globalGraph) {
                globalGraph.destroy();
            }
            var graph = new Chart(ctx);
            globalGraph = graph.HorizontalBar(data, {responsive: true});
        },
        render: function() {
            return <canvas
                style={{"margin-left":"50px", "margin-right": "100px"}}
                className="profile-graph"
                ref={"canvas"}>
            </canvas>;
        }
    });
    return ProfileGraph;
});
