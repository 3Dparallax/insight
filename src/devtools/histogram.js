function getFunctionHistogram(e) {
    var checked = document.getElementById("functionHistogramEnabled").checked;
    if (!checked) return;
    sendMessage(messageType.FUNCTION_HISTOGRAM, {threshold: 10});
}

document.getElementById("functionHistogram").addEventListener("click", getFunctionHistogram);

function toggleFunctionHistogram(e) {
    var checked = document.getElementById("functionHistogramEnabled").checked;
    var data = {"enabled": checked};
    sendMessage(messageType.TOGGLE_FUNCTION_HISTOGRAM, data)
}

document.getElementById("toggleFunctionHistogram").addEventListener("click", toggleFunctionHistogram);

function displayHistogram(histogram) {
    if (histogram == null) {
        return;
    }
    var data = {
        labels: histogram.labels,
        datasets: [
            {
                label: "Call Frequency",
                fillColor: "rgba(151,187,205,0.5)",
                strokeColor: "rgba(151,187,205,0.8)",
                highlightFill: "rgba(151,187,205,0.75)",
                highlightStroke: "rgba(151,187,205,1)",
                data: histogram.values
            }
        ]
    };
    console.log("Displaying histogram");
    console.log(histogram);
    var ctx = document.getElementById("myChart").getContext("2d");
    if (glpFrontEnd.myBarChart != undefined) {
        glpFrontEnd.myBarChart.destroy();
    }
    glpFrontEnd.myBarChart = new Chart(ctx).HorizontalBar(data, {});
}
