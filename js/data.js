// ============================================
// WaterFlow - Data Module
// Water Station Management & Fluid Mechanics Analysis System
// Contains governorates, users, stations, fluid mechanics data & demo storage
// ============================================

const WaterFlowData = (function() {
    'use strict';

    const STATIONS_STORAGE_KEY = 'waterflow_stations_data';
    const FLUID_ANALYSIS_KEY = 'waterflow_last_fluid_analysis';

    // Governorates data with official colors and credentials (All 27 Egyptian Governorates)
    const governorates = [
        { id: 'cairo', name: 'القاهرة', password: 'CAIRO2026!', color: '#1E3A8A', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Flag_of_Cairo_Governorate.png/320px-Flag_of_Cairo_Governorate.png', region: 'الوجه البحري' },
        { id: 'giza', name: 'الجيزة', password: 'GIZA2026!', color: '#047857', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Giza_Governorate.png/320px-Flag_of_Giza_Governorate.png', region: 'الوجه البحري' },
        { id: 'alexandria', name: 'الإسكندرية', password: 'ALEX2026!', color: '#0369A1', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Flag_of_Alexandria.png/320px-Flag_of_Alexandria.png', region: 'الوجه البحري' },
        { id: 'dakahlia', name: 'الدقهلية', password: 'DAKA2026!', color: '#15803D', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Flag_Egy_Dakahleya.gif/320px-Flag_Egy_Dakahleya.gif', region: 'الوجه البحري' },
        { id: 'sharkia', name: 'الشرقية', password: 'SHAR2026!', color: '#166534', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Flag_Of_Sharkia_Governorate.png/320px-Flag_Of_Sharkia_Governorate.png', region: 'الوجه البحري' },
        { id: 'gharbia', name: 'الغربية', password: 'GHAR2026!', color: '#1D4ED8', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Flag_of_Gharbia_Governorate.png/320px-Flag_of_Gharbia_Governorate.png', region: 'الوجه البحري' },
        { id: 'qalubia', name: 'القليوبية', password: 'QALU2026!', color: '#15803D', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Flag_of_Qalubiya_Governorate.png/320px-Flag_of_Qalubiya_Governorate.png', region: 'الوجه البحري' },
        { id: 'menoufia', name: 'المنوفية', password: 'MONU2026!', color: '#166534', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Flag_of_Menoufia_Governorate.PNG/320px-Flag_of_Menoufia_Governorate.PNG', region: 'الوجه البحري' },
        { id: 'kafr_sheikh', name: 'كفر الشيخ', password: 'KAFR2026!', color: '#0891B2', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Flag_of_Kafr_El-Sheikh_Governorate-official.png/320px-Flag_of_Kafr_El-Sheikh_Governorate-official.png', region: 'الوجه البحري' },
        { id: 'beheira', name: 'البحيرة', password: 'BEHE2026!', color: '#1D4ED8', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flag_of_Behira_Govenorate.JPG/320px-Flag_of_Behira_Govenorate.JPG', region: 'الوجه البحري' },
        { id: 'damietta', name: 'دمياط', password: 'DAMI2026!', color: '#0369A1', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Governadorat_de_Damietta.png/320px-Governadorat_de_Damietta.png', region: 'الوجه البحري' },
        { id: 'port_said', name: 'بورسعيد', password: 'PORT2026!', color: '#B91C1C', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Flag_of_Port_Said_Governorate.PNG/320px-Flag_of_Port_Said_Governorate.PNG', region: 'قناة السويس' },
        { id: 'ismailia', name: 'الإسماعيلية', password: 'ISMA2026!', color: '#15803D', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Governadorat_d%27Ismailiya.png/320px-Governadorat_d%27Ismailiya.png', region: 'قناة السويس' },
        { id: 'suez', name: 'السويس', password: 'SUEZ2026!', color: '#0369A1', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Flag_of_the_governorate_of_suez.png/320px-Flag_of_the_governorate_of_suez.png', region: 'قناة السويس' },
        { id: 'north_sinai', name: 'شمال سيناء', password: 'NSIN2026!', color: '#CA8A04', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Governadorat_de_Sinai-Sinai_del_nord.png/320px-Governadorat_de_Sinai-Sinai_del_nord.png', region: 'سيناء' },
        { id: 'south_sinai', name: 'جنوب سيناء', password: 'SSIN2026!', color: '#0891B2', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Flag_of_South_Sinai_Governorate.png/320px-Flag_of_South_Sinai_Governorate.png', region: 'سيناء' },
        { id: 'matrouh', name: 'مطروح', password: 'MATR2026!', color: '#0369A1', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Flag_Of_The_Matrouh_Governorate_%28High_resolution%29.png/320px-Flag_Of_The_Matrouh_Governorate_%28High_resolution%29.png', region: 'الحدود الغربية' },
        { id: 'red_sea', name: 'البحر الأحمر', password: 'REDS2026!', color: '#B91C1C', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Red_sea_governorate_flag.png/320px-Red_sea_governorate_flag.png', region: 'البحر الأحمر' },
        { id: 'new_valley', name: 'الوادي الجديد', password: 'NEWV2026!', color: '#78716C', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Flag_of_New_Valley_Governorate.png/320px-Flag_of_New_Valley_Governorate.png', region: 'الصحراء الغربية' },
        { id: 'faiyum', name: 'الفيوم', password: 'FAIY2026!', color: '#15803D', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Governadorat_de_Faium.png/320px-Governadorat_de_Faium.png', region: 'الوجه القبلي' },
        { id: 'beni_suef', name: 'بني سويف', password: 'BENI2026!', color: '#CA8A04', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Governadorat_de_Bani_Suwayf.png/320px-Governadorat_de_Bani_Suwayf.png', region: 'الوجه القبلي' },
        { id: 'minya', name: 'المنيا', password: 'MINY2026!', color: '#15803D', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Minya_Governorate.jpg/320px-Flag_of_Minya_Governorate.jpg', region: 'الوجه القبلي' },
        { id: 'asyut', name: 'أسيوط', password: 'ASYU2026!', color: '#0369A1', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Flag_of_Asyut_Governorate.png/320px-Flag_of_Asyut_Governorate.png', region: 'الوجه القبلي' },
        { id: 'sohag', name: 'سوهاج', password: 'SOHA2026!', color: '#CA8A04', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Flag_Egy_Sawhaj.gif/320px-Flag_Egy_Sawhaj.gif', region: 'الوجه القبلي' },
        { id: 'qena', name: 'قنا', password: 'QENA2026!', color: '#1E40AF', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Flag_of_Qena_Governorate.png/320px-Flag_of_Qena_Governorate.png', region: 'الوجه القبلي' },
        { id: 'luxor', name: 'الأقصر', password: 'LUXO2026!', color: '#B45309', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Eg_luxor.png/320px-Eg_luxor.png', region: 'الوجه القبلي' },
        { id: 'aswan', name: 'أسوان', password: 'ASWA2026!', color: '#0891B2', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Flag_of_Aswan_Governorate.png/320px-Flag_of_Aswan_Governorate.png', region: 'الوجه القبلي' }
    ];

    // Admin users
    const adminUsers = [
        { username: 'admin', password: 'admin2026', role: 'admin', name: 'مدير النظام', governorateId: null },
        { username: 'general', password: 'general2026', role: 'general', name: 'المراقب العام', governorateId: null }
    ];

    // Generate governorate monitor users
    const monitorUsers = governorates.map(gov => ({
        username: gov.id,
        password: gov.password,
        role: 'governorate',
        name: `مراقب ${gov.name}`,
        governorateId: gov.id
    }));

    // All users combined
    const allUsers = [...adminUsers, ...monitorUsers];

    // Initial base stations with detailed fluid mechanics parameters
    function createInitialStations() {
        const list = [
            {
                id: 'damietta_03',
                name: 'Damietta Water Station #03',
                nameAr: 'محطة دمياط #03 (محطة كفر البطيخ الرئيسية)',
                governorateId: 'damietta',
                governorateName: 'دمياط',
                type: 'محطة رئيسية',
                status: 'active',
                location: 'مركز كفر البطيخ - دمياط',
                capacity: 48000,
                lastUpdate: new Date().toISOString(),
                sensors: {
                    tds: 210,
                    ph: 7.35,
                    turbidity: 1.15,
                    conductivity: 430,
                    temperature: 21.0,
                    chlorine: 1.2
                },
                fluidParams: {
                    pipeDiameter: 0.20,      // meters (D = 0.20 m)
                    velocity: 2.0,           // m/s (V = 2 m/s)
                    pipeLength: 500,         // meters (L = 500 m)
                    frictionFactor: 0.02,    // Darcy factor (f = 0.02)
                    pipeMaterial: 'حديد زهر مرن (Ductile Iron)',
                    pipeMaterialKey: 'ductile_iron',
                    operatingPressure: 4.2   // bar
                }
            },
            {
                id: 'damietta_01',
                name: 'Damietta Water Station #01',
                nameAr: 'محطة مياه دمياط القديمة',
                governorateId: 'damietta',
                governorateName: 'دمياط',
                type: 'محطة رئيسية',
                status: 'active',
                location: 'شارع البحر - مدينة دمياط',
                capacity: 35000,
                lastUpdate: new Date(Date.now() - 1800000).toISOString(),
                sensors: {
                    tds: 235,
                    ph: 7.2,
                    turbidity: 1.4,
                    conductivity: 460,
                    temperature: 20.5,
                    chlorine: 1.05
                },
                fluidParams: {
                    pipeDiameter: 0.25,
                    velocity: 1.8,
                    pipeLength: 750,
                    frictionFactor: 0.022,
                    pipeMaterial: 'حديد زهر رمادي (Cast Iron)',
                    pipeMaterialKey: 'cast_iron',
                    operatingPressure: 3.8
                }
            },
            {
                id: 'damietta_02',
                name: 'Damietta Water Station #02 (راس البر)',
                nameAr: 'محطة تنقية مياه رأس البر',
                governorateId: 'damietta',
                governorateName: 'دمياط',
                type: 'محطة تصفية',
                status: 'active',
                location: 'مدخل رأس البر - دمياط',
                capacity: 28000,
                lastUpdate: new Date(Date.now() - 3600000).toISOString(),
                sensors: {
                    tds: 195,
                    ph: 7.4,
                    turbidity: 0.95,
                    conductivity: 390,
                    temperature: 22.0,
                    chlorine: 1.3
                },
                fluidParams: {
                    pipeDiameter: 0.18,
                    velocity: 2.2,
                    pipeLength: 420,
                    frictionFactor: 0.016,
                    pipeMaterial: 'بولي إيثيلين عالي الكثافة (HDPE)',
                    pipeMaterialKey: 'hdpe',
                    operatingPressure: 4.0
                }
            },
            {
                id: 'cairo_01',
                name: 'Cairo Water Station #01 (روض الفرج)',
                nameAr: 'محطة مياه روض الفرج الكبرى',
                governorateId: 'cairo',
                governorateName: 'القاهرة',
                type: 'محطة رئيسية',
                status: 'active',
                location: 'كورنيش النيل - روض الفرج',
                capacity: 65000,
                lastUpdate: new Date(Date.now() - 900000).toISOString(),
                sensors: {
                    tds: 180,
                    ph: 7.5,
                    turbidity: 0.8,
                    conductivity: 380,
                    temperature: 23.0,
                    chlorine: 1.4
                },
                fluidParams: {
                    pipeDiameter: 0.35,
                    velocity: 2.1,
                    pipeLength: 1200,
                    frictionFactor: 0.019,
                    pipeMaterial: 'صلب كربوني مبطن (Lined Steel)',
                    pipeMaterialKey: 'steel',
                    operatingPressure: 5.2
                }
            },
            {
                id: 'cairo_02',
                name: 'Cairo Water Station #02 (المعادي)',
                nameAr: 'محطة مياه المعادي الجديدة',
                governorateId: 'cairo',
                governorateName: 'القاهرة',
                type: 'محطة رئيسية',
                status: 'warning',
                location: 'طريق الأوتوستراد - المعادي',
                capacity: 52000,
                lastUpdate: new Date(Date.now() - 1200000).toISOString(),
                sensors: {
                    tds: 310,
                    ph: 7.1,
                    turbidity: 2.8,
                    conductivity: 510,
                    temperature: 24.2,
                    chlorine: 0.85
                },
                fluidParams: {
                    pipeDiameter: 0.30,
                    velocity: 1.9,
                    pipeLength: 850,
                    frictionFactor: 0.020,
                    pipeMaterial: 'حديد زهر مرن (Ductile Iron)',
                    pipeMaterialKey: 'ductile_iron',
                    operatingPressure: 4.8
                }
            },
            {
                id: 'alex_01',
                name: 'Alexandria Water Station #01 (السيوف)',
                nameAr: 'محطة مياه السيوف المركزية',
                governorateId: 'alexandria',
                governorateName: 'الإسكندرية',
                type: 'محطة رئيسية',
                status: 'active',
                location: 'منطقة السيوف - الإسكندرية',
                capacity: 60000,
                lastUpdate: new Date(Date.now() - 2400000).toISOString(),
                sensors: {
                    tds: 240,
                    ph: 7.3,
                    turbidity: 1.1,
                    conductivity: 450,
                    temperature: 21.5,
                    chlorine: 1.25
                },
                fluidParams: {
                    pipeDiameter: 0.28,
                    velocity: 2.0,
                    pipeLength: 900,
                    frictionFactor: 0.018,
                    pipeMaterial: 'حديد زهر مرن (Ductile Iron)',
                    pipeMaterialKey: 'ductile_iron',
                    operatingPressure: 4.6
                }
            },
            {
                id: 'giza_01',
                name: 'Giza Water Station #01 (جزيرة الدهب)',
                nameAr: 'محطة مياه جزيرة الذهب',
                governorateId: 'giza',
                governorateName: 'الجيزة',
                type: 'محطة رئيسية',
                status: 'active',
                location: 'جزيرة الدهب - الجيزة',
                capacity: 55000,
                lastUpdate: new Date(Date.now() - 1500000).toISOString(),
                sensors: {
                    tds: 190,
                    ph: 7.45,
                    turbidity: 1.0,
                    conductivity: 400,
                    temperature: 22.8,
                    chlorine: 1.35
                },
                fluidParams: {
                    pipeDiameter: 0.30,
                    velocity: 2.2,
                    pipeLength: 650,
                    frictionFactor: 0.020,
                    pipeMaterial: 'حديد زهر مرن (Ductile Iron)',
                    pipeMaterialKey: 'ductile_iron',
                    operatingPressure: 4.4
                }
            },
            {
                id: 'dakahlia_01',
                name: 'Dakahlia Water Station #01 (المنصورة)',
                nameAr: 'محطة مياه ميت فارس - المنصورة',
                governorateId: 'dakahlia',
                governorateName: 'الدقهلية',
                type: 'محطة رئيسية',
                status: 'active',
                location: 'ميت فارس - بني عبيد - الدقهلية',
                capacity: 46000,
                lastUpdate: new Date(Date.now() - 2100000).toISOString(),
                sensors: {
                    tds: 220,
                    ph: 7.3,
                    turbidity: 1.3,
                    conductivity: 440,
                    temperature: 21.8,
                    chlorine: 1.15
                },
                fluidParams: {
                    pipeDiameter: 0.22,
                    velocity: 1.95,
                    pipeLength: 600,
                    frictionFactor: 0.021,
                    pipeMaterial: 'حديد زهر مرن (Ductile Iron)',
                    pipeMaterialKey: 'ductile_iron',
                    operatingPressure: 4.1
                }
            }
        ];

        // Ensure every other governorate has at least 2 stations
        const coveredGovIds = new Set(list.map(s => s.governorateId));
        governorates.forEach((gov, index) => {
            if (!coveredGovIds.has(gov.id)) {
                list.push({
                    id: `${gov.id}_01`,
                    name: `${gov.name} Water Station #01`,
                    nameAr: `محطة ${gov.name} الرئيسية #01`,
                    governorateId: gov.id,
                    governorateName: gov.name,
                    type: 'محطة رئيسية',
                    status: index % 7 === 0 ? 'warning' : 'active',
                    location: `المنطقة المركزية - ${gov.name}`,
                    capacity: Math.floor(Math.random() * 25000) + 20000,
                    lastUpdate: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
                    sensors: {
                        tds: Math.floor(Math.random() * 200 + 150),
                        ph: +(Math.random() * 1.5 + 6.8).toFixed(2),
                        turbidity: +(Math.random() * 2 + 0.6).toFixed(2),
                        conductivity: Math.floor(Math.random() * 300 + 350),
                        temperature: +(Math.random() * 6 + 19).toFixed(1),
                        chlorine: +(Math.random() * 0.8 + 0.8).toFixed(2)
                    },
                    fluidParams: {
                        pipeDiameter: +(Math.random() * 0.2 + 0.15).toFixed(2),
                        velocity: +(Math.random() * 1.0 + 1.5).toFixed(2),
                        pipeLength: Math.floor(Math.random() * 600 + 300),
                        frictionFactor: 0.020,
                        pipeMaterial: 'حديد زهر مرن (Ductile Iron)',
                        pipeMaterialKey: 'ductile_iron',
                        operatingPressure: +(Math.random() * 1.5 + 3.5).toFixed(1)
                    }
                });

                list.push({
                    id: `${gov.id}_02`,
                    name: `${gov.name} Water Station #02`,
                    nameAr: `محطة ${gov.name} الفرعية #02`,
                    governorateId: gov.id,
                    governorateName: gov.name,
                    type: 'محطة فرعية',
                    status: 'active',
                    location: `القطاع الشرقي - ${gov.name}`,
                    capacity: Math.floor(Math.random() * 15000) + 12000,
                    lastUpdate: new Date(Date.now() - Math.floor(Math.random() * 7200000)).toISOString(),
                    sensors: {
                        tds: Math.floor(Math.random() * 200 + 160),
                        ph: +(Math.random() * 1.2 + 7.0).toFixed(2),
                        turbidity: +(Math.random() * 2 + 0.7).toFixed(2),
                        conductivity: Math.floor(Math.random() * 250 + 360),
                        temperature: +(Math.random() * 5 + 20).toFixed(1),
                        chlorine: +(Math.random() * 0.7 + 0.9).toFixed(2)
                    },
                    fluidParams: {
                        pipeDiameter: +(Math.random() * 0.15 + 0.12).toFixed(2),
                        velocity: +(Math.random() * 0.8 + 1.6).toFixed(2),
                        pipeLength: Math.floor(Math.random() * 400 + 250),
                        frictionFactor: 0.016,
                        pipeMaterial: 'بولي إيثيلين عالي الكثافة (HDPE)',
                        pipeMaterialKey: 'hdpe',
                        operatingPressure: +(Math.random() * 1.2 + 3.2).toFixed(1)
                    }
                });
            }
        });

        return list;
    }

    // Load or initialize stations from localStorage
    function getStoredStations() {
        try {
            const raw = localStorage.getItem(STATIONS_STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    // Check if Damietta #03 is present, if not merge it
                    const hasDami03 = parsed.some(s => s.id === 'damietta_03' || s.name.includes('Damietta Water Station #03'));
                    if (!hasDami03) {
                        const init = createInitialStations();
                        const dami = init.find(s => s.id === 'damietta_03');
                        if (dami) parsed.unshift(dami);
                        saveStoredStations(parsed);
                    }
                    return parsed;
                }
            }
        } catch (e) {
            console.warn('Failed reading stations from localStorage, recreating', e);
        }
        const initial = createInitialStations();
        saveStoredStations(initial);
        return initial;
    }

    function saveStoredStations(stations) {
        try {
            localStorage.setItem(STATIONS_STORAGE_KEY, JSON.stringify(stations));
        } catch (e) {
            console.error('Failed saving stations to localStorage', e);
        }
    }

    // Generate alerts
    function generateAlerts() {
        const alerts = [];
        const alertTypes = ['danger', 'warning', 'warning', 'info', 'info'];
        const alertMessages = [
            { title: 'تركيز كلور مرتفع', body: 'تم رصد ارتفاع في تركيز الكلور عن المعدل المسموح به في المحطة' },
            { title: 'عكارة مياه غير طبيعية', body: 'ارتفاع مؤشر العكارة بشكل غير معتاد يتطلب فحص فوري' },
            { title: 'توقف مؤقت للمضخة', body: 'توقف إحدى المضخات الرئيسية عن العمل - جاري الصيانة' },
            { title: 'درجة حرارة مرتفعة', body: 'ارتفاع درجة حرارة المياه عن المعدل الطبيعي' },
            { title: 'انخفاض ضغط المياه', body: 'انخفاض في ضغط المياه بشكل ملحوظ في خطوط الشبكة الرئيسية' },
            { title: 'تسرب مياه مكتشف', body: 'تم اكتشاف تسرب في خط التوزيع الرئيسي قطر 200 مم' },
            { title: 'مؤشر TDS مرتفع', body: 'ارتفاع في إجمالي الأملاح الذائبة يتجاوز الحد المسموح به' },
            { title: 'ارتفاع فواقد الاحتكاك', body: 'مؤشر هبوط الضغط تجاوز القيمة المسموحة بسبب ترسبات داخل الماسورة' }
        ];

        const stations = getStoredStations();

        for (let i = 0; i < 24; i++) {
            const station = stations[Math.floor(Math.random() * stations.length)];
            const alertMsg = alertMessages[Math.floor(Math.random() * alertMessages.length)];
            const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];

            alerts.push({
                id: `alert_${i}`,
                title: alertMsg.title,
                body: alertMsg.body,
                type: type,
                stationId: station.id,
                stationName: station.name,
                governorateId: station.governorateId,
                governorateName: station.governorateName,
                timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 3)).toISOString(),
                read: i > 5
            });
        }

        return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // Generate quality history for charts
    function generateQualityHistory(days = 7) {
        const history = [];
        const now = new Date();

        for (let d = days - 1; d >= 0; d--) {
            const date = new Date(now);
            date.setDate(date.getDate() - d);

            history.push({
                date: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('ar-EG', { weekday: 'short', month: 'short', day: 'numeric' }),
                ph: +(Math.random() * 0.8 + 7.1).toFixed(2),
                tds: Math.floor(Math.random() * 80 + 170),
                turbidity: +(Math.random() * 1.5 + 0.7).toFixed(2),
                chlorine: +(Math.random() * 0.6 + 1.0).toFixed(2),
                conductivity: Math.floor(Math.random() * 100 + 400),
                quality: Math.floor(Math.random() * 12 + 86)
            });
        }

        return history;
    }

    // Generate monthly report data
    function generateMonthlyReport() {
        const months = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
        return months.map((month, index) => ({
            month,
            monthIndex: index,
            waterQuality: Math.floor(Math.random() * 10 + 85),
            violations: Math.floor(Math.random() * 6),
            maintenance: Math.floor(Math.random() * 5 + 2),
            consumption: Math.floor(Math.random() * 50000 + 120000)
        }));
    }

    // Public API
    return {
        governorates,
        allUsers,
        adminUsers,
        monitorUsers,

        getGovernorateById(id) {
            return governorates.find(g => g.id === id);
        },

        getUserByUsername(username) {
            return allUsers.find(u => u.username === username);
        },

        getAllStations() {
            return getStoredStations();
        },

        getStationsForGovernorate(govId) {
            const stations = getStoredStations();
            return govId ? stations.filter(s => s.governorateId === govId) : stations;
        },

        getStationById(id) {
            const stations = getStoredStations();
            return stations.find(s => s.id === id) || null;
        },

        saveStation(station) {
            const stations = getStoredStations();
            const index = stations.findIndex(s => s.id === station.id);
            if (index > -1) {
                stations[index] = { ...stations[index], ...station, lastUpdate: new Date().toISOString() };
            } else {
                stations.unshift(station);
            }
            saveStoredStations(stations);
            return station;
        },

        deleteStation(stationId) {
            const stations = getStoredStations();
            const filtered = stations.filter(s => s.id !== stationId);
            saveStoredStations(filtered);
            return filtered;
        },

        updateStationFluidParams(stationId, fluidParams) {
            const stations = getStoredStations();
            const st = stations.find(s => s.id === stationId);
            if (st) {
                st.fluidParams = { ...(st.fluidParams || {}), ...fluidParams };
                st.lastUpdate = new Date().toISOString();
                saveStoredStations(stations);
                return st;
            }
            return null;
        },

        saveLastFluidAnalysis(analysis) {
            try {
                localStorage.setItem(FLUID_ANALYSIS_KEY, JSON.stringify({
                    ...analysis,
                    timestamp: new Date().toISOString()
                }));
            } catch (e) {
                console.error('Failed saving fluid analysis', e);
            }
        },

        getLastFluidAnalysis() {
            try {
                const raw = localStorage.getItem(FLUID_ANALYSIS_KEY);
                if (raw) return JSON.parse(raw);
            } catch (e) {
                console.warn('Error reading last fluid analysis', e);
            }
            // Return realistic default analysis for Damietta Water Station #03
            return {
                stationId: 'damietta_03',
                stationName: 'Damietta Water Station #03',
                governorateName: 'دمياط',
                diameter: 0.20,
                velocity: 2.0,
                pipeLength: 500,
                frictionFactor: 0.02,
                area: 0.0314,
                flowRateM3s: 0.0628,
                flowRateLs: 62.8,
                flowRateLmin: 3768,
                headLoss: 10.19,
                pressureLossKpa: 100.0,
                pressureLossBar: 1.00,
                reynoldsNumber: 398406,
                flowRegime: 'Turbulent (مضطرب)',
                timestamp: new Date().toISOString()
            };
        },

        getAlertsForGovernorate(govId) {
            const alerts = generateAlerts();
            return govId ? alerts.filter(a => a.governorateId === govId) : alerts;
        },

        getQualityHistory(govId, days = 7) {
            return generateQualityHistory(days);
        },

        getMonthlyReport() {
            return generateMonthlyReport();
        },

        getStats(govId) {
            const stations = this.getStationsForGovernorate(govId);
            const alerts = this.getAlertsForGovernorate(govId);

            return {
                totalStations: stations.length,
                activeStations: stations.filter(s => s.status === 'active').length,
                warningStations: stations.filter(s => s.status === 'warning').length,
                dangerStations: stations.filter(s => s.status === 'danger').length,
                totalAlerts: alerts.length,
                unreadAlerts: alerts.filter(a => !a.read).length,
                avgQuality: 92,
                dailyConsumption: Math.floor(Math.random() * 50000 + 480000)
            };
        }
    };
})();

// Backward compatibility alias so existing scripts accessing WaterGuardData still work perfectly
window.WaterFlowData = WaterFlowData;
window.WaterGuardData = WaterFlowData;
