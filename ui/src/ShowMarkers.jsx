import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import Maxdepths from './Maxdepths.jsx'
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

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
  
  class ShowMarkers extends React.Component {
    constructor(props) {
      super(props);
    }
    rgbToHex(rgb) { 
        rgb = parseInt(rgb); 
        var hex = Number(rgb).toString(16);
        if (hex.length < 2) {
             hex = "0" + hex;
        }
        return hex;
      };
    getColor(c){
        var hex= "#"+this.rgbToHex(255-255*c)+this.rgbToHex(255*c)+'00';
        return hex;
    };
    componentDidMount(){
        this.renderTable();
    }
    componentDidUpdate(prevProps, prevState) {
        // only update chart if the data has changed
        if (prevProps.pickedwell.name !== this.props.pickedwell.name) {
            var c = this.refs.canvas;
            const context = c.getContext('2d');
            context.clearRect(0, 0, 1000, 2000);
            this.setState({context:""});
            this.renderTable();
        }
      }

    renderTable(){
        var table=this.createTable();
        var canvash = 850;
        var c = this.refs.canvas;
        var ctx=c.getContext("2d");
        ctx.clearRect(0, 0, 100, canvash);
        ctx.strokeStyle = "black"
        ctx.lineWidth=1;
        ctx.rect(50,0,50,canvash);
        ctx.stroke();
        ctx.textAlign = "right";
        ctx.fillStyle = "black";
        ctx.font = "15px Arial";
        ctx.textBaseline="top"; 
        ctx.fillText("0",45,0);
        var maxdepth = Maxdepths[this.props.pickedwell.name];
        if(!maxdepth && table.length<1) return;
        if(!maxdepth) maxdepth = 1.1*table[table.length-1].md;
        ctx.textBaseline="bottom"; 
        ctx.fillText(maxdepth.toString(),45,canvash);
        ctx.textBaseline="middle"; 
        var ratio = canvash/maxdepth;
        ctx.lineWidth=3;
        if(table.length<1) return;
        for(var d=0; d<table.length; ++d){
            var depth = table[d].md*ratio;
            ctx.fillText(table[d].md.toString(),45,depth);
            ctx.strokeStyle = this.getColor(table[d].confidence);
            ctx.beginPath();
            ctx.moveTo(50,depth);
            ctx.lineTo(100,depth);
            ctx.stroke();
        }
        c.addEventListener('mousemove', function(e) {
          var mouseY=e.layerY;
          var candidate = -1;
          var dist = 15;
          for(var d=0; d<table.length; ++d){
            var depth = table[d].md*ratio;
            if(Math.abs(depth-mouseY)>=dist) continue;
            dist = Math.abs(depth-mouseY);
            candidate = d;
            if(depth>mouseY) break;
          }
          if(candidate<0) return;
          this.setState({contextmd: table[candidate].md, context:this.props.pickedwell.well.contexts[candidate]});
        }.bind(this)    );
    }

    createTable(){
        let table=[]
        for(var i=0; i<this.props.pickedwell.well.confidences.length; ++i){
            table.push({md:this.props.pickedwell.well.mds[i],confidence:this.props.pickedwell.well.confidences[i]});
        }
        table.sort(x=>x.md)
        return table;
    }
      
    render() {
        let table = this.createTable();
        var canvash = 850;
        return (
            <div>
                <h1>{this.props.pickedwell.name}</h1>
                <Table><TableBody><TableRow><TableCell><canvas ref="canvas" width="100" height={canvash}></canvas>
                </TableCell><TableCell><Table><TableHead><TableRow><TableCell>{"Show MD"}</TableCell><TableCell>{"Confidence"}</TableCell></TableRow></TableHead><TableBody>
                    {table.map(o=><TableRow key={o.md}><TableCell>{o.md}</TableCell><TableCell>{o.confidence}</TableCell></TableRow>)}
                </TableBody></Table>{this.state && this.state.context?<Paper className={"root"} elevation={1}>
        <Typography variant="headline" component="h3">
        {"Context for Show at MD "+this.state.contextmd}.
        </Typography>
        <Typography component="p">
        {this.state.context}
        </Typography>
      </Paper>:null}</TableCell></TableRow></TableBody></Table>
            
            </div>
        );
    }
}
  
  
  export default withStyles(styles)(ShowMarkers);

