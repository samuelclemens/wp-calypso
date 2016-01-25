/**
 * External dependencies
 */
var React = require( 'react' ),
	bindActionCreators = require( 'redux' ).bindActionCreators,
	connect = require( 'react-redux' ).connect,
	pick = require( 'lodash/object/pick' );

/**
 * Internal dependencies
 */
var Main = require( 'components/main' ),
	Action = require( 'lib/themes/actions' ),
	WebPreview = require( 'components/web-preview' ),
	Button = require( 'components/button' ),
	SidebarNavigation = require( 'my-sites/sidebar-navigation' ),
	ThemesSiteSelectorModal = require( './themes-site-selector-modal' ),
	ThemesSelection = require( './themes-selection' ),
	ThemeHelpers = require( 'lib/themes/helpers' ),
	getButtonOptions = require( './theme-options' ).getButtonOptions,
	addTracking = require( './theme-options' ).addTracking,
	actionLabels = require( './action-labels' ),
	ThemesListSelectors = require( 'lib/themes/selectors/themes-list' ),
	getCurrentUser = require( 'state/current-user/selectors' ).getCurrentUser;

var Themes = React.createClass( {
	propTypes: {
		isLoggedOut: React.PropTypes.bool.isRequired
	},

	getInitialState: function() {
		return {
			selectedTheme: null,
			selectedAction: null,
		};
	},

	showSiteSelectorModal: function( action, theme ) {
		this.setState( { selectedTheme: theme, selectedAction: action } );
	},

	togglePreview: function( theme ) {
		const previewUrl = ThemeHelpers.getPreviewUrl( theme );
		this.setState( { showPreview: ! this.state.showPreview, previewUrl: previewUrl, previewingTheme: theme } );
	},

	hideSiteSelectorModal: function() {
		this.showSiteSelectorModal( null, null );
	},

	isThemeOrActionSet: function() {
		return this.state.selectedTheme || this.state.selectedAction;
	},

	render: function() {
		var dispatch = this.props.dispatch,
			buttonOptions = getButtonOptions(
				false,
				this.props.isLoggedOut,
				bindActionCreators( Action, dispatch ),
				this.showSiteSelectorModal,
				this.togglePreview
			),
			getScreenshotAction = function() {
				return buttonOptions.preview;
			};

		const webPreviewButtonText = this.props.isLoggedOut
			? this.translate( 'Choose this design', {
				comment: 'when signing up for a WordPress.com account with a selected theme'
			} )
			: this.translate( 'Try & Customize', {
				context: 'when previewing a theme demo, this button opens the Customizer with the previewed theme'
			} );

		return (
			<Main className="themes">
				{ this.props.isLoggedOut ? null : <SidebarNavigation /> }
				{ this.state.showPreview &&
					<WebPreview showPreview={ this.state.showPreview }
						onClose={ this.togglePreview }
						previewUrl={ this.state.previewUrl } >
						<Button primary onClick={ this.setState.bind( this, { showPreview: false },
							() => {
								if ( this.props.isLoggedOut ) {
									dispatch( Action.signup( this.state.previewingTheme ) );
								} else {
									buttonOptions.customize.action( this.state.previewingTheme );
								}
							} ) } >{ webPreviewButtonText }</Button>
					</WebPreview>
				}
				<ThemesSelection search={ this.props.search }
					siteId={ false }
					selectedSite={ false }
					onScreenshotClick={ function( theme ) {
						getScreenshotAction( theme ).action( theme );
					} }
					getActionLabel={ function( theme ) {
						return getScreenshotAction( theme ).label
					} }
					getOptions={ function( theme ) {
						return pick(
							addTracking( buttonOptions ),
							option => ! ( option.hideForTheme && option.hideForTheme( theme ) )
						); } }
					trackScrollPage={ this.props.trackScrollPage }
					tier={ this.props.tier }
					queryParams={ this.props.queryParams }
					themesList={ this.props.themesList } />
				{ this.isThemeOrActionSet() && <ThemesSiteSelectorModal
					name={ this.state.selectedAction /* TODO: Can we get rid of this prop? */ }
					label={ actionLabels[ this.state.selectedAction ].label }
					header={ actionLabels[ this.state.selectedAction ].header }
					selectedTheme={ this.state.selectedTheme }
					onHide={ this.hideSiteSelectorModal }
					action={ bindActionCreators( Action[ this.state.selectedAction ], dispatch ) }
				/> }
			</Main>
		);
	}
} );

export default connect(
	( state, props ) => Object.assign( {},
		props,
		{
			queryParams: ThemesListSelectors.getQueryParams( state ),
			themesList: ThemesListSelectors.getThemesList( state ),
			isLoggedOut: ! getCurrentUser( state )
		}
	)
)( Themes );
