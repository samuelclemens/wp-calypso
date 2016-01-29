/**
 * Created by yury on 1/29/16.
 */

export function postId( siteId, postId ) {
	return `${siteId}-${postId}`;
}

export function normalizeDate( dateString ) {
	const time = Date.parse( dateString );
	return new Date( time );
}
