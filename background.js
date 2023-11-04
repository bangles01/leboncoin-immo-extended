async function isExtensionActive() {
  const prevState = await chrome.action.getBadgeText({});
  return prevState !== 'OFF';
}

function urlMatch(url) {
  const regexSale = new RegExp("https:\\/\\/.*\\.leboncoin\\.fr\\/ventes_immobilieres\\/");
  const regexRent = new RegExp("https:\\/\\/.*\\.leboncoin\\.fr\\/locations\\/");

  return regexSale.test(url) || regexRent.test(url);
}

async function sendActiveExtension() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const currentTab = tabs[0];
    if (!urlMatch(currentTab.url)) return;

    chrome.tabs.sendMessage(currentTab.id, { extensionState: "activated" });
  });
}

async function sendDeactiveExtension() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const currentTab = tabs[0];
    if (!urlMatch(currentTab.url)) return;

    chrome.tabs.sendMessage(currentTab.id, { extensionState: "deactivated" });
  });
}

async function sendExtensionStatus() {
  const extensionActive = await isExtensionActive();
  if (extensionActive) return sendActiveExtension();

  return sendDeactiveExtension();
}

async function activeExtension() {
  await chrome.action.setBadgeText({text: ''});
  sendActiveExtension();
}

async function deactiveExtension() {
  await chrome.action.setBadgeText({text: 'OFF'});
  sendDeactiveExtension();
}


chrome.action.onClicked.addListener(async (tab) => {
  const extensionActive = await isExtensionActive();
  if (extensionActive) return await deactiveExtension(tab);

  await activeExtension(tab);
});

chrome.tabs.onUpdated.addListener(function (_tabId , info, tab) {
  if (urlMatch(tab.url) && info.status === "complete") sendExtensionStatus();
});