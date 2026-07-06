const SeedData = {
  async loadDemo() {
    const rawMaterials = [
      { codigo: 'MAN001', nombre: 'Mantequilla', proveedor: 'Lácteos del Magdalena', tipo: 'materia_prima', stock: 5000 },
      { codigo: 'HAR001', nombre: 'Harina', proveedor: 'Molinos Macondo', tipo: 'materia_prima', stock: 5000 },
      { codigo: 'HUE001', nombre: 'Huevo', proveedor: 'Granja Sol', tipo: 'materia_prima', stock: 200 }
    ];

    for (const item of rawMaterials) {
      await DataService.saveProduct(item.codigo, item);
    }

    await DataService.saveProduct('GAL001', {
      codigo: 'GAL001',
      nombre: 'Galleta ACME',
      proveedor: 'Planta Macondo',
      tipo: 'terminado',
      stock: 0,
      formula: [
        { codigoMateriaPrima: 'MAN001', cantidad: 100 },
        { codigoMateriaPrima: 'HAR001', cantidad: 100 },
        { codigoMateriaPrima: 'HUE001', cantidad: 1 }
      ]
    });
  }
};

