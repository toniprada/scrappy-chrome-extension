window.onload=function(){
	document.addEventListener('click', mouseClickListener, false);
};

mouseClickListener = function (e) {
	var srcElement = e.srcElement;
	if (srcElement.className == CSS.classes.elementDelete) {
		//removeElementFromTheDialog(srcElement);
	} else if (srcElement.id == CSS.ids.submitButton) {
		//submitInfo();
	} else if (srcElement.id == CSS.ids.addButton) {
		//showContainerDialog();
	} else if (srcElement.id == CSS.ids.aboutLink) {
		showAboutDialog();
	} 
}

function showAboutDialog() {
	chrome.extension.sendMessage({task: "about"});
}
