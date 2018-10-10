import React from "react";
import ReactDOM from "react-dom";

import ButtonAppBar from "./ButtonAppBar.jsx";
import ContourMap from "./ContourMap.jsx";
import HeatMap from "./HeatMap.jsx";
import Loader from "./Loader.jsx";

const Index = () => {


  return <div><ButtonAppBar/><Loader/>
      </div>;
};

ReactDOM.render(<Index />, document.getElementById("index"));