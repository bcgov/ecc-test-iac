import {
  getBCEIDIdentityProviderMap,
  getBCEIDMappers,
} from "./mappers/IdentityProviderBCEIDMapper.js";
import {
  getBCSCIdentityProviderMap,
  getBCSCMappers,
} from "./mappers/IdentityProviderBCSCMapper.js";

//************************ */
// Helper Functions
//************************ */
function getAndValidateEnvVars() {
  const env = {
    KC_ENVIRONMENT: process.env.KC_ENVIRONMENT,
    KC_REALM_ID: process.env.KC_REALM_ID,
    KC_CLIENT_ID: process.env.KC_CLIENT_ID,
    KC_CLIENT_SECRET: process.env.KC_CLIENT_SECRET,
    KC_BASIC_BCEID_CLIENT_ID: process.env.KC_BASIC_BCEID_CLIENT_ID,
    KC_BASIC_BCEID_SECRET: process.env.KC_BASIC_BCEID_SECRET,
    BC_BCSC_CLIENT_ID: process.env.KC_BCSC_CLIENT_ID,
    KC_BCSC_SECRET: process.env.KC_BCSC_SECRET,
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
// Identity Provider Helper Functions
//************************ */

const getIdentityProvider = async (token, kcAdminUrl, identityProviderName) => {
  const response = await fetch(`${kcAdminUrl}/identity-provider/instances`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  const identityProvider = data.find(
    (identity) => identity.alias === identityProviderName
  );
  return identityProvider?.internalId;
};

const createIdentityProvider = async (
  token,
  kcAdminUrl,
  identityProviderName
) => {
  console.log(`creating identity provider :: ${identityProviderName}`);

  if (identityProviderName === "bceidbasic") {
    await fetch(`${kcAdminUrl}/identity-provider/instances`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        getBCEIDIdentityProviderMap(
          process.env.KC_ENVIRONMENT,
          process.env.KC_BASIC_BCEID_CLIENT_ID,
          process.env.KC_BASIC_BCEID_SECRET
        )
      ),
    });
  } else if (identityProviderName === "bcsc") {
    await fetch(`${kcAdminUrl}/identity-provider/instances`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        getBCSCIdentityProviderMap(
          process.env.KC_ENVIRONMENT,
          process.env.KC_BCSC_CLIENT_ID,
          process.env.KC_BCSC_SECRET
        )
      ),
    });
  } else {
    throw new Error(
      `Identity provider ${identityProviderName} is not supported.`
    );
  }
};

const postIdentityProviderMappers = async (
  token,
  kcAdminUrl,
  identityProviderName,
  identityProviderMappers
) => {
  console.log(
    `adding mappers for identity provider :: ${identityProviderName}`
  );
  const mapperPromiseArray = identityProviderMappers.map(async (mapper) => {
    console.log(`adding identity mapper:: ${mapper.name}`);
    const response = await fetch(
      `${kcAdminUrl}/identity-provider/instances/${identityProviderName}/mappers`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mapper),
      }
    );

    if (response.status >= 400) {
      console.error(await response.json());
    }
  });
  console.log(`these calls will fail if they already exist`);
  await Promise.all(mapperPromiseArray);
};

/**
 * Recreates an existing Identity Provider in Keycloak.
 *
 * This function first attempts to delete the existing Identity Provider with the given name.
 * If the deletion is successful, it then creates a new Identity Provider with the same name
 * and applies the necessary mappers.
 *
 * @async
 * @param {string} token - token to authenticate.
 * @param {string} identityProviderName - The name of the Identity Provider to recreate.
 * @returns {Promise<void>} - Resolves when the Identity Provider is successfully recreated.
 */
const createIdentityProviderWithMappers = async (
  token,
  kcAdminUrl,
  identityProviderName
) => {
  if (!["bceidbasic", "bcsc"].includes(identityProviderName)) {
    throw new Error(
      `Identity provider ${identityProviderName} is not supported.`
    );
  }

  //check to see if identity provider already exists, if not create it
  const internalId = await getIdentityProvider(
    token,
    kcAdminUrl,
    identityProviderName
  );

  if (!internalId) {
    await createIdentityProvider(token, kcAdminUrl, identityProviderName);
  }

  let identityProviderMappers = [];

  if (identityProviderName === "bceidbasic") {
    identityProviderMappers = getBCEIDMappers();
  } else if (identityProviderName === "bcsc") {
    identityProviderMappers = getBCSCMappers();
  }

  await postIdentityProviderMappers(
    token,
    kcAdminUrl,
    identityProviderName,
    identityProviderMappers
  );
};

//************************ */
// End Identity Provider Helper Functions
//************************ */

//realm config
const putRealmSettings = async (token, kcAdminUrl) => {
  console.log("setting realm settings");
  const response = await fetch(kcAdminUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      loginWithEmailAllowed: false,
      duplicateEmailsAllowed: true,
    }),
  });

  if (response.status >= 400) {
    const { status, statusText } = response;
    throw new Error(
      `An error ocurred while setting realm settings.\nStatus: ${status}\nMessage: ${statusText}`
    );
  }
};

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

  //****** Settings for all environments
  await putRealmSettings(token, KEYCLOAK_ADMIN_URL);

  //****** Create identity providers if no exist
  await createIdentityProviderWithMappers(token, KEYCLOAK_ADMIN_URL, "bcsc");
  await createIdentityProviderWithMappers(
    token,
    KEYCLOAK_ADMIN_URL,
    "bceidbasic"
  );
}

main();
