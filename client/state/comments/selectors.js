/**
 * Created by yury on 1/29/16.
 */

import {
	createCommentTargetId
} from './utils';

export function getComments( state, siteId, postId ) {
	return state.comments.items.get( createCommentTargetId( siteId, postId ) );
}
