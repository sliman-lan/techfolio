// app/project/[id].js
import React, { useState, useEffect } from "react"; // ✅ أضف React
import { useLocalSearchParams, router } from "expo-router";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProjectDetail() {
    const { id } = useLocalSearchParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadProjectDetails();
        }
    }, [id]);

    const loadProjectDetails = async () => {
        try {
            console.log(`📡 جاري تحميل المشروع ${id}...`);

            // بيانات تجريبية مؤقتاً
            const sampleProject = {
                _id: id,
                title: "مشروع تفصيلي " + id,
                description: "هذا وصف تفصيلي للمشروع رقم " + id,
                status: "قيد التنفيذ",
                budget: 15000,
                deadline: "2024-12-31",
                category: "تطوير",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // محاكاة جلب البيانات من API
            await new Promise((resolve) => setTimeout(resolve, 500));

            setProject(sampleProject);
            console.log("✅ تم تحميل المشروع:", sampleProject.title);
        } catch (error) {
            console.error("❌ خطأ في تحميل تفاصيل المشروع:", error);
            Alert.alert("خطأ", "تعذر تحميل تفاصيل المشروع");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "حذف المشروع",
            "هل أنت متأكد من رغبتك في حذف هذا المشروع؟",
            [
                { text: "إلغاء", style: "cancel" },
                {
                    text: "حذف",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // محاكاة الحذف
                            await new Promise((resolve) =>
                                setTimeout(resolve, 500),
                            );

                            Alert.alert("نجاح", "تم حذف المشروع بنجاح", [
                                {
                                    text: "حسناً",
                                    onPress: () => router.back(),
                                },
                            ]);
                        } catch (error) {
                            Alert.alert("خطأ", "فشل حذف المشروع");
                        }
                    },
                },
            ],
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>
                    جاري تحميل تفاصيل المشروع...
                </Text>
            </View>
        );
    }

    if (!project) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons
                    name="alert-circle-outline"
                    size={64}
                    color="#FF9500"
                />
                <Text style={styles.errorText}>المشروع غير موجود</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>العودة</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color="#007AFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>تفاصيل المشروع</Text>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={handleDelete}
                >
                    <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.projectHeader}>
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor:
                                    project.status === "مكتمل"
                                        ? "#34C759"
                                        : project.status === "قيد التنفيذ"
                                          ? "#007AFF"
                                          : "#FF9500",
                            },
                        ]}
                    >
                        <Text style={styles.statusText}>{project.status}</Text>
                    </View>
                </View>

                <Text style={styles.projectDescription}>
                    {project.description}
                </Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>تفاصيل المشروع</Text>
                    <View style={styles.detailsGrid}>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>تاريخ البدء</Text>
                            <Text style={styles.detailValue}>
                                {new Date(project.createdAt).toLocaleDateString(
                                    "ar-SA",
                                )}
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>
                                التاريخ المتوقع
                            </Text>
                            <Text style={styles.detailValue}>
                                {project.deadline
                                    ? new Date(
                                          project.deadline,
                                      ).toLocaleDateString("ar-SA")
                                    : "غير محدد"}
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>الميزانية</Text>
                            <Text style={styles.detailValue}>
                                {project.budget
                                    ? `${project.budget} ر.س`
                                    : "غير محددة"}
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>آخر تحديث</Text>
                            <Text style={styles.detailValue}>
                                {new Date(project.updatedAt).toLocaleDateString(
                                    "ar-SA",
                                )}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.editButton}>
                        <Ionicons
                            name="create-outline"
                            size={20}
                            color="#007AFF"
                        />
                        <Text style={styles.editButtonText}>تعديل المشروع</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F2F7",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F2F2F7",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#8E8E93",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F2F2F7",
        padding: 20,
    },
    errorText: {
        fontSize: 20,
        fontWeight: "600",
        color: "#FF9500",
        marginTop: 20,
        marginBottom: 30,
    },
    backButton: {
        padding: 5,
    },
    backButtonText: {
        color: "#007AFF",
        fontSize: 16,
        fontWeight: "600",
        marginTop: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1D1D1F",
    },
    menuButton: {
        padding: 5,
    },
    content: {
        padding: 20,
    },
    projectHeader: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    projectTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1D1D1F",
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "500",
    },
    projectDescription: {
        fontSize: 16,
        color: "#8E8E93",
        lineHeight: 24,
        marginBottom: 30,
        paddingHorizontal: 5,
    },
    section: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1D1D1F",
        marginBottom: 15,
    },
    detailsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    detailItem: {
        width: "48%",
        marginBottom: 15,
    },
    detailLabel: {
        fontSize: 14,
        color: "#8E8E93",
        marginBottom: 5,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: "500",
        color: "#1D1D1F",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    editButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        flex: 1,
        justifyContent: "center",
    },
    editButtonText: {
        marginLeft: 8,
        color: "#007AFF",
        fontWeight: "500",
    },
});
