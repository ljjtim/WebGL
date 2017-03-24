(function() {
    function identifySelf(callback)
    {
        chrome.runtime.sendMessage({ 
            command: 'identifyTab' }, 
            function (response) {
                var hasConnectionWithProduct = (undefined !== response);
                if (hasConnectionWithProduct) 
                    callback(response.tabId);
            }
        );
    }

    // TODO: re-use 'messaging\inject_script_to_web_page.js'
    function executeScriptInDocument(contents)
    {
        var headNode = document.querySelector("head") || document.querySelector("body");
        var scriptNode = document.createElement("script");
        scriptNode.setAttribute("type", "text/javascript");
        scriptNode.text = contents;
        headNode.appendChild(scriptNode);
        headNode.removeChild(scriptNode);       
    }

    function publishApi()
    {
        trace("api.publishApi(), url = " + document.location.href);
        identifySelf(function(currentTabId) {
            window[TabIdPropertyName] = currentTabId;

            var script = "window.{0} = '{1}';".
                replace("{0}", TabIdPropertyName).
                replace("{1}", currentTabId);
            executeScriptInDocument(script);

            fireReadyEvent();
        });
    }

    function fireReadyEvent()
    {
        trace("api.fireReadyEvent(), url = " + document.location.href);
        window.dispatchEvent(new CustomEvent(ApiReadyEventName));
    }

    plugin.callIfProductConnected(function() {
        plugin.callOnDocumentInteractive(publishApi);
    });

})();
