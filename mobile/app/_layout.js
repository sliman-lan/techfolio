// mobile/app/_layout.js
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/context/AuthContext";

export default function RootLayout() {
    return (
        <AuthProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="auth/login" />
                <Stack.Screen name="tabs" />
                <Stack.Screen name="profile" />
                <Stack.Screen name="project/[id]" />
            </Stack>
        </AuthProvider>
    );
}
