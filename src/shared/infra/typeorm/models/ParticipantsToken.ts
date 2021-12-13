import { Participante } from '@/shared/infra/typeorm/models/Participante';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';

@Entity('participants_token')
class ParticipantsToken {
  @PrimaryColumn()
  readonly id: string;

  @ManyToOne(() => Participante)
  @JoinColumn({ name: 'participants_id' })
  participant: Participante;

  @Column()
  refresh_token: string;

  @Column()
  participants_id: string;

  @Column()
  expires_date: Date;

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}

export { ParticipantsToken };
