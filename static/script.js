// ==========================================
// 1. BACKEND API CONFIGURATION
// ==========================================
// Replace this with your actual live Render.com URL once deployed!
const BACKEND_URL = 'https://your-backend-name.onrender.com'; 

// ==========================================
// 2. SEARCH FUNCTION
// ==========================================
async function searchContainer() {
    const searchInput = document.getElementById('searchInput').value.trim();
    
    if (!searchInput) {
        alert("Please enter a Container ID");
        return;
    }

    // Clear previous table data
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "<tr><td colspan='8'>Searching database...</td></tr>";

    try {
        // We no longer query Supabase directly. We ask our Render Backend!
        const response = await fetch(`${BACKEND_URL}/api/container/${searchInput}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        if (data && data.length > 0) {
            updateDashboard(searchInput, data);
            renderTable(data);
        } else {
            // No data found
            document.getElementById('statusCard').style.display = 'none';
            document.getElementById('tableTitle').innerText = `No items found for Container: ${searchInput}`;
            tbody.innerHTML = "<tr><td colspan='8'>No records found.</td></tr>";
        }

    } catch (error) {
        console.error("Error fetching data:", error);
        tbody.innerHTML = `<tr><td colspan='8' style="color:red;">Error connecting to backend server. Check console.</td></tr>`;
    }
}

// ==========================================
// 3. UPDATE THE DASHBOARD CARD
// ==========================================
function updateDashboard(containerId, data) {
    document.getElementById('statusCard').style.display = 'flex';
    document.getElementById('cardContainerId').innerText = `Scanned Container: ${containerId}`;
    document.getElementById('tableTitle').innerText = `List of items registered in ${containerId}`;
    document.getElementById('cardCount').innerText = data.length;

    if(data[0].storage_location) {
        document.getElementById('cardLocation').innerText = data[0].storage_location;
    }
    
    if(data[0].issuance_time) {
        const dateObj = new Date(data[0].issuance_time);
        document.getElementById('cardTime').innerText = dateObj.toLocaleString();
    }
}

// ==========================================
// 4. RENDER THE TABLE
// ==========================================
function renderTable(data) {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = ""; 

    data.forEach(row => {
        const tr = document.createElement("tr");
        
        const workOrderText = row.work_order ? row.work_order : "-";
        
        let timeText = "-";
        if(row.issuance_time){
            const d = new Date(row.issuance_time);
            timeText = d.toISOString().replace('T', ' ').substring(0, 19);
        }

        tr.innerHTML = `
            <td>${row.qr_code}</td>
            <td>${row.product}</td>
            <td>${row.product_desc}</td>
            <td>${row.qty}</td>
            <td>${row.uom}</td>
            <td>${row.storage_location}</td>
            <td>${workOrderText}</td>
            <td>${timeText}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Trigger search when pressing 'Enter' key
document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchContainer();
    }
});