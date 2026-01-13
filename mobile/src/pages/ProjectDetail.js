import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { projectsAPI } from "../services/api";

export default function ProjectDetail({ route }) {
    const { id } = route.params || {};
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await projectsAPI.get(id);
                setProject(res.data || null);
            } catch (err) {
                setError(err.message || "Network error");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetch();
    }, [id]);

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
    if (!project)
        return (
            <View style={styles.center}>
                <Text>Project not found</Text>
            </View>
        );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{project.title}</Text>
            {project.shortDescription ? (
                <Text style={styles.short}>{project.shortDescription}</Text>
            ) : null}
            <Text style={styles.meta}>
                By: {project.userId?.name || "Unknown"}
            </Text>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.desc}>{project.description}</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 12 },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
    title: { fontSize: 20, fontWeight: "700" },
    short: { color: "#444", marginTop: 6 },
    meta: { marginTop: 8, color: "#666", fontSize: 12 },
    sectionTitle: { marginTop: 12, fontWeight: "600" },
    desc: { marginTop: 6, lineHeight: 20 },
    error: { color: "red" },
});
