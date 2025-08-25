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

    // Docker environment (for colleagues using Docker)
    return "http://192.168.1.7:3001"; 
    
    // Local development (for testing without Docker)
    // return "http://localhost:3001";
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