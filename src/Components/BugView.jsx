import React from "react";
import View from "react-art";
// import "bootstrap/dist/css/bootstrap.min.css";
const bugDetails = {
  Long_Statement:
    "Methods which includes long statements. Here statement’s  character length which are equal or more than 130 are considered as long statement.",
  Long_Method:
    "A method which contains large number of lines and performs more than one action is considered as “Long Method.” It is comparatively difficult to understand a large method in comparison to  small methods.",
  Long_Parameter_List:
    "When the number of parameters passed to a method is more than what is actually required for the functionality of the method, it indicates the presence of “Long Parameter List” smell.",
  Complex_Conditional:
    "If there are more than or equal to 3 boolean sub expressions inside the if statement then it is considered as a complex conditional smell",
  // Complex_Method:
  //   "Methods with cyclomatic complexities are complex method. Cyclocmatic complexity = Number of decision points + 1 The decision points may be your conditional statements like if, if … else, switch , for loop, while loop etc.",
  Long_Identifier:
    "length of the identifier name is limited to 30 (character Length). If the length is more than or equal to 30 then it is considered as a long identifier.",
  Missing_default:
    "If a switch case statement does not have a default case then it is considered as missing default.",
  Empty_catch_clause:
    "The catch clause of a try catch block should not be empty. If the catch clause is empty then it is detected as a bad smell in coding."
};

export default class BugView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      BugList: this.props.BugList,
      methods: [],
      bugs: [],
      hover: false,
      tooltip: "",
      tooltipActive: false
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
    if (name.length > 14) {
      this.state.tooltipActive = true;
      return name.substring(0, 14) + "...";
    }
    this.state.tooltipActive = false;
    return name;
  }

  render() {
    const tooltipStyle = {
      display: this.state.hover ? "block" : "none"
    };
    return (
      <div>
        <p>{this.props.classPath}</p>
        <div
          style={{
            float: "left",
            width: "49%",
            backgroundColor: "#f0f0f0",
            padding: 5,
            height: 342
          }}
        >
          <p>Methods</p>
          {this.state.methods.map(list => (
            <div style={this.square} onClick={() => this.setBugList(list)}>
              <p class="tooltip" style={{ padding: 4 }}>
                {this.setMethodName(list)}
                <span
                  className={this.state.tooltipActive ? "tooltiptext" : "hide"}
                >
                  {list}
                </span>
              </p>
            </div>
          ))}
        </div>

        <div style={{ float: "right", width: "50%" }}>
          <div
            style={{
              float: "right",
              width: "59%",
              backgroundColor: "#f0f0f0",
              padding: 5,
              height: 342
            }}
          >
            <p>Bug Details</p>
            <div style={tooltipStyle}>{this.tooltip}</div>
          </div>

          <div
            style={{
              width: "39%",
              backgroundColor: "#f0f0f0",
              padding: 5,
              height: 342
            }}
          >
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
