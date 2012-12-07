var namespaces = new Array();
var namespaceCount = 1;

chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.callFunction == "updateNamespacesSidebar") {
            updateNamespaces(request.data);
        } 
    }
);

$(document).ready(function(){
    $("#addNamespaceButton").click(function() {
        if(!$(this).hasClass("disabled")) {
            addNamespace();
        }
    });
    $("#aboutLink").click(function() {
        chrome.extension.sendMessage({task: "about"});
    });
});



function addNamespace() {
    $("#addNamespaceButton").addClass("disabled");
    $("#namespacesContainer").append(
        '<div id="addNamespaceForm">\
        <p>Prefix: <input id="namespacePrefix"  type="text"></input></p>\
        <p>URI: <input id="namespaceUri"  type="text"></input></p>\
        <button class="buttonSmall red" id="namespaceCancel" >Cancel</button>\
        <button class="buttonSmall green" id="namespaceOk" >Add</button>\
        </div>'
        );
    $("#namespaceCancel").click(function() {
        $("#addNamespaceForm").remove();
        $("#addNamespaceButton").removeClass("disabled");
    });
    $("#namespaceOk").click(function() {
        var p = $("#namespacePrefix").val();
        var u = $("#namespaceUri").val();
        $("#namespacesContainer").append(
            '<div class="namespace" count="' + namespaceCount + '">\
            <p>' +  p+ ':' + u + '</p>\
            <button class="buttonSmall red" id="removeNamespace' + namespaceCount + '">Remove</button>\
            </div>'
        );
        $('#removeNamespace' + namespaceCount).click(function() {
            var count = $(this).parent().attr("count");
            for(var i=0;i<namespaces.length;i++){
                if(namespaces[i].id == count) {
                    namespaces.splice(i,1);
                } 
            };
            $(this).parent().remove();
            console.log(namespaces);
        }); 
        $("#addNamespaceForm").remove();
        $("#addNamespaceButton").removeClass("disabled");
        namespaces.push({id: namespaceCount, prefix: p, uri: u});
        console.log(namespaces);
        namespaceCount++;
    });
}

