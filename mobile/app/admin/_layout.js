// app/admin/_layout.js
import { Stack } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { Redirect } from "expo-router";

export default function AdminLayout() {
    const { user, isCheckingAuth } = useAuth();

    if (isCheckingAuth) {
        return null; // أو شاشة تحميل
    }

    if (!user || user.role !== "admin") {
        return <Redirect href="/tabs" />;
    }

    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: "#007AFF" },
                headerTintColor: "#fff",
                headerTitleStyle: { fontWeight: "bold" },
            }}
        >
            <Stack.Screen name="index" options={{ title: "لوحة التحكم" }} />
            <Stack.Screen
                name="pending-projects"
                options={{ title: "المشاريع المعلقة" }}
            />
            <Stack.Screen
                name="users"
                options={{ title: "إدارة المستخدمين" }}
            />
            <Stack.Screen name="categories" options={{ title: "التصنيفات" }} />
        </Stack>
    );
}
