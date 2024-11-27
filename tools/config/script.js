module.exports = ({ github, context }) => {
  console.log("==========GITHUB==========");
  console.log(github);
  console.log("============CONTEXT==========");
  console.log(context);
  return context.payload.client_payload.value;
};
