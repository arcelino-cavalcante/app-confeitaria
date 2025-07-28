document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const adminPanel = document.getElementById('admin-panel');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Form elements
    const storeNameInput = document.getElementById('store-name-input');
    const primaryColorInput = document.getElementById('primary-color-input');
    const secondaryColorInput = document.getElementById('secondary-color-input');
    const settingsForm = document.getElementById('settings-form');

    const productForm = document.getElementById('product-form');
    const productNameInput = document.getElementById('product-name');
    const productCategoryInput = document.getElementById('product-category');
    const productDescriptionInput = document.getElementById('product-description');
    const productPriceInput = document.getElementById('product-price');
    const productImageInput = document.getElementById('product-image');
    const productListAdmin = document.getElementById('product-list-admin');

    const builderJson = document.getElementById('builder-json');
    const builderForm = document.getElementById('builder-json-form');
    const specialJson = document.getElementById('special-json');
    const specialForm = document.getElementById('special-json-form');

    let configData = null;

    function renderProducts() {
        productListAdmin.innerHTML = '';
        if (!configData || !Array.isArray(configData.products)) return;
        configData.products.forEach((p, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.textContent = `${p.name} - ${p.category}`;
            const btn = document.createElement('button');
            btn.className = 'btn btn-sm btn-danger';
            btn.textContent = 'Remover';
            btn.onclick = () => {
                configData.products.splice(index, 1);
                saveConfig(configData).then(renderProducts);
            };
            li.appendChild(btn);
            productListAdmin.appendChild(li);
        });
    }

    function populateForms() {
        if (!configData) return;
        storeNameInput.value = configData.storeName || '';
        if (configData.colors) {
            primaryColorInput.value = configData.colors.primary || '#E6A4B4';
            secondaryColorInput.value = configData.colors.secondary || '#F3D9E1';
        }
        builderJson.value = JSON.stringify(configData.cakeBuilderOptions || {}, null, 2);
        specialJson.value = JSON.stringify(configData.specialCakes || [], null, 2);
        renderProducts();
    }

    auth.onAuthStateChanged(user => {
        if (user) {
            loginScreen.classList.add('d-none');
            adminPanel.classList.remove('d-none');
            loadConfig().then(cfg => {
                configData = cfg || {};
                populateForms();
            });
        } else {
            loginScreen.classList.remove('d-none');
            adminPanel.classList.add('d-none');
        }
    });

    loginBtn.addEventListener('click', () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                alert('Erro de login: ' + error.message);
            });
    });

    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });

    settingsForm.addEventListener('submit', e => {
        e.preventDefault();
        if (!configData) configData = {};
        configData.storeName = storeNameInput.value;
        configData.colors = configData.colors || {};
        configData.colors.primary = primaryColorInput.value;
        configData.colors.secondary = secondaryColorInput.value;
        saveConfig(configData).then(() => alert('Configurações salvas!'));
    });

    productForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = productNameInput.value;
        const category = productCategoryInput.value;
        const description = productDescriptionInput.value;
        const price = parseFloat(productPriceInput.value) || 0;
        const file = productImageInput.files[0];

        const addProduct = url => {
            if (!configData.products) configData.products = [];
            configData.products.push({
                id: Date.now(),
                name,
                category,
                description,
                price,
                image: url || ''
            });
            saveConfig(configData).then(() => {
                productForm.reset();
                renderProducts();
            });
        };

        if (file) {
            const ref = storage.ref('produtos/' + Date.now() + '_' + file.name);
            ref.put(file).then(s => s.ref.getDownloadURL())
                .then(addProduct);
        } else {
            addProduct('');
        }
    });

    builderForm.addEventListener('submit', e => {
        e.preventDefault();
        try {
            configData.cakeBuilderOptions = JSON.parse(builderJson.value);
            saveConfig(configData).then(() => alert('Opções salvas!'));
        } catch (err) {
            alert('JSON inválido');
        }
    });

    specialForm.addEventListener('submit', e => {
        e.preventDefault();
        try {
            configData.specialCakes = JSON.parse(specialJson.value);
            saveConfig(configData).then(() => alert('Catálogo salvo!'));
        } catch (err) {
            alert('JSON inválido');
        }
    });
});