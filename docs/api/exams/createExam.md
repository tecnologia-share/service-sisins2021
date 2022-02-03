## **Create Exam**

Cria uma prova.

- **URL**

  /api/exams

</br>

- **Method:**

  `POST`

</br>

- **Headers**

  `authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJIZXkiOiJ0aGlzIGlzIGFuIGV4YW1wbGUgdG9rZW4gOkQifQ.LZ9wWBMzgpV80AtEjjN5KW45WbFcZRZ4pFjHCX7Kr_g`

</br>

- **Data Params**

  ```js
    courseId: string,
    examTitle?: string,
    examText?: string,
    questions: Array<{
      title: string,
      question: string,
      image?: string,
      alternative1: string,
      alternative2: string,
      alternative3: string,
      alternative4: string,
      alternative5: string,
      correctAlternative: number,
      points: number
    }>
  ```

</br>

- **Success Response:**

  - **Code:** 200 OK

    **Content:**

    ```json
    {
      "message": "Exam successfully created.",
      "exam": {
        "id": "71a0c4d2-5649-4b03-abca-631c8f9ebf72",
        "courseId": "71a0c4d2-5649-4b03-abca-631c8f9ebf72",
        "created_at": "2021-03-17T21:20:20.143Z"
      }
    }
    ```

</br>

- **Error Response:**

  - **Code:** 400 BAD REQUEST

    **Content:** `{ "message": "Something wrong with the request." }`

  OR

  - **Code:** 404 NOT FOUND

    **Content:** `{ "message": "Course not found." }`

  OR

  - **Code:** 400 BAD REQUEST

    **Content:** `{ "message": "This course already has an exam." }`

  OR

  - **Code:** 401 UNAUTHORIZED

    **Content:** `{ "message": "You are not authorized to access this route" }`

  OR

  - **Code:** 401 UNAUTHORIZED

    **Content:** `{ "message": "Invalid token." }`
