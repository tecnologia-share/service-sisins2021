## **Create Course**

Cria um curso.

- **URL**

  /api/courses

</br>

- **Method:**

  `POST`

</br>

- **Headers**

  `authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJIZXkiOiJ0aGlzIGlzIGFuIGV4YW1wbGUgdG9rZW4gOkQifQ.LZ9wWBMzgpV80AtEjjN5KW45WbFcZRZ4pFjHCX7Kr_g`

</br>

- **Data Params**

  `name: string`

  `category: string`

  `description: string`

  `time: string`

  `professor: string`

  `duration: string`

  `selectionProcessId: string`

  `predecessorCourseId?: string`

</br>

- **Success Response:**

  - **Code:** 201 CREATED

    **Content:**

    ```json
    {
      "message": "Course successfully created.",
      "selectionProcess": {
        "id": "71a0c4d2-5649-4b03-abca-631c8f9ebf72",
        "name": "Name",
        "category": "Category",
        "description": "Description",
        "time": "Time",
        "professor": "Professor",
        "selectionProcessId": "71a0c4d2-5649-4b03-abca-631c8f9ebf72",
        "duration": "6 meses",
        "predecessorCourseId": "71a0c4d2-5649-4b03-abca-631c8f9ebf72",
        "created_at": "2021-03-17T21:20:20.143Z"
      }
    }
    ```

</br>

- **Error Response:**

  - **Code:** 400 BAD REQUEST

    **Content:** `{ "message": "Something wrong with the request." }`

  OR

  - **Code:** 401 UNAUTHORIZED

    **Content:** `{ "message": "You are not authorized to access this route" }`

  OR

  - **Code:** 404 NOT FOUND

    **Content:** `{ "message": "Selection process not found." }`

  OR

  - **Code:** 401 UNAUTHORIZED

    **Content:** `{ "message": "Invalid token." }`
