const Form = ({ children }: { children?: React.ReactNode }) => <form>{children}</form>;
const FormItem = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
const FormLabel = ({ children }: { children?: React.ReactNode }) => <label>{children}</label>;
const FormControl = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
const FormDescription = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
const FormMessage = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
const FormField = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
const useFormField = () => ({});
export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
