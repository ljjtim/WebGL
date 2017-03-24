function PopupControl(urlProvideFunc, factorySettings)
{
    this.resetToFactory = function()
    {
        // TODO: investigate why setUrl(null, url) does not reset all popups.
        chrome.tabs.query({}, function(tabs) {
            tabs.forEach(function(tab) {
                setUrl(tab.id, factorySettings.url);
            });
        });
    }

    this.initializePopupForTab = function(tabId, encodedTabId)
    {
        console.log("initialize popup for tab:", tabId, encodedTabId);
        setUrl(tabId, urlProvideFunc(encodedTabId));
    }

    function setUrl(tabId, popupUrl)
    {
        chrome.browserAction.setPopup({
            tabId : tabId,
            popup : popupUrl
        });
    }
}

function createPopupControl(url, factorySettings, callback)
{
    console.debug("create popup control");
    function retrieveHtml(readyCallback)
    {
        var request = new XMLHttpRequest();
        request.open("GET", url);

        request.onload = function() {
            readyCallback({ html  : this.responseText });
        }
        request.onerror = function(error) {
            readyCallback({ error : error.error });
        }
        request.ontimeout = function() {
            readyCallback({ error : "timed out" });
        }
        request.send();
    }
        
    function buildPopupUrl(tabId, popupHtml)
    {
        var popupArguments = {
            html  : popupHtml,
            tabId : tabId
        };

        return PopupUrl.build(popupArguments);
    }

    function createPopupUrlFunction(popupHtml)
    {
        return function(tabId) {
            return buildPopupUrl(tabId, popupHtml);
        }
    }

    function init()
    {
        retrieveHtml(function(result) {
            if (result.error)
            {
                console.debug("Failed to retrieve popup HTML.");
                return callback(result.error);
            }
            
            callback(null, new PopupControl(
                createPopupUrlFunction(result.html),
                factorySettings
            ));
        });
    }

    init();
}
