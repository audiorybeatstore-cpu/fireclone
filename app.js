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

// Helper to inject our token into all protected HTTP requests automatically
function getAuthHeaders(contentType = 'application/json') {
    const token = localStorage.getItem('fc_admin_token');
    const headers = { 'Authorization': `Bearer ${token}` };
    if (contentType && contentType !== 'multipart/form-data') {
        headers['Content-Type'] = contentType;
    }
    return headers;
}

// --- SECURE SYSTEM AUTH CONTROL PIPELINES ---
async function executeAdminRegistration() {
    const userPrompt = prompt("Define a master username credentials admin account name:");
    if (!userPrompt) return;
    const passPrompt = prompt("Define a strong operational access password token:");
    if (!passPrompt) return;

    try {
        const res = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: userPrompt, password: passPrompt })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        alert("Success! System Admin baseline registered. Log in now.");
    } catch (err) {
        alert(`Setup crash error event: ${err.message}`);
    }
}

async function executeLoginRequest() {
    const userInp = document.getElementById('auth-username').value;
    const passInp = document.getElementById('auth-password').value;

    try {
        const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: userInp, password: passInp })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        // Store secure session signature token on user machine browser context
        localStorage.setItem('fc_admin_token', data.token);
        localStorage.setItem('fc_admin_user', userInp);
        
        initializeWorkspaceSession();
    } catch (err) {
        alert(`Access Denied: ${err.message}`);
    }
}

function initializeWorkspaceSession() {
    const token = localStorage.getItem('fc_admin_token');
    if (!token) return;

    // Remove locking panels and grant control interfaces to screen nodes
    document.getElementById('auth-gateway-screen').classList.add('hidden');
    const wrap = document.getElementById('app-workspace-container');
    wrap.classList.remove('opacity-20', 'pointer-events-none');
    
    document.getElementById('display-user-profile').innerText = localStorage.getItem('fc_admin_user') || 'Admin';
    switchTab('overview');
}

function executeLogoutWorkflow() {
    localStorage.removeItem('fc_admin_token');
    localStorage.removeItem('fc_admin_user');
    window.location.reload();
}

// --- ANALYTICS CODE ---
async function loadProjectAnalytics() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/v1/analytics`);
        const stats = await response.json();
        document.getElementById('stat-requests').innerText = stats.totalRequests;
        document.getElementById('stat-uptime').innerText = stats.uptime;
        
        const dbPerm = document.getElementById('stat-db-permanence');
        if(dbPerm) dbPerm.innerText = stats.databaseSize || "0 records";
    } catch (error) {
        console.error("Analytics sync error:", error);
    }
}

// --- DATABASE CODE ---
async function loadCollectionData(collectionName) {
    const tbody = document.getElementById('database-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="3" class="p-3 text-center text-gray-500 animate-pulse">Loading authenticated records...</td></tr>`;

    try {
        const response = await fetch(`${BACKEND_URL}/api/v1/database/${collectionName}`, {
            headers: getAuthHeaders()
        });
        
        if (response.status === 401 || response.status === 403) {
            executeLogoutWorkflow();
            return;
        }

        const data = await response.json();
        tbody.innerHTML = '';
        
        if (!data || data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="p-3 text-center text-gray-500">Collection is empty. Click "+ Add Row" to test!</td></tr>`;
            return;
        }

        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-[#1e2235]/40 border-b border-gray-800";
            const displayId = row.id || row._id || "N/A";
            tr.innerHTML = `
                <td class="p-3 border-r border-gray-800 text-gray-500">${displayId}</td>
                <td class="p-3 border-r border-gray-800 text-emerald-400">"${row.username || 'N/A'}"</td>
                <td class="p-3 border-r border-gray-800 text-purple-400">${row.is_premium !== undefined ? row.is_premium : 'false'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="3" class="p-3 text-center text-red-400">Error connecting to secured database.</td></tr>`;
    }
}

async function addNewRow() {
    const currentCollection = document.querySelector('select').value;
    const randomUsernames = ["cyber_ninja", "code_wizard", "giga_dev", "alpha_tester", "stack_overlord"];
    const randomUsername = randomUsernames[Math.floor(Math.random() * randomUsernames.length)];
    const randomPremium = Math.random() < 0.5;

    try {
        const response = await fetch(`${BACKEND_URL}/api/v1/database/${currentCollection}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ username: randomUsername, is_premium: randomPremium })
        });
        
        if (!response.ok) throw new Error("Failed validation transaction payload");
        loadCollectionData(currentCollection);
    } catch (error) {
        alert("Security operation rejection event logged.");
    }
}

// --- STORAGE OPERATIONS ---
async function loadStorageData() {
    const tbody = document.getElementById('storage-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-gray-500 animate-pulse">Scanning secure storage layer...</td></tr>`;

    try {
        const response = await fetch(`${BACKEND_URL}/api/v1/storage`, { headers: getAuthHeaders() });
        const files = await response.json();
        tbody.innerHTML = '';

        if (!files || files.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-gray-500">No assets in storage bucket. Select a real file to upload.</td></tr>`;
            return;
        }

        files.forEach(file => {
            const displayFileId = file.id || file._id || "N/A";
            const tr = document.createElement('tr');
            tr.className = "hover:bg-[#1e2235]/40 border-b border-gray-800";
            tr.innerHTML = `
                <td class="p-3 border-r border-gray-800 text-gray-500 font-mono">${displayFileId}</td>
                <td class="p-3 border-r border-gray-800 text-amber-200 font-medium">
                    <a href="${file.url}" target="_blank" class="hover:underline text-orange-400 flex items-center gap-1">🔗 ${file.name}</a>
                </td>
                <td class="p-3 border-r border-gray-800 text-blue-400 select-all">${file.type}</td>
                <td class="p-3 border-r border-gray-800 font-semibold text-gray-400">${file.size}</td>
                <td class="p-3 text-center">
                    <button onclick="deleteStorageFile('${displayFileId}')" class="text-red-400 hover:text-red-500 underline hover:cursor-pointer transition">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-red-400">Failed to pull bucket objects safely.</td></tr>`;
    }
}

async function handleRealFileUpload(inputElement) {
    const file = inputElement.files[0];
    if (!file) return;

    const tbody = document.getElementById('storage-table-body');
    tbody.innerHTML = `<tr><td colspan="5" class="p-3 text-center text-orange-400 animate-pulse">Streaming verified blocks to server engine...</td></tr>`;

    const formData = new FormData();
    formData.append('fileAsset', file);

    try {
        const response = await fetch(`${BACKEND_URL}/api/v1/storage/upload`, {
            method: 'POST',
            headers: getAuthHeaders('multipart/form-data'),
            body: formData
        });

        if (!response.ok) throw new Error();
        inputElement.value = '';
        loadStorageData();
    } catch (error) {
        alert("Upload transmission dropped by firewall policies.");
        loadStorageData();
    }
}

async function deleteStorageFile(id) {
    try {
        await fetch(`${BACKEND_URL}/api/v1/storage/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
        loadStorageData();
    } catch (error) {
        alert("Deletion authentication reject.");
    }
}

// --- WORKSPACE NAVIGATION TABS ---
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
        loadStorageData();
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
    const addRowBtn = document.querySelector('button.bg-orange-500');
    if (addRowBtn) addRowBtn.setAttribute('onclick', 'addNewRow()');

    loadProjectAnalytics();

    // Check if user has an existing active session on boot load
    if (localStorage.getItem('fc_admin_token')) {
        initializeWorkspaceSession();
    }
});