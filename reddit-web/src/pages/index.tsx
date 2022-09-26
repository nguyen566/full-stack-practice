import {
	Box,
	Button,
	Flex,
	Heading,
	Link,
	Stack,
	Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useState } from "react";
import { Layout } from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClients } from "../utils/createUrqlClients";

const Index = () => {
	const [variables, setVariables] = useState({
		limit: 33,
		cursor: null as null | string,
	});
	const [{ data, fetching }] = usePostsQuery({
		variables,
	});

	if (!fetching && !data) {
		return <div>No posts available</div>;
	}

	return (
		<Layout>
			<Flex align={"center"}>
				<Heading>LiReddit</Heading>
				<Button ml={"auto"} colorScheme={"teal"}>
					<NextLink href="/create-post">
						<Link>Create Post</Link>
					</NextLink>
				</Button>
			</Flex>
			<br />
			{!data && fetching ? (
				<div>loading....</div>
			) : (
				<Stack spacing={8}>
					{data!.posts.posts.map((p) => (
						<Box key={p.id} p={5} shadow="md" borderWidth="1px">
							<Heading fontSize="xl">{p.title}</Heading>
							<Text mt={4}>{p.textSnippet}</Text>
						</Box>
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
