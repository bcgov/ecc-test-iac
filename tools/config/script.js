// @ts-check
/** @param {import('github-script').AsyncFunctionArguments} AsyncFunctionArguments */

module.exports = ({ github, context, process }) => {
  console.log(`SHA: ${context.sha}`);
  console.log(`REF: ${context.ref}`);
  console.log("environment variables");
  console.log(process.env.REALM_ID);
  console.log(process.env.KEYCLOAK_URL);
  console.log(process.env.SECRET_VALUE);
  console.log(process.env.PUBLIC_VALUE);

  console.log("TESTING JSON PARSING");
  try {
    console.log("========================== stringify");
    const myJson = JSON.parse(process.env.SECRET_JSON);
    console.log(myJson);

    console.log(myJson.test);
    console.log(JSON.parse(JSON.stringify(process.env.INVALID_SECRET_JSON)));

    console.log("========================== error");
    console.log(JSON.parse(process.env.INVALID_SECRET_JSON));
  } catch (e) {
    console.log("error parsing JSON");
    console.log(e);
  }
};
