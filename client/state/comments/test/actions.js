/**
 * External dependencies
 */
import nock from 'nock';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Chai, { expect } from 'chai';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import {
	COMMENTS_RECEIVE,
	COMMENTS_COUNT_RECEIVE,
	COMMENTS_REQUEST,
	COMMENTS_REQUEST_SUCCESS,
	COMMENTS_REQUEST_FAILURE,
} from '../../action-types';
import {
	requestPostComments
} from '../actions';
import {
	createCommentTargetId,
	createRequestId
} from '../utils';


Chai.use( sinonChai );

const SITE_ID = 91750058;
const POST_ID = 287;

describe('actions', () => {

	describe('#receivePost()', () => {
		before( () => {
			//nock.load( require.resolve('./fixtures/nock-requests.json') );
			//nock.recorder.rec( {
			//	output_objects: true
			//} );
			//nock( 'https://public-api.wordpress.com:443' ).record();
		} );

		after( () => {
			//var nockCalls = nock.recorder.play();
			//console.log( nockCalls );
		} );

		it('should return a thunk', () => {
			const res = requestPostComments( SITE_ID, POST_ID );

			expect(res).to.be.a.function;
		} );

		it('should not dispatch a thing if the request is already in flight', () => {
			const requestId = createRequestId( SITE_ID, POST_ID, { order: 'DESC', number: 50 } );

			const quiresMap = Immutable.fromJS( { [requestId]: COMMENTS_REQUEST } );

			const dispatchSpy = sinon.spy();
			const getStateSpy = sinon.stub().returns( {
				comments: {
					latestCommentDate: Immutable.Map(),
					queries: quiresMap
				}
			} );

			requestPostComments( SITE_ID, POST_ID )( dispatchSpy, getStateSpy );

			expect( dispatchSpy ).to.not.have.been.called;

		} );


		it('should dispatch correct first request actions', function( done ) {
			this.timeout(3000);
			const dispatchSpy = sinon.spy();
			const getStateSpy = sinon.stub().returns( {
				comments: {
					latestCommentDate: Immutable.Map(),
					queries: Immutable.Map()
				}
			} );

			const reqPromise = requestPostComments( SITE_ID, POST_ID )( dispatchSpy, getStateSpy );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: COMMENTS_REQUEST,
				requestId: createRequestId( SITE_ID, POST_ID, { order: 'DESC', number: 50 } )
			} );

			reqPromise.then( () => {

				expect( dispatchSpy ).to.have.been.calledWith( {
					type: COMMENTS_REQUEST_SUCCESS,
					requestId: createRequestId( SITE_ID, POST_ID, { order: 'DESC', number: 50 } )
				} );

				done();
			}).catch( done );

		} );

		it('should dispatch correct consecutive request actions', function( done ) {
			this.timeout(3000);

			const beforeDateString = "2016-02-03T04:19:26.352Z";
			const dispatchSpy = sinon.spy();
			const getStateSpy = sinon.stub().returns( {
				comments: {
					latestCommentDate: Immutable.fromJS( { [ createCommentTargetId( SITE_ID, POST_ID ) ]: new Date( beforeDateString ) } ),
					queries: Immutable.Map()
				}
			} );

			const reqPromise = requestPostComments( SITE_ID, POST_ID )( dispatchSpy, getStateSpy );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: COMMENTS_REQUEST,
				requestId: createRequestId( SITE_ID, POST_ID, { order: 'DESC', number: 50, before: new Date( beforeDateString ) } )
			} );

			reqPromise.then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( {
					type: COMMENTS_REQUEST_SUCCESS,
					requestId: createRequestId( SITE_ID, POST_ID, { order: 'DESC', number: 50, before: new Date( beforeDateString ) } )
				} );

				done();
			}).catch( done );

		} );

	});
});
