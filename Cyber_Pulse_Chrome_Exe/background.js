let activeTabId = null;
let tabTimes = {}; // Store time spent and title for each tab

// Function to update the open tabs count
function updateOpenTabsCount() {
    // Short delay to ensure tabs data is updated in Chrome
    setTimeout(() => {
        chrome.tabs.query({}, (tabs) => {
            chrome.storage.local.set({ openTabsCount: tabs.length });
        });
    }, 100); // 100ms delay to wait for the tab state to update
}

// Function to save time spent on a tab, along with its title
// Function to save time spent on a tab, along with its title
function saveTabTime(tabId, title, timeSpent) {
    // Check if the URL is YouTube and set a generic title if so
    if (title.toLowerCase().includes("youtube")) {
        title = "YouTube"; // Generalize YouTube title
    }

    if (!tabTimes[tabId]) {
        tabTimes[tabId] = { title: title, time: 0 };
    }
    tabTimes[tabId].time += timeSpent;
}


// When a tab is activated
chrome.tabs.onActivated.addListener((activeInfo) => {
    const now = Date.now();

    // Record time on the previous tab
    if (activeTabId !== null) {
        const timeSpent = now - (tabTimes._lastActive || now);

        // Get the title of the previously active tab
        chrome.tabs.get(activeTabId, (tab) => {
            if (tab) {
                saveTabTime(activeTabId, tab.title, timeSpent);
                console.log(`Tab ${tab.title}`);
            }
        });
    }

    // Update active tab
    activeTabId = activeInfo.tabId;
    tabTimes._lastActive = now;

    // Update the count of open tabs
    updateOpenTabsCount();
});

// Listen for tab opening to update the count immediately
chrome.tabs.onCreated.addListener(updateOpenTabsCount);

// Listen for tab closing to update the count after a short delay
chrome.tabs.onRemoved.addListener(() => {
    updateOpenTabsCount();
    checkIfAllWindowsClosed(); // Also check if it's the last tab and end session if needed
});

// Periodically save tab time data
setInterval(() => {
    chrome.storage.local.set({ tabTimes });
}, 10000);

// Initial data setup on installation
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({
        scrollDistance: 0,
        scrollDistanceInMeters: 0,
        mouseDistance: 0,
        mouseDistanceInMeters: 0,
        openTabsCount: 0,
        tabTimes: {}
    });
});

// Respond to popup requests for stats
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === 'getStats') {
        chrome.storage.local.get(['scrollDistance', 'mouseDistance', 'openTabsCount', 'tabTimes'], (data) => {
            sendResponse(data);
        });
        return true; // keeps the message channel open for async response
    }
});

// Helper to check if all windows are closed
function checkIfAllWindowsClosed() {
    chrome.windows.getAll({}, (windows) => {
        if (windows.length === 0) {
            // No open windows, end the session
            endSession();
        }
    });
}

// Function to clear session data
function endSession() {
    console.log("Ending session and clearing data.");

    tabTimes = {}; // Clear in-memory tabTimes
    // Clear session-related data to start fresh on the next browser launch
    chrome.storage.local.set({
        scrollDistance: 0,
        scrollDistanceInMeters: 0,
        mouseDistance: 0,
        mouseDistanceInMeters: 0,
        openTabsCount: 0,
        tabTimes: {}
    }, () => {
        console.log("Session data cleared.");
    });
}

// Event listener for window close, to check if all windows are closed
chrome.windows.onRemoved.addListener(checkIfAllWindowsClosed);

// Helper to check if all windows are closed
function checkIfAllWindowsClosed() {
    chrome.windows.getAll({}, (windows) => {
        if (windows.length === 0) {
            // No open windows, end the session
            endSession();
        }
    });
}

// Function to clear session data
function endSession() {
    console.log("Ending session and clearing data.");

    tabTimes = {};
    // Clear session-related data to start fresh on the next browser launch
    chrome.storage.local.set({
        scrollDistance: 0,
        scrollDistanceInMeters: 0,
        mouseDistance: 0,
        mouseDistanceInMeters: 0,
        openTabsCount: 0,
        tabTimes: {}
    }, () => {
        console.log("Session data cleared.");
    });
}

// Event listener for window close, to check if all windows are closed
chrome.windows.onRemoved.addListener(checkIfAllWindowsClosed);

// New: Clear lingering data on browser startup
chrome.runtime.onStartup.addListener(() => {
    console.log("Browser started; clearing lingering session data.");
    endSession();
});
