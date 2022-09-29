import { DeleteIcon, TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import {
	Box,
	Button,
	Flex,
	Heading,
	IconButton,
	Link,
	Stack,
	Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useState } from "react";
import { Layout } from "../components/Layout";
import { UpdootSection } from "../components/UpdootSection";
import { useDeletePostMutation, usePostsQuery } from "../generated/graphql";
import { createUrqlClients } from "../utils/createUrqlClients";

const Index = () => {
	const [variables, setVariables] = useState({
		limit: 15,
		cursor: null as null | string,
	});

	const [{ data, fetching }] = usePostsQuery({
		variables,
	});

	const [, deletePost] = useDeletePostMutation();

	if (!fetching && !data) {
		return <div>No posts available</div>;
	}

	return (
		<Layout>
			{!data && fetching ? (
				<div>loading....</div>
			) : (
				<Stack spacing={8}>
					{data!.posts.posts.map((p) => !p ? null : (
						<Flex key={p.id} p={5} shadow="md" borderWidth="1px">
							<Box>
								<UpdootSection post={p} />
							</Box>
							<Box>
								<NextLink href="/post/[id]" as={`/post/${p.id}`}>
									<Link>
										<Heading fontSize="xl">{p.title}</Heading>
									</Link>
								</NextLink>
								<Text>Posted By:{p.creator.username}</Text>
								<Text mt={4}>{p.textSnippet}</Text>
							</Box>
							<Box ml={"auto"}>
								<IconButton
									aria-label="Delete Post"
									icon={<DeleteIcon />}
									onClick={() => {
										deletePost({ id: p.id });
									}}
								/>
							</Box>
						</Flex>
					))}
				</Stack>
			)}
			{data && data.posts.hasMore ? (
				<Flex>
					<Button
						onClick={() => {
							setVariables({
								limit: variables.limit,
								cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
							});
						}}
						isLoading={fetching}
						m={"auto"}
						my={5}
						colorScheme="teal"
					>
						Load More
					</Button>
				</Flex>
			) : null}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClients, { ssr: true })(Index);
