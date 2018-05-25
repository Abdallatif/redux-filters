# redux-filters 
[![NPM version][npm-image]][npm-url] 
[![Build Status][travis-image]][travis-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Codecov][codecov-image]][codecov-url]
> fast redux filters using bit operations and reselect memoization

## Installation

```sh
$ npm install --save redux-filters
```

## Usage

### Bitmask Filters
Until now this is the only type of filters you can add, more are coming.

You can use this type of filter if you have a `predicate` you want to check on every filterable item. Like if you have an array of objects (phones) like the following:

```js
export const phones = [
  {
    phoneId: 'A1905',
    features: ['Apple Pay', 'Dual cameras'],
    isWaterProof: true
  },
  {
    phoneId: 'D855',
    features: ['touch focus', 'HDR'],
    isWaterProof: false
  },
  {
    phoneId: 'pixel2',
    features: ['touch focus', 'panorama', 'HDR'],
    isWaterProof: true
  }
];
```

So if want to add a water proof filter, the predicate would be `isWaterProof`.

For an `HDR` filter, the predicate would be `features.includes("HDR")`.

#### How to add bitmask filters
After you add filterReducer to your state reducers, you should add the category for your filters first.
```js
import { addBitmaskFilter } from 'redux-filters';
addBitmaskFilterCategory({ category: 'features', disjunctive: false });
```
Here we added a new category called features which are conjunctive, which means for an item to be returned it should passed all the filters in this category.

Next we want to add water proof filter:
```js
import { addBitmaskFilter } from 'redux-filters';
addBitmaskFilter({
  category: 'features',
  id: 'waterProof',
  predicate: `isWaterProof`
});
```

#### Change filters state
When a filter is added, it's deactivated by default.
```js
import {
  activateFilter,
  deactivateFilter,
  toggleFilter,
  resetFilters,
  clearFilters
} from 'redux-filters';
// Activate water proof filter
activateFilter({ category: 'features', id: 'waterProof' });
// Deactivate water proof filter
deactivateFilter({ category: 'features', id: 'waterProof' });
// As the name suggest toggle filter state
toggleFilter({ category: 'features', id: 'waterProof' });
// Reset all filters to deactivated
resetFilters();
// Probably you don't need this, but you could use it to delete all filters
clearFilters();
```
## License

MIT © [Abdallatif]()


[npm-image]: https://badge.fury.io/js/redux-filters.svg
[npm-url]: https://npmjs.org/package/redux-filters
[travis-image]: https://travis-ci.org/Abdallatif/redux-filters.svg?branch=master
[travis-url]: https://travis-ci.org/Abdallatif/redux-filters
[codecov-image]: https://codecov.io/gh/Abdallatif/redux-filters/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/Abdallatif/redux-filters
[daviddm-image]: https://david-dm.org/Abdallatif/redux-filters.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/Abdallatif/redux-filters
