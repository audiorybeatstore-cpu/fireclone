let apiKeyVisible = false;
const realApiKey = "fc_live_7x92n3k9s82j1a";
// 🚨 PASTE YOUR RENDER URL HERE (Make sure it ends WITHOUT a slash /)
const BACKEND_URL = "https://fireclone.onrender.com"; 

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

// NEW FEATURE: Fetch real data from our live Node.js engine!
async function loadCollectionData(collectionName) {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = `<tr><td colspan="3" class="p-3 text-center text-gray-500 animate-pulse">Loading data from Node.js engine...</td></tr>`;

    try {
        const response = await fetch(`${BACKEND_URL}/api/v1/database/${collectionName}`);
        const data = await response.json();
        
        tbody.innerHTML = ''; // Clear loading text
        
        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="p-3 text-center text-gray-500">Collection is empty. Click "+ Add Row" to test!</td></tr>`;
            return;
        }

        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-[#1e2235]/40 border-b border-gray-800";
            tr.innerHTML = `
                <td class="p-3 border-r border-gray-800 text-gray-500">${row.id}</td>
                <td class="p-3 border-r border-gray-800 text-emerald-400">"${row.username || 'N/A'}"</td>
                <td class="p-3 border-r border-gray-800 text-purple-400">${row.is_premium !== undefined ? row.is_premium : 'false'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Error loading data:", error);
        tbody.innerHTML = `<tr><td colspan="3" class="p-3 text-center text-red-400">Error connecting to backend server.</td></tr>`;
    }
}

// NEW FEATURE: Send data to our live Node.js engine!
async function addNewRow() {
    const currentCollection = document.querySelector('select').value;
    const randomUsernames = ["cyber_ninja", "code_wizard", "giga_dev", "alpha_tester", "stack_overlord"];
    const randomUsername = randomUsernames[Math.floor(Math.random() * randomUsernames.length)];
    const randomPremium = Math.random() < 0.5;

    const payload = {
        username: randomUsername,
        is_premium: randomPremium
    };

    try {
        const response = await fetch(`${BACKEND_URL}/api/v1/database/${currentCollection}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            // Refresh table view automatically
            loadCollectionData(currentCollection);
        }
    } catch (error) {
        alert("Failed to add data to backend.");
    }
}

function switchTab(tabId) {
    document.getElementById('panel-title').innerText = tabId + " Panel";
    const dbView = document.getElementById('view-database');
    const genericView = document.getElementById('view-generic');

    if (tabId === 'database') {
        dbView.classList.remove('hidden');
        genericView.classList.add('hidden');
        loadCollectionData(document.querySelector('select').value);
    } else {
        dbView.classList.add('hidden');
        genericView.classList.remove('hidden');
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.className = "tab-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-[#1e2235] hover:text-gray-200 transition";
    });

    const activeBtn = document.getElementById(`btn-${tabId}`);
    if (activeBtn) {
        activeBtn.className = "tab-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-orange-500/10 text-orange-400 border-l-2 border-orange-500 pl-2.5 transition";
    }
}

// Setup Event Listeners once the page loads
document.addEventListener("DOMContentLoaded", () => {
    // Connect "+ Add Row" button to our new function
    const addRowBtn = document.querySelector('button[onclick=""]'); 
    // Fix inline click handlers
    document.querySelector('button.bg-orange-500').setAttribute('onclick', 'addNewRow()');
    document.querySelector('select').setAttribute('onchange', 'loadCollectionData(this.value)');
    
    // Initial data load
    loadCollectionData('users_profile');
});
