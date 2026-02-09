// app/profile/_layout.js - معدل
import { Stack } from "expo-router";

export default function ProfileLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="edit" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="projects" />
            <Stack.Screen name="followers" />
            <Stack.Screen name="following" />
        </Stack>
    );
}
