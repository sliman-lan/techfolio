// App.js
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image } from "react-native";

export default function App() {
    return (
        <View style={styles.container}>
            <Image
                source={{
                    uri: "https://via.placeholder.com/150/007AFF/fff?text=TechFolio",
                }}
                style={styles.logo}
            />
            <Text style={styles.title}>TechFolio</Text>
            <Text style={styles.subtitle}>منصة عرض المشاريع التقنية</Text>
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#007AFF",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#8E8E93",
    },
});
