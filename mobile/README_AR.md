# TechFolio Mobile (Expo) — دليل التشغيل السريع

هذا المجلد يحتوي تطبيق موبايل مبني بـ Expo Router (React Native). يستخدم نفس واجهة الـ API الخلفية كما في الويب.

## تشغيل محلي

1. تثبيت الحزم:

```bash
cd mobile
npm install
```

2. تشغيل Expo:

```bash
npm start
# أو لتشغيل مباشر على المحاكي Android
npm run android
# أو iOS Simulator
npm run ios
```

3. في حالة الاختبار على جهاز حقيقي تأكد من ضبط عنوان الـ API في `mobile/src/services/api.js` إلى عنوان جهاز التطوير (مثلاً `http://192.168.x.y:5000/api`) بدل `localhost`.

## إعدادات مهمة

- ملف `mobile/src/services/api.js` يحتوي `API_URL` الافتراضي (`http://localhost:5000/api`). غيّره عند الحاجة أو استخدم متغير بيئي `EXPO_PUBLIC_API_BASE`.
- يتم تخزين التوكن في `AsyncStorage` تحت المفتاح `authToken` وبيانات المستخدم تحت `user`.

## نصائح تطوير

- عند تغيير منطق المصادقة، راجع `mobile/src/context/AuthContext.js`.
- استخدم `npx expo start --tunnel` إذا أردت تجربة التطبيق على جهاز حقيقي عبر الإنترنت دون حاجتك لتكوين الشبكة المحلية.

## إنشاء نسخة ويب

```bash
npm run web
```

## موارد

- Expo docs: https://docs.expo.dev

---

ملاحظة: إذا ترغب أن أستبدل `mobile/README.md` الأصلي بهذا المحتوى مباشرة، أخبرني وسأجرب مرة أخرى عملية التعديل في الموقع، أو أستطيع حذف الملف القديم واستبداله بالمحتوى العربي بعد أخذ موافقتك.
