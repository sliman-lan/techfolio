// app/profile/_layout.js
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";

export default function ProfileLayout() {
    const colorScheme = useColorScheme();
    const backgroundColor = colorScheme === "dark" ? "#000" : "#F2F2F7";

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor },
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="edit" />
            <Stack.Screen name="settings" />
            <Stack.Screen name="projects" />
            <Stack.Screen name="followers" />
            <Stack.Screen name="following" />
        </Stack>
    );
}
