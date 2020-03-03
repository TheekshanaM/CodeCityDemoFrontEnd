import React from "react";

export default class BugView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      BugList : this.props.BugList,
      methods: [],
      bugs : []
    };
    
    for (var name in this.state.BugList) {
      this.state.methods.push(name);
    }
  }

  setBugList= event => {
    this.state.bugs = this.state.BugList[event];
  }

  render() {
    return (
      <select onChange={this.setBugList}>
        {this.state.methods.map(list => (
          <option key={list} value={list}>
            {list}
          </option>
        ))}
      </select>
      
        <ul>
          this.state.bugs.forEach(element => {
            <li>element</li>
          });
        </ul>
      
    );
  }
}
