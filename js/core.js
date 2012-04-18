// Unique ID for the className.
var MOUSE_VISITED_CLASSNAME = 'crx_mouse_visited';
// Previous dom, that we want to track, so we can remove the previous styling.
var prevDOM = null;
// Identifier for each element
var number = 1;
var sidebarOpen = false;
// Sidebar elements initialization
var PARAGRAPH_TEXT = initParagraphText();
var SELECT_TYPE = initSelectType();
var BUTTON_DELETE = initButtonDelete();

/* ----------------- Request Handling ------------------*/

/* Handle requests from core.js */
function handleRequest(
  //The object data with the request params
  request, 
  //These last two ones isn't important for this example, if you want know more about it visit: http://code.google.com/chrome/extensions/messaging.html
  sender, sendResponse
  ) {
  if (request.callFunction == "toggleSidebar")
    toggleSidebar();
}
chrome.extension.onRequest.addListener(handleRequest);

/* ------------------ Initialization -------------------*/

function initParagraphText() {
    var p = document.createElement("p"); 
    p.className = "sidebar text";
    return p;
}

function initSelectType() {
  var select= document.createElement("select");
  select.className = "sidebar type";
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
  button.className = "sidebar delete";
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
    sidebar.className = "sidebar";
    sidebar.innerHTML = "\
      <h1 class='sidebar'>Scrappy extension</h1>\
      <div id='" + CSS.ids.sidebarContent + "' class='sidebar'></div>\
      <button id='submitButtonScrappy' class='sidebar'>Submit</button>\
    ";
    document.body.appendChild(sidebar);
    document.body.style.padding = "0px 0px 0px 300px !important";
    sidebarOpen = true;
  }
}

toggleSidebar();
/* ------------------- Listeners --------------------*/

// Mouse listener for any move event on the current document.
document.addEventListener('mousemove', function (e) {
  var srcElement = e.srcElement;
  // Lets check if our underlying element is not part of the sidebar
  if (srcElement.className.indexOf("sidebar") == -1) {
    // For NPE checking, we check safely. We need to remove the class name
    // Since we will be styling the new one after.
    if (prevDOM != null) {
      prevDOM.classList.remove(MOUSE_VISITED_CLASSNAME);
    }
    // Add a visited class name to the element. So we can style it.
    srcElement.classList.add(MOUSE_VISITED_CLASSNAME);
    // The current element is now the previous. So we can remove the class
    // during the next iteration.
    prevDOM = srcElement;
  }
}, false);
// Click listener for any move event on the current document.
document.addEventListener('click', function (e) {
  var srcElement = e.srcElement;
  if (srcElement.className.indexOf("sidebar") == -1) {
    // The element clicked doesn't belong to the sidebar
    addElement(srcElement);
  } else {
    // Sidebar element clicked
    if (srcElement.className.indexOf("delete") != -1) {
      removeElement(srcElement);
    } else if (srcElement.id == "submitButtonScrappy") {
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
    div.id = "element" + number;
    div.className = "sidebar element";
    // Text of the clicked element:
    var p = PARAGRAPH_TEXT.cloneNode(true)
    p.innerHTML = elementClicked.innerText; 
    div.appendChild(p);
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
    var element = document.getElementById("element" + deleteButtonClicked.id);
    document.getElementById(CSS.ids.sidebarContent).removeChild(element);
}

function submitInfo() {
    var htmlNodes = document.getElementById(CSS.ids.sidebarContent).childNodes;
    console.log(infoToJson(htmlNodes));
}

function infoToJson(nodes) {
  var json = "[{";
  for(i=0; i<nodes.length; i++) {
    json += "'element': {";
    var infos = nodes[i].childNodes;
    for(j=0; j<infos.length; j++) {
      var info = infos[j];
      if (info.className.indexOf("text") != -1) {
        json += "'text': '" + info.innerText + "',";
      } else if (info.className.indexOf("type") != -1) {
        var index = info.selectedIndex;
        json += "'type': '" + info.options[index].text + "'";
      }
    }
    json+= "},";
  }
  json += "}]";
  return json;
}

