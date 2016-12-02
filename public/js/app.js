"use strict";

var App = React.createClass({
    displayName: 'app',
    componentDidMount: function componentDidMount() {},
    getInitialState: function getInitialState() {
        return {};
    },
    render: function render() {
        var self = this;

        return React.createElement(
            "form",
            null,
            React.createElement(
                "h1",
                { className: "center" },
                "New Request"
            ),
            React.createElement(
                "fieldset",
                null,
                React.createElement(
                    "label",
                    null,
                    "Date"
                ),
                React.createElement("input", { type: "date" })
            ),
            React.createElement(
                "fieldset",
                null,
                React.createElement(
                    "label",
                    null,
                    "Name and Lab .No."
                ),
                React.createElement("input", { type: "text", defaultValue: window.signedInUser.name, readOnly: "true" })
            ),
            React.createElement(
                "fieldset",
                null,
                React.createElement(
                    "label",
                    null,
                    "Group Leader/Project No."
                ),
                React.createElement("input", { type: "text" })
            ),
            React.createElement(
                "fieldset",
                null,
                React.createElement(
                    "label",
                    null,
                    "Plant to be Transformed (species and genotype)"
                ),
                React.createElement("input", { type: "text" })
            ),
            React.createElement(
                "fieldset",
                null,
                React.createElement(
                    "label",
                    null,
                    "Construct Name"
                ),
                React.createElement("input", { type: "text" })
            ),
            React.createElement(
                "fieldset",
                null,
                React.createElement(
                    "label",
                    null,
                    "Binary Vector Backbone"
                ),
                React.createElement("input", { type: "text" })
            ),
            React.createElement(
                "fieldset",
                null,
                React.createElement(
                    "label",
                    null,
                    "Agrobacterium tumefaciens Strain"
                ),
                React.createElement("input", { type: "text" })
            ),
            React.createElement(
                "fieldset",
                null,
                React.createElement(
                    "label",
                    null,
                    "Binary Vector Selection (in Agrobacterium tumefaciens)"
                ),
                React.createElement("input", { type: "text" })
            ),
            React.createElement(
                "fieldset",
                null,
                React.createElement(
                    "label",
                    null,
                    "T-DNA Selection (in planta)"
                ),
                React.createElement("input", { type: "text" })
            ),
            React.createElement(
                "fieldset",
                null,
                React.createElement(
                    "label",
                    null,
                    "Approved by Group Leader"
                ),
                React.createElement(
                    "p",
                    null,
                    "Group leader will receive an email asking them to approve."
                )
            ),
            React.createElement(
                "fieldset",
                null,
                React.createElement(
                    "label",
                    null,
                    "Notes"
                ),
                React.createElement("textarea", null)
            ),
            React.createElement(
                "fieldset",
                null,
                React.createElement(
                    "button",
                    null,
                    "Submit"
                )
            )
        );
    }
});

ReactDOM.render(React.createElement(App), document.getElementById('app'));