const App = React.createClass({
    displayName: 'app',
    componentDidMount: function componentDidMount() {
    },
    getInitialState: function getInitialState() {
        return {}
    },
    render: function render() {
        const self = this;

        return (
            <div>

                {initParts.map(function (object, i) {
                    return <Part key={i}>{object}</Part>;
                })}

            </div>
        )
    }
});

ReactDOM.render(React.createElement(App), document.getElementById('app'));
