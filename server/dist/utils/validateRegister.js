"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegister = void 0;
const validateRegister = (options) => {
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
    if (!options.email.includes('@')) {
        return [
            {
                field: "email",
                message: "Enter a valid email"
            }
        ];
    }
    return null;
};
exports.validateRegister = validateRegister;
//# sourceMappingURL=validateRegister.js.map