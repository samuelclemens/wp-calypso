/**
 * External dependencies
 */
import Chai, { expect } from 'chai';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import {
	items
} from '../reducer';
import {
	COMMENTS_RECEIVE,
	COMMENTS_REQUEST,
	COMMENTS_REQUEST_SUCCESS,
	COMMENTS_REQUEST_FAILURE
} from '../../action-types';
import {
	postId
} from '../utils';

describe('reducer', () => {
	describe('#items()', () => {
		it('should build correct tree', () => {
			const data = {"found":79,"site_ID":78992097,"comments":[{"ID":765,"post":{"ID":1012,"title":"The Art of Staying Still","type":"post","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012"},"author":{"ID":31299473,"login":"tessalove1","email":false,"name":"Tessa Love","first_name":"Tessa","last_name":"Love","nice_name":"tessalove1","URL":"","avatar_URL":"https:\/\/2.gravatar.com\/avatar\/5b62942f6be2e4d97aa19a31bbdaf767?s=96&d=https%3A%2F%2F2.gravatar.com%2Favatar%2Fad516503a11cd5ca435acc9bb6523536%3Fs%3D96&r=G","profile_URL":"http:\/\/en.gravatar.com\/tessalove1","site_ID":31670628},"date":"2016-01-28T10:07:18-08:00","URL":"http:\/\/wanderhomeblog.com\/2016\/01\/17\/the-art-of-staying-still\/comment-page-7\/#comment-765","short_URL":"http:\/\/wp.me\/p5lrs5-gk%23comment-765","content":"<p>Wow, thank you! Years of practice and lots of reading <span class='wp-smiley wp-emoji wp-emoji-smile' title=':)'>:)<\/span><\/p>\n","status":"approved","parent":{"ID":764,"type":"comment","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/764"},"type":"comment","like_count":0,"i_like":false,"meta":{"links":{"self":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/765","help":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/765\/help","site":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097","post":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012","replies":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/765\/replies\/","likes":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/765\/likes\/"}}},{"ID":764,"post":{"ID":1012,"title":"The Art of Staying Still","type":"post","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012"},"author":{"ID":91623764,"login":"mbalindaba01","email":false,"name":"Mbali Ndaba","first_name":"Mbalenhle","last_name":"Ndaba","nice_name":"mbalindaba01","URL":"http:\/\/mbalzreads.wordpress.com","avatar_URL":"https:\/\/0.gravatar.com\/avatar\/cc15edbeb98fa32b3f954259a9a582d6?s=96&d=https%3A%2F%2F0.gravatar.com%2Favatar%2Fad516503a11cd5ca435acc9bb6523536%3Fs%3D96&r=G","profile_URL":"http:\/\/en.gravatar.com\/mbalindaba01","site_ID":96458655},"date":"2016-01-28T08:12:40-08:00","URL":"http:\/\/wanderhomeblog.com\/2016\/01\/17\/the-art-of-staying-still\/comment-page-7\/#comment-764","short_URL":"http:\/\/wp.me\/p5lrs5-gk%23comment-764","content":"<p>You have an amazing mind. This is so well written. I wish I could write like you. Or even be half as good. <\/p>\n","status":"approved","parent":false,"type":"comment","like_count":1,"i_like":false,"meta":{"links":{"self":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/764","help":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/764\/help","site":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097","post":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012","replies":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/764\/replies\/","likes":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/764\/likes\/"}}},{"ID":763,"post":{"ID":1012,"title":"The Art of Staying Still","type":"post","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012"},"author":{"ID":100295141,"login":"stairwaytomaryum","email":false,"name":"stairwaytomaryum","first_name":"sazam","last_name":"maryum","nice_name":"stairwaytomaryum","URL":"http:\/\/stairwaytomaryum.wordpress.com","avatar_URL":"https:\/\/2.gravatar.com\/avatar\/5d5783857c9ce1867ab1c47fcb0ae6d3?s=96&d=https%3A%2F%2F2.gravatar.com%2Favatar%2Fad516503a11cd5ca435acc9bb6523536%3Fs%3D96&r=G","profile_URL":"http:\/\/en.gravatar.com\/stairwaytomaryum","site_ID":106026790},"date":"2016-01-28T07:47:18-08:00","URL":"http:\/\/wanderhomeblog.com\/2016\/01\/17\/the-art-of-staying-still\/comment-page-7\/#comment-763","short_URL":"http:\/\/wp.me\/p5lrs5-gk%23comment-763","content":"<p>cool!! like it<\/p>\n","status":"approved","parent":false,"type":"comment","like_count":1,"i_like":false,"meta":{"links":{"self":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/763","help":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/763\/help","site":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097","post":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012","replies":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/763\/replies\/","likes":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/763\/likes\/"}}},{"ID":761,"post":{"ID":1012,"title":"The Art of Staying Still","type":"post","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012"},"author":{"ID":59372711,"login":"handiwork1","email":false,"name":"Handiwork","first_name":"Handi","last_name":"Work","nice_name":"handiwork1","URL":"http:\/\/Www.husbandfatherson.wordpress.com","avatar_URL":"https:\/\/1.gravatar.com\/avatar\/a6d8ecb5724996b4c3beaf1975e59ee1?s=96&d=https%3A%2F%2F1.gravatar.com%2Favatar%2Fad516503a11cd5ca435acc9bb6523536%3Fs%3D96&r=G","profile_URL":"http:\/\/en.gravatar.com\/handiwork1","site_ID":33669610},"date":"2016-01-28T04:44:22-08:00","URL":"http:\/\/wanderhomeblog.com\/2016\/01\/17\/the-art-of-staying-still\/comment-page-7\/#comment-761","short_URL":"http:\/\/wp.me\/p5lrs5-gk%23comment-761","content":"<p>Interesting. <\/p>\n","status":"approved","parent":false,"type":"comment","like_count":0,"i_like":false,"meta":{"links":{"self":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/761","help":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/761\/help","site":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097","post":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012","replies":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/761\/replies\/","likes":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/761\/likes\/"}}},{"ID":760,"post":{"ID":1012,"title":"The Art of Staying Still","type":"post","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012"},"author":{"ID":0,"login":"","email":false,"name":"The Art of Staying\u00a0Still | wakeikagoodotcom","first_name":"","last_name":"","nice_name":"","URL":"https:\/\/wakeikagoodotcom.wordpress.com\/2016\/01\/28\/the-art-of-staying-still\/","avatar_URL":"","profile_URL":"http:\/\/en.gravatar.com\/d41d8cd98f00b204e9800998ecf8427e"},"date":"2016-01-27T21:46:08-08:00","URL":"http:\/\/wanderhomeblog.com\/2016\/01\/17\/the-art-of-staying-still\/comment-page-6\/#comment-760","short_URL":"http:\/\/wp.me\/p5lrs5-gk%23comment-760","content":"<p>[&#8230;] Source: The Art of Staying\u00a0Still [&#8230;]<\/p>\n","status":"approved","parent":false,"type":"pingback","like_count":0,"i_like":false,"meta":{"links":{"self":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/760","help":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/760\/help","site":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097","post":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012","replies":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/760\/replies\/","likes":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/760\/likes\/"}}},{"ID":758,"post":{"ID":1012,"title":"The Art of Staying Still","type":"post","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012"},"author":{"ID":46765406,"login":"ofinfinity","email":false,"name":"ofinfinity","first_name":"","last_name":"","nice_name":"ofinfinity","URL":"http:\/\/ofinfinity.wordpress.com","avatar_URL":"https:\/\/1.gravatar.com\/avatar\/71ad107b59f6c761f34b36a8a1aa0036?s=96&d=https%3A%2F%2F1.gravatar.com%2Favatar%2Fad516503a11cd5ca435acc9bb6523536%3Fs%3D96&r=G","profile_URL":"http:\/\/en.gravatar.com\/ofinfinity","site_ID":90841668},"date":"2016-01-27T17:11:39-08:00","URL":"http:\/\/wanderhomeblog.com\/2016\/01\/17\/the-art-of-staying-still\/comment-page-6\/#comment-758","short_URL":"http:\/\/wp.me\/p5lrs5-gk%23comment-758","content":"<p>Love it!<\/p>\n","status":"approved","parent":false,"type":"comment","like_count":1,"i_like":false,"meta":{"links":{"self":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/758","help":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/758\/help","site":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097","post":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012","replies":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/758\/replies\/","likes":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/758\/likes\/"}}},{"ID":757,"post":{"ID":1012,"title":"The Art of Staying Still","type":"post","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012"},"author":{"ID":0,"login":"","email":false,"name":"The Art of Staying\u00a0Still &#8211; everythingbydailymotion","first_name":"","last_name":"","nice_name":"","URL":"https:\/\/everythingbydailymotion.wordpress.com\/2016\/01\/27\/the-art-of-staying-still\/","avatar_URL":"","profile_URL":"http:\/\/en.gravatar.com\/d41d8cd98f00b204e9800998ecf8427e"},"date":"2016-01-27T11:04:59-08:00","URL":"http:\/\/wanderhomeblog.com\/2016\/01\/17\/the-art-of-staying-still\/comment-page-6\/#comment-757","short_URL":"http:\/\/wp.me\/p5lrs5-gk%23comment-757","content":"<p>[&#8230;] Source: The Art of Staying\u00a0Still [&#8230;]<\/p>\n","status":"approved","parent":false,"type":"pingback","like_count":0,"i_like":false,"meta":{"links":{"self":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/757","help":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/757\/help","site":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097","post":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012","replies":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/757\/replies\/","likes":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/757\/likes\/"}}},{"ID":756,"post":{"ID":1012,"title":"The Art of Staying Still","type":"post","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012"},"author":{"ID":100300565,"login":"teima23411","email":false,"name":"teima23411","first_name":"","last_name":"","nice_name":"teima23411","URL":"http:\/\/teima23411.wordpress.com","avatar_URL":"https:\/\/1.gravatar.com\/avatar\/1505d82a34a138428507ba274e16d4ea?s=96&d=https%3A%2F%2F1.gravatar.com%2Favatar%2Fad516503a11cd5ca435acc9bb6523536%3Fs%3D96&r=G","profile_URL":"http:\/\/en.gravatar.com\/teima23411","site_ID":106032981},"date":"2016-01-27T10:18:14-08:00","URL":"http:\/\/wanderhomeblog.com\/2016\/01\/17\/the-art-of-staying-still\/comment-page-6\/#comment-756","short_URL":"http:\/\/wp.me\/p5lrs5-gk%23comment-756","content":"<p>I like it\ud83d\ude0a<\/p>\n","status":"approved","parent":false,"type":"comment","like_count":0,"i_like":false,"meta":{"links":{"self":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/756","help":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/756\/help","site":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097","post":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012","replies":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/756\/replies\/","likes":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/756\/likes\/"}}},{"ID":755,"post":{"ID":1012,"title":"The Art of Staying Still","type":"post","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012"},"author":{"ID":100300565,"login":"teima23411","email":false,"name":"teima23411","first_name":"","last_name":"","nice_name":"teima23411","URL":"http:\/\/teima23411.wordpress.com","avatar_URL":"https:\/\/1.gravatar.com\/avatar\/1505d82a34a138428507ba274e16d4ea?s=96&d=https%3A%2F%2F1.gravatar.com%2Favatar%2Fad516503a11cd5ca435acc9bb6523536%3Fs%3D96&r=G","profile_URL":"http:\/\/en.gravatar.com\/teima23411","site_ID":106032981},"date":"2016-01-27T10:17:41-08:00","URL":"http:\/\/wanderhomeblog.com\/2016\/01\/17\/the-art-of-staying-still\/#comment-755","short_URL":"http:\/\/wp.me\/p5lrs5-gk%23comment-755","content":"<p>I like it ,\ud83d\ude0a\ud83d\ude0a<\/p>\n","status":"approved","parent":{"ID":661,"type":"comment","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/661"},"type":"comment","like_count":0,"i_like":false,"meta":{"links":{"self":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/755","help":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/755\/help","site":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097","post":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012","replies":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/755\/replies\/","likes":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/755\/likes\/"}}},{"ID":754,"post":{"ID":1012,"title":"The Art of Staying Still","type":"post","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012"},"author":{"ID":95498450,"login":"mrskearin","email":false,"name":"mrskearin","first_name":"Rosie","last_name":"Kearin","nice_name":"mrskearin","URL":"http:\/\/thisonetimeinyork.wordpress.com","avatar_URL":"https:\/\/1.gravatar.com\/avatar\/7a02bacdbee0ddedb2e8cc6ca1564cad?s=96&d=https%3A%2F%2F1.gravatar.com%2Favatar%2Fad516503a11cd5ca435acc9bb6523536%3Fs%3D96&r=G","profile_URL":"http:\/\/en.gravatar.com\/mrskearin","site_ID":100364174},"date":"2016-01-27T04:40:36-08:00","URL":"http:\/\/wanderhomeblog.com\/2016\/01\/17\/the-art-of-staying-still\/comment-page-6\/#comment-754","short_URL":"http:\/\/wp.me\/p5lrs5-gk%23comment-754","content":"<p>This put into words exactly what I have been feeling.  Stillness is and art.<\/p>\n","status":"approved","parent":false,"type":"comment","like_count":0,"i_like":false,"meta":{"links":{"self":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/754","help":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/754\/help","site":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097","post":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012","replies":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/754\/replies\/","likes":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/754\/likes\/"}}},{"ID":753,"post":{"ID":1012,"title":"The Art of Staying Still","type":"post","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012"},"author":{"ID":99716512,"login":"hermesssaglaea","email":false,"name":"hermesssaglaea","first_name":"Hermesss","last_name":"Aglaea","nice_name":"hermesssaglaea","URL":"http:\/\/hermesssaglaeadotcom.wordpress.com","avatar_URL":"https:\/\/1.gravatar.com\/avatar\/12d7d25fbcf08bdd0d3cf34fad762d4b?s=96&d=https%3A%2F%2F1.gravatar.com%2Favatar%2Fad516503a11cd5ca435acc9bb6523536%3Fs%3D96&r=G","profile_URL":"http:\/\/en.gravatar.com\/hermesssaglaea","site_ID":105361070},"date":"2016-01-27T03:00:55-08:00","URL":"http:\/\/wanderhomeblog.com\/2016\/01\/17\/the-art-of-staying-still\/comment-page-4\/#comment-753","short_URL":"http:\/\/wp.me\/p5lrs5-gk%23comment-753","content":"<p>What&#8217;s happened with you page Thang Tran?<\/p>\n","status":"approved","parent":{"ID":706,"type":"comment","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/706"},"type":"comment","like_count":0,"i_like":false,"meta":{"links":{"self":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/753","help":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/753\/help","site":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097","post":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012","replies":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/753\/replies\/","likes":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/753\/likes\/"}}},{"ID":752,"post":{"ID":1012,"title":"The Art of Staying Still","type":"post","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012"},"author":{"ID":99716512,"login":"hermesssaglaea","email":false,"name":"hermesssaglaea","first_name":"Hermesss","last_name":"Aglaea","nice_name":"hermesssaglaea","URL":"http:\/\/hermesssaglaeadotcom.wordpress.com","avatar_URL":"https:\/\/1.gravatar.com\/avatar\/12d7d25fbcf08bdd0d3cf34fad762d4b?s=96&d=https%3A%2F%2F1.gravatar.com%2Favatar%2Fad516503a11cd5ca435acc9bb6523536%3Fs%3D96&r=G","profile_URL":"http:\/\/en.gravatar.com\/hermesssaglaea","site_ID":105361070},"date":"2016-01-27T02:58:55-08:00","URL":"http:\/\/wanderhomeblog.com\/2016\/01\/17\/the-art-of-staying-still\/comment-page-6\/#comment-752","short_URL":"http:\/\/wp.me\/p5lrs5-gk%23comment-752","content":"<p>What if the movement is the life essence?<\/p>\n","status":"approved","parent":false,"type":"comment","like_count":0,"i_like":false,"meta":{"links":{"self":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/752","help":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/752\/help","site":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097","post":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012","replies":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/752\/replies\/","likes":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/752\/likes\/"}}},{"ID":751,"post":{"ID":1012,"title":"The Art of Staying Still","type":"post","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012"},"author":{"ID":100126150,"login":"sejati2016","email":false,"name":"sejati2016","first_name":"Kang","last_name":"Byul Hun","nice_name":"sejati2016","URL":"http:\/\/sejati2016.wordpress.com","avatar_URL":"https:\/\/2.gravatar.com\/avatar\/b9bddf3885a7e0218eca00f1fa85234c?s=96&d=https%3A%2F%2F2.gravatar.com%2Favatar%2Fad516503a11cd5ca435acc9bb6523536%3Fs%3D96&r=G","profile_URL":"http:\/\/en.gravatar.com\/sejati2016","site_ID":105830388},"date":"2016-01-27T00:42:09-08:00","URL":"http:\/\/wanderhomeblog.com\/2016\/01\/17\/the-art-of-staying-still\/comment-page-6\/#comment-751","short_URL":"http:\/\/wp.me\/p5lrs5-gk%23comment-751","content":"<p>Beautiful pict<br \/>\nCan i get it???<\/p>\n","status":"approved","parent":false,"type":"comment","like_count":0,"i_like":false,"meta":{"links":{"self":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/751","help":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/751\/help","site":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097","post":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012","replies":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/751\/replies\/","likes":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/751\/likes\/"}}},{"ID":748,"post":{"ID":1012,"title":"The Art of Staying Still","type":"post","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012"},"author":{"ID":0,"login":"","email":false,"name":"The Art of Staying\u00a0Still | hylamblog","first_name":"","last_name":"","nice_name":"","URL":"https:\/\/hylamblog.wordpress.com\/2016\/01\/27\/the-art-of-staying-still\/","avatar_URL":"","profile_URL":"http:\/\/en.gravatar.com\/d41d8cd98f00b204e9800998ecf8427e"},"date":"2016-01-26T17:41:15-08:00","URL":"http:\/\/wanderhomeblog.com\/2016\/01\/17\/the-art-of-staying-still\/comment-page-6\/#comment-748","short_URL":"http:\/\/wp.me\/p5lrs5-gk%23comment-748","content":"<p>[&#8230;] Source: The Art of Staying\u00a0Still [&#8230;]<\/p>\n","status":"approved","parent":false,"type":"pingback","like_count":0,"i_like":false,"meta":{"links":{"self":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/748","help":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/748\/help","site":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097","post":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012","replies":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/748\/replies\/","likes":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/748\/likes\/"}}},{"ID":747,"post":{"ID":1012,"title":"The Art of Staying Still","type":"post","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012"},"author":{"ID":0,"login":"","email":false,"name":"Arvin","first_name":"","last_name":"","nice_name":"","URL":"","avatar_URL":"https:\/\/0.gravatar.com\/avatar\/35bc3bad8a009c77a44f2f6fbed947a7?s=96&d=https%3A%2F%2F0.gravatar.com%2Favatar%2Fad516503a11cd5ca435acc9bb6523536%3Fs%3D96&r=G","profile_URL":"http:\/\/en.gravatar.com\/35bc3bad8a009c77a44f2f6fbed947a7"},"date":"2016-01-26T17:38:15-08:00","URL":"http:\/\/wanderhomeblog.com\/2016\/01\/17\/the-art-of-staying-still\/comment-page-6\/#comment-747","short_URL":"http:\/\/wp.me\/p5lrs5-gk%23comment-747","content":"<p>Marvellous&#8230; <\/p>\n<p>If you wonder why? Every single word here is the reason &#8230;!<\/p>\n","status":"approved","parent":false,"type":"comment","like_count":1,"i_like":false,"meta":{"links":{"self":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/747","help":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/747\/help","site":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097","post":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012","replies":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/747\/replies\/","likes":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/747\/likes\/"}}},{"ID":745,"post":{"ID":1012,"title":"The Art of Staying Still","type":"post","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012"},"author":{"ID":54632123,"login":"petroform","email":false,"name":"petroform","first_name":"","last_name":"","nice_name":"lithoforms-2","URL":"http:\/\/petroform.wordpress.com","avatar_URL":"https:\/\/1.gravatar.com\/avatar\/a16f3b977ee76953c0147614a7915d86?s=96&d=https%3A%2F%2F1.gravatar.com%2Favatar%2Fad516503a11cd5ca435acc9bb6523536%3Fs%3D96&r=G","profile_URL":"http:\/\/en.gravatar.com\/petroform","site_ID":57160787},"date":"2016-01-26T17:02:58-08:00","URL":"http:\/\/wanderhomeblog.com\/2016\/01\/17\/the-art-of-staying-still\/comment-page-6\/#comment-745","short_URL":"http:\/\/wp.me\/p5lrs5-gk%23comment-745","content":"<p>I love the picture of the trinkets. brought down to the bare bones of lines and contrast. Great words, too <span class='wp-smiley wp-emoji wp-emoji-smile' title=':)'>:)<\/span><\/p>\n","status":"approved","parent":false,"type":"comment","like_count":1,"i_like":false,"meta":{"links":{"self":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/745","help":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/745\/help","site":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097","post":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012","replies":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/745\/replies\/","likes":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/745\/likes\/"}}},{"ID":743,"post":{"ID":1012,"title":"The Art of Staying Still","type":"post","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012"},"author":{"ID":55788372,"login":"jessnepacena","email":false,"name":"jessneps","first_name":"","last_name":"","nice_name":"jessnepacena","URL":"http:\/\/jessneps.wordpress.com","avatar_URL":"https:\/\/2.gravatar.com\/avatar\/89326f0e3fefbaf70a99fb42d96930ca?s=96&d=https%3A%2F%2F2.gravatar.com%2Favatar%2Fad516503a11cd5ca435acc9bb6523536%3Fs%3D96&r=G","profile_URL":"http:\/\/en.gravatar.com\/jessnepacena","site_ID":58361432},"date":"2016-01-26T11:45:23-08:00","URL":"http:\/\/wanderhomeblog.com\/2016\/01\/17\/the-art-of-staying-still\/comment-page-5\/#comment-743","short_URL":"http:\/\/wp.me\/p5lrs5-gk%23comment-743","content":"<p>Reblogged this on <a href=\"https:\/\/jessneps.wordpress.com\/2016\/01\/26\/the-art-of-staying-still\/\" rel=\"nofollow\">journeywithjess<\/a> and commented:<br \/>\nLove this!<\/p>\n","status":"approved","parent":false,"type":"comment","like_count":0,"i_like":false,"meta":{"links":{"self":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/743","help":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/743\/help","site":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097","post":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012","replies":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/743\/replies\/","likes":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/743\/likes\/"}}},{"ID":742,"post":{"ID":1012,"title":"The Art of Staying Still","type":"post","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012"},"author":{"ID":25595726,"login":"thewinestudent","email":false,"name":"thewinestudent","first_name":"Heidi","last_name":"Thompson-Howse","nice_name":"thewinestudent","URL":"http:\/\/thewinestudent.wordpress.com","avatar_URL":"https:\/\/2.gravatar.com\/avatar\/8c62235cb92ee861b1e5ea8b6ac69110?s=96&d=https%3A%2F%2F2.gravatar.com%2Favatar%2Fad516503a11cd5ca435acc9bb6523536%3Fs%3D96&r=G","profile_URL":"http:\/\/en.gravatar.com\/thewinestudent","site_ID":25715882},"date":"2016-01-26T11:44:48-08:00","URL":"http:\/\/wanderhomeblog.com\/2016\/01\/17\/the-art-of-staying-still\/comment-page-5\/#comment-742","short_URL":"http:\/\/wp.me\/p5lrs5-gk%23comment-742","content":"<p>This is exactly where I am right now! Thank you for writing this post. <\/p>\n","status":"approved","parent":false,"type":"comment","like_count":1,"i_like":false,"meta":{"links":{"self":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/742","help":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/742\/help","site":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097","post":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012","replies":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/742\/replies\/","likes":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/742\/likes\/"}}},{"ID":740,"post":{"ID":1012,"title":"The Art of Staying Still","type":"post","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012"},"author":{"ID":91507139,"login":"jayalakshmii","email":false,"name":"jayalakshmii","first_name":"","last_name":"","nice_name":"jayalakshmii","URL":"http:\/\/justbeingme.wordpress.com","avatar_URL":"https:\/\/2.gravatar.com\/avatar\/52bfa576914de310f4f238406c28658d?s=96&d=https%3A%2F%2F2.gravatar.com%2Favatar%2Fad516503a11cd5ca435acc9bb6523536%3Fs%3D96&r=G","profile_URL":"http:\/\/en.gravatar.com\/jayalakshmii","site_ID":96330859},"date":"2016-01-26T03:24:31-08:00","URL":"http:\/\/wanderhomeblog.com\/2016\/01\/17\/the-art-of-staying-still\/comment-page-5\/#comment-740","short_URL":"http:\/\/wp.me\/p5lrs5-gk%23comment-740","content":"<p>Beautifully written Teesa love&#8230;<\/p>\n<p>Sharing my perspective after reading your blog&#8230;&#8230;<\/p>\n<p>Stillness is the only truth in this the wandering world,Everything that wanders now, has come from stillness..<\/p>\n<p>&#8220;When our identities become like iron around us, unshakable and unshedable, how do we break free?&#8221;  That&#8217;s a thought provoking question which is surrounding most of us &#8230;.<br \/>\nNext question arises as what can be done to make us free?What is possible from our side to break free?Does it depend only on me or by the people around me too?<\/p>\n","status":"approved","parent":false,"type":"comment","like_count":1,"i_like":false,"meta":{"links":{"self":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/740","help":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/740\/help","site":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097","post":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012","replies":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/740\/replies\/","likes":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/740\/likes\/"}}},{"ID":738,"post":{"ID":1012,"title":"The Art of Staying Still","type":"post","link":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012"},"author":{"ID":100166440,"login":"jujukarsmall","email":false,"name":"jujukarsmall","first_name":"julie","last_name":"muthui","nice_name":"jujukarsmall","URL":"http:\/\/jujukarsmall.wordpress.com","avatar_URL":"https:\/\/1.gravatar.com\/avatar\/d4ae26f0ba03495c110b18567a369d00?s=96&d=https%3A%2F%2F1.gravatar.com%2Favatar%2Fad516503a11cd5ca435acc9bb6523536%3Fs%3D96&r=G","profile_URL":"http:\/\/en.gravatar.com\/jujukarsmall","site_ID":105877261},"date":"2016-01-26T01:01:33-08:00","URL":"http:\/\/wanderhomeblog.com\/2016\/01\/17\/the-art-of-staying-still\/comment-page-5\/#comment-738","short_URL":"http:\/\/wp.me\/p5lrs5-gk%23comment-738","content":"<p>I love this cz am a fun of traveling<\/p>\n","status":"approved","parent":false,"type":"comment","like_count":0,"i_like":false,"meta":{"links":{"self":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/738","help":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/738\/help","site":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097","post":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/posts\/1012","replies":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/738\/replies\/","likes":"https:\/\/public-api.wordpress.com\/rest\/v1.1\/sites\/78992097\/comments\/738\/likes\/"}}}]};
			const commentsTree = items( undefined, {
				type: COMMENTS_RECEIVE,
				siteId: data.site_ID,
				postId: data.comments[0].post.ID,
				comments: data.comments
			} );

			const commentsTreeId = postId( data.site_ID, data.comments[0].post.ID );
			const commentsTreeForPost = commentsTree.get( commentsTreeId );
			const parent = commentsTreeForPost.get( 764 );
			const firstChildOfParent = parent.getIn( [ 'children', 0 ]);

			expect( Immutable.OrderedMap.isOrderedMap( commentsTreeForPost ) ).to.be.true;
			expect( Immutable.Map.isMap( parent ) ).to.be.true;
			expect( Immutable.Map.isMap( firstChildOfParent ) ).to.be.true;
			expect( firstChildOfParent ).to.be.eql( commentsTree.getIn( [ commentsTreeId, 765 ] ) );

		});
	});
});
