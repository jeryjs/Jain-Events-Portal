# Jain FET Hub
> https://jain-events-portal.vercel.app/



A React app with UI in MUI and Express.js backend for managing events at Jain University, designed to handle thousands of visitors and provide features for event registration, scheduling, and notifications.

## Features
- **React Frontend**: Built using React and MUI for a modern and responsive UI.
- **Express Backend**: Handles API requests and serves the React app.
- **Event Management**: Create, update, and manage events.
- **Scalability**: Designed to handle thousands of visitors.
- **Customisable**: Options for ... etc.

## Preview
<img src="https://github.com/user-attachments/assets/sample1" width="49%" alt="Login Page">
<img src="https://github.com/user-attachments/assets/sample2" width="49%" alt="Admin Dashboard">
<img src="https://github.com/user-attachments/assets/sample3" width="49%" alt="Event Page">
<img src="https://github.com/user-attachments/assets/sample4" width="49%" alt="Gallery Page">
<img src="https://github.com/user-attachments/assets/sample5" width="99%" alt=" Matches Page">

## Build

#### Prerequisites
- Node.js
- npm

#### Clone the Repository
```bash
git clone https://github.com/jeryjs/Jain-Events-Portal.git
cd Jain-Events-Portal
```

#### Install Dependencies
```bash
npm run init
```

---

### Environment Variables Setup

#### Required Variables
```properties
PORT=
JWT_SECRET=
FIREBASE_ACCOUNT_KEY_JSON=
```

#### Step-by-Step Instructions

##### 1. Port Configuration
```properties
PORT=5000
```
- Default is 5000
- Change if port conflicts exist

##### 2. JWT Configuration
```properties
JWT_SECRET=your-secret-key
```
- Create any secure random string
- Recommended: Use a password generator

##### 3. Firebase Setup
```properties
FIREBASE_ACCOUNT_KEY_JSON={your-firebase-key-json}
```
1. Create Firebase project
2. Go to Project Settings > Service Accounts
3. Generate New Private Key
4. Copy entire JSON content
5. Paste as single line

> Note: Store .env in backend folder and never commit to version control.

## Usage

### Running the Development Server
```bash
cd Jain-Events-Portal
npm run dev
```
Navigate to `http://localhost:PORT` to see the app in action.
> Make sure to setup admin/test accounts in the firestore database first.

## Hosting

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjeryjs%2FJain-Events-Portal)

#### Automatic Deployment
1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Select repository and configure project settings
4. Vercel will automatically deploy your application

#### Manual Deployment
1. Install Vercel CLI:
     ```bash
     npm install -g vercel
     ```
2. Login to Vercel:
     ```bash
     vercel login
     ```
3. Deploy the project:
     ```bash
     vercel
     ```

The application will be available at `https://your-project.vercel.app`

## License
This project is licensed under the GNU Affero General Public License v3.0 License - see the [LICENSE](LICENSE) file for details.
