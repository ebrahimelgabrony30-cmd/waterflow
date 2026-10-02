// ============================================
// WaterFlow - Authentication Module
// Water Station Management & Fluid Mechanics Analysis System
// Handles login, logout, sessions, and permissions
// ============================================

const Auth = (function() {
    'use strict';

    const SESSION_KEY = 'waterguard_session';
    const REMEMBER_KEY = 'waterguard_remember';

    // Initialize login page
    function initLogin() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;

        const governorateSelect = document.getElementById('governorate');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const togglePassword = document.getElementById('togglePassword');
        const typeBtns = document.querySelectorAll('.type-btn');
        const govSelectGroup = document.getElementById('govSelectGroup');
        const govLogoContainer = document.getElementById('govLogoContainer');
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');

        let currentUserType = 'governorate';

        // Populate governorate dropdown
        if (governorateSelect) {
            populateGovernorateDropdown();
        }

        // User type toggle
        typeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                typeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentUserType = btn.dataset.type;
                handleUserTypeChange(currentUserType);
            });
        });

        // Governorate change
        if (governorateSelect) {
            governorateSelect.addEventListener('change', function() {
                const selectedGov = WaterGuardData.governorates.find(g => g.id === this.value);
                if (selectedGov) {
                    if (usernameInput) usernameInput.value = selectedGov.id;
                    showGovernorateLogo(selectedGov);
                }
            });
        }

        // Toggle password
        if (togglePassword && passwordInput) {
            togglePassword.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                const icon = togglePassword.querySelector('i');
                if (icon) {
                    icon.classList.toggle('fa-eye');
                    icon.classList.toggle('fa-eye-slash');
                }
            });
        }

        // Form submission
        loginForm.addEventListener('submit', handleLogin);

        // Check remembered user
        checkRememberedUser();

        function populateGovernorateDropdown() {
            // Sort by region then name
            const sorted = [...WaterGuardData.governorates].sort((a, b) => {
                if (a.region !== b.region) return a.region.localeCompare(b.region);
                return a.name.localeCompare(b.name);
            });

            let currentRegion = '';
            sorted.forEach(gov => {
                if (gov.region !== currentRegion) {
                    if (currentRegion) {
                        const endGroup = document.createElement('optgroup');
                        governorateSelect.appendChild(endGroup);
                    }
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = gov.region;
                    governorateSelect.appendChild(optgroup);
                    currentRegion = gov.region;
                }
                const option = document.createElement('option');
                option.value = gov.id;
                option.textContent = gov.name;
                governorateSelect.lastElementChild.appendChild(option);
            });
        }

        function handleUserTypeChange(type) {
            errorMessage.classList.remove('show');

            if (type === 'admin') {
                govSelectGroup.style.display = 'none';
                usernameInput.value = 'admin';
                usernameInput.readOnly = true;
                showAdminLogo();
            } else if (type === 'general') {
                govSelectGroup.style.display = 'none';
                usernameInput.value = 'general';
                usernameInput.readOnly = true;
                showGeneralLogo();
            } else {
                govSelectGroup.style.display = 'flex';
                usernameInput.value = governorateSelect.value || '';
                usernameInput.readOnly = true;
                if (governorateSelect.value) {
                    const gov = WaterGuardData.governorates.find(g => g.id === governorateSelect.value);
                    if (gov) showGovernorateLogo(gov);
                } else {
                    showWaterFlowLogo();
                }
            }
        }

        function showGovernorateLogo(gov) {
            govLogoContainer.innerHTML = `
                <div class="gov-logo-preview">
                    <div class="gov-flag" style="background: linear-gradient(135deg, ${gov.color}, ${gov.color}dd);">
                        <img src="${gov.flagUrl}" alt="${gov.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'color:white;font-size:1.5rem;font-weight:800;padding:10px;\\'>${gov.name.charAt(0)}</span>'">
                    </div>
                    <span class="gov-name">${gov.name}</span>
                </div>
            `;
        }

        function showAdminLogo() {
            govLogoContainer.innerHTML = `
                <div class="gov-logo-preview">
                    <div class="gov-flag" style="background: linear-gradient(135deg, #0F172A, #1E293B); display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-user-shield" style="color: #C9A227; font-size: 2rem;"></i>
                    </div>
                    <span class="gov-name">مدير النظام</span>
                </div>
            `;
        }

        function showGeneralLogo() {
            govLogoContainer.innerHTML = `
                <div class="gov-logo-preview">
                    <div class="gov-flag" style="background: linear-gradient(135deg, #1B3A5C, #2E86AB); display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-eye" style="color: white; font-size: 2rem;"></i>
                    </div>
                    <span class="gov-name">المراقب العام</span>
                </div>
            `;
        }

        function showWaterFlowLogo() {
            govLogoContainer.innerHTML = `
                <div class="waterguard-logo">
                    <div class="logo-water-drop">
                        <i class="fas fa-droplet"></i>
                    </div>
                    <div class="logo-brand">
                        <h2>WaterFlow</h2>
                        <span>نظام إدارة محطات المياه وميكانيكا الموائع</span>
                    </div>
                </div>
            `;
        }

        function handleLogin(e) {
            e.preventDefault();
            errorMessage.classList.remove('show');

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username || !password) {
                showError('الرجاء إدخال اسم المستخدم وكلمة المرور');
                return;
            }

            const loginBtn = document.getElementById('loginBtn');
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                const user = WaterGuardData.getUserByUsername(username);

                if (!user || user.password !== password) {
                    showError('اسم المستخدم أو كلمة المرور غير صحيحة');
                    loginBtn.classList.remove('loading');
                    loginBtn.disabled = false;
                    return;
                }

                // Check user type matches
                if (currentUserType === 'admin' && user.role !== 'admin') {
                    showError('هذا الحساب ليس حساب مدير نظام');
                    loginBtn.classList.remove('loading');
                    loginBtn.disabled = false;
                    return;
                }

                if (currentUserType === 'general' && user.role !== 'general') {
                    showError('هذا الحساب ليس حساب مراقب عام');
                    loginBtn.classList.remove('loading');
                    loginBtn.disabled = false;
                    return;
                }

                if (currentUserType === 'governorate' && user.role !== 'governorate') {
                    showError('الرجاء اختيار المحافظة الصحيحة');
                    loginBtn.classList.remove('loading');
                    loginBtn.disabled = false;
                    return;
                }

                // Check governorate selection
                if (currentUserType === 'governorate' && !governorateSelect.value) {
                    showError('الرجاء اختيار المحافظة');
                    loginBtn.classList.remove('loading');
                    loginBtn.disabled = false;
                    return;
                }

                // Create session
                const session = {
                    username: user.username,
                    name: user.name,
                    role: user.role,
                    governorateId: user.governorateId,
                    governorateName: user.governorateId ? WaterGuardData.getGovernorateById(user.governorateId)?.name : null,
                    loginTime: new Date().toISOString()
                };

                // Store session
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

                // Remember me
                const rememberMe = document.getElementById('rememberMe').checked;
                if (rememberMe) {
                    localStorage.setItem(REMEMBER_KEY, JSON.stringify({
                        username: user.username,
                        type: currentUserType
                    }));
                } else {
                    localStorage.removeItem(REMEMBER_KEY);
                }

                // Redirect to dashboard
                window.location.href = 'dashboard.html';

            }, 1200);
        }

        function showError(msg) {
            errorText.textContent = msg;
            errorMessage.classList.add('show');
        }

        function checkRememberedUser() {
            const remembered = localStorage.getItem(REMEMBER_KEY);
            if (remembered) {
                try {
                    const data = JSON.parse(remembered);
                    if (data.type === 'governorate') {
                        typeBtns.forEach(b => {
                            b.classList.toggle('active', b.dataset.type === 'governorate');
                        });
                        currentUserType = 'governorate';
                        governorateSelect.value = data.username;
                        usernameInput.value = data.username;
                        const gov = WaterGuardData.getGovernorateById(data.username);
                        if (gov) showGovernorateLogo(gov);
                    } else if (data.type === 'admin') {
                        typeBtns.forEach(b => {
                            b.classList.toggle('active', b.dataset.type === 'admin');
                        });
                        currentUserType = 'admin';
                        handleUserTypeChange('admin');
                    } else if (data.type === 'general') {
                        typeBtns.forEach(b => {
                            b.classList.toggle('active', b.dataset.type === 'general');
                        });
                        currentUserType = 'general';
                        handleUserTypeChange('general');
                    }
                } catch (e) {
                    console.error('Error parsing remembered user', e);
                }
            }
        }
    }

    // Check if user is authenticated
    function isAuthenticated() {
        return !!sessionStorage.getItem(SESSION_KEY);
    }

    // Get current user
    function getCurrentUser() {
        try {
            return JSON.parse(sessionStorage.getItem(SESSION_KEY));
        } catch {
            return null;
        }
    }

    // Check if user can access governorate
    function canAccessGovernorate(govId) {
        const user = getCurrentUser();
        if (!user) return false;
        if (user.role === 'admin' || user.role === 'general') return true;
        return user.governorateId === govId;
    }

    // Logout
    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = 'index.html';
    }

    // Protect dashboard pages
    function protectPage() {
        if (!isAuthenticated()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    // Check if user has admin access
    function isAdmin() {
        const user = getCurrentUser();
        return user && user.role === 'admin';
    }

    // Check if user has general access (admin or general)
    function isGeneralOrAdmin() {
        const user = getCurrentUser();
        return user && (user.role === 'admin' || user.role === 'general');
    }

    // Protect admin-only pages
    function protectAdminPage() {
        if (!protectPage()) return false;
        if (!isAdmin()) {
            showToast('غير مصرح', 'ليس لديك صلاحية الوصول لهذه الصفحة', 'error');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            return false;
        }
        return true;
    }

    // Protect pages that require general or admin
    function protectGeneralPage() {
        if (!protectPage()) return false;
        if (!isGeneralOrAdmin()) {
            showToast('غير مصرح', 'ليس لديك صلاحية الوصول لهذه الصفحة', 'error');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            return false;
        }
        return true;
    }

    // Initialize dashboard navigation
    function initDashboard() {
        if (!protectPage()) return;

        const user = getCurrentUser();

        // Update user info in nav
        const userNameEl = document.querySelector('.user-name');
        const userRoleEl = document.querySelector('.user-role');
        const userAvatarEl = document.querySelector('.user-avatar');

        if (userNameEl) userNameEl.textContent = user.name;
        if (userRoleEl) {
            const roleLabels = {
                'admin': 'مدير النظام',
                'general': 'المراقب العام',
                'governorate': `مراقب ${user.governorateName || ''}`
            };
            userRoleEl.textContent = roleLabels[user.role] || user.role;
        }
        if (userAvatarEl) {
            const initial = user.name.charAt(0);
            userAvatarEl.textContent = initial;
        }

        // Update sidebar governorate info
        const sidebarGov = document.querySelector('.sidebar-gov');
        if (sidebarGov && user.role === 'governorate' && user.governorateId) {
            const gov = WaterGuardData.getGovernorateById(user.governorateId);
            if (gov) {
                sidebarGov.querySelector('.gov-info h3').textContent = gov.name;
                const flagImg = sidebarGov.querySelector('.gov-flag-small img');
                if (flagImg) {
                    flagImg.src = gov.flagUrl;
                    flagImg.alt = gov.name;
                }
            }
        } else if (sidebarGov && (user.role === 'admin' || user.role === 'general')) {
            sidebarGov.querySelector('.gov-info h3').textContent = 'جميع المحافظات';
            sidebarGov.querySelector('.gov-info span').textContent = user.role === 'admin' ? 'نطاق مدير النظام' : 'نطاق المراقب العام';
            const flagContainer = sidebarGov.querySelector('.gov-flag-small');
            if (flagContainer) {
                flagContainer.innerHTML = '<i class="fas fa-globe" style="color: var(--primary-400); font-size: 1.2rem;"></i>';
                flagContainer.style.display = 'flex';
                flagContainer.style.alignItems = 'center';
                flagContainer.style.justifyContent = 'center';
                flagContainer.style.background = 'var(--primary-50)';
            }
        }

        // User menu dropdown
        const userMenu = document.querySelector('.user-menu');
        const dropdownMenu = document.querySelector('.dropdown-menu');

        if (userMenu && dropdownMenu) {
            userMenu.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });

            document.addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }

        // Mobile toggle
        const mobileToggle = document.querySelector('.mobile-toggle');
        const sidebar = document.querySelector('.sidebar');
        const sidebarOverlay = document.querySelector('.sidebar-overlay');

        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                if (sidebarOverlay) sidebarOverlay.classList.toggle('show');
            });
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('show');
            });
        }

        // Mark active nav link
        const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });

        // Hide admin-only items for non-admin users
        if (user.role !== 'admin') {
            // Hide settings nav item for non-admin users
            const settingsNavItems = document.querySelectorAll('a[href="settings.html"]');
            settingsNavItems.forEach(item => {
                const navItem = item.closest('.nav-item');
                if (navItem) navItem.style.display = 'none';
            });

            // Hide settings in dropdown
            const settingsDropdown = document.querySelector('a[href="settings.html"].dropdown-item');
            if (settingsDropdown) {
                const divider = settingsDropdown.nextElementSibling;
                settingsDropdown.style.display = 'none';
                if (divider && divider.classList.contains('dropdown-divider')) {
                    divider.style.display = 'none';
                }
            }
        }

        // Governorate users see their own governorate only
        if (user.role === 'governorate') {
            // Normal governorate view - no restrictions needed
        }
    }

    // Toast notifications
    function showToast(title, message, type = 'info') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon"><i class="fas ${icons[type]}"></i></div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-20px)';
            setTimeout(() => toast.remove(), 400);
        }, 5000);
    }

    return {
        initLogin,
        initDashboard,
        isAuthenticated,
        getCurrentUser,
        canAccessGovernorate,
        logout,
        protectPage,
        protectAdminPage,
        protectGeneralPage,
        isAdmin,
        isGeneralOrAdmin,
        showToast
    };
})();
