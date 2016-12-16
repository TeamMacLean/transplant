import React from 'react';
import render from 'react-dom';
import Textarea from 'react-textarea-autosize';
import moment from 'moment';
import Dragula from 'dragula';
import TokenInput from 'react-tokeninput';

import Select from 'react-select';
import 'react-select/dist/react-select.css';


function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

const Configuration = React.createClass({
    displaneName: 'configuration',
    getInitialState: function getInitialState() {
        return {
            colors: [],
            selectedGenotypes: [],
            selectedStrains: [],
            selectedVectors: []
        }
    },
    render: function render() {
        var strains = ['GV3101 (pMP90)', 'AGL1', 'GALLS', 'LBA4404', 'EHA105', 'C58'].map(s=> {
            return {value: s, label: s}
        });
        var self = this;
        return (
            <li>
                <div className="row">
                    <div className="col11">
                        <div className="row">
                            <div className="col4">
                                <fieldset>
                                    <label className="center">Strains</label>
                                    <p>//show reccomended option</p>
                                    <Select.Creatable
                                        name={"config-strains" + self.props.uid}
                                        value={this.state.selectedStrains}
                                        options={strains}
                                        onChange={function (selectedStrains) {
                                            self.setState({selectedStrains});
                                        }}
                                    />
                                </fieldset>
                            </div>
                            <div className="col4">
                                <fieldset>
                                    <label className="center">Genotypes</label>

                                    <Select
                                        name={"config-genomes" + self.props.uid}
                                        value={this.state.selectedGenotypes}
                                        multi={true}
                                        options={this.props.genotypes}
                                        onChange={function (selectedGenotypes) {
                                            self.setState({selectedGenotypes});
                                        }}
                                        noResultsText="No Genotypes added"
                                        placeholder="Select Genotypes"
                                    />
                                </fieldset>
                            </div >

                            <div className="col4">
                                <fieldset>
                                    <label className="center">Vectors</label>
                                    <Select.Creatable
                                        name={"config-vectors" + self.props.uid}
                                        value={this.state.selectedVectors}
                                        multi={true}
                                        options={[]}
                                        onChange={function (selectedVectors) {
                                            self.setState({selectedVectors});
                                        }}
                                    />
                                </fieldset>
                            </div>
                        </div>
                    </div>
                    <div className="col1">
                        <div className="remove-button" onClick={this.props.removeConfig.bind(null, this)}>
                            <i className="icon-close"/>
                        </div>
                    </div>
                </div>
                <hr/>
            </li>
        )
    }
});

const Construct = React.createClass({
    displayName: 'construct',
    getInitialState: function getInitialState() {
        return {
            genotype: '',
            name: '',
            backbone: '',
            strain: '',
            vector: '',
            tdna: '',
            configurations: [{key: guid()}]
        };
    },
    addConfig: function addConfig() {
        this.setState({
            configurations: this.state.configurations.concat([{key: guid()}])
        });
    },
    removeConfig: function removeConfig(config) {

        if (this.state.configurations.length > 1) {

            if (confirm('Remove this configuration?')) {

                const newConfigurations = this.state.configurations.filter(function (c) {
                    return c.key != config.props.uid;
                });
                this.setState({configurations: newConfigurations});
            }
        }
    },
    componentDidMount: function () {
    },
    render: function render() {
        var self = this;
        return (
            <div className="draggable">
                <div className="construct">
                    <div className="row is-table-row">
                        <div className="col11 is-table-col">
                            <div className="construct-inner">
                                <div className="row">
                                    <div className="col4">
                                        <fieldset>
                                            <label className="center">Name</label>
                                            <input type="text"
                                                   name={"name" + self.props.uid}
                                                   placeholder="TODO"
                                                   required="true"
                                            />
                                        </fieldset>
                                    </div>

                                    <div className="col4">
                                        <fieldset>
                                            <label className="center">Backbone</label>
                                            <input type="text"
                                                   name={"backbone" + self.props.uid}
                                                   placeholder="TODO"
                                                   required="true"
                                            />
                                        </fieldset>
                                    </div>
                                    <div className="col4">
                                        <fieldset>
                                            <label className="center">T-DNA</label>
                                            <input type="text"
                                                   name={"t-dna" + self.props.uid}
                                                   placeholder="TODO"
                                                   required="true"
                                            />
                                        </fieldset>
                                    </div>
                                </div>

                                <div className="row">
                                    <div className="col12">
                                        <h3 className="center">Configurations</h3>
                                        <ul>
                                            {this.state.configurations.map(c=> {
                                                return <Configuration key={c.key} genotypes={this.props.genotypes}
                                                                      removeConfig={this.removeConfig} uid={c.key}
                                                />
                                            })}
                                        </ul>
                                        <div className="row">
                                            <div className="col12">
                                                <div className="wide button tall has-icon" onClick={this.addConfig}>ADD
                                                    CONFIGURATION
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col1 is-table-col">
                            <div className="tab" onClick={self.props.removeConstruct.bind(null, this)}>
                                <p className="rotate">REMOVE</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
});


const App = React.createClass({
    displayName: 'app',
    componentDidMount: function componentDidMount() {
        this.addConstruct();
        Dragula([document.getElementById('constructs')])

    },
    getInitialState: function getInitialState() {
        return {
            date: moment().format('DD/MM/YYYY'),
            constructs: [],
            options: [],
            genotypes: [],
        };
    },
    addConstruct: function () {
        const uid = guid();
        this.setState({
            constructs: this.state.constructs.concat([{uid: uid, key: uid}])
        });
    },
    removeConstruct: function (construct) {
        if (this.state.constructs.length > 1) {
            if (confirm('Remove this construct?')) {
                const newConstructs = this.state.constructs.filter(function (c) {
                    return c.uid != construct.props.uid;
                });
                this.setState({constructs: newConstructs});
            }
        }
    },
    render: function render() {
        const self = this;
        return (
            <form method="post" action="/new">

                <p>Add shpard tutorial</p>

                <div className="row">
                    <div className="col12">
                        <h1 className="center">New Request</h1>
                    </div>
                </div>
                <div className="row">
                    <div className="col4 center">
                        <fieldset>
                            <label>Date</label>
                            <input type="text" id="date" name="date" value={this.state.date} readOnly="true"
                                   required="true"/>
                        </fieldset>
                    </div>
                    <div className="col4 center">
                        <fieldset>
                            <label>Name and Lab .No.</label>
                            <input type="text" defaultValue={window.signedInUser.name} readOnly="true" required="true"/>
                        </fieldset>
                    </div>
                    <div className="col4 center">
                        <fieldset>
                            <label>Group Leader</label>
                            <input type="text" readOnly="true" required="true"/>
                        </fieldset>
                    </div>
                </div>

                <hr/>

                <div className="row">
                    <div className="col6">
                        <fieldset>
                            <h2 className="center">Species</h2>
                            <Select
                                name={"config-genomes" + self.props.uid}
                                value={this.state.selectedGenotypes}
                                multi={true}
                                options={this.props.genotypes}
                                onChange={function (selectedGenotypes) {
                                    self.setState({selectedGenotypes});
                                }}
                                noResultsText="No Genotypes added"
                                placeholder="Select Genotypes"
                            />
                            <p>If not shown in the list please <a href="#">contact us</a></p>
                        </fieldset>
                    </div>
                    <div className="col6">
                        <fieldset>
                            <h2 className="center">Genotypes</h2>
                            <TokenInput
                                onSelect={function (a) {

                                    if (/\S/.test(a)) {
                                        // string is not empty and not just whitespace
                                        if (self.state.genotypes.filter(g=> {
                                                return g.name == a;
                                            }).length < 1) {
                                            self.setState({
                                                genotypes: self.state.genotypes.concat([{
                                                    key: guid(),
                                                    name: a,
                                                    id: a,
                                                    value: a,
                                                    label: a
                                                }])
                                            });
                                        }
                                    }
                                }}
                                onRemove={function (a) {
                                    self.setState({
                                        genotypes: self.state.genotypes.filter(x=> {
                                            {
                                            }
                                            return x != a
                                        })
                                    });
                                }}
                                onInput={function (a) {
                                    return null;
                                }}
                                selected={self.state.genotypes}
                                placeholder='List all here'
                            />
                        </fieldset>
                    </div>

                </div>


                <hr/>

                <h2 className="center">Constructs</h2>

                <div id="constructs">
                    {/*{this.state.constructs}*/}

                    {this.state.constructs.map(c=> {
                        return <Construct uid={c.uid} key={c.uid}
                                          removeConstruct={this.removeConstruct}
                                          genotypes={this.state.genotypes}
                        />
                    })}

                </div>

                <p><span className="tip">Tip: You can drag constructs to set your priority</span></p>

                <div className="row">
                    <div className="col12">
                        <div className="wide button tall has-icon" onClick={this.addConstruct}>ADD CONSTRUCT</div>
                    </div>
                </div>

                <hr/>

                <fieldset>
                    <h2 className="center">Notes</h2>
                    <Textarea rows={3} className="wide"/>
                </fieldset>
                <fieldset>
                    <input type="submit" className="wide" value="Submit"/>
                </fieldset>
            </form>
        )
    }
});

render.render(React.createElement(App), document.getElementById('app'));
