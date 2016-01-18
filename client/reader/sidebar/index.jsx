/**
 * External dependencies
 */
const assign = require( 'lodash/object/assign' ),
	closest = require( 'component-closest' ),
	some = require( 'lodash/collection/some' ),
	startsWith = require( 'lodash/string/startsWith' ),
	React = require( 'react' ),
	page = require( 'page' ),
	url = require( 'url' ),
	classnames = require( 'classnames' );

/**
 * Internal Dependencies
 */
const layoutFocus = require( 'lib/layout-focus' ),
	ReaderTagsSubscriptionStore = require( 'lib/reader-tags/subscriptions' ),
	ReaderListsSubscriptionsStore = require( 'lib/reader-lists/subscriptions' ),
	ReaderListsStore = require( 'lib/reader-lists/lists' ),
	ReaderTeams = require( 'lib/reader-teams' ),
	Sidebar = require( 'layout/sidebar' ),
	SidebarActions = require( 'lib/reader-sidebar/actions' ),
	SidebarHeading = require( 'layout/sidebar/heading' ),
	SidebarMenu = require( 'layout/sidebar/menu' ),
	Gridicon = require( 'components/gridicon' ),
	discoverHelper = require( 'reader/discover/helper' ),
	config = require( 'config' );

import ReaderSidebarTags from './tags';
import ReaderSidebarLists from './lists';
import ReaderSidebarTeams from './teams';

const ReaderSidebar = React.createClass( {

	itemLinkClass: function( path, additionalClasses ) {
		var basePathLowerCase = this.props.path.split( '?' )[0].replace( /\/edit$/, '' ).toLowerCase(),
			pathLowerCase = path.replace( /\/edit$/, '' ).toLowerCase(),
			selected = basePathLowerCase === pathLowerCase,
			isActionButtonSelected = false;

		// Following is a special case, because it can be at / or /following
		if ( pathLowerCase === '/' && ! selected ) {
			selected = '/following' === basePathLowerCase;
		};

		// Are we on an edit page?
		const pathWithoutQueryString = this.props.path.split( '?' )[0];
		if ( selected && !! pathWithoutQueryString.match( /\/edit$/ ) ) {
			isActionButtonSelected = true;
		}

		return classnames( assign( { selected: selected, 'is-action-button-selected': isActionButtonSelected }, additionalClasses ) );
	},

	itemLinkClassStartsWithOneOf: function( paths, additionalClasses ) {
		const selected = this.pathStartsWithOneOf( paths );
		return classnames( assign( { selected }, additionalClasses ) );
	},

	pathStartsWithOneOf: function( paths ) {
		return some( paths, function( path ) {
			return startsWith( this.props.path.toLowerCase(), path.toLowerCase() )
		}, this );
	},

	handleClick: function( event ) {
		if ( ! event.isDefaultPrevented() && ! closest( event.target, 'input,textarea', true ) ) {
			layoutFocus.setNext( 'content' );
			window.scrollTo( 0, 0 );
		}
	},

	componentDidMount: function() {
		ReaderTagsSubscriptionStore.on( 'change', this.updateState );
		ReaderTagsSubscriptionStore.on( 'add', this.highlightNewTag );
		ReaderListsStore.on( 'change', this.updateState );
		ReaderListsSubscriptionsStore.on( 'change', this.updateState );
		ReaderListsSubscriptionsStore.on( 'create', this.highlightNewList );
		ReaderTeams.on( 'change', this.updateState );
	},

	componentWillUnmount: function() {
		ReaderTagsSubscriptionStore.off( 'change', this.updateState );
		ReaderTagsSubscriptionStore.off( 'add', this.highlightNewTag );
		ReaderListsStore.off( 'change', this.updateState );
		ReaderListsSubscriptionsStore.off( 'change', this.updateState );
		ReaderListsSubscriptionsStore.off( 'create', this.highlightNewList );
		ReaderTeams.off( 'change', this.updateState );
	},

	getInitialState: function() {
		return this.getStateFromStores();
	},

	getStateFromStores: function() {
		const tags = ReaderTagsSubscriptionStore.get();
		const lists = ReaderListsSubscriptionsStore.get();
		const teams = ReaderTeams.get();

		if ( ! ( tags && lists && teams ) ) {
			SidebarActions.fetch();
		}

		return {
			tags,
			lists,
			teams
		};
	},

	updateState: function() {
		this.setState( this.getStateFromStores() );
	},

	highlightNewList: function( list ) {
		list = ReaderListsStore.get( list.owner, list.slug );
		window.location.href = url.resolve( 'https://wordpress.com', url.resolve( list.URL, 'edit' ) );
	},

	highlightNewTag: function( tag ) {
		process.nextTick( function() {
			page( '/tag/' + tag.slug );
			window.scrollTo( 0, 0 );
		} );
	},

	render: function() {
		return (
			<Sidebar onClick={ this.handleClick }>
				<SidebarMenu>
					<SidebarHeading>{ this.translate( 'Streams' ) }</SidebarHeading>
					<ul>
						<li className={ this.itemLinkClass( '/', { 'sidebar-streams__following': true } ) }>
							<a href="/">
								<Gridicon icon="checkmark-circle" size={ 24 } />
								<span className="menu-link-text">{ this.translate( 'Followed Sites' ) }</span>
							</a>
							<a href="/following/edit" className="add-new">{ this.translate( 'Manage' ) }</a>
						</li>

						<ReaderSidebarTeams teams={ this.state.teams } />

						{
							discoverHelper.isEnabled()
							? (
									<li className={ this.itemLinkClass( '/discover', { 'sidebar-streams__discover': true } ) }>
										<a href="/discover">
											<Gridicon icon="my-sites" />
											<span className="menu-link-text">{ this.translate( 'Discover' ) }</span>
										</a>
									</li>
								) : null
						}

						{
							config.isEnabled( 'reader/recommendations' )
							? ( <li className={ this.itemLinkClassStartsWithOneOf( [ '/recommendations', '/tags' ], { 'sidebar-streams__recommendations': true } ) }>
									<a href="/recommendations">
										<svg className="gridicon menu-link-icon" version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 24 24"><g><path d="M7.189,12.664l0.624-0.046l0.557-0.409l0.801-1.115l0.578-1.228l0.357-0.91l0.223-0.523l0.267-0.432 l0.49-0.409l0.578-0.5l0.445-0.682l0.267-1.046l0.29-1.934V3.159L12.931,3l0.467,0.046l0.534,0.227l0.49,0.363L14.8,4.25 l0.177,0.75V5.66l-0.088,0.865l-0.223,0.615l-0.378,0.75l-0.2,0.5l-0.246,0.546l-0.133,0.5v0.432l0.111,0.273l2.38-0.023 l1.135,0.069l0.823,0.113l0.49,0.159l0.288,0.319l0.424,0.523l0.156,0.454v0.319l-0.09,0.296l-0.2,0.227l-0.29,0.5l0.111,0.296 l0.223,0.409l0.201,0.204l0.111,0.364l-0.09,0.273l-0.267,0.296l-0.267,0.34l-0.111,0.364l0.088,0.319l0.157,0.363l0.11,0.342v0.25 l-0.11,0.363l-0.223,0.273l-0.313,0.296l-0.223,0.273l-0.088,0.273v0.319l0.023,0.409l-0.111,0.25l-0.313,0.342l-0.4,0.363 c0,0-0.156,0.137-0.378,0.25c-0.223,0.114-0.868,0.273-0.868,0.273l-0.846,0.091l-1.868-0.023l-1.937-0.091l-1.379-0.159 l-2.916-0.523L7.189,12.664z M3,13.986c0-0.939,0.761-1.7,1.702-1.7c0.939,0,1.702,0.762,1.702,1.7v4.596 c0,0.939-0.762,1.7-1.702,1.7C3.761,20.283,3,19.52,3,18.582V13.986z"/></g></svg>
										<span className="menu-link-text">{ this.translate( 'Recommendations' ) }</span>
									</a>
							</li> )
							: ( <li className={ this.itemLinkClass( '/recommendations', { 'sidebar-streams__recommendations': true } ) }>
								<a href="https://wordpress.com/recommendations/" rel="external">
									<Gridicon icon="star-outline" />
									<span className="menu-link-text">{ this.translate( 'Recommended Blogs' ) }</span>
								</a>
							</li> )
						}

						<li className={ this.itemLinkClass( '/activities/likes', { 'sidebar-activity__likes': true } ) }>
							<a href="/activities/likes">
								<Gridicon icon="star" size={ 24 } />
								<span className="menu-link-text">{ this.translate( 'My Likes' ) }</span>
							</a>
						</li>
					</ul>
				</SidebarMenu>

				<ReaderSidebarLists lists={ this.state.lists } path={ this.props.path } />
				<ReaderSidebarTags tags={ this.state.tags } />
			</Sidebar>
		);
	}
} );

export default ReaderSidebar;
