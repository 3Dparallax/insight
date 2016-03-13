define([], function () {
    var ProfileTable = React.createClass({
        getProfileColumn: function(data, truncate) {
            result = [];
            for (var i = 0; i < data.length; i++) {
                var className = "profile-table-column-element";
                if (i == 0) {
                    className += " profile-table-column-element-header";
                }
                if (truncate) {
                    className += " profile-table-column-element-truncate"
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
                return a.value - b.value;
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

            var sortList = []
            for (x in histogram) {
                sortList.push({"value": histogram[x][0], "key": histogram[x][1]});
            }
            sortList.sort(function(a, b) {
                return a.value - b.value;
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
        getCallStackColumns: function(data) {
            maxSize = 0;
            for (var i=0; i<data.length; i++) {
                arg = JSON.parse(data[i].args);
                data[i].argsList = arg;
                maxSize = Math.max(Object.keys(arg).length, maxSize);
            }
            var functionCall = ["Function Call"].concat(data.map(function(a) {return a.name}));
            var time = ["Time"].concat(data.map(function(a) {return a.executionTime}));
            var duration = ["Duration (μs)"].concat(data.map(function(a) {return a.time}));

            var columns = [];
            columns.push(this.getProfileColumn(functionCall));
            columns.push(this.getProfileColumn(time));
            columns.push(this.getProfileColumn(duration));

            for (var i=0; i<maxSize; i++) {
                args = ["Argument" + i].concat(data.map(function(a) {
                    if (i <= (Object.keys(a).length - 1)) {
                        val = a.argsList[String(i)];
                        if (val && val.__uuid) {
                            delete val["__uuid"];
                        }
                        return JSON.stringify(val);
                    } else {
                        return "";
                    }
                }));
                columns.push(this.getProfileColumn(args, true));
            }

            return columns;
        },
        render: function() {
            var type = this.props.profileData[0];
            var data = this.props.profileData[1];
            var columns = [];
            if (type == 0) {
                // Program Usage Counts
                columns = this.getProgamUsageCountColumns(data);
            } else if (type == 1) {
                // Duplicate Program Usage
                columns = this.getDuplicateProgramColumns(data);
            } else if (type == 2) {
                // Call Stack
                columns = this.getCallStackColumns(data);
            } else if (type == 3) {
                // Call Stack Draw
                columns = this.getCallStackColumns(data);
            }
            return <div className="profile-table">
                {columns}
            </div>;
        }
    });
    return ProfileTable;
});
