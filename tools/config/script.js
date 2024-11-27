const axios = require("axios");

// @ts-check
/** @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments */
module.exports = async ({ github, context, core, process }) => {
  console.log(`SHA: ${context.sha}`);
  console.log(`REF: ${context.ref}`);
  console.log("environment variables");
  console.log(process.env.REALM_ID);
  console.log(process.env.KEYCLOAK_URL);
  console.log(process.env.SECRET_VALUE);
  console.log(process.env.PUBLIC_VALUE);

  const res = await axios.get("https://www.google.com");
  console.log(res);

  console.log("TESTING JSON PARSING");
  try {
    //ensure the json value is valid before proceeding
    JSON.parse(process.env.SECRET_JSON);
  } catch (e) {
    core.setFailed("failed parsing JSON");
  }
};
