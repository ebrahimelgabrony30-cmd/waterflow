// ============================================
// WaterFlow - Dashboard Module
// Water Station Management & Fluid Mechanics Analysis System
// Handles dashboard rendering, charts, and real-time updates
// ============================================

const Dashboard = (function() {
    'use strict';

    let refreshInterval;
    let currentTimeRange = 7;

    function init() {
        renderStats();
        renderFluidMechanicsCard();
        renderQualityChart(currentTimeRange);
        renderStationsChart();
        renderStationsTable();
        renderSensorCards();
        updateAlertBadges();
        setupEventListeners();
        startRealTimeUpdates();
    }

    function renderFluidMechanicsCard() {
        const stationEl = document.getElementById('dashFluidStation');
        const flowEl = document.getElementById('dashFluidFlow');
        const lossEl = document.getElementById('dashFluidLoss');
        if (!stationEl || !flowEl || !lossEl) return;

        const analysis = WaterFlowData.getLastFluidAnalysis();
        if (analysis) {
            stationEl.textContent = analysis.stationName || 'Damietta Water Station #03';
            flowEl.textContent = `${analysis.flowRateLs ? Number(analysis.flowRateLs).toFixed(1) : '62.8'} L/s (${analysis.flowRateM3s ? Number(analysis.flowRateM3s).toFixed(4) : '0.0628'} m³/s)`;
            lossEl.textContent = `${analysis.headLoss ? Number(analysis.headLoss).toFixed(2) : '10.19'} m (${analysis.pressureLossBar ? Number(analysis.pressureLossBar).toFixed(2) : '1.00'} bar)`;
        }
    }

    function getUserScope() {
        const user = Auth.getCurrentUser();
        return {
            govId: user.governorateId,
            role: user.role
        };
    }

    function renderStats() {
        const scope = getUserScope();
        const stats = WaterGuardData.getStats(scope.govId);

        const statsGrid = document.getElementById('statsGrid');
        if (!statsGrid) return;

        const cards = [
            {
                title: 'إجمالي المحطات',
                value: stats.totalStations,
                icon: 'fa-water',
                class: 'blue',
                trend: '+2',
                trendLabel: 'محطة جديدة هذا الشهر'
            },
            {
                title: 'المحطات النشطة',
                value: stats.activeStations,
                icon: 'fa-check-circle',
                class: 'green',
                trend: `${((stats.activeStations / stats.totalStations) * 100).toFixed(0)}%`,
                trendLabel: 'نسبة التشغيل'
            },
            {
                title: 'جودة المياه',
                value: stats.avgQuality + '%',
                icon: 'fa-chart-line',
                class: 'gold',
                trend: '+3%',
                trendLabel: 'تحسن عن الشهر الماضي'
            },
            {
                title: 'تنبيهات اليوم',
                value: stats.unreadAlerts,
                icon: 'fa-bell',
                class: stats.unreadAlerts > 0 ? 'red' : 'green',
                trend: stats.unreadAlerts > 0 ? 'تحتاج مراجعة' : 'لا توجد تنبيهات',
                trendLabel: 'حالة النظام'
            },
            {
                title: 'الاستهلاك اليومي',
                value: formatNumber(stats.dailyConsumption) + ' م³',
                icon: 'fa-tint',
                class: 'purple',
                trend: '+5%',
                trendLabel: 'مقارنة بالأمس'
            },
            {
                title: 'المحطات بتحذير',
                value: stats.warningStations + stats.dangerStations,
                icon: 'fa-exclamation-triangle',
                class: (stats.warningStations + stats.dangerStations) > 0 ? 'orange' : 'green',
                trend: stats.warningStations + ' تحذير, ' + stats.dangerStations + ' خطر',
                trendLabel: 'يتطلب اهتمام'
            }
        ];

        statsGrid.innerHTML = cards.map(card => `
            <div class="stat-card ${card.class} fade-in">
                <div class="stat-header">
                    <div class="stat-info">
                        <h3>${card.title}</h3>
                        <div class="stat-value">${card.value}</div>
                    </div>
                    <div class="stat-icon">
                        <i class="fas ${card.icon}"></i>
                    </div>
                </div>
                <div class="stat-footer">
                    <span class="${card.trend.startsWith('+') ? 'trend-up' : card.trend.startsWith('-') ? 'trend-down' : 'trend-neutral'}">
                        <i class="fas ${card.trend.startsWith('+') ? 'fa-arrow-up' : card.trend.startsWith('-') ? 'fa-arrow-down' : 'fa-minus'}"></i>
                        ${card.trend}
                    </span>
                    <span style="color: var(--gray-400); font-weight: 400;">${card.trendLabel}</span>
                </div>
            </div>
        `).join('');
    }

    function renderQualityChart(days) {
        const scope = getUserScope();
        const history = WaterGuardData.getQualityHistory(scope.govId, days);
        const container = document.getElementById('qualityChart');
        if (!container) return;

        const maxTds = Math.max(...history.map(d => d.tds)) * 1.2;
        const maxPh = 14;

        // Create canvas-based chart
        const canvas = document.createElement('canvas');
        canvas.width = container.clientWidth || 600;
        canvas.height = 280;
        container.innerHTML = '';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        const padding = { top: 20, right: 20, bottom: 50, left: 50 };
        const chartW = canvas.width - padding.left - padding.right;
        const chartH = canvas.height - padding.top - padding.bottom;

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Grid lines
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartH / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(padding.left + chartW, y);
            ctx.stroke();

            // Y labels for TDS
            const tdsVal = Math.round(maxTds - (maxTds / 5) * i);
            ctx.fillStyle = '#94a3b8';
            ctx.font = '11px Cairo';
            ctx.textAlign = 'left';
            ctx.fillText(tdsVal, 5, y + 4);
        }

        // Draw TDS line
        const tdsPoints = history.map((d, i) => ({
            x: padding.left + (chartW / (history.length - 1)) * i,
            y: padding.top + chartH - (d.tds / maxTds) * chartH
        }));

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
        gradient.addColorStop(0, 'rgba(46, 134, 171, 0.2)');
        gradient.addColorStop(1, 'rgba(46, 134, 171, 0.02)');

        ctx.beginPath();
        ctx.moveTo(tdsPoints[0].x, tdsPoints[0].y);
        tdsPoints.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.lineTo(tdsPoints[tdsPoints.length - 1].x, padding.top + chartH);
        ctx.lineTo(tdsPoints[0].x, padding.top + chartH);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // TDS line
        ctx.beginPath();
        ctx.moveTo(tdsPoints[0].x, tdsPoints[0].y);
        tdsPoints.forEach(p => ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = '#2E86AB';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Points
        tdsPoints.forEach((p, i) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#2E86AB';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // X labels
        history.forEach((d, i) => {
            const x = padding.left + (chartW / (history.length - 1)) * i;
            ctx.fillStyle = '#64748b';
            ctx.font = '10px Cairo';
            ctx.textAlign = 'center';
            ctx.fillText(d.label, x, canvas.height - 15);
        });

        // Legend
        const legendY = 12;
        ctx.fillStyle = '#2E86AB';
        ctx.fillRect(canvas.width - 120, legendY - 6, 15, 3);
        ctx.fillStyle = '#475569';
        ctx.font = '11px Cairo';
        ctx.textAlign = 'right';
        ctx.fillText('TDS (ppm)', canvas.width - 125, legendY);
    }

    function renderStationsChart() {
        const scope = getUserScope();
        const stations = WaterGuardData.getStationsForGovernorate(scope.govId);
        const container = document.getElementById('stationsChart');
        const legendContainer = document.getElementById('stationsLegend');
        if (!container) return;

        const statusCounts = {
            active: stations.filter(s => s.status === 'active').length,
            warning: stations.filter(s => s.status === 'warning').length,
            danger: stations.filter(s => s.status === 'danger').length,
            inactive: stations.filter(s => s.status === 'inactive').length
        };

        const total = stations.length;
        const colors = {
            active: '#27AE60',
            warning: '#F39C12',
            danger: '#E74C3C',
            inactive: '#94A3B8'
        };

        // Create SVG donut chart
        const size = 200;
        const center = size / 2;
        const radius = 80;
        const strokeWidth = 25;

        let accumulatedPercent = 0;
        const circles = [];

        Object.entries(statusCounts).forEach(([status, count]) => {
            if (count === 0) return;
            const percent = count / total;
            const circumference = 2 * Math.PI * radius;
            const dashArray = `${percent * circumference} ${circumference}`;
            const rotation = accumulatedPercent * 360 - 90;

            circles.push(`
                <circle cx="${center}" cy="${center}" r="${radius}"
                    fill="none" stroke="${colors[status]}" stroke-width="${strokeWidth}"
                    stroke-dasharray="${dashArray}"
                    transform="rotate(${rotation} ${center} ${center})"
                    style="transition: stroke-dasharray 0.5s ease;"
                />
            `);

            accumulatedPercent += percent;
        });

        container.innerHTML = `
            <div class="donut-chart">
                <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                    ${circles.join('')}
                </svg>
                <div class="donut-center">
                    <div class="donut-value">${total}</div>
                    <div class="donut-label">محطة</div>
                </div>
            </div>
        `;

        // Legend
        const labels = {
            active: 'نشطة',
            warning: 'تحذير',
            danger: 'خطر',
            inactive: 'متوقفة'
        };

        if (legendContainer) {
            legendContainer.innerHTML = Object.entries(statusCounts)
                .filter(([_, count]) => count > 0)
                .map(([status, count]) => `
                    <div class="legend-item">
                        <span class="legend-color" style="background: ${colors[status]}"></span>
                        <span>${labels[status]} (${count})</span>
                    </div>
                `).join('');
        }
    }

    function renderStationsTable() {
        const scope = getUserScope();
        const stations = WaterGuardData.getStationsForGovernorate(scope.govId);
        const tbody = document.getElementById('stationsTableBody');
        if (!tbody) return;

        // Show first 8 stations
        const displayStations = stations.slice(0, 8);

        tbody.innerHTML = displayStations.map(station => {
            const quality = calculateQuality(station.sensors);
            const statusClass = station.status;
            const statusLabels = { active: 'نشطة', warning: 'تحذير', danger: 'خطر', inactive: 'متوقفة' };

            return `
                <tr>
                    <td><strong>${station.name}</strong></td>
                    <td>${station.governorateName}</td>
                    <td>${station.type}</td>
                    <td>${station.sensors.ph.toFixed(1)}</td>
                    <td>${Math.round(station.sensors.tds)}</td>
                    <td>${station.sensors.turbidity.toFixed(1)}</td>
                    <td><span class="status-badge ${statusClass}">${statusLabels[statusClass]}</span></td>
                    <td>
                        <div class="quality-indicator">
                            <div class="quality-bar">
                                <div class="quality-bar-fill ${quality.class}" style="width: ${quality.percent}%"></div>
                            </div>
                            <span>${quality.percent}%</span>
                        </div>
                    </td>
                    <td style="font-size: var(--font-size-xs); color: var(--gray-400);">
                        ${timeAgo(station.lastUpdate)}
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderSensorCards() {
        const container = document.getElementById('sensorCards');
        if (!container) return;

        // Generate random sensor readings
        const sensors = [
            { name: 'درجة الحموضة (pH)', value: (Math.random() * 2 + 6.5).toFixed(1), unit: '', min: 6.5, max: 8.5, icon: 'fa-flask', color: '#2E86AB' },
            { name: 'الأملاح الذائبة (TDS)', value: Math.floor(Math.random() * 300 + 100), unit: 'ppm', min: 50, max: 500, icon: 'fa-vial', color: '#27AE60' },
            { name: 'العكارة', value: (Math.random() * 5 + 0.1).toFixed(1), unit: 'NTU', min: 0, max: 5, icon: 'fa-eye', color: '#F39C12' },
            { name: 'التوصيلية', value: Math.floor(Math.random() * 500 + 200), unit: 'μS/cm', min: 50, max: 1500, icon: 'fa-bolt', color: '#9b59b6' },
            { name: 'درجة الحرارة', value: (Math.random() * 10 + 20).toFixed(1), unit: '°C', min: 10, max: 35, icon: 'fa-thermometer-half', color: '#E74C3C' },
            { name: 'الكلور الحر', value: (Math.random() * 2 + 0.2).toFixed(2), unit: 'mg/L', min: 0.2, max: 2, icon: 'fa-atom', color: '#1ABC9C' }
        ];

        container.innerHTML = sensors.map(sensor => {
            const val = parseFloat(sensor.value);
            const isNormal = val >= sensor.min && val <= sensor.max;
            const statusColor = isNormal ? '#27AE60' : '#E74C3C';
            const statusIcon = isNormal ? 'fa-check-circle' : 'fa-exclamation-circle';

            return `
                <div class="stat-card fade-in" style="border-top: 3px solid ${sensor.color};">
                    <div class="stat-header">
                        <div class="stat-info">
                            <h3 style="font-size: var(--font-size-xs);">${sensor.name}</h3>
                            <div class="stat-value" style="font-size: var(--font-size-2xl); color: ${sensor.color};">
                                ${sensor.value} <small style="font-size: var(--font-size-sm);">${sensor.unit}</small>
                            </div>
                        </div>
                        <div class="stat-icon" style="background: ${sensor.color}15; color: ${sensor.color};">
                            <i class="fas ${sensor.icon}"></i>
                        </div>
                    </div>
                    <div class="stat-footer">
                        <span style="color: ${statusColor};">
                            <i class="fas ${statusIcon}"></i>
                            ${isNormal ? 'ضمن المعدل الطبيعي' : 'خارج المعدل'}
                        </span>
                        <span style="font-size: var(--font-size-xs); color: var(--gray-400);">
                            ${sensor.min}-${sensor.max} ${sensor.unit}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }

    function updateAlertBadges() {
        const scope = getUserScope();
        const alerts = WaterGuardData.getAlertsForGovernorate(scope.govId);
        const unreadCount = alerts.filter(a => !a.read).length;

        const alertBadge = document.getElementById('alertBadge');
        const sidebarAlertBadge = document.getElementById('sidebarAlertBadge');

        if (alertBadge) {
            alertBadge.textContent = unreadCount;
            alertBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }

        if (sidebarAlertBadge) {
            sidebarAlertBadge.textContent = unreadCount;
            sidebarAlertBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    }

    function setupEventListeners() {
        // Chart time filters
        document.querySelectorAll('.filter-btn[data-days]').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn[data-days]').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentTimeRange = parseInt(this.dataset.days);
                renderQualityChart(currentTimeRange);
            });
        });

        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                refreshBtn.querySelector('i').classList.add('fa-spin');
                setTimeout(() => {
                    renderStats();
                    renderQualityChart(currentTimeRange);
                    renderStationsChart();
                    renderStationsTable();
                    renderSensorCards();
                    updateAlertBadges();
                    refreshBtn.querySelector('i').classList.remove('fa-spin');
                    Auth.showToast('تم التحديث', 'تم تحديث البيانات بنجاح', 'success');
                }, 1000);
            });
        }

        // Station search
        const searchInput = document.getElementById('stationSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const query = this.value.toLowerCase();
                const rows = document.querySelectorAll('#stationsTableBody tr');
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(query) ? '' : 'none';
                });
            });
        }
    }

    function startRealTimeUpdates() {
        // Update sensor readings every 30 seconds
        refreshInterval = setInterval(() => {
            renderSensorCards();
            updateAlertBadges();
        }, 30000);

        // Update timestamps every minute
        setInterval(() => {
            renderStationsTable();
        }, 60000);
    }

    function calculateQuality(sensors) {
        // Simple quality calculation
        let score = 100;

        if (sensors.ph < 6.5 || sensors.ph > 8.5) score -= 20;
        if (sensors.tds > 500) score -= 15;
        if (sensors.turbidity > 5) score -= 20;
        if (sensors.temperature > 30) score -= 10;
        if (sensors.chlorine < 0.2 || sensors.chlorine > 2) score -= 15;

        const percent = Math.max(0, Math.min(100, score));

        return {
            percent,
            class: percent >= 80 ? 'good' : percent >= 60 ? 'moderate' : 'poor'
        };
    }

    function formatNumber(num) {
        return num.toLocaleString('ar-EG');
    }

    function timeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffMin < 1) return 'الآن';
        if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
        if (diffHour < 24) return `منذ ${diffHour} ساعة`;
        if (diffDay < 7) return `منذ ${diffDay} يوم`;
        return date.toLocaleDateString('ar-EG');
    }

    return { init };
})();
