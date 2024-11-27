Animal Crossing Companion App
Welcome to the Animal Crossing Companion App project! This application is designed to help Animal Crossing players manage and track their in-game activities, items, and milestones in a user-friendly and efficient manner. Whether you're cataloging your museum donations, tracking your daily tasks, or just keeping tabs on your island's residents, this tool aims to enhance your Animal Crossing experience.

Features
Item Tracking: Keep track of the items you've collected, including fossils, art, fish, insects, and more.
Task Management: A daily checklist to help you keep track of your daily activities and chores in the game.
Villager Database: Information about each villager, including their birthday, personality, and favorite items.
Museum Progress: Track your donations to the museum and see what's missing at a glance.
Getting Started
Prerequisites
Before you can run this application, you'll need the following installed on your system:

## Prerequisites
Before you begin, ensure you have installed:
- **Node.js**: Download and install Node.js from [https://nodejs.org/](https://nodejs.org/). This will also install `npm` (Node Package Manager), which is essential for managing the dependencies of the project.

## Getting Started

### 1. Clone the Repository
To get started with this project, you need to clone the repository to your local machine. You can do this by running the following command in your terminal:
```bash
git clone https://github.com/juanjoromero200776/AnimalCrossingList.git
cd AnimalCrossingList
```

### 2. Install Dependencies
Once you have cloned the repository and navigated into the project directory, you need to install the project dependencies. Run the following command:
```bash
npm install
```
This command will read the `package.json` file and install all the necessary packages required for the project.

### 3. Install Electron
This project uses Electron to run. If it's not already listed in your `package.json`, you can install Electron globally (which allows you to run `electron` from the command line) or locally in your project (recommended for encapsulation). To install Electron locally, run:
```bash
npm install electron --save-dev
```

### 4. Run the Application
To start the application, you can use an npm script defined in your `package.json`. Typically, this script looks something like:
```json
"scripts": {
  "start": "electron ."
}
```
Run the application using:
```bash
npm start
```
This command will launch the Electron application using the main script defined in your `package.json`.

## Additional Configuration (Optional)
- **Electron Packager**: If you plan to package your Electron app for production, you might want to use Electron Packager or a similar tool. Install it via npm:
  ```bash
  npm install electron-packager --save-dev
  ```
  Use it to package your app:
  ```bash
  npx electron-packager . myAppName --platform=win32 --arch=x64
  ```

## Troubleshooting
- If you encounter any issues with `npm install`, ensure your Node.js and npm are up to date.
- For problems related to Electron, check the official Electron documentation at [https://electronjs.org/docs](https://electronjs.org/docs) for guidance.

---

This setup guide will provide a clear starting point for any users who want to contribute to or run your Electron project. You can further customize the instructions as needed, especially if your project has specific requirements or additional setup steps.
