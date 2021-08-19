## **Show Subscribe**

Mostra os dados do participante que se inscreveu em algum dos cursos.

- **URL**

  /api/subscribe/:id

</br>

- **Method:**

  `GET`

</br>

- **Headers**

  `authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJIZXkiOiJ0aGlzIGlzIGFuIGV4YW1wbGUgdG9rZW4gOkQifQ.LZ9wWBMzgpV80AtEjjN5KW45WbFcZRZ4pFjHCX7Kr_g`

</br>

- **Success Response:**

  - **Code:** 201 CREATED

    **Content:**

    ```json
    {
      "subscribe": {
        "id": "66348e90-6ba4-4f54-a4f3-55e9268d0859",
        "avaliacoes": [],
        "provasInscricoes": [],
        "participante_id": "f8d40b19-d8e7-45bf-9001-8252c2c250ca",
        "participante": {
          "id": "f8d40b19-d8e7-45bf-9001-8252c2c250ca",
          "inscricoes": "undefined",
          "perguntasParticipantes": "undefined",
          "nome": "city 0",
          "cpf": "12345678910",
          "senha": "$2b$10$6FD3duMwr0qUTbREF.jE7O7AidMeeZPcGRTIAUh77Ml/jbpVnUYwy",
          "email": "participant_0_@example.com",
          "telefone": "1234",
          "pais": "country 0",
          "estado": "participant 0",
          "cidade": "participant 0"
        },
        "curso_id": "d4a7ca8e-a07e-41e3-9769-9a7484650cda",
        "curso": "undefined",
        "motivo": "My Reason",
        "status": "NOT_EVALUATED",
        "desistencia": null,
        "link_video": "link",
        "created_at": "2021-07-19T21:20:03.000Z"
      }
    }
    ```

</br>

- **Error Response:**

  - **Code:** 401 UNAUTHORIZED

    **Content:** `{ "message": "You are not authorized to access this route" }`

  OR

  - **Code:** 404 NOT FOUND

    **Content:** `{ "message": "Subscribe not found." }`
