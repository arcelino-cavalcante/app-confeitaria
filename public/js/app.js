        // --- JAVASCRIPT INCORPORADO ---

        /**
         * Módulo App para encapsular toda a lógica da aplicação,
         * evitando poluir o escopo global e organizando o código.
         */
        const App = {
            // --- CONFIGURAÇÕES E ESTADO ---
            config: {
                storeName: 'Bolos Da Célia',
                colors: {
                    primary: '#E6A4B4',
                    secondary: '#F3D9E1',
                    accent: '#784a4a',
                    background: '#FAF6F0',
                    text: '#4a2c2a'
                },
                whatsappNumber: '5511999999999', // <-- TROQUE PELO SEU NÚMERO DE WHATSAPP
                products: [],
                specialCakes: [],
                cakeBuilderOptions: {
                    sizes: [],
                    doughs: [],
                    fillings: [],
                    toppings: []
                }
            },
            state: {
                cart: [],
                activeCategory: 'all',
            },
            elements: {},

            /**
             * Método de inicialização. É o ponto de partida da aplicação.
             */
            init() {
                this.mapDOMElements();
                this.state.cart = JSON.parse(localStorage.getItem('confeitariaCart')) || [];
                this.utils.applyTheme();
                this.utils.updateStoreName();
                this.bindEvents();
                this.render.all();
                this.utils.showSection('home-section');
                feather.replace();
            },

            /**
             * Mapeia todos os elementos do DOM para o objeto `elements`.
             */
            mapDOMElements() {
                this.elements.productList = document.getElementById('product-list');
                this.elements.categoryFilters = document.getElementById('category-filters');
                this.elements.cartItemsContainer = document.getElementById('cart-items');
                this.elements.cartSubtotalEl = document.getElementById('cart-subtotal');
                this.elements.checkoutForm = document.getElementById('checkout-form');
                this.elements.navLinks = document.querySelectorAll('.nav-link, .btn-primary[data-target], .back-btn, .btn-secondary[data-target]');
                this.elements.pageSections = document.querySelectorAll('.page-section');
                this.elements.deliveryMethodRadios = document.querySelectorAll('input[name="delivery-method"]');
                this.elements.addressGroup = document.getElementById('address-group');
                this.elements.checkoutFromCartBtn = document.getElementById('checkout-from-cart-btn');
                this.elements.toastContainer = document.getElementById('toast-container');
                this.elements.floatingCartBtn = document.getElementById('floating-cart-btn');
                this.elements.cartBadges = document.querySelectorAll('.cart-count-badge');
                // Elementos do "Monte seu Bolo"
                this.elements.buildCakeForm = document.getElementById('build-cake-form');
                this.elements.cakeSize = document.getElementById('cake-size');
                this.elements.cakeDough = document.getElementById('cake-dough');
                this.elements.cakeNumFillings = document.getElementById('cake-num-fillings');
                this.elements.cakeFillingsContainer = document.getElementById('cake-fillings-container');
                this.elements.cakeTopping = document.getElementById('cake-topping');
                this.elements.customCakePrice = document.getElementById('custom-cake-price');
                this.elements.addCustomCakeBtn = document.getElementById('add-custom-cake-to-cart-btn');
                this.elements.buildCakeMessage = document.getElementById('build-cake-empty-message');
                // Elementos do Catálogo Especial
                this.elements.specialCatalogList = document.getElementById('special-catalog-list');
            },

            /**
             * Centraliza a configuração de todos os listeners de eventos.
             */
            bindEvents() {
                this.elements.productList.addEventListener('click', this.handlers.handleProductInteraction.bind(this));
                this.elements.specialCatalogList.addEventListener('click', this.handlers.handleProductInteraction.bind(this));
                this.elements.categoryFilters.addEventListener('click', this.handlers.handleCategoryFilter.bind(this));
                this.elements.cartItemsContainer.addEventListener('click', this.handlers.handleCartItemInteraction.bind(this));
                this.elements.checkoutFromCartBtn.addEventListener('click', this.handlers.handleCheckoutFromCart.bind(this));
                this.elements.checkoutForm.addEventListener('submit', this.handlers.handleFormSubmit.bind(this));
                this.elements.floatingCartBtn.addEventListener('click', () => this.utils.showSection('cart-section'));

                this.elements.navLinks.forEach(link => {
                    link.addEventListener('click', this.handlers.handleNavigation.bind(this));
                });

                this.elements.deliveryMethodRadios.forEach(radio => {
                    radio.addEventListener('change', this.handlers.handleDeliveryMethodChange.bind(this));
                });

                // Listeners do "Monte seu Bolo"
                this.elements.buildCakeForm.addEventListener('change', this.handlers.handleCakeBuilderChange.bind(this));
                this.elements.addCustomCakeBtn.addEventListener('click', this.handlers.handleAddCustomCake.bind(this));
            },

            // --- MÉTODOS DE RENDERIZAÇÃO ---
            render: {
                all() {
                    this.categoryFilters();
                    this.products();
                    this.specialCatalog();
                    this.cakeBuilder();
                    App.update.cart();
                },

                products(products = App.config.products, container = App.elements.productList) {
                    container.innerHTML = '';

                    let productSource = products;
                    if (container === App.elements.productList) {
                        productSource = App.state.activeCategory === 'all'
                            ? App.config.products
                            : App.config.products.filter(p => p.category === App.state.activeCategory);
                    }

                    if (productSource.length === 0) {
                        container.innerHTML = '<p class="empty-data-message">Nenhum produto cadastrado. Acesse o perfil para adicionar.</p>';
                        return;
                    }

                    productSource.forEach(product => {
                        const productCard = document.createElement('div');
                        productCard.className = 'product-card';
                        productCard.dataset.id = product.id;
                        productCard.innerHTML = `
                        <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='https://placehold.co/300x200/ccc/4a2c2a?text=Erro!';">
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <p class="description">${product.description}</p>
                            <p class="price">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
                            <div class="product-controls">
                                <div class="quantity-selector">
                                    <button class="quantity-btn" data-action="decrease" aria-label="Diminuir quantidade">-</button>
                                    <span class="quantity">1</span>
                                    <button class="quantity-btn" data-action="increase" aria-label="Aumentar quantidade">+</button>
                                </div>
                                <button class="btn-primary add-to-cart-btn">Adicionar</button>
                            </div>
                        </div>
                    `;
                        container.appendChild(productCard);
                    });
                },

                specialCatalog() {
                    this.products(App.config.specialCakes, App.elements.specialCatalogList);
                },

                categoryFilters() {
                    const categories = ['all', ...new Set(App.config.products.map(p => p.category))];
                    App.elements.categoryFilters.innerHTML = '';
                    categories.forEach(category => {
                        const button = document.createElement('button');
                        button.textContent = category === 'all' ? 'Todos' : category;
                        button.dataset.category = category;
                        button.setAttribute('role', 'tab');
                        if (category === App.state.activeCategory) {
                            button.classList.add('active');
                            button.setAttribute('aria-selected', 'true');
                        }
                        App.elements.categoryFilters.appendChild(button);
                    });
                },

                cart() {
                    const { cartItemsContainer, checkoutFromCartBtn } = App.elements;
                    cartItemsContainer.innerHTML = '';
                    if (App.state.cart.length === 0) {
                        cartItemsContainer.innerHTML = '<p class="empty-cart-message">Seu carrinho está vazio.</p>';
                        checkoutFromCartBtn.style.display = 'none';
                    } else {
                        checkoutFromCartBtn.style.display = 'block';
                        App.state.cart.forEach(item => {
                            const cartItem = document.createElement('div');
                            cartItem.className = 'cart-item';
                            const descriptionHTML = item.isCustom ? `<p class="item-description">${item.description}</p>` : '';
                            cartItem.innerHTML = `
                            <img src="${item.image}" alt="${item.name}">
                            <div class="cart-item-info">
                                <h4>${item.name}</h4>
                                <p>Qtd: ${item.quantity} x R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                                ${descriptionHTML}
                            </div>
                            <div class="cart-item-actions">
                                <button class="remove-from-cart-btn" data-id="${item.id}">Remover</button>
                            </div>
                        `;
                            cartItemsContainer.appendChild(cartItem);
                        });
                    }
                },

                cakeBuilder() {
                    const opts = App.config.cakeBuilderOptions || {};
                    const { sizes = [], doughs = [], toppings = [] } = opts;
                    const { cakeSize, cakeDough, cakeTopping, buildCakeForm, buildCakeMessage } = App.elements;

                    if (sizes.length === 0 || doughs.length === 0 || toppings.length === 0) {
                        buildCakeForm.style.display = 'none';
                        buildCakeMessage.textContent = 'Nenhuma opção cadastrada. Acesse o perfil para adicionar.';
                        buildCakeMessage.style.display = 'block';
                        return;
                    }

                    buildCakeMessage.style.display = 'none';
                    buildCakeForm.style.display = 'block';

                    const populateSelect = (el, options) => {
                        el.innerHTML = options.map(opt => `<option value="${opt.price}">${opt.name}</option>`).join('');
                    };

                    populateSelect(cakeSize, sizes);
                    populateSelect(cakeDough, doughs);
                    populateSelect(cakeTopping, toppings);
                },

                cakeFillings(num) {
                    const { cakeFillingsContainer } = App.elements;
                    const { fillings = [] } = App.config.cakeBuilderOptions || {};
                    cakeFillingsContainer.innerHTML = '';

                    if (fillings.length === 0) {
                        cakeFillingsContainer.innerHTML = '<p class="empty-data-message">Cadastre opções de recheio no perfil.</p>';
                        return;
                    }

                    for (let i = 1; i <= num; i++) {
                        const selectId = `cake-filling-${i}`;
                        const optionsHTML = fillings.map(opt => `<option value="${opt.price}">${opt.name}</option>`).join('');
                        const stepHTML = `
                        <div class="form-step">
                            <label for="${selectId}">Recheio ${i}</label>
                            <select id="${selectId}" name="filling_${i}">${optionsHTML}</select>
                        </div>
                    `;
                        cakeFillingsContainer.innerHTML += stepHTML;
                    }
                }
            },

            // --- MÉTODOS DE ATUALIZAÇÃO DE ESTADO ---
            update: {
                addToCart(productId, quantity) {
                    const existingItem = App.state.cart.find(item => item.id === productId && !item.isCustom);
                    if (existingItem) {
                        existingItem.quantity += quantity;
                    } else {
                        const allProducts = [...App.config.products, ...App.config.specialCakes];
                        const product = allProducts.find(p => p.id === productId);
                        if (product) {
                            App.state.cart.push({ ...product, quantity });
                        }
                    }
                    this.cart();
                },

                removeFromCart(productId) {
                    App.state.cart = App.state.cart.filter(item => item.id !== productId);
                    this.cart();
                },

                cart() {
                    localStorage.setItem('confeitariaCart', JSON.stringify(App.state.cart));
                    App.render.cart();

                    const subtotal = App.state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
                    App.elements.cartSubtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;

                    const totalItems = App.state.cart.reduce((total, item) => total + item.quantity, 0);
                    App.elements.cartBadges.forEach(badge => {
                        badge.textContent = totalItems;
                        badge.style.display = totalItems > 0 ? 'flex' : 'none';
                    });
                },
            },

            // --- HANDLERS DE EVENTOS ---
            handlers: {
                handleProductInteraction(e) {
                    const target = e.target;
                    const productCard = target.closest('.product-card');
                    if (!productCard) return;

                    const productId = parseInt(productCard.dataset.id);
                    const quantityEl = productCard.querySelector('.quantity');
                    let quantity = parseInt(quantityEl.textContent);

                    if (target.matches('.quantity-btn')) {
                        const action = target.dataset.action;
                        if (action === 'increase') quantity++;
                        else if (action === 'decrease' && quantity > 1) quantity--;
                        quantityEl.textContent = quantity;
                    }

                    if (target.matches('.add-to-cart-btn')) {
                        App.update.addToCart(productId, quantity);
                        App.utils.showToast('Item adicionado ao carrinho!', 'success');
                        quantityEl.textContent = '1';
                    }
                },

                handleCategoryFilter(e) {
                    if (e.target.tagName === 'BUTTON') {
                        App.state.activeCategory = e.target.dataset.category;
                        App.render.products();
                    }
                },

                handleCartItemInteraction(e) {
                    if (e.target.matches('.remove-from-cart-btn')) {
                        const productId = e.target.dataset.id;
                        const idToRemove = isNaN(parseInt(productId)) ? productId : parseInt(productId);
                        App.update.removeFromCart(idToRemove);
                        App.utils.showToast('Item removido do carrinho.');
                    }
                },

                handleNavigation(e) {
                    const targetId = e.currentTarget.dataset.target;
                    if (targetId) {
                        e.preventDefault();
                        App.utils.showSection(targetId);
                    }
                },

                handleCheckoutFromCart() {
                    App.utils.showSection('checkout-section');
                },

                handleDeliveryMethodChange(e) {
                    const isDelivery = e.target.value === 'Entrega';
                    App.elements.addressGroup.style.display = isDelivery ? 'block' : 'none';
                    document.getElementById('customer-address').required = isDelivery;
                },

                handleFormSubmit(e) {
                    e.preventDefault();
                    if (!App.utils.validateForm()) return;

                    if (App.state.cart.length === 0) {
                        App.utils.showToast('Seu carrinho está vazio!', 'error');
                        return;
                    }

                    const message = App.utils.formatWhatsAppMessage();
                    const whatsappUrl = `https://wa.me/${App.config.whatsappNumber}?text=${message}`;

                    window.open(whatsappUrl, '_blank');

                    App.state.cart = [];
                    App.update.cart();
                    App.elements.checkoutForm.reset();
                    App.utils.showSection('home-section');
                    App.utils.showToast('Pedido enviado! Redirecionando...', 'success');
                },

                handleCakeBuilderChange(e) {
                    if (e.target.id === 'cake-num-fillings') {
                        App.render.cakeFillings(parseInt(e.target.value));
                    }
                    App.utils.calculateCustomCakePrice();
                },

                handleAddCustomCake() {
                    const { price, description, name } = App.utils.getCustomCakeDetails();

                    const customCake = {
                        id: `custom-${Date.now()}`,
                        name: name,
                        price: price,
                        description: description,
                        quantity: 1,
                        isCustom: true,
                        image: 'https://placehold.co/300x200/E6A4B4/4a2c2a?text=Bolo+Montado'
                    };

                    App.state.cart.push(customCake);
                    App.update.cart();
                    App.utils.showToast('Bolo personalizado adicionado!', 'success');
                    App.elements.buildCakeForm.reset();
                    App.render.cakeFillings(0);
                    App.utils.calculateCustomCakePrice();
                    App.utils.showSection('home-section');
                }
            },

            // --- FUNÇÕES UTILITÁRIAS ---
            utils: {
                showSection(targetId) {
                    App.elements.pageSections.forEach(section => {
                        section.classList.toggle('active', section.id === targetId);
                    });
                    App.elements.navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.dataset.target === targetId) {
                            link.classList.add('active');
                        }
                    });
                    if (targetId === 'home-section') {
                        document.querySelector('.nav-link[data-target="home-section"]').classList.add('active');
                    }

                    const showFloatingCart = ['home-section', 'build-cake-section', 'special-catalog-section'].includes(targetId);
                    App.elements.floatingCartBtn.classList.toggle('visible', showFloatingCart);

                    if (targetId === 'home-section') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                        window.scrollTo(0, 0);
                    }
                },

                validateForm() {
                    let isValid = true;
                    App.elements.checkoutForm.querySelectorAll('[required]').forEach(input => {
                        const formGroup = input.closest('.form-group');
                        if (!input.value.trim()) {
                            isValid = false;
                            formGroup.classList.add('error');
                        } else {
                            formGroup.classList.remove('error');
                        }
                    });
                    if (!isValid) {
                        this.showToast('Por favor, preencha os campos obrigatórios.', 'error');
                    }
                    return isValid;
                },

                formatWhatsAppMessage() {
                    const customerName = document.getElementById('customer-name').value;
                    const deliveryMethod = document.querySelector('input[name="delivery-method"]:checked').value;
                    const address = document.getElementById('customer-address').value;
                    const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

                    let message = `*Olá! Gostaria de fazer um novo pedido.*\n\n`;
                    message += `*Cliente:* ${customerName}\n\n`;
                    message += `*Itens do Pedido:*\n`;

                    App.state.cart.forEach(item => {
                        message += `- ${item.quantity}x ${item.name}`;
                        if (item.isCustom) {
                            message += `\n  ${item.description.replace(/\n/g, '\n  ')}`;
                        }
                        message += ` (R$ ${item.price.toFixed(2).replace('.', ',')})\n`;
                    });

                    const subtotal = App.state.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
                    message += `\n*Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n\n`;

                    message += `*Forma de Entrega:* ${deliveryMethod}\n`;
                    if (deliveryMethod === 'Entrega') {
                        message += `*Endereço:* ${address}\n`;
                    }

                    message += `*Forma de Pagamento:* ${paymentMethod}\n\n`;
                    message += `Aguardando confirmação. Obrigado!`;

                    return encodeURIComponent(message);
                },

                showToast(message, type = '') {
                    const toast = document.createElement('div');
                    toast.className = `toast ${type}`;
                    toast.innerHTML = `<i data-feather="${type === 'success' ? 'check-circle' : 'info'}"></i> ${message}`;
                    App.elements.toastContainer.appendChild(toast);
                    feather.replace();

                    setTimeout(() => {
                        toast.remove();
                    }, 3000);
                },

                applyTheme() {
                    const colors = App.config.colors || {};
                    const root = document.documentElement;
                    root.style.setProperty('--primary-color', colors.primary || '#E6A4B4');
                    root.style.setProperty('--secondary-color', colors.secondary || '#F3D9E1');
                    root.style.setProperty('--accent-color', colors.accent || '#784a4a');
                    root.style.setProperty('--background-color', colors.background || '#FAF6F0');
                    root.style.setProperty('--text-color', colors.text || '#4a2c2a');
                },

                updateStoreName() {
                    const name = App.config.storeName || 'Confeitaria';
                    document.querySelectorAll('#site-name, #site-name-mobile').forEach(el => el.textContent = name);
                },

                calculateCustomCakePrice() {
                    let totalPrice = 0;
                    let isComplete = true;

                    const sizePrice = parseFloat(App.elements.cakeSize.value);
                    if (sizePrice === 0) isComplete = false;
                    totalPrice += sizePrice;

                    const doughPrice = parseFloat(App.elements.cakeDough.value);
                    if (App.elements.cakeDough.selectedIndex === 0) isComplete = false;
                    totalPrice += doughPrice;

                    const toppingPrice = parseFloat(App.elements.cakeTopping.value);
                    if (App.elements.cakeTopping.selectedIndex === 0) isComplete = false;
                    totalPrice += toppingPrice;

                    const fillingSelects = App.elements.cakeFillingsContainer.querySelectorAll('select');
                    fillingSelects.forEach(select => {
                        const fillingPrice = parseFloat(select.value);
                        if (fillingPrice === 0) isComplete = false;
                        totalPrice += fillingPrice;
                    });

                    const numFillings = parseInt(App.elements.cakeNumFillings.value);
                    if (numFillings > 0 && fillingSelects.length !== numFillings) {
                        isComplete = false;
                    }

                    App.elements.customCakePrice.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
                    App.elements.addCustomCakeBtn.disabled = !isComplete;

                    return totalPrice;
                },

                getCustomCakeDetails() {
                    const price = this.calculateCustomCakePrice();

                    const sizeEl = App.elements.cakeSize;
                    const doughEl = App.elements.cakeDough;
                    const toppingEl = App.elements.cakeTopping;

                    const sizeText = sizeEl.options[sizeEl.selectedIndex].text;
                    const doughText = doughEl.options[doughEl.selectedIndex].text;
                    const toppingText = toppingEl.options[toppingEl.selectedIndex].text;

                    let description = `Tamanho: ${sizeText}\nMassa: ${doughText}\n`;

                    const fillingSelects = App.elements.cakeFillingsContainer.querySelectorAll('select');
                    if (fillingSelects.length > 0) {
                        description += 'Recheio(s):\n';
                        fillingSelects.forEach((select, index) => {
                            const fillingText = select.options[select.selectedIndex].text;
                            description += ` - ${fillingText}\n`;
                        });
                    }

                    description += `Cobertura: ${toppingText}`;

                    return {
                        price,
                        description,
                        name: 'Bolo Personalizado'
                    };
                }
            }
        };

        // Inicia a aplicação quando o DOM estiver pronto.
        document.addEventListener('DOMContentLoaded', () => {
            loadConfig().then(cfg => {
                if (cfg) App.config = cfg;
                App.init();
            }).catch(() => App.init());
        });

