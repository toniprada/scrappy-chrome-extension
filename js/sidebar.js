var namespaces = [
    {id:1, prefix:"rdf", uri:"http://www.w3.org/1999/02/22-rdf-syntax-ns#"},
    {id:2, prefix:"sc", uri:"http://lab.gsi.dit.upm.es/scraping.rdf#"},
    {id:3, prefix:"sioc", uri:"http://lab.gsi.dit.upm.es/scraping.rdf#"},
    {id:4, prefix:"dc", uri:"http://purl.org/dc/elements/1.1/"},
    {id:5, prefix:"skos", uri:"http://www.w3.org/2004/02/skos/core#"},
    {id:6, prefix:"ecos", uri:"http://kmm.lboro.ac.uk/ecos/1.0#"},
    {id:7, prefix:"xml", uri:"http://www.w3.org/XML/1998/namespace"},
    {id:8, prefix:"v", uri:"http://www.w3.org/2006/vcard/ns#"}
];
var namespaceCount = 8;
var fragments = []
var fragmentsCount = 0;


chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.callFunction == "addFragmentToSidebar") {
            addFragment(request.fragment);
        } 
    }
);

$(document).ready(function(){
    $("#addNamespaceButton").click(function() {
        if(!$(this).hasClass("disabled")) {
            addNamespace();
        }
    });
    $("#addResourceButton").click(function() {
        if(!$(this).hasClass("disabled")) {
            chrome.extension.sendMessage({task: "addResource", ns: namespaces});
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
        namespaceCount++;
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
        console.log(namespaces);;
    });
}

function addFragment(fragment) {
    fragmentsCount++;
    fragment.id = fragmentsCount;
    fragments.push(fragment);
    $("#fragmentsContainer").append(
        '<div class="fragment" count="' + fragmentsCount + '">\
        <p>Selector type: ' +  fragment.selector.type +'</p>\
        <p>Selector value: ' +  fragment.selector.value + '</p>\
        <button class="buttonSmall red" id="removeFragment' + fragmentsCount + '">Remove</button>\
         <button class="buttonSmall blue" id="addSubFragment' + fragmentsCount + '">Add subfragment</button>\
        </div>'
    );
     $('#removeFragment' + fragmentsCount).click(function() {
        var count = $(this).parent().attr("count");
        for(var i=0;i<fragments.length;i++){
            if(fragments[i].id == count) {
                fragments.splice(i,1);
            } 
        };
        $(this).parent().remove();
        console.log(fragments);
    }); 
    $('#addSubFragment' + fragmentsCount).click(function() {
        var count = $(this).parent().attr("count");
        chrome.extension.sendMessage({task: "addSubfragment", fragmentId: count, ns: namespaces});
     }); 
}

