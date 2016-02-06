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
	fetchAllCommentIds,
	pollComments
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
	let nockScopes;

	before( () => {
		nockScopes = nock.load( NOCK_JSON_PATH );
		nockScopes.forEach( nockScope => nockScope.persist() );
		//nock.recorder.rec( {
		//	output_objects: true
		//} );
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
			this.timeout( 5000 );
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
			this.timeout( 5000 );

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

	describe( '#pollComments()', () => {

		let earliestDate = new Date();
		let latestDate = new Date('1970-02-06T12:10:48.549Z');
		let latestDateCommentID = -1;
		let commentsTree;

		before( () =>  {
			const data = {"700":{"children":[739]},"701":{"children":[740]},"704":{"children":[741]},"705":{"children":[742]},"706":{"children":[743]},"707":{"children":[744]},"708":{"children":[745]},"709":{"children":[746]},"710":{"children":[747]},"711":{"children":[748]},"712":{"children":[749]},"714":{"children":[753]},"718":{"children":[755]},"728":{"children":[751]},"735":{"children":[754]},"739":{"children":[],"parentId":700,"data":{"date":"2016-01-26T13:07:04+00:00"}},"740":{"children":[756],"parentId":701,"data":{"date":"2016-01-26T13:07:47+00:00"}},"741":{"children":[],"parentId":704,"data":{"date":"2016-01-26T13:08:31+00:00"}},"742":{"children":[],"parentId":705,"data":{"date":"2016-01-26T13:08:40+00:00"}},"743":{"children":[],"parentId":706,"data":{"date":"2016-01-26T13:09:03+00:00"}},"744":{"children":[],"parentId":707,"data":{"date":"2016-01-26T13:09:59+00:00"}},"745":{"children":[],"parentId":708,"data":{"date":"2016-01-26T13:10:38+00:00"}},"746":{"children":[],"parentId":709,"data":{"date":"2016-01-26T13:11:21+00:00"}},"747":{"children":[],"parentId":710,"data":{"date":"2016-01-26T13:12:14+00:00"}},"748":{"children":[],"parentId":711,"data":{"date":"2016-01-26T13:14:44+00:00"}},"749":{"children":[750],"parentId":712,"data":{"date":"2016-01-26T13:15:54+00:00"}},"750":{"children":[],"parentId":749,"data":{"date":"2016-01-26T13:28:05+00:00"}},"751":{"children":[],"parentId":728,"data":{"date":"2016-01-26T14:40:55+00:00"}},"752":{"children":[],"parentId":null,"data":{"date":"2016-01-26T18:11:19+00:00"}},"753":{"children":[],"parentId":714,"data":{"date":"2016-01-26T19:44:38+00:00"}},"754":{"children":[],"parentId":735,"data":{"date":"2016-01-26T19:46:54+00:00"}},"755":{"children":[],"parentId":718,"data":{"date":"2016-01-26T21:21:20+00:00"}},"756":{"children":[],"parentId":740,"data":{"date":"2016-01-27T01:01:44+00:00"}},"757":{"children":[759],"parentId":null,"data":{"date":"2016-01-27T02:06:24+00:00"}},"759":{"children":[],"parentId":757,"data":{"date":"2016-01-27T09:09:37+00:00"}},"760":{"children":[769],"parentId":null,"data":{"date":"2016-01-27T11:25:21+00:00"}},"761":{"children":[770],"parentId":null,"data":{"date":"2016-01-27T14:56:47+00:00"}},"762":{"children":[771],"parentId":null,"data":{"date":"2016-01-27T15:47:46+00:00"}},"763":{"children":[772],"parentId":null,"data":{"date":"2016-01-27T21:47:52+00:00"}},"764":{"children":[773],"parentId":null,"data":{"date":"2016-01-27T22:18:44+00:00"}},"765":{"children":[774],"parentId":null,"data":{"date":"2016-01-28T00:04:06+00:00"}},"766":{"children":[],"parentId":null,"data":{"date":"2016-01-28T05:48:13+00:00"}},"768":{"children":[775],"parentId":null,"data":{"date":"2016-01-29T02:14:32+00:00"}},"769":{"children":[778],"parentId":760,"data":{"date":"2016-01-29T11:06:29+00:00"}},"770":{"children":[],"parentId":761,"data":{"date":"2016-01-29T11:09:00+00:00"}},"771":{"children":[],"parentId":762,"data":{"date":"2016-01-29T11:10:01+00:00"}},"772":{"children":[],"parentId":763,"data":{"date":"2016-01-29T11:10:23+00:00"}},"773":{"children":[],"parentId":764,"data":{"date":"2016-01-29T11:10:38+00:00"}},"774":{"children":[],"parentId":765,"data":{"date":"2016-01-29T11:11:38+00:00"}},"775":{"children":[],"parentId":768,"data":{"date":"2016-01-29T11:12:16+00:00"}},"776":{"children":[],"parentId":null,"data":{"date":"2016-01-29T12:40:19+00:00"}},"777":{"children":[781],"parentId":null,"data":{"date":"2016-01-29T16:58:22+00:00"}},"778":{"children":[],"parentId":769,"data":{"date":"2016-01-29T19:26:31+00:00"}},"781":{"children":[],"parentId":777,"data":{"date":"2016-01-30T21:32:54+00:00"}},"782":{"children":[788],"parentId":null,"data":{"date":"2016-01-31T05:34:55+00:00"}},"783":{"children":[787],"parentId":null,"data":{"date":"2016-01-31T09:29:48+00:00"}},"785":{"children":[790],"parentId":null,"data":{"date":"2016-01-31T15:09:30+00:00"}},"786":{"children":[],"parentId":null,"data":{"date":"2016-01-31T16:10:30+00:00"}},"787":{"children":[],"parentId":783,"data":{"date":"2016-02-01T17:57:47+00:00"}},"788":{"children":[],"parentId":782,"data":{"date":"2016-02-01T17:58:04+00:00"}},"790":{"children":[],"parentId":785,"data":{"date":"2016-02-01T17:59:14+00:00"}},"791":{"children":[792],"parentId":null,"data":{"date":"2016-02-02T20:10:54+00:00"}},"792":{"children":[],"parentId":791,"data":{"date":"2016-02-03T10:16:35+00:00"}},"793":{"children":[794],"parentId":null,"data":{"date":"2016-02-04T01:07:58+00:00"}},"794":{"children":[],"parentId":793,"data":{"date":"2016-02-05T11:15:36+00:00"}}};
			commentsTree = Immutable.Map();

			Object.keys( data ).forEach( (key) => {
				if ( data[ key ].data ) {
					const currDate = new Date(data[ key ].data.date);
					earliestDate = ( earliestDate > currDate ? currDate : earliestDate );
					latestDate = ( latestDate < currDate ? currDate : latestDate );

					if ( latestDate === currDate ) {
						latestDateCommentID = parseInt( key, 10 );
					}
				}

				commentsTree = commentsTree.set( parseInt( key, 10 ), Immutable.fromJS( data[ key ] ) );
			} );
		} );

		it( 'should not change comments tree when there are no changes available', function (done) {
			this.timeout( 5000 );

			const dispatchSpy = sinon.spy();

			const getStateStub = sinon.stub().returns( {
				comments: {
					earliestCommentDate: Immutable.fromJS( { [ createCommentTargetId( SITE_ID, POST_ID ) ]: earliestDate } ),
					items: Immutable.Map().set( createCommentTargetId( SITE_ID, POST_ID ), commentsTree )
				}
			} );

			pollComments( SITE_ID, POST_ID )( dispatchSpy, getStateStub ).then( () => {
				expect( dispatchSpy ).to.not.have.been.called;
				done();
			} ).catch( done );
		} );

		it( 'should fetch new comment if it available', function (done) {
			this.timeout( 5000 );
			const dispatchSpy = sinon.spy();

			const getStateStub = sinon.stub().returns( {
				comments: {
					earliestCommentDate: Immutable.fromJS( { [ createCommentTargetId( SITE_ID, POST_ID ) ]: earliestDate } ),
					items: Immutable.Map().set( createCommentTargetId( SITE_ID, POST_ID ), commentsTree.delete( latestDateCommentID ) )
				}
			} );

			pollComments( SITE_ID, POST_ID )( dispatchSpy, getStateStub ).then( () => {
				expect( dispatchSpy ).to.have.been.called;

				const action = dispatchSpy.args[0][0];

				expect( action.type ).to.equal( COMMENTS_RECEIVE );
				expect( action.comments.length ).to.equal( 1 );
				expect( action.comments[0].ID ).to.equal( latestDateCommentID );
				expect( action.siteId ).to.equal( SITE_ID );
				expect( action.postId ).to.equal( POST_ID );

				done();
			} ).catch( done );
		} );

		it( 'should remove comment if it no longer on the server', function (done) {
			this.timeout( 5000 );

			const dispatchSpy = sinon.spy();
			const removeCommentId = 123;

			let treeWithExtraComment = commentsTree.set( removeCommentId, Immutable.fromJS({ 'children': [], data: {date: new Date() }}) );

			const getStateStub = sinon.stub().returns( {
				comments: {
					earliestCommentDate: Immutable.fromJS( { [ createCommentTargetId( SITE_ID, POST_ID ) ]: earliestDate } ),
					items: Immutable.Map().set( createCommentTargetId( SITE_ID, POST_ID ), treeWithExtraComment )
				}
			} );

			pollComments( SITE_ID, POST_ID )( dispatchSpy, getStateStub ).then( () => {
				expect( dispatchSpy ).to.have.been.called;

				const action = dispatchSpy.args[0][0];

				expect( action.type ).to.equal( COMMENTS_REMOVE_COMMENT );
				expect( action.commentId ).to.equal( removeCommentId );
				expect( action.siteId ).to.equal( SITE_ID );
				expect( action.postId ).to.equal( POST_ID );

				done();
			} ).catch( done );
		} );

	} );

	after( () => {
		nock.restore();
		//var nockCalls = nock.recorder.play();
		//require('fs').writeFileSync( '/home/yury/3.json', JSON.stringify( nockCalls ) );
	} );
});
