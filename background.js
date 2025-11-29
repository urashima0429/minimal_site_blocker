async function loadBlockList() {
  const response = await fetch(chrome.runtime.getURL("blocklist.json"));
  const data = await response.json();

  const rules = data.block.map((pattern, index) => ({
    id: index + 1,
    priority: 1,
    action: {
      type: "redirect",
      redirect: { extensionPath: "/block.html" }
    },
    condition: {
      urlFilter: pattern,
      resourceTypes: ["main_frame"]
    }
  }));

  return rules;
}

async function applyRules() {
  const rules = await loadBlockList();
  await chrome.declarativeNetRequest.updateDynamicRules({
    addRules: rules,
    removeRuleIds: rules.map(r => r.id)
  });
  console.log("Blocking rules applied:", rules);
}

async function clearRules() {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const ids = existing.map(r => r.id);
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: ids
  });
  console.log("All blocking rules cleared.");
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg === "enableBlocking") {
    applyRules().then(() => {
      chrome.storage.local.set({ blockingEnabled: true });
      sendResponse({ ok: true });
    });
  } else if (msg === "disableBlocking") {
    clearRules().then(() => {
      chrome.storage.local.set({ blockingEnabled: false });
      sendResponse({ ok: true });
    });
  }
  return true;
});
