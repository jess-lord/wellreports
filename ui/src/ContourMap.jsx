import React from 'react';
import PropTypes from 'prop-types';
import Plot from 'react-plotly.js';
import { withStyles } from '@material-ui/core/styles';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import SimpleSlider from './SimpleSlider.jsx';


const styles = {
    root: {
      flexGrow: 1,
    },
    flex: {
      flex: 1,
    },
    menuButton: {
      marginLeft: -12,
      marginRight: 20,
    },
  };


  
  class ContourMap extends React.Component {
    constructor(props) {
      super(props);
      this.handleCheckedChange = name => event => {
        this.setState({ [name]: event.target.checked });
      };
      var basedata = [];
        var wells = {x:[],y:[],text:[]};
        var i=0;
        console.log("generating data")
        for(var x=0; x<100; ++x){
            var vals = [];
            for(var y=0; y<100; ++y){
                var val = Math.random()<0.03?1:0;
                vals.push(val);
                if(!val) continue;
                wells.x.push(x);
                wells.y.push(y);
                wells.text.push("Well "+i.toString());
                ++i;
            }
            basedata.push(vals);
        }
        var perMD = [];
        for(var md=0;md<100;++md){
            var mdvals = []
            for(var x=0; x<100; ++x){
                var vals = [];
                for(var y=0; y<100; ++y){
                    var val = basedata[x][y]>0?100*Math.random():null;
                    vals.push(val);
                }
                mdvals.push(vals)
            }
            perMD.push(mdvals);
        }
        this.state={wells:wells,data:perMD,md:0,wellLabels:true};
    }

    handleMDChange(name,value) {
        console.log("MAP: Changing ",name," value for ",value)
        this.setState({ [name]: value });
      };

    
      
    render() {

        var data = [ {
            z: this.state.data[this.state.md],
            zsmooth: 'best',
            type: 'heatmap',
            showscale: false,
            connectgaps: true,
            colorscale: [[0, 'rgb(255,255,255)'], [0.25, 'rgb(255,255,255)'], [0.5, 'rgb(255,255,128)'], [0.75, 'rgb(0,128,0)'], [1, 'rgb(0,255,0)']],
            colorbar:{
                thickness: 75,
                thicknessmode: 'pixels',
                len: 0.9,
                lenmode: 'fraction',
                outlinewidth: 0
            },
            name:""
            },
            {
                x: this.state.wells.x,
                y: this.state.wells.y,
                mode: this.state.wellLabels?'markers+text':'markers',
                name: '',
                text: this.state.wells.text,
                textposition: 'bottom',
                type: 'scatter'
            }
        ];


        var layout = {
            autoSize : false,
            hovermode:'closest',
            width: 1000,
            height: 1000,
            xaxis: {
            autorange: true,
            showgrid: false,
            zeroline: false,
            showline: false,
            autotick: true,
            ticks: '',
            showticklabels: false
            },
            yaxis: {
            autorange: true,
            showgrid: false,
            zeroline: false,
            showline: false,
            autotick: true,
            ticks: '',
            showticklabels: false
            }
        };

        return (
            <div>
            <FormControlLabel
                control={
                    <Checkbox
                    checked={this.state.wellLabels}
                    onChange={this.handleCheckedChange('wellLabels')}
                    value="wellLabels"
                    />
                }
                label="Show Well Names"
                />
            <SimpleSlider md={this.state.md} parentMDChangeHandler={this.handleMDChange.bind(this)} min={0} max={100}/>
            <Plot data={data} layout={layout}/></div>
        );
    }
}
  
  
  export default withStyles(styles)(ContourMap);

