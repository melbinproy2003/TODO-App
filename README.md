
# TODO Application

This TODO application enables users to manage tasks efficiently with features like adding, updating, and deleting tasks.

## Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/melbinproy2003/TODO-App.git
   ```
   
2. **Navigate to the project directory:**
   ```bash
   cd TODO-App
   ```

3. **Install dependencies:**
   - For the backend (Python):
     ```bash
     cd Backend
     pip install -r requirements.txt
     ```
   - For the frontend (JavaScript):
     ```bash
     cd frontend
     npm install
     ```

## Run

1. **Start the backend server:**
   ```bash
   cd Backend
   cd Project
   python manage.py makemigrations
   python manage.py migrate
   python manage.py runserver
   ```

2. **Start the frontend server:**
   ```bash
   cd frontend
   npm start
   ```

## Test

- To run tests for the backend:
  ```bash
  cd Backend
  python -m unittest discover
  ```

- For frontend tests (if applicable):
  ```bash
  cd frontend
  npm test
  ```

For more details, visit the project repository [here](https://github.com/melbinproy2003/TODO-App).
