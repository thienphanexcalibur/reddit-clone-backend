import { NextFunction, Request, Response } from 'express';
import { Model, Document } from 'mongoose';
import { AppController } from '@controller';
import { IPost, PostModel, UserModel } from '@entity';
import { logger } from '@utils';

export default class PostController {
	constructor() {
		this.addPost = this.addPost.bind(this);
		this.editPost = this.editPost.bind(this);
		this.deletePost = this.deletePost.bind(this);
		this.getPost = this.getPost.bind(this);
		this.getAllPost = this.getAllPost.bind(this);
	}

	async addPost(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { title, content, byUser }: IPost = res.locals.body;
		try {
			const newPost = await PostModel.create({ title, content, byUser } as IPost);
			// Append new post into current user
			const foundUser = await UserModel.findById(byUser);
			foundUser.posts.push(newPost._id);
			await foundUser.save();
			res.status(200).send(newPost);
			next();
		} catch (e) {
			next(e);
		}
	}

	async getAllPost(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const posts = await PostModel.find()
				.populate('byUser', ['fullname', 'username'])
				.populate('comments')
				.sort({
					created_date: -1
				});
			res.send(posts);
			next();
		} catch (e) {
			next(e);
		}
	}

	async editPost(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const { id } = req.params;
			const { title, content, byUser }: IPost = req.body;
			const modifiedPost = (await PostModel.findByIdAndUpdate(id, {
				title,
				content,
				updated_date: Date.now(),
				byUser
			})) as IPost;

			if (modifiedPost) {
				res.send(modifiedPost);
			}
		} catch (e) {
			next(e);
		}
	}

	async deletePost(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { id } = req.params;
		try {
			const deletedPost = (await PostModel.findByIdAndDelete(id)) as IPost;
			if (deletedPost) {
				res.status(200);
			} else {
				res.status(404).send({
					message: 'Post does not exist'
				});
			}
		} catch (e) {
			next(e);
		}
	}

	async getPost(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { id } = req.params;
		try {
			const post = await PostModel.findById(id, '-comments');
			if (post) {
				res.send(post);
			} else {
				res.sendStatus(404).send({
					message: 'Post does not exist'
				});
			}
			next();
		} catch (e) {
			next(e);
		}
	}

	async interact(req: Request, res: Response, next: NextFunction): Promise<void> {
		const { postId, liked = 0, disliked = 0 } = req.body;

		try {
			const post = await PostModel.findById(postId);
			post.liked += liked;
			post.disliked += disliked;
			await post.save();
			res.status(200).send(post);
			next();
		} catch (e) {
			next(e);
		}
	}
}
