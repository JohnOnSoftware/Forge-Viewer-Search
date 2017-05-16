// var recursivePrintChildNode = function (instanceTree, node) {
//   instanceTree.enumNodeChildren(node.dbId, function (childId) {
//     node.children = node.children || []

//     let childNode = {
//       dbId: childId,
//       name: instanceTree.getNodeName(childId)
//     }

//     node.children.push(childNode)
//     console.log(childNode)
//     recursivePrintChildNode(instanceTree, childNode)
//   })
// }

// recursiveSetColor = function (instance, dbid, color) {
//   instance.enumNodeChildren(dbid, function (childId) {
//     NOP_VIEWER.model.setThemingColor(childId, color)
//     recursiveSetColor(instance, childId, color)
//   })
// }

// setColor = function (color) {
//   var instance = NOP_VIEWER.model.getData().instanceTree
//   var root = instance.nodeAccess.rootId
//   recursiveSetColor(instance, root, color)
// }

// class MyExtension extends Autodesk.Viewing.Extension {
//   constructor (viewer, option) {
//     super(viewer, option)
//     this._viewer = viewer
//     console.log(this._viewer)
//   }

//   onGeometryLoaded () {
//     // setColor(new THREE.Vector4(1, 0, 0, 1))
//     // var instanceTree = this.model.getData().instanceTree
//     NOP_VIEWER.getObjectTree(function (instanceTree) {
//       console.log('print the instance tree of this model.')
//       let rootNode = {
//         dbId: instanceTree.nodeAccess.rootId,
//         name: instanceTree.getNodeName(instanceTree.nodeAccess.rootId)
//       }
//       console.log(rootNode)
//       recursivePrintChildNode(instanceTree, rootNode)
//     })
//   }

//   onSelectionChanged (event) {
//     let currentNodeIds = event.dbIdArray
//     let currentModel = event.model
//     if (currentModel) {
//       currentNodeIds.forEach(function (nodeId) {
//         console.log('Current selected object DbId is:' + nodeId)
//         var it = NOP_VIEWER.model.getData().instanceTree
//         it.enumNodeFragments(nodeId, function (fragId) {
//           console.log('dbId: ' + nodeId + ' FragId : ' + fragId)
//           var mesh = NOP_VIEWER.impl.getFragmentProxy(NOP_VIEWER.model, fragId)
//           var renderp = NOP_VIEWER.impl.getRenderProxy(NOP_VIEWER.model, fragId)
//           mesh.getAnimTransform()

//           let dst = new THREE.Matrix4()

//           var wm = mesh.getWorldMatrix(dst)
//           let position = new THREE.Vector3(
//             mesh.position.x + 1,
//             mesh.position.y + 1,
//             mesh.position.z)
//           console.log('before location: x: ' + mesh.position.x + ' y: ' + mesh.position.y + ' z: ' + mesh.position.z)

//           mesh.position = position
//           mesh.updateAnimTransform()
//           console.log('after location: x: ' + mesh.position.x + ' y: ' + mesh.position.y + ' z: ' + mesh.position.z)
//         }, false)

//         currentModel.getProperties(nodeId, function (result) {
//           if (result.properties) {
//             result.properties.forEach(function (prop) {
//               // console.log(prop)
//             })
//           }
//         })
//       })
//     }
//   }

//   load () {
//     console.log('My Extension is loaded')
//     this._viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, this.onGeometryLoaded)
//     this._viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onSelectionChanged)

//     this._viewer.container.addEventListener('mousedown', function (event) {
//       console.log('clicked')
//     })

//     this._viewer.container.addEventListener('mouseup', function (event) {
//       console.log('up')
//       // NOP_VIEWER.hideById(2216)

//       //   var vp = NOP_VIEWER.impl.clientToViewport(event.canvasX, event.canvasY)
//       //   var renderer = NOP_VIEWER.impl.renderer()

//     //   var dbId = renderer.idAtPixel(vp.x, vp.y)
//     //   console.log(dbId)
//     })
//     return true
//   }

//   unload () {
//     alert('My Extension is unloaded')
//     this._viewer.removeEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, this.onGeometryLoaded)
//     this._viewer.removeEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onSelectionChanged)
//     return true
//   }
// }

// Viewing.ClassroomTrainning.Extension.prototype.load = () => {
//   if (_viewer.toolbar) {
//     _self.createMyUI()
//   }else {
//     _viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, _self.onToolbarCreated)
//     console.log('Events are registered')
//   }

//   // this._viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, this.onGeometryLoaded)
//   // this._viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onSelectionChanged)
//   console.log('My extension is loaded')
//   return true
// }

// Viewing.ClassroomTrainning.Extension.prototype.unload = () => {
//   console.log('My extension is unloaded')
//   _viewer.toolbar.removeControl(_self.subToolbar)
//   return true
// }

// Autodesk.Viewing.theExtensionManager.registerExtension(
//   'MyExtension', MyExtension)

AutodeskNamespace('Viewing.ClassroomTrainning')

Viewing.ClassroomTrainning.Extension = function (viewer, option) {
  Autodesk.Viewing.Extension.call(this, viewer, option)
  _viewer = viewer
  _self = this
}

Viewing.ClassroomTrainning.Extension.prototype = Object.create(Autodesk.Viewing.Extension.prototype)
Viewing.ClassroomTrainning.Extension.prototype.constructor = Viewing.ClassroomTrainning.Extension

Viewing.ClassroomTrainning.Extension.prototype.onToolbarCreated = function (e) {
  console.log('toolbar created event is called')
  _viewer.removeEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, _self.onToolbarCreated)
  _self.createMyUI()
}

Viewing.ClassroomTrainning.Extension.prototype.createToggler = function (button, click, unclick) {
  return function () {
    var state = button.getState()
    if (state === Autodesk.Viewing.UI.Button.State.INACTIVE) {
      button.setState(Autodesk.Viewing.UI.Button.State.ACTIVE)
      click()
    } else if (state === Autodesk.Viewing.UI.Button.State.ACTIVE) {
      button.setState(Autodesk.Viewing.UI.Button.State.INACTIVE)
      unclick()
    }
  }
}

Viewing.ClassroomTrainning.Extension.prototype.screenPointToHitPoint = function (screenPoint) {
  var viewport = _viewer.navigation.getScreenViewport()
  var n = {
    x: (screenPoint.x - viewport.left) / viewport.width,
    y: (screenPoint.y - viewport.top) / viewport.height
  }

  var hitPoint = _viewer.utilities.getHitPoint(n.x, n.y)
  return hitPoint
}

Viewing.ClassroomTrainning.Extension.prototype.createDivToolbar = function () {
  var createToggleButton = function () {
    var geoMaterial = null

    var initMaterial = function () {
      if (geoMaterial == null) {
        var cubeMaterials = [
          new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true, opacity: 0.1, side: THREE.DoubleSide}),
          new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: true, opacity: 0.1, side: THREE.DoubleSide}),
          new THREE.MeshBasicMaterial({color: 0x0000ff, transparent: true, opacity: 0.1, side: THREE.DoubleSide}),
          new THREE.MeshBasicMaterial({color: 0xffff00, transparent: true, opacity: 0.1, side: THREE.DoubleSide}),
          new THREE.MeshBasicMaterial({color: 0xff00ff, transparent: true, opacity: 0.1, side: THREE.DoubleSide}),
          new THREE.MeshBasicMaterial({color: 0x00ffff, transparent: true, opacity: 0.1, side: THREE.DoubleSide})
        ]
        // Create a MeshFaceMaterial, which allows the cube to have different materials on each face 
        geoMaterial = new THREE.MeshFaceMaterial(cubeMaterials)

        // geoMaterial = new THREE.MeshLambertMaterial({color: 0xff0000, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
        _viewer.impl.matman().addMaterial('material-red', geoMaterial, true)
      // console.log('Red material is added');                
      // var frags = _viewer.model.getFragmentList()
      // frags.setMaterial(0, geoMaterial) // Assign the material to specific fragment
      }
    }

    var uninitMaterial = function () {
      if (geoMaterial) {
        _viewer.impl.matman().removeMaterial('material-red')
        geoMaterial = null
        console.log('Red material is removed')
      }
    }

    var createGeometry = function (event) {
      var screenPoint = {
        x: event.clientX,
        y: event.clientY
      }

      var worldPoint = _self.screenPointToHitPoint(screenPoint)
      if (worldPoint) {
        console.log('find a point by click. X: ' + worldPoint.x + 'Y: ' + worldPoint.y + 'Z: ' + worldPoint.z)
        // create a sphere    
        // var sphere = new THREE.SphereGeometry(1, 32)
        var sphere = new THREE.CubeGeometry(2, 2, 2)
        var mesh = new THREE.Mesh(sphere, geoMaterial)
        mesh.renderOrder = 1
        mesh.position.set(worldPoint.x, worldPoint.y, worldPoint.z)
        _viewer.impl.scene.add(mesh)
        console.log('created a mesh and added to the scene.' + mesh.name)
        _viewer.impl.sceneUpdated(true)
      }
      else
        console.log('can not find a point by click')
    }

    var toggleButtonOn = function () {
      initMaterial()
      $('#MyViewerDiv').bind('click', createGeometry)
    }

    var toggleButtonOff = function () {
      uninitMaterial()
      $('#MyViewerDiv').unbind('click', createGeometry)
    }

    var toggleButton = new Autodesk.Viewing.UI.Button('my-toggle-button')
    toggleButton.icon.style.backgroundImage = 'url(../img/button.png)'
    toggleButton.setToolTip('Create a sphere')
    toggleButton.addClass('my-toggle-button')
    toggleButton.onClick = _self.createToggler(toggleButton, toggleButtonOn, toggleButtonOff)

    return toggleButton
  }

  // Add a seperated button
  var toolbarDivHtml = "<div id='divToolbar'></div>"
  $(_viewer.container).append(toolbarDivHtml)

  $('#divToolbar').css({
    'top': '20%',
    'left': '20%',
    'z-index': '100',
    'position': 'absolute'
  })

  var g_instanceTree = null;

  var recursiveIndexChildNode = function ( dbid) {
    if( g_instanceTree === null )
      return;
    
    g_instanceTree.enumNodeChildren(dbid, function (childId) {
      // node.children = node.children || []

      indexNode(childId)
      recursiveIndexChildNode( childId)
    })
  }


  var indexNode = function (dbid) {
    console.log(dbid);
    if( g_instanceTree === null )
      return;

    // g_instanceTree.enumNodeFragments(dbid, function (fragId) {
    //   console.log('dbId: ' + dbid + ' FragId : ' + fragId)
    //   var mesh = _viewer.impl.getFragmentProxy( _viewer.model, fragId)
    //   var renderp = _viewer.impl.getRenderProxy( _viewer.model, fragId)
    //   mesh.getAnimTransform()

    //   var dst = new THREE.Matrix4()

    //   var wm = mesh.getWorldMatrix(dst)
    //   var position = new THREE.Vector3(
    //     mesh.position.x + 1,
    //     mesh.position.y + 1,
    //     mesh.position.z)
    //   console.log('before location: x: ' + mesh.position.x + ' y: ' + mesh.position.y + ' z: ' + mesh.position.z)

    //   mesh.position = position
    //   mesh.updateAnimTransform()
    //   console.log('after location: x: ' + mesh.position.x + ' y: ' + mesh.position.y + ' z: ' + mesh.position.z)
    // }, false)
  }

  var ctrGroup = new Autodesk.Viewing.UI.ControlGroup('my-seperated-toolbar')
  var button3 = new Autodesk.Viewing.UI.Button('my-seperated-button')
  button3.icon.style.backgroundImage = 'url(../img/button.png)'
  button3.setToolTip('I am a seperated button')
  button3.addClass('my-seperated-button')
  button3.onClick = function () {
    console.log('I am a div button')
    _viewer.getObjectTree(function (instanceTree) {
      g_instanceTree = instanceTree;
      console.log('print the instance tree of this model.')
      var dbid = instanceTree.nodeAccess.rootId
      // let rootNode = {
      //   dbId: instanceTree.nodeAccess.rootId,
      //   name: instanceTree.getNodeName(instanceTree.nodeAccess.rootId)
      // }
      indexNode(dbid)
      recursiveIndexChildNode( dbid)
    })

    // $.ajax({
    //   url: '/db/price/'+nodeName,
    //   type: 'GET',
    //   success: function (data) {
    //     console.log('successfull get price: ' + data)
    //     _panel.addProperty(
    //       'Node Price', // property name
    //       data, // property value
    //       'Database Information') // group name
    //   }
    // })

  }

  ctrGroup.addControl(button3)
  var toggleButton = createToggleButton()
  ctrGroup.addControl(toggleButton)

  $('#divToolbar')[0].appendChild(ctrGroup.container)
}

Viewing.ClassroomTrainning.Extension.prototype.createMyUI = function () {
  console.log('create UI')
  _self.createDivToolbar()
}

Viewing.ClassroomTrainning.Extension.prototype.load = () => {
  if (_viewer.toolbar) {
    _self.createMyUI()
  }else {
    _viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, _self.onToolbarCreated)
    console.log('Events are registered')
  }

  console.log('My extension is loaded')
  return true
}

Viewing.ClassroomTrainning.Extension.prototype.unload = () => {
  console.log('My extension is unloaded')
  _viewer.toolbar.removeControl(_self.subToolbar)
  return true
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  'MyExtension', Viewing.ClassroomTrainning.Extension)
