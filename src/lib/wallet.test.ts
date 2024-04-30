import { describe, it, expect } from 'vitest';
import {shortenAOAddress}  from './wallet'
describe('wallet test', () => {
	it('short wallet address should work', () => {
        const address = 'YlcVG3pQYify-uJU3O8LbXlM0nqW98SDfcppY-fNL10'
        expect(shortenAOAddress(address) === 'YlcV...NL10')
	});
});
