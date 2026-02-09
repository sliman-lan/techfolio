// app/tabs/explore.js
import { View, Text, StyleSheet } from "react-native";

export default function ExploreScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>استكشاف</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F2F2F7",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1D1D1F",
    },
});
