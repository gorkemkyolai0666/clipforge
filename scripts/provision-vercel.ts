const VERCEL_API = "https://api.vercel.com";

function withTeamQuery(path: string): string {
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!teamId) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}teamId=${teamId}`;
}

async function vercelFetch(path: string, init: RequestInit = {}) {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    throw new Error("VERCEL_TOKEN is required");
  }

  const response = await fetch(`${VERCEL_API}${withTeamQuery(path)}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Vercel API ${path} failed (${response.status}): ${body}`);
  }

  return body ? JSON.parse(body) : null;
}

function pickProductionDomain(projectName: string, domains: string[]): string {
  const preferred = `${projectName}.vercel.app`;
  if (domains.includes(preferred)) {
    return preferred;
  }

  const simple = domains
    .filter(
      (domain) =>
        domain.endsWith(".vercel.app") &&
        !domain.includes("-git-") &&
        !domain.endsWith("projects.vercel.app"),
    )
    .sort((a, b) => a.length - b.length);

  if (simple.length > 0) {
    return simple[0];
  }

  const fallback = domains.find(
    (domain) => domain.endsWith(".vercel.app") && !domain.includes("-git-"),
  );
  return fallback ?? preferred;
}

export function resolveFrontendUrl(projectName: string, project: any): string {
  const aliases: string[] = project?.alias ?? [];
  const targetAliases: string[] = project?.targets?.production?.alias ?? [];
  const domains = [...new Set([...aliases, ...targetAliases])];
  const hostname = pickProductionDomain(projectName, domains);
  return `https://${hostname}`;
}

async function injectEnvVars(projectName: string) {
  const railwayBackendUrl = `https://${projectName}-backend-production.up.railway.app/api`;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || railwayBackendUrl;

  try {
    await vercelFetch(`/v10/projects/${projectName}/env`, {
      method: "POST",
      body: JSON.stringify({
        key: "NEXT_PUBLIC_API_URL",
        value: backendUrl,
        type: "plain",
        target: ["production", "preview", "development"],
      }),
    });
    console.log(`✅ Injected NEXT_PUBLIC_API_URL=${backendUrl} into Vercel settings.`);
  } catch {
    console.log("ℹ️ Environment variable might already exist or project is nesting keys.");
  }
}

async function triggerDeployment(projectName: string, fallbackRepoId?: string) {
  const project = await vercelFetch(`/v9/projects/${projectName}`);
  const repoId = project?.link?.repoId ?? project?.gitRepository?.repoId ?? fallbackRepoId;

  if (!repoId) {
    console.log("⚠️ No GitHub repo linked yet — Vercel integration processing, skipping deployment trigger");
    return;
  }

  const deployment = await vercelFetch("/v13/deployments", {
    method: "POST",
    body: JSON.stringify({
      name: projectName,
      target: "production",
      gitSource: {
        type: "github",
        repoId: String(repoId),
        ref: "main",
      },
    }),
  });

  console.log(`✅ Vercel production deployment triggered successfully: ${deployment?.id ?? deployment?.url ?? "ok"}`);
}

export async function prepareVercelProject(): Promise<{ frontendUrl: string; repoId?: string }> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    throw new Error("VERCEL_TOKEN is required");
  }

  const projectName = process.env.PROJECT_NAME ?? "project";
  const repo = process.env.GITHUB_REPOSITORY ?? `gorkemkyolai0666/${projectName}`;

  let project: any = null;
  let createdProjectData: any = null;

  try {
    project = await vercelFetch(`/v9/projects/${projectName}`);
    console.log(`ℹ️ Vercel project already exists: ${projectName}`);
  } catch {
    console.log(`🚀 Creating Vercel project: ${projectName}`);
    createdProjectData = await vercelFetch("/v11/projects", {
      method: "POST",
      body: JSON.stringify({
        name: projectName,
        framework: "nextjs",
        rootDirectory: "frontend",
        gitRepository: {
          type: "github",
          repo,
        },
      }),
    });
    project = createdProjectData;
    console.log(`✅ Vercel project successfully created: ${createdProjectData.name}`);
  }

  try {
    const domainData = await vercelFetch(`/v9/projects/${projectName}/domains`);
    const projectDomains = (domainData?.domains ?? [])
      .map((entry: { name?: string }) => entry.name)
      .filter(Boolean);
    if (projectDomains.length > 0) {
      project.alias = [...new Set([...(project.alias ?? []), ...projectDomains])];
    }
  } catch {
    console.log("ℹ️ Could not fetch Vercel domain list — using project aliases only");
  }

  const frontendUrl = resolveFrontendUrl(projectName, project);
  console.log(`ℹ️ Resolved Vercel production URL: ${frontendUrl}`);

  const repoId =
    project?.link?.repoId ??
    project?.gitRepository?.repoId ??
    createdProjectData?.link?.repoId ??
    createdProjectData?.gitRepository?.repoId;

  return { frontendUrl, repoId: repoId ? String(repoId) : undefined };
}

export async function finalizeVercelDeployment(repoId?: string) {
  const projectName = process.env.PROJECT_NAME ?? "project";

  try {
    await injectEnvVars(projectName);
  } catch (envError) {
    console.error("⚠️ Failed to inject env vars to Vercel:", envError);
  }

  try {
    await triggerDeployment(projectName, repoId);
  } catch (deployError) {
    console.error("⚠️ Failed to trigger Vercel deployment:", deployError);
    throw deployError;
  }
}

export async function provisionVercel() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    console.log("⚠️ VERCEL_TOKEN not set — skipping Vercel provisioning");
    return;
  }

  const { frontendUrl, repoId } = await prepareVercelProject();
  process.env.FRONTEND_URL = frontendUrl;
  await finalizeVercelDeployment(repoId);
}
