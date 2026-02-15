# صالة الاجتماعات - منصة مدعوم

منصة اجتماعات احترافية وآمنة عبر الإنترنت مدمجة مع **Jitsi Meet API**، مع تصميم متناسق مع منصة **mad3oom.online**.

## المميزات الرئيسية

✅ **فيديو عالي الجودة** - دعم كامل لمكالمات الفيديو بدقة عالية

✅ **صوت واضح** - تقنيات متقدمة لتحسين جودة الصوت

✅ **مشاركة الشاشة** - شارك شاشتك مع المشاركين الآخرين

✅ **آمن وموثوق** - تشفير نهاية إلى نهاية لجميع الاتصالات

✅ **تصميم استجابي** - يعمل بشكل مثالي على جميع الأجهزة

✅ **دعم اللغة العربية** - واجهة كاملة باللغة العربية

✅ **وضع مظلم/فاتح** - تبديل سلس بين الأوضاع

## البدء السريع

### المتطلبات

- متصفح ويب حديث (Chrome, Firefox, Safari, Edge)
- اتصال إنترنت مستقر
- كاميرا وميكروفون (اختياري)

### التثبيت

1. استنساخ المستودع:
```bash
git clone https://github.com/moudabdelwahab/mad3oom.git
cd mad3oom
```

2. فتح الملف في متصفح:
```bash
# يمكنك فتح الملف مباشرة
open index.html

# أو استخدام خادم محلي
python -m http.server 8000
# ثم زيارة http://localhost:8000
```

### الاستخدام

#### إنشاء اجتماع جديد

1. افتح الصفحة الرئيسية
2. ادخل اسم الاجتماع في حقل "إنشاء اجتماع جديد"
3. اضغط على زر "إنشاء اجتماع"
4. سيتم نقلك إلى الاجتماع الجديد تلقائياً

#### الانضمام إلى اجتماع موجود

استخدم الرابط المشترك مع الآخرين:
```
https://meet.mad3oom.online/?room=اسم-الاجتماع
```

#### نسخ رابط الاجتماع

1. اضغط على زر "نسخ الرابط" في بطاقة معلومات الاجتماع
2. شارك الرابط مع المشاركين الآخرين

## البنية الأساسية للملفات

```
mad3oom/
├── index.html              # الصفحة الرئيسية
├── script.js               # الدوال المساعدة والعامة
├── styles.css              # التنسيقات الأساسية
├── color-system.css        # نظام الألوان
├── robot.css               # تنسيقات إضافية
├── theme-manager.js        # إدارة الوضع المظلم/الفاتح
├── favicon.ico             # أيقونة الموقع
├── logo.svg                # شعار المنصة
├── assets/                 # الصور والموارد
│   ├── images/
│   │   ├── logo.png
│   │   └── ...
│   ├── js/
│   └── components/
└── README.md               # هذا الملف
```

## التكوين والخيارات

### تخصيص إعدادات Jitsi Meet

يمكنك تخصيص إعدادات Jitsi Meet من خلال تعديل الخيارات في ملف `index.html`:

```javascript
const options = {
    roomName: roomName,
    width: '100%',
    height: '100%',
    parentNode: document.querySelector('#jitsi-container'),
    configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableSimulcast: false,
        enableWelcomePage: true,
        enableClosePage: true
    },
    interfaceConfigOverwrite: {
        DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
        TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'download', 'help', 'mute-everyone', 'e2ee'
        ],
        DEFAULT_LANGUAGE: 'ar'
    }
};
```

### الخيارات المتاحة

| الخيار | النوع | الوصف |
|--------|-------|-------|
| `roomName` | string | اسم الاجتماع |
| `width` | string/number | عرض الإطار |
| `height` | string/number | ارتفاع الإطار |
| `startWithAudioMuted` | boolean | بدء الاجتماع بالميكروفون مكتوم |
| `startWithVideoMuted` | boolean | بدء الاجتماع بالكاميرا مكتومة |
| `enableWelcomePage` | boolean | عرض صفحة الترحيب |
| `DEFAULT_LANGUAGE` | string | اللغة الافتراضية (ar للعربية) |

## واجهات برمجية (API)

### الدوال الأساسية

#### `initJitsiMeet(roomName)`
تهيئة منصة Jitsi Meet برقم الاجتماع المحدد.

```javascript
initJitsiMeet('my-meeting-room');
```

#### `createNewRoom(event)`
إنشاء اجتماع جديد من خلال نموذج الإدخال.

```javascript
createNewRoom(event);
```

#### `updateRoomInfo(roomName)`
تحديث معلومات الاجتماع المعروضة.

```javascript
updateRoomInfo('my-meeting-room');
```

#### `copyToClipboard(text)`
نسخ النص إلى الحافظة.

```javascript
copyToClipboard('https://meet.mad3oom.online/?room=my-room');
```

### معالجات الأحداث

يتم تشغيل الأحداث التالية تلقائياً:

- `videoConferenceJoined` - عند انضمام المستخدم للاجتماع
- `videoConferenceLeft` - عند مغادرة المستخدم للاجتماع
- `participantJoined` - عند انضمام مشارك جديد
- `participantLeft` - عند مغادرة مشارك
- `displayNameChange` - عند تغيير اسم العرض
- `contentSharingStarted` - عند بدء مشاركة الشاشة
- `contentSharingEnded` - عند إنهاء مشاركة الشاشة

## الدعم والمساعدة

### المشاكل الشائعة

**المشكلة:** لا تظهر الكاميرا أو الميكروفون
- **الحل:** تأكد من منح الأذونات للمتصفح للوصول إلى الكاميرا والميكروفون

**المشكلة:** الاتصال بطيء أو متقطع
- **الحل:** تحقق من سرعة الإنترنت لديك، وحاول إغلاق التطبيقات الأخرى

**المشكلة:** الصوت غير واضح
- **الحل:** تأكد من نظافة الميكروفون، وجرب جهاز إدخال صوت مختلف

### الإبلاغ عن المشاكل

إذا واجهت أي مشاكل، يرجى فتح issue على GitHub:
[GitHub Issues](https://github.com/moudabdelwahab/mad3oom/issues)

## التطوير والمساهمة

### متطلبات التطوير

- محرر نصوص (VS Code, Sublime, إلخ)
- معرفة بـ HTML, CSS, JavaScript
- فهم أساسي لـ Jitsi Meet API

### المساهمة

نرحب بالمساهمات! يرجى:

1. عمل Fork للمستودع
2. إنشاء فرع جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى الفرع (`git push origin feature/amazing-feature`)
5. فتح Pull Request

## الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE)

## الشكر والتقدير

شكر خاص لـ:
- فريق [Jitsi](https://jitsi.org/) لتوفير منصة الاجتماعات المفتوحة المصدر
- فريق [mad3oom.online](https://mad3oom.online) لتوفير التصميم الأساسي

## معلومات الاتصال

- **الموقع:** [https://meet.mad3oom.online](https://meet.mad3oom.online)
- **المنصة الأم:** [https://mad3oom.online](https://mad3oom.online)
- **البريد الإلكتروني:** contact@mad3oom.online

---

تم التطوير بـ ❤️ من قبل فريق منصة مدعوم