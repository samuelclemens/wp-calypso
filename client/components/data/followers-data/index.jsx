/**
 * External dependencies
 */
import React from 'react';
import isEqual from 'lodash/isEqual';
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import FollowersStore from 'lib/followers/store';
import FollowersActions from 'lib/followers/actions';
import passToChildren from 'lib/react-pass-to-children';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:followers-data' );

export default React.createClass( {
	displayName: 'FollowersData',

	propTypes: {
		fetchOptions: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return {
			followers: false,
			totalFollowers: false,
			currentPage: false,
			fetchInitialized: false
		};
	},

	componentDidMount() {
		FollowersStore.on( 'change', this.refreshFollowers );
		this.fetchIfEmpty( this.props.fetchOptions );
	},

	componentWillReceiveProps( nextProps ) {
		if ( ! nextProps.fetchOptions ) {
			return;
		}
		if ( ! isEqual( this.props.fetchOptions, nextProps.fetchOptions ) ) {
			this.setState( this.getInitialState() );
			this.fetchIfEmpty( nextProps.fetchOptions );
		}
	},

	componentWillUnmount() {
		FollowersStore.removeListener( 'change', this.refreshFollowers );
	},

	fetchIfEmpty( fetchOptions ) {
		fetchOptions = fetchOptions || this.props.fetchOptions;
		if ( ! fetchOptions || ! fetchOptions.siteId ) {
			return;
		}
		if ( FollowersStore.getFollowers( fetchOptions ).length ) {
			this.refreshFollowers( fetchOptions );
			return;
		}
		// defer fetch requests to avoid dispatcher conflicts
		let defer = function() {
			var paginationData = FollowersStore.getPaginationData( fetchOptions );
			if ( paginationData.fetchingFollowers ) {
				return;
			}
			FollowersActions.fetchFollowers( fetchOptions );
			this.setState( { fetchInitialized: true } );
		}.bind( this );
		setTimeout( defer, 0 );
	},

	isFetching: function() {
		let fetchOptions = this.props.fetchOptions;
		if ( ! fetchOptions.siteId ) {
			debug( 'Is fetching because siteId is falsey' );
			return true;
		}
		if ( ! this.state.followers ) {
			debug( 'Is fetching because not followers' );
			return true;
		}

		let followersPaginationData = FollowersStore.getPaginationData( fetchOptions );
		debug( 'Followers pagination data: ' + JSON.stringify( followersPaginationData ) );

		if ( followersPaginationData.fetchingFollowers ) {
			return true;
		}
		return false;
	},

	refreshFollowers( fetchOptions ) {
		fetchOptions = fetchOptions || this.props.fetchOptions;
		debug( 'Refreshing followers: ' + JSON.stringify( fetchOptions ) );
		this.setState( {
			followers: FollowersStore.getFollowers( fetchOptions ),
			totalFollowers: FollowersStore.getPaginationData( fetchOptions ).totalFollowers,
			currentPage: FollowersStore.getPaginationData( fetchOptions ).followersCurrentPage
		} );
	},

	render() {
		return passToChildren( this, Object.assign( {}, this.state, { fetching: this.isFetching() } ) );
	}
} );
