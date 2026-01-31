// app/profile/_layout.js
import { Stack } from "expo-router";

export default function ProfileLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="edit" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="projects" />
        </Stack>
    );
}
