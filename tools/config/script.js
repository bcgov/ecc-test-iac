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

  const KEYCLOAK_URL = `https://${process.env.ENVIRONMENT}.loginproxy.gov.bc.ca/auth/realms/${process.env.REALM_ID}`;
  console.log(`KEYCLOAK_URL :: ${KEYCLOAK_URL}`);
  const KEYCLOAK_ADMIN_URL = `https://${process.env.ENVIRONMENT}.loginproxy.gov.bc.ca/auth/admin/realms/${process.env.REALM_ID}`;
  console.log(`KEYCLOAK_ADMIN_URL :: ${KEYCLOAK_ADMIN_URL}`);

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

  try {
    //ensure the json value is valid before proceeding
    JSON.parse(process.env.SECRET_JSON);
  } catch (e) {
    core.setFailed("failed parsing JSON");
  }

  const users = (
    await axios.get(`${KEYCLOAK_ADMIN_URL}/clients`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).data;

  let userId = users.find((user) => user.clientId === "test-client-derek1")?.id;

  if (userId) {
    //userId found
    await axios.delete(`${KEYCLOAK_ADMIN_URL}/clients/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  //create user
  console.log("creating user");
  await axios.post(
    `${KEYCLOAK_ADMIN_URL}/clients`,
    process.env.SECRET_JSON.testing,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
};
