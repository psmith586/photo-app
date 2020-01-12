function search_request(){
    var iSearch = document.forms["landing"]["searchbar"].value;
    var regex = /^[0-9a-zA-Z]+$/; /* regular expression */

    /* Creating an object to store the request values.*/
    var request = new Object();
    request.search = iSearch;
    request.toString = function() {
        return "Search: " + this.search;
    }

    /* Converting request object into JSON */
    var requestJSON = JSON.stringify(request);


    /*Checks requirements for request */
    if (iSearch == "") {
        alert("Nothing to search up? You sure?");
        return false;
    }

    console.log(requestJSON);
}