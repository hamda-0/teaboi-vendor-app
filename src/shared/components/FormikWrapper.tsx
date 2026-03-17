import React from 'react';
import { Formik, FormikConfig, FormikValues, FormikProps } from 'formik';

interface FormikWrapperProps<T extends FormikValues> {
  initialValues: T;
  onSubmit: FormikConfig<T>['onSubmit'];
  validate?: FormikConfig<T>['validate'];
  validationSchema?: FormikConfig<T>['validationSchema'];
  enableReinitialize?: boolean;
  children: (formik: FormikProps<T>) => React.ReactNode;
}

export function FormikWrapper<T extends FormikValues>({
  initialValues,
  onSubmit,
  validate,
  validationSchema,
  enableReinitialize = false,
  children,
}: FormikWrapperProps<T>) {
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validate={validate}
      validationSchema={validationSchema}
      enableReinitialize={enableReinitialize}
    >
      {(formik) => children(formik)}
    </Formik>
  );
}