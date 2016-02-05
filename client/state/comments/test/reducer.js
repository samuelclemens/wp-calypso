/**
 * External dependencies
 */
import Chai, { expect } from 'chai';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import {
	items,
	latestCommentDate,
	earliestCommentDate,
	queries
} from '../reducer';
import {
	COMMENTS_RECEIVE,
	COMMENTS_REMOVE_COMMENT,
	COMMENTS_REQUEST,
	COMMENTS_REQUEST_SUCCESS,
	COMMENTS_REQUEST_FAILURE
} from '../../action-types';
import {
	createCommentTargetId,
	createRequestId
} from '../utils';
import {
	actualResponse,
	commentsNestedTree
} from './fixtures/mock-data';

const ADDITIONAL_COMMENTS_TREE_PROPS_COUNT = 3; // totalCommentsCount, children, and fetchedCommentsCount

describe('reducer', () => {
	describe('#items()', () => {
		it('should builds initial valid tree', () => {
			const data = actualResponse;
			const commentsTree = items( undefined, {
				type: COMMENTS_RECEIVE,
				siteId: data.site_ID,
				postId: data.comments[0].post.ID,
				comments: data.comments
			} );

			const commentsTreeId = createCommentTargetId( data.site_ID, data.comments[0].post.ID );
			const commentsTreeForPost = commentsTree.get( commentsTreeId );
			const parent = commentsTreeForPost.get( 764 );
			const firstChildOfParentId = parent.getIn( [ 'children', 0 ] );
			const actualFirstChildOfParent = commentsTreeForPost.get( firstChildOfParentId );

			expect( Immutable.Map.isMap( commentsTreeForPost ) ).to.be.true;
			expect( Immutable.Map.isMap( parent ) ).to.be.true;
			expect( Immutable.List.isList( parent.get( 'children' ) ) ).to.be.true;
			expect( firstChildOfParentId ).to.be.a.number;
			expect( actualFirstChildOfParent.getIn( ['data', 'ID'] ) ).to.be.eql( 765 );

		});

		it( 'should update the comments tree when called sequentialy', () => {
			const comments = commentsNestedTree;

			const commentsTree1 = items( undefined, {
				type: COMMENTS_RECEIVE,
				comments: comments.slice(0, 2),
				siteId: 1,
				postId: 1
			} );

			const commentsTree2 = items( commentsTree1, {
				type: COMMENTS_RECEIVE,
				comments: comments.slice(2),
				siteId: 1,
				postId: 1
			} );

			const commentsTreeForPost = commentsTree2.get( createCommentTargetId( 1, 1 ) );
			const firstChildOfParentId = commentsTreeForPost.getIn( [ 6, 'children', 0 ] );
			const actualFirstChildOfParent = commentsTreeForPost.get( firstChildOfParentId );
			const child = commentsTreeForPost.get( 9 );

			expect( commentsTree2.size ).to.equal( 1 );
			expect( commentsTreeForPost.size ).to.equal( comments.length + ADDITIONAL_COMMENTS_TREE_PROPS_COUNT );
			expect( commentsTreeForPost.get( 'fetchedCommentsCount' ) ).to.equal( comments.length );
			expect( actualFirstChildOfParent.getIn( [ 'data', 'ID' ] ) ).to.be.equal( child.getIn( [ 'data', 'ID' ] ) );
			expect( commentsTree1 ).to.not.be.equal( commentsTree2 );
			expect( actualFirstChildOfParent.getIn( [ 'data', 'ID' ] ) ).to.be.eql( child.getIn( [ 'data', 'ID' ] ) );

		} );

		it( 'should not modify anything when called multiple times with existing data', () => {
			const comments = commentsNestedTree;

			let res1 = items( undefined, {
				type: COMMENTS_RECEIVE,
				comments: comments.slice(2),
				siteId: 1,
				postId: 1
			} );

			let res2 = items( res1, {
				type: COMMENTS_RECEIVE,
				comments: comments.slice(2),
				siteId: 1,
				postId: 1
			} );

			let res3 = items( res2, {
				type: COMMENTS_RECEIVE,
				comments: comments.slice(0, 2),
				siteId: 1,
				postId: 1
			} );

			let res4 = items( res3, {
				type: COMMENTS_RECEIVE,
				comments: comments,
				siteId: 1,
				postId: 1
			} );


			let res5 = items( res4, {
				type: COMMENTS_RECEIVE,
				comments: comments,
				siteId: 1,
				postId: 1
			} );

			const finalResTree = res5;

			const firstChildOfParentId = finalResTree.getIn( [ createCommentTargetId( 1, 1 ), 6, 'children', 0 ] );
			const actualFirstChildOfParent = finalResTree.getIn( [ createCommentTargetId( 1, 1 ), firstChildOfParentId ] );
			const child = finalResTree.getIn( [ createCommentTargetId( 1, 1 ), 9 ] );

			expect( finalResTree.size ).to.equal( 1 );
			expect( finalResTree.get( createCommentTargetId( 1, 1 ) ).size ).to.equal( comments.length + ADDITIONAL_COMMENTS_TREE_PROPS_COUNT );
			expect( finalResTree.getIn( [ createCommentTargetId( 1, 1 ), 'fetchedCommentsCount' ] ) ).to.equal( comments.length );
			expect( finalResTree.getIn( [ createCommentTargetId( 1, 1 ), 6, 'children' ] ).size ).to.equal( 1 );
			expect( firstChildOfParentId ).to.be.equal( child.getIn( [ 'data', 'ID' ] ) );
			expect( actualFirstChildOfParent.getIn( [ 'data', 'ID' ] ) ).to.be.equal( child.getIn( [ 'data', 'ID' ] ) );
			expect( finalResTree ).to.be.equal( res3 );
			expect( actualFirstChildOfParent.getIn( ['data', 'ID' ] ) ).to.be.equal( child.getIn( [ 'data', 'ID' ] ) );

		} );

		it( 'should be ordered by date in root and children lists', () => {
			const comments = commentsNestedTree;
			const postId = 1;
			const siteId = 1;

			let intermediateRes = items( undefined, {
				type: COMMENTS_RECEIVE,
				comments: comments.slice( 0, 2 ),
				siteId,
				postId
			} );

			const finalRes = items( intermediateRes, {
				type: COMMENTS_RECEIVE,
				comments: comments.slice( 2 ),
				siteId,
				postId
			} );

			const tree = finalRes.get( createCommentTargetId( siteId, postId ) );

			// traverse the comments tree recursively and validate all the dates are in correct order
			const validateDates = ( childNodesList ) => {
				const actualDatesList = childNodesList.map( ( commentId ) => new Date( tree.getIn( [ commentId, 'data', 'date' ] ) ) );
				const sortedDatesList = actualDatesList.sort( ( a, b ) => a < b ); // earliest comment first

				const isListsEqual = actualDatesList.equals( sortedDatesList );

				if ( ! isListsEqual ) {
					// hint what are the nodes involved
					console.error( 'Bad child nodes', childNodesList );
				}

				expect( isListsEqual ).to.be.true;

				if ( isListsEqual ) {
					childNodesList.forEach( ( commentId ) => {
						validateDates( tree.getIn( [ commentId, 'children' ] ) );
					} );
				}
			};

			validateDates( tree.get( 'children' ) );

		} );

		it( 'should remove comment', () => {
			const comments = commentsNestedTree;
			const postId = 1;
			const siteId = 1;

			const intermediateRes = items( undefined, {
				type: COMMENTS_RECEIVE,
				comments: comments,
				siteId,
				postId
			} );

			expect( intermediateRes.getIn( [ createCommentTargetId( 1, 1 ), 'fetchedCommentsCount' ] ) ).to.equal( comments.length );
			expect( intermediateRes.getIn( [ createCommentTargetId( 1, 1 ), comments[2].ID ] ) ).to.not.equal( undefined );

			const finalRes = items( intermediateRes, {
				type: COMMENTS_REMOVE_COMMENT,
				commentId: comments[2].ID,
				siteId,
				postId
			} );

			expect( finalRes.getIn( [ createCommentTargetId( 1, 1 ), comments[2].ID ] ) ).to.equal( undefined );
			expect( finalRes.getIn( [ createCommentTargetId( 1, 1 ), 'fetchedCommentsCount' ] ) ).to.equal( comments.length - 1 );

		} )

	} ); // end of items

	describe( '#latestCommentDate()', () => {
		it( 'should track latest date received', () => {
			const comments = commentsNestedTree;

			const state = latestCommentDate( undefined, {
				type: COMMENTS_RECEIVE,
				comments: comments.slice(2),
				siteId: 1,
				postId: 1
			} );

			const finalState = latestCommentDate( state, {
				type: COMMENTS_RECEIVE,
				comments: comments.slice(0, 2),
				siteId: 1,
				postId: 1
			} );

			expect( finalState.get( createCommentTargetId(1, 1) ) ).to.be.eql( new Date( comments[0].date ) );

		} );

		it( 'should track latest date received also in reverse order', () => {
			const comments = commentsNestedTree;

			const state = latestCommentDate( undefined, {
				type: COMMENTS_RECEIVE,
				comments: comments.slice(0, 2),
				siteId: 1,
				postId: 1
			} );

			const finalState = latestCommentDate( state, {
				type: COMMENTS_RECEIVE,
				comments: comments.slice(2),
				siteId: 1,
				postId: 1
			} );

			expect( finalState.get( createCommentTargetId(1, 1) ) ).to.be.eql( new Date( comments[0].date ) );

		} );
	} ); // end of latestCommentDate

	describe( '#earliestCommentDate()', () => {
		it( 'should track earliest date received', () => {
			const comments = commentsNestedTree;

			const state = earliestCommentDate( undefined, {
				type: COMMENTS_RECEIVE,
				comments: comments.slice(2),
				siteId: 1,
				postId: 1
			} );

			const finalState = earliestCommentDate( state, {
				type: COMMENTS_RECEIVE,
				comments: comments.slice(0, 2),
				siteId: 1,
				postId: 1
			} );

			expect( finalState.get( createCommentTargetId(1, 1) ) ).to.be.eql( new Date( comments[ comments.length - 1 ].date ) );

		} );

		it( 'should track earliest date received also in reverse order', () => {
			const comments = commentsNestedTree;

			const state = earliestCommentDate( undefined, {
				type: COMMENTS_RECEIVE,
				comments: comments.slice(0, 2),
				siteId: 1,
				postId: 1
			} );

			const finalState = earliestCommentDate( state, {
				type: COMMENTS_RECEIVE,
				comments: comments.slice(2),
				siteId: 1,
				postId: 1
			} );

			expect( finalState.get( createCommentTargetId(1, 1) ) ).to.be.eql( new Date( comments[ comments.length - 1 ].date ) );

		} );
	} ); // end of earliestCommentDate


	describe('#queries', () => {
		it( 'should set state of query according to the action', ()  => {
			const postId = 1;
			const siteId = 1;
			const requestId = createRequestId( siteId, postId, { after: new Date(), order: 'DESC', number: 10 } );

			let action = {
				type: COMMENTS_REQUEST,
				requestId: requestId
			};

			let res = queries( undefined, action );

			expect( res.get( requestId ) ).to.be.eql( COMMENTS_REQUEST );

			action.type = COMMENTS_REQUEST_FAILURE;
			res = queries( res, action );

			expect( res.get( requestId ) ).to.be.eql( COMMENTS_REQUEST_FAILURE );
		} );
	} ); // end of queries
});
