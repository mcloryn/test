export default async function handler(req, res) {
    let ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
             req.headers["x-real-ip"] ||
             req.socket.remoteAddress;
  
    const isLocalhost = ip === "127.0.0.1" || ip === "::1";
    const targetIP = isLocalhost ? "" : ip;
  
    const apiUrl = `https://ipapi.co/${targetIP}/json/`;
  
    try {
      const response = await fetch(apiUrl, {
        headers: {
          "User-Agent": "IPInfoApp/1.0",
          "Accept": "application/json"
        }
      });
  
      const data = await response.json();
  
      if (data.error) {
        throw new Error(data.reason || "API error");
      }
  
      res.status(200).json({
        ip: isLocalhost ? "localhost (detected via external)" : ip,
        timestamp: new Date().toISOString(),
        location: {
          city: data.city,
          region: data.region,
          country: data.country_name,
          latitude: data.latitude,
          longitude: data.longitude,
          postal: data.postal
        }
      });
    } catch (err) {
      console.error("Error:", err.message);
      res.status(500).json({ error: "Gagal mendapatkan info IP", message: err.message });
    }
  }
  