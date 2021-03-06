import React, { Component } from "react";
import FloatBox from "./FloatBox";
import * as BABYLON from "babylonjs";
import BabylonScene from "./Scene";
import axios from "axios";
import Navbar from "./Nav";
import Legend from "./Legend";
import Loading from "./Loading";
import LoadingImage from "./img/loadingImage.gif";
import {
  feedbackEvent,
  getProportionalColor,
  searchEvent,
  logoBase64
} from "./utils";
import swal from "sweetalert2";
import Cookies from "js-cookie";
import HorizontalTimelineContent from "./Components/HorizontalTimelineContent";
import ApexCharts from "./Components/ApexChart";
import BugView from "./Components/BugView";
import SuperClassImage from "./img/super_class.png";
import InterfaceImage from "./img/interface.png";
import { Treebeard } from "react-treebeard";

const URLRegexp = new RegExp(/^(?:https:\/\/?)?(github\.com\/.*)/i);

const endpoint = "http://localhost:8080/CodeCity/load/";

var data = {
  // name: "CodeCityTestRepo",
  // toggled: true,
  // children: [
  //   {
  //     toggled: true,
  //     name: "folder1",
  //     children: [
  //       {
  //         toggled: true,
  //         name: "folder2",
  //         children: [{ name: "ClassF.java" }, { name: "TestInterface.java" }]
  //       }
  //     ]
  //   }
  // ]
};
// TODO: isolate in the constants file
const colors = {
  PACKAGE: {
    r: 255,
    g: 100,
    b: 100
  },
  FILE: {
    r: 255,
    g: 255,
    b: 255
  },
  CLASS: {
    r: 32,
    g: 156,
    b: 238
  },
  DEPENDANCY: {
    r: 0,
    g: 255,
    b: 0
  },
  DIFF: {
    r: 255,
    g: 255,
    b: 0
  },
  SUPERCLASS: {
    r: 214,
    g: 11,
    b: 157
  },
  BUG: {
    r: 255,
    g: 0,
    b: 0
  },
  STRUCTURE: {
    r: 255,
    g: 204,
    b: 229
  }
};

const examples = [
  {
    branch: "master",
    name: "sirupsen/logrus",
    link: "github.com/sirupsen/logrus"
  },
  {
    branch: "master",
    name: "gin-gonic/gin",
    link: "github.com/gin-gonic/gin"
  },
  {
    branch: "master",
    name: "spf13/cobra",
    link: "github.com/spf13/cobra"
  },
  {
    branch: "master",
    name: "golang/dep",
    link: "github.com/golang/dep"
  },
  {
    branch: "master",
    name: "gohugoio/hugo",
    link: "github.com/gohugoio/hugo"
  }
];

class App extends Component {
  canvas = null;
  scene = null;
  engine = null;
  camera = null;
  light = null;
  commits = [];
  fileDiff = null;
  currentCommit = null;
  supperTypeList = ["empty list"];
  supperClassList = ["no supper Classes"];
  interfaceList = ["no interfaces"];
  responseData = null;
  dependancyType;
  isShowFileDiff = false;
  selectedClass = "";
  isShowBug = false;
  bugList = "";
  bugLIstPath = "";

  constructor(props) {
    super(props);
    this.state = {
      feedbackFormActive: false,
      loading: false,
      fileDiffLoading: false,
      loadingTimeLine: false,
      repository: this.props.match.params.repository || "",
      branch: this.props.match.params.branch || "master",
      modalActive: false,
      bugModalActive: false,
      superClassImageState: false,
      interfaceImageState: false,
      data
    };

    this.addBlock = this.addBlock.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.showTooltip = this.showTooltip.bind(this);
    this.hideTooltip = this.hideTooltip.bind(this);
    this.plot = this.plot.bind(this);
    this.dependancyPlot = this.dependancyPlot.bind(this);
    this.process = this.process.bind(this);
    this.revertCode = this.revertCode.bind(this);
    this.reset = this.reset.bind(this);
    this.initScene = this.initScene.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.updateCamera = this.updateCamera.bind(this);
    this.onSceneMount = this.onSceneMount.bind(this);
    this.onFeedBackFormClose = this.onFeedBackFormClose.bind(this);
    this.openFeedBackForm = this.openFeedBackForm.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.getBadgeValue = this.getBadgeValue.bind(this);
    this.handleChecked = this.handleChecked.bind(this);
    this.bugModal = this.bugModal.bind(this);
    this.handleBug = this.handleBug.bind(this);
    this.onToggle = this.onToggle.bind(this);
  }

  // componentDidMount() {
  //   if (this.state.repository) {
  //     this.process(this.state.repository, "", this.state.branch);
  //   }
  // }

  onMouseMove(e) {
    this.mouse_x = e.pageX;
    this.mouse_y = e.pageY;
  }

  showTooltip(info) {
    setTimeout(() => {
      this.setState({
        infoVisible: true,
        infoData: info,
        infoPosition: { x: this.mouse_x, y: this.mouse_y }
      });
    }, 100);
  }

  hideTooltip() {
    this.setState({
      infoVisible: false
    });
  }

  reset() {
    this.scene.dispose();
    this.scene = new BABYLON.Scene(this.engine);
    this.initScene();
  }

  addBlock = data => {
    const bar = BABYLON.MeshBuilder.CreateBox(
      data.label,
      { width: data.width, depth: data.depth, height: data.height },
      this.scene
    );
    bar.receiveShadows = false;

    if (data.parent) {
      bar.parent = data.parent;

      var bounds = data.parent.getBoundingInfo();
      bar.position.y = bounds.maximum.y + data.height / 2.0;
    }
    bar.position.x = data.x || 0;
    bar.position.z = data.y || 0;

    bar.info = data.info;

    bar.actionManager = new BABYLON.ActionManager(this.scene);
    bar.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOverTrigger,
        () => {
          this.showTooltip(bar.info);
        }
      )
    );

    bar.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPointerOutTrigger,
        this.hideTooltip
      )
    );
    if (bar.info.type == "CLASS") {
      bar.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            if (this.isShowFileDiff) {
              this.hideTooltip;
              this.openModal(bar.info.path, bar.info.NOL);
            } else if (this.isShowBug) {
              if (data.bug) {
                this.bugList = bar.info.bugLIst;
                this.bugLIstPath = bar.info.path;
                this.bugModal();
              }
            }
          }
        )
      );
    }

    // Material
    bar.material = new BABYLON.StandardMaterial(data.label + "mat", this.scene);
    bar.material.diffuseColor = data.color;

    bar.freezeWorldMatrix();

    return bar;
  };

  plot(children, parent, className) {
    if (!children) {
      return;
    }

    // var res = className.split(".java");
    children.forEach(data => {
      var color;
      // if(className != ""){

      // }

      if (data.type == "CLASS" && data.name == className) {
        color = colors["STRUCTURE"];
      } else if (
        data.type == "CLASS" &&
        data.fillDiffStatus &&
        this.isShowFileDiff
      ) {
        color = colors["DIFF"];
      } else if (data.type == "CLASS" && data.bugStatus && this.isShowBug) {
        color = colors["BUG"];
      } else {
        color = colors[data.type];
      }

      var mesh = this.addBlock({
        x: data.position.x,
        y: data.position.y,
        width: data.width,
        depth: data.depth,
        height: data.numberOfLines,
        color: new BABYLON.Color3(color.r / 255, color.g / 255, color.b / 255),
        parent: parent,
        bug: data.bugStatus,
        info: {
          name: data.name,
          url: data.url,
          path: data.path,
          type: data.type,
          NOM: data.numberOfMethods,
          NOL: data.numberOfLines,
          NOA: data.numberOfAttributes,
          bugLIst: data.methodBugList,
          superClass: data.superClass,
          interfaces: data.interfaces
        }
      });

      if (parent) {
        mesh.parent = parent;
      }

      if (data.children && data.children.length > 0) {
        this.plot(data.children, mesh, className);
      }
    });
  }

  dependancyPlot(children, parent, dependancyClass, inteface) {
    if (!children) {
      return;
    }

    children.forEach(data => {
      var color,
        nOL = -1;

      if (data.type == "CLASS") {
        if (data.superClass == dependancyClass) {
          color = colors["DEPENDANCY"];
          nOL = data.numberOfLines;
        } else if (data.name == dependancyClass || data.name == inteface) {
          color = colors["SUPERCLASS"];
          nOL = data.numberOfLines;
        } else {
          color = colors[data.type];
          // nOL = -1;
        }
      } else {
        color = colors[data.type];
        nOL = data.numberOfLines;
      }
      if (data.interfaces != null) {
        data.interfaces.forEach(element => {
          if (element == inteface) {
            color = colors["DEPENDANCY"];
            nOL = data.numberOfLines;
          }
        });
      }

      var mesh = this.addBlock({
        x: data.position.x,
        y: data.position.y,
        width: data.width,
        depth: data.depth,
        height: nOL,
        color: new BABYLON.Color3(color.r / 255, color.g / 255, color.b / 255),
        parent: parent,
        bug: data.bugStatus,
        info: {
          name: data.name,
          url: data.url,
          path: data.path,
          type: data.type,
          NOM: data.numberOfMethods,
          NOL: data.numberOfLines,
          NOA: data.numberOfAttributes,
          bugLIst: data.methodBugList,
          superClass: data.superClass,
          interfaces: data.interfaces
        }
      });

      if (parent) {
        mesh.parent = parent;
      }

      if (data.children && data.children.length > 0) {
        this.dependancyPlot(data.children, mesh, dependancyClass, inteface);
      }
    });
  }

  updateCamera(width, height) {
    if (width > 1000) {
      this.camera.useAutoRotationBehavior = false;
    } else {
      this.camera.useAutoRotationBehavior = false;
    }
    width = Math.min(width, 1000);
    height = Math.min(height, 1000);
    this.camera.setPosition(
      new BABYLON.Vector3(width * 2, width * 2, (width + height) / 2)
    );
  }

  initScene() {
    this.scene.clearColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    // This creates and positions a free camera (non-mesh)
    this.camera = new BABYLON.ArcRotateCamera(
      "camera",
      0,
      0,
      10,
      BABYLON.Vector3.Zero(),
      this.scene
    );

    // This targets the camera to scene origin
    this.camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    this.camera.attachControl(this.canvas, true);

    this.camera.setPosition(new BABYLON.Vector3(500, 400, -100));
    this.camera.useAutoRotationBehavior = true;

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight(
      "global_light",
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );

    light.intensity = 0.8;
  }

  onSceneMount(e) {
    this.scene = e.scene;
    this.canvas = e.canvas;
    this.engine = e.engine;

    this.initScene();

    this.engine.runRenderLoop(() => {
      if (this.scene) {
        this.scene.render();
      }
    });
  }

  handleKeyPress = event => {
    if (event.key === "Enter") {
      this.onClick();
    }
  };

  onInputChange(e) {
    if (e.target.id === "repository") {
      this.setState({ repository: e.target.value });
    }
    if (e.target.id === "branch") {
      this.setState({ branch: e.target.value });
    }
  }

  revertCode(repository, commitId) {
    this.refs["dropdownRef"].selected = true;
    this.supperTypeList = ["empty list"];

    this.currentCommit = commitId;
    var res = repository.split("/");
    var auther = res[res.length - 2];
    var repo = res[res.length - 1];

    var oldCommit = 0;
    var index = 0;
    this.commits.forEach(element => {
      if (commitId == element) {
        if (index + 1 < this.commits.length) {
          oldCommit = this.commits[index + 1];
        }
      }
      index++;
    });
    if (!BABYLON.Engine.isSupported()) {
      return;
    }

    this.setState({
      // repository: match[1],
      loading: true,
      superClassImageState: false,
      interfaceImageState: false
    });

    let request = null;

    request = axios.get(
      endpoint +
        "changecity/" +
        auther +
        "/" +
        repo +
        "/" +
        commitId +
        "/" +
        oldCommit
    );

    request
      .then(response => {
        this.state.data = response.data.structure.children[0];
        this.setState({ loading: false });
        this.reset();

        this.supperClassList = response.data.supperClassList;
        this.interfaceList = response.data.interfacesList;

        this.responseData = response.data.children;

        this.plot(this.responseData, null, "");
        this.updateCamera(response.data.width, response.data.depth);
      })
      .catch(e => {
        this.setState({ loading: false });
        swal(
          "Error during plot",
          "Something went wrong during the plot. Try again later",
          "error"
        );
        console.error(e);
      });

    // this.scene.freezeActiveMeshes();
    this.scene.autoClear = false; // Color buffer
    this.scene.autoClearDepthAndStencil = false; // Depth and stencil, obviously
    this.scene.blockfreeActiveMeshesAndRenderingGroups = true;
    this.scene.blockfreeActiveMeshesAndRenderingGroups = false;
  }

  process(repository, json) {
    this.refs["dropdownRef"].selected = true;
    this.supperTypeList = ["empty list"];

    var res = repository.split("/");
    var auther = res[res.length - 2];
    var repo = res[res.length - 1];
    if (!BABYLON.Engine.isSupported()) {
      return;
    }

    const match = URLRegexp.exec(repository);
    if (!match) {
      swal("Invalid URL", "Please inform a valid Github URL.", "error");
      return;
    }
    // if (
    //   match !== this.props.match.params.repository ||
    //   branch !== this.props.match.params.branch
    // ) {
    //   this.props.history.push(`/${match[1]}/#/${branch}`);
    // }

    this.setState({
      repository: match[1],
      loading: true,
      superClassImageState: false,
      interfaceImageState: false
    });

    let request = null;
    if (json) {
      request = axios.get(json);
    } else {
      request = axios.get(endpoint + "loadcity/" + auther + "/" + repo);
    }

    request
      .then(response => {
        this.setState({ loading: false });
        this.reset();

        this.state.data = response.data.structure.children[0];
        this.commits = response.data.commits;
        var list1 = response.data.supperClassList;
        if (list1.length != 1) {
          this.supperClassList = list1;
        }
        var list2 = response.data.interfacesList;
        if (list2.length != 1) {
          this.interfaceList = list2;
        }
        this.currentCommit = this.commits[0];
        this.setState({ loadingTimeLine: true });

        this.responseData = response.data.children;
        this.plot(this.responseData, null, "");
        this.updateCamera(response.data.width, response.data.depth);
      })
      .catch(e => {
        this.setState({ loading: false });
        swal(
          "Error during plot",
          "Something went wrong during the plot. Try again later",
          "error"
        );
        console.error(e);
      });
    // var testJson = require("./test1.json");

    // this.setState({ loading: false });
    // this.reset();

    // this.commits = testJson.commits;
    // var list1 = testJson.supperClassList;
    // if (list1.length != 1) {
    //   this.supperClassList = list1;
    // }
    // var list2 = testJson.interfacesList;
    // if (list2.length != 1) {
    //   this.interfaceList = list2;
    // }
    // this.currentCommit = this.commits[0];
    // this.setState({ loadingTimeLine: true });

    // this.responseData = testJson.children;
    // this.plot(this.responseData, null);
    // this.updateCamera(testJson.width, testJson.depth);

    // this.scene.freezeActiveMeshes();
    this.scene.autoClear = false; // Color buffer
    this.scene.autoClearDepthAndStencil = false; // Depth and stencil, obviously
    this.scene.blockfreeActiveMeshesAndRenderingGroups = true;
    this.scene.blockfreeActiveMeshesAndRenderingGroups = false;
  }

  onClick() {
    this.setState({ loadingTimeLine: false });
    searchEvent(this.state.repository);
    this.process(this.state.repository, "");
  }

  onFeedBackFormClose() {
    this.setState({ feedbackFormActive: false });
  }

  openFeedBackForm() {
    this.setState({ feedbackFormActive: true });
    feedbackEvent();
  }

  openModal(path, numberOfLines) {
    // this.fileDiff = require("./test.json");
    this.setState({ fileDiffLoading: true });
    var oldCommit;
    var index = 0;
    this.commits.forEach(element => {
      if (element == this.currentCommit) {
        oldCommit = this.commits[index + 1];
      }
      index++;
    });
    path = path.replace(/\//g, ">");
    let request = null;
    request = axios.get(
      endpoint +
        "filedifferent/" +
        path +
        "/" +
        this.currentCommit +
        "/" +
        oldCommit +
        "/" +
        numberOfLines
    );

    request
      .then(response => {
        this.setState({ fileDiffLoading: false });
        if (response.data != "") {
          if (response.data.obj.length != 0) {
            this.fileDiff = response.data.obj;
            this.selectedClass = path;
            this.setState({ modalActive: true });
          } else {
            swal("Message", "nothing defferece two commits", "error");
          }
        } else {
          this.setState({ fileDiffLoading: false });
          swal(
            "Error during plot",
            "Something went wrong during the plot. Try again later",
            "error"
          );
        }
      })
      .catch(e => {
        // this.setState({ loading: false });
        this.setState({ fileDiffLoading: false });
        swal(
          "Error during plot",
          "Something went wrong during the plot. Try again later",
          "error"
        );
        console.error(e);
      });
  }

  closeModal() {
    this.setState({ modalActive: false });
    this.setState({ bugModalActive: false });
  }

  getBadgeValue(template) {
    const repo = this.state.repository;
    const baseUrl = `https://img.shields.io/static/v1?label=gocity&color=blue&style=for-the-badge&message=${repo}&logo=${logoBase64()}`;
    const templates = {
      md: `![](${baseUrl})`,
      html: `<img src="${baseUrl}" alt="checkout my repo on gocity"/>`
    };
    return templates[template];
  }

  selectSuperType = event => {
    this.setState({
      value: event.target.value,
      superClassImageState: false,
      interfaceImageState: false
    });
    if (event.target.value == "extends") {
      this.supperTypeList = this.supperClassList;
      this.dependancyType = "extends";
    } else if (event.target.value == "implements") {
      this.supperTypeList = this.interfaceList;
      this.dependancyType = "implements";
    } else {
      this.setState({ loading: true });
      this.supperTypeList = ["empty list"];
      this.plot(this.responseData, null, "");
      this.setState({ loading: false });
    }
  };

  getDependency = event => {
    this.setState({ loading: true });
    this.refs["checkBoxRef"].checked = false;
    this.isShowFileDiff = false;
    this.refs["BugcheckBoxRef"].checked = false;
    this.isShowBug = false;
    var eventValue = event.target.value;
    setTimeout(
      function() {
        this.setState({ loading: false });
        if (this.supperTypeList[0] != eventValue) {
          if (this.dependancyType == "extends") {
            this.dependancyPlot(this.responseData, null, eventValue, "");
            this.setState({
              superClassImageState: true,
              interfaceImageState: false
            });
          } else {
            this.dependancyPlot(this.responseData, null, "", eventValue);
            this.setState({
              superClassImageState: false,
              interfaceImageState: true
            });
          }
        } else {
          this.plot(this.responseData, null, "");
          this.setState({
            superClassImageState: false,
            interfaceImageState: false
          });
        }
        this.updateCamera(
          this.responseData[0].width,
          this.responseData[0].depth
        );
      }.bind(this),
      1
    );
  };

  handleChecked() {
    this.setState({
      loading: true,
      superClassImageState: false,
      interfaceImageState: false
    });
    this.refs["BugcheckBoxRef"].checked = false;
    this.isShowBug = false;
    this.isShowFileDiff = !this.isShowFileDiff;
    this.refs["dropdownRef"].selected = true;
    this.supperTypeList = ["empty list"];
    this.plot(this.responseData, null, "");
    this.setState({ loading: false });
  }

  handleBug() {
    this.setState({
      loading: true,
      superClassImageState: false,
      interfaceImageState: false
    });
    this.refs["checkBoxRef"].checked = false;
    this.isShowFileDiff = false;
    this.isShowBug = !this.isShowBug;
    this.refs["dropdownRef"].selected = true;
    this.supperTypeList = ["empty list"];
    this.plot(this.responseData, null, "");
    this.setState({ loading: false });
  }

  bugModal() {
    this.setState({ bugModalActive: true });
  }

  onToggle(node, toggled) {
    this.refs["dropdownRef"].selected = true;
    this.supperTypeList = ["empty list"];
    const { cursor, data } = this.state;
    this.setState({ loading: true });
    if (cursor) {
      cursor.active = false;
      this.setState(() => ({ cursor, active: false }));
    }
    node.active = true;
    if (node.children) {
      node.toggled = toggled;
    } else {
      var className = node.name.substring(0, node.name.indexOf("."));
      this.plot(this.responseData, null, className);
    }
    this.setState(() => ({ cursor: node, data: Object.assign({}, data) }));
    this.setState({ loading: false });
  }

  render() {
    const { data } = this.state;
    return (
      <div style={{ height: "100%" }}>
        <div
          style={{
            width: "20%",
            float: "left",
            height: "100%",
            overflow: "auto",
            background: "#21252b"
          }}
        >
          <Treebeard data={data} onToggle={this.onToggle} />
        </div>
        <main onMouseMove={this.onMouseMove}>
          <a
            href="https://github.com/rodrigo-brito/gocity"
            className="github-corner is-hidden-tablet"
            aria-label="View source on GitHub"
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 250 250"
              style={{ fill: "#151513", color: "#fff" }}
              aria-hidden="true"
            >
              <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" />
              <path
                d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
                fill="currentColor"
                style={{ transformOrigin: "130px 106px" }}
                className="octo-arm"
              />
              <path
                d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
                fill="currentColor"
                className="octo-body"
              />
            </svg>
          </a>

          <FloatBox
            position={this.state.infoPosition}
            info={this.state.infoData}
            visible={this.state.infoVisible}
          />
          <header className="header">
            <div className="container">
              {!this.state.loadingTimeLine ? (
                <Loading message="Fetching repository..." />
              ) : (
                <HorizontalTimelineContent
                  onRevertCode={this.revertCode}
                  valueArray={this.commits}
                  repo={this.state.repository}
                />
              )}

              {/* <Navbar /> */}
              {/* <p>
              GoCity is an implementation of the Code City metaphor for
              visualizing Go source code. Visit our repository for{" "}
              <a href="https://github.com/rodrigo-brito/gocity">
                more details.
              </a>
            </p> */}
              {/* <p>
              You can also add a custom badge for your go repository.{" "}
              <a onClick={this.bugModal} href="#">
                click here
              </a>{" "}
              to generate one.
            </p> */}
              <div className="field has-addons">
                <div className="control" style={{ width: "40%" }}>
                  <input
                    onKeyPress={this.handleKeyPress}
                    onChange={this.onInputChange}
                    className="input"
                    id="repository"
                    type="text"
                    placeholder="eg: github.com/golang/go"
                    value={this.state.repository}
                  />
                </div>
                {/* <div className="control">
                <input
                  onKeyPress={this.handleKeyPress}
                  onChange={this.onInputChange}
                  className="input"
                  id="branch"
                  type="text"
                  placeholder="eg: master"
                  value={this.state.branch}
                />
              </div> */}
                <div className="control">
                  <a
                    id="search"
                    onClick={this.onClick}
                    className="button is-info"
                  >
                    Plot
                  </a>
                </div>
                <select
                  onChange={this.selectSuperType}
                  style={{ marginLeft: "2%" }}
                >
                  <option ref="dropdownRef" value="">
                    Dependancy
                  </option>
                  <option value="extends">Extends</option>
                  <option value="implements">Implements</option>
                </select>
                <select
                  onChange={this.getDependency}
                  style={{ marginLeft: 10 }}
                >
                  {this.supperTypeList.map(list => (
                    <option key={list} value={list}>
                      {list}
                    </option>
                  ))}
                </select>
                <div style={{ marginLeft: 10 }}>
                  <input
                    type="checkbox"
                    onChange={this.handleChecked}
                    ref="checkBoxRef"
                  />
                  Compare Changes
                </div>
                <div style={{ marginLeft: 10 }}>
                  <input
                    type="checkbox"
                    onChange={this.handleBug}
                    ref="BugcheckBoxRef"
                  />
                  View bugs
                </div>
              </div>
              {/* <div className="level">
              <small className="level-left">
                Examples:{" "}
                {examples.map(example => (
                  <a
                    className="m-l-10"
                    key={example.link}
                    onClick={() => {
                      this.process(example.link, example.json, example.branch);
                    }}
                  >
                    {example.name}
                  </a>
                ))}
              </small>
            </div> */}
            </div>
            <div
              className={this.state.modalActive ? "modal is-active" : "modal"}
            >
              <div className="modal-background"></div>
              <div className="modal-card">
                <section className="modal-card-body">
                  <div class="content">
                    {this.state.modalActive ? (
                      <ApexCharts
                        classPath={this.selectedClass}
                        diff={this.fileDiff}
                      />
                    ) : null}
                  </div>
                </section>
              </div>
              <button
                onClick={this.closeModal}
                className="modal-close is-large"
                aria-label="close"
              ></button>
            </div>

            <div
              className={
                this.state.bugModalActive ? "modal is-active" : "modal"
              }
            >
              <div className="modal-background"></div>
              <div
                className="modal-card"
                style={{ width: "80%", height: "auto" }}
              >
                <section className="modal-card-body">
                  <div class="content">
                    {this.state.bugModalActive ? (
                      <BugView
                        BugList={this.bugList}
                        classPath={this.bugLIstPath}
                      />
                    ) : // <ApexCharts
                    //   classPath={this.selectedClass}
                    //   diff={this.fileDiff}
                    // />
                    null}
                  </div>
                </section>
              </div>
              <button
                onClick={this.closeModal}
                className="modal-close is-large"
                aria-label="close"
              ></button>
            </div>
          </header>

          {this.state.fileDiffLoading ? (
            <img
              src={LoadingImage}
              alt=""
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "8%"
              }}
            />
          ) : null}

          <section className="canvas">
            {this.state.superClassImageState ? (
              <img
                style={{ left: "20%" }}
                className="key-img"
                src={SuperClassImage}
                alt=""
              />
            ) : null}
            {this.state.interfaceImageState ? (
              <img
                style={{ left: "20%" }}
                className="key-img"
                src={InterfaceImage}
                alt=""
              />
            ) : null}
            {this.state.loading ? (
              <Loading message="Fetching repository..." />
            ) : (
              <BabylonScene
                width={window.innerWidth}
                engineOptions={{ preserveDrawingBuffer: true, stencil: true }}
                onSceneMount={this.onSceneMount}
              />
            )}
          </section>
          <div className="footer-warning notification is-danger is-hidden-tablet is-paddingless is-marginless is-unselectable">
            GoCity is best viewed on Desktop
          </div>
          <Legend />
        </main>
      </div>
    );
  }
}

export default App;
