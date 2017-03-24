function getInjectionId()
{
    return InjectionId.substr(0, InjectionId.length/2);
}

function evalInPageContext(script)
{
    var element = document.createElement("script");
    element.textContent = 'document.currentScript.setAttribute("result", (' + script + '))';
    (document.head || document.documentElement).appendChild(element);
    var result = element.getAttribute("result");
    element.parentNode.removeChild(element);

    return result;
}

function isScriptUrlAlreadyInserted()
{
    var checkScript = "'{}' in window".replace("{}", getInjectionId());
    var isInjected = ("true" === evalInPageContext(checkScript));
    if (isInjected)
    {
        return true;
    }

    const query = "head > script[src *= '{}']".replace("{}", HostMarker);
    var markers = document.querySelectorAll(query);
    return markers.length > 0;
}

function isHttps()
{
    return "https:" == window.location.protocol;
}

function isInjectionRequired()
{
    var result = isHttps() && !isScriptUrlAlreadyInserted();
    trace("injection.isInjectionRequired() = " + result.toString() + ", url = " + document.location.href);
    return result;
}

