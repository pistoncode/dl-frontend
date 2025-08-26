import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { usernameClient } from "better-auth/client/plugins";
import { Platform } from 'react-native';
import axios from 'axios';

export const authClient = createAuthClient({
    baseURL: "http://192.168.0.3:82", // change this to your network ip address
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