/* =========================================
   منصة دفعة 2026 التعليمية
   ملف JavaScript الرئيسي - نسخة محسنة تماماً
   ========================================= */

/* =========================================
   1. إعدادات Firebase
   ========================================= */
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

// تفعيل Offline Persistence
db.enablePersistence().catch((err) => {
  if (err.code == "failed-precondition") {
    console.log("Persistence failed: Multiple tabs open");
  } else if (err.code == "unimplemented") {
    console.log("Persistence not available");
  }
});

/* =========================================
   2. تشغيل التطبيق عند التحميل
   ========================================= */
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 بدء تحميل المنصة...");
  initializeApp();
});

function initializeApp() {
  // إخفاء شاشة التحميل
  hideLoadingScreen();

  // تحديث التاريخ
  updateHeaderDate();

  // تحميل البيانات من Firebase
  loadAnnouncements();
  loadSchedules();
  loadRecentUploads();

  // تفعيل الوظائف التفاعلية
  setupMobileMenu();
  setupDropdowns();
  setupSearch();
  setupAnnouncementClose();

  console.log("✅ تم تحميل المنصة بنجاح!");
}

/* =========================================
   3. إدارة شاشة التحميل
   ========================================= */
function hideLoadingScreen() {
  setTimeout(() => {
    const loader = document.getElementById("loadingOverlay");
    if (loader) {
      loader.style.opacity = "0";
      setTimeout(() => {
        loader.style.display = "none";
      }, 500);
    }
  }, 1000);
}

/* =========================================
   4. تحديث التاريخ في الهيدر
   ========================================= */
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
}

/* =========================================
   5. جلب الملاحظات والإعلانات - محسّن تماماً
   ========================================= */
function loadAnnouncements() {
  const notesContainer = document.getElementById("notesContainer");
  const overlay = document.getElementById("announcementOverlay");
  const announceText = document.getElementById("announcementText");

  if (!notesContainer) {
    console.warn("⚠️ notesContainer غير موجود");
    return;
  }

  console.log("📢 جاري تحميل الملاحظات...");

  // استخدام onSnapshot بشكل صحيح
  const unsubscribe = db
    .collection("announcements")
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        console.log("✅ تم استلام بيانات الملاحظات:", snapshot.size, "عنصر");

        // مسح محتوى التحميل
        notesContainer.innerHTML = "";

        if (snapshot.empty) {
          console.log("ℹ️ لا توجد ملاحظات في قاعدة البيانات");
          notesContainer.innerHTML =
            '<p style="text-align:center; color:var(--text-muted); padding: 20px;">لا توجد ملاحظات حالياً ✨</p>';

          // إخفاء النافذة المنبثقة
          if (overlay) {
            overlay.style.display = "none";
          }
          return;
        }

        let count = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();

          // تحديث الإعلان المنبثق بأحدث ملاحظة
          if (count === 0 && overlay && announceText) {
            announceText.innerText = data.text || "ملاحظة جديدة";
            overlay.style.display = "flex";
            const card = overlay.querySelector(".announcement-card");
            if (card) {
              card.classList.add("animate__zoomIn");
            }
          }

          // إضافة الملاحظة لأرشيف الملاحظات
          const date = data.createdAt
            ? new Date(data.createdAt.seconds * 1000).toLocaleDateString(
                "ar-EG",
              )
            : "الآن";

          notesContainer.innerHTML += `
            <div class="note-item">
              <i class="fas fa-thumbtack"></i>
              <p>${data.text || "ملاحظة"}</p>
              <span class="note-date">${date}</span>
            </div>
          `;
          count++;
        });

        console.log("✅ تم عرض", count, "ملاحظة");
      },
      (error) => {
        console.error("❌ خطأ في تحميل الملاحظات:", error);
        console.error("تفاصيل الخطأ:", error.message, error.code);

        if (notesContainer) {
          notesContainer.innerHTML =
            '<p style="text-align:center; color:#ef4444; padding: 20px;">⚠️ حدث خطأ في تحميل الملاحظات<br><small>تحقق من الاتصال بالإنترنت</small></p>';
        }
        if (overlay) {
          overlay.style.display = "none";
        }
      },
    );
}

/* =========================================
   6. جلب الجداول الدراسية - محسّن تماماً
   ========================================= */
function loadSchedules() {
  const schedulesContainer = document.getElementById("schedulesContainer");

  if (!schedulesContainer) {
    console.warn("⚠️ schedulesContainer غير موجود");
    return;
  }

  console.log("📅 جاري تحميل الجداول...");

  const unsubscribe = db
    .collection("schedules")
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        console.log("✅ تم استلام بيانات الجداول:", snapshot.size, "عنصر");

        schedulesContainer.innerHTML = "";

        if (snapshot.empty) {
          console.log("ℹ️ لا توجد جداول في قاعدة البيانات");
          schedulesContainer.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 30px; color: var(--text-muted);">
              <i class="fas fa-calendar-times" style="font-size: 2rem; margin-bottom: 10px;"></i>
              <p>لا توجد جداول محدثة حالياً 📆</p>
              <small style="font-size: 0.85rem; opacity: 0.7;">سيتم إضافة الجداول قريباً</small>
            </div>`;
          return;
        }

        let count = 0;
        snapshot.forEach((doc) => {
          const schedule = doc.data();
          const scheduleCard = `
            <div class="schedule-item-card animate__animated animate__zoomIn">
              <div class="schedule-preview">
                <img src="${schedule.url || ""}" alt="${schedule.title || "جدول"}" 
                     onerror="this.src='https://via.placeholder.com/300x150?text=Schedule+Image'">
              </div>
              <i class="fas fa-calendar-alt schedule-icon"></i>
              <h3>${schedule.title || "جدول دراسي"}</h3>
              <a href="${schedule.url || "#"}" target="_blank" class="view-schedule-btn">
                عرض الجدول بالكامل
              </a>
            </div>
          `;
          schedulesContainer.innerHTML += scheduleCard;
          count++;
        });

        console.log("✅ تم عرض", count, "جدول");
      },
      (error) => {
        console.error("❌ خطأ في تحميل الجداول:", error);
        console.error("تفاصيل الخطأ:", error.message, error.code);

        schedulesContainer.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 30px; color: #ef4444;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
            <p>⚠️ حدث خطأ في تحميل الجداول</p>
            <small style="font-size: 0.85rem;">تحقق من الاتصال بالإنترنت</small>
          </div>`;
      },
    );
}

/* =========================================
   7. جلب أحدث الإضافات - محسّن تماماً
   ========================================= */
function loadRecentUploads() {
  const recentContainer = document.getElementById("recentUploads");

  if (!recentContainer) {
    console.warn("⚠️ recentUploads غير موجود");
    return;
  }

  console.log("🆕 جاري تحميل أحدث الإضافات...");

  const unsubscribe = db
    .collection("files")
    .orderBy("createdAt", "desc")
    .limit(10)
    .onSnapshot(
      (snapshot) => {
        console.log("✅ تم استلام أحدث الإضافات:", snapshot.size, "عنصر");

        recentContainer.innerHTML = "";

        if (snapshot.empty) {
          console.log("ℹ️ لا توجد إضافات حديثة");
          recentContainer.innerHTML =
            '<p style="text-align:center; color:var(--text-muted); padding:20px;">لا توجد تحديثات جديدة اليوم 🌟</p>';
          return;
        }

        let count = 0;
        snapshot.forEach((doc) => {
          const item = doc.data();
          let icon, color, typeName;

          // تحديد الأيقونة واللون بناءً على نوع المحتوى
          switch (item.type) {
            case "videos":
              icon = "fa-play-circle";
              color = "#ef4444";
              typeName = "محاضرة مرئية";
              break;
            case "exams":
              icon = "fa-pen-nib";
              color = "#10b981";
              typeName = "اختبار جديد";
              break;
            default:
              icon = "fa-file-pdf";
              color = "#3b82f6";
              typeName = "ملف تعليمي";
          }

          const itemHtml = `
            <div class="update-item animate__animated animate__fadeInRight">
              <div class="update-icon" style="background: ${color}20; color: ${color};">
                <i class="fas ${icon}"></i>
              </div>
              <div class="update-info">
                <h4>${item.name || "عنصر جديد"}</h4>
                <p>${typeName} • دفعة 2026</p>
              </div>
              <a href="${item.url || "#"}" target="_blank" class="update-link">
                <i class="fas fa-external-link-alt"></i>
              </a>
            </div>
          `;
          recentContainer.innerHTML += itemHtml;
          count++;
        });

        console.log("✅ تم عرض", count, "إضافة");
      },
      (error) => {
        console.error("❌ خطأ في تحميل الإضافات:", error);
        console.error("تفاصيل الخطأ:", error.message, error.code);

        recentContainer.innerHTML =
          '<p style="text-align:center; color:#ef4444; padding:20px;">⚠️ حدث خطأ في تحميل التحديثات</p>';
      },
    );
}

/* =========================================
   8. إغلاق الإعلان المنبثق
   ========================================= */
function setupAnnouncementClose() {
  const closeBtn = document.getElementById("closeAnnouncement");
  const overlay = document.getElementById("announcementOverlay");

  if (closeBtn && overlay) {
    closeBtn.addEventListener("click", () => {
      const card = overlay.querySelector(".announcement-card");
      if (card) {
        card.classList.remove("animate__zoomIn");
        card.classList.add("animate__zoomOut");
      }
      setTimeout(() => {
        overlay.style.display = "none";
      }, 400);
    });
  }
}

/* =========================================
   9. القائمة الجانبية للموبايل
   ========================================= */
function setupMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      sidebar.classList.toggle("active");
    });

    // إغلاق القائمة عند النقر خارجها
    document.addEventListener("click", (e) => {
      if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove("active");
      }
    });
  }
}

/* =========================================
   10. القوائم المنسدلة
   ========================================= */
function setupDropdowns() {
  const subjectsBtn = document.getElementById("subjectsBtn");
  const subjectsMenu = document.getElementById("subjectsMenu");

  if (subjectsBtn && subjectsMenu) {
    subjectsBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      subjectsMenu.classList.toggle("show");
      const arrow = subjectsBtn.querySelector(".submenu-arrow");
      if (arrow) {
        arrow.classList.toggle("rotate");
      }
    });
  }
}

/* =========================================
   11. نظام البحث الذكي
   ========================================= */
function setupSearch() {
  const searchInput = document.getElementById("searchInput");

  if (!searchInput) return;

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim();
      if (query.length > 0) {
        // إظهار شاشة التحميل
        const loader = document.getElementById("loadingOverlay");
        if (loader) {
          loader.style.display = "flex";
          loader.style.opacity = "1";
        }
        // التوجه لصفحة النتائج
        window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
      } else {
        alert("لطفاً، اكتبي كلمة للبحث عنها أولاً 🌸");
      }
    }
  });
}

/* =========================================
   12. انيميشن الظهور عند التمرير
   ========================================= */
function setupScrollReveal() {
  const observerOptions = {
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate__animated", "animate__fadeInUp");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // مراقبة جميع السكشنات والكروت
  document
    .querySelectorAll("section, .content-card, .schedule-item-card")
    .forEach((el) => {
      observer.observe(el);
    });
}

/* =========================================
   13. إضافة انيميشن عند الانتقال بين الصفحات
   ========================================= */
document.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", function (e) {
    const href = this.getAttribute("href");

    // التحقق أن الرابط ليس فارغاً، ولا يبدأ بـ #، ولا يحتوي على جافا سكريبت
    if (
      href &&
      href !== "#" &&
      !href.startsWith("#") &&
      !href.startsWith("javascript")
    ) {
      const loader = document.getElementById("loadingOverlay");
      if (loader) {
        loader.style.display = "flex";
        loader.style.opacity = "1";
      }
    }
  });
});

/* =========================================
   14. دالة مساعدة لجلب معرفات الروابط
   ========================================= */
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/* =========================================
   15. تشغيل انيميشن التمرير
   ========================================= */
setupScrollReveal();

/* =========================================
   16. نظام الجزيئات المتحركة - Advanced Loader
   ========================================= */
class ParticleSystem {
  constructor() {
    this.canvas = document.getElementById("particlesCanvas");
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.particleCount = 80;

    this.resize();
    this.init();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }
  }

  update() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((p, i) => {
      // تحديث الموقع
      p.x += p.vx;
      p.y += p.vy;

      // إعادة التدوير عند الحواف
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      // رسم الجزيء
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(0, 242, 255, ${p.opacity})`;
      this.ctx.fill();

      // رسم الخطوط بين الجزيئات القريبة
      this.particles.slice(i + 1).forEach((p2) => {
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(123, 104, 238, ${0.2 * (1 - distance / 120)})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      });
    });

    requestAnimationFrame(() => this.update());
  }
}

/* =========================================
   17. تشغيل نظام الجزيئات عند التحميل
   ========================================= */
const particleSystem = new ParticleSystem();
if (particleSystem.canvas) {
  particleSystem.update();
}

// إخفاء الشاشة بعد 4.5 ثانية
setTimeout(() => {
  const loader = document.getElementById("advancedLoader");
  if (loader) {
    loader.classList.add("fade-out");

    setTimeout(() => {
      loader.style.display = "none";
      document.body.style.overflow = "auto";
    }, 1000);
  }
}, 4500);

// رسالة نجاح التحميل
console.log("✅ منصة دفعة 2026 جاهزة للعمل بأعلى جودة!");
