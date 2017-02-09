# interrail

Find european train stations and routes. Client for the European [Interrail](http://interrail.eu) / EuRail API.

[![npm version](https://img.shields.io/npm/v/interrail.svg)](https://www.npmjs.com/package/interrail)
[![Build Status](https://travis-ci.org/juliuste/interrail.svg?branch=master)](https://travis-ci.org/juliuste/interrail)
[![dependency status](https://img.shields.io/david/juliuste/interrail.svg)](https://david-dm.org/juliuste/interrail)
[![dev dependency status](https://img.shields.io/david/dev/juliuste/interrail.svg)](https://david-dm.org/juliuste/interrail#info=devDependencies)
[![license](https://img.shields.io/github/license/juliuste/interrail.svg?style=flat)](LICENSE)

## Installation

```sh
npm install interrail
```

## Usage

```js
const interrail = require('interrail')
```

The `interrail` module bundles two methods: [`locations()`](#locations) and [`routes()`](#routes).

### locations(name)

Find stations by name. Returns a `Promise` that resolves in a list of results:

```js 
interrail.locations('Berlin').then(…)
```

would give you

```json
[{
	name: 'BERLIN (Germany)',
	id: 8062648,
	coords: {
		lon: 13.386943,
		lat: 52.520555
	},
	weight: 32718,
	products: 62
}, …]

```

### routes(fromID, toID, datetime)

Find routes for a given date and time. Returns a `Promise` that resolves in a list of routes that contain parts (the number of parts for a direct connection would be 1, for a route with 1 change, it would be 2 etc.)

```js
interrail.routes(fromID, toID, datetime).then(…)
interrail.routes(
	8065969, // Berlin
	7942300, // Ljubljana
	2017-02-09T19:00:00+01:00
).then(…)
```

would give you

```json
[{
	parts: [{
		from: {
			name: 'BERLIN HBF (TIEF) (Germany)',
			id: 8031922,
			coords: {
				lon: 13.369441,
				lat: 52.525553
			}
		},
		to: {
			name: 'BRECLAV (Czech Republic)',
			id: 5433425,
			coords: {
				lon: 16.896943,
				lat: 48.758057
			}
		},
		departure: '2017-02-09T19:01:00+01:00',
		arrival: '2017-02-10T03:47:00+01:00',
		line: 'EN   477',
		operator: 'DB Vertrieb GmbH' }
	}, …]
}, …]
```

## Contributing

If you found a bug, want to propose a feature or feel the urge to complain about your life, feel free to visit [the issues page](https://github.com/juliuste/interrail/issues).