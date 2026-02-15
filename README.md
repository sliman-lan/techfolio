## TechFolio — ملخص المشروع

مستودع يحتوي على: واجهة ويب (React)، واجهة موبايل (Expo React Native)، وواجهة خلفية API (Express + MongoDB). يسمح للمستخدمين بالتسجيل، تعديل الملف الشخصي، ونشر المشاريع مع صور ومشاركة/إعجاب وتعليقات.

هذا المستند يوضح بسرعة كيفية تشغيل كل جزء، المتغيرات البيئية الأساسية، وملخص واجهة البرمجة (API).

---

## هيكل المشروع

- `backend/` — Express API و Mongoose models، نقطة الدخول: `backend/src/server.js`.
- `frontend/` — تطبيق React (Create React App).
- `mobile/` — تطبيق Expo (React Native) يستخدم نفس API.
- `postman_collection.json` — مجموعة Postman جاهزة لاختبار الـ API.

---

## المتطلبات الأساسية

- Node.js (>=16)
- npm
- MongoDB (محلي أو سحابي URI)

---

## تشغيل سريع (محلي)

1. استنساخ المستودع وتثبيت الحزم:

```bash
git clone https://github.com/sliman-lan/techfolio.git
cd techfolio-project

# backend
cd backend && npm install

# frontend
cd ../frontend && npm install

# mobile
cd ../mobile && npm install
```

2. تشغيل الخلفية:

```bash
cd backend
npm run dev    # nodemon src/server.js
```

3. تشغيل الواجهة (ويب):

```bash
cd frontend
npm start
```

4. تشغيل تطبيق الموبايل (Expo):

```bash
cd mobile
npm start
```

ملاحظة عن عناوين API:

- الافتراضي للـ API: `http://localhost:5000/api` (الخادم يعمل على المنفذ 5000).
- في تطبيق الموبايل قد تحتاج لاستخدام `10.0.2.2` (محاكي Android) أو عنوان IP جهازك عند الاختبار على جهاز حقيقي.

---

## المتغيرات البيئية (Backend)

ضع ملف `.env` داخل مجلد `backend/` يحتوي على القيم الأساسية:

```
MONGODB_URI=mongodb://127.0.0.1:27017/techfolio
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

يمكنك توليد `JWT_SECRET` سريعًا عبر: `npm run reset-secret` داخل مجلد `backend`.

---

## ملخص نقاط النهاية المهمة (API)

- `POST /api/auth/register` — تسجيل مستخدم جديد. body: `{ name, email, password }`.
- `POST /api/auth/login` — تسجيل الدخول. body: `{ email, password }`. الاستجابة تتضمن `token` وبيانات المستخدم.
- `GET /api/auth/me` — (محمي) جلب بيانات المستخدم الحالي. يتطلب ترويسة `Authorization: Bearer <token>`.
- `PUT /api/users/profile` — (محمي) تحديث الملف الشخصي للمستخدم الحالي (name, bio, avatar, ...).
- `GET /api/users/:id` — جلب ملف مستخدم عام.

- `GET /api/projects` — جلب المشاريع العامة. يقبل استعلامات مثل `?userId=...`.
- `GET /api/projects/:id` — تفاصيل مشروع.
- `POST /api/projects` — إنشاء مشروع (محمي). ارسل `multipart/form-data` مع حقول المشروع وملفات الصور (`images`).
- `POST /api/projects/:projectId/like` — إعجاب بمشروع (محمي).
- `DELETE /api/projects/:projectId/like` — إلغاء الإعجاب (محمي).

لمجموعة كاملة من الاستدعاءات، استخدم ملف `postman_collection.json` في جذر المشروع.

---

## نصائح ونقاط شائعة

- إن لم تتصل الواجهة الخلفية من المتصفح، تحقق من `CORS` وأن المتصفح يستخدم `http://localhost:5000` أو قيمة `REACT_APP_API_BASE` الصحيحة.
- عند اختبار على جهاز موبايل حقيقي، استخدم عنوان IP الخاص بجهاز التطوير بدل `localhost`.
- الصور المرفوعة تُخزن محليًا في `backend/uploads` وتُخدم من `/uploads/<filename>`.

---

## الملفات المساعدة في المستودع

- `postman_collection.json` — لاستيراده في Postman لاختبار الـ API.
- `backend/.env.example` — مثال متغيرات بيئية.

---
.


