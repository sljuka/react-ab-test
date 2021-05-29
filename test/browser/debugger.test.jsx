import React from 'react';
import { v4 as UUID } from 'uuid';;
import { mount } from 'enzyme';

import CoreExperiment from '../../src/CoreExperiment.jsx';
import Variant from '../../src/Variant.jsx';
import experimentDebugger from '../../src/debugger.jsx';

describe('Debugger', () => {
  it('should enable and disable.', () => {
    const wrapper = mount(
      <CoreExperiment name={UUID()} defaultVariantName="A">
        <Variant name="A">
          <div id="variant-a" />
        </Variant>
      </CoreExperiment>
    );
    const getDebugger = () => document.getElementById('pushtell-debugger');

    expect(getDebugger()).toBeNull();

    experimentDebugger.enable();
    expect(getDebugger()).toBeDefined();

    experimentDebugger.disable();
    expect(getDebugger()).toBeNull();
  });

  it('should add and remove style rules', () => {
    experimentDebugger.enable();
    expect(hasCSSSelector('#pushtell-debugger')).toBe(true);
    experimentDebugger.disable();
    expect(hasCSSSelector('#pushtell-debugger')).toBe(false);
  });

  it("should change an experiment's value.", () => {
    const wrapper = mount(
      <CoreExperiment name={UUID()} defaultVariantName="A">
        <Variant name="A">
          <div id="variant-a" />
        </Variant>
        <Variant name="B">
          <div id="variant-a" />
        </Variant>
      </CoreExperiment>
    );

    experimentDebugger.enable();

    expect(wrapper.find('#variant-a').exists());
    expect(!wrapper.find('#variant-b').exists());

    document.querySelector('#pushtell-debugger div.pushtell-handle').click();

    const radioButtonA = document.querySelector(
      "#pushtell-debugger input[value='A']"
    );
    const radioButtonB = document.querySelector(
      "#pushtell-debugger input[value='B']"
    );
    expect(radioButtonA.checked).toBe(true);
    radioButtonB.click();

    expect(!wrapper.find('#variant-a').exists());
    expect(wrapper.find('#variant-b').exists());

    experimentDebugger.disable();
  });

  describe('when is not available', () => {
    beforeEach(() => {
      experimentDebugger.setDebuggerAvailable(false);
      experimentDebugger.enable();
    });
    it('should do nothing when enabling it', () => {
      expect(hasCSSSelector('#pushtell-debugger')).toBe(false);
    });
    afterEach(() => {
      experimentDebugger.setDebuggerAvailable(true);
    });
  });
});

// See http://stackoverflow.com/a/985070
function hasCSSSelector(s) {
  if (!document.styleSheets) {
    return '';
  }
  s = s.toLowerCase();
  var A,
    temp,
    n = document.styleSheets.length,
    SA = [];
  for (let i = 0; i < document.styleSheets.length; i++) {
    let sheet = document.styleSheets[i];
    let rules = sheet.rules ? sheet.rules : sheet.cssRules;
    for (let j = 0; j < rules.length; j++) {
      let selector = rules[j].selectorText
        ? rules[j].selectorText
        : rules[j].toString();
      if (selector.toLowerCase() === s) {
        return true;
      }
    }
  }
  return false;
}
