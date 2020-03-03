import React from "react";
import View from "react-art";
// import "bootstrap/dist/css/bootstrap.min.css";
const bugDetails = {
  Long_Statement: "gggggggg",
  fcfcg: "bfbf"
};

export default class BugView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      BugList: this.props.BugList,
      methods: [],
      bugs: [],
      hover: false,
      tooltip: ""
    };

    this.handleMouseIn = this.handleMouseIn.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.setMethodName = this.setMethodName.bind(this);

    for (var name in this.state.BugList) {
      this.state.methods.push(name);
    }
  }

  setBugList(className) {
    this.state.bugs = this.state.BugList[className];
    this.setState(this.render);
  }

  square = {
    width: 150,
    height: 50,
    backgroundColor: "red",
    marginBottom: 12,
    marginRight: 12,
    float: "left"
  };

  handleMouseIn(listItem) {
    console.log(listItem.replace(/ /g, "_"));
    this.tooltip = bugDetails[listItem.replace(/ /g, "_")];
    this.setState({ hover: true });
  }

  handleMouseOut() {
    this.tooltip = "";
    console.log("ggg");
    this.setState({ hover: false });
  }

  setMethodName(name) {
    if (name.length > 16) {
      return name.substring(0, 16) + "...";
    }
    return name;
  }

  render() {
    const tooltipStyle = {
      display: this.state.hover ? "block" : "none"
    };
    return (
      <div>
        <div
          style={{
            float: "left",
            width: "49%",
            backgroundColor: "#f0f0f0",
            padding: 5
          }}
        >
          <p>Methods</p>
          {this.state.methods.map(list => (
            <div style={this.square} onClick={() => this.setBugList(list)}>
              <p style={{ padding: 4 }}>{this.setMethodName(list)}</p>
            </div>
          ))}
        </div>

        <div style={{ float: "right", width: "50%" }}>
          <div
            style={{
              float: "right",
              width: "49%",
              backgroundColor: "#f0f0f0",
              padding: 5
            }}
          >
            <p>Bug Details</p>
            <div style={tooltipStyle}>{this.tooltip}</div>
          </div>

          <div style={{ width: "49%", backgroundColor: "#f0f0f0", padding: 5 }}>
            <p>Bug List</p>
            <ul>
              {this.state.bugs.map(list => (
                <li
                  onMouseOver={() => this.handleMouseIn(list)}
                  onMouseOut={this.handleMouseOut}
                >
                  {list}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
