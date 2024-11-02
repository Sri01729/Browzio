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
            // Create a dictionary to store the highest time for each tab title
            const maxTimes = {};

            for (const [tabId, tabInfo] of Object.entries(data.tabTimes)) {
                if (tabId === "_lastActive") continue; // Skip helper property

                const title = tabInfo.title || "Unknown Tab";
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

            // Clear existing elements in tabTimesList
            tabTimesList.innerHTML = '';

            // Display only the top 5 tabs
            for (const [title, { time }] of sortedMaxTimes) {
                const minutes = Math.floor(time / 60000);
                const seconds = Math.floor((time % 60000) / 1000);
                const timeDisplay = `${minutes} min ${seconds} sec`;

                // Create a new element for each of the top 5 entries
                const tabInfoDiv = document.createElement('div');
                tabInfoDiv.classList.add('tab-info');
                tabInfoDiv.textContent = `${title} -  ${timeDisplay}`;
                tabTimesList.appendChild(tabInfoDiv);
            }
        }


    });

    // Reset button to clear storage and reset display
    document.getElementById('reset').addEventListener('click', () => {
        chrome.storage.local.set({
            scrollDistance: 0,
            scrollDistanceInMeters: 0,
            mouseDistance: 0,
            mouseDistanceInMeters: 0,
            openTabsCount: 0,
            tabTimes: {}
        }, () => {
            document.getElementById('scrollDistance').textContent = `Scroll Distance: 0 meters`;
            document.getElementById('mouseDistance').textContent = `Mouse Distance: 0 meters`;
            document.getElementById('openTabsCount').textContent = `Current Open Tabs: 0`;
            document.getElementById('tabTimesList').innerHTML = '';
        });
    });
});
