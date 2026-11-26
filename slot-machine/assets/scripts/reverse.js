import {
    initBackIfNeeded,
    makeRedirect
} from "./shared-4PVFNEJR.js";
import {
    parseConfig
} from "./shared-WIRVWFZN.js";
import "./shared-KZFCVOWZ.js";
import "./shared-SKASSXK6.js";
var Reverse = async () => {
    const config = parseConfig(APP_CONFIG);
    if (!config) return;
    const reverse = config == null ? void 0 : config.reverse;
    let isHistoryPushed = false;
    if (reverse == null ? void 0 : reverse.currentTab) {
        window.addEventListener(
            "click",
            async () => {
                try {
                    if (isHistoryPushed) return;
                    const {
                        pathname
                    } = window.location;
                    const searchParams = window.location.search;
                    const pathnameWithSearchParams = `${pathname}${searchParams}`;
                    await initBackIfNeeded(config);
                    window.history.pushState(null, "", `${pathnameWithSearchParams}`);
                    isHistoryPushed = true;
                } catch (error) {
                    if (error instanceof Error && window.syncMetric) {
                        window.syncMetric({
                            event: "error",
                            errorMessage: error.message,
                            errorType: "CUSTOM",
                            errorSubType: "Reverse"
                        });
                    }
                }
            }, {
                capture: true
            }
        );
        window.addEventListener("popstate", () => {
            makeRedirect(config, "reverse", false);
        });
    }
};
Reverse();