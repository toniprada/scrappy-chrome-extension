/*Handle requests from background.html*/
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

/*Small function wich create a sidebar(just to illustrate my point)*/
var sidebarOpen = false;
function toggleSidebar() {
	if(sidebarOpen) {
		var el = document.getElementById('mySidebar');
		el.parentNode.removeChild(el);
		sidebarOpen = false;
	}
	else {
		var sidebar = document.createElement('div');
		sidebar.id = "mySidebar";
		sidebar.className = "sidebar";
		sidebar.innerHTML = "\
			<h1 class='sidebar'>Scrappy extension</h1>\
			<div id='sidebarContent' class='sidebar'></div>\
			<button id='submit' class='sidebar'>Submit</button>\
		";
		document.body.appendChild(sidebar);
		document.body.style.padding = "0px 0px 0px 300px !important";
		sidebarOpen = true;
	}
}
