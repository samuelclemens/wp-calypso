/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import {
	COMMENTS_RECEIVE,
	COMMENTS_COUNT_RECEIVE,
	COMMENTS_REQUEST,
	COMMENTS_REQUEST_SUCCESS,
	COMMENTS_REQUEST_FAILURE
} from '../action-types';
import {
	createCommentTargetId
} from './utils';

/***
 * Builds a comment tree of the shape
 * Map<id, CommentNode> {
 * 	children: List<id>, // Array of root level comments ids
 * }
 * @param oldTree previous tree if existing, can be undefined
 * @param comments array of comments (as returned from wpcom) sorted by date in descending order
 * @returns Immutable map instance of the shape { root: List<id>, tree: Map<id, CommentNode> }
 */
function buildCommentsTree( oldTree = Immutable.fromJS( { children: [], totalCommentsCount: undefined, fetchedCommentsCount: 0 } ), comments ) {

	const newTree = oldTree.withMutations( ( commentsTree ) => {

		comments.forEach( ( comment ) => {
			// if the comment has a parent, but we haven't seen that parent yet, create a placeholder
			if ( comment.parent && ! commentsTree.has( comment.parent.ID ) ) {
				commentsTree = commentsTree.set( comment.parent.ID, Immutable.fromJS( {
					children: [],
					parentId: undefined,
					data: undefined
				} ) );
			}

			// Used to track if we're changing node (parent of some node we saw earlier)
			// or adding a new comment node
			let commentNodeChanged = false;

			// if it's the first time we see that comment, create it
			if ( ! commentsTree.has( comment.ID ) ) {
				commentsTree = commentsTree.set( comment.ID, Immutable.fromJS( {
					children: [],
					parentId: comment.parent ? comment.parent.ID : null,
					data: comment
				} ) );

				commentNodeChanged = true;
			} else {
				// we already saw that comment, so it means it's parent of some other comment, so it already has children
				// array, so we need only update the parentId and the data
				const proposedParent = comment.parent ? comment.parent.ID : null;
				const parentPropPath = [ comment.ID, 'parentId' ];
				const dataPropPath = [ comment.ID, 'data' ];

				if ( commentsTree.getIn( parentPropPath ) !== proposedParent ) {
					commentsTree = commentsTree.setIn( parentPropPath, proposedParent );
					commentNodeChanged = true;
				}

				if ( commentsTree.getIn( dataPropPath ) === undefined ) {
					commentsTree = commentsTree.setIn( dataPropPath, Immutable.fromJS( comment ) );
					commentNodeChanged = true;
				}
			}

			if ( comment.parent ) {
				const parentChildrenPath = [ comment.parent.ID, 'children' ];
				const parentHasChild = commentsTree.getIn( parentChildrenPath ).contains( comment.ID );

				// if parent's children list don't already has that comment, insert it
				if ( ! parentHasChild ) {
					commentsTree = commentsTree.updateIn( parentChildrenPath, ( children ) => children.unshift( comment.ID ) );
				}
			}

			// We check here for commentNodeChanged in order to not add the comment if we already saw it
			if ( commentNodeChanged ) {
				commentsTree.update( 'fetchedCommentsCount', ( fetchedCommentsCount ) => fetchedCommentsCount + 1 );

				if ( commentsTree.getIn( [ comment.ID, 'parentId' ] ) === null ) {
					commentsTree.update( 'children', ( children ) => children.unshift( comment.ID ) );
				}
			}
		} );

	} );

	return newTree;
}


export function items( state = Immutable.Map(), action ) {
	switch ( action.type ) {
		case COMMENTS_RECEIVE:
			const commentsTree = state.get( createCommentTargetId( action.siteId, action.postId ) );
			const newTree = buildCommentsTree( commentsTree, action.comments );

			return state.set( createCommentTargetId( action.siteId, action.postId ), newTree );

			break;
		case COMMENTS_COUNT_RECEIVE:
			return state.setIn( [ createCommentTargetId( action.siteId, action.postId ), 'totalCommentsCount' ], action.totalCommentsCount );
			break;

		//TODO: Add here handler for POSTS_RECEIVE

	}

	return state;
}

export function queries( state = Immutable.Map(), action ) {
	switch ( action.type ) {
		case COMMENTS_REQUEST:
		case COMMENTS_REQUEST_SUCCESS:
		case COMMENTS_REQUEST_FAILURE:
			return state.set( action.requestId, action.type );
	}

	return state;
}

export function latestCommentDate( state = Immutable.Map(), action ) {
	if ( action.type === COMMENTS_RECEIVE && action.comments.length > 0 ) {
		// because we always assume comments come in descending order,
		// latest comment, the most recent one (by date) will be always first
		const latestReceivedDate = new Date( action.comments[0].date );
		const commentedOnIdentifier = createCommentTargetId( action.siteId, action.postId );
		const currentLatestDate = state.get( commentedOnIdentifier );

		if ( ! currentLatestDate || currentLatestDate < latestReceivedDate ) {
			return state.set( commentedOnIdentifier, latestReceivedDate );
		}
	}

	return state;
}

export function earliestCommentDate( state = Immutable.Map(), action ) {
	if ( action.type === COMMENTS_RECEIVE && action.comments.length > 0 ) {
		// because we always assume comments come in descending order,
		// earliest comment (by date), the oldest by date, will be always last
		const earliestReceivedDate = new Date( action.comments[ action.comments.length - 1 ].date );
		const commentedOnIdentifier = createCommentTargetId( action.siteId, action.postId );
		const currentEarliestDate = state.get( commentedOnIdentifier );

		if ( ! currentEarliestDate || currentEarliestDate > earliestReceivedDate ) {
			return state.set( commentedOnIdentifier, earliestReceivedDate );
		}
	}

	return state;
}

export default combineReducers( {
	items,
	queries,
	latestCommentDate,
	earliestCommentDate
} );
