/**
 * Retrieves the identity provider mapping for BCSC based on the Keycloak environment.
 *
 * @function getBCSCIdentityProviderMap
 * @param {string} kcEnvironment - The Keycloak environment (dev, test, or prod).
 * @param {string} clientId - The client ID for the identity provider.
 * @param {string} clientSecret - The client secret for the identity provider.
 */
function getBCEIDIdentityProviderMap(kcEnvironment, clientId, clientSecret) {
  if (!clientId || !clientSecret) {
    throw new Error("Client ID and Client Secret are required.");
  }

  let baseURL = "https://loginproxy.gov.bc.ca";

  if (kcEnvironment === "dev") {
    baseURL = "https://dev.loginproxy.gov.bc.ca";
  } else if (kcEnvironment === "test") {
    baseURL = "https://test.loginproxy.gov.bc.ca";
  }

  console.log(`Base URL: ${baseURL}`);

  return {
    alias: "bceidbasic",
    displayName: "bceidbasic (ECER)",
    providerId: "oidc",
    enabled: true,
    updateProfileFirstLoginMode: "on",
    trustEmail: false,
    storeToken: false,
    addReadTokenRoleOnCreate: false,
    authenticateByDefault: false,
    linkOnly: false,
    hideOnLogin: true,
    firstBrokerLoginFlowAlias: "first broker login",
    config: {
      tokenUrl: `${baseURL}/auth/realms/standard/protocol/openid-connect/token`,
      acceptsPromptNoneForwardFromClient: "false",
      jwksUrl: `${baseURL}/auth/realms/standard/protocol/openid-connect/certs`,
      isAccessTokenJWT: "false",
      filteredByClaim: "false",
      backchannelSupported: "false",
      issuer: `${baseURL}/auth/realms/standard`,
      loginHint: "false",
      clientAuthMethod: "client_secret_post",
      syncMode: "FORCE",
      clientSecret: clientSecret,
      allowedClockSkew: "0",
      defaultScope: "openid profile email",
      validateSignature: "true",
      userInfoUrl: `${baseURL}/auth/realms/standard/protocol/openid-connect/userinfo`,
      clientId: clientId,
      uiLocales: "false",
      disableNonce: "false",
      useJwksUrl: "true",
      sendClientIdOnLogout: "false",
      pkceEnabled: "false",
      authorizationUrl: `${baseURL}/auth/realms/standard/protocol/openid-connect/auth?kc_idp_hint=bceidbasic`,
      disableUserInfo: "false",
      logoutUrl: `${baseURL}/auth/realms/standard/protocol/openid-connect/logout`,
      sendIdTokenOnLogout: "true",
      passMaxAge: "false",
    },
  };
}

function getBCEIDMappers() {
  console.log("getting BCIED mappers");
  return [
    {
      name: "display_name",
      identityProviderAlias: "bceidbasic",
      identityProviderMapper: "oidc-user-attribute-idp-mapper",
      config: {
        syncMode: "INHERIT",
        claims: "[]",
        claim: "display_name",
        "user.attribute": "display_name",
      },
    },
    {
      name: "bceid_user_guid",
      identityProviderAlias: "bceidbasic",
      identityProviderMapper: "oidc-user-attribute-idp-mapper",
      config: {
        syncMode: "INHERIT",
        claims: "[]",
        claim: "bceid_user_guid",
        "user.attribute": "sub",
      },
    },
    {
      name: "username",
      identityProviderAlias: "bceidbasic",
      identityProviderMapper: "oidc-username-idp-mapper",
      config: {
        syncMode: "INHERIT",
        template: "${CLAIM.bceid_user_guid}@${ALIAS}",
      },
    },
    {
      name: "given_name",
      identityProviderAlias: "bceidbasic",
      identityProviderMapper: "oidc-user-attribute-idp-mapper",
      config: {
        syncMode: "INHERIT",
        claim: "given_name",
        "user.attribute": "firstName",
      },
    },
    {
      name: "identity_provider",
      identityProviderAlias: "bceidbasic",
      identityProviderMapper: "oidc-user-attribute-idp-mapper",
      config: {
        syncMode: "INHERIT",
        claim: "identity_provider",
        "user.attribute": "identity_provider",
      },
    },
    {
      name: "family_name",
      identityProviderAlias: "bceidbasic",
      identityProviderMapper: "oidc-user-attribute-idp-mapper",
      config: {
        syncMode: "INHERIT",
        "attribute.value": "lastName",
        attribute: "family_name",
      },
    },
    {
      name: "email",
      identityProviderAlias: "bceidbasic",
      identityProviderMapper: "oidc-user-attribute-idp-mapper",
      config: {
        syncMode: "INHERIT",
        claims: "[]",
        claim: "email",
        "user.attribute": "email",
      },
    },
  ];
}

export { getBCEIDIdentityProviderMap, getBCEIDMappers };
