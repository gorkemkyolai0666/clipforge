import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";

export async function provisionRailway() {
  console.log("🚀 Starting Railway Provisioning via Shell Script...");
  
  const token = process.env.RAILWAY_API_TOKEN;
  if (!token) {
    console.log("⚠️ RAILWAY_API_TOKEN not set — skipping Railway provisioning");
    return;
  }

  // Proje kök dizinindeki bash script'inin yolunu buluyoruz
  const scriptPath = path.join(process.cwd(), "scripts", "provision-railway.sh");
  
  if (!fs.existsSync(scriptPath)) {
    throw new Error(`❌ Railway script not found at: ${scriptPath}`);
  }

  try {
    // Bash script'ine çalıştırma izni verip tetikliyoruz
    execSync(`chmod +x "${scriptPath}"`, { stdio: "inherit" });
    execSync(`bash "${scriptPath}"`, {
      stdio: "inherit",
      env: { ...process.env }
    });
    console.log("✅ Railway Shell Script executed successfully!");
  } catch (error) {
    console.error("❌ Error executing Railway shell script:", error);
    throw error;
  }
}