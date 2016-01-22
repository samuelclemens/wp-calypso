/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Dialog from 'components/dialog';
import { getPurchase, isDataLoading } from '../utils';
import { getName, isRemovable } from 'lib/purchases';
import Gridicon from 'components/gridicon';
import { isDomainRegistration } from 'lib/products-values';
import notices from 'notices';
import purchasePaths from '../paths';
import { removePurchase } from 'lib/upgrades/actions';

const RemovePurchase = React.createClass( {
	propTypes: {
		selectedPurchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.object,
			React.PropTypes.bool
		] ).isRequired,
		user: React.PropTypes.object.isRequired
	},

	getInitialState() {
		return {
			isDialogVisible: false,
			isRemoving: false
		};
	},

	closeDialog() {
		this.setState( { isDialogVisible: false } );
	},

	openDialog( event ) {
		event.preventDefault();

		this.setState( { isDialogVisible: true } );
	},

	removePurchase( closeDialog ) {
		this.setState( { isRemoving: true } );

		const purchase = getPurchase( this.props ),
			{ selectedSite, user } = this.props;

		removePurchase( purchase.id, user.ID, success => {
			if ( success ) {
				if ( isDomainRegistration( purchase ) ) {
					notices.success(
						this.translate( `The domain {{em}}%(domain)s{{/em}} was removed from {{em}}%(wpcomUrl)s{{/em}}.`, {
							args: {
								domain: purchase.meta,
								wpcomUrl: selectedSite.wpcom_url
							},
							components: { em: <em /> }
						} ),
						{ persistent: true }
					);
				} else {
					notices.success(
						this.translate( `The purchase was removed from {{em}}%(siteSlug)s{{/em}}.`, {
							args: { siteSlug: selectedSite.slug },
							components: { em: <em /> }
						} ),
						{ persistent: true }
					);
				}

				page( purchasePaths.list() );
			} else {
				this.setState( { isRemoving: false } );

				closeDialog();

				notices.error( this.props.selectedPurchase.error );
			}
		} );
	},

	renderCard() {
		const productName = getName( getPurchase( this.props ) );

		return (
			<CompactCard className="remove-purchase__card" onClick={ this.openDialog }>
				<a >
					<Gridicon icon="trash" />
					{ this.translate( 'Remove %(productName)s', { args: { productName } } ) }
				</a>
			</CompactCard>
		);
	},

	renderDialog() {
		const buttons = [ {
				action: 'cancel',
				disabled: this.state.isRemoving,
				label: this.translate( 'Cancel' )
			},
			{
				action: 'remove',
				disabled: this.state.isRemoving,
				isPrimary: true,
				label: this.translate( 'Remove Now' ),
				onClick: this.removePurchase
			} ],
			purchase = getPurchase( this.props ),
			productName = getName( purchase );

		return (
			<Dialog
				buttons={ buttons }
				className="remove-purchase__dialog"
				isVisible={ this.state.isDialogVisible }
				onClose={ this.closeDialog }>
				<h1>{ this.translate( 'Remove %(productName)s', { args: { productName } } ) }</h1>
				{ this.renderDialogText() }
			</Dialog>
		);
	},

	renderDialogText() {
		const purchase = getPurchase( this.props ),
			productName = getName( purchase );

		if ( isDomainRegistration( purchase ) ) {
			return (
				<p>
					{
						this.translate( 'This will remove %(domain)s from your account.', {
							args: { domain: productName },
							components: { em: <em /> }
						} )
					}
					{ ' ' }
					{ this.translate( 'By removing, you are canceling the domain registration. This may stop you from using it again, even with another service.' ) }
				</p>
			);
		}

		return (
			<p>
				{
					this.translate( 'Are you sure you want to remove %(productName)s from {{em}}%(domain)s{{/em}}?', {
						args: { productName, domain: this.props.selectedSite.slug },
						components: { em: <em /> }
					} )
				}
				{ ' ' }
				{ this.translate( 'By removing it, you will not be able to reuse it again without purchasing a new subscription.' ) }
			</p>
		);
	},

	render() {
		if ( isDataLoading( this.props ) ) {
			return null;
		}

		const purchase = getPurchase( this.props );

		if ( ! isRemovable( purchase ) ) {
			return null;
		}

		return (
			<span>
				{ this.renderCard() }
				{ this.renderDialog() }
			</span>
		);
	}
} );

export default RemovePurchase;
