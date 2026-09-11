const Memory = {

  key:
    AGHIL_CONFIG.memory.storageKey,

  getAll() {

    try {

      const data =
        localStorage.getItem(this.key);

      return data
        ? JSON.parse(data)
        : [];

    } catch (error) {

      console.error(
        "Memory read error:",
        error
      );

      return [];
    }
  },


  add(text) {

    const memories =
      this.getAll();

    memories.push({

      id: Date.now(),

      text: text,

      createdAt:
        new Date().toISOString()

    });

    localStorage.setItem(
      this.key,
      JSON.stringify(memories)
    );
  },


  remove(id) {

    const memories =
      this.getAll()
        .filter(item => item.id !== id);

    localStorage.setItem(
      this.key,
      JSON.stringify(memories)
    );
  },


  clear() {

    localStorage.removeItem(
      this.key
    );
  }

};