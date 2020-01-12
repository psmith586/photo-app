function commentNow() {//function involving commenting on an image
    var iComment = document.forms["specificImagePost"]["commentBox"].value;
    var regex = /^[0-9a-zA-Z]+$/; /* regular expression */

    /* Creating an object to store the request values.*/
    var comment = new Object();
    comment.search = iComment;
    comment.toString = function() {
        return "Search: " + this.search;
    }

    /* Converting request object into JSON */
    var commentJSON = JSON.stringify(comment);


    /*Checks requirements for request */
    if (iSearch == "") {
        alert("Gotta say something, buddy.");
        return false;
    }

    console.log(commentJSON);
}