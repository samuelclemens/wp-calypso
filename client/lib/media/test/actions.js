/* eslint-disable vars-on-top */
require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
var sinon = require( 'sinon' ),
	sinonChai = require( 'sinon-chai' ),
	expect = require( 'chai' ).use( sinonChai ).expect,
	rewire = require( 'rewire' ),
	assign = require( 'lodash/assign' ),
	isPlainObject = require( 'lodash/isPlainObject' ),
	mockery = require( 'mockery' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	PostEditStore = require( 'lib/posts/post-edit-store' ),
	MediaListStore = require( '../list-store' );

/**
 * Module variables
 */
var DUMMY_SITE_ID = 1,
	DUMMY_ITEM = { ID: 100, title: 'Sunset' },
	DUMMY_UPLOAD = {
		lastModified: '2015-06-19T09:36:09-04:00',
		lastModifiedDate: '2015-06-19T09:36:09-04:00',
		name: 'my-file.jpg',
		size: 21165,
		type: 'image/jpeg'
	},
	DUMMY_URL = 'https://wordpress.com/i/stats-icon.gif',
	DUMMY_API_RESPONSE = {
		media: [ { title: 'Image' } ],
		meta: { next_page: 'value%3D2015-03-04T14%253A38%253A21%252B00%253A00%26id%3D2135' }
	},
	DUMMY_QUERY = { mime_type: 'audio/' };

describe( 'MediaActions', function() {
	var mediaGet, mediaList, mediaAdd, mediaAddUrls, mediaUpdate, mediaDelete, MediaActions, sandbox;

	before( function() {
		mockery.enable( { warnOnReplace: false, warnOnUnregistered: false } );
		mockery.registerMock( './library-selected-store', {
			getAll: function() {
				return [ DUMMY_ITEM ];
			}
		} );
		mockery.registerMock( './store', {
			get: function() {
				return DUMMY_ITEM;
			}
		} );
		mockery.registerMock( 'lib/wp', {
			site: function( siteId ) {
				return {
					addMediaFiles: mediaAdd.bind( siteId ),
					addMediaUrls: mediaAddUrls.bind( siteId ),
					mediaList: mediaList.bind( siteId ),
					media: function( mediaId ) {
						return {
							get: mediaGet.bind( [ siteId, mediaId ].join() ),
							update: mediaUpdate.bind( [ siteId, mediaId ].join() ),
							delete: mediaDelete.bind( [ siteId, mediaId ].join() )
						};
					}
				};
			}
		} );
		mockery.registerMock( 'lodash/uniqueId', function() {
			return 'media-1';
		} );
		mockery.registerMock( 'lodash/isPlainObject', function( obj ) {
			// In the browser, our DUMMY_UPLOAD will be an instanceof
			// window.File, but File is not provided by jsdom
			if ( obj === DUMMY_UPLOAD ) {
				return false;
			}

			return isPlainObject( obj );
		} );

		MediaActions = rewire( '../actions' );
	} );

	beforeEach( function() {
		sandbox = sinon.sandbox.create();
		sandbox.stub( Dispatcher, 'handleServerAction' );
		sandbox.stub( Dispatcher, 'handleViewAction' );
		mediaGet = sandbox.stub().callsArgWithAsync( 0, null, DUMMY_API_RESPONSE );
		mediaList = sandbox.stub().callsArgWithAsync( 1, null, DUMMY_API_RESPONSE );
		mediaAdd = sandbox.stub().callsArgWithAsync( 2, null, DUMMY_API_RESPONSE );
		mediaAddUrls = sandbox.stub().callsArgWithAsync( 2, null, DUMMY_API_RESPONSE );
		mediaUpdate = sandbox.stub().callsArgWithAsync( 1, null, DUMMY_API_RESPONSE );
		mediaDelete = sandbox.stub().callsArgWithAsync( 0, null, DUMMY_API_RESPONSE );
		MediaActions.__set__( '_fetching', {} );
		window.FileList = function() {};
		window.URL = { createObjectURL: sandbox.stub() };
	} );

	afterEach( function() {
		sandbox.restore();
		delete window.FileList;
		delete window.URL;
	} );

	after( function() {
		mockery.deregisterAll();
		mockery.disable();
	} );

	describe( '#setQuery()', function() {
		it( 'should dispatch the SET_MEDIA_QUERY action', function() {
			MediaActions.setQuery( DUMMY_SITE_ID, DUMMY_QUERY );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'SET_MEDIA_QUERY',
				siteId: DUMMY_SITE_ID,
				query: DUMMY_QUERY
			} );
		} );
	} );

	describe( '#fetch()', function() {
		it( 'should call to the WordPress.com REST API', function( done ) {
			Dispatcher.handleViewAction.restore();
			sandbox.stub( Dispatcher, 'handleViewAction', function() {
				expect( MediaActions.__get__( '_fetching' ) ).to.have.all.keys( [ [ DUMMY_SITE_ID, DUMMY_ITEM.ID ].join() ] );
			} );

			MediaActions.fetch( DUMMY_SITE_ID, DUMMY_ITEM.ID );

			expect( Dispatcher.handleViewAction ).to.have.been.calledOnce;
			expect( mediaGet ).to.have.been.calledOn( [ DUMMY_SITE_ID, DUMMY_ITEM.ID ].join() );
			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'RECEIVE_MEDIA_ITEM',
					error: null,
					siteId: DUMMY_SITE_ID,
					data: DUMMY_API_RESPONSE
				} );

				done();
			} );
		} );

		it( 'should not allow simultaneous request for the same item', function() {
			MediaActions.fetch( DUMMY_SITE_ID, DUMMY_ITEM.ID );
			MediaActions.fetch( DUMMY_SITE_ID, DUMMY_ITEM.ID );

			expect( mediaGet ).to.have.been.calledOnce;
		} );

		it( 'should allow simultaneous request for different items', function() {
			MediaActions.fetch( DUMMY_SITE_ID, DUMMY_ITEM.ID );
			MediaActions.fetch( DUMMY_SITE_ID, DUMMY_ITEM.ID + 1 );

			expect( mediaGet ).to.have.been.calledTwice;
		} );
	} );

	describe( '#fetchNextPage()', function() {
		it( 'should call to the WordPress.com REST API', function( done ) {
			var query = MediaListStore.getNextPageQuery( DUMMY_SITE_ID );

			MediaActions.fetchNextPage( DUMMY_SITE_ID );

			expect( mediaList ).to.have.been.calledOn( DUMMY_SITE_ID );
			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'RECEIVE_MEDIA_ITEMS',
					error: null,
					siteId: DUMMY_SITE_ID,
					data: DUMMY_API_RESPONSE,
					query: query
				} );

				done();
			} );
		} );
	} );

	describe( '#add()', function() {
		it( 'should accept a single upload', function() {
			MediaActions.add( DUMMY_SITE_ID, DUMMY_UPLOAD );
			expect( mediaAdd ).to.have.been.calledOnce;
		} );

		it( 'should accept an array of uploads', function() {
			MediaActions.add( DUMMY_SITE_ID, [ DUMMY_UPLOAD, DUMMY_UPLOAD ] );
			expect( mediaAdd ).to.have.been.calledTwice;
		} );

		it( 'should accept a file URL', function() {
			MediaActions.add( DUMMY_SITE_ID, DUMMY_URL );
			expect( mediaAddUrls ).to.have.been.calledWithMatch( {}, DUMMY_URL );
		} );

		it( 'should accept a FileList of uploads', function() {
			var uploads = [ DUMMY_UPLOAD, DUMMY_UPLOAD ];
			uploads.__proto__ = new window.FileList(); // eslint-disable-line no-proto
			sandbox.stub( Array, 'isArray' ).returns( false );
			MediaActions.add( DUMMY_SITE_ID, uploads );
			expect( mediaAdd ).to.have.been.calledTwice;
		} );

		it( 'should accept a plain object file descriptor', function() {
			var file = { file: DUMMY_UPLOAD, parent_id: 300 };
			sandbox.stub( PostEditStore, 'get' ).returns( { ID: 200 } );

			MediaActions.add( DUMMY_SITE_ID, file );

			expect( mediaAdd ).to.have.been.calledWithMatch( {}, file );
		} );

		it( 'should call to the WordPress.com REST API', function( done ) {
			MediaActions.add( DUMMY_SITE_ID, DUMMY_UPLOAD );

			expect( mediaAdd ).to.have.been.calledWithMatch( {}, DUMMY_UPLOAD );

			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'RECEIVE_MEDIA_ITEM',
					error: null,
					siteId: DUMMY_SITE_ID,
					id: 'media-1',
					data: DUMMY_API_RESPONSE.media[ 0 ]
				} );

				done();
			} );
		} );

		it( 'should immediately receive a transient object', function() {
			MediaActions.add( DUMMY_SITE_ID, DUMMY_UPLOAD );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'CREATE_MEDIA_ITEM',
				data: {
					ID: 'media-1',
					file: DUMMY_UPLOAD.name,
					transient: true
				}
			} );
		} );

		it( 'should attach file upload to a post if one is being edited', function() {
			sandbox.stub( PostEditStore, 'get' ).returns( { ID: 200 } );

			MediaActions.add( DUMMY_SITE_ID, DUMMY_UPLOAD );

			expect( mediaAdd ).to.have.been.calledWithMatch( {}, {
				file: DUMMY_UPLOAD,
				parent_id: 200
			} );
		} );

		it( 'should attach URL upload to a post if one is being edited', function() {
			sandbox.stub( PostEditStore, 'get' ).returns( { ID: 200 } );

			MediaActions.add( DUMMY_SITE_ID, DUMMY_URL );

			expect( mediaAddUrls ).to.have.been.calledWithMatch( {}, {
				url: DUMMY_URL,
				parent_id: 200
			} );
		} );
	} );

	describe( '#edit()', function() {
		var item = { ID: 100, description: 'Example' };

		it( 'should immediately edit the existing item', function() {
			MediaActions.edit( DUMMY_SITE_ID, item );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'RECEIVE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				data: assign( {}, DUMMY_ITEM, item )
			} );
		} );
	} );

	describe( '#update()', function() {
		var item = { ID: 100, description: 'Example' };

		it( 'should accept a single item', function() {
			MediaActions.update( DUMMY_SITE_ID, item );
			expect( mediaUpdate ).to.have.been.calledOnce;
		} );

		it( 'should accept an array of items', function() {
			MediaActions.update( DUMMY_SITE_ID, [ item, item ] );
			expect( mediaUpdate ).to.have.been.calledTwice;
		} );

		it( 'should immediately update the existing item', function() {
			MediaActions.update( DUMMY_SITE_ID, item );

			expect( mediaUpdate ).to.have.been.calledWithMatch( item );
			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'RECEIVE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				data: assign( {}, DUMMY_ITEM, item )
			} );
		} );

		it( 'should call to the WordPress.com REST API', function( done ) {
			MediaActions.update( DUMMY_SITE_ID, item );

			expect( mediaUpdate ).to.have.been.calledWithMatch( item );

			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'RECEIVE_MEDIA_ITEM',
					error: null,
					siteId: DUMMY_SITE_ID,
					data: DUMMY_API_RESPONSE
				} );

				done();
			} );
		} );
	} );

	describe( '#delete()', function() {
		var item = { ID: 100 };

		it( 'should accept a single item', function() {
			MediaActions.delete( DUMMY_SITE_ID, item );
			expect( mediaDelete ).to.have.been.calledOnce;
		} );

		it( 'should accept an array of items', function() {
			MediaActions.delete( DUMMY_SITE_ID, [ item, item ] );
			expect( mediaDelete ).to.have.been.calledTwice;
		} );

		it( 'should call to the WordPress.com REST API', function( done ) {
			MediaActions.delete( DUMMY_SITE_ID, item );

			expect( mediaDelete ).to.have.been.calledOn( [ DUMMY_SITE_ID, item.ID ].join() );
			process.nextTick( function() {
				expect( Dispatcher.handleServerAction ).to.have.been.calledWithMatch( {
					type: 'REMOVE_MEDIA_ITEM',
					error: null,
					siteId: DUMMY_SITE_ID,
					data: DUMMY_API_RESPONSE
				} );

				done();
			} );
		} );

		it( 'should immediately remove the item', function() {
			MediaActions.delete( DUMMY_SITE_ID, item );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'REMOVE_MEDIA_ITEM',
				siteId: DUMMY_SITE_ID,
				data: item
			} );
		} );
	} );

	describe( '#clearValidationErrors()', function() {
		it( 'should dispatch the `CLEAR_MEDIA_VALIDATION_ERRORS` action with the specified siteId', function() {
			MediaActions.clearValidationErrors( DUMMY_SITE_ID );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'CLEAR_MEDIA_VALIDATION_ERRORS',
				siteId: DUMMY_SITE_ID,
				itemId: undefined
			} );
		} );

		it( 'should dispatch the `CLEAR_MEDIA_VALIDATION_ERRORS` action with the specified siteId and itemId', function() {
			MediaActions.clearValidationErrors( DUMMY_SITE_ID, DUMMY_ITEM.ID );

			expect( Dispatcher.handleViewAction ).to.have.been.calledWithMatch( {
				type: 'CLEAR_MEDIA_VALIDATION_ERRORS',
				siteId: DUMMY_SITE_ID,
				itemId: DUMMY_ITEM.ID
			} );
		} );
	} );
} );
