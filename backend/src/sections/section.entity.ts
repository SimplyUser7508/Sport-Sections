import { User } from 'src/users/users.entity';
import { 
    Entity, 
    Column, 
    ManyToOne, 
    PrimaryGeneratedColumn
} from 'typeorm';

@Entity({ name: 'sections' })
export class Section {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    section: string;

    @Column({ nullable: false })
    datetime: string;

    @Column({ nullable: false })
    status: string;

    @ManyToOne(() => User, (user) => user.sections)
    user: User; 
}
