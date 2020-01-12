function validatePost(){
    var iTitle = document.forms["postForm"]["pTitle"].value;
    var iDescription = document.forms["postForm"]["pDescription"].value;
    var iImage = document.getElementById("image").value;
    var box = document.getElementById("acceptAUP").checked;

    /* Post object to store inputted information */
    var post = new Object();
    post.title = iTitle;
    post.description = iDescription;
    post.image = iImage;

    /* Converting post object into JSON */
    var postJSON = JSON.stringify(post);


    /* Checks if inputs are blank */
    if (iTitle == "") {
        alert ("Please enter a title for the post.");
        return false;
    }

    if (iDescription == "") {
        alert ("Please enter a description of the post.");
        return false;
    }

    if (!iImage){
        alert("Please upload a file. (.jpg .png .bmp .gif)");
        return false;
    }

    /* Checks if the file is .jpg, .png, .bmp, or .gif */
    if (!(iImage.includes(".jpg") || iImage.includes(".png") || iImage.includes(".bmp") || iImage.includes(".gif"))){
        alert ("Please upload an image or gif. (.jpg .png .bmp .gif)")
        return false;
    }

    /* Checks if the box are checked. */
    if(box == false) {
        alert("Agree that you accept the Acceptable Use Policy.")
        return false;
    }

    console.log(postJSON);
}