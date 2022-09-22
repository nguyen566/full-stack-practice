import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const userIsAuth = () => {
    //checks if user login is saved in cookies
	const [{ data, fetching }] = useMeQuery();
	const router = useRouter();
    //Route users back to login page if no cookies are found
	useEffect(() => {
		if (!fetching && !data?.me) {
			router.replace("/login?next=" + router.pathname);
		}
	}, [fetching, data, router]);
};
