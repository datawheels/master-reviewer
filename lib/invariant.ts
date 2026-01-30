export function invariant(condition: any, message: string) {
  if (!condition) {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(message);
    }
  }
}
