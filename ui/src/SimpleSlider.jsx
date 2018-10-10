import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/lab/Slider';

const styles = {
  root: {
    width: 300,
  },
};

class SimpleSlider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {md:props.md};
    this.handleChange = name => (event,value) => {
      this.props.parentMDChangeHandler(name,value);//propagate upward
      this.setState({ [name]: value });
    };
  }


  render() {
    const { classes } = this.props;
    const value  = this.state.md;

    return (
      <div className={classes.root}>
        <Typography id="label">{"MD: "+this.state.md}</Typography>
        <Slider value={value} min={this.props.min} max={this.props.max} step={1} aria-labelledby="label" onChange={this.handleChange('md')} />
      </div>
    );
  }
}

SimpleSlider.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SimpleSlider);