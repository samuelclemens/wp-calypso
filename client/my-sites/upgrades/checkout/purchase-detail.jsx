/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const PurchaseDetail = ( { additionalClass, buttonText, description, onButtonClick, title } ) => (
	<li className={ 'purchase-detail ' + additionalClass }>
		<div className="purchase-detail-text">
			<h3>{ title }</h3>
			<p>{ description }</p>
		</div>
		<Button onClick={ onButtonClick } primary>
			{ buttonText }
		</Button>
	</li>
);

export default PurchaseDetail;
