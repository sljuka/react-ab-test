import React, { Component } from 'react';
import { v4 as UUID } from 'uuid';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';

import CoreExperiment from '../../src/CoreExperiment.jsx';
import Experiment from '../../src/Experiment.jsx';
import Variant from '../../src/Variant.jsx';
import emitter from '../../src/emitter.jsx';

describe('Emitter', () => {
  afterEach(() => {
    emitter._reset();
  });

  it('should throw an error when passed an invalid name argument.', () => {
    expect(() => {
      emitter.emitWin(1);
    }).toThrowError(/type \'string\'/);
  });

  it('should emit when a variant is played.', () => {
    const experimentName = UUID();
    // TODO: use spies?
    let playedVariantName = null;
    let playCallback = (experimentName, variantName) => {
      playedVariantName = variantName;
    };

    let experimentNameGlobal = null;
    let playedVariantNameGlobal = null;
    let playCallbackGlobal = (experimentName, variantName) => {
      experimentNameGlobal = experimentName;
      playedVariantNameGlobal = variantName;
    };

    const playSubscription = emitter.addPlayListener(
      experimentName,
      playCallback
    );
    const playSubscriptionGlobal = emitter.addPlayListener(playCallbackGlobal);

    const wrapper = mount(
      <CoreExperiment name={experimentName} defaultVariantName="A">
        <Variant name="A">
          <div id="variant-a" />
        </Variant>
        <Variant name="B">
          <div id="variant-a" />
        </Variant>
      </CoreExperiment>
    );

    expect(playedVariantName).toBe('A');
    expect(experimentNameGlobal).toBe(experimentName);
    expect(playedVariantNameGlobal).toBe('A');
    playSubscription.remove();
    playSubscriptionGlobal.remove();
  });

  it('should emit when a variant wins.', () => {
    const experimentName = UUID();
    let winningVariantName = null;
    let winCallback = function (experimentName, variantName) {
      winningVariantName = variantName;
    };
    let experimentNameGlobal = null;
    let winningVariantNameGlobal = null;
    let winCallbackGlobal = function (experimentName, variantName) {
      experimentNameGlobal = experimentName;
      winningVariantNameGlobal = variantName;
    };
    const winSubscription = emitter.addWinListener(experimentName, winCallback);
    const winSubscriptionGlobal = emitter.addWinListener(winCallbackGlobal);

    const wrapper = mount(
      <CoreExperiment name={experimentName} defaultVariantName="A">
        <Variant name="A">
          <div id="variant-a" />
        </Variant>
        <Variant name="B">
          <div id="variant-a" />
        </Variant>
      </CoreExperiment>
    );

    emitter.emitWin(experimentName);

    expect(winningVariantName).toBe('A');
    expect(experimentNameGlobal).toBe(experimentName);
    expect(winningVariantNameGlobal).toBe('A');

    winSubscription.remove();
    winSubscriptionGlobal.remove();
  });

  it('should emit when a variant is clicked.', () => {
    let experimentName = UUID();

    let winningVariantName = null;
    let winCallback = function (experimentName, variantName) {
      winningVariantName = variantName;
    };
    let experimentNameGlobal = null;
    let winningVariantNameGlobal = null;
    let winCallbackGlobal = function (experimentName, variantName) {
      experimentNameGlobal = experimentName;
      winningVariantNameGlobal = variantName;
    };
    const winSubscription = emitter.addWinListener(experimentName, winCallback);
    const winSubscriptionGlobal = emitter.addWinListener(winCallbackGlobal);

    class App extends Component {
      onClickVariant = (e) => {
        this.experimentRef.current.win();
      };

      experimentRef = React.createRef();

      render() {
        return (
          <Experiment
            ref={this.experimentRef}
            name={experimentName}
            defaultVariantName="A"
          >
            <Variant name="A">
              <a id="variant-a" href="#A" onClick={this.onClickVariant}>
                A
              </a>
            </Variant>
            <Variant name="B">
              <a id="variant-b" href="#B" onClick={this.onClickVariant}>
                B
              </a>
            </Variant>
          </Experiment>
        );
      }
    }

    const wrapper = mount(<App />);
    wrapper.find('#variant-a').simulate('click');

    expect(winningVariantName).toBe('A');
    expect(experimentNameGlobal).toBe(experimentName);
    expect(winningVariantNameGlobal).toBe('A');

    winSubscription.remove();
    winSubscriptionGlobal.remove();
  });

  it('should emit when a variant is chosen.', () => {
    const experimentName = UUID();
    let activeVariantName = null;
    const activeVariantCallback = function (experimentName, variantName) {
      activeVariantName = variantName;
    };
    let experimentNameGlobal = null;
    let activeVariantNameGlobal = null;
    const activeVariantCallbackGlobal = function (experimentName, variantName) {
      experimentNameGlobal = experimentName;
      activeVariantNameGlobal = variantName;
    };
    const activeVariantSubscription = emitter.addActiveVariantListener(
      experimentName,
      activeVariantCallback
    );
    const activeVariantSubscriptionGlobal = emitter.addActiveVariantListener(
      activeVariantCallbackGlobal
    );

    const experimentRef = React.createRef();

    const wrapper = mount(
      <Experiment
        ref={experimentRef}
        name={experimentName}
        defaultVariantName="A"
      >
        <Variant name="A">
          <a id="variant-a" href="#A">
            A
          </a>
        </Variant>
        <Variant name="B">
          <a id="variant-b" href="#B">
            B
          </a>
        </Variant>
      </Experiment>
    );

    expect(activeVariantName).toBe('A');
    expect(experimentNameGlobal).toBe(experimentName);
    expect(activeVariantNameGlobal).toBe('A');

    activeVariantSubscription.remove();
    activeVariantSubscriptionGlobal.remove();
  });

  it('should get the experiment value.', () => {
    const experimentName = UUID();
    const experimentRef = React.createRef();

    const wrapper = mount(
      <Experiment
        ref={experimentRef}
        name={experimentName}
        defaultVariantName="A"
      >
        <Variant name="A">
          <a id="variant-a" href="#A">
            A
          </a>
        </Variant>
        <Variant name="B">
          <a id="variant-b" href="#B">
            B
          </a>
        </Variant>
      </Experiment>
    );

    expect(emitter.getActiveVariant(experimentName)).toBe('A');
  });

  it('should update the rendered component.', () => {
    const experimentName = UUID();

    const wrapper = mount(
      <CoreExperiment name={experimentName} defaultVariantName="A">
        <Variant name="A">
          <div id="variant-a" />
        </Variant>
        <Variant name="B">
          <div id="variant-b" />
        </Variant>
      </CoreExperiment>
    );

    expect(wrapper.find('#variant-a').exists());
    expect(!wrapper.find('#variant-b').exists());

    act(() => {
      emitter.setActiveVariant(experimentName, 'B');
    });

    expect(!wrapper.find('#variant-a').exists());
    expect(wrapper.find('#variant-b').exists());
  });

  it('should report active components.', () => {
    let experimentNameA = UUID();
    let experimentNameB = UUID();

    const AppA = () => (
      <CoreExperiment name={experimentNameA} defaultVariantName="A">
        <Variant name="A">
          <div id="variant-a" />
        </Variant>
        <Variant name="B">
          <div id="variant-b" />
        </Variant>
      </CoreExperiment>
    );

    const AppB = () => (
      <Experiment name={experimentNameB} defaultVariantName="C">
        <Variant name="C">
          <div id="variant-a" />
        </Variant>
        <Variant name="D">
          <div id="variant-b" />
        </Variant>
      </Experiment>
    );

    const AppCombined = () => (
      <div>
        <AppA />
        <AppB />
      </div>
    );

    let wrapper = mount(<AppA />);
    expect(emitter.getActiveExperiments()).toEqual({
      [experimentNameA]: {
        A: true,
        B: false,
      },
    });
    wrapper.unmount();

    wrapper = mount(<AppB />);
    expect(emitter.getActiveExperiments()).toEqual({
      [experimentNameB]: {
        C: true,
        D: false,
      },
    });
    wrapper.unmount();

    wrapper = mount(<AppCombined />);
    expect(emitter.getActiveExperiments()).toEqual({
      [experimentNameA]: {
        A: true,
        B: false,
      },
      [experimentNameB]: {
        C: true,
        D: false,
      },
    });
  });

  it('should force the calculation of an active variant', () => {
    const experimentName = UUID();
    emitter.defineVariants(experimentName, ['A', 'B']);
    const activeVariant = emitter.calculateActiveVariant(experimentName);
    expect(activeVariant).toEqual(emitter.getActiveVariant(experimentName));
  });

  it('should use custom distribution algorithm when set', () => {
    const experimentName = UUID();
    emitter.defineVariants(experimentName, ['A', 'B']);
    emitter.setCustomDistributionAlgorithm((_experimentName, userIdentifier) =>
      parseInt(userIdentifier) % 4 === 0 ? 'A' : 'B'
    );
    const variants = [...Array(6).keys()].map((userIdentifier) =>
      emitter.calculateActiveVariant(experimentName, userIdentifier.toString())
    );

    expect(variants).toEqual(['A', 'B', 'B', 'B', 'A', 'B']);
  });
});
