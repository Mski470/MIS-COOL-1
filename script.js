/* =========================================
   1. إعدادات Firebase الربط السحابي
   ========================================= */
// تأكدي أن هذه البيانات مطابقة لمشروعك في Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA4_aX-sRYpzZITrt0fF82ONoeb4d71GUA",
  authDomain: "maath-library-2026.firebaseapp.com",
  projectId: "maath-library-2026",
  storageBucket: "maath-library-2026.firebasestorage.app",
  messagingSenderId: "667101666048",
  appId: "1:667101666048:web:220bcfef7157c9b369b1e5",
  measurementId: "G-Z5EE8PB9S0",
};

// تهيئة Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

/* =========================================
   2. وظائف الواجهة الرئيسية (UI)
   ========================================= */
document.addEventListener("DOMContentLoaded", () => {
  // إخفاء شاشة التحميل بعد ثانية واحدة
  setTimeout(() => {
    const loader = document.getElementById("loadingOverlay");
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => (loader.style.display = "none"), 500);
    }
  }, 1000);

  updateHeaderDate();
  loadLiveAlerts();
  loadRecentUploads();
});

// تحديث التاريخ في الهيدر
function updateHeaderDate() {
  const dateElement = document.getElementById("currentDate");
  if (dateElement) {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    dateElement.innerText = new Date().toLocaleDateString("ar-EG", options);
  }
} /* =========================================
   3. جلب البيانات من Firestore
   ========================================= */

// وظيفة جلب التنبيهات العاجلة (شريط الأخبار)
function loadLiveAlerts() {
  const alertsList = document.getElementById("alertsList");
  if (!alertsList) return;

  db.collection("alerts")
    .orderBy("createdAt", "desc")
    .limit(5) // هنجيب آخر 5 تنبيهات بس
    .onSnapshot((snapshot) => {
      if (snapshot.empty) {
        alertsList.innerHTML =
          '<span class="ticker-text">لا توجد تنبيهات جديدة حالياً.. تابعونا!</span>';
        return;
      }

      let alertsHTML = "";
      snapshot.forEach((doc) => {
        const data = doc.data();
        alertsHTML += `<span class="ticker-text">${data.text} &nbsp;&nbsp; • &nbsp;&nbsp; </span>`;
      });
      alertsList.innerHTML = alertsHTML;
    });
}

// وظيفة جلب "أحدث الإضافات" (الملفات)
function loadRecentUploads() {
  const container = document.getElementById("recentUploads");
  if (!container) return;

  db.collection("files")
    .orderBy("createdAt", "desc")
    .limit(4) // هنجيب آخر 4 حاجات اترفعت
    .onSnapshot((snapshot) => {
      if (snapshot.empty) {
        container.innerHTML =
          '<p style="padding: 20px; color: var(--text-muted);">لا توجد ملفات مرفوعة مؤخراً.</p>';
        return;
      }

      let uploadsHTML = "";
      snapshot.forEach((doc) => {
        const file = doc.data();
        uploadsHTML += `
          <div class="data-row animate__animated animate__fadeInUp" style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 15px;">
              <div style="color: var(--primary-blue); font-size: 1.2rem;">
                <i class="${
                  file.type === "video"
                    ? "fas fa-play-circle"
                    : "fas fa-file-pdf"
                }"></i>
              </div>
              <div>
                <h4 style="font-size: 0.95rem; margin-bottom: 2px;">${
                  file.name
                }</h4>
                <small style="color: var(--text-muted);">${file.subject}</small>
              </div>
            </div>
            <a href="${
              file.url
            }" target="_blank" class="btn-card" style="font-size: 0.8rem; padding: 4px 10px;">عرض</a>
          </div>
        `;
      });
      container.innerHTML = uploadsHTML;
    });
} /* =========================================
   4. التحكم في القوائم والتفاعل (UI Logic)
   ========================================= */

// دالة التحكم في القائمة الجانبية للموبايل
function setupMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.toggle("active");
    });

    // إغلاق القائمة عند الضغط في أي مكان خارجها
    document.addEventListener("click", (e) => {
      if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove("active");
      }
    });
  }
}

// دالة تشغيل القائمة المنسدلة للمواد الدراسية
function setupDropdowns() {
  const subjectsBtn = document.getElementById("subjectsBtn");
  const subjectsMenu = document.getElementById("subjectsMenu");

  if (subjectsBtn && subjectsMenu) {
    subjectsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // تبديل الفتح والإغلاق
      const isOpened = subjectsMenu.classList.contains("show");

      // إغلاق أي قوائم أخرى لو موجودة
      subjectsMenu.classList.toggle("show");
      subjectsBtn.querySelector(".submenu-arrow").classList.toggle("rotate");
    });
  }
}

// دالة البحث الذكي
function setupSearch() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && searchInput.value.trim() !== "") {
        const query = searchInput.value.trim();
        // التوجه لصفحة نتائج البحث مع إرسال الكلمة في الرابط
        window.location.href = `search-results.html?q=${encodeURIComponent(
          query
        )}`;
      }
    });
  }
}

// استدعاء كل الدوال عند التحميل
setupMobileMenu();
setupDropdowns();
setupSearch(); /* =========================================
   5. معالج الروابط والديناميكية
   ========================================= */

// دالة لإضافة انيميشن عند الانتقال بين الصفحات
document.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", function (e) {
    const href = this.getAttribute("href");
    if (href && href !== "#" && !href.startsWith("javascript")) {
      // إظهار شاشة التحميل قبل الانتقال
      const loader = document.getElementById("loadingOverlay");
      if (loader) {
        loader.style.display = "flex";
        loader.style.opacity = "1";
      }
    }
  });
});

// دالة مساعدة لجلب معرفات الروابط (URL Parameters)
// هنستخدمها في صفحة المادة لاحقاً
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

console.log("✅ تم تحميل نظام منصة 2026 بنجاح");
