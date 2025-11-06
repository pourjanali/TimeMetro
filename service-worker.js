const CACHE_NAME = 'tabriz-metro-v1';
const assetsToCache = [
    '/',
    '/index.html',
    '/app.js', // کش کردن فایل جاوااسکریپت جدید
    'https://cdn.tailwindcss.com', // کش کردن Tailwind
    'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;700&display=swap', // کش کردن فونت
    '/icons/icon-192x192.png', // (تکمیل شد) اضافه کردن آیکون PWA
    '/icons/icon-512x512.png'  // (تکمیل شد) اضافه کردن آیکون PWA
];

// رویداد نصب: فایل‌های اصلی برنامه را کش می‌کند
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('کش باز شد، در حال افزودن فایل‌های پایه');
            return cache.addAll(assetsToCache);
        })
    );
});

// رویداد fetch: درخواست‌ها را رهگیری می‌کند
self.addEventListener('fetch', event => {
    // برای APIهای خارجی (مثل آب و هوا، تقویم، و API خودمان) همیشه به شبکه بروید
    if (event.request.url.includes('api.openweathermap.org') ||
        event.request.url.includes('persian-calendar-api') ||
        event.request.url.includes('timemetro.onrender.com')) {

        event.respondWith(fetch(event.request));
        return;
    }

    // برای فایل‌های محلی (HTML, JS, CSS)، ابتدا کش را بررسی کن
    event.respondWith(
        caches.match(event.request).then(response => {
            // اگر در کش بود، آن را برگردان
            if (response) {
                return response;
            }
            // اگر نبود، از شبکه بگیر
            return fetch(event.request).then(
                networkResponse => {
                    // (اختیاری) می‌توانید درخواست‌های موفق جدید را در کش ذخیره کنید
                    // caches.open(CACHE_NAME).then(cache => {
                    //     cache.put(event.request, networkResponse.clone());
                    // });
                    return networkResponse;
                }
            );
        })
    );
});