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
const BUTTON_DELETE = initButtonDelete();
const ORIGINAL_BODY_MARGIN = document.body.style.margin;

// If extension is enabled
var sidebarOpen = false;
// Previous dom, that we want to track, so we can remove the previous styling.
var prevDOM = null;
// Identifier for each element of the sidebar
var number = 1;

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
  if (srcElement.className.indexOf(CSS.classes.sidebar) == -1 && srcElement.className.indexOf("ui") == -1) {
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
  if (srcElement.className.indexOf(CSS.classes.sidebar) == -1) {
    // The element clicked doesn't belong to the sidebar
    addElement(srcElement);
  } else {
    // Sidebar element clicked
    if (srcElement.className == CSS.classes.elementDelete) {
      removeElement(srcElement);
    } else if (srcElement.id == CSS.ids.submitButton) {
      submitInfo();
    } else if (srcElement.id == CSS.ids.addButton) {
      showAddElementDialog();
    }
  }
// Stop propagation of links to avoid navigating to another page
e.preventDefault();
e.stopPropagation();
}

    /* ------------------------------------------------*/



function showAddElementDialog() {   
    $( "#dialog-form" ).dialog({
      autoOpen: false,
      height: 600,
      width: 800,
      modal: false,
      buttons: {
        "Create container": function() {
          /*var bValid = true;
          allFields.removeClass( "ui-state-error" );

          bValid = bValid && checkLength( name, "username", 3, 16 );
          bValid = bValid && checkLength( email, "email", 6, 80 );
          bValid = bValid && checkLength( password, "password", 5, 16 );

          bValid = bValid && checkRegexp( name, /^[a-z]([0-9a-z_])+$/i, "Username may consist of a-z, 0-9, underscores, begin with a letter." );
          // From jquery.validate.js (by joern), contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
          bValid = bValid && checkRegexp( email, /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i, "eg. ui@jquery.com" );
          bValid = bValid && checkRegexp( password, /^([0-9a-zA-Z])+$/, "Password field only allow : a-z 0-9" );

          if ( bValid ) {
            $( "#users tbody" ).append( "<tr>" +
              "<td>" + name.val() + "</td>" + 
              "<td>" + email.val() + "</td>" + 
              "<td>" + password.val() + "</td>" +
            "</tr>" ); 
            $( this ).dialog( "close" );
          }*/
        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      },
      close: function() {
        removeMoveListener();
      }
    });
  $( "#dialog-form" ).dialog( "open" );
  addMoveListener();
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
  var select= document.createElement("select");
  select.className = CSS.classes.elementType;
  var option = document.createElement("option");
  option.text = "wrapper";
  option.value = "1";
  select.add(option);
  option = document.createElement("option");
  option.text = "title";
  option.value = "2";
  select.add(option);
  option = document.createElement("option");
  option.text = "description";
  option.value = "3";
  select.add(option);
  option = document.createElement("option");
  option.text = "body";
  option.value = "4";
  select.add(option);
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
        + CSS.classes.sidebar +  '">New element</button>\
        <p id="' + CSS.ids.sponsoredBy + '" class="' 
        + CSS.classes.sidebar +  '">Sponsored by:</p>\
        <img id="' + CSS.ids.sponsoredLogo + '" src="' 
        + chrome.extension.getURL("img/globalmetanoia.jpg") + '" class="' 
        + CSS.classes.sidebar +  '" />\
      </div>\
      <div class="hide">\
        <div id="dialog-form" title="Creating new container - Click elements on the webpage to add them to the container" class="' 
        + CSS.classes.sidebar +  '">\
          <div id="' + CSS.ids.dialogContent + '" class="' 
          + CSS.classes.sidebar +  '">\
          </div>\
        </div>\
      </div>';
    document.body.appendChild(sidebar);
    document.body.style.margin = '0 0 0 300px';
    document.addEventListener('click', mouseClickListener, false);
    sidebarOpen = true;
  }
}

// <button id='" + CSS.ids.submitButton + "'  class='" + CSS.classes.sidebar +  "'>Submit</button>\
//    $(".ui-icon").css("background-image", chrome.extension.getURL("css/smoothness/images/ui-icons_222222_256x240.png"));


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
    // Delete button:
    var button = BUTTON_DELETE.cloneNode(true)
    button.id = number;
    div.appendChild(button);
    // Type selection:
    div.appendChild(SELECT_TYPE.cloneNode(true));
    // Append the element to the list of elements:
    document.getElementById(CSS.ids.dialogContent).appendChild(div);
    number++;
}


function removeElement(deleteButtonClicked) {
    var element = document.getElementById(CSS.ids.element + deleteButtonClicked.id);
    document.getElementById(CSS.ids.dialogContent).removeChild(element);
}

function submitInfo() {
    var elements = document.getElementById(CSS.ids.sidebarContent).childNodes;
    chrome.extension.sendRequest({action:"post_extractor", url:window.location.hostname, dataArray: packInfo(elements)}, function(response) {
      console.log(response.message);
    });
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
  var formattedData = {};
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
  return formattedData;
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