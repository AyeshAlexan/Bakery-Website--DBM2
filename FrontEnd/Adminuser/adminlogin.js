console.log("adminlogin.js loaded ✅");

document.getElementById("login-form").addEventListener("submit", function (event) {
    event.preventDefault();

    // Get the user input
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    // Hardcoded admin credentials
    const adminEmail = "admin@example.com";
    const adminPassword = "admin123";

    // Validate credentials
    if (email === adminEmail && password === adminPassword) {
        window.location.href = '/adminuser/adminpanel.html';
    } else {
        const errorDiv = document.getElementById("login-error");
        errorDiv.classList.remove("d-none");
        
        showBrowserNotification("Invalid credentials", "Please try again with the correct email and password.");
    }
});

// Function to show browser notification
function showBrowserNotification(title, message) {
    if (Notification.permission === "granted") {
        new Notification(title, {
            body: message,
            icon: 'path/to/your/icon.png',
        });
    } else if (Notification.permission !== "denied" || Notification.permission === "default") {
        Notification.requestPermission().then(function(permission) {
            if (permission === "granted") {
                new Notification(title, {
                    body: message,
                    icon: 'path/to/your/icon.png',
                });
            }
        });
    }
}
