// Track typing
// Confirm script is running
console.log("Content script loaded and listening for events");
function logExtensionUrl() {
    const url = browser.runtime.getURL("icons/icon16.png");
    console.log("Extension URL:", url);
}
logExtensionUrl();
let wordCount = 0;
document.addEventListener('keydown', (event) => {
    // Increase word count only for character keys
    if (event.key.length === 1 && /\S/.test(event.key)) {  // Filter for printable characters only
        wordCount += 1;
        console.log(`Keydown detected. Current word count: ${wordCount}`);

        // Save the word count to storage
        chrome.storage.local.set({ wordCount }).catch(error => {
            console.error("Failed to save wordCount:", error);
        });
    }
});

// Improved scroll distance tracking
let scrollDistance = 0;
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const delta = Math.abs(currentScrollY - lastScrollY); // Calculate scroll change
    scrollDistance += delta;
    lastScrollY = currentScrollY;

    // Convert pixels to meters
    const scrollDistanceInMeters = (scrollDistance / 96) * 0.0254;
   // console.log(`Scroll Distance: ${scrollDistance} pixels (${scrollDistanceInMeters.toFixed(4)} meters)`);

    // Save both values in storage
    chrome.storage.local.set({
        scrollDistance,
        scrollDistanceInMeters
    });
});


// Track mouse movement
let mouseDistance = 0;
let lastX = 0;
let lastY = 0;

document.addEventListener('mousemove', (e) => {
    if (lastX && lastY) {
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        mouseDistance += Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }
    lastX = e.clientX;
    lastY = e.clientY;

    // Convert pixels to meters
    const mouseDistanceInMeters = (mouseDistance / 96) * 0.0254;
    //console.log(`Mouse Distance: ${mouseDistance} pixels (${mouseDistanceInMeters.toFixed(4)} meters)`);

    // Save both values in storage (if needed)
    chrome.storage.local.set({
        mouseDistance,
        mouseDistanceInMeters
    });
});
