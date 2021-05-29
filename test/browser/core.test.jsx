import React from 'react';
import ReactDOM from 'react-dom';
import { mount } from 'enzyme';
import { v4 as UUID } from 'uuid';;

import CoreExperiment from '../../src/CoreExperiment.jsx';
import Variant from '../../src/Variant.jsx';
import emitter from '../../src/emitter.jsx';

describe('Core Experiment', () => {
  it('should render the correct variant.', () => {
    const wrapper = mount(
      <CoreExperiment name={UUID()} defaultVariantName="A">
        <Variant name="A">
          <div id="variant-a" />
        </Variant>
        <Variant name="B">
          <div id="variant-b" />
        </Variant>
      </CoreExperiment>
    );

    expect(!wrapper.find('#variant-a').exists());
    expect(wrapper.find('#variant-b').exists());
  });

  it('should error if invalid children exist.', () => {
    // Suppress React's error boundary logs
    jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      mount(
        <CoreExperiment name={UUID()} defaultVariantName="A">
          <Variant name="A">
            <div id="variant-a" />
          </Variant>
          <div />
        </CoreExperiment>
      );
    }).toThrowError(
      'Pushtell Experiment children must be Pushtell Variant components',
      'PUSHTELL_INVALID_CHILD'
    );
  });

  it('should update on componentWillReceiveProps.', () => {
    const wrapper = mount(
      <CoreExperiment name={UUID()} defaultVariantName="A">
        <Variant name="A">
          <div id="variant-a" />
        </Variant>
        <Variant name="B">
          <div id="variant-b" />
        </Variant>
      </CoreExperiment>
    );

    expect(!wrapper.find('#variant-a').exists());
    expect(wrapper.find('#variant-b').exists());

    wrapper.setProps({ value: 'B' });

    expect(wrapper.find('#variant-a').exists());
    expect(!wrapper.find('#variant-b').exists());
  });

  it('should update the children when props change.', () => {
    const SubComponent = ({ text }) => {
      return (
        <div id="variant-a">
          <span id="variant-a-text">{text}</span>
        </div>
      );
    };
    const App = ({ text }) => {
      return (
        <CoreExperiment name={UUID()} defaultVariantName="A">
          <Variant name="A">
            <SubComponent text={text} />
          </Variant>
          <Variant name="B">
            <div id="variant-b" />
          </Variant>
        </CoreExperiment>
      );
    };
    const originalText = 'original text';
    const newText = 'original text';

    const wrapper = mount(<App text={originalText} />);
    expect(wrapper.find('#variant-a-text').text()).toBe(originalText);
    wrapper.setProps({ text: newText });
    expect(wrapper.find('#variant-a-text').text()).toBe(newText);
  });
});
