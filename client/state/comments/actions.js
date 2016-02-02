/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	COMMENTS_RECEIVE,
	COMMENTS_COUNT_RECEIVE,
	COMMENTS_REQUEST,
	COMMENTS_REQUEST_SUCCESS,
	COMMENTS_REQUEST_FAILURE,
} from '../action-types';
import {
	createCommentTargetId,
	createRequestId
} from './utils';

const MAX_NUMBER_OF_COMMENTS_PER_FETCH = 50;

function commentsRequestSuccess( dispatch, requestId, siteId, postId, comments, totalCommentsCount ) {
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

	// if the api have returned comments count, dispatch it
	if ( totalCommentsCount > -1 ) {
		dispatch( {
			type: COMMENTS_COUNT_RECEIVE,
			siteId,
			postId,
			totalCommentsCount
		} );
	} else {
		requestPostCommentsCount( siteId, postId )( dispatch );
	}

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
		const target = createCommentTargetId( siteId, postId );
		const { comments } = getState();

		const latestCommentForPost = comments.latestCommentDate.get( target );

		const query = {
			order: 'DESC',
			number: MAX_NUMBER_OF_COMMENTS_PER_FETCH
		};

		if ( latestCommentForPost && latestCommentForPost.toISOString ) {
			query[ 'after' ] = latestCommentForPost.toISOString();
		}

		const requestId = createRequestId( siteId, postId, query );

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
			.then( ( { comments, found } ) => commentsRequestSuccess( dispatch, requestId, siteId, postId, comments, found ) )
			.catch( (err) => commentsRequestFailure( dispatch, requestId, err ) );
	};
}


export function requestPostCommentsCount( siteId, postId ) {
	return ( dispatch ) => {
		const query = {
			// these are to reduce returned data, since we care only about the found count
			fields: 'ID',
			number: 1
		};

		wpcom.site(siteId)
			.post(postId)
			.replies(query)
			.then( ({ found }) => dispatch( { type: COMMENTS_COUNT_RECEIVE, siteId, postId, totalCommentsCount: found } ))
			.catch( console.error );
	};
}

// hack to get comments count:
// https://public-api.wordpress.com/rest/v1.1/sites/78992097/posts/1012/replies/?http_envelope=1&fields=ID&number=1


