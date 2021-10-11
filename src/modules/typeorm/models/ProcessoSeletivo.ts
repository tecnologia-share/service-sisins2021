import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Curso } from './Curso';

@Entity('processos_seletivos')
class ProcessoSeletivo {
  @PrimaryColumn()
  readonly id: string;

  @OneToMany(() => Curso, (curso) => curso.processoSeletivo, {
    cascade: true,
  })
  cursos: Curso[];

  @Column()
  data_inicio: Date;

  @Column()
  data_final: Date;

  @Column()
  nome: string;

  @Column()
  link_edital: string;

  @Column()
  link_manual: string;

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}

export { ProcessoSeletivo };
