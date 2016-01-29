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
	postId,
	normalizeDate
} from './utils';

export function tree( comments ) {
	const cTree = {};

	for ( let i = 0; i < comments.length; i++ ) {
		let comment = comments[i];
		let parent  = null;

		if ( comment.parent ) {
			if ( ! cTree[ comment.parent.ID ] ) {
				cTree[ comment.parent.ID ] = {
					children: [],
					parent: undefined,
					data: undefined
				};
			}

			parent = cTree[ comment.parent.ID ];
		}

		if ( ! cTree[ comment.ID ] ) {
			cTree[ comment.ID ] = {
				children: [],
				parent: comment.parent ? comment.parent.ID : null,
				data: comment
			};
		} else {
			cTree[ comment.ID ].parent = comment.parent ? comment.parent.ID : null;
			cTree[ comment.ID ].data = comment;
		}

		if ( parent ) {
			parent.children.unshift( cTree[ comment.ID ] );
		}
	}

	return cTree;
}

export function items( state = Immutable.Map(), action ) {
	if ( action.type !== COMMENTS_RECEIVE ) {
		return state;
	}

	const cTree = state.get( postId( action.siteId, action.postId ) ) || Immutable.OrderedMap();

	const newTree = cTree.withMutations( ( cTree ) => {
		action.comments.forEach( ( comment ) => {
			if ( comment.parent && ! cTree.has( comment.parent.ID ) ) {
				cTree = cTree.set( comment.parent.ID, Immutable.fromJS( {
					children: [],
					parentId: undefined,
					data: undefined
				} ) );
			}

			if ( ! cTree.has( comment.ID ) ) {
				cTree = cTree.set( comment.ID, Immutable.fromJS( {
					children: [],
					parentId: comment.parent ? comment.parent.ID : null,
					data: comment
				} ) );
			} else {
				const proposedParent = comment.parent ? comment.parent.ID : null;
				const parentPropPath = [ comment.ID, 'parentId' ];
				const dataPropPath = [ comment.ID, 'data' ];

				if ( cTree.getIn( parentPropPath ) !== proposedParent ) {
					cTree = cTree.setIn( [ comment.ID, 'parentId' ], proposedParent );
				}

				if ( cTree.getIn( dataPropPath ) === undefined ) {
					cTree = cTree.setIn( dataPropPath, Immutable.fromJS( comment ) );
				}

			}

			if ( comment.parent ) {
				const parentChildrenPath = [ comment.parent.ID, 'children' ];
				const parentHasChild = cTree.getIn( parentChildrenPath ).contains( cTree.get( comment.ID ) );

				// if parent children list don't already has that comment, insert it
				if ( ! parentHasChild ) {
					cTree = cTree.updateIn( parentChildrenPath, ( children ) => children.push( cTree.get( comment.ID ) ) );
				}
			}
		} );
	} );

	return state.set( postId( action.siteId, action.postId ), newTree );
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
		const latestDate = normalizeDate( action.comments[0].date );
		return state.set( postId( action.siteId, action.postId ), latestDate );
	}

	return state;
}

export default combineReducers( {
	items,
	queries,
	latestCommentDate
} );
