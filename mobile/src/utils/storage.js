// storage.js - الإصدار الكامل
import AsyncStorage from "@react-native-async-storage/async-storage";

// دالة لحفظ البيانات
export const saveData = async (key, value) => {
    try {
        console.log(
            `💾 Saving ${key}:`,
            typeof value === "string" ? value.substring(0, 30) + "..." : value,
        );

        await AsyncStorage.setItem(key, value);
        console.log(`✅ ${key} saved successfully`);
        return true;
    } catch (error) {
        console.error("❌ Error saving data:", error);
        return false;
    }
};

// دالة لقراءة البيانات
export const getData = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key);
        console.log(
            `📖 Reading ${key}:`,
            value ? `✅ Found (${value.substring(0, 20)}...)` : "❌ Not found",
        );
        return value || null;
    } catch (error) {
        console.error("❌ Error reading data:", error);
        return null;
    }
};

// دالة لحذف البيانات
export const deleteData = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
        console.log(`🗑️ Deleted ${key}`);
        return true;
    } catch (error) {
        console.error("❌ Error deleting data:", error);
        return false;
    }
};

// دالة لمسح كل شيء
export const clearAll = async () => {
    try {
        await AsyncStorage.clear();
        console.log("🧹 Cleared all storage");
        return true;
    } catch (error) {
        console.error("❌ Error clearing storage:", error);
        return false;
    }
};

// Export for backward compatibility
export const storage = {
    setItem: saveData,
    getItem: getData,
    removeItem: deleteData,
    clear: clearAll,
};
