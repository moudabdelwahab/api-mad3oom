# تصميم هيكل المشروع وقاعدة البيانات لـ Mad3oom API

## 1. هيكل المشروع (Project Structure)

لضمان قابلية التوسع والصيانة، سيتم تنظيم مشروع Node.js/Express كالتالي:

```
api-mad3oom/
├── src/
│   ├── config/             # إعدادات التطبيق (مثل: database, environment variables)
│   ├── controllers/        # منطق التحكم للـ Endpoints
│   ├── middlewares/        # وظائف Middleware (مثل: authentication, rate limiting)
│   ├── models/             # تعريفات نماذج قاعدة البيانات (مثل: ApiKey, Ticket, Webhook)
│   ├── routes/             # تعريفات الـ Routes للـ API
│   ├── services/           # منطق الأعمال المعقد (مثل: ticket management, webhook handling)
│   ├── utils/              # وظائف مساعدة عامة (مثل: error handling, API key generation)
│   ├── app.js              # ملف التطبيق الرئيسي (Express app setup)
│   └── server.js           # نقطة الدخول لتشغيل الخادم
├── tests/                  # اختبارات الوحدة والتكامل
├── .env.example            # مثال لمتغيرات البيئة
├── .gitignore            # الملفات والمجلدات التي يجب تجاهلها بواسطة Git
├── package.json            # تعريف المشروع والتبعيات
└── README.md               # وصف المشروع وكيفية تشغيله
```

## 2. تصميم قاعدة البيانات (Database Schema)

سنستخدم قاعدة بيانات علائقية (مثل PostgreSQL أو MySQL) لتخزين البيانات. إليك التصميم المقترح للجداول الرئيسية، مع الأخذ في الاعتبار أن `managerId` سيأتي من منصة `mad3oom.online` الخارجية.

### جدول `ApiKeys`
يخزن مفاتيح الـ API التي تم إنشاؤها بواسطة المديرين، مع ربطها بمعرف المدير (Manager ID) والصلاحيات.

| الحقل         | النوع        | الوصف                                   | القيود         |
|---------------|---------------|-----------------------------------------|----------------|
| `id`          | UUID/INT      | معرف فريد لمفتاح الـ API                | مفتاح أساسي، لا يمكن أن يكون فارغًا |
| `managerId`   | UUID/INT      | معرف المدير الذي أنشأ المفتاح (من mad3oom.online) | لا يمكن أن يكون فارغًا |
| `key`         | VARCHAR(255)  | مفتاح الـ API الفعلي (مشفر/مجزء)        | فريد، لا يمكن أن يكون فارغًا |
| `name`        | VARCHAR(255)  | اسم وصفي للمفتاح (مثال: 'API Key for Mobile App') | لا يمكن أن يكون فارغًا |
| `permissions` | JSON/TEXT     | صلاحيات المفتاح (مثال: `{'read': true, 'create': false, 'update': true}`) | لا يمكن أن يكون فارغًا |
| `isActive`    | BOOLEAN       | هل المفتاح نشط؟                         | افتراضي TRUE، لا يمكن أن يكون فارغًا |
| `expiresAt`   | TIMESTAMP     | تاريخ انتهاء صلاحية المفتاح (اختياري)   | يمكن أن يكون فارغًا |
| `createdAt`   | TIMESTAMP     | تاريخ ووقت إنشاء السجل                  | افتراضي CURRENT_TIMESTAMP |
| `updatedAt`   | TIMESTAMP     | تاريخ ووقت آخر تحديث للسجل              | افتراضي CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

### جدول `Tickets`
يخزن معلومات تذاكر الدعم الفني.

| الحقل         | النوع        | الوصف                                   | القيود         |
|---------------|---------------|-----------------------------------------|----------------|
| `id`          | UUID/INT      | معرف فريد للتذكرة                       | مفتاح أساسي، لا يمكن أن يكون فارغًا |
| `managerId`   | UUID/INT      | معرف المدير المرتبط بالتذكرة (للتنظيم متعدد المستأجرين) | لا يمكن أن يكون فارغًا |
| `apiKeyId`    | UUID/INT      | معرف مفتاح الـ API الذي أنشأ التذكرة (اختياري) | مفتاح خارجي (يربط بـ `ApiKeys.id`)، يمكن أن يكون فارغًا |
| `subject`     | VARCHAR(255)  | موضوع التذكرة                           | لا يمكن أن يكون فارغًا |
| `description` | TEXT          | وصف تفصيلي للمشكلة                     | لا يمكن أن يكون فارغًا |
| `status`      | ENUM          | حالة التذكرة (مثال: 'open', 'in_progress', 'closed') | افتراضي 'open'، لا يمكن أن يكون فارغًا |
| `priority`    | ENUM          | أولوية التذكرة (مثال: 'low', 'medium', 'high') | افتراضي 'medium'، لا يمكن أن يكون فارغًا |
| `createdBy`   | VARCHAR(255)  | اسم أو معرف من أنشأ التذكرة             | يمكن أن يكون فارغًا |
| `assignedTo`  | UUID/INT      | معرف المدير أو الموظف المسؤول عن التذكرة | يمكن أن يكون فارغًا |
| `createdAt`   | TIMESTAMP     | تاريخ ووقت إنشاء السجل                  | افتراضي CURRENT_TIMESTAMP |
| `updatedAt`   | TIMESTAMP     | تاريخ ووقت آخر تحديث للسجل              | افتراضي CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

### جدول `Webhooks`
يخزن إعدادات الـ Webhooks التي يمكن للمديرين تعريفها لتلقي الإشعارات.

| الحقل         | النوع        | الوصف                                   | القيود         |
|---------------|---------------|-----------------------------------------|----------------|
| `id`          | UUID/INT      | معرف فريد للـ Webhook                   | مفتاح أساسي، لا يمكن أن يكون فارغًا |
| `managerId`   | UUID/INT      | معرف المدير الذي أنشأ الـ Webhook (من mad3oom.online) | لا يمكن أن يكون فارغًا |
| `eventType`   | ENUM          | نوع الحدث الذي يشغل الـ Webhook (مثال: 'ticket.created', 'ticket.updated') | لا يمكن أن يكون فارغًا |
| `callbackUrl` | VARCHAR(255)  | عنوان URL الذي سيتم إرسال الإشعار إليه | لا يمكن أن يكون فارغًا |
| `secret`      | VARCHAR(255)  | سر يستخدم لتوقيع الحمولة (Payload) للتحقق من المصدر | يمكن أن يكون فارغًا |
| `isActive`    | BOOLEAN       | هل الـ Webhook نشط؟                     | افتراضي TRUE، لا يمكن أن يكون فارغًا |
| `createdAt`   | TIMESTAMP     | تاريخ ووقت إنشاء السجل                  | افتراضي CURRENT_TIMESTAMP |
| `updatedAt`   | TIMESTAMP     | تاريخ ووقت آخر تحديث للسجل              | افتراضي CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP |

**ملاحظات على تصميم قاعدة البيانات:**

*   **UUIDs**: يفضل استخدام UUIDs كمعرفات أساسية لزيادة الأمان وتجنب التخمين، ولكن يمكن استخدام INTs إذا كانت الأداء أولوية قصوى في بيئات ذات حجم بيانات كبير جدًا. سنفترض أن `managerId` هو UUID أو INT حسب ما هو مستخدم في `mad3oom.online`.
*   **التشفير**: يجب تشفير مفاتيح الـ API قبل تخزينها في قاعدة البيانات.
*   **Multi-tenant isolation**: يتم تحقيق ذلك من خلال ربط `Tickets` و `ApiKeys` و `Webhooks` بـ `managerId`.
*   **الصلاحيات**: حقل `permissions` في جدول `ApiKeys` يسمح بتحديد صلاحيات دقيقة لكل مفتاح API.
*   **الـ ENUMs**: يمكن استخدامها لتقييد القيم الممكنة لحقول مثل `status` و `priority` و `eventType`.

هذا التصميم يوفر أساسًا قويًا لـ REST API قابل للتوسع ويلبي جميع المتطلبات المذكورة، مع الاعتماد على `managerId` خارجي من منصة `mad3oom.online` للمصادقة وإدارة المستخدمين.
