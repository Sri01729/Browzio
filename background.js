let activeTabId = null;
let tabTimes = {}; // Store time spent and title for each tab
let lastActiveTime = Date.now(); // Variable for tracking the last active time

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
        // Check if the URL is valid and not empty
        if (!url) {
            return; // Skip saving for tabs with no URL
        }

        // Extract the domain name from the URL
        const title = new URL(url).hostname.replace("www.", ""); // Remove "www." for consistency

        // Check if the domain entry exists in tabTimes; if not, create it
        if (!tabTimes[title]) {
            tabTimes[title] = { title: title, time: 0 };
        }

        // Accumulate time for the domain
        tabTimes[title].time += timeSpent; // Only accumulate time for valid URLs
    } catch (error) {
        console.error("Invalid URL:", url, error);
    }
}



chrome.tabs.onActivated.addListener((activeInfo) => {
    const now = Date.now();

    if (activeTabId !== null) {
        const timeSpent = now - lastActiveTime; // Calculate time spent on the previous tab

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

    if (message === 'resetData') {
        endSession(); // Clear all stats on reset
        sendResponse({ status: 'success' });
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
        tabTimes: {} // Clear storage for tabTimes
    }, () => {
        console.log("Session data cleared.");
    });
}

// Event listener for window close, to check if all windows are closed
chrome.windows.onRemoved.addListener(checkIfAllWindowsClosed);
