require( 'lib/react-test-env-setup' )();
/**
 * External dependencies
 */
import { expect } from 'chai';
import mockery from 'mockery';

describe( 'state', () => {
	var createReduxStore;
	before( () => {
		mockery.registerMock( 'lib/themes/middlewares.js', {
			// stub redux middleware
			// see: http://rackt.org/redux/docs/advanced/Middleware.html
			analyticsMiddleware: store => next => next
		} );
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );
		createReduxStore = require( 'state' ).createReduxStore;
	} );
	after( () => {
		mockery.deregisterAll();
		mockery.disable();
	} );
	describe( 'createReduxStore', () => {
		it( 'can be called without specifying initialState', () => {
			const reduxStoreNoArgs = createReduxStore().getState();
			const reduxStoreWithEmptyState = createReduxStore( {} ).getState();
			const reduxStoreWithNullState = createReduxStore( null ).getState();
			expect( reduxStoreNoArgs ).to.eql( reduxStoreWithEmptyState );
			expect( reduxStoreWithNullState ).to.eql( reduxStoreWithEmptyState );
		} );
		it( 'is instantiated with initialState', () => {
			const user = { ID: 1234, display_name: 'test user',  username: 'testuser' };
			const initialState = {
				currentUser: { id: 1234 },
				users: { items: { 1234: user } }
			};
			const reduxStoreWithCurrentUser = createReduxStore( initialState ).getState();
			expect( reduxStoreWithCurrentUser.currentUser ).to.eql( { id: 1234 } );
			expect( Object.keys( reduxStoreWithCurrentUser.users.items ).length ).to.eql( 1 );
			expect( reduxStoreWithCurrentUser.users.items[ 1234 ] ).to.eql( user );
		} );
	} );
} );
