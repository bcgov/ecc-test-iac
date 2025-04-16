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
  try {
    const response = await fetch(
      `${keycloakURL}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        }).toString(),
      }
    );

    const data = await response.json();
    const token = data.access_token;
    return token;
  } catch (error) {
    console.error("Error during token fetch:", error);
    throw new Error("Error obtaining token");
  }
}

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

  console.log(`KC_ENVIRONMENT :: ${KC_ENVIRONMENT}`);
  console.log(`KC_REALM_ID :: ${KC_REALM_ID}`);
  console.log(`KC_CLIENT_ID :: ${KC_CLIENT_ID}`);
  console.log(`KC_CLIENT_SECRET :: ${KC_CLIENT_SECRET}`);

  console.log("obtaining token");
  const token = await fetchToken(KEYCLOAK_URL, KC_CLIENT_ID, KC_CLIENT_SECRET);

  // const KEYCLOAK_URL = `https://${
  //     process.env.ENVIRONMENT !== "prod" ? `${process.env.ENVIRONMENT}.` : ""
  //   }loginproxy.gov.bc.ca/auth/realms/${process.env.REALM_ID}`;
  //   console.log(`KEYCLOAK_URL :: ${KEYCLOAK_URL}`);

  //   const KEYCLOAK_ADMIN_URL = `https://${
  //     process.env.ENVIRONMENT !== "prod" ? `${process.env.ENVIRONMENT}.` : ""
  //   }loginproxy.gov.bc.ca/auth/admin/realms/${process.env.REALM_ID}`;
  //   console.log(`KEYCLOAK_ADMIN_URL :: ${KEYCLOAK_ADMIN_URL}`);
}
