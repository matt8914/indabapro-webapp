export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  // Helper function to safely check if a property exists in the message object
  const hasProperty = (key: string) => {
    return message && typeof message === 'object' && key in message;
  };
  
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {hasProperty('success') && (
        <div className="text-foreground border-l-2 border-foreground px-4">
          {(message as { success: string }).success}
        </div>
      )}
      {hasProperty('error') && (
        <div className="text-destructive-foreground border-l-2 border-destructive-foreground px-4">
          {(message as { error: string }).error}
        </div>
      )}
      {hasProperty('message') && (
        <div className="text-foreground border-l-2 px-4">
          {(message as { message: string }).message}
        </div>
      )}
    </div>
  );
}
