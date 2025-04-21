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

  error.style.display = "none";
  detail.style.display = "none";
  loading.style.display = "block";
  btn.disabled = true;

  try {
    const res = await fetch("/api/ip-info");
    if (!res.ok) throw new Error("Failed to fetch IP info");

    const ipData = await res.json();

    // Default location dari IP
    let latitude = ipData.location.latitude;
    let longitude = ipData.location.longitude;
    let source = "IP Geolocation";

    // Coba ambil lokasi dari browser (Geolocation API)
    if (navigator.geolocation) {
      try {
        const geo = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000
          })
        );
        latitude = geo.coords.latitude;
        longitude = geo.coords.longitude;
        source = "Browser Geolocation";
      } catch (geoErr) {
        console.warn("User denied location or error:", geoErr.message);
      }
    }

    ipAddress.innerText = `Your IP: ${ipData.ip}`;

    // Location info
    const locationFields = {
      City: ipData.location.city,
      Region: ipData.location.region,
      Country: ipData.location.country,
      Postal: ipData.location.postal,
      Latitude: latitude,
      Longitude: longitude,
      Source: source
    };
    locationTable.innerHTML = `<tr><th>Property</th><th>Value</th></tr>`;
    for (let key in locationFields) {
      locationTable.innerHTML += `<tr><td>${key}</td><td>${locationFields[key]}</td></tr>`;
    }

    // Network info
    networkTable.innerHTML = `<tr><th>Property</th><th>Value</th></tr>`;
    networkTable.innerHTML += `<tr><td>IP Address</td><td>${ipData.ip}</td></tr>`;
    networkTable.innerHTML += `<tr><td>Timestamp</td><td>${ipData.timestamp}</td></tr>`;

    mapContainer.innerHTML = `
      <iframe
        width="100%"
        height="300"
        frameborder="0"
        style="border:0; border-radius: 10px;"
        src="https://maps.google.com/maps?q=${latitude},${longitude}&z=13&output=embed"
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
