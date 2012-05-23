/*
Copyright 2012 UPM-GSI: Group of Intelligent Systems -
- Universidad Politécnica de Madrid (UPM)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

@author Antonio Prada <toniprada@gmail.com>
*/

const PARAGRAPH_TEXT = initParagraphText();
const PARAGRAPH_XPATH = initParagraphXPath();
const SELECT_TYPE = initSelectType();
const SELECT_RELATION = initSelectRelation();
const BUTTON_DELETE = initButtonDelete();
const ORIGINAL_BODY_MARGIN = document.body.style.margin;

const DIALOG_CONTAINER = 1;
const DIALOG_ELEMENTS = 2;


// what dialog is opened
var dialogId = DIALOG_CONTAINER;
// If extension is enabled
var sidebarOpen = false;
// Previous dom, that we want to track, so we can remove the previous styling.
var prevDOM = null;
// Identifier for each element of the sidebar
var number = 1;

var containers = new Array();

/* ----------------- Request Handling ------------------*/

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if (request.callFunction === "consoleLog") {
            console.log(request.value);
        } else if (request.callFunction === "toggleExtension") {
          toggleExtension();
        }
    }
);

/* ------------------ Initialization -------------------*/

mouseMoveListener = function (e) {
  var srcElement = e.srcElement;
  // Lets check if our underlying element is not part of the sidebar
  if (srcElement.className.indexOf(CSS.classes.sidebar) == -1 
    && srcElement.className.indexOf("ui") == -1) {
    // For NPE checking, we check safely. We need to remove the class name
    // Since we will be styling the new one after.
    if (prevDOM != null) {
      prevDOM.classList.remove(CSS.classes.mouse_visited);
    }
    // Add a visited class name to the element. So we can style it.
    srcElement.classList.add(CSS.classes.mouse_visited);
    // The current element is now the previous. So we can remove the class
    // during the next iteration.
    prevDOM = srcElement;
  }
}

mouseClickListener = function (e) {
  var srcElement = e.srcElement;
  if (srcElement.className.indexOf(CSS.classes.sidebar) == -1
    && srcElement.className.indexOf("ui") == -1) {
    // The element clicked doesn't belong to the sidebar
    addElement(srcElement);
    // Stop propagation of links to avoid navigating to another page
    e.preventDefault();
    e.stopPropagation();
  } else {
    // Sidebar element clicked
    if (srcElement.className == CSS.classes.elementDelete) {
      removeElement(srcElement);
    } else if (srcElement.id == CSS.ids.submitButton) {
      submitInfo();
    } else if (srcElement.id == CSS.ids.addButton) {
      showContainerDialog();
    } else if (srcElement.id == CSS.ids.aboutLink) {
      showAboutDialog();
    } else if (srcElement.class = CSS.classes.link) {
    } else {
      // Stop propagation of links to avoid navigating to another page
      e.preventDefault();
      e.stopPropagation();
    }
  }
}

    /* ---------------  DIALOGS --------------------*/

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
        $(this).dialog( "close" );
        deleteChilds(CSS.ids.dialogContainer);
        showElementsDialog();
      }
    },
    close: function() {
      removeMoveListener();
    }
  });
  dialogId = DIALOG_CONTAINER;
  $( "#" +  CSS.ids.dialogContainer ).dialog( "open" );
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
      "Create container": function() {
        submitContainer();
        $(this).dialog( "close" );
        deleteChilds(CSS.ids.dialogElements);
      }
    },
    close: function() {
      removeMoveListener();
    }
  });
  number = 0;
  dialogId = DIALOG_ELEMENTS;
  $( "#" +  CSS.ids.dialogElements ).dialog( "open" );
  addMoveListener();
}

function showAboutDialog() {   
    $( "#" + CSS.ids.dialogAbout).dialog({
      autoOpen: true,
      height: 700,
      width: 400,
      modal: true,
    });
}


    /* ------------------------------------------------*/

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

/* ------------------- Functions --------------------*/

function toggleExtension() {
  if(sidebarOpen) {
    var el = document.getElementById(CSS.ids.sidebar);
    el.parentNode.removeChild(el);
    el = document.getElementById(CSS.ids.dialogs);
    el.parentNode.removeChild(el);
    document.body.style.margin = ORIGINAL_BODY_MARGIN;
    document.removeEventListener('click', mouseClickListener, false);
    sidebarOpen = false;
  } else {
    var sidebar = document.createElement('div');
    sidebar.id = CSS.ids.sidebar;
    sidebar.className = CSS.classes.sidebar;
    sidebar.innerHTML = '\
      <img src="' + chrome.extension.getURL('img/logo_scrappy.png') 
      + '" id="' + CSS.ids.scrappyLogo 
      + '" class="' + CSS.classes.sidebar +  '" />\
      <img src="' + chrome.extension.getURL('img/logo_gsi.png') 
      + '" id="' + CSS.ids.gsiLogo 
      + '" class="' + CSS.classes.sidebar +  '" />\
      <div class="' + CSS.classes.clearBoth 
      + ' ' + CSS.classes.sidebar +  '" />\
      <div id="' + CSS.ids.sidebarContent 
      + '" class="' + CSS.classes.sidebar +  '"></div>\
        <button id="' + CSS.ids.addButton + '"  class="' 
        + CSS.classes.sidebar +  '">New resource</button>\
        <button id="' + CSS.ids.submitButton + '"  class="' 
        + CSS.classes.sidebar +  '">Send to Scrappy</button>\
        <p id="' + CSS.ids.sponsoredBy + '" class="' 
        + CSS.classes.sidebar +  '">Sponsored by:</p>\
        <img id="' + CSS.ids.sponsoredLogo + '" src="' 
        + chrome.extension.getURL("img/globalmetanoia.jpg") + '" class="' 
        + CSS.classes.sidebar +  '" />\
        <a id="' + CSS.ids.aboutLink + '" href="#" class="' 
        + CSS.classes.sidebar +  '" >About</a>\
      </div>\
      </div>';
    document.body.appendChild(sidebar);
    document.body.style.margin = '0 0 0 300px';
    document.getElementById(CSS.ids.submitButton).style.visibility = 'hidden';
    var dialogs = document.createElement('div');
    dialogs.className = "hide";
    dialogs.id = CSS.ids.dialogs;
    dialogs.innerHTML =  '\
        <div id="' + CSS.ids.dialogElements + '" class="' + CSS.classes.sidebar 
        + '" title="Select the data elements contained on the previously selected parent" class="' 
        + CSS.classes.sidebar +  '">\
        </div>\
        <div id="' + CSS.ids.dialogContainer + '" class="' + CSS.classes.sidebar 
        + '" title="Select the data parent" class="' 
        + CSS.classes.sidebar +  '">\
        </div>\
        <div id="' + CSS.ids.dialogAbout + '" class="' + CSS.classes.sidebar + '" title="About" class="' 
        + CSS.classes.sidebar +  '">\
          <p class="' + CSS.classes.sidebar +  '">\
          <img src="' + chrome.extension.getURL('img/logo_gsi.png') +
          '" class="' + CSS.classes.sidebar +  '" />\
          <img src="' + chrome.extension.getURL('img/episteme.jpg') +
          '" class="' + CSS.classes.sidebar +  '" />\
          <img id="' + CSS.ids.financiacion + '" src="' 
          + chrome.extension.getURL('img/financiacion150.jpg') +
          '" class="' + CSS.classes.sidebar +  '" />\
          Proyecto cofinanciado por el Ministerio de Industria, Energía y '
          + 'Turismo, dentro del Plan Nacional de Investigación Científica, '
          + 'Desarrollo e Innovación Tecnológica 2008-2011 (Referencia '
          + 'proyecto: TSI-020302-2011-20) y cofinanciado por el Fondo Europeo '
          + ' de Desarrollo Regional (FEDER). Subprograma Avanza Competitividad '
          + 'I+D+i.\
          </div>\
          <div id="' + CSS.ids.dialogInfo + '" class="' + CSS.classes.sidebar 
          + '" title="Info" class="' 
          + CSS.classes.sidebar +  '"></div>\
          '
    document.body.appendChild(dialogs);
    document.addEventListener('click', mouseClickListener, false);
    sidebarOpen = true;
  }
}

// <button id='" + CSS.ids.submitButton + "'  class='" + 
// CSS.classes.sidebar +  "'>Submit</button>\
 

function getElementXPath(elt){
 var path = "";
 for (; elt && elt.nodeType == 1; elt = elt.parentNode)
 {
  idx = getElementIdx(elt);
  xname = elt.tagName;
  if (idx > 1) xname += "[" + idx + "]";
  path = "/" + xname + path;
}
return path.toLowerCase();
}

function getElementIdx(elt){
  var count = 1;
  for (var sib = elt.previousSibling; sib ; sib = sib.previousSibling) {
    if(sib.nodeType == 1 && sib.tagName == elt.tagName) count++
  }
return count;
}

function addElement(elementClicked) {
  // Add element to the sidebar
  var div = document.createElement("div");
  div.id = CSS.ids.element + number;
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
    button.id = number;
    div.appendChild(button);
    // Append to parent
    document.getElementById(CSS.ids.dialogElements).appendChild(div);
    number++;
  } else if (dialogId == DIALOG_CONTAINER) {
    div.appendChild(SELECT_TYPE.cloneNode(true));
    deleteChilds(CSS.ids.dialogContainer);
    document.getElementById(CSS.ids.dialogContainer).appendChild(div)
  }
}

function removeElement(deleteButtonClicked) {
  var element = document.getElementById(CSS.ids.element + deleteButtonClicked.id);
  document.getElementById(CSS.ids.dialogElements).removeChild(element);
}

function submitContainer() {
  var elements = document.getElementById(CSS.ids.dialogElements).childNodes;
  var data = packInfo(elements);
  // console.log(data);
  addContainer(data);
}

function addContainer(data) {
  containers[containers.length] = data;
  var container = document.createElement("div");
  container.className = CSS.classes.container;
  for(i=0; i<data.length; i++) {
    var info = data[i];
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
  deleteChilds(CSS.ids.dialogInfo);
  var p = document.createElement("p");
  p.innerText = "Extractor sent to scrappy: ";
  document.getElementById(CSS.ids.dialogInfo).appendChild(p);
  var a = document.createElement("a");
  a.href = "http://localhost:3434/extractors";
  a.className = CSS.classes.link;
  a.innerText = "Click here";
  document.getElementById(CSS.ids.dialogInfo).appendChild(a);

   chrome.extension.sendRequest({
    action:"post_extractor", 
    url:window.location.href, data: containers}, 
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
    }
  ); 
}





function packInfo(elements) {
  var data = new Array();
  for(i=0; i<elements.length; i++) {
    data[i] = {};
    var nodes = elements[i].childNodes;
    for(j=0; j<nodes.length; j++) {
      var info = nodes[j];
      if (info.className == CSS.classes.elementText) {
        data[i].text = info.innerText;
      } else if (info.className == CSS.classes.elementXPath) {
        data[i].xpath = info.innerText;
      } else if (info.className == CSS.classes.elementType) {
        var index = info.selectedIndex;
        data[i].type = info.options[index].text;
      }
    }
  }
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
    }
  return formattedData;*/
  return data;
}

function addMoveListener() {
    document.addEventListener('mousemove', mouseMoveListener, false);
}

function removeMoveListener() {
    document.removeEventListener('mousemove', mouseMoveListener, false);
    if (prevDOM != null) {
      prevDOM.classList.remove(CSS.classes.mouse_visited);
    }
    prevDOM == null;
}

function deleteChilds(parentId) {
  var cell = document.getElementById(parentId);
    if ( cell.hasChildNodes() ) {
      while ( cell.childNodes.length >= 1 ) {
        cell.removeChild( cell.firstChild );       
      } 
    }
}