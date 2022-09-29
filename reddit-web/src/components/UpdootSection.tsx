import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
	post: PostSnippetFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
	//sets loading animation when voting
	const [loadingState, setLoadingState] = useState<
		"updoot-loading" | "downdoot-loading" | "not-loading"
	>("not-loading");
	const [, vote] = useVoteMutation();

	return (
		<Flex
			direction={"column"}
			justifyContent={"center"}
			mr={4}
			alignItems={"center"}
		>
			<IconButton
				aria-label="updoot post"
				icon={<TriangleUpIcon />}
				onClick={async () => {
					if (post.voteStatus === 1) {
						return;
					}
					console.log("voteStatus: ", post.voteStatus)
					//sets loading state when clicked
					setLoadingState("updoot-loading");
					await vote({
						postId: post.id,
						value: 1,
					});
					//after await, stops loading state
					setLoadingState("not-loading");
				}}
				colorScheme={post.voteStatus === 1 ? "green" : undefined}
				isLoading={loadingState === "updoot-loading"}
			/>
			{post.points}
			<IconButton
				aria-label="downdoot post"
				icon={<TriangleDownIcon />}
				onClick={async () => {
					if (post.voteStatus === -1) {
						return;
					}
					setLoadingState("downdoot-loading");
					await vote({
						postId: post.id,
						value: -1,
					});
					setLoadingState("not-loading");
				}}
				colorScheme={post.voteStatus === -1 ? "red" : undefined}
				isLoading={loadingState === "downdoot-loading"}
			/>
		</Flex>
	);
};
