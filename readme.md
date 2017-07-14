# interrail

Find european train stations and journeys. Client for the European [Interrail](http://interrail.eu) / EuRail API. Complies with the [friendly public transport format](https://github.com/public-transport/friendly-public-transport-format).

[![npm version](https://img.shields.io/npm/v/interrail.svg)](https://www.npmjs.com/package/interrail)
[![Build Status](https://travis-ci.org/juliuste/interrail.svg?branch=master)](https://travis-ci.org/juliuste/interrail)
[![dependency status](https://img.shields.io/david/juliuste/interrail.svg)](https://david-dm.org/juliuste/interrail)
[![dev dependency status](https://img.shields.io/david/dev/juliuste/interrail.svg)](https://david-dm.org/juliuste/interrail#info=devDependencies)
[![license](https://img.shields.io/github/license/juliuste/interrail.svg?style=flat)](LICENSE)
[![chat on gitter](https://badges.gitter.im/juliuste.svg)](https://gitter.im/juliuste)

## Installation

```sh
npm install interrail
```

## Usage

```js
const interrail = require('interrail')
```

The `interrail` module bundles two methods: `stations()` and `journeys()`. Complies with the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format).

### `stations(query)`

```js
interrail.stations('Berlin').then(…)
```

Find stations by name. Returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/promise) that will resolve in an array of `station`s in the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format) which looks as follows:

```js
[
	{
		type: 'station'
		name: 'BERLIN (Germany)',
		id: 8062648,
		coordinates: {
			longitude: 13.386943,
			latitude: 52.520555
		},
		weight: 32718,
		products: 62
	}
	// …
]

```

### `journeys(originID, destinationID, datetime)`

```js
interrail.journeys(
	8065969, // Berlin
	7942300, // Ljubljana
	new Date("2017-02-09T19:00:00+01:00")
).then(…)
```

Find journeys between A and B for a given datetime. Returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/promise) that will resolve with an array of `journey`s in the [*Friendly Public Transport Format*](https://github.com/public-transport/friendly-public-transport-format) which looks as follows.
*Note that the legs are not fully spec-compatible, as `id` and `schedule` are missing.*

```js
[
	{
		type: 'journey'
		legs: [
			{
				origin: {
					type: 'station',
					name: 'BERLIN HBF (TIEF) (Germany)',
					id: 8031922,
					coordinates: {
						longitude: 13.369441,
						latitude: 52.525553
					}
				},
				destination: {
					type: 'station',
					name: 'BRECLAV (Czech Republic)',
					id: 5433425,
					coordinates: {
						longitude: 16.896943,
						latitude: 48.758057
					}
				},
				departure: '2017-02-09T19:01:00+01:00', // JS Date() object
				arrival: '2017-02-10T03:47:00+01:00', // JS Date() object
				line: 'EN   477', // nice formatting, I know… but thats how the API returns it
				operator: 'DB Vertrieb GmbH'
			}
			// …
		]
	}
	// …
]
```

## Contributing

If you found a bug, want to propose a feature or feel the urge to complain about your life, feel free to visit [the issues page](https://github.com/juliuste/interrail/issues).
