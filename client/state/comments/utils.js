/**
 * Created by yury on 1/29/16.
 */

export function createCommentTargetId(siteId, postId ) {
	return `${siteId}-${postId}`;
}

export function createRequestId( siteId, postId, query ) {
	return `${siteId}-${postId}-${JSON.stringify(query)}`;
}
