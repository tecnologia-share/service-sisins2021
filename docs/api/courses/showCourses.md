## **Show Courses**

Lista os cursos.

Somente os do processo seletivo em aberto.

- **URL**

  /api/courses

</br>

- **Method:**

  `GET`

</br>

- **Query Params**

  `state?: 'active' | 'inactive'`

</br>

- **Success Response:**

  - **Code:** 200 OK

    **Content:**

    ```json
    {
      "courses": [
        {
          "id": "71a0c4d2-5649-4b03-abca-631c8f9ebf72",
          "name": "Course Name 1",
          "category": "Category",
          "description": "Description",
          "time": "Time",
          "professor": "Professor",
          "hasExam": true,
          "numberOfQuestions": 10,
          "selectionProcessId": "71a0c4d2-5649-4b03-abca-631c8f9ebf72",
          "created_at": "2021-03-17T21:20:20.143Z"
        },
        {
          "id": "71a0c4d2-5649-4b03-abca-631c8f9ebf72",
          "name": "Course Name 2",
          "category": "Category",
          "description": "Description",
          "time": "Time",
          "professor": "Professor",
          "hasExam": true,
          "numberOfQuestions": 10,
          "selectionProcessId": "71a0c4d2-5649-4b03-abca-631c8f9ebf72",
          "created_at": "2021-03-17T21:20:20.143Z"
        }
      ]
    }
    ```

</br>

- **Error Response:**

  - **Code:** 400 BAD REQUEST

    **Content:** `{ "message": "Invalid state." }`
