function updateStatus() {
  chrome.storage.local.get("blockingEnabled", (data) => {
    const statusEl = document.getElementById("status");
    const enabled = data.blockingEnabled;

    if (enabled) {
      statusEl.textContent = "🔴 Blocking: ON";
      statusEl.style.color = "red";
    } else {
      statusEl.textContent = "🟢 Blocking: OFF";
      statusEl.style.color = "green";
    }
  });
}

async function loadBlockList() {
  const res = await fetch(chrome.runtime.getURL("blocklist.json"));
  const data = await res.json();
  const ul = document.getElementById("blockList");
  ul.innerHTML = "";

  data.block.forEach(url => {
    const li = document.createElement("li");
    li.textContent = url;
    ul.appendChild(li);
  });
}

document.getElementById("enable").addEventListener("click", () => {
  chrome.runtime.sendMessage("enableBlocking", (res) => {
    chrome.storage.local.set({ blockingEnabled: true }, updateStatus);
  });
});

document.getElementById("disable").addEventListener("click", () => {
  chrome.runtime.sendMessage("disableBlocking", (res) => {
    chrome.storage.local.set({ blockingEnabled: false }, updateStatus);
  });
});


updateStatus();
loadBlockList();
