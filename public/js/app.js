document.getElementById("getIpBtn").addEventListener("click", fetchIpInfo);

async function fetchIpInfo() {
  const btn = document.getElementById("getIpBtn");
  const loading = document.getElementById("loading");
  const error = document.getElementById("error");
  const detail = document.getElementById("ipDetail");
  const ipAddress = document.getElementById("ipAddress");
  const locationTable = document.getElementById("locationTable");
  const networkTable = document.getElementById("networkTable");
  const mapContainer = document.getElementById("mapContainer");

  // Reset UI
  error.style.display = "none";
  detail.style.display = "none";
  loading.style.display = "block";
  btn.disabled = true;

  try {
    const res = await fetch("/api/ip-info");
    if (!res.ok) throw new Error("Failed to fetch IP info");

    const data = await res.json();

    // ✅ Show IP address
    ipAddress.innerText = `Your IP: ${data.ip}`;

    // ✅ Fill location table
    const locationFields = {
      City: data.location.city,
      Region: data.location.region,
      Country: data.location.country,
      Postal: data.location.postal,
      Latitude: data.location.latitude,
      Longitude: data.location.longitude,
    };
    locationTable.innerHTML = `<tr><th>Property</th><th>Value</th></tr>`;
    for (let key in locationFields) {
      locationTable.innerHTML += `<tr><td>${key}</td><td>${locationFields[key]}</td></tr>`;
    }

    // ✅ Fill network table (data dari IP API bisa ditambah, misal ISP jika tersedia)
    networkTable.innerHTML = `<tr><th>Property</th><th>Value</th></tr>`;
    networkTable.innerHTML += `<tr><td>IP Address</td><td>${data.ip}</td></tr>`;
    networkTable.innerHTML += `<tr><td>Timestamp</td><td>${data.timestamp}</td></tr>`;

    // ✅ Map (Google Maps iframe)
    mapContainer.innerHTML = `
      <iframe
        width="100%"
        height="300"
        frameborder="0"
        style="border:0; border-radius: 10px;"
        src="https://maps.google.com/maps?q=${data.location.latitude},${data.location.longitude}&z=13&output=embed"
        allowfullscreen>
      </iframe>
    `;

    detail.style.display = "block";
  } catch (err) {
    console.error("Error:", err.message);
    error.style.display = "block";
  } finally {
    loading.style.display = "none";
    btn.disabled = false;
  }
}
