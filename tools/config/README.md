# Github action script to populate keycloak configuration

## How to use

- Github secrets required

| Secret        | Usecase                               | format  |
| ------------- | ------------------------------------- | ------- |
| CLIENT_ID     | service account for keycloak          | string  |
| CLIENT_SECRET | service account for keycloak password | string  |
| SECRET_JSON   | payload keycloak values               | JSON \* |

\*JSON format expected for the github secret

```json
{
  "clients": {
    "<<clientId>>": {}
  },
  "identityProviders": {
    "<<identityName>>": {
      "data": {},
      "mappers": [{}]
    }
  }
}
```

### Tips

- If you want to execute openshift CLI commands you can do so by adding this to the github-action script

```
- name: Install oc
        uses: redhat-actions/openshift-tools-installer@v1
        with:
          oc: 4
```

You can then add in the "exec" variable in the github script portion to access it in script.js

```
with:
          script: |
            const script = require('./tools/config/script.js');
            script({github, context, core, process, exec})
```

Then use it in script.js like so

```
module.exports = async ({ _github, context, core, process, exec }) => {
    ...
    await exec.exec("oc version");
}
```
