/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import {
	getPostComments,
	haveMoreCommentsToFetch
} from 'state/comments/selectors';
import {
	requestPostComments
} from 'state/comments/actions';
import PostTime from 'reader/post-time';
import Gravatar from 'components/gravatar';
import Gridicon from 'components/gridicon';

class Comment extends React.Component {

	constructor() {
		super();

		this.state = {
			viewReplies: false
		};
	}

	viewRepliesClickHandler() {
		this.setState( { viewReplies: ! this.state.viewReplies } );
	}

	renderChildren() {
		const commentChildrenIds = this.props.comments.getIn( [ this.props.commentId, 'children' ] ).toJS();

		if ( commentChildrenIds.length > 0 ) {
			if ( this.state.viewReplies ) {
				return <ol>
						{ commentChildrenIds.reverse().map( ( commentId ) => <Comment key={ commentId } depth={ this.props.depth + 1 } commentId={ commentId } comments={ this.props.comments } /> ) }
						</ol>
			} else {
				return <button style={ {'backgroundColor': '#F4F6F8', 'width': '100%', 'textAlign': 'left' } } onClick={ this.viewRepliesClickHandler.bind( this ) }><Gridicon size={ 12 } icon="reply" /> view { commentChildrenIds.length } replies</button>;
			}
		}

		return null;
	}

	render() {
		if ( ! this.props.commentId ) {
			return null;
		}

		const commentId = this.props.commentId;
		const commentData = this.props.comments.getIn( [ commentId, 'data' ] ).toJS();

		/*eslint-disable react/no-danger*/
		return <li className={ 'comment depth-' + this.props.depth }>
					<div className="comment__author">
						<Gravatar user={ commentData.author } />

						{ commentData.author.URL
							? <a href={ commentData.author.URL } target="_blank" className="comment__username" onClick={ this.recordAuthorClick }>{ commentData.author.name }<Gridicon icon="external" /></a>
							: <strong className="comment__username">{ commentData.author.name }</strong> }
						<small className="comment__timestamp">
							<a href={ commentData.URL }>
								<PostTime date={ commentData.date } />
							</a>
						</small>
					</div>

					<div className="comment__content" dangerouslySetInnerHTML={{ __html: commentData.content }}></div>
					{ this.renderChildren() }
				</li>;

		//return <li className={ 'comment depth-' + this.props.depth }>
		//	<p>{commentId}</p><PostTime date={ commentData.get( 'date' ) } />
		//	<p>{commentChildrenIds.size } replies</p>
		//	{commentChildrenIds.size > 0 ? <ol>{commentChildrenIds.map( ( childCommentId ) => <Comment key={ childCommentId } depth={ this.props.depth + 1 } commentId={ childCommentId } comments={ this.props.comments } />)}</ol> : null }
		//</li>
	}
}


const COMMENTS_PAGE_SIZE = 3;

class PostCommentList extends React.Component {

	constructor() {
		super();
		this.state = {
			amountOfCommentsToTake: COMMENTS_PAGE_SIZE
		};
	}

	componentWillMount() {
		const siteId = this.props.post.site_ID;
		const postId = this.props.post.ID;

		this.props.requestPostComments( siteId, postId );
	}

	renderComment( commentId ) {
		if ( ! commentId ) {
			return null;
		}

		return <Comment key={ commentId } depth={ 0 } commentId={ commentId } comments={ this.props.comments } />
	}

	getChildrenIdsOfType( comments, type ) {
		if ( ! comments ) {
			return null;
		}

		const onlyComments = comments.get( 'children' )
									.filter( ( commentId ) => comments.getIn( [ commentId, 'data', 'type' ] ) === type );

		return onlyComments;
	}

	renderComments( commentIds, take ) {
		if ( ! commentIds ) {
			return null;
		}

		const renderedComments = commentIds.take( take )
											.reverse()
											.map( ( commentId ) => this.renderComment( commentId ) );

		return renderedComments;
	}

	viewEarlierCommentsHandler( ev ) {
		const siteId = this.props.post.site_ID;
		const postId = this.props.post.ID;

		this.setState({ amountOfCommentsToTake: this.state.amountOfCommentsToTake + COMMENTS_PAGE_SIZE } );

		if ( this.props.haveMoreCommentsToFetch ) {
			this.props.requestPostComments( siteId, postId );
		}
	}

	render() {
		if ( ! this.props.comments ) {
			return null;
		}

		const onlyComments = this.getChildrenIdsOfType( this.props.comments, 'comment' );
		const showViewEarlier = ( this.state.amountOfCommentsToTake < onlyComments.size );

		return <div className="comments">
					<div className="comments__top-bar" style={ { 'borderBottom': '1px solid #EBEFF3', 'padding': '6px' } }>
						{ showViewEarlier ? <a href="javascript:void(0)" onClick={this.viewEarlierCommentsHandler.bind(this)}>View earlier comments...</a> : null }
						<h3 className="comments__count" style={ { 'display': 'initial' } }>{ this.props.comments.get('totalCommentsCount') } comments</h3>
					</div>
					<ol className="comments__list is-root">
						{ this.renderComments( onlyComments, this.state.amountOfCommentsToTake ) }
					</ol>
				</div>;
	}
}

PostCommentList.propTypes = {
	post: React.PropTypes.shape( {
		ID: React.PropTypes.number.isRequired,
		site_ID: React.PropTypes.number.isRequired
	} ).isRequired,
	onCommentsUpdate: React.PropTypes.func,

	// connect()ed props:
	comments: React.PropTypes.object.isRequired,
	haveMoreCommentsToFetch: React.PropTypes.bool.isRequired,
	requestPostComments: React.PropTypes.func.isRequired
};

export default connect(
	( state, props ) => Object.assign( {},
		props,
		{
			comments: getPostComments( state, props.post.site_ID, props.post.ID ),
			haveMoreCommentsToFetch: haveMoreCommentsToFetch( state, props.post.site_ID, props.post.ID )
		}
	),
	( dispatch ) => bindActionCreators( {
		requestPostComments
	}, dispatch )
)( PostCommentList );

