import Yup from "yup";

export const registerUserValidationSchema = Yup.object({
  firstName: Yup.string()
    .trim()
    .max(30, "First name must be at max 30 characters.")
    .required("First name is required."),
  lastName: Yup.string()
    .required("Last name is required.")
    .trim()
    .max(30, "Last name must be at max 30 characters."),
  email: Yup.string()
    .email("Must be a valid email.")
    .required("Email is required.")
    .trim()
    .max(65, "Email must be at max 65 characters.")
    .lowercase(),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters.")
    .max(20, "Password must be at max 20 characters.")
    .required("Password is required."),
  role: Yup.string()
    .required("Role is required.")
    .trim()
    .oneOf(["buyer", "seller"], "Role must be either buyer or seller."),
  gender: Yup.string()
    .trim()
    .oneOf(
      ["male", "female", "preferNotToSay"],
      "Gender must be either male or female or preferNotToSay."
    ),
});

export const loginUserValidationSchema = Yup.object({
  email: Yup.string()
    .required("Email is required.")
    .trim()
    .email("Must be a valid email address.")
    .lowercase(),
  password: Yup.string().required("Password is required."),
});
