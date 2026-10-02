// ============================================
// WaterFlow - Fluid Mechanics Analysis Module
// Real calculations for Flow Rate, Darcy-Weisbach Head Loss,
// Pressure Loss, Reynolds Number, and Interactive Simulation
// ============================================

const FluidMechanics = (function() {
    'use strict';

    // Physical Constants
    const G = 9.81;              // Gravitational acceleration (m/s²)
    const RHO = 1000.0;          // Water density at 20°C (kg/m³)
    const KINEMATIC_VISCOSITY = 1.004e-6; // Kinematic viscosity of water at 20°C (m²/s)

    // Pipe Materials and typical Darcy friction factors (f)
    const PIPE_MATERIALS = {
        'ductile_iron': { name: 'حديد زهر مرن (Ductile Iron)', f: 0.020, roughness: 0.00025 },
        'cast_iron': { name: 'حديد زهر رمادي (Cast Iron)', f: 0.025, roughness: 0.00050 },
        'hdpe': { name: 'بولي إيثيلين عالي الكثافة (HDPE)', f: 0.015, roughness: 0.00001 },
        'pvc': { name: 'بولي فينيل كلوريد (uPVC)', f: 0.015, roughness: 0.000015 },
        'steel': { name: 'صلب تجاري (Commercial Steel)', f: 0.018, roughness: 0.000045 },
        'concrete': { name: 'خرسانة مسلحة (Concrete)', f: 0.030, roughness: 0.00100 }
    };

    // Current State
    let state = {
        stationId: 'damietta_03',
        diameter: 0.20,       // m
        velocity: 2.0,        // m/s
        pipeLength: 500.0,    // m
        frictionFactor: 0.020, // dimensionless
        materialKey: 'ductile_iron',
        chartMinD: 0.05,      // m
        chartMaxD: 0.50,      // m
        chartVelocity: 2.0    // m/s
    };

    // Animation state
    let animFrameId = null;
    let particles = [];
    let isSimRunning = true;
    let simSpeed = 1.0;

    // Calculation Engine
    function calculateArea(diameter) {
        // A = (pi * D^2) / 4
        return (Math.PI * Math.pow(diameter, 2)) / 4.0;
    }

    function calculateFlowRate(area, velocity) {
        // Q = A * V (m³/s)
        return area * velocity;
    }

    function calculateHeadLoss(f, length, diameter, velocity) {
        // Darcy-Weisbach equation: h_f = f * (L / D) * (V^2 / 2g)
        return f * (length / diameter) * (Math.pow(velocity, 2) / (2 * G));
    }

    function calculatePressureLoss(headLoss) {
        // Delta P = rho * g * h_f (Pa)
        return RHO * G * headLoss;
    }

    function calculateReynolds(diameter, velocity) {
        // Re = (V * D) / nu
        return (velocity * diameter) / KINEMATIC_VISCOSITY;
    }

    function getFlowRegime(reynolds) {
        if (reynolds < 2300) {
            return {
                type: 'Laminar (جريان صفيحي / هادئ)',
                class: 'green',
                description: 'جريان منتظم متوازي الطبقات بقوى لزوجة سائدة (Re < 2300).'
            };
        } else if (reynolds <= 4000) {
            return {
                type: 'Transitional (جريان انتقالي)',
                class: 'orange',
                description: 'منطقة حرجة غير مستقرة تجمع بين خواص الجريان الهادئ والمضطرب (2300 ≤ Re ≤ 4000).'
            };
        } else {
            return {
                type: 'Turbulent (جريان مضطرب / دوامي)',
                class: 'blue',
                description: 'جريان دوامي عالي الخلط بقوى قصور ذاتي سائدة، وهو الشائع في شبكات المياه (Re > 4000).'
            };
        }
    }

    // Validation
    function validateInputs() {
        const errors = [];

        if (isNaN(state.diameter) || state.diameter <= 0) {
            errors.push({ field: 'diameter', msg: 'Please enter a valid pipe diameter. (يجب أن يكون قطر الماسورة أكبر من الصفر)' });
        }
        if (isNaN(state.velocity) || state.velocity <= 0) {
            errors.push({ field: 'velocity', msg: 'Please enter a valid water velocity. (يجب أن تكون سرعة المياه أكبر من الصفر)' });
        }
        if (isNaN(state.pipeLength) || state.pipeLength <= 0) {
            errors.push({ field: 'pipeLength', msg: 'Please enter a valid pipe length. (يجب أن يكون طول الماسورة أكبر من الصفر)' });
        }
        if (isNaN(state.frictionFactor) || state.frictionFactor <= 0) {
            errors.push({ field: 'frictionFactor', msg: 'Please enter a valid friction factor. (يجب أن يكون معامل الاحتكاك أكبر من الصفر)' });
        }

        return errors;
    }

    // Initialize Page
    function init() {
        populateStationDropdown();
        setupEventListeners();
        loadStationData(state.stationId);
        initSimulationCanvas();
        renderChart();
    }

    function populateStationDropdown() {
        const select = document.getElementById('stationSelect');
        if (!select) return;

        const stations = WaterFlowData.getAllStations();
        select.innerHTML = '';

        // Prioritize Damietta #03 at the top
        const dami03 = stations.find(s => s.id === 'damietta_03');
        const others = stations.filter(s => s.id !== 'damietta_03');

        const sorted = dami03 ? [dami03, ...others] : stations;

        sorted.forEach(st => {
            const opt = document.createElement('option');
            opt.value = st.id;
            opt.textContent = `${st.name} (${st.governorateName})`;
            if (st.id === state.stationId) opt.selected = true;
            select.appendChild(opt);
        });
    }

    function loadStationData(stationId) {
        const station = WaterFlowData.getStationById(stationId);
        if (!station) return;

        state.stationId = station.id;

        // Populate parameters from station or defaults
        if (station.fluidParams) {
            state.diameter = station.fluidParams.pipeDiameter || 0.20;
            state.velocity = station.fluidParams.velocity || 2.0;
            state.pipeLength = station.fluidParams.pipeLength || 500.0;
            state.frictionFactor = station.fluidParams.frictionFactor || 0.020;
            state.materialKey = station.fluidParams.pipeMaterialKey || 'ductile_iron';
        }

        // Update UI Inputs
        updateInputFields();

        // Update Station Card Details
        renderStationCard(station);

        // Run Calculations & Render
        computeAndRender();
    }

    function renderStationCard(station) {
        const nameEl = document.getElementById('stationCardName');
        const govEl = document.getElementById('stationCardGov');
        const typeEl = document.getElementById('stationCardType');
        const locEl = document.getElementById('stationCardLoc');
        const capEl = document.getElementById('stationCardCap');
        const pipeEl = document.getElementById('stationCardPipe');
        const statusEl = document.getElementById('stationCardStatus');

        if (nameEl) nameEl.textContent = station.name;
        if (govEl) govEl.textContent = `محافظة ${station.governorateName}`;
        if (typeEl) typeEl.textContent = station.type;
        if (locEl) locEl.textContent = station.location || 'الشبكة الرئيسية';
        if (capEl) capEl.textContent = `${station.capacity?.toLocaleString('ar-EG') || '-'} م³/يوم`;
        if (pipeEl) {
            const mat = PIPE_MATERIALS[state.materialKey]?.name || 'حديد زهر مرن';
            pipeEl.textContent = `خط طرد رئيسي: D=${(state.diameter * 1000).toFixed(0)} مم (${mat})`;
        }
        if (statusEl) {
            statusEl.className = `status-badge ${station.status}`;
            statusEl.textContent = station.status === 'active' ? 'نشطة' : station.status === 'warning' ? 'تحذير' : 'خطر';
        }
    }

    function updateInputFields() {
        // Flow inputs
        const dInput = document.getElementById('pipeDiameterInput');
        const dSlider = document.getElementById('pipeDiameterSlider');
        const vInput = document.getElementById('waterVelocityInput');
        const vSlider = document.getElementById('waterVelocitySlider');

        if (dInput) dInput.value = state.diameter;
        if (dSlider) dSlider.value = state.diameter;
        if (vInput) vInput.value = state.velocity;
        if (vSlider) vSlider.value = state.velocity;

        // Pressure Loss inputs
        const lInput = document.getElementById('pipeLengthInput');
        const lSlider = document.getElementById('pipeLengthSlider');
        const fInput = document.getElementById('frictionFactorInput');
        const matSelect = document.getElementById('pipeMaterialSelect');

        if (lInput) lInput.value = state.pipeLength;
        if (lSlider) lSlider.value = state.pipeLength;
        if (fInput) fInput.value = state.frictionFactor;
        if (matSelect) matSelect.value = state.materialKey;

        // Chart controls
        const chartMinD = document.getElementById('chartMinD');
        const chartMaxD = document.getElementById('chartMaxD');
        const chartV = document.getElementById('chartV');

        if (chartMinD) chartMinD.value = state.chartMinD;
        if (chartMaxD) chartMaxD.value = state.chartMaxD;
        if (chartV) chartV.value = state.chartVelocity;
    }

    function computeAndRender() {
        const errors = validateInputs();
        const alertBox = document.getElementById('validationAlert');
        const alertMsg = document.getElementById('validationMessage');

        if (errors.length > 0) {
            if (alertBox && alertMsg) {
                alertMsg.textContent = errors[0].msg;
                alertBox.style.display = 'flex';
            }
            return;
        } else {
            if (alertBox) alertBox.style.display = 'none';
        }

        // 1. Cross-sectional Area
        // Formula: A = (pi * D^2) / 4
        const area = calculateArea(state.diameter);

        // 2. Flow Rate
        // Formula: Q = A * V
        const flowRateM3s = calculateFlowRate(area, state.velocity);
        const flowRateLs = flowRateM3s * 1000.0;
        const flowRateLmin = flowRateM3s * 60000.0;
        const flowRateM3h = flowRateM3s * 3600.0;

        // 3. Head Loss (Darcy-Weisbach)
        // Formula: h_f = f * (L / D) * (V^2 / 2g)
        const headLoss = calculateHeadLoss(state.frictionFactor, state.pipeLength, state.diameter, state.velocity);

        // 4. Pressure Loss
        // Formula: Delta P = rho * g * h_f
        const pressureLossPa = calculatePressureLoss(headLoss);
        const pressureLossKpa = pressureLossPa / 1000.0;
        const pressureLossBar = pressureLossPa / 100000.0;

        // 5. Reynolds & Regime
        const reynolds = calculateReynolds(state.diameter, state.velocity);
        const regime = getFlowRegime(reynolds);

        // 6. Hydraulic Gradient (Head loss per 100m)
        const lossPer100m = (headLoss / state.pipeLength) * 100.0;

        // Update Flow Rate Outputs
        setText('resArea', formatVal(area, 4) + ' m²');
        setText('resFlowM3s', formatVal(flowRateM3s, 4) + ' m³/s');
        setText('resFlowLs', formatVal(flowRateLs, 1) + ' L/s');
        setText('resFlowLmin', formatVal(flowRateLmin, 0) + ' L/min');
        setText('resFlowM3h', formatVal(flowRateM3h, 1) + ' m³/h');

        // Update Head & Pressure Loss Outputs
        setText('resHeadLoss', formatVal(headLoss, 2) + ' m');
        setText('resPressurePa', formatVal(pressureLossPa, 0) + ' Pa');
        setText('resPressureKpa', formatVal(pressureLossKpa, 1) + ' kPa');
        setText('resPressureBar', formatVal(pressureLossBar, 2) + ' bar');
        setText('resLossPer100m', formatVal(lossPer100m, 2) + ' m/100m');

        // Update Reynolds & Regime Outputs
        setText('resReynolds', Math.round(reynolds).toLocaleString('en-US'));
        const regimeEl = document.getElementById('resRegime');
        if (regimeEl) {
            regimeEl.textContent = regime.type;
            regimeEl.className = `status-badge ${regime.class}`;
        }
        setText('resRegimeDesc', regime.description);

        // Update Live Simulation Readouts
        setText('simDiameterVal', `${(state.diameter * 1000).toFixed(0)} mm (${state.diameter.toFixed(2)} m)`);
        setText('simVelocityVal', `${state.velocity.toFixed(2)} m/s`);
        setText('simAreaVal', `${formatVal(area, 4)} m²`);
        setText('simFlowVal', `${formatVal(flowRateLs, 1)} L/s`);

        // Save last analysis in system storage for Dashboard integration
        WaterFlowData.saveLastFluidAnalysis({
            stationId: state.stationId,
            stationName: document.getElementById('stationCardName')?.textContent || 'Damietta Water Station #03',
            governorateName: document.getElementById('stationCardGov')?.textContent?.replace('محافظة ', '') || 'دمياط',
            diameter: state.diameter,
            velocity: state.velocity,
            pipeLength: state.pipeLength,
            frictionFactor: state.frictionFactor,
            area: area,
            flowRateM3s: flowRateM3s,
            flowRateLs: flowRateLs,
            flowRateLmin: flowRateLmin,
            headLoss: headLoss,
            pressureLossKpa: pressureLossKpa,
            pressureLossBar: pressureLossBar,
            reynoldsNumber: Math.round(reynolds),
            flowRegime: regime.type
        });

        // Also persist updated fluid params back to current station
        WaterFlowData.updateStationFluidParams(state.stationId, {
            pipeDiameter: state.diameter,
            velocity: state.velocity,
            pipeLength: state.pipeLength,
            frictionFactor: state.frictionFactor,
            pipeMaterialKey: state.materialKey,
            pipeMaterial: PIPE_MATERIALS[state.materialKey]?.name || 'حديد زهر مرن'
        });

        // Redraw chart
        renderChart();
    }

    function formatVal(val, decimals = 2) {
        if (isNaN(val)) return '0.00';
        return Number(val).toFixed(decimals);
    }

    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    // Setup Event Listeners
    function setupEventListeners() {
        // Station Selector
        const stationSelect = document.getElementById('stationSelect');
        if (stationSelect) {
            stationSelect.addEventListener('change', function() {
                loadStationData(this.value);
            });
        }

        // Pipe Diameter input & slider sync
        const dInput = document.getElementById('pipeDiameterInput');
        const dSlider = document.getElementById('pipeDiameterSlider');
        if (dInput && dSlider) {
            dInput.addEventListener('input', function() {
                state.diameter = parseFloat(this.value) || 0;
                dSlider.value = state.diameter;
                computeAndRender();
            });
            dSlider.addEventListener('input', function() {
                state.diameter = parseFloat(this.value) || 0;
                dInput.value = state.diameter;
                computeAndRender();
            });
        }

        // Velocity input & slider sync
        const vInput = document.getElementById('waterVelocityInput');
        const vSlider = document.getElementById('waterVelocitySlider');
        if (vInput && vSlider) {
            vInput.addEventListener('input', function() {
                state.velocity = parseFloat(this.value) || 0;
                vSlider.value = state.velocity;
                computeAndRender();
            });
            vSlider.addEventListener('input', function() {
                state.velocity = parseFloat(this.value) || 0;
                vInput.value = state.velocity;
                computeAndRender();
            });
        }

        // Pipe Length input & slider sync
        const lInput = document.getElementById('pipeLengthInput');
        const lSlider = document.getElementById('pipeLengthSlider');
        if (lInput && lSlider) {
            lInput.addEventListener('input', function() {
                state.pipeLength = parseFloat(this.value) || 0;
                lSlider.value = state.pipeLength;
                computeAndRender();
            });
            lSlider.addEventListener('input', function() {
                state.pipeLength = parseFloat(this.value) || 0;
                lInput.value = state.pipeLength;
                computeAndRender();
            });
        }

        // Friction Factor & Material Select
        const fInput = document.getElementById('frictionFactorInput');
        const matSelect = document.getElementById('pipeMaterialSelect');
        if (fInput && matSelect) {
            fInput.addEventListener('input', function() {
                state.frictionFactor = parseFloat(this.value) || 0;
                computeAndRender();
            });
            matSelect.addEventListener('change', function() {
                state.materialKey = this.value;
                const mat = PIPE_MATERIALS[this.value];
                if (mat) {
                    state.frictionFactor = mat.f;
                    fInput.value = mat.f;
                    computeAndRender();
                }
            });
        }

        // Chart controls
        const chartMinD = document.getElementById('chartMinD');
        const chartMaxD = document.getElementById('chartMaxD');
        const chartV = document.getElementById('chartV');

        if (chartMinD) {
            chartMinD.addEventListener('input', function() {
                state.chartMinD = parseFloat(this.value) || 0.05;
                renderChart();
            });
        }
        if (chartMaxD) {
            chartMaxD.addEventListener('input', function() {
                state.chartMaxD = parseFloat(this.value) || 0.50;
                renderChart();
            });
        }
        if (chartV) {
            chartV.addEventListener('input', function() {
                state.chartVelocity = parseFloat(this.value) || 2.0;
                renderChart();
            });
        }

        // Quick Preset Diameter buttons
        document.querySelectorAll('.preset-btn[data-d]').forEach(btn => {
            btn.addEventListener('click', function() {
                const d = parseFloat(this.dataset.d);
                if (d > 0) {
                    state.diameter = d;
                    updateInputFields();
                    computeAndRender();
                }
            });
        });

        // Quick Preset Velocity buttons
        document.querySelectorAll('.preset-btn[data-v]').forEach(btn => {
            btn.addEventListener('click', function() {
                const v = parseFloat(this.dataset.v);
                if (v > 0) {
                    state.velocity = v;
                    updateInputFields();
                    computeAndRender();
                }
            });
        });

        // Presentation Demo Scenario buttons
        const demoBtn1 = document.getElementById('demoScenario1');
        const demoBtn2 = document.getElementById('demoScenario2');
        const demoBtn3 = document.getElementById('demoScenario3');

        if (demoBtn1) {
            demoBtn1.addEventListener('click', () => {
                // Scenario 1: Damietta #03 default: D=0.20m, V=2.0m/s
                state.stationId = 'damietta_03';
                const select = document.getElementById('stationSelect');
                if (select) select.value = 'damietta_03';
                loadStationData('damietta_03');
                state.diameter = 0.20;
                state.velocity = 2.0;
                state.pipeLength = 500.0;
                state.frictionFactor = 0.020;
                updateInputFields();
                computeAndRender();
                Auth.showToast('عرض تقديمي 1', 'تم تحميل محطة دمياط #03 (قطر 0.20 م، سرعة 2 م/ث) -> تدفق 62.8 لتر/ث', 'info');
            });
        }

        if (demoBtn2) {
            demoBtn2.addEventListener('click', () => {
                // Scenario 2: Increase Diameter to 0.30m
                state.diameter = 0.30;
                state.velocity = 2.0;
                updateInputFields();
                computeAndRender();
                Auth.showToast('عرض تقديمي 2', 'تم تعديل القطر إلى 0.30 م -> تضاعف التدفق إلى 141.4 لتر/ث بنفس السرعة!', 'success');
            });
        }

        if (demoBtn3) {
            demoBtn3.addEventListener('click', () => {
                // Scenario 3: Increase Velocity to 3.0 m/s and Length to 1000m
                state.velocity = 3.0;
                state.pipeLength = 1000.0;
                updateInputFields();
                computeAndRender();
                Auth.showToast('عرض تقديمي 3', 'زيادة السرعة إلى 3 م/ث وطول الماسورة إلى 1000 م -> مضاعفة هبوط الضغط Darcy-Weisbach!', 'warning');
            });
        }

        // Reset to Defaults
        const resetBtn = document.getElementById('resetDefaultsBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                state.diameter = 0.20;
                state.velocity = 2.0;
                state.pipeLength = 500.0;
                state.frictionFactor = 0.020;
                state.materialKey = 'ductile_iron';
                updateInputFields();
                computeAndRender();
                Auth.showToast('إعادة تعيين', 'تمت استعادة القيم الافتراضية بنجاح', 'info');
            });
        }

        // Simulation play/pause
        const toggleSimBtn = document.getElementById('toggleSimBtn');
        if (toggleSimBtn) {
            toggleSimBtn.addEventListener('click', () => {
                isSimRunning = !isSimRunning;
                toggleSimBtn.innerHTML = isSimRunning ? '<i class="fas fa-pause"></i> إيقاف مؤقت' : '<i class="fas fa-play"></i> تشغيل';
            });
        }

        // Window resize chart re-render
        window.addEventListener('resize', () => {
            renderChart();
        });
    }

    // ============================================
    // Dynamic Chart: Pipe Diameter vs Flow Rate
    // Q = (pi * D^2 / 4) * V
    // ============================================
    function renderChart() {
        const container = document.getElementById('flowChartContainer');
        if (!container) return;

        const canvas = document.getElementById('flowRateCanvas') || document.createElement('canvas');
        canvas.id = 'flowRateCanvas';
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        const width = rect.width || 600;
        const height = 320;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        if (!canvas.parentElement) container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        const padding = { top: 30, right: 30, bottom: 50, left: 65 };
        const chartW = width - padding.left - padding.right;
        const chartH = height - padding.top - padding.bottom;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        const minD = Math.max(0.02, state.chartMinD);
        const maxD = Math.max(minD + 0.1, state.chartMaxD);
        const V = state.chartVelocity;

        // Generate data points
        const pointsCount = 25;
        const data = [];
        let maxQ = 0;

        for (let i = 0; i <= pointsCount; i++) {
            const d = minD + (i / pointsCount) * (maxD - minD);
            const a = calculateArea(d);
            const qLs = calculateFlowRate(a, V) * 1000.0; // in L/s
            data.push({ d, q: qLs });
            if (qLs > maxQ) maxQ = qLs;
        }

        // Add 15% headroom on Y axis
        const yMax = maxQ * 1.15 || 100;

        // Coordinate conversion helpers
        function getX(d) {
            return padding.left + ((d - minD) / (maxD - minD)) * chartW;
        }
        function getY(q) {
            return padding.top + chartH - (q / yMax) * chartH;
        }

        // Draw horizontal grid lines and Y axis labels
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#64748B';
        ctx.font = '11px Cairo, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        const ySteps = 5;
        for (let i = 0; i <= ySteps; i++) {
            const val = (yMax / ySteps) * i;
            const y = getY(val);

            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartW, y);
            ctx.stroke();

            ctx.fillText(Math.round(val) + ' L/s', padding.left - 10, y);
        }

        // Draw vertical grid lines and X axis labels
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const xSteps = 6;
        for (let i = 0; i <= xSteps; i++) {
            const dVal = minD + ((maxD - minD) / xSteps) * i;
            const x = getX(dVal);

            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, padding.top + chartH);
            ctx.stroke();

            ctx.fillText(dVal.toFixed(2) + ' m', x, padding.top + chartH + 10);
        }

        // Axis Titles
        ctx.fillStyle = '#1E293B';
        ctx.font = 'bold 12px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Pipe Diameter - قطر الماسورة D (m)', padding.left + chartW / 2, height - 12);

        ctx.save();
        ctx.translate(16, padding.top + chartH / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Flow Rate - معدل التدفق Q (L/s)', 0, 0);
        ctx.restore();

        // Draw Area Fill under curve
        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
        gradient.addColorStop(0, 'rgba(46, 134, 171, 0.35)');
        gradient.addColorStop(1, 'rgba(46, 134, 171, 0.02)');

        ctx.beginPath();
        ctx.moveTo(getX(data[0].d), getY(0));
        data.forEach(pt => {
            ctx.lineTo(getX(pt.d), getY(pt.q));
        });
        ctx.lineTo(getX(data[data.length - 1].d), getY(0));
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw Curve
        ctx.beginPath();
        ctx.strokeStyle = '#2E86AB';
        ctx.lineWidth = 3;
        data.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(getX(pt.d), getY(pt.q));
            else ctx.lineTo(getX(pt.d), getY(pt.q));
        });
        ctx.stroke();

        // Highlight Current Operating Point (state.diameter)
        if (state.diameter >= minD && state.diameter <= maxD) {
            const currArea = calculateArea(state.diameter);
            const currQ = calculateFlowRate(currArea, V) * 1000.0;
            const curX = getX(state.diameter);
            const curY = getY(currQ);

            // Vertical indicator line
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = '#C9A227';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(curX, padding.top + chartH);
            ctx.lineTo(curX, curY);
            ctx.stroke();

            // Horizontal indicator line
            ctx.beginPath();
            ctx.moveTo(padding.left, curY);
            ctx.lineTo(curX, curY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Glow / Pulse Circle
            ctx.beginPath();
            ctx.arc(curX, curY, 8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(201, 162, 39, 0.3)';
            ctx.fill();

            // Solid inner circle
            ctx.beginPath();
            ctx.arc(curX, curY, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#C9A227';
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Tooltip bubble above current point
            const label = `D=${state.diameter.toFixed(2)}m | Q=${currQ.toFixed(1)} L/s`;
            ctx.font = 'bold 11px Cairo, sans-serif';
            const textWidth = ctx.measureText(label).width;
            const bubbleW = textWidth + 16;
            const bubbleH = 24;
            const bubbleX = Math.min(Math.max(curX - bubbleW / 2, padding.left), padding.left + chartW - bubbleW);
            const bubbleY = Math.max(curY - bubbleH - 10, padding.top);

            ctx.fillStyle = '#0F172A';
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 6) : ctx.rect(bubbleX, bubbleY, bubbleW, bubbleH);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, bubbleX + bubbleW / 2, bubbleY + bubbleH / 2);
        }
    }

    // ============================================
    // Interactive Simulation Canvas (Animated Flow)
    // ============================================
    function initSimulationCanvas() {
        const canvas = document.getElementById('simCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        const width = rect.width || 600;
        const height = 240;

        canvas.width = width * dpr;
        canvas.height = height * dpr;

        // Initialize water particles
        particles = [];
        const particleCount = 70;
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                yNorm: Math.random() * 2 - 1, // -1 (top wall) to +1 (bottom wall)
                size: Math.random() * 3 + 1.5,
                opacity: Math.random() * 0.7 + 0.3
            });
        }

        if (animFrameId) cancelAnimationFrame(animFrameId);

        function animate() {
            if (isSimRunning) {
                drawSimulation(canvas, ctx, width, height, dpr);
            }
            animFrameId = requestAnimationFrame(animate);
        }

        animate();
    }

    function drawSimulation(canvas, ctx, width, height, dpr) {
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, width, height);

        const centerY = height / 2;
        // Pipe visual diameter proportional to state.diameter (min 40px, max 160px)
        const minVisH = 50;
        const maxVisH = 170;
        const normD = Math.min(Math.max((state.diameter - 0.05) / (0.60 - 0.05), 0), 1);
        const pipeH = minVisH + normD * (maxVisH - minVisH);
        const pipeTop = centerY - pipeH / 2;
        const pipeBottom = centerY + pipeH / 2;

        const pipeLeft = 50;
        const pipeRight = width - 50;
        const pipeLen = pipeRight - pipeLeft;

        // Background pipe gradient (water fill) with pressure drop gradient (high pressure on left -> lower on right)
        const waterGrad = ctx.createLinearGradient(pipeLeft, 0, pipeRight, 0);
        waterGrad.addColorStop(0, 'rgba(46, 134, 171, 0.45)');   // High pressure (Inlet)
        waterGrad.addColorStop(1, 'rgba(30, 58, 138, 0.15)');   // Lower pressure (Outlet)

        // Draw Water Chamber
        ctx.fillStyle = waterGrad;
        ctx.fillRect(pipeLeft, pipeTop, pipeLen, pipeH);

        // Pipe Upper & Lower Walls (Solid Metal / Flanged)
        const wallThickness = 12;

        // Top Wall
        ctx.fillStyle = '#334155';
        ctx.fillRect(pipeLeft, pipeTop - wallThickness, pipeLen, wallThickness);
        // Bottom Wall
        ctx.fillRect(pipeLeft, pipeBottom, pipeLen, wallThickness);

        // Wall Hatches / Texture
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 1;
        for (let x = pipeLeft; x < pipeRight; x += 16) {
            ctx.beginPath();
            ctx.moveTo(x, pipeTop - wallThickness);
            ctx.lineTo(x + 10, pipeTop);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, pipeBottom);
            ctx.lineTo(x + 10, pipeBottom + wallThickness);
            ctx.stroke();
        }

        // Flanges at Inlet and Outlet
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(pipeLeft - 10, pipeTop - wallThickness - 8, 10, pipeH + wallThickness * 2 + 16);
        ctx.fillRect(pipeRight, pipeTop - wallThickness - 8, 10, pipeH + wallThickness * 2 + 16);

        // Move and draw water fluid particles
        // Speed proportional to water velocity V
        const baseSpeed = state.velocity * 1.8 * simSpeed;

        particles.forEach(p => {
            // Parabolic or turbulent velocity profile: fastest in the center (yNorm = 0), slower near walls (yNorm = ±1)
            // Turbulent velocity profile approximation: u(r) = U_max * (1 - r/R)^(1/7)
            const wallDist = 1 - Math.abs(p.yNorm);
            const speedFactor = 0.35 + 0.65 * Math.pow(Math.max(wallDist, 0.05), 0.25);
            p.x += baseSpeed * speedFactor;

            if (p.x > pipeRight) {
                p.x = pipeLeft + Math.random() * 10;
                p.yNorm = Math.random() * 1.8 - 0.9;
            }

            const py = centerY + (p.yNorm * (pipeH / 2 - 4));

            ctx.beginPath();
            ctx.arc(p.x, py, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(56, 189, 248, ${p.opacity})`;
            ctx.fill();
        });

        // Draw Streamlines
        const streamlineCount = 5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 8]);
        for (let s = 1; s <= streamlineCount; s++) {
            const sy = pipeTop + (pipeH / (streamlineCount + 1)) * s;
            ctx.beginPath();
            ctx.moveTo(pipeLeft, sy);
            ctx.lineTo(pipeRight, sy);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Diameter measurement line on the left
        ctx.strokeStyle = '#C9A227';
        ctx.lineWidth = 2;
        const dimX = pipeLeft - 24;

        ctx.beginPath();
        ctx.moveTo(dimX, pipeTop);
        ctx.lineTo(dimX, pipeBottom);
        ctx.stroke();

        // Arrow heads for diameter
        ctx.beginPath();
        ctx.moveTo(dimX - 4, pipeTop + 6);
        ctx.lineTo(dimX, pipeTop);
        ctx.lineTo(dimX + 4, pipeTop + 6);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(dimX - 4, pipeBottom - 6);
        ctx.lineTo(dimX, pipeBottom);
        ctx.lineTo(dimX + 4, pipeBottom - 6);
        ctx.stroke();

        // Diameter label
        ctx.fillStyle = '#C9A227';
        ctx.font = 'bold 11px Cairo, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`D = ${(state.diameter * 1000).toFixed(0)} mm`, dimX - 6, centerY);

        // Velocity flow arrow in the middle
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px Cairo, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`Water Velocity V = ${state.velocity.toFixed(2)} m/s ➔`, (pipeLeft + pipeRight) / 2, pipeTop - 18);

        // Inlet / Outlet pressure labels
        ctx.font = '10px Cairo, sans-serif';
        ctx.fillStyle = '#94A3B8';
        ctx.textAlign = 'center';
        ctx.fillText('المدخل (P₁ مرتفع)', pipeLeft + 40, pipeBottom + wallThickness + 18);
        ctx.fillText('المخرج (P₂ منخفض)', pipeRight - 40, pipeBottom + wallThickness + 18);

        ctx.restore();
    }

    return {
        init,
        computeAndRender,
        loadStationData,
        getState: () => ({ ...state })
    };
})();
