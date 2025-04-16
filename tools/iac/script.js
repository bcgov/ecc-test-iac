// Helper functions
function getAndValidateEnvVars() {
  const env = {
    KC_ENVIRONMENT: process.env.KC_ENVIRONMENT,
    KC_REALM_ID: process.env.KC_REALM_ID,
    KC_CLIENT_ID: process.env.KC_CLIENT_ID,
    KC_CLIENT_SECRET: process.env.KC_CLIENT_SECRET,
  };

  for (const value of Object.values(env)) {
    if (!value) {
      throw new Error("Environment variables may be missing");
    }
  }

  return env;
}

function checkEnvVars(envVars) {
  for (const value of Object.values(envVars)) {
    if (!value) {
      throw new Error("Environment variables may be missing");
    }
  }
}

export async function main() {
  const { KC_ENVIRONMENT, KC_REALM_ID, KC_CLIENT_ID, KC_CLIENT_SECRET } =
    getAndValidateEnvVars();

  console.log(`KC_ENVIRONMENT :: ${KC_ENVIRONMENT}`);
  console.log(`KC_REALM_ID :: ${KC_REALM_ID}`);
  console.log(`KC_CLIENT_ID :: ${KC_CLIENT_ID}`);
  console.log(`KC_CLIENT_SECRET :: ${KC_CLIENT_SECRET}`);

  const test = {
    KC_ENVIRONMENT: KC_ENVIRONMENT,
    KC_REALM_ID: KC_REALM_ID,
    KC_CLIENT_ID: KC_CLIENT_ID,
    KC_CLIENT_SECRET: KC_CLIENT_SECRET,
  };

  console.log("does this show secrets?");
  console.log(test);

  // const KEYCLOAK_URL = `https://${
  //     process.env.ENVIRONMENT !== "prod" ? `${process.env.ENVIRONMENT}.` : ""
  //   }loginproxy.gov.bc.ca/auth/realms/${process.env.REALM_ID}`;
  //   console.log(`KEYCLOAK_URL :: ${KEYCLOAK_URL}`);

  //   const KEYCLOAK_ADMIN_URL = `https://${
  //     process.env.ENVIRONMENT !== "prod" ? `${process.env.ENVIRONMENT}.` : ""
  //   }loginproxy.gov.bc.ca/auth/admin/realms/${process.env.REALM_ID}`;
  //   console.log(`KEYCLOAK_ADMIN_URL :: ${KEYCLOAK_ADMIN_URL}`);
}
