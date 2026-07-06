const StorageService = (() => {
  const KEYS = {
    users: 'acme_users',
    products: 'acme_products',
    productions: 'acme_productions',
    meta: 'acme_meta',
    session: 'acme_session'
  };

  function read(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getUsers() {
    return read(KEYS.users, {});
  }

  function setUsers(users) {
    write(KEYS.users, users);
  }

  function getProducts() {
    return read(KEYS.products, {});
  }

  function setProducts(products) {
    write(KEYS.products, products);
  }

  function getProductions() {
    return read(KEYS.productions, {});
  }

  function setProductions(productions) {
    write(KEYS.productions, productions);
  }

  function getMeta() {
    return read(KEYS.meta, { productionCounter: 0 });
  }

  function setMeta(meta) {
    write(KEYS.meta, meta);
  }

  function getSession() {
    return read(KEYS.session, null);
  }

  function setSession(session) {
    if (session) {
      write(KEYS.session, session);
    } else {
      localStorage.removeItem(KEYS.session);
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

