import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import {
	Resolver,
	Query,
	Arg,
	Mutation,
	InputType,
	Field,
	Ctx,
	UseMiddleware,
	Int,
	FieldResolver,
	Root,
	ObjectType,
} from "type-graphql";
import { Post } from "../entities/Post";
import { getConnection } from "typeorm";

@InputType()
class PostInput {
	@Field()
	title: string;
	@Field()
	text: string;
}

//Checking if there are any more object (posts) returned
@ObjectType()
class PaginatedPosts {
	@Field(() => [Post])
	posts: Post[];
	@Field()
	hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => String) 
	textSnippet(@Root() root: Post) {
		return root.text.slice(0, 50);
	}

	@Query(() => PaginatedPosts)
	async posts(
		//Limit puts a restriction on how many results you get from your query
		@Arg("limit", () => Int) limit: number,
		//Selecting all queries after a certain requirement ex. ascending or newest posts
		@Arg("cursor", () => String, { nullable: true }) cursor: string | null
	): Promise<PaginatedPosts> {
		//Checking if we are getting more posts
		const realLimit = Math.min(50, limit);
		const realLimitPlusOne = realLimit + 1;
		const qb = getConnection()
			.getRepository(Post)
			.createQueryBuilder("p")
			.orderBy('"createdAt"', "DESC")
			.take(realLimitPlusOne);

		if (cursor) {
			qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });
		}

		const posts = await qb.getMany();

		//.getMany or getOne activates the query
		return {
			posts: posts.slice(0, realLimit),
			hasMore: posts.length === realLimitPlusOne,
		};
	}

	@Query(() => Post, { nullable: true })
	post(@Arg("id") id: number): Promise<Post | undefined> {
		return Post.findOne(id);
	}

	@Mutation(() => Post)
	//use middleware as error handling
	@UseMiddleware(isAuth)
	async createPost(
		@Arg("input") input: PostInput,
		@Ctx() { req }: MyContext
	): Promise<Post> {
		//2 sql queries in 1
		return Post.create({
			...input,
			creatorId: req.session!.userId,
		}).save();
	}

	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg("id") id: number,
		@Arg("title", () => String, { nullable: true }) title: string
	): Promise<Post | undefined> {
		const post = await Post.findOne(id);
		if (!post) {
			return undefined;
		}
		if (typeof title !== "undefined") {
			await Post.update({ id }, { title });
		}

		return post;
	}

	@Mutation(() => Boolean)
	async deletePost(@Arg("id") id: number): Promise<boolean> {
		await Post.delete(id);
		return true;
	}
}
