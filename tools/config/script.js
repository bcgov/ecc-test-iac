// @ts-check
/** @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments */

module.exports = ({ github, context, process, core }) => {
  console.log(`SHA: ${context.sha}`);
  console.log(`REF: ${context.ref}`);
  console.log("environment variables");
  console.log(process.env.REALM_ID);
  console.log(process.env.KEYCLOAK_URL);
  console.log(process.env.SECRET_VALUE);
  console.log(process.env.PUBLIC_VALUE);

  console.log("TESTING JSON PARSING");
  try {
    //ensure the json value is valid before proceeding
    JSON.parse(process.env.SECRET_JSON);
    JSON.parse(process.env.INVALID_SECRET);
  } catch (e) {
    console.log("error parsing JSON");
    core.setFailed("script.js failed");
  }
};
