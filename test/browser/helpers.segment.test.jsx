import React from 'react';
import { v4 as UUID } from 'uuid';
import { canUseDOM } from 'fbjs/lib/ExecutionEnvironment';
import { mount } from 'enzyme';

import CoreExperiment from '../../src/CoreExperiment.jsx';
import Variant from '../../src/Variant.jsx';
import emitter from '../../src/emitter.jsx';
import segmentHelper from '../../src/helpers/segment.jsx';

describe('Segment Helper', () => {
  it('should error if Segment global is not set', () => {
    expect(() => segmentHelper.enable()).toThrowError(
      '',
      'PUSHTELL_HELPER_MISSING_GLOBAL'
    );
  });

  it('should error if Segment is disabled before it is enabled', () => {
    expect(() => mixpanelHelper.disable()).toThrowError(
      '',
      'PUSHTELL_HELPER_INVALID_DISABLE'
    );
  });

  it('should report results to Segment', () => {
    const experimentName = UUID();
    const variantName = 'A';

    window.analytics = {
      track() {},
    };
    const spy = jest.spyOn(analytics, 'track');

    segmentHelper.enable();

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

    expect(spy.mock.calls[0][0]).toBe('Experiment Viewed');
    expect(spy.mock.calls[0][1]).toEqual({
      experimentName: experimentName,
      variationName: variantName,
    });

    expect(spy.mock.calls[1][0]).toBe('Experiment Won');
    expect(spy.mock.calls[1][1]).toEqual({
      experimentName: experimentName,
      variationName: variantName,
    });

    segmentHelper.disable();
    delete window.analytics;
  });
});
