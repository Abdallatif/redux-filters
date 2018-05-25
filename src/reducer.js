import { fromJS } from 'immutable';
import { createReducer } from 'redux-act';
import safeEval from 'notevil';

import {
  activateFilter as activate,
  deactivateFilter as deactivate,
  toggleFilter as toggle
} from 'bit-ops';

import {
  updateIdProp,
  addBitmaskFilterCategory,
  addBitmaskFilter,
  checkAndUpdateData,
  updateData,
  clearData,
  activateFilter,
  deactivateFilter,
  toggleFilter,
  resetFilters,
  clearFilters
} from './actions';

import { FILTERS_BRANCH, FILTERS_SET_BRANCH, DATA_BRANCH } from './constants';

const initialState = {
  id: 'id',
  [FILTERS_BRANCH]: {},
  [DATA_BRANCH]: {}
};

export const alterBitmaskFilterState = (state, filterCategory, id, func = toggle) => {
  const filterValue = state.getIn([
    FILTERS_BRANCH,
    filterCategory,
    FILTERS_SET_BRANCH,
    id,
    'value'
  ]);
  const categoryBitmask = func(
    state.getIn([FILTERS_BRANCH, filterCategory, 'bitmask']),
    filterValue
  );
  return state.setIn([FILTERS_BRANCH, filterCategory, 'bitmask'], categoryBitmask);
};

const filtersReducers = {
  [addBitmaskFilterCategory]: (state, { category, disjunctive }) =>
    state.setIn(
      [FILTERS_BRANCH, category],
      fromJS({
        type: 'bitmask',
        bitmask: 0,
        disjunctive,
        [FILTERS_SET_BRANCH]: {}
      })
    ),
  [addBitmaskFilter]: (state, { category, id, predicate }) => {
    const index = state.getIn([FILTERS_BRANCH, category, FILTERS_SET_BRANCH]).size;
    const value = 1 << index;
    return state.setIn(
      [FILTERS_BRANCH, category, FILTERS_SET_BRANCH, id],
      fromJS({
        index,
        value,
        predicate
      })
    );
  },
  [toggleFilter]: (state, { category, id }) =>
    alterBitmaskFilterState(state, category, id),
  [activateFilter]: (state, { category, id }) =>
    alterBitmaskFilterState(state, category, id, activate),
  [deactivateFilter]: (state, { category, id }) =>
    alterBitmaskFilterState(state, category, id, deactivate),
  [resetFilters]: state =>
    state.set(
      FILTERS_BRANCH,
      state.get(FILTERS_BRANCH).map(filter => filter.set('bitmask', 0))
    ),
  [clearFilters]: state => state.set(FILTERS_BRANCH, fromJS({}))
};

const calculateFilterValues = (filters, item) => {
  return filters.reduce((filtersBitmask, category, key) => {
    filtersBitmask[key] = category.get(FILTERS_SET_BRANCH).reduce((value, filter) => {
      const predicate = filter.get('predicate');
      if (safeEval(predicate, item)) {
        return value | filter.get('value');
      }
      return value;
    }, 0);
    return filtersBitmask;
  }, {});
};

const extractData = (state, payload, overrideExistingData = false) => {
  const idProp = state.get('id');
  const filters = state.getIn([FILTERS_BRANCH]);
  return payload.reduce((newState, item) => {
    const itemId = item[idProp];
    if (overrideExistingData || !newState.hasIn([DATA_BRANCH, itemId])) {
      return newState.setIn(
        [DATA_BRANCH, itemId],
        fromJS(calculateFilterValues(filters, item))
      );
    }
    return newState;
  }, state);
};

const dataReducer = {
  [checkAndUpdateData]: (state, payload) => extractData(state, payload),
  [updateData]: (state, payload) => extractData(state, payload, true),
  [clearData]: state => state.set(DATA_BRANCH, fromJS({}))
};

export const reducer = createReducer(
  {
    [updateIdProp]: (state, payload) => state.set('id', payload),
    ...filtersReducers,
    ...dataReducer
  },
  fromJS(initialState)
);
