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
	COMMENTS_REMOVE_COMMENT,
	COMMENTS_COUNT_RECEIVE,
	COMMENTS_REQUEST,
	COMMENTS_REQUEST_SUCCESS,
	COMMENTS_REQUEST_FAILURE,
} from '../../action-types';
import {
	requestPostComments,
	writeComment,
	fetchAllCommentIds
} from '../actions';
import {
	createCommentTargetId,
	createRequestId
} from '../utils';


Chai.use( sinonChai );

const SITE_ID = 91750058;
const POST_ID = 287;
//const SITE_ID = 106350587;
//const POST_ID = 2;
const NOCK_JSON_PATH = require.resolve('./fixtures/nock-requests.json');

describe('actions', () => {

	before( () => {
		nock.load( NOCK_JSON_PATH );
	} );

	describe('#receivePost()', () => {
		before( () => {
			//nock.load( NOCK_JSON_PATH );
			//nock.recorder.rec( {
			//	output_objects: true
			//} );
			//nock( 'https://public-api.wordpress.com:443' ).record();
		} );

		after( () => {
			//nock.restore();
			//var nockCalls = nock.recorder.play();
			//console.log( JSON.stringify( nockCalls ) );
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
					earliestCommentDate: Immutable.Map(),
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
					earliestCommentDate: Immutable.Map(),
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
					earliestCommentDate: Immutable.fromJS( { [ createCommentTargetId( SITE_ID, POST_ID ) ]: new Date( beforeDateString ) } ),
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

	}); // requestPostComments


	describe( '#fetchAllCommentIds()', () => {
		before( () => {
			//nock.recorder.rec( {
			//	output_objects: true
			//} );
			//nock( 'https://public-api.wordpress.com:443' ).record();
		} );

		after( () => {
			//var nockCalls = nock.recorder.play();
			//require('fs').writeFileSync( '/home/yury/1.txt', JSON.stringify( nockCalls ) );
			//nock.restore();
		} );

		it( 'should fetch batched comments when exceeds MAX_NUMBER_OF_COMMENTS_IN_FETCH_RESULT', function ( done ) {
			this.timeout( 3000 );

			fetchAllCommentIds( SITE_ID, POST_ID ).then( (res) => {
				expect( res.length ).to.equal( 122 );
				done();
			} ).catch( done );
		} )
	}); // fetchAllCommentIds


	describe( '#writeComment()', () => {
		before( () => {
			nock('https://public-api.wordpress.com:443')
				.post('/rest/v1.1/sites/' + SITE_ID + '/posts/' + POST_ID + '/replies/new', {"content":"Hello, yes, this is dog"})
				.reply(200,
				{
					"ID":13,
					"post":{
						"ID": POST_ID,
						"title":"My awesome post!",
						"type":"post",
						"link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/" + SITE_ID + "\/posts\/" + POST_ID
					},
					"author":{"ID":1234,"login":"tester","email":false,"name":"Testie Test","first_name":"Testie","last_name":"Test","nice_name":"test","site_ID":1234},
					"date":"2016-02-05T11:17:03+00:00",
					"content":"<p>Hello, yes, this is dog<\/p>\n",
					"status":"approved",
					"parent":false,
					"type":"comment"
				},
				{
					server: 'nginx',
					date: 'Fri, 05 Feb 2016 11:14:28 GMT',
					'content-type': 'application/json',
					connection: 'close',
					vary: 'Accept-Encoding',
					'x-prefork': '1',
					'x-hacker': 'Oh, Awesome: Opossum',
					expires: 'Wed, 11 Jan 1984 05:00:00 GMT',
					'cache-control': 'no-cache, must-revalidate, max-age=0',
					pragma: 'no-cache',
					'x-ac': '2.ams _dfw',
					'strict-transport-security': 'max-age=15552000'
				});
		} );

		it( 'should dispatch correct actions', function( done ) {
			const dispatchSpy = sinon.spy();
			const writeCommentThunk = writeComment('Hello, yes, this is dog', SITE_ID, POST_ID);
			const estimatedPlaceholderCommentId = 'placeholder-1';

			const reqPromise = writeCommentThunk( dispatchSpy );

			const firstSpyCallArg = dispatchSpy.args[0][0];

			expect(firstSpyCallArg.type).to.eql(COMMENTS_RECEIVE);
			expect(firstSpyCallArg.comments[0].ID).to.eql(estimatedPlaceholderCommentId);

			reqPromise.then((comment) => {

				expect( comment ).to.be.object;
				expect( comment ).to.not.equal( undefined );
				expect( comment ).to.not.equal( null );

				const secondSpyCallArg = dispatchSpy.args[1][0];
				const thirdSpyCallArg = dispatchSpy.args[2][0];

				expect(secondSpyCallArg.type).to.eql(COMMENTS_REMOVE_COMMENT);
				expect(secondSpyCallArg.commentId).to.eql(estimatedPlaceholderCommentId);

				expect(thirdSpyCallArg.type).to.eql(COMMENTS_RECEIVE);
				expect(thirdSpyCallArg.comments.length).to.eql(1);
				expect(thirdSpyCallArg.comments[0].ID).to.be.a.number;

				done();
			} ).catch( done );
		} );

	} ); // writeComment

	after( () => {
		nock.restore();
	} );
});
