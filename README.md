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

1. **Clone the Repository**
   ```bash
   git clone https://github.com/HilarioNengareJr/news-web-app.git
   cd news-web-app
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up the Database**
   - Install PostgreSQL if not already installed.
   - Create a new database.
   - Configure the database connection in `.env`:
     ```env
     DB_HOST=your_database_host
     DB_PORT=your_database_port
     DB_USER=your_database_user
     DB_PASSWORD=your_database_password
     DB_NAME=your_database_name
     ```
   - Run database migrations:
     ```bash
     npm run migrate
     ```

4. **Run the Application**
   ```bash
   npm start
   ```
   The app will be available at `http://localhost:3000`.

## Usage 

1. **Admin Access**
   - Navigate to the Login page and log in with admin credentials.
   - Access the Admin Dashboard to manage articles.

2. **Visitors**
   - Browse the Home page to view articles.
   - Use the search functionality to find articles by title or tags.

## Deployment 
To deploy the application on a cloud platform:
- Ensure your environment variables are properly configured.
- Use platforms like Heroku, AWS, or Vercel for deployment.

## License 🔒
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments 🌟
Thanks to the Football Data Limited team for this opportunity, to join their soul and heart as part of their firm.


