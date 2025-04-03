document.addEventListener("DOMContentLoaded", () => { // Wait until full page is loaded
    
    // heartbuttons
    document.addEventListener("click", async (event) => {
        if (event.target.closest(".heartButton")) {
            event.preventDefault(); // makes sure submit does not immediately submits to server, but does this function instead
            
            const button = event.target;
            const animation = button.closest("button")
            const form = button.closest("form"); //closest from heartbutton (so one above it in code)
            const cocktailId = form.querySelector("input[name='cocktailId']").value;

            try {
                const response = await fetch("/toggleFavorite", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }, // format in which data is sent to server
                    body: JSON.stringify({ cocktailId }) //actual data
                });

                const data = await response.json();
                console.log(data)
                if (response.ok) {
                    animation.classList.toggle("favourited");
                    showToastWithHref(data.message);
                } else {
                    handleError(response, data);
                }
            } catch (error) {
                console.error("Error toggling favorite:", error);
                showToastNoHref("Error toggling favorite.");
            }
        }
    });

    // submit buttons for signup and login forms
    document.querySelectorAll(".loginSignupButton").forEach(button => {
        button.addEventListener("click", async (event) => {
            event.preventDefault();

            const form = event.target.closest("form");
            const formData = new FormData(form);
            const jsonData = Object.fromEntries(formData.entries()); // Convert FormData to JSON-friendly object
            const actionUrl = form.action; // either /login or /signup

            try {
                const response = await fetch(actionUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(jsonData)
                });

                const data = await response.json();

                if (response.ok) {
                    showToastNoHref(data.message);
                    if (data.redirect) {
                        setTimeout(() => window.location.href = data.redirect, 2000);
                    }
                } else {
                    handleError(response, data);
                }
            } catch (error) {
                console.error("Error submitting form:", error);
                showToastNoHref("Error submitting form.");
            }
        });
    });
});


async function handleError(response, errorData) {
    try {
        if (response.status === 401) {
            // Check if the error is specifically about favoriting cocktails
            if (errorData.error === "You must be logged in to favorite cocktails.") {
                showToastWithHref("You must be logged in to favorite cocktails.", "Go to Account", "/account");
            } else {
                showToastNoHref("Username or password does not match");
            }
        } else if (response.status === 400){
            showToastNoHref(errorData.error);
        } else {
            showToastWithHref("You must be logged in.", "Go to Account", "/account");
        }
    } catch (error) {
        console.error("Error handling response:", error);
        showToastNoHref("An unexpected error occurred.");
    }
}



// show toast notification with a link to account
function showToastWithHref(message) {
    const toast = document.createElement("div");
    toast.classList.add("toast");
  
    // make p and a for in toast
    const messageParagraph = document.createElement("p");
    messageParagraph.textContent = message;
  
    const accountLink = document.createElement("a");
    accountLink.href = "/account";
    accountLink.textContent = "Go to Account";

    //add in toast
    toast.appendChild(messageParagraph);
    toast.appendChild(accountLink);
  
    // Append the toast to the body
    document.body.appendChild(toast);
  
    // Show the toast with a slight delay for animation
    setTimeout(() => {
      toast.classList.add("show");
    }, 50);
  
    // Remove the toast after 2 seconds
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 500); // Remove element after fade-out
    }, 2000); // Hide after 2 seconds
}


  // show toast notification without link to account
function showToastNoHref(message) {
    const toast = document.createElement("div");
    toast.classList.add("toast");
  
    // make p and a for in toast
    const messageParagraph = document.createElement("p");
    messageParagraph.textContent = message;

    //add in toast
    toast.appendChild(messageParagraph);
  
    // Append the toast to the body
    document.body.appendChild(toast);
  
    // Show the toast with a slight delay for animation
    setTimeout(() => {
      toast.classList.add("show");
    }, 50);
  
    // Remove the toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 500); // Remove element after fade-out
    }, 2000); // Hide after 3 seconds
}
  
