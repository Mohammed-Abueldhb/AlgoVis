import { Loader2 } from "lucide-react";

export const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};











