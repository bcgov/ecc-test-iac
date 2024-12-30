# Github action script to populate keycloak configuration

## how to use

- Github secrets required

| Secret        | Usecase                               | format  |
| ------------- | ------------------------------------- | ------- |
| CLIENT_ID     | service account for keycloak          | string  |
| CLIENT_SECRET | service account for keycloak password | string  |
| PAYLOAD_JSON  | payload                               | JSON \* |

\*JSON format expected for the github secret

```json
{
    "clients": {
        "<<clientId>>": {}
    },
    "identityProviders": {
        "<<identityName>>": {}
        "mappers": {
            "<<mapperName>>": {}
        }
    }
}
```
