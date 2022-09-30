import DataLoader from "dataloader";
import { User } from "../entities/User";

// Dataloader caches, allows us to fetch individual fields with just 2 queries instead of a large one
export const createUserLoader = () =>
	new DataLoader<number, User>(async (userIds) => {
		const users = await User.findByIds(userIds as number[]);
        const userIdToUser: Record<number, User> = {};
        users.forEach(u => {
            userIdToUser[u.id] = u;
        });

        return userIds.map((userId) => userIdToUser[userId]);
	});
