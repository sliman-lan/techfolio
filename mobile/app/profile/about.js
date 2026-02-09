import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

export default function About() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>عن التطبيق</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.paragraph}>
                    Techfolio - منصة لعرض المشاريع والتواصل مع مطوري البرمجيات.
                </Text>
                <Text style={styles.paragraph}>إصدار: 1.0.0</Text>
                <Text style={styles.paragraph}>
                    هذا التطبيق هو مشروع تعليمي ويحتوي على ميزات أساسية.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
    header: { paddingTop: 60, padding: 20, backgroundColor: "#fff" },
    title: { fontSize: 20, fontWeight: "600", color: "#1D1D1F" },
    content: { padding: 20 },
    paragraph: { marginBottom: 12, color: "#333", lineHeight: 20 },
});
