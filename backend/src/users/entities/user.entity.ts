import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Event } from '../../events/entities/event.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column({ default: 'user' })
  role: 'user' | 'admin';

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  github: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  telegram: string;

  @OneToMany(() => Event, (event) => event.organizer)
  organizedEvents: Event[];

  @ManyToMany(() => Event, (event) => event.participants)
  @JoinTable({ name: 'participants' })
  attendedEvents: Event[];
}