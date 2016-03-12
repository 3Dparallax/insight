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
        render: function() {
            var type = this.props.profileData[0];
            var data = this.props.profileData[1];
            var columns = [];
            // Program Usage Counts
            if (type == 0) {
                columns = this.getProgamUsageCountColumns(data);
            }
            return <div className="profile-table">
                {columns}
            </div>;
        }
    });
    return ProfileTable;
});
