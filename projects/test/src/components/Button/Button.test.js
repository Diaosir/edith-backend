import React from 'react'
import Button from './index';
import { configure, mount, shallow } from 'enzyme';

import Adapter from 'enzyme-adapter-react-16';

configure({adapter: new Adapter()});

describe('<Button />', () => {
  it('renders children', () => {
    const text = 'Click me!';
    const button = mount(<Button>{text}</Button>);
    expect(button.text()).toBe(text);
  });
  it('<Button> handleClick', () => {
    const button = shallow(<Button></Button>);
    expect(button.instance().state.text).toBe('1');
    button.simulate('click');
    expect(button.instance().state.text).toBe('3');
  });
})