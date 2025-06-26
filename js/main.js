/*
    Pulse Local - Telegram Mini App
    Main JavaScript File
    
    Description: Main application logic for the Pulse Local Telegram Mini App
    Author: Developer
    Date: 2025-06-26
*/

// Main application object
const PulseLocal = {
    // Application state
    state: {
        currentTab: 'profile',
        initData: null,
        userData: null,
        services: [],
        orders: [],
        // Service filters
        serviceFilters: {
            location: '',
            radius: 10,
            remoteOnly: false
        }
    },

    // API base URL (update with your backend URL)
    apiBaseUrl: 'https://prizegift.space',

    // Application initialization
    async init() {
        console.log('Pulse Local Mini App initialized');
        
        // Get Telegram init data
        this.getInitData();
        
        // Initialize tab navigation
        this.initTabNavigation();
        
        // Load initial data
        await this.loadInitialData();
        
        console.log('App initialization complete');
    },

    // Get Telegram WebApp init data
    getInitData() {
        if (window.Telegram && window.Telegram.WebApp) {
            this.state.initData = window.Telegram.WebApp.initData;
            console.log('Init data received:', this.state.initData);
        } else {
            console.warn('Running outside Telegram - no init data available');
            // For development purposes, you can set mock data here
            this.state.initData = null;
        }
    },

    // Initialize tab navigation
    initTabNavigation() {
        const navTabs = document.querySelectorAll('.nav-tab');
        const tabContents = document.querySelectorAll('.tab-content');

        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTab = tab.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });

        console.log('Tab navigation initialized');
    },

    // Switch between tabs
    switchTab(tabName) {
        const navTabs = document.querySelectorAll('.nav-tab');
        const contentContainer = document.getElementById('content');

        // Update navigation active state
        navTabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabName) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        // Clear current content
        if (contentContainer) {
            contentContainer.innerHTML = '';
        }

        // Update current tab state
        this.state.currentTab = tabName;

        // Load tab-specific data
        this.loadTabData(tabName);

        console.log(`Switched to tab: ${tabName}`);
    },

    // Load initial application data
    async loadInitialData() {
        try {
            // Load user data first
            await this.fetchUserData();
            
            // Load current tab data
            await this.loadTabData(this.state.currentTab);
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Ошибка загрузки данных');
        }
    },

    // Load data specific to current tab
    async loadTabData(tabName) {
        switch (tabName) {
            case 'profile':
                // Profile data is already loaded in fetchUserData
                this.renderProfile();
                break;
            case 'services':
                await this.fetchServices();
                this.renderServices();
                break;
            case 'orders':
                await this.fetchOrders();
                this.renderOrders();
                break;
            default:
                console.warn(`Unknown tab: ${tabName}`);
        }
    },

    // Fetch user data from API
    async fetchUserData() {
        try {
            console.log('Fetching user data...');

            const userData = await this.apiRequest('/auth/me');
            this.state.userData = userData;
            
            console.log('User data loaded:', userData);
            return userData;
        } catch (error) {
            console.error('Error fetching user data:', error);
            
            // Show error state
            const contentContainer = document.getElementById('content');
            if (contentContainer) {
                contentContainer.innerHTML = `
                    <div class="empty-state">
                        <p>Ошибка загрузки профиля</p>
                    </div>
                `;
            }

            throw error;
        }
    },

    // Fetch services from API
    async fetchServices() {
        try {
            console.log('Fetching services...');
            
            const services = await this.apiRequest('/services');
            this.state.services = Array.isArray(services) ? services : [];
            
            console.log('Services loaded:', services);
            return this.state.services;
        } catch (error) {
            console.error('Error fetching services:', error);
            
            // Show error state in UI
            const contentContainer = document.getElementById('content');
            if (contentContainer && this.state.currentTab === 'services') {
                contentContainer.innerHTML = `
                    <h2>Услуги</h2>
                    <div class="empty-state">
                        <p>Ошибка загрузки услуг</p>
                    </div>
                `;
            }
            
            // Set empty services array
            this.state.services = [];
            throw error;
        }
    },

    // Fetch orders from API
    async fetchOrders() {
        try {
            console.log('Fetching orders...');
            
            const orders = await this.apiRequest('/orders');
            this.state.orders = Array.isArray(orders) ? orders : [];
            
            console.log('Orders loaded:', orders);
            return this.state.orders;
        } catch (error) {
            console.error('Error fetching orders:', error);
            
            // Show error state in UI
            const contentContainer = document.getElementById('content');
            if (contentContainer && this.state.currentTab === 'orders') {
                contentContainer.innerHTML = `
                    <h2>Заказы</h2>
                    <div class="empty-state">
                        <p>Ошибка загрузки заказов</p>
                    </div>
                `;
            }
            
            // Set empty orders array
            this.state.orders = [];
            throw error;
        }
    },

    // Render profile tab content
    renderProfile() {
        const contentContainer = document.getElementById('content');
        if (!contentContainer) return;

        let html = '<h2>Профиль</h2>';
        
        if (this.state.userData) {
            const user = this.state.userData;
            const userName = user.first_name || user.name || 'Пользователь';
            
            html += `
                <div class="welcome-message">
                    <p>Добро пожаловать, ${userName}!</p>
                </div>
                <div class="profile-info">
                    <p><strong>Имя:</strong> ${user.first_name || user.name || 'Не указано'}</p>
                    <p><strong>Фамилия:</strong> ${user.last_name || 'Не указана'}</p>
                    <p><strong>Username:</strong> ${user.username ? '@' + user.username : 'Не указан'}</p>
                    <p><strong>ID:</strong> ${user.id}</p>
                </div>
                
                <!-- Service Creation Form -->
                <div class="service-form-container">
                    <h3>Создать новую услугу</h3>
                    <form class="service-form" id="serviceForm">
                        <div class="form-group">
                            <label for="serviceTitle">Название услуги</label>
                            <input type="text" id="serviceTitle" name="title" required maxlength="100" placeholder="Введите название услуги">
                        </div>
                        
                        <div class="form-group">
                            <label for="serviceDescription">Описание</label>
                            <textarea id="serviceDescription" name="description" required maxlength="500" rows="3" placeholder="Опишите вашу услугу"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <div class="delivery-options">
                                <div class="radio-group">
                                    <input type="radio" id="localService" name="deliveryType" value="local" checked>
                                    <label for="localService">Локальная услуга</label>
                                </div>
                                <div class="radio-group">
                                    <input type="radio" id="remoteService" name="deliveryType" value="remote">
                                    <label for="remoteService">Удалённая услуга</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group" id="radiusGroup">
                            <label for="serviceRadius">Радиус (км)</label>
                            <input type="number" id="serviceRadius" name="radius" min="1" max="100" placeholder="Введите радиус в км">
                        </div>
                        
                        <button type="submit" class="btn-primary" id="createServiceBtn">
                            Создать услугу
                        </button>
                    </form>
                </div>
            `;
        } else {
            html += `
                <div class="empty-state">
                    <p>Данные профиля загружаются...</p>
                </div>
            `;
        }

        contentContainer.innerHTML = html;
        
        // Initialize form event listeners after rendering
        if (this.state.userData) {
            this.initServiceForm();
        }
    },

    // Render services tab content
    renderServices() {
        const contentContainer = document.getElementById('content');
        if (!contentContainer) return;

        let html = '<h2>Услуги</h2>';
        
        // Filter controls
        html += `
            <div class="filter-controls">
                <div class="form-group">
                    <label for="filterLocation">Адрес или город</label>
                    <input type="text" id="filterLocation" placeholder="Введите адрес или город" value="${this.state.serviceFilters.location}">
                </div>
                <div class="form-group">
                    <label for="filterRadius">Радиус: <span id="radiusValue">${this.state.serviceFilters.radius}</span> км</label>
                    <input type="range" id="filterRadius" min="1" max="50" value="${this.state.serviceFilters.radius}">
                </div>
                <div class="form-group">
                    <label class="checkbox-group">
                        <input type="checkbox" id="filterRemoteOnly" ${this.state.serviceFilters.remoteOnly ? 'checked' : ''}>
                        <span>Только удалённые услуги</span>
                    </label>
                </div>
                <button class="btn-primary" id="applyFilterBtn">
                    Применить фильтр
                </button>
            </div>
        `;
        
        if (this.state.services.length > 0) {
            html += '<div class="services-list">';
            
            this.state.services.forEach(service => {
                // Format service delivery type
                let deliveryType = '';
                if (service.remote === true) {
                    deliveryType = 'Удалённо';
                } else if (service.radius_km) {
                    deliveryType = `Радиус: ${service.radius_km} км`;
                } else {
                    deliveryType = 'Не указано';
                }
                
                // Add Telegram contact button for services
                let telegramButton = '';
                if (service.provider_username) {
                    telegramButton = `
                        <div class="contact-section">
                            <button class="btn-telegram" onclick="PulseLocal.openTelegramChat('${service.provider_username}')">
                                <svg class="telegram-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                </svg>
                                Написать в Telegram
                            </button>
                        </div>
                    `;
                }
                
                html += `
                    <div class="service-item">
                        <h3>${service.name || 'Название не указано'}</h3>
                        <p class="service-description">${service.description || 'Описание отсутствует'}</p>
                        <div class="service-details">
                            <span class="service-delivery">${deliveryType}</span>
                        </div>
                        ${telegramButton}
                    </div>
                `;
            });
            
            html += '</div>';
        } else {
            html += `
                <div class="empty-state">
                    <p>Нет доступных услуг</p>
                </div>
            `;
        }

        contentContainer.innerHTML = html;
        
        // Initialize filter events
        this.initServiceFilters();
    },

    // Render orders tab content
    renderOrders() {
        const contentContainer = document.getElementById('content');
        if (!contentContainer) return;

        let html = '<h2>Заказы</h2>';
        
        if (this.state.orders.length > 0) {
            html += '<div class="orders-list">';
            
            this.state.orders.forEach(order => {
                // Format order status with localization
                let statusText = '';
                let statusClass = '';
                
                switch (order.status) {
                    case 'pending':
                        statusText = 'Ожидает';
                        statusClass = 'status-pending';
                        break;
                    case 'in_progress':
                        statusText = 'В работе';
                        statusClass = 'status-progress';
                        break;
                    case 'completed':
                        statusText = 'Завершён';
                        statusClass = 'status-completed';
                        break;
                    case 'cancelled':
                        statusText = 'Отменён';
                        statusClass = 'status-cancelled';
                        break;
                    default:
                        statusText = order.status || 'Неизвестно';
                        statusClass = 'status-unknown';
                }
                
                // Add rating section for completed orders
                let ratingSection = '';
                if (order.status === 'completed') {
                    if (order.rating_given) {
                        ratingSection = `
                            <div class="rating-section">
                                <span class="rating-thanks">Спасибо за оценку!</span>
                            </div>
                        `;
                    } else {
                        ratingSection = `
                            <div class="rating-section">
                                <button class="btn-rating" onclick="PulseLocal.openRatingModal(${order.id}, '${order.service_name || 'Услуга'}')">Оценить исполнителя</button>
                            </div>
                        `;
                    }
                }
                
                // Add Telegram contact button
                let telegramButton = '';
                if (order.customer_username) {
                    telegramButton = `
                        <button class="btn-telegram" onclick="PulseLocal.openTelegramChat('${order.customer_username}')">
                            <svg class="telegram-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                            </svg>
                            Написать в Telegram
                        </button>
                    `;
                } else {
                    telegramButton = `
                        <button class="btn-telegram disabled" disabled>
                            <svg class="telegram-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                            </svg>
                            Username не указан
                        </button>
                    `;
                }
                
                html += `
                    <div class="order-item">
                        <h3>${order.service_name || 'Услуга не указана'}</h3>
                        <p class="order-customer"><strong>Заказчик:</strong> ${order.customer_name || 'Не указан'}</p>
                        <div class="order-details">
                            <span class="order-status ${statusClass}">${statusText}</span>
                        </div>
                        <div class="contact-section">
                            ${telegramButton}
                        </div>
                        ${ratingSection}
                    </div>
                `;
            });
            
            html += '</div>';
        } else {
            html += `
                <div class="empty-state">
                    <p>Нет заказов</p>
                </div>
            `;
        }

        contentContainer.innerHTML = html;
    },

    // Initialize service form event listeners
    initServiceForm() {
        const form = document.getElementById('serviceForm');
        const localRadio = document.getElementById('localService');
        const remoteRadio = document.getElementById('remoteService');
        const radiusGroup = document.getElementById('radiusGroup');
        
        if (!form || !localRadio || !remoteRadio || !radiusGroup) return;
        
        // Toggle radius input based on delivery type
        const toggleRadiusInput = () => {
            if (remoteRadio.checked) {
                radiusGroup.style.display = 'none';
                document.getElementById('serviceRadius').value = '';
            } else {
                radiusGroup.style.display = 'block';
            }
        };
        
        localRadio.addEventListener('change', toggleRadiusInput);
        remoteRadio.addEventListener('change', toggleRadiusInput);
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createService();
        });
        
        // Initial state
        toggleRadiusInput();
        
        console.log('Service form initialized');
    },

    // Create new service
    async createService() {
        const form = document.getElementById('serviceForm');
        const createBtn = document.getElementById('createServiceBtn');
        
        if (!form) return;
        
        // Get form data
        const formData = new FormData(form);
        const title = formData.get('title').trim();
        const description = formData.get('description').trim();
        const deliveryType = formData.get('deliveryType');
        const radius = formData.get('radius');
        
        // Validate required fields
        if (!title || !description) {
            this.showError('Пожалуйста, заполните все обязательные поля');
            return;
        }
        
        // Validate radius for local services
        if (deliveryType === 'local' && (!radius || radius < 1)) {
            this.showError('Для локальных услуг укажите радиус');
            return;
        }
        
        // Disable submit button
        createBtn.disabled = true;
        createBtn.textContent = 'Создаём...';
        
        try {
            // Prepare service data
            const serviceData = {
                title: title,
                description: description,
                is_remote: deliveryType === 'remote',
                radius: deliveryType === 'local' ? parseInt(radius) : null
            };
            
            console.log('Creating service:', serviceData);
            
            // Send POST request
            const newService = await this.apiRequest('/services', {
                method: 'POST',
                body: JSON.stringify(serviceData)
            });
            
            console.log('Service created:', newService);
            
            // Add new service to local state
            this.state.services.push({
                id: newService.id,
                name: newService.title || title,
                description: newService.description || description,
                remote: newService.is_remote || serviceData.is_remote,
                radius_km: newService.radius || serviceData.radius
            });
            
            // Clear form
            form.reset();
            document.getElementById('localService').checked = true;
            document.getElementById('radiusGroup').style.display = 'block';
            
            // Show success message
            this.showSuccess('Услуга успешно создана!');
            
        } catch (error) {
            console.error('Error creating service:', error);
            this.showError('Ошибка создания услуги');
        } finally {
            // Re-enable submit button
            createBtn.disabled = false;
            createBtn.textContent = 'Создать услугу';
        }
    },

    // Show error message
    showError(message) {
        console.error('Error:', message);
        // Simple alert for now - you can implement toast notifications
        alert(message);
    },
    
    // Show success message
    showSuccess(message) {
        console.log('Success:', message);
        // Simple alert for now - you can implement toast notifications
        alert(message);
    },

    // Open rating modal
    openRatingModal(orderId, serviceName) {
        const modalHtml = `
            <div class="modal-overlay" id="ratingModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Оцените исполнителя</h3>
                        <button class="modal-close" onclick="PulseLocal.closeRatingModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p class="service-name">Услуга: ${serviceName}</p>
                        <div class="rating-stars" id="ratingStars">
                            <span class="star" data-rating="1">★</span>
                            <span class="star" data-rating="2">★</span>
                            <span class="star" data-rating="3">★</span>
                            <span class="star" data-rating="4">★</span>
                            <span class="star" data-rating="5">★</span>
                        </div>
                        <p class="rating-text" id="ratingText">Выберите оценку</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-primary" id="submitRatingBtn" onclick="PulseLocal.submitRating(${orderId})" disabled>
                            Отправить оценку
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Initialize rating stars
        this.initRatingStars();
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        console.log(`Opened rating modal for order ${orderId}`);
    },

    // Close rating modal
    closeRatingModal() {
        const modal = document.getElementById('ratingModal');
        if (modal) {
            modal.remove();
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Reset rating state
        this.currentRating = 0;
        
        console.log('Closed rating modal');
    },

    // Initialize rating stars interaction
    initRatingStars() {
        const stars = document.querySelectorAll('.star');
        const ratingText = document.getElementById('ratingText');
        const submitBtn = document.getElementById('submitRatingBtn');
        
        this.currentRating = 0;
        
        stars.forEach((star, index) => {
            // Hover effect
            star.addEventListener('mouseenter', () => {
                this.highlightStars(index + 1);
            });
            
            // Click to select rating
            star.addEventListener('click', () => {
                this.currentRating = index + 1;
                this.highlightStars(this.currentRating);
                
                // Update text and enable submit button
                const ratingTexts = {
                    1: 'Очень плохо',
                    2: 'Плохо', 
                    3: 'Нормально',
                    4: 'Хорошо',
                    5: 'Отлично'
                };
                
                ratingText.textContent = ratingTexts[this.currentRating];
                submitBtn.disabled = false;
                
                console.log(`Selected rating: ${this.currentRating}`);
            });
        });
        
        // Reset on mouse leave
        const starsContainer = document.getElementById('ratingStars');
        starsContainer.addEventListener('mouseleave', () => {
            this.highlightStars(this.currentRating);
        });
    },

    // Highlight stars up to given rating
    highlightStars(rating) {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    },

    // Submit rating to API
    async submitRating(orderId) {
        if (!this.currentRating || this.currentRating < 1 || this.currentRating > 5) {
            this.showError('Пожалуйста, выберите оценку');
            return;
        }
        
        const submitBtn = document.getElementById('submitRatingBtn');
        const originalText = submitBtn.textContent;
        
        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправляем...';
        
        try {
            const ratingData = {
                order_id: orderId,
                rating: this.currentRating
            };
            
            console.log('Submitting rating:', ratingData);
            
            // Send POST request
            await this.apiRequest('/ratings', {
                method: 'POST',
                body: JSON.stringify(ratingData)
            });
            
            console.log('Rating submitted successfully');
            
            // Update local order state
            const orderIndex = this.state.orders.findIndex(order => order.id === orderId);
            if (orderIndex !== -1) {
                this.state.orders[orderIndex].rating_given = true;
            }
            
            // Close modal
            this.closeRatingModal();
            
            // Show success message
            this.showSuccess('Спасибо за оценку!');
            
            // Refresh orders if we're on orders tab
            if (this.state.currentTab === 'orders') {
                this.renderOrders();
            }
            
        } catch (error) {
            console.error('Error submitting rating:', error);
            this.showError('Не удалось сохранить оценку');
            
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    },

    // Initialize service filters event listeners
    initServiceFilters() {
        const locationInput = document.getElementById('filterLocation');
        const radiusSlider = document.getElementById('filterRadius');
        const radiusValue = document.getElementById('radiusValue');
        const remoteCheckbox = document.getElementById('filterRemoteOnly');
        const applyButton = document.getElementById('applyFilterBtn');
        
        if (!locationInput || !radiusSlider || !radiusValue || !remoteCheckbox || !applyButton) {
            return;
        }
        
        // Update radius value display
        radiusSlider.addEventListener('input', (e) => {
            radiusValue.textContent = e.target.value;
            this.state.serviceFilters.radius = parseInt(e.target.value);
        });
        
        // Update location filter
        locationInput.addEventListener('input', (e) => {
            this.state.serviceFilters.location = e.target.value;
        });
        
        // Update remote only filter
        remoteCheckbox.addEventListener('change', (e) => {
            this.state.serviceFilters.remoteOnly = e.target.checked;
        });
        
        // Apply filters button
        applyButton.addEventListener('click', () => {
            this.applyServiceFilters();
        });
        
        // Apply filters on Enter in location input
        locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.applyServiceFilters();
            }
        });
        
        console.log('Service filters initialized');
    },

    // Apply service filters and fetch filtered results
    async applyServiceFilters() {
        const applyButton = document.getElementById('applyFilterBtn');
        if (!applyButton) return;
        
        // Show loading state
        const originalText = applyButton.textContent;
        applyButton.disabled = true;
        applyButton.textContent = 'Поиск...';
        
        try {
            // Update filter state from form
            const locationInput = document.getElementById('filterLocation');
            const radiusSlider = document.getElementById('filterRadius');
            const remoteCheckbox = document.getElementById('filterRemoteOnly');
            
            if (locationInput) this.state.serviceFilters.location = locationInput.value.trim();
            if (radiusSlider) this.state.serviceFilters.radius = parseInt(radiusSlider.value);
            if (remoteCheckbox) this.state.serviceFilters.remoteOnly = remoteCheckbox.checked;
            
            // Build query parameters
            const params = new URLSearchParams();
            
            if (this.state.serviceFilters.location) {
                params.append('location', this.state.serviceFilters.location);
            }
            
            params.append('radius', this.state.serviceFilters.radius.toString());
            
            if (this.state.serviceFilters.remoteOnly) {
                params.append('remoteOnly', 'true');
            }
            
            const queryString = params.toString();
            const endpoint = `/services${queryString ? '?' + queryString : ''}`;
            
            console.log('Fetching filtered services:', endpoint);
            
            // Fetch filtered services
            const services = await this.apiRequest(endpoint);
            this.state.services = Array.isArray(services) ? services : [];
            
            console.log('Filtered services loaded:', services);
            
            // Re-render services with new data
            this.renderServicesContent();
            
        } catch (error) {
            console.error('Error applying service filters:', error);
            this.showError('Ошибка поиска услуг');
        } finally {
            // Restore button state
            applyButton.disabled = false;
            applyButton.textContent = originalText;
        }
    },

    // Render only the services content without filters
    renderServicesContent() {
        const servicesContainer = document.querySelector('.services-list');
        const emptyStateContainer = document.querySelector('.empty-state');
        
        // Remove existing content
        if (servicesContainer) servicesContainer.remove();
        if (emptyStateContainer) emptyStateContainer.remove();
        
        const contentContainer = document.getElementById('content');
        if (!contentContainer) return;
        
        let html = '';
        
        if (this.state.services.length > 0) {
            html += '<div class="services-list">';
            
            this.state.services.forEach(service => {
                // Format service delivery type
                let deliveryType = '';
                if (service.remote === true) {
                    deliveryType = 'Удалённо';
                } else if (service.radius_km) {
                    deliveryType = `Радиус: ${service.radius_km} км`;
                } else {
                    deliveryType = 'Не указано';
                }
                
                html += `
                    <div class="service-item">
                        <h3>${service.name || 'Название не указано'}</h3>
                        <p class="service-description">${service.description || 'Описание отсутствует'}</p>
                        <div class="service-details">
                            <span class="service-delivery">${deliveryType}</span>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
        } else {
            // Check if filters are applied to show appropriate message
            const hasFilters = this.state.serviceFilters.location || 
                              this.state.serviceFilters.remoteOnly || 
                              this.state.serviceFilters.radius !== 10;
            
            const message = hasFilters ? 
                'Ничего не найдено по заданным параметрам' : 
                'Нет доступных услуг';
            
            html += `
                <div class="empty-state">
                    <p>${message}</p>
                </div>
            `;
        }
        
        // Append new content after filter controls
        const filterControls = document.querySelector('.filter-controls');
        if (filterControls) {
            filterControls.insertAdjacentHTML('afterend', html);
        }
    },

    // Utility method to make authenticated API requests
    async apiRequest(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.state.initData,
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        const response = await fetch(`${this.apiBaseUrl}${endpoint}`, mergedOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    PulseLocal.init();
});
