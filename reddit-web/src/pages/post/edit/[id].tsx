import { Button, Box } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import {
	usePostQuery,
	useUpdatePostMutation,
} from "../../../generated/graphql";
import { createUrqlClients } from "../../../utils/createUrqlClients";
import { useGetIntID } from "../../../utils/useGetIntId";

const EditPost = ({}) => {
	const router = useRouter();
	const intId = useGetIntID();
	const [{ data, error, fetching }] = usePostQuery({
		pause: intId === -1,
		variables: {
			id: intId,
		},
	});
	const [, updatePost] = useUpdatePostMutation();

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
		<Layout variant="small">
			<Formik
				initialValues={{ title: data.post.title, text: data.post.text }}
				onSubmit={async (values) => {
					await updatePost({ id: intId, ...values });
					router.back();
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField name="title" placeholder="title" label="title" />
						<Box mt={4}>
							<InputField
								textarea
								name="text"
								placeholder="text..."
								label="body"
							/>
						</Box>
						<Button
							mt={4}
							type="submit"
							isLoading={isSubmitting}
							colorScheme="teal"
						>
							Update Post
						</Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClients)(EditPost);
