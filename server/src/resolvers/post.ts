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
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";

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
	//FieldResolvers will only run if included in Query
	@FieldResolver(() => String)
	textSnippet(@Root() post: Post) {
		return post.text.slice(0, 50);
	}

	@FieldResolver(() => User)
	creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
		return userLoader.load(post.creatorId);
	}

	@FieldResolver(() => Int, { nullable: true })
	async voteStatus(
		@Root() post: Post,
		@Ctx() { updootLoader, req }: MyContext
	) {
		if (!req.session.userId) {
			return null;
		}

		const updoot = await updootLoader.load({
			postId: post.id,
			userId: req.session.userId,
		});

		return updoot ? updoot.value : null;
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async vote(
		@Arg("postId", () => Int) postId: number,
		@Arg("value", () => Int) value: number,
		@Ctx() { req }: MyContext
	) {
		const isUpdoot = value !== -1;
		const realValue = isUpdoot ? 1 : -1;
		const userId = req.session.userId;

		const updoot = await Updoot.findOne({ where: { postId, userId } });

		//user has voted on post before and changing vote
		if (updoot && updoot.value !== realValue) {
			await getConnection().transaction(async (tm) => {
				await tm.query(
					`
					update updoot
					set value = $1
					where "postId" = $2 and "userId" = $3
					`,
					[realValue, postId, userId]
				);
				await tm.query(
					`
				update post 
				set points = points + $1
				where id = $2
				`,
					[2 * realValue, postId]
				);
			});
			//user does not have a vote
		} else if (!updoot) {
			//Transaction error requires rolling back if error (typeorm can handle)
			await getConnection().transaction(async (tm) => {
				tm.query(
					`
				insert into updoot ("userId", "postId", "value")
				values($1, $2, $3)
				`,
					[userId, postId, realValue]
				);

				await tm.query(
					`
				update post 
				set points = points + $1
				where id = $2
				`,
					[realValue, postId]
				);
			});
		}

		return true;
	}

	@Query(() => PaginatedPosts)
	async posts(
		//Limit puts a restriction on how many results you get from your query
		@Arg("limit", () => Int) limit: number,
		//Selecting all queries after a certain requirement ex. ascending or newest posts
		@Arg("cursor", () => String, { nullable: true }) cursor: string | null,
		@Ctx() {}: MyContext
	): Promise<PaginatedPosts> {
		//Checking if we are getting more posts
		const realLimit = Math.min(50, limit);
		const realLimitPlusOne = realLimit + 1;

		const replacements: any[] = [realLimitPlusOne];

		if (cursor) {
			replacements.push(new Date(parseInt(cursor)));
		}

		const posts = await getConnection().query(
			`select p.*
			from post p
			${cursor ? `where p."createdAt" < $2` : ""}
			order by p."createdAt" DESC
			limit $1
			`,
			replacements
		);

		return {
			posts: posts.slice(0, realLimit),
			hasMore: posts.length === realLimitPlusOne,
		};
	}

	@Query(() => Post, { nullable: true })
	post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
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
			creatorId: req.session.userId,
		}).save();
	}

	@Mutation(() => Post, { nullable: true })
	@UseMiddleware(isAuth)
	async updatePost(
		@Arg("id", () => Int) id: number,
		@Arg("title", () => String) title: string,
		@Arg("text", () => String) text: string,
		@Ctx() { req }: MyContext
	): Promise<Post | undefined> {
		const result = await getConnection()
			.createQueryBuilder()
			.update(Post)
			.set({ title, text })
			.where(`id = :id and "creatorId" = :creatorId`, {
				id,
				creatorId: req.session.userId,
			})
			.returning("*")
			.execute();

		return result.raw[0];
	}

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async deletePost(
		@Arg("id", () => Int) id: number,
		@Ctx() { req }: MyContext
	): Promise<boolean> {
		//can only delete posts you own using cascading delete
		await Post.delete({ id, creatorId: req.session.userId });
		return true;
	}
}
