// Unique ID for the className.
var MOUSE_VISITED_CLASSNAME = 'crx_mouse_visited';
// Previous dom, that we want to track, so we can remove the previous styling.
var prevDOM = null;
// identifier for each element
var number = 1;
// select 
var select= document.createElement("select");
select.className = "sidebar";
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
    // Add element to the sidebar
    var div = document.createElement("div");
    div.id = "element" + number;
    div.className = "sidebar element";
    var p = document.createElement("p"); 
    p.className = "sidebar";
    p.innerHTML = srcElement.innerText; 
    div.appendChild(p);
    var button = document.createElement("button");
    button.className = "sidebar delete";
    button.id = number;
    button.innerText = "Delete";
    div.appendChild(button);
    div.appendChild(select.cloneNode(true));
    document.getElementById("sidebarContent").appendChild(div);
    number++;
    // Stop propagation of links to avoid navigating to another page
  } else if (srcElement.className == "sidebar delete") {
    var element = document.getElementById("element" + srcElement.id);
    document.getElementById("sidebarContent").removeChild(element);
  }
e.preventDefault();
e.stopPropagation();
}, false);
