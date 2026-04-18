import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../data/store';
import { User } from '../models/user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { generateId } from '../utils/helpers';
import { Role } from '../models/enums';

@Injectable()
export class UsersService {
  findAll(): User[] {
    return db.users;
  }

  findById(id: string): User {
    const user = db.users.find(u => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  create(createUserDto: CreateUserDto): User {
    const prefix = createUserDto.role === Role.CITIZEN ? 'CIT' : 'EMP';
    const newUser: User = {
      id: generateId(prefix),
      ...createUserDto,
      status: 'Active',
      joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
    db.users.push(newUser);
    return newUser;
  }

  update(id: string, updateUserDto: UpdateUserDto): User {
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) throw new NotFoundException('User not found');
    
    db.users[userIndex] = { ...db.users[userIndex], ...updateUserDto };
    return db.users[userIndex];
  }

  suspend(id: string): User {
    const user = this.findById(id);
    user.status = 'Suspended';
    return user;
  }

  restore(id: string): User {
    const user = this.findById(id);
    user.status = 'Active';
    return user;
  }

  register(createUserDto: CreateUserDto): User {
    createUserDto.role = Role.CITIZEN; // Force role citizen for public register
    return this.create(createUserDto);
  }

  remove(id: string): void {
    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) throw new NotFoundException('User not found');
    db.users.splice(userIndex, 1);
  }
}
