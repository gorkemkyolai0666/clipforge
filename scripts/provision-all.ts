import { provisionRailway } from "./provision-railway";
import { finalizeVercelDeployment, prepareVercelProject } from "./provision-vercel";

async function main() {
  console.log("🚀 Starting infrastructure provisioning...");

  let failed = false;
  let vercelRepoId: string | undefined;

  if (process.env.VERCEL_TOKEN) {
    try {
      const vercel = await prepareVercelProject();
      process.env.FRONTEND_URL = vercel.frontendUrl;
      vercelRepoId = vercel.repoId;
      console.log(`✅ Vercel project ready (FRONTEND_URL=${vercel.frontendUrl})`);
    } catch (error) {
      console.error("❌ Vercel project preparation failed");
      console.error(error);
      failed = true;
    }
  } else {
    console.log("⚠️ VERCEL_TOKEN not set — skipping Vercel project preparation");
  }

  try {
    await provisionRailway();
    console.log("✅ Railway provisioning completed");
  } catch (error) {
    console.error("❌ Railway provisioning failed");
    console.error(error);
    failed = true;
  }

  if (process.env.VERCEL_TOKEN) {
    try {
      await finalizeVercelDeployment(vercelRepoId);
      console.log("✅ Vercel provisioning completed");
    } catch (error) {
      console.error("❌ Vercel provisioning failed");
      console.error(error);
      failed = true;
    }
  }

  if (failed) {
    console.error("💥 Provisioning completed with errors");
    process.exit(1);
  }

  console.log("🏁 Provisioning finished");
}

main().catch((error) => {
  console.error("💥 Fatal provisioning error");
  console.error(error);
  process.exit(1);
});
