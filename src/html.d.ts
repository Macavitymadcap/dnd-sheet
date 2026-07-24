// Bun HTML imports: pages imported by server.ts resolve to route handlers.
declare module "*.html" {
  const page: import("bun").HTMLBundle;
  export default page;
}
