export const useFormValidation = (schema: any) => {
  const validate = (values: any) => {
    const result = schema.safeParse(values);
    if (result.success) return {};

    const errors: any = {};
    result.error.issues.forEach((issue: any) => {
      errors[issue.path[0]] = issue.message;
    });
    return errors;
  };

  return { validate };
};
