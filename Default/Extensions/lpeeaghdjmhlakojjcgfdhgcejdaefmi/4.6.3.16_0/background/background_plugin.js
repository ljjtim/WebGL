(function Plugin(){
    var m_isConnectedToProduct = false;
    var m_tabs = new Tabs();
    // TODO: get rid of FactorySettings object, it is obsolete
    var m_factorySettings = new FactorySettings();
    var m_buttonControl = new ButtonControl(m_factorySettings.getButton());

    function handleRuntimeMessages(request, sender, sendResponse)
    {
        if ("identifyTab" == request.command) {
            handleIdentifyTabRequest(request, sender, sendResponse);
            return true;
        } else if ("getFeatureScriptUrls" == request.command) {
            handleGetFeatureScriptUrlsRequest(request, sender, sendResponse);
        } else if ("reloadActiveTab" == request.command) {
            handleReloadActiveTabRequest();
        } else if ("trace" == request.command) {
            handleTraceRequest(request);
		} else if ("getProductConnectionStatus" == request.command) {
			sendResponse(m_isConnectedToProduct);
        } else {
            console.error("unknown command: " + request);
        }
    }

    function handleTraceRequest(request)
    {
        traceAsIs(request.message || "<null message>");
    }

    function handleIdentifyTabRequest(request, sender, sendResponse)
    {
        if (sender.tab) {
            var encodedTabId = registerTab(sender.tab);
            sendResponse({ tabId : encodedTabId });
        } else {
            chrome.tabs.query({ active : true }, function(result) {
                // TODO: copy&paste
                var encodedTabId = registerTab(result[0]);
                sendResponse({ tabId : encodedTabId });
            });
        }
    }

    function handleGetFeatureScriptUrlsRequest(request, sender, sendResponse)
    {
        var manifest = chrome.runtime.getManifest();
        var urls = manifest.web_accessible_resources.map(function(script) {
            return chrome.extension.getURL(script);
        });
        console.debug("feature urls amount:", urls.length);
        sendResponse({ urls : urls });
    }

    function handleReloadActiveTabRequest()
    {
        chrome.tabs.reload();
    }

    function registerTab(tab)
    {
        var encodedTabId = m_tabs.register(tab.windowId, tab.id);
        return encodedTabId;
    }

    function buildApi(hasToolbar)
    {
        var api = {
            // TODO: getDocumentType is not used anymore, remove it after the release
            getDocumentType : function() {
                return 1;
            },

            onConnect : noThrow(onConnect),
            onDisconnect : noThrow(onDisconnect),
            openNewTab : function(url) { open(url) },

            // TODO: legacy.openNewTabNearExisting is not used anymore, remove it after the release
            legacy : {
                openNewTabNearExisting : function(existingTabId, webPage) {
                    // NOTE: ``chrome.tabs.create( { index : existingTabId, url : webPage } ) '' call does not respect the passed index, always opens a new tab in the active window.
                    // TODO: research a sequence of calls 'create() + move()' to create a new tab in the specified position.
                    open(webPage);
                }
            }
        };

        if (hasToolbar) {
            api.toolbarButton = {
                setDefaultState : noThrow(function(state) {
                    m_buttonControl.setDefaultState(state);
                }),

                setStateForTab : noThrow(function(encodedTabId, state) {
                    var tabId = m_tabs.identify(encodedTabId);
                    m_buttonControl.setState(tabId, state);
                }),
            }
        }

        return api;
    }

    function noThrow(func)
    {
        return function() {
            var args = Array.prototype.slice.call(arguments);
            try {
                return func.apply(func, arguments)
            } catch (e) {
                var msg = func.name + "({})".replace("{}", args) + " failed: " + e;
                trace(msg);
                console.error(msg);
            }
        }
    }

    function publishApi(hasToolbar)
    {
        var msg = "Publish plugin API, hasToolbar = " + hasToolbar.toString();
        console.debug(msg);
        trace(msg);
        
        window.plugin = buildApi(hasToolbar);
    }

    function registerExistingTabs()
    {
        chrome.tabs.query({}, function(tabs) {
            tabs.forEach(registerTab);
        });
    }

    function trackTabChanges()
    {
        chrome.tabs.onCreated.addListener(function(tab) {
            registerTab(tab);
        });

        chrome.tabs.onRemoved.addListener(function(tabId) {
            m_tabs.forget(tabId);
        })

        chrome.tabs.onReplaced.addListener(function(newTabId, oldTabId) {
            m_tabs.forget(oldTabId);
            chrome.tabs.get(newTabId, registerTab);
        });
    }

    function onConnect(settings)
    {
        console.debug("Connection with the product is discovered. Settings:");
		m_isConnectedToProduct = true;
        console.debug(settings);

        trace(chrome.runtime.id + "/" + chrome.runtime.getManifest().version + "/" + navigator.userAgent.toString() + " is online.");

        chrome.runtime.onMessage.addListener(handleRuntimeMessages);
    }

    function onDisconnect()
    {
        console.warn("Connection with the product is lost.");
		m_isConnectedToProduct = false;
        m_buttonControl.resetToFactory();

        chrome.runtime.onMessage.removeListener(handleRuntimeMessages);
    }

    function fireReadyEvent()
    {
        window.dispatchEvent(new CustomEvent(ApiReadyEventName));
    }

    function init()
    {
        var hasToolbarApi = false;
        trackTabChanges();
        hasToolbarApi = true;
        publishApi(hasToolbarApi);

        fireReadyEvent();
    }

    init();

})()
