import { usePostQuery } from "../generated/graphql";
import { useGetIntID } from "./useGetIntId";

export const useGetPostFromUrl = () => {
    const intId = useGetIntID();
	
	return usePostQuery({
		pause: intId === -1,
		variables: {
			id: intId,
		},
	});
};
