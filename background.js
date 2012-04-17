/*
Copyright 2011 UPM-GSI: Group of Intelligent Systems -
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
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.insertCSS(tab.id, {file:"core.css"});  
	chrome.tabs.executeScript(tab.id, {file:"core.js"});
	chrome.tabs.insertCSS(tab.id, {file:"sidebar.css"});  
	chrome.tabs.sendRequest(tab.id, {callFunction: "toggleSidebar"});
});