import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Prova } from './Prova';

@Entity('questoes')
class Questao {
  @PrimaryColumn()
  readonly id: string;

  @Column()
  prova_id: string;

  @ManyToOne(() => Prova)
  @JoinColumn({ name: 'prova_id' })
  prova: Prova;

  @Column()
  nome: string;

  @Column()
  pergunta: string;

  @Column()
  imagem: string;

  @Column()
  horario: string;

  @Column()
  is_objetiva: boolean;

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
  gabarito: string;

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}

export { Questao };
