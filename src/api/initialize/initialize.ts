import { Initializer, deepmerge } from '@adobe-commerce/elsie/lib';
// import { events } from '@adobe-commerce/event-bus';

type Dictionary = { [key: string]: any };

type PlaceholderRow = {
  Key?: string;
  key?: string;
  Value?: string;
  value?: string;
};

type PlaceholderSheet = {
  data?: PlaceholderRow[];
};

type ConfigProps = {
  langDefinitions?: Dictionary;
  placeholders?: Record<string, string>;
  placeholderSheet?: string | PlaceholderSheet;
};

export const rowsToPlaceholders = (rows: PlaceholderRow[]) => {
  return rows.reduce<Record<string, string>>((result, row) => {
    const key = row.Key || row.key;
    const value = row.Value ?? row.value;

    if (!key || value === undefined) {
      return result;
    }

    result[key] = value;
    return result;
  }, {});
};

export const readPlaceholderSheet = async (
  source: string | PlaceholderSheet
) => {
  if (typeof source !== 'string') {
    return rowsToPlaceholders(source.data || []);
  }

  try {
    const response = await fetch(source);

    if (!response.ok) {
      return {};
    }

    const sheet = await response.json();
    return rowsToPlaceholders(sheet.data || []);
  } catch {
    return {};
  }
};

export const nestPlaceholders = (flat: Record<string, string>) => {
  const tree: Dictionary = {};

  Object.entries(flat).forEach(([key, value]) => {
    const parts = key.split('.');
    let node = tree;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        node[part] = value;
        return;
      }

      if (!node[part]) {
        node[part] = {};
      }

      node = node[part];
    });
  });

  return tree;
};

export const initialize = new Initializer<ConfigProps>({
  init: async (config) => {
    const next = { ...config };
    const fromSheet = config.placeholderSheet
      ? await readPlaceholderSheet(config.placeholderSheet)
      : {};
    const flat = { ...fromSheet, ...(config.placeholders ?? {}) };

    if (Object.keys(flat).length) {
      const nested = { default: nestPlaceholders(flat) };
      next.langDefinitions = config.langDefinitions
        ? deepmerge(config.langDefinitions, nested)
        : nested;
    }

    initialize.config.setConfig(next);
  },

  listeners: () => [
    // events.on('authenticated', (authenticated) => {
    //   console.log('authenticated', authenticated);
    // }),
  ],
});

export const config = initialize.config;
