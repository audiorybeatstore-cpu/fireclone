let apiKeyVisible = false;
const realApiKey = "fc_live_7x92n3k9s82j1a";

function toggleApiKey() {
    const keyElement = document.getElementById('api-key-text');
    const button = event.target;
    
    apiKeyVisible = !apiKeyVisible;
    if (apiKeyVisible) {
        keyElement.innerText = realApiKey;
        button.innerText = "Hide";
    } else {
        keyElement.innerText = "••••••••••••••••";
        button.innerText = "Reveal";
    }
}

function switchTab(tabId) {
    // Update Title
    document.getElementById('panel-title').innerText = tabId + " Panel";

    // Toggle Content Views
    const dbView = document.getElementById('view-database');
    const genericView = document.getElementById('view-generic');

    if (tabId === 'database') {
        dbView.classList.remove('hidden');
        genericView.classList.add('hidden');
    } else {
        dbView.classList.add('hidden');
        genericView.classList.remove('hidden');
    }

    // Reset button styles
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.className = "tab-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-[#1e2235] hover:text-gray-200 transition";
    });

    // Highlight active button
    const activeBtn = document.getElementById(`btn-${tabId}`);
    if (activeBtn) {
        activeBtn.className = "tab-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-orange-500/10 text-orange-400 border-l-2 border-orange-500 pl-2.5 transition";
    }
}
