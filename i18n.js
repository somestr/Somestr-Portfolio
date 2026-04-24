/* ============================================
   i18n.js — TR / EN Language System
   ============================================ */

const translations = {
    tr: {
        /* Nav */
        nav_about:    'hakkında',
        nav_skills:   'beceriler',
        nav_projects: 'projeler',
        nav_contact:  'iletişim',

        /* Status */
        status_active: 'SİSTEM AKTİF',

        /* Hero terminal */
        hero_name_label:     'İSİM  :',
        hero_role_label:     'ROL   :',
        hero_status_label:   'DURUM :',
        hero_location_label: 'KONUM :',
        hero_role_val:       'Siber Güvenlik Uzmanı & Penetrasyon Test Uzmanı',
        hero_status_val:     '● AKTİF',
        hero_location_val:   'Türkiye / Uzaktan',
        hero_warn:  '⚠  Yetkisiz erişim tespit edildi.',
        hero_auth:  '✔  Kimlik doğrulaması tamamlandı.',
        hero_load:  '→  Portfolyo yükleniyor...',

        /* CTA */
        cta_enter:   '[ SİSTEME GİR ]',
        cta_contact: '[ İLETİŞİM ]',
        scroll_hint: 'KAYDIRIN',

        /* Section titles */
        sec_about:    'HAKKIMDA',
        sec_skills:   'BECERİLER',
        sec_projects: 'PROJELER',
        sec_contact:  'İLETİŞİM',

        /* About */
        about_p1: 'Merhaba! Ben bir <span class="highlight">Siber Güvenlik Uzmanıyım</span>. Sistemlerin güvenlik açıklarını bulmak, saldırı vektörlerini analiz etmek ve güvenli altyapılar oluşturmak konusunda uzmanlaşmış biriyim.',
        about_p2: 'Ağ güvenliği, uygulama penetrasyon testleri ve olay müdahalesi alanlarında aktif olarak çalışıyorum. Savunma kadar saldırı tekniklerini de derinlemesine anlayan bir yaklaşımla güvenlik çözümleri üretiyorum.',
        about_p3: 'Sürekli öğrenmeye inanan ve yeni tehdit vektörlerini takip eden biri olarak siber güvenlik ekosisteminize değer katmaya hazırım.',

        /* Stats */
        stat_projects: 'Tamamlanan Proje',
        stat_cve:      'Bulunan CVE',
        stat_exp:      'Yıl Deneyim',
        stat_certs:    'Sertifika',
        certs_title:   'Sertifikalar',

        /* Skills */
        skills_offense: 'Saldırı Teknikleri',
        skills_defense: 'Savunma & Analiz',
        skills_tools:   'Araçlar & Teknolojiler',
        skill_pentest:  'Penetrasyon Testi',
        skill_webapp:   'Web Uygulama Güvenliği',
        skill_se:       'Sosyal Mühendislik',
        skill_exploit:  'Exploit Geliştirme',
        skill_netsec:   'Ağ Güvenliği',
        skill_malware:  'Malware Analizi',
        skill_forensic: 'Dijital Adli Bilişim',
        skill_ir:       'Olay Müdahalesi',

        /* Projects */
        proj1_desc: 'Özel geliştirilmiş ağ tarama ve güvenlik açığı tespiti aracı. Nmap çıktılarını analiz ederek otomatik CVE eşleştirmesi yapar.',
        proj2_desc: 'Web uygulama güvenlik tarayıcısı. XSS, SQL injection, CSRF ve IDOR açıklarını otomatik tespit eder. OWASP Top 10 kapsamı.',
        proj3_desc: 'Şifreleme algoritmaları analiz platformu. Zayıf kriptografik uygulamaları tespit eder ve modern alternatifleri önerir.',
        proj4_desc: 'İzole sandbox ortamında malware analizi yapan platform. Davranış tabanlı tespit ve raporlama sistemi içerir.',
        proj5_desc: 'Gerçek zamanlı ağ paketi analiz ve anomali tespit sistemi. Makine öğrenmesi ile saldırı örüntülerini tanır.',
        proj6_desc: 'HackTheBox, TryHackMe ve uluslararası CTF yarışmalarında çözülen zorlukların detaylı writeup koleksiyonu.',

        found_vulns:    'Bulunan Açıklar:',
        analyzed:       'Analiz Edilen:',
        detection_rate: 'Tespit Oranı:',
        solved:         'Çözülen:',

        /* Contact */
        contact_status: '"Yeni fırsatlara açık"',

        /* Form */
        form_name:    'İSİM',
        form_email:   'E-POSTA',
        form_message: 'MESAJ',
        form_send:    '[ MESAJI GÖNDER ]',
        ph_name:      'İsminizi girin...',
        ph_email:     'E-posta adresiniz...',
        ph_message:   'Mesajınızı yazın...',
        form_ok:      '✔ Mesajınız gönderildi.',
        form_err:     '✖ Lütfen tüm alanları doldurun.',

        /* Footer */
        footer_echo:  'Tüm haklar saklıdır. İzinsiz erişim yasaktır.',
        footer_title: 'Siber Güvenlik Portfolyosu',

        /* Terminal hero typing */
        terminal_cmd1: 'cat whoami.txt',
        terminal_cmd2: 'sudo ./init_portfolio.sh',
    },

    en: {
        /* Nav */
        nav_about:    'about',
        nav_skills:   'skills',
        nav_projects: 'projects',
        nav_contact:  'contact',

        /* Status */
        status_active: 'SYSTEM ACTIVE',

        /* Hero terminal */
        hero_name_label:     'NAME   :',
        hero_role_label:     'ROLE   :',
        hero_status_label:   'STATUS :',
        hero_location_label: 'LOCATION :',
        hero_role_val:       'Cybersecurity Expert & Penetration Tester',
        hero_status_val:     '● ACTIVE',
        hero_location_val:   'Turkey / Remote',
        hero_warn:  '⚠  Unauthorized access detected.',
        hero_auth:  '✔  Authentication complete.',
        hero_load:  '→  Loading portfolio...',

        /* CTA */
        cta_enter:   '[ ENTER SYSTEM ]',
        cta_contact: '[ CONTACT ]',
        scroll_hint: 'SCROLL DOWN',

        /* Section titles */
        sec_about:    'ABOUT ME',
        sec_skills:   'SKILLS',
        sec_projects: 'PROJECTS',
        sec_contact:  'CONTACT',

        /* About */
        about_p1: 'Hi! I\'m a <span class="highlight">Cybersecurity Expert</span> specializing in finding security vulnerabilities, analyzing attack vectors, and building secure infrastructures.',
        about_p2: 'I actively work in network security, application penetration testing, and incident response — combining deep offensive knowledge with defensive expertise to deliver actionable security solutions.',
        about_p3: 'As a continuous learner who keeps up with emerging threat vectors, I\'m ready to add value to your cybersecurity ecosystem.',

        /* Stats */
        stat_projects: 'Completed Projects',
        stat_cve:      'CVEs Found',
        stat_exp:      'Years Experience',
        stat_certs:    'Certifications',
        certs_title:   'Certifications',

        /* Skills */
        skills_offense: 'Offensive Techniques',
        skills_defense: 'Defense & Analysis',
        skills_tools:   'Tools & Technologies',
        skill_pentest:  'Penetration Testing',
        skill_webapp:   'Web Application Security',
        skill_se:       'Social Engineering',
        skill_exploit:  'Exploit Development',
        skill_netsec:   'Network Security',
        skill_malware:  'Malware Analysis',
        skill_forensic: 'Digital Forensics',
        skill_ir:       'Incident Response',

        /* Projects */
        proj1_desc: 'Custom-built network scanner and vulnerability detection tool. Analyzes Nmap outputs to perform automatic CVE matching.',
        proj2_desc: 'Web application security scanner. Automatically detects XSS, SQL injection, CSRF and IDOR vulnerabilities. Full OWASP Top 10 coverage.',
        proj3_desc: 'Cryptographic algorithm analysis platform. Detects weak cryptographic implementations and recommends modern alternatives.',
        proj4_desc: 'Malware analysis platform running in an isolated sandbox environment. Includes behavior-based detection and reporting system.',
        proj5_desc: 'Real-time network packet analysis and anomaly detection system. Recognizes attack patterns using machine learning.',
        proj6_desc: 'Detailed writeup collection of challenges solved on HackTheBox, TryHackMe, and international CTF competitions.',

        found_vulns:    'Vulnerabilities Found:',
        analyzed:       'Analyzed:',
        detection_rate: 'Detection Rate:',
        solved:         'Solved:',

        /* Contact */
        contact_status: '"Open to new opportunities"',

        /* Form */
        form_name:    'NAME',
        form_email:   'EMAIL',
        form_message: 'MESSAGE',
        form_send:    '[ SEND MESSAGE ]',
        ph_name:      'Enter your name...',
        ph_email:     'Your email address...',
        ph_message:   'Write your message...',
        form_ok:      '✔ Message sent successfully.',
        form_err:     '✖ Please fill in all fields.',

        /* Footer */
        footer_echo:  'All rights reserved. Unauthorized access is prohibited.',
        footer_title: 'Cybersecurity Portfolio',

        /* Terminal hero typing */
        terminal_cmd1: 'cat whoami.txt',
        terminal_cmd2: 'sudo ./init_portfolio.sh',
    }
};

/* ---- Active language (default: Turkish from browser or fallback) ---- */
const browserLang = (navigator.language || '').toLowerCase().startsWith('tr') ? 'tr' : 'en';
let currentLang = localStorage.getItem('sec_lang') || browserLang;

/* ---- Apply translations to DOM ---- */
function applyTranslations(lang) {
    const t = translations[lang];
    if (!t) return;

    /* Text content */
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key] !== undefined) el.innerHTML = t[key];
    });

    /* Placeholder attributes */
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.getAttribute('data-i18n-ph');
        if (t[key] !== undefined) el.setAttribute('placeholder', t[key]);
    });

    /* html lang attribute */
    document.documentElement.lang = lang;

    /* Toggle button highlight */
    document.getElementById('lang-tr').classList.toggle('active', lang === 'tr');
    document.getElementById('lang-en').classList.toggle('active', lang === 'en');
}

/* ---- Switch language ---- */
function switchLang(lang) {
    currentLang = lang;
    localStorage.setItem('sec_lang', lang);
    applyTranslations(lang);
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
    applyTranslations(currentLang);

    const toggle = document.getElementById('lang-toggle');
    const trBtn  = document.getElementById('lang-tr');
    const enBtn  = document.getElementById('lang-en');

    toggle.addEventListener('click', () => {
        switchLang(currentLang === 'tr' ? 'en' : 'tr');
    });

    trBtn.addEventListener('click', e => { e.stopPropagation(); switchLang('tr'); });
    enBtn.addEventListener('click', e => { e.stopPropagation(); switchLang('en'); });
});

/* ---- Export helper for script.js ---- */
function getT(key) {
    return (translations[currentLang] || translations.tr)[key] || key;
}
