import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Prova } from './Prova';
import { QuestaoInscricao } from './QuestaoInscricao';

@Entity('questoes')
class Questao {
  @PrimaryColumn()
  readonly id: string;

  @Column()
  prova_id: string;

  @OneToMany(
    () => QuestaoInscricao,
    (questaoInscricao) => questaoInscricao.questao,
    {
      cascade: true,
    }
  )
  questoesInscricoes: QuestaoInscricao[];

  @ManyToOne(() => Prova, (prova) => prova.questoes, {
    orphanedRowAction: 'delete',
  })
  @JoinColumn({ name: 'prova_id' })
  prova: Prova;

  @Column()
  pergunta: string;

  @Column()
  imagem: string;

  @Column()
  alternativa1: string;

  @Column()
  alternativa2: string;

  @Column()
  alternativa3: string;

  @Column()
  alternativa4: string;

  @Column()
  alternativa5: string;

  @Column()
  pontos: number;

  @Column()
  gabarito: number;

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}

export { Questao };
