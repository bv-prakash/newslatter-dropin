import { render } from './render';

describe('render', () => {
  it('should render', async () => {
    const root = document.createElement('div');
    root.setAttribute('id', 'root');

    const Container = () => <div>container</div>;

    await render.render(Container, {})(root);

    expect(root.classList.contains('dropin-design')).toBe(true);
    expect(root.getAttribute('data-dropin-container')).toBe('Container');
    expect(root.innerHTML).toBe('<div>container</div>');
  });
});
