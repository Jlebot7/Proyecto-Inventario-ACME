
const DataService = (() => {
  function isFirebaseConfigured() {
    return (
      typeof FirebaseConfig !== 'undefined' &&
      typeof FirebaseConfig.databaseURL === 'string' &&
      !FirebaseConfig.databaseURL.includes('YOUR_PROJECT')
    );
  }

  const BASE = () => `${FirebaseConfig.databaseURL.replace(/\/$/, '')}`;

  async function firebaseGet(path) {
    const url = `${BASE()}${path}.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al leer Firebase');
    return res.json();
  }

  async function firebasePut(path, data) {
    const url = `${BASE()}${path}.json`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al escribir Firebase');
    return res.json();
  }

  async function firebasePatch(path, data) {
    const url = `${BASE()}${path}.json`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar Firebase');
    return res.json();
  }

  async function firebaseDelete(path) {
    const url = `${BASE()}${path}.json`;
    const res = await fetch(url, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar Firebase');
    return true;
  }

  async function syncFromFirebase() {
    if (!isFirebaseConfigured()) return;

    try {
      const [users, products, productions, meta] = await Promise.all([
        firebaseGet('/users'),
        firebaseGet('/products'),
        firebaseGet('/productions'),
        firebaseGet('/meta')
      ]);

      if (users) StorageService.setUsers(users);
      if (products) StorageService.setProducts(products);
      if (productions) StorageService.setProductions(productions);
      if (meta) StorageService.setMeta(meta);
    } catch (err) {
      console.warn('Firebase no disponible, usando localStorage:', err.message);
    }
  }

  async function pushToFirebase(collection, data) {
    if (!isFirebaseConfigured()) return;
    try {
      await firebasePut(`/${collection}`, data);
    } catch (err) {
      console.warn('No se pudo sincronizar con Firebase:', err.message);
    }
  }

  async function init() {
    StorageService.seedIfEmpty();
    await syncFromFirebase();
  }

  
  async function getUsers() {
    await syncFromFirebase();
    return StorageService.getUsers();
  }

  async function saveUser(identificacion, userData) {
    const users = StorageService.getUsers();
    users[identificacion] = { ...userData, identificacion };
    StorageService.setUsers(users);
    if (isFirebaseConfigured()) {
      await firebasePut(`/users/${identificacion}`, users[identificacion]);
    }
    return users[identificacion];
  }

  async function deleteUser(identificacion) {
    const users = StorageService.getUsers();
    delete users[identificacion];
    StorageService.setUsers(users);
    if (isFirebaseConfigured()) {
      await firebaseDelete(`/users/${identificacion}`);
    }
  }

  async function authenticate(identificacion, password) {
    const users = await getUsers();
    const user = users[identificacion];
    if (user && user.password === password) {
      const session = {
        identificacion: user.identificacion,
        nombreCompleto: user.nombreCompleto,
        cargo: user.cargo
      };
      StorageService.setSession(session);
      return session;
    }
    return null;
  }

  
  async function getProducts() {
    await syncFromFirebase();
    return StorageService.getProducts();
  }

  async function saveProduct(codigo, productData) {
    const products = StorageService.getProducts();
    const existing = products[codigo] || {};
    products[codigo] = {
      ...existing,
      ...productData,
      codigo,
      stock: existing.stock ?? productData.stock ?? 0
    };
    StorageService.setProducts(products);
    if (isFirebaseConfigured()) {
      await firebasePut(`/products/${codigo}`, products[codigo]);
    }
    return products[codigo];
  }

  async function deleteProduct(codigo) {
    const products = StorageService.getProducts();
    delete products[codigo];
    StorageService.setProducts(products);
    if (isFirebaseConfigured()) {
      await firebaseDelete(`/products/${codigo}`);
    }
  }

  async function addStock(codigo, cantidad) {
    const products = StorageService.getProducts();
    const product = products[codigo];
    if (!product) throw new Error('Producto no encontrado');
    const qty = Number(cantidad);
    if (!Number.isFinite(qty) || qty <= 0) throw new Error('Cantidad inválida');

    product.stock = (Number(product.stock) || 0) + qty;
    StorageService.setProducts(products);
    if (isFirebaseConfigured()) {
      await firebasePatch(`/products/${codigo}`, { stock: product.stock });
    }
    return product;
  }

  async function updateProductStock(codigo, newStock) {
    const products = StorageService.getProducts();
    if (!products[codigo]) throw new Error('Producto no encontrado');
    products[codigo].stock = newStock;
    StorageService.setProducts(products);
    if (isFirebaseConfigured()) {
      await firebasePatch(`/products/${codigo}`, { stock: newStock });
    }
    return products[codigo];
  }

  
  async function getProductions() {
    await syncFromFirebase();
    return StorageService.getProductions();
  }

  async function getNextProductionCode() {
    const meta = StorageService.getMeta();
    const next = (Number(meta.productionCounter) || 0) + 1;
    meta.productionCounter = next;
    StorageService.setMeta(meta);
    if (isFirebaseConfigured()) {
      await firebasePatch('/meta', { productionCounter: next });
    }
    return next;
  }

  async function registerProduction(productionData) {
    const code = await getNextProductionCode();
    const productions = StorageService.getProductions();
    const record = { ...productionData, codigo: code, fecha: new Date().toISOString() };
    productions[code] = record;
    StorageService.setProductions(productions);
    if (isFirebaseConfigured()) {
      await firebasePut(`/productions/${code}`, record);
    }
    return record;
  }

  async function executeProduction(items, userIdentificacion) {
    const products = StorageService.getProducts();
    const summary = [];

    for (const item of items) {
      const { codigoProducto, cantidad } = item;
      const qty = Number(cantidad);
      if (!Number.isFinite(qty) || qty <= 0) {
        throw new Error(`Cantidad inválida para ${codigoProducto}`);
      }

      const finished = products[codigoProducto];
      if (!finished) throw new Error(`Producto ${codigoProducto} no existe`);
      if (finished.tipo !== 'terminado') {
        throw new Error(`${codigoProducto} no es un producto terminado`);
      }
      if (!finished.formula || finished.formula.length === 0) {
        throw new Error(`${codigoProducto} no tiene fórmula definida`);
      }

      const materiaUsada = [];
      for (const ingredient of finished.formula) {
        const raw = products[ingredient.codigoMateriaPrima];
        if (!raw) {
          throw new Error(`Materia prima ${ingredient.codigoMateriaPrima} no existe`);
        }
        const needed = Number(ingredient.cantidad) * qty;
        const available = Number(raw.stock) || 0;
        if (available < needed) {
          throw new Error(
            `Stock insuficiente de ${raw.nombre} (${raw.codigo}). Necesita ${needed}, hay ${available}`
          );
        }
        materiaUsada.push({
          codigo: raw.codigo,
          nombre: raw.nombre,
          cantidadUsada: needed
        });
      }

      for (const ingredient of finished.formula) {
        const raw = products[ingredient.codigoMateriaPrima];
        const needed = Number(ingredient.cantidad) * qty;
        raw.stock = (Number(raw.stock) || 0) - needed;
      }

      finished.stock = (Number(finished.stock) || 0) + qty;

      summary.push({
        codigoProducto: finished.codigo,
        nombreProducto: finished.nombre,
        cantidadFabricada: qty,
        materiaPrimaUsada: materiaUsada
      });
    }

    StorageService.setProducts(products);
    if (isFirebaseConfigured()) {
      await pushToFirebase('products', products);
    }

    const session = StorageService.getSession();
    const record = await registerProduction({
      usuario: userIdentificacion || session?.identificacion,
      productos: summary
    });

    return { record, summary };
  }

  return {
    init,
    getUsers,
    saveUser,
    deleteUser,
    authenticate,
    getProducts,
    saveProduct,
    deleteProduct,
    addStock,
    getProductions,
    executeProduction,
    isFirebaseConfigured
  };
})();

