import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

export default function Privacy() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>الخصوصية والأمان</Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.paragraph}>
                    سياسة الخصوصية هذه توضح كيفية تعاملنا مع بياناتك. يتم تخزين
                    بعض المعلومات محلياً على جهازك وبعضها على الخادم لتحسين
                    تجربتك. يمكنك تعديل إعدادات الخصوصية من هنا.
                </Text>
                <Text style={styles.paragraph}>
                    ملاحظة: حالياً إعدادات الخصوصية للتوضيح فقط. لم يتم ربط كل
                    خيارات الخصوصية بآليات تنفيذ كاملة.
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
