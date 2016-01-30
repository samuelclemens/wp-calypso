/**
 * External dependencies
 */
import Chai, { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	requestPostComments
} from '../actions';


describe('actions', () => {
	describe('#receivePost()', () => {
		it('should return a thunk', () => {
			const res = requestPostComments( 78992097, 1012 );

			expect(res).to.be.a.function;
		});
	});
});
