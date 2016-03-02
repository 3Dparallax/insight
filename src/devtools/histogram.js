function getFunctionHistogram(e) {
    sendMessage(messageType.FUNCTION_HISTOGRAM, {threshold: 10});
}

document.getElementById("functionHistogram").addEventListener("click", getFunctionHistogram);

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
    var ctx = document.getElementById("myChart").getContext("2d");
    var myBarChart = new Chart(ctx).Bar(data, {});
}
