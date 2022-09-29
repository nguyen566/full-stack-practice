//Many to Many relationship: user <--> posts
import { ObjectType } from "type-graphql";
import { Entity, Column, BaseEntity, ManyToOne, PrimaryColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
//extends allows CRUD simplification for Typeorm
export class Updoot extends BaseEntity {
	//@Field exposes the column to frontend users
	@Column({type: "int"})
	value: number;

	@PrimaryColumn()
	userId: number;

	@ManyToOne(() => User, (user) => user.updoots)
	user: User;

	@PrimaryColumn()
	postId: number;

	//Creates a foreign key
	//Added in cascading delete
	@ManyToOne(() => Post, (post) => post.updoots, {
		onDelete: 'CASCADE'
	})
	post: Post;
}
