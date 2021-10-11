import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';

import { ProvaInscricao } from './ProvaInscricao';
import { Questao } from './Questao';

@Entity('questoes_inscricoes')
class QuestaoInscricao {
  @PrimaryColumn()
  readonly id: string;

  @Column()
  prova_inscricao_id: string;

  @ManyToOne(
    () => ProvaInscricao,
    (provaInscricao) => provaInscricao.questoesInscricoes,
    { orphanedRowAction: 'delete' }
  )
  @JoinColumn({ name: 'prova_inscricao_id' })
  provaInscricao: ProvaInscricao;

  @Column()
  questao_id: string;

  @ManyToOne(() => Questao, (questao) => questao.questoesInscricoes, {
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'questao_id' })
  questao: Questao;

  @Column()
  resposta: number;

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}

export { QuestaoInscricao };
