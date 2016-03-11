define(["jsx!ctx", "messages", "jsx!no_contexts"], function (Ctx, Messages, NoContexts) {
    var Panel = React.createClass({
        getInitialState: function() {
            return {"contexts": []}
        },
        componentWillMount: function() {
            Messages.connection.onMessage.addListener(function(msg) {
                if (msg.source != "content") {return;}

                console.log(msg);
                if (msg.type == messageType.GET_CONTEXTS) {
                    this.setState({"contexts": JSON.parse(msg.data.contexts)});
                    return;
                }
            }.bind(this));
            Messages.sendMessage("", messageType.GET_CONTEXTS, {});
        },
        render: function() {
            if (this.state.contexts.length == 0) {
                return <NoContexts />;
            }
            return <div>
                <Ctx />
                <div>Bottom Context Bar</div>
            </div>;
        }
    });
    return Panel;
});
