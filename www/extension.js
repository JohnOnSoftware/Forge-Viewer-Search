/*

The MIT License (MIT)

Copyright (c) Thu Aug 18 2016 Zhong Wu zhong.wu@autodesk.com

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORTOR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

AutodeskNamespace('ElasticSearch')

ElasticSearch.Extension = function (viewer, option) {
  Autodesk.Viewing.Extension.call(this, viewer, option)
  _viewer = viewer
  _self = this
}

ElasticSearch.Extension.prototype = Object.create(Autodesk.Viewing.Extension.prototype)
ElasticSearch.Extension.prototype.constructor = ElasticSearch.Extension

ElasticSearch.Extension.prototype.onToolbarCreated = function (e) {
  console.log('toolbar created event is called')
  _viewer.removeEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, _self.onToolbarCreated)
  _self.createMyUI()
}

ElasticSearch.Extension.prototype.createToggler = function (button, click, unclick) {
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

ElasticSearch.Extension.prototype.screenPointToHitPoint = function (screenPoint) {
  var viewport = _viewer.navigation.getScreenViewport()
  var n = {
    x: (screenPoint.x - viewport.left) / viewport.width,
    y: (screenPoint.y - viewport.top) / viewport.height
  }

  var hitPoint = _viewer.utilities.getHitPoint(n.x, n.y)
  return hitPoint
}

ElasticSearch.Extension.prototype.createDivToolbar = function () {
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

        var parameters = '?x=' + worldPoint.x + '&y=' + worldPoint.y + '&z=' + worldPoint.z

        $.ajax({
          url: '/search/elements' + parameters,
          type: 'GET',
          success: function (data) {
            var element = JSON.parse(data)
            _viewer.model.setThemingColor(element._source.dbid, new THREE.Vector4(1, 0, 0, 1))
            console.log('successfull find result ' + data)
          }
        })

      // create a sphere    
      var sphere = new THREE.SphereGeometry(1, 32)
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

  var g_instanceTree = null

  var recursiveIndexChildNode = function (dbid) {
    if (g_instanceTree === null)
      return

    g_instanceTree.enumNodeChildren(dbid, function (childId) {
      indexNode(childId)
      recursiveIndexChildNode(childId)
    })
  }

  var indexNode = function (dbid) {
    console.log(dbid)
    if (g_instanceTree === null) {
      console.log('instance tree is not ready.')
      return
    }

    g_instanceTree.enumNodeFragments(dbid, function (fragId) {
      console.log('dbId: ' + dbid + ' FragId : ' + fragId)
      var mesh = _viewer.impl.getFragmentProxy(_viewer.model, fragId)
      // var renderp = _viewer.impl.getRenderProxy(_viewer.model, fragId)
      mesh.getAnimTransform()

      var dst = new THREE.Matrix4()

      var wm = mesh.getWorldMatrix(dst)
      console.log('location: x: ' + dst.getPosition().x + ' y: ' + dst.getPosition().y + ' z: ' + dst.getPosition().z)
      // var parameters = '?x=' + dst.getPosition().x + '&y=' + dst.getPosition().y + '&z=' + dst.getPosition().z

      var fragment = {
        dbid: dbid.toString(),
        fragid: fragId.toString(),
        x: dst.getPosition().x,
        y: dst.getPosition().y,
        z: dst.getPosition().z
      }

      $.ajax({
        url: '/search/index',
        type: 'post',
        contentType: 'application/json',
        // async: false,
        // dataType: 'json',
        success: function (data) {
          console.log('successfull created index for ' + dbid)
        },
        data: JSON.stringify(fragment)

      })

    // mesh.position = position
    // mesh.updateAnimTransform()
    // console.log('after location: x: ' + mesh.position.x + ' y: ' + mesh.position.y + ' z: ' + mesh.position.z)
    }, false)
  }

  var ctrGroup = new Autodesk.Viewing.UI.ControlGroup('my-seperated-toolbar')
  var button3 = new Autodesk.Viewing.UI.Button('my-seperated-button')
  button3.icon.style.backgroundImage = 'url(../img/button.png)'
  button3.setToolTip('Index all the fragment within the model')
  button3.addClass('my-seperated-button')

  // click this button to index all the elements
  button3.onClick = function () {
    console.log('find all the elements within the area of click point')
    _viewer.getObjectTree(function (instanceTree) {
      g_instanceTree = instanceTree
      var dbid = instanceTree.nodeAccess.rootId

      indexNode(dbid)
      recursiveIndexChildNode(dbid)
      alert('Finished Index all the fragement in the model.')
    })
  }

  ctrGroup.addControl(button3)
  var toggleButton = createToggleButton()
  ctrGroup.addControl(toggleButton)

  $('#divToolbar')[0].appendChild(ctrGroup.container)
}

ElasticSearch.Extension.prototype.createMyUI = function () {
  console.log('create UI')
  _self.createDivToolbar()
}

ElasticSearch.Extension.prototype.load = () => {
  if (_viewer.toolbar) {
    _self.createMyUI()
  }else {
    _viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, _self.onToolbarCreated)
    console.log('Events are registered')
  }

  console.log('ElasticSearch extension is loaded')
  return true
}

ElasticSearch.Extension.prototype.unload = () => {
  console.log('ElasticSearch extension is unloaded')
  _viewer.toolbar.removeControl(_self.subToolbar)
  return true
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  'ElasticSearchExtension', ElasticSearch.Extension)
