define(["messages"], function (Messages) {
    var FrameControl = React.createClass({
        getInitialState: function() {
            return {paused: false};
        },
        playFrame: function() {
            this.setState({paused: false});
            Messages.sendMessage(this.props.activeContext, messageType.FRAME_CONTROL_PLAY, {});
        },
        pauseFrame: function() {
            this.setState({paused: true});
            Messages.sendMessage(this.props.activeContext, messageType.FRAME_CONTROL_PAUSE, {});
        },
        nextFrame: function() {
            if (!this.state.paused) {
                return;
            }
            Messages.sendMessage(this.props.activeContext, messageType.FRAME_CONTROL_NEXT_FRAME, {});
        },
        render: function() {
            var button = <button onClick={this.pauseFrame}>Pause Frame</button>;
            if (this.state.paused) {
                button = <button onClick={this.playFrame}>Play Frame</button>;
            }
            return <div className="container">
                <div className="heading">
                    Frame Control
                </div>
                <div>
                    Pauses and controls animated frames.
                </div>
                <div>{button}&nbsp;&nbsp;<button onClick={this.nextFrame}>Next Frame</button>
                </div>
            </div>;
        }
    });
    return FrameControl;
});
