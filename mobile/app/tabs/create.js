// app/tabs/create.js
import { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    Image,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { projectsAPI } from "../../src/services/api";
import { useAuth } from "../../src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const CATEGORIES = [
    { label: "ويب", value: "web" },
    { label: "موبايل", value: "mobile" },
    { label: "ذكاء اصطناعي", value: "ai" },
    { label: "تصميم", value: "design" },
    { label: "أخرى", value: "other" },
];

export default function Create() {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [category, setCategory] = useState(CATEGORIES[0].value);
    const [tags, setTags] = useState("");
    const [technologies, setTechnologies] = useState("");
    const [demoUrl, setDemoUrl] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    // التحقق من أن المستخدم طالب
    useEffect(() => {
        if (user && user.role !== "student") {
            Alert.alert("غير مسموح", "فقط الطلاب يمكنهم إنشاء مشاريع", [
                { text: "عودة", onPress: () => router.back() },
            ]);
        }
    }, [user]);

    const pickImages = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("صلاحية مطلوبة", "الرجاء السماح بالوصول إلى الصور");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
        });
        if (!result.canceled) {
            setImages(result.assets);
        }
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleCreate = async () => {
        if (!title.trim() || !description.trim()) {
            Alert.alert("خطأ", "العنوان والوصف مطلوبان");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", title.trim());
            formData.append("description", description.trim());
            if (shortDescription)
                formData.append("shortDescription", shortDescription.trim());
            formData.append("category", category);
            tags.split(",")
                .map((t) => t.trim())
                .filter((t) => t)
                .forEach((t) => formData.append("tags", t));
            technologies
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t)
                .forEach((t) => formData.append("technologies", t));
            if (demoUrl) formData.append("demoUrl", demoUrl.trim());
            if (githubUrl) formData.append("githubUrl", githubUrl.trim());

            images.forEach((img, idx) => {
                const uri = img.uri;
                const filename = uri.split("/").pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : "image/jpeg";
                formData.append("images", { uri, name: filename, type });
            });

            await projectsAPI.create(formData);
            Alert.alert("نجاح", "تم إنشاء المشروع وهو بانتظار مراجعة المشرف", [
                {
                    text: "حسناً",
                    onPress: () => router.push("/profile/projects"),
                },
            ]);
        } catch (error) {
            Alert.alert(
                "خطأ",
                error.response?.data?.message || "فشل إنشاء المشروع",
            );
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== "student") {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>
                    عذراً، فقط الطلاب يمكنهم إنشاء مشاريع.
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.button}
                >
                    <Text>عودة</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>إنشاء مشروع جديد</Text>
                <Text style={styles.note}>
                    سيتم مراجعة المشروع من قبل المشرف قبل النشر
                </Text>
            </View>

            <View style={styles.form}>
                {/* الحقول كما هي من قبل، مع إضافة شرط loading */}
                <Text style={styles.label}>العنوان *</Text>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    editable={!loading}
                />

                <Text style={styles.label}>الوصف الطويل *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    editable={!loading}
                />

                <Text style={styles.label}>وصف مختصر</Text>
                <TextInput
                    style={styles.input}
                    value={shortDescription}
                    onChangeText={setShortDescription}
                    editable={!loading}
                    maxLength={150}
                />

                <Text style={styles.label}>الفئة</Text>
                <ScrollView horizontal style={styles.categories}>
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.value}
                            style={[
                                styles.category,
                                category === cat.value &&
                                    styles.categorySelected,
                            ]}
                            onPress={() => setCategory(cat.value)}
                            disabled={loading}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    category === cat.value &&
                                        styles.categoryTextSelected,
                                ]}
                            >
                                {cat.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <Text style={styles.label}>الوسوم (مفصولة بفواصل)</Text>
                <TextInput
                    style={styles.input}
                    value={tags}
                    onChangeText={setTags}
                    editable={!loading}
                    placeholder="مثال: react, node"
                />

                <Text style={styles.label}>التقنيات</Text>
                <TextInput
                    style={styles.input}
                    value={technologies}
                    onChangeText={setTechnologies}
                    editable={!loading}
                    placeholder="مثال: JavaScript, Firebase"
                />

                <Text style={styles.label}>رابط العرض</Text>
                <TextInput
                    style={styles.input}
                    value={demoUrl}
                    onChangeText={setDemoUrl}
                    editable={!loading}
                    keyboardType="url"
                />

                <Text style={styles.label}>رابط GitHub</Text>
                <TextInput
                    style={styles.input}
                    value={githubUrl}
                    onChangeText={setGithubUrl}
                    editable={!loading}
                    keyboardType="url"
                />

                <TouchableOpacity
                    style={styles.imagePicker}
                    onPress={pickImages}
                    disabled={loading}
                >
                    <Ionicons name="images-outline" size={24} color="#007AFF" />
                    <Text style={styles.imagePickerText}>
                        اختر صوراً (اختياري)
                    </Text>
                </TouchableOpacity>

                {images.length > 0 && (
                    <View style={styles.imagesContainer}>
                        {images.map((img, idx) => (
                            <View key={idx} style={styles.imageWrapper}>
                                <Image
                                    source={{ uri: img.uri }}
                                    style={styles.thumbnail}
                                />
                                <TouchableOpacity
                                    onPress={() => removeImage(idx)}
                                    style={styles.removeImage}
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={24}
                                        color="#FF3B30"
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleCreate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitText}>إنشاء المشروع</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F2F2F7" },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: "#FF3B30",
        marginBottom: 20,
        textAlign: "center",
    },
    button: { backgroundColor: "#007AFF", padding: 15, borderRadius: 10 },
    header: {
        backgroundColor: "#007AFF",
        padding: 20,
        paddingTop: 60,
        alignItems: "center",
    },
    title: { fontSize: 24, fontWeight: "bold", color: "#fff" },
    note: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 5 },
    form: { padding: 20 },
    label: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
        color: "#1D1D1F",
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#E5E5EA",
    },
    textArea: { height: 120, textAlignVertical: "top" },
    categories: { flexDirection: "row", marginBottom: 20 },
    category: {
        backgroundColor: "#fff",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#E5E5EA",
    },
    categorySelected: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
    categoryText: { fontSize: 14, color: "#1D1D1F" },
    categoryTextSelected: { color: "#fff" },
    imagePicker: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#007AFF",
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
    },
    imagePickerText: { marginLeft: 8, color: "#007AFF", fontSize: 16 },
    imagesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 20,
    },
    imageWrapper: { position: "relative", marginRight: 10, marginBottom: 10 },
    thumbnail: { width: 80, height: 80, borderRadius: 8 },
    removeImage: {
        position: "absolute",
        top: -5,
        right: -5,
        backgroundColor: "#fff",
        borderRadius: 12,
    },
    submitButton: {
        backgroundColor: "#007AFF",
        padding: 18,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 10,
    },
    submitText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
