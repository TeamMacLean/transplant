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

            <form>
                <h1 className="center">New Request</h1>
                <fieldset>
                    <label>Date</label>
                    <input type="date"/>
                </fieldset>
                <fieldset>
                    <label>Name and Lab .No.</label>
                    <input type="text" defaultValue={window.signedInUser.name} readOnly="true"/>
                </fieldset>
                <fieldset>
                    <label>Group Leader/Project No.</label>
                    <input type="text"/>
                </fieldset>
                <fieldset>
                    <label>Plant to be Transformed (species and genotype)</label>
                    <input type="text"/>
                </fieldset>
                <fieldset>
                    <label>Construct Name</label>
                    <input type="text"/>
                </fieldset>
                <fieldset>
                    <label>Binary Vector Backbone</label>
                    <input type="text"/>
                </fieldset>
                <fieldset>
                    <label>Agrobacterium tumefaciens Strain</label>
                    <input type="text"/>
                </fieldset>
                <fieldset>
                    <label>Binary Vector Selection (in Agrobacterium tumefaciens)</label>
                    <input type="text"/>
                </fieldset>
                <fieldset>
                    <label>T-DNA Selection (in planta)</label>
                    <input type="text"/>
                </fieldset>
                <fieldset>
                    <label>Approved by Group Leader</label>
                    <p>Group leader will receive an email asking them to approve.</p>
                </fieldset>
                <fieldset>
                    <label>Notes</label>
                    <textarea></textarea>
                </fieldset>
                <fieldset>
                    <button>Submit</button>
                </fieldset>
            </form>
        )
    }
});

ReactDOM.render(React.createElement(App), document.getElementById('app'));
