document.addEventListener("DOMContentLoaded", function () {
    const getIpBtn = document.getElementById("getIpBtn");
    const loading = document.getElementById("loading");
    const error = document.getElementById("error");
    const ipDetail = document.getElementById("ipDetail");
    const ipAddress = document.getElementById("ipAddress");
    const locationTable = document.getElementById("locationTable");
    const networkTable = document.getElementById("networkTable");
    const mapContainer = document.getElementById("mapContainer");
  
    getIpBtn.addEventListener("click", fetchIpInfo);
  
    async function fetchIpInfo() {
      error.style.display = "none";
      ipDetail.style.display = "none";
      getIpBtn.disabled = true;
      loading.style.display = "block";
  
      try {
        const response = await fetch("/api/ip-info");
        if (!response.ok) throw new Error("Network error");
  
        const data = await response.json();
        displayIpInfo(data);
      } catch (err) {
        console.error(err);
        error.style.display = "block";
      } finally {
        loading.style.display = "none";
        getIpBtn.disabled = false;
      }
    }
  
    function displayIpInfo(data) {
      const location = data.location || {};
  
      ipAddress.textContent = `Your IP: ${data.ip}`;
      clearTable(locationTable);
      clearTable(networkTable);
  
      addRow(locationTable, "Country", location.country || "Unknown");
      addRow(locationTable, "Region", location.region || "Unknown");
      addRow(locationTable, "City", location.city || "Unknown");
      addRow(locationTable, "Postal", location.postal || "Unknown");
      addRow(locationTable, "Latitude", location.latitude || "Unknown");
      addRow(locationTable, "Longitude", location.longitude || "Unknown");
  
      addRow(networkTable, "ISP", location.org || "Unavailable");
      addRow(networkTable, "ASN", location.asn || "Unavailable");
      addRow(networkTable, "Connection Type", location.connection_type || "Unavailable");
  
      if (location.latitude && location.longitude) {
        const lat = location.latitude;
        const lon = location.longitude;
        const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.05},${lat - 0.05},${lon + 0.05},${lat + 0.05}&layer=mapnik&marker=${lat},${lon}`;
  
        mapContainer.innerHTML = `
          <h3>Location on Map</h3>
          <iframe width="100%" height="300" frameborder="0" scrolling="no" src="${mapUrl}" style="border-radius: 8px;"></iframe>
          <p><small>${location.city || ""}, ${location.region || ""}, ${location.country || ""}</small></p>
        `;
      } else {
        mapContainer.innerHTML = "<p>Map not available</p>";
      }
  
      ipDetail.style.display = "block";
    }
  
    function clearTable(table) {
      while (table.rows.length > 1) {
        table.deleteRow(1);
      }
    }
  
    function addRow(table, prop, val) {
      const row = table.insertRow();
      row.insertCell(0).textContent = prop;
      row.insertCell(1).textContent = val;
    }
  });
  