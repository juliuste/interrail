'use strict'

const { fetch } = require('fetch-ponyfill')()
const { stringify } = require('query-string')

const request = (url, opt) =>
	fetch(`${url}?${stringify(opt)}`, { method: 'get' })
		.then((res) => {
			if (!res.ok) {
				const err = new Error(res.statusText)
				err.statusCode = res.status
				throw err
			}
			return res.json()
		})

const removeEmpty = (array) => {
	const res = []
	for (let el of array) if (el) res.push(el)
	return res
}

module.exports = { request, removeEmpty }
