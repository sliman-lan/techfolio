// app/tabs/_layout.js - تأكد من أن profile يشير للمسار الصحيح
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#007AFF",
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "الرئيسية",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="home-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="explore"
                options={{
                    title: "استكشاف",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="search-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "الملف الشخصي",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons
                            name="person-outline"
                            size={size}
                            color={color}
                        />
                    ),
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        // تأكد من أن الضغط على تبويب البروفايل يفتح صفحة البروفايل الرئيسية
                        e.preventDefault();
                        navigation.navigate("profile", { screen: "index" });
                    },
                })}
            />
        </Tabs>
    );
}
