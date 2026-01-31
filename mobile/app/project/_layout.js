// app/project/_layout.js
import { Stack } from "expo-router";

export default function ProjectLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="[id]"
                options={{
                    title: "تفاصيل المشروع",
                }}
            />
        </Stack>
    );
}
