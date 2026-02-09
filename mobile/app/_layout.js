// app/_layout.js
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function RootLayout() {
    return (
        <View style={{ flex: 1 }}>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="auth" />
                <Stack.Screen name="tabs" />
                <Stack.Screen name="profile" />
                <Stack.Screen name="create-project" />
                <Stack.Screen name="project/[id]" />
            </Stack>
        </View>
    );
}
