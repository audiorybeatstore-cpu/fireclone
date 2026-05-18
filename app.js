let apiKeyVisible = false;
const realApiKey = "fc_live_7x92n3k9s82j1a";
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

// --- ANALYTICS CODE ---
async function loadProjectAnalytics() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/v1/analytics`);
        const stats = await response.json();
        document.getElementById('stat-requests').innerText = stats.totalRequests;
        document.getElementById('stat-uptime').innerText = stats.uptime;
    } catch (error) {
        console.error("Analytics sync error:", error);
    }
}

// --- DATABASE CODE ---
async function loadCollectionData(collectionName) {
    const tbody = document.getElementById('database-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="3" class="p-3 text-center text-gray-500 animate-pulse">Loading data from Node.js engine...</td></tr>`;

    try {
        const response = await fetch(`${BACKEND_URL}/api/v1/database/${collectionName}`);
        const data = await response.json();
        tbody.innerHTML = '';
        
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
        tbody.innerHTML = `<tr><td colspan="3" class="p-3 text-center text-red-400">Error connecting to backend server.</td></tr>`;
    }
}

async function addNewRow() {
    const currentCollection = document.querySelector('select').value;
    const randomUsernames = ["cyber_ninja", "code_wizard", "giga_dev", "alpha_tester", "stack_overlord"];
    const randomUsername = randomUsernames[Math.floor(Math.random() * randomUsernames.length)];
    const randomPremium = Math.random() < 0.5;

    try {
        await fetch(`${BACKEND_URL}/api/v1/database/${currentCollection}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: randomUsername, is_premium: randomPremium })
        });
        loadCollectionData(currentCollection);
    } catch (error) {
        alert("Failed to add data to backend.");
    }
}

// --- NEW STORAGE CODE ---
async function loadStorageData() {
    const tbody = document.getElementById('storage-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-gray-500 animate-pulse">Scanning cloud storage layers...</td></tr>`;

    try {
        const response = await fetch(`${BACKEND_URL}/api/v1/storage`);
        const files = await response.json();
        tbody.innerHTML = '';

        if (files.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-gray-500">No assets in storage bucket. Click "Upload Fake File" to inject metrics.</td></tr>`;
            return;
        }

        files.forEach(file => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-[#1e2235]/40 border-b border-gray-800";
            tr.innerHTML = `
                <td class="p-3 border-r border-gray-800 text-gray-500 font-mono">${file.id}</td>
                <td class="p-3 border-r border-gray-800 text-amber-200 font-medium">${file.name}</td>
                <td class="p-3 border-r border-gray-800 text-blue-400 select-all">${file.type}</td>
                <td class="p-3 border-r border-gray-800 font-semibold text-gray-400">${file.size}</td>
                <td class="p-3 text-center">
                    <button onclick="deleteStorageFile('${file.id}')" class="text-red-400 hover:text-red-500 underline hover:cursor-pointer transition">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-red-400">Failed to pull bucket objects.</td></tr>`;
    }
}

async function uploadStorageFile() {
    const fakeFiles = [
        { name: "profile_song_raw.mp3", type: "audio/mpeg", size: "4.2 MB" },
        { name: "index_hero_graphic.svg", type: "image/svg+xml", size: "18 KB" },
        { name: "user_database_backup.json", type: "application/json", size: "841 KB" },
        { name: "promo_video_compressed.mp4", type: "video/mp4", size: "24.8 MB" }
    ];
    const pickedFile = fakeFiles[Math.floor(Math.random() * fakeFiles.length)];

    try {
        await fetch(`${BACKEND_URL}/api/v1/storage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pickedFile)
        });
        loadStorageData();
    } catch (error) {
        alert("Upload network transaction error.");
    }
}

async function deleteStorageFile(id) {
    try {
        await fetch(`${BACKEND_URL}/api/v1/storage/${id}`, { method: 'DELETE' });
        loadStorageData();
    } catch (error) {
        alert("Deletion payload drop error.");
    }
}

// --- WORKSPACE TAB NAVIGATION TABS ---
function switchTab(tabId) {
    document.getElementById('panel-title').innerText = tabId + " Panel";
    
    const dbView = document.getElementById('view-database');
    const overviewView = document.getElementById('view-overview');
    const storageView = document.getElementById('view-storage');

    dbView.classList.add('hidden');
    overviewView.classList.add('hidden');
    storageView.classList.add('hidden');

    if (tabId === 'database') {
        dbView.classList.remove('hidden');
        loadCollectionData(document.querySelector('select').value);
    } else if (tabId === 'overview') {
        overviewView.classList.remove('hidden');
        loadProjectAnalytics();
    } else if (tabId === 'storage') {
        storageView.classList.remove('hidden');
        loadStorageData(); // Fire storage cluster refresh fetch
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.className = "tab-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-[#1e2235] hover:text-gray-200 transition";
    });

    const activeBtn = document.getElementById(`btn-${tabId}`);
    if (activeBtn) {
        activeBtn.className = "tab-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-orange-500/10 text-orange-400 border-l-2 border-orange-500 pl-2.5 transition";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('select').setAttribute('onchange', 'loadCollectionData(this.value)');
    loadProjectAnalytics();
});
