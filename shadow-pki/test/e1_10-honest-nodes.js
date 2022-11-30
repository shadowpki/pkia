const common = require('../common.js');
const {performance} = require('perf_hooks');
const should = require('chai').should();

suite('Experiment 1: 10 Honest Nodes', () => {
  const N = 10;

  test('Performance', async () => {
    const configs = await common.init(N, "ex1");
    this.results = await common.run(configs);
  });

  test('Property 1: All Nodes Output', () => {
    this.results.length.should.equal(N);
  });

  test('Property 2: All PKIs Identical', () => {
    this.results.forEach(result1 => {
      this.results.forEach(result2 => {
        result1.result.should.deep.equal(result2.result);
      });
    });
  });

  test('Property 3: All Nodes Represented', () => {
    this.results.forEach(result => {
      result.represented.should.equal(true);
    });
  });

  test('Property 4: No Duplicate Keys', () => {
    this.results.forEach(result => {
      result.result.size.should.equal(N);
    });
  });
});
