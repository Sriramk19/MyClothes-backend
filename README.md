## Setup Instructions

1. Clone the repository
2. Install dependencies - npm install
3. Configure environment variables
   Create a .env file in the root directory and include:

   - MONGO_URI=<your_mongodb_connection_string>
   - CLOUDINARY_CLOUD_NAME=<your_cloudinary_name>
   - CLOUDINARY_API_KEY=<your_cloudinary_api_key>
   - CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
   - CLERK_SECRET_KEY=<your_clerk_secret_key>

4. Run the backend - npm start

## API Endpoints

1. Clothes

Method Endpoint Description

- GET /api/clothes Fetch all clothes
- POST /api/clothes Add new clothing item
- DELETE /api/clothes/:id Delete a clothing item

2. Collection

Method Endpoint Description

- GET /api/collections Fetch all collections
- POST /api/collections Add a new collection
- DELETE /api/collections/:id Delete a collection

## Workflow

1. User Authentication

   - The frontend uses Clerk for authentication.
   - Clerk tokens are sent with API requests.
   - Middleware verifies the token before processing.

2. Data Management

   - Mongoose interacts with MongoDB Atlas to store and retrieve data.
   - Data includes clothing items, image URLs (from Cloudinary), and collection info.

3. Image Handling

   - Images are uploaded from the frontend directly to Cloudinary.
   - Only the Cloudinary image URL is stored in MongoDB.

4. API Response
   - JSON responses are sent back to the frontend.
   - Errors are handled with proper HTTP status codes.

## Deployment

The backend is deployed on Render, a cloud hosting platform.

Render uses an idle-to-active scaling mechanism to optimize costs. When the backend remains inactive for a certain period, it enters an idle state. Upon the first request after idling, Render performs a cold start to bring the service online, which typically takes ~15 seconds. Subsequent requests are served without delay until the service idles again.
