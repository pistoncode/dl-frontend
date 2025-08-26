import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { usernameClient } from "better-auth/client/plugins";
 
//This need fixing -_-
const getBaseUrl = () => {

  const { Platform } = require('react-native'); 

//   if (Platform.OS === 'web') {
//     return "http://localhost:3001";
//   } else {

    return "http://192.168.100.37:3001/api/auth"; 
//   }
};

export const authClient = createAuthClient({
    baseURL: getBaseUrl(),
    plugins: [
        usernameClient(),
        expoClient({
            scheme: "deuceleague",
            storagePrefix: "deuceleague",
            storage: SecureStore,
        })
    ]
});

export const { signIn, signOut, useSession } = authClient;