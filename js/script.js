import { Previewer, Handler } from '../js/paged.esm.js';


var fetchThis = [];
//ex. only get h1s
//var filterThis = "h1";
var filterThis;

var printFlag = false;

window.addEventListener('load', () => {

    // 1. Get content 
    let content = document.body.innerHTML;
    document.body.innerHTML = "";

    // 2. Move content into #content + build printing UI
    document.body.innerHTML = '\
    <header id="header-pagedjs">\
        <div id="header-container">\
            <button id="button-screen"  class="hide"> Show on screen</button>\
            <button id="button-print-preview" >Make book</button>\
            <button id="button-print"  class="hide">Print!</button>\
        </div>\
    </header>\
    <div id="renderbook"></div>\
    <div id="content">\
    ' + content + '</div>';




    // Events for Preview/Screen/Print UI
    document.querySelector('#button-print-preview').addEventListener('click', function() { printPreview(filterThis, fetchThis );  }, false);
    document.querySelector('#button-screen').addEventListener('click', screenReload);
    document.querySelector('#button-print').addEventListener('click', function() { printPdf(); }, false);


    // Prevent standard print action from launching @CMD+P
    document.addEventListener("keydown", function(e) {
        if (e.metaKey && e.keyCode == 80) {
            e.preventDefault();
            printFlag = true;
            printPdf();
        }
    }, false);

});


//Preview book layout, make sure to include CSS files for the interface, select content by providing a query selector, falls back to #content

async function printPreview(filterTag, contentToFetch) {

    let inputPrint = document.getElementById("input-print");



    if(document.getElementById("style-screen"))
    {
        document.getElementById("style-screen").remove();
    }
    let bookcontent = document.querySelector("#content");
    let content = bookcontent.innerHTML;
    if (filterTag) {
        console.log("Content filtered by "+filterTag);
        let filteredBookcontent = document.querySelector(filterTag);
        content = filteredBookcontent.outerHTML;
    }
    if (contentToFetch) {
        for(var i = 0; i < contentToFetch.length; i++) {
            content += await fetcher(contentToFetch[i][0], contentToFetch[i][1]);
        }
    }
    bookcontent.innerHTML = "";



    // 1. Create Previewer
    let previewer = new Previewer();

    // 2. Register Handlers
    previewer.registerHandlers(
        class PreviewHandler extends Handler {
            afterPreview() {
                document.querySelector('#button-screen').classList.toggle("hide");
                document.querySelector('#button-print-preview').classList.toggle("hide");
                document.querySelector('#button-print').classList.toggle("hide");
                if (printFlag == true) {
                    window.print();
                }
            }
        }
    );

    // 3. Render
    previewer.preview(
        content,
        ["css/print.css"],
        document.querySelector("#renderbook")
    );
};



// Switch to screen design aka reset page

function screenReload() {
    window.location.reload(false);
};


// Print action, if you are in Preview --> Print, if you are in screen modee --> preview --> print

async function printPdf() {

    if(document.querySelector('#button-print-preview').classList.contains("hide")){
        window.print();
    } else {
        await printPreview(filterThis, fetchThis);
    }
};


// A content fetcher function to asynchronously load html files on the same server i.e. create book from multiple pages

async function fetcher(contentPath, filterTag){
    const output = fetch(contentPath)
    .then(function(response) {
        return response.text()
    })
    .then(function(html) {
        // Initialize DOM parser
        var parser = new DOMParser();
        // Parse text
        var parseContent = parser.parseFromString(html, "text/html");
        // filter if needed
        if(filterTag){
            parseContent = parseContent.querySelector(filterTag).innerHTML;
            return parseContent;
        }
        console.log("Document" + contentPath + " added to book");
        return html;
    })
    .catch(function(err) {  
        console.log('Failed to fetch page: ', err);  
        return err;
    });
    return output;
}



