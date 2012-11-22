window.onload=function(){
	document.addEventListener('click', mouseClickListener, false);
};

mouseClickListener = function (e) {
	var srcElement = e.srcElement;
	if (srcElement.className == CSS.classes.elementDelete) {
		//removeElementFromTheDialog(srcElement);
	} else if (srcElement.id == CSS.ids.aboutLink) {
		chrome.extension.sendMessage({task: "about"});
	} else if (srcElement.id == CSS.ids.addNamespace) {
		chrome.extension.sendMessage({task: "addNamespace"});
	} else if (srcElement.id == CSS.ids.addResource) {
		chrome.extension.sendMessage({task: "addResource"});
	} else if (srcElement.id == CSS.ids.submitButton) {
		chrome.extension.sendMessage({task: "submit"});;
	}
}

chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.callFunction == "updateNamespacesSidebar") {
      updateNamespaces(request.data);
    } 
  }
);


function updateNamespaces(namespaces) {
  var div = document.getElementById(CSS.ids.sidebarNamespaces);
  if (div.hasChildNodes() ) {
    while ( div.childNodes.length >= 1 ) {
        div.removeChild(div.firstChild );       
    } 
  }
  for (var j = 0; j < namespaces.length; j++) {
    var p = document.createElement("p");
    p.innerText = namespaces[j].prefix + " = " + namespaces[j].uri;
    var img = document.createElement("img");
    img.src = "../img/delete.png";
    p.appendChild(img);
    div.appendChild(p);
  }
}

