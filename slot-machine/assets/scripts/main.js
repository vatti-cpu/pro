import {
    makeExit,
    setUsidParam
} from "./shared-4PVFNEJR.js";
import {
    isIframePreviewBridgeActive,
    parseConfig
} from "./shared-WIRVWFZN.js";
import "./shared-KZFCVOWZ.js";
import "./shared-SKASSXK6.js";
var CURRENT_QUESTION_KEY = "step";

function removeUrlParameter(paramKey) {
    const url = window.location.href;
    const r = new URL(url);
    r.searchParams.delete(paramKey);
    const newUrl = r.href;
    window.history.replaceState(window.history.state, "", newUrl);
}
var getCurrentStepFromURL = (key = CURRENT_QUESTION_KEY, shouldDeleteKey = true) => {
    const url = new URL(window.location.href);
    const step = url.searchParams.get(key);
    if (shouldDeleteKey) removeUrlParameter(key);
    return step;
};
var tabUnderClick = async (config, newTabParamValue, key = CURRENT_QUESTION_KEY) => {
    if (isIframePreviewBridgeActive() && !config.tabUnderClick) return;
    const newTab = new URL(window.location.href);
    newTab.searchParams.set(key, newTabParamValue.toString());
    setUsidParam(newTab);
    await makeExit({
            ...config,
            tabUnderClick: {
                ...config.tabUnderClick,
                newTab: {
                    url: newTab.toString()
                }
            }
        },
        "tabUnderClick"
    );
    if (isIframePreviewBridgeActive()) {
        window.history.replaceState(window.history.state, "", newTab.toString());
    }
};
var URL_PARAMS = {
    tabUnderFirstClick: "tufc"
};
var MAX_SPINS = 3;
var SPIN_DURATION_MS = 3e3;
var SPIN_SETTLE_MS = 40;
var REEL_REPEAT_COUNT = 20;
var TIMER_INITIAL_MS = 5e4;
var TIMER_TICK_MS = 100;
var MOBILE_MAX_WIDTH = 768;
var DEFAULT_PRIZE_IMAGE_PATH = "./assets/images/prize.webp";
var REELS = [
    [{
        isPrize: true
    }, {
        isPrize: false
    }, {
        isPrize: true
    }, {
        isPrize: false
    }],
    [{
        isPrize: false
    }, {
        isPrize: true
    }, {
        isPrize: false
    }, {
        isPrize: true
    }],
    [{
        isPrize: true
    }, {
        isPrize: false
    }, {
        isPrize: false
    }, {
        isPrize: true
    }]
];
var LOSE_SYMBOL = "\u{1F634}";
var SPIN_SHIFTS_DESKTOP = [
    [1440, 2040, 2760],
    [2880, 4080, 5520],
    [1440, 2040, 2760],
    [4440, 6240, 8160]
];
var SPIN_SHIFTS_MOBILE = [
    [1480, 2080, 2800],
    [2920, 4120, 5680],
    [1480, 2080, 2800],
    [4960, 6760, 7720]
];
var WINNING_THIRD_SPIN_DESKTOP = [4200, 6e3, 8520];
var WINNING_THIRD_SPIN_MOBILE = [4480, 6280, 8440];
(() => {
    var _a;
    const slotPage = document.getElementById("slotPage");
    const reelTracks = [
        document.getElementById("reelTrack1"),
        document.getElementById("reelTrack2"),
        document.getElementById("reelTrack3")
    ];
    const spinButton = document.getElementById("spinButton");
    const spinModal = document.getElementById("spinModal");
    if (!slotPage || !spinButton || !spinModal || reelTracks.some((track) => !track)) {
        return;
    }
    const tracks = reelTracks;
    const fullPageClick = document.getElementById("fullPageClick");
    const tabUnderOverlay = document.getElementById("tabUnderOverlay");
    const startModal = document.getElementById("startModal");
    const startModalButton = document.getElementById("startModalButton");
    const spinsLeftCount = document.getElementById("spinsLeftCount");
    const spinModalCounterValue = document.getElementById("spinModalCounterValue");
    const spinModalPrizeImage = document.getElementById(
        "spinModalPrizeImage"
    );
    const timerValue = document.getElementById("slotTimerValue");
    const config = parseConfig(APP_CONFIG);
    const prizeImage = typeof APP_CONFIG.prizeImg === "string" ? APP_CONFIG.prizeImg : "";
    const reelPrizeImage = typeof APP_CONFIG.reelPrizeImg === "string" && APP_CONFIG.reelPrizeImg ? APP_CONFIG.reelPrizeImg : DEFAULT_PRIZE_IMAGE_PATH;
    const isWinningSpin = APP_CONFIG.isWinningSpin === true;
    const isStartModalEnabled = APP_CONFIG.startModalEnabled !== false;
    const isReturnedFromTabUnder = Boolean(
        getCurrentStepFromURL(URL_PARAMS.tabUnderFirstClick, false)
    );
    const isTabUnderAvailable = Boolean((_a = config.tabUnderClick) == null ? void 0 : _a.currentTab);
    let currentSpin = 0;
    let isSpinning = false;
    const isMobile = () => window.innerWidth < MOBILE_MAX_WIDTH;
    const getSpinShifts = () => {
        const baseShifts = isMobile() ? SPIN_SHIFTS_MOBILE : SPIN_SHIFTS_DESKTOP;
        if (!isWinningSpin) {
            return baseShifts;
        }
        return [
            ...baseShifts.slice(0, 3),
            isMobile() ? WINNING_THIRD_SPIN_MOBILE : WINNING_THIRD_SPIN_DESKTOP
        ];
    };
    const createReelCell = (isPrize) => {
        const cell = document.createElement("div");
        cell.className = isPrize ? "reel-cell reel-cell-prize" : "reel-cell";
        const cellInner = document.createElement("div");
        cellInner.className = "reel-cell-inner";
        const cellContent = document.createElement("div");
        cellContent.className = "reel-cell-content";
        if (isPrize) {
            const prizeImageElement = document.createElement("img");
            prizeImageElement.className = "reel-cell-image";
            prizeImageElement.alt = "prize";
            prizeImageElement.setAttribute("src", reelPrizeImage);
            cellContent.appendChild(prizeImageElement);
        } else {
            cellContent.textContent = LOSE_SYMBOL;
        }
        cellInner.appendChild(cellContent);
        cell.appendChild(cellInner);
        return cell;
    };
    const renderReel = (track, reelIndex) => {
        const reel = REELS[reelIndex];
        const fragment = document.createDocumentFragment();
        for (let repeat = 0; repeat < REEL_REPEAT_COUNT; repeat += 1) {
            reel.forEach((item) => {
                fragment.appendChild(createReelCell(item.isPrize));
            });
        }
        track.replaceChildren(fragment);
    };
    const applyShifts = (shifts, durationMs) => {
        tracks.forEach((track, index) => {
            track.style.transitionDuration = `${durationMs}ms`;
            track.style.transform = `translateY(${-shifts[index]}px)`;
        });
    };
    const syncReelShifts = () => {
        applyShifts(getSpinShifts()[currentSpin], 0);
    };
    const setSpinsLeft = (spinsLeft) => {
        if (spinsLeftCount) {
            spinsLeftCount.textContent = String(spinsLeft);
        }
        if (spinModalCounterValue) {
            spinModalCounterValue.textContent = String(spinsLeft);
        }
    };
    const hideSpinModal = () => {
        spinModal.classList.remove("is-visible");
        spinModal.classList.remove("show-retry");
        spinModal.classList.remove("show-final");
        spinModal.classList.remove("show-first-texts");
        spinModal.classList.remove("show-second-texts");
    };
    const showSpinModal = (spinsLeft) => {
        hideSpinModal();
        spinModal.classList.add("is-visible");
        if (spinsLeft > 0) {
            spinModal.classList.add("show-retry");
            spinModal.classList.add(currentSpin === 1 ? "show-first-texts" : "show-second-texts");
            return;
        }
        spinModal.classList.add("show-final");
    };
    const setSpinButtonState = () => {
        const isFinalStep = currentSpin >= MAX_SPINS && !isSpinning;
        spinButton.disabled = isSpinning;
        spinButton.classList.toggle("is-final", isFinalStep);
        spinButton.classList.toggle("is-idle", !isSpinning);
    };
    const spin = () => {
        hideSpinModal();
        if (isSpinning) {
            return;
        }
        if (currentSpin >= MAX_SPINS) {
            isSpinning = true;
            setSpinButtonState();
            makeExit(config, "mainExit");
            return;
        }
        isSpinning = true;
        currentSpin += 1;
        setSpinsLeft(MAX_SPINS - currentSpin);
        setSpinButtonState();
        const shifts = getSpinShifts()[currentSpin];
        requestAnimationFrame(() => applyShifts(shifts, SPIN_DURATION_MS));
        setTimeout(() => {
            isSpinning = false;
            syncReelShifts();
            setSpinButtonState();
            showSpinModal(MAX_SPINS - currentSpin);
        }, SPIN_DURATION_MS + SPIN_SETTLE_MS);
    };
    const runTimer = () => {
        if (!timerValue) {
            return;
        }
        let timeLeftMs = TIMER_INITIAL_MS;
        const formatTime = (ms) => {
            const totalSeconds = Math.floor(ms / 1e3);
            const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
            const seconds = String(totalSeconds % 60).padStart(2, "0");
            const milliseconds = String(ms % 1e3).padStart(3, "0");
            return `${minutes}:${seconds}:${milliseconds}`;
        };
        timerValue.textContent = formatTime(timeLeftMs);
        const interval = setInterval(() => {
            timeLeftMs = Math.max(0, timeLeftMs - TIMER_TICK_MS);
            timerValue.textContent = formatTime(timeLeftMs);
            if (timeLeftMs <= 0) {
                clearInterval(interval);
            }
        }, TIMER_TICK_MS);
    };
    const closeStartModal = () => {
        startModal == null ? void 0 : startModal.classList.remove("is-visible");
    };
    if (prizeImage && spinModalPrizeImage) {
        spinModalPrizeImage.setAttribute("src", prizeImage);
    }
    tracks.forEach((track, index) => renderReel(track, index));
    syncReelShifts();
    setSpinsLeft(MAX_SPINS);
    setSpinButtonState();
    runTimer();
    if (isStartModalEnabled && !isReturnedFromTabUnder) {
        startModal == null ? void 0 : startModal.classList.add("is-visible");
    }
    startModalButton == null ? void 0 : startModalButton.addEventListener("click", () => {
        closeStartModal();
    });
    if (isTabUnderAvailable && !isReturnedFromTabUnder) {
        tabUnderOverlay == null ? void 0 : tabUnderOverlay.classList.add("is-visible");
        tabUnderOverlay == null ? void 0 : tabUnderOverlay.addEventListener("click", () => {
            tabUnderOverlay.classList.remove("is-visible");
            closeStartModal();
            tabUnderClick(config, "1", URL_PARAMS.tabUnderFirstClick);
        });
    }
    spinButton.addEventListener("click", () => {
        spin();
    });
    fullPageClick == null ? void 0 : fullPageClick.addEventListener("click", spin);
    if (isReturnedFromTabUnder) {
        closeStartModal();
        spin();
    }
    window.addEventListener("resize", () => {
        if (isSpinning) {
            return;
        }
        syncReelShifts();
    });
})();