window.onload=function(){
	document.addEventListener('click', mouseClickListener, false);
};

mouseClickListener = function (e) {
	var srcElement = e.srcElement;
	if (srcElement.className == CSS.classes.elementDelete) {
		//removeElementFromTheDialog(srcElement);
	} else if (srcElement.id == CSS.ids.aboutLink) {
		chrome.extension.sendMessage({task: "about"});
	} else if (srcElement.id == CSS.ids.addResource) {
		chrome.extension.sendMessage({task: "addNamespace"});
	} else if (srcElement.id == CSS.ids.addNamespace) {
		chrome.extension.sendMessage({task: "addResource"});
	} else if (srcElement.id == CSS.ids.submitButton) {
		chrome.extension.sendMessage({task: "submit"});;
	}
}