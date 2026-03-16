import { Entity, PrimaryGeneratedColumn, Column, Index, BeforeInsert, BeforeUpdate, ManyToMany } from 'typeorm';
import { Event } from '../../events/entities/event.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Унікальний індекс на рівні бази даних
  @Index({ unique: true })
  @Column()
  name: string;

  // Зворотний бік зв'язку з подіями
  @ManyToMany(() => Event, (event) => event.tags)
  events: Event[];

  // Хуки для нормалізації (щоб у базі завжди був нижній регістр)
  @BeforeInsert()
  @BeforeUpdate()
  toLowerCase() {
    if (this.name) {
      this.name = this.name.toLowerCase().trim();
    }
  }
}