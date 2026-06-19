const requiredForLive = [
  "INSFORGE_API_URL",
  "INSFORGE_API_KEY",
  "VAPI_API_KEY",
  "VAPI_PHONE_NUMBER_ID",
  "VAPI_WEBHOOK_URL",
  "NEBIUS_API_KEY",
  "NEBIUS_BASE_URL",
  "NEBIUS_MODEL",
];

const demoMode = process.env.SCOUT_DEMO_MODE === "true";
const missing = requiredForLive.filter((key) => !process.env[key]);

console.log(`Scout.ai env check: ${demoMode ? "demo mode" : "live mode"}`);

if (demoMode) {
  if (missing.length > 0) {
    console.log(
      `Demo mode can run without live credentials. Missing live vars: ${missing.join(", ")}`
    );
  } else {
    console.log("All live integration variables are present.");
  }
  process.exit(0);
}

if (missing.length > 0) {
  console.error(`Missing required live env vars: ${missing.join(", ")}`);
  console.error("Optional live vars: VAPI_ASSISTANT_ID, VAPI_WEBHOOK_SECRET");
  process.exit(1);
}

console.log("All required live integration variables are present.");
