import { UsernamePasswordInput } from "src/resolvers/UsernamePasswordInput";

export const validateRegister = (options: UsernamePasswordInput) => {
	if (options.username.length <= 2) {
		return [
			{
				field: "username",
				message: "length must be greater than 2 characters",
			},
		];
	}

	if (options.username.includes("@")) {
		return [
			{
				field: "username",
				message: "Cannot include @ sign in username",
			},
		];
	}

	if (options.password.length <= 3) {
		return [
			{
				field: "password",
				message: "length must be greater than 3 characters",
			},
		];
	}

	if (!options.email.includes('@')){
		return [
			{
				field: "email",
				message: "Enter a valid email"
			}
		]
	}

	return null;
};
