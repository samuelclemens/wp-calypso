/**
 * Created by yury on 1/29/16.
 */

export function commentTargetId( siteId, postId ) {
	return `${siteId}-${postId}`;
}

export function normalizeDate( dateString ) {
	const time = Date.parse( dateString );
	return new Date( time );
}

export function createRequestId( siteId, postId, query ) {
	return `${siteId}-${postId}-${JSON.stringify(query)}`;
}
