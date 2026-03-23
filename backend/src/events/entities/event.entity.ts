import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tag } from '../../tags/entities/tag.entity';


@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  dateTime: Date;

  @Column()
  location: string;

  @Column({ nullable: true })
  capacity: number;

  @Column({ default: true })
  isPublic: boolean;

  @ManyToOne(() => User, (user) => user.organizedEvents)
  organizer: User;

  @ManyToMany(() => User, (user) => user.attendedEvents)
  participants: User[];

  @ManyToMany(() => Tag, (tag) => tag.events, { cascade: true })
  @JoinTable({ name: 'event_tags' })
  tags: Tag[];

}