// import React, { Component } from "react";
// import FloatBox from "./FloatBox";
// import * as BABYLON from "babylonjs";
// import BabylonScene from "./Scene";
// import axios from "axios";
// import Navbar from "./Nav";
// import Legend from "./Legend";
// import Loading from "./Loading";
// import {
//   feedbackEvent,
//   getProportionalColor,
//   searchEvent,
//   logoBase64
// } from "./utils";
// import swal from "sweetalert2";
// import Cookies from "js-cookie";
// import HorizontalTimelineContent from "./Components/HorizontalTimelineContent";

// const URLRegexp = new RegExp(/^(?:https:\/\/?)?(github\.com\/.*)/i);

// const endpoint = "http://localhost:8080/CodeCity/load/changecity";

// // TODO: isolate in the constants file
// const colors = {
//   PACKAGE: {
//     start: { r: 255, g: 100, b: 100 },
//     end: { r: 255, g: 100, b: 100 }
//   },
//   FILE: {
//     start: { r: 255, g: 255, b: 255 },
//     end: { r: 0, g: 0, b: 0 }
//   },
//   STRUCT: {
//     start: { r: 32, g: 156, b: 238 },
//     end: { r: 0, g: 0, b: 0 }
//   }
// };

// class City extends Component {
//   canvas = null;
//   scene = null;
//   engine = null;
//   camera = null;
//   light = null;

//   constructor(props) {
//     super(props);
//     this.state = {
//       feedbackFormActive: false,
//       loading: false,
//       repository:
//         this.props.match.params.repository || "github.com/rodrigo-brito/gocity",
//       branch: this.props.match.params.branch || "master",
//       modalActive: false
//     };

//     this.addBlock = this.addBlock.bind(this);
//     this.onInputChange = this.onInputChange.bind(this);
//     this.onClick = this.onClick.bind(this);
//     this.showTooltip = this.showTooltip.bind(this);
//     this.hideTooltip = this.hideTooltip.bind(this);
//     this.plot = this.plot.bind(this);
//     this.process = this.process.bind(this);
//     this.reset = this.reset.bind(this);
//     this.initScene = this.initScene.bind(this);
//     this.onMouseMove = this.onMouseMove.bind(this);
//     this.updateCamera = this.updateCamera.bind(this);
//     this.onSceneMount = this.onSceneMount.bind(this);
//     this.onFeedBackFormClose = this.onFeedBackFormClose.bind(this);
//     this.openFeedBackForm = this.openFeedBackForm.bind(this);
//     this.openModal = this.openModal.bind(this);
//     this.closeModal = this.closeModal.bind(this);
//     this.getBadgeValue = this.getBadgeValue.bind(this);
//   }

//   // componentDidMount() {
//   //   if (this.state.repository) {
//   //     this.process(this.state.repository, "", this.state.branch);
//   //   }
//   // }

//   showTooltip(info) {
//     setTimeout(() => {
//       this.setState({
//         infoVisible: true,
//         infoData: info,
//         infoPosition: { x: this.mouse_x, y: this.mouse_y }
//       });
//     }, 100);
//   }

//   hideTooltip() {
//     this.setState({
//       infoVisible: false
//     });
//   }

//   reset() {
//     this.scene.dispose();
//     this.scene = new BABYLON.Scene(this.engine);
//     this.initScene();
//   }

//   addBlock = data => {
//     const bar = BABYLON.MeshBuilder.CreateBox(
//       data.label,
//       { width: data.width, depth: data.depth, height: data.height },
//       this.scene
//     );
//     bar.receiveShadows = false;

//     if (data.parent) {
//       bar.parent = data.parent;

//       var bounds = data.parent.getBoundingInfo();
//       bar.position.y = bounds.maximum.y + data.height / 2.0;
//     }
//     bar.position.x = data.x || 0;
//     bar.position.z = data.y || 0;

//     bar.info = data.info;

//     bar.actionManager = new BABYLON.ActionManager(this.scene);
//     bar.actionManager.registerAction(
//       new BABYLON.ExecuteCodeAction(
//         BABYLON.ActionManager.OnPointerOverTrigger,
//         () => {
//           this.showTooltip(bar.info);
//         }
//       )
//     );

//     bar.actionManager.registerAction(
//       new BABYLON.ExecuteCodeAction(
//         BABYLON.ActionManager.OnPointerOutTrigger,
//         this.hideTooltip
//       )
//     );

//     // Material
//     bar.material = new BABYLON.StandardMaterial(data.label + "mat", this.scene);
//     bar.material.diffuseColor = data.color;

//     bar.freezeWorldMatrix();

//     return bar;
//   };

//   plot(children, parent) {
//     if (!children) {
//       return;
//     }

//     children.forEach(data => {
//       var color = getProportionalColor(
//         colors[data.type].start,
//         colors[data.type].end,
//         Math.min(100, data.numberOfLines / 2000.0)
//       );

//       var mesh = this.addBlock({
//         x: data.position.x,
//         y: data.position.y,
//         width: data.width,
//         depth: data.depth,
//         height: data.numberOfLines,
//         color: new BABYLON.Color3(color.r / 255, color.g / 255, color.b / 255),
//         parent: parent,
//         info: {
//           name: data.name,
//           url: data.url,
//           type: data.type,
//           NOM: data.numberOfMethods,
//           NOL: data.numberOfLines,
//           NOA: data.numberOfAttributes
//         }
//       });

//       if (parent) {
//         mesh.parent = parent;
//       }

//       if (data.children && data.children.length > 0) {
//         this.plot(data.children, mesh);
//       }
//     });
//   }

//   updateCamera(width, height) {
//     if (width > 1000) {
//       this.camera.useAutoRotationBehavior = false;
//     } else {
//       this.camera.useAutoRotationBehavior = true;
//     }
//     width = Math.min(width, 1000);
//     height = Math.min(height, 1000);
//     this.camera.setPosition(
//       new BABYLON.Vector3(width / 2, width, (width + height) / 2)
//     );
//   }

//   initScene() {
//     this.scene.clearColor = new BABYLON.Color3(0.7, 0.7, 0.7);
//     // This creates and positions a free camera (non-mesh)
//     this.camera = new BABYLON.ArcRotateCamera(
//       "camera",
//       0,
//       0,
//       10,
//       BABYLON.Vector3.Zero(),
//       this.scene
//     );

//     // This targets the camera to scene origin
//     this.camera.setTarget(BABYLON.Vector3.Zero());

//     // This attaches the camera to the canvas
//     this.camera.attachControl(this.canvas, true);

//     this.camera.setPosition(new BABYLON.Vector3(500, 400, -100));
//     this.camera.useAutoRotationBehavior = true;

//     // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
//     var light = new BABYLON.HemisphericLight(
//       "global_light",
//       new BABYLON.Vector3(0, 1, 0),
//       this.scene
//     );

//     light.intensity = 0.8;
//   }

//   onSceneMount(e) {
//     this.scene = e.scene;
//     this.canvas = e.canvas;
//     this.engine = e.engine;

//     this.initScene();

//     this.engine.runRenderLoop(() => {
//       if (this.scene) {
//         this.scene.render();
//       }
//     });
//   }

//   process(repository, json, branch) {
//     if (!BABYLON.Engine.isSupported()) {
//       return;
//     }

//     const match = URLRegexp.exec(repository);
//     if (!match) {
//       swal("Invalid URL", "Please inform a valid Github URL.", "error");
//       return;
//     }
//     if (
//       match !== this.props.match.params.repository ||
//       branch !== this.props.match.params.branch
//     ) {
//       this.props.history.push(`/${match[1]}/#/${branch}`);
//     }

//     this.setState({
//       repository: match[1],
//       loading: true
//     });

//     let request = null;
//     if (json) {
//       request = axios.get(json);
//     } else {
//       // request = axios.get(endpoint, {
//       //   // params: {
//       //   //   q: match[1],
//       //   //   b: branch
//       //   // }
//       // });
//       request = axios.get(
//         " https://my-json-server.typicode.com/TheekshanaM/JsonDemo/posts"
//       );
//     }

//     request
//       .then(response => {
//         this.setState({ loading: false });
//         this.reset();

//         var testJson = require("./test1.json");
//         console.log(testJson);
//         this.plot(testJson.children);
//         this.updateCamera(testJson.width, testJson.depth);
//       })
//       .catch(e => {
//         this.setState({ loading: false });
//         swal(
//           "Error during plot",
//           "Something went wrong during the plot. Try again later",
//           "error"
//         );
//         console.error(e);
//       });
//     // .then(response => {
//     //   this.setState({ loading: false });
//     //   this.reset();

//     //   if (response.data.children && response.data.children.length === 0) {
//     //     swal('Invalid project', 'Only Go projects are allowed.', 'error');
//     //   }

//     //   this.plot(response.data.children);
//     //   this.updateCamera(response.data.width, response.data.depth);
//     // })
//     // .catch(e => {
//     //   this.setState({ loading: false });
//     //   swal('Error during plot', 'Something went wrong during the plot. Try again later', 'error');
//     //   console.error(e);
//     // });

//     // this.scene.freezeActiveMeshes();
//     this.scene.autoClear = false; // Color buffer
//     this.scene.autoClearDepthAndStencil = false; // Depth and stencil, obviously
//     this.scene.blockfreeActiveMeshesAndRenderingGroups = true;
//     this.scene.blockfreeActiveMeshesAndRenderingGroups = false;
//   }

//   onFeedBackFormClose() {
//     this.setState({ feedbackFormActive: false });
//   }

//   openFeedBackForm() {
//     this.setState({ feedbackFormActive: true });
//     feedbackEvent();
//   }

//   render() {
//     return (
//       <div>
//         <FloatBox
//           position={this.state.infoPosition}
//           info={this.state.infoData}
//           visible={this.state.infoVisible}
//         />

//         <section className="canvas">
//           {this.state.loading ? (
//             <Loading message="Fetching repository..." />
//           ) : (
//             <BabylonScene
//               width={window.innerWidth}
//               engineOptions={{ preserveDrawingBuffer: true, stencil: true }}
//               onSceneMount={this.onSceneMount}
//             />
//           )}
//         </section>
//         <div className="footer-warning notification is-danger is-hidden-tablet is-paddingless is-marginless is-unselectable">
//           GoCity is best viewed on Desktop
//         </div>
//         <Legend />
//       </div>
//     );
//   }
// }

// export default City;
