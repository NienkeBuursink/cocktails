document.addEventListener("DOMContentLoaded", () => { //wait until html is loaded, so it does not run before the buttons exist in the DOM
    document.querySelectorAll(".heartButton").forEach(button => {
        button.addEventListener("click", async (event) => {
            event.preventDefault(); // prevent form from actually submitting when clicking the heart button. (AJAX instead of page reload)

            const form = event.target.closest("form"); // searches upwards in the HTML to find the nearest <form>
            const cocktailId = form.querySelector("input[name='cocktailId']").value; //finds the <input> inside the form

            try {
                const response = await fetch("/toggleFavorite", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json", // info about how to handle data on server
                    },
                    body: JSON.stringify({ cocktailId }), // actual data
                });

                const data = await response.json();

                if (response.ok) {
                showToast(data.message);
            } else {
                // If the user is not logged in, show the message
                if (response.status === 401) {
                    showToast("You must be logged in to toggle favorites. ", "Go to Account", "/account");
                } else {
                    const errorData = await response.json();
                    showToast(`Error: ${errorData.error}`);
                }
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            showToast("Error toggling favorite.");
        }
        });
    });
});



// Function to show toast notification with a link to account
function showToast(message) {
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
  
    // Remove the toast after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 500); // Remove element after fade-out
    }, 2000); // Hide after 3 seconds
  }
  
