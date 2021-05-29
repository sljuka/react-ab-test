import React from 'react';
import { v4 as UUID } from 'uuid';;
import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';

import CoreExperiment from "../../src/CoreExperiment.jsx";
import Variant from '../../src/Variant.jsx';
import emitter from '../../src/emitter.jsx';
import mixpanelHelper from '../../src/helpers/mixpanel.jsx';
import { mount } from 'enzyme';

describe('Mixpanel Helper', () => {
  it('should error if Mixpanel global is not set', () => {
    expect(() => mixpanelHelper.enable()).toThrowError(
      '',
      'PUSHTELL_HELPER_MISSING_GLOBAL'
    );
  });

  it('should error if Mixpanel is disabled before it is enabled', () => {
    expect(() => mixpanelHelper.enable()).toThrowError(
      '',
      'PUSHTELL_HELPER_INVALID_DISABLE'
    );
  });

  it('should report results to Mixpanel', () => {
    const experimentName = UUID();
    const variantName = 'A';

    window.mixpanel = {
      track() {},
    };
    const spy = jest.spyOn(mixpanel, 'track');

    mixpanelHelper.enable();

    mount(
      <CoreExperiment name={experimentName} defaultVariantName={variantName}>
        <Variant name="A">
          <div id="variant-a" />
        </Variant>
        <Variant name="B">
          <div id="variant-b" />
        </Variant>
      </CoreExperiment>
    );

    emitter.emitWin(experimentName);

    expect(spy.mock.calls.length).toBe(2);

    expect(spy.mock.calls[0][0]).toBe('Experiment Play');
    expect(spy.mock.calls[0][1]).toEqual({
      Experiment: experimentName,
      Variant: variantName,
    });

    expect(spy.mock.calls[1][0]).toBe('Experiment Win');
    expect(spy.mock.calls[1][1]).toEqual({
      Experiment: experimentName,
      Variant: variantName,
    });

    mixpanelHelper.disable();
    delete window.mixpanel;
  });
});
