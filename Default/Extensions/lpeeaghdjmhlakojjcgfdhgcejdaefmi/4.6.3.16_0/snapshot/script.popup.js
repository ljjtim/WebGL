/** @suppress {duplicate} */ var KasperskyLab = (function (context) {
    /**
     * @return {string}
     */
    function GetClass(obj) {
        if (typeof obj === "undefined")
            return "undefined";
        if (obj === null)
            return "null";
        return Object.prototype.toString.call(obj)
            .match(/^\[object\s(.*)\]$/)[1];
    }

    var exports = {}, undef;

    /**
     * @return {string}
     */
    function ObjectToJson(object) {
        if (object === null || object == Infinity || object == -Infinity || object === undef)
            return "null";

        var className = GetClass(object);

        if (className == "Boolean") {
            return "" + object;
        } else if (className == "Number") {
            return window.isNaN(object) ? "null" : "" + object;
        } else if (className == "String") {
			var escapedStr = "" + object;
            return "\"" + escapedStr.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"") + "\"";
        }

        if (typeof object == "object") {
            if (!ObjectToJson.check) ObjectToJson.check = [];
            for (var i=0, chkLen=ObjectToJson.check.length ; i<chkLen ; ++i) {
                if (ObjectToJson.check[i] === object) {
                    throw new TypeError();
                }
            }
            ObjectToJson.check.push(object);
            var str = '';
            if (className == "Array") {
                for (var index = 0, length = object.length; index < length; ++index) {
                    str += ObjectToJson(object[index]) + ',';
                }
                ObjectToJson.check.pop();
                return "["+str.slice(0,-1)+"]";
            } else {
                for (var property in object) {
                    if (object.hasOwnProperty(property)) {
                        str += '"' + property + '":' + ObjectToJson(object[property]) + ',';
                    }
                }
                ObjectToJson.check.pop();
                return "{"+str.slice(0,-1)+"}";
            }
        }
        return undef;
    }

    exports.stringify = function (source) {
        return ObjectToJson(source);
    };

    var parser = {
        source : null,
        grammar : /^[\x20\t\n\r]*(?:([,:\[\]{}]|true|false|null)|(-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)|"((?:[^\r\n\t\\\"]|\\(?:["\\\/trnfb]|u[0-9a-fA-F]{4}))*)")/,

        ThrowError : function() {
            throw new SyntaxError('JSON syntax error');
        },

        NextToken : function(token) {
            this.source = token.input.slice(token[0].length);
            return this.grammar.exec(this.source);
        },

        ParseArray : function(){
            var token = this.grammar.exec(this.source),
                parseItem = token && token[1] != ']',
                result = [];

            for(;;token = this.NextToken(token)) {
                if (!token)
                    this.ThrowError();

                if (parseItem) {
                    result.push(this.ParseValue(token));
                    token = this.grammar.exec(this.source);
                } else {
                    if (token[1]) {
                        if (token[1] == ']') {
                            break;
                        } else if (token[1] != ',') {
                            this.ThrowError();
                        }
                    } else {
                        this.ThrowError();
                    }
                }
                parseItem = !parseItem;
            }

            return result;
        },

        ParseObject : function(){
            var propertyName, parseProperty = true, result = {};

            for(var token = this.grammar.exec(this.source);;token = this.NextToken(token)) {
                if (!token)
                    this.ThrowError();

                if (parseProperty) {
                    if (token[1] && token[1] == '}') {
                        //this.source = this.source.slice(token[0].length);
                        break;
                    } else if (token[1] || token[2] || !token[3]) {
                        this.ThrowError();
                    }

                    propertyName = token[3];
                    token = this.NextToken(token);

                    if (!token || !token[1] || token[1] != ':')
                        this.ThrowError();

                    parseProperty = false;
                } else {
                    if (!propertyName)
                        this.ThrowError();

                    result[ propertyName ] = this.ParseValue(token);
                    token = this.NextToken(this.grammar.exec(this.source));

                    if (token[1]) {
                        if (token[1] == '}') {
                            break;
                        } else if (token[1] != ',') {
                            this.ThrowError();
                        }
                    } else {
                        this.ThrowError();
                    }

                    propertyName = undef;
                    parseProperty = true;
                }
            }
            return result;
        },

        ParseValue : function(token){
            if (token[1]) {
                switch (token[1]){
                    case '[' :
                        this.source = this.source.slice(token[0].length);
                        return this.ParseArray();
                    case '{' :
                        this.source = this.source.slice(token[0].length);
                        return this.ParseObject();
                    case 'true' :
                        return true;
                    case 'false' :
                        return false;
                    case 'null' :
                        return null;
                    default:
                        this.ThrowError();
                }
            } else if (token[2]) {
                return  +token[2];
            }
            return token[3].replace(/\\(?:u(.{4})|(["\\\/\']))/g, function(substr, utfCode, esc){
                return utfCode ? String.fromCharCode(parseInt(utfCode, 16)) : esc;
            });
        },

        Parse : function(str) {
            if ('String' != GetClass(str))
                throw new TypeError();

            this.source = str;
            var token = this.grammar.exec(this.source);
            if (!token)
                this.ThrowError();

            return this.ParseValue(token);
        }

    };

    exports.parse = function (source) {
        return parser.Parse(source);
    };

    context['JSONStringify'] = exports.stringify;
    context['JSONParse'] = exports.parse;
    return context;
}).call(this, KasperskyLab || {});
/** @suppress {duplicate} */ var KasperskyLab = (function (/** !Object */ ns) {

	/** 
	 *  @export
	 *  @const
	 *  @type {!number}
	 */
    ns.MaxRequestDelay = 2000;

    /**
     *  @export
     *  @nosideeffects
     */
	ns.Log = function()
    {
    };

	/**
	 *  @export
	 *  @return {!string}
	 */
    ns.GetResourceSrc = function (/** !string */ resourceName) {
		var prefix = ns.PREFIX || "%PREFIX%";
		var resSignature = ns.RES_SIGNATURE || "%RES_SIGNATURE%";

        return prefix + resSignature + resourceName;
    };

	/**
	 *  @export
	 */
    ns.AddEventListener = function (/** !Element */ element, /** !string */ name, /** function(Object=) */ func) {
        if ("addEventListener" in element)
            element.addEventListener(name, function (e) { func(e || window.event); }, false);
        else
            element.attachEvent('on' + name, function (e) { func.call(element, e || window.event); });
    };
    
	/**
	 *  @export
	 */
    ns.AddRemovableEventListener = function (/** !Element */ element, /** !string */ name, /** function(Object=) */ func) {
        if (element.addEventListener)
            element.addEventListener(name, func, false);
        else
            element.attachEvent('on' + name, func);
    };
	
	/**
	 *  @export
	 */
	ns.RemoveEventListener = function (/** !Element */ element, /** !string */ name, /** function(Object=) */func) {
        if (element.removeEventListener)
            element.removeEventListener(name, func, false);
        else
            element.detachEvent('on' + name, func);
    };

	/**
	 *  @private
	 */
    function InsertStyleRule(/** !Element */ style, /** !string */ rule) {
        if (style.styleSheet)
            style.styleSheet.cssText += rule + '\n';
        else
            style.appendChild(document.createTextNode(rule));
    }

	/**
	 *  @export
	 */
    ns.AddStyles = function (/** Array<!string>= */rules) {

        if (typeof rules !== 'object' || rules.constructor !== Array) {
            return;
        }

        /** @struct */var style = document.createElement('style');
        style.type = 'text/css';
        style.setAttribute('nonce', ns.ContentSecurityPolicyNonceAttribute);

        for (var i = 0, /** @const */len = rules.length; i < len; ++i)
            InsertStyleRule(style, rules[i]);

        if (document.head)
            document.head.appendChild(style);
        else
            document.getElementsByTagName('head')[0].appendChild(style);
    };

	/**
	 *  @export
	 *  @return {!number}
	 */
    ns.GetCurrentTime = function () {
        return new Date().getTime();
    };
	
	/**
	 *  @export
	 *  @return {{left: !number, top: !number}}
	 */
	ns.GetPageScroll = function()
	{
		return {
				left: (document.documentElement && document.documentElement.scrollLeft) || document.body.scrollLeft,
				top: (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop
			};
	};

	/**
	 *  @export
	 *  @return {!number}
	 */
	ns.GetPageHeight = function()
	{
		return document.documentElement.clientHeight || document.body.clientHeight;
	};

	/**
	 *  @export
	 *  @return {!number}
	 */
	ns.GetPageWidth = function()
	{
		return document.documentElement.clientWidth || document.body.clientWidth;
	};
	
	
	
	// Search link filters
	// ---------------------------

	function IsGoogleSearch(linkElement)
	{
		if (linkElement.parentNode.tagName.toLowerCase() === "h3" &&
			linkElement.parentNode.className.toLowerCase() === "r")
			return true;
		return false;
	}

	function IsYandexSearch(linkElement)
	{
		if (linkElement.parentNode.tagName.toLowerCase() === "h2" && (
				linkElement.className.toLowerCase().indexOf("serp-item__title-link") !== -1 ||
				linkElement.className.toLowerCase().indexOf("b-serp-item__title-link") !== -1 ||
				linkElement.className.toLowerCase().indexOf("organic__url") !== -1))
		    return true;
        else
		    return false;
	}

	function IsYahooSearch(linkElement)
	{
		// chrome: fc-14th ac-1st
		// ff & ie: ac-algo ac-21th
		if (linkElement.className.toLowerCase().indexOf("ac-1st") !== -1 ||
			linkElement.className.toLowerCase().indexOf("ac-21th") !== -1)
			return true;
		return false;
	}
	
	function IsYahooLocalSearch(linkElement)
	{
		return linkElement.className.toLowerCase().indexOf("td-u") !== -1;
	}

	function IsYahooCoSearch(linkElement)
	{
		if (linkElement.parentNode.tagName.toLowerCase() === "h3" &&
			linkElement.parentNode.parentNode &&
			linkElement.parentNode.parentNode.className.toLowerCase() === "hd")
			return true;
		return false;
	}

	function IsBingSearch(linkElement)
	{
		if (linkElement.parentNode.tagName.toLowerCase() !== "h2" || !linkElement.parentNode.parentNode)
			return false;
		if (linkElement.parentNode.parentNode.className.toLowerCase().indexOf("sb_tlst") !== -1 ||
			linkElement.parentNode.parentNode.className.toLowerCase().indexOf("b_algo") !== -1)
			return true;
		if (linkElement.parentNode.parentNode.parentNode &&
			linkElement.parentNode.parentNode.className.toLowerCase().indexOf("b_title") !== -1 &&
			linkElement.parentNode.parentNode.parentNode.className.toLowerCase().indexOf("b_algo") !== -1)
			return true;
		return false;
	}

	function IsMailRuSearch(linkElement)
	{
		if (linkElement.target.toLowerCase() === "_blank" && (
			linkElement.parentNode.className.toLowerCase() === "res-head" ||
			linkElement.parentNode.className.toLowerCase() === "result__title"))
			return true;
		return false;
	}

	function IsNigmaRuSearch(linkElement)
	{
		if (linkElement.parentNode.className.toLowerCase() === "snippet_title")
			return true;
		return false;
	}

	function IsRamblerRuSearch(linkElement)
	{
		if (linkElement.className.toLowerCase() === "b-serp-item__link")
			return true;
		return false;
	}

	function IsBaiduComSearch(linkElement)
	{
		if (linkElement.parentNode.className.toLowerCase() === "t")
			return true;
		return false;
	}

	function IsBaiduJpSearch(linkElement)
	{
		if (linkElement.parentNode.tagName.toLowerCase() === "h3" &&
			linkElement.parentNode.parentNode &&
			linkElement.parentNode.parentNode.parentNode &&
			linkElement.parentNode.parentNode.parentNode.className.toLowerCase() === "web")
			return true;
		return false;
	}

	function IsAskComSearch(linkElement)
	{
		if (linkElement.className.toLowerCase() === "web-result-title-link")
			return true;
		return false;
	}

	function NotSearchSite()
	{
		return false;
	}
	
	try
	{
		var currentPageUrl = document.location.href;
		var schemeEndPos = currentPageUrl.indexOf("://");
		var linkFilterFunction;
		if (schemeEndPos !== -1)
		{
			var host = currentPageUrl.substr(schemeEndPos + 3).toLowerCase();
			if (host.indexOf("www.google.") === 0)
				linkFilterFunction = IsGoogleSearch;
			else if (host.indexOf("yandex.") === 0 || host.indexOf("www.yandex.com") === 0)
				linkFilterFunction = IsYandexSearch;
			else if (host.indexOf("search.yahoo.com") === 0)
				linkFilterFunction = IsYahooSearch;
			else if (host.indexOf("search.yahoo.co.") === 0)
				linkFilterFunction = IsYahooCoSearch;
			else if (host.indexOf("search.yahoo.com") !== -1)
				linkFilterFunction = IsYahooLocalSearch;
			else if (host.indexOf("www.bing.com") === 0)
				linkFilterFunction = IsBingSearch;
			else if (host.indexOf("go.mail.ru") === 0)
				linkFilterFunction = IsMailRuSearch;
			else if (host.indexOf("nigma.ru") === 0)
				linkFilterFunction = IsNigmaRuSearch;
			else if (host.indexOf("www.nigma.ru") === 0)
				linkFilterFunction = IsNigmaRuSearch;
			else if (host.indexOf("nova.rambler.ru") === 0)
				linkFilterFunction = IsRamblerRuSearch;
			else if (host.indexOf("www.baidu.com") === 0)
				linkFilterFunction = IsBaiduComSearch;
			else if (host.indexOf("www.baidu.jp") === 0)
				linkFilterFunction = IsBaiduJpSearch;
			else if (host.indexOf("www.ask.com") === 0)
				linkFilterFunction = IsAskComSearch;
			else
				linkFilterFunction = NotSearchSite;
		}
		
		ns.IsLinkSearchResult = linkFilterFunction;
	}
	catch(e)
	{
		ns.IsLinkSearchResult = NotSearchSite;
	}
	
	function MutationChangeObserver(observeTag)
	{
		var m_observer;
		var m_callback;

		function ProcessNodeList(nodeList)
		{
			for (var i = 0; i < nodeList.length; ++i)
			{
				if (nodeList[i].nodeType === 1 && nodeList[i].getElementsByTagName(observeTag).length > 0)
					return true;
			}
			return false;
		}
		
		
		function ProcessDomChange(records)
		{
			if (!m_callback)
				return;

			for (var i = 0; i < records.length; ++i)
			{
				var record = records[i];
				if ((record.addedNodes.length && ProcessNodeList(record.addedNodes)) ||
					(record.removedNodes.length && ProcessNodeList(record.removedNodes)))
				{
					m_callback();
					return;
				}
			}
		}
		
		this.Start = function(callback)
		{
			m_callback = callback;
			m_observer = new MutationObserver(ProcessDomChange);
			m_observer.observe(document, { childList: true, subtree: true });
		};
		this.Stop = function()
		{
			m_observer.disconnect();
			m_callback = null;
		};
	}

	
	function DomEventsChangeObserver(observeTag)
	{
		var m_callback;
	
		function ProcessEvent(event)
		{
			var node = event.target;
			if (!m_callback || node.nodeType !== 1)
				return;
			if (node.nodeName.toLowerCase() === observeTag || node.getElementsByTagName(observeTag).length > 0)
				m_callback();
		}

		this.Start = function(callback)
		{
			window.addEventListener("DOMNodeInserted", ProcessEvent);
			window.addEventListener("DOMNodeRemoved", ProcessEvent);
			m_callback = callback;
		}
		this.Stop = function()
		{
			window.removeEventListener("DOMNodeInserted", ProcessEvent);
			window.removeEventListener("DOMNodeRemoved", ProcessEvent);
			m_callback = null;
		}
	}
	
	function TimeoutChangeObserver(observeTag)
	{
		var m_interval;
		var m_callback;		
		var m_tagCount;
		var m_attribute = 'klot_' + ns.GetCurrentTime();

		function IsChangesOccure(nodeList)
		{
			for (var i = 0; i < nodeList.length; ++i)
				if (!nodeList[i][m_attribute])
					return true;

			return false;
		}

		function FillTagInfo(nodeList)
		{
			m_tagCount = nodeList.length;
			for (var i = 0; i < m_tagCount; ++i)
				nodeList[i][m_attribute] = true;
		}
		
		function TimeoutProcess()
		{
			if (!m_callback)
				return;

			var nodeList = document.getElementsByTagName(observeTag);
			if (nodeList.length !== m_tagCount || IsChangesOccure(nodeList))
			{
				FillTagInfo(nodeList);
				m_callback();
			}
		}
		
		this.Start = function(callback)
		{
			m_callback = callback;
			FillTagInfo(document.getElementsByTagName(observeTag));
			m_interval = setInterval(TimeoutProcess, 10 * 1000);
			if (document.readyState !== "complete")
				ns.AddEventListener(window, "load", TimeoutProcess);
		}
		this.Stop = function()
		{
			clearInterval(m_interval);
			m_callback = null;
		}
	}
	
	ns.GetDomChangeObserver = function(observeTag)
	{
		var observeTagLowerCase = observeTag.toLowerCase();
		if (window.MutationObserver)
			return new MutationChangeObserver(observeTagLowerCase);
		if (window.addEventListener)
			return new DomEventsChangeObserver(observeTagLowerCase);
		
		return new TimeoutChangeObserver(observeTagLowerCase);
	}
    
    return ns;
}) (KasperskyLab || {});
(function (ns) {
	function md5cycle(x, k) {
		var a = x[0],
		b = x[1],
		c = x[2],
		d = x[3];

		a = ff(a, b, c, d, k[0], 7, -680876936);
		d = ff(d, a, b, c, k[1], 12, -389564586);
		c = ff(c, d, a, b, k[2], 17, 606105819);
		b = ff(b, c, d, a, k[3], 22, -1044525330);
		a = ff(a, b, c, d, k[4], 7, -176418897);
		d = ff(d, a, b, c, k[5], 12, 1200080426);
		c = ff(c, d, a, b, k[6], 17, -1473231341);
		b = ff(b, c, d, a, k[7], 22, -45705983);
		a = ff(a, b, c, d, k[8], 7, 1770035416);
		d = ff(d, a, b, c, k[9], 12, -1958414417);
		c = ff(c, d, a, b, k[10], 17, -42063);
		b = ff(b, c, d, a, k[11], 22, -1990404162);
		a = ff(a, b, c, d, k[12], 7, 1804603682);
		d = ff(d, a, b, c, k[13], 12, -40341101);
		c = ff(c, d, a, b, k[14], 17, -1502002290);
		b = ff(b, c, d, a, k[15], 22, 1236535329);

		a = gg(a, b, c, d, k[1], 5, -165796510);
		d = gg(d, a, b, c, k[6], 9, -1069501632);
		c = gg(c, d, a, b, k[11], 14, 643717713);
		b = gg(b, c, d, a, k[0], 20, -373897302);
		a = gg(a, b, c, d, k[5], 5, -701558691);
		d = gg(d, a, b, c, k[10], 9, 38016083);
		c = gg(c, d, a, b, k[15], 14, -660478335);
		b = gg(b, c, d, a, k[4], 20, -405537848);
		a = gg(a, b, c, d, k[9], 5, 568446438);
		d = gg(d, a, b, c, k[14], 9, -1019803690);
		c = gg(c, d, a, b, k[3], 14, -187363961);
		b = gg(b, c, d, a, k[8], 20, 1163531501);
		a = gg(a, b, c, d, k[13], 5, -1444681467);
		d = gg(d, a, b, c, k[2], 9, -51403784);
		c = gg(c, d, a, b, k[7], 14, 1735328473);
		b = gg(b, c, d, a, k[12], 20, -1926607734);

		a = hh(a, b, c, d, k[5], 4, -378558);
		d = hh(d, a, b, c, k[8], 11, -2022574463);
		c = hh(c, d, a, b, k[11], 16, 1839030562);
		b = hh(b, c, d, a, k[14], 23, -35309556);
		a = hh(a, b, c, d, k[1], 4, -1530992060);
		d = hh(d, a, b, c, k[4], 11, 1272893353);
		c = hh(c, d, a, b, k[7], 16, -155497632);
		b = hh(b, c, d, a, k[10], 23, -1094730640);
		a = hh(a, b, c, d, k[13], 4, 681279174);
		d = hh(d, a, b, c, k[0], 11, -358537222);
		c = hh(c, d, a, b, k[3], 16, -722521979);
		b = hh(b, c, d, a, k[6], 23, 76029189);
		a = hh(a, b, c, d, k[9], 4, -640364487);
		d = hh(d, a, b, c, k[12], 11, -421815835);
		c = hh(c, d, a, b, k[15], 16, 530742520);
		b = hh(b, c, d, a, k[2], 23, -995338651);

		a = ii(a, b, c, d, k[0], 6, -198630844);
		d = ii(d, a, b, c, k[7], 10, 1126891415);
		c = ii(c, d, a, b, k[14], 15, -1416354905);
		b = ii(b, c, d, a, k[5], 21, -57434055);
		a = ii(a, b, c, d, k[12], 6, 1700485571);
		d = ii(d, a, b, c, k[3], 10, -1894986606);
		c = ii(c, d, a, b, k[10], 15, -1051523);
		b = ii(b, c, d, a, k[1], 21, -2054922799);
		a = ii(a, b, c, d, k[8], 6, 1873313359);
		d = ii(d, a, b, c, k[15], 10, -30611744);
		c = ii(c, d, a, b, k[6], 15, -1560198380);
		b = ii(b, c, d, a, k[13], 21, 1309151649);
		a = ii(a, b, c, d, k[4], 6, -145523070);
		d = ii(d, a, b, c, k[11], 10, -1120210379);
		c = ii(c, d, a, b, k[2], 15, 718787259);
		b = ii(b, c, d, a, k[9], 21, -343485551);

		x[0] = add32(a, x[0]);
		x[1] = add32(b, x[1]);
		x[2] = add32(c, x[2]);
		x[3] = add32(d, x[3]);

	}

	function cmn(q, a, b, x, s, t) {
		a = add32(add32(a, q), add32(x, t));
		return add32((a << s) | (a >>> (32 - s)), b);
	}

	function ff(a, b, c, d, x, s, t) {
		return cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}

	function gg(a, b, c, d, x, s, t) {
		return cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}

	function hh(a, b, c, d, x, s, t) {
		return cmn(b^c^d, a, b, x, s, t);
	}

	function ii(a, b, c, d, x, s, t) {
		return cmn(c^(b | (~d)), a, b, x, s, t);
	}

	function md51(s) {
		var n = s.length,
		state = [1732584193, -271733879, -1732584194, 271733878],
		i;
		for (i = 64; i <= s.length; i += 64) {
			md5cycle(state, md5blk(s.substring(i - 64, i)));
		}
		s = s.substring(i - 64);
		var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		for (i = 0; i < s.length; i++)
			tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
		tail[i >> 2] |= 0x80 << ((i % 4) << 3);
		if (i > 55) {
			md5cycle(state, tail);
			for (i = 0; i < 16; i++)
				tail[i] = 0;
		}
		tail[14] = n * 8;
		md5cycle(state, tail);
		return state;
	}

	/* there needs to be support for Unicode here,
	 * unless we pretend that we can redefine the MD-5
	 * algorithm for multi-byte characters (perhaps
	 * by adding every four 16-bit characters and
	 * shortening the sum to 32 bits). Otherwise
	 * I suggest performing MD-5 as if every character
	 * was two bytes--e.g., 0040 0025 = @%--but then
	 * how will an ordinary MD-5 sum be matched?
	 * There is no way to standardize text to something
	 * like UTF-8 before transformation; speed cost is
	 * utterly prohibitive. The JavaScript standard
	 * itself needs to look at this: it should start
	 * providing access to strings as preformed UTF-8
	 * 8-bit unsigned value arrays.
	 */
	function md5blk(s) {
		/* I figured global was faster.   */
		var md5blks = [],
		i;
		/* Andy King said do it this way. */
		for (i = 0; i < 64; i += 4) {
			md5blks[i >> 2] = s.charCodeAt(i) +
				 (s.charCodeAt(i + 1) << 8) +
				 (s.charCodeAt(i + 2) << 16) +
				 (s.charCodeAt(i + 3) << 24);
		}
		return md5blks;
	}

	var hex_chr = '0123456789abcdef'.split('');

	function rhex(n) {
		var s = '',
		j = 0;
		for (; j < 4; j++)
			s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]+hex_chr[(n >> (j * 8)) & 0x0F];
		return s;
	}

	function hex(x) {
		for (var i = 0; i < x.length; i++)
			x[i] = rhex(x[i]);
		return x.join('');
	}

	ns.md5 = function (s) {
		return hex(md51(s));
	};

	/* this function is much faster,
	so if possible we use it. Some IEs
	are the only ones I know of that
	need the idiotic second function,
	generated by an if clause.  */

	function add32(a, b) {
		return (a + b) & 0xFFFFFFFF;
	}

	if (ns.md5('hello') != '5d41402abc4b2a76b9719d911017c592') {
		add32 = function(x, y) {
			var lsw = (x & 0xFFFF) + (y & 0xFFFF),
			msw = (x >> 16) + (y >> 16) + (lsw >> 16);
			return (msw << 16) | (lsw & 0xFFFF);
		}
	}

})(KasperskyLab || {});
/** @suppress {duplicate} */ var KasperskyLab = (function (/** !Object */ns) {

	/**
	 *  @export
	 *  @constructor
	 *  @final
	 *  @struct
	 *  @param {!string} balloonName
	 *  @param {!number} position
	 *  @param {!function(Element)} createCallback
	 *  @param {function(Object=)=} clickCallback
	 */
    ns.Balloon = function (balloonName, position, createCallback, clickCallback) {
		/** @const @struct*/var self = this;
		/** @const @type{!number} */var IECompatMode = 5; // checked IE render mode 6 && 7 - it is ok. Only 5 is broken
        /** @struct */var m_balloon = null;
        /** @type {?number} */var m_timeout = null;
        /** @const @type{!string} */var m_balloonDivName = 'balloon_parent_div_' + balloonName;

		/**
		 *  @private
		 */
        function AddStyles() {
			ns.AddStyles([
				'.kisb * { position: relative; display:block; overflow-x:hidden; width: auto; margin:0; padding:0; font-family: Verdana; line-height: 150%; text-indent:0; border:0; text-align:left; box-sizing:content-box; letter-spacing: normal;}',
				'.kisb { z-index:2147483647; width: 280px; cursor:default; display:block;}',
				'.kisb a { text-decoration: underline; display:inline-block; }',
				'.kisb a:hover { text-decoration: none; }',
				'.kisb a, .kisb a:link, .kisb a:hover, .kisb a:visited { color: #008ccc;}']);
        }

		/**
		 *  @private
		 */
        function ClearTimeoutInternal() {
            if (m_timeout)
                clearTimeout(m_timeout);
            m_timeout = 0;
        }

		/**
		 *  @private
		 */
        function MouseIsOver() {
            ClearTimeoutInternal.call(self);
        }
		
		/**
		 *  @private
		 */
        function MouseLeaveBalloon() {
            if (!m_timeout) {
                ClearTimeoutInternal();
                m_timeout = setTimeout(function () { HideBalloon(); }, 200);
            }
        }

		/**
		 *  @private
		 *  @param {Object} mouseArgs
		 */
        function MouseClick(mouseArgs) {
            if (clickCallback && clickCallback(mouseArgs || window.event)) {
                HideBalloon.call(self);
            }
        }

		/**
		 *  @private
		 *  @return {!Element}
		 */
        function CreateBalloon() {
            AddStyles();

            /** @struct */var balloonDiv = document.createElement('div');
            balloonDiv.className = 'kisb';
            balloonDiv.id = m_balloonDivName;
			ns.AddEventListener(balloonDiv, 'mouseout', MouseLeaveBalloon);
			ns.AddEventListener(balloonDiv, 'mouseover', MouseIsOver);
			ns.AddEventListener(balloonDiv, 'click', MouseClick);

            createCallback(balloonDiv);

            balloonDiv.style.visibility = 'hidden';
            document.body.appendChild(balloonDiv);

            return balloonDiv;
        }

		/**
		 *  @private
		 *  @param {!Element} element
		 *  @return {{width:!number,height:!number}}
		 */
        function GetElementSize(element) {
			var fixIECompatMode = document.attachEvent && document.documentMode && document.documentMode == IECompatMode;
            var rect = fixIECompatMode ? {width:element.clientWidth || element.scrollWidth, height:element.clientHeight || element.scrollHeight} : element.getBoundingClientRect();
            var width = rect.width ? rect.width : rect.right - rect.left;
            var height = rect.height ? rect.height : rect.bottom - rect.top;

            return { width: width, height: height };
        }

		/**
		 *  @private
		 */
        function HideBalloon() {
            if (!!m_balloon)
                m_balloon.style.visibility = 'hidden';
        }

		/**
		 *  @private
		 *  @param {!number} clientX
		 *  @param {!number} clientY
		 *  @param {number=} showDuring
		 */
        function ShowBalloonInternal(clientX, clientY, showDuring) {
			m_balloon = document.getElementById(m_balloonDivName);
            if (!m_balloon)
                m_balloon = CreateBalloon();

			if (m_balloon.style.visibility == 'visible')
				return;
				
            /** @type {!number} */var x = 0;
            /** @type {!number} */var y = 0;
            /** @type {{width:!number,height:!number}} */var balloonSize = GetElementSize(m_balloon);

            if (position == 1) {
                x = clientX;
                y = clientY - (balloonSize.height ? balloonSize.height : 20);
            }
            else if (position == 2) {
				/** @const @type {!number}*/var clientWidth = ns.GetPageWidth();
                /** @const @type {!number}*/var halfWidth = balloonSize.width / 2;

                if (halfWidth > clientX)
                    x = 0;
                else if (halfWidth + clientX > clientWidth)
                    x = clientWidth - balloonSize.width;
                else
                    x = clientX - halfWidth;

                y = (clientY + balloonSize.height > ns.GetPageHeight()) ? clientY - balloonSize.height : clientY;
            }
            else {
                x = clientX;
                y = clientY;
            }
			if (y < 0)
				y = 0;

				
			/** @struct @const */var scroll = ns.GetPageScroll();
			y += scroll.top;
			x += scroll.left;

            m_balloon.style.position = 'absolute';
            m_balloon.style.left = Math.round(x).toString() + 'px';
            m_balloon.style.top = Math.round(y).toString() + 'px';
            m_balloon.style.visibility = 'visible';
            ClearTimeoutInternal();
            m_timeout = setTimeout(function () { HideBalloon(); }, showDuring);
        }

		/**
		 *  @export
		 *  @param {!function():{x:number,y:number}} getCoord
		 *  @param {!number} showAfter
		 *  @param {number=} showDuring
		 */
        this.ShowBalloon = function (getCoord, showAfter, showDuring) {
            ClearTimeoutInternal();
            if (!showAfter) {
                /** @const */var coord = getCoord();
                ShowBalloonInternal(coord.x, coord.y, showDuring);
            }
            else {
                m_timeout = setTimeout(function () {
                    /** @const */var coord = getCoord();
                    if (coord.isNeed) {
                        ShowBalloonInternal(coord.x, coord.y, showDuring);
                    } else {
                        HideBalloon();
                    }
                }, showAfter);
            }
        }
    };
    return ns;
}) (KasperskyLab || {});

// need wrap anonymous function (head + hider + session + plugins + tail)
/** @suppress {duplicate} */var kaspersyLabSessionInstance = null;
(function (/** !Object */ ns) {
    var prefix = ns.PREFIX || "%PREFIX%";
    var signature = ns.SIGNATURE || "%SIGNATURE%";
	var workIdentifiersString = ns.WORK_IDENTIFIERS || "";
	var workIdentifiers = workIdentifiersString.split(",");

    (function (/** !string */ signature) {
        /**
         * @const
         * @type {string}
         */
        var pattern = signature.toLowerCase();

        for (var i = 0, scriptsCount = document.scripts.length; i < scriptsCount; ++i) {
            /** @type {!Element} */ var tag = document.scripts[i];
            if (typeof tag.src === 'string' && tag.src.length > 76 &&
                tag.src.toLowerCase().indexOf(pattern) > 0 &&
                /\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/main.js/.test(tag.src)) {
				for (var i = 0; i < workIdentifiers.length; ++i)
					window[workIdentifiers[i]] = true;
                tag.parentElement.removeChild(tag);
                return; // we MUST inject script tag BEFORE all others scripts
            }
        }
    })(signature);

    function IsDefined(variable)
	{
		return "undefined" !== typeof(variable);
	}

    /**
     * @type {{GetAsyncRequest : function():!Object, GetSyncRequest : function():!Object}}
     * @private
     */
    var ajaxRequest = (function () {
        /** @const @type {!Function}*/ var oldOpen = window.XMLHttpRequest && window.XMLHttpRequest.prototype.open;
        /** @const @type {!Function}*/ var oldSend = window.XMLHttpRequest && window.XMLHttpRequest.prototype.send;
		/** @const @type {!Function}*/ var oldXHR = window.XMLHttpRequest;
		/** @const @type {!Function}*/ var oldXDR = window.XDomainRequest;

        return {
            /** return {!Object} */
            GetAsyncRequest: function () {
                /** @struct */var xmlhttp = oldXDR ? new oldXDR() : new oldXHR();
                if (!oldXDR) {
                    xmlhttp.open = oldOpen;
                    xmlhttp.send = oldSend;
                }
				xmlhttp.onprogress = function () {};
                return xmlhttp;
            },
            /** return {!Object} */
            GetSyncRequest: function () {
                /** @struct */var xmlhttp = new oldXHR();
                xmlhttp.open = oldOpen;
                xmlhttp.send = oldSend;
				xmlhttp.onprogress = function () {};
                return xmlhttp;
            }
        };
    })();	
	
    /**
     *  @private
     *  @final
     *  @constructor
     *  @struct
     */
	var PingPongCallReceiver = function(caller)
	{
		/** @type{!Object} */ var m_caller = caller;
		/** @type{!boolean} */ var m_isProductConnected = false;
		/** @type{!boolean} */ var m_pingWaitResponse = false;
        /** @type{!number} */  var m_requestDelay = ns.MaxRequestDelay;
        /** @type{?number} */ var m_requestTimer = null;
		var m_callCallback = function(){};
		var m_errorCallback = function(){};
		var m_updateCallback = function(){};
		
        /**
         *  @private
         */
        function SendRequest() {
            try 
			{
				m_caller.Call(
					"from",
					/*commandAttribute*/null,
					/*data*/null,
					/*isAsync*/ true,
					function(result, parameters, method)
					{
						m_pingWaitResponse = false;
						m_isProductConnected = true;

						if (parameters === "undefined" || method === "undefined") 
						{
							m_errorCallback('AJAX pong is not received. Product is deactivated');
							return;
						}
						
						if (method)
						{
							setTimeout(function () { SendRequest(); }, 0);
							m_callCallback(method, parameters);
						}
					},
					function(error)
					{
						m_pingWaitResponse = false;
						m_isProductConnected = false;
						PostponeInit();
						m_errorCallback(error);
					});

				m_pingWaitResponse = true;
            }
            catch (e)
			{
                m_errorCallback('Ajax send ping exception: ' + (e.message || e));
            }
        }
		
		this.StartReceive = function(callCallback, errorCallback, updateCallback)
		{
			m_callCallback = callCallback;
			m_errorCallback = errorCallback;
			m_updateCallback = updateCallback;
	
			m_requestDelay = m_updateCallback();
			m_requestTimer = setTimeout(function ping()
				{
					try 
					{
						if (m_pingWaitResponse)
						{
							m_requestTimer = setTimeout(ping, 100);
							return;
						}
							
						m_requestDelay = m_updateCallback();

						SendRequest();
						m_requestTimer = setTimeout(ping, m_requestDelay);
					}
					catch (e)
					{
						m_errorCallback('Send ping request: ' + (e.message || e));
					}
				}, m_requestDelay);
		};
		this.StopReceive = function()
		{
			clearTimeout(m_requestTimer);
            m_requestTimer = null;
			m_callCallback = function(){};
			m_errorCallback = function(){};
			m_updateCallback = function(){};
		};
		this.IsStarted = function()
		{
			return m_requestTimer !== null;
		}
		this.IsProductConnected = function()
		{
			return m_isProductConnected;
		};
	};
	
    /**
     *  @private
     *  @final
     *  @constructor
     *  @struct
     */
	var AjaxCaller = function()
	{
		var m_path = prefix + signature;
		
		function NoCacheParameter() 
		{
			return "&nocache=" + Math.floor((1 + Math.random()) * 0x10000).toString(16);
		}

		function GetSpecialPlugins(predefined) 
		{
			return (predefined) ? "&plugins=" + encodeURIComponent(predefined) : "";    				
		}

		function PrepareRequestObject(command, commandAttribute, isPost, isAsync)
		{
			/** @struct */var request = isAsync ? ajaxRequest.GetAsyncRequest() : ajaxRequest.GetSyncRequest();
			if (request)
			{
				var urlPath = m_path + "/" + command;
				if (commandAttribute)
					urlPath += "/" + commandAttribute;

				if (isPost)
				{
					request.open("POST", urlPath);
				}
				else 
				{
					if (urlPath.indexOf("?") === -1)
						urlPath += "?get";
					urlPath += NoCacheParameter();
					request.open("GET", urlPath, isAsync);
				}
			}
			return request;
		}
		
        /**
         *  @private
         *  @param {!string} command
         *  @param {?string=} commandAttribute
         *  @param {?string=} data
         *  @param {?function(number=, Array<string>=)=} callbackResult
         *  @param {?function(string=)=} callbackError
         */
        function AsyncCall(command, commandAttribute, data, callbackResult, callbackError) {
            try {
                /** @struct */var request = PrepareRequestObject(command, commandAttribute, /*isPost*/data ? true : false, /*isAsync*/true);
                if (!request) 
				{
                    callbackError && callbackError("Cannot create AJAX request!");
					return;
                }

                /** type{?number} */
                var timeout = setTimeout(function () {
                    callbackError && callbackError("Cannot send AJAX request for calling " + command + "/" + commandAttribute);
                    request.abort();
                }, 120000);

                request.onerror = function () {
                    request.onerror = function () {
                    };
                    request.onload = function () {
                    };
                    callbackError && callbackError("AJAX request error for calling " + command + "/" + commandAttribute);
                };

                request.onload = function () {
                    clearTimeout(timeout);
                    timeout = null;
                    request.onload = function () {
                    };
                    request.onerror = function () {
                    };

                    if (request.responseText)
					{
						if (callbackResult)
							callbackResult(request.responseText);
                        request = null;
                        return;
                    }
                    request = null;

                    if (callbackError) {
                        callbackError("AJAX request with unsupported url type!"); // when unsupported url type (file://) status == 0
                    }
                };
                request.send(data);
                ns.Log("Call native function " + command + "/" + commandAttribute);
            }
            catch (e) {
                if (callbackError) {
                    callbackError("AJAX request " + command  + "/" + commandAttribute + " exception: " + (e.message || e));
                }
            }
        };

        /**
         *  @private
         *  @param {!string} command
         *  @param {string} data
         *  @param {?function(number=, Array<string>=)=} callbackResult
         *  @param {?function(string=)=} callbackError
         *  @return {!boolean}
         */
        function SyncCall(command, commandAttribute, data, callbackResult, callbackError) {
            try {
                /** @struct */var request = PrepareRequestObject(command, commandAttribute, /*isPost*/data ? true : false, /*isAsync*/false);
                if (!request)
				{
                    callbackError && callbackError("Cannot create AJAX request!");
                    return false;
                }

                ns.Log("SyncCall native function " + command);
                request.send(data);
                if (request.status === 200)
				{
                    if (callbackResult && request.responseText)
                        callbackResult(request.responseText);
                    request = null;
                    return true;
                }
            }
            catch (e) {
                if (callbackError)
                    callbackError("AJAX request " + command + " exception: " + (e.message || e));
            }
            return false;
        }
		
		this.Start = function(callbackSuccess/*, callbackError*/)
		{
			callbackSuccess();
		}
		
		this.SendLog = function(message)
		{
			AsyncCall("log?" + encodeURIComponent(message));
		}
		
		this.Call = function(command, commandAttribute, data, isAsync, callbackResult, callbackError) 
		{
			var callFunction = (isAsync || !IsDefined(isAsync)) ? AsyncCall : SyncCall;
			return callFunction(
				command,
				commandAttribute,
				data,
				function(responseText)
				{
					if (callbackResult)
					{
						var command = ns.JSONParse(responseText);
						callbackResult(command.result, command.parameters, command.method);
					}
				},
				callbackError);
		}
		
		this.InitCall = function(pluginsInitData, callbackResult, callbackError)
		{
			var specialPlugins = IsDefined(ns.PLUGINS_LIST) ? GetSpecialPlugins(ns.PLUGINS_LIST) : GetSpecialPlugins("%PLUGINS_LIST%");
			var serializedInitData = (pluginsInitData.length) ? "&data=" + encodeURIComponent(ns.JSONStringify({data : pluginsInitData})) : "";
		
			AsyncCall(
				"init?url=" + encodeURIComponent(document.location.href) + specialPlugins + serializedInitData,
				/*commandAttribute*/null,
				/*data*/null,
				function(responseText)
				{
					/** @struct @const
					 *  @type{{ajaxId:(string),sessionId:(string)}}
					 */
					var initSettings = ns.JSONParse(responseText);
					m_path = (prefix || '/') + initSettings.ajaxId + '/' + initSettings.sessionId;
					callbackResult(initSettings);
				},
				callbackError);
		}
	};


	var m_webSocketSupported = IsDefined(window.WebSocket);
    /**
     *  @private
     *  @final
     *  @constructor
     *  @struct
     */
	var WebSocketCaller = function()
	{
		var m_socket;
		var m_waitResponse = {};
		var m_callReceiver = function(){};
		var m_callReceiverEnabled = false;
		var m_connected = false;
		var m_initialized = false;
		var m_deferredCalls = [];
		
		function GetWebSocket(callbackSuccess, callbackError)
		{
			var url = (prefix === "/") ? document.location.href : prefix;
			var webSocketPath = (url.indexOf("http:") === 0) 
				? "ws" + url.substr(4) 
				: "wss" + url.substr(5);
			webSocketPath += signature + "/websocket?url=" + encodeURIComponent(document.location.href) + "&nocache=" + (new Date().getTime());

			var webSocket;
			try
			{
				webSocket = new WebSocket(webSocketPath);
			}
			catch (e)
			{
				m_webSocketSupported = false;
				throw e;
			}
			
			webSocket.onmessage = ProcessMessage;
			webSocket.onerror = function()
				{
					m_webSocketSupported = false;
					if (callbackError)
						callbackError();
				}
			webSocket.onopen = function()
				{
					m_connected = true;
					if (callbackSuccess)
						callbackSuccess();
				}
			webSocket.onclose = function()
				{
					m_connected = false;
				};
			
			return webSocket;
		}

		function ProcessMessage(arg)
		{
			var response = ns.JSONParse(arg.data);
			if (m_waitResponse[response.callId])
			{
				var callWaiter = m_waitResponse[response.callId];
				delete m_waitResponse[response.callId];
				clearTimeout(callWaiter.timeout);
				
				if (callWaiter.callbackResult)
					callWaiter.callbackResult(response.commandData);
				
				return;
			}

			if (!m_initialized)
			{
				m_deferredCalls.push(arg);
				return;
			}
			
			if (response.command === "from")
			{
				var command = ns.JSONParse(response.commandData);
				m_callReceiver(command.method, command.parameters);
			}
			else if (response.command === "reconnect")
			{
				m_socket.onmessage = function(){};
				m_socket.onerror = function(){};
				m_socket.onopen = function(){};
				m_socket.onclose = function(){};
				m_socket.close();

				m_socket = GetWebSocket(function()
					{
						CallImpl("restore", "", response.commandData);
					});
			}
		}
		
        /**
         *  @private
         *  @param {!string} command
         *  @param {?string=} commandAttribute
         *  @param {?string=} data
         *  @param {?Function=} callbackResult
         *  @param {?function(?string=)=} callbackError
         */
		function CallImpl(command, commandAttribute, data, callbackResult, callbackError)
		{
			try
			{
				var callId = 0;
				if (callbackResult || callbackError)
				{
					callId = Math.floor((1 + Math.random()) * 0x10000);
					var timeout = setTimeout(function()
						{
							delete m_waitResponse[callId];
							if (callbackError)
								callbackError("websocket call timeout for " + command  + "/" + commandAttribute);
						}, 120000);
					var callWaiter = 
						{
							callId: callId,
							callbackResult: callbackResult,
							timeout: timeout
						};
					m_waitResponse[callId] = callWaiter;
				}

				m_socket.send(ns.JSONStringify(
					{
						callId: callId,
						command: command,
						commandAttribute: commandAttribute || "",
						commandData: data || ""
					}));
			}
			catch (e)
			{
				if (callbackError)
					callbackError("websocket call " + command  + "/" + commandAttribute + " exception: " + (e.message || e));
			}
		}
		
		this.Start = function(callbackSuccess, callbackError)
		{
			try
			{
				m_socket = GetWebSocket(callbackSuccess, callbackError);
			}
			catch (e)
			{
				if (callbackError)
					callbackError("websocket start exception: " + (e.message || e));
			}
		}
		
		this.SendLog = function(message)
		{
			CallImpl("log", /*commandAttribute*/null, message);
		}

		this.Call = function(command, commandAttribute, data, isAsync, callbackResult, callbackError) 
		{
			if (IsDefined(isAsync) && !isAsync)
				return false;
			
			CallImpl(
				command, 
				commandAttribute, 
				data,
				callbackResult 
					? 	function(responseText)
						{
							if (callbackResult)
							{
								var command = ns.JSONParse(responseText);
								callbackResult(command.result, command.parameters, command.method);
							}
						}
					: null,
				callbackError);
		}

		this.InitCall = function(pluginsInitData, callbackResult, callbackError)
		{
			var initData = 
				{
					url: document.location.href,
					plugins: (IsDefined(ns.PLUGINS_LIST)) ? ns.PLUGINS_LIST : "%PLUGINS_LIST%",
					data: { data : pluginsInitData }
				};
			
			CallImpl("init", null, ns.JSONStringify(initData),
				function(responseText)
				{
					m_initialized = true;
					var initSettings = ns.JSONParse(responseText);
					callbackResult(initSettings);

					for (var i = 0; i < m_deferredCalls.length; ++i)
						ProcessMessage(m_deferredCalls[i]);
					m_deferredCalls = [];
				},
				callbackError);
		}

		this.StartReceive = function(callMethod)
		{
			m_callReceiverEnabled = true;
			m_callReceiver = callMethod;
		}

		this.StopReceive = function()
		{
			m_callReceiverEnabled = false;
			m_callReceiver = function(){};
			
			if (m_socket)
			{
				m_connected = false;
				m_socket.onmessage = function(){};
				m_socket.onerror = function(){};
				m_socket.onopen = function(){};
				m_socket.onclose = function(){};
				m_socket.close();
				m_socket = null;
			}
		}
		
		this.IsStarted = function()
		{
			return m_callReceiverEnabled;
		}
		
		this.IsProductConnected = function()
		{
			return m_connected;
		}
	}

	
    /**
     *  @private
     *  @final
     *  @constructor
     *  @struct
     *  @param {{SyncCall:(Function),Call:(Function),SendLog:(Function)}} caller
     */
    var CallReceiver = function (caller) {
        /** @type{Object<string,Object>} */ var m_plugins = {};
		/** @type{PingPongCallReceiver} */ var m_receiver = m_webSocketSupported ? caller : new PingPongCallReceiver(caller);
		/** @type{Object} */ var m_caller = caller;

        /**
         *  @private
         *  @param {!string} methodName
         *  @param {!Function} callback
         *  @throws {!string}
         */
        this.RegisterMethod = function (methodName, callback) {
            /** @const @type{?string} */var pluginId = GetPluginIdFromMethodName(methodName);
            if (pluginId) {
                /** @type {Object<string,Function>} */var methods = GetPluginMethods(pluginId);
                if (methods) {
                    if (methods[methodName]) {
                        throw 'Already registered method ' + methodName;
                    }
                    methods[methodName] = callback;
                }
                else {
                    throw 'Cannot registered ' + methodName;
                }
            }
        };

        /**
         *  @private
         *  @param {!string} pluginId
         *  @param {null|undefined|function(number):number} callbackPing
         *  @param {null|undefined|function((number|string|null))} callbackError
         *  @throws {!string}
         */
        this.RegisterPlugin = function (pluginId, callbackPing, callbackError) {
            if (m_plugins[pluginId]) {
                throw 'Already started plugin ' + pluginId;
            }

            /** @struct */
            var plugin = {
                onError: callbackError,
                onPing: callbackPing,
                methods: {}
            };

            m_plugins[pluginId] = plugin;

			if (!m_receiver.IsStarted())
				m_receiver.StartReceive(CallMethod, ReportError, UpdateDelay);
        };

        /**
         *  @private
         *  @param {!string} pluginId
         */
        this.UnregisterPlugin = function (pluginId) {
			delete m_plugins[pluginId];

			if (IsPluginListEmpty())
				m_receiver.StopReceive();
        };

        /**
         *  @private
         */
        this.UnregisterAll = function () {
            if (m_plugins.length === 0)
                return;
            m_receiver.StopReceive();
            m_plugins = {};
        };

        /**
         *  @package
         *  @return {!boolean}
         */
        this.IsEmpty = IsPluginListEmpty;

        /**
         *  @private
         *  @return {!boolean}
         */
        function IsPluginListEmpty() {
            for (/** @type{!string} @const*/var key in m_plugins) {
                if (m_plugins.hasOwnProperty(key))
                    return false;
            }
            return true;
        }
		
		/**
		 *	@return {!boolean}
		 */
		this.IsProductConnected = function()
		{
			return m_receiver.IsProductConnected();
		}

        /**
         *  @private
         */
        function UpdateDelay() {
            /** @type {!number} */var newDelay = ns.MaxRequestDelay;
            /** @const @type {!number} */var currentTime = ns.GetCurrentTime();

            for (/** @type{!string} @const*/var pluginId in m_plugins) {
                try {
                    /**@type {function(number):number}*/var onPing = m_plugins[pluginId].onPing;
                    if (onPing) {
                        /**@const @type{!number}*/var delay = onPing(currentTime);
                        if (delay < newDelay && delay > 0 && delay < ns.MaxRequestDelay) {
                            newDelay = delay;
                        }
                    }
                }
                catch (e) {
                    ReportPluginError(pluginId, 'UpdateDelay: ' + (e.message || e));
                }
            }

            return newDelay;
        }

        /**
         *  @private
         *  @param {!string} pluginId
         *  @param {(string|number|null)} status
         */
        function ReportPluginError(pluginId, status) {
            /** @const @type{function((string|number|null))}*/var onError = m_plugins[pluginId].onError;
            if (onError)
                onError(status);
        }

        /**
         *  @private
         *  @param {(string|number|null)} status
         */
        function ReportError(status) {
            for (var pluginId in m_plugins)
                ReportPluginError(pluginId, status);
        }

        /**
         *  @private
         *  @param {?string} methodName
         *  @return {(string|null)}
         */
        function GetPluginIdFromMethodName(methodName) {
            if (methodName) {
                /** @const @type{Array<!string>}*/var names = methodName.split('.', 2);
                if (names.length === 2) {
                    return names[0];
                }
            }
            return null;
        }

        /**
         *  @private
         *  @param {!string} pluginId
         *  @return {Object<string,Function>}
         */
        function GetPluginMethods(pluginId) {
            /** @const @struct*/var plugin = m_plugins[pluginId];
            return plugin ? plugin.methods : null;
        }

        /**
         *  @private
         *  @param {!string} pluginId
         *  @param {!string} methodName
         *  @param {Array<string>} args
         *  @return {!boolean}
         */
        function CallPluginMethod(pluginId, methodName, args) {
            /** @const @dict*/var methods = GetPluginMethods(pluginId);
            if (methods) {
                /** @const @type{Function}*/var callback = methods[methodName];
                if (callback) {
                    try {
                        callback(args);
						m_caller.SendLog(methodName + " executed.");
                        return true;
                    }
                    catch (e) {
						m_caller.SendLog("Call " + methodName + " in plugin " + pluginId + " error: " + (e.message || e));
                    }
                }
            }
            m_caller.SendLog("Cannot call " + methodName + " for plugin " + pluginId);
            return false;
        }
		
		function CallMethod(methodName, args)
		{
			ns.Log("Try to find js callback " + methodName);
			/** @const @type{?string}*/var pluginId = GetPluginIdFromMethodName(methodName);
			if (pluginId)
				CallPluginMethod(pluginId, methodName, args);
		}
    };

    /**
     *  @private
     *  @final
     *  @constructor
     *  @struct
     *  @param {{SyncCall:(Function),Call:(Function),SendLog:(Function)}} caller
     */
    var KasperskyLabSessionClass = function (caller) {
        /** @const @struct*/var self = this;
		var m_caller = caller;
        /** @const @type{!CallReceiver}*/var m_callReceiver = new CallReceiver(caller);

		function CallImpl(methodName, arrayOfArgs, callbackResult, callbackError, isAsync) {
			var data = (arrayOfArgs && arrayOfArgs.length) 
				? ns.JSONStringify(
					{
						result: 0,
						method: methodName,
						parameters: arrayOfArgs
					})
				: null;
				
			return m_caller.Call("to", methodName, data, isAsync, callbackResult, callbackError);
		}

        /**
         *  @private
         *  @param {!string} methodName
         *  @param {Array<string>} arrayOfArgs
         *  @param {?function(number=, Array<string>=)} callbackResult
         *  @param {?function(string=)} callbackError
         */
        function Call(methodName, arrayOfArgs, callbackResult, callbackError) {
			CallImpl(methodName, arrayOfArgs, callbackResult, callbackError, /*isAsync*/true);
        }

        /**
         *  @private
         *  @param {!string} methodName
         *  @param {Array<string>} arrayOfArgs
         *  @param {?function(number=, Array<string>=)=} callbackResult
         *  @param {?function(string=)=} callbackError
         *  @return {!boolean}
         */
        function SyncCall(methodName, arrayOfArgs, callbackResult, callbackError) {
			return CallImpl(methodName, arrayOfArgs, callbackResult, callbackError, /*isAsync*/false);
        }

        /**
         *  @private
         */
        function Stop() {
            try {
                m_callReceiver.UnregisterAll();
                ns.Log("session stopped");
			    
				if (m_callReceiver.IsProductConnected())
				{
					if (!m_caller.Call("shutdown", null, null, false))
						m_caller.Call("shutdown");
				}
            }
            catch (e) {
            }
        }

        /**
         *  @private
         *  @param {!string} pluginId
         */
        function DeactivatePlugin(pluginId) {
            ns.Log('DeactivatePlugin ' + pluginId);
            m_callReceiver.UnregisterPlugin(pluginId);
            if (m_callReceiver.IsEmpty()) {
                Stop();
            }
        }

        /**
         *  @private
         *  @param {!string} pluginId
         *  @param {null|undefined|function(number):number} callbackPing
         *  @param {null|undefined|function((number|string|null))} callbackError
         */
        function ActivatePlugin(pluginId, callbackPing, callbackError) {
            ns.Log('ActivatePlugin ' + pluginId);

            m_callReceiver.RegisterPlugin(pluginId, callbackPing, function (e) {
                callbackError && callbackError(e);
                m_callReceiver.UnregisterPlugin(pluginId);
                if (m_callReceiver.IsEmpty()) {
                    Stop();
                }
            });
        }

        /**
         *  @private
         *  @param {!string} methodName
         *  @param {!Function} callback
         */
        function RegisterMethod(methodName, callback) {
            ns.Log('RegisterMethod ' + methodName);
            m_callReceiver.RegisterMethod(methodName, callback);
        }

        /**
         *  @export
         *  @param {!string} msg
         */
        this.Log = function (msg) {            
            msg && msg.length <= 2048 ? m_caller.SendLog(msg) : m_caller.SendLog(msg.substring(0, 2048) + '<...>');
        };

        /**
         *  @export
         *  @param {!function(Function=, Function=, Function=, Function=, Function=)} init
         */
        this.InitializePlugin = function (init) {
            init(
                function () {
                    ActivatePlugin.apply(self, arguments);
                },
                function () {
                    RegisterMethod.apply(self, arguments);
                },
                function () {
                    Call.apply(self, arguments);
                },
                function () {
                    DeactivatePlugin.apply(self, arguments);
                },
                function () {
                    return SyncCall.apply(self, arguments);
                }
            );
        };
		
		ns.AddEventListener(window, "unload", function() 
			{
				if (!m_callReceiver.IsEmpty())
					Stop();
			});
    };

	var runners = {};
	var pluginsInitData = [];
	ns.AddRunner = function(pluginName, runnerFunc, initParameters)
	{
		runners[pluginName] = runnerFunc;
		if (initParameters)
		{
			pluginsInitData.push({plugin: pluginName, parameters: initParameters});
		}
	};
	
	ns.ContentSecurityPolicyNonceAttribute = signature;
	
	function GetSupportedCaller()
	{
		return m_webSocketSupported 
			? new WebSocketCaller()
			: new AjaxCaller;
	}

	function Init()
	{
		var caller = GetSupportedCaller();
		caller.Start(
			function() /*success callback*/
			{
				caller.InitCall(
					pluginsInitData,
					function(initSettings)
					{
						kaspersyLabSessionInstance = new KasperskyLabSessionClass(caller);
						var plugins = initSettings.plugins;
						for (var i = 0, pluginsCount = plugins.length; i < pluginsCount; ++i)
						{
							/**
							 *  @struct @const
							 *  @type{{name:(string),settings:(string),localization:(string)}}
							 */
							var plugin = plugins[i];
							var pluginRunnerFunction = runners[plugin.name];
							if (pluginRunnerFunction)
								pluginRunnerFunction(KasperskyLab, kaspersyLabSessionInstance, plugin.settings, plugin.localization);
						}
					},
					function()
					{
						PostponeInit();
					});
			},
			function() /*error callback*/
			{
				setTimeout(function () { Init(); }, 0);
			});
	}
	
	var postponedInitTimeout = null;
	function PostponeInit()
	{
		clearTimeout(postponedInitTimeout)
		postponedInitTimeout = setTimeout(function () { Init(); }, 60 * 1000);
	}
	
	setTimeout(function () { Init(); }, 0);	
})(KasperskyLab);
(function (ns) 
{

ns.waitForApiInjection = function(isApiInjected, eventName, callback)
{
    if (isApiInjected())
    {
        callback();
        return;
    }

    var subscription = createSubscription(eventName, onApiInjected)

    function onApiInjected()
    {
        if (isApiInjected())
        {
            subscription.unsubscribe();
            callback();
        }
    }
}

function createSubscription(eventName, callback)
{
    var windowEventsSupported = document.createEvent || window.addEventListener;
    return new (windowEventsSupported ? ModernSubscription : IeLegacySubscription)(eventName, callback);
}

function ModernSubscription(eventName, callback)
{
    ns.AddRemovableEventListener(window, eventName, callback);

    this.unsubscribe = function()
    {
        ns.RemoveEventListener(window, eventName, callback);
    }
}

function IeLegacySubscription(eventName, callback)
{
    ns.AddRemovableEventListener(document.documentElement, 'propertychange', onPropertyChange);

    this.unsubscribe = function()
    {
        ns.RemoveEventListener(document.documentElement, 'propertychange', onPropertyChange);
    }

    function onPropertyChange(event)
    {
        if (event.propertyName == eventName)
            callback();
    }
}

})(KasperskyLab || {});
KasperskyLab.AddRunner("light_popup", function (ns, session)
{

var ApiInjectionEventName = ns.LIGHT_PLUGIN_API_KEY || '%LIGHT_PLUGIN_API_KEY%';
var popupView = null;

function initialize()
{
    session.InitializePlugin(onPluginInitialized);
}

function onPluginInitialized(activatePlugin, registerMethod, callProduct)
{
    activatePlugin('light_popup', onPing);
    registerMethod('light_popup.onPopupDataChange', onViewDataChange);

    ns.waitForApiInjection(isLightPluginApiInjected, ApiInjectionEventName, function()
    {
        onLightPluginApiInjected(callProduct)
    });
}

function isLightPluginApiInjected()
{
    return !!window.plugin;
}

function onLightPluginApiInjected(callProduct)
{
    popupView = light_plugin.popup.createView(createRequiredServices(callProduct));
    callProduct("light_popup.connect", [ window.plugin.getTabId() ], function(result, args)
    {
        onConnectedWithProduct(result, args)
    });
}

function onConnectedWithProduct(result, args)
{
    if (result != 0)
        return;
    onViewDataChange(args || []);
}

function onPing()
{
    return ns.MaxRequestDelay;
}

function onViewDataChange(args)
{
    if (!popupView) return;

    var viewData = {};
    for (var i = 0; i < args.length - 1; i += 2)
        viewData[args[i]] = ns.JSONParse(args[i + 1]);
    popupView.update(viewData);
}

function createRequiredServices(callProduct)
{
    return {
        localizationLoader: new LocalizationLoader(callProduct),
        popupWindow: new PopupWindow(),
        controller: new Controller(callProduct)
    };
}

function LocalizationLoader(callProduct)
{
    this.callProduct = callProduct;
}

LocalizationLoader.prototype.loadStrings = function(ids, callback)
{
    this.callProduct("light_popup.loadLocalizedStrings", ids,
        function(result, args) {
            if (result != 0 || args.length != ids.length) return;
            var strings = {};
            for (var i = 0; i < ids.length; i++)
                strings[ids[i]] = args[i];
            callback(function(id) { return strings[id] });
        }
    );
};

function PopupWindow() {}

PopupWindow.prototype.resizeToFitContent = function()
{
    var box = document.body.getBoundingClientRect();
    window.plugin.setPopupSize({
        width: box.right - box.left,
        height: box.bottom - box.top
    });
};

PopupWindow.prototype.close = function()
{
    window.plugin.closePopup();
};

function Controller(callProduct)
{
    this.callProduct = callProduct;
}

Controller.prototype.openWebPageInNewTab = function(url)
{
    window.plugin.openWebPage(url);
};

Controller.prototype.reloadActiveTab = function()
{
    window.plugin.reloadActiveTab();
};

Controller.prototype.sendCommand = function(areaId, commandId, args, onCompleted_)
{
    var onCompleted = onCompleted_ || function(){};
    this.callProduct("light_popup.command",
        [areaId, commandId].concat(args || []),
        function(result, args) { onCompleted(result != 0) },
        function(error) { onCompleted(error) }
    );
};

initialize();

});
