/*
Copyright 2012 UPM-GSI: Group of Intelligent Systems - Universidad Politécnica 
de Madrid (UPM)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use 
this file except in compliance with the License. You may obtain a copy of the 
License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by 
applicable law or agreed to in writing, software distributed 
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR 
CONDITIONS OF ANY KIND, either express or implied. See the License for the 
specific language governing permissions and limitations under the License.

@author Antonio Prada <toniprada@gmail.com>

*/
var tabid = null;

/* ----------------- Request Handling ------------------*/

chrome.browserAction.onClicked.addListener(function(tab) {
  tabid = tab.id;
  chrome.tabs.sendRequest(tab.id, {callFunction: "toggleExtension"});
});

chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    clog(sender.tab ? "from a content script:" 
        + sender.tab.url: "from the extension");
    if (request.action == "post_extractor") {
       postExtractor(request.url, request.data, sendResponse);
    }
  }
);

/* ------------------ Initialization -------------------*/



/* ------------------- Functions --------------------*/


function postExtractor(url, data, sendResponse) {
  var req = new XMLHttpRequest();
  try {
      req.open("POST", "http://localhost:3434/extractors", true);
      req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      req.send('rdf=' + buildExtractor(url, data));

      req.onreadystatechange = function() 
      { 
          clog("readystate:" + req.readyState + " status:" + req.status);
          if (req.readyState == 4) {
              if (req.status == 200) {
                sendResponse({message:"scrapper_received"});
              }
          } 
      };
  }
  catch (err) {
      clog("Exception: " + err.name + " - " + err.message);
  }  
}

function buildExtractor(url, data) {
  var s = 'rdf=sioc: http://rdfs.org/sioc/ns#\n';
  s += 'sc: http://lab.gsi.dit.upm.es/scraping.rdf#\n';
  s += 'loc: http://www.daml.org/experiment/ontology/location-ont#\n';
  s += '\n';    
  for (var i = 0; i < data.length; i++) {
    s += '*:\n';
    s += '  rdf:type: sc:Fragment\n';
    s += '  sc:selector:\n';
    s += '    *:\n';
    s += '      rdf:type: sc:UriSelector\n';
    s += '      rdf:value: "' + url + '"\n';
    s += '  sc:identifier:\n';
    s += '    *:\n';
    s += '      rdf:type: sc:BaseUriSelector\n';
    s += '  sc:subfragment:\n';
    s += '    *:\n';
    s += '      sc:type: ' + data[i].container.type + '\n';
    s += '      sc:selector:\n';
    s += '        *:\n';
    s += '          rdf:type: sc:XPathSelector\n';
    s += '          rdf:value: "' + data[i].container.xpath + '"\n';
    for (var j = 0; j < data[i].elements.length; j++) {
//    s += '      sc:identifier:\n';
//    s += '        *:\n';
//    s += '          rdf:type: sc:XPathSelector\n';
//    s += '          rdf:value: "' + data.title.xpath + '"\n';
//   s += '          sc:attribute: "href"\n';
    s += '      sc:subfragment:\n';
    s += '        *:\n';
    s += '          sc:type:     rdf:Literal\n';
    s += '          sc:relation: ' + data[i].elements[j].type + '\n';
    s += '          sc:selector:\n';
    s += '            *:\n';
    s += '              rdf:type:  sc:XPathSelector\n';
    s += '              rdf:value: "' +  data[i].elements[j].xpath   + '"\n';
    s += '\n';
    }
  }
  clog(s);
  return s;
}

function clog(val) {
  var message = JSON.stringify(val).replace(/\n/g, " ");
  chrome.tabs.sendRequest(tabid, {callFunction: "consoleLog", value: message}); 
}