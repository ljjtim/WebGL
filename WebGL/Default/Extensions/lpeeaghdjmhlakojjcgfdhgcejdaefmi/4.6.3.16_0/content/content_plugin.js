var plugin = {
    callOnDocumentInteractive : function(callback) {
        if ("loading" == document.readyState) {
            window.addEventListener("DOMContentLoaded", function(event) {
                callback();
            });
        } else {
            setTimeout(callback, 0);
        }
    },

    callIfProductConnected : function(callback) {
        chrome.runtime.sendMessage({ command : "getProductConnectionStatus" }, function (isConnected) {
            if (isConnected) {
                callback();
            } else {
                console.warn("There is no active connection to Kaspersky Antivirus.");
            }
        });
    }
}
