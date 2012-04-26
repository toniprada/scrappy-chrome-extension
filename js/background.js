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

Thanks to:
- Mohamed Mansour for:
http://stackoverflow.com/questions/4445102/google-chrome-extension-highlight-the-div-that-the-mouse-is-hovering-over 
- cvsguimaraes for:
http://stackoverflow.com/questions/7391320/chrome-extension-using-sidebar
*/

var tabid = null;

chrome.browserAction.onClicked.addListener(function(tab) {
    tabid = tab.id;
	chrome.tabs.insertCSS(tab.id, {file:"css/core.css"});  
	chrome.tabs.insertCSS(tab.id, {file:"css/sidebar.css"});  
	chrome.tabs.executeScript(tab.id, {file:"js/core.js"});
	//chrome.tabs.sendRequest(tab.id, {callFunction: "toggleSidebar"});
});

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    clog(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
    if (request.greeting == "post_extractor") {
      	sendResponse({farewell:"received post extractor request"});
  		postExtractor();
    }
  });

function postExtractor() {
    var req = new XMLHttpRequest();
    try {
        req.open("POST", "http://localhost:3434/extractors", true);
        var params = 'rdf=sioc: http://rdfs.org/sioc/ns#\n';
        params += 'sc: http://lab.gsi.dit.upm.es/scraping.rdf#\n';
        params += 'loc: http://www.daml.org/experiment/ontology/location-ont#\n';
        params += '\n';    
        params += '_:elpaisindice:\n';
        params += '  rdf:type: sc:Fragment\n';
        params += '  sc:selector:\n';
        params += '    *:\n';
        params += '      rdf:type: sc:UriSelector\n';
        params += '      rdf:value: "http://elpais.com/"\n';
        params += '  sc:identifier:\n';
        params += '    *:\n';
        params += '      rdf:type: sc:BaseUriSelector\n';
        params += '  sc:subfragment:\n';
        params += '    *:\n';
        params += '      sc:type: sioc:Post\n';
        params += '      sc:selector:\n';
        params += '        *:\n';
        params += '          rdf:type: sc:XPathSelector\n';
        params += '          rdf:value: "/html/body/div[4]/div[4]/div[3]/div[2]/div/div/h2/a"';

        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        //req.setRequestHeader("Content-length", params.length);
        //req.setRequestHeader("Connection", "close");
        req.send(params)

        req.onreadystatechange = function() 
        { 
            clog("readystate:" + req.readyState + " status:" + req.status);
            if (req.readyState == 4) {
                if (req.status == 200) {
                  clog("Extractor sent to scrappy");
                  return true;
              }
          } 
      };
    }
    catch (err) {
        clog("Exception: " + err.name + " - " + err.message);
        return false;
    } 
}

function clog(val) {
    var message = JSON.stringify(val).replace(/\n/g, " ");
    chrome.tabs.sendRequest(tabid, {type: "consoleLog", value: message}); 
}