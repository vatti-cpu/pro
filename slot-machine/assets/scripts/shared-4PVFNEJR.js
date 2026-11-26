import {
    getUrl,
    isIframePreviewBridgeActive,
    reportPreviewExitTriggered
} from "./shared-WIRVWFZN.js";
import {
    createURLSearchParams
} from "./shared-KZFCVOWZ.js";
import {
    collectMetricsData
} from "./shared-SKASSXK6.js";
var isAbsoluteUrl = (url) => /^https?:\/\//i.test(url);
var isCrossOriginUrl = (url) => {
    try {
        return isAbsoluteUrl(url) && new URL(url).origin !== window.location.origin;
    } catch {
        return false;
    }
};
var resolveDefaultBackHtmlBase = (origin, pathname) => {
    let backBase = `${origin}${pathname}`;
    if (backBase.includes("index.html")) {
        backBase = backBase.split("/index.html")[0];
    }
    if (backBase.includes("back.html")) {
        backBase = backBase.split("/back.html")[0];
    }
    if (backBase.endsWith("/")) {
        backBase = backBase.substring(0, backBase.length - 1);
    }
    return `${backBase}/back.html`;
};
var pushStateToHistory = (url, times) => {
    try {
        const originalUrl = window.location.href;
        for (let i = 0; i < times; i += 1) {
            window.history.pushState(null, "Please wait...", url);
        }
        window.history.pushState(null, document.title, originalUrl);
        console.log(`Back initializated ${times} times with ${url}`);
    } catch (error) {
        if (error instanceof Error && window.syncMetric) {
            window.syncMetric({
                event: "error",
                errorMessage: error.message,
                errorType: "CUSTOM",
                errorSubType: "PushStateToHistory"
            });
        }
    }
};
var initBackIfNeeded = async (config) => {
    var _a, _b, _c, _d;
    if (isIframePreviewBridgeActive()) return;
    const back = config == null ? void 0 : config.back;
    if (back) {
        const {
            currentTab,
            pageUrl: backPageURL
        } = back;
        if (currentTab) {
            const historyTimeAmount = (_a = back.count) != null ? _a : 10;
            const {
                origin,
                pathname
            } = window.location;
            let backBase;
            let crossOriginBackPage;
            if (backPageURL) {
                const processedPageUrl = backPageURL.replace(/\{zone\}/gi, String((_b = currentTab.zoneId) != null ? _b : ""));
                if (isCrossOriginUrl(processedPageUrl)) {
                    crossOriginBackPage = processedPageUrl;
                    backBase = resolveDefaultBackHtmlBase(origin, pathname);
                } else {
                    backBase = processedPageUrl;
                }
            } else {
                backBase = resolveDefaultBackHtmlBase(origin, pathname);
            }
            const backUrlBase = isAbsoluteUrl(backBase) ? new URL(backBase) : new URL(backBase, window.location.href);
            const searchParams = await createURLSearchParams({
                zone: currentTab.zoneId
            });
            if (currentTab.url) searchParams.set("url", currentTab.url);
            else if (currentTab.domain && currentTab.zoneId) {
                searchParams.set("z", currentTab.zoneId);
                searchParams.set("domain", currentTab.domain);
            }
            if (crossOriginBackPage) searchParams.set("backPage", crossOriginBackPage);
            const {
                eventData,
                isAnalyticEnabled
            } = collectMetricsData({
                event: "back",
                exitZoneId: currentTab.zoneId,
                skipHistory: true
            });
            const sessionIds = (_c = window.staticLandMetricIds) == null ? void 0 : _c.call(window);
            if (sessionIds)
                for (const metric of eventData) Object.assign(metric, sessionIds);
            if (isAnalyticEnabled) {
                try {
                    searchParams.set("mData", btoa(JSON.stringify(eventData)));
                } catch (error) {
                    (_d = window.syncMetric) == null ? void 0 : _d.call(window, {
                        event: "error",
                        errorMessage: error instanceof Error ? error.message : String(error),
                        errorType: "CUSTOM",
                        errorSubType: "InitBack"
                    });
                }
            }
            searchParams.forEach((value, key) => {
                backUrlBase.searchParams.set(key, value);
            });
            const backUrl = backUrlBase.toString();
            pushStateToHistory(backUrl, historyTimeAmount);
        }
    }
};
var Redirect = ({
    url
}) => {
    window.location.replace(url);
};
var USID_PARAM = "usid";
var TRANSITION_MARKERS = ["tufc", "step", "intent-id", "iawv"];
var hasTransitionMarker = (searchParams) => TRANSITION_MARKERS.some((marker) => searchParams.has(marker));
var setUsidParam = (url) => {
    var _a;
    if (url.origin !== window.location.origin || !hasTransitionMarker(url.searchParams)) return;
    const usid = (_a = window.staticLandMetricIds) == null ? void 0 : _a.call(window).usid;
    if (usid) url.searchParams.set(USID_PARAM, usid);
};
var withUsid = (url) => {
    try {
        const parsed = new URL(url, window.location.href);
        setUsidParam(parsed);
        return parsed.toString();
    } catch {
        return url;
    }
};
var Popunder = ({
    currentTabUrl,
    newTabUrl,
    shouldMakeInstantRedirect = false
}) => {
    if (newTabUrl) {
        const target = withUsid(newTabUrl);
        const newTab = window.open(target, "_blank");
        if (!newTab) {
            Redirect({
                url: target
            });
            return;
        }
        newTab.opener = null;
        if (currentTabUrl) {
            if (shouldMakeInstantRedirect) {
                Redirect({
                    url: currentTabUrl
                });
                return;
            }
            document.addEventListener("visibilitychange", () => {
                if (document.visibilityState === "visible") {
                    Redirect({
                        url: currentTabUrl
                    });
                }
            });
            return;
        }
    } else if (currentTabUrl) {
        Redirect({
            url: currentTabUrl
        });
    }
};
var exitError = (exitData, exitName) => {
    console.error(
        `${exitName || "Some exit"} was supposed to work, but some data about this type of exit was missed`,
        exitData
    );
};
var isFeature = (value) => typeof value === "object" && value !== null && !Array.isArray(value) && ("currentTab" in value || "newTab" in value);
var hasUsableExitData = (exitData) => Boolean(exitData && (exitData.zoneId && exitData.domain || exitData.url));
var safeInitBack = async (config) => {
    var _a;
    try {
        await initBackIfNeeded(config);
    } catch (error) {
        console.error("Back init failed", error);
        (_a = window.syncMetric) == null ? void 0 : _a.call(window, {
            event: "error",
            errorMessage: error instanceof Error ? error.message : String(error),
            errorType: "CUSTOM",
            errorSubType: "InitBack"
        });
    }
};
var makeRedirect = async (config, exitName, shouldInitBack = true) => {
    var _a, _b;
    const feature = config[exitName];
    console.log(`${exitName} worked`, config);
    if (!isFeature(feature)) {
        exitError(feature, exitName);
        return;
    }
    const {
        currentTab: exitData
    } = feature;
    const currentTabUsable = hasUsableExitData(exitData);
    if (isIframePreviewBridgeActive()) {
        reportPreviewExitTriggered(exitName, currentTabUsable ? ["currentTab"] : []);
        return;
    }
    if (exitData) {
        let url;
        if (exitData.zoneId && exitData.domain) {
            (_a = window.syncMetric) == null ? void 0 : _a.call(window, {
                event: exitName,
                exitZoneId: exitData.zoneId
            });
            url = await getUrl(exitData.zoneId, exitData.domain);
            if (shouldInitBack) await safeInitBack(config);
            return Redirect({
                url
            });
        }
        if (exitData.url) {
            (_b = window.syncMetric) == null ? void 0 : _b.call(window, {
                event: exitName,
                exitZoneId: exitData.url
            });
            url = exitData.url;
            if (shouldInitBack) await safeInitBack(config);
            return Redirect({
                url
            });
        }
    }
    exitError(exitData, exitName);
};
var makeExit = async (config, exitName) => {
    var _a, _b;
    const feature = config[exitName];
    console.log(`${exitName} worked`, config);
    if (!isFeature(feature)) {
        exitError(feature, exitName);
        return;
    }
    if (isIframePreviewBridgeActive()) {
        const targets = [];
        if (hasUsableExitData(feature.currentTab)) targets.push("currentTab");
        if (hasUsableExitData(feature.newTab)) targets.push("newTab");
        reportPreviewExitTriggered(exitName, targets);
        return;
    }
    const {
        currentTab,
        newTab
    } = feature;
    let currentTabUrl;
    if (currentTab) {
        if (currentTab.zoneId && currentTab.domain) {
            currentTabUrl = await getUrl(currentTab.zoneId, currentTab.domain);
            (_a = window.syncMetric) == null ? void 0 : _a.call(window, {
                event: exitName,
                exitZoneId: currentTab.zoneId
            });
        } else if (currentTab.url) {
            currentTabUrl = currentTab.url;
        } else {
            exitError(feature, exitName);
        }
    }
    let newTabUrl;
    if (newTab) {
        if (newTab.zoneId && newTab.domain) {
            newTabUrl = await getUrl(newTab.zoneId, newTab.domain);
            (_b = window.syncMetric) == null ? void 0 : _b.call(window, {
                event: exitName,
                exitZoneId: newTab.zoneId
            });
        } else if (newTab.url) {
            newTabUrl = newTab.url;
        } else {
            exitError(feature, exitName);
        }
    }
    await safeInitBack(config);
    Popunder({
        currentTabUrl,
        newTabUrl,
        shouldMakeInstantRedirect: true
    });
};

export {
    initBackIfNeeded,
    setUsidParam,
    makeRedirect,
    makeExit
};