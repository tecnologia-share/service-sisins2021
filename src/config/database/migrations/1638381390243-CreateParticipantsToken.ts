import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateParticipantsToken1638381390243
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'participants_token',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'refresh_token',
            type: 'varchar',
          },
          {
            name: 'participants_id',
            type: 'varchar',
          },
          {
            name: 'expires_date',
            type: 'timestamp',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            name: 'FKParticipantsToken',
            referencedTableName: 'participantes',
            referencedColumnNames: ['id'],
            columnNames: ['participants_id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('participants_token');
  }
}
