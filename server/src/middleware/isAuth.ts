import { MyContext } from "../types";
import { MiddlewareFn } from "type-graphql";

//Middleware from type-graphql that runs before resolvers
export const isAuth: MiddlewareFn<MyContext> = ({context}, next) => {
    if(!context.req.session!.userId){
        throw new Error('Not authenticated');
    }

    return next(); 
};