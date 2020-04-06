import Button from './index';
describe('<Button />', () => {
  it('renders children', () => {
    const text = 'Click me!';
    const button = mount(<Button>{text}</Button>);
    expect(button.text()).toBe(text);
  });
})