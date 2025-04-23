/**
 * Retrieves the identity provider mapping for BCSC based on the Keycloak environment.
 *
 * @function getBCSCIdentityProviderMap
 * @param {string} kcEnvironment - The Keycloak environment (dev, test, or prod).
 * @param {string} clientId - The client ID for the identity provider.
 * @param {string} clientSecret - The client secret for the identity provider.
 */
function getBCSCIdentityProviderMap(kcEnvironment, clientId, clientSecret) {
  if (!clientId || !clientSecret) {
    throw new Error("Client ID and Client Secret are required.");
  }

  let baseURL = "https://id.gov.bc.ca";

  if (kcEnvironment === "dev" || kcEnvironment === "test") {
    baseURL = "https://idtest.gov.bc.ca";
  }

  console.log(`Base URL: ${baseURL}`);

  return {
    alias: "bcsc",
    displayName: "bcsc",
    providerId: "oidc",
    enabled: true,
    updateProfileFirstLoginMode: "on",
    trustEmail: true,
    storeToken: false,
    addReadTokenRoleOnCreate: false,
    authenticateByDefault: false,
    linkOnly: false,
    firstBrokerLoginFlowAlias: "first broker login",
    config: {
      tokenUrl: `${baseURL}/oauth2/token`,
      acceptsPromptNoneForwardFromClient: "false",
      jwksUrl: `${baseURL}/oauth2/jwk`,
      isAccessTokenJWT: "false",
      filteredByClaim: "false",
      backchannelSupported: "false",
      issuer: `${baseURL}/oauth2/`,
      loginHint: "false",
      clientAuthMethod: "client_secret_post",
      syncMode: "FORCE",
      clientSecret: clientSecret,
      allowedClockSkew: "0",
      defaultScope: "openid profile email address",
      hideOnLoginPage: "true",
      userInfoUrl: `${baseURL}/oauth2/userinfo`,
      validateSignature: "true",
      clientId: clientId,
      uiLocales: "false",
      disableNonce: "false",
      useJwksUrl: "true",
      sendClientIdOnLogout: "false",
      pkceEnabled: "false",
      metadataDescriptorUrl: `${baseURL}/oauth2/.well-known/openid-configuration`,
      authorizationUrl: `${baseURL}/login/oidc/authorize`,
      disableUserInfo: "false",
      sendIdTokenOnLogout: "true",
      passMaxAge: "false",
    },
  };
}

function getBCSCMappers() {
  console.log("getting BCSC mappers");
  return [
    {
      name: "display_name",
      identityProviderAlias: "bcsc",
      identityProviderMapper: "oidc-user-attribute-idp-mapper",
      config: {
        syncMode: "INHERIT",
        claims: "[]",
        claim: "display_name",
        "user.attribute": "display_name",
      },
    },
    {
      name: "identity_provider",
      identityProviderAlias: "bcsc",
      identityProviderMapper: "hardcoded-attribute-idp-mapper",
      config: {
        syncMode: "INHERIT",
        "attribute.value": "bcsc",
        attribute: "identity_provider",
      },
    },
    {
      name: "sub",
      identityProviderAlias: "bcsc",
      identityProviderMapper: "oidc-user-attribute-idp-mapper",
      config: {
        syncMode: "INHERIT",
        claims: "[]",
        claim: "sub",
        "user.attribute": "sub",
      },
    },
    {
      name: "username",
      identityProviderAlias: "bcsc",
      identityProviderMapper: "oidc-username-idp-mapper",
      config: {
        syncMode: "INHERIT",
        claims: "[]",
        template: "${CLAIM.sub}@${ALIAS}",
      },
    },
    {
      name: "given_name",
      identityProviderAlias: "bcsc",
      identityProviderMapper: "oidc-user-attribute-idp-mapper",
      config: {
        syncMode: "INHERIT",
        claim: "given_name",
        "user.attribute": "firstName",
      },
    },
    {
      name: "address",
      identityProviderAlias: "bcsc",
      identityProviderMapper: "oidc-user-attribute-idp-mapper",
      config: {
        syncMode: "INHERIT",
        claims: "[]",
        claim: "address",
        "user.attribute": "address",
      },
    },
    {
      name: "given_names",
      identityProviderAlias: "bcsc",
      identityProviderMapper: "oidc-user-attribute-idp-mapper",
      config: {
        syncMode: "INHERIT",
        claims: "[]",
        claim: "given_names",
        "user.attribute": "given_names",
      },
    },
    {
      name: "birthdate",
      identityProviderAlias: "bcsc",
      identityProviderMapper: "oidc-user-attribute-idp-mapper",
      config: {
        syncMode: "INHERIT",
        claims: "[]",
        claim: "birthdate",
        "user.attribute": "birthdate",
      },
    },
    {
      name: "family_name",
      identityProviderAlias: "bcsc",
      identityProviderMapper: "oidc-user-attribute-idp-mapper",
      config: {
        syncMode: "INHERIT",
        claims: "[]",
        claim: "family_name",
        "user.attribute": "lastName",
      },
    },
  ];
}

export { getBCSCIdentityProviderMap, getBCSCMappers };
