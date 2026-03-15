import { createRouteHandler } from "uploadthing/next";
import { uploadRouter } from "./core";

// Export Next.js API route for UploadThing
export const { GET, POST } = createRouteHandler({ router: uploadRouter });
