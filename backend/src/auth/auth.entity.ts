import { User } from 'src/users/users.entity';
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    Unique, 
    OneToOne,
    JoinColumn
} from 'typeorm';

@Entity({ name: 'tokens' })
@Unique(['refresh_token'])
export class Tokens {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    refresh_token: string;

    @OneToOne(() => User, (user) => user.tokens, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;
}
