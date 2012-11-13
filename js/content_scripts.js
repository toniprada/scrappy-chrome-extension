/*
Copyright 2012 UPM-GSI: Group of Intelligent Systems - Universidad Politécnica 
de Madrid (UPM)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use 
this file except in compliance with the License. You may obtain a copy of the 
License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by 
applicable law or agreed to in writing, software distributed 
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR 
CONDITIONS OF ANY KIND, either express or implied. See the License for the 
specific language governing permissions and limitations under the License.

@author Antonio Prada <toniprada@gmail.com>

*/

// To disable the sidebar:
const ORIGINAL_BODY_MARGIN = document.body.style.margin;
// Some UI elements that we'll use a lot:
const PARAGRAPH_TEXT = initParagraphText();
const PARAGRAPH_XPATH = initParagraphXPath();
const SELECT_TYPE = initSelectType();
const SELECT_RELATION = initSelectRelation();
const BUTTON_DELETE = initButtonDelete();
// dialogs IDs to reuse some dialog code:
const DIALOG_CONTAINER = 1;
const DIALOG_ELEMENTS = 2;

// What dialog is opened at this time:
var dialogId = DIALOG_CONTAINER;
// If the extension is enabled or not:
var extensionEnabled = false;
// We want to track it, so we can remove the previous styling:
var previousDOM = null;
// Identifier for elements, so we can delete them:
var elementId = 1;
// Data to pass to the background code:
var currentResource;
var resources = new Array();

/* ------------------------- Request Handling --------------------------------*/

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.callFunction == "toggleExtension") {
      // Enable-disable the extension
      toggleExtension();
    } else if (request.callFunction == "consoleLog") {
      // Log stuff from the background js
      console.log(request.value);
    } else if (request.callFunction == "showAboutDialog") {
      showAboutDialog();
    }  
  }
);

/* -------------------------- Initialization ---------------------------------*/

mouseMoveListener = function (e) {
  var srcElement = e.srcElement;
  // Lets check if our underlying element is not part of the sidebar
  if (srcElement.className.indexOf(CSS.classes.extension) == -1 
    && srcElement.className.indexOf("ui") == -1) {
    // We need to remove the class name since we will be styling 
    // the new one after.
    if (previousDOM != null) {
      previousDOM.classList.remove(CSS.classes.mouse_visited);
    }
    // Add a visited class name to the element. So we can style it.
    srcElement.classList.add(CSS.classes.mouse_visited);
    // The current element is now the previous. So we can remove the class
    // during the next iteration.
    previousDOM = srcElement;
  }
}

mouseClickListener = function (e) {
  var srcElement = e.srcElement;
  if (srcElement.className.indexOf(CSS.classes.extension) == -1
    && srcElement.className.indexOf("ui") == -1) {
    // The element clicked doesn't belong to the extension UI
    addElementToTheDialog(srcElement);
    // Stop propagation of links to avoid navigating to another page
    e.preventDefault();
    e.stopPropagation();
  } 
}

function initParagraphText() {
  var p = document.createElement("p"); 
  p.className = CSS.classes.elementText; 
  return p;
}

function initParagraphXPath() {
  var p = document.createElement("p"); 
  p.className = CSS.classes.elementXPath; 
  return p;
}


function initSelectType() {
  return initSelect(TYPES);
}

function initSelectRelation() {
  return initSelect(RELATIONS);
}

function initSelect(options) {
  var select= document.createElement("select");
  select.className = CSS.classes.elementType;
  var option;
  for (var i = 0; i < options.length; i++ ) {
    option = document.createElement("option");
    option.text = options[i];
    option.value = i;
    select.add(option);
  }
  return select;
}

function initButtonDelete() {
  var button = document.createElement("button");
  button.className =  CSS.classes.elementDelete;
  button.innerText = "Delete";    
  return button;
}

/* ----------------------- Enable/disable extension --------------------------*/

function toggleExtension() {
  if(extensionEnabled) {
    extensionEnabled = false;
    // Remove UI from the page DOM
    var el = document.getElementById(CSS.ids.sidebar);
    el.parentNode.removeChild(el);
    el = document.getElementById(CSS.ids.dialogs);
    el.parentNode.removeChild(el);
    document.body.style.margin = ORIGINAL_BODY_MARGIN;
    // Remove listeners
    document.removeEventListener('click', mouseClickListener, false);
  } else {
    extensionEnabled = true;
    // Create UI and add it to the page DOM
    createSidebar();
    createDialogs();
    // Add listeners
    document.addEventListener('click', mouseClickListener, false);
  }
}

function createSidebar() {
  var sidebar = document.createElement('iframe');
  sidebar.id = CSS.ids.sidebar;
  sidebar.src = chrome.extension.getURL('html/sidebar.html');
  document.body.appendChild(sidebar);
  document.body.style.margin = '0 0 0 300px';
}

function createDialogs() {
  var dialogs = document.createElement('div');
  dialogs.className = "hide";
  dialogs.id = CSS.ids.dialogs;
  dialogs.innerHTML =  '\
  <div id="' + CSS.ids.dialogElements + '" class="' + CSS.classes.extension 
  + '" title="Select the data elements contained on the previously selected ' 
  + 'parent" class="' + CSS.classes.extension +  '">\
  </div>\
  <div id="' + CSS.ids.dialogContainer + '" class="' + CSS.classes.extension 
  + '" title="Select the data parent" class="' 
  + CSS.classes.extension +  '">\
  </div>\
  <div id="' + CSS.ids.dialogAbout + '" class="' + CSS.classes.extension 
  + '" title="About" class="' + CSS.classes.extension +  '">\
  <p class="' + CSS.classes.extension +  '">\
  <img src="' + chrome.extension.getURL('img/logo_gsi.png') +
  '" class="' + CSS.classes.extension +  '" />\
  <img src="' + chrome.extension.getURL('img/episteme.jpg') +
  '" class="' + CSS.classes.extension +  '" />\
  <img id="' + CSS.ids.financiacion + '" src="' 
  + chrome.extension.getURL('img/financiacion150.jpg') +
  '" class="' + CSS.classes.extension +  '" />\
  <img  src="' + chrome.extension.getURL('img/globalmetanoia.jpg') +
  '" class="' + CSS.classes.extension +  '" />\
  Proyecto cofinanciado por el Ministerio de Industria, Energía y '
  + 'Turismo, dentro del Plan Nacional de Investigación Científica, '
  + 'Desarrollo e Innovación Tecnológica 2008-2011 (Referencia '
  + 'proyecto: TSI-020302-2011-20) y cofinanciado por el Fondo Europeo '
  + ' de Desarrollo Regional (FEDER). Subprograma Avanza Competitividad '
  + 'I+D+i.\
  </div>\
  <div id="' + CSS.ids.dialogInfo + '" class="' + CSS.classes.extension 
  + '" title="Info" class="' 
  + CSS.classes.extension +  '"></div>'
  document.body.appendChild(dialogs);
}



/* ------------------------------ Functions ----------------------------------*/

function showContainerDialog() {   
  $( "#" + CSS.ids.dialogContainer ).dialog({
    autoOpen: false,
    height: 400,
    width: 400,
    modal: false,
    buttons: {
      Cancel: function() {
        $(this).dialog( "close" );
      },
      "Next": function() {
        addContainerToCurrentResource();
        $(this).dialog( "close" );
        showElementsDialog();
      }
    },
    close: function() {
      removeMoveListener();
      deleteChildsFromElement(CSS.ids.dialogContainer);
    }
  });
  currentResource = new Object();
  $( "#" +  CSS.ids.dialogContainer ).dialog( "open" );
  dialogId = DIALOG_CONTAINER;
  addMoveListener();
}


function showElementsDialog() {   
  $( "#" + CSS.ids.dialogElements ).dialog({
    autoOpen: false,
    height: 800,
    width: 400,
    modal: false,
    buttons: {
      Cancel: function() {
        $(this).dialog( "close" );
      },
      "Create resource": function() {
        addResourceToTheSidebar();
        $(this).dialog( "close" );
      }
    },
    close: function() {
      removeMoveListener();
      deleteChildsFromElement(CSS.ids.dialogElements);
    }
  });
  elementId = 0;
  dialogId = DIALOG_ELEMENTS;
  $( "#" +  CSS.ids.dialogElements ).dialog( "open" );
  addMoveListener();
}

function showAboutDialog() {   
  console.log("showAboutDialog");
    $( "#" + CSS.ids.dialogAbout).dialog({
      autoOpen: true,
      height: 600,
      width: 600,
      modal: true,
    });
}


function addContainerToCurrentResource() {
  var elements = document.getElementById(CSS.ids.dialogContainer).childNodes;
  for(i=0; i<elements.length; i++) {
    currentResource.container = {};
    var nodes = elements[i].childNodes;
    for(j=0; j<nodes.length; j++) {
      var info = nodes[j];
      if (info.className == CSS.classes.elementText) {
        currentResource.container.text = info.innerText;
      } else if (info.className == CSS.classes.elementXPath) {
        currentResource.container.xpath = '/html/' + info.innerText;
      } else if (info.className == CSS.classes.elementType) {
        var index = info.selectedIndex;
        currentResource.container.type = info.options[index].text;
      }
    }
  }
  // console.log(currentResource);
}


function addElementToTheDialog(elementClicked) {
  // Add element to the sidebar
  var div = document.createElement("div");
  div.id = CSS.ids.element + elementId;
  div.className = CSS.classes.element;
  // Text of the clicked element:
  var p = PARAGRAPH_TEXT.cloneNode(true)
  p.innerHTML = elementClicked.innerText; 
  div.appendChild(p);
  var x = PARAGRAPH_XPATH.cloneNode(true)
  x.innerHTML = getElementXPath(elementClicked); 
  div.appendChild(x);
  if (dialogId == DIALOG_ELEMENTS) {
    // Relation selection:
    div.appendChild(SELECT_RELATION.cloneNode(true));
    // Delete button:
    var button = BUTTON_DELETE.cloneNode(true)
    button.id = elementId;
    div.appendChild(button);
    // Append to parent
    document.getElementById(CSS.ids.dialogElements).appendChild(div);
    elementId++;
  } else if (dialogId == DIALOG_CONTAINER) {
    div.appendChild(SELECT_TYPE.cloneNode(true));
    deleteChildsFromElement(CSS.ids.dialogContainer);
    document.getElementById(CSS.ids.dialogContainer).appendChild(div)
  }
}

function removeElementFromTheDialog(buttonClicked) {
  var element = document.getElementById(CSS.ids.element + buttonClicked.id);
  document.getElementById(CSS.ids.dialogElements).removeChild(element);
}

function getElementXPath(elt){
/* var path = "";
 for (; elt && elt.nodeType == 1; elt = elt.parentNode)
 {
  idx = getElementIdx(elt);
  xname = elt.tagName;
  if (idx > 1) xname += "[" + idx + "]";
  path = "/" + xname + path;
}
return path.toLowerCase();*/
return getPathTo(elt).toLowerCase();
}

function getPathTo(element) {
 //   if (element.id!=='')
//        return 'id(\'' +element.id+'\')';
if (element===document.body)
  return element.tagName;

var ix= 0;
var siblings= element.parentNode.childNodes;
for (var i= 0; i<siblings.length; i++) {
  var sibling= siblings[i];
  if (sibling===element)
    return getPathTo(element.parentNode)+'/'+element.tagName+'['+(ix+1)+']';
  if (sibling.nodeType===1 && sibling.tagName===element.tagName)
    ix++;
}
}


function getElementIdx(elt){
  var count = 1;
  for (var sib = elt.previousSibling; sib ; sib = sib.previousSibling) {
    if(sib.nodeType == 1 && sib.tagName == elt.tagName) count++
  }
return count;
}

function addResourceToTheSidebar() {
  var elements = document.getElementById(CSS.ids.dialogElements).childNodes;
  addElementsToCurrentResource(elements);
  //console.log(currentResource);
  resources[resources.length] = currentResource;
  // Add data to the sidebar:
  var container = document.createElement("div");
  container.className = CSS.classes.container;
  for(i=0; i<currentResource.elements.length; i++) {
    var info = currentResource.elements[i];
    if (info.type != undefined && info.text != undefined) {
      // TODO more validation
      var div = document.createElement("div");
      div.className = CSS.classes.element;
      // Text of the clicked element:
      var p = PARAGRAPH_TEXT.cloneNode(true)
      p.innerHTML = 'TYPE: ' + info.type + '.\n\
      TEXT: ' + info.text;
      div.appendChild(p);
      container.appendChild(div);
    } 
  }
  document.getElementById(CSS.ids.sidebarContent).appendChild(container);
  document.getElementById(CSS.ids.submitButton).style.visibility = 'visible';
}

function submitInfo() {
  console.log(resources);
  deleteChildsFromElement(CSS.ids.dialogInfo);
  var p = document.createElement("p");
  p.innerText = "Extractor sent to scrappy: ";
  document.getElementById(CSS.ids.dialogInfo).appendChild(p);
  var a = document.createElement("a");
  a.href = "http://localhost:3434/extractors";
  a.className = CSS.classes.link;
  a.innerText = "Click here to open it";
  document.getElementById(CSS.ids.dialogInfo).appendChild(a);
  chrome.extension.sendRequest(
    { 
      action: "post_extractor", 
      url: window.location.href, 
      data: resources
    }, 
    function(response) {
      console.log(response.message);
      if (response.message == "scrapper_received") {
        $( "#dialog:ui-dialog" ).dialog( "destroy" );
        $( "#" + CSS.ids.dialogInfo).dialog({
          modal: true,
          buttons: {
            Ok: function() {
              $( this ).dialog( "close" );
            }
          }
        });
      }
  }); 
}


function addElementsToCurrentResource(elements) {
  currentResource.elements = new Array();
  for(i=0; i<elements.length; i++) {
  currentResource.elements[i] = {};
    var nodes = elements[i].childNodes;
    for(j=0; j<nodes.length; j++) {
      var info = nodes[j];
      if (info.className == CSS.classes.elementText) {
      currentResource.elements[i].text = info.innerText;
      } else if (info.className == CSS.classes.elementXPath) {
      currentResource.elements[i].xpath = '/html/' + info.innerText;
      } else if (info.className == CSS.classes.elementType) {
        var index = info.selectedIndex;
        currentResource.elements[i].type = info.options[index].text;
      }
    }
  }
  /*for (var l=0; l< currentResource.elements.length; l++) {
    if (currentResource.elements[l].type == undefined) {
      currentResource.elements.splice(l,1);
    }
  } */
  /*var formattedData = {};
    for(i=0; i<data.length; i++) {
        var info = data[i];
        if (info.type == "wrapper") {
            formattedData.wrapper = {};
            formattedData.wrapper.xpath = info.xpath;
        } else if (info.type == "title") {
            formattedData.title = {};
            formattedData.title.xpath = info.xpath;
        } else if (info.type == "description") {
            formattedData.description = {};
            formattedData.description.xpath = info.xpath;
        } else if (info.type == "body") {
            formattedData.body = {};
            formattedData.body.xpath = info.xpath;
        }
    }*/
}

function addMoveListener() {
    document.addEventListener('mousemove', mouseMoveListener, false);
}

function removeMoveListener() {
    document.removeEventListener('mousemove', mouseMoveListener, false);
    if (previousDOM != null) {
      previousDOM.classList.remove(CSS.classes.mouse_visited);
    }
    previousDOM == null;
}

function deleteChildsFromElement(parentId) {
  var cell = document.getElementById(parentId);
    if ( cell.hasChildNodes() ) {
      while ( cell.childNodes.length >= 1 ) {
        cell.removeChild( cell.firstChild );       
      } 
    }
}

