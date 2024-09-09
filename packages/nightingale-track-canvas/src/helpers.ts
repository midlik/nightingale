
/** Helper for running potentially time-consuming "refresh" actions (e.g. canvas draw) in a non-blocking way.
 * If the caller calls `requestRefresh()`, this call returns immediately but it is guaranteed
 * that `refresh` will be run asynchronously in the future.
 * If the caller calls `requestRefresh()` multiple times, it is NOT guaranteed
 * that `refresh` will be run the same number of times, only that it will be run
 * at least once after the last call to `requestRefresh()`. */
export interface Refresher {
    requestRefresh: () => void,
}
export function Refresher(refresh: () => any): Refresher {
    let requested = false;
    let running = false;
    function requestRefresh(): void {
        requested = true;
        if (!running) {
            handleRequests(); // do not await
        }
    }
    async function handleRequests(): Promise<void> {
        while (requested) {
            requested = false;
            running = true;
            await sleep(0); // let other things happen (this pushes the rest of the function to the end of the queue)
            try {
                refresh();
            } catch (err) {
                console.error(err);
            }
            running = false;
        }
    }
    return {
        requestRefresh,
    };
}

/** Sleep for `ms` milliseconds. */
function sleep(ms: number): Promise<void> {
    return new Promise<void>(resolve => setTimeout(() => {
        resolve();
    }, ms));
}

// /** Return index of the first element of `sortedArray` which is greater than or equal to `query`.
//  * Return length of `sortedArray` if all elements are less than `query`.
//  * (aka Return the first index where `query` could be inserted while keeping the array sorted.) */
// export function findPredecessorIndex(sortedArray: ArrayLike<number>, query: number) {
//     return binarySearchPredIndex_new(sortedArray, query, 0, sortedArray.length);
// }

// /** Return index of the first element within range [start, end) which is greater than or equal to `query`.
//  * Return `end` if all elements in the range are less than `query`. */
// function binarySearchPredIndex_new(sortedArray: ArrayLike<number>, query: number, start: number, end: number) {
//     if (start === end) return start;
//     // Invariants:
//     // sortedArray[i] < query for each i < start
//     // sortedArray[i] >= query for each i >= end
//     while (end - start > 4) {
//         const mid = (start + end) >> 1;
//         if (sortedArray[mid] >= query) {
//             end = mid;
//         } else {
//             start = mid + 1;
//         }
//     }
//     // Linear search remaining 4 or fewer elements:
//     for (let i = start; i < end; i++) {
//         if (sortedArray[i] >= query) {
//             return i;
//         }
//     }
//     return end;
// }

/** Return index of the first element of `sortedArray` which is greater than or equal to `query`.
 * Return length of `sortedArray` if all elements are less than `query`.
 * (aka Return the first index where `query` could be inserted while keeping the array sorted.) */
export function findPredecessorIndex<T>(sortedArray: ArrayLike<T>, query: number, key: (element: T) => number) {
    return binarySearchPredIndex_new(sortedArray, query, 0, sortedArray.length, key);
}

/** Return index of the first element within range [start, end) for which `key(element) >= query`.
 * Return `end` if for all elements in the range `key(element) < query`. */
function binarySearchPredIndex_new<T>(sortedArray: ArrayLike<T>, query: number, start: number, end: number, key: (element: T) => number) {
    if (start === end) return start;
    // Invariants:
    // key(sortedArray[i]) < query for each i < start
    // key(sortedArray[i]) >= query for each i >= end
    while (end - start > 4) {
        const mid = (start + end) >> 1;
        if (key(sortedArray[mid]) >= query) {
            end = mid;
        } else {
            start = mid + 1;
        }
    }
    // Linear search remaining 4 or fewer elements:
    for (let i = start; i < end; i++) {
        if (key(sortedArray[i]) >= query) {
            return i;
        }
    }
    return end;
}

export function findPredecessorIndex_linearImpl(sortedArray: number[], query: number) {
    const found = sortedArray.findIndex(v => v >= query);
    if (found >= 0) return found;
    else return sortedArray.length;
}

// console.log('binarySearchPredIndexRange', binarySearchPredIndexRange([0, 1, 2, 3, 4, 6, 6, 6, 8, 9, 10, 11, 12], 6, 0, 13))
// console.log('findPredecessorIndex', findPredecessorIndex([0, 1, 2, 3, 4, 6, 6, 6, 8, 9, 10, 11, 12], 6))
// console.log('binarySearchPredIndex_new', binarySearchPredIndex_new([0, 1, 2, 3, 4, 6, 6, 6, 8, 9, 10, 11, 12], 6, 0, 13))

function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min)) + min;
}
// const MAX_N = 1000;
// const MAX_NUMBER = 100;
// console.time('test findPredecessorIndex')
// for (let i = 0; i < 10_000; i++) {
//     const n = randInt(0, MAX_N);
//     const arr = new Array(n).fill(0).map(() => randInt(0, MAX_NUMBER)).sort((a, b) => a - b);
//     const query = randInt(-1, MAX_NUMBER + 1);
//     const found_truth = findPredecessorIndex_linearImpl(arr, query);
//     const found = findPredecessorIndex(arr, query);
//     // console.log('query', query, arr, '->', found_truth, found)
//     // console.log('query', query, `in Array(${arr.length})`, '->', found_truth, found)
//     if (found !== found_truth) throw new Error(`Mismatch: found ${found}, truth ${found_truth}`);
// }
// console.timeEnd('test findPredecessorIndex')


/** Data structure for storing integer intervals (ranges) and efficiently retrieving a subset of ranges which overlap with another interval. */
export class RangeCollection<T> {
    protected readonly items: T[];
    protected readonly start: (item: T) => number;
    protected readonly stop: (item: T) => number;

    protected readonly Q = 2;
    protected readonly binned: T[][]; // bin i contains ranges with length >= Q**i but < Q**(i+1)

    /** Create a new collection of ranges. `start` must return range start (inclusive), `stop` must return range end (exclusive) */
    constructor(items: T[], accessors: { start: (item: T) => number, stop: (item: T) => number }) {
        this.items = items;
        const { start, stop } = accessors;
        this.start = start;
        this.stop = stop;

        this.binned = [];
        for (const item of items) {
            const length = stop(item) - start(item);
            let iBin = 0;
            while (this.Q ** iBin < length) iBin++;
            (this.binned[iBin] ??= []).push(item);
        }
        for (let iBin = 0; iBin < this.binned.length; iBin++) {
            (this.binned[iBin] ??= []).sort((a, b) => start(a) - start(b));
        }
    }
    size(): number {
        return this.items.length;
    }
    /** Get all items that overlap by at least one position with interval [start, stop).
     * Does not guarantee original order of the ranges. */
    getOverlappingItems(start: number, stop: number): T[] {
        const out: T[] = [];
        for (let iBin = 0; iBin < this.binned.length; iBin++) {
            const maxLength = this.Q ** iBin;
            const bin = this.binned[iBin];
            const from = findPredecessorIndex(bin, start - maxLength + 1, this.start);
            const to = findPredecessorIndex(bin, stop, this.start);
            for (let i = from; i < to; i++) {
                const item = bin[i];
                if (this.stop(item) > start) {
                    out.push(item);
                }
            }
        }
        return out;
    }
    getOverlappingItems_reference(start: number, stop: number): T[] {
        return this.items.filter(item => this.start(item) < stop && this.stop(item) > start);
    }
    print() {
        for (let iBin = 0; iBin < this.binned.length; iBin++) {
            console.log(`Bin ${iBin} length<=${this.Q ** iBin}:`, this.binned[iBin].join('  '))
        }
    }
    private static sortRanges(collection: [number, number][]) {
        return collection.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
    }
    static equal(collectionA: [number, number][], collectionB: [number, number][]) {
        const a = this.sortRanges(Array.from(collectionA));
        const b = this.sortRanges(Array.from(collectionB));
        // const a = collectionA;
        // const b = collectionB;
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i][0] !== b[i][0]) return false;
            if (a[i][1] !== b[i][1]) return false;
        }
        return true;
    }
}

type Range = [start: number, stop: number]
function Range(start: number, stop: number): Range {
    return [start, stop].sort((a, b) => a - b) as Range;
}
function randomRange(minStart: number, maxStop: number): Range {
    return Range(randInt(minStart, maxStop + 1), randInt(minStart, maxStop + 1));
}

const ranges = [[1, 2], [3, 4], [5, 6], [0, 5], [1, 6], [1, 17], [1, 18],] as [number, number][];
console.log('Ranges:', ranges.join('  '))
const collection = new RangeCollection(ranges, { start: r => r[0], stop: r => r[1] });

console.log('Found:', collection.getOverlappingItems(17, 100).join('  '));

collection.print();

const n = 10_000;
const arr = new Array(n).fill(0).map(() => randomRange(0, 1000));
const col = new RangeCollection(arr, { start: r => r[0], stop: r => r[1] });
col.print();


// const MAX_N = 10_000;
// const RANGE = [0, 100] as const;
// console.time('test getOverlappingItems')
// for (let i = 0; i < 1000; i++) {
//     const n = MAX_N;
//     const arr = new Array(n).fill(0).map(() => randomRange(...RANGE));
//     const collection = new RangeCollection(arr, { start: r => r[0], stop: r => r[1] });
//     const queryRange = randomRange(...RANGE);
//     const result_truth = collection.getOverlappingItems_reference(...queryRange);
//     const result = collection.getOverlappingItems(...queryRange);
//     const equal = RangeCollection.equal(result_truth, result);
//     console.log('Ranges:', arr.length, `Query range: ${queryRange}`, 'Truth:', result_truth.length, 'Found:', result.length)
//     if (!equal) throw new Error(`Mismatch: found ${result}, truth ${result_truth}`);
// }
// console.timeEnd('test getOverlappingItems')
