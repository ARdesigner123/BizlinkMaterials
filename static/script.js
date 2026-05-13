// ==========================================
// 1. INITIALIZE SUPABASE
// ==========================================
// REPLACE THESE with your actual URL and Anon Key from Supabase Dashboard > Settings > API
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'; 
const SUPABASE_KEY = 'YOUR_ANON_KEY'; 

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
// Note: Ensure your Supabase table is named exactly 'materials' (or change the name in the query below)

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
        // Query Supabase for all materials matching the container_id
        const { data, error } = await supabase
            .from('materials') // Change this if your table name is different
            .select('*')
            .eq('container_id', searchInput);

        if (error) throw error;

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
        tbody.innerHTML = `<tr><td colspan='8' style="color:red;">Error connecting to database. Check console.</td></tr>`;
    }
}

// ==========================================
// 3. UPDATE THE DASHBOARD CARD
// ==========================================
function updateDashboard(containerId, data) {
    // Show the card
    document.getElementById('statusCard').style.display = 'flex';
    
    // Update the text
    document.getElementById('cardContainerId').innerText = `Scanned Container: ${containerId}`;
    document.getElementById('tableTitle').innerText = `List of items registered in ${containerId}`;
    document.getElementById('cardCount').innerText = data.length;

    // Use the storage location and time from the first item in the array
    if(data[0].storage_location) {
        document.getElementById('cardLocation').innerText = data[0].storage_location;
    }
    
    if(data[0].issuance_time) {
        // Format the timestamp nicely
        const dateObj = new Date(data[0].issuance_time);
        document.getElementById('cardTime').innerText = dateObj.toLocaleString();
    }
}

// ==========================================
// 4. RENDER THE TABLE
// ==========================================
function renderTable(data) {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = ""; // Clear the "searching..." message

    data.forEach(row => {
        const tr = document.createElement("tr");
        
        // Handle potentially null work orders gracefully
        const workOrderText = row.work_order ? row.work_order : "-";
        
        // Format the date for the table
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

// Optional: Trigger search when pressing 'Enter' key in the input field
document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchContainer();
    }
});