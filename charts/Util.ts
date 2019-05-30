
import isEqual from 'lodash-es/isEqual'
import map from 'lodash-es/map'
import sortBy from 'lodash-es/sortBy'
import each from 'lodash-es/each'
import keys from 'lodash-es/keys'
import trim from 'lodash-es/trim'
import isNumber from 'lodash-es/isNumber'
import filter from 'lodash-es/filter'
import extend from 'lodash-es/extend'
import isEmpty from 'lodash-es/isEmpty'
import isFinite from 'lodash-es/isFinite'
import some from 'lodash-es/some'
import every from 'lodash-es/every'
import min from 'lodash-es/min'
import max from 'lodash-es/max'
import uniq from 'lodash-es/uniq'
import cloneDeep from 'lodash-es/cloneDeep'
import sum from 'lodash-es/sum'
import find from 'lodash-es/find'
import identity from 'lodash-es/identity'
import union from 'lodash-es/union'
import debounce from 'lodash-es/debounce'
import includes from 'lodash-es/includes'
import toString from 'lodash-es/toString'
import isString from 'lodash-es/isString'
import keyBy from 'lodash-es/keyBy'
import values from 'lodash-es/values'
import flatten from 'lodash-es/flatten'
import groupBy from 'lodash-es/groupBy'
import reverse from 'lodash-es/reverse'
import clone from 'lodash-es/clone'
import reduce from 'lodash-es/reduce'
import noop from 'lodash-es/noop'
import floor from 'lodash-es/floor'
import ceil from 'lodash-es/ceil'
import round from 'lodash-es/round'
import toArray from 'lodash-es/toArray'
import throttle from 'lodash-es/throttle'
import has from 'lodash-es/has'
import intersection from 'lodash-es/intersection'
import uniqWith from 'lodash-es/uniqWith'
import without from 'lodash-es/without'
import uniqBy from 'lodash-es/uniqBy'
import capitalize from 'lodash-es/capitalize'
import sample from 'lodash-es/sample'
import sampleSize from 'lodash-es/sampleSize'
import pick from 'lodash-es/pick'
import omit from 'lodash-es/omit'
import difference from 'lodash-es/difference'
import sortedUniq from 'lodash-es/sortedUniq'
import findIndex from 'lodash-es/findIndex'

export { isEqual, map, sortBy, each, keys, trim, isNumber, filter, extend, isEmpty, isFinite, some, every, min, max, uniq, cloneDeep, sum, find, identity, union, debounce, includes, toString, isString, keyBy, values, flatten, groupBy, reverse, clone, reduce, noop, floor, ceil, round, toArray, throttle, has, intersection, uniqWith, without, uniqBy, capitalize, sample, sampleSize, pick, omit, difference, sortedUniq, findIndex }

import { format } from 'd3-format'
import { extent } from 'd3-array'

import { Vector2 } from './Vector2'

export type SVGElement = any
export type VNode = any

interface TouchListLike {
    [index: number]: {
        clientX: number
        clientY: number
    }
}

export function getAbsoluteMouse(event: { clientX: number, clientY: number }|{ targetTouches: TouchListLike }): Vector2 {
    let clientX, clientY
    if ((event as any).clientX != null) {
        clientX = (event as any).clientX
        clientY = (event as any).clientY
    } else {
        clientX = (event as any).targetTouches[0].clientX
        clientY = (event as any).targetTouches[0].clientY
    }

    return new Vector2(clientX, clientY)
}

export function getRelativeMouse(node: SVGElement, event: { clientX: number, clientY: number }|{ targetTouches: TouchListLike }): Vector2 {
    let clientX, clientY
    if ((event as any).clientX != null) {
        clientX = (event as any).clientX
        clientY = (event as any).clientY
    } else {
        clientX = (event as any).targetTouches[0].clientX
        clientY = (event as any).targetTouches[0].clientY
    }

    const svg = node.ownerSVGElement || node

    if (svg.createSVGPoint) {
        let point = svg.createSVGPoint()
        point.x = clientX, point.y = clientY
        point = point.matrixTransform(node.getScreenCTM().inverse())
        return new Vector2(point.x, point.y)
    }

    const rect = node.getBoundingClientRect()
    return new Vector2(clientX - rect.left - node.clientLeft, clientY - rect.top - node.clientTop)
}

// Make an arbitrary string workable as a css class name
export function makeSafeForCSS(name: string) {
    return name.replace(/[^a-z0-9]/g, s => {
        const c = s.charCodeAt(0)
        if (c === 32) return '-'
        if (c === 95) return '_'
        if (c >= 65 && c <= 90) return s
        return '__' + ('000' + c.toString(16)).slice(-4)
    })
}

// Transform OWID entity name to match map topology
// Since we standardized the map topology, this is just a placeholder
export function entityNameForMap(name: string) {
    return name//return makeSafeForCSS(name.replace(/[ '&:\(\)\/]/g, "_"))
}

export function formatYear(year: number): string {
    if (isNaN(year)) {
        console.warn(`Invalid year '${year}'`)
        return ""
    }

    if (year < 0)
        return `${Math.abs(year)} BCE`
    else
        return year.toString()
}

export function numberOnly(value: any): number | undefined {
    const num = parseFloat(value)
    if (isNaN(num))
        return undefined
    else
        return num
}

// Bind a "mobx component"
// Still working out exactly how this pattern goes
export function component<T extends { [key: string]: any }>(current: T | undefined, klass: { new(): T }, props: Partial<T>): T {
    const instance = current || new klass()
    each(keys(props), (key: string) => {
        instance[key] = props[key]
    })
    return instance
}

export function precisionRound(num: number, precision: number) {
    const factor = Math.pow(10, precision)
    return Math.round(num * factor) / factor
}

export function formatValue(value: number, options: { numDecimalPlaces?: number, unit?: string }): string {
    const noTrailingZeroes = true
    const numDecimalPlaces = defaultTo(options.numDecimalPlaces, 2)
    const unit = defaultTo(options.unit, "")
    const isNoSpaceUnit = unit[0] === "%"

    let output: string = value.toString()

    const absValue = Math.abs(value)
    if (!isNoSpaceUnit && absValue >= 1e6) {
        if (!isFinite(absValue))
            output = "Infinity"
        else if (absValue >= 1e12)
            output = formatValue(value / 1e12, extend({}, options, { unit: "trillion", numDecimalPlaces: 2 }))
        else if (absValue >= 1e9)
            output = formatValue(value / 1e9, extend({}, options, { unit: "billion", numDecimalPlaces: 2 }))
        else if (absValue >= 1e6)
            output = formatValue(value / 1e6, extend({}, options, { unit: "million", numDecimalPlaces: 2 }))
    } else {
        const targetDigits = Math.pow(10, -numDecimalPlaces)

        if (value !== 0 && Math.abs(value) < targetDigits) {
            if (value < 0)
                output = `>-${targetDigits}`
            else
                output = `<${targetDigits}`
        } else {
            const rounded = precisionRound(value, numDecimalPlaces)
            output = format(`,`)(rounded)
        }

        if (noTrailingZeroes) {
            // Convert e.g. 2.200 to 2.2
            const m = output.match(/(.*?[0-9,-]+.[0-9,]*?)0*$/)
            if (m) output = m[1]
            if (output[output.length - 1] === ".")
                output = output.slice(0, output.length - 1)
        }
    }

    if (unit === "$" || unit === "£")
        output = unit + output
    else if (isNoSpaceUnit) {
        output = output + unit
    } else if (unit.length > 0) {
        output = output + " " + unit
    }

    return output
}

export function defaultTo<T, K>(value: T | undefined | null, defaultValue: K): T | K {
    if (value == null) return defaultValue
    else return value
}

export function first<T>(arr: T[]) { return arr[0] }
export function last<T>(arr: T[]) { return arr[arr.length - 1] }

// Calculate the extents of a set of numbers, with safeguards for log scales
export function domainExtent(numValues: number[], scaleType: 'linear' | 'log'): [number, number] {
    const filterValues = scaleType === 'log' ? numValues.filter(v => v > 0) : numValues
    const [minValue, maxValue] = extent(filterValues)

    if (minValue !== undefined && maxValue !== undefined && isFinite(minValue) && isFinite(maxValue)) {
        if (minValue !== maxValue) {
            return [minValue, maxValue]
        } else {
            // Only one value, make up a reasonable default
            return scaleType === 'log' ? [minValue/10, minValue*10] : [minValue-1, maxValue+1]
        }
    } else {
        return scaleType === 'log' ? [1, 100] : [-1, 1]
    }
}

// Take an arbitrary string and turn it into a nice url slug
export function slugify(s: string) {
    s = s.toLowerCase().replace(/\s*\*.+\*/, '').replace(/[^\w- ]+/g, '')
    return trim(s).replace(/ +/g, '-')
}

export function findClosest(numValues: number[], targetValue: number): number | undefined {
    return sortBy(numValues, value => Math.abs(value - targetValue))[0]
}

// Unique number for this execution context
// Useful for coordinating between embeds to avoid conflicts in their ids
let n = 0
export function guid(): number {
    n += 1
    return n
}

// Take an array of points and make it into an SVG path specification string
export function pointsToPath(points: Array<[number, number]>) {
    let path = ""
    for (let i = 0; i < points.length; i++) {
        if (i === 0)
            path += `M${points[i][0]} ${points[i][1]}`
        else
            path += `L${points[i][0]} ${points[i][1]}`
    }
    return path
}

export function defaultWith<T>(value: T|undefined, defaultFunc: () => T): T {
    return value !== undefined ? value : defaultFunc()
}

export function keysOf<T, K extends keyof T>(obj: T): K[] {
    return Object.keys(obj) as K[]
}

// Based on https://stackoverflow.com/a/30245398/1983739
// In case of tie returns higher value
export function sortedFindClosestIndex(array: number[], value: number): number {
    if (array.length === 0)
        return -1

    if (value < array[0])
        return 0

    if (value > array[array.length-1])
        return array.length-1

    let lo = 0
    let hi = array.length - 1

    while (lo <= hi) {
        const mid = Math.round((hi + lo) / 2)

        if (value < array[mid]) {
            hi = mid - 1
        } else if (value > array[mid]) {
            lo = mid + 1
        } else {
            return mid
        }
    }

    // lo == hi + 1
    return (array[lo] - value) < (value - array[hi]) ? lo : hi
}

export function isMobile() {
    return window.navigator.userAgent.toLowerCase().includes("mobi")
}

export function isTouchDevice() {
    return !!('ontouchstart' in window)
}

// General type reperesenting arbitrary json data; basically a non-nullable 'any'
export interface Json {
    [x: string]: any
}

// Escape a function for storage in a csv cell
export function csvEscape(value: any): string {
    const valueStr = toString(value)
    if (includes(valueStr, ","))
        return `"${value.replace(/\"/g, "\"\"")}"`
    else
        return value
}

import * as parseUrl from 'url-parse'

export function urlToSlug(url: string): string {
    const urlobj = parseUrl(url)
    const slug = last(urlobj.pathname.split('/').filter(x => x)) as string
    return slug
}