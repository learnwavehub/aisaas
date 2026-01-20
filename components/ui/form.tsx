"use client";

import React from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export function useZodForm<T extends z.ZodTypeAny>(
  schema: T,
  options?: {
    defaultValues?: z.infer<T>;
  }
): UseFormReturn<any> {
  // Return a loosly-typed UseFormReturn to avoid complex generic incompatibilities
  return useForm<any>({
    resolver: zodResolver(schema as any),
    defaultValues: options?.defaultValues as any,
  });
}

export type FormProps = React.ComponentPropsWithoutRef<"form"> & {
  form: UseFormReturn<any>;
};

export function Form({ form, children, ...props }: FormProps) {
  return (
    <form
      onSubmit={form.handleSubmit((data) => console.log("submit", data))}
      {...props}
    >
      {children}
    </form>
  );
}

export default Form;
