import React from 'react';
import { Map, TileLayer, Marker, Popup, Tooltip, CircleMarker, Circle } from 'react-leaflet'
import Coordinates from './Coordinates.jsx'

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import ShowMarkers from './ShowMarkers.jsx';

import Plot from 'react-plotly.js';

class HeatMap extends React.Component {

    constructor(props){
        super(props);
        var min=[Number.MAX_VALUE,Number.MAX_VALUE];
        var max=[Number.MIN_VALUE,Number.MIN_VALUE];
        window.coordinates = Coordinates;
        for(var w in props.wells){
            var well = props.wells[w];
            var coords = Coordinates[well.name];
            if(!coords){
                console.log("could not find coordinates for ",well.name);
                continue;
            } 
            if(coords[0]<min[0]) min[0]=coords[0];
            if(coords[1]<min[1]) min[1]=coords[1];
            if(coords[0]>max[0]) max[0]=coords[0];
            if(coords[1]>max[1]) max[1]=coords[1];
        }
        this.state = {bounds:[min,max], mode:"max"};
    }
    
    getMarker(name){
        return <Marker position={Coordinates[name]}><Tooltip>name</Tooltip></Marker>
    }
    rgbToHex(rgb) { 
        rgb = parseInt(rgb); 
        var hex = Number(rgb).toString(16);
        if (hex.length < 2) {
             hex = "0" + hex;
        }
        return hex;
      };
    getColorFromBounds(c,min,max,rgbmin,rgbmax){
        var ratio = (c-min)/(max-min);
        var hex= "#"+this.rgbToHex(rgbmin[0]+(rgbmax[0]-rgbmin[0])*ratio)+this.rgbToHex(rgbmin[1]+(rgbmax[1]-rgbmin[1])*ratio)+this.rgbToHex(rgbmin[2]+(rgbmax[2]-rgbmin[2])*ratio);
        return hex;
    };

    getColor(confs,mode){
        var c = this.getConfidence(confs,mode)
        if(mode=="count") return this.getColorFromBounds(c,0,15,[255,255,255],[255,0,0]);
        if(!c) return "#FFFFFF";
        if(c<.25) return this.getColorFromBounds(c,0,.25,[255,255,255],[255,204,153]);
        if(c<.5) return this.getColorFromBounds(c,.25,.5,[255,204,153],[255,255,153]);
        if(c<.75) return this.getColorFromBounds(c,.5,.75,[255,255,153],[153,204,0]);
        if(c<1) this.getColorFromBounds(c,.75,1,[153,204,0],[0,255,0]);
        return this.getColorFromBounds(c,0,1,[0,255,0],[0,255,0]);
    };
    getConfidence(confs,mode){
        if(mode=="max") return Math.max(...confs);
        if(mode=="min") return Math.min(...confs);
        if(mode=="count") return confs.length;
        var sum = 0;
        for(var i=0; i<confs.length; ++i){
            sum+=confs[i];
        }
        if(mode=="average") return sum/confs.length;
        if(mode=="sum") return sum;

    };
    
    getClosest(latlng){
        var dist = Number.MAX_VALUE;
        var well = null;
        for(var i=0; i<this.props.wells.length; ++i){
            if(this.props.wells[i].mds.length<1) continue;
            var c = Coordinates[this.props.wells[i].name];
            var d = (latlng.lat-c[0])*(latlng.lat-c[0])+(latlng.lng-c[1])*(latlng.lng-c[1]);
            if(d>dist) continue;
            dist = d;
            well = this.props.wells[i];
        }
        return {coords:Coordinates[well.name],name:well.name,conf:this.getConfidence(well.confidences,this.state.mode),well:well}
    }
    
    handleChange(event){
        this.setState({ [event.target.name]: event.target.value });
      };
    
    
    render() {
    const bounds = this.state.bounds;

    
    
    
    var onMouseDown = function(o){
        this.setState({'mouseDown':Date.now()});
    }
    var onMouseClick = function(o){
        if(Date.now()-this.state.mouseDown>100) return;
        this.setState({'selected':this.getClosest(o.latlng)});
    }

    return (
        <Table className={"table"}><TableBody><TableRow>
        <TableCell><FormControl className={"formControl"}>
          <Select
            value={this.state.mode}
            onChange={this.handleChange.bind(this)}
            name="mode"
          >
            <MenuItem value={'min'}>Lowest confidence</MenuItem>
            <MenuItem value={'max'}>Highest confidence</MenuItem>
            <MenuItem value={'average'}>Average confidence</MenuItem>
            <MenuItem value={'sum'}>Total confidence</MenuItem>
            <MenuItem value={'count'}>Number of Shows</MenuItem>
          </Select>
          <FormHelperText>Display Mode</FormHelperText>
        </FormControl>
        <Map bounds={bounds} ref={"map"}  onMouseUp={onMouseClick.bind(this)} onMouseDown={onMouseDown.bind(this)}>
        {this.props.wells.map(object=>object.confidences.length>0?<CircleMarker key={"conf_"+object.name} stroke={false} center={Coordinates[object.name]} radius={35} opacity={.9} fillColor={this.getColor(object.confidences,this.state.mode)} ></CircleMarker>:null)}
        {this.props.wells.map(object=><CircleMarker key={object.name} center={Coordinates[object.name]} radius={5}></CircleMarker>)}
        <TileLayer
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        </Map></TableCell>
        {this.state.selected?<TableCell width="100"><ShowMarkers pickedwell={this.state.selected}/></TableCell>:null}
        </TableRow></TableBody></Table>
        
    )
    }
    
}

export default HeatMap