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
    console.log(JSON.parse(JSON.stringify(process.env.SECRET_JSON)));
    const myJson = JSON.parse(JSON.stringify(process.env.SECRET_JSON));
    console.log(myJson.test);
    console.log(JSON.parse(JSON.stringify(process.env.INVALID_SECRET_JSON)));

    console.log("========================== parse");
    console.log(JSON.parse(process.env.SECRET_JSON));
    console.log(JSON.parse(process.env.INVALID_SECRET_JSON));
  } catch (e) {
    console.log(e);
  }
};
