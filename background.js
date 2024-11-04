let activeTabId = null;
let tabTimes = {}; // Store time spent and title for each tab
let lastActiveTime = Date.now(); // New variable for tracking the last active time


// Function to update the open tabs count
function updateOpenTabsCount() {
    setTimeout(() => {
        chrome.tabs.query({}, (tabs) => {
            chrome.storage.local.set({ openTabsCount: tabs.length });
        });
    }, 100);
}

// Function to save time spent on a tab, along with its title
function saveTabTime(tabId, url, timeSpent) {
    try {
        const domain = new URL(url).hostname.replace("www.", ""); // Extract domain

        if (!tabTimes[domain]) {
            tabTimes[domain] = { title: domain, time: 0 }; // Use domain as the key
        }

        // Accumulate time for the domain
        tabTimes[domain].time += timeSpent;
    } catch (error) {
        console.error("Invalid URL:", url, error);
    }
}

chrome.tabs.onActivated.addListener((activeInfo) => {
    const now = Date.now();

    if (activeTabId !== null) {
        const timeSpent = now - lastActiveTime; // Use lastActiveTime instead

        chrome.tabs.get(activeTabId, (tab) => {
            if (tab) {
                saveTabTime(activeTabId, tab.url, timeSpent); // Save time for the previous tab
                console.log(`Domain ${new URL(tab.url).hostname}`);
            }
        });
    }

    activeTabId = activeInfo.tabId; // Update active tab
    lastActiveTime = now; // Update last active time
    updateOpenTabsCount();
});

// Listen for tab opening to update the count immediately
chrome.tabs.onCreated.addListener(updateOpenTabsCount);

// Listen for tab closing to update the count after a short delay
chrome.tabs.onRemoved.addListener(() => {
    updateOpenTabsCount();
    checkIfAllWindowsClosed(); // Check if it's the last tab
});

// Periodically save tab time data
setInterval(() => {
    chrome.storage.local.set({ tabTimes }); // Save tabTimes every 10 seconds
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
        return true; // Keeps the message channel open for async response
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
    chrome.storage.local.set({
        scrollDistance: 0,
        scrollDistanceInMeters: 0,
        mouseDistance: 0,
        mouseDistanceInMeters: 0,
        openTabsCount: 0,
        tabTimes: {} // Clear storage for tabTimes
    }, () => {
        console.log("Session data cleared.");
    });
}

// Event listener for window close, to check if all windows are closed
chrome.windows.onRemoved.addListener(checkIfAllWindowsClosed);
