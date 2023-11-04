async function waitElementLoaded(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

async function main() {
  await waitElementLoaded('span[href="#map"]');
  await insertCitizensCount();
}

// Listen for extension state
chrome.runtime.onMessage.addListener((request) => {
  if (request.extensionState === "activated") main();
  if (request.extensionState === "deactivated") removeData();
});