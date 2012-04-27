// Previous dom, that we want to track, so we can remove the previous styling.
var prevDOM = null;
// Identifier for each element
var number = 1;
var sidebarOpen = false;
// Sidebar elements initialization
var PARAGRAPH_TEXT = initParagraphText();
var PARAGRAPH_XPATH = initParagraphXPath();
var SELECT_TYPE = initSelectType();
var BUTTON_DELETE = initButtonDelete();

/* ----------------- Request Handling ------------------*/

/* Handle requests from core.js
function handleRequest(
  //The object data with the request params
  request, 
  //These last two ones isn't important for this example, if you want know more about it visit: http://code.google.com/chrome/extensions/messaging.html
  sender, sendResponse
  ) {
  if (request.callFunction == "toggleSidebar")
    toggleSidebar();
}
chrome.extension.onRequest.addListener(handleRequest); */
chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        if (request.type ==="consoleLog") {
            console.log(request.value);
        }
        // ...
    }
);
/* ------------------ Initialization -------------------*/

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
  option.text = "title";
  option.value = "1";
  select.add(option);
  option = document.createElement("option");
  option.text = "description";
  option.value = "2";
  select.add(option);
  option = document.createElement("option");
  option.text = "body";
  option.value = "3";
  select.add(option);
  return select;
}

function initButtonDelete() {
  var button = document.createElement("button");
  button.className =  CSS.classes.elementDelete;
  button.innerText = "Delete";
  return button;
}

function toggleSidebar() {
  if(sidebarOpen) {
    var el = document.getElementById(CSS.ids.sidebar);
    el.parentNode.removeChild(el);
    sidebarOpen = false;
  }
  else {
    var sidebar = document.createElement('div');
    sidebar.id = CSS.ids.sidebar;
    sidebar.className = CSS.classes.sidebar;
    sidebar.innerHTML = "\
      <img src='" + chrome.extension.getURL("img/logo_scrappy.png") + "' id='" + CSS.ids.scrappyLogo + "' class='" + CSS.classes.sidebar +  "' />\
      <img src='" + chrome.extension.getURL("img/logo_gsi.png") + "' id='" + CSS.ids.gsiLogo + "' class='" + CSS.classes.sidebar +  "' />\
      <div class='" + CSS.classes.clearBoth + " " + CSS.classes.sidebar +  "' />\
      <div id='" + CSS.ids.sidebarContent + "'  class='" + CSS.classes.sidebar +  "'></div>\
      <button id='" + CSS.ids.submitButton + "'  class='" + CSS.classes.sidebar +  "'>Submit</button>\
      <p id='" + CSS.ids.sponsoredBy + "' class='" + CSS.classes.sidebar +  "'>Sponsored by:</p>\
      <img id='" + CSS.ids.sponsoredLogo + "' src='" + chrome.extension.getURL("img/globalmetanoia.jpg") + "' class='" + CSS.classes.sidebar +  "' />\
    ";
    document.body.appendChild(sidebar);
    document.body.style.margin = '0 0 0 300px';
    sidebarOpen = true;
  }
}

toggleSidebar();
/* ------------------- Listeners --------------------*/

// Mouse listener for any move event on the current document.
document.addEventListener('mousemove', function (e) {
  var srcElement = e.srcElement;
  // Lets check if our underlying element is not part of the sidebar
  if (srcElement.className.indexOf(CSS.classes.sidebar) == -1) {
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
}, false);
// Click listener for any move event on the current document.
document.addEventListener('click', function (e) {
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
    }
  }
// Stop propagation of links to avoid navigating to another page
e.preventDefault();
e.stopPropagation();
}, false);


/* ------------------- Functions --------------------*/

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
    document.getElementById(CSS.ids.sidebarContent).appendChild(div);
    number++;
}


function removeElement(deleteButtonClicked) {
    var element = document.getElementById(CSS.ids.element + deleteButtonClicked.id);
    document.getElementById(CSS.ids.sidebarContent).removeChild(element);
}

function submitInfo() {
    var htmlNodes = document.getElementById(CSS.ids.sidebarContent).childNodes;
    console.log(infoToJson(htmlNodes));
    console.log(infoToExtractor(htmlNodes));
    chrome.extension.sendRequest({greeting: "post_extractor"}, function(response) {
      console.log(response.farewell);
    });
}

function infoToJson(nodes) {
  var json = "[{";
  for(i=0; i<nodes.length; i++) {
    json += "'element': {";
    var infos = nodes[i].childNodes;
    for(j=0; j<infos.length; j++) {
      var info = infos[j];
      if (info.className == CSS.classes.elementText) {
        json += "'text': '" + info.innerText + "',";
      } else if (info.className == CSS.classes.elementType) {
        var index = info.selectedIndex;
        json += "'type': '" + info.options[index].text + "'";
      }
    }
    json+= "},";
  }
  json += "}]";
  return json;
}

function infoToExtractor(nodes) {
  var title = "";
  for(i=0; i<nodes.length; i++) {
    var infos = nodes[i].childNodes;
    for(j=0; j<infos.length; j++) {
      var info = infos[j];
      if (info.className == CSS.classes.elementXPath) {
        title = info.innerText;
      }
    }
  }
  var s = 'dc: http://purl.org/dc/elements/1.1/\n';
  s += 'rdf: http://www.w3.org/1999/02/22-rdf-syntax-ns#\n';
  s += 'sioc: http://rdfs.org/sioc/ns#\n';
  s += 'sc: http://lab.gsi.dit.upm.es/scraping.rdf#\n';
  s += '*:\n';
  s += '  rdf:type: sc:Fragment\n';
  s += '  sc:selector:\n';
  s += '  *:\n';
  s += '    rdf:type: sc:UriSelector\n';
  s += '    rdf:value: "http://www.marca.com/"\n';
  s += '    *:\n';
  s += '      rdf:type: sc:BaseUriSelector\n';
  s += '  sc:subfragment:\n';
  s += '    *:\n';
  s += '      sc:type:     rdf:Literal\n';
  s += '      sc:relation: dc:title\n';
  s += '      sc:selector:\n';
  s += '        *:\n';
  s += '        rdf:type:  sc:XPathSelector:\n';
  s += '        rdf:value: "' + title + '"\n';
  return s;
}

function getElementXPath(elt){
 var path = "";
 for (; elt && elt.nodeType == 1; elt = elt.parentNode)
 {
  idx = getElementIdx(elt);
  xname = elt.tagName;
  if (idx > 1) xname += "[" + idx + "]";
  path = "/" + xname + path;
}
return path; 
}

function getElementIdx(elt){
  var count = 1;
  for (var sib = elt.previousSibling; sib ; sib = sib.previousSibling) {
    if(sib.nodeType == 1 && sib.tagName == elt.tagName) count++
  }
return count;
}

