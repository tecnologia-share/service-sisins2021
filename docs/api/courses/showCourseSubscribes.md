## **Show Courses Subscribes**

Lista os inscritos no curso.

Mostrar os inscritos no curso do processo seletivo atual ou anteriores.

- **URL**

  /api/courses/:id/subscribes

</br>

- **Method:**

  `GET`

</br>

- **Success Response:**

  - **Code:** 200 OK

    **Content:**

    ```json
    {
      "subscribes": [
        {
          "id": "905d1bce-1ec9-4789-a960-61763cfef3ee",
          "participante_id": "eaf7fe69-167e-4751-91ca-14bb2aedebcf",
          "curso_id": "b2f99b79-b99d-4a3c-83df-6a27f488f0cc",
          "motivo": "My Reason",
          "status": "NOT_EVALUATED",
          "desistencia": null,
          "link_video": "link",
          "created_at": "2021-06-30T23:47:20.000Z"
        },
        {
          "id": "024b328c-402a-45bf-81d6-aea999079fb6",
          "participante_id": "d75a1e8c-bd74-4f12-af48-89fe148b6b48",
          "curso_id": "b2f99b79-b99d-4a3c-83df-6a27f488f0cc",
          "motivo": "My Reason",
          "status": "NOT_EVALUATED",
          "desistencia": null,
          "link_video": "link",
          "created_at": "2021-06-30T23:47:20.000Z"
        },
      ]
    }
    ```

</br>

- **Error Response:**

  - **Code:** 400 BAD REQUEST

    **Content:** `{ "message": "Invalid state." }`

  - **Code:** 401 UNAUTHORIZED

    **Content:** `{ "message": "You are not authorized to access this route" }`

  - **Code:** 404 NOT FOUND

    **Content:** `{ "message": "Course not found." }`
