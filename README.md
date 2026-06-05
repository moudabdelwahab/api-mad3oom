# منصة مطوري مدعوم - Teams API Developer Platform

منصة ويب متكاملة لإدارة واستخدام API نظام فرق العمل في منصة مدعوم. توفر المنصة واجهة رسومية سهلة الاستخدام لإدارة التذاكر والمفاتيح والويب هوك.

## 🎯 الميزات الرئيسية

- **إدارة التذاكر**: إنشاء وإدارة التذاكر مع الأولويات والحالات المختلفة
- **إدارة مفاتيح API**: إنشاء وإدارة مفاتيح API مع صلاحيات قابلة للتخصيص
- **إدارة الويب هوك**: إنشاء وإدارة الويب هوك لتلقي إشعارات الأحداث
- **توثيق شامل**: توثيق كامل لجميع نقاط الاتصال والأمثلة البرمجية
- **أمثلة برمجية**: أمثلة جاهزة بلغات JavaScript و Python و cURL
- **تصميم متجاوب**: واجهة تعمل على جميع الأجهزة والشاشات

## 📋 المتطلبات

- متصفح ويب حديث (Chrome, Firefox, Safari, Edge)
- اتصال بالإنترنت
- مفتاح API أو JWT Token للوصول إلى API

## 🚀 البدء السريع

### 1. الوصول إلى المنصة

افتح المنصة من خلال الرابط:
```
https://api.mad3oom.online
```

### 2. تكوين المصادقة

قبل استخدام المنصة، يجب تكوين طريقة المصادقة:

#### طريقة 1: استخدام JWT Token
```javascript
localStorage.setItem('jwt_token', 'your_jwt_token_here');
```

#### طريقة 2: استخدام API Key
```javascript
localStorage.setItem('api_key', 'mad_your_api_key_here');
```

### 3. استخدام المنصة

بعد تكوين المصادقة، يمكنك:
- عرض وإنشاء التذاكر
- إدارة مفاتيح API
- إدارة الويب هوك
- عرض الأمثلة البرمجية

## 📚 التوثيق

### نقاط الاتصال الرئيسية

#### التذاكر (Tickets)
- `POST /api/v1/tickets` - إنشاء تذكرة جديدة
- `GET /api/v1/tickets` - جلب جميع التذاكر
- `GET /api/v1/tickets/{id}` - جلب تذكرة واحدة
- `POST /api/v1/tickets/{id}/reply` - إضافة رد على التذكرة
- `PATCH /api/v1/tickets/{id}/status` - تحديث حالة التذكرة

#### مفاتيح API (API Keys)
- `POST /api/v1/api-keys` - إنشاء مفتاح API جديد
- `GET /api/v1/api-keys` - جلب جميع المفاتيح
- `DELETE /api/v1/api-keys/{id}` - إلغاء مفتاح API

#### الويب هوك (Webhooks)
- `POST /api/v1/webhooks` - إنشاء ويب هوك جديد
- `GET /api/v1/webhooks` - جلب جميع الويب هوك
- `PATCH /api/v1/webhooks/{id}` - تحديث الويب هوك
- `DELETE /api/v1/webhooks/{id}` - حذف الويب هوك

### أمثلة الاستخدام

#### إنشاء تذكرة باستخدام JavaScript
```javascript
const API_KEY = 'mad_your_api_key_here';
const BASE_URL = 'https://api.mad3oom.online/api/v1';

async function createTicket(subject, description, priority) {
    const response = await fetch(`${BASE_URL}/tickets`, {
        method: 'POST',
        headers: {
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            subject,
            description,
            priority,
            created_by: 'user@example.com'
        })
    });

    return await response.json();
}
```

#### إنشاء تذكرة باستخدام Python
```python
import requests

API_KEY = 'mad_your_api_key_here'
BASE_URL = 'https://api.mad3oom.online/api/v1'

def create_ticket(subject, description, priority):
    headers = {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
    }
    
    payload = {
        'subject': subject,
        'description': description,
        'priority': priority,
        'created_by': 'user@example.com'
    }
    
    response = requests.post(
        f'{BASE_URL}/tickets',
        headers=headers,
        json=payload
    )
    
    return response.json()
```

#### إنشاء تذكرة باستخدام cURL
```bash
curl -X POST https://api.mad3oom.online/api/v1/tickets \
  -H "X-API-Key: mad_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "مشكلة في التطبيق",
    "description": "التطبيق لا يعمل",
    "priority": "high",
    "created_by": "user@example.com"
  }'
```

#### إرسال رسالة واتساب (Session Message)
```bash
curl -X POST https://api.mad3oom.online/v1/whatsapp/session/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "201025998920",
    "message": "مرحباً بك في خدمتنا"
  }'
```

## 🔐 الأمان

### المصادقة
يدعم النظام طريقتين للمصادقة:
1. **JWT Token**: `Authorization: Bearer <JWT_TOKEN>`
2. **API Key**: `X-API-Key: mad_<random_string>`

### الويب هوك
جميع الويب هوك موقعة بـ HMAC-SHA256 للتحقق من الأمان:
- `X-Mad3oom-Event`: نوع الحدث
- `X-Mad3oom-Timestamp`: الطابع الزمني
- `X-Mad3oom-Signature`: التوقيع

### التحقق من التوقيع
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
    const hash = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
    
    return hash === signature;
}
```

## 📁 هيكل المشروع

```
api-mad3oom/
├── index.html              # الصفحة الرئيسية
├── css/
│   └── style.css           # أنماط CSS
├── js/
│   └── main.js             # منطق JavaScript
└── README.md               # هذا الملف
```

## 🛠️ التطوير

### المتطلبات
- Node.js 14+ (اختياري، للتطوير المحلي)
- أي محرر نصوص (VS Code, Sublime, إلخ)

### التثبيت المحلي
```bash
# استنساخ المستودع
git clone https://github.com/moudabdelwahab/api-mad3oom.git

# الدخول إلى المجلد
cd api-mad3oom

# فتح الملف في المتصفح
open index.html
```

### البناء والنشر
المشروع يستخدم HTML و CSS و JavaScript بدون أي أدوات بناء معقدة. يمكن نشره مباشرة على أي خادم ويب.

## 🐛 الأخطاء الشائعة

### خطأ 401: Unauthorized
**السبب**: مفتاح API أو JWT Token غير صحيح أو منتهي الصلاحية
**الحل**: تحقق من صحة المفتاح وأعد تحميل الصفحة

### خطأ 403: Forbidden
**السبب**: المفتاح لا يملك الصلاحيات المطلوبة
**الحل**: تحقق من الصلاحيات المعطاة للمفتاح

### خطأ 429: Too Many Requests
**السبب**: تم تجاوز حد الطلبات المسموح به
**الحل**: انتظر قليلاً قبل إرسال طلبات جديدة

## 📞 الدعم والمساعدة

للمزيد من المعلومات والدعم:
- 📧 البريد الإلكتروني: support@mad3oom.online
- 🌐 الموقع: https://mad3oom.online
- 📚 التوثيق الكاملة: https://api.mad3oom.online/docs

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT. انظر ملف LICENSE للمزيد من التفاصيل.

## 🤝 المساهمة

نرحب بمساهماتك! يرجى:
1. عمل Fork للمستودع
2. إنشاء فرع جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى الفرع (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## 📝 ملاحظات الإصدار

### الإصدار 1.0 (2026-05-07)
- ✅ إطلاق المنصة الأولى
- ✅ إدارة التذاكر
- ✅ إدارة مفاتيح API
- ✅ إدارة الويب هوك
- ✅ إرسال رسائل واتساب (Session Messages)
- ✅ توثيق شامل
- ✅ أمثلة برمجية

## 🎓 الموارد التعليمية

- [شرح API Teams](https://api.mad3oom.online/docs)
- [أمثلة الويب هوك](https://api.mad3oom.online/webhooks)
- [دليل الأمان](https://api.mad3oom.online/security)

---

تم إنشاؤه بـ ❤️ من قبل فريق مدعوم
