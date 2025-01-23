import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import { ArticleEntity } from './Article';
import * as bcrypt from 'bcryptjs';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ default: 'user' })
  role: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ArticleEntity, article => article.author)
  articles: ArticleEntity[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.passwordHash) {
      this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, this.passwordHash);
  }
}
