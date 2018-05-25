import { expect } from 'chai';
import { phones } from './fixtures';

import {
  filtersReducer,
  selectFilteredDataIds,
  selectFiltersStatus,
  selectAllFilters,
  updateIdProp,
  addBitmaskFilterCategory,
  addBitmaskFilter,
  activateFilter,
  toggleFilter,
  deactivateFilter,
  checkAndUpdateData,
  updateData,
  resetFilters,
  clearFilters,
  clearData
} from '../';

const selectFilteredDataInvoked = selectFilteredDataIds();
const selectFiltersStatusInvoked = selectFiltersStatus();
const selectAllFiltersInvoked = selectAllFilters();

let state;

describe('Testing redux filters ', () => {
  before(() => {
    state = filtersReducer();
  });

  it('Should add features bitmask filter category', () => {
    const featuresFiltersCategory = () =>
      addBitmaskFilterCategory({ category: 'features', disjunctive: false });
    state = filtersReducer(state, featuresFiltersCategory());
    const stateJS = state.toJS();
    expect(Object.keys(stateJS.FILTERS)).to.includes('features');
    expect(stateJS.FILTERS.features).to.deep.equal({
      bitmask: 0,
      disjunctive: false,
      type: 'bitmask',
      FILTERS_SET: {}
    });
  });

  it('Should add different bitmask filters to features category', () => {
    const hdrFilter = () =>
      addBitmaskFilter({
        category: 'features',
        id: 'hdr',
        predicate: `features.includes("HDR")`
      });

    const dualCameraFilter = () =>
      addBitmaskFilter({
        category: 'features',
        id: 'dualCamera',
        predicate: `features.includes("Dual cameras")`
      });

    const touchFocusFilter = () =>
      addBitmaskFilter({
        category: 'features',
        id: 'touchFocus',
        predicate: `features.includes("touch focus")`
      });

    const waterProofFilter = () =>
      addBitmaskFilter({
        category: 'features',
        id: 'waterProof',
        predicate: `isWaterProof`
      });

    state = filtersReducer(state, hdrFilter());
    state = filtersReducer(state, dualCameraFilter());
    state = filtersReducer(state, touchFocusFilter());
    state = filtersReducer(state, waterProofFilter());

    const stateJS = state.toJS();
    expect(Object.keys(stateJS.FILTERS.features.FILTERS_SET)).to.deep.equal([
      'hdr',
      'dualCamera',
      'touchFocus',
      'waterProof'
    ]);
  });

  it('Should select all filters', () => {
    expect(selectAllFiltersInvoked(state).toJS()).to.deep.equal({
      features: ['hdr', 'dualCamera', 'touchFocus', 'waterProof']
    });
  });

  it('Should update features bitmask after activating hdr filter', () => {
    const activateHdrFilter = () => activateFilter({ category: 'features', id: 'hdr' });
    state = filtersReducer(state, activateHdrFilter());
    const filterStatus = selectFiltersStatusInvoked(state).toJS();
    expect(filterStatus.features.hdr).to.equal('active');
  });

  it('Should update data', () => {
    state = filtersReducer(state, updateIdProp('phoneId'));
    expect(state.get('id')).to.equal('phoneId');
    state = filtersReducer(state, updateData(phones));
    const stateJS = state.toJS();
    expect(stateJS.DATA).to.deep.equal({
      A1905: {
        features: 10
      },
      D855: {
        features: 5
      },
      pixel2: {
        features: 13
      }
    });
  });

  it('Should not update data', () => {
    const stateBeforeUpdate = state;
    state = filtersReducer(state, checkAndUpdateData(phones));
    expect(stateBeforeUpdate).to.equal(state);
  });

  it('Should filter data', () => {
    expect(selectFilteredDataInvoked(state).toJS()).to.deep.equal(['D855', 'pixel2']);
  });

  it('Should toggle filter', () => {
    const toggleHdrFilter = () => toggleFilter({ category: 'features', id: 'hdr' });
    const oldStateJS = state.toJS();
    state = filtersReducer(state, toggleHdrFilter());
    selectFilteredDataInvoked(state);
    state = filtersReducer(state, toggleHdrFilter());
    const stateJS = state.toJS();
    expect(oldStateJS.FILTERS.features.bitmask).to.equal(
      stateJS.FILTERS.features.bitmask
    );
  });

  it('Should return filters status', () => {
    const filtersStatus = selectFiltersStatusInvoked(state).toJS();
    expect(filtersStatus).to.deep.equal({
      features: {
        dualCamera: 'disabled',
        hdr: 'active',
        touchFocus: 'maybe_disabled',
        waterProof: 'inital'
      }
    });
  });

  it('Should return all data after deactivate postpaid filter', () => {
    const deactivateHdrFilter = () =>
      deactivateFilter({ category: 'features', id: 'hdr' });
    state = filtersReducer(state, deactivateHdrFilter());
    expect(selectFilteredDataInvoked(state).toJS()).to.deep.equal([
      'A1905',
      'D855',
      'pixel2'
    ]);
  });

  it('Should reset all filters', () => {
    const activateWaterProofFilter = () =>
      activateFilter({ category: 'features', id: 'waterProof' });
    const stateBeforeActivation = state;
    state = filtersReducer(state, activateWaterProofFilter());
    state = filtersReducer(state, resetFilters());
    expect(stateBeforeActivation.toJS()).to.deep.equal(state.toJS());
  });

  it('Should delete all filters', () => {
    state = filtersReducer(state, clearFilters());
    expect(state.toJS().FILTERS).to.deep.equal({});
  });

  it('Should delete all data info', () => {
    state = filtersReducer(state, clearData());
    expect(state.toJS().DATA).to.deep.equal({});
  });
});
