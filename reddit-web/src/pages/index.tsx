import { Link } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { Layout } from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClients } from "../utils/createUrqlClients";

const Index = () => {
	const [{ data }] = usePostsQuery({
		variables: {
			limit: 10
		}
	});

	return (
		<Layout>
			<NextLink href='/create-post'>
				<Link>Create Post</Link>
			</NextLink>
			<div>Hello World</div>
			<br />
			{!data ? (
				<div>loading....</div>
			) : (
				data.posts.map((p) => <div key={p.id}>{p.title}</div>)
			)}
		</Layout>
	);
};

export default withUrqlClient(createUrqlClients, { ssr: true })(Index);
