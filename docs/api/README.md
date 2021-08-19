| método | rota                                                                                     | descrição                                                        |
| ------ | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| POST   | [/api/authenticate](./authenticate/authentication.md)                                    | Retorna o token de autenticação.                                 |
| POST   | [/api/authenticate-share](./authenticate/authenticationShare.md)                         | Retorna o token de autenticação de um usuário da Share.          |
| POST   | [/api/register/](./participants/create.md)                                               | Cadastra um novo participante e enviar um e-mail de confirmacão. |
| GET    | [/api/register/verify-email/:token](./participants/verify-emaIl.md)                      | Verifica o e-mail enviado para concluir o cadastro               |
| PATCH  | [/api/participants](./participants/updatePersonalData.md)                                | Atualiza os dados pessoais do participante.                      |
| PATCH  | [/api/participants/update-email](./participants/updateEmail.md)                          | Atualiza o email do participante.                                |
| PATCH  | [/api/participants/update-password](./participants/updatePassword.md)                    | Atualiza a senha do participante.                                |
| POST   | [/api/subscriptions](./subscriptions/subscribe.md)                                       | Inscreve o participante em um curso.                             |
| DELETE | [/api/subscriptions](./subscriptions/unsubscribe.md)                                     | Desinscreve o participante de um curso.                          |
| GET    | [/api/subscribe/:id](./subscriptions/showSubscribe.md)                                   | Lista os inscritos no curso.                                     |
| GET    | [/api/selection-process/{id}/courses](./selectionProcess/showSelectionProcessCourses.md) | Lista os cursos do processo seletivo.                            |
| POST   | [/api/selection-process](./selectionProcess/createSelectionProcess.md)                   | Cria um processo seletivo.                                       |
| PATCH  | [/api/selection-process](./selectionProcess/updateSelectionProcess.md)                   | Atualiza as informações de um processo seletivo.                 |
| DELETE | [/api/selection-process](./selectionProcess/deleteSelectionProcess.md)                   | Exclui um processo seletivo.                                     |
| GET    | [/api/courses/{id}/exam](./courses/getExam.md)                                           | Retorna a prova do curso.                                        |
| POST   | [/api/courses](./courses/createCourse.md)                                                | Cria um curso.                                                   |
| PATCH  | [/api/courses](./courses/updateCourse.md)                                                | Atualiza informações de um curso.                                |
| DELETE | [/api/courses](./courses/deleteCourse.md)                                                | Exclui um curso.                                                 |
| GET    | [/api/courses](./courses/showCourses.md)                                                 | Lista os cursos.                                                 |
| GET    | [/api/courses/:id/subscribes](./courses/showCourseSubscribes.md)                         | Lista os inscritos no curso.                                     |
| POST   | [/api/exams](./exams/createExam.md)                                                      | Cria uma prova.                                                  |
| PATCH  | [/api/exams](./exams/updateExam.md)                                                      | Atualiza informações de uma prova.                               |
| DELETE | [/api/exams](./exams/deleteExam.md)                                                      | Exclui uma prova.                                                |
| POST   | [/api/super-admin](./superAdmin/create.md)                                               | Cria um usuário da share.                                        |
