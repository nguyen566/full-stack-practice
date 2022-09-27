import { Field, ObjectType } from "type-graphql";
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";
import { Updoot } from "./Updoot";

@ObjectType()
@Entity()
//extends allows CRUD simplification for Typeorm
export class User extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn()
	id!: number;

	@Field()
	@Column({ unique: true })
	username: string;

	@Column()
	password: string;

	@Field()
	@Column({ unique: true })
	email: string;

	//Receiving end for foreign key
	@OneToMany(() => Post, (post) => post.creator)
	posts: Post[];

	@OneToMany(() => Updoot, (updoot) => updoot.user)
	updoots: Updoot[];

	@Field(() => String)
	@CreateDateColumn()
	createdAt = Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt = Date;
}
