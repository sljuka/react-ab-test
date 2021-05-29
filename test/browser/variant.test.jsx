import React from 'react';
import { mount } from 'enzyme';

import CoreExperiment from '../../src/CoreExperiment.jsx';
import Variant from '../../src/Variant.jsx';
import emitter from '../../src/emitter.jsx';

describe('Variant', () => {
  it('should render text nodes', () => {
    const variantTextA = 'variantTextA';
    const variantTextB = 'variantTextB';

    const wrapper = mount(
      <CoreExperiment name="text-nodes" defaultVariantName="A">
        <Variant name="A">{variantTextA}</Variant>
        <Variant name="B">{variantTextB}</Variant>
      </CoreExperiment>
    );

    expect(wrapper.find(Variant).at(0).text()).toBe(variantTextA);
  });

  it('should render components', () => {
    const wrapper = mount(
      <CoreExperiment name="components" defaultVariantName="A">
        <Variant name="A">
          <div id="variant-a" />
        </Variant>
        <Variant name="B">
          <div id="variant-b" />
        </Variant>
      </CoreExperiment>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('should render arrays of components', () => {
    const wrapper = mount(
      <CoreExperiment name="array-of-elements" defaultVariantName="A">
        <Variant name="A">
          <div id="variant-a" />
          <div />
        </Variant>
        <Variant name="B">
          <div id="variant-b" />
          <div />
        </Variant>
      </CoreExperiment>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
