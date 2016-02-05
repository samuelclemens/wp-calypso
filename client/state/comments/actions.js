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
	COMMENTS_REMOVE_COMMENT,
	COMMENTS_ERROR_COMMENT
} from '../action-types';
import {
	createCommentTargetId,
	createRequestId,
	createUrlFromTemplate
} from './utils';

const MAX_NUMBER_OF_COMMENTS_PER_FETCH = 50;
const MAX_NUMBER_OF_COMMENTS_IN_FETCH_RESULT = 100; /* https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/posts/%24post_ID/replies/ */

function commentsRequestSuccess( dispatch, requestId, siteId, postId, comments, totalCommentsCount ) {
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
	dispatch( {
		type: COMMENTS_REQUEST_FAILURE,
		requestId: requestId,
		error: err
	} );
}

export function requestPostComments( siteId, postId ) {
	return ( dispatch, getState ) => {
		const commentTargetId = createCommentTargetId( siteId, postId );
		const currentComments = getState().comments;

		const earliestCommentDateForPost = currentComments.earliestCommentDate.get( commentTargetId );

		const query = {
			order: 'DESC',
			number: MAX_NUMBER_OF_COMMENTS_PER_FETCH
		};

		if ( earliestCommentDateForPost && earliestCommentDateForPost.toISOString ) {
			query.before = earliestCommentDateForPost.toISOString();
		}

		const requestId = createRequestId( siteId, postId, query );

		// if the request status is in-flight or completed successfully, no need to re-fetch it
		if ( [ COMMENTS_REQUEST, COMMENTS_REQUEST_SUCCESS ].indexOf( currentComments.queries.get( requestId ) ) !== -1 ) {
			return;
		}

		dispatch( {
			type: COMMENTS_REQUEST,
			requestId: requestId
		} );

		// promise returned here is mainly for testing purposes
		return wpcom.site( siteId )
					.post( postId )
					.comment()
					.replies( query )
					.then( ( { comments, found } ) => commentsRequestSuccess( dispatch, requestId, siteId, postId, comments, found ) )
					.catch( ( err ) => commentsRequestFailure( dispatch, requestId, err ) );
	};
}

let placeHolderCounter = 0;
function createPlaceholderComment( commentText, postId, parentCommentId ) {
	return {
		ID: 'placeholder-' + ( ++placeHolderCounter ),
		parent: parentCommentId ? { ID: parentCommentId } : false,
		date: ( new Date() ).toISOString(),
		content: commentText,
		status: 'approved',
		type: 'comment',
		post: {
			ID: postId
		},
		isPlaceholder: true
	};
}

//TODO: WIP
export function writeComment( commentText, siteId, postId, parentCommentId ) {
	if ( ! commentText || ! siteId || ! postId ) {
		return;
	}

	return ( dispatch ) => {
		const placeholderComment = createPlaceholderComment( commentText, postId, parentCommentId );

		// Insert a placeholder
		dispatch( {
			type: COMMENTS_RECEIVE,
			siteId,
			postId,
			comments: [ placeholderComment ]
		} );

		let apiPromise;

		if ( parentCommentId ) {
			apiPromise = wpcom.site( siteId ).post( postId ).comment( parentCommentId ).reply( commentText );
		} else {
			apiPromise = wpcom.site( siteId ).post( postId ).comment().add( commentText );
		}

		return apiPromise.then( ( comment ) => {
			// remove the placeholder
			dispatch( {
				type: COMMENTS_REMOVE_COMMENT,
				siteId,
				postId,
				commentId: placeholderComment.ID
			} );

			// insert the real comment
			dispatch( {
				type: COMMENTS_RECEIVE,
				siteId,
				postId,
				comments: [ comment ]
			} );

			return comment;
		} )
		.catch( ( error ) => {
			dispatch( {
				type: COMMENTS_ERROR_COMMENT,
				siteId,
				postId,
				commentId: placeholderComment.ID,
				error
			} );

			throw error;
		} );
	};
}

//TODO: WIP
export function fetchAllCommentIds( siteId, postId ) {
	// Default order is DESC
	// https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/posts/%24post_ID/replies/
	const query = {
		fields: 'ID',
		number: MAX_NUMBER_OF_COMMENTS_IN_FETCH_RESULT
	};

	return wpcom.site( siteId )
		.post( postId )
		.comment()
		.replies( query )
		.then( ( { found, comments } ) => {
			const commentIds = comments.map( ( comment ) => comment.ID );

			if ( found > MAX_NUMBER_OF_COMMENTS_IN_FETCH_RESULT ) {
				const batch = wpcom.batch();
				const batchUrls = [];

				for ( let i = MAX_NUMBER_OF_COMMENTS_IN_FETCH_RESULT; i < found; i += MAX_NUMBER_OF_COMMENTS_IN_FETCH_RESULT ) {
					batchUrls.push( createUrlFromTemplate( '/sites/$site/posts/$post_ID/replies/', { site: siteId, post_ID: postId }, Object.assign( {}, query, { offset: i } ) ) );
				}

				batchUrls.forEach( batch.add.bind( batch ) );

				return batch.run().then( ( batchResultForUrls ) => {
					let arrayOfCommentIdsArrays = batchUrls.map( ( batchUrl ) => batchResultForUrls[ batchUrl ].comments )
															.map( ( arrayOfComments ) => arrayOfComments.map( ( comment ) => comment.ID ) );

					return Array.prototype.concat.apply( commentIds, arrayOfCommentIdsArrays );
				} );
			}

			return commentIds;
		} );
}

//TODO: WIP
export function pollComments( siteId, postId ) {

}

//TODO: WIP, maybe will be removed
export function requestPostCommentsCount( siteId, postId ) {
	return ( dispatch ) => {
		const query = {
			// these are to reduce returned data, since we care only about the found count
			fields: 'ID',
			number: 1
		};

		// promise returned here is mainly for testing purposes
		return wpcom.site( siteId )
					.post( postId )
					.replies( query )
					.then( ( { found } ) => dispatch( { type: COMMENTS_COUNT_RECEIVE, siteId, postId, totalCommentsCount: found } ) );
	};
}

