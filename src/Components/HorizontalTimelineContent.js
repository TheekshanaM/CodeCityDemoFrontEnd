import React from "react";
import PropTypes from "prop-types";
// import SwipeableViews from "react-swipeable-views";

import HorizontalTimeline from "../../src/Components/HorizontalTimeline";
// import HorizontalTimelineConfigurator from "./HorizontalTimelineConfigurator";

export default class HorizontalTimelineContent extends React.Component {
  values = [];
  constructor(props) {
    super(props);
    this.createArray();
    this.state = {
      value: this.props.valueArray.length - 1,
      previous: this.props.valueArray.length - 2,
      showConfigurator: false,

      // timelineConfig
      minEventPadding: 20,
      maxEventPadding: 20,
      linePadding: 50,
      labelWidth: 50,
      fillingMotionStiffness: 150,
      fillingMotionDamping: 25,
      slidingMotionStiffness: 150,
      slidingMotionDamping: 25,
      stylesBackground: "#f8f8f8",
      stylesForeground: "#7b9d6f",
      stylesOutline: "#dfdfdf",
      isTouchEnabled: true,
      isKeyboardEnabled: true,
      isOpenEnding: true,
      isOpenBeginning: true
    };
  }
  createArray() {
    console.log(this.props.valueArray);
    this.valueArray = this.props.valueArray;
    if (this.valueArray != null) {
      for (var i = 0; i < this.valueArray.length; i++) {
        this.values[i] = "" + (i + 1);
      }
    }
  }
  // static propTypes = {
  //   content: PropTypes.arrayOf(PropTypes.object).isRequired
  // };

  // componentWillMount() {
  //   this.dates = this.props.content.map(entry => entry.date);
  // }

  // componentWillReceiveProps(nextProps) {
  //   this.dates = nextProps.content.map(entry => entry.date);
  // }

  render() {
    const state = this.state;

    // const views = this.props.content.map((entry, index) => {
    //   return (
    //     <div className="container" key={index}>
    //       {entry.component}
    //     </div>
    //   );
    // });

    // let configurator = <div></div>;
    // if (this.state.showConfigurator) {
    //   configurator = (
    //     <HorizontalTimelineConfigurator
    //       setConfig={(key, value) => {
    //         this.setState({ [key]: value });
    //       }}
    //       {...this.state}
    //     />
    //   );
    // }

    return (
      <div>
        <div style={{ width: "60%", height: "100px", margin: "0 auto" }}>
          <HorizontalTimeline
            fillingMotion={{
              stiffness: state.fillingMotionStiffness,
              damping: state.fillingMotionDamping
            }}
            index={this.state.value}
            indexClick={index => {
              this.setState({ value: index, previous: this.state.value });
              this.valueArray = this.props.valueArray;

              // if (this.valueArray != null) {
              //   for (var i = 0; i < this.valueArray.length; i++) {
              //     console.log(">>", this.valueArray[i]);
              //   }
              // }
              console.log("index", index);
              console.log(
                "id",
                this.valueArray[this.valueArray.length - index - 1]
              );
              this.props.onRevertCode(
                this.props.repo,
                this.valueArray[this.valueArray.length - index - 1]
              );
            }}
            isKeyboardEnabled={state.isKeyboardEnabled}
            isTouchEnabled={state.isTouchEnabled}
            labelWidth={state.labelWidth}
            linePadding={state.linePadding}
            maxEventPadding={state.maxEventPadding}
            minEventPadding={state.minEventPadding}
            slidingMotion={{
              stiffness: state.slidingMotionStiffness,
              damping: state.slidingMotionDamping
            }}
            styles={{
              background: state.stylesBackground,
              foreground: state.stylesForeground,
              outline: state.stylesOutline
            }}
            // values={this.dates}
            values={this.values}
            isOpenEnding={state.isOpenEnding}
            isOpenBeginning={state.isOpenBeginning}
          />
        </div>
        {/* <div className="text-center">
          <SwipeableViews
            index={this.state.value}
            onChangeIndex={(value, previous) => {
              this.setState({ value: value, previous: previous });
            }}
            resistance
          >
            {views}
          </SwipeableViews>
        </div> */}
        {/* <div className="checkbox text-center">
          <label>
            <input
              onChange={() => {
                this.setState({
                  showConfigurator: !this.state.showConfigurator
                });
              }}
              type="checkbox"
            />
            Configure the Timeline
          </label>
        </div>
        {configurator} */}
      </div>
    );
  }
}
