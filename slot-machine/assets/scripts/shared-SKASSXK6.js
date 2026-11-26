var getSelectedDesign = (queryParamName = "design") => {
    var _a2;
    const queryDesign = (_a2 = new URL(window.location.href).searchParams.get(queryParamName)) == null ? void 0 : _a2.trim();
    if (queryDesign === "default") {
        return "";
    }
    return queryDesign || APP_CONFIG.design || "";
};
var url = new URL(window.location.href);
var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s;
var URL_PARAM = {
    pz: (_a = url.searchParams.get("pz")) != null ? _a : "",
    tb: (_b = url.searchParams.get("tb")) != null ? _b : "",
    tb_reverse: (_c = url.searchParams.get("tb_reverse")) != null ? _c : "",
    ae: (_d = url.searchParams.get("ae")) != null ? _d : "",
    z: (_e = url.searchParams.get("z")) != null ? _e : "",
    var: (_f = url.searchParams.get("var")) != null ? _f : "",
    var_1: (_g = url.searchParams.get("var_1")) != null ? _g : "",
    var_2: (_h = url.searchParams.get("var_2")) != null ? _h : "",
    var_3: (_i = url.searchParams.get("var_3")) != null ? _i : "",
    b: (_j = url.searchParams.get("b")) != null ? _j : "",
    campaignid: (_k = url.searchParams.get("campaignid")) != null ? _k : "",
    abtest: (_l = url.searchParams.get("abtest")) != null ? _l : "",
    rhd: (_m = url.searchParams.get("rhd")) != null ? _m : "1",
    s: (_n = url.searchParams.get("s")) != null ? _n : "",
    ymid: (_o = url.searchParams.get("ymid")) != null ? _o : "",
    wua: (_p = url.searchParams.get("wua")) != null ? _p : "",
    use_full_list_or_browsers: (_q = url.searchParams.get("use_full_list_or_browsers")) != null ? _q : "",
    cid: (_r = url.searchParams.get("cid")) != null ? _r : "",
    geo: (_s = url.searchParams.get("geo")) != null ? _s : ""
};
var getUTCFormattedTime = () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    const hours = String(now.getUTCHours()).padStart(2, "0");
    const minutes = String(now.getUTCMinutes()).padStart(2, "0");
    const seconds = String(now.getUTCSeconds()).padStart(2, "0");
    const microseconds = String(now.getUTCMilliseconds() * 1e3).padStart(6, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${microseconds} +00:00`;
};
var memory = {
    local: new Map(),
    session: new Map()
};
var getStorage = (kind) => kind === "local" ? window.localStorage : window.sessionStorage;
var storageGet = (kind, key, onError) => {
    var _a2;
    let stored = null;
    try {
        stored = getStorage(kind).getItem(key);
    } catch (error) {
        onError == null ? void 0 : onError(error);
    }
    return memory[kind].has(key) ? (_a2 = memory[kind].get(key)) != null ? _a2 : null : stored;
};
var storageSet = (kind, key, value, onError) => {
    try {
        getStorage(kind).setItem(key, value);
        memory[kind].delete(key);
    } catch (error) {
        memory[kind].set(key, value);
        onError == null ? void 0 : onError(error);
    }
};
var EVENTS_HISTORY_KEY = "events_history";
var storageFailed = false;
var reportingParseError = false;
var sendError = (errorSubType, error) => {
    var _a2;
    (_a2 = window.syncMetric) == null ? void 0 : _a2.call(window, {
        event: "error",
        errorMessage: error instanceof Error ? error.message : String(error),
        errorType: "CUSTOM",
        errorSubType
    });
};
var reportStorageError = (errorSubType) => (error) => {
    if (storageFailed) return;
    storageFailed = true;
    sendError(errorSubType, error);
};
var reportParseError = (error) => {
    if (reportingParseError) return;
    reportingParseError = true;
    try {
        sendError("EventsHistoryGet", error);
    } finally {
        reportingParseError = false;
    }
};
var getEventsHistory = () => {
    if (storageFailed) return [];
    const history = storageGet(
        "session",
        EVENTS_HISTORY_KEY,
        reportStorageError("EventsHistoryGet")
    );
    if (storageFailed || !history) return [];
    try {
        return JSON.parse(history);
    } catch (error) {
        reportParseError(error);
        return [];
    }
};
var saveEventsHistory = (history) => {
    if (storageFailed) return;
    storageSet(
        "session",
        EVENTS_HISTORY_KEY,
        JSON.stringify(history),
        reportStorageError("EventsHistorySave")
    );
};
var LANGUAGE_ALIASES = {
    nb: "no",
    nn: "no"
};
var getCurrentLanguage = () => {
    var _a2;
    const urlParams = window.location.search;
    const paramLang = new URLSearchParams(urlParams).get("lang");
    const userBrowserLang = navigator.language.split("-")[0];
    const lang = paramLang || userBrowserLang || "en";
    return (_a2 = LANGUAGE_ALIASES[lang]) != null ? _a2 : lang;
};
var firstPresent = (params, names) => {
    var _a2;
    return (_a2 = names.map((name) => params.get(name)).find((value) => !!value)) != null ? _a2 : null;
};
var toZoneId = (value) => value && /^\d+$/.test(value) ? Number(value) : null;
var getLinkMetricFields = (params) => {
    const ymid = params.get("ymid");
    return {
        sub_id: firstPresent(params, ["var_1", "s"]),
        source_zone_id: toZoneId(firstPresent(params, ["var_2", "z"])),
        request_var: firstPresent(params, ["var_3", "var"]),
        ...ymid ? {
            ymid
        } : {}
    };
};
var getJsVersion = () => {
    var _a2, _b2;
    return typeof document !== "undefined" && ((_b2 = (_a2 = document.documentElement) == null ? void 0 : _a2.dataset) == null ? void 0 : _b2.jsVersion) || "";
};
var EVENT_MAPPING = {
    ["start"]: "start",
    ["ageExit"]: "age_exit",
    ["mainExit"]: "main_exit",
    ["push"]: "push",
    ["autoexit"]: "autoexit",
    ["back"]: "back",
    ["reverse"]: "reverse",
    ["tabUnderClick"]: "tab_under_click",
    ["error"]: "error",
    ["unhandledRejection"]: "unhandled_rejection"
};
var landingLoadDateTime = getUTCFormattedTime();
var linkMetricFields = getLinkMetricFields(new URL(window.location.href).searchParams);
var getAb2rValue = () => {
    if (URL_PARAM.abtest) return URL_PARAM.abtest;
    return APP_CONFIG.abtest ? String(APP_CONFIG.abtest) : void 0;
};
var collectMetricsData = ({
    event,
    exitZoneId,
    errorMessage,
    errorSubType,
    errorType,
    skipHistory,
    contextExtra
}) => {
    var _a2, _b2, _c2;
    const docAttrs = (_a2 = document.querySelector("html")) == null ? void 0 : _a2.dataset;
    const landingName = (docAttrs == null ? void 0 : docAttrs.landingName) || "";
    const dataVer = (docAttrs == null ? void 0 : docAttrs.version) || "";
    const dataEnv = (docAttrs == null ? void 0 : docAttrs.env) || "";
    const ag = (docAttrs == null ? void 0 : docAttrs.ag) === "true";
    const publication = docAttrs == null ? void 0 : docAttrs.publication;
    const design = getSelectedDesign();
    const landingDomain = window.location.host;
    const serverEvent = EVENT_MAPPING[event] || event;
    const landingLanguage = getCurrentLanguage();
    const eventsHistorySize = 30;
    const currentTs = Date.now();
    const eventHistory = getEventsHistory();
    const lastEvent = eventHistory[eventHistory.length - 1];
    const delta = lastEvent ? currentTs - lastEvent.currentTs : 0;
    if (!skipHistory) {
        eventHistory.push({
            currentTs,
            eventName: serverEvent,
            delta
        });
        if (eventHistory.length >= eventsHistorySize) {
            eventHistory.shift();
        }
        saveEventsHistory(eventHistory);
    }
    const eventData = [{
        app: "landings-constructor",
        event: serverEvent,
        language: landingLanguage,
        landing_name: landingName,
        build_version: dataVer,
        landing_domain: landingDomain,
        landing_url: window.location.href,
        exit_zone_id: exitZoneId ? Number(exitZoneId) : void 0,
        ...linkMetricFields,
        landing_load_date_time: landingLoadDateTime,
        error_message: errorMessage != null ? errorMessage : "",
        ab2r: getAb2rValue(),
        event_history: (_b2 = JSON.stringify({
            event_history: JSON.parse(JSON.stringify(getEventsHistory()))
        })) != null ? _b2 : null,
        context: JSON.stringify({
            ag,
            ...publication ? {
                publication
            } : {},
            ...design ? {
                design
            } : {},
            ...contextExtra != null ? contextExtra : {}
        }),
        error_sub_type: errorSubType,
        error_type: errorType,
        env: dataEnv,
        // it's propush publisher id (read from data-js-version in run time)
        js_version: getJsVersion()
    }];
    const isAnalyticEnabled = (_c2 = APP_CONFIG.isAnalyticEnabled) != null ? _c2 : true;
    return {
        eventData,
        isAnalyticEnabled
    };
};

export {
    getCurrentLanguage,
    getSelectedDesign,
    URL_PARAM,
    collectMetricsData
};