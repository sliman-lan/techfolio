import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { projectsAPI } from "../services/api";

export default function Home({ navigation }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await projectsAPI.list();
                setProjects(res.data || []);
            } catch (err) {
                setError(err.message || "Network error");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading)
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    if (error)
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error}</Text>
            </View>
        );

    return (
        <View style={styles.container}>
            <FlatList
                data={projects}
                keyExtractor={(i) => i._id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() =>
                            navigation.navigate("ProjectDetail", {
                                id: item._id,
                            })
                        }
                    >
                        <Text style={styles.title}>{item.title}</Text>
                        {item.shortDescription ? (
                            <Text style={styles.short}>
                                {item.shortDescription}
                            </Text>
                        ) : null}
                        <Text style={styles.meta}>
                            By: {item.userId?.name || "Unknown"}
                        </Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 12 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    card: {
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
    },
    title: { fontSize: 16, fontWeight: "600" },
    short: { color: "#444", marginTop: 6 },
    meta: { marginTop: 8, color: "#666", fontSize: 12 },
    error: { color: "red" },
});
