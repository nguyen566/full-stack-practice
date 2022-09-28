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

	@Mutation(() => Boolean)
	@UseMiddleware(isAuth)
	async vote(
		@Arg("postId", () => Int) postId: number,
		@Arg("value", () => Int) value: number,
		@Ctx() { req }: MyContext
	) {
		const isUpdoot = value !== -1;
		const realValue = isUpdoot ? 1 : -1;
		const userId = req.session!.userId;

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
					[2*realValue, postId]
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
		@Arg("cursor", () => String, { nullable: true }) cursor: string | null
	): Promise<PaginatedPosts> {
		//Checking if we are getting more posts
		const realLimit = Math.min(50, limit);
		const realLimitPlusOne = realLimit + 1;
		const replacements: any[] = [realLimitPlusOne];

		if (cursor) {
			replacements.push(new Date(parseInt(cursor)));
		}

		const posts = await getConnection().query(
			`select p.*,
			json_build_object(
				'id', u.id,
				'username', u.username,
				'email', u.email,
				'createdAt', u."createdAt",
				'updatedAt', u."updatedAt"
			) creator
			from post p
			inner join public.user u on u.id = p."creatorId"
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
