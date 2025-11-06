// =====================================================================
// ||         مدیریت تم (بازنویسی شده برای حل FOUC - فاز ۵)           ||
// =====================================================================
const themeManager = {
    themeToggle: document.getElementById('theme-toggle'),
    sunIcon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 12a5 5 0 100-10 5 5 0 000 10z" /></svg>`,
    moonIcon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>`,

    init: function () {
        // اسکریپت <head> کلاس اولیه را تنظیم کرده است.
        // ما فقط باید آیکون اولیه را بر اساس آن کلاس تنظیم کنیم.
        if (document.documentElement.classList.contains('dark')) {
            this.themeToggle.innerHTML = this.sunIcon;
        } else {
            this.themeToggle.innerHTML = this.moonIcon;
        }

        // شنونده کلیک را اضافه کن
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    },

    // تابع applyTheme حذف شد چون منطق آن ادغام شد.

    toggleTheme: function () {
        // کلاس را روی <html> جابجا کن
        const isDark = document.documentElement.classList.toggle('dark');

        if (isDark) {
            // اگر تاریک شد
            localStorage.theme = 'dark';
            this.themeToggle.innerHTML = this.sunIcon;
        } else {
            // اگر روشن شد
            localStorage.theme = 'light';
            this.themeToggle.innerHTML = this.moonIcon;
        }
    }
};

// =====================================================================
// ||                       ویجت آب و هوا (ساده)                      ||
// =====================================================================
const weatherWidget = {
    apiKey: 'c0d0a520c9e671c6c03e48f1076b9117', // کلید API رایگان OpenWeatherMap
    city: 'Tabriz',
    units: 'metric',
    lang: 'fa',
    widget: document.getElementById('weather-widget'),
    tempEl: document.getElementById('weather-temp'),
    descEl: document.getElementById('weather-desc'),
    iconEl: document.getElementById('weather-icon'),

    init: async function () {
        try {
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&units=${this.units}&lang=${this.lang}&appid=${this.apiKey}`;
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Failed to fetch weather');
            const data = await response.json();

            this.tempEl.textContent = `${Math.round(data.main.temp)}°`;
            this.descEl.textContent = data.weather[0].description;
            this.iconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
            this.iconEl.alt = data.weather[0].description;
            this.iconEl.classList.remove('opacity-0'); // نمایش آیکون
            this.widget.classList.remove('hidden'); // نمایش کل ویجت (برای موبایل)

        } catch (error) {
            console.error('Error fetching weather:', error);
            // (تغییر) نمایش خطا به جای مخفی کردن
            this.tempEl.textContent = 'N/A';
            this.descEl.textContent = 'خطای آب و هوا';
            this.iconEl.classList.add('opacity-0');
            this.widget.classList.remove('hidden'); // نمایش ویجت برای نمایش خطا
        }
    }
};

// =====================================================================
// ||                  (جدید) ویجت ساعت زنده محلی                   ||
// =====================================================================
const liveClock = {
    clockEl: document.getElementById('live-clock'),

    init: function () {
        if (!this.clockEl) return;
        this.updateTime(); // یکبار بلافاصله اجرا کن
        setInterval(() => this.updateTime(), 1000); // هر ثانیه تکرار کن
    },

    updateTime: function () {
        const now = new Date();
        // دریافت ساعت به وقت تهران با اعداد فارسی
        const timeString = now.toLocaleTimeString('fa-IR-u-nu-arab', {
            timeZone: 'Asia/Tehran',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        this.clockEl.textContent = timeString;
    }
};


// =====================================================================
// ||                 ویجت تاریخ شمسی (نسخه API - فاز ۵)               ||
// =====================================================================
const persianCalendar = {
    widget: document.getElementById('calendar-widget'),
    monthYearHeader: document.getElementById('calendar-widget'), // استفاده مجدد از همان عنصر

    init: function () {
        this.fetchCalendarData(); // فراخوانی تابع جدید
    },

    async fetchCalendarData() {
        try {
            // استفاده از API برای دریافت اطلاعات امروز
            const response = await fetch('https://persian-calendar-api.sajjadth.workers.dev/');
            if (!response.ok) throw new Error('Network response failed');
            const data = await response.json();

            // استخراج اطلاعات مورد نیاز
            const todayInfo = data.today;
            const isHoliday = todayInfo.is_holiday;
            const dayOfMonth = todayInfo.day.toLocaleString('fa-IR-u-nu-arab');
            const dayOfWeek = todayInfo.weekday;
            const monthName = data.month.name;
            const year = todayInfo.year.toLocaleString('fa-IR-u-nu-arab');

            // رندر کردن تاریخ
            this.render(dayOfWeek, dayOfMonth, monthName, year);

            // *** مهم‌ترین بخش: اتصال تقویم به برنامه مترو (مورد ۷) ***
            // این تابع در metroApp تعریف خواهد شد
            metroApp.setDayTypeBasedOnCalendar(isHoliday);

        } catch (error) {
            console.error("خطا در دریافت اطلاعات تقویم از API:", error);
            // در صورت خطا، از کاربر بخواهید دستی انتخاب کند
            this.monthYearHeader.textContent = "خطا در بارگذاری تقویم. لطفاً نوع روز را دستی انتخاب کنید.";
            // در صورت خطا، منطق پیش‌فرض قبلی را اجرا می‌کنیم
            metroApp.setDefaultDayType(); // <-- بازگشت به حالت دستی در صورت خطا
        }
    },

    render(dayOfWeek, day, monthName, year) {
        // نمایش تاریخ کامل در ویجت
        this.monthYearHeader.textContent = `${dayOfWeek}، ${day} ${monthName} ${year}`;
    }
};


// =====================================================================
// ||                مدیریت داده‌های مترو (فاز ۱)                   ||
// =====================================================================
const metroDataManager = {
    metroData: null, // داده‌ها از API بارگذاری خواهند شد
    stationNames: [], // نام ایستگاه‌ها از API بارگذاری خواهند شد

    // فاز ۴: به‌روزرسانی آدرس API
    apiUrl: 'https://timemetro.onrender.com/api/schedule', // <-- تصحیح شد: https:// اضافه شد

    /**
     * فاز ۱: بارگذاری داده‌ها از API
     * (فاز ۵: مجهز به تایم‌اوت دستی)
     */
    init: async function () {
        // ایده فول استک: افزودن تایم‌اوت دستی برای مدیریت سرورهای در حال خواب
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 ثانیه تایم‌اوت

        try {
            const response = await fetch(this.apiUrl, {
                signal: controller.signal // ارسال سیگنال لغو
            });

            // اگر درخواست موفق بود، تایمر را پاک کن
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`خطا در دریافت داده‌ها: ${response.statusText}`);
            }
            const data = await response.json();

            this.metroData = data.scheduleData;
            this.stationNames = data.stationNames;

            console.log('داده‌های مترو با موفقیت از API دریافت شد.');

        } catch (error) {
            // در صورت بروز خطا (یا تایم‌اوت) نیز تایمر را پاک کن
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                // این خطا زمانی رخ می‌دهد که تایم‌اوت ۱۵ ثانیه‌ای ما اجرا شود
                console.error('مشکل جدی: سرور پاسخ نداد (Timeout)');
                document.getElementById('schedule-results').innerHTML = `
                    <div class="text-center p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
                        <h3 class="font-bold">خطا: سرور پاسخ نمی‌دهد</h3>
                        <p>به نظر می‌رسد سرور برنامه (onrender.com) در دسترس نیست یا در حال راه‌اندازی است. لطفاً چند لحظه صبر کنید و صفحه را دوباره بارگذاری کنید.</p>
                        <p class="text-sm mt-2">(این اتفاق معمولاً برای سرویس‌های رایگان رخ می‌دهد)</p>
                    </div>
                `;
            } else {
                // خطاهای دیگر (مثل خطای 500 یا عدم اتصال)
                console.error('مشکل جدی در بارگذاری داده‌های مترو:', error);
                document.getElementById('schedule-results').innerHTML = `
                    <div class="text-center p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
                        <h3 class="font-bold">خطا در اتصال به سرور</h3>
                        <p>امکان بارگذاری جدول زمانی وجود ندارد. لطفاً اتصال اینترنت خود را بررسی کرده و صفحه را دوباره بارگذاری کنید.</p>
                    </div>
                `;
            }
            metroApp.hideLoading();
        }
    },

    /**
     * دریافت جدول زمانی برای یک ایستگاه، روز و جهت خاص
     */
    getSchedule: function (station, dayType, direction) {
        if (!this.metroData) {
            console.error('داده‌های مترو هنوز بارگذاری نشده‌اند.');
            return [];
        }
        try {
            // در فاز ۵، نام‌ها از 'normal' و 'holiday' به 'weekdays' و 'holidays' تغییر می‌کنند
            // ما این را در setDayTypeBasedOnCalendar مدیریت می‌کنیم، اما اینجا هم چک می‌کنیم
            const effectiveDayType = (dayType === 'normal' || dayType === 'weekdays') ? 'weekdays' : 'holidays';

            // اطمینان از اینکه ساختار داده جدید (weekdays/holidays) استفاده می‌شود
            if (!this.metroData[effectiveDayType]) {
                console.warn(`نوع روز '${effectiveDayType}' در داده‌های API یافت نشد. بازگشت به 'normal'/'holiday'`);
                // اگر API هنوز از ساختار قدیمی استفاده می‌کند، از آن استفاده کن
                const oldDayType = (dayType === 'normal' || dayType === 'weekdays') ? 'normal' : 'holiday';
                return this.metroData[oldDayType][direction][station] || [];
            }

            return this.metroData[effectiveDayType][direction][station] || [];
        } catch (e) {
            console.error('خطا در دسترسی به داده‌ها:', station, dayType, direction, e);
            return []; // بازگشت آرایه خالی در صورت خطا
        }
    }
};

// =====================================================================
// ||                         منطق اصلی برنامه                       ||
// =====================================================================
const metroApp = {
    stationSelect: document.getElementById('station-select'),
    dayTypeSelect: document.getElementById('day-type-select'),
    scheduleResults: document.getElementById('schedule-results'),
    nextTrainSummary: document.getElementById('next-train-summary'), // فاز ۲
    loadingOverlay: document.getElementById('loading-overlay'),
    stationNames: [], // از metroDataManager پر می‌شود
    updateInterval: null, // فاز ۲: برای به‌روزرسانی خودکار

    init: function (stationNamesData) {
        this.stationNames = stationNamesData;
        this.populateStationSelect();

        // اضافه کردن event listener ها
        this.stationSelect.addEventListener('change', () => this.displaySchedule());
        this.dayTypeSelect.addEventListener('change', () => this.displaySchedule());

        // (حذف شد - فاز ۵) setDefaultDayType دیگر در اینجا فراخوانی نمی‌شود
        // تقویم API این کار را انجام می‌دهد

        // نمایش اولیه
        this.displaySchedule();

        // فاز ۲: راه‌اندازی به‌روزرسانی خودکار هر ۶۰ ثانیه
        if (this.updateInterval) clearInterval(this.updateInterval); // پاک کردن تایمر قبلی (اگر وجود داشت)
        this.updateInterval = setInterval(() => this.displaySchedule(), 60000); // به‌روزرسانی هر 60 ثانیه
    },

    /**
     * (جدید - فاز ۵، مورد ۷)
     * تنظیم خودکار نوع روز بر اساس داده‌های API تقویم
     */
    setDayTypeBasedOnCalendar: function (isHoliday) {
        if (isHoliday) {
            this.dayTypeSelect.value = 'holiday';
        } else {
            // API روزهای عادی را 'weekdays' برمی‌گرداند
            // ما در select خود 'normal' داریم. باید مطمئن شویم مقادیر مطابقت دارند.
            // بیایید مقدار <option> را در HTML به 'weekdays' تغییر دهیم.
            // فعلاً با فرض اینکه مقدار 'normal' است:
            this.dayTypeSelect.value = 'normal';
        }

        // پس از تنظیم مقدار، یک رویداد 'change' را شبیه‌سازی کنید
        // تا منطق نمایش جدول زمانی به طور خودکار اجرا شود.
        this.dayTypeSelect.dispatchEvent(new Event('change'));
    },

    /**
     * پر کردن منوی کشویی ایستگاه‌ها
     */
    populateStationSelect: function () {
        if (!this.stationNames || this.stationNames.length === 0) {
            console.error("لیست نام ایستگاه‌ها خالی است.");
            return;
        }

        this.stationSelect.innerHTML = ''; // پاک کردن گزینه‌های قبلی
        this.stationNames.forEach(station => {
            const option = document.createElement('option');
            option.value = station;
            option.textContent = station;
            this.stationSelect.appendChild(option);
        });
        // انتخاب ایستگاه اول به صورت پیش‌فرض
        this.stationSelect.selectedIndex = 0;
    },

    /**
     * (نگه داشته شده - فاز ۵)
     * این تابع به عنوان پشتیبان در صورتی که API تقویم با خطا مواجه شود، استفاده می‌شود.
     */
    setDefaultDayType: function () {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = یکشنبه, ... 5 = جمعه, 6 = شنبه

        // در ایران، جمعه (5) روز تعطیل است
        if (dayOfWeek === 5) {
            this.dayTypeSelect.value = 'holiday';
        } else {
            this.dayTypeSelect.value = 'normal';
        }
        // بعد از تنظیم دستی هم، رویداد change را فراخوانی می‌کنیم
        this.dayTypeSelect.dispatchEvent(new Event('change'));
    },

    /**
     * نمایش حالت بارگذاری (برای فاز ۱)
     */
    showLoading: function () {
        this.loadingOverlay.classList.remove('hidden');
    },

    /**
     * مخفی کردن حالت بارگذاری (برای فاز ۱)
     */
    hideLoading: function () {
        this.loadingOverlay.classList.add('hidden');
    },

    /**
     * فاز ۲: پیدا کردن قطارهای بعدی بر اساس زمان فعلی
     */
    _findNextTrains: function (times, now) {
        const upcomingTrains = [];

        for (const timeStr of times) {
            if (!timeStr || timeStr === "***") continue;

            const [hours, minutes, seconds] = timeStr.split(':').map(Number);
            const trainTime = new Date(now.getTime()); // کپی از زمان فعلی
            trainTime.setHours(hours, minutes, seconds, 0); // تنظیم زمان قطار برای امروز

            if (trainTime.getTime() < now.getTime() - 30000) { // ۳۰ ثانیه تحمل
                continue;
            }

            const diffMs = trainTime.getTime() - now.getTime();
            const minutesUntil = Math.round(diffMs / 60000);

            upcomingTrains.push({
                time: timeStr.substring(0, 5), // "HH:MM"
                fullTime: timeStr, // "HH:MM:SS"
                minutesUntil: minutesUntil
            });
        }

        if (upcomingTrains.length > 0) {
            return {
                nearestTrain: upcomingTrains[0],
                nextThreeTrains: upcomingTrains.slice(0, 3).map(t => t.fullTime)
            };
        }

        return { nearestTrain: null, nextThreeTrains: [] };
    },

    /**
     * فاز ۲: نمایش خلاصه قطارهای بعدی
     */
    _displayNextTrainSummary: function (toNoorData, toElGoliData) {
        let html = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';

        const createSummaryCard = (title, data) => {
            let contentHtml = '';
            if (data.nearestTrain) {
                if (data.nearestTrain.minutesUntil <= 0) {
                    contentHtml = `
                        <p class="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                            هم‌اکنون در ایستگاه
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            (ساعت حرکت: ${data.nearestTrain.time})
                        </p>
                     `;
                } else {
                    contentHtml = `
                        <p class="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                            ${data.nearestTrain.minutesUntil} دقیقه دیگر
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">
                            (ساعت ${data.nearestTrain.time})
                        </p>
                    `;
                }
            } else {
                contentHtml = `
                    <p class="text-xl sm:text-2xl font-bold text-gray-500 dark:text-gray-400">
                        قطار بعدی وجود ندارد
                    </p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        (سرویس‌دهی پایان یافته است)
                    </p>
                `;
            }

            return `
                <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 text-center border border-gray-200 dark:border-slate-700">
                    <h3 class="text-base sm:text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">${title}</h3>
                    ${contentHtml}
                </div>
            `;
        };

        html += createSummaryCard('قطار بعدی به سمت نور', toNoorData);
        html += createSummaryCard('قطار بعدی به سمت ائل گؤلی', toElGoliData);

        html += '</div>';
        this.nextTrainSummary.innerHTML = html;
    },

    /**
     * نمایش جدول زمانی بر اساس انتخاب‌های کاربر
     */
    displaySchedule: function () {
        const station = this.stationSelect.value;
        const dayType = this.dayTypeSelect.value;
        const now = new Date();

        if (!station || !dayType) {
            this.scheduleResults.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">لطفاً ایستگاه و نوع روز را انتخاب کنید.</p>';
            this.nextTrainSummary.innerHTML = '';
            return;
        }

        const timesToNoor = metroDataManager.getSchedule(station, dayType, 'toNoor');
        const timesToElGoli = metroDataManager.getSchedule(station, dayType, 'toElGoli');

        const toNoorData = this._findNextTrains(timesToNoor, now);
        const toElGoliData = this._findNextTrains(timesToElGoli, now);

        this._displayNextTrainSummary(toNoorData, toElGoliData);

        let html = `
            <h2 class="text-xl font-bold text-center mb-4">
                جدول زمانی کامل ایستگاه ${station} - ${this.dayTypeSelect.options[this.dayTypeSelect.selectedIndex].text}
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        `;

        html += this._createScheduleCard(
            'به سمت نور (ایستگاه پایانی: نور)',
            timesToNoor,
            'toNoor',
            station,
            toNoorData.nextThreeTrains
        );

        html += this._createScheduleCard(
            'به سمت ائل گؤلی (ایستگاه پایانی: ائل گؤلی)',
            timesToElGoli,
            'toElGoli',
            station,
            toElGoliData.nextThreeTrains
        );

        html += '</div>';
        this.scheduleResults.innerHTML = html;
    },

    /**
     * تابع کمکی برای ساخت کارت HTML هر جهت
     */
    _createScheduleCard: function (title, times, directionKey, station, nextTrains = []) {
        let cardHtml = `
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-6">
                <h3 class="text-lg font-semibold mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">${title}</h3>
                <div class="flex flex-wrap gap-2 justify-center">
        `;

        if (!times || times.length === 0 || times.every(t => t === "***")) {
            let placeholder = "حرکتی برای این ایستگاه در این جهت ثبت نشده است.";

            if (station === "ائل گؤلی" && directionKey === "toElGoli") placeholder = "(ایستگاه پایانی)";
            if (station === "نور" && directionKey === "toNoor") placeholder = "(ایستگاه پایانی)";

            cardHtml += `<span class="text-gray-500 dark:text-gray-400 p-2">${placeholder}</span>`;

        } else {
            times.forEach(time => {
                if (time && time !== "***") {
                    const displayTime = time.substring(0, 5);
                    const isNextTrain = nextTrains.includes(time);
                    const highlightClass = isNextTrain ? 'next-train-highlight' : 'bg-gray-100 dark:bg-slate-700';

                    cardHtml += `
                        <span class="${highlightClass} text-gray-800 dark:text-gray-200 rounded-md px-3 py-1 text-sm font-medium tabular-nums transition-colors">
                            ${displayTime}
                        </span>`;
                }
            });
        }

        cardHtml += `
                </div>
            </div>
        `;
        return cardHtml;
    }
};

// =====================================================================
// ||                      راه‌اندازی برنامه (Init)                       ||\
// =====================================================================
document.addEventListener('DOMContentLoaded', async () => {
    // نمایش لودینگ قبل از هر کاری
    metroApp.showLoading();

    // راه‌اندازی ماژول‌ها (این‌ها نیازی به انتظار ندارند)
    themeManager.init(); // بازنویسی شده
    weatherWidget.init(); // مدیریت خطای بهتر
    liveClock.init(); // (جدید)

    // (تغییر - فاز ۵) persianCalendar.init() اکنون خودکفا است
    // و توابع metroApp را در زمان مناسب (پس از fetch) فراخوانی می‌کند.
    persianCalendar.init();

    // ۱. ابتدا داده‌های مترو را از API دریافت می‌کنیم
    await metroDataManager.init();

    // ۲. فقط پس از دریافت موفقیت‌آمیز داده‌ها، برنامه اصلی را راه‌اندازی می‌کنیم
    if (metroDataManager.metroData && metroDataManager.stationNames.length > 0) {
        // (تغییر - فاز ۵) init مترو دیگر نیازی به تنظیم تاریخ پیش‌فرض ندارد
        metroApp.init(metroDataManager.stationNames);
    }

    // ۳. پس از اتمام بارگذاری و راه‌اندازی، لودر را مخفی می‌کنیم
    metroApp.hideLoading();
});