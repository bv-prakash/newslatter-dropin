import { initialize } from './initialize';

describe('Cart/api/initialize', () => {
  const listeners = new Set<any>();

  beforeEach(() => {
    jest.clearAllMocks();

    listeners.forEach((listener) => {
      listener.off();
    });

    initialize.listeners().forEach((listener) => {
      listeners.add(listener);
    });
  });

  test('set config', async () => {
    await expect(initialize.init({})).resolves.toBeUndefined();

    expect(initialize.config.getConfig()).toEqual({});
  });

  test('nests placeholder keys into language definitions', async () => {
    await initialize.init({
      placeholders: {
        'Newsletter.Form.title': 'Join the list',
        'Newsletter.Form.emailPlaceholder': 'you@example.com',
        'Newsletter.Minified.edit': 'Change',
        'Newsletter.Subscription.general': 'General Subscription',
      },
    });

    expect(initialize.config.getConfig().langDefinitions).toEqual({
      default: {
        Newsletter: {
          Form: {
            title: 'Join the list',
            emailPlaceholder: 'you@example.com',
          },
          Minified: {
            edit: 'Change',
          },
          Subscription: {
            general: 'General Subscription',
          },
        },
      },
    });
  });

  test('placeholders override explicit language definitions', async () => {
    await initialize.init({
      placeholders: {
        'Newsletter.Form.title': 'From the sheet',
      },
      langDefinitions: {
        default: {
          Newsletter: {
            Form: {
              title: 'From code',
            },
          },
        },
      },
    });

    expect(
      initialize.config.getConfig().langDefinitions.default.Newsletter.Form.title
    ).toBe('From the sheet');
  });

  test('loads labels from the newsletter placeholder sheet', async () => {
    await initialize.init({
      placeholderSheet: {
        data: [
          { Key: 'Newsletter.Form.title', Value: 'Join the list' },
          { key: 'Newsletter.Form.emailPlaceholder', value: 'you@example.com' },
          { Value: 'skipped' },
          { Key: 'Newsletter.Form.submit' },
        ],
      },
    });

    expect(initialize.config.getConfig().langDefinitions.default.Newsletter.Form).toEqual({
      title: 'Join the list',
      emailPlaceholder: 'you@example.com',
    });
  });

  test('keeps defaults when the sheet has no rows', async () => {
    await initialize.init({ placeholderSheet: {} });

    expect(initialize.config.getConfig().langDefinitions).toBeUndefined();
  });

  test('lets a placeholder map replace a sheet value', async () => {
    await initialize.init({
      placeholderSheet: {
        data: [{ Key: 'Newsletter.Form.title', Value: 'From the sheet' }],
      },
      placeholders: {
        'Newsletter.Form.title': 'From the map',
      },
    });

    expect(
      initialize.config.getConfig().langDefinitions.default.Newsletter.Form.title
    ).toBe('From the map');
  });

  test('loads a published newsletter sheet', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ key: 'Newsletter.Minified.edit', value: 'Change' }],
      }),
    } as Response);

    await initialize.init({
      placeholderSheet: '/placeholders/newsletter.json',
    });

    expect(
      initialize.config.getConfig().langDefinitions.default.Newsletter.Minified.edit
    ).toBe('Change');

    (global.fetch as jest.Mock).mockRestore();
  });

  test('ignores a newsletter sheet response without rows', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);

    await initialize.init({
      placeholderSheet: '/placeholders/newsletter.json',
    });

    expect(initialize.config.getConfig().langDefinitions).toBeUndefined();

    (global.fetch as jest.Mock).mockRestore();
  });

  test('ignores a newsletter sheet that is not available', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({}),
    } as Response);

    await initialize.init({
      placeholderSheet: '/placeholders/newsletter.json',
    });

    expect(initialize.config.getConfig().langDefinitions).toBeUndefined();

    (global.fetch as jest.Mock).mockRestore();
  });

  test('ignores a newsletter sheet request that fails', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('offline'));

    await initialize.init({
      placeholderSheet: '/placeholders/newsletter.json',
    });

    expect(initialize.config.getConfig().langDefinitions).toBeUndefined();

    (global.fetch as jest.Mock).mockRestore();
  });
});
