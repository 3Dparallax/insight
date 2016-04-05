define(["jsx!ctx", "messages", "jsx!no_contexts", "jsx!context_bar_element", "jsx!refresh_icon"],
function (Ctx, Messages, NoContexts, ContextBarElement, RefreshIcon) {
    var Panel = React.createClass({
        getInitialState: function() {
            return {"contexts": [], "activeContext": null}
        },
        componentWillMount: function() {
            Messages.connection.onMessage.addListener(function(msg) {
                if (msg.source != "content") {return;}

                if (msg.type == messageType.GET_CONTEXTS) {
                    contexts = JSON.parse(msg.data.contexts);
                    activeContext = null;

                    // Maintain the same active context if possible
                    if (this.state.activeContext) {
                        for (var i=0; i<contexts.length; i++) {
                            if (contexts[i].__uuid == this.state.activeContext) {
                                activeContext = this.state.activeContext;
                            }
                        }
                    }

                    // If no existing active context, select the first one
                    if (!activeContext && contexts.length > 0) {
                        activeContext = contexts[0].__uuid;
                    }

                    this.setState({"contexts": contexts, "activeContext": activeContext});
                    return;
                }
            }.bind(this));
            Messages.sendMessage("", messageType.GET_CONTEXTS, {});
        },
        componentWillUpdate: function(nextProps, nextState) {
            // If we're switch to a new context, disable the old context
            if (this.state.activeContext != nextState.activeContext) {
                Messages.sendMessage(this.state.activeContext, messageType.DISABLE_ALL, {});
            }
        },
        handleContextClick: function(uuid) {
            this.setState({"activeContext": uuid});
        },
        getContextElements: function() {
            contextResult = [];
            for (var i = 0; i < this.state.contexts.length; i++) {
                el = <ContextBarElement name={this.state.contexts[i].__name}
                        selected={this.state.activeContext == this.state.contexts[i].__uuid}
                        onClick={this.handleContextClick.bind(this, this.state.contexts[i].__uuid)} />
                contextResult.push(el);
            }
            return contextResult;
        },
        render: function() {
            if (this.state.contexts.length == 0) {
                return <NoContexts />;
            }
            return <div className="panel">
                <div className="context-container">
                    <Ctx activeContext={this.state.activeContext}/>
                </div>
                <div className="context-bar">
                    {this.getContextElements()}
                </div>
                <RefreshIcon/>
            </div>;
        }
    });
    return Panel;
});
