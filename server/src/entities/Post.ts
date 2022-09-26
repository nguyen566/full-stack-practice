import { Field, ObjectType } from "type-graphql";
import {
	Entity,
	CreateDateColumn,
	UpdateDateColumn,
	Column,
	PrimaryGeneratedColumn,
	BaseEntity,
	ManyToOne,
} from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
//extends allows CRUD simplification for Typeorm
export class Post extends BaseEntity {
	//@Field exposes the column to frontend users
	@Field()
	@PrimaryGeneratedColumn()
	id!: number;

	@Field()
	@Column()
	title!: string;

	@Field()
	@Column()
	//Adding !: specifies that the fields cannot be null
	text!: string;

	@Field()
	@Column({ type: "int", default: 0 })
	points!: number;

	//Identifier for foreign key
	@Field()
	@Column()
	creatorId: number;

	//Creates a foreign key
	@Field()
	@ManyToOne(() => User, (user) => user.posts)
	creator: User;

	@Field(() => String)
	@CreateDateColumn()
	createdAt: Date;

	@Field(() => String)
	@UpdateDateColumn()
	updatedAt: Date;
}
