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

const MAX_NUMBER_OF_COMMENTS_PER_FETCH = 50;


function requestId( siteId, postId, query ) {
	return `${siteId}-${postId}-${JSON.stringify(query)}`;
}

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
		console.log('state', state);

		const postKey = siteId + '-' + postId;
		const { comments } = getState();

		const latestCommentForPost = comments.latestCommentDate.get( postKey );

		const query = {
			order: 'DESC',
			number: MAX_NUMBER_OF_COMMENTS_PER_FETCH
		};

		if ( latestCommentForPost && latestCommentForPost.toISOString ) {
			query[ 'after' ] = latestCommentForPost.toISOString();
		}

		const requestId = requestId( siteId, postId, query );

		//TODO: check that status is in-flight or completed successfully, not failed.
		if ( comments.queries.get( requestId ) ) {
			return;
		}

		dispatch({
			type: COMMENTS_REQUEST,
			requestId: requestId
		});

		wpcom.site(siteId)
			.post(postId)
			.comment()
			.replies(query)
			.then( ( { comments } ) => commentsRequestSuccess( dispatch, requestId, siteId, postId, comments ) )
			.catch( (err) => commentsRequestFailure( dispatch, requestId, err ) );
	};
}
