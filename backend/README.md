## TechFolio — Backend (وثائق التشغيل السريعة)

واجهة برمجية مبنية بـ Express و MongoDB. تُدير المستخدمين، المشاريع، التعليقات، والمتابعات.

### المتطلبات

- Node.js
- npm
- MongoDB

### تثبيت وتشغيل (محلي)

1. انسخ `.env.example` إلى `.env` أو أنشئ `.env` في مجلد `backend/` ثم عدل القيم:

```
MONGODB_URI=mongodb://127.0.0.1:27017/techfolio
JWT_SECRET=your_jwt_secret
PORT=5000
```

2. تثبيت الاعتماديات وتشغيل السيرفر:

```bash
cd backend
npm install
# تشغيل التطوير مع nodemon
npm run dev
# أو تشغيل الإنتاج
npm start
```

### نقطــة النهاية الأساسية (ملخص)

- `POST /api/auth/register` — تسجيل حساب جديد. body: `{ name, email, password }`.
- `POST /api/auth/login` — تسجيل الدخول. body: `{ email, password }`. تعيد `token` وبيانات المستخدم.
- `GET /api/auth/me` — جلب بيانات المستخدم الحالي (محمي).
- `PUT /api/users/profile` — تحديث بروفايل المستخدم الحالي (محمي).
- `GET /api/users/:id` — جلب ملف مستخدم عام.

- `GET /api/projects` — جلب المشاريع. يدعم فلترة بـ `?userId=` وغيرها.
- `GET /api/projects/:id` — تفاصيل مشروع.
- `POST /api/projects` — إنشاء مشروع (multipart/form-data ـ الحقل `images`).
- `POST /api/projects/:projectId/like` — إعجاب بمشروع.
- `DELETE /api/projects/:projectId/like` — إلغاء إعجاب.

للاطلاع على أمثلة جاهزة، استورد `postman_collection.json` في Postman واضبط `{{baseUrl}}` إلى `http://localhost:5000/api` ثم نفّذ طلبات المصادقة أولاً للحصول على التوكن.

### تحميل الملفات

الصور تُحفظ محليًا في `backend/uploads` وتُخدم عبر المسار `/uploads/<filename>`.

### ملاحظات للنشر

- فكر في نقل تخزين الصور إلى خدمة سحابية (S3) وتفعيل CDN.
- أضف فحصاً لحجم ونوع الصور ومعالجة (مثل `sharp`) قبل الحفظ.

### مشاكل شائعة

- إذا ظهرت أخطاء تتعلق بالاتصال بقاعدة البيانات، راجع قيمة `MONGODB_URI` وتأكد أن MongoDB تعمل.
- عند استجابة 401 تأكد من إرسال `Authorization: Bearer <token>`.

---
