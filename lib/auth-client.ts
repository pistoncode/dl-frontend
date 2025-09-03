import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { usernameClient, emailOTPClient } from "better-auth/client/plugins";
import { getBackendBaseURL, logNetworkConfig } from "../src/config/network";
 
// Log network configuration in development
logNetworkConfig();

export const authClient = createAuthClient({
    baseURL: getBackendBaseURL(),
    plugins: [
        usernameClient(),
        emailOTPClient(),
        expoClient({
            scheme: "deuceleague",
            storagePrefix: "deuceleague",
            storage: SecureStore,
        })
    ]
});

export const { signIn, signOut, useSession } = authClient;