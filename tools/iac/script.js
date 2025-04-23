import { getDevClientJson } from "./mappers/devClientMapper.js";
import { getTestClientJson } from "./mappers/testClientMapper.js";
import { getProdClientJson } from "./mappers/prodClientMapper.js";

// Helper functions
function getAndValidateEnvVars() {
  const env = {
    KC_ENVIRONMENT: process.env.KC_ENVIRONMENT,
    KC_REALM_ID: process.env.KC_REALM_ID,
    KC_CLIENT_ID: process.env.KC_CLIENT_ID,
    KC_CLIENT_SECRET: process.env.KC_CLIENT_SECRET,
  };

  let valid = true;

  for (const key in env) {
    if (!env[key]) {
      valid = false;
      console.warn(`${key} variable is not set`);
    }
  }

  if (!valid) {
    throw new Error("Environment variables are not set properly");
  }

  return env;
}

async function fetchToken(keycloakURL, clientId, clientSecret) {
  const response = await fetch(`${keycloakURL}/protocol/openid-connect/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(data);
    throw new Error("Error obtaining token");
  }
  const token = data.access_token;
  return token;
}

//************************ */
// CLIENT HELPER FUNCTIONS
//************************ */

async function getClient(token, kcAdminUrl, clientId) {
  console.log(`Getting ${clientId} with getClient`);
  const response = await fetch(`${kcAdminUrl}/clients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const clients = await response.json();
  return clients.find((c) => c.clientId === clientId);
}

async function createClient(token, kcAdminUrl, clientMap) {
  console.log(`Creating keycloak client: ${clientMap.clientId}`);
  const response = await fetch(`${kcAdminUrl}/clients`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(clientMap),
  });

  if (response.status >= 400) {
    const { status, statusText } = response;
    throw new Error(
      `An error ocurred while creating ${clientId}.\nStatus: ${status}\nMessage: ${statusText}`
    );
  }
}

async function recreateClient(token, kcAdminUrl, clientId) {
  let clientMap;

  switch (process.env.KC_ENVIRONMENT) {
    case "dev":
      console.log("Using dev client map");
      clientMap = getDevClientJson(clientId);
      break;
    case "test":
      console.log("Using test client map");
      clientMap = getTestClientJson(clientId);
      break;
    case "prod":
      console.log("Using prod client map");
      clientMap = getProdClientJson(clientId);
      break;
    default:
      throw new Error("Invalid environment. Must be dev, test, or prod.");
  }

  let existingClient = await getClient(token, kcAdminUrl, clientId);
  if (existingClient) {
    console.log(`Deleting client ${clientId}`);
    await fetch(`${kcAdminUrl}/clients/${existingClient.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  if (existingClient?.secret) {
    clientMap = Object.assign(clientMap, { secret: existingClient.secret });
  }

  await createClient(token, kcAdminUrl, clientMap);
}

//************************ */
// END CLIENT HELPER FUNCTIONS
//************************ */

export async function main() {
  const { KC_ENVIRONMENT, KC_REALM_ID, KC_CLIENT_ID, KC_CLIENT_SECRET } =
    getAndValidateEnvVars();

  const KEYCLOAK_URL = `https://${
    KC_ENVIRONMENT !== "prod" ? `${KC_ENVIRONMENT}.` : ""
  }loginproxy.gov.bc.ca/auth/realms/${KC_REALM_ID}`;
  console.log(`KEYCLOAK_URL :: ${KEYCLOAK_URL}`);

  const KEYCLOAK_ADMIN_URL = `https://${
    KC_ENVIRONMENT !== "prod" ? `${KC_ENVIRONMENT}.` : ""
  }loginproxy.gov.bc.ca/auth/admin/realms/${KC_REALM_ID}`;
  console.log(`KEYCLOAK_ADMIN_URL :: ${KEYCLOAK_ADMIN_URL}`);

  console.log("obtaining token");
  const token = await fetchToken(KEYCLOAK_URL, KC_CLIENT_ID, KC_CLIENT_SECRET);

  const clientSuffix =
    process.env.KC_ENVIRONMENT === "prod"
      ? ""
      : `-${process.env.KC_ENVIRONMENT}`;
  console.log("clientSuffix", clientSuffix);

  recreateClient(
    token,
    KEYCLOAK_ADMIN_URL,
    `childcare-ecer-api${clientSuffix}`
  );
  recreateClient(token, KEYCLOAK_ADMIN_URL, `childcare-ecer${clientSuffix}`);
  recreateClient(token, KEYCLOAK_ADMIN_URL, `childcare-ecer-ew${clientSuffix}`);
}

main();
