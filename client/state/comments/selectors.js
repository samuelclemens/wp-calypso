/**
 * Created by yury on 1/29/16.
 */

import {
	createCommentTargetId
} from './utils';

export function getPostComments( state, siteId, postId ) {
	return state.comments.items.get( createCommentTargetId( siteId, postId ) );
}

export function haveMoreCommentsToFetch( state, siteId, postId ) {
	const fetchedCommentsCount = state.comments.items.getIn( [ createCommentTargetId( siteId, postId ), 'fetchedCommentsCount' ] );
	const totalCommentsCount = state.comments.items.getIn( [ createCommentTargetId( siteId, postId ), 'totalCommentsCount' ] );

	return fetchedCommentsCount < totalCommentsCount;
}
