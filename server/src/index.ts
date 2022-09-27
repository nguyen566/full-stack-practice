import "reflect-metadata";
import { COOKIE_NAME, __prod__ } from "./constants";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import Redis from "ioredis";
import connectRedis from "connect-redis";
import { MyContext } from "./types";
import cors from "cors";
import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
const session = require("express-session");
import path from "path"; 
import { Updoot } from "./entities/Updoot";

const main = async () => {
	const conn = await createConnection({
		type: "postgres",
		database: "lireddit2",
		username: "postgres",
		password: "admin",
		logging: true,
		//Automatically creates table for you in typeorm
		synchronize: true,
		migrations: [path.join(__dirname, "./migrations/*")],
		entities: [Post, User, Updoot], 
	});

	await conn.runMigrations(); 

	// await Post.delete({});

	const app = express();

	const RedisStore = connectRedis(session);
	const redis = new Redis();

	app.use(
		cors({
			origin: "http://localhost:3000",
			credentials: true,
		})
	);

	app.use(
		session({
			name: COOKIE_NAME,
			store: new RedisStore({
				client: redis,
				disableTTL: true,
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 years
				httpOnly: true,
				sameSite: "lax", //csrf
				secure: __prod__, //cookie only works in https
			},
			saveUninitialized: false,
			secret: "keyboard cat",
			resave: false,
		}) 
	);

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }): MyContext => ({
			req,
			res,
			redis,
		}),
	});

	//sets middle ware to create GraphQL endpoint to express
	apolloServer.applyMiddleware({
		app,
		cors: false,
	});

	//using underscore can allow you to ignore a parameter
	app.listen(4000, () => {
		console.log("server started on localhost:4000");
	});
};

main().catch((err) => {
	console.log(err);
});
