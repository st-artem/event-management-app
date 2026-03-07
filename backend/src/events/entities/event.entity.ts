import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'timestamp' })
  dateTime: Date;

  @Column()
  location: string;

  @Column({ type: 'int', nullable: true })
  capacity: number;

  @Column({ default: true })
  isPublic: boolean;

  @ManyToOne(() => User, (user) => user.organizedEvents)
  organizer: User;

  @ManyToMany(() => User, (user) => user.participatedEvents)
  @JoinTable({ name: 'event_participants' })
  participants: User[];
}