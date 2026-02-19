>(({ className, variant, ...props }, ref) => (
>(({ className, ...props }, ref) => (
>(({ className, ...props }, ref) => (
const Alert = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
const AlertTitle = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
const AlertDescription = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
export { Alert, AlertTitle, AlertDescription };
