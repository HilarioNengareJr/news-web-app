# News Web Application 🚀

This project is a scalable, feature-rich platform for managing and viewing news articles, implemented as a challenge provided by the team at Football Data. It’s designed to provide a seamless experience for both visitors and admin users.

## Features 🔥

1. **Authentication** 
   - Only admins can log in.
   - Session-based authentication to ensure secure access.

2. **News Articles** 
   - Admin users can:
     - Create, read, update, and delete articles.
   - Regular users can only view articles.
   - Articles include:
     - Title
     - Image
     - Rich text content using tinyMCE
     - Tags
   - Pagination is available for better navigation.

3. **Search Functionality** 
   - Users can search articles by:
     - Title
     - Tags

4. **Frontend Design** 
   - Built with EJS templates and styled using Bootstrap for responsiveness.
   - Pages include:
     - **Home Page**: Displays a list of all articles.
     - **Article Page**: Shows a single article’s full content.
     - **Admin Dashboard**: Accessible only to admins, with options to manage articles.
     - **Login Page**: Form for admin authentication.

5. **Validation and Error Handling** 
   - All forms (login, create/edit article) include input validation.
   - Displays meaningful error messages for invalid inputs or failed operations.

6. **TypeScript Integration** 
   - Utilizes TypeScript for improved type safety and code maintainability.

## Tech Stack 

- **Backend**: Node.js, Express.js
- **Frontend**: EJS templates, Bootstrap
- **Database**: PostgreSQL

## Installation Steps 

### 1. **Clone the Repository**
   ```bash
   git clone https://github.com/HilarioNengareJr/news-web-app.git
   cd news-web-app
   ```

### 2. **Install Dependencies**
   ```bash
   npm install
   ```

### 3. **Set Up PostgreSQL**

#### **For Windows:**

1. **Install PostgreSQL**
   - Download the installer from the [PostgreSQL Downloads page](https://www.postgresql.org/download/windows/).
   - Run the installer and follow the on-screen instructions to complete the setup.
   - Make sure to include the `pgAdmin` tool and configure the default password for the `postgres` superuser.

2. **Start PostgreSQL Service**
   - PostgreSQL should start automatically after installation.
   - If it's not running, you can start it via the **pgAdmin** application or from the Windows services (`services.msc`).

3. **Create Database and User**
   - Open **pgAdmin** or a command-line interface like `psql`:
     - Launch **pgAdmin** from the Start Menu.
     - In **pgAdmin**, connect to the server using the `postgres` superuser credentials.
   - Create a new database:
     ```sql
     CREATE DATABASE newswebapp;
     ```
   - Create a new user:
     ```sql
     CREATE USER your_username WITH PASSWORD 'your_password';
     ```
   - Grant privileges to the user:
     ```sql
     GRANT ALL PRIVILEGES ON DATABASE newswebapp TO your_username;
     ```

4. **Configure Database Connection**
   - Open the `.env` file in the root of your project.
   - Update the database configuration:
     ```env
     DB_HOST=localhost
     DB_PORT=5432
     DB_USER=your_username
     DB_PASSWORD=your_password
     DB_NAME=newswebapp
     ```

#### **For Ubuntu:**

1. **Install PostgreSQL**
   - Use the following commands to install PostgreSQL:
     ```bash
     sudo apt update
     sudo apt install postgresql postgresql-contrib
     ```

2. **Start PostgreSQL Service**
   - Ensure PostgreSQL is running:
     ```bash
     sudo service postgresql start
     ```

3. **Create Database and User**
   - Access the PostgreSQL shell:
     ```bash
     sudo -u postgres psql
     ```
   - Create a new database:
     ```sql
     CREATE DATABASE newswebapp;
     ```
   - Create a new user:
     ```sql
     CREATE USER your_username WITH PASSWORD 'your_password';
     ```
   - Grant privileges to the user:
     ```sql
     GRANT ALL PRIVILEGES ON DATABASE newswebapp TO your_username;
     ```

   - Run initial schema set up
   ```
      psql -h localhost -U your_database_user -d your_database_name -f .\migrations\001-initial-schema.sql
   ```

   - Performing seeding

   ```
   psql -h localhost -U your_database_user -d your_database_name -f .\migrations\002-seed-articles.sql
    ```

1. **Configure Database Connection**
   - Open the `.env` file in the root of your project.
   - Update the database connection details:
     ```env
     DB_HOST=localhost
     DB_PORT=5432
     DB_USER=your_username
     DB_PASSWORD=your_password
     DB_NAME=newswebapp
     ```

### 4. **Run the Application**

Start the application:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Usage 

1. **Admin Access**
   - Navigate to the Login page and log in with admin credentials.
   - Access the Admin Dashboard to manage articles.

2. **Visitors**
   - Browse the Home page to view articles.
   - Use the search functionality to find articles by title or tags.


## License 🔒
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments 🌟
Thanks to the Football Data Limited team for this opportunity, to join their soul and heart as part of their firm.

## Screenshots of Application

### Login Page
![Login Page](src/public/readme_images/Screenshot%20from%202025-01-27%2000-09-46.png)

### Admin Dashboard
![Admin Dashboard](src/public/readme_images/Screenshot%20from%202025-01-27%2000-10-18.png)

### Article Upload/Edit with tinyMCE API
![Article Upload/Edit 1](src/public/readme_images/Screenshot%20from%202025-01-27%2000-10-35.png)
![Article Upload/Edit 2](src/public/readme_images/Screenshot%20from%202025-01-27%2000-10-46.png)
![Article Upload/Edit 3](src/public/readme_images/Screenshot%20from%202025-01-27%2000-10-57.png)

### Home Page With Featured Image and 2 uploads
![Home Page 1](src/public/readme_images/Screenshot%20from%202025-01-27%2000-11-10.png)
![Home Page 2](src/public/readme_images/Screenshot%20from%202025-01-27%2000-11-25.png)

### Article Page
![Article Page 1](src/public/readme_images/Screenshot%20from%202025-01-27%2000-11-38.png)
![Article Page 2](src/public/readme_images/Screenshot%20from%202025-01-27%2000-11-44.png)

### Search Bar (Entered a tag) (You can search with title)
![Search Bar](src/public/readme_images/Screenshot%20from%202025-01-27%2000-12-00.png)

## The site is responsive and follows a mobile-first design approach!
