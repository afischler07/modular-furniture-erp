import { systems, articles, components, systemBom, articleBom } from './data.js';

// Statische Daten-Schicht — kein Supabase nötig
// Daten direkt aus Excel-Artikelstamm generiert

function filterAndSort(arr, filters = {}, orderBy = null) {
  let result = [...arr];
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      result = result.filter(item => {
        const v = item[key];
        if (v === null || v === undefined) return false;
        return String(v).toLowerCase().includes(String(value).toLowerCase());
      });
    }
  }
  if (orderBy) {
    result.sort((a, b) => {
      const av = a[orderBy] || '';
      const bv = b[orderBy] || '';
      return String(av).localeCompare(String(bv));
    });
  }
  return result;
}

export const db = {
  // ——— SYSTEME ———
  systems: {
    async list() {
      return systems.map(s => ({
        ...s,
        articles: systemBom
          .filter(b => b.system_number === s.system_number)
          .map(b => {
            const art = articles.find(a =>
              a.article_number === b.article_number &&
              (!b.variant || a.variant === b.variant)
            );
            return { ...b, article: art || null };
          })
      }));
    },
    async get(id) {
      const s = systems.find(x => x.id === id || x.system_number === id);
      if (!s) return null;
      const bom = systemBom
        .filter(b => b.system_number === s.system_number)
        .map(b => {
          const art = articles.find(a =>
            a.article_number === b.article_number &&
            (!b.variant || a.variant === b.variant)
          );
          return { ...b, article: art || null };
        });
      return { ...s, bom };
    }
  },

  // ——— ARTIKEL ———
  articles: {
    async list(filters = {}) {
      return filterAndSort(articles, filters, 'article_number');
    },
    async get(id) {
      const art = articles.find(x => x.id === id || x.article_number === id);
      if (!art) return null;
      const bom = articleBom
        .filter(b =>
          b.article_number === art.article_number &&
          (!art.variant || b.variant === art.variant)
        )
        .map(b => {
          const comp = components.find(c => c.component_number === b.component_number);
          return { ...b, component: comp || null };
        });
      // Systeme die diesen Artikel enthalten
      const inSystems = systemBom
        .filter(b => b.article_number === art.article_number && (!art.variant || b.variant === art.variant))
        .map(b => systems.find(s => s.system_number === b.system_number))
        .filter(Boolean);
      return { ...art, bom, systems: inSystems };
    },
    async getByNumber(articleNumber, variant) {
      const art = articles.find(a =>
        a.article_number === articleNumber &&
        (!variant || a.variant === variant)
      );
      if (!art) return null;
      return this.get(art.id);
    }
  },

  // ——— KOMPONENTEN ———
  components: {
    async list(filters = {}) {
      return filterAndSort(components, filters, 'component_number');
    },
    async get(id) {
      const comp = components.find(x => x.id === id || x.component_number === id);
      if (!comp) return null;
      // Artikel die diese Komponente verwenden
      const usedIn = articleBom
        .filter(b => b.component_number === comp.component_number)
        .map(b => {
          const art = articles.find(a =>
            a.article_number === b.article_number &&
            (!b.variant || a.variant === b.variant)
          );
          return { ...b, article: art || null };
        });
      return { ...comp, usedIn };
    }
  },

  // ——— STÜCKLISTE SYSTEME ———
  systemBom: {
    async list(systemNumber) {
      const bom = systemBom.filter(b =>
        !systemNumber || b.system_number === systemNumber
      );
      return bom.map(b => {
        const art = articles.find(a =>
          a.article_number === b.article_number &&
          (!b.variant || a.variant === b.variant)
        );
        const sys = systems.find(s => s.system_number === b.system_number);
        return { ...b, article: art || null, system: sys || null };
      });
    }
  },

  // ——— STÜCKLISTE ARTIKEL ———
  articleBom: {
    async list(articleNumber, variant) {
      const bom = articleBom.filter(b =>
        (!articleNumber || b.article_number === articleNumber) &&
        (!variant || b.variant === variant)
      );
      return bom.map(b => {
        const comp = components.find(c => c.component_number === b.component_number);
        return { ...b, component: comp || null };
      });
    }
  },

  // ——— DASHBOARD STATS ———
  dashboard: {
    async get() {
      return this.getStats();
    },
    async getStats() {
      const uniqueArticles = [...new Set(articles.map(a => a.article_number))];
      const uniqueComponents = [...new Set(components.map(c => c.component_number))];
      const suppliers = [...new Set(components.map(c => c.supplier).filter(Boolean))];
      const materials = [...new Set(components.map(c => c.base_material_code).filter(Boolean))];

      return {
        systemCount: systems.length,
        articleCount: uniqueArticles.length,
        variantCount: articles.length,
        componentCount: uniqueComponents.length,
        supplierCount: suppliers.length,
        materialCount: materials.length,
        bomSystemEntries: systemBom.length,
        bomArticleEntries: articleBom.length,
        suppliers,
        materials
      };
    }
  }
};
