import React from 'react';
import render from 'react-dom';
import Textarea from 'react-textarea-autosize';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import {Typeahead} from 'react-typeahead';

require('react-datepicker/dist/react-datepicker.css');

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

const Construct = React.createClass({
    displayName: 'construct',
    removeConstruct: function () {

    },
    getInitialState: function getInitialState() {
        return {
            plant: '',
            name: '',
            backbone: '',
            strain: '',
            vector: '',
            tdna: ''
        };
    },
    setPlant: function (event) {
        this.setState({plant: event.target.value}, function () {
            this.props.reloadOptions(this);
        });

    },
    setName: function (event) {
        this.setState({name: event.target.value}, function () {
            this.props.reloadOptions(this);
        });
    },
    setBackbone: function (event) {
        this.setState({backbone: event.target.value}, function () {
            this.props.reloadOptions(this);
        });
    },
    setStrain: function (event) {
        this.setState({strain: event.target.value}, function () {
            this.props.reloadOptions(this);
        });
    },
    setVector: function (event) {
        this.setState({vector: event.target.value}, function () {
            this.props.reloadOptions(this);
        });
    },
    setTDNA: function (event) {
        this.setState({tdna: event.target.value}, function () {
            this.props.reloadOptions(this);
        });
    },
    render: function render() {
        var self = this;
        return (
            <div className="construct">
                <div className="row">
                    <div className="col11">
                        <div className="row">
                            <div className="col4">
                                <fieldset>
                                    <label className="center">Plant</label>
                                    <Typeahead
                                        placeholder="TODO"
                                        options={this.props.options.plant}
                                        onChange={this.setPlant}
                                    />
                                </fieldset>
                            </div>

                            <div className="col4">
                                <fieldset>
                                    <label className="center">Name</label>
                                    <Typeahead
                                        placeholder="TODO"
                                        options={this.props.options.name}
                                        onChange={this.setName}
                                    />
                                </fieldset>
                            </div>

                            <div className="col4">
                                <fieldset>
                                    <label className="center">Backbone</label>
                                    <Typeahead
                                        placeholder="TODO"
                                        options={this.props.options.backbone}
                                        onChange={this.setBackbone}
                                    />
                                </fieldset>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col4">
                                <fieldset>
                                    <label className="center">Strain</label>
                                    <Typeahead
                                        placeholder="TODO"
                                        options={this.props.options.strain}
                                        onChange={this.setStrain}
                                    />
                                </fieldset>
                            </div>
                            <div className="col4">
                                <fieldset>
                                    <label className="center">Vector</label>
                                    <Typeahead
                                        placeholder="TODO"
                                        options={this.props.options.vector}
                                        onChange={this.setVector}
                                    />
                                </fieldset>
                            </div>
                            <div className="col4">
                                <fieldset>
                                    <label className="center">T-DNA</label>
                                    <Typeahead
                                        placeholder="TODO"
                                        options={this.props.options.tdna}
                                        onChange={this.setTDNA}
                                    />
                                </fieldset>
                            </div>
                        </div>

                    </div>
                    <div className="col1">
                        <div className="remove-button" onClick={self.props.removeConstruct.bind(null, this)}>
                            <i className="icon-close"/>
                        </div>
                    </div>


                </div>
            </div>
        )

    }
});

var options = {}; //this is a bit ugly

const App = React.createClass({
    displayName: 'app',
    componentDidMount: function componentDidMount() {
        this.addConstruct();
    },
    getInitialState: function getInitialState() {
        return {
            startDate: moment(),
            constructs: [],
            options: []
        };
    },
    handleDateChange: function (date) {
        this.setState({
            startDate: date
        });
    },
    reloadOptions: function (a) {
        options[a.props.uid] = a.state;

        var obj = {
            backbone: [],
            name: [],
            plant: [],
            strain: [],
            tdna: [],
            vector: []
        };

        Object.keys(options).map(function (key) {
            var o = options[key];
            Object.keys(o).map(function (key) {

                if (o[key] && o[key].length && obj[key].indexOf(o[key]) < 0) {
                    obj[key].push(o[key])
                }
            });
        });

        this.setState({options: obj}, function () {
            // console.log(this.state.options);
        });


    },
    addConstruct: function () {
        const uid = guid();
        this.setState({
            constructs: this.state.constructs.concat([<Construct uid={uid} key={uid}
                                                                 removeConstruct={this.removeConstruct}
                                                                 options={this.state.options}
                                                                 reloadOptions={this.reloadOptions}/>])
        });
    },
    removeConstruct: function (construct) {
        const newConstructs = this.state.constructs.filter(function (c) {
            return c.props.uid != construct.props.uid;
        });
        this.setState({constructs: newConstructs});
    },
    render: function render() {
        return (
            <form>
                <div className="row">
                    <div className="col12">
                        <h1 className="center">New Request</h1>
                    </div>
                </div>
                <div className="row">
                    <div className="col4 center">
                        <fieldset>
                            <label>Date</label>
                            <DatePicker id="date" name="date" selected={this.state.startDate}
                                        onChange={this.handleDateChange}/>
                        </fieldset>
                    </div>
                    <div className="col4 center">
                        <fieldset>
                            <label>Name and Lab .No.</label>
                            <input type="text" defaultValue={window.signedInUser.name} readOnly="true"/>
                        </fieldset>
                    </div>
                    <div className="col4 center">
                        <fieldset>
                            <label>Group Leader</label>
                            <input type="text" readOnly="true"/>
                        </fieldset>
                    </div>
                </div>

                <hr/>

                {this.state.constructs}

                <div className="row">
                    <div className="col12">
                        <div className="wide button tall has-icon" onClick={this.addConstruct}>+</div>
                    </div>
                </div>

                <hr/>

                <fieldset>
                    <label>Notes</label>
                    <Textarea rows={3} className="wide"/>
                </fieldset>
                <fieldset>
                    <button>Submit</button>
                </fieldset>
            </form>
        )
    }
});

render.render(React.createElement(App), document.getElementById('app'));
