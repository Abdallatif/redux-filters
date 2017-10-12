import { expect } from 'chai';
import { fromJS } from 'immutable';

import { phones } from './fixtures';

import {
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
} from '../actions';

import {
  selectFilteredDataIds,
  selectFiltersStatus,
  selectAllFilters
} from '../selectors';

import rootReducer from '../';

const selectFilteredDataInvoked = selectFilteredDataIds();
const selectFiltersStatusInvoked = selectFiltersStatus();
const selectAllFiltersInvoked = selectAllFilters();

const props = { root: [''] };
let state;

describe('Testing redux filters ', () => {
  before(() => {
    state = fromJS({
      id: 'id',
      FILTERS: {},
      DATA: {}
    });
  });

  it('Should add features bitmask filter category', () => {
    const featuresFiltersCategory = () =>
      addBitmaskFilterCategory({ category: 'features', disjunctive: false });
    state = rootReducer(state, featuresFiltersCategory());
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
        predicate: `contains(features, "HDR")`
      });

    const dualCameraFilter = () =>
      addBitmaskFilter({
        category: 'features',
        id: 'dualCamera',
        predicate: `contains(features, "Dual cameras")`
      });

    const touchFocusFilter = () =>
      addBitmaskFilter({
        category: 'features',
        id: 'touchFocus',
        predicate: `contains(features, "touch focus")`
      });

    const waterProofFilter = () =>
      addBitmaskFilter({
        category: 'features',
        id: 'waterProof',
        predicate: `isWaterProof`
      });

    state = rootReducer(state, hdrFilter());
    state = rootReducer(state, dualCameraFilter());
    state = rootReducer(state, touchFocusFilter());
    state = rootReducer(state, waterProofFilter());

    const stateJS = state.toJS();
    expect(Object.keys(stateJS.FILTERS.features.FILTERS_SET)).to.deep.equal([
      'hdr',
      'dualCamera',
      'touchFocus',
      'waterProof'
    ]);
  });

  it('Should select all filters', () => {
    expect(selectAllFiltersInvoked(state, props).toJS()).to.deep.equal({
      features: ['hdr', 'dualCamera', 'touchFocus', 'waterProof']
    });
  });

  it('Should update features bitmask after activating hdr filter', () => {
    const activateHdrFilter = () =>
      activateFilter({ category: 'features', filterId: 'hdr' });
    state = rootReducer(state, activateHdrFilter());
    const filterStatus = selectFiltersStatusInvoked(state, props).toJS();
    expect(filterStatus.features.hdr).to.equal('active');
  });

  it('Should update data', () => {
    state = rootReducer(state, updateIdProp('phoneId'));
    expect(state.get('id')).to.equal('phoneId');
    state = rootReducer(state, updateData(phones));
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
    state = rootReducer(state, checkAndUpdateData(phones));
    expect(stateBeforeUpdate).to.equal(state);
  });

  it('Should filter data', () => {
    expect(selectFilteredDataInvoked(state, props).toJS()).to.deep.equal([
      'D855',
      'pixel2'
    ]);
  });

  it('Should toggle filter', () => {
    const toggleHdrFilter = () => toggleFilter({ category: 'features', filterId: 'hdr' });
    const oldStateJS = state.toJS();
    state = rootReducer(state, toggleHdrFilter());
    selectFilteredDataInvoked(state, props);
    state = rootReducer(state, toggleHdrFilter());
    const stateJS = state.toJS();
    expect(oldStateJS.FILTERS.features.bitmask).to.equal(
      stateJS.FILTERS.features.bitmask
    );
  });

  it('Should return filters status', () => {
    const filtersStatus = selectFiltersStatusInvoked(state, props).toJS();
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
      deactivateFilter({ category: 'features', filterId: 'hdr' });
    state = rootReducer(state, deactivateHdrFilter());
    expect(selectFilteredDataInvoked(state, props).toJS()).to.deep.equal([
      'A1905',
      'D855',
      'pixel2'
    ]);
  });

  it('Should reset all filters', () => {
    const activateWaterProofFilter = () =>
      activateFilter({ category: 'features', filterId: 'waterProof' });
    const stateBeforeActivation = state;
    state = rootReducer(state, activateWaterProofFilter());
    state = rootReducer(state, resetFilters());
    expect(stateBeforeActivation.toJS()).to.deep.equal(state.toJS());
  });

  it('Should delete all filters', () => {
    state = rootReducer(state, clearFilters());
    expect(state.toJS().FILTERS).to.deep.equal({});
  });

  it('Should delete all data info', () => {
    state = rootReducer(state, clearData());
    expect(state.toJS().DATA).to.deep.equal({});
  });
});
