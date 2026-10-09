# برنامه مترو تبریز (TimeMetro)

<div align="center">
  <a href="https://timemetro.ir/">
    <img src="https://img.icons8.com/fluency/96/000000/subway.png" alt="لوگوی برنامه مترو تبریز" width="100" height="100">
  </a>
  
  <h1>برنامه مترو تبریز (TimeMetro)</h1>
  
  <p>
    یک برنامه وب هوشمند و آفلاین برای نمایش زمان‌بندی حرکت قطارهای مترو تبریز.<br>
    <a href="https://github.com/pourjanali/TimeMetro/issues">گزارش خطا</a> · 
    <a href="https://github.com/pourjanali/TimeMetro/pulls">درخواست ویژگی جدید</a> · 
    <a href="https://feedback.onl/fa/b/timemetro">ارسال بازخورد</a>
  </p>
</div>

<div align="center">
  
  ![MIT License](https://img.shields.io/github/license/pourjanali/TimeMetro?style=for-the-badge)
  ![GitHub Stars](https://img.shields.io/github/stars/pourjanali/TimeMetro?style=for-the-badge&color=yellow)
  ![GitHub Forks](https://img.shields.io/github/forks/pourjanali/TimeMetro?style=for-the-badge&color=green)
  ![GitHub Issues](https://img.shields.io/github/issues/pourjanali/TimeMetro?style=for-the-badge&color=orange)
  ![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare-blue?style=for-the-badge&logo=cloudflare)

</div>


## 🚇 درباره پروژه

این پروژه یک برنامه وب (Web App) ساده، سریع و کارآمد برای مسافران مترو تبریز است. هدف اصلی این برنامه، ارائه‌ی جدول زمانی دقیق حرکت قطارها به صورت آفلاین است تا کاربران بتوانند به راحتی برای سفرهای درون‌شهری خود برنامه‌ریزی کنند.

## 🚀 مشاهده نسخه زنده (Live Demo)

- [timemetro.ir](https://timemetro.ir)
- [Beta](https://pourjanali.github.io/TimeMetro)
- [Feedback](https://feedback.onl/fa/b/timemetro)

## ✨ ویژگی‌های کلیدی

- 📱 **طراحی واکنش‌گرا (Responsive):** نمایش بی‌نقص در تمامی دستگاه‌ها (موبایل، تبلت و دسکتاپ)
- ⏰ **زمان‌بندی هوشمند:** نمایش خودکار قطار بعدی و زمان باقی‌مانده تا حرکت آن
- 🔄 **عملکرد آفلاین:** تمام داده‌های زمان‌بندی به صورت محلی در برنامه ذخیره شده‌اند و نیازی به اتصال اینترنت نیست
- 📅 **تقویم و ساعت زنده:** نمایش ساعت دقیق و تاریخ شمسی برای راحتی کاربر
- ✌️ **دو حالت کاربری:** تفکیک کامل جدول زمانی برای «روزهای عادی» و «روزهای تعطیل»
- 🎨 **رابط کاربری مدرن:** طراحی تمیز و مدرن با استفاده از Tailwind CSS و حالت تاریک (Dark Mode)

## 🛠️ فناوری‌های استفاده شده

این پروژه با استفاده از فناوری‌های مدرن وب و به صورت ایستا (Static) ساخته شده است:

- **HTML5**
- **CSS3** و **Tailwind CSS** (برای طراحی رابط کاربری)
- **JavaScript (ES6+)** (برای منطق اصلی برنامه، ساعت زنده و پردازش داده‌ها)
- **Estedad Font** (برای نمایش یکپارچه متون فارسی و کنترل‌های فرم)
- **Cloudflare Pages** (برای میزبانی و توزیع)

## 💾 مدیریت داده‌ها

داده‌های زمان‌بندی (Timetable) به صورت رشته‌های CSV در کد JavaScript داخل `index.html` قرار دارند. پارسر داخلی این رشته‌ها را خوانده و به آرایه‌های قابل پردازش تبدیل می‌کند. برای به‌روزرسانی زمان‌ها، رشته‌های موجود در متغیرهای `csvDataNormal` و `csvDataHoliday` را در `index.html` به‌روزرسانی کنید.

## 🔎 بررسی SEO

برای اجرای بررسی‌های ایستای متادیتا، ساختار HTML، JSON-LD، robots.txt و sitemap.xml در PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\seo-check.ps1
```

این بررسی‌ها جایگزین آزمون مرورگر واقعی، داده‌های Google Search Console یا بررسی پاسخ‌های نهایی Cloudflare Pages نیستند.

صفحه‌های مستقل حریم خصوصی و شرایط استفاده در مسیرهای canonical `/privacy` و `/terms` ارائه می‌شوند و فایل‌های `privacy.html` و `terms.html` منبع این صفحات هستند. مسیرهای قدیمی دارای پسوند `.html` و اسلش پایانی از طریق `_redirects` به URLهای تمیز منتقل می‌شوند. فایل `app.js` نیز برای جلوگیری از خطای 404 در ارجاع‌های قدیمی نگه داشته شده است.

## 🤝 مشارکت در توسعه

این پروژه متن‌باز است و ما از هرگونه مشارکت برای بهبود آن استقبال می‌کنیم. اگر پیشنهادی دارید یا باگی پیدا کردید، لطفاً از طریق بخش Issues یا Pull Request اقدام کنید.

<div align="center">
<br />
<strong>ساخته شده با ❤️ برای مردم عزیز تبریز</strong>
<br />
Made with ❤️ for the great people of Tabriz
</div>
