function Tabs()
{
    var ENCODED_TAB_ID_PREFIX = "chrome.tab.{0}:{1}";
    var m_tabs = {}

    this.register = function(windowId, tabId)
    {
        if (!m_tabs[tabId])
        {
            m_tabs[tabId] = encodeTabId(windowId, tabId);
        }

        return m_tabs[tabId];
    }

    this.identify = function(encodedTabId)
    {
        var decodedTabId = encodedTabId.split(":")[1];
        var tabId = parseInt(decodedTabId);

        if (encodedTabId !== m_tabs[tabId]) {
            console.warn("attempt to identify not registered tab:", encodedTabId, "/", tabId);
        }

        return tabId;
    }

    this.forget = function(tabId)
    {
        delete m_tabs[tabId];
    }

    function encodeTabId(windowId, tabId)
    {
        return ENCODED_TAB_ID_PREFIX.
            replace("{0}", windowId).
            replace("{1}", tabId);
    }
}