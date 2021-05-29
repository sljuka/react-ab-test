import React from 'react';
import { v4 as UUID } from 'uuid';;
import { mount } from 'enzyme';

import Experiment from '../../src/Experiment.jsx';
import Variant from '../../src/Variant.jsx';
import emitter from '../../src/emitter.jsx';

function add(a, b) {
  return a + b;
}

describe('Weighted Experiment', () => {
  it('should choose a weighted variants', () => {
    const experimentName = UUID();
    const variantNames = [];
    const variantWeights = [];
    const playCount = {};

    for (let i = 0; i < 5; i++) {
      variantNames.push(UUID());
      variantWeights.push(Math.floor(Math.random() * 100));
    }

    variantNames.forEach(variantName => {
      playCount[variantName] = 0;
    });

    const weightSum = variantWeights.reduce(add, 0);

    emitter.defineVariants(experimentName, variantNames, variantWeights);

    expect(
      emitter.getSortedVariantWeights(experimentName).reduce(add, 0)
    ).toEqual(weightSum);

    const App = () => {
      return (
        <Experiment name={experimentName}>
          {variantNames.map(name => {
            return (
              <Variant key={name} name={name}>
                <div id={'variant-' + name} />
              </Variant>
            );
          })}
        </Experiment>
      );
    };

    emitter.addListener('play', (experimentName, variantName) => {
      playCount[variantName] = playCount[variantName];
      playCount[variantName] += 1;
    });

    for (let i = 0; i < 1000; i++) {
      const container = mount(<App />);
      container.unmount();
      localStorage.clear();
      emitter._resetPlayedExperiments();
    }

    const playSum = Object.keys(playCount)
      .map(variantName => playCount[variantName])
      .reduce(add, 0);

    const playCountToWeightRatios = variantNames.map((variantName, index) => {
      return (
        playCount[variantName] / playSum / (variantWeights[index] / weightSum)
      );
    });
    const ratioMean =
      playCountToWeightRatios.reduce(add, 0) / playCountToWeightRatios.length;

    const ratioVariance = playCountToWeightRatios
      .map(ratio => Math.pow(ratioMean - ratio, 2))
      .reduce(add, 0);

    const ratioStandardDeviation = Math.sqrt(ratioVariance);

    expect(ratioStandardDeviation).toBeLessThan(0.6);
  });
});
