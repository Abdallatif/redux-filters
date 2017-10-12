import { createAction } from 'redux-act';

export const updateIdProp = createAction('Filterable data update id prop');
export const addBitmaskFilterCategory = createAction('Add new bitmask filter category');
export const addBitmaskFilter = createAction('Add new bitmask filter');
export const activateFilter = createAction('Activate filter');
export const deactivateFilter = createAction('Deactivate filter');
export const toggleFilter = createAction('Toggle filter');
export const resetFilters = createAction('Reset filter');
export const clearFilters = createAction('Clear filter');

export const checkAndUpdateData = createAction('Check and update new filterable data');
export const updateData = createAction('Force update new filterable data'); // Maybe if you add filter at later stage
export const clearData = createAction('Clear Data');
