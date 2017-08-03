import React from 'react';
import render from 'react-dom';
import Textarea from 'react-textarea-autosize';
import moment from 'moment';
import Dragula from 'dragula';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import Shepherd from 'tether-shepherd';
import 'tether-shepherd/dist/css/shepherd-theme-arrows.css'

const speciesAndOptions = [
    {
        name: 'Arabidopsis thaliana', strains: [
        {name: 'AGL1', recommended: true},
        {name: 'GV3101 (pMP90)', recommended: true},
        {name: 'C58C1 pCH30'},
        {name: 'GV2260'},
        {name: 'GALLS'}
    ]
    },
    {
        name: 'Brachypodium distachyon', strains: [
        {name: 'AGL1', recommended: true}
    ]
    },
    {
        name: 'Brassica juncea', strains: [
        {name: 'AGL1', recommended: true}
    ]
    },
    {
        name: 'Brassica oleracea', strains: [
        {name: 'AGL1', recommended: true}
    ]
    },
    {
        name: 'Camelina sativa', strains: [
        {name: 'AGL1', recommended: true}
    ]
    },
    {
        name: 'Glycine max', strains: [
        {name: 'AGL1', recommended: true}
    ]
    },
    {
        name: 'Hordeum vulgare', strains: [
        {name: 'AGL1', recommended: true}
    ]
    },
    {
        name: 'Lotus japonicus', strains: [
        {name: 'AGL1', recommended: true}
    ]
    },
    {
        name: 'Medicago truncatula', strains: [
        {name: 'AGL1', recommended: true}
    ]
    },
    {
        name: 'Mirabilis jalapa', strains: [
        {name: 'AGL1', recommended: true}
    ]
    },
    {
        name: 'Nicotiana benthamiana', strains: [
        {name: 'AGL1', recommended: true},
        {name: 'GV3101 (pMP90)', recommended: true}
    ]
    },
    {
        name: 'Nicotiana tabacum', strains: [
        {name: 'AGL1', recommended: true},
        {name: 'GV3101 (pMP90)', recommended: true},
        {name: 'LBA4404'}
    ]
    },
    {
        name: 'Oryza sativa', strains: [
        {name: 'AGL1', recommended: true}
    ]
    },
    {
        name: 'Solanum lycopersicum', strains: [
        {name: 'AGL1', recommended: true}
    ]
    },
    {
        name: 'Solanum tuberosum', strains: [
        {name: 'AGL1', recommended: true},
        {name: 'LBA4404,'},
        {name: 'EHA105', recommended: true},
        {name: 'GALLS'}
    ]
    }
];

// export for others scripts to use
// window.$ = $;
// window.jQuery = jQuery;

function ToggleClass(el, className) {
    if (el.classList) {
        el.classList.toggle(className);
    } else {
        const classes = el.className.split(' ');
        const existingIndex = classes.indexOf(className);

        if (existingIndex >= 0)
            classes.splice(existingIndex, 1);
        else
            classes.push(className);

        el.className = classes.join(' ');
    }
}

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
            genotypes: [],
            // selectedStrains: [],
            selectedStrain: null,
            selectedVectors: [{
                label: "Rif",
                value: "Rifampicin"
            }],

        }
    },
    render: function render() {
        let strains = [];
        if (this.props.species) {
            strains = this.props.species.value.strains.map(as => {
                const recommendedAddon = as.recommended ? ' (recommended)' : '';
                return {value: as, label: as.name + recommendedAddon};
            });

        }
        const self = this;
        return (
            <li>
                <div className="row">
                    <div className="col11">
                        <div className="row">
                            <div className="col6">
                                <div id="strain-select">
                                    <fieldset>
                                        <label className="center"><span className="italic">Agro.</span> Strain</label>
                                        <Select.Creatable
                                            name={"config-strain#" + self.props.constructID + '#' + self.props.uid}
                                            value={this.state.selectedStrain}
                                            options={strains}
                                            onChange={function (selectedStrain) {
                                                self.setState({
                                                    selectedStrain: {
                                                        value: selectedStrain,
                                                        label: selectedStrain.value.name
                                                    }
                                                });
                                            }}
                                            noResultsText="No Strain added"
                                            placeholder="Select Agro. Strain"
                                        />
                                    </fieldset>
                                </div>
                            </div>
                            <div className="col6">
                                <div id="genotypes-pick">
                                    <fieldset>
                                        <label className="center">Plant Genotype(s)</label>

                                        <Select
                                            name={"config-genotypes#" + self.props.constructID + '#' + self.props.uid}
                                            value={this.state.genotypes}
                                            multi={true}
                                            options={this.props.genotypes}
                                            onChange={function (genotypes) {
                                                self.setState({genotypes});
                                            }}
                                            noResultsText="No Genotypes added"
                                            placeholder="Select Genotypes"
                                        />
                                    </fieldset>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col1">
                        <div className="remove-button" onClick={this.props.removeConfig.bind(null, this)}>
                            <i className="icon-close"/>
                        </div>
                    </div>
                </div>
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
            selectedTDNA: null,
            configurations: [{key: guid()}],
            availableTDNA: [
                {
                    value: "Kan",
                    label: "Kanamycin"
                },
                {
                    value: "Hygr",
                    label: "Hygromycin"
                },
                {
                    value: "Kan/Hyg",
                    label: "Kanamycin/Hygromycin"
                },

                {
                    value: "PPT",
                    label: "Phosphinothricin"
                },
                {
                    value: "Fast-Red",
                    label: "Fast-Red"
                },
                {
                    value: "Phosphite",
                    label: "Phosphite"
                },
                {
                    value: "CSR",
                    label: "Chlorsulfuron"
                }
            ],
            availableVectors: [
                {
                    value: "Kan",
                    label: "Kanamycin"
                },
                {
                    value: "Spec",
                    label: "Spectinomycin"
                },
                {
                    value: "Tet",
                    label: "Tetracycline"
                },
                {
                    value: "Hygr",
                    label: "Hygromycin"
                },
                {
                    value: "Kan/Hyg",
                    label: "Kanamycin/Hygromycin"
                }
            ]
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
        const self = this;
        return (
            <div className="draggable">
                <div className="construct">
                    <div className="row is-table-row">
                        <div className="col11 is-table-col">
                            <div className="construct-inner">
                                <div className="row">
                                    <div className="col4">
                                        <div id="name-select">
                                            <fieldset>
                                                <label className="center">Construct Name</label>
                                                <input type="text"
                                                       name={"name#" + self.props.uid}
                                                       placeholder=""
                                                       required="true"
                                                />
                                            </fieldset>
                                        </div>
                                    </div>

                                    <div className="col4">
                                        <div id="backbone-select">
                                            <fieldset>
                                                <label className="center">Binary Vector Backbone</label>
                                                <input type="text"
                                                       name={"backbone#" + self.props.uid}
                                                       placeholder=""
                                                       required="true"
                                                />
                                            </fieldset>
                                        </div>
                                    </div>
                                    <div className="col4">
                                        <div id="vector-select">
                                            <fieldset>
                                                <label className="center">Vector Selection</label>
                                                <Select.Creatable
                                                    name={"vectors#" + self.props.uid}
                                                    value={this.state.selectedVectors}
                                                    multi={true}
                                                    options={this.state.availableVectors}
                                                    onChange={function (selectedVectors) {
                                                        if (selectedVectors) {
                                                            selectedVectors = selectedVectors.map(s => {
                                                                return {
                                                                    label: s.value,
                                                                    value: s.value
                                                                };
                                                            });
                                                        }
                                                        self.setState({selectedVectors: selectedVectors});
                                                    }}
                                                    noResultsText="No Vector selected"
                                                    placeholder="Select Vector"
                                                />
                                            </fieldset>
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col12">
                                        <div id="tdna-select">
                                            <fieldset>
                                                <label className="center">T-DNA Selection</label>
                                                <Select.Creatable
                                                    name={"tdna#" + self.props.uid}
                                                    value={this.state.selectedTDNA}
                                                    options={this.state.availableTDNA}
                                                    onChange={function (selectedTDNA) {
                                                        if (selectedTDNA) {
                                                            selectedTDNA = {
                                                                label: selectedTDNA.value,
                                                                value: selectedTDNA.value
                                                            };
                                                        }
                                                        self.setState({selectedTDNA});
                                                    }}
                                                    noResultsText="No Vector selected"
                                                    placeholder="Select Vector"
                                                />
                                            </fieldset>
                                        </div>
                                    </div>
                                </div>

                                <hr/>

                                <div className="row">
                                    <div className="col12">
                                        {/*<h3 className="center"></h3>*/}
                                        <ul>
                                            {this.state.configurations.map(c => {
                                                return <Configuration key={c.key} constructID={self.props.uid}
                                                                      genotypes={this.props.genotypes}
                                                                      species={this.props.species}
                                                                      removeConfig={this.removeConfig} uid={c.key}
                                                />
                                            })}
                                        </ul>
                                        <div className="row">
                                            <div className="col12">
                                                <div id="add-strain-button" className="button center has-icon"
                                                     onClick={this.addConfig}>ADD ANOTHER STRAIN
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
    getInitialState: function getInitialState() {
        return {
            date: moment().format('DD/MM/YYYY'),
            constructs: [],
            options: [],
            genotypes: [],
            species: speciesAndOptions.map(sao => {
                return {value: sao, label: sao.name};
            }),
            selectedSpecies: null,
            tour: null,
            tourHidden: false,
            costCode: null
        };
    },
    toggleTour: function toggleTour() {
        //todo show toggle-tour
        const toggle = document.querySelectorAll('#toggle-tutorial');

        if (toggle && toggle.length) {
            ToggleClass(toggle[0], 'hidden');
        }

        if (this.state.tourHidden) {
            // this.state.tour.show();
            this.state.tour.start();
            this.setState({tourHidden: false});
        } else {
            // this.state.tour.hide();
            this.state.tour.cancel();
            this.setState({tourHidden: true});
        }


    },
    componentDidMount: function componentDidMount() {

        const self = this;

        this.addConstruct();

        Dragula([document.getElementById('constructs')]);

        let tour = new Shepherd.Tour({
            defaults: {
                classes: 'shepherd-theme-arrows'
            }
        });

        this.setState({tour});

        //TODO on step toggle item as active

        // tour.on('show', function (event) {
        //     // var el = document.querySelectorAll(event.step.getAttachTo().element);
        //     // console.log(event.step.getAttachTo(),el);
        //     ToggleClass(event.step.getAttachTo().element, 'tour-active')
        // });
        // tour.on('hide', function (event) {
        //     // var el = document.querySelectorAll(event.step.getAttachTo().element);
        //     // console.log(el);
        //     ToggleClass(event.step.getAttachTo().element, 'tour-active')
        // });

        const buttons = [
            {
                text: 'Exit',
                classes: 'shepherd-button-secondary',
                action: function () {

                    self.toggleTour();

                    // //todo show toggle-tour
                    // var toggle = document.querySelectorAll('#toggle-tutorial');
                    //
                    // if (toggle && toggle.length) {
                    //     ToggleClass(toggle[0], 'hidden');
                    // }
                    // return tour.hide();
                }
            }, {
                text: 'Next',
                action: tour.next,
                classes: 'shepherd-button-example-primary'
            }
        ];

        tour.addStep('species', {
            // title: 'Species',
            text: 'Select a species for this TRF from the dropdown list.',
            attachTo: '#species-select bottom',
            buttons: buttons
        });

        tour.addStep('genotype', {
            // title: 'Species',
            text: 'Type all of your genotypes that you will use in this TRF here. You can enter more than one.',
            attachTo: '#genotype-select bottom',
            buttons: buttons
        });


        tour.addStep('construct-name', {
            // title: 'Species',
            text: 'Type the name of your first construct and the binary vector backbone.',
            attachTo: '#name-select bottom',
            buttons: buttons
        });


        tour.addStep('tdna', {
            // title: 'Species',
            text: 'Select the T-DNA selection from the dropdown list, or enter your own.  (Assuming they have this option to type new ones, I’ve forgotten if we talked about it).',
            attachTo: '#tdna-select bottom',
            buttons: buttons
        });


        tour.addStep('strain', {
            // title: 'Species',
            text: 'There you can select which A. tumefaciens strain from the dropdown list. Only plant species compatible strains will be available.  (I will explain this at next meeting).',
            attachTo: '#strain-select bottom',
            buttons: buttons
        });


        tour.addStep('genotypes', {
            // title: 'Species',
            text: 'Select which genotypes, from the list you previously entered, that you would like transformed. You can select multiple.',
            attachTo: '#genotypes-pick bottom',
            buttons: buttons
        });


        tour.addStep('select-vector', {
            // title: 'Species',
            text: 'Now select the binary vector selection. The antibiotic required for your Agro. strain cannot be removed.  (I will explain this at next meeting).',
            attachTo: '#vector-select bottom',
            buttons: buttons
        });


        tour.addStep('another-agro', {
            // title: 'Species',
            text: 'If you want to add another Agro. strain for this construct, you can click here after this tutorial.',
            attachTo: '#add-strain-button bottom',
            buttons: buttons
        });
        tour.addStep('add more constructs', {
            // title: 'Species',
            text: 'You can also add more constructs after this tutorial.',
            attachTo: '#add-construct-button bottom',
            buttons: buttons
        });


        tour.addStep('addition-info', {
            // title: 'Species',
            text: 'If you have any additional information we should know, please enter it here, or contact us.',
            attachTo: '#notes top',
            buttons: buttons
        });
        tour.addStep('prootities', {
            // title: 'Species',
            text: 'If you have any construct priorities, simply click and drag to prioritise. We will work from the top.',
            attachTo: '#constructs bottom',
            buttons: buttons
        });
        tour.addStep('finished', {
            // title: 'Species',
            text: 'Finally, when you are finished, submit here and your request will be sent for authentication.',
            attachTo: '#submit top',
            buttons: buttons
        });


        tour.start();

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
            <div>
                <form method="post" action="/new">

                    <section>
                        <div className="row">
                            <div className="col12">
                                <h1 className="center">New Request</h1>
                            </div>
                        </div>
                        {/*</section>*/}
                        {/*<section>*/}
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
                                    <label>Name</label>
                                    <input type="text" defaultValue={window.signedInUser.name} readOnly="true"
                                           required="true"/>
                                </fieldset>
                            </div>
                            <div className="col4 center">
                                <fieldset>
                                    <label>Cost Code</label>


                                    <Select.Creatable
                                        name={"config-costcode"}
                                        value={window.adminInfo.cost}
                                        options={window.adminInfo.cost}
                                        onChange={function (costCode) {
                                            self.setState({costCode});
                                        }}
                                        noResultsText="No Cost Center added"
                                        placeholder="Select Cost Center"
                                    />

                                </fieldset>
                            </div>
                        </div>
                    </section>

                    <hr/>

                    <section>
                        <div className="row">
                            <div className="col6">
                                <div id="species-select">
                                    <fieldset>
                                        <h2 className="center">Species</h2>

                                        <div className="italic">
                                            <Select
                                                name={"config-species"}
                                                value={this.state.selectedSpecies}
                                                multi={false} //TODO this is probebly default
                                                options={this.state.species} //TODO get list from elliott
                                                onChange={function (selectedSpecies) { //TODO IF NOT col-0 flag it up
                                                    self.setState({selectedSpecies});

                                                }}
                                                noResultsText="No Species added"
                                                placeholder="Select Species"
                                            />
                                        </div>


                                        <p>If not shown in the list please <a href="#">contact us</a></p>
                                    </fieldset>
                                </div>
                            </div>
                            <div className="col6">
                                <div id="genotype-select">
                                    <fieldset>
                                        <h2 className="center">Genotype(s)</h2>


                                        <Select.Creatable
                                            name={"genotypes"}
                                            value={this.state.genotypes}
                                            className="genotype-select"
                                            multi={true}
                                            onChange={function (genotypes) {
                                                self.setState({genotypes});
                                            }}
                                            noResultsText="No Genotype(s) added"
                                            placeholder="Select Genotype(s)"
                                        />


                                    </fieldset>
                                </div>
                            </div>

                        </div>
                    </section>

                    <hr/>

                    <section>

                        <h2 className="center">Constructs</h2>

                        <div id="constructs">

                            {this.state.constructs.map(c => {
                                return <Construct uid={c.uid} key={c.uid}
                                                  species={this.state.selectedSpecies}
                                                  removeConstruct={this.removeConstruct}
                                                  genotypes={this.state.genotypes}
                                />
                            })}

                        </div>

                        <p><span className="tip">Tip: You can drag constructs to set your priority</span></p>

                        <div className="row">
                            <div className="col12">
                                <div id="add-construct-button" className="wide button tall has-icon"
                                     onClick={this.addConstruct}>ADD CONSTRUCT
                                </div>
                            </div>
                        </div>

                    </section>

                    <hr/>

                    <section>
                        <div id="notes">
                            <fieldset>
                                <h2 className="center">Notes</h2>
                                <Textarea rows={3} className="wide" name="notes"/>
                            </fieldset>
                        </div>
                    </section>

                    <hr/>

                    <section>
                        <div id="submit">
                            <fieldset>
                                <input type="submit" className="button wide success tall" value="Submit"/>
                            </fieldset>
                        </div>
                    </section>
                </form>
                <div id="toggle-tutorial" className="hidden" onClick={self.toggleTour}>
                    <span>Show Tutorial</span>
                </div>
            </div>
        )
    }
});

render.render(React.createElement(App), document.getElementById('app'));
