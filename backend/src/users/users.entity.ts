import { Tokens } from 'src/auth/auth.entity';
import { Section } from 'src/sections/section.entity';
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    Unique, 
    OneToMany,
    OneToOne
} from 'typeorm';

@Entity({ name: 'users' })
@Unique(['email'])
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    email: string;

    @Column({ nullable: false })
    password: string;

    @Column({ nullable: false, unique: true })
    username: string;

    @OneToMany(() => Section, (section) => section.user)
    sections: Section[];

    @OneToOne(() => Tokens, (tokens) => tokens.user)
    tokens: Tokens;
}
