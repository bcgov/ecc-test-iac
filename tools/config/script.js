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
  console.log(KEYCLOAK_URL);

  const res = await axios.get(KEYCLOAK_URL);

  console.log("obtaining token");
  const token = (
    await axios.post(`${KEYCLOAK_URL}/protocol/openid-connect/token`, null, {
      grant_type: "client_credentials",
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    })
  ).data.access_token;

  console.log("TESTING JSON PARSING");
  try {
    //ensure the json value is valid before proceeding
    JSON.parse(process.env.SECRET_JSON);
  } catch (e) {
    core.setFailed("failed parsing JSON");
  }
};
