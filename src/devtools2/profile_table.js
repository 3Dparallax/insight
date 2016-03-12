define([], function () {
    var ProfileTable = React.createClass({
        getProfileColumn: function(data) {
            result = [];
            for (var i = 0; i < data.length; i++) {
                var className = "profile-table-column-element";
                if (i == 0) {
                    className += " profile-table-column-element-header";
                }
                el = <div className={className}>{data[i]}</div>
                result.push(el);
            }
            return <div className="profile-table-column">
                {result}
            </div>;
        },
        getProgamUsageCountColumns: function(data) {
            var columns = [];
            var sortList = [];
            for (x in data) {
                sortList.push({"value": data[x], "key": x});
            }
            sortList.sort(function(a, b) {
                return a.value > b.value;
            });

            var programs = ["Programs"].concat(sortList.map(function(a) {return a.key}));
            var values = ["Usages"].concat(sortList.map(function(a) {return a.value}));

            columns.push(this.getProfileColumn(programs));
            columns.push(this.getProfileColumn(values));
            return columns;
        },
        getDuplicateProgramColumns: function(data) {
            var columns = [];

            var histogram = {};
            for (var i=0; i<data.length; i++) {
                var x = data[i];
                var id = JSON.stringify(x);
                if (id in histogram) {
                    histogram[id] = [histogram[id][0] + 1, x]
                } else {
                    histogram[id] = [1, x]
                }
            }
            console.log(histogram);

            var sortList = []
            for (x in histogram) {
                sortList.push({"value": histogram[x][0], "key": histogram[x][1]});
            }
            sortList.sort(function(a, b) {
                return a.value > b.value;
            });

            var programId = ["Program ID"].concat(sortList.map(function(a) {return a.key.programId}));
            var callLocation = ["Call Location"].concat(sortList.map(function(a) {return a.key.functionName + ":" + a.key.lineNumber}));
            var fileName = ["File Name"].concat(sortList.map(function(a) {return a.key.fileName}));
            var occurences = ["Occurences"].concat(sortList.map(function(a) {return a.value}));

            columns.push(this.getProfileColumn(programId));
            columns.push(this.getProfileColumn(callLocation));
            columns.push(this.getProfileColumn(fileName));
            columns.push(this.getProfileColumn(occurences));
            return columns;
        },
        render: function() {
            var type = this.props.profileData[0];
            var data = this.props.profileData[1];
            var columns = [];
            // Program Usage Counts
            if (type == 0) {
                columns = this.getProgamUsageCountColumns(data);
            } else if (type == 1) {
                columns = this.getDuplicateProgramColumns(data);
            }
            return <div className="profile-table">
                {columns}
            </div>;
        }
    });
    return ProfileTable;
});
