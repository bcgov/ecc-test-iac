const axios = require("axios");

// @ts-check
/** @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments */
module.exports = async ({ _github, context, core, process }) => {
  console.log(`SHA: ${context.sha}`);
  console.log(`REF: ${context.ref}`);
  console.log("environment variables");
  console.log(process.env.REALM_ID);
  console.log(process.env.SECRET_VALUE);
  console.log(process.env.PUBLIC_VALUE);

  try {
    //ensure the json value is valid before proceeding
    JSON.parse(process.env.SECRET_JSON);
  } catch (e) {
    core.setFailed("failed parsing JSON please check github secret");
  }

  const KEYCLOAK_VALUES = JSON.parse(process.env.SECRET_JSON);

  const KEYCLOAK_URL = `https://${process.env.ENVIRONMENT}.loginproxy.gov.bc.ca/auth/realms/${process.env.REALM_ID}`;
  console.log(`KEYCLOAK_URL :: ${KEYCLOAK_URL}`);
  const KEYCLOAK_ADMIN_URL = `https://${process.env.ENVIRONMENT}.loginproxy.gov.bc.ca/auth/admin/realms/${process.env.REALM_ID}`;
  console.log(`KEYCLOAK_ADMIN_URL :: ${KEYCLOAK_ADMIN_URL}`);

  //****** helper functions ******

  //creating clients
  const getClient = async (clientId, token) => {
    console.log(`finding client ${clientId}`);
    const users = (
      await axios.get(`${KEYCLOAK_ADMIN_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).data;

    const user = users.find((user) => user.clientId === clientId);
    return user?.id;
  };

  const createClientFromJson = async (data, token) => {
    await axios.post(`${KEYCLOAK_ADMIN_URL}/clients`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  };

  const deleteClient = async (id, token) => {
    await axios.delete(`${KEYCLOAK_ADMIN_URL}/clients/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  /**
 * Recreates an existing Keycloak client.

 * This function first attempts to delete the existing client with the given ID. 
 * If the deletion is successful, it then creates a new client with the same ID 
 * using the provided configuration.

 * @async
 * @param {string} clientId - The ID of the client to recreate. 
 * @param {string} token - The access token required for Keycloak API interactions.
 * @returns {Promise<void>} - Resolves when the client is successfully recreated.
 */
  const recreateClient = async (clientId, token) => {
    const id = await getClient(clientId, token);
    if (id) {
      console.log(`deleting existing client ${clientId}`);
      await deleteClient(id, token);
    }
    console.log(`creating client ${clientId}`);
    await createClientFromJson(KEYCLOAK_VALUES.clients[clientId], token);
  };

  //identity provider functions

  const getIdentityProvider = async (identityProviderName, token) => {
    const identityProviders = (
      await axios.get(`${KEYCLOAK_ADMIN_URL}/identity-provider/instances`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    ).data;

    const identityProvider = identityProviders.find(
      (identity) => identity.alias === identityProviderName
    );
    return identityProvider?.internalId;
  };

  const deleteIdentityProvider = async (internalId, token) => {
    await axios.delete(
      `${KEYCLOAK_ADMIN_URL}/identity-provider/instances/${internalId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  const createIdentityProvider = async (identityProviderName, token) => {
    console.log(`creating identity provider :: ${identityProviderName}`);
    try {
      await axios.post(
        `${KEYCLOAK_ADMIN_URL}/identity-provider/instances`,
        KEYCLOAK_VALUES.identityProviders[identityProviderName].data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (e) {
      console.error(e.response.data.errorMessage);
    }
  };

  const postIdentityProviderMappers = async (identityProviderName, token) => {
    console.log(
      `adding mappers for identity provider :: ${identityProviderName}`
    );
    const mapperPromiseArray = KEYCLOAK_VALUES.identityProviders[
      identityProviderName
    ].mappers.map(async (mapper) => {
      try {
        console.log(`adding identity mapper:: ${mapper.name}`);
        await axios.post(
          `${KEYCLOAK_ADMIN_URL}/identity-provider/instances/${identityProviderName}/mappers`,
          mapper,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (e) {
        console.error(e.response.data.errorMessage);
      }
    });
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
   * @param {string} identityProviderName - The name of the Identity Provider to recreate.
   * @param {string} token - The access token required for Keycloak API interactions.
   * @returns {Promise<void>} - Resolves when the Identity Provider is successfully recreated.
   */
  const recreateIdentityProvider = async (identityProviderName, token) => {
    const internalId = await getIdentityProvider(identityProviderName, token);
    if (internalId) {
      console.log(`deleting identityProvider ${identityProviderName}`);
      await deleteIdentityProvider(internalId, token);
    }
    await createIdentityProvider(identityProviderName, token);
    await postIdentityProviderMappers(identityProviderName, token);
  };

  //****** end helper functions ******

  console.log("obtaining token");
  const token = (
    await axios.post(
      `${KEYCLOAK_URL}/protocol/openid-connect/token`,
      {
        grant_type: "client_credentials",
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
  ).data.access_token;

  //TODO replace remove test to try with the actual client names
  // Clients
  await recreateClient("test-childcare-ecer-dev", token);
  await recreateClient("test-childcare-ecer-api-dev", token);
  await recreateClient("test-childcare-ecer-ew-dev", token);

  // Identity providers
  await recreateIdentityProvider("test-bcsc", token);
  await recreateIdentityProvider("test-keycloak-idir", token);
};
