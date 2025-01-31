document.addEventListener('DOMContentLoaded', () => {
    // Fetch activity stats
    chrome.storage.local.get(['scrollDistance', 'scrollDistanceInMeters', 'mouseDistance', 'mouseDistanceInMeters'], (data) => {
        // Display scroll distance in meters
        const scrollMeters = data.scrollDistanceInMeters ? data.scrollDistanceInMeters.toFixed(2) : 0;
        document.getElementById('scrollDistance').textContent = `Scroll Mileage: ${scrollMeters} meters`;

        // Display mouse distance in meters
        const mouseMeters = data.mouseDistanceInMeters ? data.mouseDistanceInMeters.toFixed(2) : 0;
        document.getElementById('mouseDistance').textContent = `Mouse Mileage: ${mouseMeters} meters`;
    });

    // Fetch tab tracking data
    chrome.storage.local.get(['openTabsCount', 'tabTimes'], (data) => {
        document.getElementById('openTabsCount').textContent = `Active Tabs: ${data.openTabsCount || 0}`;

        // Display time spent on each tab with title
        const tabTimesList = document.getElementById('tabTimesList');
        tabTimesList.innerHTML = ''; // Clear previous entries

        if (data.tabTimes) {
            const maxTimes = {};

            for (const [tabId, tabInfo] of Object.entries(data.tabTimes)) {
                if (tabId === "_lastActive") continue; // Skip helper property

                const title = tabInfo.title || (tabInfo.url ? new URL(tabInfo.url).hostname : "Empty Tab");
                const currentTime = tabInfo.time;

                // Track the maximum time per title
                if (!maxTimes[title] || currentTime > maxTimes[title].time) {
                    maxTimes[title] = { time: currentTime, tabId };
                }
            }

            // Convert to array, sort by time in descending order, and limit to 5 items
            const sortedMaxTimes = Object.entries(maxTimes)
                .sort(([, a], [, b]) => b.time - a.time) // Sort by time
                .slice(0, 5); // Limit to top 5

            for (const [title, { time }] of sortedMaxTimes) {
                const minutes = Math.floor(time / 60000);
                const seconds = Math.floor((time % 60000) / 1000);
                const timeDisplay = `${minutes} min ${seconds} sec`;

                const tabInfoDiv = document.createElement('div');
                tabInfoDiv.classList.add('tab-info');
                tabInfoDiv.textContent = `${title} - ${timeDisplay}`;
                tabTimesList.appendChild(tabInfoDiv);
            }
        }
    });

    // Reset button to clear storage and reset display
    document.getElementById('reset').addEventListener('click', () => {
        // Send reset command to background.js
        chrome.runtime.sendMessage('resetData', (response) => {
            if (response && response.status === 'success') {
                console.log("tabTimes has been successfully reset.");
                // Update UI after reset
                document.getElementById('scrollDistance').textContent = `Scroll Distance: 0 meters`;
                document.getElementById('mouseDistance').textContent = `Mouse Distance: 0 meters`;
                document.getElementById('openTabsCount').textContent = `Active Tabs: 0`;
                document.getElementById('tabTimesList').innerHTML = ''; // Clear displayed tab times
            }
        });
    });

    // Refresh button to fetch the latest stats from background.js
    document.getElementById('refresh').addEventListener('click', () => {
        const spinner = document.getElementById('spinner');
        // Add the fast animation class
        spinner.classList.add('fast');

        // Send message to background.js to get the latest stats
        chrome.runtime.sendMessage('getStats', (response) => {
            if (response) {
                displayTabTimes(response.tabTimes); // Update tab times display
            }
            // Remove the fast class after a delay to reset the animation
            setTimeout(() => {
                spinner.classList.remove('fast'); // Reset to normal speed
            }, 3000); // Match the duration of the fast animation
        });
    });
});

// Function to display tab times in the popup
function displayTabTimes(tabTimes) {
    const tabTimesList = document.getElementById('tabTimesList');
    tabTimesList.innerHTML = ''; // Clear existing tab times

    const sortedTabTimes = Object.entries(tabTimes || {})
        .filter(([key]) => key !== "_lastActive") // Ensure _lastActive is not included
        .sort(([, a], [, b]) => b.time - a.time); // Sort by time spent (descending)

    // Determine the number of tabs to display (minimum of 5 or the total number of tabs)
    const tabsToDisplay = sortedTabTimes.slice(0, Math.min(5, sortedTabTimes.length));

    // Filter out tabs without a valid title before displaying
    const filteredTabs = tabsToDisplay.filter(([title]) => title && title.trim() !== '');

    // Iterate over the filtered tab times to display them
    for (const [title, { time }] of filteredTabs) {
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        const timeDisplay = `${minutes} min ${seconds} sec`;

        const tabInfoDiv = document.createElement('div');
        tabInfoDiv.classList.add('tab-info');
        tabInfoDiv.textContent = `${title} - ${timeDisplay}`;
        tabTimesList.appendChild(tabInfoDiv);
    }
}
