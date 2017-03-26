(function Popup(){
    var m_tabId = null;

    function buildApi()
    {
        var api = {
            setPopupSize    : function() {},
            closePopup      : function() {
                close();
            },
            openWebPage     : function(webPage) {
                open(webPage);
            },
            reloadActiveTab : function() {
                chrome.runtime.sendMessage({ command: 'reloadActiveTab' });
            },
            getTabId        : function() {
                return m_tabId;
            }
        };

        return api;
    }

    function publishApi()
    {
        console.debug("Publish Popup API.");
        window.plugin = buildApi();
    }

    function fireReadyEvent()
    {
        window.dispatchEvent(new CustomEvent(ApiReadyEventName));
    }

    function retrieveTabId(callback)
    {
        chrome.runtime.sendMessage({ 
            command: 'identifyTab' }, 
            function (response) {
                m_tabId = response.tabId;
                callback();
            }
        );
    }

    function start()
    {
        retrieveTabId(function() {
            publishApi();
            fireReadyEvent();
        });
    }

    document.addEventListener("DOMContentLoaded", start);

})()
