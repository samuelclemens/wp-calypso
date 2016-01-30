/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	COMMENTS_RECEIVE,
	COMMENTS_REQUEST,
	COMMENTS_REQUEST_SUCCESS,
	COMMENTS_REQUEST_FAILURE
} from '../action-types';
import {
	commentTargetId,
	requestId
} from './utils';

const MAX_NUMBER_OF_COMMENTS_PER_FETCH = 50;

function commentsRequestSuccess( dispatch, requestId, siteId, postId, comments ) {
	console.log( 'commentsRequestSuccess', arguments );

	dispatch( {
		type: COMMENTS_REQUEST_SUCCESS,
		requestId: requestId
	} );

	dispatch( {
		type: COMMENTS_RECEIVE,
		siteId: siteId,
		postId: postId,
		comments: comments
	} );

}

function commentsRequestFailure( dispatch, requestId, err ) {
	console.log( 'commentsRequestFailure', arguments );

	dispatch( {
		type: COMMENTS_REQUEST_FAILURE,
		requestId: requestId
	} );

}

export function requestPostComments( siteId, postId ) {
	return ( dispatch, getState ) => {
		const target = commentTargetId( siteId, postId );
		const { comments } = getState();

		const latestCommentForPost = comments.latestCommentDate.get( target );

		const query = {
			order: 'DESC',
			number: MAX_NUMBER_OF_COMMENTS_PER_FETCH
		};

		if ( latestCommentForPost && latestCommentForPost.toISOString ) {
			query[ 'after' ] = latestCommentForPost.toISOString();
		}

		const requestId = requestId( siteId, postId, query );

		// if the request status is in-flight or completed successfully, no need to re-fetch it
		if ( [ COMMENTS_REQUEST, COMMENTS_REQUEST_SUCCESS ].indexOf( comments.queries.get( requestId ) ) !== -1 ) {
			return;
		}

		dispatch( {
			type: COMMENTS_REQUEST,
			requestId: requestId
		} );

		wpcom.site( siteId )
			.post( postId )
			.comment()
			.replies( query )
			.then( ( { comments } ) => commentsRequestSuccess( dispatch, requestId, siteId, postId, comments ) )
			.catch( (err) => commentsRequestFailure( dispatch, requestId, err ) );
	};
}
