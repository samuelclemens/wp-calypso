/**
 * External Dependencies
 */
var chai = require( 'chai' ),
	expect = chai.expect,
	Dispatcher = require( 'dispatcher' ),
	immutable = require( 'immutable' ),
	chaiImmutable = require( 'chai-immutable' );

chai.use( chaiImmutable );

const FeedSubscriptionStore = require( '../index' );

describe( 'feed-subscription-store', function() {
	beforeEach( function() {
		FeedSubscriptionStore.clearSubscriptions();
	} );

	it( 'should have a dispatch token', function() {
		expect( FeedSubscriptionStore ).to.have.property( 'dispatchToken' );
	} );

	it( 'should follow a new feed', function() {
		var siteUrl = 'http://trailnose.com';

		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getSubscription( siteUrl ) ).to.equal( immutable.fromJS(
			{
				URL: siteUrl,
				state: 'SUBSCRIBED'
			}
		) );
	} );

	it( 'should unfollow an existing feed', function() {
		var siteUrl = 'http://trailnose.com';

		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		Dispatcher.handleViewAction( {
			type: 'UNFOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getSubscription( siteUrl ) ).to.be.undefined;
	} );

	it( 'should add subscription details when a follow is confirmed', function() {
		var siteUrl = 'http://trailnose.com';

		// The initial action from the UI
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		// The action from the API response
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_FOLLOW_READER_FEED',
			url: siteUrl,
			data: {
				subscribed: true,
				subscription: {
					URL: siteUrl,
					feed_ID: 123
				}
			}
		} );

		expect( FeedSubscriptionStore.getSubscription( siteUrl ) ).to.equal( immutable.fromJS( {
			URL: siteUrl,
			feed_ID: 123,
			state: 'SUBSCRIBED'
		} ) );
	} );

	it( 'should not store a follow if there is an API error', function() {
		var zeldmanSiteUrl = 'http://www.zeldman.com';

		// The action from the UI - follow should be stored optimistically
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: zeldmanSiteUrl,
			data: { url: zeldmanSiteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getIsFollowingBySiteUrl( zeldmanSiteUrl ) ).to.eq( true );

		// The response from the API - if there is a problem here, the
		// follow should be removed from the store and an error made available
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_FOLLOW_READER_FEED',
			url: zeldmanSiteUrl,
			data: null,
			error: new Error( 'There was a problem' )
		} );

		expect( FeedSubscriptionStore.getIsFollowingBySiteUrl( zeldmanSiteUrl ) ).to.eq( false );
		expect( FeedSubscriptionStore.getLastErrorBySiteUrl( zeldmanSiteUrl ) ).to.be.an( 'object' );
		expect( FeedSubscriptionStore.getLastErrorBySiteUrl( 'blah' ) ).to.be.undefined;

		// The response from the API - if there is a problem here, the
		// follow should be removed from the store and an error made available
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_FOLLOW_READER_FEED',
			url: zeldmanSiteUrl,
			data: {
				info: 'unable_to_follow',
				subscribed: false
			}
		} );

		expect( FeedSubscriptionStore.getIsFollowingBySiteUrl( zeldmanSiteUrl ) ).to.eq( false );
		expect( FeedSubscriptionStore.getLastErrorBySiteUrl( zeldmanSiteUrl ).errorType ).to.be.ok;
		expect( FeedSubscriptionStore.getLastErrorBySiteUrl( 'blah' ) ).to.be.undefined;
	} );

	it( 'should find a feed regardless of protocol used', function() {
		var zeldmanSiteUrl = 'http://www.zeldman.com';

		// The action from the UI - follow should be stored optimistically
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: zeldmanSiteUrl,
			data: { url: zeldmanSiteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getIsFollowingBySiteUrl( 'https://www.zeldman.com' ) ).to.eq( true );
	} );

	it( 'should receive a list of subscriptions', function() {
		FeedSubscriptionStore.setPerPage( 2 );

		Dispatcher.handleViewAction( {
			type: 'RECEIVE_FEED_SUBSCRIPTIONS',
			data: { page: 1, total_subscriptions: 505, subscriptions: [ { ID: 1, URL: 'http://www.banana.com', feed_ID: 123 }, { ID: 2, URL: 'http://www.feijoa.com' } ] },
			error: null
		} );

		expect( FeedSubscriptionStore.getIsFollowingBySiteUrl( 'https://www.feijoa.com' ) ).to.eq( true );
		expect( FeedSubscriptionStore.getSubscription( 'http://www.banana.com' ) ).to.equal( immutable.fromJS( {
			ID: 1,
			URL: 'http://www.banana.com',
			feed_ID: 123,
			state: 'SUBSCRIBED'
		} ) );
		expect( FeedSubscriptionStore.getTotalSubscriptions() ).to.eq( 505 );

		// Receiving second page (subscriptions should be merged)
		Dispatcher.handleViewAction( {
			type: 'RECEIVE_FEED_SUBSCRIPTIONS',
			data: { page: 2, total_subscriptions: 505, subscriptions: [ { ID: 3, URL: 'http://www.dragonfruit.com', feed_ID: 456 } ] },
			error: null
		} );

		expect( FeedSubscriptionStore.getIsFollowingBySiteUrl( 'https://www.feijoa.com' ) ).to.eq( true );
		expect( FeedSubscriptionStore.getIsFollowingBySiteUrl( 'https://www.dragonfruit.com' ) ).to.eq( true );
		expect( FeedSubscriptionStore.getSubscription( 'http://www.dragonfruit.com' ) ).to.equal( immutable.fromJS( {
			ID: 3,
			URL: 'http://www.dragonfruit.com',
			feed_ID: 456,
			state: 'SUBSCRIBED'
		} ) );
	} );

	it( 'should not add duplicate subscriptions', function() {
		const siteUrl = 'http://www.tomato.com';

		// The initial action from the UI
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getIsFollowingBySiteUrl( 'https://www.tomato.com' ) ).to.eq( true );
		expect( FeedSubscriptionStore.getSubscriptions().count ).to.eq( 1 );
	} );

	it( 'should update an existing subscription in the store on re-follow', function() {
		const siteUrl = 'http://www.rambutan.com';

		// The initial action from the UI
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		// The action from the API response
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_FOLLOW_READER_FEED',
			url: siteUrl,
			data: {
				subscribed: true,
				subscription: {
					URL: siteUrl,
					feed_ID: 123
				}
			}
		} );

		// Then unfollow....
		Dispatcher.handleViewAction( {
			type: 'UNFOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		// Then re-follow...
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		// The subscription data from the first follow response should still exist
		// (and there should not be duplicate records for the same feed)
		expect( FeedSubscriptionStore.getIsFollowingBySiteUrl( siteUrl ) ).to.eq( true );
		expect( FeedSubscriptionStore.getSubscriptions().count ).to.eq( 1 );
		expect( FeedSubscriptionStore.getSubscription( siteUrl ).get( 'feed_ID' ) ).to.eq( 123 );
		expect( FeedSubscriptionStore.getSubscription( siteUrl ).get( 'state' ) ).to.eq( 'SUBSCRIBED' );
	} );

	it( 'should update the total subscription count during follow and unfollow', function() {
		const siteUrl = 'http://www.mango.com';

		// Receive initial total_subscriptions count
		Dispatcher.handleViewAction( {
			type: 'RECEIVE_FEED_SUBSCRIPTIONS',
			data: { page: 1, total_subscriptions: 506, subscriptions: [ { ID: 3, URL: 'http://www.dragonfruit.com', feed_ID: 456 } ] },
			error: null
		} );

		// Follow
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getTotalSubscriptions() ).to.eq( 507 );

		// Unfollow
		Dispatcher.handleViewAction( {
			type: 'UNFOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getTotalSubscriptions() ).to.eq( 506 );

		// Re-follow (to check that the state change UNSUBSCRIBED->SUBSCRIBED updates the count correctly)
		Dispatcher.handleViewAction( {
			type: 'FOLLOW_READER_FEED',
			url: siteUrl,
			data: { url: siteUrl },
			error: null
		} );

		expect( FeedSubscriptionStore.getTotalSubscriptions() ).to.eq( 507 );
	} );
} );
