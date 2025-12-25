// Загрузка тарифов на странице shop
document.addEventListener('DOMContentLoaded', () => {
    const plansContainer = document.getElementById('plans-container');
    
    // Загрузка тарифов для страницы магазина
    if (plansContainer) {
        fetch('/assets/data.json')
            .then(response => response.json())
            .then(data => {
                data.plans.forEach(plan => {
                    const planCard = document.createElement('div');
                    planCard.className = `plan-card ${plan.popular ? 'popular' : ''}`;
                    planCard.innerHTML = `
                        <div class="plan-name">${plan.name}</div>
                        <div class="plan-price">${plan.price} ₽<span>/мес</span></div>
                        
                        <div class="plan-specs">
                            <div class="plan-spec">
                                <span class="spec-label">RAM:</span>
                                <span class="spec-value">${plan.ram}</span>
                            </div>
                            <div class="plan-spec">
                                <span class="spec-label">vCPU:</span>
                                <span class="spec-value">${plan.cpu}</span>
                            </div>
                            <div class="plan-spec">
                                <span class="spec-label">Игроки:</span>
                                <span class="spec-value">${plan.slots}</span>
                            </div>
                            <div class="plan-spec">
                                <span class="spec-label">Диск:</span>
                                <span class="spec-value">${plan.storage}</span>
                            </div>
                            <div class="plan-spec">
                                <span class="spec-label">Порты:</span>
                                <span class="spec-value">${plan.ports}</span>
                            </div>
                            <div class="plan-spec">
                                <span class="spec-label">БД:</span>
                                <span class="spec-value">${plan.databases}</span>
                            </div>
                            <div class="plan-spec">
                                <span class="spec-label">Бэкапы:</span>
                                <span class="spec-value">${plan.backups}</span>
                            </div>
                        </div>
                        
                        <ul class="plan-features">
                            ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
                        </ul>
                        
                        <button class="select-plan-btn" onclick="addToCart(${plan.id})">
                            Добавить в корзину
                        </button>
                    `;
                    plansContainer.appendChild(planCard);
                });
            })
            .catch(error => console.error('Ошибка загрузки тарифов:', error));
    }

    // Загрузка данных заказа на странице checkout
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('plan');
    const fromCart = urlParams.get('from');
    
    if (document.getElementById('order-summary')) {
        // Если пришли из корзины
        if (fromCart === 'cart') {
            const cartData = localStorage.getItem('checkoutCart');
            if (cartData) {
                const checkoutCart = JSON.parse(cartData);
                
                if (checkoutCart.length > 0) {
                    // Показываем все товары из корзины
                    const totalPrice = checkoutCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    const totalQuantity = checkoutCart.reduce((sum, item) => sum + item.quantity, 0);
                    
                    // Формируем краткое описание заказа
                    const planNames = checkoutCart.map(item => 
                        `${item.name}${item.quantity > 1 ? ' x' + item.quantity : ''}`
                    ).join(', ');
                    
                    document.getElementById('selected-plan').textContent = planNames;
                    document.getElementById('selected-ram').textContent = `${totalQuantity} сервер(а/ов)`;
                    document.getElementById('selected-cpu').textContent = 'Различные';
                    document.getElementById('selected-slots').textContent = 'Различные';
                    document.getElementById('selected-storage').textContent = 'Различные';
                    document.getElementById('total-price').textContent = totalPrice;
                    
                    // Изменяем кнопку "Изменить тариф" на "Вернуться в корзину"
                    const changePlanBtn = document.querySelector('.change-plan-btn');
                    if (changePlanBtn) {
                        changePlanBtn.textContent = 'Вернуться в корзину';
                        changePlanBtn.onclick = function() {
                            toggleCart();
                            return false;
                        };
                    }
                }
            }
        } else if (planId) {
            // Если выбран конкретный тариф
            fetch('/assets/data.json')
                .then(response => response.json())
                .then(data => {
                    const selectedPlan = data.plans.find(p => p.id === parseInt(planId));
                    if (selectedPlan) {
                        document.getElementById('selected-plan').textContent = selectedPlan.name;
                        document.getElementById('selected-ram').textContent = selectedPlan.ram;
                        document.getElementById('selected-cpu').textContent = selectedPlan.cpu;
                        document.getElementById('selected-slots').textContent = selectedPlan.slots;
                        document.getElementById('selected-storage').textContent = selectedPlan.storage;
                        document.getElementById('total-price').textContent = selectedPlan.price;
                    }
                })
                .catch(error => console.error('Ошибка загрузки данных:', error));
        }
    }

    // Обработка формы заказа
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                discord: document.getElementById('discord').value,
                serverName: document.getElementById('server-name').value,
                planId: planId,
                cart: localStorage.getItem('checkoutCart') ? JSON.parse(localStorage.getItem('checkoutCart')) : null
            };
            
            console.log('Данные заказа:', formData);
            
            // Очищаем корзину после успешного заказа
            cart = [];
            localStorage.removeItem('minecraftCart');
            localStorage.removeItem('checkoutCart');
            updateCartUI();
            
            // Перенаправляем на главную страницу
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
            
            // Можно добавить отправку данных на сервер
            // fetch('/api/order', { method: 'POST', body: JSON.stringify(formData) })
        });
    }

    // Плавное появление элементов при скролле
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Применяем наблюдатель ко всем карточкам
    document.querySelectorAll('.feature-card, .plan-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Функция выбора тарифа
function selectPlan(planId) {
    window.location.href = `/checkout?plan=${planId}`;
}

// Функции для модальных окон
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function switchModal(closeModalId, openModalId) {
    closeModal(closeModalId);
    setTimeout(() => openModal(openModalId), 200);
}

// Инициализация кнопок входа и регистрации
document.addEventListener('DOMContentLoaded', () => {
    // Кнопки входа
    const loginButtons = document.querySelectorAll('.login-btn');
    loginButtons.forEach(btn => {
        btn.addEventListener('click', () => openModal('loginModal'));
    });

    // Кнопки регистрации
    const registerButtons = document.querySelectorAll('.register-btn');
    registerButtons.forEach(btn => {
        btn.addEventListener('click', () => openModal('registerModal'));
    });

    // Закрытие модального окна при клике вне его
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    });

    // Закрытие модального окна по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                activeModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        }
    });

    // Обработка формы входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Получаем список всех зарегистрированных пользователей
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Ищем пользователя с таким email
            const user = users.find(u => u.email === email);
            
            if (!user) {
                showNotification('Пользователь с таким email не найден!', 'error');
                return;
            }
            
            // Проверяем пароль
            if (user.password !== password) {
                showNotification('Неверный пароль!', 'error');
                return;
            }
            
            // Сохраняем данные пользователя для текущей сессии
            const userData = {
                name: user.name,
                email: user.email,
                balance: user.balance,
                loggedIn: true
            };
            
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Обновляем UI
            updateUserUI();
            
            closeModal('loginModal');
            showNotification('Вход выполнен успешно!', 'success');
        });
    }

    // Обработка формы регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const passwordConfirm = document.getElementById('register-password-confirm')?.value;
            
            // Проверка совпадения паролей (если есть поле подтверждения)
            if (passwordConfirm && password !== passwordConfirm) {
                showNotification('Пароли не совпадают!', 'error');
                return;
            }
            
            // Получаем список всех пользователей
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Проверяем, не зарегистрирован ли уже пользователь с таким email
            if (users.find(u => u.email === email)) {
                showNotification('Пользователь с таким email уже существует!', 'error');
                return;
            }
            
            // Добавляем нового пользователя
            const newUser = {
                name: name,
                email: email,
                password: password,
                balance: 500,
                registeredAt: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Автоматически входим в систему
            const userData = {
                name: name,
                email: email,
                balance: 500,
                loggedIn: true
            };
            
            localStorage.setItem('user', JSON.stringify(userData));
            
            closeModal('registerModal');
            
            // Обновляем UI
            updateUserUI();
            showNotification('Регистрация прошла успешно!', 'success');
        });
    }

    const plansContainer = document.getElementById('plans-container');
    
    // Инициализация корзины
    initCart();
    
    // Проверяем, авторизован ли пользователь
    checkUserAuth();
});

// ==================== КОРЗИНА ====================

// Состояние корзины
let cart = [];

// Инициализация корзины
function initCart() {
    // Загружаем корзину из localStorage
    const savedCart = localStorage.getItem('minecraftCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Переключение панели корзины
function toggleCart() {
    const cartPanel = document.getElementById('cart-panel');
    cartPanel.classList.toggle('active');
}

// Добавление товара в корзину
function addToCart(planIdOrObject) {
    // Если передан объект плана (из конструктора)
    if (typeof planIdOrObject === 'object') {
        const customPlan = planIdOrObject;
        
        // Проверяем, есть ли уже этот товар в корзине
        const existingItem = cart.find(item => String(item.id) === String(customPlan.id));
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: customPlan.id,
                name: customPlan.name,
                price: customPlan.price,
                ram: customPlan.ram,
                cpu: customPlan.cpu,
                slots: customPlan.slots,
                storage: customPlan.storage,
                ports: customPlan.ports || '',
                databases: customPlan.databases || '',
                backups: customPlan.backups || '',
                quantity: 1
            });
        }
        
        // Сохраняем корзину
        saveCart();
        updateCartUI();
        
        // Показываем корзину
        const cartPanel = document.getElementById('cart-panel');
        if (!cartPanel.classList.contains('active')) {
            toggleCart();
        }
        
        // Анимация добавления
        const cartButton = document.querySelector('.cart-button');
        if (cartButton) {
            cartButton.style.animation = 'none';
            setTimeout(() => {
                cartButton.style.animation = 'pulse 0.5s ease';
            }, 10);
        }
        
        return;
    }
    
    // Если передан ID плана (из обычных тарифов)
    const planId = planIdOrObject;
    fetch('/assets/data.json')
        .then(response => response.json())
        .then(data => {
            const plan = data.plans.find(p => p.id === planId);
            if (!plan) return;
            
            // Проверяем, есть ли уже этот товар в корзине
            const existingItem = cart.find(item => String(item.id) === String(planId));
            
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    id: plan.id,
                    name: plan.name,
                    price: plan.price,
                    ram: plan.ram,
                    cpu: plan.cpu,
                    slots: plan.slots,
                    storage: plan.storage,
                    ports: plan.ports || '',
                    databases: plan.databases || '',
                    backups: plan.backups || '',
                    quantity: 1
                });
            }
            
            // Сохраняем корзину
            saveCart();
            updateCartUI();
            
            // Показываем корзину
            const cartPanel = document.getElementById('cart-panel');
            if (!cartPanel.classList.contains('active')) {
                toggleCart();
            }
            
            // Анимация добавления
            const cartButton = document.querySelector('.cart-button');
            cartButton.style.animation = 'none';
            setTimeout(() => {
                cartButton.style.animation = 'pulse 0.5s ease';
            }, 10);
        })
        .catch(error => console.error('Ошибка добавления в корзину:', error));
}

// Удаление товара из корзины
function removeFromCart(planId) {
    // Преобразуем ID в строку для сравнения
    const idString = String(planId);
    cart = cart.filter(item => String(item.id) !== idString);
    saveCart();
    updateCartUI();
}

// Изменение количества товара
function updateQuantity(planId, change) {
    // Преобразуем ID в строку для сравнения
    const idString = String(planId);
    const item = cart.find(item => String(item.id) === idString);
    if (item) {
        item.quantity += change;
        
        // Если количество стало 0, удаляем товар
        if (item.quantity <= 0) {
            removeFromCart(planId);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

// Сохранение корзины в localStorage
function saveCart() {
    localStorage.setItem('minecraftCart', JSON.stringify(cart));
}

// Подсчет общей суммы
function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Подсчет количества товаров
function getCartCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// Обновление UI корзины
function updateCartUI() {
    const cartItems = document.getElementById('cart-items');
    const cartBadge = document.getElementById('cart-badge');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('cart-checkout-btn');
    
    const count = getCartCount();
    
    // Обновляем значок количества
    if (count > 0) {
        cartBadge.textContent = count;
        cartBadge.style.display = 'flex';
    } else {
        cartBadge.style.display = 'none';
    }
    
    // Обновляем общую сумму
    const total = calculateTotal();
    cartTotal.textContent = `${total} ₽`;
    
    // Если корзина пуста
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🛒</div>
                <p>Корзина пуста</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Добавьте тарифы для оформления заказа</p>
            </div>
        `;
        checkoutBtn.disabled = true;
    } else {
        // Генерируем HTML для товаров
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-header">
                    <div class="cart-item-name">${item.name}</div>
                    <button class="cart-item-remove" onclick="removeFromCart('${item.id}')" title="Удалить">
                        &times;
                    </button>
                </div>
                
                <div class="cart-item-specs">
                    <span>RAM: ${item.ram}</span>
                    <span>vCPU: ${item.cpu}</span>
                    <span>${item.storage}</span>
                    ${item.ports ? `<span>Порты: ${item.ports}</span>` : ''}
                    ${item.databases ? `<span>БД: ${item.databases}</span>` : ''}
                    ${item.backups ? `<span>Бэкапы: ${item.backups}</span>` : ''}
                </div>
                
                <div class="cart-item-footer">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                    </div>
                    <div class="cart-item-price">${item.price * item.quantity} ₽</div>
                </div>
            </div>
        `).join('');
        
        checkoutBtn.disabled = false;
    }
}

// Оформление заказа из корзины
function checkoutFromCart() {
    if (cart.length === 0) {
        return;
    }
    
    // Сохраняем корзину для страницы оформления
    localStorage.setItem('checkoutCart', JSON.stringify(cart));
    
    // Переходим на страницу оформления
    window.location.href = '/checkout?from=cart';
}

// Модифицируем функцию selectPlan для добавления в корзину
function selectPlan(planId) {
    addToCart(planId);
}

// ==================== АВТОРИЗАЦИЯ ====================

// Проверка авторизации пользователя
function checkUserAuth() {
    const userData = localStorage.getItem('user');
    if (userData) {
        const user = JSON.parse(userData);
        if (user.loggedIn) {
            updateUserUI();
        }
    }
}

// Обновление UI пользователя
function updateUserUI() {
    const userData = localStorage.getItem('user');
    if (!userData) return;
    
    const user = JSON.parse(userData);
    
    // Скрываем кнопки входа/регистрации
    document.querySelectorAll('.login-btn, .register-btn').forEach(btn => {
        btn.style.display = 'none';
    });
    
    // Показываем профиль
    document.querySelectorAll('.user-profile').forEach(profile => {
        profile.style.display = 'block';
    });
    
    // Обновляем данные профиля
    document.querySelectorAll('.profile-name').forEach(el => {
        el.textContent = user.name;
    });
    
    document.querySelectorAll('.profile-email').forEach(el => {
        el.textContent = user.email;
    });
    
    document.querySelectorAll('#user-balance').forEach(el => {
        el.textContent = `${user.balance} ₽`;
    });
    
    // Показываем баланс в навигации
    document.querySelectorAll('.balance-display').forEach(el => {
        el.style.display = 'flex';
    });
    
    document.querySelectorAll('.balance-amount').forEach(el => {
        el.textContent = `${user.balance} ₽`;
    });
}

// Переключение меню профиля
function toggleProfileMenu() {
    const menu = document.getElementById('profile-menu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

// Закрытие меню профиля при клике вне его
document.addEventListener('click', (e) => {
    const profileButton = document.querySelector('.profile-button');
    const profileMenu = document.getElementById('profile-menu');
    
    if (profileButton && profileMenu && 
        !profileButton.contains(e.target) && 
        !profileMenu.contains(e.target)) {
        profileMenu.classList.remove('active');
    }
});

// Выход из аккаунта
function logout() {
    localStorage.removeItem('user');
    
    // Очищаем корзину
    localStorage.removeItem('minecraftCart');
    localStorage.removeItem('checkoutCart');
    cart = [];
    updateCartUI();
    
    // Показываем кнопки входа/регистрации
    document.querySelectorAll('.login-btn, .register-btn').forEach(btn => {
        btn.style.display = 'block';
    });
    
    // Скрываем профиль
    document.querySelectorAll('.user-profile').forEach(profile => {
        profile.style.display = 'none';
    });
    
    // Скрываем баланс
    document.querySelectorAll('.balance-display').forEach(el => {
        el.style.display = 'none';
    });
    
    showNotification('Вы вышли из аккаунта', 'success');
}

// Уведомления (вместо alert)
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Добавляем в body
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}