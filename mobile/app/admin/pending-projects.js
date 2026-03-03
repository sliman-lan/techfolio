// app/admin/pending-projects.js
import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Modal,
    TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { projectsAPI } from "../../src/services/api";

export default function PendingProjects() {
    const router = useRouter();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [rejectionModal, setRejectionModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const loadProjects = useCallback(async () => {
        try {
            const response = await projectsAPI.getPendingProjects();
            setProjects(response.data || []);
        } catch (error) {
            console.error("خطأ في تحميل المشاريع المعلقة:", error);
            Alert.alert("خطأ", "فشل تحميل المشاريع");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProjects();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadProjects();
        setRefreshing(false);
    }, []);

    const handleApprove = (projectId) => {
        Alert.alert("موافقة", "هل أنت متأكد من الموافقة على هذا المشروع؟", [
            { text: "إلغاء", style: "cancel" },
            {
                text: "موافقة",
                onPress: async () => {
                    try {
                        await projectsAPI.reviewProject(projectId, "approve");
                        Alert.alert("نجاح", "تمت الموافقة على المشروع");
                        loadProjects();
                    } catch (error) {
                        Alert.alert("خطأ", "فشل في الموافقة على المشروع");
                    }
                },
            },
        ]);
    };

    const handleReject = (project) => {
        setSelectedProject(project);
        setRejectionModal(true);
    };

    const submitRejection = async () => {
        if (!rejectionReason.trim()) {
            Alert.alert("تنبيه", "الرجاء إدخال سبب الرفض");
            return;
        }
        try {
            await projectsAPI.reviewProject(
                selectedProject._id,
                "reject",
                rejectionReason,
            );
            Alert.alert("نجاح", "تم رفض المشروع");
            setRejectionModal(false);
            setRejectionReason("");
            setSelectedProject(null);
            loadProjects();
        } catch (error) {
            Alert.alert("خطأ", "فشل في رفض المشروع");
        }
    };

    const renderProjectItem = ({ item }) => (
        <View style={styles.projectCard}>
            <View style={styles.projectHeader}>
                <Text style={styles.projectTitle}>{item.title}</Text>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.category}</Text>
                </View>
            </View>
            <Text style={styles.projectDescription} numberOfLines={2}>
                {item.description}
            </Text>
            <View style={styles.projectMeta}>
                <View style={styles.metaItem}>
                    <Ionicons name="person-outline" size={14} color="#8E8E93" />
                    <Text style={styles.metaText}>
                        {item.userId?.name || "مستخدم"}
                    </Text>
                </View>
                <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color="#8E8E93" />
                    <Text style={styles.metaText}>
                        {new Date(item.createdAt).toLocaleDateString("ar-EG")}
                    </Text>
                </View>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApprove(item._id)}
                >
                    <Ionicons name="checkmark-outline" size={18} color="#fff" />
                    <Text style={styles.actionText}>موافقة</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(item)}
                >
                    <Ionicons name="close-outline" size={18} color="#fff" />
                    <Text style={styles.actionText}>رفض</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() => router.push(`/project/${item._id}`)}
                >
                    <Ionicons name="eye-outline" size={18} color="#007AFF" />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={projects}
                renderItem={renderProjectItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons
                            name="checkmark-done-outline"
                            size={60}
                            color="#C7C7CC"
                        />
                        <Text style={styles.emptyText}>
                            لا توجد مشاريع معلقة
                        </Text>
                    </View>
                }
            />

            {/* مودال سبب الرفض */}
            <Modal visible={rejectionModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>سبب الرفض</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="اكتب سبب الرفض..."
                            value={rejectionReason}
                            onChangeText={setRejectionReason}
                            multiline
                            numberOfLines={3}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancel]}
                                onPress={() => {
                                    setRejectionModal(false);
                                    setRejectionReason("");
                                }}
                            >
                                <Text style={styles.modalCancelText}>
                                    إلغاء
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.modalConfirm,
                                ]}
                                onPress={submitRejection}
                            >
                                <Text style={styles.modalConfirmText}>
                                    تأكيد الرفض
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    listContainer: { padding: 15 },
    projectCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    projectHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    projectTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1D1D1F",
        flex: 1,
    },
    categoryBadge: {
        backgroundColor: "#E5F1FF",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    categoryText: { fontSize: 12, color: "#007AFF", fontWeight: "500" },
    projectDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        marginBottom: 10,
    },
    projectMeta: { flexDirection: "row", marginBottom: 15, gap: 15 },
    metaItem: { flexDirection: "row", alignItems: "center" },
    metaText: { fontSize: 13, color: "#8E8E93", marginLeft: 4 },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 10,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    approveButton: { backgroundColor: "#34C759" },
    rejectButton: { backgroundColor: "#FF3B30" },
    viewButton: { backgroundColor: "#E5E5EA" },
    actionText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 5,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: { fontSize: 16, color: "#8E8E93", marginTop: 10 },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        width: "80%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 15,
        textAlign: "center",
    },
    modalInput: {
        borderWidth: 1,
        borderColor: "#E5E5EA",
        borderRadius: 12,
        padding: 12,
        minHeight: 80,
        textAlignVertical: "top",
        marginBottom: 20,
    },
    modalButtons: { flexDirection: "row", justifyContent: "space-between" },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 12,
        alignItems: "center",
        marginHorizontal: 5,
    },
    modalCancel: { backgroundColor: "#F2F2F7" },
    modalCancelText: { color: "#1D1D1F", fontWeight: "600" },
    modalConfirm: { backgroundColor: "#FF3B30" },
    modalConfirmText: { color: "#fff", fontWeight: "600" },
});
