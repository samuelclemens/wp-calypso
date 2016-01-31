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
	COMMENTS_REQUEST,
	COMMENTS_REQUEST_SUCCESS,
	COMMENTS_REQUEST_FAILURE
} from '../action-types';
import {
	commentTargetId,
	normalizeDate
} from './utils';

/***
 * Builds a comment tree of the shape
 * {
 * 	root: List<id>, // Array of root level comments
 * 	tree: Map<id, CommentWrapper>
 * }
 * @param oldTree previous tree if existing, can be undefined
 * @param comments array of comments (as returned from wpcom) sorted by date in descending order
 * @returns Immutable map instance of the shape { root: List<id>, tree: Map<id, CommentWrapper> }
 */
function buildCommentsTree( oldTree = Immutable.fromJS( { root: [], tree: {} } ), comments ) {

	const newTree = oldTree.withMutations( ( commentsTree ) => {
		let cTree = commentsTree.get('tree');
		let rootLevel = commentsTree.get('root');

		comments.forEach( ( comment ) => {
			// if the comment has a parent, but we haven't seen that parent yet, create a placeholder
			if ( comment.parent && ! cTree.has( comment.parent.ID ) ) {
				cTree = cTree.set( comment.parent.ID, Immutable.fromJS( {
					children: [],
					parentId: undefined,
					data: undefined
				} ) );
			}

			// Used to track if we're changing node (parent of some node we saw earlier)
			// or adding a new comment node
			let commentNodeChanged = false;

			// if it's the first time we see that comment, create it
			if ( ! cTree.has( comment.ID ) ) {
				cTree = cTree.set( comment.ID, Immutable.fromJS( {
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

				if ( cTree.getIn( parentPropPath ) !== proposedParent ) {
					cTree = cTree.setIn( parentPropPath, proposedParent );
					commentNodeChanged = true;
				}

				if ( cTree.getIn( dataPropPath ) === undefined ) {
					cTree = cTree.setIn( dataPropPath, Immutable.fromJS( comment ) );
					commentNodeChanged = true;
				}
			}

			if ( comment.parent ) {
				const parentChildrenPath = [ comment.parent.ID, 'children' ];
				const parentHasChild = cTree.getIn( parentChildrenPath ).contains( comment.ID );

				// if parent's children list don't already has that comment, insert it
				if ( ! parentHasChild ) {
					cTree = cTree.updateIn( parentChildrenPath, ( children ) => children.unshift( comment.ID ) );
				}
			}

			// We check here for commentNodeChanged in order to not add the comment if we already saw it
			if ( commentNodeChanged && cTree.getIn( [ comment.ID, 'parentId' ] ) === null ) {
				rootLevel = rootLevel.unshift( comment.ID );
			}
		} );

		commentsTree.set( 'tree', cTree ).set( 'root', rootLevel);

	} );

	return newTree;
}


export function items( state = Immutable.Map(), action ) {
	if ( action.type !== COMMENTS_RECEIVE ) {
		return state;
	}

	const commentsTree = state.get( commentTargetId( action.siteId, action.postId ) );
	const newTree = buildCommentsTree( commentsTree, action.comments );

	return state.set( commentTargetId( action.siteId, action.postId ), newTree );
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
		// latest comment will be always first
		const latestReceivedDate = normalizeDate( action.comments[0].date );
		const commentedOnIdentifier = commentTargetId( action.siteId, action.postId );
		const currentLatestDate = state.get( commentedOnIdentifier );

		if ( ! currentLatestDate || currentLatestDate < latestReceivedDate ) {
			return state.set( commentedOnIdentifier, latestReceivedDate );
		}
	}

	return state;
}

export default combineReducers( {
	items,
	queries,
	latestCommentDate
} );
