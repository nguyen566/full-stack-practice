import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { useCreatePostMutation } from "../generated/graphql";
import { createUrqlClients } from "../utils/createUrqlClients";

const CreatePost: React.FC<{}> = ({}) => {
    const [, createPost] = useCreatePostMutation();
    const router = useRouter();
    
	return (
		<Layout variant="small">
			<Formik
				initialValues={{ title: "", text: "" }}
				onSubmit={async (values) => {
					const {error} = await createPost({input: values});
					console.log(error);
					if (!error) { 		
						router.push('/');
					}
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
							Create Post
						</Button>
					</Form>
				)}
			</Formik>
		</Layout>
	);
};

export default withUrqlClient(createUrqlClients)(CreatePost);
