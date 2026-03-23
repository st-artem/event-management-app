import { Entity, PrimaryGeneratedColumn, Column, Index, BeforeInsert, BeforeUpdate, ManyToMany } from 'typeorm';
import { Event } from '../../events/entities/event.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  name: string;

  @ManyToMany(() => Event, (event) => event.tags)
  events: Event[];

  @BeforeInsert()
  @BeforeUpdate()
  toLowerCase() {
    if (this.name) {
      this.name = this.name.toLowerCase().trim();
    }
  }
}