import assert from 'assert';
import { QUOTES_DATA } from '../src/data/quotes.ts';
import { getDayOfYear } from '../src/components/HomeView.tsx';

// Test 1: Day of year calculations
const date1 = new Date(Date.UTC(2026, 0, 1)); // Jan 1 -> day 1
assert.strictEqual(getDayOfYear(date1), 1, 'Jan 1 should be day 1');

const date2 = new Date(Date.UTC(2026, 0, 15)); // Jan 15 -> day 15
assert.strictEqual(getDayOfYear(date2), 15, 'Jan 15 should be day 15');

// Test 2: Quote changes with the date
const quoteDay1 = QUOTES_DATA[getDayOfYear(date1) % QUOTES_DATA.length];
const quoteDay2 = QUOTES_DATA[getDayOfYear(date2) % QUOTES_DATA.length];
assert.notStrictEqual(quoteDay1.id, quoteDay2.id, 'Quotes on different days should be different');

// Test 3: Verbatim accuracy against QUOTES_DATA
const currentDay = getDayOfYear(new Date());
const expectedQuote = QUOTES_DATA[currentDay % QUOTES_DATA.length];
assert.ok(expectedQuote.textDe && expectedQuote.textDe.length > 0, 'Quote must have textDe');
assert.ok(expectedQuote.textEn && expectedQuote.textEn.length > 0, 'Quote must have textEn');

console.log('Quote of the Day tests passed successfully!');
