const StorageService = (() => {
  const KEYS = {
    users: 'acme_users',
    products: 'acme_products',
    productions: 'acme_productions',
    meta: 'acme_meta',
    session: 'acme_session'
  };

  function readLocal(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeLocal(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function readSession(key, fallback = null) {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeSession(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }


  function getUsers() {
    return readLocal(KEYS.users, {});
  }

  function setUsers(users) {
    writeLocal(KEYS.users, users);
  }

  function getProducts() {
    return readLocal(KEYS.products, {});
  }

  function setProducts(products) {
    writeLocal(KEYS.products, products);
  }

  function getProductions() {
    return readLocal(KEYS.productions, {});
  }

  function setProductions(productions) {
    writeLocal(KEYS.productions, productions);
  }

  function getMeta() {
    return readLocal(KEYS.meta, { productionCounter: 0 });
  }

  function setMeta(meta) {
    writeLocal(KEYS.meta, meta);
  }

  function getSession() {
    return readSession(KEYS.session, null);
  }

  function setSession(session) {
    if (session) {
      writeSession(KEYS.session, session);
    } else {
      sessionStorage.removeItem(KEYS.session);
    }
  }


  function seedIfEmpty() {
    const users = getUsers();
    if (Object.keys(users).length === 0) {
      setUsers({
        admin: {
          identificacion: '1000000001',
          nombreCompleto: 'Administrador ACME',
          cargo: 'Gerente de planta',
          password: 'admin123'
        }
      });
    }
  }

  return {
    KEYS,
    getUsers,
    setUsers,
    getProducts,
    setProducts,
    getProductions,
    setProductions,
    getMeta,
    setMeta,
    getSession,
    setSession,
    seedIfEmpty
  };
})();

