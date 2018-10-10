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
import HeatMap from "./HeatMap.jsx";
import Button from '@material-ui/core/Button';
import Coordinates from './Coordinates.jsx'


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
    },root: {
      justifyContent: 'center'
  }
  };


  
  class Loader extends React.Component {
    constructor(props) {
      super(props);
      this.state={wells:[],dataloading:false}
      this.readInputFiles = (event)=>{
        this.readFiles(event.target.files,"input");
      };
      this.getRealName = (wname)=>{
        var wn0 = wname;
        var uscores = wname.split("_").length-1;
        if (uscores<1 || uscores>2){ console.log("ALERT wname",wname); return wname;}
        if (uscores == 2){
          var index = wname.lastIndexOf("_");
          wname = wname.substr(0, index) + " "+ wname.substr(index + 1);
        }
        wname = wname.replace("_","/");
        return wname;
      }
      this.readFiles = (files,label)=>{
        this.setState({dataloading:true});
        if (!files || files.length === 0) {
            this.setState({dataloading:false});
          return;
        }
        var wells = [];
        var wnames = ['10_5-1','15_12-11_S','15_12-1','15_12-2','15_12-3','15_12-4','15_12-5'        ,'15_12-6_S','15_12-7_S','15_12-8_A','15_3-1_S','15_3-3','15_3-4','15_3-5'        ,'15_5-3','15_5-4','15_5-6','15_6-2_R','15_6-2','15_6-3','15_6-4','15_6-5'        ,'15_6-6','15_6-7','15_6-8_A','15_6-8_S','15_8-1','15_9-10','15_9-11'        ,'15_9-12_R','15_9-12','15_9-13','15_9-14','15_9-15','15_9-16','15_9-17'        ,'15_9-18','15_9-19_A','15_9-19_B','15_9-19_S','15_9-19_S','15_9-1'        ,'15_9-21_S','15_9-2','15_9-3','15_9-4','15_9-5','15_9-6','15_9-7'        ,'15_9-8','15_9-9','16-01-01','16_1-2','16_10-1','16_10-2','16_10-3'        ,'16_10-4','16_11-1_S','16_11-2','16_3-2','16_4-1','16_4-2','16_5-1'        ,'16_7-1','16_7-2','16_7-3','16_7-4','16_7-5','16_7-6','16_7-7_S','16_8-2'        ,'17_3-1','1_3-8','1_6-7'        ,'1_9-3','1_9-3_R','1_9-3'        ,'24-09-05','24-12-03-S','24_12-1_R','24_12-1','24_12-2','24_6-1','24_9-1'        ,'24_9-2','24_9-3','24_9-4','24_9-5','24_9-6','25-05-05'        ,'25-07-05','25-07-4S','25-08-05-S','25-10-02'        ,'25-10-02','25-10-06-S','25-11-17','25-11-20','25_10-1'        ,'25_10-2_R','25_10-2','25_10-4_R','25_10-4','25_10-6_S','25_10-8_A'        ,'25_10-8','25_11-15','25_11-17','25_11-19_S','25_11-1','25_11-22'        ,'25_11-5','25_2-10_S','25_2-13','25_2-14','25_2-15_R2','25_2-15','25_2-4'        ,'25_2-5','25_2-7','25_3-1','25_4-1','25_4-2','25_4-3','25_4-5','25_4-6_S'        ,'25_5-1_A','25_5-1','25_5-3','25_5-4','25_5-5','25_6-1','25_6-3','25_7-2'        ,'25_7-3','25_7-4_S','25_7-5','25_8-10_S','25_8-11','25_8-12_A'        ,'25_8-12_S','25_8-1','25_8-2','25_8-5_S','25_8-6','25_8-7','25_8-8_A'        ,'25_8-8_B','25_8-8_S','25_8-9_A','25_8-9','25_9-1','26_4-1','2_1-10'        ,'2_1-1','2_1-2','2_1-5','2_11-1','2_12-2_S','2_2-1','2_4-11','2_4-17'        ,'2_4-8','2_5-6','2_6-1','2_6-2','2_6-3','2_6-5','2_7-15','2_7-19','2_7-1'        ,'2_7-20','2_7-22','2_7-23_S','2_7-24','2_7-25_S','2_7-26_S','2_7-27_S'        ,'2_7-28','2_7-29','2_7-2','2_7-30','2_7-31','2_7-3','2_7-9','2_8-16_S'        ,'2_9-2','30_10-6','30_6-25_S','30_8-3','30_9-19_A','30_9-19','31-05-01'        ,'31_2-1','32_4-1','33_12-1','33_6-2','33_9-7','33_9-8','34_10-1'        ,'34_10-2','34_10-34','34_11-1','34_11-3','34_2-1','34_2-2_R','34_2-2'        ,'34_2-3','34_2-4','34_4-10','34_4-1','34_4-9_S','34_7-23_S','34_7-25_S'        ,'34_7-26_SR','34_7-26_S','34_7-28','35-04-01_PB-706-0321.PDF','35-08-04'        ,'35_11-10_A','35_11-10','35_11-11','35_11-7','35_3-5','35_8-2','35_9-1_R'        ,'35_9-1','35_9-2','35_9-3','36_7-1','36_7-2','3_5-2'        ,'3_7-3','3_7-5','3_7-5','6204-10-01'        ,'6204-10-02','6204-11-01'        ,'6204-11-02','6204_10-2_A','6305_12-2','6305_5-1','6306_10-1','6306_5-1'        ,'6306_6-1','6406_11-1_S','6406_12-1_S','6406_12-2','6406_2-1_R'        ,'6406_2-1','6406_2-2','6406_2-4_S','6406_2-5_A','6406_2-5','6406_3-5'        ,'6406_6-1','6406_8-1','6407_1-2','6407_1-3','6407_1-4','6407_10-1'        ,'6407_10-3','6407_2-1','6407_2-2','6407_2-3','6407_6-1','6407_6-2'        ,'6407_6-3','6407_6-4','6407_7-1_S','6407_7-2','6407_7-3','6407_7-5'        ,'6407_7-A-10_H','6407_8-2','6407_8-3','6407_9-1','6407_9-2','6407_9-3'        ,'6407_9-5','6407_9-6','6407_9-7','6407_9-8','6407_9-A-2_A','6407_9-A-2'        ,'6407_9-B-1_H','6407_9-C-2_H','6408_4-1','6506_11-1','6506_11-2'        ,'6506_11-3','6506_11-4_S','6506_11-5_S','6506_12-10_A','6506_12-10'        ,'6506_12-11_S','6506_12-1','6506_12-3','6506_12-4','6506_12-5'        ,'6506_12-6','6506_12-7','6506_12-8','6506_12-9_S','6507_10-1','6507_11-1'        ,'6507_11-2','6507_11-3','6507_11-4','6507_11-5_S','6507_12-1','6507_12-2'        ,'6507_12-3','6507_2-1','6507_2-2','6507_2-3','6507_3-1','6507_3-2'        ,'6507_5-1','6507_6-1','6507_6-2','6507_7-10','6507_7-11_S','6507_7-1'        ,'6507_7-2','6507_7-3','6507_7-4','6507_7-5_A','6507_7-5','6507_7-6'        ,'6507_7-7','6507_7-A-46','6507_8-1','6507_8-2','6507_8-3','6507_8-4'        ,'6507_8-5','6507_8-6','6510_2-1_R','6510_2-1','6607_5-1','6607_5-2'        ,'6608_10-1','6608_10-2','6608_10-3_R','6608_10-3','6608_10-4','6608_10-5'        ,'6608_8-1','6609-11-01','6609_10-1','6609_11-1','6609_5-1','6609_7-1'        ,'6610_2-1_S','6610_3-1_R','6610_3-1','6610_7-1','6610_7-2','6706_11-1'        ,'7_11-6','7_12-3','7_12-5','7_4-1','7_7-1','7_7-3','7_8-2','7_8-3'        ,'9_2-4_S','9_2-7_S','9_2-8_S','24_9-1']
        for(var w =0; w<wnames.length; ++w){
          var n = this.getRealName(wnames[w]);
          if(wells.findIndex(o=>o.name==n)>=0) continue;
          if(Coordinates[n]==undefined) continue;
          wells.push({name:n,confidences:[],mds:[],contexts:[]});
        }
        
        var pending = files.length;
        for(var j=0; j<files.length; ++j){
            var f = files[j];
            var name = f.name;
            if(!name.endsWith('.csv')) continue;
            const reader = new FileReader();
            reader.onload = function(evt) {
                var data= evt.target.result;
            var lines = data.split("\n");
            var position = -1;
            for(var line=1; line<Math.min(1000,lines.length); ++line){
                if(lines[line].length<1) continue;
                var cells = lines[line].split(",");
                var wellname = this.getRealName(cells[0]);
                if(position<0 || wells[position].name!=wellname){
                  position = wells.findIndex(o=>o.name==wellname);
                }
                if(position<0){ console.log("can't find "+wellname); continue;}
                console.log(cells)
                //if(cells[6]<0.3) continue;
                if(cells[5+2]<1) continue;
                wells[position].confidences.push(Math.random()*.7+.3);//cells[6+2]);
                wells[position].mds.push(cells[5+2]);
                wells[position].contexts.push(cells[7+2]);
                wells[position].confidences.push(Math.random()*.7+.3);//cells[6+2]);
                wells[position].mds.push(cells[5+2]*.75);
                wells[position].contexts.push(cells[7+2]);
                console.log(cells[9])
            }
            this.setState({wells:wells});
          }.bind(this);
          reader.readAsText(files[j]);
        }
        this.setState({dataloading:false});
        
    };
    }

      
    render() {
      let rawDataButton = (
        <span>
          <input
            type="file"
            multiple
            onChange={this.readInputFiles.bind(this)}
            className={"button"}
            id="rawdata"
            style={{ display: 'none' }}
          />
          <label htmlFor="rawdata">
            <Button variant="raised" disabled={this.state.dataloading} component="span" className={"button"} color="primary">
              {'Upload Reports'}
            </Button>
          </label>
        </span>
      );

        return (
            <div>{this.state.wells.length?null:rawDataButton}
            {this.state.wells.length?<HeatMap wells={this.state.wells}/>:null}
            </div>
        );
    }
}
  
  
  export default withStyles(styles)(Loader);

