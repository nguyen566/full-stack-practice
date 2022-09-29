import { Box, Flex, Heading, Stack } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import React from "react";
import EditDeletePostButtons from "../../components/EditDeletePostButtons";
import { Layout } from "../../components/Layout";
import { createUrqlClients } from "../../utils/createUrqlClients";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";

const Post = ({}) => {
	const [{ data, error, fetching }] = useGetPostFromUrl();

	if (fetching) {
		return (
			<Layout>
				<div>Loading...</div>
			</Layout>
		);
	}

	if (!data?.post) {
		return (
			<Layout>
				<div>Could not find post</div>
			</Layout>
		);
	}

	return (
		<Layout>
				<Flex p={5}>
					<Box>
						<Heading mb={4}>{data.post.title}</Heading>
						{data.post.text}
					</Box>
					<Box ml={"auto"}>
						<EditDeletePostButtons
							id={data.post.id}
							creatorId={data.post.creator.id}
						/>
					</Box>
				</Flex>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClients, { ssr: true })(Post);
