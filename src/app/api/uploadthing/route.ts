import { createRouteHandler } from "uploadthing/server";
import { uploadRouter } from "./core";

// Export Next.js API route for UploadThing
export const { GET, POST } = createRouteHandler({ router: uploadRouter });
