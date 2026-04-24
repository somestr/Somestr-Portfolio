/* ============================================
   i18n.js — TR / EN / KO Language System
   ============================================ */

const translations = {
    tr: {
        /* Nav */
        nav_about:      'hakkında',
        nav_skills:     'beceriler',
        nav_education:  'eğitim',
        nav_projects:   'projeler',
        nav_contact:    'iletişim',
        nav_experience: 'deneyim',
        nav_terminal:   'terminal',

        /* Status */
        status_active: 'SİSTEM AKTİF',

        /* Hero terminal */
        hero_name_label:     'İSİM  :',
        hero_role_label:     'ROL   :',
        hero_status_label:   'DURUM :',
        hero_location_label: 'KONUM :',
        hero_role_val:       'BT & Siber Güvenlik Uzmanı',
        hero_status_val:     '● AKTİF',
        hero_location_val:   'Dublin, İrlanda',
        hero_warn:  '⚠  Yetkisiz erişim tespit edildi.',
        hero_auth:  '✔  Kimlik doğrulaması tamamlandı.',
        hero_load:  '→  Portfolyo yükleniyor...',

        /* CTA */
        cta_enter:   '[ SİSTEME GİR ]',
        cta_contact: '[ İLETİŞİM ]',
        scroll_hint: 'KAYDIRIN',

        /* Section titles */
        sec_about:      'HAKKIMDA',
        sec_skills:     'BECERİLER',
        sec_education:  'EĞİTİM',
        sec_projects:   'PROJELER',
        sec_contact:    'İLETİŞİM',
        sec_experience: 'DENEYİM',
        sec_terminal:   'TERMİNAL',

        /* About */
        about_p1: 'Merhaba! Ben <span class="highlight">Ömer Burak Akçınar</span> — analitik düşünen bir BT ve siber güvenlik uzmanıyım. Sorun giderme, son kullanıcı desteği ve olay müdahalesi konularında uygulamalı deneyime sahibim.',
        about_p2: 'Yüksek baskı altındaki ortamlarda 10+ kişilik ekiplere liderlik ederken operasyonel verimliliği ve müşteri memnuniyetini koruma konusunda tecrübeliyim. Teknik sorunları teşhis etme, kullanıcıları destekleme ve güvenli BT operasyonlarına katkıda bulunma yeteneğine sahibim.',
        about_p3: 'Sürekli öğrenmeye ve gelişime inanan biri olarak, yeni siber tehditleri ve BT operasyonlarını takip ediyor, güvenli sistem ortamlarına katkı sağlamaya hazır durumda bekliyorum.',

        /* Stats */
        stat_projects: 'Tamamlanan Proje',
        stat_certs:    'Sertifika',
        stat_exp:      'Yıl Deneyim',
        stat_edu:      'Diploma',
        certs_title:   'Sertifikalar',

        /* Skills */
        skills_systems:  'Sistem & Ağ',
        skills_security: 'Siber Güvenlik',
        skills_tools:    'Araçlar & Teknolojiler',
        skill_windows:   'Windows',
        skill_linux:     'Linux',
        skill_ad:        'Active Directory',
        skill_networking:'Ağ (DNS/DHCP/VPN)',
        skill_ir:        'Olay Müdahalesi',
        skill_threat:    'Tehdit Tespiti',
        skill_vuln:      'Zafiyet Değerlendirmesi',
        skill_support:   'BT Desteği & Sorun Giderme',

        /* Experience */
        exp1_date:    'Haz 2025 — Günümüz',
        exp1_title:   'Barista',
        exp1_company: '@ Starbucks — Dublin, İrlanda',
        exp1_desc:    'Her vardiyada 100+ müşteriye verimli hizmet sunma. Günlük operasyonlar, kasa yönetimi ve ekip koordinasyonunu destekleme.',
        exp2_date:    'May 2023 — Nis 2025',
        exp2_title:   'Takım Lideri',
        exp2_company: '@ Superdrug — Dublin, İrlanda',
        exp2_desc:    '10+ kişilik ekibe liderlik, müdür yokluğunda vardiya müdürlüğü. Envanter kontrolü, kasa yönetimi ve operasyonel uyumluluk.',
        exp3_date:    'Eyl 2021 — Şub 2022',
        exp3_title:   'Siber Güvenlik Stajyeri',
        exp3_company: '@ Isparta Üniversitesi — Isparta, Türkiye',
        exp3_desc:    'Olay müdahalesi ve zafiyet değerlendirmesi. Personelin oltalama tespit oranını %35 artıran farkındalık oturumlarının düzenlenmesi.',
        exp4_date:    'Oca 2017 — Şub 2018',
        exp4_title:   'Teknik Destek Uzmanı',
        exp4_company: '@ Maxi Bilgisayar Sistemleri — Isparta, Türkiye',
        exp4_desc:    'Donanım ve yazılım kurulumu, yapılandırma ve bakım. Son kullanıcı desteği, küçük işletme ağ kurulumları ve temel siber güvenlik uygulamaları.',

        /* Education */
        edu1_title:  'Higher Diploma in Computing',
        edu1_school: '@ Griffith College — Dublin, İrlanda',
        edu1_desc:   'Bilişim alanında yüksek lisans diploma programı (2025).',
        edu2_year:   'Türkiye',
        edu2_title:  'Mekatronik Mühendisliği Lisans',
        edu2_school: '@ Süleyman Demirel Üniversitesi — Isparta, Türkiye',
        edu2_desc:   'Mekatronik Mühendisliği bölümünden B.Sc. derecesi.',

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

        /* Project Filters */
        filter_all:     '[ TÜMÜ ]',
        filter_offense: '[ SALDIRI ]',
        filter_defense: '[ SAVUNMA ]',
        filter_tools:   '[ ARAÇLAR ]',

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
        footer_title: 'BT & Siber Güvenlik Portfolyosu',

        /* Server Status */
        visitors_label: 'ZİYARET :',

        /* Terminal hero typing */
        terminal_cmd1: 'cat whoami.txt',
        terminal_cmd2: 'sudo ./init_portfolio.sh',

        /* v4.0 */
        terminal_hint:      '"help" yazarak başlayın',
        terminal_welcome:   '  ██ Ömer Burak Akçınar Portfolyo Terminaline Hoş Geldiniz ██',
        terminal_help_hint: '  Komut listesi için "help" yazın.',
        radar_title:        'Yetenek Radarı',
    },

    en: {
        /* Nav */
        nav_about:      'about',
        nav_skills:     'skills',
        nav_education:  'education',
        nav_projects:   'projects',
        nav_contact:    'contact',
        nav_experience: 'experience',
        nav_terminal:   'terminal',

        /* Status */
        status_active: 'SYSTEM ACTIVE',

        /* Hero terminal */
        hero_name_label:     'NAME   :',
        hero_role_label:     'ROLE   :',
        hero_status_label:   'STATUS :',
        hero_location_label: 'LOCATION :',
        hero_role_val:       'IT & Cybersecurity Professional',
        hero_status_val:     '● ACTIVE',
        hero_location_val:   'Dublin, Ireland',
        hero_warn:  '⚠  Unauthorized access detected.',
        hero_auth:  '✔  Authentication complete.',
        hero_load:  '→  Loading portfolio...',

        /* CTA */
        cta_enter:   '[ ENTER SYSTEM ]',
        cta_contact: '[ CONTACT ]',
        scroll_hint: 'SCROLL DOWN',

        /* Section titles */
        sec_about:      'ABOUT ME',
        sec_skills:     'SKILLS',
        sec_education:  'EDUCATION',
        sec_projects:   'PROJECTS',
        sec_contact:    'CONTACT',
        sec_experience: 'EXPERIENCE',
        sec_terminal:   'TERMINAL',

        /* About */
        about_p1: 'Hi! I\'m <span class="highlight">Ömer Burak Akçınar</span> — an analytical IT and cybersecurity professional with hands-on experience in troubleshooting, end-user support and incident response.',
        about_p2: 'Experienced in leading teams of 10+ staff in high-pressure environments while maintaining operational efficiency and customer satisfaction. Strong ability to diagnose technical issues, support users and contribute to secure, reliable IT operations.',
        about_p3: 'As a continuous learner committed to staying current with emerging cyber threats and IT operations, I\'m ready to add value to your organization\'s security and technology ecosystem.',

        /* Stats */
        stat_projects: 'Completed Projects',
        stat_certs:    'Certifications',
        stat_exp:      'Years Experience',
        stat_edu:      'Diplomas',
        certs_title:   'Certifications',

        /* Skills */
        skills_systems:  'Systems & Networking',
        skills_security: 'Cybersecurity',
        skills_tools:    'Tools & Technologies',
        skill_windows:   'Windows',
        skill_linux:     'Linux',
        skill_ad:        'Active Directory',
        skill_networking:'Networking (DNS/DHCP/VPN)',
        skill_ir:        'Incident Response',
        skill_threat:    'Threat Detection',
        skill_vuln:      'Vulnerability Assessment',
        skill_support:   'IT Support & Troubleshooting',

        /* Experience */
        exp1_date:    'Jun 2025 — Present',
        exp1_title:   'Barista',
        exp1_company: '@ Starbucks — Dublin, Ireland',
        exp1_desc:    'Delivering efficient service in a high-volume environment serving 100+ customers per shift. Supporting daily operations, cash handling and team coordination.',
        exp2_date:    'May 2023 — Apr 2025',
        exp2_title:   'Team Leader',
        exp2_company: '@ Superdrug — Dublin, Ireland',
        exp2_desc:    'Led a team of 10+ staff, acted as duty manager during absences. Oversaw scheduling, delegation, inventory control, cash management and operational compliance.',
        exp3_date:    'Sep 2021 — Feb 2022',
        exp3_title:   'Cybersecurity Intern',
        exp3_company: '@ Isparta University — Isparta, Turkey',
        exp3_desc:    'Assisted with incident response and vulnerability assessments. Co-organized phishing awareness sessions that improved staff detection rates by 35%.',
        exp4_date:    'Jan 2017 — Feb 2018',
        exp4_title:   'Technical Support',
        exp4_company: '@ Maxi Computer Systems — Isparta, Turkey',
        exp4_desc:    'Installed, configured and maintained client systems. Diagnosed and resolved technical issues, provided end-user support, assisted with network setups and basic cybersecurity practices.',

        /* Education */
        edu1_title:  'Higher Diploma in Computing',
        edu1_school: '@ Griffith College — Dublin, Ireland',
        edu1_desc:   'Higher Diploma in Computing programme (2025).',
        edu2_year:   'Turkey',
        edu2_title:  'B.Sc. in Mechatronic Engineering',
        edu2_school: '@ Süleyman Demirel University — Isparta, Turkey',
        edu2_desc:   'Bachelor of Science degree in Mechatronic Engineering.',

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

        /* Project Filters */
        filter_all:     '[ ALL ]',
        filter_offense: '[ OFFENSE ]',
        filter_defense: '[ DEFENSE ]',
        filter_tools:   '[ TOOLS ]',

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
        footer_title: 'IT & Cybersecurity Portfolio',

        /* Server Status */
        visitors_label: 'VISITORS :',

        /* Terminal hero typing */
        terminal_cmd1: 'cat whoami.txt',
        terminal_cmd2: 'sudo ./init_portfolio.sh',

        /* v4.0 */
        terminal_hint:      'Type "help" to get started',
        terminal_welcome:   '  ██ Welcome to Ömer Burak Akçınar Portfolio Terminal ██',
        terminal_help_hint: '  Type "help" for available commands.',
        radar_title:        'Skill Radar',
    },

    ko: {
        /* Nav */
        nav_about:      '소개',
        nav_skills:     '기술',
        nav_education:  '학력',
        nav_projects:   '프로젝트',
        nav_contact:    '연락처',
        nav_experience: '경력',
        nav_terminal:   '터미널',

        /* Status */
        status_active: '시스템 활성',

        /* Hero terminal */
        hero_name_label:     '이름   :',
        hero_role_label:     '역할   :',
        hero_status_label:   '상태   :',
        hero_location_label: '위치   :',
        hero_role_val:       'IT & 사이버 보안 전문가',
        hero_status_val:     '● 활성',
        hero_location_val:   '더블린, 아일랜드',
        hero_warn:  '⚠  무단 접근이 감지되었습니다.',
        hero_auth:  '✔  인증이 완료되었습니다.',
        hero_load:  '→  포트폴리오 로딩 중...',

        /* CTA */
        cta_enter:   '[ 시스템 진입 ]',
        cta_contact: '[ 연락하기 ]',
        scroll_hint: '스크롤',

        /* Section titles */
        sec_about:      '소개',
        sec_skills:     '기술 스택',
        sec_education:  '학력',
        sec_projects:   '프로젝트',
        sec_contact:    '연락처',
        sec_experience: '경력',
        sec_terminal:   '터미널',

        /* About */
        about_p1: '안녕하세요! 저는 <span class="highlight">Ömer Burak Akçınar</span> — 문제 해결, 최종 사용자 지원 및 사고 대응에 실무 경험을 가진 분석적 IT 및 사이버 보안 전문가입니다.',
        about_p2: '높은 압박 환경에서 10명 이상의 팀을 이끌며 운영 효율성과 고객 만족도를 유지한 경험이 있습니다. 기술적 문제 진단, 사용자 지원, 안전하고 신뢰할 수 있는 IT 운영에 기여할 수 있습니다.',
        about_p3: '새로운 사이버 위협과 IT 운영에 대한 지속적인 학습을 통해 조직의 보안 및 기술 생태계에 가치를 더할 준비가 되어 있습니다.',

        /* Stats */
        stat_projects: '완료된 프로젝트',
        stat_certs:    '자격증',
        stat_exp:      '경력 연수',
        stat_edu:      '학위',
        certs_title:   '자격증',

        /* Skills */
        skills_systems:  '시스템 & 네트워킹',
        skills_security: '사이버 보안',
        skills_tools:    '도구 & 기술',
        skill_windows:   'Windows',
        skill_linux:     'Linux',
        skill_ad:        'Active Directory',
        skill_networking:'네트워킹 (DNS/DHCP/VPN)',
        skill_ir:        '사고 대응',
        skill_threat:    '위협 탐지',
        skill_vuln:      '취약점 평가',
        skill_support:   'IT 지원 & 문제 해결',

        /* Experience */
        exp1_date:    '2025년 6월 — 현재',
        exp1_title:   '바리스타',
        exp1_company: '@ Starbucks — 더블린, 아일랜드',
        exp1_desc:    '교대당 100명 이상의 고객에게 효율적인 서비스 제공. 일일 운영, 현금 관리 및 팀 조율 지원.',
        exp2_date:    '2023년 5월 — 2025년 4월',
        exp2_title:   '팀 리더',
        exp2_company: '@ Superdrug — 더블린, 아일랜드',
        exp2_desc:    '10명 이상의 팀 리더십, 부재 시 당직 매니저 역할. 스케줄링, 재고 관리, 현금 관리 및 운영 준수 감독.',
        exp3_date:    '2021년 9월 — 2022년 2월',
        exp3_title:   '사이버 보안 인턴',
        exp3_company: '@ 이스파르타 대학교 — 이스파르타, 터키',
        exp3_desc:    '사고 대응 및 취약점 평가 지원. 직원 피싱 탐지율을 35% 향상시킨 인식 교육 공동 기획.',
        exp4_date:    '2017년 1월 — 2018년 2월',
        exp4_title:   '기술 지원',
        exp4_company: '@ Maxi Computer Systems — 이스파르타, 터키',
        exp4_desc:    '클라이언트 시스템 설치, 구성 및 유지보수. 기술 문제 진단 및 해결, 최종 사용자 지원, 네트워크 설정 및 기본 사이버 보안 실무.',

        /* Education */
        edu1_title:  'Higher Diploma in Computing',
        edu1_school: '@ Griffith College — 더블린, 아일랜드',
        edu1_desc:   '컴퓨팅 분야 고등 디플로마 프로그램 (2025).',
        edu2_year:   '터키',
        edu2_title:  '메카트로닉 공학 학사',
        edu2_school: '@ Süleyman Demirel University — 이스파르타, 터키',
        edu2_desc:   '메카트로닉 공학과 이학사 학위.',

        /* Projects */
        proj1_desc: '맞춤 제작 네트워크 스캐너 및 취약점 탐지 도구. Nmap 출력을 분석하여 자동 CVE 매칭을 수행합니다.',
        proj2_desc: '웹 애플리케이션 보안 스캐너. XSS, SQL 인젝션, CSRF, IDOR 취약점을 자동 탐지합니다. OWASP Top 10 전체 범위.',
        proj3_desc: '암호화 알고리즘 분석 플랫폼. 취약한 암호화 구현을 탐지하고 현대적 대안을 제안합니다.',
        proj4_desc: '격리된 샌드박스 환경에서 악성코드를 분석하는 플랫폼. 행위 기반 탐지 및 보고 시스템을 포함합니다.',
        proj5_desc: '실시간 네트워크 패킷 분석 및 이상 탐지 시스템. 머신 러닝을 활용하여 공격 패턴을 인식합니다.',
        proj6_desc: 'HackTheBox, TryHackMe 및 국제 CTF 대회에서 해결한 문제들의 상세한 풀이 모음.',
        found_vulns:    '발견된 취약점:',
        analyzed:       '분석 완료:',
        detection_rate: '탐지율:',
        solved:         '해결:',

        /* Project Filters */
        filter_all:     '[ 전체 ]',
        filter_offense: '[ 공격 ]',
        filter_defense: '[ 방어 ]',
        filter_tools:   '[ 도구 ]',

        /* Contact */
        contact_status: '"새로운 기회에 열려 있습니다"',

        /* Form */
        form_name:    '이름',
        form_email:   '이메일',
        form_message: '메시지',
        form_send:    '[ 메시지 전송 ]',
        ph_name:      '이름을 입력하세요...',
        ph_email:     '이메일 주소...',
        ph_message:   '메시지를 작성하세요...',
        form_ok:      '✔ 메시지가 전송되었습니다.',
        form_err:     '✖ 모든 필드를 입력해 주세요.',

        /* Footer */
        footer_echo:  '모든 권리 보유. 무단 접근은 금지됩니다.',
        footer_title: 'IT & 사이버 보안 포트폴리오',

        /* Server Status */
        visitors_label: '방문자 :',

        /* Terminal hero typing */
        terminal_cmd1: 'cat whoami.txt',
        terminal_cmd2: 'sudo ./init_portfolio.sh',

        /* v4.0 */
        terminal_hint:      '"help"를 입력하여 시작하세요',
        terminal_welcome:   '  ██ Ömer Burak Akçınar 포트폴리오 터미널에 오신 것을 환영합니다 ██',
        terminal_help_hint: '  사용 가능한 명령어를 보려면 "help"를 입력하세요.',
        radar_title:        '스킬 레이더',
    }
};

/* ---- Active language (default: Turkish from browser or fallback) ---- */
function detectBrowserLang() {
    const nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('tr')) return 'tr';
    if (nav.startsWith('ko')) return 'ko';
    return 'en';
}
let currentLang = localStorage.getItem('sec_lang') || detectBrowserLang();

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
    const koBtn = document.getElementById('lang-ko');
    if (koBtn) koBtn.classList.toggle('active', lang === 'ko');
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

    const koBtn = document.getElementById('lang-ko');

    const langCycle = ['tr', 'en', 'ko'];
    toggle.addEventListener('click', () => {
        const idx = langCycle.indexOf(currentLang);
        switchLang(langCycle[(idx + 1) % langCycle.length]);
    });

    trBtn.addEventListener('click', e => { e.stopPropagation(); switchLang('tr'); });
    enBtn.addEventListener('click', e => { e.stopPropagation(); switchLang('en'); });
    if (koBtn) koBtn.addEventListener('click', e => { e.stopPropagation(); switchLang('ko'); });
});

/* ---- Export helper for script.js ---- */
function getT(key) {
    return (translations[currentLang] || translations.tr)[key] || key;
}
