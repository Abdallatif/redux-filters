import { createSelector } from 'reselect';
import { qualifyMask } from 'bit-ops';
import { fromJS } from 'immutable';
import {
  DATA_BRANCH,
  FILTERS_BRANCH,
  FILTERS_SET_BRANCH,
  FILTER_HIDDEN,
  FILTER_ACTIVE,
  FILTER_INITIAL,
  FILTER_DISABLED,
  FILTER_MAYBE_DISABLED
} from './constants';

const selectRootDomain = () => (state, props) =>
  // `filtersRootBranch` is where reducer live
  (props && props.filtersRootBranch && state.getIn(props.filtersRootBranch)) || state;

const selectFiltersDomain = () =>
  createSelector(selectRootDomain(), root => root.get(FILTERS_BRANCH));

const selectDataDomain = () =>
  createSelector(selectRootDomain(), root => root.get(DATA_BRANCH));

export const selectFiltersBitmasks = () =>
  createSelector(selectFiltersDomain(), filtersByCategory =>
    filtersByCategory.reduce(
      (filtersByCategoryBitmask, filter, category) =>
        filtersByCategoryBitmask.set(category, {
          bitmask: filter.get('bitmask'),
          disjunctive: filter.get('disjunctive')
        }),
      fromJS({})
    )
  );
/* eslint-line-disable TODO: filter by other types of filters */
const selectFilteredData = () =>
  createSelector(selectFiltersBitmasks(), selectDataDomain(), (filters, data) =>
    data.filter(item => {
      return filters.reduce((acc, filter, category) => {
        const itemMask = item.get(category);
        return filter.bitmask ? acc && qualifyMask(filter, itemMask) : acc;
      }, true);
    })
  );

export const selectFilteredDataIds = () =>
  createSelector(selectFilteredData(), filteredData => filteredData.keySeq());

// {category : [...filtersIds], cat}
export const selectAllFilters = () =>
  createSelector(selectFiltersDomain(), filtersByCategory =>
    filtersByCategory.map(filterCategory =>
      filterCategory.get(FILTERS_SET_BRANCH).keySeq()
    )
  );

// {category : [...filtersIds]}
export const selectActiveFilters = () =>
  createSelector(selectFiltersDomain(), filtersByCategory =>
    filtersByCategory
      .map(filterCategory => {
        const filterBitmask = filterCategory.get('bitmask');
        return filterCategory
          .get(FILTERS_SET_BRANCH)
          .filter(bitmaskFilter => bitmaskFilter.get('value') & filterBitmask);
      })
      .filter(filterCategory => filterCategory.size > 0)
  );

const selectFiltersCounts = (filters, data) =>
  filters.reduce(
    (filtersCountSet, filter, category) =>
      filtersCountSet.set(
        category,
        filter.get(FILTERS_SET_BRANCH).map(filter => {
          // If we activate this fitler alone, how many item would remain
          const filterMask = filter.get('value');
          return data.reduce(
            (count, item) => (filterMask & item.get(category) ? count + 1 : count),
            0
          );
        })
      ),
    fromJS({})
  );

export const selectOriginalFiltersCounts = () =>
  createSelector(selectFiltersDomain(), selectDataDomain(), selectFiltersCounts);

export const selectNewFiltersCounts = () =>
  createSelector(selectFiltersDomain(), selectFilteredData(), selectFiltersCounts);

/* eslint-disable max-params */
const determineFilterState = (
  active,
  originalCount,
  originalLength,
  filteredCount,
  filteredLength
) => {
  if (active) return FILTER_ACTIVE;
  if (originalCount === originalLength || originalCount === 0) return FILTER_HIDDEN;
  if (filteredCount === filteredLength) return FILTER_MAYBE_DISABLED;
  if (filteredCount === 0) return FILTER_DISABLED;
  return FILTER_INITIAL;
};

export const selectFiltersStatus = () =>
  createSelector(
    selectDataDomain(),
    selectFilteredDataIds(),
    selectOriginalFiltersCounts(),
    selectNewFiltersCounts(),
    selectActiveFilters(),
    (originalData, filteredData, originalCount, filteredCount, active) => {
      const originalLength = originalData.size;
      const filteredLength = filteredData.size;
      return originalCount.map((filters, category) =>
        filters.map((count, id) =>
          determineFilterState(
            active.hasIn([category, id]),
            count,
            originalLength,
            filteredCount.getIn([category, id]),
            filteredLength
          )
        )
      );
    }
  );
/* eslint-enable max-params */
