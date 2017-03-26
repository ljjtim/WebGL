var helpers;
(function (helpers) {
    function addEventListener(target, event, listener) {
        if (target.addEventListener)
            target.addEventListener(event, listener, false);
        else
            target.attachEvent('on' + event, listener);
    }
    helpers.addEventListener = addEventListener;
    function removeEventListener(target, event, listener) {
        if (target.removeEventListener)
            target.removeEventListener(event, listener, false);
        else
            target.detachEvent('on' + event, listener);
    }
    helpers.removeEventListener = removeEventListener;
    function filter(array, pred) {
        var filtered = [];
        for (var _i = 0; _i < array.length; _i++) {
            var value = array[_i];
            if (pred(value))
                filtered.push(value);
        }
        return filtered;
    }
    helpers.filter = filter;
    var Elements = (function () {
        function Elements(elements) {
            if (elements === void 0) { elements = []; }
            for (var _i = 0; _i < elements.length; _i++) {
                var element = elements[_i];
                if (!element)
                    throw new Error('Invalid element detected');
            }
            this.elements = elements;
        }
        Elements.query = function (query) {
            return new Elements(Elements._elements(document.querySelectorAll(query)));
        };
        Elements.from = function () {
            var elements = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                elements[_i - 0] = arguments[_i];
            }
            return new Elements(elements);
        };
        Elements.prototype.at = function (index) {
            return new Elements([this.elements[index || 0]]);
        };
        Elements.prototype.concat = function (other) {
            return new Elements(this.elements.concat(other.elements));
        };
        Elements.prototype.first = function () { return this.elements.length > 1 ? this.at(0) : this; };
        Elements.prototype.last = function () {
            var length = this.elements.length;
            return length > 1 ? this.at(length - 1) : this;
        };
        Elements.prototype.filter = function (pred) {
            return this.flatMap(function (element, i) { return pred(element, i) ? [element] : []; });
        };
        Elements.prototype.query = function (query) {
            return this.flatMap(function (element) { return Elements._elements(element.querySelectorAll(query)); });
        };
        Elements.prototype.childs = function () {
            return this.flatMap(function (element) { return Elements._elements(element.childNodes); });
        };
        Elements.prototype.setAttr = function (name, value) {
            return this.forEach(function (element) { return element.setAttribute(name, value); });
        };
        Elements.prototype.setText = function (value) {
            return this.forEach(function (element) {
                if (typeof element.textContent !== 'undefined')
                    element.textContent = value;
                else
                    element.innerText = value;
            });
        };
        Elements.prototype.setValue = function (value) { return this.forEach(function (element) { return element.value = value; }); };
        Elements.prototype.setClass = function (name) { return this.forEach(function (element) { return element.className = name; }); };
        Elements.prototype.addClass = function (name) { return this.forEach(function (element) { return addClass(element, name); }); };
        Elements.prototype.removeClass = function (name) { return this.forEach(function (element) { return removeClass(element, name); }); };
        Elements.prototype.show = function () { return this.forEach(function (element) { return element.style.display = "block"; }); };
        Elements.prototype.hide = function () { return this.forEach(function (element) { return element.style.display = "none"; }); };
        Elements.prototype.addEventListener = function (event, listener) { return this.forEach(function (element) { return addEventListener(element, event, listener); }); };
        Elements.prototype.removeEventListener = function (event, listener) { return this.forEach(function (element) { return removeEventListener(element, event, listener); }); };
        Elements.prototype.removeInnerContent = function () {
            return this.forEach(function (element) {
                while (element.lastChild)
                    element.removeChild(element.lastChild);
            }).setText('');
        };
        Elements.prototype.appendChilds = function () {
            var childs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                childs[_i - 0] = arguments[_i];
            }
            return this.forEach(function (element) {
                for (var _i = 0; _i < childs.length; _i++) {
                    var child = childs[_i];
                    child.forEach(function (e) { return element.appendChild(e); });
                }
            });
        };
        Elements.prototype.forEach = function (f) {
            for (var i = 0; i < this.elements.length; i++)
                f(this.elements[i], i);
            return this;
        };
        Elements.prototype.flatMap = function (f) {
            var elements = [];
            this.forEach(function (element, i) { return elements = elements.concat(f(element, i)); });
            return new Elements(elements);
        };
        Elements._elements = function (nodes) {
            var elements = [];
            var ElementNode = 1;
            for (var i = 0; i < nodes.length; i++)
                if (nodes[i].nodeType == ElementNode)
                    elements.push(nodes[i]);
            return elements;
        };
        return Elements;
    })();
    helpers.Elements = Elements;
    function hasClass(element, className) {
        return !!element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
    }
    function addClass(element, className) {
        if (!hasClass(element, className))
            element.className += " " + className;
    }
    function removeClass(element, className) {
        if (hasClass(element, className)) {
            var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
            element.className = element.className.replace(reg, ' ');
        }
    }
    function show(element) {
        element.style.display = "block";
    }
    function hide(element) {
        element.style.display = "none";
    }
})(helpers || (helpers = {}));
var $ = helpers.Elements;
var l10n = null;
var light_plugin;
(function (light_plugin) {
    var popup;
    (function (popup) {
        var LocalizedStringsIds = [
            'PopupLeftToRight',
            'PopupVirtualKeyBoard',
            'PopupBlockEnabled',
            'PopupBlockDisabled',
            'PopupSiteBlockEnable',
            'PopupSiteBlockingDisabled',
            'PopupSiteBlockDisable',
            'PopupDoNotTrackTitle',
            'PopupQueriesFound',
            'PopupServiceCategory_SocialNetworks',
            'PopupServiceCategory_WebAnalytics',
            'PopupServiceCategory_AdAgency',
            'PopupServiceCategory_WebBugs',
            'PopupBlockingOn',
            'PopupBlockingOff',
            'PopupBlockingOffByUser',
            'PopupPartiallyBlocked',
            'PopupBlockingImpossible',
            'PopupBlockingOffAsIncompatible',
            'PopupBlockingOffAsPartner',
            'PopupFeatureDescription',
            'PopupBlockFailed',
            'PopupReportsLink',
            'PopupTurnOn',
            'PopupKnowledgeBaseUrl'
        ];
        function initializeLocalization(loader, callback) {
            if ("__inline_l10n__" === "true")
                return callback();
            loader.loadStrings(LocalizedStringsIds, function (l10n_) {
                l10n = l10n_;
                callback();
            });
        }
        popup.initializeLocalization = initializeLocalization;
    })(popup = light_plugin.popup || (light_plugin.popup = {}));
})(light_plugin || (light_plugin = {}));
var light_plugin;
(function (light_plugin) {
    var popup;
    (function (popup) {
        popup.createView = function (services) { return new View(services); };
        var Areas = (function () {
            function Areas() {
            }
            Areas.register = function (id, areaConstructor) {
                Areas.constructors[id] = areaConstructor;
            };
            Areas.get = function (id) {
                return Areas.constructors[id];
            };
            Areas.constructors = {};
            return Areas;
        })();
        popup.Areas = Areas;
        var View = (function () {
            function View(services) {
                var _this = this;
                this.services = services;
                this.viewData = {};
                this.initialized = false;
                this.areas = {};
                popup.initializeLocalization(services.localizationLoader, function () { return _this.onLocalizationReady(); });
            }
            View.prototype.update = function (viewData) {
                this.viewData = viewData;
                if (this.initialized) {
                    this.updateAreas();
                    this.services.popupWindow.resizeToFitContent();
                }
            };
            View.prototype.onLocalizationReady = function () {
                var _this = this;
                waitForWindowLoad(function () {
                    setTextReadingDirection();
                    _this.onLoad();
                });
            };
            View.prototype.onLoad = function () {
                this.initialized = true;
                this.update(this.viewData);
            };
            View.prototype.updateAreas = function () {
                var _this = this;
                forEachProperty(this.viewData, function (id) {
                    _this.updateArea(id, _this.viewData[id]);
                });
            };
            View.prototype.updateArea = function (id, areaData) {
                if (areaData.areaDisabled)
                    return;
                var area = this.areas[id] = this.areas[id] || new (Areas.get(id))(this.services);
                area.update(areaData);
            };
            return View;
        })();
        function waitForWindowLoad(callback) {
            if (document.readyState === 'complete')
                callback();
            else
                helpers.addEventListener(window, 'load', callback);
        }
        function setTextReadingDirection() {
            if (l10n('PopupLeftToRight') != '1')
                $.query('html').addClass("rtl");
        }
        function forEachProperty(object, callback) {
            for (var name in object)
                if (object.hasOwnProperty(name))
                    callback(name);
        }
    })(popup = light_plugin.popup || (light_plugin.popup = {}));
})(light_plugin || (light_plugin = {}));
var light_plugin;
(function (light_plugin) {
    var popup;
    (function (popup) {
        var vk;
        (function (vk) {
            var AreaId = 'vk';
            var Area = (function () {
                function Area(services) {
                    var _this = this;
                    this.services = services;
                    $.query(".component__header").at(0).setText(l10n('PopupVirtualKeyBoard'));
                    $.query('#vkbd').addEventListener('click', function () { return _this.onVirtualKeyboardButtonClick(); });
                    $.query('.area#vk').show();
                }
                Area.prototype.update = function (areaData) { };
                Area.prototype.onVirtualKeyboardButtonClick = function () {
                    var _this = this;
                    this.services.controller.sendCommand(AreaId, 'ShowVirtualKeyboard', [], function () {
                        return _this.services.popupWindow.close();
                    });
                };
                return Area;
            })();
            light_plugin.popup.Areas.register(AreaId, Area);
        })(vk = popup.vk || (popup.vk = {}));
    })(popup = light_plugin.popup || (light_plugin.popup = {}));
})(light_plugin || (light_plugin = {}));
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var light_plugin;
(function (light_plugin) {
    var popup;
    (function (popup) {
        var dnt;
        (function (dnt) {
            var BlockingSlider = '.query-blocker__switch';
            var NotificationBlock = '#notification';
            var StatusBlock = '#blocker';
            var BlockButton = "#blockButton";
            var EnableDntTaskButton = "#enableDNT";
            var ReportsLink = "#reports a";
            var SiteBlockingDisabledLabel = "#SiteBlockingDisabled";
            var AreaId = 'dnt';
            var Area = (function () {
                function Area(services) {
                    this.services = services;
                    this.areaData = null;
                    this.categories = [
                        new SocialNetworksCategory(),
                        new WebAnalyticsCategory(),
                        new AdAgenciesCategory(),
                        new WebBugsCategory()
                    ];
                    this.localizeUi();
                    this.setEventListeners();
                    $.query('.area#dnt').show();
                }
                Area.prototype.update = function (areaData) {
                    this.areaData = areaData;
                    if (this.areaData.taskEnabled)
                        this.updateEnabledDntArea();
                    else
                        this.updateDisabledDntArea();
                };
                Area.prototype.localizeUi = function () {
                    $.query(".component__header").at(1).setText(l10n('PopupDoNotTrackTitle'));
                };
                Area.prototype.setEventListeners = function () {
                    var _this = this;
                    $.query(BlockingSlider).addEventListener('click', function () { return _this.onToggleBlocking(); });
                    $.query(NotificationBlock).addEventListener('click', function () { return _this.onToggleBlocking(); });
                    $.query(EnableDntTaskButton).addEventListener('click', function () { return _this.onEnableDntTask(); });
                    $.query(ReportsLink).addEventListener('click', function () { return _this.onReportsClick(); });
                    $.query(BlockButton).addEventListener('click', function () { return _this.onBlockThisSiteButtonClick(); });
                    $.query('#settings').addEventListener('click', function () { return _this.onSettingsClick(); });
                    $.query('#settings2').addEventListener('click', function () { return _this.onSettingsClick(); });
                    $.query('#help').addEventListener('click', function () { return _this.onHelpClick(); });
                    for (var _i = 0, _a = this.categories; _i < _a.length; _i++) {
                        var c = _a[_i];
                        c.setToggleListener(function (category) { return _this.onCategoryClick(category); });
                    }
                };
                Area.prototype.onCategoryClick = function (category) {
                    var otherCategories = helpers.filter(this.categories, function (c) { return c !== category; });
                    for (var _i = 0; _i < otherCategories.length; _i++) {
                        var c = otherCategories[_i];
                        c.collapse();
                    }
                    category.toggle();
                    this.services.popupWindow.resizeToFitContent();
                };
                Area.prototype.onReportsClick = function () {
                    var _this = this;
                    this.sendCommand('OpenDntReportsUi', [], function () {
                        return _this.services.popupWindow.close();
                    });
                };
                Area.prototype.onSettingsClick = function () {
                    var _this = this;
                    this.sendCommand('OpenDntSettingsUi', [], function () {
                        return _this.services.popupWindow.close();
                    });
                };
                Area.prototype.onHelpClick = function () {
                    var _this = this;
                    this.services.controller.openWebPageInNewTab(l10n('PopupKnowledgeBaseUrl'));
                    setTimeout(function () { return _this.services.popupWindow.close(); }, 400);
                };
                Area.prototype.onEnableDntTask = function () {
                    var _this = this;
                    this.updateEnabledDntArea();
                    this.services.popupWindow.resizeToFitContent();
                    callAsync(function () { return _this.sendCommand('EnableDntTask', ['true']); });
                };
                ;
                Area.prototype.onToggleBlocking = function () {
                    var _this = this;
                    var enable = !this.areaData.blockingEnabled;
                    updateBlockButtonAndSwitch(enable);
                    this.services.popupWindow.resizeToFitContent();
                    callAsync(function () {
                        _this.sendCommand('EnableDntBlocking', [String(enable)], function (error) {
                            if (!error)
                                _this.services.controller.reloadActiveTab();
                        });
                    });
                };
                Area.prototype.onBlockThisSiteButtonClick = function () {
                    var _this = this;
                    var enableThisSiteBlocking = false;
                    switch (this.areaData.thisSiteBlockingStatus) {
                        case 0:
                            $.query(BlockButton).setText(l10n('PopupSiteBlockDisable'));
                            updateControlsOnSiteBlockingEnabled(this.areaData.blockingEnabled);
                            enableThisSiteBlocking = false;
                            break;
                        case 1:
                            $.query(BlockButton).setText(l10n('PopupSiteBlockEnable'));
                            updateControlsOnSiteBlockingDisabled();
                            enableThisSiteBlocking = true;
                            break;
                        default:
                            return;
                    }
                    this.services.popupWindow.resizeToFitContent();
                    callAsync(function () { return _this.sendCommand('EnableDntBlockingOnSite', [String(enableThisSiteBlocking)], function (error) {
                        if (!error)
                            _this.services.controller.reloadActiveTab();
                    }); });
                };
                Area.prototype.sendCommand = function (commandId, args, onDone) {
                    this.services.controller.sendCommand(AreaId, commandId, args, onDone);
                };
                Area.prototype.updateDisabledDntArea = function () {
                    $.query("#contentForEnabledTask").hide();
                    $.query("#contentForDisabledTask").show();
                    $.query('#settings2 .component__text').first().hide();
                    $.query('#settings2 + .separator').first().hide();
                    $.query("#featureDescription").setText(l10n('PopupFeatureDescription'));
                    $.query(EnableDntTaskButton).setValue(l10n('PopupTurnOn'));
                };
                Area.prototype.updateEnabledDntArea = function () {
                    $.query("#contentForEnabledTask").show();
                    $.query("#contentForDisabledTask").hide();
                    updateBlockButtonAndSwitch(this.areaData.blockingEnabled);
                    $.query("#reports span").setText(l10n('PopupBlockFailed'));
                    $.query(ReportsLink).setText(l10n('PopupReportsLink'));
                    if (this.areaData.blockingFailed)
                        $.query("#reports").show();
                    else
                        $.query("#reports").hide();
                    $.query("#blockOnThisSiteDisabled h2").setText(l10n('PopupBlockingImpossible'));
                    var blockText = $.query("#blockOnThisSiteDisabled p");
                    switch (this.areaData.thisSiteBlockingStatus) {
                        case 0:
                        case 1:
                            blockText.removeInnerContent();
                            break;
                        case 2:
                            blockText.setText(l10n('PopupBlockingOffAsIncompatible'));
                            break;
                        case 3:
                            blockText.setText(l10n('PopupBlockingOffAsPartner'));
                            break;
                    }
                    $.query(SiteBlockingDisabledLabel).setText(l10n('PopupSiteBlockingDisabled'));
                    updateControlsOnSiteBlockingStatusChange(this.areaData.blockingEnabled, this.areaData.thisSiteBlockingStatus);
                    this.updateCategories();
                    this.updateTotalDetectionsCount(this.areaData.detections || []);
                };
                Area.prototype.updateCategories = function () {
                    for (var _i = 0, _a = this.categories; _i < _a.length; _i++) {
                        var category = _a[_i];
                        category.update(this.areaData);
                    }
                };
                Area.prototype.updateTotalDetectionsCount = function (detections) {
                    var _a = detections.length > 0 ?
                        [l10n('PopupQueriesFound'), String(getTotalDetectionsCount(detections))] :
                        ['', ''], label = _a[0], counter = _a[1];
                    $.query("#queriesFound").setText(label);
                    $.query("#overall").setText(counter);
                };
                return Area;
            })();
            light_plugin.popup.Areas.register(AreaId, Area);
            var Category = (function () {
                function Category(id, selector, icon, title) {
                    var _this = this;
                    this.id = id;
                    this.selector = selector;
                    this.icon = icon;
                    this.element = $.query(this.selector);
                    this.toggleListener = function (category) { };
                    this.expanded = false;
                    this.detections = [];
                    this.totalDetectionsCount = 0;
                    this.element.query('.category-status__header').setText(title);
                    this.element.addEventListener('click', function (event) {
                        cancelEvent(event || window.event);
                        _this.toggleListener(_this);
                    });
                    this.element.query(".subcategory").addEventListener('click', function (event) {
                        cancelEvent(event || window.event);
                    });
                }
                Category.prototype.setToggleListener = function (listener) {
                    this.toggleListener = listener;
                };
                Category.prototype.collapse = function () {
                    this.element.query(".subcategory").removeClass("visible");
                    this.element.query(".subcategory-wrapper").removeClass("visible");
                    this.element.query(".category-quantity__toggler")
                        .removeClass("category-quantity__toggler_unfolded")
                        .addClass("category-quantity__toggler_folded");
                    this.expanded = false;
                };
                Category.prototype.expand = function () {
                    this.element.query(".subcategory").addClass("visible");
                    this.element.query(".subcategory-wrapper").addClass("visible");
                    this.element.query(".category-quantity__toggler")
                        .removeClass("category-quantity__toggler_folded")
                        .addClass("category-quantity__toggler_unfolded");
                    this.expanded = true;
                };
                Category.prototype.toggle = function () {
                    if (this.empty())
                        return;
                    if (this.expanded)
                        this.collapse();
                    else
                        this.expand();
                };
                Category.prototype.update = function (dntData) {
                    var _this = this;
                    var wasEmpty = this.empty();
                    this.detections = helpers.filter(dntData.detections || [], function (d) { return d.category === _this.id; });
                    this.detections.sort(function (a, b) { return a.trackerName.localeCompare(b.trackerName); });
                    this.totalDetectionsCount = getTotalDetectionsCount(this.detections);
                    if (!wasEmpty && this.empty())
                        this.collapse();
                    this.updateDetections(dntData);
                    this.updateStyles();
                    this.updateBlockingMode(dntData);
                };
                Category.prototype.getBlockingMode = function (dntData) {
                    return 0;
                };
                Category.prototype.isTrackerBlockingEnabled = function (dntData, detection) {
                    return this.getBlockingMode(dntData) !== 0;
                };
                Category.prototype.updateDetections = function (dntData) {
                    var listItems = new helpers.Elements();
                    for (var _i = 0, _a = this.detections; _i < _a.length; _i++) {
                        var detection = _a[_i];
                        listItems = listItems.concat(this.renderDetection(dntData, detection));
                    }
                    listItems.last().addClass("subcategory-item_last");
                    this.element.query('.subcategory')
                        .removeInnerContent()
                        .appendChilds(listItems);
                    this.element.query('.category-quantity__cipher').setText(String(this.totalDetectionsCount));
                };
                Category.prototype.updateStyles = function () {
                    this.element.query('.category-quantity span').last().setClass(this.empty() ? 'hide' : 'category-quantity__toggler category-quantity__toggler_folded');
                    if (this.empty())
                        this.element.query('.category-wrapper').addClass('category-wrapper_empty');
                    else
                        this.element.query('.category-wrapper').removeClass('category-wrapper_empty');
                };
                Category.prototype.updateBlockingMode = function (dntData) {
                    var blockingMode = isBlockingEnabled(dntData) &&
                        this.getBlockingMode(dntData) || 0;
                    var icon = blockingMode ? this.icon.enabled : this.icon.disabled;
                    this.element.query(".category__icon").setClass("category__icon " + icon);
                    this.element.query(".category-status__text").setText(getCategoryStatusText(blockingMode));
                };
                Category.prototype.renderDetection = function (dntData, detection) {
                    var blocked = isBlockingEnabled(dntData) && this.isTrackerBlockingEnabled(dntData, detection);
                    return $.from(document.createElement('li'))
                        .setClass(blocked ? "subcategory-item" : "subcategory-item disable")
                        .appendChilds($.from(document.createElement('span')).setClass('subcategory-item__name').setText(detection.trackerName), $.from(document.createElement('span')).setClass('subcategory-item__queries').setText(String(detection.count)));
                };
                Category.prototype.empty = function () {
                    return this.totalDetectionsCount === 0;
                };
                return Category;
            })();
            var SocialNetworksCategory = (function (_super) {
                __extends(SocialNetworksCategory, _super);
                function SocialNetworksCategory() {
                    _super.call(this, 0, '#social_networks', { enabled: 'networks_enabled', disabled: 'networks_disabled' }, l10n('PopupServiceCategory_SocialNetworks'));
                }
                SocialNetworksCategory.prototype.getBlockingMode = function (dntData) {
                    var socialNetworks = dntData.trackingSettings.socialNetworkSettings;
                    var blockedNetworksCount = 0;
                    for (var _i = 0; _i < socialNetworks.length; _i++) {
                        var socialNetwork = socialNetworks[_i];
                        if (socialNetwork.block)
                            blockedNetworksCount++;
                    }
                    if (blockedNetworksCount === 0)
                        return 0;
                    return socialNetworks.length === blockedNetworksCount ?
                        1 : 2;
                };
                SocialNetworksCategory.prototype.isTrackerBlockingEnabled = function (dntData, detection) {
                    var socialNetworks = dntData.trackingSettings.socialNetworkSettings;
                    for (var _i = 0; _i < socialNetworks.length; _i++) {
                        var socialNetwork = socialNetworks[_i];
                        if (socialNetwork.name === detection.trackerName)
                            return socialNetwork.block;
                    }
                    return false;
                };
                return SocialNetworksCategory;
            })(Category);
            var WebAnalyticsCategory = (function (_super) {
                __extends(WebAnalyticsCategory, _super);
                function WebAnalyticsCategory() {
                    _super.call(this, 1, '#web_analytics', { enabled: 'analytics_enabled', disabled: 'analytics_disabled' }, l10n('PopupServiceCategory_WebAnalytics'));
                }
                WebAnalyticsCategory.prototype.getBlockingMode = function (dntData) {
                    return dntData.trackingSettings.blockWebAnalytics ? 1 : 0;
                };
                return WebAnalyticsCategory;
            })(Category);
            var AdAgenciesCategory = (function (_super) {
                __extends(AdAgenciesCategory, _super);
                function AdAgenciesCategory() {
                    _super.call(this, 2, '#ad_agency', { enabled: 'agencies_enabled', disabled: 'agencies_disabled' }, l10n('PopupServiceCategory_AdAgency'));
                }
                AdAgenciesCategory.prototype.getBlockingMode = function (dntData) {
                    return dntData.trackingSettings.blockAdAgencies ? 1 : 0;
                };
                return AdAgenciesCategory;
            })(Category);
            var WebBugsCategory = (function (_super) {
                __extends(WebBugsCategory, _super);
                function WebBugsCategory() {
                    _super.call(this, 3, '#web_bugs', { enabled: 'webbugs_enabled', disabled: 'webbugs_disabled' }, l10n('PopupServiceCategory_WebBugs'));
                }
                WebBugsCategory.prototype.getBlockingMode = function (dntData) {
                    return dntData.trackingSettings.blockWebBugs ? 1 : 0;
                };
                return WebBugsCategory;
            })(Category);
            function updateControlsOnSiteBlockingStatusChange(blockingEnabled, thisSiteBlockingStatus) {
                var blockingStatus = $.query("#blocker");
                var blockOnThisSite = $.query("#blockOnThisSiteDisabled");
                switch (thisSiteBlockingStatus) {
                    case 1:
                        updateControlsOnSiteBlockingDisabled();
                        $.query(BlockButton).setText(l10n('PopupSiteBlockEnable'));
                        blockingStatus.show();
                        blockOnThisSite.hide();
                        break;
                    case 2:
                        $.query(BlockButton).hide();
                        blockingStatus.hide();
                        blockOnThisSite.show();
                        break;
                    case 3:
                        $.query(BlockButton).hide();
                        blockingStatus.hide();
                        blockOnThisSite.show();
                        break;
                    case 0:
                    default:
                        updateControlsOnSiteBlockingEnabled(blockingEnabled);
                        $.query(BlockButton).setText(l10n('PopupSiteBlockDisable'));
                        blockingStatus.show();
                        blockOnThisSite.hide();
                }
            }
            function updateControlsOnSiteBlockingEnabled(blockingEnabled) {
                $.query(SiteBlockingDisabledLabel).hide();
                $.query(BlockingSlider).show();
                $.query(NotificationBlock).show();
                if (blockingEnabled)
                    $.query(StatusBlock).setClass("query-blocker");
            }
            function updateControlsOnSiteBlockingDisabled() {
                $.query(SiteBlockingDisabledLabel).show();
                $.query(BlockingSlider).hide();
                $.query(NotificationBlock).hide();
                $.query(StatusBlock).addClass("query-blocker_disabled");
            }
            function updateBlockButtonAndSwitch(blockingEnabled) {
                $.query(BlockingSlider)
                    .setValue(String(blockingEnabled))
                    .setClass("query-blocker__switch");
                $.query(StatusBlock).setClass("query-blocker");
                if (blockingEnabled) {
                    $.query(NotificationBlock).setText(l10n('PopupBlockEnabled'));
                    $.query(BlockButton).show();
                }
                else {
                    $.query(NotificationBlock).setText(l10n('PopupBlockDisabled'));
                    $.query(BlockingSlider).addClass("query-blocker__switch_disabled");
                    $.query(StatusBlock).addClass("query-blocker_disabled");
                    $.query(BlockButton).hide();
                }
            }
            function getTotalDetectionsCount(detections) {
                var totalCount = 0;
                for (var _i = 0; _i < detections.length; _i++) {
                    var detection = detections[_i];
                    totalCount += detection.count;
                }
                return totalCount;
            }
            function isBlockingEnabled(areaData) {
                return areaData.blockingEnabled &&
                    areaData.thisSiteBlockingStatus == 0;
            }
            function getCategoryStatusText(blockingMode) {
                switch (blockingMode) {
                    case 0: return l10n('PopupBlockingOff');
                    case 1: return l10n('PopupBlockingOn');
                    case 2: return l10n('PopupPartiallyBlocked');
                }
                throw new Error('Unknown blocking mode ' + blockingMode);
            }
            function callAsync(callback) {
                setTimeout(function () { return callback(); }, 0);
            }
            function cancelEvent(event_) {
                var event = event_ || window.event;
                if (event.stopPropagation)
                    event.stopPropagation();
                else
                    event.cancelBubble = true;
                if (event.preventDefault)
                    event.preventDefault();
                else
                    event.returnValue = false;
            }
        })(dnt = popup.dnt || (popup.dnt = {}));
    })(popup = light_plugin.popup || (light_plugin.popup = {}));
})(light_plugin || (light_plugin = {}));
