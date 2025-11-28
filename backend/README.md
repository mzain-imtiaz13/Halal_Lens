Follow the steps below to set up and run the project on your local machine.

Getting Started

Prerequisites
Ensure you have the following installed on your machine:
1. Node.js (v14.x or later)
2. npm (v6.x or later)


**Clone the Repository**
1. git clone https://github.com/yourusername/node-auth-backend.git
2. cd node-auth-backend
3. Create Your Environmental File
4. Create a .env file in the root directory and add the necessary environment variables.

**Install Dependencies**
npm install

**Run the Development Server**
npm run dev


/backend/api/auth/register/
Request: 
{
    "fullName": "Syed Faizan",
    "email": "faaiz290302@gmail.com",
    "password": "Password@123"
}
Responses:
{
    "success": false,
    "reason": "Email already exist!"
}
{
    "success": true,
    "message": "User registered successfully.",
    "user": {
        "_id": "67949601463c869cbeba51f5",
        "fullName": "Syed Faizan",
        "email": "faaizshah442@gmail.com",
        "isEmailVerified": false
    }
}
{
    "success": false,
    "reason": "Some error in request validation",
    "errorMessage": "Email must be a valid email address."
}
{
    "success": false,
    "reason": "Some error in request validation",
    "errorMessage": "Password must be at least 8 characters long."
}
/backend/api/auth/login/
Request:
Headers: device_id
{
    "email": "faaizshah442@gmail.com",
    "password": "Password@123"
}
Response:
{
    "success": true,
    "message": "User logged in successfully.  Please check your email for verification.",
    "user": {
        "_id": "67949601463c869cbeba51f5",
        "fullName": "Syed Faizan",
        "email": "faaizshah442@gmail.com",
        "isEmailVerified": false
    },
    "accessToken": "Bearer xxx",
    "refreshToken": "Bearer xxx"
}
