import express from "express";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  helmet({
    contentSecurityPolicy: false, // Nonaktifkan CSP saja, fitur lain tetap aktif
  })
);

app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: "Terlalu banyak permintaan, silakan coba lagi nanti"
});
app.use(limiter);

// Serve file statis
app.use(express.static(path.join(__dirname, "public"), { maxAge: "1h" }));

// ✅ Endpoint: Info IP termasuk fallback untuk localhost
app.get("/api/ip-info", async (req, res) => {
  let ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
           req.headers["x-real-ip"] ||
           req.socket.remoteAddress;

  // Fallback ke IP publik sendiri jika localhost
  const isLocalhost = ip === "127.0.0.1" || ip === "::1";
  const targetIP = isLocalhost ? "" : ip; // "" artinya API akan deteksi otomatis IP client

  const apiUrl = `https://ipapi.co/${targetIP}/json/`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "IPInfoApp/1.0",
        "Accept": "application/json"
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Status error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.reason || "API error");
    }

    res.json({
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
  } catch (error) {
    console.error("IP info error:", error.message);

    if (error.name === "AbortError") {
      return res.status(504).json({ error: "Request timeout" });
    }

    res.status(500).json({
      error: "Gagal mendapatkan info IP",
      message: error.message
    });
  }
});

// Middleware error global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Terjadi kesalahan pada server",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM diterima, menutup server...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT diterima, menutup server...");
  process.exit(0);
});
